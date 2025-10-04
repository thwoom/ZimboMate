/**
 * Dice Rolling Service for Dungeon World * Handles 2d6 + modifier rolls with success tier calculation
 */

import type { Attributes, Character } from '../models/Character'
import type { Move, RollResult } from '../models/Move'
import { getMoveResult, getRollResult } from '../models/Move'

// Enhanced dice types for Dungeon World
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'
export type RollType = 'move' | 'damage' | 'stat' | 'custom' | 'target'

export interface DiceExpression {
  count: number
  type: DiceType
  modifier?: number
  label?: string
}

export interface EnhancedDiceRoll {
  id: string
  timestamp: number
  type: RollType
  expression: DiceExpression
  results: number[] // Individual die results
  total: number
  modifier: number
  finalResult: number
  success?: boolean // For target number rolls
  targetNumber?: number
  rollResult?: RollResult // For 2d6 moves
  move?: Move
  character?: string
  description?: string
  advantage?: boolean
  disadvantage?: boolean
  modifierBreakdown?: ModifierBreakdown
  template?: RollTemplate
  rerollCount?: number
  originalRoll?: string // ID of original roll if this is a reroll
}

export interface DiceRoll {
  id: string
  timestamp: number
  dice: [number, number] | [number, number, number] // 2d6 or 3d6 for advantage / disadvantage
  modifier: number
  total: number
  result: RollResult
  move?: Move
  character?: string // Character ID
  description?: string
  advantage?: boolean
  disadvantage?: boolean
  modifierBreakdown?: ModifierBreakdown
  template?: RollTemplate
}

export interface ModifierBreakdown {
  stat: { value: number; source: string }
  ongoing: { value: number; source: string }[]
  forward: { value: number; source: string }[]
  equipment: { value: number; source: string }[]
  other: { value: number; source: string }[]
}

export interface RollModifiers {
  stat: number
  ongoing: number
  forward: number
  other: number
}

export interface RollOptions {
  move?: Move
  character?: Character
  customModifier?: number
  description?: string
  stat?: keyof Attributes
  advantage?: boolean
  disadvantage?: boolean
  template?: RollTemplate
}

export interface RollTemplate {
  id: string
  name: string
  description: string
  baseModifier: number
  conditions: string[]
  tags: string[]
}

export class DiceRollingService {
  private rollHistory: DiceRoll[] = []
  private rollTemplates: Map<string, RollTemplate> = new Map()
  private readonly MAX_HISTORY = 100

  /**
   * Roll 2d6 with modifiers (or 3d6 for advantage / disadvantage)
   */
  roll2d6(modifiers: RollModifiers, options: RollOptions = {}): DiceRoll {
    let dice: [number, number] | [number, number, number]
    let diceTotal: number

    if (options.advantage || options.disadvantage) {
      // Roll 3d6 for advantage / disadvantage
      const die1 = Math.floor(Math.random() * 6) + 1
      const die2 = Math.floor(Math.random() * 6) + 1
      const die3 = Math.floor(Math.random() * 6) + 1
      dice = [die1, die2, die3]

      // Sort dice to find highest / lowest pairs
      const sorted = [...dice].sort((a, b) => b - a)

      if (options.advantage) {
        // Take highest 2 dice
        diceTotal = sorted[0] + sorted[1]
      } else {
        // Take lowest 2 dice
        diceTotal = sorted[1] + sorted[2]
      }
    } else {
      // Normal 2d6 roll
      const die1 = Math.floor(Math.random() * 6) + 1
      const die2 = Math.floor(Math.random() * 6) + 1
      dice = [die1, die2]
      diceTotal = die1 + die2
    }

    // Calculate total modifier
    const totalModifier =
      modifiers.stat + modifiers.ongoing + modifiers.forward + modifiers.other

    // Calculate total
    const total = diceTotal + totalModifier

    // Determine result
    const result = getRollResult(total)

    // Create roll record
    const roll: DiceRoll = {
      id: this.generateRollId(),
      timestamp: Date.now(),
      dice,
      modifier: totalModifier,
      total,
      result,
      move: options.move,
      character: options.character?.id,
      description: options.description,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
      template: options.template,
    }

    // Add to history
    this.addToHistory(roll)

    return roll
  }

