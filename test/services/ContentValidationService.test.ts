import { describe, it, expect, beforeEach } from 'vitest';
import { contentValidationService } from '../../src / services / ContentValidationService';
import { ContentType } from '../../src / services / ContentSchema';

describe('ContentValidationService', () => {
  describe('validateMove', () => {
    it('should validate a valid move', () => {
      const validMove = {
        id: 'custom - fighter - 1',
        name: 'Custom Strike',
        description: 'A powerful custom attack move for fighters',
        category: 'advanced',
        class: 'Fighter',
        level: 3,
        source: 'Custom',
      };

      const _result = contentValidationService.validateMove(validMove);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a move without required fields', () => {
      const invalidMove = {
        id: 'custom - fighter - 1',
        name: 'Custom Strike',
        // Missing required fields: description, category
      };

      const _result = contentValidationService.validateMove(invalidMove);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about advanced moves without class', () => {
      const _moveWithWarning = {
        id: 'custom - advanced - 1',
        name: 'Advanced Move',
        description: 'An advanced move without class specification',
        category: 'advanced',
        source: 'Custom',
      };

      const _result = contentValidationService.validateMove(moveWithWarning);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'ADVANCED_MOVE_REQUIRES_CLASS')).toBe(true);
    });

    it('should warn about moves with roll stats but no trigger', () => {
      const moveWithWarning = {
        id: 'custom - roll - 1',
        name: 'Roll Move',
        description: 'A move with a roll stat',
        category: 'basic',
        rollStat: 'STR',
        source: 'Custom',
      };

      const _result = contentValidationService.validateMove(moveWithWarning);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'ROLL_STAT_WITHOUT_TRIGGER')).toBe(true);
    });
  });

  describe('validateItem', () => {
    it('should validate a valid weapon', () => {
      const validWeapon = {
        id: 'custom - sword - 1',
        name: 'Custom Sword',
        description: 'A powerful custom weapon',
        type: 'weapon',
        rarity: 'rare',
        weight: 3,
        value: 100,
        damage: '1d8',
        source: 'Custom',
      };

      const _result = contentValidationService.validateItem(validWeapon);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid armor', () => {
      const validArmor = {
        id: 'custom - armor - 1',
        name: 'Custom Armor',
        description: 'A protective suit of armor',
        type: 'armor',
        rarity: 'uncommon',
        weight: 45,
        value: 50,
        armorValue: 2,
        source: 'Custom',
      };

      const _result = contentValidationService.validateItem(validArmor);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weapons without damage', () => {
      const invalidWeapon = {
        id: 'custom - sword - 1',
        name: 'Custom Sword',
        description: 'A weapon without damage',
        type: 'weapon',
        source: 'Custom',
      };

      const _result = contentValidationService.validateItem(invalidWeapon);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('damage'))).toBe(true);
    });

    it('should reject armor without armor value', () => {
      const invalidArmor = {
        id: 'custom - armor - 1',
        name: 'Custom Armor',
        description: 'Armor without value',
        type: 'armor',
        source: 'Custom',
      };

      const _result = contentValidationService.validateItem(invalidArmor);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('armor value'))).toBe(true);
    });

    it('should warn about magic items without magical tag', () => {
      const magicItem = {
        id: 'magic - item - 1',
        name: 'Magic Sword',
        description: 'A magical weapon',
        type: 'magic',
        rarity: 'rare',
        source: 'Custom',
      };

      const _result = contentValidationService.validateItem(magicItem);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'MAGIC_ITEM_MISSING_TAG')).toBe(true);
    });
  });

  describe('validateSpell', () => {
    it('should validate a valid spell', () => {
      const validSpell = {
        id: 'custom - fireball',
        name: 'Custom Fireball',
        description: 'A powerful fire spell that creates a burst of flame',
        level: 3,
        school: 'evocation',
        castingTime: '1 action',
        range: '120 feet',
        duration: 'Instantaneous',
        components: ['V', 'S'],
        source: 'Custom',
      };

      const _result = contentValidationService.validateSpell(validSpell);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid cantrip', () => {
      const validCantrip = {
        id: 'custom - cantrip',
        name: 'Custom Cantrip',
        description: 'A simple magical effect',
        level: 0,
        school: 'evocation',
        castingTime: '1 action',
        range: '60 feet',
        duration: 'Instantaneous',
        components: ['V', 'S'],
        source: 'Custom',
      };

      const _result = contentValidationService.validateSpell(validCantrip);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject cantrips with wrong level', () => {
      const invalidCantrip = {
        id: 'custom - cantrip',
        name: 'Custom Cantrip',
        description: 'A cantrip spell',
        level: 1, // Should be 0 for cantrips
        school: 'evocation',
        castingTime: '1 action',
        range: '60 feet',
        duration: 'Instantaneous',
        components: ['V', 'S'],
        source: 'Custom',
      };

      const _result = contentValidationService.validateSpell(invalidCantrip);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'CANTRIP_LEVEL_MISMATCH')).toBe(true);
    });

    it('should warn about high - level spells without material components', () => {
      const highLevelSpell = {
        id: 'custom - high - spell',
        name: 'Custom High Level Spell',
        description: 'A powerful high - level spell',
        level: 7,
        school: 'evocation',
        castingTime: '1 action',
        range: '120 feet',
        duration: 'Instantaneous',
        components: ['V', 'S'], // Missing material component
        source: 'Custom',
      };

      const _result = contentValidationService.validateSpell(highLevelSpell);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'HIGH_LEVEL_NO_MATERIALS')).toBe(true);
    });
  });

  describe('checkForDuplicates', () => {
    it('should detect duplicate IDs', () => {
      const _existingContent = [
        { id: 'existing - move', name: 'Existing Move', description: 'Test' },
      ];

      const _newContent = {
        id: 'existing - move', // Duplicate ID
        name: 'New Move',
        description: 'Test',
      };

      const _result = contentValidationService.checkForDuplicates(newContent, 'move', existingContent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_ID')).toBe(true);
    });

    it('should warn about duplicate names', () => {
      const _existingContent = [
        { id: 'move - 1', name: 'Test Move', description: 'Test' },
      ];

      const newContent = {
        id: 'move - 2',
        name: 'Test Move', // Duplicate name
        description: 'Test',
      };

      const _result = contentValidationService.checkForDuplicates(newContent, 'move', existingContent);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'DUPLICATE_NAME')).toBe(true);
    });
  });

  describe('validateReferences', () => {
    it('should warn about missing move references', () => {
      const _existingContent = [
        { id: 'move - 1', name: 'Base Move', description: 'Test' },
      ];

      const contentWithReference = {
        id: 'move - 2',
        name: 'Advanced Move',
        description: 'Test',
        requiresMove: 'missing - move', // References non - existent move
      };

      const _result = contentValidationService.validateReferences(contentWithReference, 'move', existingContent);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'MISSING_REFERENCE')).toBe(true);
    });

    it('should not warn about valid references', () => {
      const existingContent = [
        { id: 'move - 1', name: 'Base Move', description: 'Test' },
      ];

      const contentWithValidReference = {
        id: 'move - 2',
        name: 'Advanced Move',
        description: 'Test',
        requiresMove: 'move - 1', // References existing move
      };

      const _result = contentValidationService.validateReferences(contentWithValidReference, 'move', existingContent);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateContentSet', () => {
    it('should validate a complete content set', () => {
      const _contentSet = {
        moves: [
          {
            id: 'move - 1',
            name: 'Test Move',
            description: 'A test move',
            category: 'basic',
            source: 'Custom',
          },
        ],
        items: [
          {
            id: 'item - 1',
            name: 'Test Item',
            description: 'A test item',
            type: 'gear',
            rarity: 'common',
            source: 'Custom',
          },
        ],
        spells: [
          {
            id: 'spell - 1',
            name: 'Test Spell',
            description: 'A test spell',
            level: 1,
            school: 'evocation',
            castingTime: '1 action',
            range: '60 feet',
            duration: 'Instantaneous',
            components: ['V', 'S'],
            source: 'Custom',
          },
        ],
      };

      const _result = contentValidationService.validateContentSet(contentSet);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect errors across the entire content set', () => {
      const contentSet = {
        moves: [
          {
            id: 'move - 1',
            name: 'Test Move',
            description: 'A test move',
            category: 'advanced', // Missing class
          },
        ],
      };

      const result = contentValidationService.validateContentSet(contentSet);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'ADVANCED_MOVE_REQUIRES_CLASS')).toBe(true);
    });
  });
});
