import type { ApplyDeltaBundleRequest } from '../../llm/types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDummyCharacter } from '../../../models/Character'
import { characterStateService } from '../../../services/CharacterStateService'
import { useCharacterStore } from '../../../stores/characterStore'
import { useChronicleStore } from '../../../stores/chronicleStore'
import { useInventoryStore } from '../../../stores/inventoryStore'
import {
  applyChronicleDeltaBundle,
  getAppliedBundle,
  resetChronicleExecutorForTesting,
  undoChronicleBundle,
} from '../deltaExecutor'

describe('delta executor undo', () => {
  beforeEach(() => {
    resetChronicleExecutorForTesting()
    const currentSettings = useChronicleStore.getState().settings
    useChronicleStore.setState({
      deltaHistory: [],
      resourceHistory: { xp: {}, bonds: {}, hold: {}, debilities: {} },
      settings: { ...currentSettings, autoEquipWeapons: false },
    })
    useInventoryStore.setState({
      inventory: null,
      selectedItems: [],
      draggedItem: null,
    })
    useCharacterStore.setState({
      characters: [],
      activeCharacterId: null,
      error: null,
    })
    for (const characterId of characterStateService.getAllStates().keys())
      characterStateService.clearCharacterState(characterId)
  })

  afterEach(() => {
    resetChronicleExecutorForTesting()
    useChronicleStore.setState({ deltaHistory: [] })
    useInventoryStore.setState({
      inventory: null,
      selectedItems: [],
      draggedItem: null,
    })
    const { characters } = useCharacterStore.getState()
    characters.forEach((char) =>
      characterStateService.clearCharacterState(char.id),
    )
    useCharacterStore.setState({
      characters: [],
      activeCharacterId: null,
      error: null,
    })
  })

  it('restores character coin after undo', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'char-test',
      name: 'Coin Tester',
      coin: 0,
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-coin',
        narrative: 'Recovered treasure from the dungeon floor.',
        ops: [
          {
            type: 'add_coin',
            characterId: character.id,
            amount: 7,
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-coin-test',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T12:00:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.coin).toBe(7)
    expect(result.appliedOps).toHaveLength(1)
    expect(result.undoHandle.bundleId).toBe('bundle-coin-test')

    const undoSuccess = await undoChronicleBundle(result.bundleId)
    expect(undoSuccess).toBe(true)
    const reverted = useCharacterStore.getState().getCharacter(character.id)
    expect(reverted?.coin).toBe(0)
    expect(getAppliedBundle(result.bundleId)).toBeUndefined()

    const secondUndo = await undoChronicleBundle(result.bundleId)
    expect(secondUndo).toBe(false)
  })

  it('auto equips new weapons when slot is available', async () => {
    const settings = useChronicleStore.getState().settings
    useChronicleStore.setState({
      settings: { ...settings, autoEquipWeapons: true },
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-auto',
        narrative: 'Hero retrieves a blade.',
        ops: [
          {
            type: 'add_item',
            characterId: 'char-test',
            item: {
              id: 'sword-1',
              name: 'Heroic Sword',
              tags: ['close', 'weight 1'],
              quantity: 1,
            },
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-auto-equip',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T12:30:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    expect(result.appliedOps).toHaveLength(2)
    const equipOp = result.appliedOps[1]
    expect(equipOp).toMatchObject({
      type: 'equip_item',
      itemId: 'sword-1',
      slot: 'main_hand',
      reason: 'auto_equip_weapon',
    })

    const inventory = useInventoryStore.getState().inventory
    expect(inventory?.items['sword-1'].equipped).toBe(true)
    const equippedContainer = inventory?.containers.find(
      (container) => container.id === 'equipped',
    )
    expect(equippedContainer?.items).toContain('sword-1')
  })

  it('respects explicit equip operations and skips auto-equip duplication', async () => {
    const settings = useChronicleStore.getState().settings
    useChronicleStore.setState({
      settings: { ...settings, autoEquipWeapons: true },
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-manual-equip',
        narrative: 'GM instructs the hero to don the axe.',
        ops: [
          {
            type: 'add_item',
            characterId: 'char-test',
            item: {
              id: 'axe-1',
              name: 'Battle Axe',
              tags: ['close', 'weight 1'],
              quantity: 1,
            },
          },
          {
            type: 'equip_item',
            characterId: 'char-test',
            itemId: 'axe-1',
            slot: 'main_hand',
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-explicit-equip',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T12:45:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)
    expect(result.appliedOps).toHaveLength(2)
    const equipOps = result.appliedOps.filter((op) => op.type === 'equip_item')
    expect(equipOps).toHaveLength(1)
    const [equipOp] = equipOps
    expect((equipOp as any).reason).toBeUndefined()

    const inventory = useInventoryStore.getState().inventory
    expect(inventory?.items['axe-1'].equipped).toBe(true)
  })
})
