/**
 * Move Compendium Tests
 *
 * Comprehensive tests for the move compendium data and functionality.
 */

import { beforeEach,describe, expect, it } from 'vitest';

import {
  BASIC_MOVES,
  CLERIC_MOVES,
  FIGHTER_MOVES,
  getAvailableMoves,
  getMoveById,
  getMovesByCategory,
  getMovesByClass,
  getMovesByLevel,
  getMovesByType,
  MOVE_COMPENDIUM,
  searchMoves,
  SPECIAL_MOVES,
  WIZARD_MOVES,
} from '../../src / data / moveCompendium';
import { CompendiumMove } from '../../src / data / moveCompendium';
import { Attribute,Character, CharacterClass } from '../../src / models / Character';
import {
  calculateMoveStatistics,
  canTakeMove,
  checkMoveCompatibility,
  getAvailableMovesForCharacter,
  getMoveSuggestions,
  getRecommendedMoves,
  processMoveEffects,
  trackMoveUsage,
  validateCustomMove,
  validateMovePrerequisites,
} from '../../src / utils / moveMechanics';

// Test character data
const createTestCharacter = (overrides: Partial < Character> = {}): Character => ({
  id: 'test - character',
  name: 'Test Character',
  class: 'Fighter' as CharacterClass,
  race: 'Human',
  level: 3,
  alignment: 'Good',
  attributes: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 12,
    WIS: 13,
    CHA: 10,
  },
  debilities: {
    weak: false,
    shaky: false,
    sick: false,
    stunned: false,
    confused: false,
    scarred: false,
  },
  hp: { current: 20, max: 20 },
  armor: 2,
  damageDie: 'd10',
  xp: 6,
  load: { current: 5, max: 8 },
  baseLoad: 6,
  coin: 50,
  bonds: [],
  advancements: [],
  knownMoves: ['hack_and_slash', 'defy_danger'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Move Compendium Data', () => {
  describe('Basic Moves', () => {
    it('should contain all basic moves', () => {
      expect(BASIC_MOVES).toBeDefined();
      expect(BASIC_MOVES.length).toBeGreaterThan(0);

      const basicMoveIds = BASIC_MOVES.map(move => move.id);
      expect(basicMoveIds).toContain('hack_and_slash');
      expect(basicMoveIds).toContain('volley');
      expect(basicMoveIds).toContain('defy_danger');
      expect(basicMoveIds).toContain('parley');
      expect(basicMoveIds).toContain('spout_lore');
      expect(basicMoveIds).toContain('discern_realities');
    });

    it('should have correct structure for basic moves', () => {
      const hackAndSlash = BASIC_MOVES.find(move => move.id === 'hack_and_slash');
      expect(hackAndSlash).toBeDefined();
      expect(hackAndSlash?.category).toBe('basic');
      expect(hackAndSlash?.type).toBe('combat');
      expect(hackAndSlash?.triggerType).toBe('action');
      expect(hackAndSlash?.rollStat).toBe('STR');
    });
  });

  describe('Class Moves', () => {
    it('should contain fighter moves', () => {
      expect(FIGHTER_MOVES).toBeDefined();
      expect(FIGHTER_MOVES.length).toBeGreaterThan(0);

      const _fighterMove = FIGHTER_MOVES[0];
      expect(fighterMove.category).toBe('class');
      expect(fighterMove.requiresClass).toBe('Fighter');
    });

    it('should contain wizard moves', () => {
      expect(WIZARD_MOVES).toBeDefined();
      expect(WIZARD_MOVES.length).toBeGreaterThan(0);

      const _wizardMove = WIZARD_MOVES[0];
      expect(wizardMove.category).toBe('class');
      expect(wizardMove.requiresClass).toBe('Wizard');
    });

    it('should contain cleric moves', () => {
      expect(CLERIC_MOVES).toBeDefined();
      expect(CLERIC_MOVES.length).toBeGreaterThan(0);

      const clericMove = CLERIC_MOVES[0];
      expect(clericMove.category).toBe('class');
      expect(clericMove.requiresClass).toBe('Cleric');
    });
  });

  describe('Special Moves', () => {
    it('should contain special moves', () => {
      expect(SPECIAL_MOVES).toBeDefined();
      expect(SPECIAL_MOVES.length).toBeGreaterThan(0);

      const specialMoveIds = SPECIAL_MOVES.map(move => move.id);
      expect(specialMoveIds).toContain('level_up');
      expect(specialMoveIds).toContain('end_of_session');
      expect(specialMoveIds).toContain('last_breath');
    });
  });

  describe('Move Compendium Functions', () => {
    it('should get moves by class', () => {
      const fighterMoves = getMovesByClass('Fighter');
      expect(fighterMoves).toBeDefined();
      expect(fighterMoves.length).toBeGreaterThan(0);
      expect(fighterMoves.every(move => move.requiresClass === 'Fighter')).toBe(true);
    });

    it('should get moves by level', () => {
      const level1Moves = getMovesByLevel(1);
      expect(level1Moves).toBeDefined();
      expect(level1Moves.length).toBeGreaterThan(0);
      expect(level1Moves.every(move => move.level === 1)).toBe(true);
    });

    it('should get moves by category', () => {
      const basicMoves = getMovesByCategory('basic');
      expect(basicMoves).toBeDefined();
      expect(basicMoves.length).toBeGreaterThan(0);
      expect(basicMoves.every(move => move.category === 'basic')).toBe(true);
    });

    it('should get moves by type', () => {
      const combatMoves = getMovesByType('combat');
      expect(combatMoves).toBeDefined();
      expect(combatMoves.length).toBeGreaterThan(0);
      expect(combatMoves.every(move => move.type === 'combat')).toBe(true);
    });

    it('should search moves', () => {
      const searchResults = searchMoves('hack');
      expect(searchResults).toBeDefined();
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(move => move.name.toLowerCase().includes('hack'))).toBe(true);
    });

    it('should get move by ID', () => {
      const _move = getMoveById('hack_and_slash');
      expect(move).toBeDefined();
      expect(move?.id).toBe('hack_and_slash');
      expect(move?.name).toBe('Hack and Slash');
    });

    it('should get available moves for character', () => {
      const character = createTestCharacter();
      const _availableMoves = getAvailableMoves(character.class, character.level);
      expect(availableMoves).toBeDefined();
      expect(availableMoves.length).toBeGreaterThan(0);
    });
  });
});

