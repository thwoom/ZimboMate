/**
 * Move Compendium Service for ZimboMate V2
 * Provides advanced functionality for managing and querying the move compendium
 * Modernized from V1 with improved TypeScript patterns and V2 model integration
 */

import type { Attribute, CharacterClass } from '../models/Character'
import type { Move, MoveCategory, MoveTrigger } from '../models/Move'
import { BASIC_MOVES, SPECIAL_MOVES } from '../models/Move'
import { CLASS_MOVES } from '../data/advancement/classMoves'

// Move type for better categorization
export type MoveType =
  | 'combat'
  | 'social'
  | 'exploration'
  | 'utility'
  | 'defensive'
  | 'offensive'
  | 'movement'
  | 'magical'
  | 'ritual'
  | 'special'

// Extended move interface for compendium
export interface CompendiumMove extends Move {
  type: MoveType
  tags?: string[]
  requiresStat?: {
    stat: Attribute
    value: number
  }
  requiresMove?: string[]
  requiresRace?: string[]
  requiresAlignment?: string[]
  mutuallyExclusiveIds?: string[]
  source: string
  page?: number
}

// Search and filter options
export interface MoveSearchOptions {
  query?: string
  category?: MoveCategory
  type?: MoveType
  triggerType?: MoveTrigger
  characterClass?: CharacterClass
  level?: number
  rollStat?: Attribute
  tags?: string[]
  source?: string
  custom?: boolean
}

// Move comparison interface
export interface MoveComparison {
  move1: CompendiumMove
  move2: CompendiumMove
  similarities: string[]
  differences: string[]
  recommendations: string[]
}

// Move usage statistics
export interface MoveUsageStats {
  moveId: string
  moveName: string
  usageCount: number
  successRate: number
  averageRoll: number
  lastUsed?: Date
  notes?: string
}

// Move validation interface
export interface MoveValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// Move prerequisites check
export interface PrerequisiteCheck {
  canTake: boolean
  missingPrerequisites: string[]
  levelRequirement: boolean
  classRequirement: boolean
  statRequirement: boolean
}

/**
 * Service class for managing the move compendium
 */
export class MoveCompendiumService {
  private moves: CompendiumMove[] = []

  constructor() {
    this.initializeBasicMoves()
    this.initializeClassMoves()
  }

  /**
   * Initialize basic moves from the models
   */
  private initializeBasicMoves(): void {
    const basicMoves: CompendiumMove[] = BASIC_MOVES.map((move, index) => ({
      id: move.name?.toLowerCase().replace(/\s+/g, '-') || `basic-${index}`,
      name: move.name || 'Unknown Move',
      category: 'basic' as MoveCategory,
      description: move.description || '',
      trigger: move.trigger || '',
      triggerType: move.triggerType || 'action',
      rollStat: move.rollStat,
      onSuccess: move.onSuccess,
      onPartial: move.onPartial,
      onFailure: move.onFailure,
      type: this.inferMoveType(move.name || ''),
      source: 'Dungeon World Core',
      page: 0,
      custom: false,
    }))

    const specialMoves: CompendiumMove[] = SPECIAL_MOVES.map((move, index) => ({
      id: move.name?.toLowerCase().replace(/\s+/g, '-') || `special-${index}`,
      name: move.name || 'Unknown Move',
      category: 'special' as MoveCategory,
      description: move.description || '',
      trigger: move.trigger || '',
      triggerType: move.triggerType || 'special',
      rollStat: move.rollStat,
      onSuccess: move.onSuccess,
      onPartial: move.onPartial,
      onFailure: move.onFailure,
      type: 'special' as MoveType,
      source: 'Dungeon World Core',
      page: 0,
      custom: false,
    }))

    this.moves = [...basicMoves, ...specialMoves]
  }

