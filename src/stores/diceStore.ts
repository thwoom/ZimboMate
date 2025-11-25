/**
 * Dice Store
 * Simplified dice orchestration with minimal side effects and typed history
 */

import type { Attributes } from '../models/Character'
import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'
import { getAttributeModifier } from '../models/Character'
import { logger } from '../utils/logger'
import { useCharacterStore } from './characterStore'
import { useHoldStore } from './holdStore'
import { useXPStore } from './xpStore'
type LogActionType = 'move_roll' | 'damage_roll' | 'custom_roll'
const logActionListener = { emitAction: (_payload: unknown) => {} }

export type RollType = 'stat' | 'move' | 'custom'
export type RollOutcome = 'success' | 'partial' | 'failure'

export interface RollContext {
  label: string
  stat?: keyof Attributes
  moveId?: string
  description?: string
}

export interface RollResult {
  version: 1
  id: string
  timestamp: number
  characterId: string
  type: RollType
  dice1: number
  dice2: number
  diceTotal: number
  modifier: number
  finalResult: number
  outcome: RollOutcome
  context: RollContext
  effects?: {
    xpAwarded?: boolean
    holdGranted?: number
    additional?: string[]
  }
}

interface DiceSettings {
  historyLimit: number
  autoAwardXp: boolean
  autoGrantHold: boolean
  autoLogSecretary: boolean
  rollHudPinned: boolean
  rollHudPosition: 'top' | 'bottom'
  rollHudStyle: 'bar' | 'card'
  showBarMicroHistory: boolean
}

interface DiceState {
  currentRoll: RollResult | null
  isRolling: boolean
  historyByCharacter: Record<string, RollResult[]>
  settings: DiceSettings

  rollStat: (
    stat: keyof Attributes,
    characterId: string,
    label?: string,
  ) => Promise<RollResult>
  rollMove: (params: {
    moveId: string
    stat: keyof Attributes
    characterId: string
    label?: string
  }) => Promise<RollResult>
  rollCustom: (params: {
    modifier: number
    context: RollContext
    characterId: string
  }) => Promise<RollResult>

  recordRoll: (roll: RollResult) => void
  getHistoryForCharacter: (characterId: string) => RollResult[]
  getRecentRolls: (limit?: number) => RollResult[]
  clearHistoryForCharacter: (characterId: string) => void
  clearAllHistory: () => void
  reroll: (rollId: string) => Promise<RollResult | null>

  setHistoryLimit: (limit: number) => void
  setAutoAwardXp: (enabled: boolean) => void
  setAutoGrantHold: (enabled: boolean) => void
  setautoLogSecretary: (enabled: boolean) => void
  setRollHudPinned: (enabled: boolean) => void
  setRollHudPosition: (pos: 'top' | 'bottom') => void
  setRollHudStyle: (style: 'bar' | 'card') => void
  setShowBarMicroHistory: (enabled: boolean) => void
}

function determineOutcome(total: number): RollOutcome {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'failure'
}

