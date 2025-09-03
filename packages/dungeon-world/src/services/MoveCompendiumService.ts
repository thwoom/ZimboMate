/**
 * Move Compendium Service
 *
 * Provides advanced functionality for managing and querying the move compendium,
 * including search, filtering, validation, and move comparison.
 */

import {
  CompendiumMove,
  getAvailableMoves,
  getMoveById,
  getMovesByCategory,
  getMovesByClass,
  getMovesByLevel,
  getMovesByType,
  MOVE_COMPENDIUM,
  MoveCategory,
  MoveTrigger,
  MoveType,
  searchMoves,
} from '../data/moveCompendium';
import { Attribute,CharacterClass } from '../models/Character';

// Search and filter options
export interface MoveSearchOptions {
  query?: string;
  category?: MoveCategory;
  type?: MoveType;
  triggerType?: MoveTrigger;
  characterClass?: CharacterClass;
  level?: number;
  rollStat?: Attribute;
  tags?: string[];
  source?: string;
  custom?: boolean;
}

// Move comparison interface
export interface MoveComparison {
  move1: CompendiumMove;
  move2: CompendiumMove;
  similarities: string[];
  differences: string[];
  recommendations: string[];
}

// Move usage statistics
export interface MoveUsageStats {
  moveId: string;
  moveName: string;
  usageCount: number;
  successRate: number;
  averageRoll: number;
  lastUsed?: Date;
  notes?: string;
}

// Move validation interface
export interface MoveValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Move prerequisites check
export interface PrerequisiteCheck {
  canTake: boolean;
  missingPrerequisites: string[];
  levelRequirement: boolean;
  classRequirement: boolean;
  statRequirement: boolean;
}

/**
 * Service class for managing the move compendium
 */
export class MoveCompendiumService {
  private moves: CompendiumMove[] = MOVE_COMPENDIUM;

  /**
   * Get all moves in the compendium
   */
  getAllMoves(): CompendiumMove[] {
    return [...this.moves];
  }

  /**
   * Get moves available to a character of a specific class and level
   */
  getAvailableMoves(characterClass: CharacterClass, level: number): CompendiumMove[] {
    return getAvailableMoves(characterClass, level);
  }

  /**
   * Search moves with multiple criteria
   */
  searchMoves(options: MoveSearchOptions): CompendiumMove[] {
    let results = [...this.moves];

    // Text search
    if (options.query) {
      results = searchMoves(options.query);
    }

    // Category filter
    if (options.category) {
      results = results.filter(move => move.category === options.category);
    }

    // Type filter
    if (options.type) {
      results = results.filter(move => move.type === options.type);
    }

    // Trigger type filter
    if (options.triggerType) {
      results = results.filter(move => move.triggerType === options.triggerType);
    }

    // Class filter
    if (options.characterClass) {
      results = results.filter(move =>
        move.requiresClass === options.characterClass ||
        move.category === 'basic',
      );
    }

    // Level filter
    if (options.level !== undefined) {
      results = results.filter(move =>
        !move.level || move.level <= options.level!,
      );
    }

    // Roll stat filter
    if (options.rollStat) {
      results = results.filter(move => move.rollStat === options.rollStat);
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      results = results.filter(move =>
        move.tags && options.tags!.some(tag => move.tags!.includes(tag)),
      );
    }

    // Source filter
    if (options.source) {
      results = results.filter(move => move.source === options.source);
    }

    // Custom filter
    if (options.custom !== undefined) {
      results = results.filter(move => move.custom === options.custom);
    }

    return results;
  }

  /**
   * Get moves by class
   */
  getMovesByClass(characterClass: CharacterClass): CompendiumMove[] {
    return getMovesByClass(characterClass);
  }

  /**
   * Get moves by level
   */
  getMovesByLevel(level: number): CompendiumMove[] {
    return getMovesByLevel(level);
  }

  /**
   * Get moves by category
   */
  getMovesByCategory(category: MoveCategory): CompendiumMove[] {
    return getMovesByCategory(category);
  }

  /**
   * Get moves by type
   */
  getMovesByType(type: MoveType): CompendiumMove[] {
    return getMovesByType(type);
  }

  /**
   * Get a specific move by ID
   */
  getMoveById(id: string): CompendiumMove | undefined {
    return getMoveById(id);
  }

  /**
   * Get all move categories
   */
  getMoveCategories(): MoveCategory[] {
    return ['basic', 'class', 'advanced', 'master', 'special', 'custom'];
  }

