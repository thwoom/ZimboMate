import type { RollResult } from '../components/ui/RollResultsToast'
import { useCallback, useState } from 'react'

export interface UseRollResultsReturn {
  currentResult: RollResult | null
  showRollResult: (result: Omit<RollResult, 'id' | 'timestamp'>) => void
  clearResult: () => void
  rollHistory: RollResult[]
}

export function useRollResults(): UseRollResultsReturn {
  const [currentResult, setCurrentResult] = useState<RollResult | null>(null)
  const [rollHistory, setRollHistory] = useState<RollResult[]>([])

  const showRollResult = useCallback(
    (result: Omit<RollResult, 'id' | 'timestamp'>) => {
      const fullResult: RollResult = {
        ...result,
        id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      }

      setCurrentResult(fullResult)
      setRollHistory((prev) => [fullResult, ...prev.slice(0, 49)]) // Keep last 50 rolls
    },
    [],
  )

  const clearResult = useCallback(() => {
    setCurrentResult(null)
  }, [])

  return {
    currentResult,
    showRollResult,
    clearResult,
    rollHistory,
  }
}

// Helper functions for common roll types
export function createBasicRoll(
  dice: number[],
  modifier: number = 0,
): Omit<RollResult, 'id' | 'timestamp'> {
  const total = dice.reduce((sum, die) => sum + die, 0) + modifier
  let outcome: 'success' | 'partial' | 'failure' | undefined
  let description: string | undefined

  if (dice.length === 2) {
    // 2d6 roll
    if (total >= 10) {
      outcome = 'success'
      description = 'You succeed and choose from the list'
    } else if (total >= 7) {
      outcome = 'partial'
      description = 'You succeed, but with complications'
    } else {
      outcome = 'failure'
      description = 'The GM makes a move'
    }
  }

  return {
    type: 'basic',
    title: '2d6 Roll',
    dice,
    modifier,
    total,
    outcome,
    description,
  }
}

export function createAttributeRoll(
  attribute: string,
  dice: number[],
  modifier: number,
): Omit<RollResult, 'id' | 'timestamp'> {
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
    description = `Your ${attribute} check fails`
  }

  return {
    type: 'attribute',
    title: `${attribute.charAt(0).toUpperCase() + attribute.slice(1)} Roll`,
    dice,
    modifier,
    total,
    outcome,
    description,
  }
}

export function createDamageRoll(
  weaponName: string,
  dice: number[],
): Omit<RollResult, 'id' | 'timestamp'> {
  const total = dice.reduce((sum, die) => sum + die, 0)

  return {
    type: 'damage',
    title: `${weaponName} Damage`,
    dice,
    modifier: 0,
    total,
    description: `${total} damage dealt`,
  }
}

export function createMoveRoll(
  moveName: string,
  dice: number[],
  modifier: number,
): Omit<RollResult, 'id' | 'timestamp'> {
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
    description = `${moveName} fails. The GM makes a move.`
  }

  return {
    type: 'move',
    title: moveName,
    dice,
    modifier,
    total,
    outcome,
    description,
  }
}
