import type { Character } from './models/Character'
// Mock data for Equipment & Inventory System
import type { Armor, Item, Weapon } from './models/Equipment'
import type { Inventory } from './models/Inventory'
import { createDummyCharacter } from './models/Character'
import { createEmptyInventory } from './models/Inventory'
import { logger } from './utils/logger'

// Equipment and Inventory related enums
export enum InventoryView {
  GRID = 'grid',
  LIST = 'list',
  COMPACT = 'compact',
}

export enum ItemSortBy {
  NAME = 'name',
  WEIGHT = 'weight',
  VALUE = 'value',
  CATEGORY = 'category',
  RECENTLY_ADDED = 'recently_added',
}

export enum InventoryFilter {
  ALL = 'all',
  WEAPONS = 'weapons',
  ARMOR = 'armor',
  CONSUMABLES = 'consumables',
  TREASURE = 'treasure',
  MAGICAL = 'magical',
  EQUIPPED = 'equipped',
}

export enum DragDropType {
  ITEM = 'item',
  CONTAINER = 'container',
}

export enum ItemAction {
  EQUIP = 'equip',
  UNEQUIP = 'unequip',
  USE = 'use',
  DROP = 'drop',
  SPLIT = 'split',
  COMBINE = 'combine',
  INSPECT = 'inspect',
}

// String formatting functions for equipment and inventory
export function formatWeight(weight: number): string {
  return weight === 1 ? `${weight} lb` : `${weight} lbs`
}

export function formatValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k coins`
  }
  return `${value} coins`
}

export function formatLoadStatus(current: number, max: number): string {
  const percentage = (current / max) * 100
  if (percentage <= 100) return 'Normal'
  if (percentage <= 120) return 'Encumbered (-1 ongoing)'
  return 'Overloaded (can barely move)'
}

export function formatItemQuantity(quantity: number): string {
  return quantity > 1 ? `x${quantity}` : ''
}

export function formatEncumbranceStatus(status: string): string {
  switch (status) {
    case 'normal':
      return 'Normal'
    case 'encumbered':
      return 'Encumbered'
    case 'overloaded':
      return 'Overloaded'
    default:
      return 'Unknown'
  }
}

export function formatItemTags(
  tags: Array<{ name: string; value?: string | number }>,
): string {
  return tags
    .map((tag) => (tag.value ? `${tag.name} ${tag.value}` : tag.name))
    .join(', ')
}

// Create sample items with proper IDs and full data
function createSampleItems(): Item[] {
  return [
    {
      id: 'longsword-1',
      name: 'Longsword',
      category: 'weapon',
      tags: [
        { name: 'close' },
        { name: 'messy' },
        { name: 'weight', value: 2 },
      ],
      description:
        'A well-balanced blade with a cross-guard and grip wrapped in leather.',
      weight: 2,
      value: 15,
      quantity: 1,
      equipped: true,
      damage: '1d8',
    } as Weapon,
    {
      id: 'chainmail-1',
      name: 'Chainmail',
      category: 'armor',
      tags: [{ name: 'worn' }, { name: 'mail' }, { name: 'weight', value: 3 }],
      description: 'Interlocking metal rings that provide flexible protection.',
      weight: 3,
      value: 40,
      quantity: 1,
      equipped: true,
      armorValue: 2,
    } as Armor,
    {
      id: 'healing-potion-1',
      name: 'Healing Potion',
      category: 'consumable',
      tags: [{ name: 'weight', value: 0 }],
      description: 'A red liquid that restores 10 HP when consumed.',
      weight: 0,
      value: 50,
      quantity: 3,
      equipped: false,
    },
    {
      id: 'rations-1',
      name: 'Travel Rations',
      category: 'consumable',
      tags: [
        { name: 'ration' },
        { name: 'uses', value: 5 },
        { name: 'weight', value: 1 },
      ],
      description: 'Dried meat, hardtack, and preserved fruits.',
      weight: 1,
      value: 10,
      quantity: 1,
      equipped: false,
      uses: { current: 5, max: 5 },
    },
    {
      id: 'thieves-tools-1',
      name: "Thieves' Tools",
      category: 'gear',
      tags: [{ name: 'weight', value: 1 }],
      description:
        'Lockpicks, small files, and other tools for bypassing security.',
      weight: 1,
      value: 25,
      quantity: 1,
      equipped: false,
    },
    {
      id: 'gold-coins-1',
      name: 'Gold Coins',
      category: 'treasure',
      tags: [{ name: 'weight', value: 0 }],
      description: 'Shiny gold coins from various kingdoms.',
      weight: 0,
      value: 1,
      quantity: 247,
      equipped: false,
    },
    {
      id: 'rope-1',
      name: 'Adventuring Rope',
      category: 'gear',
      tags: [{ name: 'weight', value: 2 }],
      description: '50 feet of strong hemp rope.',
      weight: 2,
      value: 5,
      quantity: 1,
      equipped: false,
    },
  ]
}

// Mock inventory with organized containers
function createMockInventory(): Inventory {
  const inventory = createEmptyInventory()
  const items = createSampleItems()

  // Add items to inventory and organize them
  items.forEach((item) => {
    inventory.items[item.id] = item

    // Organize into appropriate containers
    if (item.equipped) {
      const equippedContainer = inventory.containers.find(
        (c) => c.category === 'equipped',
      )
      if (equippedContainer) {
        equippedContainer.items.push(item.id)
      }
    } else if (item.category === 'consumable') {
      const consumablesContainer = inventory.containers.find(
        (c) => c.category === 'consumables',
      )
      if (consumablesContainer) {
        consumablesContainer.items.push(item.id)
      }
    } else {
      const carriedContainer = inventory.containers.find(
        (c) => c.category === 'carried',
      )
      if (carriedContainer) {
        carriedContainer.items.push(item.id)
      }
    }
  })

  return inventory
}

// Mock character with inventory
export function mockCharacterWithInventory(): Character {
  const character = createDummyCharacter()
  const inventory = createMockInventory()

  // Update character with inventory items
  character.inventory = Object.values(inventory.items)
  character.load.current = 8 // Total weight from equipped + carried items
  character.load.max = 14 // STR modifier + base load

  return character
}

// Mock data for store
export const mockStore = {
  activeCharacter: mockCharacterWithInventory(),
  inventory: createMockInventory(),
  selectedItems: [] as string[],
  draggedItem: null as string | null,
  inventoryView: InventoryView.GRID,
  sortBy: ItemSortBy.NAME,
  filterBy: InventoryFilter.ALL,
  searchQuery: '',
}

// Mock data for props
export const mockRootProps = {
  character: mockCharacterWithInventory(),
  onItemEquip: (itemId: string) => logger.debug('Equipping item:', itemId),
  onItemUnequip: (itemId: string) => logger.debug('Unequipping item:', itemId),
  onItemUse: (itemId: string) => logger.debug('Using item:', itemId),
  onItemDrop: (itemId: string) => logger.debug('Dropping item:', itemId),
  onInventoryUpdate: (inventory: Inventory) =>
    logger.debug('Inventory updated:', inventory),
}