  /**
   * Hydrate class-specific moves from structured data
   */
  private initializeClassMoves(): void {
    const classMoves: CompendiumMove[] = []

    for (const [className, moves] of Object.entries(CLASS_MOVES)) {
      const characterClass = className as CharacterClass

      for (const move of moves) {
        const category: MoveCategory =
          move.tier === 'advanced'
            ? 'advanced'
            : move.tier === 'master'
              ? 'master'
              : 'class'

        const requiredLevel =
          move.prerequisites?.level ??
          (move.tier === 'advanced'
            ? 2
            : move.tier === 'master'
              ? 6
              : 1)

        const tags = new Set<string>()
        tags.add(move.tier)
        if (move.tier === 'race') {
          tags.add('race')
        }

        const compendiumMove: CompendiumMove = {
          id: move.id,
          name: move.name,
          category,
          description: move.description,
          trigger: '',
          triggerType: 'special',
          type: 'utility',
          source: 'Dungeon World SRD',
          requiresClass: characterClass,
          level: requiredLevel,
          tags: Array.from(tags),
        }

        if (move.prerequisites?.requiresMoveIds) {
          compendiumMove.requiresMove = move.prerequisites.requiresMoveIds
        }

        if (move.prerequisites?.requiresRace) {
          compendiumMove.requiresRace = move.prerequisites.requiresRace
        }

        if (move.prerequisites?.requiresAlignment) {
          compendiumMove.requiresAlignment =
            move.prerequisites.requiresAlignment
        }

        if (move.mutuallyExclusiveIds?.length) {
          compendiumMove.mutuallyExclusiveIds = move.mutuallyExclusiveIds
        }

        classMoves.push(compendiumMove)
      }
    }

    this.moves = [...this.moves, ...classMoves]
  }

  /**
   * Infer move type from move name (helper for basic moves)
   */
  private inferMoveType(moveName: string): MoveType {
    const name = moveName.toLowerCase()
    if (
      name.includes('hack') ||
      name.includes('slash') ||
      name.includes('volley')
    )
      return 'combat'
    if (name.includes('parley')) return 'social'
    if (name.includes('spout') || name.includes('discern')) return 'exploration'
    if (name.includes('defend')) return 'defensive'
    if (name.includes('aid') || name.includes('interfere')) return 'utility'
    if (name.includes('defy')) return 'utility'
    return 'utility'
  }

  /**
   * Get all moves in the compendium
   */
  getAllMoves(): CompendiumMove[] {
    return [...this.moves]
  }

  /**
   * Get moves available to a character of a specific class and level
   */
  getAvailableMoves(
    characterClass: CharacterClass,
    level: number,
  ): CompendiumMove[] {
    return this.moves.filter((move) => {
      // Basic moves are always available
      if (move.category === 'basic') return true

      // Check class requirement
      if (move.requiresClass && move.requiresClass !== characterClass)
        return false

      // Check level requirement
      if (move.level && move.level > level) return false

      return true
    })
  }

