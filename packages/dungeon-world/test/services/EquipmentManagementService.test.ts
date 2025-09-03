import { describe, it, expect, beforeEach } from 'vitest'
import { equipmentManagementService } from '../../src/services/EquipmentManagementService'

describe('EquipmentManagementService', () => {
  const char = 'char-1'

  beforeEach(() => {
    equipmentManagementService.clearAll()
    // clear persistence
    try {
      localStorage.removeItem(`equipment-sets:${char}`)
      localStorage.removeItem(`equipment-wishlist:${char}`)
    } catch {}
  })

  it('creates and lists sets', () => {
    const set = equipmentManagementService.createSet(char, 'Dungeon', ['a','b'])
    const sets = equipmentManagementService.getSets(char)
    expect(sets.length).toBe(1)
    expect(sets[0].name).toBe('Dungeon')
    expect(set.itemIds).toEqual(['a','b'])
  })

  it('renames and deletes sets', () => {
    const set = equipmentManagementService.createSet(char, 'A', [])
    expect(equipmentManagementService.renameSet(char, set.id, 'B')).toBe(true)
    expect(equipmentManagementService.getSets(char)[0].name).toBe('B')
    expect(equipmentManagementService.deleteSet(char, set.id)).toBe(true)
    expect(equipmentManagementService.getSets(char).length).toBe(0)
  })

  it('adds/removes wishlist items with persistence', () => {
    equipmentManagementService.addToWishlist(char, 'item-1')
    equipmentManagementService.addToWishlist(char, 'item-2')
    expect(equipmentManagementService.getWishlist(char)).toEqual(['item-1','item-2'])
    // simulate reload
    const again = equipmentManagementService.getWishlist(char)
    expect(again.length).toBe(2)
    equipmentManagementService.removeFromWishlist(char, 'item-1')
    expect(equipmentManagementService.getWishlist(char)).toEqual(['item-2'])
  })

  it('returns item ids for applying a set', () => {
    const set = equipmentManagementService.createSet(char, 'Boss', ['w1','a1'])
    expect(equipmentManagementService.getSetItemIds(char, set.id)).toEqual(['w1','a1'])
  })
})


