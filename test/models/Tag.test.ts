import { describe, it, expect } from 'vitest';
import {
  hasTag,
  getTagValue,
  calculateTotalArmor,
  calculateDamageBonus,
  calculatePiercingBonus,
  canUseItem,
  useItem,
  hasAmmo,
  useAmmo,
  getActiveTagEffects,
  calculateTotalWeight,
  isConsumable,
  getLowUsesItems,
  getDepletedItems,
  restoreItemUses,
  resetAllUses,
  parseTagString,
  formatTags,
  getTagDescription,
} from '../../src / utils / tagMechanics';
import { Item, Tag } from '../../src / models / Equipment';

describe('Tag Mechanics', () => {
  const mockWeapon: Item = {
    id: 'sword',
    name: 'Long Sword',
    category: 'weapon',
    tags: [
      { name: 'close' },
      { name: 'damage', value: 1 },
      { name: 'piercing', value: 2 },
    ],
    weight: 1,
    quantity: 1,
    equipped: true,
  };

  const mockArmor: Item = {
    id: 'leather',
    name: 'Leather Armor',
    category: 'armor',
    tags: [
      { name: 'worn' },
      { name: 'armor', value: 1 },
    ],
    weight: 1,
    quantity: 1,
    equipped: true,
  };

  const mockConsumable: Item = {
    id: 'potion',
    name: 'Healing Potion',
    category: 'consumable',
    tags: [
      { name: 'uses', value: 3 },
    ],
    weight: 0,
    quantity: 1,
    equipped: false,
    uses: { current: 3, max: 3 },
  };

  const mockAmmo: Item = {
    id: 'arrows',
    name: 'Arrows',
    category: 'gear',
    tags: [
      { name: 'ammo' },
    ],
    weight: 1,
    quantity: 1,
    equipped: false,
    uses: { current: 20, max: 20 },
  };

  describe('hasTag', () => {
    it('should return true when item has the specified tag', () => {
      expect(hasTag(mockWeapon, 'close')).toBe(true);
      expect(hasTag(mockWeapon, 'damage')).toBe(true);
    });

    it('should return false when item does not have the specified tag', () => {
      expect(hasTag(mockWeapon, 'far')).toBe(false);
      expect(hasTag(mockWeapon, 'armor')).toBe(false);
    });
  });

  describe('getTagValue', () => {
    it('should return the correct value for a tag with a value', () => {
      expect(getTagValue(mockWeapon, 'damage')).toBe(1);
      expect(getTagValue(mockWeapon, 'piercing')).toBe(2);
    });

    it('should return undefined for tags without values', () => {
      expect(getTagValue(mockWeapon, 'close')).toBeUndefined();
    });

    it('should return undefined for non - existent tags', () => {
      expect(getTagValue(mockWeapon, 'nonexistent')).toBeUndefined();
    });
  });

  describe('calculateTotalArmor', () => {
    it('should calculate total armor from equipped items', () => {
      const _items =  [mockArmor, mockWeapon];
      expect(calculateTotalArmor(items)).toBe(1);
    });

    it('should handle armor - plus tags', () => {
      const armorPlus: Item = {
        id: 'shield',
        name: 'Shield',
        category: 'armor',
        tags: [
          { name: 'armor - plus', value: 1 },
        ],
        weight: 1,
        quantity: 1,
        equipped: true,
      };
      const _items =  [mockArmor, armorPlus];
      expect(calculateTotalArmor(items)).toBe(2); // 1 from armor + 1 from armor - plus
    });

    it('should ignore unequipped items', () => {
      const unequippedArmor = { ...mockArmor, equipped: false };
      const _items =  [unequippedArmor];
      expect(calculateTotalArmor(items)).toBe(0);
    });
  });

  describe('calculateDamageBonus', () => {
    it('should calculate total damage bonus from equipped weapons', () => {
      const _items =  [mockWeapon];
      expect(calculateDamageBonus(items)).toBe(1);
    });

    it('should ignore unequipped weapons', () => {
      const _unequippedWeapon =  { ...mockWeapon, equipped: false };
      const _items =  [unequippedWeapon];
      expect(calculateDamageBonus(items)).toBe(0);
    });

    it('should ignore non - weapon items', () => {
      const _items =  [mockArmor];
      expect(calculateDamageBonus(items)).toBe(0);
    });
  });

  describe('calculatePiercingBonus', () => {
    it('should calculate total piercing bonus from equipped weapons', () => {
      const _items =  [mockWeapon];
      expect(calculatePiercingBonus(items)).toBe(2);
    });

    it('should ignore unequipped weapons', () => {
      const _unequippedWeapon =  { ...mockWeapon, equipped: false };
      const _items =  [unequippedWeapon];
      expect(calculatePiercingBonus(items)).toBe(0);
    });
  });

  describe('canUseItem', () => {
    it('should return true for items without uses limit', () => {
      expect(canUseItem(mockWeapon)).toBe(true);
    });

    it('should return true for items with uses remaining', () => {
      expect(canUseItem(mockConsumable)).toBe(true);
    });

    it('should return false for items with no uses remaining', () => {
      const _depletedItem =  { ...mockConsumable, uses: { current: 0, max: 3 } };
      expect(canUseItem(depletedItem)).toBe(false);
    });
  });

  describe('useItem', () => {
    it('should decrement uses when using an item', () => {
      const _result = useItem(mockConsumable);
      expect(result?.uses?.current).toBe(2);
      expect(result?.uses?.max).toBe(3);
    });

    it('should return null when item cannot be used', () => {
      const _depletedItem =  { ...mockConsumable, uses: { current: 0, max: 3 } };
      expect(useItem(depletedItem)).toBeNull();
    });

    it('should return null for items without uses', () => {
      expect(useItem(mockWeapon)).toBeNull();
    });
  });

  describe('hasAmmo', () => {
    it('should return true when weapon has ammo available', () => {
      const bow: Item = {
        id: 'bow',
        name: 'Bow',
        category: 'weapon',
        tags: [
          { name: 'ammo', value: 1 },
        ],
        weight: 2,
        quantity: 1,
        equipped: true,
      };
      const _items =  [bow, mockAmmo];
      expect(hasAmmo(items, bow)).toBe(true);
    });

    it('should return false when no ammo is available', () => {
      const bow: Item = {
        id: 'bow',
        name: 'Bow',
        category: 'weapon',
        tags: [
          { name: 'ammo', value: 1 },
        ],
        weight: 2,
        quantity: 1,
        equipped: true,
      };
      const _items =  [bow];
      expect(hasAmmo(items, bow)).toBe(false);
    });

    it('should return true for weapons without ammo requirement', () => {
      const _items =  [mockWeapon];
      expect(hasAmmo(items, mockWeapon)).toBe(true);
    });
  });

  describe('useAmmo', () => {
    it('should use ammo and return updated items', () => {
      const bow: Item = {
        id: 'bow',
        name: 'Bow',
        category: 'weapon',
        tags: [
          { name: 'ammo', value: 1 },
        ],
        weight: 2,
        quantity: 1,
        equipped: true,
      };
      const _items =  [bow, mockAmmo];
      const _result = useAmmo(items, bow);

      expect(result.ammoUsed).toBe(true);
      expect(result.items[1].uses?.current).toBe(19);
    });

    it('should return unchanged items when no ammo is available', () => {
      const bow: Item = {
        id: 'bow',
        name: 'Bow',
        category: 'weapon',
        tags: [
          { name: 'ammo', value: 1 },
        ],
        weight: 2,
        quantity: 1,
        equipped: true,
      };
      const _items =  [bow];
      const result = useAmmo(items, bow);

      expect(result.ammoUsed).toBe(false);
      expect(result.items).toEqual(items);
    });
  });

  describe('getActiveTagEffects', () => {
    it('should return effects from equipped items', () => {
      const _items =  [mockWeapon, mockArmor];
      const _effects = getActiveTagEffects(items);

      expect(effects).toHaveLength(3); // damage, piercing, armor
      expect(effects.find(e => e.type === 'damage')?.value).toBe(1);
      expect(effects.find(e => e.type === 'piercing')?.value).toBe(2);
      expect(effects.find(e => e.type === 'armor')?.value).toBe(1);
    });

    it('should ignore unequipped items', () => {
      const unequippedWeapon = { ...mockWeapon, equipped: false };
      const _items =  [unequippedWeapon];
      const effects = getActiveTagEffects(items);

      expect(effects).toHaveLength(0);
    });
  });

  describe('calculateTotalWeight', () => {
    it('should calculate total weight from all items', () => {
      const _items =  [mockWeapon, mockArmor, mockConsumable];
      expect(calculateTotalWeight(items)).toBe(2); // 1 + 1 + 0
    });

    it('should use tag weight value when available', () => {
      const heavyItem: Item = {
        id: 'heavy',
        name: 'Heavy Item',
        category: 'gear',
        tags: [
          { name: 'weight', value: 5 },
        ],
        weight: 1, // This should be ignored in favor of tag value
        quantity: 1,
        equipped: false,
      };
      const _items =  [heavyItem];
      expect(calculateTotalWeight(items)).toBe(5);
    });
  });

  describe('isConsumable', () => {
    it('should identify consumable items', () => {
      expect(isConsumable(mockConsumable)).toBe(true);
      expect(isConsumable(mockAmmo)).toBe(true);
    });

    it('should identify non - consumable items', () => {
      expect(isConsumable(mockWeapon)).toBe(false);
      expect(isConsumable(mockArmor)).toBe(false);
    });
  });

  describe('getLowUsesItems', () => {
    it('should return items with low uses', () => {
      const lowUsesItem = { ...mockConsumable, uses: { current: 1, max: 3 } };
      const _items =  [mockConsumable, lowUsesItem];
      const lowItems = getLowUsesItems(items, 2);

      expect(lowItems).toHaveLength(1);
      expect(lowItems[0].id).toBe('potion');
    });
  });

  describe('getDepletedItems', () => {
    it('should return items with no uses remaining', () => {
      const _depletedItem =  { ...mockConsumable, uses: { current: 0, max: 3 } };
      const _items =  [mockConsumable, depletedItem];
      const depletedItems = getDepletedItems(items);

      expect(depletedItems).toHaveLength(1);
      expect(depletedItems[0].id).toBe('potion');
    });
  });

  describe('restoreItemUses', () => {
    it('should restore uses to an item', () => {
      const _depletedItem =  { ...mockConsumable, uses: { current: 0, max: 3 } };
      const _restored = restoreItemUses(depletedItem, 2);

      expect(restored.uses?.current).toBe(2);
    });

    it('should not exceed maximum uses', () => {
      const restored = restoreItemUses(mockConsumable, 5);

      expect(restored.uses?.current).toBe(3); // Should not exceed max
    });
  });

  describe('resetAllUses', () => {
    it('should reset all uses to maximum', () => {
      const depletedItem = { ...mockConsumable, uses: { current: 0, max: 3 } };
      const items = [depletedItem];
      const resetItems = resetAllUses(items);

      expect(resetItems[0].uses?.current).toBe(3);
    });
  });

  describe('parseTagString', () => {
    it('should parse tag strings correctly', () => {
      const _tagString =  'close, damage 1, piercing 2';
      const _tags = parseTagString(tagString);

      expect(tags).toHaveLength(3);
      expect(tags[0]).toEqual({ name: 'close' });
      expect(tags[1]).toEqual({ name: 'damage', value: 1 });
      expect(tags[2]).toEqual({ name: 'piercing', value: 2 });
    });

    it('should handle string values', () => {
      const tagString = 'requires magic user';
      const _tags = parseTagString(tagString);

      expect(tags[0]).toEqual({ name: 'requires', value: 'magic user' });
    });
  });

  describe('formatTags', () => {
    it('should format tags for display', () => {
      const tags: Tag[] = [
        { name: 'close' },
        { name: 'damage', value: 1 },
        { name: 'piercing', value: 2 },
      ];

      expect(formatTags(tags)).toBe('close, damage 1, piercing 2');
    });
  });

  describe('getTagDescription', () => {
    it('should return descriptions for known tags', () => {
      const tag: Tag = { name: 'close' };
      expect(getTagDescription(tag)).toBe('Useful at arm\'s reach plus a foot or two');
    });

    it('should include values in descriptions', () => {
      const tag: Tag = { name: 'damage', value: 2 };
      expect(getTagDescription(tag)).toBe('Add value to damage dealt (2)');
    });

    it('should return tag name for unknown tags', () => {
      const tag: Tag = { name: 'custom - tag' };
      expect(getTagDescription(tag)).toBe('custom - tag');
    });
  });
});