  /**
   * Get all move types
   */
  getMoveTypes(): MoveType[] {
    return [
      'combat', 'social', 'exploration', 'utility', 'defensive',
      'offensive', 'movement', 'magical', 'ritual', 'special',
    ];
  }

  /**
   * Get all trigger types
   */
  getTriggerTypes(): MoveTrigger[] {
    return ['action', 'roll', 'passive', 'reactive', 'special'];
  }

  /**
   * Compare two moves
   */
  compareMoves(move1Id: string, move2Id: string): MoveComparison | null {
    const move1 = this.getMoveById(move1Id);
    const move2 = this.getMoveById(move2Id);

    if (!move1 || !move2) {
      return null;
    }

    const similarities: string[] = [];
    const differences: string[] = [];
    const recommendations: string[] = [];

    // Compare categories
    if (move1.category === move2.category) {
      similarities.push(`Both are ${move1.category} moves`);
    } else {
      differences.push(`${move1.name} is a ${move1.category} move, ${move2.name} is a ${move2.category} move`);
    }

    // Compare types
    if (move1.type === move2.type) {
      similarities.push(`Both are ${move1.type} type moves`);
    } else {
      differences.push(`${move1.name} is a ${move1.type} move, ${move2.name} is a ${move2.type} move`);
    }

    // Compare trigger types
    if (move1.triggerType === move2.triggerType) {
      similarities.push(`Both are ${move1.triggerType} trigger moves`);
    } else {
      differences.push(`${move1.name} is a ${move1.triggerType} trigger, ${move2.name} is a ${move2.triggerType} trigger`);
    }

    // Compare roll stats
    if (move1.rollStat && move2.rollStat) {
      if (move1.rollStat === move2.rollStat) {
        similarities.push(`Both use ${move1.rollStat} for rolls`);
      } else {
        differences.push(`${move1.name} uses ${move1.rollStat}, ${move2.name} uses ${move2.rollStat}`);
      }
    }

    // Compare level requirements
    if (move1.level && move2.level) {
      if (move1.level === move2.level) {
        similarities.push(`Both require level ${move1.level}`);
      } else {
        differences.push(`${move1.name} requires level ${move1.level}, ${move2.name} requires level ${move2.level}`);
      }
    }

    // Compare class requirements
    if (move1.requiresClass && move2.requiresClass) {
      if (move1.requiresClass === move2.requiresClass) {
        similarities.push(`Both are ${move1.requiresClass} moves`);
      } else {
        differences.push(`${move1.name} is for ${move1.requiresClass}, ${move2.name} is for ${move2.requiresClass}`);
      }
    }

    // Generate recommendations
    if (move1.category === 'basic' && move2.category !== 'basic') {
      recommendations.push(`${move1.name} is a basic move available to all characters`);
    }
    if (move2.category === 'basic' && move1.category !== 'basic') {
      recommendations.push(`${move2.name} is a basic move available to all characters`);
    }

    if (move1.level && move2.level && move1.level < move2.level) {
      recommendations.push(`${move1.name} is available at a lower level (${move1.level} vs ${move2.level})`);
    }

    return {
      move1,
      move2,
      similarities,
      differences,
      recommendations,
    };
  }

  /**
   * Validate if a character can take a specific move
   */
  validateMovePrerequisites(
    moveId: string,
    characterClass: CharacterClass,
    level: number,
    currentMoves: string[],
    stats: Record < Attribute, number>,
  ): PrerequisiteCheck {
    const move = this.getMoveById(moveId);
    if (!move) {
      return {
        canTake: false,
        missingPrerequisites: ['Move not found'],
        levelRequirement: false,
        classRequirement: false,
        statRequirement: false,
      };
    }

    const missingPrerequisites: string[] = [];
    let canTake = true;

    // Check level requirement
    const levelRequirement = !move.level || move.level <= level;
    if (!levelRequirement) {
      missingPrerequisites.push(`Requires level ${move.level}, character is level ${level}`);
      canTake = false;
    }

    // Check class requirement
    const classRequirement = !move.requiresClass || move.requiresClass === characterClass;
    if (!classRequirement) {
      missingPrerequisites.push(`Requires ${move.requiresClass} class, character is ${characterClass}`);
      canTake = false;
    }

    // Check stat requirement
    let statRequirement = true;
    if (move.requiresStat) {
      const currentStat = stats[move.requiresStat.stat];
      statRequirement = currentStat >= move.requiresStat.value;
      if (!statRequirement) {
        missingPrerequisites.push(`Requires ${move.requiresStat.stat} ${move.requiresStat.value}, character has ${currentStat}`);
        canTake = false;
      }
    }

    // Check prerequisite moves
    if (move.requiresMove) {
      for (const requiredMove of move.requiresMove) {
        if (!currentMoves.includes(requiredMove)) {
          missingPrerequisites.push(`Requires move: ${requiredMove}`);
          canTake = false;
        }
      }
    }

    return {
      canTake,
      missingPrerequisites,
      levelRequirement,
      classRequirement,
      statRequirement,
    };
  }

