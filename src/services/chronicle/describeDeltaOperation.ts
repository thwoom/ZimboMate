import type { DeltaOperation } from '@/services/llm'

const DEFAULT_CHARACTER_NAME = 'the character'

export function describeDeltaOperation(
  operation: DeltaOperation,
  resolveCharacterName: (characterId?: string) => string = defaultNameResolver,
): string {
  switch (operation.type) {
    case 'apply_damage': {
      const source = operation.source ? ` from ${operation.source}` : ''
      return `${resolveCharacterName(operation.characterId)} takes ${operation.amount} damage${source}`
    }
    case 'heal': {
      const source = operation.source ? ` via ${operation.source}` : ''
      return `${resolveCharacterName(operation.characterId)} heals ${operation.amount} HP${source}`
    }
    case 'mark_xp':
      return `${resolveCharacterName(operation.characterId)} marks ${operation.amount} XP${operation.reason ? ` (${operation.reason})` : ''}`
    case 'add_item':
      return `${resolveCharacterName(operation.characterId)} gains ${operation.item.name}`
    case 'remove_item':
      return `${resolveCharacterName(operation.characterId)} loses item ${operation.itemId}`
    case 'add_item_tag':
      return `Tag ${operation.tag} added to item ${operation.itemId}`
    case 'equip_item': {
      const slot = operation.slot ? ` to ${operation.slot}` : ''
      return `${resolveCharacterName(operation.characterId)} equips ${operation.itemId}${slot}`
    }
    case 'unequip_item': {
      const slot = operation.slot ? ` from ${operation.slot}` : ''
      return `${resolveCharacterName(operation.characterId)} unequips ${operation.itemId}${slot}`
    }
    case 'level_up':
      return `${resolveCharacterName(operation.characterId)} advances to level ${operation.newLevel}`
    case 'spend_ammo':
      return `${resolveCharacterName(operation.characterId)} spends ${operation.amount} ammo${operation.move ? ` (${operation.move})` : ''}`
    case 'mark_hold':
      return `${resolveCharacterName(operation.characterId)} gains ${operation.amount} hold${operation.move ? ` on ${operation.move}` : ''}`
    case 'spend_hold':
      return `${resolveCharacterName(operation.characterId)} spends ${operation.amount} hold${operation.move ? ` on ${operation.move}` : ''}`
    case 'add_debility':
      return `${resolveCharacterName(operation.characterId)} gains the ${operation.debility} debility`
    case 'remove_debility':
      return `${resolveCharacterName(operation.characterId)} recovers from ${operation.debility}`
    case 'add_bond': {
      const target = operation.targetCharacterId ?? 'their ally'
      const detail = operation.description ? `: ${operation.description}` : ''
      return `${resolveCharacterName(operation.characterId)} records a bond with ${target}${detail}`
    }
    case 'resolve_bond': {
      const target = operation.targetCharacterId ?? 'their ally'
      return `${resolveCharacterName(operation.characterId)} resolves a bond with ${target}`
    }
    case 'add_flag':
      return `Adds campaign flag ${operation.flag}`
    case 'create_entity':
      return `Creates entity ${operation.entity.name} (${operation.entity.type})`
    case 'link_entity': {
      const relation = operation.relationshipType ?? 'link'
      return `Links ${operation.fromEntityId} to ${operation.toEntityId} (${relation})`
    }
    case 'add_note': {
      const note =
        operation.note.summary ?? operation.note.body ?? 'campaign note'
      return `Adds note: ${note}`
    }
    case 'add_coin':
      return `${resolveCharacterName(operation.characterId)} gains ${operation.amount} coin`
    default:
      return operation.type.replaceAll('_', ' ')
  }
}

function defaultNameResolver(characterId?: string): string {
  if (!characterId || characterId === '.' || characterId === 'active_character')
    return DEFAULT_CHARACTER_NAME
  return characterId
}
