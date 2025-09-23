/**
 * Session Store for ZimboMate V2
 * Manages current game session state, rolls, conditions, and temporary effects
 * Integrates with DiceRollingService and CharacterStateService
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DiceRoll } from '../services/DiceRollingService'
import { characterStateService } from '../services/CharacterStateService'
import type { Condition, OngoingModifier, ForwardModifier } from '../services/CharacterStateService'
import type { Note } from '../components/game/SessionTools/NotesWidget'
import type { Tracker } from '../components/game/SessionTools/TrackersWidget'
import type { SessionTimer, TimeBookmark } from '../components/game/SessionTools/TimersWidget'

// Session state interface
interface GameSession {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  campaignId?: string
  characterIds: string[]
  notes: string
  xpAwarded: number
}

// Combat state
interface CombatState {
  isActive: boolean
  round: number
  turn: number
  initiative: Array<{
    characterId: string
    characterName: string
    initiative: number
    hasActed: boolean
  }>
  conditions: Array<{
    characterId: string
    condition: Condition
  }>
}

interface SessionState {
  // Current session
  currentSession: GameSession | null
  isSessionActive: boolean
  sessionStartTime: Date | null
  
  // Roll history
  rollHistory: DiceRoll[]
  maxRollHistory: number
  
  // Session Tools data
  sessionNotes: Note[]
  sessionTrackers: Tracker[]
  sessionTimers: SessionTimer[]
  timeBookmarks: TimeBookmark[]
  
  // Combat state
  combat: CombatState
  
  // Temporary effects (session-only)
  sessionConditions: Array<{
    characterId: string
    condition: Condition
  }>
  sessionModifiers: Array<{
    characterId: string
    modifier: OngoingModifier | ForwardModifier
  }>
  
  // Session management
  startSession: (name: string, characterIds: string[], campaignId?: string) => void
  endSession: () => void
  updateSessionNotes: (notes: string) => void
  awardXP: (amount: number) => void
  
  // Roll management
  addRoll: (roll: DiceRoll) => void
  clearRollHistory: () => void
  getRecentRolls: (count?: number) => DiceRoll[]
  
  // Notes management
  addNote: (note: Note) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  deleteNote: (noteId: string) => void
  
  // Trackers management
  addTracker: (tracker: Tracker) => void
  updateTracker: (trackerId: string, updates: Partial<Tracker>) => void
  deleteTracker: (trackerId: string) => void
  
  // Timers management
  addTimer: (timer: SessionTimer) => void
  updateTimer: (timerId: string, updates: Partial<SessionTimer>) => void
  deleteTimer: (timerId: string) => void
  
  // Bookmarks management
  addBookmark: (bookmark: TimeBookmark) => void
  deleteBookmark: (bookmarkId: string) => void
  
  // Combat management
  startCombat: (characterIds: string[]) => void
  endCombat: () => void
  nextTurn: () => void
  nextRound: () => void
  setInitiative: (characterId: string, initiative: number) => void
  markCharacterActed: (characterId: string) => void
  
  // Condition management
  addSessionCondition: (characterId: string, condition: Condition) => void
  removeSessionCondition: (characterId: string, conditionId: string) => void
  addSessionModifier: (characterId: string, modifier: OngoingModifier | ForwardModifier) => void
  removeSessionModifier: (characterId: string, modifierId: string) => void
  
  // Time management
  advanceTime: (timeType: 'turn' | 'scene' | 'encounter') => void
  
  // Utility
  getSessionStats: () => {
    duration: number
    totalRolls: number
    successfulRolls: number
    failedRolls: number
    xpAwarded: number
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isSessionActive: false,
      sessionStartTime: null,
      rollHistory: [],
      maxRollHistory: 100,
      sessionNotes: [],
      sessionTrackers: [],
      sessionTimers: [],
      timeBookmarks: [],
      combat: {
        isActive: false,
        round: 0,
        turn: 0,
        initiative: [],
        conditions: [],
      },
      sessionConditions: [],
      sessionModifiers: [],

      // Session management
      startSession: (name, characterIds, campaignId) => {
        const startTime = new Date()
        const session: GameSession = {
          id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          name,
          startTime,
          campaignId,
          characterIds,
          notes: '',
          xpAwarded: 0,
        }

        set({
          currentSession: session,
          isSessionActive: true,
          sessionStartTime: startTime,
          rollHistory: [],
          sessionNotes: [],
          sessionTrackers: [],
          sessionTimers: [],
          timeBookmarks: [],
          sessionConditions: [],
          sessionModifiers: [],
          combat: {
            isActive: false,
            round: 0,
            turn: 0,
            initiative: [],
            conditions: [],
          },
        })
      },

      endSession: () => {
        const { currentSession } = get()
        if (!currentSession) return

        const endedSession = {
          ...currentSession,
          endTime: new Date(),
        }

        // Clear all session-specific temporary effects
        for (const condition of get().sessionConditions) {
          characterStateService.removeCondition(condition.characterId, condition.condition.id)
        }

        set({
          currentSession: endedSession,
          isSessionActive: false,
          sessionStartTime: null,
          combat: {
            isActive: false,
            round: 0,
            turn: 0,
            initiative: [],
            conditions: [],
          },
          sessionConditions: [],
          sessionModifiers: [],
        })
      },

      updateSessionNotes: (notes) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: { ...currentSession, notes }
        })
      },

      awardXP: (amount) => {
        const { currentSession } = get()
        if (!currentSession) return

        set({
          currentSession: {
            ...currentSession,
            xpAwarded: currentSession.xpAwarded + amount
          }
        })
      },

      // Roll management
      addRoll: (roll) => {
        set((state) => {
          const newHistory = [roll, ...state.rollHistory]
          return {
            rollHistory: newHistory.slice(0, state.maxRollHistory)
          }
        })
      },

      clearRollHistory: () => {
        set({ rollHistory: [] })
      },

      getRecentRolls: (count = 10) => {
        const { rollHistory } = get()
        return rollHistory.slice(0, count)
      },

      // Notes management
      addNote: (note) => {
        set((state) => ({
          sessionNotes: [...state.sessionNotes, note]
        }))
      },

      updateNote: (noteId, updates) => {
        set((state) => ({
          sessionNotes: state.sessionNotes.map(note =>
            note.id === noteId ? { ...note, ...updates } : note
          )
        }))
      },

      deleteNote: (noteId) => {
        set((state) => ({
          sessionNotes: state.sessionNotes.filter(note => note.id !== noteId)
        }))
      },

      // Trackers management
      addTracker: (tracker) => {
        set((state) => ({
          sessionTrackers: [...state.sessionTrackers, tracker]
        }))
      },

      updateTracker: (trackerId, updates) => {
        set((state) => ({
          sessionTrackers: state.sessionTrackers.map(tracker =>
            tracker.id === trackerId ? { ...tracker, ...updates } : tracker
          )
        }))
      },

      deleteTracker: (trackerId) => {
        set((state) => ({
          sessionTrackers: state.sessionTrackers.filter(tracker => tracker.id !== trackerId)
        }))
      },

      // Timers management
      addTimer: (timer) => {
        set((state) => ({
          sessionTimers: [...state.sessionTimers, timer]
        }))
      },

      updateTimer: (timerId, updates) => {
        set((state) => ({
          sessionTimers: state.sessionTimers.map(timer =>
            timer.id === timerId ? { ...timer, ...updates } : timer
          )
        }))
      },

      deleteTimer: (timerId) => {
        set((state) => ({
          sessionTimers: state.sessionTimers.filter(timer => timer.id !== timerId)
        }))
      },

      // Bookmarks management
      addBookmark: (bookmark) => {
        set((state) => ({
          timeBookmarks: [...state.timeBookmarks, bookmark]
        }))
      },

      deleteBookmark: (bookmarkId) => {
        set((state) => ({
          timeBookmarks: state.timeBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
        }))
      },

      // Combat management
      startCombat: (characterIds) => {
        set((state) => ({
          combat: {
            ...state.combat,
            isActive: true,
            round: 1,
            turn: 0,
            initiative: characterIds.map(id => ({
              characterId: id,
              characterName: `Character ${id}`, // This would be populated from character store
              initiative: 0,
              hasActed: false,
            })),
          }
        }))
      },

      endCombat: () => {
        set((state) => ({
          combat: {
            ...state.combat,
            isActive: false,
            round: 0,
            turn: 0,
            initiative: [],
            conditions: [],
          }
        }))
      },

      nextTurn: () => {
        set((state) => {
          const { combat } = state
          if (!combat.isActive) return state

          const nextTurn = (combat.turn + 1) % combat.initiative.length
          return {
            combat: {
              ...combat,
              turn: nextTurn,
            }
          }
        })
      },

      nextRound: () => {
        set((state) => {
          const { combat } = state
          if (!combat.isActive) return state

          // Reset all characters' acted status
          const resetInitiative = combat.initiative.map(init => ({
            ...init,
            hasActed: false,
          }))

          return {
            combat: {
              ...combat,
              round: combat.round + 1,
              turn: 0,
              initiative: resetInitiative,
            }
          }
        })

        // Advance time for all characters
        get().advanceTime('turn')
      },

      setInitiative: (characterId, initiative) => {
        set((state) => ({
          combat: {
            ...state.combat,
            initiative: state.combat.initiative.map(init =>
              init.characterId === characterId
                ? { ...init, initiative }
                : init
            ).sort((a, b) => b.initiative - a.initiative), // Sort by initiative descending
          }
        }))
      },

      markCharacterActed: (characterId) => {
        set((state) => ({
          combat: {
            ...state.combat,
            initiative: state.combat.initiative.map(init =>
              init.characterId === characterId
                ? { ...init, hasActed: true }
                : init
            ),
          }
        }))
      },

      // Condition management
      addSessionCondition: (characterId, condition) => {
        // Add to character state service
        characterStateService.addCondition(characterId, condition)
        
        // Track in session
        set((state) => ({
          sessionConditions: [...state.sessionConditions, { characterId, condition }]
        }))
      },

      removeSessionCondition: (characterId, conditionId) => {
        // Remove from character state service
        characterStateService.removeCondition(characterId, conditionId)
        
        // Remove from session tracking
        set((state) => ({
          sessionConditions: state.sessionConditions.filter(
            sc => !(sc.characterId === characterId && sc.condition.id === conditionId)
          )
        }))
      },

      addSessionModifier: (characterId, modifier) => {
        // Add to character state service
        if ('appliesTo' in modifier && modifier.appliesTo.startsWith('next_')) {
          characterStateService.addForwardModifier(characterId, modifier as ForwardModifier)
        } else {
          characterStateService.addOngoingModifier(characterId, modifier as OngoingModifier)
        }
        
        // Track in session
        set((state) => ({
          sessionModifiers: [...state.sessionModifiers, { characterId, modifier }]
        }))
      },

      removeSessionModifier: (characterId, modifierId) => {
        // Remove from session tracking
        set((state) => ({
          sessionModifiers: state.sessionModifiers.filter(
            sm => !(sm.characterId === characterId && sm.modifier.id === modifierId)
          )
        }))
      },

      // Time management
      advanceTime: (timeType) => {
        const { currentSession } = get()
        if (!currentSession) return

        // Advance time for all characters in the session
        for (const characterId of currentSession.characterIds) {
          characterStateService.advanceTime(characterId, timeType)
        }
      },

      // Utility
      getSessionStats: () => {
        const { currentSession, rollHistory } = get()
        
        if (!currentSession) {
          return {
            duration: 0,
            totalRolls: 0,
            successfulRolls: 0,
            failedRolls: 0,
            xpAwarded: 0,
          }
        }

        const duration = currentSession.endTime 
          ? currentSession.endTime.getTime() - currentSession.startTime.getTime()
          : Date.now() - currentSession.startTime.getTime()

        const totalRolls = rollHistory.length
        const successfulRolls = rollHistory.filter(roll => roll.result === 'success').length
        const failedRolls = rollHistory.filter(roll => roll.result === 'failure').length

        return {
          duration,
          totalRolls,
          successfulRolls,
          failedRolls,
          xpAwarded: currentSession.xpAwarded,
        }
      },
    }),
    {
      name: 'zimbomate-session-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        isSessionActive: state.isSessionActive,
        sessionStartTime: state.sessionStartTime,
        rollHistory: state.rollHistory.slice(0, 20), // Only persist recent rolls
        sessionNotes: state.sessionNotes,
        sessionTrackers: state.sessionTrackers,
        sessionTimers: state.sessionTimers,
        timeBookmarks: state.timeBookmarks,
      }),
    }
  )
)