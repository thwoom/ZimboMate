/**
 * Dice Store for ZimboMate V2
 * Manages unified dice rolling system with character-scoped history
 * Integrates with Dungeon World mechanics and auto-XP/hold systems
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character, Attributes } from '../models/Character'
import { getAttributeModifier } from '../models/Character'
import { useXPStore } from './xpStore'
import { useHoldStore } from './holdStore'

// Versioned roll result schema for future migrations
export interface RollResult {
  version: 1
  id: string
  timestamp: number
  characterId: string

  // Roll mechanics
  dice1: number
  dice2: number
  diceTotal: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'

  // Context information
  type: 'stat' | 'move' | 'custom'
  context: {
    label: string           // "STR Roll", "Hack and Slash", etc.
    stat?: keyof Attributes // Which stat was rolled
    moveId?: string         // Which move was used
    description?: string    // Additional context
  }

  // Game mechanic effects
  effects: {
    xpAwarded?: boolean     // Did this roll award XP?
    holdGranted?: number    // How much hold was granted?
    additional?: string[]   // Other effects applied
  }
}

export interface RollContext {
  label: string
  stat?: keyof Attributes
  moveId?: string
  description?: string
}

interface DiceState {
  // Current state
  currentRoll: RollResult | null
  isRolling: boolean

  // History (character-scoped)
  rollHistoryByCharacter: Record<string, RollResult[]>
  maxHistoryPerCharacter: number

  // UI state
  showHistory: boolean
  showCommandPalette: boolean
  activeNotifications: RollResult[]
  maxNotifications: number

  // Core rolling functions
  rollStat: (stat: keyof Attributes, characterId: string, customLabel?: string) => Promise<RollResult>
  rollMove: (moveId: string, stat: keyof Attributes, characterId: string) => Promise<RollResult>
  rollCustom: (modifier: number, context: RollContext, characterId: string) => Promise<RollResult>

  // History management
  getHistoryForCharacter: (characterId: string) => RollResult[]
  getAllRolls: () => RollResult[]
  clearHistoryForCharacter: (characterId: string) => void
  clearAllHistory: () => void
  exportHistory: (characterId: string) => string
  rerollWithSameContext: (rollId: string) => Promise<RollResult | null>

  // UI actions
  toggleHistory: () => void
  toggleCommandPalette: () => void
  dismissNotification: (rollId: string) => void
  copyRollToClipboard: (roll: RollResult) => void

  // Internal helpers
  _addRollToHistory: (roll: RollResult) => void
  _createRollResult: (
    dice1: number,
    dice2: number,
    modifier: number,
    context: RollContext,
    characterId: string,
    type: RollResult['type']
  ) => RollResult
  _getCharacterStats: (characterId: string) => Attributes | null
}

// Dungeon World outcome calculation
const getOutcome = (total: number): RollResult['outcome'] => {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'failure'
}

// Generate unique roll ID
const generateRollId = (): string => {
  return `roll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Simulate dice roll with slight delay for animation
const rollDice = (): Promise<{ dice1: number, dice2: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dice1: Math.floor(Math.random() * 6) + 1,
        dice2: Math.floor(Math.random() * 6) + 1
      })
    }, 1500) // 1.5s animation delay
  })
}

export const useDiceStore = create<DiceState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRoll: null,
      isRolling: false,
      rollHistoryByCharacter: {},
      maxHistoryPerCharacter: 100,
      showHistory: true,
      showCommandPalette: false,
      activeNotifications: [],
      maxNotifications: 3,

      // Core rolling functions
      rollStat: async (stat: keyof Attributes, characterId: string, customLabel?: string) => {
        console.log('🎲 rollStat called:', { stat, characterId, customLabel })
        const state = get()
        if (state.isRolling) {
          console.log('⚠️ Already rolling, returning current roll')
          return state.currentRoll!
        }

        console.log('🎯 Starting roll process')
        set({ isRolling: true, currentRoll: null })

        try {
          console.log('📊 Getting character stats for:', characterId)
          const stats = state._getCharacterStats(characterId)
          console.log('📊 Character stats result:', stats)
          if (!stats) throw new Error('Character not found')

          const modifier = getAttributeModifier(stats[stat])
          console.log('🔢 Modifier calculated:', modifier)

          console.log('🎲 Rolling dice...')
          const { dice1, dice2 } = await rollDice()
          console.log('🎲 Dice result:', { dice1, dice2 })

          const context: RollContext = {
            label: customLabel || `${stat} Roll`,
            stat,
            description: `Rolling ${stat} with modifier ${modifier >= 0 ? '+' : ''}${modifier}`
          }

          console.log('📝 Creating roll result with context:', context)
          const roll = state._createRollResult(dice1, dice2, modifier, context, characterId, 'stat')
          console.log('✅ Roll result created:', roll)

          // Award XP for failed stat rolls
          if (roll.outcome === 'failure') {
            console.log('💔 Failed roll, awarding XP')
            roll.effects.xpAwarded = true
            const xpStore = useXPStore.getState()
            xpStore.awardFailedRoll(characterId, roll.id)
          }

          console.log('💾 Setting roll state...')
          set({
            currentRoll: roll,
            isRolling: false,
            activeNotifications: [roll, ...state.activeNotifications].slice(0, state.maxNotifications)
          })

          console.log('📚 Adding roll to history...')
          state._addRollToHistory(roll)
          console.log('✅ Roll process completed successfully')

          // Auto-dismiss notification after 4 seconds
          setTimeout(() => {
            set(state => ({
              activeNotifications: state.activeNotifications.filter(n => n.id !== roll.id)
            }))
          }, 4000)

          return roll
        } catch (error) {
          console.error('❌ rollStat error:', error)
          set({ isRolling: false })
          throw error
        }
      },

      rollMove: async (moveId: string, stat: keyof Attributes, characterId: string) => {
        const state = get()
        if (state.isRolling) return state.currentRoll!

        set({ isRolling: true, currentRoll: null })

        try {
          const stats = state._getCharacterStats(characterId)
          if (!stats) throw new Error('Character not found')

          const modifier = getAttributeModifier(stats[stat])
          const { dice1, dice2 } = await rollDice()

          const context: RollContext = {
            label: moveId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            stat,
            moveId,
            description: `${moveId} using ${stat} (${modifier >= 0 ? '+' : ''}${modifier})`
          }

          const roll = state._createRollResult(dice1, dice2, modifier, context, characterId, 'move')

          // Apply move-specific effects
          if (roll.outcome === 'failure') {
            roll.effects.xpAwarded = true
            // Award XP for failed rolls
            const xpStore = useXPStore.getState()
            xpStore.awardFailedRoll(characterId, roll.id, moveId)
          }

          // Handle hold-granting moves
          const holdAmount = (() => {
            switch (moveId) {
              case 'defend':
                return roll.outcome === 'success' ? 3 : roll.outcome === 'partial' ? 1 : 0
              case 'discern-realities':
                return roll.outcome === 'success' ? 3 : roll.outcome === 'partial' ? 1 : 0
              case 'spout-lore':
                return roll.outcome === 'success' ? 3 : roll.outcome === 'partial' ? 1 : 0
              default:
                return 0
            }
          })()

          if (holdAmount > 0) {
            roll.effects.holdGranted = holdAmount
            const holdStore = useHoldStore.getState()
            holdStore.grantHold(characterId, moveId, holdAmount, roll.id)
          }

          set({
            currentRoll: roll,
            isRolling: false,
            activeNotifications: [roll, ...state.activeNotifications].slice(0, state.maxNotifications)
          })

          state._addRollToHistory(roll)

          // Auto-dismiss notification after 4 seconds
          setTimeout(() => {
            set(state => ({
              activeNotifications: state.activeNotifications.filter(n => n.id !== roll.id)
            }))
          }, 4000)

          return roll
        } catch (error) {
          set({ isRolling: false })
          throw error
        }
      },

      rollCustom: async (modifier: number, context: RollContext, characterId: string) => {
        const state = get()
        if (state.isRolling) return state.currentRoll!

        set({ isRolling: true, currentRoll: null })

        try {
          const { dice1, dice2 } = await rollDice()
          const roll = state._createRollResult(dice1, dice2, modifier, context, characterId, 'custom')

          // Award XP for failed custom rolls (if they're meaningful rolls, not just tests)
          if (roll.outcome === 'failure' && context.stat) {
            roll.effects.xpAwarded = true
            const xpStore = useXPStore.getState()
            xpStore.awardFailedRoll(characterId, roll.id, context.moveId)
          }

          set({
            currentRoll: roll,
            isRolling: false,
            activeNotifications: [roll, ...state.activeNotifications].slice(0, state.maxNotifications)
          })

          state._addRollToHistory(roll)

          // Auto-dismiss notification after 4 seconds
          setTimeout(() => {
            set(state => ({
              activeNotifications: state.activeNotifications.filter(n => n.id !== roll.id)
            }))
          }, 4000)

          return roll
        } catch (error) {
          set({ isRolling: false })
          throw error
        }
      },

      // History management
      getHistoryForCharacter: (characterId: string) => {
        const state = get()
        // Safety check: ensure rollHistoryByCharacter is an object
        if (!state.rollHistoryByCharacter || typeof state.rollHistoryByCharacter !== 'object') {
          console.warn('rollHistoryByCharacter is not an object, reinitializing...')
          // Reinitialize as empty object if corrupted
          state.rollHistoryByCharacter = {}
          return []
        }
        return state.rollHistoryByCharacter[characterId] || []
      },

      getAllRolls: () => {
        const state = get()
        const allRolls: RollResult[] = []

        // Safety check: ensure rollHistoryByCharacter is an object
        if (!state.rollHistoryByCharacter || typeof state.rollHistoryByCharacter !== 'object') {
          console.warn('rollHistoryByCharacter is not an object in getAllRolls, returning empty array')
          return []
        }

        for (const rolls of Object.values(state.rollHistoryByCharacter)) {
          allRolls.push(...rolls)
        }
        // Sort by timestamp, newest first
        return allRolls.sort((a, b) => b.timestamp - a.timestamp)
      },

      clearHistoryForCharacter: (characterId: string) => {
        set(state => {
          const newHistory = { ...state.rollHistoryByCharacter }
          delete newHistory[characterId]
          return { rollHistoryByCharacter: newHistory }
        })
      },

      clearAllHistory: () => {
        set({ rollHistoryByCharacter: {} })
      },

      exportHistory: (characterId: string) => {
        const history = get().getHistoryForCharacter(characterId)
        return history.map(roll =>
          `${new Date(roll.timestamp).toLocaleString()} - ${roll.context.label}: ${roll.dice1}+${roll.dice2}+${roll.modifier}=${roll.finalResult} (${roll.outcome})`
        ).join('\n')
      },

      rerollWithSameContext: async (rollId: string) => {
        const state = get()

        // Find the original roll across all character histories
        let originalRoll: RollResult | null = null
        for (const [characterId, history] of Object.entries(state.rollHistoryByCharacter)) {
          originalRoll = history.find(r => r.id === rollId) || null
          if (originalRoll) break
        }

        if (!originalRoll) return null

        // Re-roll with same parameters
        if (originalRoll.type === 'stat' && originalRoll.context.stat) {
          return await state.rollStat(originalRoll.context.stat, originalRoll.characterId, originalRoll.context.label)
        } else if (originalRoll.type === 'move' && originalRoll.context.moveId && originalRoll.context.stat) {
          return await state.rollMove(originalRoll.context.moveId, originalRoll.context.stat, originalRoll.characterId)
        } else if (originalRoll.type === 'custom') {
          return await state.rollCustom(originalRoll.modifier, originalRoll.context, originalRoll.characterId)
        }

        return null
      },

      // UI actions
      toggleHistory: () => {
        set(state => ({ showHistory: !state.showHistory }))
      },

      toggleCommandPalette: () => {
        set(state => ({ showCommandPalette: !state.showCommandPalette }))
      },

      dismissNotification: (rollId: string) => {
        set(state => ({
          activeNotifications: state.activeNotifications.filter(n => n.id !== rollId)
        }))
      },

      copyRollToClipboard: (roll: RollResult) => {
        const text = `${roll.context.label}: ${roll.dice1}+${roll.dice2}+${roll.modifier}=${roll.finalResult} (${roll.outcome})`
        navigator.clipboard.writeText(text).catch(console.error)
      },

      // Internal helpers
      _addRollToHistory: (roll: RollResult) => {
        console.log('📚 _addRollToHistory called with roll:', roll)
        set(state => {
          console.log('📚 Current state.rollHistoryByCharacter:', state.rollHistoryByCharacter)

          // Safety check: ensure rollHistoryByCharacter is an object
          if (!state.rollHistoryByCharacter || typeof state.rollHistoryByCharacter !== 'object') {
            console.warn('rollHistoryByCharacter is not an object in _addRollToHistory, reinitializing...')
            state.rollHistoryByCharacter = {}
          }

          const newHistory = { ...state.rollHistoryByCharacter }
          const characterHistory = newHistory[roll.characterId] || []
          console.log('📚 Current character history:', characterHistory)

          // Add new roll to front, limit to max history
          const updatedHistory = [roll, ...characterHistory].slice(0, state.maxHistoryPerCharacter)
          console.log('📚 Updated history:', updatedHistory)
          newHistory[roll.characterId] = updatedHistory
          console.log('📚 New history object:', newHistory)

          return { rollHistoryByCharacter: newHistory }
        })
      },

      _createRollResult: (
        dice1: number,
        dice2: number,
        modifier: number,
        context: RollContext,
        characterId: string,
        type: RollResult['type']
      ): RollResult => {
        const diceTotal = dice1 + dice2
        const finalResult = diceTotal + modifier
        const outcome = getOutcome(finalResult)

        return {
          version: 1,
          id: generateRollId(),
          timestamp: Date.now(),
          characterId,
          dice1,
          dice2,
          diceTotal,
          modifier,
          finalResult,
          outcome,
          type,
          context,
          effects: {}
        }
      },

      _getCharacterStats: (characterId: string): Attributes | null => {
        // Import character store dynamically to avoid circular dependencies
        try {
          // Use dynamic import for ES modules
          import('../stores/characterStore').then(({ useCharacterStore }) => {
            const character = useCharacterStore.getState().getCharacter(characterId)
            if (character?.attributes) {
              // Convert from new format {value, modifier} to old format (just values)
              const attributes: Attributes = {}
              Object.entries(character.attributes).forEach(([key, attr]) => {
                attributes[key as keyof Attributes] = attr.value
              })
              return attributes
            }
            return null
          }).catch(error => {
            console.error('Failed to import character store:', error)
            return null
          })

          // For now, return hardcoded stats to test dice rolling
          console.log('🧪 Using hardcoded stats for testing')
          return {
            STR: 8,
            DEX: 12,
            CON: 14,
            INT: 18,
            WIS: 16,
            CHA: 10
          }
        } catch (error) {
          console.error('Failed to get character stats:', error)
          return null
        }
      }
    }),
    {
      name: 'zimbomate-dice-store',
      // Only persist essential data, not UI state
      partialize: (state) => ({
        rollHistoryByCharacter: state.rollHistoryByCharacter,
        maxHistoryPerCharacter: state.maxHistoryPerCharacter,
        showHistory: state.showHistory
      }),
    }
  )
)

// Migration helper for future data format changes
export const migrateRollHistory = (data: any[]): RollResult[] => {
  return data.map(item => {
    if (!item.version) {
      // Migrate v0 to v1
      return {
        ...item,
        version: 1,
        characterId: item.characterId || 'default',
        effects: item.effects || {}
      }
    }
    return item
  })
}

// Export types for other components to use
export type { RollResult, RollContext }