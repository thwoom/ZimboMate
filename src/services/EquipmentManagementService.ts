/**
 * Equipment Management Service for ZimboMate V2
 * Handles equipment sets, wishlists, and inventory management
 * Modernized from V1 with improved TypeScript patterns and V2 model integration
 */

export interface EquipmentSet {
  id: string
  name: string
  itemIds: string[]
  description?: string
  createdAt: Date
  lastUsed?: Date
}

export class EquipmentManagementService {
  private setsByCharacter: Map<string, EquipmentSet[]> = new Map()
  private wishlistByCharacter: Map<string, string[]> = new Map()

  /**
   * Load character data from localStorage
   */
  private load(characterId: string): void {
    try {
      const setsRaw = localStorage.getItem(`zimbomate-equipment-sets:${characterId}`)
      const wishRaw = localStorage.getItem(`zimbomate-equipment-wishlist:${characterId}`)

      if (setsRaw) {
        this.setsByCharacter.set(characterId, JSON.parse(setsRaw))
      }
      if (wishRaw) {
        this.wishlistByCharacter.set(characterId, JSON.parse(wishRaw))
      }
    }
    catch (error) {
      console.warn(`Failed to load equipment data for character ${characterId}:`, error)
    }
  }

  /**
   * Save character data to localStorage
   */
  private save(characterId: string): void {
    try {
      const sets = this.setsByCharacter.get(characterId) || []
      const wish = this.wishlistByCharacter.get(characterId) || []

      localStorage.setItem(`zimbomate-equipment-sets:${characterId}`, JSON.stringify(sets))
      localStorage.setItem(`zimbomate-equipment-wishlist:${characterId}`, JSON.stringify(wish))
    }
    catch (error) {
      console.warn(`Failed to save equipment data for character ${characterId}:`, error)
    }
  }

  /**
   * Get all equipment sets for a character
   */
  getSets(characterId: string): EquipmentSet[] {
    if (!this.setsByCharacter.has(characterId)) {
      this.load(characterId)
    }
    return this.setsByCharacter.get(characterId) || []
  }

  /**
   * Create a new equipment set
   */
  createSet(characterId: string, name: string, itemIds: string[], description?: string): EquipmentSet {
    const set: EquipmentSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name,
      itemIds: [...new Set(itemIds)], // Remove duplicates
      description,
      createdAt: new Date(),
    }

