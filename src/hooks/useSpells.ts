/**
 * useSpells Hook for ZimboMate V2
 * Authentic Dungeon World spell preparation and casting system
 * No spell slots - uses DW's prepare/cast mechanics
 */

import { useCallback, useMemo, useState } from 'react'
import { allDWSpells, dwClericSpells, dwWizardSpells } from '../spellBookMockData'
import { useCharacter } from './useCharacter'
import { useDiceRoll } from './useDiceRoll'

export interface DWSpell {
  id: string
  name: string
  level: number
  class: 'wizard' | 'cleric'
  range: string
  ongoing: boolean
  description: string
  preparationStatus: 'available' | 'prepared' | 'cast'
}

export interface SpellCastingResult {
  success: boolean
  roll?: number
  modifier?: number
  total?: number
  result: 'success' | 'partial' | 'failure'
  description: string
  animationTrigger?: {
    type: 'success' | 'partial' | 'failure'
    spellLevel: number
    spellClass: string
    particleColor: string
  }
}

export interface UseDWSpellsReturn {
  // Character spell info
  spellcastingClass: 'wizard' | 'cleric' | null
  canCastSpells: boolean
  characterLevel: number

  // Spell library (DW system)
  allSpells: DWSpell[]
  availableSpells: DWSpell[]
  preparedSpells: DWSpell[]
  castSpells: DWSpell[] // Spells already cast today

  // DW spell preparation (no slots!)
  maxPreparedSpells: number
  preparedCount: number
  canPrepareMore: boolean

  // Actions
  prepareSpell: (spellId: string) => boolean
  unprepareSpell: (spellId: string) => boolean
  castSpell: (spellId: string) => Promise<SpellCastingResult>
  restoreSpells: () => void // Long rest equivalent

  // Character progression
  getSpellsForLevel: (level: number) => DWSpell[]
  canLearnSpell: (spellId: string) => boolean
}

