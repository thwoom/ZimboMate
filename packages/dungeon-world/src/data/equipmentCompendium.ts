import type { Armor, Item, Weapon } from '../models/Equipment'

export type CompendiumEntry = Partial<Item> | Partial<Weapon> | Partial<Armor>

export interface CompendiumItem extends CompendiumEntry {
  id: string
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function withId<T extends CompendiumEntry>(entry: T): CompendiumItem {
  const id = slugify(entry.name || 'item')
  return {
    id,
    quantity: 1,
    equipped: false,
    ...entry,
  } as CompendiumItem
}

export const EQUIPMENT_COMPENDIUM: CompendiumItem[] = [
  // Weapons
  withId({
    name: 'Dagger',
    category: 'weapon',
    tags: [{ name: 'hand' }, { name: 'weight', value: 1 }, { name: 'coins', value: 2 }],
    weight: 1,
    value: 2,
    damage: '+0 damage',
    description: 'A small blade suitable for close combat and utility.',
  } as Partial<Weapon>),
  withId({
    name: 'Short Sword',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }, { name: 'coins', value: 8 }],
    weight: 1,
    value: 8,
    damage: '+0 damage',
  } as Partial<Weapon>),
  withId({
    name: 'Long Sword',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }, { name: 'coins', value: 15 }],
    weight: 1,
    value: 15,
    damage: '+1 damage',
  } as Partial<Weapon>),
  withId({
    name: 'Battle Axe',
    category: 'weapon',
    tags: [{ name: 'close' }, { name: 'weight', value: 1 }, { name: 'coins', value: 10 }],
    weight: 1,
    value: 10,
    damage: '+1 damage',
  } as Partial<Weapon>),
  withId({
    name: 'Spear',
    category: 'weapon',
    tags: [{ name: 'reach' }, { name: 'thrown' }, { name: 'weight', value: 1 }, { name: 'coins', value: 5 }],
    weight: 1,
    value: 5,
  } as Partial<Weapon>),
  withId({
    name: 'Bow',
    category: 'weapon',
    tags: [{ name: 'near' }, { name: 'far' }, { name: 'ammo', value: 3 }, { name: 'weight', value: 2 }, { name: 'coins', value: 60 }],
    weight: 2,
    value: 60,
  } as Partial<Weapon>),
  withId({
    name: 'Crossbow',
    category: 'weapon',
    tags: [{ name: 'near' }, { name: 'reload' }, { name: 'ammo', value: 1 }, { name: 'weight', value: 3 }, { name: 'coins', value: 35 }],
    weight: 3,
    value: 35,
  } as Partial<Weapon>),

  // Armor
  withId({
    name: 'Leather Armor',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'weight', value: 1 }, { name: 'coins', value: 10 }],
    weight: 1,
    value: 10,
    armorValue: 1,
  } as Partial<Armor>),
  withId({
    name: 'Chainmail',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'weight', value: 3 }, { name: 'coins', value: 40 }],
    weight: 3,
    value: 40,
    armorValue: 2,
  } as Partial<Armor>),
  withId({
    name: 'Plate Armor',
    category: 'armor',
    tags: [{ name: 'worn' }, { name: 'clumsy' }, { name: 'weight', value: 4 }, { name: 'coins', value: 350 }],
    weight: 4,
    value: 350,
    armorValue: 3,
  } as Partial<Armor>),

  // Gear & Consumables
  withId({
    name: 'Adventuring Gear',
    category: 'gear',
    tags: [{ name: 'uses', value: 5 }, { name: 'weight', value: 2 }, { name: 'coins', value: 20 }],
    weight: 2,
    value: 20,
    uses: { current: 5, max: 5 },
  } as Partial<Item>),
  withId({
    name: 'Rations (5 uses)',
    category: 'consumable',
    tags: [{ name: 'ration' }, { name: 'uses', value: 5 }, { name: 'weight', value: 1 }, { name: 'coins', value: 5 }],
    weight: 1,
    value: 5,
    uses: { current: 5, max: 5 },
  } as Partial<Item>),
  withId({
    name: 'Healing Potion',
    category: 'consumable',
    tags: [{ name: 'weight', value: 0 }, { name: 'coins', value: 50 }],
    weight: 0,
    value: 50,
    description: 'Heal 10 HP or remove one debility',
  } as Partial<Item>),
  withId({
    name: 'Oil (3 uses)',
    category: 'consumable',
    tags: [{ name: 'applied' }, { name: 'uses', value: 3 }, { name: 'weight', value: 1 }, { name: 'coins', value: 10 }],
    weight: 1,
    value: 10,
  } as Partial<Item>),
]

export function getCompendiumIndex(): Record<string, CompendiumItem> {
  return Object.fromEntries(EQUIPMENT_COMPENDIUM.map(i => [i.id, i]))
}
