/**
 * useDiceRoll Hook for ZimboMate V2
 * Enhanced dice rolling with move integration, modifiers, and particle effects
 * Integrates DiceRollingService with character stats and session tracking
 */

import type { Attribute } from '../models/Character'
import type { DiceRoll, RollOptions } from '../services/DiceRollingService'
import { useCallback, useMemo, useState } from 'react'
import { characterStateService } from '../services/CharacterStateService'
import { diceRollingService } from '../services/DiceRollingService'
import { useSessionStore } from '../stores/sessionStore'
import { useActiveCharacter } from './useActiveCharacter'
import { useCharacterStats } from './useCharacterStats'

export interface RollRequest {
  // Basic roll parameters
  stat?: keyof Attribute
  modifier?: number
  moveId?: string
  moveName?: string

  // Roll context
  description?: string
  difficulty?: number
  advantage?: boolean
  disadvantage?: boolean

  // Character context
  characterId?: string
}

export interface RollResult extends DiceRoll {
  // Enhanced result information
  wasSuccess: boolean
  wasPartialSuccess: boolean
  wasFailure: boolean
  outcomeDescription: string

  // Animation triggers
  shouldTriggerParticles: boolean
  particleType: 'success' | 'partial' | 'failure'
  particleColor: string
}

export interface UseDiceRollReturn {
  // Roll execution
  roll: (request: RollRequest) => Promise<RollResult>
  rollWithStat: (stat: keyof Attribute, modifier?: number, description?: string) => Promise<RollResult>
  rollBasic: (modifier?: number, description?: string) => Promise<RollResult>

  // Quick roll shortcuts
  rollStrength: (modifier?: number) => Promise<RollResult>
  rollDexterity: (modifier?: number) => Promise<RollResult>
  rollConstitution: (modifier?: number) => Promise<RollResult>
  rollIntelligence: (modifier?: number) => Promise<RollResult>
  rollWisdom: (modifier?: number) => Promise<RollResult>
  rollCharisma: (modifier?: number) => Promise<RollResult>

  // Roll history
  recentRolls: DiceRoll[]
  lastRoll: DiceRoll | null
  clearHistory: () => void

  // Roll state
  isRolling: boolean
  canRoll: boolean

  // Character context
  activeCharacter: any
  availableModifiers: Array<{
    id: string
    name: string
    value: number
    source: string
    type: 'ongoing' | 'forward'
  }>

  // Utility
  getOutcomeDescription: (total: number) => string
  getParticleType: (result: string) => 'success' | 'partial' | 'failure'
}

/**
 * Enhanced dice rolling hook with full game integration
 */
