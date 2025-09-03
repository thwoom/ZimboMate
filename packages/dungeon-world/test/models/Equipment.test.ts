/**
 * Unit tests for Equipment model
 */

import { describe, expect,it } from 'vitest';

import {
  Armor,
  calculateTotalArmor,
  formatTags,
  getItemTotalWeight,
  getTagValue,
  hasTag,
  isArmor,
  isWeapon,
  Item,
  parseTagString,
  Weapon,
} from '../../src / models / Equipment';

describe('Equipment Model', () => {
  describe('Type guards', () => {
    it('should correctly identify weapons', () => {
      const weapon: Weapon = {
        id: '1',
        name: 'Sword',
        category: 'weapon',
        tags: [],
        weight: 1,
        quantity: 1,
        equipped: false,
        damage: '+1 damage',
      };

      const armor: Armor = {
        id: '2',
        name: 'Chainmail',
        category: 'armor',
        tags: [],
        weight: 3,
        quantity: 1,
        equipped: false,
        armorValue: 2,
      };

      expect(isWeapon(weapon)).toBe(true);
      expect(isWeapon(armor)).toBe(false);
    });

    it('should correctly identify armor', () => {
      const weapon: Item = {
        id: '1',
        name: 'Sword',
        category: 'weapon',
        tags: [],
        weight: 1,
        quantity: 1,
        equipped: false,
      };

      const armor: Armor = {
        id: '2',
        name: 'Chainmail',
        category: 'armor',
        tags: [],
        weight: 3,
        quantity: 1,
        equipped: false,
        armorValue: 2,
      };

      expect(isArmor(weapon)).toBe(false);
      expect(isArmor(armor)).toBe(true);
    });
  });

  describe('parseTagString', () => {
    it('should parse simple tags', () => {
      const _tags = parseTagString('close, worn, magical');
      expect(tags).toHaveLength(3);
      expect(tags[0]).toEqual({ name: 'close' });
      expect(tags[1]).toEqual({ name: 'worn' });
      expect(tags[2]).toEqual({ name: 'magical' });
    });

    it('should parse tags with values', () => {
      const _tags = parseTagString('weight 2, uses 3, armor + 1');
      expect(tags).toHaveLength(3);
      expect(tags[0]).toEqual({ name: 'weight', value: '2' });
      expect(tags[1]).toEqual({ name: 'uses', value: '3' });
      expect(tags[2]).toEqual({ name: 'armor', value: '+1' });
    });

    it('should handle mixed tags', () => {
      const tags = parseTagString('close, weight 1, magical, uses 5');
      expect(tags).toHaveLength(4);
      expect(tags[0]).toEqual({ name: 'close' });
      expect(tags[1]).toEqual({ name: 'weight', value: '1' });
      expect(tags[2]).toEqual({ name: 'magical' });
      expect(tags[3]).toEqual({ name: 'uses', value: '5' });
    });
  });

  describe('getItemTotalWeight', () => {
    it('should calculate total weight correctly', () => {
      const item: Item = {
        id: '1',
        name: 'Rations',
        category: 'consumable',
        tags: [],
        weight: 1,
        quantity: 5,
        equipped: false,
      };

      expect(getItemTotalWeight(item)).toBe(5); // 1 * 5

      item.quantity = 10;
      expect(getItemTotalWeight(item)).toBe(10); // 1 * 10

      item.weight = 0.5;
      expect(getItemTotalWeight(item)).toBe(5); // 0.5 * 10
    });
  });

  describe('Tag utilities', () => {
    const item: Item = {
      id: '1',
      name: 'Magic Sword',
      category: 'weapon',
      tags: [
        { name: 'close' },
        { name: 'magical' },
        { name: 'weight', value: 2 },
        { name: 'uses', value: 3 },
      ],
      weight: 2,
      quantity: 1,
      equipped: false,
    };

    it('should check if item has tag', () => {
      expect(hasTag(item, 'close')).toBe(true);
      expect(hasTag(item, 'magical')).toBe(true);
      expect(hasTag(item, 'reach')).toBe(false);
      expect(hasTag(item, 'weight')).toBe(true);
    });

    it('should get tag value', () => {
      expect(getTagValue(item, 'weight')).toBe(2);
      expect(getTagValue(item, 'uses')).toBe(3);
      expect(getTagValue(item, 'close')).toBeUndefined();
      expect(getTagValue(item, 'nonexistent')).toBeUndefined();
    });

    it('should format tags for display', () => {
      const formatted = formatTags(item.tags);
      expect(formatted).toBe('close, magical, weight 2, uses 3');
    });
  });

  describe('calculateTotalArmor', () => {
    it('should sum armor values from equipped armor', () => {
      const items: Item[] = [
        {
          id: '1',
          name: 'Leather',
          category: 'armor',
          tags: [],
          weight: 1,
          quantity: 1,
          equipped: true,
          armorValue: 1,
        } as Armor,
        {
          id: '2',
          name: 'Shield',
          category: 'armor',
          tags: [],
          weight: 2,
          quantity: 1,
          equipped: true,
          armorValue: 1,
        } as Armor,
        {
          id: '3',
          name: 'Chainmail',
          category: 'armor',
          tags: [],
          weight: 3,
          quantity: 1,
          equipped: false, // Not equipped
          armorValue: 2,
        } as Armor,
        {
          id: '4',
          name: 'Sword',
          category: 'weapon',
          tags: [],
          weight: 1,
          quantity: 1,
          equipped: true,
        },
      ];

      expect(calculateTotalArmor(items)).toBe(2); // Leather (1) + Shield (1)
    });

    it('should return 0 when no armor equipped', () => {
      const items: Item[] = [
        {
          id: '1',
          name: 'Sword',
          category: 'weapon',
          tags: [],
          weight: 1,
          quantity: 1,
          equipped: true,
        },
      ];

      expect(calculateTotalArmor(items)).toBe(0);
    });
  });
});
