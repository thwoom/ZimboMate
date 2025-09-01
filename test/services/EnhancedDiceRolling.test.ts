/**
 * Enhanced Dice Rolling System Tests
 */

import { describe, it, expect } from 'vitest';
import { diceRollingService, DiceType, DiceExpression } from '../../src / services / DiceRollingService';

describe('Enhanced Dice Rolling System', () => {
  describe('Basic Dice Rolling', () => {
    it('should roll different dice types correctly', () => {
      const diceTypes: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

      diceTypes.forEach(diceType => {
        const _roll = diceRollingService.rollDice({
          count: 1,
          type: diceType,
          modifier: 0,
        });

        expect(roll.expression.type).toBe(diceType);
        expect(roll.results).toHaveLength(1);
        expect(roll.results[0]).toBeGreaterThanOrEqual(1);

        // Check dice bounds
        const maxValue = parseInt(diceType.substring(1));
        expect(roll.results[0]).toBeLessThanOrEqual(maxValue);
      });
    });

    it('should handle multiple dice correctly', () => {
      const _roll = diceRollingService.rollDice({
        count: 3,
        type: 'd6',
        modifier: 2,
      });

      expect(roll.results).toHaveLength(3);
      expect(roll.total).toBe(roll.results.reduce((sum, die) => sum + die, 0));
      expect(roll.finalResult).toBe(roll.total + roll.modifier);
      expect(roll.modifier).toBe(2);
    });
  });

  describe('Damage Rolling', () => {
    it('should roll damage dice correctly', () => {
      const damageRoll = diceRollingService.rollDamage('d8', 2, 3);

      expect(damageRoll.type).toBe('damage');
      expect(damageRoll.expression.count).toBe(2);
      expect(damageRoll.expression.type).toBe('d8');
      expect(damageRoll.modifier).toBe(3);
      expect(damageRoll.results).toHaveLength(2);
      expect(damageRoll.description).toContain('Damage');
    });
  });

  describe('Target Number Rolling', () => {
    it('should roll against target numbers correctly', () => {
      const targetRoll = diceRollingService.rollTarget(15, 'd20', 1, 5);

      expect(targetRoll.type).toBe('target');
      expect(targetRoll.targetNumber).toBe(15);
      expect(targetRoll.success).toBe(targetRoll.finalResult >= 15);
      expect(targetRoll.expression.type).toBe('d20');
      expect(targetRoll.modifier).toBe(5);
    });
  });

  describe('Reroll Mechanics', () => {
    it('should create rerolls correctly', () => {
      const originalRoll = diceRollingService.rollDice({
        count: 2,
        type: 'd6',
        modifier: 1,
      });

      const reroll = diceRollingService.rerollDice(originalRoll, { spendXP: true });

      expect(reroll.originalRoll).toBe(originalRoll.id);
      expect(reroll.rerollCount).toBe(1);
      expect(reroll.description).toContain('Reroll');
      expect(reroll.description).toContain('XP spent');
      expect(reroll.expression).toEqual(originalRoll.expression);
    });
  });

  describe('Stacking Modifiers', () => {
    it('should handle complex modifier stacking', () => {
      const _roll = diceRollingService.rollWithModifiers(
        { count: 2, type: 'd6' },
        {
          stat: 2,
          equipment: 1,
          ongoing: -1,
          forward: 2,
          circumstantial: 1,
          other: [
            { value: 1, source: 'Magic Item' },
            { value: -1, source: 'Curse' },
          ],
        },
      );

      expect(roll.modifierBreakdown).toBeDefined();
      expect(roll.modifierBreakdown?.stat.value).toBe(2);
      expect(roll.modifierBreakdown?.equipment).toHaveLength(1);
      expect(roll.modifierBreakdown?.ongoing).toHaveLength(1);
      expect(roll.modifierBreakdown?.forward).toHaveLength(1);
      expect(roll.modifierBreakdown?.other).toHaveLength(3); // circumstantial + 2 custom

      // Total modifier should be: 2 + 1 + (-1) + 2 + 1 + 1 + (-1) = 5
      expect(roll.modifier).toBe(5);
    });
  });

  describe('Dice Expression Parsing', () => {
    it('should parse dice expressions correctly', () => {
      const testCases = [
        { input: '2d6', expected: { count: 2, type: 'd6' as DiceType, modifier: 0 } },
        { input: '1d8 + 3', expected: { count: 1, type: 'd8' as DiceType, modifier: 3 } },
        { input: '3d4 - 2', expected: { count: 3, type: 'd4' as DiceType, modifier: -2 } },
        { input: '1d20 + 5', expected: { count: 1, type: 'd20' as DiceType, modifier: 5 } },
      ];

      testCases.forEach(({ input, expected }) => {
        const parsed = diceRollingService.parseDiceExpression(input);
        expect(parsed.count).toBe(expected.count);
        expect(parsed.type).toBe(expected.type);
        expect(parsed.modifier).toBe(expected.modifier);
      });
    });

    it('should throw error for invalid expressions', () => {
      const invalidExpressions = ['invalid', '2d', 'd6', '2d6+', '1d100'];

      invalidExpressions.forEach(expr => {
        expect(() => diceRollingService.parseDiceExpression(expr)).toThrow();
      });
    });
  });

  describe('Roll from String', () => {
    it('should roll from string expressions', () => {
      const _roll = diceRollingService.rollFromString('2d6 + 3', {
        type: 'move',
        description: 'Test roll',
      });

      expect(roll.expression.count).toBe(2);
      expect(roll.expression.type).toBe('d6');
      expect(roll.modifier).toBe(3);
      expect(roll.type).toBe('move');
      expect(roll.description).toBe('Test roll');
      expect(roll.results).toHaveLength(2);
    });
  });

  describe('Advantage and Disadvantage', () => {
    it('should apply advantage correctly', () => {
      // Test with 4 dice to make advantage more predictable
      const _roll = diceRollingService.rollDice({
        count: 4,
        type: 'd6',
      }, {
        advantage: true,
      });

      expect(roll.advantage).toBe(true);
      expect(roll.results).toHaveLength(2); // Should keep top 2 of 4 dice
    });

    it('should apply disadvantage correctly', () => {
      // Test with 4 dice to make disadvantage more predictable
      const _roll = diceRollingService.rollDice({
        count: 4,
        type: 'd6',
      }, {
        disadvantage: true,
      });

      expect(roll.disadvantage).toBe(true);
      expect(roll.results).toHaveLength(2); // Should keep bottom 2 of 4 dice
    });
  });

  describe('Roll Formatting', () => {
    it('should format rolls correctly', () => {
      const roll = diceRollingService.rollDice({
        count: 2,
        type: 'd6',
        modifier: 3,
      });

      const _formatted = diceRollingService.formatEnhancedRoll(roll);

      expect(formatted).toContain('2d6');
      expect(formatted).toContain(roll.results.join(', '));
      expect(formatted).toContain('+3');
      expect(formatted).toContain(`= ${roll.finalResult}`);
    });

    it('should format success / failure correctly', () => {
      const successRoll = diceRollingService.rollTarget(10, 'd20', 1, 15);
      const formatted = diceRollingService.formatEnhancedRoll(successRoll);

      if (successRoll.success) {
        expect(formatted).toContain('✓');
      } else {
        expect(formatted).toContain('✗');
      }
    });
  });

  describe('2d6 Move Integration', () => {
    it('should properly integrate with 2d6 move results', () => {
      const moveRoll = diceRollingService.rollDice({
        count: 2,
        type: 'd6',
        modifier: 2,
      }, {
        type: 'move',
      });

      expect(moveRoll.type).toBe('move');
      expect(moveRoll.rollResult).toBeDefined();

      if (moveRoll.finalResult >= 10) {
        expect(moveRoll.rollResult).toBe('success');
      } else if (moveRoll.finalResult >= 7) {
        expect(moveRoll.rollResult).toBe('partial');
      } else {
        expect(moveRoll.rollResult).toBe('failure');
      }
    });
  });
});