  /**
   * Get recommended moves for a character
   */
  getRecommendedMoves(
    characterClass: CharacterClass,
    level: number,
    currentMoves: string[],
    playstyle?: 'combat' | 'social' | 'exploration' | 'support',
  ): CompendiumMove[] {
    const availableMoves = this.getAvailableMoves(characterClass, level);
    const takenMoves = new Set(currentMoves);

    // Filter out already taken moves
    const untakenMoves = availableMoves.filter(move => !takenMoves.has(move.id));

    // If playstyle is specified, prioritize moves of that type
    if (playstyle) {
      const playstyleMoves = untakenMoves.filter(move => move.type === playstyle);
      const otherMoves = untakenMoves.filter(move => move.type !== playstyle);
      return [...playstyleMoves, ...otherMoves];
    }

    return untakenMoves;
  }

  /**
   * Get moves that synergize with a given move
   */
  getSynergisticMoves(moveId: string, characterClass: CharacterClass, level: number): CompendiumMove[] {
    const move = this.getMoveById(moveId);
    if (!move) return [];

    const availableMoves = this.getAvailableMoves(characterClass, level);
    const synergistic: CompendiumMove[] = [];

    for (const availableMove of availableMoves) {
      if (availableMove.id === moveId) continue;

      // Check for synergies based on type
      if (move.type === availableMove.type) {
        synergistic.push(availableMove);
        continue;
      }

      // Check for synergies based on roll stat
      if (move.rollStat && move.rollStat === availableMove.rollStat) {
        synergistic.push(availableMove);
        continue;
      }

      // Check for synergies based on tags
      if (move.tags && availableMove.tags) {
        const commonTags = move.tags.filter(tag => availableMove.tags!.includes(tag));
        if (commonTags.length > 0) {
          synergistic.push(availableMove);
        }
      }
    }

    return synergistic;
  }

  /**
   * Get move statistics and usage data
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
    };

    for (const move of this.moves) {
      stats[move.category]++;
    }

    return stats;
  }

  /**
   * Create a custom move
   */
  createCustomMove(moveData: Partial < CompendiumMove>): CompendiumMove {
    const customMove: CompendiumMove = {
      id: `custom_${Date.now()}`,
      name: moveData.name || 'Custom Move',
      category: 'custom',
      type: moveData.type || 'utility',
      description: moveData.description || '',
      trigger: moveData.trigger || '',
      triggerType: moveData.triggerType || 'action',
      tags: moveData.tags || [],
      custom: true,
      ...moveData,
    };

    return customMove;
  }

  /**
   * Validate a custom move
   */
  validateCustomMove(move: CompendiumMove): MoveValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields
    if (!move.name || move.name.trim() === '') {
      errors.push('Move name is required');
    }

    if (!move.description || move.description.trim() === '') {
      errors.push('Move description is required');
    }

    if (!move.trigger || move.trigger.trim() === '') {
      errors.push('Move trigger is required');
    }

    // Check for duplicate names
    const existingMove = this.moves.find(m => m.name.toLowerCase() === move.name.toLowerCase());
    if (existingMove) {
      warnings.push('A move with this name already exists');
    }

    // Validate roll requirements
    if (move.triggerType === 'roll' && !move.rollStat) {
      warnings.push('Roll moves should specify which stat to roll with');
    }

    // Suggestions
    if (!move.tags || move.tags.length === 0) {
      suggestions.push('Consider adding tags to help with organization and search');
    }

    if (!move.onSuccess && move.triggerType === 'roll') {
      suggestions.push('Roll moves typically have success, partial, and failure results');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      suggestions,
    };
  }
}

// Export singleton instance
export const moveCompendiumService = new MoveCompendiumService();



