/**
 * Auto-calculation engine for Dungeon World * Handles all reactive calculations and derived values
 */

import type {
  Attributes,
  Character,
  // Removed unused class helper functions
  DamageDie,
} from '../models/Character'
import type {
  ActiveCondition,
  Condition,
} from '../models/Conditions'
import type {
  Item,
} from '../models/Equipment'
import type {
  EncumbranceStatus,
  Inventory,
} from '../models/Inventory'
import type {
  ModifierSet,
} from '../models/Modifiers'
import type { SpellPreparation } from '../models/Spell'
import type { CalculationWarning } from './CalculationWarnings'
import {
  calculateMaxHP,
  calculateMaxLoad,
  getAttributeModifier,
  getEffectiveModifier,
  getXPThreshold,
} from '../models/Character'
import {
  getCharacterConditions,
  getConditionModifiers,
} from '../models/Conditions'
import {
  calculateTotalArmor,
  hasTag,
  isWeapon,
} from '../models/Equipment'
import {
  calculateInventoryStats,
  getEquippedItems,
} from '../models/Inventory'
import { calculateMaxSpellLevels } from '../models/Spell'
import { calculationWarnings } from './CalculationWarnings'

// Calculated values for a character
export interface CalculatedValues {
  // Attribute modifiers
  attributeModifiers: Record <keyof Attributes, number>
  effectiveModifiers: Record <keyof Attributes, number> // With debilities

  // Health
  maxHP: number

  // Combat
  totalArmor: number
  damageDie: DamageDie
  damageBonus: number

  // Load
  maxLoad: number
  currentLoad: number
  encumbranceStatus: EncumbranceStatus
  encumbrancePenalty: number

  // XP
  xpThreshold: number
  canLevelUp: boolean

  // Modifiers
  ongoingModifier: number
  forwardModifier: number

  // Spells
  maxSpellLevels: number

  // Conditions
  activeConditions: Condition[]
  conditionModifiers: {
    ongoing: number
    forward: number
    armor: number
  }

  // Validation
  warnings: string[]
  errors: string[]

  // Enhanced warnings
  detailedWarnings: CalculationWarning[]
  optimizationSuggestions: string[]
}

// Calculation context-all data needed for calculations
export interface CalculationContext {
  character: Character
  inventory: Inventory
  modifiers: ModifierSet
  conditions: ActiveCondition[]
  conditionDefinitions: Condition[]
  spellPreparation?: SpellPreparation
}

/**
 * Main calculation engine class
 */
export class CalculationEngine {
  private static instance: CalculationEngine

  private constructor() {}

  static getInstance(): CalculationEngine {
    if (!CalculationEngine.instance) {
      CalculationEngine.instance = new CalculationEngine()
    }
    return CalculationEngine.instance
  }

