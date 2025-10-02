/**
 * XP Store for Dungeon World
 * Manages experience points, auto-awards for failed rolls, and level tracking
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface XPEvent {
  id: string
  characterId: string
  timestamp: number
  type: 'failed-roll' | 'end-of-session' | 'bond-resolution' | 'alignment' | 'manual'
  amount: number
  reason: string
  rollId?: string // Reference to the roll that triggered this XP
  moveId?: string // Reference to the move if applicable
}

interface XPState {
  // XP tracking
  characterXP: Record<string, number>
  characterLevel: Record<string, number>
  xpEvents: XPEvent[]

  // Settings
  autoAwardFailedRolls: boolean
  showXPNotifications: boolean
  xpPerLevel: number // XP needed to level up (default 7 + current level)

  // Actions
  addXP: (characterId: string, amount: number, reason: string, type?: XPEvent['type'], rollId?: string, moveId?: string) => void
  awardFailedRoll: (characterId: string, rollId: string, moveId?: string) => void
  calculateLevelFromXP: (xp: number) => number
  getXPForNextLevel: (characterId: string) => number
  canLevelUp: (characterId: string) => boolean
  getXPProgress: (characterId: string) => { current: number, needed: number, percent: number }
  getXPEventsForCharacter: (characterId: string) => XPEvent[]
  clearXPHistory: (characterId: string) => void
  setAutoAwardFailedRolls: (enabled: boolean) => void
  setShowXPNotifications: (enabled: boolean) => void
}

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      // Initial state
      characterXP: {},
      characterLevel: {},
      xpEvents: [],
      autoAwardFailedRolls: true,
      showXPNotifications: true,
      xpPerLevel: 7, // Base XP for first level

      // Calculate level from total XP (Dungeon World progression: 7 + current level)
      calculateLevelFromXP: (totalXP: number) => {
        let level = 1
        let xpNeeded = 7 // First level needs 7 XP

        while (totalXP >= xpNeeded) {
          totalXP -= xpNeeded
          level++
          xpNeeded = 7 + (level - 1) // Each level needs 7 + current level XP
        }

        return level
      },

      // Get XP needed for next level
      getXPForNextLevel: (characterId: string) => {
        const state = get()
        const currentXP = state.characterXP[characterId] || 0
        const currentLevel = state.calculateLevelFromXP(currentXP)
        return 7 + currentLevel
      },

      // Check if character can level up
      canLevelUp: (characterId: string) => {
        const state = get()
        const currentXP = state.characterXP[characterId] || 0
        const currentLevel = state.characterLevel[characterId] || 1
        const xpNeededForNextLevel = 7 + currentLevel
        return currentXP >= xpNeededForNextLevel
      },

      // Get XP progress information
      getXPProgress: (characterId: string) => {
        const state = get()
        const currentXP = state.characterXP[characterId] || 0
        const currentLevel = state.characterLevel[characterId] || 1
        const xpNeededForNextLevel = 7 + currentLevel
        const xpNeededTotal = xpNeededForNextLevel
        const percent = Math.min(100, (currentXP / xpNeededTotal) * 100)

        return {
          current: currentXP,
          needed: xpNeededForNextLevel,
          percent: Math.round(percent),
        }
      },

      // Add XP to a character
      addXP: (characterId, amount, reason, type = 'manual', rollId, moveId) => {
        const id = `xp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        set((state) => {
          const oldXP = state.characterXP[characterId] || 0
          const oldLevel = state.characterLevel[characterId] || 1
          const newXP = oldXP + amount
          const newLevel = state.calculateLevelFromXP(newXP)

          const xpEvent: XPEvent = {
            id,
            characterId,
            timestamp: Date.now(),
            type,
            amount,
            reason,
            rollId,
            moveId,
          }

          console.log(`[XP] Added ${amount} XP to ${characterId}: ${reason} (Total: ${newXP})`)

          // Check for level up
          if (newLevel > oldLevel) {
            console.log(`🎉 [LEVEL UP] ${characterId} reached level ${newLevel}! (Was ${oldLevel})`)
            // Trigger level up notification
            setTimeout(() => {
              alert(`🎉 LEVEL UP! You've reached level ${newLevel}!

You can now choose advancement options:
• Increase a stat by 1
• Learn a new move
• Gain other class abilities

Visit your character sheet to make your selections.`)
            }, 500)
          }

          return {
            characterXP: {
              ...state.characterXP,
              [characterId]: newXP,
            },
            characterLevel: {
              ...state.characterLevel,
              [characterId]: newLevel,
            },
            xpEvents: [...state.xpEvents, xpEvent],
          }
        })
      },

      // Auto-award XP for failed rolls (6-)
      awardFailedRoll: (characterId, rollId, moveId) => {
        const state = get()
        if (!state.autoAwardFailedRolls)
          return

        const reason = moveId
          ? `Failed ${moveId.replace('-', ' ')} roll`
          : 'Failed roll (6-)'

        state.addXP(characterId, 1, reason, 'failed-roll', rollId, moveId)
      },

      // Get XP events for a specific character
      getXPEventsForCharacter: (characterId) => {
        const state = get()
        return state.xpEvents
          .filter(event => event.characterId === characterId)
          .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      },

      // Clear XP history for a character
      clearXPHistory: (characterId) => {
        set(state => ({
          xpEvents: state.xpEvents.filter(event => event.characterId !== characterId),
          characterXP: {
            ...state.characterXP,
            [characterId]: 0,
          },
          characterLevel: {
            ...state.characterLevel,
            [characterId]: 1,
          },
        }))
      },

      // Settings
      setAutoAwardFailedRolls: (enabled) => {
        set({ autoAwardFailedRolls: enabled })
      },

      setShowXPNotifications: (enabled) => {
        set({ showXPNotifications: enabled })
      },
    }),
    {
      name: 'zimbomate-xp-store',
      version: 1,
    },
  ),
)
