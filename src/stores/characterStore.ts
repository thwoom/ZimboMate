/**
 * Character Store for ZimboMate V2
 * Manages character state, CRUD operations, and persistence
 * Integrates with CharacterStateService and AdvancementService
 */

import type { SpellProgression } from '../data/advancement/spellProgression'
import type { Attributes, Character } from '../models/Character'
import type { AdvancementOption } from '../services/AdvancementService'
import type { ServiceSpell } from '../services/SpellCastingService'
import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'
import { getXPThreshold } from '../models/Character'
import { advancementService } from '../services/AdvancementService'
import { characterStateService } from '../services/CharacterStateService'
import { logLevelUpEvent } from '../services/LevelUpLogger'
import { spellCastingService } from '../services/SpellCastingService'
import { xpIntegrationService } from '../services/XPIntegrationService'
import { publishLevelUpTelemetry } from '../utils/levelUpTelemetry'

const ATTRIBUTE_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const

const DEFAULT_ATTRIBUTES: Attributes = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
}

function coerceAttributeScore(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    const candidateKeys = ['value', 'score', 'base']
    for (const key of candidateKeys) {
      const candidate = record[key]
      if (typeof candidate === 'number' && Number.isFinite(candidate)) {
        return candidate
      }

      if (typeof candidate === 'string') {
        const parsed = Number.parseInt(candidate, 10)
        if (!Number.isNaN(parsed)) {
          return parsed
        }
      }
    }
  }

  return fallback
}

function normalizeAttributesInput(
  incoming: unknown,
  fallback: Attributes = DEFAULT_ATTRIBUTES,
): Attributes {
  const source =
    incoming && typeof incoming === 'object'
      ? (incoming as Record<string, unknown>)
      : {}

  const normalized = { ...fallback }

  for (const key of ATTRIBUTE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      normalized[key] = coerceAttributeScore(source[key], fallback[key])
    }
  }

  return normalized
}

export const LEVEL_UP_WIZARD_STEPS = [
  'overview',
  'stat',
  'move',
  'spells',
  'review',
] as const

export type LevelUpWizardStep = (typeof LEVEL_UP_WIZARD_STEPS)[number]

export function isLevelUpWizardStep(step: unknown): step is LevelUpWizardStep {
  return (
    typeof step === 'string' &&
    (LEVEL_UP_WIZARD_STEPS as readonly string[]).includes(step)
  )
}

export interface LevelUpDraft {
  statIncreaseId?: string
  moveIds: string[]
  spellSelections: string[]
  secretaryEnabled: boolean
  activeStep: LevelUpWizardStep
  lastUpdated: string
}

function createLevelUpDraft(
  overrides: Partial<LevelUpDraft> = {},
): LevelUpDraft {
  const timestamp = new Date().toISOString()
  const hasStatOverride = Object.prototype.hasOwnProperty.call(
    overrides,
    'statIncreaseId',
  )

  const activeStep = isLevelUpWizardStep(overrides.activeStep)
    ? overrides.activeStep
    : 'overview'

  return {
    statIncreaseId: hasStatOverride ? overrides.statIncreaseId : undefined,
    moveIds: Array.isArray(overrides.moveIds)
      ? [...overrides.moveIds]
      : [],
    spellSelections: Array.isArray(overrides.spellSelections)
      ? [...overrides.spellSelections]
      : [],
    secretaryEnabled:
      typeof overrides.secretaryEnabled === 'boolean'
        ? overrides.secretaryEnabled
        : true,
    activeStep,
    lastUpdated: overrides.lastUpdated ?? timestamp,
  }
}