    const current = this.getSets(characterId)
    this.setsByCharacter.set(characterId, [...current, set])
    this.save(characterId)
    return set
  }

  /**
   * Update an equipment set
   */
  updateSet(characterId: string, setId: string, updates: Partial<Omit<EquipmentSet, 'id' | 'createdAt'>>): boolean {
    const sets = this.getSets(characterId)
    const setIndex = sets.findIndex(s => s.id === setId)

    if (setIndex === -1)
      return false

    sets[setIndex] = {
      ...sets[setIndex],
      ...updates,
      lastUsed: new Date(),
    }

    this.setsByCharacter.set(characterId, sets)
    this.save(characterId)
    return true
  }

  /**
   * Rename an equipment set
   */
  renameSet(characterId: string, setId: string, name: string): boolean {
    return this.updateSet(characterId, setId, { name })
  }

  /**
   * Delete an equipment set
   */
  deleteSet(characterId: string, setId: string): boolean {
    const sets = this.getSets(characterId)
    const filteredSets = sets.filter(s => s.id !== setId)

    if (filteredSets.length === sets.length)
      return false

    this.setsByCharacter.set(characterId, filteredSets)
    this.save(characterId)
    return true
  }

  /**
   * Get a specific equipment set
   */
  getSet(characterId: string, setId: string): EquipmentSet | undefined {
    const sets = this.getSets(characterId)
    return sets.find(s => s.id === setId)
  }

  /**
   * Mark a set as used (updates lastUsed timestamp)
   */
  useSet(characterId: string, setId: string): boolean {
    return this.updateSet(characterId, setId, { lastUsed: new Date() })
  }

  /**
   * Get the target item ids for applying a set
   */
  getSetItemIds(characterId: string, setId: string): string[] {
    const set = this.getSet(characterId, setId)
    return set ? [...set.itemIds] : []
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(characterId: string, itemId: string): void {
    if (!this.wishlistByCharacter.has(characterId)) {
      this.load(characterId)
    }

    const list = this.wishlistByCharacter.get(characterId) || []
    if (!list.includes(itemId)) {
      this.wishlistByCharacter.set(characterId, [...list, itemId])
      this.save(characterId)
    }
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(characterId: string, itemId: string): void {
    if (!this.wishlistByCharacter.has(characterId)) {
      this.load(characterId)
    }

    const list = this.wishlistByCharacter.get(characterId) || []
    const filteredList = list.filter(id => id !== itemId)

    this.wishlistByCharacter.set(characterId, filteredList)
    this.save(characterId)
  }

  /**
   * Get wishlist for a character
   */
  getWishlist(characterId: string): string[] {
    if (!this.wishlistByCharacter.has(characterId)) {
      this.load(characterId)
    }
    return this.wishlistByCharacter.get(characterId) || []
  }

  /**
   * Check if item is in wishlist
   */
  isInWishlist(characterId: string, itemId: string): boolean {
    const wishlist = this.getWishlist(characterId)
    return wishlist.includes(itemId)
  }

  /**
   * Clear entire wishlist
   */
  clearWishlist(characterId: string): void {
    this.wishlistByCharacter.set(characterId, [])
    this.save(characterId)
  }

  /**
   * Get equipment statistics for a character
   */
  getEquipmentStats(characterId: string): {
    totalSets: number
    totalWishlistItems: number
    mostRecentlyUsedSet?: EquipmentSet
    oldestSet?: EquipmentSet
  } {
    const sets = this.getSets(characterId)
    const wishlist = this.getWishlist(characterId)

    let mostRecentlyUsedSet: EquipmentSet | undefined
    let oldestSet: EquipmentSet | undefined

    if (sets.length > 0) {
      // Find most recently used set
      const setsWithUsage = sets.filter(s => s.lastUsed)
      if (setsWithUsage.length > 0) {
        mostRecentlyUsedSet = setsWithUsage.reduce((latest, current) =>
          (current.lastUsed && (!latest.lastUsed || current.lastUsed > latest.lastUsed)) ? current : latest,
        )
      }

      // Find oldest set
      oldestSet = sets.reduce((oldest, current) =>
        current.createdAt < oldest.createdAt ? current : oldest,
      )
    }

    return {
      totalSets: sets.length,
      totalWishlistItems: wishlist.length,
      mostRecentlyUsedSet,
      oldestSet,
    }
  }

  /**
   * Search equipment sets by name or description
   */
  searchSets(characterId: string, query: string): EquipmentSet[] {
    const sets = this.getSets(characterId)
    const lowerQuery = query.toLowerCase()

    return sets.filter(set =>
      set.name.toLowerCase().includes(lowerQuery)
      || (set.description && set.description.toLowerCase().includes(lowerQuery)),
    )
  }

  /**
   * Export equipment data for a character
   */
  exportEquipmentData(characterId: string): {
    sets: EquipmentSet[]
    wishlist: string[]
  } {
    return {
      sets: this.getSets(characterId),
      wishlist: this.getWishlist(characterId),
    }
  }

  /**
   * Import equipment data for a character
   */
  importEquipmentData(characterId: string, data: {
    sets?: EquipmentSet[]
    wishlist?: string[]
  }): void {
    if (data.sets) {
      this.setsByCharacter.set(characterId, data.sets)
    }
    if (data.wishlist) {
      this.wishlistByCharacter.set(characterId, data.wishlist)
    }
    this.save(characterId)
  }

  /**
   * Clear all data for a character (useful for testing or character deletion)
   */
  clearCharacterData(characterId: string): void {
    this.setsByCharacter.delete(characterId)
    this.wishlistByCharacter.delete(characterId)

    try {
      localStorage.removeItem(`zimbomate-equipment-sets:${characterId}`)
      localStorage.removeItem(`zimbomate-equipment-wishlist:${characterId}`)
    }
    catch (error) {
      console.warn(`Failed to clear equipment data for character ${characterId}:`, error)
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  clearAll(): void {
    this.setsByCharacter.clear()
    this.wishlistByCharacter.clear()
  }
}

// Export singleton instance
export const equipmentManagementService = new EquipmentManagementService()