describe('Move Mechanics', () => {
  let testCharacter: Character;
  let testMove: CompendiumMove;

  beforeEach(() => {
    testCharacter = createTestCharacter();
    testMove = {
      id: 'test_move',
      name: 'Test Move',
      category: 'class',
      type: 'combat',
      description: 'A test move for testing',
      trigger: 'When you test something',
      triggerType: 'action',
      level: 2,
      requiresClass: 'Fighter',
      rollStat: 'STR',
      onSuccess: 'You succeed',
      onPartial: 'You partially succeed',
      onFailure: 'You fail',
    };
  });

  describe('canTakeMove', () => {
    it('should allow taking a move when all requirements are met', () => {
      const _result = canTakeMove(testMove, testCharacter);
      expect(result.canTake).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should prevent taking a move when level requirement is not met', () => {
      const _highLevelMove =  { ...testMove, level: 5 };
      const _result = canTakeMove(highLevelMove, testCharacter);
      expect(result.canTake).toBe(false);
      expect(result.errors).toContain('Requires level 5 (current: 3)');
    });

    it('should prevent taking a move when class requirement is not met', () => {
      const wizardMove = { ...testMove, requiresClass: 'Wizard' };
      const _result = canTakeMove(wizardMove, testCharacter);
      expect(result.canTake).toBe(false);
      expect(result.errors).toContain('Requires Wizard class (current: Fighter)');
    });

    it('should prevent taking a move when stat requirement is not met', () => {
      const statMove = {
        ...testMove,
        requiresStat: { stat: 'STR' as Attribute, value: 18 },
      };
      const _result = canTakeMove(statMove, testCharacter);
      expect(result.canTake).toBe(false);
      expect(result.errors).toContain('Requires STR 18 (current: 16)');
    });

    it('should prevent taking a move when prerequisite moves are missing', () => {
      const prereqMove = {
        ...testMove,
        requiresMove: ['missing_move'],
      };
      const _result = canTakeMove(prereqMove, testCharacter);
      expect(result.canTake).toBe(false);
      expect(result.errors).toContain('Missing prerequisite moves: missing_move');
    });

    it('should warn when move is already known', () => {
      const knownMove = { ...testMove, id: 'hack_and_slash' };
      const _result = canTakeMove(knownMove, testCharacter);
      expect(result.canTake).toBe(false);
      expect(result.warnings).toContain('Move is already known');
    });
  });

  describe('processMoveEffects', () => {
    it('should process ongoing effects', () => {
      const ongoingMove = { ...testMove, ongoing: 2 };
      const _result = processMoveEffects(ongoingMove, testCharacter);
      expect(result.modifiers.ongoing).toBe(2);
      expect(result.effects).toContain('Ongoing + 2 modifier');
    });

    it('should process forward effects', () => {
      const forwardMove = { ...testMove, forward: true };
      const _result = processMoveEffects(forwardMove, testCharacter);
      expect(result.modifiers.forward).toBe(1);
      expect(result.effects).toContain('Forward modifier');
    });

    it('should process hold generation', () => {
      const holdMove = { ...testMove, hold: 3 };
      const _result = processMoveEffects(holdMove, testCharacter);
      expect(result.modifiers.hold).toBe(3);
      expect(result.effects).toContain('Generate 3 hold');
    });

    it('should process roll - specific effects', () => {
      const _result = processMoveEffects(testMove, testCharacter, 'success');
      expect(result.messages).toContain('Success: You succeed');
    });
  });

  describe('validateMovePrerequisites', () => {
    it('should return empty array when all prerequisites are met', () => {
      const _errors = validateMovePrerequisites(testMove, testCharacter);
      expect(errors).toHaveLength(0);
    });

    it('should return errors when prerequisites are not met', () => {
      const highLevelMove = { ...testMove, level: 5 };
      const errors = validateMovePrerequisites(highLevelMove, testCharacter);
      expect(errors).toContain('Level 5 required');
    });
  });

  describe('getAvailableMovesForCharacter', () => {
    it('should return moves that character can take', () => {
      const _allMoves =  [testMove, { ...testMove, id: 'high_level', level: 5 }];
      const availableMoves = getAvailableMovesForCharacter(testCharacter, allMoves);
      expect(availableMoves).toHaveLength(1);
      expect(availableMoves[0].id).toBe('test_move');
    });
  });

  describe('getRecommendedMoves', () => {
    it('should prioritize level - appropriate moves', () => {
      const _allMoves = [
        { ...testMove, id: 'level3', level: 3 },
        { ...testMove, id: 'level5', level: 5 },
        { ...testMove, id: 'level1', level: 1 },
      ];
      const recommendedMoves = getRecommendedMoves(testCharacter, allMoves);
      expect(recommendedMoves[0].id).toBe('level3');
    });
  });

  describe('trackMoveUsage', () => {
    it('should create move usage record', () => {
      const usage = trackMoveUsage('test_move', 'test - character', true, 'success', 12);
      expect(usage.moveId).toBe('test_move');
      expect(usage.success).toBe(true);
      expect(usage.rollResult).toBe('success');
      expect(usage.rollValue).toBe(12);
      expect(usage.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('calculateMoveStatistics', () => {
    it('should calculate statistics from move history', () => {
      const moveHistory = {
        characterId: 'test - character',
        moves: [
          trackMoveUsage('move1', 'test - character', true, 'success', 10),
          trackMoveUsage('move1', 'test - character', false, 'failure', 5),
          trackMoveUsage('move2', 'test - character', true, 'partial', 8),
        ],
        statistics: { totalUses: 0, successRate: 0, averageRoll: 0, mostUsedMoves: [] },
      };

      const stats = calculateMoveStatistics(moveHistory);
      expect(stats.totalUses).toBe(3);
      expect(stats.successRate).toBeCloseTo(66.67, 1);
      expect(stats.averageRoll).toBeCloseTo(7.67, 1);
      expect(stats.mostUsedMoves).toHaveLength(2);
      expect(stats.mostUsedMoves[0].moveId).toBe('move1');
    });
  });

  describe('checkMoveCompatibility', () => {
    it('should detect compatible moves', () => {
      const _move1 =  { ...testMove, id: 'move1', ongoing: 1 };
      const _move2 =  { ...testMove, id: 'move2', forward: true };

      const _compatibility = checkMoveCompatibility(move1, move2);
      expect(compatibility.compatible).toBe(true);
      expect(compatibility.synergies).toContain('Ongoing and forward modifiers complement each other');
    });

    it('should detect conflicting moves', () => {
      const move1 = { ...testMove, id: 'move1' };
      const move2 = { ...testMove, id: 'move2', replaces: 'move1' };

      const compatibility = checkMoveCompatibility(move1, move2);
      expect(compatibility.conflicts).toContain('One move replaces the other');
    });
  });

  describe('getMoveSuggestions', () => {
    it('should provide move suggestions by type', () => {
      const allMoves = [
        { ...testMove, id: 'offensive1', type: 'offensive' },
        { ...testMove, id: 'defensive1', type: 'defensive' },
        { ...testMove, id: 'utility1', type: 'utility' },
      ];

      const suggestions = getMoveSuggestions(testCharacter, allMoves, []);
      expect(suggestions.offensive).toHaveLength(1);
      expect(suggestions.defensive).toHaveLength(1);
      expect(suggestions.utility).toHaveLength(1);
    });
  });

  describe('validateCustomMove', () => {
    it('should validate required fields', () => {
      const invalidMove = { id: 'custom_move' };
      const _result = validateCustomMove(invalidMove);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Move name is required');
      expect(result.errors).toContain('Move description is required');
      expect(result.errors).toContain('Move trigger is required');
    });

    it('should validate move with all required fields', () => {
      const validMove = {
        name: 'Custom Move',
        description: 'A custom move',
        trigger: 'When you do something',
        category: 'custom' as const,
        type: 'utility' as const,
        triggerType: 'action' as const,
      };
      const _result = validateCustomMove(validMove);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about extreme values', () => {
      const extremeMove = {
        name: 'Extreme Move',
        description: 'A move with extreme values',
        trigger: 'When you do something extreme',
        category: 'custom' as const,
        type: 'utility' as const,
        triggerType: 'action' as const,
        rollModifier: 10,
        hold: 15,
        armor: 5,
      };
      const result = validateCustomMove(extremeMove);
      expect(result.warnings).toContain('Roll modifier should be between - 5 and + 5');
      expect(result.warnings).toContain('Hold should be between 1 and 10');
      expect(result.warnings).toContain('Armor should be between 0 and 3');
    });
  });
});

describe('Move Compendium Integration', () => {
  it('should have consistent move data structure', () => {
    for (const move of MOVE_COMPENDIUM) {
      expect(move.id).toBeDefined();
      expect(move.name).toBeDefined();
      expect(move.category).toBeDefined();
      expect(move.type).toBeDefined();
      expect(move.description).toBeDefined();
      expect(move.trigger).toBeDefined();
      expect(move.triggerType).toBeDefined();
    }
  });

  it('should have unique move IDs', () => {
    const moveIds = MOVE_COMPENDIUM.map(move => move.id);
    const uniqueIds = new Set(moveIds);
    expect(uniqueIds.size).toBe(moveIds.length);
  });

  it('should have valid category and type combinations', () => {
    const validCategories = ['basic', 'class', 'advanced', 'master', 'special', 'custom'];
    const validTypes = ['combat', 'social', 'exploration', 'utility', 'defensive', 'offensive', 'movement', 'magical', 'ritual', 'special'];

    for (const move of MOVE_COMPENDIUM) {
      expect(validCategories).toContain(move.category);
      expect(validTypes).toContain(move.type);
    }
  });

  it('should have valid trigger types', () => {
    const validTriggerTypes = ['action', 'roll', 'passive', 'reactive', 'special'];

    for (const move of MOVE_COMPENDIUM) {
      expect(validTriggerTypes).toContain(move.triggerType);
    }
  });
});
