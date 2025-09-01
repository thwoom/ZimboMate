/**
 * Move Mechanics Utility
 *
 * Provides utility functions for move validation, prerequisite checking,
 * effects processing, and mechanical integration with character data.
 */

import { CharacterClass, Attribute, Character } from '../models/Character';
import { CompendiumMove, MoveCategory, MoveType, MoveTrigger } from '../data/moveCompendium';

// Move validation result
export interface MoveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  canTake: boolean;
  missingPrerequisites: string[];
}

// Move effect processing result
export interface MoveEffectResult {
  success: boolean;
  effects: string[];
  modifiers: {
    armor?: number;
    damage?: string;
    ongoing?: number;
    forward?: number;
    hold?: number;
  };
  messages: string[];
}

// Move usage tracking
export interface MoveUsage {
  moveId: string;
  timestamp: Date;
  success: boolean;
  rollResult?: 'success' | 'partial' | 'failure';
  rollValue?: number;
  notes?: string;
}

// Move history for a character
export interface MoveHistory {
  characterId: string;
  moves: MoveUsage[];
  statistics: {
    totalUses: number;
    successRate: number;
    averageRoll: number;
    mostUsedMoves: Array<{ moveId: string; count: number }>;
  };
}

/**
 * Check if a character can take a specific move
 */
