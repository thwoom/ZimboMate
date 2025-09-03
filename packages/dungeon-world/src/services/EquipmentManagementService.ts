export interface EquipmentSet {
  id: string
  name: string
  itemIds: string[]
}

class EquipmentManagementService {
  private setsByCharacter: Map<string, EquipmentSet[]> = new Map()
  private wishlistByCharacter: Map<string, string[]> = new Map()

  private load(characterId: string): void {
    try {
      const setsRaw = localStorage.getItem(`equipment-sets:${characterId}`)
      const wishRaw = localStorage.getItem(`equipment-wishlist:${characterId}`)
      if (setsRaw)
        this.setsByCharacter.set(characterId, JSON.parse(setsRaw))
      if (wishRaw)
        this.wishlistByCharacter.set(characterId, JSON.parse(wishRaw))
    }
    catch {}
  }

  private save(characterId: string): void {
    try {
      const sets = this.setsByCharacter.get(characterId) || []
      const wish = this.wishlistByCharacter.get(characterId) || []
      localStorage.setItem(`equipment-sets:${characterId}`, JSON.stringify(sets))
      localStorage.setItem(`equipment-wishlist:${characterId}`, JSON.stringify(wish))
    }
    catch {}
  }

  getSets(characterId: string): EquipmentSet[] {
    if (!this.setsByCharacter.has(characterId))
      this.load(characterId)
    return this.setsByCharacter.get(characterId) || []
  }

  createSet(characterId: string, name: string, itemIds: string[]): EquipmentSet {
    const set: EquipmentSet = { id: `${Date.now()}`, name, itemIds: [...new Set(itemIds)] }
    const current = this.getSets(characterId)
    this.setsByCharacter.set(characterId, [...current, set])
    this.save(characterId)
    return set
  }

  renameSet(characterId: string, setId: string, name: string): boolean {
    const sets = this.getSets(characterId)
    const set = sets.find(s => s.id === setId)
    if (!set)
      return false
    set.name = name
    this.save(characterId)
    return true
  }

  deleteSet(characterId: string, setId: string): boolean {
    const sets = this.getSets(characterId)
    const next = sets.filter(s => s.id !== setId)
    this.setsByCharacter.set(characterId, next)
    this.save(characterId)
    return next.length !== sets.length
  }

  addToWishlist(characterId: string, itemId: string): void {
    if (!this.wishlistByCharacter.has(characterId))
      this.load(characterId)
    const list = this.wishlistByCharacter.get(characterId) || []
    if (!list.includes(itemId))
      this.wishlistByCharacter.set(characterId, [...list, itemId])
    this.save(characterId)
  }

  removeFromWishlist(characterId: string, itemId: string): void {
    if (!this.wishlistByCharacter.has(characterId))
      this.load(characterId)
    const list = this.wishlistByCharacter.get(characterId) || []
    this.wishlistByCharacter.set(characterId, list.filter(id => id !== itemId))
    this.save(characterId)
  }

  getWishlist(characterId: string): string[] {
    if (!this.wishlistByCharacter.has(characterId))
      this.load(characterId)
    return this.wishlistByCharacter.get(characterId) || []
  }

  /**
   * Return the target item ids for applying a set. The caller should equip
   * items matching these ids and unequip others as needed.
   */
  getSetItemIds(characterId: string, setId: string): string[] {
    const set = this.getSets(characterId).find(s => s.id === setId)
    return set ? [...set.itemIds] : []
  }

  /** Test-only helper */
  clearAll(): void {
    this.setsByCharacter.clear()
    this.wishlistByCharacter.clear()
  }
}

export const equipmentManagementService = new EquipmentManagementService()