function ensureLevelUpDraft(draft?: LevelUpDraft): LevelUpDraft {
  if (!draft) {
    return createLevelUpDraft()
  }

  const hasValidMoveIds = Array.isArray(draft.moveIds)
  const hasValidSpellSelections = Array.isArray(draft.spellSelections)
  const hasValidSecretary = typeof draft.secretaryEnabled === 'boolean'
  const hasValidStep = isLevelUpWizardStep(draft.activeStep)
  const hasValidTimestamp = typeof draft.lastUpdated === 'string'

  if (
    hasValidMoveIds &&
    hasValidSpellSelections &&
    hasValidSecretary &&
    hasValidStep &&
    hasValidTimestamp
  ) {
    return draft
  }

  return {
    statIncreaseId: draft.statIncreaseId,
    moveIds: hasValidMoveIds ? draft.moveIds : [],
    spellSelections: hasValidSpellSelections ? draft.spellSelections : [],
    secretaryEnabled: hasValidSecretary ? draft.secretaryEnabled : true,
    activeStep: hasValidStep ? (draft.activeStep as LevelUpWizardStep) : 'overview',
    lastUpdated: hasValidTimestamp ? (draft.lastUpdated as string) : new Date().toISOString(),
  }
}

function clonePendingAdvancement(
  pending: PendingAdvancement,
): PendingAdvancement {
  return {
    ...pending,
    availableOptions: [...pending.availableOptions],
    spellProgression: pending.spellProgression
      ? { ...pending.spellProgression }
      : undefined,
    draft: {
      ...pending.draft,
      moveIds: [...pending.draft.moveIds],
      spellSelections: [...pending.draft.spellSelections],
    },
  }
}

export interface PendingAdvancement {
  characterId: string
  createdAt: string
  levelBefore: number
  levelAfter: number
  hpIncrease: number
  loadIncrease: number
  xpBefore: number
  xpCost: number
  availableOptions: AdvancementOption[]
  spellProgression?: SpellProgression
  draft: LevelUpDraft
}

type LegacyPendingAdvancement =
  | PendingAdvancement
  | (Omit<PendingAdvancement, 'draft'> & { draft?: LevelUpDraft })

function normalizePendingAdvancement(
  pending: LegacyPendingAdvancement,
): PendingAdvancement {
  const hasValidOptions = Array.isArray(pending.availableOptions)
  const normalizedDraft = ensureLevelUpDraft(pending.draft)
  const needsOptionsNormalization = !hasValidOptions
  const needsDraftNormalization = normalizedDraft !== pending.draft

  if (!needsOptionsNormalization && !needsDraftNormalization) {
    return pending as PendingAdvancement
  }

  return {
    ...(pending as PendingAdvancement),
    availableOptions: hasValidOptions ? pending.availableOptions : [],
    draft: normalizedDraft,
  }
}

export interface LevelUpChoices {
  statIncreaseId?: string
  moveIds?: string[]
  spellSelections?: string[]
}

interface BondReminder {
  id: string
  characterId: string
  characterName: string
  level: number
  triggeredAt: string
  applied: {
    stat: boolean
    move: boolean
    spells: boolean
  }
}

interface CharacterState {
  // Character data
  characters: Character[]
  activeCharacterId: string | null
  isLoading: boolean
  error: string | null