  /**
   * Roll a move for a character
   */
  rollMove(
    move: Move,
    character: Character,
    options: {
      ongoing?: number
      forward?: number
      customModifier?: number
      advantage?: boolean
      disadvantage?: boolean
    } = {},
  ): DiceRoll {
    if (!move.rollStat) {
      throw new Error(`Move "${move.name}" does not require a roll`)
    }

    // Get stat modifier
    const statValue = character.attributes[move.rollStat]
    const statModifier = this.getStatModifier(statValue)

    // Build modifiers
    const modifiers: RollModifiers = {
      stat: statModifier,
      ongoing: options.ongoing || 0,
      forward: options.forward || 0,
      other: (move.rollModifier || 0) + (options.customModifier || 0),
    }

    // Roll with move context
    return this.roll2d6(modifiers, {
      move,
      character,
      description: `${move.name} (${move.rollStat})`,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    })
  }

  /**
   * Quick stat roll (like Defy Danger with specific stat)
   */
  rollStat(
    stat: keyof Attributes,
    character: Character,
    options: {
      ongoing?: number
      forward?: number
      customModifier?: number
      description?: string
      advantage?: boolean
      disadvantage?: boolean
    } = {},
  ): DiceRoll {
    const statValue = character.attributes[stat]
    const statModifier = this.getStatModifier(statValue)

    const modifiers: RollModifiers = {
      stat: statModifier,
      ongoing: options.ongoing || 0,
      forward: options.forward || 0,
      other: options.customModifier || 0,
    }

    return this.roll2d6(modifiers, {
      character,
      stat,
      description: options.description || `${stat} roll`,
      advantage: options.advantage,
      disadvantage: options.disadvantage,
    })
  }

  /**
   * Get stat modifier from stat value (DW uses stat-10 for modifier)
   */
  private getStatModifier(statValue: number): number {
    if (statValue <= 3) return -3
    if (statValue <= 5) return -2
    if (statValue <= 8) return -1
    if (statValue <= 12) return 0
    if (statValue <= 15) return 1
    if (statValue <= 17) return 2
    return 3 // 18+
  }

  /**
   * Get roll history
   */
  getHistory(): DiceRoll[] {
    return [...this.rollHistory].reverse() // Most recent first
  }

  /**
   * Get recent rolls (last N)
   */
  getRecentRolls(count = 10): DiceRoll[] {
    return this.getHistory().slice(0, count)
  }

  /**
   * Clear roll history
   */
  clearHistory(): void {
    this.rollHistory = []
  }

  /**
   * Get roll by ID
   */
  getRoll(id: string): DiceRoll | undefined {
    return this.rollHistory.find((roll) => roll.id === id)
  }

  /**
   * Get formatted roll result text
   */
  getResultText(roll: DiceRoll): string {
    if (roll.move) {
      return getMoveResult(roll.move, roll.result)
    }

    // Generic result text
    switch (roll.result) {
      case 'success':
        return 'Success! (10+)'
      case 'partial':
        return 'Partial Success (7-9)'
      case 'failure':
        return 'Miss (6-)-Mark XP'
    }
  }

  /**
   * Check if roll grants XP (on 6-)
   */
  grantsXP(roll: DiceRoll): boolean {
    return roll.result === 'failure' && roll.move?.triggerType === 'roll'
  }

  /**
   * Get roll summary for display
   */
  getRollSummary(roll: DiceRoll): string {
    const diceText =
      roll.dice.length === 3
        ? `${roll.dice.join('+')} (${roll.advantage ? 'adv' : 'dis'})`
        : `${roll.dice[0]}+${roll.dice[1]}`
    const modifierText =
      roll.modifier >= 0 ? `+${roll.modifier}` : `${roll.modifier}`
    return `${diceText}${modifierText} = ${roll.total}`
  }

  /**
   * Add roll to history
   */
  private addToHistory(roll: DiceRoll): void {
    this.rollHistory.push(roll)

    // Trim history if too long
    if (this.rollHistory.length > this.MAX_HISTORY) {
      this.rollHistory = this.rollHistory.slice(-this.MAX_HISTORY)
    }
  }

