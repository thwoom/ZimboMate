import type { Item, ItemTag, Tag } from '../models/Equipment'

/**
 * Tag mechanics utility for Dungeon World * Handles uses tracking, ammo management, and tag-based effects
 */

export interface TagEffect {
  type: 'damage' | 'armor' | 'piercing' | 'bonus' | 'penalty'
  value: number
  source: string
  description: string
}

export interface UsesTracker {
  itemId: string
  tagName: string
  current: number
  max: number
  lastUsed?: Date
}

/**
 * Get all numeric tag values from an item
 */
export function getNumericTagValues(item: Item): Record<string, number> {
  const values: Record<string, number> = {}

  for (const tag of item.tags) {
    if (typeof tag.value === 'number') {
      values[tag.name] = tag.value
    }
  }

  return values
}

/**
 * Check if an item has a specific tag
 */
export function hasTag(item: Item, tagName: ItemTag | string): boolean {
  return item.tags.some(tag => tag.name === tagName)
}

/**
 * Get the value of a specific tag
 */
export function getTagValue(item: Item, tagName: ItemTag | string): number | string | undefined {
  const tag = item.tags.find(t => t.name === tagName)
  return tag?.value
}

/**
 * Calculate total armor from equipped items
 */
export function calculateTotalArmor(items: Item[]): number {
  let highestArmor = 0
  let armorPlus = 0

  for (const item of items) {
    if (!item.equipped)
      continue

    const armorValue = getTagValue(item, 'armor')
    if (typeof armorValue === 'number') {
      highestArmor = Math.max(highestArmor, armorValue) // Highest armor value only
    }

    const armorPlusValue = getTagValue(item, 'armor-plus')
    if (typeof armorPlusValue === 'number') {
      armorPlus += armorPlusValue // Armor-plus stacks
    }
  }

  return highestArmor + armorPlus
}

/**
 * Calculate damage bonus from equipped weapons
 */
export function calculateDamageBonus(items: Item[]): number {
  let damageBonus = 0

  for (const item of items) {
    if (!item.equipped || item.category !== 'weapon')
      continue

    const damageValue = getTagValue(item, 'damage')
    if (typeof damageValue === 'number') {
      damageBonus += damageValue
    }
  }

  return damageBonus
}

/**
 * Calculate piercing bonus from equipped weapons
 */
export function calculatePiercingBonus(items: Item[]): number {
  let piercingBonus = 0

  for (const item of items) {
    if (!item.equipped || item.category !== 'weapon')
      continue

    const piercingValue = getTagValue(item, 'piercing')
    if (typeof piercingValue === 'number') {
      piercingBonus += piercingValue
    }
  }

  return piercingBonus
}

/**
 * Check if an item can be used (has uses remaining)
 */
export function canUseItem(item: Item): boolean {
  if (!item.uses)
    return true // No uses limit
  return item.uses.current > 0
}

/**
 * Use an item (decrement uses)
 */
export function useItem(item: Item): Item | null {
  if (!item.uses || item.uses.current <= 0) {
    return null // Cannot use
  }

  return {
    ...item,
    uses: {
      ...item.uses,
      current: item.uses.current - 1,
    },
  }
}

/**
 * Check if an item has ammo
 */
export function hasAmmo(items: Item[], weapon: Item): boolean {
  const ammoValue = getTagValue(weapon, 'ammo')
  if (typeof ammoValue !== 'number')
    return true // No ammo requirement

  // Check for ammo items in inventory
  return items.some(item =>
    hasTag(item, 'ammo')
    && item.uses
    && item.uses.current > 0,
  )
}

/**
 * Use ammo for a weapon
 */
export function useAmmo(items: Item[], weapon: Item): { items: Item[], ammoUsed: boolean } {
  const ammoValue = getTagValue(weapon, 'ammo')
  if (typeof ammoValue !== 'number') {
    return { items, ammoUsed: false } // No ammo requirement
  }

  // Find ammo item to use
  const ammoItemIndex = items.findIndex(item =>
    hasTag(item, 'ammo')
    && item.uses
    && item.uses.current > 0,
  )

  if (ammoItemIndex === -1) {
    return { items, ammoUsed: false } // No ammo available
  }

  // Use ammo
  const updatedItems = [...items]
  const ammoItem = updatedItems[ammoItemIndex]

  if (ammoItem.uses) {
    updatedItems[ammoItemIndex] = {
      ...ammoItem,
      uses: {
        ...ammoItem.uses,
        current: ammoItem.uses.current - 1,
      },
    }
  }

  return { items: updatedItems, ammoUsed: true }
}

/**
 * Get all active tag effects from equipped items
 */
export function getActiveTagEffects(items: Item[]): TagEffect[] {
  const effects: TagEffect[] = []

  for (const item of items) {
    if (!item.equipped)
      continue

    // Damage bonus
    const damageValue = getTagValue(item, 'damage')
    if (typeof damageValue === 'number' && damageValue > 0) {
      effects.push({
        type: 'damage',
        value: damageValue,
        source: item.name,
        description: `+${damageValue} damage from ${item.name}`,
      })
    }

    // Armor
    const armorValue = getTagValue(item, 'armor')
    if (typeof armorValue === 'number' && armorValue > 0) {
      effects.push({
        type: 'armor',
        value: armorValue,
        source: item.name,
        description: `${armorValue} armor from ${item.name}`,
      })
    }

    // Armor-plus
    const armorPlusValue = getTagValue(item, 'armor-plus')
    if (typeof armorPlusValue === 'number' && armorPlusValue > 0) {
      effects.push({
        type: 'armor',
        value: armorPlusValue,
        source: item.name,
        description: `+${armorPlusValue} armor from ${item.name}`,
      })
    }

    // Piercing
    const piercingValue = getTagValue(item, 'piercing')
    if (typeof piercingValue === 'number' && piercingValue > 0) {
      effects.push({
        type: 'piercing',
        value: piercingValue,
        source: item.name,
        description: `${piercingValue} piercing from ${item.name}`,
      })
    }

    // Clumsy penalty
    if (hasTag(item, 'clumsy')) {
      effects.push({
        type: 'penalty',
        value: -1,
        source: item.name,
        description: `-1 ongoing from ${item.name} (clumsy)`,
      })
    }
  }

  return effects
}

