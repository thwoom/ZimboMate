/**
 * useSession Hook for ZimboMate V2
 * Session management, combat state, and roll history tracking
 * Integrates sessionStore with character and campaign management
 */

import type { DiceRoll } from '../services/DiceRollingService'
import type { CombatState, GameSession } from '../stores/sessionStore'
import { useCallback, useMemo } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import { useSessionStore } from '../stores/sessionStore'

export interface SessionStats {
  duration: number
  totalRolls: number
  successfulRolls: number
  partialRolls: number
  failedRolls: number
  xpAwarded: number
  charactersInvolved: number
}

export interface CombatTurn {
  characterId: string
  characterName: string
  initiative: number
  hasActed: boolean
  isActive: boolean
}

export interface UseSessionReturn {
  // Current session
  currentSession: GameSession | null
  isSessionActive: boolean
  sessionStats: SessionStats

  // Session management
  startSession: (name: string, characterIds: string[], campaignId?: string) => void
  endSession: () => void
  updateSessionNotes: (notes: string) => void
  awardXP: (amount: number) => void

  // Roll history
  rollHistory: DiceRoll[]
  recentRolls: DiceRoll[]
  lastRoll: DiceRoll | null
  clearRollHistory: () => void
  getRollsByCharacter: (characterId: string) => DiceRoll[]
  getRollStats: () => {
    total: number
    successes: number
    partials: number
    failures: number
    averageRoll: number
  }

  // Combat management
  combat: CombatState
  combatTurns: CombatTurn[]
  currentTurn: CombatTurn | null
  isInCombat: boolean

  startCombat: (characterIds: string[]) => void
  endCombat: () => void
  nextTurn: () => void
  nextRound: () => void
  setInitiative: (characterId: string, initiative: number) => void
  markCharacterActed: (characterId: string) => void

  // Condition and modifier management
  addSessionCondition: (characterId: string, condition: any) => void
  removeSessionCondition: (characterId: string, conditionId: string) => void
  addSessionModifier: (characterId: string, modifier: any) => void
  removeSessionModifier: (characterId: string, modifierId: string) => void
  getActiveConditions: () => Array<{
    characterId: string
    characterName: string
    condition: any
  }>

  // Time management
  advanceTime: (timeType: 'turn' | 'scene' | 'encounter') => void

  // Quick actions
  quickStartCombat: () => void
  quickEndSession: () => void
  quickAwardXP: (amount: number) => void
}

/**
 * Hook for managing game sessions
 */
