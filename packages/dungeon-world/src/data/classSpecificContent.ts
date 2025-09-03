import type { CharacterClass } from '../models/Character'

export interface ClassMovePreferences {
  preferredCategories: Array<'basic' | 'class' | 'advanced' | 'master' | 'special'>
  deprioritized?: Array<'basic' | 'class' | 'advanced' | 'master' | 'special'>
}

export interface ClassEquipmentRules {
  allowedTags?: string[]
  disallowedTags?: string[]
  armorTraining?: boolean
}

export interface ClassSpecificMapping {
  moves: ClassMovePreferences
  equipment: ClassEquipmentRules
  statsHighlight?: string[]
}

export const CLASS_SPECIFIC_CONTENT: Record<CharacterClass, ClassSpecificMapping> = {
  Fighter: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'], deprioritized: ['special'] },
    equipment: { armorTraining: true, disallowedTags: [] },
    statsHighlight: ['STR', 'CON'],
  },
  Paladin: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'], deprioritized: ['special'] },
    equipment: { armorTraining: true },
    statsHighlight: ['STR', 'CHA'],
  },
  Ranger: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'] },
    equipment: { allowedTags: ['precise', 'near', 'far'] },
    statsHighlight: ['DEX', 'WIS'],
  },
  Thief: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'] },
    equipment: { allowedTags: ['precise', 'hand'] },
    statsHighlight: ['DEX', 'INT'],
  },
  Bard: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'] },
    equipment: {},
    statsHighlight: ['CHA', 'DEX'],
  },
  Cleric: {
    moves: { preferredCategories: ['basic', 'class', 'advanced', 'special'] },
    equipment: { armorTraining: true },
    statsHighlight: ['WIS', 'STR'],
  },
  Druid: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'] },
    equipment: { disallowedTags: ['metal'] },
    statsHighlight: ['WIS', 'CON'],
  },
  Wizard: {
    moves: { preferredCategories: ['basic', 'class', 'advanced', 'special'] },
    equipment: { disallowedTags: ['two-handed', 'heavy'] },
    statsHighlight: ['INT', 'WIS'],
  },
  Barbarian: {
    moves: { preferredCategories: ['basic', 'class', 'advanced'] },
    equipment: { allowedTags: ['two-handed', 'messy', 'forceful'] },
    statsHighlight: ['STR', 'CON'],
  },
  Immolator: {
    moves: { preferredCategories: ['basic', 'class', 'advanced', 'special'] },
    equipment: {},
    statsHighlight: ['INT', 'CHA'],
  },
}
