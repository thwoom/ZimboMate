/**
 * Spell Casting Service for ZimboMate V2
 * Utilities for Dungeon World spell preparation and casting (official rules)
 * Modernized from V1 with improved TypeScript patterns and V2 model integration
 */

import type { Attribute, Character, CharacterClass } from '../models/Character'
import type { DiceRoll, RollModifiers, RollOptions } from './DiceRollingService'
import { getAttributeModifier } from '../models/Character'
import { diceRollingService } from './DiceRollingService'

// Spell interface for the service
export interface ServiceSpell {
  id: string
  name: string
  level: number
  description: string
  tags?: string[]
  range?: string
  duration?: string
  requiresClass?: CharacterClass
}

// Spell classes that can cast spells
export type SpellClass = 'Wizard' | 'Cleric' | 'Immolator'

// Spell casting result tiers
export type CastingTier = '10+' | '7-9' | '6-'

// Spell casting result
export interface SpellCastingResult {
  roll: DiceRoll
  updated: Character
  tier: CastingTier
  spellLost?: boolean
  consequences?: string[]
}

// 7-9 consequence options
export type SevenToNineConsequence = 'unwelcome-attention' | 'forget' | 'strain'

/**
 * Utilities for Dungeon World spell preparation and casting (official rules)
 */
export class SpellCastingService {
  constructor(private dice = diceRollingService) {}

  /**
   * Which stat is used to cast spells for this character
   */
  getSpellcastingStat(character: Character): keyof Attribute | undefined {
    if (character.class === 'Wizard') return 'INT'
    if (character.class === 'Cleric') return 'WIS'
    if (character.class === 'Immolator') return 'INT' // Immolator uses INT
    return undefined
  }

  /**
   * Check if character can cast spells
   */
  canCastSpells(character: Character): boolean {
    return this.getSpellcastingStat(character) !== undefined
  }

  /**
   * Cantrip / Rote check (level 0)
   */
  isCantrip(spell: ServiceSpell): boolean {
    return spell.level === 0
  }

  /**
   * Official preparation budget: Level + 1 total spell levels; cantrips / rotes don't count
   */
  getPreparationBudget(character: Character): number {
    return character.level + 1
  }

  /**
   * Sum of non-cantrip spell levels in list
   */
  calculatePreparedLevels(spells: ServiceSpell[]): number {
    return spells.reduce((sum, s) => sum + (this.isCantrip(s) ? 0 : s.level), 0)
  }

  /**
   * Check if spell list fits within preparation budget
   */
  canPrepareSpells(character: Character, spells: ServiceSpell[]): {
    canPrepare: boolean
    totalLevels: number
    budget: number
    overflow: number
  } {
    const totalLevels = this.calculatePreparedLevels(spells)
    const budget = this.getPreparationBudget(character)
    const overflow = Math.max(0, totalLevels - budget)

    return {
      canPrepare: overflow === 0,
      totalLevels,
      budget,
      overflow,
    }
  }

  /**
   * Replace prepared spells for Wizard / Cleric according to budget rules
   */
  prepareSpells(character: Character, selectedSpells: ServiceSpell[]): Character {
    if (!this.canCastSpells(character)) {
      throw new Error('This class does not cast spells.')
    }

    const preparationCheck = this.canPrepareSpells(character, selectedSpells)
    if (!preparationCheck.canPrepare) {
      throw new Error(`Preparation exceeds budget by ${preparationCheck.overflow} spell levels`)
    }

    const updated: Character = {
      ...character,
      preparedSpells: selectedSpells.map(s => s.id),
      // Remove spellcasting strain on new preparation / commune
      conditions: character.conditions.filter(c => c !== 'spellcasting-strain'),
      updatedAt: new Date(),
    }

    return updated
  }

  /**
   * Cast a prepared spell following DW rules
   */
  castPreparedSpell(
    character: Character, 
    spell: ServiceSpell, 
    options?: { 
      advantage?: boolean
      disadvantage?: boolean
      description?: string
      customModifier?: number
    }
  ): SpellCastingResult {
    const statKey = this.getSpellcastingStat(character)
    if (!statKey) {
      throw new Error('This class does not cast spells.')
    }

    // Verify the spell is prepared (DW requires prepared / granted spells)
    const prepared = character.preparedSpells || []
    if (!prepared.includes(spell.id) && !this.isCantrip(spell)) {
      throw new Error('Spell is not prepared.')
    }

    // Compute modifiers: stat + ongoing penalties specific to casting
    const statMod = getAttributeModifier(character.attributes[statKey])
    const hasStrain = character.conditions.includes('spellcasting-strain')
    const ongoingPenalty = hasStrain ? -1 : 0

    const modifiers: RollModifiers = {
      stat: statMod,
      ongoing: ongoingPenalty,
      forward: 0,
      other: options?.customModifier || 0,
    }

    const rollOptions: RollOptions = {
      character,
      description: options?.description ?? `Cast ${spell.name}`,
      advantage: options?.advantage,
      disadvantage: options?.disadvantage,
    }

    const roll = this.dice.roll2d6(modifiers, rollOptions)

    // Apply DW outcomes
    let updated: Character = { ...character, updatedAt: new Date() }
    let tier: CastingTier
    let spellLost = false
    const consequences: string[] = []

    if (roll.total >= 10) {
      // 10+: success, retain spell
      tier = '10+'
      consequences.push('The spell is successfully cast and retained.')
    } else if (roll.total >= 7) {
      // 7–9: caller must choose one of DW-listed consequences
      tier = '7-9'
      consequences.push('Choose one: draw unwelcome attention, forget the spell, or take -1 ongoing to cast a spell until you prepare spells again.')
    } else {
      // 6-: failure — mark XP immediately
      tier = '6-'
      updated = { ...updated, xp: (updated.xp || 0) + 1 }
      consequences.push('Mark XP. The GM makes a move.')
    }

    return { roll, updated, tier, spellLost, consequences }
  }

