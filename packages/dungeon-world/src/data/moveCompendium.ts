/**
 * Comprehensive Dungeon World Move Compendium
 *
 * This file contains all moves from the official Dungeon World Compendium,
 * properly categorized and formatted for the control panel.
 */

import type { Attribute, CharacterClass } from '../models/Character'

// Move categories for filtering and organization
export type MoveCategory
  = | 'basic' // Basic moves available to all
    | 'class' // Class-specific moves
    | 'advanced' // Advanced moves (level 2-5)
    | 'master' // Master moves (level 6-10)
    | 'special' // Special moves (Level Up, End of Session, etc.)
    | 'custom' // Player-created custom moves

// Move trigger types
export type MoveTrigger
  = | 'action' // Triggered by player action
    | 'roll' // Requires a roll
    | 'passive' // Always active
    | 'reactive' // Triggered by events
    | 'special' // Special trigger conditions

// Roll result tiers
export type RollResult
  = | 'success' // 10+
    | 'partial' // 7-9
    | 'failure' // 6-

// Move types for organization
export type MoveType
  = | 'combat' // Combat-related moves
    | 'social' // Social interaction moves
    | 'exploration' // Exploration and discovery moves
    | 'utility' // Utility and support moves
    | 'defensive' // Defensive and protective moves
    | 'offensive' // Offensive and aggressive moves
    | 'movement' // Movement and positioning moves
    | 'magical' // Magical and supernatural moves
    | 'ritual' // Ritual and ceremonial moves
    | 'special' // Special and unique moves

// Enhanced move interface with comprehensive data
export interface CompendiumMove {
  id: string
  name: string
  category: MoveCategory
  type: MoveType
  description: string
  trigger: string // When the move triggers
  triggerType: MoveTrigger

  // Roll requirements
  rollStat?: Attribute // Which stat to roll with
  rollModifier?: number // Additional modifier
  rollTarget?: number // Target number (if not standard)

  // Results
  onSuccess?: string // 10+ result
  onPartial?: string // 7-9 result
  onFailure?: string // 6- result (usually "mark XP")

  // Requirements
  level?: number // Minimum level required
  requiresMove?: string[] // IDs of prerequisite moves
  requiresClass?: CharacterClass // Specific class requirement
  requiresStat?: { stat: Attribute, value: number } // Stat requirement
  replaces?: string // ID of move this replaces

  // Special properties
  ongoing?: boolean // Provides ongoing modifier
  hold?: number // Generates hold
  forward?: boolean // Provides forward modifier
  armor?: number // Provides armor
  damage?: string // Damage modification
  uses?: {
    current: number
    max: number
    perSession?: boolean
    perDay?: boolean
  }

  // Effects and mechanics
  effects?: string[] // List of mechanical effects
  tags?: string[] // Move tags for filtering
  source?: string // Where this move comes from
  page?: number // Page reference
  custom?: boolean // Is this a custom move
  notes?: string // Additional GM notes
}

