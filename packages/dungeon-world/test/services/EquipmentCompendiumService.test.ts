import { describe, it, expect } from 'vitest'
import { equipmentCompendiumService } from '../../src/services/EquipmentCompendiumService'
import { EQUIPMENT_COMPENDIUM } from '../../src/data/equipmentCompendium'
import { resolveTagEffects } from '../../src/utils/equipmentTagMechanics'

describe('EquipmentCompendiumService', () => {
  it('lists items', () => {
    const all = equipmentCompendiumService.list()
    expect(all.length).toBeGreaterThan(5)
  })

  it('search filters by category and text', () => {
    const swords = equipmentCompendiumService.search({ text: 'sword', category: 'weapon' })
    expect(swords.every(i => i.category === 'weapon')).toBe(true)
    expect(swords.some(i => (i.name || '').toLowerCase().includes('sword'))).toBe(true)
  })

  it('compare returns effects', () => {
    const ids = EQUIPMENT_COMPENDIUM.slice(0, 2).map(i => i.id)
    const compared = equipmentCompendiumService.compare(ids)
    expect(compared.length).toBe(2)
    // Effects should be an array (may be empty depending on tags)
    expect(Array.isArray(compared[0].effects)).toBe(true)
  })
})


