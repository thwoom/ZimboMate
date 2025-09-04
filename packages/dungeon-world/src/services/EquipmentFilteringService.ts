import type { Character } from '../models/Character'
import type { Item, Tag } from '../models/Equipment'
import { hasTag } from '../models/Equipment'
import { canUseTag, getClassMapping, isCaster } from '../utils/conditionalContent'

type AnyItem = { id?: string; name?: string; category?: string; tags?: Array<Tag | { name: string; value?: any }> | string[] }

export interface EquipmentFilterOptions {
  showAll?: boolean
  searchTerm?: string
}

export interface EquipmentGroups<T extends AnyItem = AnyItem> {
  weapons: T[]
  armor: T[]
  gear: T[]
  consumables: T[]
}

function normalizeTagNames(item: AnyItem): string[] {
  const tags = item.tags || []
  return (tags as any[]).map((t) => typeof t === 'string' ? t : (t?.name ?? '')).filter(Boolean)
}

export class EquipmentFilteringService {
  filterForCharacter<T extends AnyItem>(
    character: Character | null,
    items: T[],
    options: EquipmentFilterOptions = {},
  ): T[] {
    const { showAll = false, searchTerm } = options

    let filtered = items

    if (!showAll && character) {
      filtered = filtered.filter((item) => {
        const tagNames = normalizeTagNames(item)
        // Exclude items with tags the character cannot use per class mapping
        for (const tag of tagNames) {
          if (!canUseTag(character, tag)) return false
        }
        // Disallow 'clumsy' armor for classes without armor training
        const category = (item.category || '').toLowerCase()
        if (category === 'armor') {
          const hasClumsy = tagNames.includes('clumsy')
          if (hasClumsy) {
            const map = getClassMapping(character.class as any)
            if (!map?.equipment.armorTraining) return false
          }
        }
        return true
      })
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter((i) => (i.name || '').toLowerCase().includes(q))
    }

    return filtered
  }

  groupByCategory<T extends AnyItem>(items: T[]): EquipmentGroups<T> {
    const groups: EquipmentGroups<T> = { weapons: [], armor: [], gear: [], consumables: [] }
    for (const item of items) {
      const cat = (item.category || '').toLowerCase()
      if (cat === 'weapon') groups.weapons.push(item)
      else if (cat === 'armor') groups.armor.push(item)
      else if (cat === 'consumable') groups.consumables.push(item)
      else groups.gear.push(item)
    }
    return groups
  }

  getSpellComponents<T extends AnyItem>(character: Character | null, items: T[]): T[] {
    if (!character || !isCaster(character)) return []
    // Heuristic: components or consecrated items — tags like 'applied', 'holy', 'magical', or consumables
    return items.filter((i) => {
      const tags = normalizeTagNames(i)
      return tags.includes('applied') || tags.includes('holy') || tags.includes('magical') || (i.category || '') === 'consumable'
    })
  }
}

export const equipmentFilteringService = new EquipmentFilteringService()


