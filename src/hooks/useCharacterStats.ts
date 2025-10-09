/**
 * useCharacterStats Hook for ZimboMate V2
 * Manages character stats with dynamic modifiers and real-time calculations
 * Integrates base stats with conditions, equipment, and temporary modifiers
 */

import type { Attribute, Character } from '../models/Character'
import { useCallback, useMemo } from 'react'
import { characterStateService } from '../services/CharacterStateService'
import { useCharacter } from './useCharacter'

export interface StatWithModifiers {
  base: number
  modifier: number
  total: number
  breakdown: Array<{
    source: string
    value: number
    type: 'base' | 'condition' | 'equipment' | 'ongoing' | 'temporary'
  }>
}

export interface UseCharacterStatsReturn {
  // Character reference
  character: Character | undefined

  // Individual stats with modifiers
  strength: StatWithModifiers
  dexterity: StatWithModifiers
  constitution: StatWithModifiers
  intelligence: StatWithModifiers
  wisdom: StatWithModifiers
  charisma: StatWithModifiers

  // Computed values
  hitPoints: {
    current: number
    max: number
    percentage: number
  }

  load: {
    current: number
    max: number
    percentage: number
    status: 'light' | 'normal' | 'heavy' | 'overloaded'
  }

  // Stat operations
  updateBaseStat: (stat: keyof Attribute, value: number) => void
  getStatModifier: (stat: keyof Attribute) => number
  getStatTotal: (stat: keyof Attribute) => number

  // Modifier management
  getTotalModifierForStat: (stat: keyof Attribute) => number
  getModifierBreakdown: (stat: keyof Attribute) => Array<{
    source: string
    value: number
    type: string
  }>