  /**
   * Generate unique roll ID
   */
  private generateRollId(): string {
    return `roll_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * Roll Template Management
   */
  saveRollTemplate(template: RollTemplate): void {
    this.rollTemplates.set(template.id, template)
  }

  getRollTemplate(id: string): RollTemplate | undefined {
    return this.rollTemplates.get(id)
  }

  getAllRollTemplates(): RollTemplate[] {
    return [...this.rollTemplates.values()]
  }

  deleteRollTemplate(id: string): void {
    this.rollTemplates.delete(id)
  }

  /**
   * Create modifier breakdown for detailed display
   */
  createModifierBreakdown(
    modifiers: RollModifiers,
    character?: Character,
    move?: Move,
    _equipment?: unknown[],
  ): ModifierBreakdown {
    const breakdown: ModifierBreakdown = {
      stat: { value: modifiers.stat, source: move?.rollStat || 'Unknown' },
      ongoing: [],
      forward: [],
      equipment: [],
      other: [],
    }

    // Add ongoing modifiers (would come from character state)
    if (modifiers.ongoing !== 0) {
      breakdown.ongoing.push({
        value: modifiers.ongoing,
        source: 'Ongoing Effects',
      })
    }

    // Add forward modifiers (would come from character state)
    if (modifiers.forward !== 0) {
      breakdown.forward.push({
        value: modifiers.forward,
        source: 'Forward Bonus',
      })
    }

    // Add move-specific modifiers
    if (move?.rollModifier) {
      breakdown.other.push({ value: move.rollModifier, source: move.name })
    }

    return breakdown
  }

  /**
   * Calculate success probability for a given modifier
   */
  getSuccessProbability(totalModifier: number): {
    success: number // 10 + partial: number; // 7-9
    failure: number // 6-
  } {
    // Calculate probabilities for 2d6 + modifier
    let successCount = 0
    let partialCount = 0
    let failureCount = 0

    // All possible 2d6 combinations (36 total)
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        const total = d1 + d2 + totalModifier
        if (total >= 10) successCount++
        else if (total >= 7) partialCount++
        else failureCount++
      }
    }

    return {
      success: Math.round((successCount / 36) * 100),
      partial: Math.round((partialCount / 36) * 100),
      failure: Math.round((failureCount / 36) * 100),
    }
  }

  // ========================================
  // ENHANCED DICE ROLLING SYSTEM
  // ========================================

  /**
   * Roll unknown type of dice with enhanced features
   */
  rollDice(
    expression: DiceExpression,
    options: Partial<EnhancedDiceRoll> = {},
  ): EnhancedDiceRoll {
    const results: number[] = []
    const diceSize = this.getDiceSize(expression.type)

    // Roll the dice
    for (let i = 0; i < expression.count; i++) {
      results.push(Math.floor(Math.random() * diceSize) + 1)
    }

    // Handle advantage / disadvantage for applicable rolls
    let finalResults = results
    if (options.advantage && expression.count >= 2) {
      finalResults = this.applyAdvantage(results)
    } else if (options.disadvantage && expression.count >= 2) {
      finalResults = this.applyDisadvantage(results)
    }

    const total = finalResults.reduce((sum, die) => sum + die, 0)
    const modifier = options.modifier || expression.modifier || 0
    const finalResult = total + modifier

    const roll: EnhancedDiceRoll = {
      id: `roll_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
      type: options.type || 'custom',
      expression,
      results: finalResults,
      total,
      modifier,
      finalResult,
      ...options,
    }

    // Add success determination for target number rolls
    if (roll.targetNumber !== undefined) {
      roll.success = finalResult >= roll.targetNumber
    }

    // Add 2d6 move result if applicable
    if (
      expression.count === 2 &&
      expression.type === 'd6' &&
      roll.type === 'move'
    ) {
      roll.rollResult = getRollResult(finalResult)
    }

