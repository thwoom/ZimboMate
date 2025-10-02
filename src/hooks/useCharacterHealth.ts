/**
 * useCharacterHealth Hook for ZimboMate V2
 * Manages character HP, damage, healing with animations and death saves
 * Integrates with character state and triggers particle effects
 */

import type { Character } from '../models/Character'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { characterStateService } from '../services/CharacterStateService'
import { useCharacter } from './useCharacter'

export interface HealthStatus {
  current: number
  max: number
  percentage: number
  status: 'healthy' | 'wounded' | 'critical' | 'unconscious' | 'dead'
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'gray'
}

export interface DamageResult {
  previousHP: number
  newHP: number
  damageDealt: number
  isUnconscious: boolean
  isDead: boolean
  triggeredDeathSave: boolean
}

export interface HealingResult {
  previousHP: number
  newHP: number
  healingDone: number
  wasUnconscious: boolean
  isFullyHealed: boolean
}

export interface UseCharacterHealthReturn {
  // Health status
  health: HealthStatus
  isUnconscious: boolean
  isDead: boolean
  isFullHealth: boolean

  // Health operations
  updateHP: (newHP: number) => void
  heal: (amount: number, source?: string) => HealingResult
  damage: (amount: number, source?: string) => DamageResult
  setToFullHealth: () => void
  setToUnconscious: () => void

  // Death saves (Dungeon World style)
  deathSaves: {
    successes: number
    failures: number
    isStabilized: boolean
    needsDeathSave: boolean
  }
  rollDeathSave: () => {
    roll: number
    result: 'success' | 'failure' | 'critical_success'
    isStabilized: boolean
    isDead: boolean
  }

  // Healing over time
  startRegeneration: (amountPerTurn: number, duration: number) => void
  stopRegeneration: () => void
  isRegenerating: boolean

  // Animation triggers
  lastDamage: { amount: number, timestamp: number } | null
  lastHealing: { amount: number, timestamp: number } | null

