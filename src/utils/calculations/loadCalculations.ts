/**
 * Load and encumbrance calculations
 */

import { Character, calculateMaxLoad } from '../../models/Character';
import {
  Inventory,
  EncumbranceStatus,
  calculateInventoryStats,
  getContainerItems,
} from '../../models/Inventory';
import { Item, getItemTotalWeight, hasTag } from '../../models/Equipment';

/**
 * Calculate detailed load information
 */
export function calculateDetailedLoad(
  character: Character,
  inventory: Inventory,
): {
  maxLoad: number;
  currentLoad: number;
  status: EncumbranceStatus;
  percentage: number;
  breakdown: {
    container: string;
    weight: number;
    items: {
      name: string;
      quantity: number;
      weight: number;
      totalWeight: number;
    }[];
  }[];
  penalties: {
    type: string;
    value: number;
    description: string;
  }[];
} {
  const maxLoad = calculateMaxLoad(character);
  const currentLoad = stats.totalWeight;
  const percentage = (currentLoad / maxLoad) * 100;

  // Calculate breakdown by container
  const breakdown = inventory.containers.map(container => {
    const items = getContainerItems(inventory, container.id);
    const containerItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      totalWeight: getItemTotalWeight(item),
    }));

    const totalWeight = containerItems.reduce(
      (sum, item) => sum + item.totalWeight,
      0,
    );

    return {
      container: container.name,
      weight: totalWeight,
      items: containerItems,
    };
  });

  // Calculate penalties
  const penalties: { type: string; value: number; description: string }[] = [];

  if (stats.encumbranceStatus === 'encumbered') {
    penalties.push({
      type: 'ongoing',
      value: -1,
      description: 'Encumbered: -1 ongoing to all rolls',
    });
  } else if (stats.encumbranceStatus === 'overloaded') {
    penalties.push({
      type: 'ongoing',
      value: -3,
      description: 'Overloaded: Can barely move, -3 to all rolls',
    });
  }

  return {
    maxLoad,
    currentLoad,
    status: stats.encumbranceStatus,
    percentage,
    breakdown,
    penalties,
  };
}

/**
 * Get weight reduction from items / abilities
 */
export function getWeightReductions(
  character: Character,
  inventory: Inventory,
): {
  source: string;
  reduction: number;
  type: 'percentage' | 'flat';
}[] {
  const reductions: { source: string; reduction: number; type: 'percentage' | 'flat' }[] = [];

  // Check for pack animals or similar
  const packAnimals = allItems.filter(item =>
    hasTag(item, 'pack_animal') ||
    item.name.toLowerCase().includes('mule') ||
    item.name.toLowerCase().includes('horse'),
  );

  for (const animal of packAnimals) {
    // Pack animals typically add to load capacity rather than reduce weight
    // But we'll track them here for completeness
    reductions.push({
      source: animal.name,
      reduction: 10, // Typical pack animal capacity
      type: 'flat',
    });
  }

  // Check for magical bags
  const magicalContainers = allItems.filter(item =>
    (hasTag(item, 'magical') && item.name.toLowerCase().includes('bag')) ||
    item.name.toLowerCase().includes('bag of holding'),
  );

  for (const container of magicalContainers) {
    reductions.push({
      source: container.name,
      reduction: 0.5, // Items inside weigh half
      type: 'percentage',
    });
  }

  return reductions;
}

/**
 * Calculate coin weight
 */
export function calculateCoinWeight(coinCount: number): number {
  // In Dungeon World, 100 coins = 1 weight
  return Math.floor(coinCount / 100);
}

/**
 * Get heaviest items (for optimization suggestions)
 */
export function getHeaviestItems(
  inventory: Inventory,
  count = 5,
): {
  item: Item;
  totalWeight: number;
  percentageOfLoad: number;
}[] {
  const stats = calculateInventoryStats(inventory, 10); // Use dummy max load

  return allItems
    .map(item => ({
      item,
      totalWeight: getItemTotalWeight(item),
      percentageOfLoad: (getItemTotalWeight(item) / stats.totalWeight) * 100,
    }))
    .sort((a, b) => b.totalWeight-a.totalWeight)
    .slice(0, count);
}

/**
 * Get items with no weight (potentially missed)
 */
export function getWeightlessItems(inventory: Inventory): Item[] {
  return Object.values(inventory.items).filter(item =>
    item.weight === 0 && !hasTag(item, 'weight'),
  );
}

/**
 * Suggest load optimization
 */
export function suggestLoadOptimization(
  character: Character,
  inventory: Inventory,
): {
  suggestion: string;
  impact: string;
  items?: Item[];
}[] {
  const suggestions: { suggestion: string; impact: string; items?: Item[] }[] = [];
  const stats = calculateInventoryStats(inventory, calculateMaxLoad(character));

  // Check if overloaded
  if (stats.encumbranceStatus === 'overloaded') {
    suggestions.push({
      suggestion: `Drop ${Math.ceil(weightToReduce)} weight to remove overloaded status`,
      impact: 'Remove-3 ongoing penalty and regain mobility',
    });
  }

  // Check if encumbered
  else if (stats.encumbranceStatus === 'encumbered') {
    const weightToReduce = stats.totalWeight-calculateMaxLoad(character);
    suggestions.push({
      suggestion: `Drop ${Math.ceil(weightToReduce)} weight to remove encumbered status`,
      impact: 'Remove-1 ongoing penalty',
    });
  }

  // Check for duplicate items
  const allItems = Object.values(inventory.items);
  const duplicates = allItems.filter(item =>
    allItems.some(other =>
      other.id !== item.id &&
      other.name === item.name &&
      other.equipped === item.equipped,
    ),
  );

  if (duplicates.length > 0) {
    suggestions.push({
      suggestion: 'Consolidate duplicate items',
      impact: 'Simplify inventory management',
      items: duplicates,
    });
  }

  // Check for heavy non-essential items
  const heavyItems = getHeaviestItems(inventory, 3);
  const nonEssentialHeavy = heavyItems.filter(({ item }) =>
    !item.equipped &&
    item.category !== 'consumable' &&
    !hasTag(item, 'ration'),
  );

  if (nonEssentialHeavy.length > 0) {
    suggestions.push({
      suggestion: 'Consider dropping heavy non-equipped items',
      impact: `Save ${nonEssentialHeavy.reduce((sum, h) => sum + h.totalWeight, 0)} weight`,
      items: nonEssentialHeavy.map(h => h.item),
    });
  }

  // Check coin weight
  if (character.coin > 0) {
    const coinWeight = calculateCoinWeight(character.coin);
    if (coinWeight > 2) {
      suggestions.push({
        suggestion: `Convert ${character.coin} coins to gems or lighter currency`,
        impact: `Save ${coinWeight} weight`,
      });
    }
  }

  return suggestions;
}

/**
 * Calculate movement speed based on encumbrance
 */
export function getMovementSpeed(
  baseSpeed: number,
  encumbranceStatus: EncumbranceStatus,
): {
  speed: number;
  description: string;
} {
  switch (encumbranceStatus) {
    case 'normal':
      return {
        speed: baseSpeed,
        description: 'Normal movement',
      };
    case 'encumbered':
      return {
        speed: Math.floor(baseSpeed * 0.75),
        description: 'Reduced movement (75% speed)',
      };
    case 'overloaded':
      return {
        speed: Math.floor(baseSpeed * 0.25),
        description: 'Severely limited movement (25% speed)',
      };
  }
}
