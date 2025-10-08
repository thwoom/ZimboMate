import { beforeEach, describe, expect, it } from 'vitest'
import { applyChronicleDeltaBundle, resetChronicleExecutorForTesting } from '../deltaExecutor'
import type { ApplyDeltaBundleRequest, DeltaOperation } from '@/services/llm'
import { useChronicleStore } from '@/stores/chronicleStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { createEmptyInventory } from '@/models/Inventory'
import { createDummyCharacter } from '@/models/Character'

let activeCharacterId: string

function createRequest(
  ops: DeltaOperation[],
  options: { idempotencyKey?: string; selection?: number[] } = {},
): ApplyDeltaBundleRequest {
  return {
    bundle: {
      entryId: 'entry-linked',
      narrative: 'Fixture entry',
      ops,
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      reasoning: 'fixture',
      idempotencyKey: options.idempotencyKey ?? '',
      model: 'gpt-test',
      createdAt: '2025-10-08T00:00:00.000Z',
    },
    autoApply: true,
    selectedOpIndices: options.selection,
  }
}

describe('applyChronicleDeltaBundle idempotency', () => {
  beforeEach(() => {
    resetChronicleExecutorForTesting()

    const character = createDummyCharacter()
    character.id = `char-${Date.now()}`
    character.name = 'Chronicle Tester'
    character.xp = 0
    character.coin = 0
    character.hp = { current: 10, max: 10 }
    character.load = { current: 0, max: character.load.max }
    activeCharacterId = character.id

    useChronicleStore.setState((state) => ({
      ...state,
      entries: [],
      entities: [],
      relationships: [],
      deltaHistory: [],
      auditLog: [],
      resourceHistory: {
        xp: {},
        bonds: {},
        hold: {},
        debilities: {},
        hp: {},
        coin: {},
      },
    }))

    useCharacterStore.setState((state) => ({
      ...state,
      characters: [character],
      activeCharacterId: character.id,
    }))

    useInventoryStore.setState((state) => ({
      ...state,
      inventory: createEmptyInventory(),
    }))
  })

  it('reuses previously applied bundle when fingerprint matches', async () => {
    const operations: DeltaOperation[] = [
      { type: 'mark_xp', characterId: activeCharacterId, amount: 1 },
    ]

    const firstResult = await applyChronicleDeltaBundle(createRequest(operations))
    expect(firstResult.appliedOps).toHaveLength(1)
    expect(
      useCharacterStore.getState().getCharacter(activeCharacterId)?.xp,
    ).toBe(1)

    const secondResult = await applyChronicleDeltaBundle(
      createRequest(operations),
    )

    expect(secondResult.appliedOps).toEqual(firstResult.appliedOps)
    expect(
      useCharacterStore.getState().getCharacter(activeCharacterId)?.xp,
    ).toBe(1)
  })

  it('treats different operation selections as distinct bundles', async () => {
    const operations: DeltaOperation[] = [
      { type: 'mark_xp', characterId: activeCharacterId, amount: 1 },
      { type: 'add_coin', characterId: activeCharacterId, amount: 5 },
    ]

    const xpOnly = await applyChronicleDeltaBundle(
      createRequest(operations, { selection: [0] }),
    )
    expect(xpOnly.appliedOps).toHaveLength(1)
    expect(xpOnly.appliedOps[0].type).toBe('mark_xp')
    expect(
      useCharacterStore.getState().getCharacter(activeCharacterId)?.xp,
    ).toBe(1)

    const coinOnly = await applyChronicleDeltaBundle(
      createRequest(operations, { selection: [1] }),
    )
    expect(coinOnly.appliedOps).toHaveLength(1)
    expect(coinOnly.appliedOps[0].type).toBe('add_coin')
    const character = useCharacterStore.getState().getCharacter(
      activeCharacterId,
    )
    expect(character?.xp).toBe(1)
    expect(character?.coin).toBe(5)
  })
})
