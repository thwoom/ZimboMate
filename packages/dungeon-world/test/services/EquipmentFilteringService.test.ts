import { describe, it, expect } from 'vitest'
import type { Character } from '../../src/models/Character'
import type { Item } from '../../src/models/Equipment'
import { equipmentFilteringService } from '../../src/services/EquipmentFilteringService'

const baseCharacter = {
  id: 'c1',
  name: 'Aria',
  class: 'Wizard',
  race: 'Human',
  level: 1,
  alignment: 'Neutral',
  attributes: { STR: 8, DEX: 12, CON: 9, INT: 16, WIS: 13, CHA: 10 },
  debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
  hp: { current: 7, max: 7 },
  armor: 0,
  damageDie: 'd4',
  xp: 0,
  load: { current: 0, max: 7 },
  baseLoad: 7,
  coin: 0,
  bonds: [],
  advancements: [],
  knownMoves: [],
  conditions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Character

const items: Item[] = [
  { id: 'w1', name: 'Longsword', category: 'weapon', tags: [{ name: 'close' }], description: '', weight: 1, value: 10, quantity: 1, equipped: true },
  { id: 'a1', name: 'Plate Armor', category: 'armor', tags: [{ name: 'worn' }, { name: 'clumsy' }], description: '', weight: 4, value: 350, quantity: 1, equipped: true } as any,
  { id: 'g1', name: 'Adventuring Gear', category: 'gear', tags: [{ name: 'uses', value: 5 }], description: '', weight: 2, value: 20, quantity: 1, equipped: true },
  { id: 'c1', name: 'Healing Potion', category: 'consumable', tags: [{ name: 'applied' }], description: '', weight: 0, value: 50, quantity: 1, equipped: true },
]

describe('EquipmentFilteringService', () => {
  it('filters items by class rules when showAll is false', () => {
    const filtered = equipmentFilteringService.filterForCharacter(baseCharacter, items, { showAll: false })
    // Wizard should not see clumsy armor by default (class mapping discourages heavy gear)
    expect(filtered.some(i => i.name === 'Plate Armor')).toBe(false)
    expect(filtered.some(i => i.name === 'Longsword')).toBe(true)
  })

  it('does not filter when showAll is true', () => {
    const filtered = equipmentFilteringService.filterForCharacter(baseCharacter, items, { showAll: true })
    expect(filtered.some(i => i.name === 'Plate Armor')).toBe(true)
  })

  it('groups by category', () => {
    const groups = equipmentFilteringService.groupByCategory(items)
    expect(groups.weapons.length).toBe(1)
    expect(groups.armor.length).toBe(1)
    expect(groups.gear.length).toBe(1)
    expect(groups.consumables.length).toBe(1)
  })
})