function generateRollId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `roll-${crypto.randomUUID()}`
  }

  return `roll-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function rollDicePair() {
  return {
    dice1: Math.floor(Math.random() * 6) + 1,
    dice2: Math.floor(Math.random() * 6) + 1,
  }
}

function getCharacterAttributes(characterId: string): Attributes | null {
  try {
    const character = useCharacterStore.getState().getCharacter(characterId)
    return character?.attributes ?? null
  } catch (error) {
    logger.error('diceStore: failed to read character attributes', error)
    return null
  }
}

function emitsecretaryPromptForRoll(roll: RollResult) {
  try {
    const actionType: LogActionType =
      roll.type === 'move'
        ? 'move_roll'
        : roll.type === 'stat'
          ? 'stat_roll'
          : 'dice_roll'

    const character = useCharacterStore
      .getState()
      .getCharacter?.(roll.characterId)

    logActionListener.emitAction({
      actionType,
      timestamp: new Date(),
      characterId: roll.characterId,
      characterName: character?.name,
      diceRoll: {
        type:
          roll.type === 'move'
            ? 'move'
            : roll.type === 'stat'
              ? 'stat'
              : 'custom',
        stat: roll.context.stat,
        moveName: roll.context.moveId ?? roll.context.label,
        result: roll.outcome,
        total: roll.finalResult,
        modifier: roll.modifier,
        dice: [roll.dice1, roll.dice2],
        rollId: roll.id,
      },
    })
  } catch (error) {
    logger.warn('diceStore: failed to emit secretary prompt', error)
  }
}

function createRollResult(
  type: RollType,
  characterId: string,
  modifier: number,
  context: RollContext,
  dice: { dice1: number; dice2: number },
): RollResult {
  const diceTotal = dice.dice1 + dice.dice2
  const finalResult = diceTotal + modifier

  return {
    version: 1,
    id: generateRollId(),
    timestamp: Date.now(),
    characterId,
    type,
    dice1: dice.dice1,
    dice2: dice.dice2,
    diceTotal,
    modifier,
    finalResult,
    outcome: determineOutcome(finalResult),
    context,
    effects: {},
  }
}

function clampHistory(rolls: RollResult[], limit: number): RollResult[] {
  const safeLimit = Math.max(1, limit)
  return rolls.slice(0, safeLimit)
}

function determineHoldGain(moveId: string, outcome: RollOutcome): number {
  const isStrongHit = outcome === 'success'
  const isWeakHit = outcome === 'partial'

  switch (moveId) {
    case 'defend':
    case 'discern-realities':
    case 'spout-lore':
      if (isStrongHit) return 3
      if (isWeakHit) return 1
      return 0
    default:
      return 0
  }
}

export const useDiceStore = createWithEqualityFn<DiceState>()(
  persist(
    (set, get) => ({
      currentRoll: null,
      isRolling: false,
      historyByCharacter: {},
      settings: {
        historyLimit: 50,
        autoAwardXp: false,
        autoGrantHold: false,
        autoLogSecretary: true,
        rollHudPinned: true,
        rollHudPosition: 'top',
        rollHudStyle: 'bar',
        showBarMicroHistory: true,
      },

      async rollStat(stat, characterId, label) {
        if (get().isRolling) {
          throw new Error('Dice roll already in progress')
        }

        set({ isRolling: true, currentRoll: null })

        try {
          const attributes = getCharacterAttributes(characterId)
          if (!attributes) {
            throw new Error('Character not found')
          }

          const modifier = getAttributeModifier(attributes[stat])
          const dice = rollDicePair()
          const context: RollContext = {
            label: label ?? `${stat} Roll`,
            stat,
            description: `${stat} roll with ${modifier >= 0 ? '+' : ''}${modifier}`,
          }

          const roll = createRollResult(
            'stat',
            characterId,
            modifier,
            context,
            dice,
          )
          const { settings } = get()

          if (settings.autoAwardXp && roll.outcome === 'failure') {
            roll.effects = { ...roll.effects, xpAwarded: true }
            const xpStore = useXPStore.getState()
            if (xpStore.awardFailedRoll) {
              xpStore.awardFailedRoll(characterId, roll.id)
            }
          }

          get().recordRoll(roll)
          return roll
        } catch (error) {
          logger.error('diceStore: rollStat failed', error)
          throw error
        } finally {
          set({ isRolling: false })
        }
      },

      async rollMove({ moveId, stat, characterId, label }) {
        if (get().isRolling) {
          throw new Error('Dice roll already in progress')
        }

        set({ isRolling: true, currentRoll: null })

        try {
          const attributes = getCharacterAttributes(characterId)
          if (!attributes) {
            throw new Error('Character not found')
          }

          const modifier = getAttributeModifier(attributes[stat])
          const dice = rollDicePair()
          const context: RollContext = {
            label:
              label ??
              moveId
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            stat,
            moveId,
            description: `${moveId} on ${stat} (${modifier >= 0 ? '+' : ''}${modifier})`,
          }

          const roll = createRollResult(
            'move',
            characterId,
            modifier,
            context,
            dice,
          )
          const { settings } = get()

          if (settings.autoAwardXp && roll.outcome === 'failure') {
            roll.effects = { ...roll.effects, xpAwarded: true }
            const xpStore = useXPStore.getState()
            if (xpStore.awardFailedRoll) {
              xpStore.awardFailedRoll(characterId, roll.id, moveId)
            }
          }

          if (settings.autoGrantHold) {
            const holdGranted = determineHoldGain(moveId, roll.outcome)
            if (holdGranted > 0) {
              roll.effects = { ...roll.effects, holdGranted }
              const holdStore = useHoldStore.getState()
              if (holdStore.grantHold) {
                holdStore.grantHold(characterId, moveId, holdGranted, roll.id)
              }
            }
          }

          get().recordRoll(roll)
          return roll
        } catch (error) {
          logger.error('diceStore: rollMove failed', error)
          throw error
        } finally {
          set({ isRolling: false })
        }
      },

      async rollCustom({ modifier, context, characterId }) {
        if (!context.label.trim()) {
          throw new Error('Custom rolls require a label')
        }

        if (get().isRolling) {
          throw new Error('Dice roll already in progress')
        }

        set({ isRolling: true, currentRoll: null })

        try {
          const dice = rollDicePair()
          const roll = createRollResult(
            'custom',
            characterId,
            modifier,
            context,
            dice,
          )
          const { settings } = get()

          if (
            settings.autoAwardXp &&
            roll.outcome === 'failure' &&
            context.stat
          ) {
            roll.effects = { ...roll.effects, xpAwarded: true }
            const xpStore = useXPStore.getState()
            if (xpStore.awardFailedRoll) {
              xpStore.awardFailedRoll(characterId, roll.id, context.moveId)
            }
          }

          get().recordRoll(roll)
          return roll
        } catch (error) {
          logger.error('diceStore: rollCustom failed', error)
          throw error
        } finally {
          set({ isRolling: false })
        }
      },

      recordRoll(roll) {
        set((state) => {
          const existing = state.historyByCharacter[roll.characterId] ?? []
          const updated = clampHistory(
            [roll, ...existing],
            state.settings.historyLimit,
          )

          return {
            currentRoll: roll,
            historyByCharacter: {
              ...state.historyByCharacter,
              [roll.characterId]: updated,
            },
          }
        })
        emitsecretaryPromptForRoll(roll)
      },

      getHistoryForCharacter(characterId) {
        return get().historyByCharacter[characterId] ?? []
      },

      getRecentRolls(limit = 10) {
        const rolls = Object.values(get().historyByCharacter).flat()
        const sorted = [...rolls].sort((a, b) => b.timestamp - a.timestamp)
        return sorted.slice(0, Math.max(1, limit))
      },

      clearHistoryForCharacter(characterId) {
        set((state) => {
          if (!(characterId in state.historyByCharacter)) {
            return state
          }

          const { [characterId]: _removed, ...rest } = state.historyByCharacter
          return { historyByCharacter: rest }
        })
      },

      clearAllHistory() {
        set({ historyByCharacter: {} })
      },

      async reroll(rollId) {
        const state = get()

        for (const rolls of Object.values(state.historyByCharacter)) {
          const original = rolls.find((roll) => roll.id === rollId)
          if (!original) {
            continue
          }

          if (original.type === 'stat' && original.context.stat) {
            return state.rollStat(
              original.context.stat,
              original.characterId,
              original.context.label,
            )
          }

          if (
            original.type === 'move' &&
            original.context.moveId &&
            original.context.stat
          ) {
            return state.rollMove({
              moveId: original.context.moveId,
              stat: original.context.stat,
              characterId: original.characterId,
              label: original.context.label,
            })
          }

          if (original.type === 'custom') {
            return state.rollCustom({
              modifier: original.modifier,
              context: original.context,
              characterId: original.characterId,
            })
          }
        }

        return null
      },

      setHistoryLimit(limit) {
        set((state) => {
          const safeLimit = Math.max(1, limit)
          const trimmedHistory = Object.fromEntries(
            Object.entries(state.historyByCharacter).map(
              ([characterId, rolls]) => [
                characterId,
                clampHistory(rolls, safeLimit),
              ],
            ),
          )

          return {
            historyByCharacter: trimmedHistory,
            settings: {
              ...state.settings,
              historyLimit: safeLimit,
            },
          }
        })
      },

      setAutoAwardXp(enabled) {
        set((state) => ({
          settings: {
            ...state.settings,
            autoAwardXp: enabled,
          },
        }))
      },

      setAutoGrantHold(enabled) {
        set((state) => ({
          settings: {
            ...state.settings,
            autoGrantHold: enabled,
          },
        }))
      },

      setautoLogSecretary(enabled) {
        set((state) => ({
          settings: {
            ...state.settings,
            autoLogSecretary: enabled,
          },
        }))
      },

      setRollHudPinned(enabled) {
        set((state) => ({
          settings: {
            ...state.settings,
            rollHudPinned: enabled,
          },
        }))
      },

      setRollHudPosition(pos) {
        set((state) => ({
          settings: {
            ...state.settings,
            rollHudPosition: pos,
          },
        }))
      },

      setRollHudStyle(style) {
        set((state) => ({
          settings: {
            ...state.settings,
            rollHudStyle: style,
          },
        }))
      },

      setShowBarMicroHistory(enabled) {
        set((state) => ({
          settings: {
            ...state.settings,
            showBarMicroHistory: enabled,
          },
        }))
      },
    }),
    {
      name: 'zimbomate-dice-store',
      version: 3,
      partialize: (state) => ({
        historyByCharacter: state.historyByCharacter,
        settings: state.settings,
      }),
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return persistedState
        }

        if (version === 0) {
          const previousSettings =
            (persistedState as Partial<DiceState>)?.settings ?? {}

          return {
            ...persistedState,
            settings: {
              historyLimit: 50,
              autoAwardXp: false,
              autoGrantHold: false,
              autoLogSecretary: true,
              rollHudPinned: true,
              rollHudPosition: 'top',
              ...previousSettings,
            },
          }
        }

        const persistedSettings =
          (persistedState as Partial<DiceState>)?.settings ?? null
        if (persistedSettings) {
          const maybePatched = {
            ...persistedState,
            settings: {
              ...persistedSettings,
              autoLogSecretary:
                typeof persistedSettings.autoLogSecretary === 'undefined'
                  ? true
                  : persistedSettings.autoLogSecretary,
              rollHudPinned:
                typeof (persistedSettings as any).rollHudPinned === 'undefined'
                  ? true
                  : (persistedSettings as any).rollHudPinned,
              rollHudPosition:
                typeof (persistedSettings as any).rollHudPosition === 'undefined'
                  ? 'top'
                  : (persistedSettings as any).rollHudPosition,
              rollHudStyle:
                typeof (persistedSettings as any).rollHudStyle === 'undefined'
                  ? 'bar'
                  : (persistedSettings as any).rollHudStyle,
              showBarMicroHistory:
                typeof (persistedSettings as any).showBarMicroHistory === 'undefined'
                  ? true
                  : (persistedSettings as any).showBarMicroHistory,
            },
          }
          return maybePatched
        }

        return persistedState
      },
    },
  ),
)

export function migrateRollHistory(data: unknown[]): RollResult[] {
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const record = item as Partial<RollResult>

    const dice1 = typeof record.dice1 === 'number' ? record.dice1 : 0
    const dice2 = typeof record.dice2 === 'number' ? record.dice2 : 0
    const modifier = typeof record.modifier === 'number' ? record.modifier : 0
    const diceTotal = dice1 + dice2
    const finalResult = diceTotal + modifier
    const outcome = determineOutcome(finalResult)

    return {
      version: 1,
      id: record.id ?? generateRollId(),
      timestamp: record.timestamp ?? Date.now(),
      characterId: record.characterId ?? 'default',
      type: record.type ?? 'stat',
      dice1,
      dice2,
      diceTotal,
      modifier,
      finalResult,
      outcome,
      context: record.context ?? { label: 'Unknown Roll' },
      effects: record.effects ?? {},
    }
  })
}

export type { RollContext, RollResult }



