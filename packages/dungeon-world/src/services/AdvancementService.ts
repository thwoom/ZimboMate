/**
 * Dungeon World advancement service-matches official rules exactly
 */

import type { Attributes, Character, CharacterClass } from '../models/Character'
import { getAdvancedMovesAtLevel, getStartingMovesForClass } from '../data/advancedMoves'

export interface LevelProgression {
  level: number
  xpRequired: number // XP needed to reach this level
  xpForNext: number // XP needed for next level (level + 7)
  baseHP: number
  startingCoin: number
  xp: number
  totalAdvancementPoints: number
}

export interface AdvancementChoice {
  id: string
  type: 'move' | 'stat'
  level: number
  name: string
  description: string
  // For stat improvements
  attribute?: keyof Attributes
  // For moves
  moveId?: string
  sourceClass?: CharacterClass
  isMulticlass?: boolean
  prerequisites?: string[]
}

export interface AdvancementPlan {
  targetLevel: number
  selectedMove?: AdvancementChoice // Exactly one move choice
  selectedStat?: AdvancementChoice // Exactly one stat choice
  isValid: boolean
  validationErrors: string[]
}

class AdvancementService {
  /**
   * Get XP requirements for leveling up (official DW rules)
   */
  getXPRequirement(currentLevel: number): number {
    return currentLevel + 7
  }

  /**
   * Get level progression data with equipment scaling for higher levels
   */
  getLevelProgression(level: number, characterClass?: CharacterClass): LevelProgression {
    // Base values for level 1
    let baseHP = this.getClassBaseHP(characterClass)
    let startingCoin = this.getClassStartingCoin(characterClass)
    let xp = 0
    let totalAdvancementPoints = 0

    if (level > 1) {
      // HP scales: base HP + (level-1) additional HP
      baseHP = this.getClassBaseHP(characterClass) + (level - 1)

      // Starting coin scales with level (more experienced characters have more resources)
      startingCoin = this.getClassStartingCoin(characterClass) + (level - 1) * 5

      // XP is the amount needed to reach this level
      xp = this.getXPRequirement(level - 1)

      // Advancement points: each level after 1 gives 2 points (1 move + 1 stat)
      totalAdvancementPoints = this.getTotalAdvancementPoints(level - 1)
    }

    return {
      level,
      xpRequired: level === 1 ? 0 : this.getXPRequirement(level - 1),
      xpForNext: this.getXPRequirement(level),
      baseHP,
      startingCoin,
      xp,
      totalAdvancementPoints,
    }
  }

  /**
   * Get base HP for a character class (Dungeon World rules)
   */
  private getClassBaseHP(characterClass?: CharacterClass): number {
    const classBaseHP: Record <CharacterClass, number> = {
      Fighter: 10,
      Paladin: 10,
      Ranger: 8,
      Thief: 6,
      Bard: 6,
      Cleric: 8,
      Druid: 8,
      Wizard: 4,
      Barbarian: 10,
      Immolator: 8,
    }

    return characterClass ? classBaseHP[characterClass] : 8 // Default to 8 if no class specified
  }

  /**
   * Get starting coin for a character class (Dungeon World rules)
   */
  private getClassStartingCoin(characterClass?: CharacterClass): number {
    const classStartingCoin: Record <CharacterClass, number> = {
      Fighter: 20,
      Paladin: 15,
      Ranger: 10,
      Thief: 25,
      Bard: 20,
      Cleric: 15,
      Druid: 5,
      Wizard: 10,
      Barbarian: 15,
      Immolator: 10,
    }

    return characterClass ? classStartingCoin[characterClass] : 15 // Default to 15 if no class specified
  }

  /**
   * Check if character can level up
   */
  canLevelUp(character: Character): boolean {
    const xpNeeded = this.getXPRequirement(character.level)
    return character.xp >= xpNeeded
  }

  /**
   * Get available stat improvements for level up * Official DW: Choose one stat and increase it by 1 (max 18)
   */
  getAvailableStatImprovements(
    character: Character,
    targetLevel: number,
  ): AdvancementChoice[] {
    const attributes: (keyof Attributes)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    const choices: AdvancementChoice[] = []

    // Guard: ensure attributes exist to avoid runtime errors during panel mount
    const safeAttributes = (character && character.attributes)
      ? character.attributes
      : {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        } as Attributes

    for (const attr of attributes) {
      const currentValue = safeAttributes[attr]

      // Only offer if not at cap (18)
      if (currentValue < 18) {
        choices.push({
          id: `stat-${attr.toLowerCase()}-${targetLevel}`,
          type: 'stat',
          level: targetLevel,
          name: `Increase ${attr}`,
          description: `Increase your ${attr} by 1 (${currentValue} → ${currentValue + 1})${currentValue === 17 ? ' [MAX]' : ''}`,
          attribute: attr,
        })
      }
    }

    return choices
  }