  // Utility
  character: Character | undefined
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing character health with advanced features
 * @param characterId - Character ID (optional, uses active character if not provided)
 */
export function useCharacterHealth(characterId?: string): UseCharacterHealthReturn {
  const {
    character,
    updateHP: storeUpdateHP,
    healCharacter: storeHealCharacter,
    damageCharacter: storeDamageCharacter,
    isLoading,
    error,
  } = useCharacter(characterId)

  // Local state for death saves and animations
  const [deathSaveSuccesses, setDeathSaveSuccesses] = useState(0)
  const [deathSaveFailures, setDeathSaveFailures] = useState(0)
  const [lastDamage, setLastDamage] = useState<{ amount: number, timestamp: number } | null>(null)
  const [lastHealing, setLastHealing] = useState<{ amount: number, timestamp: number } | null>(null)
  const [regenerationTimer, setRegenerationTimer] = useState<NodeJS.Timeout | null>(null)

  // Health status calculation
  const health = useMemo((): HealthStatus => {
    if (!character) {
      return {
        current: 0,
        max: 0,
        percentage: 0,
        status: 'dead',
        statusColor: 'gray',
      }
    }

    const current = character.hp.current
    const max = character.hp.max
    const percentage = max > 0 ? (current / max) * 100 : 0

    let status: HealthStatus['status']
    let statusColor: HealthStatus['statusColor']

    if (current <= 0) {
      status = 'unconscious'
      statusColor = 'red'
    }
    else if (percentage <= 25) {
      status = 'critical'
      statusColor = 'red'
    }
    else if (percentage <= 50) {
      status = 'wounded'
      statusColor = 'orange'
    }
    else if (percentage <= 75) {
      status = 'wounded'
      statusColor = 'yellow'
    }
    else {
      status = 'healthy'
      statusColor = 'green'
    }

    return {
      current,
      max,
      percentage,
      status,
      statusColor,
    }
  }, [character?.hp])

  // Computed health states
  const isUnconscious = useMemo(() => health.current <= 0, [health.current])
  const isDead = useMemo(() => deathSaveFailures >= 3, [deathSaveFailures])
  const isFullHealth = useMemo(() => health.current >= health.max, [health.current, health.max])

  // Death saves state
  const deathSaves = useMemo(() => ({
    successes: deathSaveSuccesses,
    failures: deathSaveFailures,
    isStabilized: deathSaveSuccesses >= 3,
    needsDeathSave: isUnconscious && !isDead && deathSaveSuccesses < 3,
  }), [deathSaveSuccesses, deathSaveFailures, isUnconscious, isDead])

  // Reset death saves when character is healed above 0
  useEffect(() => {
    if (health.current > 0) {
      setDeathSaveSuccesses(0)
      setDeathSaveFailures(0)
    }
  }, [health.current])

  // Health operations
  const updateHP = useCallback((newHP: number) => {
    if (!character)
      return
    storeUpdateHP(newHP)
  }, [character, storeUpdateHP])

  const heal = useCallback((amount: number, source = 'Unknown'): HealingResult => {
    if (!character) {
      return {
        previousHP: 0,
        newHP: 0,
        healingDone: 0,
        wasUnconscious: false,
        isFullyHealed: false,
      }
    }

    const previousHP = character.hp.current
    const wasUnconscious = previousHP <= 0
    const maxPossibleHealing = character.hp.max - previousHP
    const actualHealing = Math.min(amount, maxPossibleHealing)
    const newHP = previousHP + actualHealing

    storeHealCharacter(actualHealing)

    // Trigger healing animation
    setLastHealing({ amount: actualHealing, timestamp: Date.now() })

    // Add healing to character state service as a temporary effect
    if (character && actualHealing > 0) {
      characterStateService.setResource(character.id, {
        id: `healing-${Date.now()}`,
        name: `Healing from ${source}`,
        current: actualHealing,
        max: actualHealing,
        type: 'custom',
        source,
        refreshOn: 'manual',
      })
    }

    return {
      previousHP,
      newHP,
      healingDone: actualHealing,
      wasUnconscious,
      isFullyHealed: newHP >= character.hp.max,
    }
  }, [character, storeHealCharacter])

  const damage = useCallback((amount: number, source = 'Unknown'): DamageResult => {
    if (!character) {
      return {
        previousHP: 0,
        newHP: 0,
        damageDealt: 0,
        isUnconscious: false,
        isDead: false,
        triggeredDeathSave: false,
      }
    }

    const previousHP = character.hp.current
    const actualDamage = Math.min(amount, previousHP)
    const newHP = previousHP - actualDamage

    storeDamageCharacter(actualDamage)

    // Trigger damage animation
    setLastDamage({ amount: actualDamage, timestamp: Date.now() })

    const isNowUnconscious = newHP <= 0
    const triggeredDeathSave = isNowUnconscious && previousHP > 0

    return {
      previousHP,
      newHP,
      damageDealt: actualDamage,
      isUnconscious: isNowUnconscious,
      isDead: false, // Death is determined by death saves, not HP
      triggeredDeathSave,
    }
  }, [character, storeDamageCharacter])

  const setToFullHealth = useCallback(() => {
    if (!character)
      return
    updateHP(character.hp.max)
  }, [character, updateHP])

  const setToUnconscious = useCallback(() => {
    updateHP(0)
  }, [updateHP])

  // Death save mechanics
  const rollDeathSave = useCallback(() => {
    const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2 // 2d6

    let result: 'success' | 'failure' | 'critical_success'
    let newSuccesses = deathSaveSuccesses
    let newFailures = deathSaveFailures

    if (roll >= 10) {
      result = 'success'
      newSuccesses++
    }
    else if (roll >= 12) {
      result = 'critical_success'
      newSuccesses = 3 // Immediately stabilized
    }
    else {
      result = 'failure'
      newFailures++
    }

    setDeathSaveSuccesses(newSuccesses)
    setDeathSaveFailures(newFailures)

    const isStabilized = newSuccesses >= 3
    const isDead = newFailures >= 3

    return {
      roll,
      result,
      isStabilized,
      isDead,
    }
  }, [deathSaveSuccesses, deathSaveFailures])

  // Regeneration mechanics
  const startRegeneration = useCallback((amountPerTurn: number, duration: number) => {
    if (regenerationTimer) {
      clearInterval(regenerationTimer)
    }

    let turnsRemaining = duration
    const timer = setInterval(() => {
      if (turnsRemaining <= 0 || !character) {
        clearInterval(timer)
        setRegenerationTimer(null)
        return
      }

      heal(amountPerTurn, 'Regeneration')
      turnsRemaining--
    }, 6000) // 6 seconds per "turn" for demo purposes

    setRegenerationTimer(timer)
  }, [regenerationTimer, character, heal])

  const stopRegeneration = useCallback(() => {
    if (regenerationTimer) {
      clearInterval(regenerationTimer)
      setRegenerationTimer(null)
    }
  }, [regenerationTimer])

  const isRegenerating = regenerationTimer !== null

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (regenerationTimer) {
        clearInterval(regenerationTimer)
      }
    }
  }, [regenerationTimer])

  return {
    // Health status
    health,
    isUnconscious,
    isDead,
    isFullHealth,

    // Health operations
    updateHP,
    heal,
    damage,
    setToFullHealth,
    setToUnconscious,

    // Death saves
    deathSaves,
    rollDeathSave,

    // Healing over time
    startRegeneration,
    stopRegeneration,
    isRegenerating,

    // Animation triggers
    lastDamage,
    lastHealing,

    // Utility
    character,
    isLoading,
    error,
  }
}

/**
 * Simplified hook for basic health operations
 * Use when you only need basic HP management without advanced features
 */
export function useSimpleHealth(characterId?: string) {
  const { health, heal, damage, updateHP } = useCharacterHealth(characterId)

  return {
    hp: health.current,
    maxHP: health.max,
    percentage: health.percentage,
    status: health.status,
    heal,
    damage,
    updateHP,
  }
}
