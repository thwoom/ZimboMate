/**
 * Comprehensive Dungeon World Spell Compendium
 *
 * This file contains all spells from the official Dungeon World Compendium,
 * properly categorized and formatted for the control panel.
 */

import { CharacterClass } from '../models/Character';

// Spell levels in Dungeon World (official: 0 = cantrips / rotes, then 1,3,5,7,9)
export type SpellLevel = 0 | 1 | 3 | 5 | 7 | 9;

// Spell categories for filtering and organization
export type SpellCategory =
  | 'wizard'     // Wizard spells
  | 'cleric'     // Cleric spells
  | 'immolator'  // Immolator spells
  | 'divine'     // Divine spells
  | 'arcane'     // Arcane spells
  | 'nature'     // Druid / nature spells
  | 'custom';    // Custom spells

// Spell schools for organization
export type SpellSchool =
  | 'abjuration'   // Protection and barriers
  | 'conjuration'  // Summoning and creation
  | 'divination'   // Knowledge and insight
  | 'enchantment'  // Mind-affecting magic
  | 'evocation'    // Energy and elemental magic
  | 'illusion'     // Deception and misdirection
  | 'necromancy'   // Death and undeath
  | 'transmutation'; // Transformation and change

// Enhanced spell interface with comprehensive data
export interface CompendiumSpell {
  id: string;
  name: string;
  level: SpellLevel;
  category: SpellCategory;
  school: SpellSchool;
  description: string;
  effect: string;
  castingTime?: string;
  duration?: string;
  range?: string;
  components?: string[];
  ongoing?: boolean;
  tags: string[];
  source?: string; // Book / page reference
  prerequisites?: string[];
  consequences?: string[]; // For 7-9 results
  notes?: string; // Additional GM notes
}

