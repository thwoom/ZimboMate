import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCharacterStore } from '../characterStore'
import { xpIntegrationService } from '../../services/XPIntegrationService'
import type { Character } from '../../models/Character'

function createTestCharacter(overrides: Partial<Character> = {}) {
  const store = useCharacterStore.getState()
  return store.createCharacter({
    name: 'Test Hero',
    class: 'Fighter',
    race: 'Human',
    level: 1,
    alignment: 'Good',
    attributes: {
      STR: 15,
      DEX: 12,
      CON: 13,
      INT: 10,
      WIS: 9,
      CHA: 8,
      ...(overrides.attributes ?? {}),
    },
    debilities: {
      weak: false,
      shaky: false,
      sick: false,
      stunned: false,
      confused: false,
      scarred: false,
      ...(overrides.debilities ?? {}),
    },
    hp: overrides.hp ?? { current: 20, max: 20 },
    armor: overrides.armor ?? 0,
    damageDie: overrides.damageDie ?? 'd10',
    xp: overrides.xp ?? 8,
    load: overrides.load ?? { current: 0, max: 12 },
    baseLoad: overrides.baseLoad ?? 12,
    coin: overrides.coin ?? 0,
    bonds: overrides.bonds ?? [],
    advancements: overrides.advancements ?? [],
    knownMoves: overrides.knownMoves ?? [],
    conditions: overrides.conditions ?? [],
    ...(overrides as Omit<Character, 'id' | 'createdAt' | 'updatedAt'>),
  })
}

describe('characterStore level-up workflow', () => {
  beforeEach(() => {
    useCharacterStore.setState({
      characters: [],
      pendingAdvancements: {},
      activeCharacterId: null,
      error: null,
    })
  })

  it('creates pending advancement when starting a level up', () => {
    const character = createTestCharacter()
    const pending = useCharacterStore.getState().startLevelUp(character.id)

    expect(pending).not.toBeNull()
    expect(pending?.levelBefore).toBe(1)
    expect(pending?.levelAfter).toBe(2)
    expect(
      useCharacterStore.getState().pendingAdvancements[character.id],
    ).toBeDefined()

    const storedCharacter = useCharacterStore
      .getState()
      .getCharacter(character.id)
    expect(storedCharacter?.level).toBe(1)
    expect(storedCharacter?.xp).toBeGreaterThanOrEqual(8)
    expect(pending?.draft).toBeDefined()
    expect(pending?.draft.activeStep).toBe('overview')
    expect(pending?.draft.moveIds).toEqual([])
    expect(pending?.draft.chronicleEnabled).toBe(true)
  })

  it('applies level-up choices and clears pending state', () => {
    const character = createTestCharacter()
    const pending = useCharacterStore.getState().startLevelUp(character.id)
    expect(pending).not.toBeNull()

    const statOption = pending?.availableOptions.find(
      (option) => option.type === 'stat',
    )
    const moveOption = pending?.availableOptions.find(
      (option) => option.type === 'move',
    )
    expect(moveOption).toBeDefined()

    const awardSpy = vi
      .spyOn(xpIntegrationService, 'awardXP')
      .mockImplementation((characterId, sourceId, amount, reason) => ({
        id: 'mock-xp-entry',
        characterId,
        source: {
          id: sourceId,
          name: sourceId,
          description: reason,
          category: 'advancement',
          color: '',
          icon: '',
        },
        amount,
        reason,
        timestamp: new Date(),
      }))

    useCharacterStore.getState().applyLevelUpChoices(character.id, {
      statIncreaseId: statOption?.id,
      moveIds: moveOption ? [moveOption.id] : [],
    })

    const updated = useCharacterStore.getState().getCharacter(character.id)
    expect(updated).toBeDefined()
    expect(updated?.level).toBe(2)
    expect(updated?.xp).toBe(0)
    if (statOption) {
      const statMatch = statOption.id.match(/stat-(\w+)/)
      if (statMatch) {
        const stat = statMatch[1].toUpperCase() as keyof Character['attributes']
        expect(updated?.attributes[stat]).toBeGreaterThan(15)
      }
    }
    if (moveOption) {
      expect(updated?.knownMoves).toContain(moveOption.id)
    }
    expect(
      useCharacterStore.getState().pendingAdvancements[character.id],
    ).toBeUndefined()
    expect(awardSpy).toHaveBeenCalledWith(
      character.id,
      'level-up',
      -8,
      expect.stringContaining('Spent'),
    )

    awardSpy.mockRestore()
  })

  it('updates level-up draft selections and returns cloned pending state', () => {
    const character = createTestCharacter()
    const store = useCharacterStore.getState()
    const pending = store.startLevelUp(character.id)
    expect(pending).not.toBeNull()

    const moveOption = pending?.availableOptions.find(
      (option) => option.type === 'move',
    )
    expect(moveOption).toBeDefined()

    store.updateLevelUpDraft(character.id, {
      moveIds: moveOption ? [moveOption.id] : [],
      statIncreaseId: 'stat-str',
      chronicleEnabled: false,
      activeStep: 'move',
    })

    const cloned = store.getPendingAdvancement(character.id)
    expect(cloned).toBeDefined()
    expect(cloned?.draft.moveIds).toEqual(
      moveOption ? [moveOption.id] : [],
    )
    expect(cloned?.draft.statIncreaseId).toBe('stat-str')
    expect(cloned?.draft.chronicleEnabled).toBe(false)
    expect(cloned?.draft.activeStep).toBe('move')

    cloned?.draft.moveIds.push('mutation-test')
    const nextRead = store.getPendingAdvancement(character.id)
    expect(nextRead?.draft.moveIds).toEqual(
      moveOption ? [moveOption.id] : [],
    )
  })

  it('falls back to saved draft selections when applying without arguments', () => {
    const character = createTestCharacter()
    const store = useCharacterStore.getState()
    const pending = store.startLevelUp(character.id)
    expect(pending).not.toBeNull()

    const statOption = pending?.availableOptions.find(
      (option) => option.type === 'stat',
    )
    const moveOption = pending?.availableOptions.find(
      (option) => option.type === 'move',
    )
    expect(moveOption).toBeDefined()

    store.updateLevelUpDraft(character.id, {
      statIncreaseId: statOption?.id,
      moveIds: moveOption ? [moveOption.id] : [],
    })

    const awardSpy = vi
      .spyOn(xpIntegrationService, 'awardXP')
      .mockImplementation((characterId, sourceId, amount, reason) => ({
        id: 'mock-xp-entry',
        characterId,
        source: {
          id: sourceId,
          name: sourceId,
          description: reason,
          category: 'advancement',
          color: '',
          icon: '',
        },
        amount,
        reason,
        timestamp: new Date(),
      }))

    store.applyLevelUpChoices(character.id, {})

    const updated = store.getCharacter(character.id)
    expect(updated?.level).toBe(2)
    expect(updated?.xp).toBe(0)
    if (statOption) {
      const statMatch = statOption.id.match(/stat-(\w+)/)
      if (statMatch) {
        const stat = statMatch[1].toUpperCase() as keyof Character['attributes']
        expect(updated?.attributes[stat]).toBeGreaterThan(15)
      }
    }
    if (moveOption) {
      expect(updated?.knownMoves).toContain(moveOption.id)
    }

    awardSpy.mockRestore()
  })
})
