/**
 * Session management data models for Dungeon World
 */

import type { Attribute } from './Character'
import type { RollResult } from './Move'

// Types of rolls
export type RollType
  = | 'attribute' // Rolling + attribute
    | 'damage' // Rolling damage
    | 'custom' // Custom dice roll
    | 'move' // Rolling for a specific move

// Dice notation
export type DiceNotation
  = | '2d6'
    | '1d4'
    | '1d6'
    | '1d8'
    | '1d10'
    | '1d12'
    | '1d20'
    | 'custom'

// Single roll record
export interface Roll {
  id: string
  timestamp: Date
  type: RollType

  // Roll details
  dice: DiceNotation
  rolls: number[] // Individual die results
  modifier: number
  total: number

  // Context
  attribute?: Attribute
  moveName?: string
  description?: string

  // Result (for move rolls)
  result?: RollResult
}

// Session note
export interface Note {
  id: string
  timestamp: Date
  title?: string
  content: string
  tags: string[]
  pinned: boolean
}

// Session event (for tracking important moments)
export interface SessionEvent {
  id: string
  timestamp: Date
  type: 'xp_gained' | 'level_up' | 'bond_resolved' | 'death_save' | 'custom'
  description: string
  data?: unknown // Event-specific data
}

// Tracker for holds, forward, ongoing, etc.
export interface Tracker {
  id: string
  name: string
  type: 'hold' | 'forward' | 'ongoing' | 'counter' | 'custom'
  value: number
  max?: number
  source?: string // What created this tracker
  expires?: 'session' | 'scene' | 'manual'
  description?: string
}

// Complete session data
export interface Session {
  id: string
  startTime: Date
  endTime?: Date

  // Session content
  notes: Note[]
  rollHistory: Roll[]
  events: SessionEvent[]
  trackers: Tracker[]

  // Session bookmarks / timestamps
  bookmarks: {
    id: string
    timestamp: Date
    label: string
    description?: string
  }[]
}

// Utility functions

/**
 * Create a new session
 */
export function createNewSession(): Session {
  return {
    id: generateId(),
    startTime: new Date(),
    notes: [],
    rollHistory: [],
    events: [],
    trackers: [],
    bookmarks: [],
  }
}

/**
 * Add a roll to the session
 */
export function addRoll(
  session: Session,
  rollData: Omit <Roll, 'id' | 'timestamp'>,
): Session {
  const roll: Roll = {
    ...rollData,
    id: generateId(),
    timestamp: new Date(),
  }

  return {
    ...session,
    rollHistory: [roll, ...session.rollHistory], // Most recent first
  }
}

/**
 * Add a note to the session
 */
export function addNote(
  session: Session,
  noteData: Omit <Note, 'id' | 'timestamp' | 'pinned'>,
): Session {
  const note: Note = {
    ...noteData,
    id: generateId(),
    timestamp: new Date(),
    pinned: false,
  }

  return {
    ...session,
    notes: [note, ...session.notes],
  }
}

/**
 * Add an event to the session
 */
export function addEvent(
  session: Session,
  eventData: Omit <SessionEvent, 'id' | 'timestamp'>,
): Session {
  const event: SessionEvent = {
    ...eventData,
    id: generateId(),
    timestamp: new Date(),
  }

  return {
    ...session,
    events: [...session.events, event],
  }
}

/**
 * Add or update a tracker
 */
export function setTracker(
  session: Session,
  trackerData: Omit <Tracker, 'id'> & { id?: string },
): Session {
  const tracker: Tracker = {
    ...trackerData,
    id: trackerData.id || generateId(),
  }

  const existingIndex = session.trackers.findIndex(t => t.id === tracker.id)

  if (existingIndex >= 0) {
    // Update existing
    const newTrackers = [...session.trackers]
    newTrackers[existingIndex] = tracker
    return { ...session, trackers: newTrackers }
  }
  else {
    // Add new
    return { ...session, trackers: [...session.trackers, tracker] }
  }
}

/**
 * Remove a tracker
 */
export function removeTracker(session: Session, trackerId: string): Session {
  return {
    ...session,
    trackers: session.trackers.filter(t => t.id !== trackerId),
  }
}

/**
 * Roll dice with notation
 */
export function rollDice(notation: DiceNotation | string): {
  rolls: number[]
  total: number
} {
  const match = notation.match(/(\d+)d(\d+)/)
  if (!match) {
    return { rolls: [], total: 0 }
  }

  const count = Number.parseInt(match[1])
  const sides = Number.parseInt(match[2])
  const rolls: number[] = []

  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }

  return {
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0),
  }
}

/**
 * Format roll for display
 */
export function formatRoll(roll: Roll): string {
  const diceStr = roll.rolls.join(' + ')
  const modStr = roll.modifier !== 0 ? ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}` : ''
  return `${diceStr}${modStr} = ${roll.total}`
}

/**
 * Get recent rolls (last N)
 */
export function getRecentRolls(session: Session, count = 10): Roll[] {
  return session.rollHistory.slice(0, count)
}

/**
 * Get pinned notes
 */
export function getPinnedNotes(session: Session): Note[] {
  return session.notes.filter(note => note.pinned)
}

/**
 * Search notes by content or tags
 */
export function searchNotes(session: Session, query: string): Note[] {
  const lowerQuery = query.toLowerCase()
  return session.notes.filter(note =>
    note.content.toLowerCase().includes(lowerQuery)
    || (note.title && note.title.toLowerCase().includes(lowerQuery))
    || note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
  )
}

/**
 * Calculate session duration
 */
export function getSessionDuration(session: Session): number {
  const endTime = session.endTime || new Date()
  return endTime.getTime() - session.startTime.getTime()
}

/**
 * Format duration for display
 */
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