export function useDWSpells(): UseDWSpellsReturn {
  const { character } = useCharacter()
  const { rollDice } = useDiceRoll()

  const [preparedSpellIds, setPreparedSpellIds] = useState<string[]>([
    'light',
    'magic-missile',
    'cure-light-wounds',
    'guidance',
  ])
  const [castSpellIds, setCastSpellIds] = useState<string[]>([])

  // Determine spellcasting class
  const spellcastingClass = useMemo((): 'wizard' | 'cleric' | null => {
    if (!character?.class)
      return null
    if (character.class.toLowerCase() === 'wizard')
      return 'wizard'
    if (character.class.toLowerCase() === 'cleric')
      return 'cleric'
    return null
  }, [character?.class])

  const canCastSpells = spellcastingClass !== null
  const characterLevel = character?.level || 1

  // DW spell system calculations - CORRECTED TO USE SPELL LEVELS NOT SPELL COUNT
  const maxPreparedSpellLevels = useMemo(() => {
    if (!spellcastingClass)
      return 0

    if (spellcastingClass === 'wizard') {
      // CORRECTED: Wizards prepare spell LEVELS totaling Level + 1 (not individual spells)
      return characterLevel + 1
    }
    else if (spellcastingClass === 'cleric') {
      // Clerics get access to all spells of their level, but limited daily casts
      // For simplicity, we'll say they can "prepare" Level + Wisdom modifier spell levels
      const wisModifier = character?.stats?.wisdom
        ? Math.floor((character.stats.wisdom - 10) / 2)
        : 0
      return characterLevel + Math.max(1, wisModifier)
    }

    return 0
  }, [spellcastingClass, characterLevel, character?.stats?.wisdom])

  // Calculate total spell levels currently prepared
  const preparedSpellLevels = useMemo(() => {
    return preparedSpellIds.reduce((total, spellId) => {
      const spell = availableSpells.find(s => s.id === spellId)
      return total + (spell?.level || 0)
    }, 0)
  }, [preparedSpellIds, availableSpells])

  // Get spells available to this class and level
  const availableSpells = useMemo(() => {
    if (!spellcastingClass)
      return []

    const classSpells = spellcastingClass === 'wizard' ? dwWizardSpells : dwClericSpells

    // Can access spells of current level and below
    return classSpells.filter(spell => spell.level <= characterLevel)
      .map(spell => ({
        ...spell,
        preparationStatus: preparedSpellIds.includes(spell.id)
          ? (castSpellIds.includes(spell.id) ? 'cast' : 'prepared')
          : 'available',
      })) as DWSpell[]
  }, [spellcastingClass, characterLevel, preparedSpellIds, castSpellIds])

  const preparedSpells = availableSpells.filter(spell =>
    preparedSpellIds.includes(spell.id) && !castSpellIds.includes(spell.id),
  )

  const castSpells = availableSpells.filter(spell =>
    castSpellIds.includes(spell.id),
  )

  const preparedCount = preparedSpellIds.length
  // CORRECTED: Check if we can prepare more based on spell LEVELS not spell COUNT
  const canPrepareSpell = (spellLevel: number) => {
    return preparedSpellLevels + spellLevel <= maxPreparedSpellLevels
  }

  // Spell actions - CORRECTED to use spell level validation
  const prepareSpell = useCallback((spellId: string): boolean => {
    const spell = availableSpells.find(s => s.id === spellId)
    if (!spell || preparedSpellIds.includes(spellId))
      return false

    // Check if we have enough spell level capacity
    if (!canPrepareSpell(spell.level))
      return false

    setPreparedSpellIds(prev => [...prev, spellId])
    return true
  }, [availableSpells, preparedSpellIds, canPrepareSpell])

  const unprepareSpell = useCallback((spellId: string): boolean => {
    if (!preparedSpellIds.includes(spellId))
      return false

    setPreparedSpellIds(prev => prev.filter(id => id !== spellId))
    // Also remove from cast if it was cast
    setCastSpellIds(prev => prev.filter(id => id !== spellId))
    return true
  }, [preparedSpellIds])

  const castSpell = useCallback(async (spellId: string): Promise<SpellCastingResult> => {
    const spell = availableSpells.find(s => s.id === spellId)

    if (!spell) {
      return {
        success: false,
        result: 'failure',
        description: 'Spell not found',
      }
    }

    if (!preparedSpellIds.includes(spellId)) {
      return {
        success: false,
        result: 'failure',
        description: 'Spell not prepared',
      }
    }

    if (castSpellIds.includes(spellId)) {
      return {
        success: false,
        result: 'failure',
        description: 'Spell already cast today',
      }
    }

    // DW uses Cast a Spell move for most spells (roll+INT for wizard, roll+WIS for cleric)
    const stat = spellcastingClass === 'wizard' ? 'intelligence' : 'wisdom'
    const statValue = character?.stats?.[stat as keyof typeof character.stats] || 10
    const modifier = Math.floor((statValue - 10) / 2)

    const rollResult = rollDice(`2d6+${modifier}`)
    const total = rollResult.total

    let result: 'success' | 'partial' | 'failure'
    let description: string
    let success: boolean

    if (total >= 10) {
      result = 'success'
      success = true
      description = `${spell.name} cast successfully! ${spell.description}`
    }
    else if (total >= 7) {
      result = 'partial'
      success = true
      description = `${spell.name} cast with complications. The GM will describe what happens.`
    }
    else {
      result = 'failure'
      success = false
      description = `${spell.name} fails to take hold. The GM makes a move.`
    }

    // Mark spell as cast (DW spells can usually only be cast once per day when prepared)
    setCastSpellIds(prev => [...prev, spellId])

    return {
      success,
      roll: rollResult.rolls[0],
      modifier,
      total,
      result,
      description,
      animationTrigger: {
        type: result,
        spellLevel: spell.level,
        spellClass: spell.class,
        particleColor: spell.class === 'wizard' ? '#8B5CF6' : '#F59E0B',
      },
    }
  }, [availableSpells, preparedSpellIds, castSpellIds, spellcastingClass, character, rollDice])

  const restoreSpells = useCallback(() => {
    // DW "Make Camp" equivalent - restore all cast spells
    setCastSpellIds([])
  }, [])

  const getSpellsForLevel = useCallback((level: number) => {
    return availableSpells.filter(spell => spell.level === level)
  }, [availableSpells])

  const canLearnSpell = useCallback((spellId: string): boolean => {
    const spell = allDWSpells.find(s => s.id === spellId)
    if (!spell)
      return false

    // Must be the right class and level
    if (spell.class !== spellcastingClass)
      return false
    if (spell.level > characterLevel)
      return false

    return true
  }, [spellcastingClass, characterLevel])

  return {
    spellcastingClass,
    canCastSpells,
    characterLevel,

    allSpells: allDWSpells as DWSpell[],
    availableSpells,
    preparedSpells,
    castSpells,

    // CORRECTED: Return spell level information instead of spell count
    maxPreparedSpellLevels,
    preparedSpellLevels,
    preparedCount, // Keep for backward compatibility
    canPrepareSpell, // New function that takes spell level

    prepareSpell,
    unprepareSpell,
    castSpell,
    restoreSpells,

    getSpellsForLevel,
    canLearnSpell,
  }
}

// Keep the old export name for backwards compatibility, but use the new DW system
export const useSpells = useDWSpells