  /**
   * Apply a 7–9 consequence. Returns an updated character.
   */
  applySevenToNineConsequence(
    character: Character, 
    spell: ServiceSpell, 
    consequence: SevenToNineConsequence
  ): Character {
    let updated = { ...character, updatedAt: new Date() }

    switch (consequence) {
      case 'forget':
        // Wizard: forgotten; Cleric: revoked — same effect: remove from prepared
        const prepared = character.preparedSpells || []
        updated.preparedSpells = prepared.filter(id => id !== spell.id)
        break

      case 'strain':
        // -1 ongoing to Cast a Spell until next Prepare / Commune
        const conditions = new Set(character.conditions || [])
        conditions.add('spellcasting-strain')
        updated.conditions = [...conditions]
        break

      case 'unwelcome-attention':
        // This is fictional; no mechanical change here
        // The GM will make a move based on the fiction
        break
    }

    return updated
  }

  /**
   * Get available spells for a character class and level
   */
  getAvailableSpells(characterClass: CharacterClass, level: number): ServiceSpell[] {
    // This would typically load from a spell compendium
    // For now, return empty array as we don't have spell data loaded
    return []
  }

  /**
   * Get spell by ID
   */
  getSpellById(spellId: string): ServiceSpell | undefined {
    // This would typically load from a spell compendium
    // For now, return undefined as we don't have spell data loaded
    return undefined
  }

  /**
   * Check if a spell can be cast by a character
   */
  canCastSpell(character: Character, spell: ServiceSpell): {
    canCast: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    let canCast = true

    // Check if character can cast spells
    if (!this.canCastSpells(character)) {
      reasons.push('Character class cannot cast spells')
      canCast = false
    }

    // Check class requirement
    if (spell.requiresClass && spell.requiresClass !== character.class) {
      reasons.push(`Spell requires ${spell.requiresClass} class`)
      canCast = false
    }

    // Check if spell is prepared (unless it's a cantrip)
    if (!this.isCantrip(spell)) {
      const prepared = character.preparedSpells || []
      if (!prepared.includes(spell.id)) {
        reasons.push('Spell is not prepared')
        canCast = false
      }
    }

    return { canCast, reasons }
  }

  /**
   * Get spell casting statistics for a character
   */
  getSpellcastingStats(character: Character): {
    canCastSpells: boolean
    spellcastingStat?: keyof Attribute
    preparationBudget: number
    preparedSpells: number
    preparedLevels: number
    hasStrain: boolean
    availableCantrips: number
  } {
    const canCastSpells = this.canCastSpells(character)
    const spellcastingStat = this.getSpellcastingStat(character)
    const preparationBudget = this.getPreparationBudget(character)
    const preparedSpells = (character.preparedSpells || []).length
    const hasStrain = character.conditions.includes('spellcasting-strain')

    // Calculate prepared levels (would need actual spell data)
    const preparedLevels = 0 // This would calculate from actual prepared spells

    return {
      canCastSpells,
      spellcastingStat,
      preparationBudget,
      preparedSpells,
      preparedLevels,
      hasStrain,
      availableCantrips: 0, // This would count available cantrips
    }
  }

  /**
   * Remove spellcasting strain (typically done during spell preparation)
   */
  removeSpellcastingStrain(character: Character): Character {
    return {
      ...character,
      conditions: character.conditions.filter(c => c !== 'spellcasting-strain'),
      updatedAt: new Date(),
    }
  }

  /**
   * Add spellcasting strain
   */
  addSpellcastingStrain(character: Character): Character {
    const conditions = new Set(character.conditions || [])
    conditions.add('spellcasting-strain')
    
    return {
      ...character,
      conditions: [...conditions],
      updatedAt: new Date(),
    }
  }
}

// Export singleton instance
export const spellCastingService = new SpellCastingService()