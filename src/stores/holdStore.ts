import { createWithEqualityFn } from 'zustand/traditional'
/**
 * Hold Store for Dungeon World
 * Manages hold points for various moves (Defend, Discern Realities, etc.)
 */

import { persist } from 'zustand/middleware'
import { logger } from '../utils/logger'

export interface HoldEntry {
  id: string
  characterId: string
  moveId: string
  moveName: string
  amount: number
  maxAmount: number
  timestamp: number
  description: string
  rollId?: string // Reference to the roll that granted this hold
}

export interface HoldOption {
  id: string
  label: string
  description: string
  cost: number
}

// Define hold-granting moves and their options
export const HOLD_MOVES: Record<
  string,
  {
    name: string
    description: string
    options: HoldOption[]
  }
> = {
  defend: {
    name: 'Defend',
    description: 'Stand in defense of a person, item, or location',
    options: [
      {
        id: 'redirect-attack',
        label: 'Redirect Attack',
        description: 'Redirect an attack from the thing you defend to yourself',
        cost: 1,
      },
      {
        id: 'halve-damage',
        label: 'Halve Damage',
        description: "Halve the attack's effect or damage",
        cost: 1,
      },
      {
        id: 'open-attacker',
        label: 'Open Up Attacker',
        description: 'Open up the attacker to an ally giving them +1 forward',
        cost: 1,
      },
      {
        id: 'deal-damage',
        label: 'Deal Damage',
        description: 'Deal damage to the attacker equal to your level',
        cost: 1,
      },
    ],
  },
  'discern-realities': {
    name: 'Discern Realities',
    description: 'Study a situation or person',
    options: [
      {
        id: 'what-happened',
        label: 'What happened here recently?',
        description: 'Learn about recent events',
        cost: 1,
      },
      {
        id: 'about-to-happen',
        label: 'What is about to happen?',
        description: 'Anticipate immediate events',
        cost: 1,
      },
      {
        id: 'should-be-cautious',
        label: 'What should I be on the lookout for?',
        description: 'Identify potential threats',
        cost: 1,
      },
      {
        id: 'most-valuable',
        label: 'What here is most valuable to me?',
        description: 'Identify valuable things',
        cost: 1,
      },
      {
        id: 'who-in-control',
        label: "Who's really in control here?",
        description: 'Understand power dynamics',
        cost: 1,
      },
      {
        id: 'not-what-seems',
        label: 'What here is not what it appears to be?',
        description: 'Reveal hidden truths',
        cost: 1,
      },
    ],
  },
  'spout-lore': {
    name: 'Spout Lore',
    description: 'Consult your accumulated knowledge',
    options: [
      {
        id: 'ask-question',
        label: 'Ask a Question',
        description: 'Ask the GM a question about the subject',
        cost: 1,
      },
      {
        id: 'useful-fact',
        label: 'Useful Fact',
        description: 'The GM will tell you something useful about the subject',
        cost: 1,
      },
    ],
  },
}

interface HoldState {
  // Hold tracking
  characterHolds: Record<string, HoldEntry[]>

  // Actions
  grantHold: (
    characterId: string,
    moveId: string,
    amount: number,
    rollId?: string,
  ) => void
  spendHold: (
    characterId: string,
    holdId: string,
    optionId?: string,
    amount?: number,
  ) => boolean
  getHoldsForCharacter: (characterId: string) => HoldEntry[]
  getHoldsForMove: (characterId: string, moveId: string) => HoldEntry[]
  clearExpiredHolds: (characterId: string) => void
  clearAllHolds: (characterId: string) => void
}

export const useHoldStore = createWithEqualityFn<HoldState>()(
  persist(
    (set, get) => ({
      // Initial state
      characterHolds: {},

      // Grant hold to a character from a move
      grantHold: (characterId, moveId, amount, rollId) => {
        const moveInfo = HOLD_MOVES[moveId]
        if (!moveInfo) {
          logger.warn(`[Hold] Unknown move: ${moveId}`)
          return
        }

        const holdEntry: HoldEntry = {
          id: `hold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          characterId,
          moveId,
          moveName: moveInfo.name,
          amount,
          maxAmount: amount,
          timestamp: Date.now(),
          description: moveInfo.description,
          rollId,
        }

        set((state) => ({
          characterHolds: {
            ...state.characterHolds,
            [characterId]: [
              ...(state.characterHolds[characterId] || []),
              holdEntry,
            ],
          },
        }))

        logger.info(
          `[Hold] Granted ${amount} hold for ${moveInfo.name} to ${characterId}`,
        )
      },

      // Spend hold points
      spendHold: (characterId, holdId, optionId, amount = 1) => {
        const state = get()
        const characterHolds = state.characterHolds[characterId] || []
        const holdEntry = characterHolds.find((h) => h.id === holdId)

        if (!holdEntry) {
          logger.warn(`[Hold] Hold not found: ${holdId}`)
          return false
        }

        if (holdEntry.amount < amount) {
          logger.warn(`[Hold] Not enough hold: ${holdEntry.amount} < ${amount}`)
          return false
        }

        // Log the option used if provided
        if (optionId) {
          const moveInfo = HOLD_MOVES[holdEntry.moveId]
          const option = moveInfo?.options.find((o) => o.id === optionId)
          if (option) {
            logger.info(`[Hold] ${holdEntry.moveName}: ${option.label}`)
          }
        }

        set((state) => {
          const updatedHolds = state.characterHolds[characterId]
            .map((hold) =>
              hold.id === holdId
                ? { ...hold, amount: hold.amount - amount }
                : hold,
            )
            .filter((hold) => hold.amount > 0) // Remove holds with 0 points

          return {
            characterHolds: {
              ...state.characterHolds,
              [characterId]: updatedHolds,
            },
          }
        })

        return true
      },

      // Get all holds for a character
      getHoldsForCharacter: (characterId) => {
        const state = get()
        return (state.characterHolds[characterId] || []).sort(
          (a, b) => b.timestamp - a.timestamp,
        ) // Most recent first
      },

      // Get holds for a specific move
      getHoldsForMove: (characterId, moveId) => {
        const state = get()
        return (state.characterHolds[characterId] || [])
          .filter((hold) => hold.moveId === moveId)
          .sort((a, b) => b.timestamp - a.timestamp)
      },

      // Clear expired holds (if we ever implement expiration)
      clearExpiredHolds: (_characterId) => {
        // Holds don't expire under base rules; reserved for house variants
      },

      // Clear all holds for a character
      clearAllHolds: (characterId) => {
        set((state) => ({
          characterHolds: {
            ...state.characterHolds,
            [characterId]: [],
          },
        }))
      },
    }),
    {
      name: 'zimbomate-hold-store',
      version: 1,
    },
  ),
)