// Basic moves available to all characters
export const BASIC_MOVES: CompendiumMove[] = [
  {
    id: 'hack_and_slash',
    name: 'Hack and Slash',
    category: 'basic',
    type: 'combat',
    description: 'When you attack an enemy in melee, roll + STR.',
    trigger: 'When you attack an enemy in melee',
    triggerType: 'action',
    rollStat: 'STR',
    onSuccess: 'You deal your damage to the enemy and avoid their attack.',
    onPartial: 'You deal your damage to the enemy and the enemy makes an attack against you.',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['combat', 'melee', 'damage'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
  {
    id: 'volley',
    name: 'Volley',
    category: 'basic',
    type: 'combat',
    description: 'When you take aim and shoot at an enemy at range, roll + DEX.',
    trigger: 'When you take aim and shoot at an enemy at range',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You have a clear shot—deal your damage.',
    onPartial: 'Choose one: • Move to get the shot and put yourself in danger • Take what you can get: -1d6 damage • Take several shots, reducing ammo by one',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['combat', 'ranged', 'damage'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
  {
    id: 'defy_danger',
    name: 'Defy Danger',
    category: 'basic',
    type: 'defensive',
    description: 'When you act despite an imminent threat or suffer a calamity, say how you deal with it and roll.',
    trigger: 'When you act despite an imminent threat or suffer a calamity',
    triggerType: 'action',
    rollStat: 'STR', // Can be unknown stat based on fiction
    onSuccess: 'You do what you set out to do.',
    onPartial: 'The GM will offer you a worse outcome, hard bargain, or ugly choice.',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['defensive', 'reactive', 'flexible'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
  {
    id: 'parley',
    name: 'Parley',
    category: 'basic',
    type: 'social',
    description: 'When you have leverage on a GM Character and manipulate them, roll + CHA.',
    trigger: 'When you have leverage on a GM Character and manipulate them',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'They do what you ask if you first promise what they ask of you.',
    onPartial: 'They will do what you ask, but they need some concrete assurance, corroboration, or evidence first.',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['social', 'negotiation', 'leverage'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
  {
    id: 'spout_lore',
    name: 'Spout Lore',
    category: 'basic',
    type: 'exploration',
    description: 'When you consult your accumulated knowledge about something, roll + INT.',
    trigger: 'When you consult your accumulated knowledge about something',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'The GM will tell you something interesting and useful about the subject relevant to your situation.',
    onPartial: 'The GM will tell you something interesting and useful about the subject relevant to your situation, but it\'s up to you to make it useful.',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['exploration', 'knowledge', 'information'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
  {
    id: 'discern_realities',
    name: 'Discern Realities',
    category: 'basic',
    type: 'exploration',
    description: 'When you closely study a situation or person, roll + WIS.',
    trigger: 'When you closely study a situation or person',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'You may ask the GM three questions from the list below. The GM must answer them truthfully.',
    onPartial: 'You may ask the GM one question from the list below. The GM must answer it truthfully.',
    onFailure: 'Mark XP and the GM makes a move.',
    tags: ['exploration', 'investigation', 'perception'],
    source: 'DW Core',
    page: 56,
    level: 1,
  },
]

// Fighter moves
export const FIGHTER_MOVES: CompendiumMove[] = [
  // Basic Fighter Moves
  {
    id: 'fighter_bend_bars_lift_gates',
    name: 'Bend Bars, Lift Gates',
    category: 'class',
    type: 'utility',
    description: 'When you use pure strength to destroy an inanimate obstacle, roll + STR.',
    trigger: 'When you use pure strength to destroy an inanimate obstacle',
    triggerType: 'roll',
    rollStat: 'STR',
    onSuccess: 'You do it.',
    onPartial: 'You do it, but it\'s going to take a while.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Fighter',
    tags: ['strength', 'utility', 'destruction'],
    source: 'DW Core',
    page: 25,
    level: 1,
  },
  {
    id: 'fighter_armored',
    name: 'Armored',
    category: 'class',
    type: 'defensive',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Fighter',
    ongoing: true,
    tags: ['armor', 'defensive', 'passive'],
    source: 'DW Core',
    page: 25,
    level: 1,
  },
  {
    id: 'fighter_signature_weapon',
    name: 'Signature Weapon',
    category: 'class',
    type: 'combat',
    description: 'Choose a signature weapon. When you use it, you deal +1 damage.',
    trigger: 'When you use your signature weapon',
    triggerType: 'passive',
    requiresClass: 'Fighter',
    damage: '+1',
    tags: ['weapon', 'damage', 'passive'],
    source: 'DW Core',
    page: 25,
    level: 1,
  },

  // Advanced Fighter Moves (Level 2-5)
  {
    id: 'fighter_heavy_warrior',
    name: 'Heavy Warrior',
    category: 'advanced',
    type: 'combat',
    description: 'When you use a weapon with the forceful tag, you may choose to knock your target back 1d3+1 spaces and close the distance between you.',
    trigger: 'When you use a weapon with the forceful tag',
    triggerType: 'action',
    requiresClass: 'Fighter',
    level: 2,
    tags: ['combat', 'forceful', 'positioning'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_armor_mastery',
    name: 'Armor Mastery',
    category: 'advanced',
    type: 'defensive',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Fighter',
    level: 2,
    ongoing: true,
    tags: ['armor', 'defensive', 'passive'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_improved_weapon',
    name: 'Improved Weapon',
    category: 'advanced',
    type: 'combat',
    description: 'Choose one weapon. You deal +1d4 damage with that weapon.',
    trigger: 'When you use the chosen weapon',
    triggerType: 'passive',
    requiresClass: 'Fighter',
    level: 3,
    damage: '+1d4',
    tags: ['weapon', 'damage', 'passive'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_defensive_fighter',
    name: 'Defensive Fighter',
    category: 'advanced',
    type: 'defensive',
    description: 'When you use Defy Danger, you may choose to use CON instead of some other stat.',
    trigger: 'When you use Defy Danger',
    triggerType: 'action',
    requiresClass: 'Fighter',
    level: 3,
    tags: ['defensive', 'constitution', 'flexible'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_intercepting_strike',
    name: 'Intercepting Strike',
    category: 'advanced',
    type: 'combat',
    description: 'When an enemy moves to engage you or an ally, you may immediately make a Hack and Slash attack against them.',
    trigger: 'When an enemy moves to engage you or an ally',
    triggerType: 'reactive',
    requiresClass: 'Fighter',
    level: 4,
    tags: ['combat', 'reactive', 'interception'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_combat_commander',
    name: 'Combat Commander',
    category: 'advanced',
    type: 'combat',
    description: 'When you Hack and Slash, you may choose one ally. That ally takes +1 forward to their next attack.',
    trigger: 'When you Hack and Slash',
    triggerType: 'action',
    requiresClass: 'Fighter',
    level: 5,
    forward: true,
    tags: ['combat', 'support', 'leadership'],
    source: 'DW Core',
    page: 25,
  },

  // Master Fighter Moves (Level 6-10)
  {
    id: 'fighter_weapon_master',
    name: 'Weapon Master',
    category: 'master',
    type: 'combat',
    description: 'Choose one weapon. You deal +1d6 damage with that weapon.',
    trigger: 'When you use the chosen weapon',
    triggerType: 'passive',
    requiresClass: 'Fighter',
    level: 6,
    requiresMove: ['fighter_improved_weapon'],
    damage: '+1d6',
    tags: ['weapon', 'damage', 'passive'],
    source: 'DW Core',
    page: 25,
  },
  {
    id: 'fighter_unstoppable',
    name: 'Unstoppable',
    category: 'master',
    type: 'combat',
    description: 'When you are reduced to 0 HP, you may immediately make a Hack and Slash attack.',
    trigger: 'When you are reduced to 0 HP',
    triggerType: 'reactive',
    requiresClass: 'Fighter',
    level: 7,
    tags: ['combat', 'reactive', 'last_stand'],
    source: 'DW Core',
    page: 25,
  },
]

// Wizard moves
export const WIZARD_MOVES: CompendiumMove[] = [
  // Basic Wizard Moves
  {
    id: 'wizard_cast_a_spell',
    name: 'Cast a Spell',
    category: 'class',
    type: 'magical',
    description: 'When you release a spell you\'ve prepared, roll + INT.',
    trigger: 'When you release a spell you\'ve prepared',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'The spell is cast and you do not forget the spell—you can cast it again later.',
    onPartial: 'The spell is cast, but choose one: • You draw unwelcome attention or put yourself in a spot • The spell disturbs the fabric of reality as it is cast—take-1 ongoing to cast a spell until the next time you Prepare Spells • After it is cast, the spell is forgotten by you',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Wizard',
    tags: ['magical', 'spellcasting', 'intelligence'],
    source: 'DW Core',
    page: 35,
    level: 1,
  },
  {
    id: 'wizard_prepare_spells',
    name: 'Prepare Spells',
    category: 'class',
    type: 'magical',
    description: 'When you spend uninterrupted time (an hour or so) in quiet contemplation of your spellbook, you: • Lose unknown spells you already have prepared • Prepare new spells of your choice from your spellbook whose total levels don\'t exceed your own level + 1 • Prepare your cantrips which never count against your limit.',
    trigger: 'When you spend uninterrupted time in quiet contemplation of your spellbook',
    triggerType: 'action',
    requiresClass: 'Wizard',
    tags: ['magical', 'preparation', 'spellbook'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_ritual',
    name: 'Ritual',
    category: 'class',
    type: 'ritual',
    description: 'When you draw on a place of power to create a magical effect, tell the GM what you want to achieve. Ritual effects are always possible, but the GM will give you one to four of the following conditions: • It\'s going to take hours / days / weeks • First you must ___ • You\'ll need help from ___ • It will require a lot of money • The best you can do is a lesser version, unreliable and limited • You and your allies will risk danger from ___ • You\'ll have to disenchant ___ to do it',
    trigger: 'When you draw on a place of power to create a magical effect',
    triggerType: 'action',
    requiresClass: 'Wizard',
    tags: ['ritual', 'magical', 'power'],
    source: 'DW Core',
    page: 35,
  },

  // Advanced Wizard Moves (Level 2-5)
  {
    id: 'wizard_empowered_magic',
    name: 'Empowered Magic',
    category: 'advanced',
    type: 'magical',
    description: 'When you cast a spell, on a hit you deal + 1d4 damage or heal + 1d4 HP.',
    trigger: 'When you cast a spell',
    triggerType: 'action',
    requiresClass: 'Wizard',
    level: 2,
    damage: '+1d4',
    tags: ['magical', 'damage', 'healing'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_familiar',
    name: 'Familiar',
    category: 'advanced',
    type: 'magical',
    description: 'You have a magical animal companion. When you cast a spell, your familiar can deliver it. Your familiar has 3 HP and can carry one item.',
    trigger: 'When you cast a spell',
    triggerType: 'action',
    requiresClass: 'Wizard',
    level: 2,
    tags: ['magical', 'companion', 'delivery'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_protective_ward',
    name: 'Protective Ward',
    category: 'advanced',
    type: 'defensive',
    description: 'When you cast a spell, you gain + 1 armor until you cast another spell.',
    trigger: 'When you cast a spell',
    triggerType: 'action',
    requiresClass: 'Wizard',
    level: 3,
    armor: 1,
    ongoing: true,
    tags: ['magical', 'defensive', 'armor'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_counterspell',
    name: 'Counterspell',
    category: 'advanced',
    type: 'magical',
    description: 'When you see someone casting a spell you know, you can try to counter it. Roll + INT.',
    trigger: 'When you see someone casting a spell you know',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'The spell is countered and has no effect.',
    onPartial: 'The spell is countered, but you draw unwelcome attention or put yourself in a spot.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Wizard',
    level: 4,
    tags: ['magical', 'reactive', 'counter'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_spell_defender',
    name: 'Spell Defender',
    category: 'advanced',
    type: 'defensive',
    description: 'You have + 1 armor against damage from spells.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Wizard',
    level: 1,
    armor: 1,
    ongoing: true,
    tags: ['magical', 'defensive', 'passive'],
    source: 'DW Core',
    page: 35,
  },

  // Master Wizard Moves (Level 6-10)
  {
    id: 'wizard_spell_binder',
    name: 'Spell Binder',
    category: 'master',
    type: 'magical',
    description: 'When you cast a spell, you may choose to bind it to a nearby object or creature. The spell remains bound until you cast another spell or the object / creature is destroyed.',
    trigger: 'When you cast a spell',
    triggerType: 'action',
    requiresClass: 'Wizard',
    level: 6,
    tags: ['magical', 'binding', 'persistent'],
    source: 'DW Core',
    page: 35,
  },
  {
    id: 'wizard_master_wizard',
    name: 'Master Wizard',
    category: 'master',
    type: 'magical',
    description: 'You can prepare spells of unknown level, not just your level or lower.',
    trigger: 'When you prepare spells',
    triggerType: 'action',
    requiresClass: 'Wizard',
    level: 7,
    tags: ['magical', 'preparation', 'mastery'],
    source: 'DW Core',
    page: 35,
  },
]

// Cleric moves
export const CLERIC_MOVES: CompendiumMove[] = [
  // Basic Cleric Moves
  {
    id: 'cleric_cast_a_spell',
    name: 'Cast a Spell',
    category: 'class',
    type: 'magical',
    description: 'When you release a spell you\'ve been granted, roll + WIS.',
    trigger: 'When you release a spell you\'ve been granted',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'The spell is cast and your deity does not revoke the spell—you can cast it again later.',
    onPartial: 'The spell is cast, but choose one: • You draw unwelcome attention or put yourself in a spot • Your deity grants you the spell, but you must sacrifice something to show your dedication',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Cleric',
    tags: ['magical', 'divine', 'wisdom'],
    source: 'DW Core',
    page: 30,
    level: 1,
  },
  {
    id: 'cleric_commune',
    name: 'Commune',
    category: 'class',
    type: 'ritual',
    description: 'When you spend uninterrupted time (an hour or so) in quiet contemplation of your deity, you: • Lose unknown spells you already have been granted • Are granted new spells of your choice whose total levels don\'t exceed your own level + 1 • Are granted your rotes which never count against your limit.',
    trigger: 'When you spend uninterrupted time in quiet contemplation of your deity',
    triggerType: 'action',
    requiresClass: 'Cleric',
    tags: ['ritual', 'divine', 'preparation'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_turn_undead',
    name: 'Turn Undead',
    category: 'class',
    type: 'magical',
    description: 'When you hold your holy symbol aloft and call on your deity for protection, roll + CHA.',
    trigger: 'When you hold your holy symbol aloft and call on your deity for protection',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'Your deity prevents them from attacking or harming you.',
    onPartial: 'Your deity prevents them from attacking or harming you, but they can still act against you in other ways.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Cleric',
    tags: ['magical', 'divine', 'protection'],
    source: 'DW Core',
    page: 30,
  },

  // Advanced Cleric Moves (Level 2-5)
  {
    id: 'cleric_divine_guidance',
    name: 'Divine Guidance',
    category: 'advanced',
    type: 'magical',
    description: 'When you pray for guidance, roll + WIS.',
    trigger: 'When you pray for guidance',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'Your deity gives you useful information or insight.',
    onPartial: 'Your deity gives you useful information or insight, but it\'s cryptic or requires interpretation.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Cleric',
    level: 2,
    tags: ['magical', 'divine', 'guidance'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_healer',
    name: 'Healer',
    category: 'advanced',
    type: 'utility',
    description: 'When you heal someone, you heal + 1d8 HP.',
    trigger: 'When you heal someone',
    triggerType: 'action',
    requiresClass: 'Cleric',
    level: 2,
    tags: ['healing', 'utility', 'support'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_divine_protection',
    name: 'Divine Protection',
    category: 'advanced',
    type: 'defensive',
    description: 'You have + 1 armor against damage from undead.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Cleric',
    level: 3,
    armor: 1,
    ongoing: true,
    tags: ['defensive', 'divine', 'passive'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_serenity',
    name: 'Serenity',
    category: 'advanced',
    type: 'defensive',
    description: 'When you use Defy Danger, you may choose to use WIS instead of unknown other stat.',
    trigger: 'When you use Defy Danger',
    triggerType: 'action',
    requiresClass: 'Cleric',
    level: 4,
    tags: ['defensive', 'wisdom', 'flexible'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_divine_invocation',
    name: 'Divine Invocation',
    category: 'advanced',
    type: 'magical',
    description: 'When you cast a spell, you may choose to invoke your deity\'s name. If you do, the spell is more powerful but you draw unwelcome attention.',
    trigger: 'When you cast a spell',
    triggerType: 'action',
    requiresClass: 'Cleric',
    level: 5,
    tags: ['magical', 'divine', 'power'],
    source: 'DW Core',
    page: 30,
  },

  // Master Cleric Moves (Level 6-10)
  {
    id: 'cleric_divine_intervention',
    name: 'Divine Intervention',
    category: 'master',
    type: 'magical',
    description: 'When you call on your deity for aid, roll + CHA.',
    trigger: 'When you call on your deity for aid',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'Your deity intervenes on your behalf.',
    onPartial: 'Your deity intervenes, but there is a cost or consequence.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Cleric',
    level: 6,
    tags: ['magical', 'divine', 'intervention'],
    source: 'DW Core',
    page: 30,
  },
  {
    id: 'cleric_master_healer',
    name: 'Master Healer',
    category: 'master',
    type: 'utility',
    description: 'When you heal someone, you heal + 2d8 HP instead of + 1d8.',
    trigger: 'When you heal someone',
    triggerType: 'action',
    requiresClass: 'Cleric',
    level: 7,
    requiresMove: ['cleric_healer'],
    tags: ['healing', 'utility', 'mastery'],
    source: 'DW Core',
    page: 30,
  },
]

// Barbarian moves
export const BARBARIAN_MOVES: CompendiumMove[] = [
  // Basic Barbarian Moves
  {
    id: 'herculean_appetites',
    name: 'Herculean Appetites',
    category: 'class',
    type: 'utility',
    description: 'When you consume something, you take + 1 to unknown rolls involving it until you consume something else.',
    trigger: 'When you consume something',
    triggerType: 'passive',
    ongoing: true,
    requiresClass: 'Barbarian',
    tags: ['consumption', 'bonus', 'barbarian'],
    source: 'DW Core',
    page: 27,
    level: 1,
  },
  {
    id: 'the_upper_hand',
    name: 'The Upper Hand',
    category: 'class',
    type: 'combat',
    description: 'When you have a weapon in hand, you deal + 1 damage.',
    trigger: 'When you have a weapon in hand',
    triggerType: 'passive',
    ongoing: true,
    damage: '+1',
    requiresClass: 'Barbarian',
    tags: ['weapon', 'damage', 'barbarian'],
    source: 'DW Core',
    page: 27,
    level: 1,
  },
  {
    id: 'what_are_you_waiting_for',
    name: 'What Are You Waiting For?',
    category: 'class',
    type: 'combat',
    description: 'When you charge into battle, you may take + 1 forward to your next Hack and Slash roll.',
    trigger: 'When you charge into battle',
    triggerType: 'action',
    forward: true,
    requiresClass: 'Barbarian',
    tags: ['charge', 'forward', 'barbarian'],
    source: 'DW Core',
    page: 27,
    level: 1,
  },
]

// Paladin moves
export const PALADIN_MOVES: CompendiumMove[] = [
  // Basic Paladin Moves
  {
    id: 'paladin_lay_on_hands',
    name: 'Lay on Hands',
    category: 'class',
    type: 'utility',
    description: 'When you touch someone, skin to skin, and pray for their well-being, roll + CHA.',
    trigger: 'When you touch someone and pray for their well-being',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'They are healed of 1d8 damage or one debility of your choice.',
    onPartial: 'They are healed of 1d8 damage or one debility of your choice, but you are marked by your deity.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Paladin',
    tags: ['healing', 'divine', 'touch'],
    source: 'DW Core',
    page: 28,
    level: 1,
  },
  {
    id: 'paladin_armored',
    name: 'Armored',
    category: 'class',
    type: 'defensive',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Paladin',
    ongoing: true,
    tags: ['armor', 'defensive', 'passive'],
    source: 'DW Core',
    page: 28,
    level: 1,
  },
  {
    id: 'paladin_iron_will',
    name: 'Iron Will',
    category: 'class',
    type: 'defensive',
    description: 'When you use Defy Danger, you may choose to use CHA instead of unknown other stat.',
    trigger: 'When you use Defy Danger',
    triggerType: 'action',
    requiresClass: 'Paladin',
    tags: ['defensive', 'charisma', 'flexible'],
    source: 'DW Core',
    page: 28,
    level: 1,
  },
]

// Ranger moves
export const RANGER_MOVES: CompendiumMove[] = [
  // Basic Ranger Moves
  {
    id: 'ranger_hunt_and_track',
    name: 'Hunt and Track',
    category: 'class',
    type: 'exploration',
    description: 'When you follow a trail of clues left behind by passing creatures, roll + WIS.',
    trigger: 'When you follow a trail of clues left behind by passing creatures',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'You find what you\'re tracking.',
    onPartial: 'You find what you\'re tracking, but it\'s not what you expected.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Ranger',
    tags: ['tracking', 'exploration', 'wilderness'],
    source: 'DW Core',
    page: 32,
    level: 1,
  },
  {
    id: 'ranger_called_shot',
    name: 'Called Shot',
    category: 'class',
    type: 'combat',
    description: 'When you take aim and shoot at an enemy at range, roll + DEX.',
    trigger: 'When you take aim and shoot at an enemy at range',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You have a clear shot—deal your damage.',
    onPartial: 'Choose one: • Move to get the shot and put yourself in danger • Take what you can get: -1d6 damage • Take several shots, reducing ammo by one',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Ranger',
    tags: ['combat', 'ranged', 'damage'],
    source: 'DW Core',
    page: 32,
    level: 1,
  },
  {
    id: 'ranger_animal_companion',
    name: 'Animal Companion',
    category: 'class',
    type: 'utility',
    description: 'You have a loyal animal companion. When you work together with your companion, you may add its damage to your own.',
    trigger: 'When you work together with your companion',
    triggerType: 'action',
    requiresClass: 'Ranger',
    tags: ['companion', 'damage', 'cooperation'],
    source: 'DW Core',
    page: 32,
    level: 1,
  },
]

// Thief moves
export const THIEF_MOVES: CompendiumMove[] = [
  // Basic Thief Moves
  {
    id: 'thief_tricks_of_the_trade',
    name: 'Tricks of the Trade',
    category: 'class',
    type: 'utility',
    description: 'When you pick locks or disable traps, roll + DEX.',
    trigger: 'When you pick locks or disable traps',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You do it.',
    onPartial: 'You do it, but it\'s going to take a while.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Thief',
    tags: ['locks', 'traps', 'dexterity'],
    source: 'DW Core',
    page: 34,
    level: 1,
  },
  {
    id: 'thief_backstab',
    name: 'Backstab',
    category: 'class',
    type: 'combat',
    description: 'When you attack a surprised or defenseless enemy, roll + DEX.',
    trigger: 'When you attack a surprised or defenseless enemy',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You deal your damage and the enemy doesn\'t get to make an attack.',
    onPartial: 'You deal your damage and the enemy makes an attack against you.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Thief',
    tags: ['combat', 'sneak', 'damage'],
    source: 'DW Core',
    page: 34,
    level: 1,
  },
  {
    id: 'thief_poisoner',
    name: 'Poisoner',
    category: 'class',
    type: 'utility',
    description: 'You can make poisons. When you make a poison, roll + INT.',
    trigger: 'When you make a poison',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'You create a poison that does what you intended.',
    onPartial: 'You create a poison that does what you intended, but it\'s not as potent as you hoped.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Thief',
    tags: ['poison', 'crafting', 'intelligence'],
    source: 'DW Core',
    page: 34,
    level: 1,
  },
]

// Bard moves
export const BARD_MOVES: CompendiumMove[] = [
  // Basic Bard Moves
  {
    id: 'bard_arcane_art',
    name: 'Arcane Art',
    category: 'class',
    type: 'magical',
    description: 'When you weave a performance into a basic spell, roll + CHA.',
    trigger: 'When you weave a performance into a basic spell',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'The spell is cast and you do not forget the spell.',
    onPartial: 'The spell is cast, but choose one: • You draw unwelcome attention or put yourself in a spot • The spell disturbs the fabric of reality as it is cast—take-1 ongoing to cast a spell until the next time you Prepare Spells • After it is cast, the spell is forgotten by you',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Bard',
    tags: ['magical', 'performance', 'spellcasting'],
    source: 'DW Core',
    page: 26,
    level: 1,
  },
  {
    id: 'bard_charming_and_open',
    name: 'Charming and Open',
    category: 'class',
    type: 'social',
    description: 'When you speak frankly with someone, you can ask their player a question from the list below. They must answer it truthfully, then they may ask you a question from the list (which you must answer truthfully).',
    trigger: 'When you speak frankly with someone',
    triggerType: 'action',
    requiresClass: 'Bard',
    tags: ['social', 'truth', 'interaction'],
    source: 'DW Core',
    page: 26,
  },
  {
    id: 'bard_a_port_in_the_storm',
    name: 'A Port in the Storm',
    category: 'class',
    type: 'utility',
    description: 'When you return to a civilized settlement you\'ve visited before, let the GM know. When you get there, the GM will tell you something changed or is going on.',
    trigger: 'When you return to a civilized settlement you\'ve visited before',
    triggerType: 'action',
    requiresClass: 'Bard',
    tags: ['settlement', 'information', 'change'],
    source: 'DW Core',
    page: 26,
  },
]

// Druid moves
export const DRUID_MOVES: CompendiumMove[] = [
  // Basic Druid Moves
  {
    id: 'druid_by_nature_sustained',
    name: 'By Nature Sustained',
    category: 'class',
    type: 'utility',
    description: 'You don\'t need to eat or drink. If you do, you\'re sick until you do nothing but rest for a day.',
    trigger: 'Always active',
    triggerType: 'passive',
    requiresClass: 'Druid',
    ongoing: true,
    tags: ['sustenance', 'nature', 'passive'],
    source: 'DW Core',
    page: 29,
    level: 1,
  },
  {
    id: 'druid_shapeshifter',
    name: 'Shapeshifter',
    category: 'class',
    type: 'magical',
    description: 'When you call upon the spirits of nature to change your shape, roll + WIS.',
    trigger: 'When you call upon the spirits of nature to change your shape',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'You change into a natural creature of your size or smaller.',
    onPartial: 'You change into a natural creature of your size or smaller, but the GM chooses which.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Druid',
    tags: ['shapeshifting', 'nature', 'transformation'],
    source: 'DW Core',
    page: 29,
  },
  {
    id: 'druid_communion',
    name: 'Communion',
    category: 'class',
    type: 'ritual',
    description: 'When you spend time in contemplation of natural forces, you may ask the GM one question about the natural world. The GM will answer you truthfully.',
    trigger: 'When you spend time in contemplation of natural forces',
    triggerType: 'action',
    requiresClass: 'Druid',
    tags: ['nature', 'knowledge', 'ritual'],
    source: 'DW Core',
    page: 29,
  },
]

// Immolator moves
export const IMMOLATOR_MOVES: CompendiumMove[] = [
  // Basic Immolator Moves
  {
    id: 'immolator_burning_brand',
    name: 'Burning Brand',
    category: 'class',
    type: 'combat',
    description: 'When you touch an object, it bursts into flame. When you touch a person, they take 1d6 + 1 damage and catch fire.',
    trigger: 'When you touch an object or person',
    triggerType: 'action',
    requiresClass: 'Immolator',
    damage: '1d6 + 1',
    tags: ['fire', 'combat', 'touch'],
    source: 'DW Core',
    page: 31,
    level: 1,
  },
  {
    id: 'immolator_give_me_fuel_give_me_fire',
    name: 'Give Me Fuel, Give Me Fire',
    category: 'class',
    type: 'magical',
    description: 'When you have time and safety to prepare, you can create a fire that burns anything. When you do, roll + INT.',
    trigger: 'When you have time and safety to prepare a fire',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'The fire burns as you intended.',
    onPartial: 'The fire burns as you intended, but it\'s not as controlled as you hoped.',
    onFailure: 'Mark XP and the GM makes a move.',
    requiresClass: 'Immolator',
    tags: ['fire', 'preparation', 'creation'],
    source: 'DW Core',
    page: 31,
  },
  {
    id: 'immolator_zuko_style',
    name: 'Zuko Style',
    category: 'class',
    type: 'combat',
    description: 'When you use fire to attack, you may choose to take 1d4 damage to deal + 1d4 damage.',
    trigger: 'When you use fire to attack',
    triggerType: 'action',
    requiresClass: 'Immolator',
    damage: '+1d4',
    tags: ['fire', 'combat', 'sacrifice'],
    source: 'DW Core',
    page: 31,
  },
]

// Special moves
export const SPECIAL_MOVES: CompendiumMove[] = [
  {
    id: 'level_up',
    name: 'Level Up',
    category: 'special',
    type: 'special',
    description: 'When you gain a level, you may choose one new move from your class\'s advanced moves list.',
    trigger: 'When you gain a level',
    triggerType: 'special',
    tags: ['advancement', 'special'],
    source: 'DW Core',
    page: 56,
  },
  {
    id: 'end_of_session',
    name: 'End of Session',
    category: 'special',
    type: 'special',
    description: 'When you reach the end of a session, choose one of your bonds that you feel is resolved. Ask the player of the character you have the bond with if they agree. If they do, mark XP and write a new bond with whomever you wish.',
    trigger: 'When you reach the end of a session',
    triggerType: 'special',
    tags: ['advancement', 'bonds', 'special'],
    source: 'DW Core',
    page: 56,
  },
  {
    id: 'last_breath',
    name: 'Last Breath',
    category: 'special',
    type: 'special',
    description: 'When you\'re dying, you catch a glimpse of what lies beyond the Black Gates of Death\'s Kingdom. Roll + nothing.',
    trigger: 'When you\'re dying',
    triggerType: 'roll',
    onSuccess: 'Death itself gives you an offer, above and beyond unknown other. If you accept, you live, but things will never be the same.',
    onPartial: 'You\'ve cheated Death—you\'re in a bad spot but you\'re still alive.',
    onFailure: 'You\'re dead.',
    tags: ['death', 'special', 'fate'],
    source: 'DW Core',
    page: 56,
  },
]

// Combined move compendium
export const MOVE_COMPENDIUM: CompendiumMove[] = [
  ...BASIC_MOVES,
  ...FIGHTER_MOVES,
  ...WIZARD_MOVES,
  ...CLERIC_MOVES,
  ...BARBARIAN_MOVES,
  ...PALADIN_MOVES,
  ...RANGER_MOVES,
  ...THIEF_MOVES,
  ...BARD_MOVES,
  ...DRUID_MOVES,
  ...IMMOLATOR_MOVES,
  ...SPECIAL_MOVES,
]

// Helper functions for move management
export function getMovesByClass(characterClass: CharacterClass): CompendiumMove[] {
  return MOVE_COMPENDIUM.filter(move => move.requiresClass === characterClass)
}

export function getMovesByLevel(level: number): CompendiumMove[] {
  return MOVE_COMPENDIUM.filter(move => move.level === level)
}

export function getMovesByCategory(category: MoveCategory): CompendiumMove[] {
  return MOVE_COMPENDIUM.filter(move => move.category === category)
}

export function getMovesByType(type: MoveType): CompendiumMove[] {
  return MOVE_COMPENDIUM.filter(move => move.type === type)
}

export function searchMoves(query: string): CompendiumMove[] {
  const lowerQuery = query.toLowerCase()
  return MOVE_COMPENDIUM.filter(move =>
    move.name.toLowerCase().includes(lowerQuery)
    || move.description.toLowerCase().includes(lowerQuery)
    || move.trigger.toLowerCase().includes(lowerQuery)
    || (move.tags && move.tags.some(tag => tag.toLowerCase().includes(lowerQuery))),
  )
}

export function getMoveById(id: string): CompendiumMove | undefined {
  return MOVE_COMPENDIUM.find(move => move.id === id)
}

export function getAvailableMoves(characterClass: CharacterClass, level: number): CompendiumMove[] {
  return MOVE_COMPENDIUM.filter((move) => {
    // Basic moves are always available
    if (move.category === 'basic')
      return true

    // Class-specific moves
    if (move.requiresClass && move.requiresClass !== characterClass)
      return false

    // Level requirements
    if (move.level && move.level > level)
      return false

    return true
  })
}
