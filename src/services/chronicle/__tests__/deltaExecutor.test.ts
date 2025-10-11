import type { ApplyDeltaBundleRequest } from '../../llm/types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDummyCharacter } from '../../../models/Character'
import { characterStateService } from '../../../services/CharacterStateService'
import { useCharacterStore } from '../../../stores/characterStore'
import { useChronicleStore } from '../../../stores/chronicleStore'
import { useHoldStore } from '../../../stores/holdStore'
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
      resourceHistory: {
        xp: {},
        bonds: {},
        hold: {},
        debilities: {},
        hp: {},
        coin: {},
      },
      settings: { ...currentSettings, autoEquipWeapons: false },
    })
    useInventoryStore.setState({
      inventory: null,
      selectedItems: [],
      draggedItem: null,
    })
    useHoldStore.setState({ characterHolds: {} })
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
    useHoldStore.setState({ characterHolds: {} })
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

  it('spends coin and records resource history', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'char-spend',
      name: 'Spender',
      coin: 5,
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-spend-coin',
        narrative: 'Paid the tavern for lodging.',
        ops: [
          {
            type: 'spend_coin',
            characterId: character.id,
            amount: 3,
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-spend-coin',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T18:00:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    expect(result.appliedOps).toHaveLength(1)
    expect(result.appliedOps[0]).toMatchObject({
      type: 'spend_coin',
      amount: 3,
    })

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.coin).toBe(2)

    const coinHistory =
      useChronicleStore.getState().resourceHistory.coin[character.id] ?? []
    expect(coinHistory).toHaveLength(1)
    expect(coinHistory[0]).toMatchObject({
      type: 'coin',
      amount: -3,
      previous: 5,
      next: 2,
    })

    const undoSuccess = await undoChronicleBundle(result.bundleId)
    expect(undoSuccess).toBe(true)
    const reverted = useCharacterStore.getState().getCharacter(character.id)
    expect(reverted?.coin).toBe(5)
  })

  it('logs XP gain and clears history on undo', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'xp-char',
      name: 'Experience Tester',
      xp: 2,
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-xp',
        narrative: 'GM awards bonus experience.',
        ops: [
          {
            type: 'mark_xp',
            characterId: character.id,
            amount: 3,
            reason: 'gm_award',
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-xp',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:00:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.xp).toBe(5)

    const xpHistory =
      useChronicleStore.getState().resourceHistory.xp[character.id] ?? []
    expect(xpHistory).toHaveLength(1)
    expect(xpHistory[0]).toMatchObject({
      type: 'xp',
      amount: 3,
      previous: 2,
      next: 5,
      reason: 'gm_award',
    })

    await undoChronicleBundle(result.bundleId)
    const reverted = useCharacterStore.getState().getCharacter(character.id)
    expect(reverted?.xp).toBe(2)

    const xpHistoryAfter =
      useChronicleStore.getState().resourceHistory.xp[character.id] ?? []
    expect(xpHistoryAfter).toHaveLength(0)
  })

  it('records bond addition and restores on undo', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'bond-char',
      name: 'Bond Maker',
      bonds: [],
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-bond-add',
        narrative: 'Swore an oath to protect a companion.',
        ops: [
          {
            type: 'add_bond',
            characterId: character.id,
            targetId: 'friend-arlen',
            text: 'I will protect Arlen from the darkness.',
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-bond-add',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:05:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.bonds).toHaveLength(1)
    expect(updated?.bonds?.[0]).toMatchObject({
      text: 'I will protect Arlen from the darkness.',
      resolved: false,
    })

    const bondHistory =
      useChronicleStore.getState().resourceHistory.bonds[character.id] ?? []
    expect(bondHistory).toHaveLength(1)
    expect(bondHistory[0]).toMatchObject({
      type: 'bond',
      action: 'add',
      text: 'I will protect Arlen from the darkness.',
    })

    await undoChronicleBundle(result.bundleId)
    const reverted = useCharacterStore.getState().getCharacter(character.id)
    expect(reverted?.bonds).toHaveLength(0)

    const bondHistoryAfter =
      useChronicleStore.getState().resourceHistory.bonds[character.id] ?? []
    expect(bondHistoryAfter).toHaveLength(0)
  })

  it('resolves a bond, awards XP, and undo restores state', async () => {
    const bond = {
      id: 'bond-existing',
      text: 'I trust Mira with my life.',
      characterName: 'Mira',
      resolved: false,
    }
    const character = {
      ...createDummyCharacter(),
      id: 'bond-resolve',
      name: 'Resolver',
      xp: 4,
      bonds: [bond],
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-bond-resolve',
        narrative: 'Mira proved trustworthy in the ruins.',
        ops: [
          {
            type: 'resolve_bond',
            characterId: character.id,
            targetId: bond.id,
            resolution: 'Shared danger forged deeper trust.',
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-bond-resolve',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:10:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.xp).toBe(5)
    expect(updated?.bonds?.[0].resolved).toBe(true)

    const bondHistory =
      useChronicleStore.getState().resourceHistory.bonds[character.id] ?? []
    expect(bondHistory[0]).toMatchObject({ action: 'resolve', resolved: true })
    const xpHistory =
      useChronicleStore.getState().resourceHistory.xp[character.id] ?? []
    expect(xpHistory[0]).toMatchObject({ amount: 1, reason: 'bond_resolution' })

    await undoChronicleBundle(result.bundleId)
    const reverted = useCharacterStore.getState().getCharacter(character.id)
    expect(reverted?.xp).toBe(4)
    expect(reverted?.bonds?.[0].resolved).toBe(false)

    const bondHistoryAfter =
      useChronicleStore.getState().resourceHistory.bonds[character.id] ?? []
    expect(bondHistoryAfter).toHaveLength(0)
    const xpHistoryAfter =
      useChronicleStore.getState().resourceHistory.xp[character.id] ?? []
    expect(xpHistoryAfter).toHaveLength(0)
  })

  it('grants hold and clears ledger on undo', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'hold-char',
      name: 'Defender',
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-hold-grant',
        narrative: 'Took the defend move stance.',
        ops: [
          {
            type: 'mark_hold',
            characterId: character.id,
            move: 'defend',
            amount: 2,
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-hold-grant',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:15:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const holds = useHoldStore.getState().characterHolds[character.id] ?? []
    expect(holds).toHaveLength(1)
    expect(holds[0].amount).toBe(2)

    const holdHistory =
      useChronicleStore.getState().resourceHistory.hold[character.id] ?? []
    expect(holdHistory).toHaveLength(1)
    expect(holdHistory[0]).toMatchObject({ change: 2, remaining: 2 })

    await undoChronicleBundle(result.bundleId)
    const holdsAfter =
      useHoldStore.getState().characterHolds[character.id] ?? []
    expect(holdsAfter).toHaveLength(0)
    const holdHistoryAfter =
      useChronicleStore.getState().resourceHistory.hold[character.id] ?? []
    expect(holdHistoryAfter).toHaveLength(0)
  })

  it('spends hold and undo restores the previous amount', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'hold-spend',
      name: 'Guardian',
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const holdId = 'hold-existing'
    useHoldStore.setState({
      characterHolds: {
        [character.id]: [
          {
            id: holdId,
            characterId: character.id,
            moveId: 'defend',
            moveName: 'Defend',
            amount: 3,
            maxAmount: 3,
            timestamp: Date.now(),
            description: 'Standing guard',
          },
        ],
      },
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-hold-spend',
        narrative: 'Used hold to redirect an attack.',
        ops: [
          {
            type: 'spend_hold',
            characterId: character.id,
            move: 'defend',
            amount: 2,
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-hold-spend',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:20:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)

    const holds = useHoldStore.getState().characterHolds[character.id] ?? []
    expect(holds[0].amount).toBe(1)

    const holdHistory =
      useChronicleStore.getState().resourceHistory.hold[character.id] ?? []
    expect(holdHistory[0]).toMatchObject({ change: -2, remaining: 1 })

    await undoChronicleBundle(result.bundleId)
    const holdsAfter =
      useHoldStore.getState().characterHolds[character.id] ?? []
    expect(holdsAfter[0].amount).toBe(3)
    const holdHistoryAfter =
      useChronicleStore.getState().resourceHistory.hold[character.id] ?? []
    expect(holdHistoryAfter).toHaveLength(0)
  })

  it('reuses bundle results when idempotency key matches', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'idempotent-char',
      name: 'Duplicate Tester',
      coin: 0,
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-idempotent',
        narrative: 'Found loose coins twice.',
        ops: [
          {
            type: 'add_coin',
            characterId: character.id,
            amount: 4,
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-idempotent',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:25:00.000Z',
      },
    }

    const first = await applyChronicleDeltaBundle(request)
    const second = await applyChronicleDeltaBundle(request)

    expect(second.appliedOps).toEqual(first.appliedOps)

    const coinHistory =
      useChronicleStore.getState().resourceHistory.coin[character.id] ?? []
    expect(coinHistory).toHaveLength(1)
    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated?.coin).toBe(4)
  })

  it('undoes equip operations to restore inventory state', async () => {
    const character = {
      ...createDummyCharacter(),
      id: 'equip-char',
      name: 'Equipper',
    }
    useCharacterStore.setState({
      characters: [character],
      activeCharacterId: character.id,
    })

    const request: ApplyDeltaBundleRequest = {
      bundle: {
        entryId: 'entry-equip',
        narrative: 'Equipped a shield.',
        ops: [
          {
            type: 'add_item',
            characterId: character.id,
            item: {
              id: 'shield-1',
              name: 'Guardian Shield',
              tags: ['armor', 'weight 2'],
              quantity: 1,
            },
          },
          {
            type: 'equip_item',
            characterId: character.id,
            itemId: 'shield-1',
            slot: 'off_hand',
          },
        ],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        idempotencyKey: 'bundle-equip-shield',
        model: 'gpt-5-mini',
        createdAt: '2025-10-02T19:30:00.000Z',
      },
    }

    const result = await applyChronicleDeltaBundle(request)
    const inventoryAfter = useInventoryStore.getState().inventory
    expect(inventoryAfter?.items['shield-1'].equipped).toBe(true)

    const undoSuccess = await undoChronicleBundle(result.bundleId)
    expect(undoSuccess).toBe(true)
    const inventoryReverted = useInventoryStore.getState().inventory
    expect(inventoryReverted?.items['shield-1']).toBeUndefined()
    expect(Object.keys(inventoryReverted?.items ?? {}).length).toBe(0)
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