export function useDiceRoll(): UseDiceRollReturn {
  const { activeCharacter } = useActiveCharacter()
  const { getStatModifier, getTotalModifierForStat } = useCharacterStats(activeCharacter?.id)
  const { addRoll, getRecentRolls, clearRollHistory } = useSessionStore()

  const [isRolling, setIsRolling] = useState(false)

  // Get recent rolls
  const recentRolls = useMemo(() => getRecentRolls(10), [getRecentRolls])
  const lastRoll = useMemo(() => recentRolls[0] || null, [recentRolls])

  // Check if character can roll
  const canRoll = useMemo(() => {
    return activeCharacter !== undefined && !isRolling
  }, [activeCharacter, isRolling])

  // Get available modifiers for the active character
  const availableModifiers = useMemo(() => {
    if (!activeCharacter)
      return []

    const modifiers: Array<{
      id: string
      name: string
      value: number
      source: string
      type: 'ongoing' | 'forward'
    }> = []

    // Get forward modifiers
    const forwardMods = characterStateService.getAvailableForwardModifiers(
      activeCharacter.id,
      'next_roll',
    )

    forwardMods.forEach((mod) => {
      modifiers.push({
        id: mod.id,
        name: mod.name,
        value: mod.value,
        source: mod.source,
        type: 'forward',
      })
    })

    return modifiers
  }, [activeCharacter])

  // Main roll function
  const roll = useCallback(async (request: RollRequest): Promise<RollResult> => {
    if (!canRoll || !activeCharacter) {
      throw new Error('Cannot roll: no active character or already rolling')
    }

    setIsRolling(true)

    try {
      // Calculate total modifier
      let totalModifier = request.modifier || 0

      // Add stat modifier if specified
      if (request.stat) {
        const statMod = getStatModifier(request.stat)
        const additionalMod = getTotalModifierForStat(request.stat)
        totalModifier += statMod + additionalMod
      }

      // Apply available forward modifiers
      const characterId = request.characterId || activeCharacter.id
      const forwardMods = characterStateService.getAvailableForwardModifiers(
        characterId,
        'next_roll',
      )

      forwardMods.forEach((mod) => {
        totalModifier += mod.value
        characterStateService.useForwardModifier(characterId, mod.id)
      })

      // Create roll options
      const rollOptions: RollOptions = {
        description: request.description || 'Roll',
        characterId,
        moveId: request.moveId,
        moveName: request.moveName,
      }

      // Execute the roll
      const rollResult = await diceRollingService.rollDice(
        '2d6',
        { flat: totalModifier },
        rollOptions,
      )

      // Add to session history
      addRoll(rollResult)

      // Clean up used forward modifiers
      characterStateService.cleanupForwardModifiers(characterId)

      // Create enhanced result
      const enhancedResult: RollResult = {
        ...rollResult,
        wasSuccess: rollResult.result === 'success',
        wasPartialSuccess: rollResult.result === 'partial',
        wasFailure: rollResult.result === 'failure',
        outcomeDescription: getOutcomeDescription(rollResult.total),
        shouldTriggerParticles: true,
        particleType: getParticleType(rollResult.result),
        particleColor: getParticleColor(rollResult.result),
      }

      return enhancedResult
    }
    finally {
      setIsRolling(false)
    }
  }, [canRoll, activeCharacter, getStatModifier, getTotalModifierForStat, addRoll])

  // Roll with specific stat
  const rollWithStat = useCallback(async (
    stat: keyof Attribute,
    modifier = 0,
    description?: string,
  ): Promise<RollResult> => {
    return roll({
      stat,
      modifier,
      description: description || `${stat.charAt(0).toUpperCase() + stat.slice(1)} roll`,
    })
  }, [roll])

  // Basic roll without stat
  const rollBasic = useCallback(async (
    modifier = 0,
    description = 'Basic roll',
  ): Promise<RollResult> => {
    return roll({ modifier, description })
  }, [roll])

  // Quick stat roll shortcuts
  const rollStrength = useCallback((modifier = 0) =>
    rollWithStat('strength', modifier), [rollWithStat])

  const rollDexterity = useCallback((modifier = 0) =>
    rollWithStat('dexterity', modifier), [rollWithStat])

  const rollConstitution = useCallback((modifier = 0) =>
    rollWithStat('constitution', modifier), [rollWithStat])

  const rollIntelligence = useCallback((modifier = 0) =>
    rollWithStat('intelligence', modifier), [rollWithStat])

  const rollWisdom = useCallback((modifier = 0) =>
    rollWithStat('wisdom', modifier), [rollWithStat])

  const rollCharisma = useCallback((modifier = 0) =>
    rollWithStat('charisma', modifier), [rollWithStat])

  // Utility functions
  const getOutcomeDescription = useCallback((total: number): string => {
    if (total >= 10)
      return 'Success! You do it.'
    if (total >= 7)
      return 'Partial success. You do it, but...'
    return 'Failure. The GM makes a move.'
  }, [])

  const getParticleType = useCallback((result: string): 'success' | 'partial' | 'failure' => {
    switch (result) {
      case 'success': return 'success'
      case 'partial': return 'partial'
      default: return 'failure'
    }
  }, [])

  const getParticleColor = (result: string): string => {
    switch (result) {
      case 'success': return '#10B981' // Green
      case 'partial': return '#F59E0B' // Amber
      default: return '#EF4444' // Red
    }
  }

  return {
    // Roll execution
    roll,
    rollWithStat,
    rollBasic,

    // Quick roll shortcuts
    rollStrength,
    rollDexterity,
    rollConstitution,
    rollIntelligence,
    rollWisdom,
    rollCharisma,

    // Roll history
    recentRolls,
    lastRoll,
    clearHistory: clearRollHistory,

    // Roll state
    isRolling,
    canRoll,

    // Character context
    activeCharacter,
    availableModifiers,

    // Utility
    getOutcomeDescription,
    getParticleType,
  }
}

/**
 * Simplified dice rolling hook for basic use cases
 */
export function useSimpleDiceRoll() {
  const { rollBasic, rollWithStat, lastRoll, isRolling } = useDiceRoll()

  return {
    roll: rollBasic,
    rollStat: rollWithStat,
    lastRoll,
    isRolling,
  }
}
