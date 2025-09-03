import type { Character, CharacterClass } from '../models/Character'
import { CLASS_SPECIFIC_CONTENT } from '../data/classSpecificContent'

export function getClassMapping(characterClass: CharacterClass) {
  return CLASS_SPECIFIC_CONTENT[characterClass]
}

export function isCaster(character: Character | null): boolean {
  if (!character) return false
  return character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Immolator'
}

export function hasArmorTraining(character: Character | null): boolean {
  if (!character) return false
  const map = getClassMapping(character.class)
  return Boolean(map?.equipment.armorTraining)
}

export function canUseTag(character: Character | null, tag: string): boolean {
  if (!character) return true
  const map = getClassMapping(character.class)
  if (map?.equipment.disallowedTags?.includes(tag)) return false
  if (map?.equipment.allowedTags && map.equipment.allowedTags.length > 0)
    return map.equipment.allowedTags.includes(tag)
  return true
}

export type MoveLike = { id: string; category?: string; requiresClass?: string }

export function filterMovesByClass<T extends MoveLike>(
  character: Character | null,
  moves: T[],
  { prefer = true }: { prefer?: boolean } = {},
): T[] {
  if (!character) return moves
  const map = getClassMapping(character.class)
  if (!map) return moves
  const preferred = new Set(map.moves.preferredCategories)
  if (!prefer) return moves.filter(m => !m.category || preferred.has(m.category as any))
  const relevant: T[] = []
  const others: T[] = []
  for (const m of moves) {
    if (!m.category || preferred.has(m.category as any)) relevant.push(m)
    else others.push(m)
  }
  return [...relevant, ...others]
}
