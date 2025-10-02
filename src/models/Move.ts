/**
 * Move data models for Dungeon World
 */

import type { Attribute } from './Character'

// Move categories
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

// Move interface
export interface Move {
  id: string
  name: string
  category: MoveCategory
  description: string
  trigger: string // When the move triggers
  triggerType: MoveTrigger

  // Roll requirements
  rollStat?: Attribute // Which stat to roll with
  rollModifier?: number // Additional modifier

  // Results
  onSuccess?: string // 10 + result
  onPartial?: string // 7-9 result
  onFailure?: string // 6-result (usually "mark XP")

  // Requirements
  level?: number // Minimum level required
  requiresMove?: string // ID of prerequisite move
  requiresClass?: string // Specific class requirement
  replaces?: string // ID of move this replaces

  // Special properties
  ongoing?: boolean // Provides ongoing modifier
  hold?: number // Generates hold
  forward?: boolean // Provides forward modifier
  uses?: {
    current: number
    max: number
    perSession?: boolean
  }

  // Metadata
  source?: string // Where this move comes from
  page?: number // Page reference
  custom?: boolean // Is this a custom move
}

// Basic moves available to all characters
export const BASIC_MOVES: Partial <Move>[] = [
  {
    name: 'Hack and Slash',
    category: 'basic',
    description: 'When you attack an enemy in melee...',
    trigger: 'When you attack an enemy in melee',
    triggerType: 'roll',
    rollStat: 'STR',
    onSuccess: 'You deal your damage to the enemy and avoid their attack.',
    onPartial: 'You deal your damage to the enemy and the enemy makes an attack against you.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Volley',
    category: 'basic',
    description: 'When you take aim and shoot at an enemy at range...',
    trigger: 'When you take aim and shoot at an enemy at range',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You have a clear shot—deal your damage.',
    onPartial: 'Choose one: • Move to get the shot and put yourself in danger • Take what you can get: -1d6 damage • Take several shots, reducing ammo by one',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Defy Danger',
    category: 'basic',
    description: 'When you act despite an imminent threat...',
    trigger: 'When you act despite an imminent threat or suffer a calamity',
    triggerType: 'roll',
    rollStat: 'STR', // Can be unknown stat based on fiction
    onSuccess: 'You do what you set out to, the threat doesn\'t come to bear.',
    onPartial: 'You stumble, hesitate, or flinch: the GM will offer you a worse outcome, hard bargain, or ugly choice.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Defend',
    category: 'basic',
    description: 'When you stand in defense of a person, item, or location...',
    trigger: 'When you stand in defense of a person, item, or location',
    triggerType: 'roll',
    rollStat: 'CON',
    hold: 3,
    onSuccess: 'Hold 3.',
    onPartial: 'Hold 1.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Spout Lore',
    category: 'basic',
    description: 'When you consult your accumulated knowledge...',
    trigger: 'When you consult your accumulated knowledge about something',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess: 'The GM will tell you something interesting and useful about the subject.',
    onPartial: 'The GM will only tell you something interesting—it\'s on you to make it useful.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Discern Realities',
    category: 'basic',
    description: 'When you closely study a situation or person...',
    trigger: 'When you closely study a situation or person',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'Ask the GM 3 questions from the list.',
    onPartial: 'Ask the GM 1 question from the list.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Parley',
    category: 'basic',
    description: 'When you have leverage on an NPC and manipulate them...',
    trigger: 'When you have leverage on an NPC and manipulate them',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'They do what you ask if you first promise what they ask of you.',
    onPartial: 'They will do what you ask, but need some concrete assurance of your promise, right now.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    name: 'Aid or Interfere',
    category: 'basic',
    description: 'When you help or hinder someone...',
    trigger: 'When you help or hinder someone',
    triggerType: 'roll',
    rollStat: 'STR', // Based on bond
    onSuccess: 'They take + 1 or-2 to their roll, your choice.',
    onPartial: 'They still get + 1 or-2, but you also expose yourself to danger.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
]

// Special moves
export const SPECIAL_MOVES: Partial <Move>[] = [
  {
    name: 'Last Breath',
    category: 'special',
    description: 'When you\'re dying you catch a glimpse of what lies beyond...',
    trigger: 'When you\'re dying (0 HP)',
    triggerType: 'roll',
    rollStat: undefined, // CORRECTED: Last Breath uses pure 2d6 (no modifiers)
    onSuccess: 'You\'ve cheated death—you\'re in a bad spot but you\'re still alive.',
    onPartial: 'Death will offer you a bargain. Take it and stabilize or refuse and pass beyond.',
    onFailure: 'Your fate is sealed. You\'re marked as Death\'s own.',
  },
  {
    name: 'Encumbrance',
    category: 'special',
    description: 'When your load exceeds your capacity...',
    trigger: 'When your load exceeds your Load',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    name: 'Level Up',
    category: 'special',
    description: 'When you have downtime and XP equal to your current level + 7...',
    trigger: 'When you have downtime and XP equal to your current level + 7',
    triggerType: 'special',
  },
  {
    name: 'End of Session',
    category: 'special',
    description: 'When you reach the end of a session...',
    trigger: 'When you reach the end of a session',
    triggerType: 'special',
  },
  {
    name: 'Make Camp',
    category: 'special',
    description: 'When you settle in to rest...',
    trigger: 'When you settle in to rest',
    triggerType: 'action',
  },
]

// Utility functions

/**
 * Check if a move requires a roll
 */
export function requiresRoll(move: Move): boolean {
  return move.triggerType === 'roll' && move.rollStat !== undefined
}

/**
 * Get roll result tier based on total
 */
export function getRollResult(total: number): RollResult {
  if (total >= 10)
    return 'success'
  if (total >= 7)
    return 'partial'
  return 'failure'
}

/**
 * Format move result based on roll
 */
export function getMoveResult(move: Move, result: RollResult): string {
  switch (result) {
    case 'success':
      return move.onSuccess || 'Success!'
    case 'partial':
      return move.onPartial || 'Partial success.'
    case 'failure':
      return move.onFailure || 'Mark XP and the GM makes a move.'
  }
}

/**
 * Check if character can take a move
 */
export function canTakeMove(
  move: Move,
  characterLevel: number,
  characterClass: string,
  knownMoves: string[],
): boolean {
  // Check level requirement
  if (move.level && characterLevel < move.level) {
    return false
  }

  // Check class requirement
  if (move.requiresClass && characterClass !== move.requiresClass) {
    return false
  }

  // Check prerequisite move
  if (move.requiresMove && !knownMoves.includes(move.requiresMove)) {
    return false
  }

  // Check if this move replaces one they have
  if (move.replaces && !knownMoves.includes(move.replaces)) {
    return false
  }

  return true
}