/**
 * Calculate total weight from items
 */
export function calculateTotalWeight(items: Item[]): number {
  return items.reduce((total, item) => {
    const weightValue = getTagValue(item, 'weight')
    const weight = typeof weightValue === 'number' ? weightValue : item.weight
    return total + (weight * item.quantity)
  }, 0)
}

/**
 * Check if an item is consumable
 */
export function isConsumable(item: Item): boolean {
  return item.category === 'consumable' || hasTag(item, 'uses') || hasTag(item, 'ammo')
}

/**
 * Get items that are running low on uses
 */
export function getLowUsesItems(items: Item[], threshold = 2): Item[] {
  return items.filter(item =>
    item.uses
    && item.uses.current <= threshold
    && item.uses.current > 0,
  )
}

/**
 * Get depleted items (no uses remaining)
 */
export function getDepletedItems(items: Item[]): Item[] {
  return items.filter(item =>
    item.uses
    && item.uses.current === 0,
  )
}

/**
 * Restore uses to an item
 */
export function restoreItemUses(item: Item, amount = 1): Item {
  if (!item.uses)
    return item

  return {
    ...item,
    uses: {
      ...item.uses,
      current: Math.min(item.uses.current + amount, item.uses.max),
    },
  }
}

/**
 * Reset all uses to maximum
 */
export function resetAllUses(items: Item[]): Item[] {
  return items.map((item) => {
    if (!item.uses)
      return item

    return {
      ...item,
      uses: {
        ...item.uses,
        current: item.uses.max,
      },
    }
  })
}

/**
 * Parse tag string into Tag objects
 */
export function parseTagString(tagString: string): Tag[] {
  const tags: Tag[] = []
  const parts = tagString.split(',').map(s => s.trim())

  for (const part of parts) {
    const match = part.match(/^(\w+)\s+(.+)$/)
    if (match) {
      const [, name, value] = match
      const numValue = Number.parseInt(value, 10)
      tags.push({
        name: name as ItemTag,
        value: isNaN(numValue) ? value : numValue,
      })
    }
    else {
      tags.push({ name: part as ItemTag })
    }
  }

  return tags
}

/**
 * Format tags for display
 */
export function formatTags(tags: Tag[]): string {
  return tags
    .map(tag => tag.value !== undefined ? `${tag.name} ${tag.value}` : tag.name)
    .join(', ')
}

/**
 * Get tag description for tooltips
 */
export function getTagDescription(tag: Tag): string {
  const descriptions: Record<ItemTag, string> = {
    // Weapon range tags
    'hand': 'Useful for attacking within reach',
    'close': 'Useful at arm\'s reach plus a foot or two',
    'reach': 'Useful for attacking several feet away (up to ~10 feet)',
    'near': 'Useful if you can see the whites of their eyes',
    'far': 'Useful for attacking something in shouting distance',

    // Weapon mechanical effect tags
    'forceful': 'Can knock someone back, maybe off their feet',
    'messy': 'Destructive damage, ripping things apart',
    'precise': 'Use DEX to hack and slash instead of STR',
    'reload': 'Takes more than a moment to reset after attack',
    'stun': 'Does stun damage instead of normal damage',
    'thrown': 'Can be thrown; gone until recovered if used with Volley',
    'two-handed': 'Takes two hands to use effectively',
    'ignores-armor': 'Don\'t subtract armor from damage taken',

    // Armor tags
    'worn': 'Must be wearing it to use',
    'clumsy': '-1 ongoing while using (cumulative penalty)',

    // General equipment tags
    'applied': 'Only useful when carefully applied to person or consumable',
    'awkward': 'Unwieldy and tough to use',
    'dangerous': 'Easy to get in trouble with; GM may invoke consequences',
    'ration': 'Edible, more or less',
    'requires': 'Only useful to certain people who meet requirements',
    'slow': 'Takes minutes or more to use',
    'touch': 'Used by touching to target\'s skin',

    // Numeric tags
    'piercing': 'Subtract value from enemy\'s armor for attack',
    'ammo': 'Counts as ammunition for ranged weapons',
    'damage': 'Add value to damage dealt',
    'armor': 'Protects from harm (highest value only)',
    'armor-plus': 'Stacks with other armor',
    'bonus': 'Modifies effectiveness in specified situations',
    'uses': 'Can only be used this many times',
    'weight': 'Counts against Load',
    'coins': 'Cost to buy',

    // Extended tags
    'chaotic': 'Aligned with chaos',
    'evil': 'Aligned with evil',
    'good': 'Aligned with good',
    'lawful': 'Aligned with law',
    'magical': 'Has magical properties',
    'holy': 'Blessed or divine',
    'unholy': 'Cursed or profane',
  }

  const baseDesc = descriptions[tag.name as ItemTag] || tag.name
  if (tag.value !== undefined) {
    return `${baseDesc} (${tag.value})`
  }
  return baseDesc
}