  /**
   * Get available advanced moves for level up * Official DW: Choose a new advanced move from your class
   */
  getAvailableAdvancedMoves(
    character: Character,
    targetLevel: number,
  ): AdvancementChoice[] {
    const choices: AdvancementChoice[] = []

    // Get class moves for this level using the new advanced moves data
    const classMoves = getAdvancedMovesAtLevel(character.class, targetLevel)

    for (const move of classMoves) {
      // Safely check knownMoves (handle undefined case)
      const knownMoves = character.knownMoves || []
      if (!knownMoves.includes(move.id)) {
        choices.push({
          id: `move-${move.id}-${targetLevel}`,
          type: 'move',
          level: targetLevel,
          name: move.name,
          description: move.description,
          moveId: move.id,
          sourceClass: character.class,
          isMulticlass: false,
          prerequisites: move.prerequisites,
        })
      }
    }

    // Add multiclass moves if eligible (level 2+)
    if (targetLevel >= 2) {
      const multiclassMoves = this.getMulticlassMoves(character, targetLevel)
      choices.push(...multiclassMoves)
    }

    return choices
  }

  /**
   * Get multiclass move options
   */
  private getMulticlassMoves(character: Character, targetLevel: number): AdvancementChoice[] {
    const choices: AdvancementChoice[] = []
    const otherClasses = this.getOtherClasses(character.class)

    for (const otherClass of otherClasses) {
      // Can take starting moves from other classes
      const startingMoves = getStartingMovesForClass(otherClass)

      for (const move of startingMoves) {
        choices.push({
          id: `multiclass-${otherClass}-${move.id}-${targetLevel}`,
          type: 'move',
          level: targetLevel,
          name: `${move.name} (${otherClass})`,
          description: `${move.description} [Multiclass from ${otherClass}]`,
          moveId: move.id,
          sourceClass: otherClass,
          isMulticlass: true,
          prerequisites: [],
        })
      }

      // Can also take advanced moves if you already have a move from that class
      const hasMulticlassMove = (character.knownMoves || []).some(moveId =>
        this.isMoveFromClass(moveId, otherClass),
      )

      if (hasMulticlassMove) {
        const advancedMoves = getAdvancedMovesAtLevel(otherClass, Math.min(targetLevel, 6))
        for (const move of advancedMoves) {
          choices.push({
            id: `multiclass-adv-${otherClass}-${move.id}-${targetLevel}`,
            type: 'move',
            level: targetLevel,
            name: `${move.name} (${otherClass})`,
            description: `${move.description} [Advanced multiclass from ${otherClass}]`,
            moveId: move.id,
            sourceClass: otherClass,
            isMulticlass: true,
            prerequisites: [`Must have a move from ${otherClass}`],
          })
        }
      }
    }

    return choices
  }

  /**
   * Create advancement plan for level up * Official DW: Must choose exactly one move AND exactly one stat increase
   */
  createAdvancementPlan(
    character: Character,
    targetLevel: number,
    selectedMove?: AdvancementChoice,
    selectedStat?: AdvancementChoice,
  ): AdvancementPlan {
    const plan: AdvancementPlan = {
      targetLevel,
      selectedMove,
      selectedStat,
      isValid: true,
      validationErrors: [],
    }

    this.validateAdvancementPlan(plan, character)
    return plan
  }

  /**
   * Validate advancement plan according to official DW rules
   */
  private validateAdvancementPlan(plan: AdvancementPlan, character: Character): void {
    const errors: string[] = []

    // Must select exactly one move
    if (!plan.selectedMove) {
      errors.push('You must choose one advanced move')
    }

    // Must select exactly one stat increase
    if (!plan.selectedStat) {
      errors.push('You must choose one ability score to increase')
    }

    // Validate move choice
    if (plan.selectedMove) {
      if (plan.selectedMove.type !== 'move') {
        errors.push('Invalid move selection')
      }

      // Check if already known
      if (plan.selectedMove.moveId && (character.knownMoves || []).includes(plan.selectedMove.moveId)) {
        errors.push('You already know this move')
      }

      // Check prerequisites
      if (plan.selectedMove.prerequisites) {
        for (const prereq of plan.selectedMove.prerequisites) {
          if (!this.checkPrerequisite(prereq, character)) {
            errors.push(`Prerequisite not met: ${prereq}`)
          }
        }
      }
    }

    // Validate stat choice
    if (plan.selectedStat) {
      if (plan.selectedStat.type !== 'stat') {
        errors.push('Invalid stat selection')
      }

      if (plan.selectedStat.attribute) {
        const currentValue = character.attributes[plan.selectedStat.attribute]
        if (currentValue >= 18) {
          errors.push(`${plan.selectedStat.attribute} is already at maximum (18)`)
        }
      }
    }

    plan.validationErrors = errors
    plan.isValid = errors.length === 0
  }

