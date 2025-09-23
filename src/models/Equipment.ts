/**
 * Equipment and item data models for Dungeon World
 */

// Item categories
export type ItemCategory
  = | 'weapon'
    | 'armor'
    | 'gear'
    | 'consumable'
    | 'treasure'
    | 'magical'

// Official Dungeon World item tags
export type ItemTag
  // Weapon range tags (official DW)
  = | 'hand' // Useful for attacking within reach
    | 'close' // Useful at arm's reach plus a foot or two
    | 'reach' // Useful for attacking several feet away (up to ~10 feet)
    | 'near' // Useful for attacking something in shouting distance
    | 'far' // Useful for attacking something in shouting distance

  // Weapon mechanical effect tags (official DW)
    | 'forceful' // Can knock someone back, maybe off their feet
    | 'messy' // Destructive damage, ripping things apart
    | 'precise' // Use DEX to hack and slash instead of STR
    | 'reload' // Takes more than a moment to reset after attack
    | 'stun' // Does stun damage instead of normal damage
    | 'thrown' // Can be thrown; gone until recovered if used with Volley
    | 'two-handed' // Takes two hands to use effectively
    | 'ignores-armor' // Don't subtract armor from damage taken

  // Armor tags (official DW)
    | 'worn' // Must be wearing it to use
    | 'clumsy' // -1 ongoing while using (cumulative penalty)

  // General equipment tags (official DW)
    | 'applied' // Only useful when carefully applied to person or consumable
    | 'awkward' // Unwieldy and tough to use
    | 'dangerous' // Easy to get in trouble with; GM may invoke consequences
    | 'ration' // Edible, more or less
    | 'requires' // Only useful to certain people who meet requirements
    | 'slow' // Takes minutes or more to use
    | 'touch' // Used by touching to target's skin

  // Numeric tags (handled separately with values)
    | 'piercing' // n Piercing: subtract n from enemy's armor for attack
    | 'ammo' // n Ammo: counts as ammunition for ranged weapons
    | 'damage' // +n Damage: add n to damage dealt
    | 'armor' // n Armor: protects from harm (highest value only)
    | 'armor-plus' // +n Armor: stacks with other armor
    | 'bonus' // +Bonus: modifies effectiveness in specified situations
    | 'uses' // n Uses: can only be used n times
    | 'weight' // n weight: counts against Load
    | 'coins' // n coins: cost to buy

  // Extended tags (not in core DW but useful for implementation)
    | 'chaotic' // Aligned with chaos
    | 'evil' // Aligned with evil
    | 'good' // Aligned with good
    | 'lawful' // Aligned with law
    | 'magical' // Has magical properties
    | 'holy' // Blessed or divine
    | 'unholy' // Cursed or profane

// Tag with optional value (e.g., "uses 3", "armor +1", "weight 1")
export interface Tag {
  name: ItemTag | string // Allow custom tags
  value?: number | string
}

// Base item interface
export interface Item {
  id: string
  name: string
  category: ItemCategory
  tags: Tag[]
  description?: string
  weight: number
  value?: number // Cost in coins
  quantity: number
  equipped: boolean
  customMove?: string // For magical items with special moves
  uses?: {
    current: number
    max: number
  }
}

// Weapon-specific properties
export interface Weapon extends Item {
  category: 'weapon'
  damage?: string // e.g., "+1 damage", "2d4 damage"
  enhancement?: number // Magical bonus
}

// Armor-specific properties
export interface Armor extends Item {
  category: 'armor'
  armorValue: number // The armor points it provides
  enhancement?: number // Magical bonus
}

// Type guard functions
export function isWeapon(item: Item): item is Weapon {
  return item.category === 'weapon'
}

export function isArmor(item: Item): item is Armor {
  return item.category === 'armor'
}

// Utility functions

/**
 * Parse tags from a string (e.g., "close, 1 weight, uses 3, armor +1")
 */
