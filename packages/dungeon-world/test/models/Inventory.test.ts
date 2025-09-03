/**
 * Unit tests for Inventory model
 */

import { describe, expect,it } from 'vitest';

import { Item } from '../../src / models / Equipment';
import {
  addItem,
  calculateInventoryStats,
  createEmptyInventory,
  getContainerItems,
  getEquippedItems,
  moveItem,
  removeItem,
  searchItems,
  sortItems,
  toggleEquipped,
} from '../../src / models / Inventory';

describe('Inventory Model', () => {
  const createTestItem = (id: string, name: string, weight = 1): Item => ({
    id,
    name,
    category: 'gear',
    tags: [],
    weight,
    value: 10,
    quantity: 1,
    equipped: false,
  });

  describe('createEmptyInventory', () => {
    it('should create inventory with default containers', () => {
      const _inventory = createEmptyInventory();

      expect(inventory.items).toEqual({});
      expect(inventory.containers).toHaveLength(3);
      expect(inventory.containers.map(c => c.id)).toContain('equipped');
      expect(inventory.containers.map(c => c.id)).toContain('carried');
      expect(inventory.containers.map(c => c.id)).toContain('consumables');
      expect(inventory.quickSlots).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add item to inventory', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('sword1', 'Iron Sword');

      inventory = addItem(inventory, item);

      expect(inventory.items['sword1']).toEqual(item);
    });

    it('should add item to specified container', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('sword1', 'Iron Sword');

      inventory = addItem(inventory, item, 'carried');

      const carriedContainer = inventory.containers.find(c => c.id === 'carried');
      expect(carriedContainer?.items).toContain('sword1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from inventory and containers', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('sword1', 'Iron Sword');

      inventory = addItem(inventory, item, 'carried');
      inventory = removeItem(inventory, 'sword1');

      expect(inventory.items['sword1']).toBeUndefined();

      const carriedContainer = inventory.containers.find(c => c.id === 'carried');
      expect(carriedContainer?.items).not.toContain('sword1');
    });

    it('should remove item from quick slots', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('potion1', 'Health Potion');

      inventory = addItem(inventory, item);
      inventory.quickSlots = ['potion1'];
      inventory = removeItem(inventory, 'potion1');

      expect(inventory.quickSlots).not.toContain('potion1');
    });
  });

  describe('moveItem', () => {
    it('should move item between containers', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('sword1', 'Iron Sword');

      inventory = addItem(inventory, item, 'carried');
      inventory = moveItem(inventory, 'sword1', 'carried', 'equipped');

      const carriedContainer = inventory.containers.find(c => c.id === 'carried');
      const equippedContainer = inventory.containers.find(c => c.id === 'equipped');
      expect(carriedContainer?.items).not.toContain('sword1');
      expect(equippedContainer?.items).toContain('sword1');
    });
  });

  describe('toggleEquipped', () => {
    it('should toggle equipped status and move between containers', () => {
      const _inventory = createEmptyInventory();
      const _item = createTestItem('sword1', 'Iron Sword');

      inventory = addItem(inventory, item, 'carried');

      // Equip the item
      inventory = toggleEquipped(inventory, 'sword1');
      expect(inventory.items['sword1'].equipped).toBe(true);

      const equippedContainer = inventory.containers.find(c => c.category === 'equipped');
      expect(equippedContainer?.items).toContain('sword1');

      // Unequip the item
      inventory = toggleEquipped(inventory, 'sword1');
      expect(inventory.items['sword1'].equipped).toBe(false);

      const carriedContainer = inventory.containers.find(c => c.category === 'carried');
      expect(carriedContainer?.items).toContain('sword1');
    });
  });

  describe('calculateInventoryStats', () => {
    it('should calculate correct inventory statistics', () => {
      const _inventory = createEmptyInventory();

      inventory = addItem(inventory, {
        ...createTestItem('sword1', 'Iron Sword', 2),
        value: 50,
        quantity: 1,
        equipped: true,
      }, 'equipped');

      inventory = addItem(inventory, {
        ...createTestItem('potion1', 'Health Potion', 0.5),
        value: 25,
        quantity: 3,
        category: 'consumable',
      }, 'consumables');

      const stats = calculateInventoryStats(inventory, 10); // maxLoad = 10

      expect(stats.totalWeight).toBe(3.5); // 2 + (0.5 * 3)
      expect(stats.totalValue).toBe(125); // 50 + (25 * 3)
      expect(stats.itemCount).toBe(4); // 1 + 3
      expect(stats.encumbranceStatus).toBe('normal'); // 3.5 <= 10
      expect(stats.weightByCategory.equipped).toBe(2);
      expect(stats.weightByCategory.consumables).toBe(1.5);
    });

    it('should detect encumbrance status correctly', () => {
      const _inventory = createEmptyInventory();

      // Normal
      expect(calculateInventoryStats(inventory, 10).encumbranceStatus).toBe('normal');

      // Add heavy items
      const heavyInventory = addItem(inventory, createTestItem('heavy', 'Heavy Item', 11));

      // Encumbered (11 > 10 but <= 12)
      expect(calculateInventoryStats(heavyInventory, 10).encumbranceStatus).toBe('encumbered');

      // Overloaded (13 > 12)
      const overloadedInventory = addItem(heavyInventory, createTestItem('extra', 'Extra', 2));
      expect(calculateInventoryStats(overloadedInventory, 10).encumbranceStatus).toBe('overloaded');
    });
  });

  describe('getContainerItems', () => {
    it('should return items in specified container', () => {
      const _inventory = createEmptyInventory();
      const _sword = createTestItem('sword1', 'Iron Sword');
      const potion = createTestItem('potion1', 'Health Potion');

      inventory = addItem(inventory, sword, 'equipped');
      inventory = addItem(inventory, potion, 'consumables');

      const equippedItems = getContainerItems(inventory, 'equipped');
      expect(equippedItems).toHaveLength(1);
      expect(equippedItems[0].name).toBe('Iron Sword');

      const consumableItems = getContainerItems(inventory, 'consumables');
      expect(consumableItems).toHaveLength(1);
      expect(consumableItems[0].name).toBe('Health Potion');
    });
  });

  describe('searchItems', () => {
    it('should search items by name', () => {
      const _inventory = createEmptyInventory();

      inventory = addItem(inventory, createTestItem('sword1', 'Iron Sword'));
      inventory = addItem(inventory, createTestItem('sword2', 'Steel Sword'));
      inventory = addItem(inventory, createTestItem('potion1', 'Health Potion'));

      const swordResults = searchItems(inventory, 'sword');
      expect(swordResults).toHaveLength(2);

      const ironResults = searchItems(inventory, 'iron');
      expect(ironResults).toHaveLength(1);
      expect(ironResults[0].name).toBe('Iron Sword');
    });

    it('should search items by description', () => {
      const _inventory = createEmptyInventory();

      inventory = addItem(inventory, {
        ...createTestItem('potion1', 'Red Potion'),
        description: 'Restores 10 HP when consumed',
      });

      const results = searchItems(inventory, 'restores');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Red Potion');
    });
  });

  describe('getEquippedItems', () => {
    it('should return only equipped items', () => {
      let inventory = createEmptyInventory();

      inventory = addItem(inventory, {
        ...createTestItem('sword1', 'Iron Sword'),
        equipped: true,
      });
      inventory = addItem(inventory, {
        ...createTestItem('armor1', 'Leather Armor'),
        equipped: true,
      });
      inventory = addItem(inventory, createTestItem('potion1', 'Health Potion'));

      const equipped = getEquippedItems(inventory);
      expect(equipped).toHaveLength(2);
      expect(equipped.map(i => i.name)).toContain('Iron Sword');
      expect(equipped.map(i => i.name)).toContain('Leather Armor');
      expect(equipped.map(i => i.name)).not.toContain('Health Potion');
    });
  });

  describe('sortItems', () => {
    const items: Item[] = [
      { ...createTestItem('c', 'Chainmail'), weight: 3, value: 40, category: 'armor' },
      { ...createTestItem('a', 'Arrow'), weight: 0.1, value: 1, category: 'weapon' },
      { ...createTestItem('b', 'Bow'), weight: 2, value: 60, category: 'weapon' },
    ];

    it('should sort by name', () => {
      const _sorted = sortItems(items, 'name');
      expect(sorted[0].name).toBe('Arrow');
      expect(sorted[1].name).toBe('Bow');
      expect(sorted[2].name).toBe('Chainmail');
    });

    it('should sort by weight (descending)', () => {
      const _sorted = sortItems(items, 'weight');
      expect(sorted[0].name).toBe('Chainmail'); // 3
      expect(sorted[1].name).toBe('Bow'); // 2
      expect(sorted[2].name).toBe('Arrow'); // 0.1
    });

    it('should sort by value (descending)', () => {
      const _sorted = sortItems(items, 'value');
      expect(sorted[0].name).toBe('Bow'); // 60
      expect(sorted[1].name).toBe('Chainmail'); // 40
      expect(sorted[2].name).toBe('Arrow'); // 1
    });

    it('should sort by category', () => {
      const sorted = sortItems(items, 'category');
      expect(sorted[0].category).toBe('armor');
      expect(sorted[1].category).toBe('weapon');
      expect(sorted[2].category).toBe('weapon');
    });
  });
});
