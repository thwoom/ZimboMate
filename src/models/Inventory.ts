/**
 * Inventory management data models for Dungeon World
 */

import { Item, getItemTotalWeight } from './Equipment';

// Inventory categories for organization
export type InventoryCategory = 
  | 'equipped'    // Currently equipped items
  | 'carried'     // In backpack/pouches
  | 'stored'      // In storage/stash
  | 'consumables' // Quick access consumables
  | 'treasure'    // Valuable items
  | 'other';      // Miscellaneous

// Encumbrance status
export type EncumbranceStatus = 
  | 'normal'      // Weight <= Load
  | 'encumbered'  // Weight <= Load + 2 (-1 ongoing)
  | 'overloaded'; // Weight > Load + 2 (can barely move)

// Container for organizing items
export interface Container {
  id: string;
  name: string;
  category: InventoryCategory;
  items: string[]; // Item IDs
  maxWeight?: number; // Optional weight limit
  description?: string;
}

// Complete inventory
export interface Inventory {
  items: Record<string, Item>; // All items keyed by ID
  containers: Container[]; // Organization containers
  quickSlots: string[]; // Item IDs for quick access
  lastUpdated: Date;
}

// Inventory statistics
export interface InventoryStats {
  totalWeight: number;
  totalValue: number;
  itemCount: number;
  encumbranceStatus: EncumbranceStatus;
  weightByCategory: Record<InventoryCategory, number>;
}

// Utility functions

/**
 * Create a new empty inventory
 */
export function createEmptyInventory(): Inventory {
  return {
    items: {},
    containers: [
      {
        id: 'equipped',
        name: 'Equipped',
        category: 'equipped',
        items: []
      },
      {
        id: 'carried',
        name: 'Carried',
        category: 'carried',
        items: []
      },
      {
        id: 'consumables',
        name: 'Consumables',
        category: 'consumables',
        items: []
      }
    ],
    quickSlots: [],
    lastUpdated: new Date()
  };
}

/**
 * Add item to inventory
 */
export function addItem(inventory: Inventory, item: Item, containerId?: string): Inventory {
  const newInventory = { ...inventory };
  newInventory.items[item.id] = item;
  
  // Add to container if specified
  if (containerId) {
    const container = newInventory.containers.find(c => c.id === containerId);
    if (container && !container.items.includes(item.id)) {
      container.items.push(item.id);
    }
  }
  
  newInventory.lastUpdated = new Date();
  return newInventory;
}

/**
 * Remove item from inventory
 */
export function removeItem(inventory: Inventory, itemId: string): Inventory {
  const newInventory = { ...inventory };
  
  // Remove from items
  delete newInventory.items[itemId];
  
  // Remove from all containers
  newInventory.containers.forEach(container => {
    container.items = container.items.filter(id => id !== itemId);
  });
  
  // Remove from quick slots
  newInventory.quickSlots = newInventory.quickSlots.filter(id => id !== itemId);
  
  newInventory.lastUpdated = new Date();
  return newInventory;
}

/**
 * Move item between containers
 */
export function moveItem(
  inventory: Inventory,
  itemId: string,
  fromContainerId: string,
  toContainerId: string
): Inventory {
  const newInventory = { ...inventory };
  
  const fromContainer = newInventory.containers.find(c => c.id === fromContainerId);
  const toContainer = newInventory.containers.find(c => c.id === toContainerId);
  
  if (fromContainer && toContainer) {
    fromContainer.items = fromContainer.items.filter(id => id !== itemId);
    if (!toContainer.items.includes(itemId)) {
      toContainer.items.push(itemId);
    }
  }
  
  newInventory.lastUpdated = new Date();
  return newInventory;
}

/**
 * Toggle item equipped status
 */
export function toggleEquipped(inventory: Inventory, itemId: string): Inventory {
  const newInventory = { ...inventory };
  const item = newInventory.items[itemId];
  
  if (item) {
    item.equipped = !item.equipped;
    
    // Move between equipped and carried containers
    const equippedContainer = newInventory.containers.find(c => c.category === 'equipped');
    const carriedContainer = newInventory.containers.find(c => c.category === 'carried');
    
    if (item.equipped) {
      // Move to equipped
      if (carriedContainer) {
        carriedContainer.items = carriedContainer.items.filter(id => id !== itemId);
      }
      if (equippedContainer && !equippedContainer.items.includes(itemId)) {
        equippedContainer.items.push(itemId);
      }
    } else {
      // Move to carried
      if (equippedContainer) {
        equippedContainer.items = equippedContainer.items.filter(id => id !== itemId);
      }
      if (carriedContainer && !carriedContainer.items.includes(itemId)) {
        carriedContainer.items.push(itemId);
      }
    }
  }
  
  newInventory.lastUpdated = new Date();
  return newInventory;
}

/**
 * Calculate inventory statistics
 */
export function calculateInventoryStats(
  inventory: Inventory,
  maxLoad: number
): InventoryStats {
  let totalWeight = 0;
  let totalValue = 0;
  let itemCount = 0;
  const weightByCategory: Record<InventoryCategory, number> = {
    equipped: 0,
    carried: 0,
    stored: 0,
    consumables: 0,
    treasure: 0,
    other: 0
  };
  
  // Calculate totals
  for (const item of Object.values(inventory.items)) {
    const itemWeight = getItemTotalWeight(item);
    totalWeight += itemWeight;
    totalValue += (item.value || 0) * item.quantity;
    itemCount += item.quantity;
    
    // Find which container has this item
    const container = inventory.containers.find(c => c.items.includes(item.id));
    if (container) {
      weightByCategory[container.category] += itemWeight;
    }
  }
  
  // Determine encumbrance status
  let encumbranceStatus: EncumbranceStatus = 'normal';
  if (totalWeight > maxLoad + 2) {
    encumbranceStatus = 'overloaded';
  } else if (totalWeight > maxLoad) {
    encumbranceStatus = 'encumbered';
  }
  
  return {
    totalWeight,
    totalValue,
    itemCount,
    encumbranceStatus,
    weightByCategory
  };
}

/**
 * Get items in a specific container
 */
export function getContainerItems(inventory: Inventory, containerId: string): Item[] {
  const container = inventory.containers.find(c => c.id === containerId);
  if (!container) return [];
  
  return container.items
    .map(itemId => inventory.items[itemId])
    .filter(item => item !== undefined);
}

/**
 * Search items by name or description
 */
export function searchItems(inventory: Inventory, query: string): Item[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(inventory.items).filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    (item.description && item.description.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all equipped items
 */
export function getEquippedItems(inventory: Inventory): Item[] {
  return Object.values(inventory.items).filter(item => item.equipped);
}

/**
 * Sort items by various criteria
 */
export function sortItems(
  items: Item[],
  sortBy: 'name' | 'weight' | 'value' | 'category' = 'name'
): Item[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'weight':
        return getItemTotalWeight(b) - getItemTotalWeight(a);
      case 'value':
        return (b.value || 0) - (a.value || 0);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
}