export function parseTagString(tagString: string): Tag[] {
  const tags: Tag[] = []
  const parts = tagString.split(',').map(s => s.trim())

  for (const part of parts) {
    const match = part.match(/^(\w+)\s+(.+)$/)
    if (match) {
      const name = match[1] as ItemTag
      let value = match[2]
      // Normalize patterns like "+ 1" to "+1" for armor/damage, keep as string per tests
      value = value.replace(/\+\s*(\d+)/, '+$1')
      tags.push({ name, value })
    }
    else {
      tags.push({ name: part as ItemTag })
    }
  }

  return tags
}

/**
 * Get total weight of an item (weight * quantity)
 */
export function getItemTotalWeight(item: Item): number {
  return item.weight * item.quantity
}

/**
 * Check if item has a specific tag
 */
export function hasTag(item: Item, tagName: ItemTag | string): boolean {
  return item.tags.some(tag => tag.name === tagName)
}

/**
 * Get tag value if it exists
 */
export function getTagValue(item: Item, tagName: ItemTag | string): number | string | undefined {
  const tag = item.tags.find(t => t.name === tagName)
  if (!tag)
    return undefined
  // Attempt numeric coercion when value is a pure number
  if (typeof tag.value === 'string') {
    const numeric = Number(tag.value)
    if (!Number.isNaN(numeric) && /^\d+(\.\d+)?$/.test(tag.value)) {
      return numeric
    }
  }
  return tag.value
}

/**
 * Calculate total armor value from equipped armor items
 */
export function calculateTotalArmor(items: Item[]): number {
  return items
    .filter(item => item.equipped && isArmor(item))
    .reduce((total, armor) => total + (armor as Armor).armorValue, 0)
}

/**
 * Get weapon damage bonus / dice
 */
export function getWeaponDamage(weapon: Weapon): string {
  return weapon.damage || '+0 damage'
}

/**
 * Format tags for display
 */
export function formatTags(tags: Tag[]): string {
  return tags
    .map(tag => tag.value ? `${tag.name} ${tag.value}` : tag.name)
    .join(', ')
}

// Common items database (can be expanded)
// Using a more flexible type to accommodate different item types
export const COMMON_ITEMS: Array<Partial<Item> | Partial<Weapon> | Partial<Armor>> = [
  // Weapons
  {
    name: 'Dagger',
    category: 'weapon',
    tags: [{ name: 'hand' }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 2,
  } as Partial<Weapon>,
  {
    name: 'Short Sword',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 8,
  } as Partial<Weapon>,
  {
    name: 'Long Sword',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 15,
    damage: '+1 damage',
  } as Partial<Weapon>,
  {
    name: 'Battle Axe',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 10,
  } as Partial<Weapon>,
  {
    name: 'Bow',
    category: 'weapon',
    tags: [{ name: 'near' }, { name: 'far' }, { name: 'weight', value: 2 }],
    weight: 2,
    value: 60,
  } as Partial<Weapon>,

  // Armor
  {
    name: 'Leather',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 10,
    armorValue: 1,
  } as Partial<Armor>,
  {
    name: 'Chainmail',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'weight', value: 3 }],
    weight: 3,
    value: 40,
    armorValue: 2,
  } as Partial<Armor>,
  {
    name: 'Plate',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'clumsy' }, { name: 'weight', value: 4 }],
    weight: 4,
    value: 350,
    armorValue: 3,
  } as Partial<Armor>,

  // Gear
  {
    name: 'Adventuring Gear',
    category: 'gear',
    tags: [{ name: 'uses', value: 5 }, { name: 'weight', value: 2 }],
    weight: 2,
    value: 20,
    uses: { current: 5, max: 5 },
  } as Partial<Item>,
  {
    name: 'Healing Potion',
    category: 'consumable',
    tags: [{ name: 'weight', value: 0 }],
    weight: 0,
    value: 50,
    description: 'Heal 10 HP or remove one debility',
  } as Partial<Item>,
  {
    name: 'Rations',
    category: 'consumable',
    tags: [{ name: 'ration' }, { name: 'uses', value: 5 }, { name: 'weight', value: 1 }],
    weight: 1,
    value: 5,
    uses: { current: 5, max: 5 },
  } as Partial<Item>,
]