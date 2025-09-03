import type { Item } from '../models/Equipment'
import { getTagValue, hasTag, isArmor, isWeapon } from '../models/Equipment'

export interface TagEffect {
  key: string
  description: string
  apply?: (item: Item) => void
}

export function resolveTagEffects(item: Item): TagEffect[] {
  const effects: TagEffect[] = []

  // Armor penalties
  if (isArmor(item) && hasTag(item, 'clumsy')) {
    effects.push({ key: 'clumsy', description: '-1 ongoing while wearing (DW: clumsy)' })
  }

  // Weapon properties
  if (isWeapon(item)) {
    if (hasTag(item, 'precise'))
      effects.push({ key: 'precise', description: 'Use DEX for Hack & Slash instead of STR' })
    if (hasTag(item, 'forceful'))
      effects.push({ key: 'forceful', description: 'Can knock targets back' })
    if (hasTag(item, 'messy'))
      effects.push({ key: 'messy', description: 'Causes grisly, destructive damage' })
    if (hasTag(item, 'reload'))
      effects.push({ key: 'reload', description: 'Takes more than a moment to reset' })
    if (hasTag(item, 'ignores-armor'))
      effects.push({ key: 'ignores-armor', description: 'Target armor does not reduce damage' })
  }

  // Numeric tags
  const armor = getTagValue(item, 'armor')
  if (typeof armor === 'number')
    effects.push({ key: 'armor', description: `Provides ${armor} armor (highest applies)` })

  const armorPlus = getTagValue(item, 'armor-plus')
  if (typeof armorPlus === 'number')
    effects.push({ key: 'armor-plus', description: `+${armorPlus} armor (stacks)` })

  const piercing = getTagValue(item, 'piercing')
  if (typeof piercing === 'number')
    effects.push({ key: 'piercing', description: `${piercing} piercing (reduce enemy armor)` })

  const damage = getTagValue(item, 'damage')
  if (typeof damage === 'number' || typeof damage === 'string')
    effects.push({ key: 'damage', description: `Damage modifier ${damage}` })

  return effects
}