  /**
   * Search moves with multiple criteria
   */
  searchMoves(options: MoveSearchOptions): CompendiumMove[] {
    let results = [...this.moves]

    // Text search
    if (options.query) {
      const query = options.query.toLowerCase()
      results = results.filter(
        (move) =>
          move.name.toLowerCase().includes(query) ||
          move.description.toLowerCase().includes(query) ||
          move.trigger.toLowerCase().includes(query) ||
          (move.tags &&
            move.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    // Category filter
    if (options.category) {
      results = results.filter((move) => move.category === options.category)
    }

    // Type filter
    if (options.type) {
      results = results.filter((move) => move.type === options.type)
    }

    // Trigger type filter
    if (options.triggerType) {
      results = results.filter(
        (move) => move.triggerType === options.triggerType,
      )
    }

    // Class filter
    if (options.characterClass) {
      results = results.filter(
        (move) =>
          move.requiresClass === options.characterClass ||
          move.category === 'basic',
      )
    }

    // Level filter
    if (options.level !== undefined) {
      results = results.filter(
        (move) => !move.level || move.level <= options.level!,
      )
    }

    // Roll stat filter
    if (options.rollStat) {
      results = results.filter((move) => move.rollStat === options.rollStat)
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      results = results.filter(
        (move) =>
          move.tags && options.tags!.some((tag) => move.tags!.includes(tag)),
      )
    }

    // Source filter
    if (options.source) {
      results = results.filter((move) => move.source === options.source)
    }

    // Custom filter
    if (options.custom !== undefined) {
      results = results.filter((move) => move.custom === options.custom)
    }

    return results
  }

  /**
   * Get moves by class
   */
  getMovesByClass(characterClass: CharacterClass): CompendiumMove[] {
    return this.moves.filter(
      (move) =>
        move.requiresClass === characterClass || move.category === 'basic',
    )
  }

  /**
   * Get moves by level
   */
  getMovesByLevel(level: number): CompendiumMove[] {
    return this.moves.filter((move) => !move.level || move.level <= level)
  }

  /**
   * Get moves by category
   */
  getMovesByCategory(category: MoveCategory): CompendiumMove[] {
    return this.moves.filter((move) => move.category === category)
  }

  /**
   * Get moves by type
   */
  getMovesByType(type: MoveType): CompendiumMove[] {
    return this.moves.filter((move) => move.type === type)
  }

  /**
   * Get a specific move by ID
   */
  getMoveById(id: string): CompendiumMove | undefined {
    return this.moves.find((move) => move.id === id)
  }

  /**
   * Add a custom move to the compendium
   */
  addCustomMove(move: Omit<CompendiumMove, 'id' | 'custom'>): CompendiumMove {
    const customMove: CompendiumMove = {
      ...move,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      custom: true,
    }

    this.moves.push(customMove)
    return customMove
  }

  /**
   * Update a custom move
   */
  updateCustomMove(id: string, updates: Partial<CompendiumMove>): boolean {
    const moveIndex = this.moves.findIndex((m) => m.id === id && m.custom)
    if (moveIndex === -1) return false

    this.moves[moveIndex] = { ...this.moves[moveIndex], ...updates }
    return true
  }

  /**
   * Delete a custom move
   */
  deleteCustomMove(id: string): boolean {
    const initialLength = this.moves.length
    this.moves = this.moves.filter((m) => !(m.id === id && m.custom))
    return this.moves.length < initialLength
  }

  /**
   * Get all move categories
   */
  getMoveCategories(): MoveCategory[] {
    return ['basic', 'class', 'advanced', 'master', 'special', 'custom']
  }

  /**
   * Get all move types
   */
  getMoveTypes(): MoveType[] {
    return [
      'combat',
      'social',
      'exploration',
      'utility',
      'defensive',
      'offensive',
      'movement',
      'magical',
      'ritual',
      'special',
    ]
  }

  /**
   * Get all trigger types
   */
  getTriggerTypes(): MoveTrigger[] {
    return ['action', 'roll', 'passive', 'reactive', 'special']
  }

  /**
   * Compare two moves
   */
  compareMoves(move1Id: string, move2Id: string): MoveComparison | null {
    const move1 = this.getMoveById(move1Id)
    const move2 = this.getMoveById(move2Id)

    if (!move1 || !move2) return null

    const similarities: string[] = []
    const differences: string[] = []
    const recommendations: string[] = []

    // Compare categories
    if (move1.category === move2.category) {
      similarities.push(`Both are ${move1.category} moves`)
    } else {
      differences.push(
        `${move1.name} is a ${move1.category} move, ${move2.name} is a ${move2.category} move`,
      )
    }

    // Compare types
    if (move1.type === move2.type) {
      similarities.push(`Both are ${move1.type} type moves`)
    } else {
      differences.push(
        `${move1.name} is a ${move1.type} move, ${move2.name} is a ${move2.type} move`,
      )
    }

    // Compare trigger types
    if (move1.triggerType === move2.triggerType) {
      similarities.push(`Both are ${move1.triggerType} trigger moves`)
    } else {
      differences.push(
        `${move1.name} is a ${move1.triggerType} trigger, ${move2.name} is a ${move2.triggerType} trigger`,
      )
    }

    // Compare roll stats
    if (move1.rollStat && move2.rollStat) {
      if (move1.rollStat === move2.rollStat) {
        similarities.push(`Both use ${move1.rollStat} for rolls`)
      } else {
        differences.push(
          `${move1.name} uses ${move1.rollStat}, ${move2.name} uses ${move2.rollStat}`,
        )
      }
    }

    // Generate recommendations
    if (move1.category === 'basic' && move2.category !== 'basic') {
      recommendations.push(
        `${move1.name} is a basic move available to all characters`,
      )
    }
    if (move2.category === 'basic' && move1.category !== 'basic') {
      recommendations.push(
        `${move2.name} is a basic move available to all characters`,
      )
    }

    return {
      move1,
      move2,
      similarities,
      differences,
      recommendations,
    }
  }

  /**
   * Validate if a character can take a specific move
   */
  validateMovePrerequisites(
    moveId: string,
    characterClass: CharacterClass,
    level: number,
    currentMoves: string[],
    stats: Record<Attribute, number>,
  ): PrerequisiteCheck {
    const move = this.getMoveById(moveId)
    if (!move) {
      return {
        canTake: false,
        missingPrerequisites: ['Move not found'],
        levelRequirement: false,
        classRequirement: false,
        statRequirement: false,
      }
    }

    const missingPrerequisites: string[] = []
    let canTake = true

    // Check level requirement
    const levelRequirement = !move.level || move.level <= level
    if (!levelRequirement) {
      missingPrerequisites.push(
        `Requires level ${move.level}, character is level ${level}`,
      )
      canTake = false
    }

    // Check class requirement
    const classRequirement =
      !move.requiresClass || move.requiresClass === characterClass
    if (!classRequirement) {
      missingPrerequisites.push(
        `Requires ${move.requiresClass} class, character is ${characterClass}`,
      )
      canTake = false
    }

    // Check stat requirement
    let statRequirement = true
    if (move.requiresStat) {
      const currentStat = stats[move.requiresStat.stat]
      statRequirement = currentStat >= move.requiresStat.value
      if (!statRequirement) {
        missingPrerequisites.push(
          `Requires ${move.requiresStat.stat} ${move.requiresStat.value}, character has ${currentStat}`,
        )
        canTake = false
      }
    }

    // Check prerequisite moves
    if (move.requiresMove) {
      for (const requiredMove of move.requiresMove) {
        if (!currentMoves.includes(requiredMove)) {
          missingPrerequisites.push(`Requires move: ${requiredMove}`)
          canTake = false
        }
      }
    }

    return {
      canTake,
      missingPrerequisites,
      levelRequirement,
      classRequirement,
      statRequirement,
    }
  }

  /**
   * Get recommended moves for a character
   */
  getRecommendedMoves(
    characterClass: CharacterClass,
    level: number,
    currentMoves: string[],
    playstyle?: MoveType,
  ): CompendiumMove[] {
    const availableMoves = this.getAvailableMoves(characterClass, level)
    const takenMoves = new Set(currentMoves)

    // Filter out already taken moves
    const untakenMoves = availableMoves.filter(
      (move) => !takenMoves.has(move.id),
    )

    // If playstyle is specified, prioritize moves of that type
    if (playstyle) {
      const playstyleMoves = untakenMoves.filter(
        (move) => move.type === playstyle,
      )
      const otherMoves = untakenMoves.filter((move) => move.type !== playstyle)
      return [...playstyleMoves, ...otherMoves]
    }

    return untakenMoves
  }

  /**
   * Get move statistics
   */
  getMoveStatistics(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.moves.length,
      basic: 0,
      class: 0,
      advanced: 0,
      master: 0,
      special: 0,
      custom: 0,
    }

    for (const move of this.moves) {
      stats[move.category]++
    }

    return stats
  }

  /**
   * Validate a custom move
   */
  validateCustomMove(move: CompendiumMove): MoveValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Required fields
    if (!move.name || move.name.trim() === '') {
      errors.push('Move name is required')
    }

    if (!move.description || move.description.trim() === '') {
      errors.push('Move description is required')
    }

    if (!move.trigger || move.trigger.trim() === '') {
      errors.push('Move trigger is required')
    }

    // Check for duplicate names
    const existingMove = this.moves.find(
      (m) => m.name.toLowerCase() === move.name.toLowerCase(),
    )
    if (existingMove) {
      warnings.push('A move with this name already exists')
    }

    // Validate roll requirements
    if (move.triggerType === 'roll' && !move.rollStat) {
      warnings.push('Roll moves should specify which stat to roll with')
    }

    // Suggestions
    if (!move.tags || move.tags.length === 0) {
      suggestions.push(
        'Consider adding tags to help with organization and search',
      )
    }

    if (!move.onSuccess && move.triggerType === 'roll') {
      suggestions.push(
        'Roll moves typically have success, partial, and failure results',
      )
    }

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      warnings,
      suggestions,
    }
  }
}

// Export singleton instance
export const moveCompendiumService = new MoveCompendiumService()