  // Utility
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing character stats with dynamic modifiers
 * @param characterId - Character ID (optional, uses active character if not provided)
 */
export function useCharacterStats(
  characterId?: string,
): UseCharacterStatsReturn {
  const { character, updateCharacter, isLoading, error } =
    useCharacter(characterId)

  // Helper function to calculate stat with modifiers
  const calculateStatWithModifiers = useCallback(
    (statName: keyof Attribute, baseValue: number): StatWithModifiers => {
      if (!character) {
        return {
          base: baseValue,
          modifier: 0,
          total: baseValue,
          breakdown: [{ source: 'Base', value: baseValue, type: 'base' }],
        }
      }

      const breakdown: Array<{
        source: string
        value: number
        type: 'base' | 'condition' | 'equipment' | 'ongoing' | 'temporary'
      }> = [{ source: 'Base', value: baseValue, type: 'base' }]

      // Get modifiers from character state service
      const totalModifier = characterStateService.getTotalModifier(
        character.id,
        'stat',
        statName,
      )

      if (totalModifier !== 0) {
        breakdown.push({
          source: 'Modifiers',
          value: totalModifier,
          type: 'ongoing',
        })
      }

      const total = baseValue + totalModifier

      return {
        base: baseValue,
        modifier: totalModifier,
        total,
        breakdown,
      }
    },
    [character],
  )

  // Individual stats with modifiers
  const strength = useMemo(() => {
    return calculateStatWithModifiers(
      'strength',
      character?.attributes.strength || 0,
    )
  }, [character?.attributes.strength, calculateStatWithModifiers])

  const dexterity = useMemo(() => {
    return calculateStatWithModifiers(
      'dexterity',
      character?.attributes.dexterity || 0,
    )
  }, [character?.attributes.dexterity, calculateStatWithModifiers])

  const constitution = useMemo(() => {
    return calculateStatWithModifiers(
      'constitution',
      character?.attributes.constitution || 0,
    )
  }, [character?.attributes.constitution, calculateStatWithModifiers])

  const intelligence = useMemo(() => {
    return calculateStatWithModifiers(
      'intelligence',
      character?.attributes.intelligence || 0,
    )
  }, [character?.attributes.intelligence, calculateStatWithModifiers])

  const wisdom = useMemo(() => {
    return calculateStatWithModifiers(
      'wisdom',
      character?.attributes.wisdom || 0,
    )
  }, [character?.attributes.wisdom, calculateStatWithModifiers])

  const charisma = useMemo(() => {
    return calculateStatWithModifiers(
      'charisma',
      character?.attributes.charisma || 0,
    )
  }, [character?.attributes.charisma, calculateStatWithModifiers])

  // Computed values
  const hitPoints = useMemo(() => {
    if (!character) {
      return { current: 0, max: 0, percentage: 0 }
    }

    const current = character.hp.current
    const max = character.hp.max
    const percentage = max > 0 ? (current / max) * 100 : 0

    return { current, max, percentage }
  }, [character])

  const load = useMemo(() => {
    if (!character) {
      return { current: 0, max: 0, percentage: 0, status: 'light' as const }
    }

    const current = character.load.current
    const max = character.load.max
    const percentage = max > 0 ? (current / max) * 100 : 0

    let status: 'light' | 'normal' | 'heavy' | 'overloaded'
    if (percentage <= 33) status = 'light'
    else if (percentage <= 66) status = 'normal'
    else if (percentage <= 100) status = 'heavy'
    else status = 'overloaded'

    return { current, max, percentage, status }
  }, [character])

  // Stat operations
  const updateBaseStat = useCallback(
    (stat: keyof Attribute, value: number) => {
      if (!character) return

      updateCharacter({
        attributes: {
          ...character.attributes,
          [stat]: value,
        },
      })
    },
    [character, updateCharacter],
  )

  const getStatModifier = useCallback(
    (stat: keyof Attribute): number => {
      const statValue = character?.attributes[stat] || 0
      return Math.floor((statValue - 10) / 2)
    },
    [character?.attributes],
  )

  const getStatTotal = useCallback(
    (stat: keyof Attribute): number => {
      switch (stat) {
        case 'strength':
          return strength.total
        case 'dexterity':
          return dexterity.total
        case 'constitution':
          return constitution.total
        case 'intelligence':
          return intelligence.total
        case 'wisdom':
          return wisdom.total
        case 'charisma':
          return charisma.total
        default:
          return 0
      }
    },
    [strength, dexterity, constitution, intelligence, wisdom, charisma],
  )

  // Modifier management
  const getTotalModifierForStat = useCallback(
    (stat: keyof Attribute): number => {
      if (!character) return 0
      return characterStateService.getTotalModifier(character.id, 'stat', stat)
    },
    [character],
  )

  const getModifierBreakdown = useCallback(
    (stat: keyof Attribute) => {
      switch (stat) {
        case 'strength':
          return strength.breakdown
        case 'dexterity':
          return dexterity.breakdown
        case 'constitution':
          return constitution.breakdown
        case 'intelligence':
          return intelligence.breakdown
        case 'wisdom':
          return wisdom.breakdown
        case 'charisma':
          return charisma.breakdown
        default:
          return []
      }
    },
    [strength, dexterity, constitution, intelligence, wisdom, charisma],
  )

  return {
    // Character reference
    character,

    // Individual stats with modifiers
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,

    // Computed values
    hitPoints,
    load,

    // Stat operations
    updateBaseStat,
    getStatModifier,
    getStatTotal,

    // Modifier management
    getTotalModifierForStat,
    getModifierBreakdown,

    // Utility
    isLoading,
    error,
  }
}

/**
 * Hook for getting just the stat modifiers (for dice rolling)
 * Optimized for performance when only modifiers are needed
 */
export function useStatModifiers(characterId?: string) {
  const { character } = useCharacter(characterId)

  const modifiers = useMemo(() => {
    if (!character) {
      return {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      }
    }

    return {
      strength: Math.floor((character.attributes.strength - 10) / 2),
      dexterity: Math.floor((character.attributes.dexterity - 10) / 2),
      constitution: Math.floor((character.attributes.constitution - 10) / 2),
      intelligence: Math.floor((character.attributes.intelligence - 10) / 2),
      wisdom: Math.floor((character.attributes.wisdom - 10) / 2),
      charisma: Math.floor((character.attributes.charisma - 10) / 2),
    }
  }, [character])

  return modifiers
}