    return roll
  }

  /**
   * Roll damage dice (typically d4, d6, d8, d10, d12)
   */
  rollDamage(
    diceType: DiceType,
    count = 1,
    modifier = 0,
    options: Partial<EnhancedDiceRoll> = {},
  ): EnhancedDiceRoll {
    return this.rollDice(
      {
        count,
        type: diceType,
        modifier,
        label: `${count}${diceType}${modifier >= 0 ? '+' : ''}${modifier || ''}`,
      },
      {
        type: 'damage',
        description: `Damage: ${count}${diceType}${modifier ? (modifier >= 0 ? '+' : '') + modifier : ''}`,
        ...options,
      },
    )
  }

  /**
   * Roll against a target number
   */
  rollTarget(
    targetNumber: number,
    diceType: DiceType = 'd20',
    count = 1,
    modifier = 0,
    options: Partial<EnhancedDiceRoll> = {},
  ): EnhancedDiceRoll {
    return this.rollDice(
      {
        count,
        type: diceType,
        modifier,
        label: `${count}${diceType}+${modifier} vs ${targetNumber}`,
      },
      {
        type: 'target',
        targetNumber,
        description: `Target ${targetNumber}: ${count}${diceType}${modifier ? (modifier >= 0 ? '+' : '') + modifier : ''}`,
        ...options,
      },
    )
  }

  /**
   * Reroll a previous roll (spending XP or using abilities)
   */
  rerollDice(
    originalRoll: EnhancedDiceRoll,
    options: { spendXP?: boolean; abilityName?: string } = {},
  ): EnhancedDiceRoll {
    const newRoll = this.rollDice(originalRoll.expression, {
      ...originalRoll,
      id: `reroll_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
      originalRoll: originalRoll.id,
      rerollCount: (originalRoll.rerollCount || 0) + 1,
      description: `${originalRoll.description} (Reroll${options.spendXP ? '-XP spent' : ''}${options.abilityName ? `-${options.abilityName}` : ''})`,
    })

    return newRoll
  }

  /**
   * Roll with stacking modifiers
   */
  rollWithModifiers(
    expression: DiceExpression,
    modifiers: {
      stat?: number
      equipment?: number
      ongoing?: number
      forward?: number
      circumstantial?: number
      other?: { value: number; source: string }[]
    },
    options: Partial<EnhancedDiceRoll> = {},
  ): EnhancedDiceRoll {
    const totalModifier =
      (modifiers.stat || 0) +
      (modifiers.equipment || 0) +
      (modifiers.ongoing || 0) +
      (modifiers.forward || 0) +
      (modifiers.circumstantial || 0) +
      (modifiers.other?.reduce((sum, mod) => sum + mod.value, 0) || 0)

    const modifierBreakdown: ModifierBreakdown = {
      stat: { value: modifiers.stat || 0, source: 'Attribute' },
      ongoing: modifiers.ongoing
        ? [{ value: modifiers.ongoing, source: 'Ongoing' }]
        : [],
      forward: modifiers.forward
        ? [{ value: modifiers.forward, source: 'Forward' }]
        : [],
      equipment: modifiers.equipment
        ? [{ value: modifiers.equipment, source: 'Equipment' }]
        : [],
      other: modifiers.other || [],
    }

    if (modifiers.circumstantial) {
      modifierBreakdown.other.push({
        value: modifiers.circumstantial,
        source: 'Circumstantial',
      })
    }

    return this.rollDice(
      {
        ...expression,
        modifier: (expression.modifier || 0) + totalModifier,
      },
      {
        modifierBreakdown,
        ...options,
      },
    )
  }

  /**
   * Parse dice expression from string (e.g., "2d6 + 3", "1d8", "3d4-1")
   */
  parseDiceExpression(expression: string): DiceExpression {
    const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
    if (!match) {
      throw new Error(`Invalid dice expression: ${expression}`)
    }

    const count = Number.parseInt(match[1])
    const sides = Number.parseInt(match[2])
    const modifier = match[3] ? Number.parseInt(match[3]) : 0

    // Map sides to dice type
    const diceType: DiceType = `d${sides}` as DiceType
    if (!['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].includes(diceType)) {
      throw new Error(`Unsupported dice type: d${sides}`)
    }

    return {
      count,
      type: diceType,
      modifier,
      label: expression,
    }
  }

  /**
   * Roll from string expression
   */
  rollFromString(
    expression: string,
    options: Partial<EnhancedDiceRoll> = {},
  ): EnhancedDiceRoll {
    const diceExpression = this.parseDiceExpression(expression)
    return this.rollDice(diceExpression, options)
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private getDiceSize(diceType: DiceType): number {
    const sizeMap: Record<DiceType, number> = {
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d20: 20,
    }
    return sizeMap[diceType]
  }

  private applyAdvantage(results: number[]): number[] {
    if (results.length < 2) return results
    return results
      .sort((a, b) => b - a)
      .slice(0, Math.floor(results.length / 2) || 1)
  }

  private applyDisadvantage(results: number[]): number[] {
    if (results.length < 2) return results
    return results
      .sort((a, b) => a - b)
      .slice(0, Math.floor(results.length / 2) || 1)
  }

  /**
   * Get enhanced roll history
   */
  getEnhancedRollHistory(): EnhancedDiceRoll[] {
    // For now, return empty array-we'll integrate this with existing history later
    return []
  }

  /**
   * Format enhanced roll for display
   */
  formatEnhancedRoll(roll: EnhancedDiceRoll): string {
    const diceStr = `${roll.expression.count}${roll.expression.type}`
    const resultsStr = roll.results.join(', ')
    const modifierStr =
      roll.modifier !== 0
        ? ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`
        : ''

    let result = `${diceStr} (${resultsStr})${modifierStr} = ${roll.finalResult}`
    if (roll.success !== undefined) {
      result += roll.success ? ' ✓' : ' ✗'
    }

    if (roll.rollResult) {
      const resultMap = {
        success: '✓ Success',
        partial: '~ Partial',
        failure: '✗ Failure',
      }
      result += ` - ${resultMap[roll.rollResult]}`
    }

    return result
  }
}

// Singleton instance
export const diceRollingService = new DiceRollingService()
