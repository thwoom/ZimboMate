// Mock data for spell book interface

// Spell-related enums for the spell book interface
export enum SpellLevel {
  CANTRIP = 0,
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
  SIXTH = 6,
  SEVENTH = 7,
  EIGHTH = 8,
  NINTH = 9
}

export enum SpellSchool {
  ABJURATION = 'abjuration',
  CONJURATION = 'conjuration',
  DIVINATION = 'divination',
  ENCHANTMENT = 'enchantment',
  EVOCATION = 'evocation',
  ILLUSION = 'illusion',
  NECROMANCY = 'necromancy',
  TRANSMUTATION = 'transmutation'
}

export enum SpellComponent {
  VERBAL = 'verbal',
  SOMATIC = 'somatic',
  MATERIAL = 'material'
}

export enum CastingTime {
  ACTION = 'action',
  BONUS_ACTION = 'bonus_action',
  REACTION = 'reaction',
  MINUTE = 'minute',
  TEN_MINUTES = 'ten_minutes',
  HOUR = 'hour',
  RITUAL = 'ritual'
}

export enum SpellPreparationStatus {
  NOT_PREPARED = 'not_prepared',
  PREPARED = 'prepared',
  USED = 'used'
}

// Mock data for spell book interface
export const mockSpells = [
  {
    id: 'cantrip-light',
    name: 'Light',
    level: 0 as const,
    school: 'evocation' as const,
    castingTime: 'action' as const,
    range: 'Touch',
    components: ['verbal' as const, 'material' as const],
    duration: '1 hour',
    concentration: false,
    ritual: false,
    description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
    materialComponents: 'A firefly or phosphorescent moss',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'spell-magic-missile',
    name: 'Magic Missile',
    level: 1 as const,
    school: 'evocation' as const,
    castingTime: 'action' as const,
    range: '120 feet',
    components: ['verbal' as const, 'somatic' as const],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.',
    damage: '1d4 + 1 force damage per dart',
    atHigherLevels: 'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'spell-fireball',
    name: 'Fireball',
    level: 3 as const,
    school: 'evocation' as const,
    castingTime: 'action' as const,
    range: '150 feet',
    components: ['verbal' as const, 'somatic' as const, 'material' as const],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    damage: '8d6 fire damage',
    savingThrow: 'Dexterity',
    materialComponents: 'A tiny ball of bat guano and sulfur',
    atHigherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
    preparationStatus: 'not_prepared' as const
  }
];
export const mockSpellSlots = {
  1: { total: 4, used: 1 },
  2: { total: 3, used: 0 },
  3: { total: 3, used: 2 },
  4: { total: 1, used: 0 },
  5: { total: 1, used: 1 }
};

export const mockCharacterSpellcasting = {
  spellcastingAbility: 'intelligence' as const,
  spellAttackBonus: 7,
  spellSaveDC: 15,
  cantripsKnown: 4,
  spellsKnown: 14,
  spellsPrepared: 8,
  ritualCasting: true
};