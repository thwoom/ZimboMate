import type { Item, ItemTag } from '../models/Equipment'
import { EQUIPMENT_COMPENDIUM } from '../data/equipmentCompendium'
import { resolveTagEffects } from '../utils/equipmentTagMechanics'

export interface CompendiumQuery {
  text?: string
  category?: string
  tags?: (ItemTag | string)[]
  maxWeight?: number
  maxCoins?: number
}

export class EquipmentCompendiumService {
  list() {
    return EQUIPMENT_COMPENDIUM
  }

  search(query: CompendiumQuery) {
    const q = (query.text || '').toLowerCase()
    return EQUIPMENT_COMPENDIUM.filter((item) => {
      if (query.category && item.category !== query.category)
        return false
      if (q && !(item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)))
        return false
      if (query.tags && query.tags.length > 0) {
        const names = (item.tags || []).map(t => t.name)
        const allFound = query.tags.every(tag => names.includes(tag))
        if (!allFound)
          return false
      }
      if (typeof query.maxWeight === 'number' && (item.weight ?? 0) > query.maxWeight)
        return false
      if (typeof query.maxCoins === 'number' && (item.value ?? 0) > query.maxCoins)
        return false
      return true
    })
  }

  compare(ids: string[]) {
    const byId = new Map(EQUIPMENT_COMPENDIUM.map(i => [i.id, i]))
    return ids
      .map(id => byId.get(id))
      .filter(Boolean)
      .map(i => ({
        item: i!,
        effects: resolveTagEffects(i as Item),
      }))
  }
}

export const equipmentCompendiumService = new EquipmentCompendiumService()
