/**
 * Spell management data models for Dungeon World
 */

import { CharacterClass } from './Character';

// Spell levels in Dungeon World
export type SpellLevel = 1 | 3 | 5 | 7 | 9;

// Spell categories
export type SpellCategory = 
  | 'wizard'     // Wizard spells
  | 'cleric'     // Cleric spells
  | 'divine'     // Divine spells
  | 'arcane'     // Arcane spells
  | 'nature'     // Druid/nature spells
  | 'custom';    // Custom spells

// Main spell interface
export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  category: SpellCategory;
  description: string;
  effect: string;
  ongoing?: boolean;
  tags: string[];
  source?: string; // Book/page reference
}

// Spell preparation for spellcasters
export interface SpellPreparation {
  characterId: string;
  characterClass: CharacterClass;
  
  // Prepared spells
  preparedSpells: string[]; // Spell IDs
  maxPrepared: number; // Level + 1 for Wizard, Wisdom modifier + 1 for Cleric
  
  // Wizard-specific
  spellbook?: string[]; // Known spells (Wizards choose from these)
  
  // Cleric-specific
  deity?: string;
  domain?: string;
  
  // Spell slots (if using variant rules)
  spellSlots?: {
    level: SpellLevel;
    used: number;
    max: number;
  }[];
  
  lastPrepared: Date;
}

// Common wizard spells
export const WIZARD_SPELLS: Partial<Spell>[] = [
  // Level 1 Cantrips
  {
    name: 'Light',
    level: 1,
    category: 'wizard',
    description: 'An item you touch glows with arcane light, about as bright as a torch.',
    effect: 'It gives off no heat or sound and requires no fuel, but it is otherwise like a mundane torch.',
    tags: ['cantrip']
  },
  {
    name: 'Prestidigitation',
    level: 1,
    category: 'wizard',
    description: 'You perform minor tricks of true magic.',
    effect: 'Create minor illusions, clean or soil items, warm or chill materials, or produce small magical effects.',
    tags: ['cantrip']
  },
  
  // Level 1 Spells
  {
    name: 'Detect Magic',
    level: 1,
    category: 'wizard',
    description: 'One of your senses is briefly attuned to magic.',
    effect: 'The GM will tell you what here is magical.',
    tags: ['divination']
  },
  {
    name: 'Magic Missile',
    level: 1,
    category: 'wizard',
    description: 'Projectiles of pure magic spring from your fingers.',
    effect: 'Deal 2d4 damage to one target.',
    tags: ['evocation']
  },
  {
    name: 'Alarm',
    level: 1,
    category: 'wizard',
    description: 'Walk a wide circle as you cast this spell.',
    effect: 'Until you prepare spells again your magic will alert you if a creature crosses that circle.',
    tags: ['abjuration']
  },
  
  // Level 3 Spells
  {
    name: 'Dispel Magic',
    level: 3,
    category: 'wizard',
    description: 'Choose a spell or magic effect in your presence.',
    effect: 'This spell rips it apart. Lesser spells are ended, powerful magic is just reduced or dampened so long as you are nearby.',
    tags: ['abjuration']
  },
  {
    name: 'Fireball',
    level: 3,
    category: 'wizard',
    description: 'You evoke a mighty ball of flame that envelops your target.',
    effect: 'Deal 2d6 damage which ignores armor.',
    tags: ['evocation']
  },
  
  // Level 5 Spells
  {
    name: 'Polymorph',
    level: 5,
    category: 'wizard',
    description: 'Your touch reshapes a creature entirely.',
    effect: 'Transform a willing creature into another creature of similar size with different abilities.',
    ongoing: true,
    tags: ['transmutation', 'ongoing']
  },
  
  // Level 7 Spells
  {
    name: 'Dominate',
    level: 7,
    category: 'wizard',
    description: 'Your touch pushes your mind into someone else\'s.',
    effect: 'You gain 1d4 hold. Spend one hold to make the target take one of these actions: speak a few words, give you something they hold, make a concerted attack on a target of your choice, or truthfully answer one question.',
    ongoing: true,
    tags: ['enchantment', 'ongoing']
  },
  
  // Level 9 Spells
  {
    name: 'Antipathy',
    level: 9,
    category: 'wizard',
    description: 'Choose a target and describe a type of creature or an alignment.',
    effect: 'Creatures of the specified type or alignment cannot come within sight of the target. If a creature of the specified type does find itself within sight of the target, it immediately flees.',
    ongoing: true,
    tags: ['enchantment', 'ongoing']
  }
];

// Common cleric spells
export const CLERIC_SPELLS: Partial<Spell>[] = [
  // Level 1 Spells
  {
    name: 'Bless',
    level: 1,
    category: 'cleric',
    description: 'Your deity smiles upon a combatant of your choice.',
    effect: 'They take +1 ongoing so long as battle continues and they stand and fight.',
    ongoing: true,
    tags: ['ongoing']
  },
  {
    name: 'Cure Light Wounds',
    level: 1,
    category: 'cleric',
    description: 'At your touch wounds scab and bones cease to ache.',
    effect: 'Heal an ally you touch of 1d8 damage.',
    tags: ['healing']
  },
  {
    name: 'Sanctuary',
    level: 1,
    category: 'cleric',
    description: 'As you cast this spell, you walk the perimeter of an area.',
    effect: 'As long as you stay within that area you are alerted whenever someone acts with malice within the sanctuary (including entering with harmful intent).',
    tags: ['ongoing']
  },
  
  // Level 3 Spells
  {
    name: 'Hold Person',
    level: 3,
    category: 'cleric',
    description: 'Choose a person you can see.',
    effect: 'Until you cast a spell or leave their presence they cannot act except to speak.',
    tags: ['enchantment', 'ongoing']
  },
  
  // Level 5 Spells
  {
    name: 'Revelation',
    level: 5,
    category: 'cleric',
    description: 'Your deity answers your prayers with a moment of perfect understanding.',
    effect: 'The GM will shed light on the current situation.',
    tags: ['divination']
  }
];

// Utility functions

/**
 * Calculate max prepared spells for a character
 */
export function calculateMaxPreparedSpells(
  characterClass: CharacterClass,
  level: number,
  wisdomModifier?: number
): number {
  switch (characterClass) {
    case 'Wizard':
      return level + 1;
    case 'Cleric':
      return (wisdomModifier || 0) + 1;
    default:
      return 0; // Non-spellcasters
  }
}

/**
 * Check if a character can prepare a spell
 */
export function canPrepareSpell(
  spell: Spell,
  characterLevel: number,
  spellbook?: string[]
): boolean {
  // Check level requirement
  if (characterLevel < spell.level) {
    return false;
  }
  
  // If wizard, check if spell is in spellbook
  if (spellbook && !spellbook.includes(spell.id)) {
    return false;
  }
  
  return true;
}

/**
 * Get available spell levels for a character
 */
export function getAvailableSpellLevels(characterLevel: number): SpellLevel[] {
  const levels: SpellLevel[] = [];
  
  if (characterLevel >= 1) levels.push(1);
  if (characterLevel >= 3) levels.push(3);
  if (characterLevel >= 5) levels.push(5);
  if (characterLevel >= 7) levels.push(7);
  if (characterLevel >= 9) levels.push(9);
  
  return levels;
}
