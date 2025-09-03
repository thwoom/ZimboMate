import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConditionSource, DebilityType, DurationType, OngoingEffect,OngoingEffectType } from '../../src/models/Condition';
import { conditionService } from '../../src/services/ConditionService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock window object for Node.js test environment
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('ConditionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Ensure isolated state between tests
    conditionService.clearAll();
  });

  describe('createCondition', () => {
    it('should create a debility condition', () => {
      const debilityOptions = {
        characterId: 'test - character',
        name: 'Weak',
        description: 'Character is weak',
        type: 'debility' as const,
        debilityType: 'weak' as DebilityType,
        duration: 'permanent' as DurationType,
        source: 'move' as ConditionSource,
      };

      const condition = conditionService.createCondition(debilityOptions);

      expect(condition).toBeDefined();
      expect(condition.type).toBe('debility');
      expect(condition.debilityType).toBe('weak');
      expect(condition.isActive).toBe(true);
      expect(condition.isResolved).toBe(false);
      expect(condition.statModifiers).toEqual({ weak: -1 });
    });

    it('should create an ongoing effect condition', () => {
      const effectOptions = {
        characterId: 'test - character',
        name: '+1 Forward',
        description: 'Character has + 1 forward',
        type: 'ongoing_effect' as const,
        ongoingEffectType: '+1 forward' as OngoingEffectType,
        appliesTo: ['hack and slash'],
        duration: 'until_end_of_scene' as DurationType,
        source: 'spell' as ConditionSource,
      };

      const condition = conditionService.createCondition(effectOptions);

      expect(condition).toBeDefined();
      expect(condition.type).toBe('ongoing_effect');
      expect(condition.ongoingEffectType).toBe('+1 forward');
      expect((condition as OngoingEffect).appliesTo).toEqual(['hack and slash']);
      expect(condition.isActive).toBe(true);
    });

    it('should create a temporary condition', () => {
      const tempOptions = {
        characterId: 'test - character',
        name: 'Blessed',
        description: 'Character is blessed',
        type: 'temporary_condition' as const,
        tempCategory: 'buff' as const,
        duration: 'until_rest' as DurationType,
        source: 'spell' as ConditionSource,
        statModifiers: { CHA: 1 },
      };

      const condition = conditionService.createCondition(tempOptions);

      expect(condition).toBeDefined();
      expect(condition.type).toBe('temporary_condition');
      expect(condition.statModifiers).toEqual({ CHA: 1 });
    });

    it('should throw error for debility without debilityType', () => {
      const invalidOptions = {
        characterId: 'test - character',
        name: 'Invalid',
        description: 'Invalid condition',
        type: 'debility' as const,
        duration: 'permanent' as DurationType,
        source: 'manual' as ConditionSource,
      };

      expect(() => conditionService.createCondition(invalidOptions)).toThrow('Debility type is required');
    });

    it('should throw error for ongoing effect without ongoingEffectType', () => {
      const invalidOptions = {
        characterId: 'test - character',
        name: 'Invalid',
        description: 'Invalid condition',
        type: 'ongoing_effect' as const,
        duration: 'permanent' as DurationType,
        source: 'manual' as ConditionSource,
      };

      expect(() => conditionService.createCondition(invalidOptions)).toThrow('Ongoing effect type is required');
    });
  });

  describe('getConditionsForCharacter', () => {
    it('should return conditions for a specific character', () => {
      // Create test conditions
      const condition1 = conditionService.createCondition({
        characterId: 'char1',
        name: 'Test 1',
        description: 'Test condition 1',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      const condition2 = conditionService.createCondition({
        characterId: 'char2',
        name: 'Test 2',
        description: 'Test condition 2',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      const char1Conditions = conditionService.getConditionsForCharacter('char1');
      const char2Conditions = conditionService.getConditionsForCharacter('char2');

      expect(char1Conditions).toHaveLength(1);
      expect(char1Conditions[0].id).toBe(condition1.id);
      expect(char2Conditions).toHaveLength(1);
      expect(char2Conditions[0].id).toBe(condition2.id);
    });

    it('should filter conditions correctly', () => {
      // Create test conditions
      conditionService.createCondition({
        characterId: 'char1',
        name: 'Active Condition',
        description: 'Active condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      conditionService.createCondition({
        characterId: 'char1',
        name: 'Resolved Condition',
        description: 'Resolved condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      // Resolve the second condition
      const conditions = conditionService.getConditionsForCharacter('char1');
      const resolvedCondition = conditions.find(c => c.name === 'Resolved Condition');
      if (resolvedCondition) {
        conditionService.resolveCondition(resolvedCondition.id);
      }

      const activeConditions = conditionService.getConditionsForCharacter('char1', { isActive: true });
      const resolvedConditions = conditionService.getConditionsForCharacter('char1', { isResolved: true });

      expect(activeConditions).toHaveLength(1);
      expect(activeConditions[0].name).toBe('Active Condition');
      expect(resolvedConditions).toHaveLength(1);
      expect(resolvedConditions[0].name).toBe('Resolved Condition');
    });
  });

  describe('resolveCondition', () => {
    it('should resolve a condition', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Test Condition',
        description: 'Test condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      const resolved = conditionService.resolveCondition(condition.id, 'player');

      expect(resolved).toBe(true);

      const updatedCondition = conditionService.getCondition(condition.id);
      expect(updatedCondition?.isActive).toBe(false);
      expect(updatedCondition?.isResolved).toBe(true);
      expect(updatedCondition?.resolvedBy).toBe('player');
    });

    it('should return false for non - existent condition', () => {
      const resolved = conditionService.resolveCondition('non - existent - id');
      expect(resolved).toBe(false);
    });

    it('should return false for already resolved condition', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Test Condition',
        description: 'Test condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      conditionService.resolveCondition(condition.id);
      const resolvedAgain = conditionService.resolveCondition(condition.id);

      expect(resolvedAgain).toBe(false);
    });
  });

  describe('deleteCondition', () => {
    it('should delete a condition', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Test Condition',
        description: 'Test condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
      });

      const deleted = conditionService.deleteCondition(condition.id);

      expect(deleted).toBe(true);

      const retrievedCondition = conditionService.getCondition(condition.id);
      expect(retrievedCondition).toBeUndefined();
    });

    it('should return false for non - existent condition', () => {
      const deleted = conditionService.deleteCondition('non - existent - id');
      expect(deleted).toBe(false);
    });
  });

  describe('stackCondition', () => {
    it('should stack a condition that supports stacking', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Stackable Condition',
        description: 'Stackable condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
        canStack: true,
        maxStacks: 3,
      });

      const stacked = conditionService.stackCondition(condition.id);

      expect(stacked).toBe(true);

      const updatedCondition = conditionService.getCondition(condition.id);
      expect(updatedCondition?.currentStacks).toBe(2);
    });

    it('should not stack a condition that does not support stacking', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Non - stackable Condition',
        description: 'Non - stackable condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
        canStack: false,
      });

      const stacked = conditionService.stackCondition(condition.id);

      expect(stacked).toBe(false);

      const updatedCondition = conditionService.getCondition(condition.id);
      expect(updatedCondition?.currentStacks).toBe(1);
    });

    it('should not stack beyond max stacks', () => {
      const condition = conditionService.createCondition({
        characterId: 'test - character',
        name: 'Max Stack Condition',
        description: 'Max stack condition',
        type: 'temporary_condition',
        duration: 'permanent',
        source: 'manual',
        canStack: true,
        maxStacks: 2,
      });

      // Stack once
      conditionService.stackCondition(condition.id);

      // Try to stack again (should fail)
      const stacked = conditionService.stackCondition(condition.id);

      expect(stacked).toBe(false);

      const updatedCondition = conditionService.getCondition(condition.id);
      expect(updatedCondition?.currentStacks).toBe(2);
    });
  });

  describe('getConditionStats', () => {
    it('should return correct statistics', () => {
      // Create various conditions
      conditionService.createCondition({
        characterId: 'test - character',
        name: 'Debility',
        description: 'Test debility',
        type: 'debility',
        debilityType: 'weak',
        duration: 'permanent',
        source: 'move',
      });

      conditionService.createCondition({
        characterId: 'test - character',
        name: 'Ongoing Effect',
        description: 'Test ongoing effect',
        type: 'ongoing_effect',
        ongoingEffectType: '+1 forward',
        appliesTo: ['all'],
        duration: 'until_end_of_scene',
        source: 'spell',
      });

      conditionService.createCondition({
        characterId: 'test - character',
        name: 'Temporary Condition',
        description: 'Test temporary condition',
        type: 'temporary_condition',
        duration: 'until_rest',
        source: 'item',
      });

      const stats = conditionService.getConditionStats('test - character');

      expect(stats.totalConditions).toBe(3);
      expect(stats.activeConditions).toBe(3);
      expect(stats.debilities).toBe(1);
      expect(stats.ongoingEffects).toBe(1);
      expect(stats.temporaryConditions).toBe(1);
      expect(stats.bySource.move).toBe(1);
      expect(stats.bySource.spell).toBe(1);
      expect(stats.bySource.item).toBe(1);
    });
  });
});