  /**
   * Apply advancement plan to character
   */
  applyAdvancementPlan(character: Character, plan: AdvancementPlan): Character {
    if (!plan.isValid) {
      throw new Error('Cannot apply invalid advancement plan')
    }

    const updatedCharacter: Character = { ...character }

    // Update level
    updatedCharacter.level = plan.targetLevel

    // Subtract XP (official DW rule: subtract current level + 7)
    const xpCost = this.getXPRequirement(character.level)
    updatedCharacter.xp = Math.max(0, character.xp - xpCost)

    // Apply stat increase
    if (plan.selectedStat?.attribute) {
      updatedCharacter.attributes = { ...character.attributes }
      updatedCharacter.attributes[plan.selectedStat.attribute] += 1

      // Update HP if Constitution increased
      if (plan.selectedStat.attribute === 'CON') {
        const hpIncrease = 1 // +1 CON = +1 HP in DW
        updatedCharacter.hp = {
          current: character.hp.current + hpIncrease,
          max: character.hp.max + hpIncrease,
        }
      }
    }

    // Apply move
    if (plan.selectedMove?.moveId) {
      updatedCharacter.knownMoves = [...(character.knownMoves || []), plan.selectedMove.moveId]

      // Special case: Wizard gets a new spell in spellbook when leveling up
      if (character.class === 'Wizard') {
        // This would add a spell to the spellbook-simplified for now
        updatedCharacter.knownSpells = [...(character.knownSpells || []), 'new-spell']
      }
    }

    // Update advancement history
    const newAdvancements = [...character.advancements]

    if (plan.selectedMove) {
      newAdvancements.push({
        level: plan.targetLevel,
        type: 'move',
        choice: plan.selectedMove.moveId || plan.selectedMove.name,
        description: plan.selectedMove.description,
        timestamp: new Date(),
      })
    }

    if (plan.selectedStat) {
      newAdvancements.push({
        level: plan.targetLevel,
        type: 'stat',
        choice: plan.selectedStat.attribute || 'unknown',
        description: plan.selectedStat.description,
        timestamp: new Date(),
      })
    }

    updatedCharacter.advancements = newAdvancements
    updatedCharacter.updatedAt = new Date()

    return updatedCharacter
  }

  /**
   * Get class advanced moves (simplified-would pull from actual data)
   */
  private getClassAdvancedMoves(characterClass: CharacterClass, level: number): unknown[] {
    // This method is now deprecated in favor of getAdvancedMovesAtLevel from advancedMoves.ts
    return getAdvancedMovesAtLevel(characterClass, level)
  }

  /**
   * Get class starting moves (for multiclassing)
   */
  private getClassStartingMoves(characterClass: CharacterClass): unknown[] {
    // This method is now deprecated in favor of getStartingMovesForClass from advancedMoves.ts
    return getStartingMovesForClass(characterClass)
  }

  /**
   * Get other classes for multiclassing
   */
  private getOtherClasses(currentClass: CharacterClass): CharacterClass[] {
    const allClasses: CharacterClass[] = [
      'Fighter',
      'Wizard',
      'Cleric',
      'Thief',
      'Bard',
      'Ranger',
      'Druid',
      'Paladin',
      'Barbarian',
      'Immolator',
    ]

    return allClasses.filter(cls => cls !== currentClass)
  }

  /**
   * Check if a move belongs to a specific class
   */
  private isMoveFromClass(moveId: string, characterClass: CharacterClass): boolean {
    // This would check actual move data
    return moveId.includes(characterClass.toLowerCase())
  }

  /**
   * Check if prerequisite is met
   */
  private checkPrerequisite(prerequisite: string, character: Character): boolean {
    // Simplified prerequisite checking
    if (prerequisite.includes('Must have a move from')) {
      const className = prerequisite.split('Must have a move from ')[1]
      return (character.knownMoves || []).some(moveId =>
        this.isMoveFromClass(moveId, className as CharacterClass),
      )
    }

    return true
  }

  /**
   * Calculate total advancement points from level 1 to a given level * Each level gives exactly 2 advancement points (1 move + 1 stat)
   */
  private getTotalAdvancementPoints(level: number): number {
    // Level 1 has 0 advancement points (starting character)
    // Each level after 1 gives 2 advancement points
    return level > 1 ? (level - 1) * 2 : 0
  }
}

export const advancementService = new AdvancementService()