  // Character CRUD operations
  createCharacter: (
    character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Character
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharacter: (id: string) => Character | undefined
  setActiveCharacter: (id: string | null) => void
  getActiveCharacter: () => Character | undefined

  // Character management
  duplicateCharacter: (id: string) => Character | undefined
  exportCharacter: (id: string) => string | undefined
  importCharacter: (characterData: string) => Character

  // Level-up workflow
  pendingAdvancements: Record<string, PendingAdvancement>
  getPendingAdvancement: (
    characterId: string,
  ) => PendingAdvancement | undefined
  startLevelUp: (characterId: string) => PendingAdvancement | null
  applyLevelUpChoices: (
    characterId: string,
    choices: LevelUpChoices,
  ) => void
  cancelLevelUp: (characterId: string) => void
  updateLevelUpDraft: (
    characterId: string,
    updates: Partial<LevelUpDraft>,
  ) => void
  bondReminders: BondReminder[]
  dismissBondReminder: (reminderId: string) => void

  // XP and advancement
  addXP: (
    characterId: string,
    amount: number,
    source: string,
    description: string,
  ) => void
  levelUpCharacter: (characterId: string) => void

  // Health management
  updateHP: (characterId: string, newHP: number) => void
  healCharacter: (characterId: string, amount: number) => void
  damageCharacter: (characterId: string, amount: number) => void

  // Load management
  updateLoad: (characterId: string, newLoad: number) => void

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useCharacterStore = createWithEqualityFn<CharacterState>()(
  persist(
    (set, get) => ({
      // Initial state
      characters: [],
      activeCharacterId: null,
      isLoading: false,
      error: null,
      pendingAdvancements: {},
      bondReminders: [],

      // Character CRUD operations
      createCharacter: (characterData) => {
        try {
          const normalizedAttributes = normalizeAttributesInput(
            (characterData as { attributes?: unknown }).attributes,
          )

          const character: Character = {
            ...characterData,
            attributes: normalizedAttributes,
            id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set((state) => ({
            characters: [...state.characters, character],
            activeCharacterId: character.id,
            error: null,
          }))

          return character
        } catch (error) {
          set({
            error: `Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          throw error
        }
      },

      updateCharacter: (id, updates) => {
        try {
          const hasAttributeUpdate = Object.prototype.hasOwnProperty.call(
            updates,
            'attributes',
          )

          set((state) => ({
            characters: state.characters.map((char) =>
              char.id === id
                ? {
                    ...char,
                    ...updates,
                    attributes: hasAttributeUpdate
                      ? normalizeAttributesInput(
                          (updates as { attributes?: unknown }).attributes,
                          char.attributes,
                        )
                      : char.attributes,
                    updatedAt: new Date(),
                  }
                : char,
            ),
            error: null,
          }))
        } catch (error) {
          set({
            error: `Failed to update character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteCharacter: (id) => {
        try {
          // Clear character state service data
          characterStateService.clearCharacterState(id)

          // Clear advancement service data
          advancementService.clearXPHistory(id)

          set((state) => ({
            characters: state.characters.filter((char) => char.id !== id),
            activeCharacterId:
              state.activeCharacterId === id ? null : state.activeCharacterId,
            error: null,
          }))
        } catch (error) {
          set({
            error: `Failed to delete character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      getCharacter: (id) => {
        const { characters } = get()
        return characters.find((char) => char.id === id)
      },

      setActiveCharacter: (id) => {
        const { characters } = get()
        if (id === null || characters.some((char) => char.id === id)) {
          set({ activeCharacterId: id, error: null })
        } else {
          set({ error: 'Character not found' })
        }
      },

      getActiveCharacter: () => {
        const { characters, activeCharacterId } = get()
        if (!activeCharacterId) return undefined
        return characters.find((char) => char.id === activeCharacterId)
      },

      // Character management
      duplicateCharacter: (id) => {
        try {
          const { characters, createCharacter } = get()
          const originalCharacter = characters.find((char) => char.id === id)

          if (!originalCharacter) {
            set({ error: 'Character not found' })
            return undefined
          }

          const duplicatedCharacter = createCharacter({
            ...originalCharacter,
            name: `${originalCharacter.name} (Copy)`,
          })

          return duplicatedCharacter
        } catch (error) {
          set({
            error: `Failed to duplicate character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      exportCharacter: (id) => {
        try {
          const { characters } = get()
          const character = characters.find((char) => char.id === id)

          if (!character) {
            set({ error: 'Character not found' })
            return undefined
          }

          return JSON.stringify(character, null, 2)
        } catch (error) {
          set({
            error: `Failed to export character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      importCharacter: (characterData) => {
        try {
          const parsedCharacter = JSON.parse(characterData) as Character

          // Validate required fields
          if (!parsedCharacter.name || !parsedCharacter.class) {
            throw new Error('Invalid character data: missing required fields')
          }

          // Create new character with imported data
          const importedCharacter = get().createCharacter({
            ...parsedCharacter,
            name: `${parsedCharacter.name} (Imported)`,
          })

          return importedCharacter
        } catch (error) {
          const errorMessage = `Failed to import character: ${error instanceof Error ? error.message : 'Unknown error'}`
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      getPendingAdvancement: (characterId) => {
        const { pendingAdvancements } = get()
        const pending = pendingAdvancements[characterId]
        if (!pending) {
          return undefined
        }

        const normalized = normalizePendingAdvancement(
          pending as LegacyPendingAdvancement,
        )

        if (
          pending.draft !== normalized.draft ||
          pending.availableOptions !== normalized.availableOptions ||
          pending.spellProgression !== normalized.spellProgression
        ) {
          set((state) => ({
            pendingAdvancements: {
              ...state.pendingAdvancements,
              [characterId]: normalized,
            },
          }))
        }

        return clonePendingAdvancement(normalized)
      },

      startLevelUp: (characterId) => {
        try {
          const { characters, pendingAdvancements } = get()
          const existing = pendingAdvancements[characterId]
          if (existing) {
            const normalizedExisting = normalizePendingAdvancement(
              existing as LegacyPendingAdvancement,
            )

            if (
              existing.draft !== normalizedExisting.draft ||
              existing.availableOptions !== normalizedExisting.availableOptions ||
              existing.spellProgression !== normalizedExisting.spellProgression
            ) {
              set((state) => ({
                pendingAdvancements: {
                  ...state.pendingAdvancements,
                  [characterId]: normalizedExisting,
                },
                error: null,
              }))
            }

            return clonePendingAdvancement(normalizedExisting)
          }

          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return null
          }

          const xpCost = getXPThreshold(character.level)
          if (character.xp < xpCost) {
            set({
              error: `Level up requires ${xpCost} XP (current: ${character.xp}).`,
            })
            return null
          }

          const levelUpResult = advancementService.levelUp(character)

          const pending: PendingAdvancement = {
            characterId,
            createdAt: new Date().toISOString(),
            levelBefore: character.level,
            levelAfter: levelUpResult.newLevel,
            hpIncrease: levelUpResult.hpIncrease,
            loadIncrease: levelUpResult.loadIncrease,
            xpBefore: character.xp,
            xpCost,
            availableOptions: levelUpResult.availableOptions,
            spellProgression: levelUpResult.spellProgression,
            draft: createLevelUpDraft(),
          }

          set((state) => ({
            pendingAdvancements: {
              ...state.pendingAdvancements,
              [characterId]: pending,
            },
            error: null,
          }))

          return clonePendingAdvancement(pending)
        } catch (error) {
          set({
            error: `Failed to start level up: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          })
          return null
        }
      },

      applyLevelUpChoices: (characterId, choices) => {
        try {
          const { characters, updateCharacter, pendingAdvancements } = get()
          const pendingEntry = pendingAdvancements[characterId]
          if (!pendingEntry) {
            set({ error: 'No pending level-up found for this character' })
            return
          }

          const pending = normalizePendingAdvancement(
            pendingEntry as LegacyPendingAdvancement,
          )

          if (
            pendingEntry.draft !== pending.draft ||
            pendingEntry.availableOptions !== pending.availableOptions ||
            pendingEntry.spellProgression !== pending.spellProgression
          ) {
            set((state) => ({
              pendingAdvancements: {
                ...state.pendingAdvancements,
                [characterId]: pending,
              },
            }))
          }

          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          if (character.xp < pending.xpCost) {
            set({
              error: 'Character no longer has enough XP to level up.',
            })
            return
          }

          const draft = ensureLevelUpDraft(pending.draft)
          const hpBefore = character.hp.max
          const loadBefore = character.load.max
          const effectiveChoices: LevelUpChoices = {
            statIncreaseId:
              choices?.statIncreaseId ?? draft.statIncreaseId,
            moveIds:
              choices?.moveIds !== undefined
                ? [...choices.moveIds]
                : [...draft.moveIds],
            spellSelections:
              choices?.spellSelections !== undefined
                ? [...choices.spellSelections]
                : [...draft.spellSelections],
          }

          const levelUpResult = advancementService.levelUp(character)
          let leveledCharacter: Character = {
            ...levelUpResult.character,
            attributes: { ...levelUpResult.character.attributes },
            hp: { ...levelUpResult.character.hp },
            load: { ...levelUpResult.character.load },
            knownMoves: [...levelUpResult.character.knownMoves],
            advancements: [...levelUpResult.character.advancements],
            knownSpells: [...(levelUpResult.character.knownSpells ?? [])],
            preparedSpells: levelUpResult.character.preparedSpells
              ? [...levelUpResult.character.preparedSpells]
              : levelUpResult.character.preparedSpells,
          }

          let statIncreaseName: string | undefined
          const selectedMoveNames: string[] = []
          const addedSpellNames: string[] = []

          // Apply stat increase if selected
          if (effectiveChoices.statIncreaseId) {
            const statOption = levelUpResult.availableOptions.find(
              (option) =>
                option.id === effectiveChoices.statIncreaseId &&
                option.type === 'stat',
            )
            if (!statOption) {
              set({ error: 'Invalid stat increase selection' })
              return
            }

            const { canTake, reasons } = advancementService.canTakeAdvancement(
              leveledCharacter,
              statOption,
            )
            if (!canTake) {
              set({
                error: `Cannot take stat increase: ${reasons.join(', ')}`,
              })
              return
            }

            leveledCharacter = advancementService.applyAdvancement(
              leveledCharacter,
              statOption,
            )
            statIncreaseName = statOption.name
          }

          // Apply move choices
          if (effectiveChoices.moveIds?.length) {
            for (const moveId of effectiveChoices.moveIds) {
              const moveOption = levelUpResult.availableOptions.find(
                (option) => option.id === moveId && option.type === 'move',
              )
              if (!moveOption) {
                set({ error: `Invalid move selection: ${moveId}` })
                return
              }

              const { canTake, reasons } =
                advancementService.canTakeAdvancement(
                  leveledCharacter,
                  moveOption,
                )
              if (!canTake) {
                set({
                  error: `Cannot take move ${moveOption.name}: ${reasons.join(', ')}`,
                })
                return
              }

              leveledCharacter = advancementService.applyAdvancement(
                leveledCharacter,
                moveOption,
              )

              selectedMoveNames.push(moveOption.name)
            }
          }

          if (effectiveChoices.spellSelections?.length) {
            const uniqueSelections = Array.from(
              new Set(effectiveChoices.spellSelections),
            )

            if (uniqueSelections.length !== effectiveChoices.spellSelections.length) {
              set({ error: 'Duplicate spell selections are not allowed.' })
              return
            }

            if (leveledCharacter.class !== 'Wizard') {
              set({
                error:
                  'Only wizards can add spells during level-up in this version.',
              })
              return
            }

            const requiredSpells =
              pending.spellProgression?.wizard?.newSpellsKnown ?? 0
            if (requiredSpells > 0 && uniqueSelections.length !== requiredSpells) {
              set({
                error: `Select exactly ${requiredSpells} new spell${requiredSpells === 1 ? '' : 's'}.`,
              })
              return
            }

            const knownSpellSet = new Set(leveledCharacter.knownSpells ?? [])
            const newSpells: ServiceSpell[] = []

            for (const spellId of uniqueSelections) {
              const spell = spellCastingService.getSpellById(spellId)
              if (!spell) {
                set({ error: `Unknown spell selection: ${spellId}` })
                return
              }

              if (
                spell.requiresClass &&
                spell.requiresClass !== leveledCharacter.class
              ) {
                set({
                  error: `Spell ${spell.name} is not available to ${leveledCharacter.class}.`,
                })
                return
              }

              if (spell.level > pending.levelAfter) {
                set({
                  error: `Spell ${spell.name} is too strong for level ${pending.levelAfter}.`,
                })
                return
              }

              if (knownSpellSet.has(spell.id)) {
                set({
                  error: `Spell ${spell.name} is already in ${character.name}'s spellbook.`,
                })
                return
              }

              newSpells.push(spell)
            }

            if (newSpells.length > 0) {
              const updatedKnownSpells = [
                ...knownSpellSet,
                ...newSpells.map((spell) => spell.id),
              ]
              leveledCharacter.knownSpells = updatedKnownSpells
              addedSpellNames.push(...newSpells.map((spell) => spell.name))
            }
          }

          leveledCharacter.xp = Math.max(
            0,
            character.xp - pending.xpCost,
          )
          leveledCharacter.updatedAt = new Date()
          const hpAfter = leveledCharacter.hp.max
          const loadAfter = leveledCharacter.load.max

          updateCharacter(characterId, leveledCharacter)

          xpIntegrationService.awardXP(
            characterId,
            'level-up',
            -pending.xpCost,
            `Spent ${pending.xpCost} XP to reach level ${pending.levelAfter}`,
          )

          void logLevelUpEvent(
            {
              characterId,
              characterName: leveledCharacter.name,
              characterClass: leveledCharacter.class,
              levelBefore: pending.levelBefore,
              levelAfter: pending.levelAfter,
              xpSpent: pending.xpCost,
              xpBefore: pending.xpBefore,
              xpAfter: leveledCharacter.xp,
              hpIncrease: pending.hpIncrease,
              hpBefore,
              hpAfter,
              loadIncrease: pending.loadIncrease,
              loadBefore,
              loadAfter,
              statIncreaseName,
              moveNames: selectedMoveNames,
              spellNames: addedSpellNames,
            },
            { includeNarrative: Boolean(draft.secretaryEnabled) },
          )

          const statApplied = Boolean(statIncreaseName)
          const moveApplied = selectedMoveNames.length > 0
          const spellsApplied = addedSpellNames.length > 0

          publishLevelUpTelemetry({
            characterId,
            characterClass: leveledCharacter.class,
            newLevel: pending.levelAfter,
            applied: {
              stat: statApplied,
              move: moveApplied,
              spells: spellsApplied,
            },
          })

          const reminder: BondReminder = {
            id: `bond-reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            characterId,
            characterName: leveledCharacter.name,
            level: pending.levelAfter,
            triggeredAt: new Date().toISOString(),
            applied: {
              stat: statApplied,
              move: moveApplied,
              spells: spellsApplied,
            },
          }

          set((state) => {
            const { [characterId]: _removed, ...rest } =
              state.pendingAdvancements
            return {
              pendingAdvancements: rest,
              error: null,
              bondReminders: [reminder, ...state.bondReminders].slice(0, 5),
            }
          })
        } catch (error) {
          set({
            error: `Failed to apply level up: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          })
        }
      },

      cancelLevelUp: (characterId) => {
        set((state) => {
          const { [characterId]: _removed, ...rest } =
            state.pendingAdvancements
          return {
            pendingAdvancements: rest,
            error: null,
          }
        })
      },

      dismissBondReminder: (reminderId) => {
        set((state) => ({
          bondReminders: state.bondReminders.filter(
            (reminder) => reminder.id !== reminderId,
          ),
        }))
      },

      updateLevelUpDraft: (characterId, updates) => {
        try {
          set((state) => {
            const pending = state.pendingAdvancements[characterId]

            if (!pending) {
              return {
                ...state,
                error: `No pending level-up found for character ${characterId}`,
              }
            }

            const normalized = normalizePendingAdvancement(
              pending as LegacyPendingAdvancement,
            )
            let draft = ensureLevelUpDraft(normalized.draft)

            if (Object.prototype.hasOwnProperty.call(updates, 'statIncreaseId')) {
              draft = {
                ...draft,
                statIncreaseId: updates.statIncreaseId ?? undefined,
              }
            }

            if (Object.prototype.hasOwnProperty.call(updates, 'moveIds')) {
              draft = {
                ...draft,
                moveIds: Array.isArray(updates.moveIds)
                  ? [...updates.moveIds]
                  : [],
              }
            }

            if (
              Object.prototype.hasOwnProperty.call(updates, 'spellSelections')
            ) {
              draft = {
                ...draft,
                spellSelections: Array.isArray(updates.spellSelections)
                  ? [...updates.spellSelections]
                  : [],
              }
            }

            if (
              Object.prototype.hasOwnProperty.call(updates, 'secretaryEnabled') &&
              typeof updates.secretaryEnabled === 'boolean'
            ) {
              draft = {
                ...draft,
                secretaryEnabled: updates.secretaryEnabled,
              }
            }

            if (
              Object.prototype.hasOwnProperty.call(updates, 'activeStep') &&
              isLevelUpWizardStep(updates.activeStep)
            ) {
              draft = {
                ...draft,
                activeStep: updates.activeStep,
              }
            }

            draft = {
              ...draft,
              lastUpdated: new Date().toISOString(),
            }

            return {
              ...state,
              pendingAdvancements: {
                ...state.pendingAdvancements,
                [characterId]: {
                  ...normalized,
                  draft,
                },
              },
              error: null,
            }
          })
        } catch (error) {
          set({
            error: `Failed to update level up selections: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          })
        }
      },

      // XP and advancement
      addXP: (characterId, amount, source, description) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          // Use advancement service to add XP
          const updatedCharacter = advancementService.addXP(
            character,
            amount,
            source as any,
            description,
          )

          updateCharacter(characterId, updatedCharacter)
        } catch (error) {
          set({
            error: `Failed to add XP: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      levelUpCharacter: (characterId) => {
        const { startLevelUp } = get()
        startLevelUp(characterId)
      },

      // Health management
      updateHP: (characterId, newHP) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          const clampedHP = Math.max(0, Math.min(character.hp.max, newHP))
          updateCharacter(characterId, {
            hp: { ...character.hp, current: clampedHP },
          })
        } catch (error) {
          set({
            error: `Failed to update HP: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      healCharacter: (characterId, amount) => {
        try {
          const { characters, updateHP } = get()
          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          updateHP(characterId, character.hp.current + amount)
        } catch (error) {
          set({
            error: `Failed to heal character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      damageCharacter: (characterId, amount) => {
        try {
          const { characters, updateHP } = get()
          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          updateHP(characterId, character.hp.current - amount)
        } catch (error) {
          set({
            error: `Failed to damage character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // Load management
      updateLoad: (characterId, newLoad) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find((char) => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          const clampedLoad = Math.max(0, newLoad)
          updateCharacter(characterId, {
            load: { ...character.load, current: clampedLoad },
          })
        } catch (error) {
          set({
            error: `Failed to update load: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // Utility
      clearError: () => set({ error: null }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'zimbomate-character-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as CharacterState
        }

        if (version < 2) {
          const state = persistedState as {
            characters?: Character[]
          } & Record<string, unknown>

          const migratedCharacters = Array.isArray(state.characters)
            ? state.characters.map((char) => {
                if (!char || typeof char !== 'object') {
                  return char
                }

                return {
                  ...char,
                  attributes: normalizeAttributesInput(
                    (char as { attributes?: unknown }).attributes,
                  ),
                }
              })
            : []

          return {
            ...state,
            characters: migratedCharacters,
          } as CharacterState
        }

        const stateWithDefaults = persistedState as CharacterState & {
          pendingAdvancements?: Record<string, PendingAdvancement>
        }

        const rawPending =
          stateWithDefaults.pendingAdvancements &&
          typeof stateWithDefaults.pendingAdvancements === 'object'
            ? stateWithDefaults.pendingAdvancements
            : {}

        const normalizedPending: Record<string, PendingAdvancement> = {}
        for (const [id, pending] of Object.entries(rawPending)) {
          normalizedPending[id] = normalizePendingAdvancement(
            pending as LegacyPendingAdvancement,
          )
        }

        const rawReminders = (
          stateWithDefaults as { bondReminders?: unknown }
        ).bondReminders
        const normalizedReminders = Array.isArray(rawReminders)
          ? (rawReminders as BondReminder[])
          : []

        return {
          ...stateWithDefaults,
          pendingAdvancements: normalizedPending,
          bondReminders: normalizedReminders,
        }
      },
      partialize: (state) => ({
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
        pendingAdvancements: state.pendingAdvancements,
        bondReminders: state.bondReminders,
      }),
    },
  ),
)

