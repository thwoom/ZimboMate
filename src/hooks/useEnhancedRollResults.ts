import { useState, useCallback, useEffect } from 'react'
import type { RollResult } from '../components/ui/RollResultsToast'
import { gameLogicService, type RollConsequence } from '../services/GameLogicService'
import { useCharacterStore } from '../stores/characterStore'

export interface EnhancedRollResult extends RollResult {
  consequences: RollConsequence[]
  characterId?: string
  moveContext?: {
    moveId: string
    moveName: string
    targetId?: string
  }
}

export interface UseEnhancedRollResultsReturn {
  currentResult: EnhancedRollResult | null
  showRollResult: (result: Omit<RollResult, 'id' | 'timestamp'>, characterId?: string, moveContext?: any) => void
  clearResult: () => void
  rollHistory: EnhancedRollResult[]
  applyConsequences: (rollId: string, selectedConsequences?: string[]) => void
  getPendingConsequences: (rollId: string) => RollConsequence[]
}

export const useEnhancedRollResults = (): UseEnhancedRollResultsReturn => {
  const [currentResult, setCurrentResult] = useState<EnhancedRollResult | null>(null)
  const [rollHistory, setRollHistory] = useState<EnhancedRollResult[]>([])
  const { getActiveCharacter } = useCharacterStore()

  const showRollResult = useCallback((
    result: Omit<RollResult, 'id' | 'timestamp'>,
    characterId?: string,
    moveContext?: {
      moveId: string
      moveName: string
      targetId?: string
      combatContext?: boolean
    }
  ) => {
    const activeCharacter = getActiveCharacter()
    const effectiveCharacterId = characterId || activeCharacter?.id

    const fullResult: RollResult = {
      ...result,
      id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    // Process consequences if we have a character
    let consequences: RollConsequence[] = []
    if (effectiveCharacterId) {
      consequences = gameLogicService.processRollResult(
        fullResult,
        effectiveCharacterId,
        moveContext
      )

      // Auto-apply automatic consequences
      const automaticConsequences = consequences
        .filter(c => c.automatic)
        .map(c => c.id)
      
      if (automaticConsequences.length > 0) {
        setTimeout(() => {
          gameLogicService.applyConsequences(fullResult.id, automaticConsequences)
        }, 1000) // Delay to show the roll result first
      }
    }

    const enhancedResult: EnhancedRollResult = {
      ...fullResult,
      consequences,
      characterId: effectiveCharacterId,
      moveContext
    }

    setCurrentResult(enhancedResult)
    setRollHistory(prev => [enhancedResult, ...prev.slice(0, 49)]) // Keep last 50 rolls
  }, [getActiveCharacter])

  const clearResult = useCallback(() => {
    setCurrentResult(null)
  }, [])

  const applyConsequences = useCallback((rollId: string, selectedConsequences?: string[]) => {
    gameLogicService.applyConsequences(rollId, selectedConsequences)
    
    // Update the roll in history to mark consequences as applied
    setRollHistory(prev => prev.map(roll => {
      if (roll.id === rollId) {
        return {
          ...roll,
          consequences: roll.consequences.map(c => ({
            ...c,
            applied: selectedConsequences?.includes(c.id) ? true : c.applied
          }))
        }
      }
      return roll
    }))

    // Update current result if it matches
    setCurrentResult(prev => {
      if (prev?.id === rollId) {
        return {
          ...prev,
          consequences: prev.consequences.map(c => ({
            ...c,
            applied: selectedConsequences?.includes(c.id) ? true : c.applied
          }))
        }
      }
      return prev
    })
  }, [])

  const getPendingConsequences = useCallback((rollId: string) => {
    return gameLogicService.getPendingConsequences(rollId)
  }, [])

  return {
    currentResult,
    showRollResult,
    clearResult,
    rollHistory,
    applyConsequences,
    getPendingConsequences
  }
}

// Helper functions for common roll types with enhanced consequences
export const createEnhancedBasicRoll = (
  dice: number[], 
  modifier: number = 0
): Omit<RollResult, 'id' | 'timestamp'> => {
  const total = dice.reduce((sum, die) => sum + die, 0) + modifier
  let outcome: 'success' | 'partial' | 'failure' | undefined
  let description: string | undefined

  if (dice.length === 2) { // 2d6 roll
    if (total >= 10) {
      outcome = 'success'
      description = 'You succeed and choose from the list'
    } else if (total >= 7) {
      outcome = 'partial'
      description = 'You succeed, but with complications'
    } else {
      outcome = 'failure'
      description = 'The GM makes a move. Mark XP.'
    }
  }

  return {
    type: 'basic',
    title: '2d6 Roll',
    dice,
    modifier,
    total,
    outcome,
    description
  }
}

export const createEnhancedAttributeRoll = (
  attribute: string, 
  dice: number[], 
  modifier: number
): Omit<RollResult, 'id' | 'timestamp'> => {
  const total = dice.reduce((sum, die) => sum + die, 0) + modifier
  let outcome: 'success' | 'partial' | 'failure' | undefined
  let description: string | undefined

  if (total >= 10) {
    outcome = 'success'
    description = `Your ${attribute} check succeeds!`
  } else if (total >= 7) {
    outcome = 'partial'
    description = `Your ${attribute} check partially succeeds`
  } else {
    outcome = 'failure'
    description = `Your ${attribute} check fails. Mark XP.`
  }

  return {
    type: 'attribute',
    title: `${attribute.charAt(0).toUpperCase() + attribute.slice(1)} Roll`,
    dice,
    modifier,
    total,
    outcome,
    description
  }
}

export const createEnhancedDamageRoll = (
  weaponName: string,
  dice: number[]
): Omit<RollResult, 'id' | 'timestamp'> => {
  const total = dice.reduce((sum, die) => sum + die, 0)
  
  return {
    type: 'damage',
    title: `${weaponName} Damage`,
    dice,
    modifier: 0,
    total,
    description: `${total} damage dealt`
  }
}

export const createEnhancedMoveRoll = (
  moveName: string,
  dice: number[],
  modifier: number,
  moveId?: string
): Omit<RollResult, 'id' | 'timestamp'> => {
  const total = dice.reduce((sum, die) => sum + die, 0) + modifier
  let outcome: 'success' | 'partial' | 'failure' | undefined
  let description: string | undefined

  if (total >= 10) {
    outcome = 'success'
    description = `${moveName} succeeds! Choose from the full list of options.`
  } else if (total >= 7) {
    outcome = 'partial'
    description = `${moveName} partially succeeds. The GM will tell you what happens.`
  } else {
    outcome = 'failure'
    description = `${moveName} fails. The GM makes a move. Mark XP.`
  }

  return {
    type: 'move',
    title: moveName,
    dice,
    modifier,
    total,
    outcome,
    description
  }
}