export function useSession(): UseSessionReturn {
  const {
    currentSession,
    isSessionActive,
    rollHistory,
    combat,
    sessionConditions,
    sessionModifiers,
    startSession: storeStartSession,
    endSession: storeEndSession,
    updateSessionNotes: storeUpdateSessionNotes,
    awardXP: storeAwardXP,
    addRoll,
    clearRollHistory: storeClearRollHistory,
    getRecentRolls,
    startCombat: storeStartCombat,
    endCombat: storeEndCombat,
    nextTurn: storeNextTurn,
    nextRound: storeNextRound,
    setInitiative: storeSetInitiative,
    markCharacterActed: storeMarkCharacterActed,
    addSessionCondition: storeAddSessionCondition,
    removeSessionCondition: storeRemoveSessionCondition,
    addSessionModifier: storeAddSessionModifier,
    removeSessionModifier: storeRemoveSessionModifier,
    advanceTime: storeAdvanceTime,
    getSessionStats,
  } = useSessionStore()

  const { characters, getCharacter } = useCharacterStore()

  // Session statistics
  const sessionStats = useMemo((): SessionStats => {
    const stats = getSessionStats()
    const partialRolls = rollHistory.filter(roll => roll.result === 'partial').length

    return {
      duration: stats.duration,
      totalRolls: stats.totalRolls,
      successfulRolls: stats.successfulRolls,
      partialRolls,
      failedRolls: stats.failedRolls,
      xpAwarded: stats.xpAwarded,
      charactersInvolved: currentSession?.characterIds.length || 0,
    }
  }, [getSessionStats, rollHistory, currentSession])

  // Roll history management
  const recentRolls = useMemo(() => getRecentRolls(10), [getRecentRolls])
  const lastRoll = useMemo(() => recentRolls[0] || null, [recentRolls])

  const getRollsByCharacter = useCallback((characterId: string) => {
    return rollHistory.filter(roll => roll.characterId === characterId)
  }, [rollHistory])

  const getRollStats = useCallback(() => {
    const total = rollHistory.length
    const successes = rollHistory.filter(roll => roll.result === 'success').length
    const partials = rollHistory.filter(roll => roll.result === 'partial').length
    const failures = rollHistory.filter(roll => roll.result === 'failure').length
    const averageRoll = rollHistory.length > 0
      ? rollHistory.reduce((sum, roll) => sum + roll.total, 0) / rollHistory.length
      : 0

    return { total, successes, partials, failures, averageRoll }
  }, [rollHistory])

  // Combat management
  const combatTurns = useMemo((): CombatTurn[] => {
    return combat.initiative.map((init, index) => {
      const character = getCharacter(init.characterId)
      return {
        characterId: init.characterId,
        characterName: character?.name || init.characterName,
        initiative: init.initiative,
        hasActed: init.hasActed,
        isActive: index === combat.turn,
      }
    })
  }, [combat, getCharacter])

  const currentTurn = useMemo(() => {
    return combatTurns.find(turn => turn.isActive) || null
  }, [combatTurns])

  const isInCombat = useMemo(() => combat.isActive, [combat.isActive])

  // Session management
  const startSession = useCallback((name: string, characterIds: string[], campaignId?: string) => {
    storeStartSession(name, characterIds, campaignId)
  }, [storeStartSession])

  const endSession = useCallback(() => {
    storeEndSession()
  }, [storeEndSession])

  const updateSessionNotes = useCallback((notes: string) => {
    storeUpdateSessionNotes(notes)
  }, [storeUpdateSessionNotes])

  const awardXP = useCallback((amount: number) => {
    storeAwardXP(amount)
  }, [storeAwardXP])

  // Combat operations
  const startCombat = useCallback((characterIds: string[]) => {
    storeStartCombat(characterIds)
  }, [storeStartCombat])

  const endCombat = useCallback(() => {
    storeEndCombat()
  }, [storeEndCombat])

  const nextTurn = useCallback(() => {
    storeNextTurn()
  }, [storeNextTurn])

  const nextRound = useCallback(() => {
    storeNextRound()
  }, [storeNextRound])

  const setInitiative = useCallback((characterId: string, initiative: number) => {
    storeSetInitiative(characterId, initiative)
  }, [storeSetInitiative])

  const markCharacterActed = useCallback((characterId: string) => {
    storeMarkCharacterActed(characterId)
  }, [storeMarkCharacterActed])

  // Condition and modifier management
  const addSessionCondition = useCallback((characterId: string, condition: any) => {
    storeAddSessionCondition(characterId, condition)
  }, [storeAddSessionCondition])

  const removeSessionCondition = useCallback((characterId: string, conditionId: string) => {
    storeRemoveSessionCondition(characterId, conditionId)
  }, [storeRemoveSessionCondition])

  const addSessionModifier = useCallback((characterId: string, modifier: any) => {
    storeAddSessionModifier(characterId, modifier)
  }, [storeAddSessionModifier])

  const removeSessionModifier = useCallback((characterId: string, modifierId: string) => {
    storeRemoveSessionModifier(characterId, modifierId)
  }, [storeRemoveSessionModifier])

  const getActiveConditions = useCallback(() => {
    return sessionConditions.map((sc) => {
      const character = getCharacter(sc.characterId)
      return {
        characterId: sc.characterId,
        characterName: character?.name || 'Unknown Character',
        condition: sc.condition,
      }
    })
  }, [sessionConditions, getCharacter])

  // Time management
  const advanceTime = useCallback((timeType: 'turn' | 'scene' | 'encounter') => {
    storeAdvanceTime(timeType)
  }, [storeAdvanceTime])

  // Quick actions
  const quickStartCombat = useCallback(() => {
    if (!currentSession)
      return

    const availableCharacters = currentSession.characterIds.filter(id => getCharacter(id))
    if (availableCharacters.length > 0) {
      startCombat(availableCharacters)
    }
  }, [currentSession, getCharacter, startCombat])

  const quickEndSession = useCallback(() => {
    if (isInCombat) {
      endCombat()
    }
    endSession()
  }, [isInCombat, endCombat, endSession])

  const quickAwardXP = useCallback((amount: number) => {
    awardXP(amount)

    // Also award XP to all characters in the session
    if (currentSession) {
      currentSession.characterIds.forEach((characterId) => {
        const character = getCharacter(characterId)
        if (character) {
          // This would integrate with the character store's addXP method
          // For now, we'll just track it in the session
        }
      })
    }
  }, [awardXP, currentSession, getCharacter])

  return {
    // Current session
    currentSession,
    isSessionActive,
    sessionStats,

    // Session management
    startSession,
    endSession,
    updateSessionNotes,
    awardXP,

    // Roll history
    rollHistory,
    recentRolls,
    lastRoll,
    clearRollHistory: storeClearRollHistory,
    getRollsByCharacter,
    getRollStats,

    // Combat management
    combat,
    combatTurns,
    currentTurn,
    isInCombat,

    startCombat,
    endCombat,
    nextTurn,
    nextRound,
    setInitiative,
    markCharacterActed,

    // Condition and modifier management
    addSessionCondition,
    removeSessionCondition,
    addSessionModifier,
    removeSessionModifier,
    getActiveConditions,

    // Time management
    advanceTime,

    // Quick actions
    quickStartCombat,
    quickEndSession,
    quickAwardXP,
  }
}

/**
 * Simplified session hook for basic session operations
 */
export function useSimpleSession() {
  const {
    isSessionActive,
    startSession,
    endSession,
    lastRoll,
    isInCombat,
  } = useSession()

  return {
    isActive: isSessionActive,
    start: startSession,
    end: endSession,
    lastRoll,
    inCombat: isInCombat,
  }
}
