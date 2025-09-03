/**
 * Combat-related calculations
 */

import type { Character, DamageDie } from '../../models/Character'
import type { ActiveCondition, Condition } from '../../models/Conditions'
import type { Inventory } from '../../models/Inventory'
import type { TemporaryModifier } from '../../models/Modifiers'
import {
  getTagValue,
  hasTag,
  isArmor,
  isWeapon,
} from '../../models/Equipment'
import { getEquippedItems } from '../../models/Inventory'

/**
 * Calculate total armor from all sources
 */
export function calculateCombatArmor(
  character: Character,
  inventory: Inventory,
  modifiers: TemporaryModifier[] = [],
  conditions: Condition[] = [],
  activeConditions: ActiveCondition[] = [],
): {
  total: number
  breakdown: {
    source: string
    value: number
  }[]
} {
  const breakdown: { source: string, value: number }[] = []
  let total = 0

  // Get equipped items from inventory
  const equippedItems = Object.values(inventory.items).filter(item => item.equipped)

  // Base armor from character
  if (character.baseArmor !== undefined && character.baseArmor > 0) {
    breakdown.push({ source: 'Base Armor', value: character.baseArmor })
    total += character.baseArmor
  }

  // Armor from equipment
  const armorItems = equippedItems.filter(isArmor)

  for (const armor of armorItems) {
    breakdown.push({ source: armor.name, value: armor.armorValue })
    total += armor.armorValue
  }

  // Check for shield
  const shields = equippedItems.filter(item =>
    hasTag(item, 'shield') || item.name.toLowerCase().includes('shield'),
  )
  for (const shield of shields) {
    const armorBonus = Number.parseInt(getTagValue(shield, 'armor') as string || '1')
    breakdown.push({ source: shield.name, value: armorBonus })
    total += armorBonus
  }

  // Temporary armor modifiers
  const armorMods = modifiers.filter(
    mod => mod.active && mod.target === 'armor',
  )
  for (const mod of armorMods) {
    breakdown.push({ source: mod.source, value: mod.value })
    total += mod.value
  }

  // Condition armor modifiers
  for (const condition of conditions) {
    const active = activeConditions.find(ac =>
      ac.conditionId === condition.id
      && ac.characterId === character.id
      && ac.active,
    )

    if (active && condition.modifiers?.armor) {
      breakdown.push({ source: condition.name, value })
      total += value
    }
  }

  return {
    total: Math.max(0, total), // Armor can't be negative
    breakdown,
  }
}

/**
 * Calculate damage output
 */
export function calculateDamageOutput(
  character: Character,
  inventory: Inventory,
  modifiers: TemporaryModifier[] = [],
): {
  damageDie: DamageDie
  bonusDamage: number
  breakdown: {
    source: string
    value: string | number
  }[]
  totalExpression: string
} {
  const breakdown: { source: string, value: string | number }[] = []
  const damageDie = character.damageDie
  let bonusDamage = 0

  // Base damage die
  breakdown.push({ source: 'Class Damage Die', value: damageDie })

  // Weapon bonuses
  for (const weapon of weapons) {
    if (weapon.damage) {
      // Parse damage bonus (e.g., "+1 damage", "+2 damage", "best of 2d8")
      const bonusMatch = weapon.damage.match(/\+(\d+)\s*damage/i)
      if (bonusMatch) {
        const bonus = Number.parseInt(bonusMatch[1])
        breakdown.push({ source: weapon.name, value: `+${bonus}` })
        bonusDamage += bonus
      }
      else if (weapon.damage.toLowerCase().includes('best of')) {
        // Special case for weapons that change the damage die
        breakdown.push({ source: weapon.name, value: weapon.damage })
      }
    }

    // Check for enhancement bonus
    if (weapon.enhancement) {
      breakdown.push({ source: `${weapon.name} (magic)`, value: `+${weapon.enhancement}` })
      bonusDamage += weapon.enhancement
    }
  }

  // Temporary damage modifiers
  const damageMods = modifiers.filter(
    mod => mod.active && mod.target === 'damage',
  )
  for (const mod of damageMods) {
    breakdown.push({ source: mod.source, value: mod.value > 0 ? `+${mod.value}` : `${mod.value}` })
    bonusDamage += mod.value
  }

  // Build total expression
  let totalExpression = `1${damageDie}`
  if (bonusDamage > 0) {
    totalExpression += `+${bonusDamage}`
  }
  else if (bonusDamage < 0) {
    totalExpression += `${bonusDamage}`
  }

  return {
    damageDie,
    bonusDamage,
    breakdown,
    totalExpression,
  }
}