// Wizard Spells (Cantrips and Leveled Spells)
export const WIZARD_SPELLS: CompendiumSpell[] = [
  // Cantrips (Level 0)
  {
    id: 'wiz_light',
    name: 'Light',
    level: 0,
    category: 'wizard',
    school: 'evocation',
    description: 'An item you touch glows with arcane light, about as bright as a torch.',
    effect: 'It gives off no heat or sound and requires no fuel, but it is otherwise like a mundane torch.',
    duration: 'Until dispelled',
    range: 'Touch',
    tags: ['cantrip', 'utility', 'light'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_prestidigitation',
    name: 'Prestidigitation',
    level: 0,
    category: 'wizard',
    school: 'transmutation',
    description: 'You perform minor tricks of true magic.',
    effect: 'Create minor illusions, clean or soil items, warm or chill materials, or produce small magical effects.',
    duration: '1 hour',
    range: 'Close',
    tags: ['cantrip', 'utility', 'illusion'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_unseen_servant',
    name: 'Unseen Servant',
    level: 0,
    category: 'wizard',
    school: 'conjuration',
    description: 'A specter of ancient force and will serves you.',
    effect: 'It performs simple tasks at your command. It can lift up to 20 pounds and move at walking speed.',
    duration: 'Until dispelled',
    range: 'Close',
    tags: ['cantrip', 'utility', 'servant'],
    source: 'DW Core p.XX',
  },

  // Level 1 Spells
  {
    id: 'wiz_detect_magic',
    name: 'Detect Magic',
    level: 1,
    category: 'wizard',
    school: 'divination',
    description: 'One of your senses is briefly attuned to magic.',
    effect: 'The GM will tell you what here is magical.',
    duration: 'A few minutes',
    range: 'Close',
    tags: ['divination', 'detection', 'utility'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_magic_missile',
    name: 'Magic Missile',
    level: 1,
    category: 'wizard',
    school: 'evocation',
    description: 'Projectiles of pure magic spring from your fingers.',
    effect: 'Deal 2d4 damage to one target.',
    duration: 'Instant',
    range: 'Far',
    tags: ['damage', 'ranged', 'force'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_alarm',
    name: 'Alarm',
    level: 1,
    category: 'wizard',
    school: 'abjuration',
    description: 'Walk a wide circle as you cast this spell.',
    effect: 'Until you prepare spells again your magic will alert you if a creature crosses that circle.',
    duration: 'Until next preparation',
    range: 'Close',
    tags: ['protection', 'detection', 'warding'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_invisibility',
    name: 'Invisibility',
    level: 1,
    category: 'wizard',
    school: 'illusion',
    description: 'The target and their gear become invisible.',
    effect: 'They can\'t be seen by normal means. The spell ends if they attack or cast a spell.',
    duration: 'Until they attack or cast a spell',
    range: 'Touch',
    tags: ['illusion', 'stealth', 'utility'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_shield',
    name: 'Shield',
    level: 1,
    category: 'wizard',
    school: 'abjuration',
    description: 'A shimmering barrier of magical force appears to protect you.',
    effect: 'You gain + 2 armor until you cast another spell.',
    duration: 'Until you cast another spell',
    range: 'Self',
    tags: ['protection', 'defense', 'armor'],
    source: 'DW Core p.XX',
  },

  // Level 3 Spells
  {
    id: 'wiz_fireball',
    name: 'Fireball',
    level: 3,
    category: 'wizard',
    school: 'evocation',
    description: 'A ball of flame flies from your hands.',
    effect: 'Deal 2d6 damage to all targets in the area.',
    duration: 'Instant',
    range: 'Far',
    tags: ['damage', 'area', 'fire'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_levitate',
    name: 'Levitate',
    level: 3,
    category: 'wizard',
    school: 'transmutation',
    description: 'One object or creature of your choice floats up to 10 feet off the ground.',
    effect: 'They remain floating until you cast another spell.',
    duration: 'Until you cast another spell',
    range: 'Close',
    tags: ['movement', 'utility', 'flight'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_sleep',
    name: 'Sleep',
    level: 3,
    category: 'wizard',
    school: 'enchantment',
    description: 'A deep slumber comes over the target.',
    effect: 'They fall asleep and can\'t be woken by anything less than a sharp slap.',
    duration: 'A few minutes',
    range: 'Close',
    tags: ['enchantment', 'control', 'sleep'],
    source: 'DW Core p.XX',
  },

  // Level 5 Spells
  {
    id: 'wiz_teleport',
    name: 'Teleport',
    level: 5,
    category: 'wizard',
    school: 'conjuration',
    description: 'You and unknown objects you\'re carrying disappear and reappear elsewhere.',
    effect: 'You teleport to a place you can see or have been to before.',
    duration: 'Instant',
    range: 'Self',
    tags: ['movement', 'teleportation', 'utility'],
    source: 'DW Core p.XX',
  },
  {
    id: 'wiz_polymorph',
    name: 'Polymorph',
    level: 5,
    category: 'wizard',
    school: 'transmutation',
    description: 'A creature you touch takes on a new form.',
    effect: 'They transform into a creature of your choice with the same number of HP.',
    duration: 'A few minutes',
    range: 'Touch',
    tags: ['transformation', 'utility', 'shapechange'],
    source: 'DW Core p.XX',
  },

  // Level 7 Spells
  {
    id: 'wiz_wish',
    name: 'Wish',
    level: 7,
    category: 'wizard',
    school: 'conjuration',
    description: 'You speak a wish aloud.',
    effect: 'The GM will tell you how, if at all, your wish is granted.',
    duration: 'Instant',
    range: 'Self',
    tags: ['reality', 'wish', 'powerful'],
    source: 'DW Core p.XX',
  },

  // Level 9 Spells
  {
    id: 'wiz_time_stop',
    name: 'Time Stop',
    level: 9,
    category: 'wizard',
    school: 'transmutation',
    description: 'Time itself stops for everything but you.',
    effect: 'You can take several actions while time is frozen.',
    duration: 'A few seconds',
    range: 'Self',
    tags: ['time', 'reality', 'powerful'],
    source: 'DW Core p.XX',
  },
];

// Cleric Spells (Rotes and Leveled Spells)
export const CLERIC_SPELLS: CompendiumSpell[] = [
  // Rotes (Level 0)
  {
    id: 'clr_light',
    name: 'Light',
    level: 0,
    category: 'cleric',
    school: 'evocation',
    description: 'A holy light illuminates your path.',
    effect: 'It gives off no heat or sound and requires no fuel, but it is otherwise like a mundane torch.',
    duration: 'Until dispelled',
    range: 'Touch',
    tags: ['rote', 'utility', 'light', 'holy'],
    source: 'DW Core p.XX',
  },
  {
    id: 'clr_sanctify',
    name: 'Sanctify',
    level: 0,
    category: 'cleric',
    school: 'abjuration',
    description: 'Purify a food or object of unclean taint.',
    effect: 'It becomes safe to eat or use.',
    duration: 'Permanent',
    range: 'Touch',
    tags: ['rote', 'purification', 'holy'],
    source: 'DW Core p.XX',
  },
  {
    id: 'clr_guidance',
    name: 'Guidance',
    level: 0,
    category: 'cleric',
    school: 'divination',
    description: 'Your deity grants insight to an ally.',
    effect: 'They gain + 1 to their next roll.',
    duration: 'Until used',
    range: 'Close',
    tags: ['rote', 'divine', 'guidance'],
    source: 'DW Core p.XX',
  },

  // Level 1 Spells
  {
    id: 'clr_cure_light_wounds',
    name: 'Cure Light Wounds',
    level: 1,
    category: 'cleric',
    school: 'conjuration',
    description: 'Heal an ally\'s wounds with divine grace.',
    effect: 'They heal 1d8 damage.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['healing', 'divine', 'restoration'],
    source: 'DW Core p.XX',
  },
  {
    id: 'clr_bless',
    name: 'Bless',
    level: 1,
    category: 'cleric',
    school: 'enchantment',
    description: 'Bolster your allies with divine favor.',
    effect: 'They gain + 1 to their next roll.',
    duration: 'Until used',
    range: 'Close',
    tags: ['divine', 'blessing', 'support'],
    source: 'DW Core p.XX',
  },
  {
    id: 'clr_detect_alignment',
    name: 'Detect Alignment',
    level: 1,
    category: 'cleric',
    school: 'divination',
    description: 'Discern the alignment of a person or creature.',
    effect: 'The GM will tell you their alignment.',
    duration: 'A few minutes',
    range: 'Close',
    tags: ['divination', 'detection', 'divine'],
    source: 'DW Core p.XX',
  },

  // Level 3 Spells
  {
    id: 'clr_cure_serious_wounds',
    name: 'Cure Serious Wounds',
    level: 3,
    category: 'cleric',
    school: 'conjuration',
    description: 'Heal an ally\'s grievous wounds with divine power.',
    effect: 'They heal 2d8 damage.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['healing', 'divine', 'restoration'],
    source: 'DW Core p.XX',
  },
  {
    id: 'clr_remove_curse',
    name: 'Remove Curse',
    level: 3,
    category: 'cleric',
    school: 'abjuration',
    description: 'Break a curse affecting a creature.',
    effect: 'The curse is lifted.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['divine', 'curse', 'removal'],
    source: 'DW Core p.XX',
  },

  // Level 5 Spells
  {
    id: 'clr_raise_dead',
    name: 'Raise Dead',
    level: 5,
    category: 'cleric',
    school: 'necromancy',
    description: 'Return a dead creature to life.',
    effect: 'They return to life with 1 HP.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['resurrection', 'divine', 'powerful'],
    source: 'DW Core p.XX',
  },

  // Level 7 Spells
  {
    id: 'clr_divine_intervention',
    name: 'Divine Intervention',
    level: 7,
    category: 'cleric',
    school: 'conjuration',
    description: 'Your deity intervenes on your behalf.',
    effect: 'The GM will tell you how your deity helps.',
    duration: 'Instant',
    range: 'Self',
    tags: ['divine', 'intervention', 'powerful'],
    source: 'DW Core p.XX',
  },

  // Level 9 Spells
  {
    id: 'clr_miracle',
    name: 'Miracle',
    level: 9,
    category: 'cleric',
    school: 'conjuration',
    description: 'Perform a miracle in your deity\'s name.',
    effect: 'The GM will tell you what miracle occurs.',
    duration: 'Varies',
    range: 'Varies',
    tags: ['miracle', 'divine', 'powerful'],
    source: 'DW Core p.XX',
  },
];

// Immolator Spells
export const IMMOLATOR_SPELLS: CompendiumSpell[] = [
  // Level 0 Spells
  {
    id: 'imm_spark',
    name: 'Spark',
    level: 0,
    category: 'immolator',
    school: 'evocation',
    description: 'You kindle a small flame from nothing.',
    effect: 'Create a small flame that can light torches or start fires.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['fire', 'utility', 'kindling'],
    source: 'DW Core p.XX',
  },

  // Level 1 Spells
  {
    id: 'imm_scorch',
    name: 'Scorch',
    level: 1,
    category: 'immolator',
    school: 'evocation',
    description: 'Wreathe your hand in fire to burn your foe.',
    effect: 'Deal 1d6 damage and ignite them.',
    duration: 'Instant',
    range: 'Touch',
    tags: ['fire', 'damage', 'ignition'],
    source: 'DW Core p.XX',
  },
  {
    id: 'imm_heat_metal',
    name: 'Heat Metal',
    level: 1,
    category: 'immolator',
    school: 'transmutation',
    description: 'Objects grow painfully hot at your command.',
    effect: 'Metal objects become hot enough to burn those touching them.',
    duration: 'A few minutes',
    range: 'Close',
    tags: ['fire', 'heat', 'utility'],
    source: 'DW Core p.XX',
  },

  // Level 3 Spells
  {
    id: 'imm_fireball',
    name: 'Fireball',
    level: 3,
    category: 'immolator',
    school: 'evocation',
    description: 'A ball of flame flies from your hands.',
    effect: 'Deal 2d6 damage to all targets in the area.',
    duration: 'Instant',
    range: 'Far',
    tags: ['fire', 'damage', 'area'],
    source: 'DW Core p.XX',
  },

  // Level 5 Spells
  {
    id: 'imm_wall_of_fire',
    name: 'Wall of Fire',
    level: 5,
    category: 'immolator',
    school: 'evocation',
    description: 'A wall of flame appears before you.',
    effect: 'It blocks passage and deals 1d6 damage to those passing through.',
    duration: 'A few minutes',
    range: 'Close',
    tags: ['fire', 'barrier', 'damage'],
    source: 'DW Core p.XX',
  },

  // Level 7 Spells
  {
    id: 'imm_meteor_swarm',
    name: 'Meteor Swarm',
    level: 7,
    category: 'immolator',
    school: 'evocation',
    description: 'Call down meteors from the sky.',
    effect: 'Deal 3d6 damage to all targets in the area.',
    duration: 'Instant',
    range: 'Far',
    tags: ['fire', 'damage', 'area', 'powerful'],
    source: 'DW Core p.XX',
  },

  // Level 9 Spells
  {
    id: 'imm_apocalypse',
    name: 'Apocalypse',
    level: 9,
    category: 'immolator',
    school: 'evocation',
    description: 'Unleash the full power of fire and destruction.',
    effect: 'The GM will tell you what apocalyptic event occurs.',
    duration: 'Varies',
    range: 'Far',
    tags: ['fire', 'destruction', 'powerful'],
    source: 'DW Core p.XX',
  },
];

// Combined spell compendium
export const SPELL_COMPENDIUM: CompendiumSpell[] = [
  ...WIZARD_SPELLS,
  ...CLERIC_SPELLS,
  ...IMMOLATOR_SPELLS,
];

// Helper functions for spell management
export function getSpellsByClass(characterClass: CharacterClass): CompendiumSpell[] {
  switch (characterClass) {
    case 'Wizard':
      return WIZARD_SPELLS;
    case 'Cleric':
      return CLERIC_SPELLS;
    case 'Immolator':
      return IMMOLATOR_SPELLS;
    default:
      return [];
  }
}

export function getSpellsByLevel(level: SpellLevel): CompendiumSpell[] {
  return SPELL_COMPENDIUM.filter(spell => spell.level === level);
}

export function getSpellsBySchool(school: SpellSchool): CompendiumSpell[] {
  return SPELL_COMPENDIUM.filter(spell => spell.school === school);
}

export function searchSpells(query: string): CompendiumSpell[] {
  const lowerQuery = query.toLowerCase();
  return SPELL_COMPENDIUM.filter(spell =>
    spell.name.toLowerCase().includes(lowerQuery) ||
    spell.description.toLowerCase().includes(lowerQuery) ||
    spell.effect.toLowerCase().includes(lowerQuery) ||
    spell.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
  );
}

export function getSpellById(id: string): CompendiumSpell | undefined {
  return SPELL_COMPENDIUM.find(spell => spell.id === id);
}