export function canTakeMove(
  move: CompendiumMove,
  character: Character,
): MoveValidationResult {
  const result: MoveValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    canTake: true,
    missingPrerequisites: [],
  };

  // Check level requirement
  if (move.level && character.level < move.level) {
    result.errors.push(`Requires level ${move.level} (current: ${character.level})`);
    result.canTake = false;
  }

  // Check class requirement
  if (move.requiresClass && character.class !== move.requiresClass) {
    result.errors.push(`Requires ${move.requiresClass} class (current: ${character.class})`);
    result.canTake = false;
  }

  // Check stat requirement
  if (move.requiresStat) {
    if (currentStat < move.requiresStat.value) {
      result.errors.push(
        `Requires ${move.requiresStat.stat} ${move.requiresStat.value} (current: ${currentStat})`,
      );
      result.canTake = false;
    }
  }

  // Check prerequisite moves
  if (move.requiresMove && move.requiresMove.length > 0) {
    const missingMoves = move.requiresMove.filter(
      requiredMoveId => !character.knownMoves.includes(requiredMoveId),
    );

    if (missingMoves.length > 0) {
      result.errors.push(`Missing prerequisite moves: ${missingMoves.join(', ')}`);
      result.missingPrerequisites = missingMoves;
      result.canTake = false;
    }
  }

  // Check if move is already known
  if (character.knownMoves.includes(move.id)) {
    result.warnings.push('Move is already known');
    result.canTake = false;
  }

  // Check if move replaces another move
  if (move.replaces && !character.knownMoves.includes(move.replaces)) {
    result.warnings.push(`This move replaces ${move.replaces}, but you don't have that move`);
  }

  // Generate suggestions
  if (!result.canTake) {
    if (move.level && character.level < move.level) {
      result.suggestions.push(`Level up to ${move.level} to take this move`);
    }

    if (move.requiresStat) {
      const needed = move.requiresStat.value-currentStat;
      if (needed > 0) {
        result.suggestions.push(`Increase ${move.requiresStat.stat} by ${needed} to meet the requirement`);
      }
    }

    if (result.missingPrerequisites.length > 0) {
      result.suggestions.push('Take the prerequisite moves first');
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Process move effects and return mechanical results
 */
export function processMoveEffects(
  move: CompendiumMove,
  character: Character,
  rollResult?: 'success' | 'partial' | 'failure',
): MoveEffectResult {
  const result: MoveEffectResult = {
    success: true,
    effects: [],
    modifiers: {},
    messages: [],
  };

  // Process ongoing effects
  if (move.ongoing) {
    result.modifiers.ongoing = move.ongoing;
    result.effects.push(`Ongoing +${move.ongoing} modifier`);
  }

  // Process forward effects
  if (move.forward) {
    result.modifiers.forward = 1;
    result.effects.push('Forward modifier');
  }

  // Process hold generation
  if (move.hold) {
    result.modifiers.hold = move.hold;
    result.effects.push(`Generate ${move.hold} hold`);
  }

  // Process armor effects
  if (move.armor) {
    result.modifiers.armor = move.armor;
    result.effects.push(`+${move.armor} armor`);
  }

  // Process damage effects
  if (move.damage) {
    result.modifiers.damage = move.damage;
    result.effects.push(`Damage: ${move.damage}`);
  }

  // Process roll-specific effects
  if (rollResult) {
    switch (rollResult) {
      case 'success':
        if (move.onSuccess) {
          result.messages.push(`Success: ${move.onSuccess}`);
        }
        break;
      case 'partial':
        if (move.onPartial) {
          result.messages.push(`Partial: ${move.onPartial}`);
        }
        break;
      case 'failure':
        if (move.onFailure) {
          result.messages.push(`Failure: ${move.onFailure}`);
        }
        break;
    }
  }

  // Process special effects
  if (move.effects && move.effects.length > 0) {
    result.effects.push(...move.effects);
  }

  return result;
}

/**
 * Validate move prerequisites for a character
 */
export function validateMovePrerequisites(
  move: CompendiumMove,
  character: Character,
): string[] {
  const errors: string[] = [];

  // Level check
  if (move.level && character.level < move.level) {
    errors.push(`Level ${move.level} required`);
  }

  // Class check
  if (move.requiresClass && character.class !== move.requiresClass) {
    errors.push(`${move.requiresClass} class required`);
  }

  // Stat check
  if (move.requiresStat) {
    const currentStat = character.attributes[move.requiresStat.stat];
    if (currentStat < move.requiresStat.value) {
      errors.push(`${move.requiresStat.stat} ${move.requiresStat.value} required`);
    }
  }

  // Prerequisite moves check
  if (move.requiresMove) {
    const missingMoves = move.requiresMove.filter(
      requiredMoveId => !character.knownMoves.includes(requiredMoveId),
    );

    if (missingMoves.length > 0) {
      errors.push(`Missing moves: ${missingMoves.join(', ')}`);
    }
  }

  return errors;
}

/**
 * Get available moves for a character
 */
export function getAvailableMovesForCharacter(
  character: Character,
  allMoves: CompendiumMove[],
): CompendiumMove[] {
  return allMoves.filter(move => {
    const validation = canTakeMove(move, character);
    return validation.canTake;
  });
}

/**
 * Get recommended moves for a character
 */
export function getRecommendedMoves(
  character: Character,
  allMoves: CompendiumMove[],
): CompendiumMove[] {
  // Sort by priority: level-appropriate, class-specific, then others
  return availableMoves.sort((a, b) => {
    // Prioritize moves at character's level
    const aLevelMatch = a.level === character.level;
    const bLevelMatch = b.level === character.level;

    if (aLevelMatch && !bLevelMatch) return -1;
    if (!aLevelMatch && bLevelMatch) return 1;

    // Prioritize class-specific moves
    const aClassMatch = a.requiresClass === character.class;
    const bClassMatch = b.requiresClass === character.class;

    if (aClassMatch && !bClassMatch) return -1;
    if (!aClassMatch && bClassMatch) return 1;

    // Sort by level, then by name
    if (a.level !== b.level) {
      return (a.level || 0) - (b.level || 0);
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * Track move usage
 */
export function trackMoveUsage(
  moveId: string,
  characterId: string,
  success: boolean,
  rollResult?: 'success' | 'partial' | 'failure',
  rollValue?: number,
  notes?: string,
): MoveUsage {
  return {
    moveId,
    timestamp: new Date(),
    success,
    rollResult,
    rollValue,
    notes,
  };
}

/**
 * Calculate move statistics from usage history
 */
export function calculateMoveStatistics(
  moveHistory: MoveHistory,
): MoveHistory['statistics'] {
  const { moves } = moveHistory;

  if (moves.length === 0) {
    return {
      totalUses: 0,
      successRate: 0,
      averageRoll: 0,
      mostUsedMoves: [],
    };
  }

  const totalUses = moves.length;
  const successfulUses = moves.filter(move => move.success).length;
  const successRate = (successfulUses / totalUses) * 100;

  const rollsWithValues = moves.filter(move => move.rollValue !== undefined);
  const averageRoll = rollsWithValues.length > 0
    ? rollsWithValues.reduce((sum, move) => sum + (move.rollValue || 0), 0) / rollsWithValues.length
    : 0;

  // Calculate most used moves
  const moveCounts = new Map < string, number>();
  moves.forEach(move => {
    moveCounts.set(move.moveId, (moveCounts.get(move.moveId) || 0) + 1);
  });

  const mostUsedMoves = Array.from(moveCounts.entries())
    .map(([moveId, count]) => ({ moveId, count }))
    .sort((a, b) => b.count-a.count)
    .slice(0, 5);

  return {
    totalUses,
    successRate,
    averageRoll,
    mostUsedMoves,
  };
}

/**
 * Check if a move is compatible with another move
 */
export function checkMoveCompatibility(
  move1: CompendiumMove,
  move2: CompendiumMove,
): {
  compatible: boolean;
  conflicts: string[];
  synergies: string[];
} {
  const conflicts: string[] = [];
  const synergies: string[] = [];

  // Check for replacement conflicts
  if (move1.replaces === move2.id || move2.replaces === move1.id) {
    conflicts.push('One move replaces the other');
  }

  // Check for similar effects
  if (move1.type === move2.type && move1.category === move2.category) {
    synergies.push('Similar move types may work well together');
  }

  // Check for complementary effects
  if (move1.ongoing && move2.forward) {
    synergies.push('Ongoing and forward modifiers complement each other');
  }

  if (move1.armor && move2.damage) {
    synergies.push('Defensive and offensive moves provide balance');
  }

  return {
    compatible: conflicts.length === 0,
    conflicts,
    synergies,
  };
}

/**
 * Get move suggestions based on character build
 */
export function getMoveSuggestions(
  character: Character,
  allMoves: CompendiumMove[],
  currentMoves: string[],
): {
  offensive: CompendiumMove[];
  defensive: CompendiumMove[];
  utility: CompendiumMove[];
  synergistic: CompendiumMove[];
} {
  const availableMoves = getAvailableMovesForCharacter(character, allMoves);
  const currentMoveObjects = allMoves.filter(move => currentMoves.includes(move.id));

  const offensive = availableMoves.filter(move =>
    move.type === 'offensive' && !currentMoves.includes(move.id),
  ).slice(0, 3);

  const defensive = availableMoves.filter(move =>
    move.type === 'defensive' && !currentMoves.includes(move.id),
  ).slice(0, 3);

  const utility = availableMoves.filter(move =>
    move.type === 'utility' && !currentMoves.includes(move.id),
  ).slice(0, 3);

  // Find synergistic moves
  const synergistic = availableMoves.filter(move => {
    if (currentMoves.includes(move.id)) return false;

    return currentMoveObjects.some(currentMove => {
      const compatibility = checkMoveCompatibility(move, currentMove);
      return compatibility.synergies.length > 0;
    });
  }).slice(0, 3);

  return { offensive, defensive, utility, synergistic };
}

/**
 * Validate custom move creation
 */
export function validateCustomMove(move: Partial < CompendiumMove>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  if (!move.category) {
    errors.push('Move category is required');
  }

  if (!move.type) {
    errors.push('Move type is required');
  }

  if (!move.triggerType) {
    errors.push('Move trigger type is required');
  }

  // Validation rules
  if (move.level && (move.level < 1 || move.level > 10)) {
    errors.push('Level must be between 1 and 10');
  }

  if (move.rollModifier && (move.rollModifier < -5 || move.rollModifier > 5)) {
    warnings.push('Roll modifier should be between-5 and + 5');
  }

  if (move.hold && (move.hold < 1 || move.hold > 10)) {
    warnings.push('Hold should be between 1 and 10');
  }

  if (move.armor && (move.armor < 0 || move.armor > 3)) {
    warnings.push('Armor should be between 0 and 3');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