  /**
   * Calculate all derived values for a character
   */
  calculate(context: CalculationContext): CalculatedValues {
    const { character, inventory, modifiers, conditions, conditionDefinitions } = context

    // Calculate attribute modifiers
    const attributeModifiers = this.calculateAttributeModifiers(character.attributes)
    const effectiveModifiers = this.calculateEffectiveModifiers(
      character.attributes,
      character.debilities,
    )

    // Get equipped items
    const _equippedItems = getEquippedItems(inventory)

    // Calculate health
    const maxHP = calculateMaxHP(character)

    // Calculate combat values
    const totalArmor = this.calculateTotalArmor(
      character,
      equippedItems,
      conditions,
      conditionDefinitions,
    )
    const { damageDie, damageBonus } = this.calculateDamage(
      character,
      equippedItems,
      modifiers,
    )

    // Calculate load
    const maxLoad = calculateMaxLoad(character)
    const inventoryStats = calculateInventoryStats(inventory, maxLoad)
    const currentLoad = inventoryStats.totalWeight
    const encumbranceStatus = inventoryStats.encumbranceStatus
    const encumbrancePenalty = this.getEncumbrancePenalty(encumbranceStatus)

    // Calculate XP
    const xpThreshold = getXPThreshold(character.level)
    const canLevelUp = character.xp >= xpThreshold

    // Calculate modifiers
    const activeConditions = getCharacterConditions(
      character.id,
      conditions,
      conditionDefinitions,
    )
    const conditionModifiers = getConditionModifiers(activeConditions, conditions)
    const ongoingModifier = this.calculateOngoingModifier(
      modifiers,
      conditionModifiers.ongoing,
      encumbrancePenalty,
    )
    const forwardModifier = this.calculateForwardModifier(
      modifiers,
      conditionModifiers.forward,
    )

    // Calculate spell values (official DW: total spell levels, not spell count)
    const maxSpellLevels = calculateMaxSpellLevels(
      character.class,
      character.level,
    )

    // Validation
    const { warnings, errors } = this.validate(context, equippedItems)

    // Generate enhanced warnings
    const warningContext = {
      hp: { current: character.hp.current, max: character.hp.max },
      armor: totalArmor,
      load: { current: currentLoad, max: maxLoad },
      encumbranceStatus,
      xp: { current: character.xp, threshold: xpThreshold },
      level: character.level,
      bonds: character.bonds.length,
      debilities: Object.fromEntries(Object.entries(character.debilities)) as Record <string, boolean>,
      equippedItems: equippedItems.map(item => ({
        name: item.name,
        category: item.category,
        tags: item.tags,
      })),
    }

    const detailedWarnings = calculationWarnings.generateWarnings(warningContext)
    const optimizationSuggestions = calculationWarnings.getOptimizationSuggestions(detailedWarnings)

    return {
      attributeModifiers,
      effectiveModifiers,
      maxHP,
      totalArmor,
      damageDie,
      damageBonus,
      maxLoad,
      currentLoad,
      encumbranceStatus,
      encumbrancePenalty,
      xpThreshold,
      canLevelUp,
      ongoingModifier,
      forwardModifier,
      maxSpellLevels,
      activeConditions,
      conditionModifiers,
      warnings,
      errors,
      detailedWarnings,
      optimizationSuggestions,
    }
  }

  /**
   * Calculate base attribute modifiers
   */
  private calculateAttributeModifiers(attributes: Attributes): Record <keyof Attributes, number> {
    return {
      STR: getAttributeModifier(attributes.STR),
      DEX: getAttributeModifier(attributes.DEX),
      CON: getAttributeModifier(attributes.CON),
      INT: getAttributeModifier(attributes.INT),
      WIS: getAttributeModifier(attributes.WIS),
      CHA: getAttributeModifier(attributes.CHA),
    }
  }

  /**
   * Calculate effective modifiers (with debilities)
   */
  private calculateEffectiveModifiers(
    attributes: Attributes,
    debilities: Character['debilities'],
  ): Record <keyof Attributes, number> {
    return {
      STR: getEffectiveModifier('STR', attributes, debilities),
      DEX: getEffectiveModifier('DEX', attributes, debilities),
      CON: getEffectiveModifier('CON', attributes, debilities),
      INT: getEffectiveModifier('INT', attributes, debilities),
      WIS: getEffectiveModifier('WIS', attributes, debilities),
      CHA: getEffectiveModifier('CHA', attributes, debilities),
    }
  }

  /**
   * Calculate total armor value
   */
  private calculateTotalArmor(
    character: Character,
    equippedItems: Item[],
    conditions: ActiveCondition[],
    conditionDefinitions: Condition[],
  ): number {
    // Base armor from equipment
    let armor = calculateTotalArmor(equippedItems)

    // Add manual armor override if set
    if (character.baseArmor !== undefined) {
      armor += character.baseArmor
    }

    // Add condition modifiers
    const activeConditions = getCharacterConditions(
      character.id,
      conditions,
      conditionDefinitions,
    )
    const conditionMods = getConditionModifiers(activeConditions, conditions)
    armor += conditionMods.armor

    // Clumsy tag reduces effective armor
    const hasClumsy = equippedItems.some(item => hasTag(item, 'clumsy'))
    if (hasClumsy) {
      // Clumsy doesn't reduce armor value, but we'll track it in warnings
    }

    return Math.max(0, armor) // Armor can't be negative
  }

