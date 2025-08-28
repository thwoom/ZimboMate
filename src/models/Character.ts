/**
 * Core character data models for Dungeon World
 */

// Core attributes in Dungeon World
export type Attribute = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface Attributes {
  STR: number; // Strength
  DEX: number; // Dexterity
  CON: number; // Constitution
  INT: number; // Intelligence
  WIS: number; // Wisdom
  CHA: number; // Charisma
}

// Debilities that can affect attributes
export interface Debilities {
  weak: boolean;     // -1 to STR
  shaky: boolean;    // -1 to DEX
  sick: boolean;     // -1 to CON
  stunned: boolean;  // -1 to INT
  confused: boolean; // -1 to WIS
  scarred: boolean;  // -1 to CHA
}

// Character classes in Dungeon World
export type CharacterClass = 
  | 'Fighter'
  | 'Paladin'
  | 'Ranger'
  | 'Thief'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Wizard'
  | 'Barbarian'
  | 'Immolator';

// Alignments
export type Alignment = 
  | 'Good'
  | 'Lawful'
  | 'Neutral'
  | 'Chaotic'
  | 'Evil';

// Damage dice types
export type DamageDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

// Bond with another character
export interface Bond {
  id: string;
  text: string;
  characterName?: string; // The character this bond is with
  resolved: boolean;
}

// Character race/species
export type Race = 
  | 'Human'
  | 'Elf'
  | 'Dwarf'
  | 'Halfling'
  | 'Other';

// Advancement choice when leveling up
export interface AdvancementChoice {
  level: number;
  type: 'move' | 'stat' | 'other';
  choice: string; // Move ID, stat name, or description
  description?: string; // Human-readable description
  timestamp: Date;
}

// Main Character interface
export interface Character {
  // Basic Information
  id: string;
  name: string;
  look?: string; // Character appearance description
  portraitId?: string; // ID of selected portrait
  background?: string; // Narrative backstory/summary
  personalityTraits?: string[]; // Short descriptors of personality
  voice?: string; // Voice or mannerisms description
  class: CharacterClass;
  race: Race;
  level: number;
  alignment: Alignment;
  alignmentMove?: string; // The specific alignment move text

  // Attributes and Modifiers
  attributes: Attributes;
  debilities: Debilities;

  // Health and Combat
  hp: {
    current: number;
    max: number;
  };
  armor: number; // Total armor value (calculated from equipment)
  baseArmor?: number; // Manual armor override
  damageDie: DamageDie;

  // Experience
  xp: number;
  
  // Load and Encumbrance
  load: {
    current: number; // Current weight carried
    max: number; // Maximum load (base + STR modifier)
  };
  baseLoad: number; // Base load from class

  // Currency
  coin: number;

  // Bonds
  bonds: Bond[];

  // Advancement
  advancements: AdvancementChoice[];
  availableMoves?: string[]; // Move IDs that can be taken on level up
  knownMoves: string[]; // Move IDs the character has learned
  // Spellcasting (for casters)
  knownSpells?: string[];
  preparedSpells?: string[];

  // Conditions
  conditions: string[]; // Active condition IDs

  // Other
  notes?: string;
  looks?: string; // Character appearance
  backstory?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Character creation data (for new character flow)
export interface CharacterCreationData {
  name: string;
  class: CharacterClass;
  race: Race;
  alignment: Alignment;
  attributes: Attributes;
  looks?: string;
  bonds?: string[]; // Initial bond texts
}

// Utility functions for character calculations

/**
 * Calculate modifier from attribute score
 * 3: -3, 4-5: -2, 6-8: -1, 9-12: 0, 13-15: +1, 16-17: +2, 18: +3
 */
export function getAttributeModifier(score: number): number {
  if (score <= 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
}

/**
 * Calculate effective modifier including debilities
 */
export function getEffectiveModifier(
  attribute: Attribute,
  attributes: Attributes,
  debilities: Debilities
): number {
  let modifier = getAttributeModifier(attributes[attribute]);
  
  // Apply debility penalties
  if (attribute === 'STR' && debilities.weak) modifier -= 1;
  if (attribute === 'DEX' && debilities.shaky) modifier -= 1;
  if (attribute === 'CON' && debilities.sick) modifier -= 1;
  if (attribute === 'INT' && debilities.stunned) modifier -= 1;
  if (attribute === 'WIS' && debilities.confused) modifier -= 1;
  if (attribute === 'CHA' && debilities.scarred) modifier -= 1;
  
  return modifier;
}

/**
 * Calculate XP needed for next level
 * Formula: Current Level + 7
 */
export function getXPThreshold(level: number): number {
  return level + 7;
}

/**
 * Check if character should level up
 */
export function shouldLevelUp(character: Character): boolean {
  return character.xp >= getXPThreshold(character.level);
}

/**
 * Get class base HP
 */
export function getClassBaseHP(characterClass: CharacterClass): number {
  const baseHP: Record<CharacterClass, number> = {
    'Fighter': 10,
    'Paladin': 10,
    'Ranger': 8,
    'Thief': 6,
    'Bard': 6,
    'Cleric': 8,
    'Druid': 6,
    'Wizard': 4,
    'Barbarian': 8,
    'Immolator': 4
  };
  return baseHP[characterClass] || 6;
}

/**
 * Get class base load
 */
export function getClassBaseLoad(characterClass: CharacterClass): number {
  const baseLoad: Record<CharacterClass, number> = {
    'Fighter': 12,
    'Paladin': 12,
    'Ranger': 11,
    'Thief': 9,
    'Bard': 9,
    'Cleric': 10,
    'Druid': 6,
    'Wizard': 7,
    'Barbarian': 8,
    'Immolator': 9
  };
  return baseLoad[characterClass] || 9;
}

/**
 * Get class damage die
 */
export function getClassDamageDie(characterClass: CharacterClass): DamageDie {
  const damageDice: Record<CharacterClass, DamageDie> = {
    'Fighter': 'd10',
    'Paladin': 'd10',
    'Ranger': 'd8',
    'Thief': 'd8',
    'Bard': 'd6',
    'Cleric': 'd6',
    'Druid': 'd6',
    'Wizard': 'd4',
    'Barbarian': 'd10',
    'Immolator': 'd8'
  };
  return damageDice[characterClass] || 'd6';
}

/**
 * Calculate maximum HP (base HP + Constitution modifier)
 */
export function calculateMaxHP(character: Character): number {
  const baseHP = getClassBaseHP(character.class);
  const conModifier = getEffectiveModifier('CON', character.attributes, character.debilities);
  return Math.max(1, baseHP + conModifier); // Minimum 1 HP
}

/**
 * Calculate maximum load (base load + STR modifier)
 */
export function calculateMaxLoad(character: Character): number {
  const baseLoad = getClassBaseLoad(character.class);
  const strModifier = getEffectiveModifier('STR', character.attributes, character.debilities);
  return Math.max(1, baseLoad + strModifier); // Minimum 1 load
}