/**
 * Check for combat penalties
 */
export function getCombatPenalties(
  character: Character,
  inventory: Inventory,
): {
  penalties: {
    source: string
    effect: string
    value?: number
  }[]
  totalOngoing: number
} {
  const penalties: { source: string, effect: string, value?: number }[] = []
  const totalOngoing = 0

  // Check for clumsy armor
  const clumsyItems = equippedItems.filter(item => hasTag(item, 'clumsy'))

  for (const item of clumsyItems) {
    penalties.push({
      source: item.name,
      effect: '-1 ongoing to DEX-based moves',
      value: -1,
    })
    // Note: This only affects DEX moves, not all rolls
  }

  // Check for awkward items
  const awkwardItems = equippedItems.filter(item => hasTag(item, 'awkward'))
  for (const item of awkwardItems) {
    penalties.push({
      source: item.name,
      effect: 'Difficult to use effectively',
    })
  }

  // Check for two-handed conflicts
  const twoHandedWeapons = equippedItems.filter(item =>
    item.category === 'weapon' && hasTag(item, 'two-handed'),
  )
  const allWeapons = equippedItems.filter(item => item.category === 'weapon')

  if (twoHandedWeapons.length > 0 && allWeapons.length > 1) {
    penalties.push({
      source: 'Equipment Conflict',
      effect: 'Cannot effectively use two-handed weapon with other weapons',
    })
  }

  return {
    penalties,
    totalOngoing,
  }
}

/**
 * Calculate effective range for attacks
 */
export function getWeaponRanges(inventory: Inventory): {
  melee: string[]
  ranged: string[]
  reach: string[]
} {
  const melee: string[] = []
  const ranged: string[] = []
  const reach: string[] = []

  for (const weapon of weapons) {
    if (hasTag(weapon, 'hand') || hasTag(weapon, 'close')) {
      melee.push(weapon.name)
    }
    if (hasTag(weapon, 'reach')) {
      reach.push(weapon.name)
    }
    if (hasTag(weapon, 'near') || hasTag(weapon, 'far')) {
      ranged.push(weapon.name)
    }
  }

  return { melee, ranged, reach }
}

/**
 * Check if character has a specific weapon property
 */
export function hasWeaponProperty(
  inventory: Inventory,
  property: string,
): boolean {
  return weapons.some(weapon => hasTag(weapon, property))
}

/**
 * Get ammunition count for ranged weapons
 */
export function getAmmunitionCount(inventory: Inventory): {
  weapon: string
  ammoType: string
  count: number
}[] {
  const result: { weapon: string, ammoType: string, count: number }[] = []

  // Check for weapons with ammo tag
  const rangedWeapons = equippedItems.filter(item =>
    hasTag(item, 'near') || hasTag(item, 'far'),
  )

  for (const weapon of rangedWeapons) {
    const ammoValue = getTagValue(weapon, 'ammo')
    if (ammoValue) {
      result.push({
        weapon: weapon.name,
        ammoType: 'Ammo',
        count: Number.parseInt(ammoValue as string) || 0,
      })
    }
  }

  // Check for specific ammo items
  const allItems = Object.values(inventory.items)
  const ammoItems = allItems.filter(item =>
    hasTag(item, 'ammo')
    || item.name.toLowerCase().includes('arrow')
    || item.name.toLowerCase().includes('bolt')
    || item.name.toLowerCase().includes('shot'),
  )

  for (const ammo of ammoItems) {
    result.push({
      weapon: 'Any',
      ammoType: ammo.name,
      count: ammo.quantity,
    })
  }

  return result
}

/**
 * Calculate piercing value (reduces enemy armor)
 */
export function getPiercingValue(inventory: Inventory): number {
  const equippedItems = getEquippedItems(inventory)
  const weapons = equippedItems.filter(isWeapon)

  let maxPiercing = 0

  for (const weapon of weapons) {
    const piercingValue = getTagValue(weapon, 'piercing')
    if (piercingValue) {
      const value = Number.parseInt(piercingValue as string) || 1
      maxPiercing = Math.max(maxPiercing, value)
    }
    else if (hasTag(weapon, 'piercing')) {
      maxPiercing = Math.max(maxPiercing, 1)
    }
  }

  return maxPiercing
}