  /**
   * Calculate damage die and bonus
   */
  private calculateDamage(
    character: Character,
    equippedItems: Item[],
    modifiers: ModifierSet,
  ): { damageDie: DamageDie, damageBonus: number } {
    const damageDie = character.damageDie
    let damageBonus = 0

    // Check for weapon damage bonuses
    const weapons = equippedItems.filter(isWeapon)
    for (const weapon of weapons) {
      if (weapon.damage) {
        // Parse damage bonus (e.g., "+1 damage", "2d4 damage")
        const match = weapon.damage.match(/\+(\d+)\s*damage/i)
        if (match) {
          damageBonus += Number.parseInt(match[1])
        }
      }
    }

    // Check for damage modifiers
    const damageModifiers = modifiers.modifiers.filter(
      mod => mod.target === 'damage' && mod.active,
    )
    for (const mod of damageModifiers) {
      damageBonus += mod.value
    }

    // Some class features or items might modify damage die
    // This would be expanded based on specific game rules

    return { damageDie, damageBonus }
  }

  /**
   * Get encumbrance penalty
   */
  private getEncumbrancePenalty(status: EncumbranceStatus): number {
    switch (status) {
      case 'encumbered':
        return -1 // -1 ongoing
      case 'overloaded':
        return -3 // Severely limited
      default:
        return 0
    }
  }

  /**
   * Calculate total ongoing modifier
   */
  private calculateOngoingModifier(
    modifiers: ModifierSet,
    conditionOngoing: number,
    encumbrancePenalty: number,
  ): number {
    // Get ongoing modifiers
    const ongoingMods = modifiers.modifiers.filter(
      mod => mod.type === 'ongoing' && mod.active && mod.target === 'all-rolls',
    )

    let total = 0
    for (const mod of ongoingMods) {
      total += mod.value
    }

    // Add condition and encumbrance modifiers
    total += conditionOngoing
    total += encumbrancePenalty

    return total
  }

  /**
   * Calculate total forward modifier
   */
  private calculateForwardModifier(
    modifiers: ModifierSet,
    conditionForward: number,
  ): number {
    // Get forward modifiers
    const forwardMods = modifiers.modifiers.filter(
      mod => mod.type === 'forward' && mod.active,
    )

    let total = 0
    for (const mod of forwardMods) {
      total += mod.value
    }

    // Add condition modifiers
    total += conditionForward

    return total
  }

  /**
   * Validate calculations and generate warnings / errors
   */
  private validate(
    context: CalculationContext,
    equippedItems: Item[],
  ): { warnings: string[], errors: string[] } {
    const warnings: string[] = []
    const errors: string[] = []
    const { character, inventory } = context

    // Check HP
    if (character.hp.current <= 0) {
      warnings.push('HP at 0 or below-Last Breath should be triggered')
    }
    if (character.hp.current > character.hp.max) {
      errors.push(`Current HP (${character.hp.current}) exceeds max HP (${character.hp.max})`)
    }

    // Check encumbrance
    const stats = calculateInventoryStats(inventory, calculateMaxLoad(character))
    if (stats.encumbranceStatus === 'encumbered') {
      warnings.push('Character is encumbered (-1 ongoing to all rolls)')
    }
    else if (stats.encumbranceStatus === 'overloaded') {
      errors.push('Character is overloaded and can barely move')
    }

    // Check equipment conflicts
    const equippedArmor = equippedItems.filter(item => item.category === 'armor')
    if (equippedArmor.length > 1) {
      errors.push('Multiple armor pieces equipped-only one can be worn at a time')
    }

    // Check for clumsy armor
    if (equippedItems.some(item => hasTag(item, 'clumsy'))) {
      warnings.push('Wearing clumsy armor (-1 ongoing to DEX-based moves)')
    }

    // Check two-handed weapon conflicts
    const twoHandedWeapons = equippedItems.filter(item =>
      item.category === 'weapon' && hasTag(item, 'two-handed'),
    )
    const equippedWeapons = equippedItems.filter(item => item.category === 'weapon')
    if (twoHandedWeapons.length > 0 && equippedWeapons.length > 1) {
      warnings.push('Two-handed weapon equipped with other weapons')
    }

    // Check level up eligibility
    if (character.xp >= getXPThreshold(character.level)) {
      warnings.push('Character has enough XP to level up')
    }

    // Check for missing bonds
    if (character.bonds.length === 0) {
      warnings.push('Character has no bonds-consider adding bonds for better roleplay')
    }

    return { warnings, errors }
  }
}

// Export singleton instance
export const calculationEngine = CalculationEngine.getInstance()

/**
 * React hook for using calculations
 */
export function useCalculations(context: CalculationContext): CalculatedValues {
  // In a real implementation, this would use React.useMemo
  // to memoize calculations and only recalculate when inputs change
  return calculationEngine.calculate(context)
}
