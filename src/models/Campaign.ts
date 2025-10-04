/**
 * Campaign data models for Dungeon World player campaign management * Local-only, player-focused campaign tracking
 */

export interface Campaign {
  id: string
  name: string
  description?: string
  created: Date
  lastModified: Date

  // Campaign entities
  sessions: CampaignSession[]
  journal: JournalEntry[]
  npcs: NPC[]
  locations: Location[]

  // Player-specific campaign data
  playerNotes: string
  characterIds: string[] // Characters associated with this campaign
}

export interface CampaignSession {
  id: string
  title: string
  date: Date
  duration?: number // in minutes
  summary: string
  notes: string
  xpGained: number
  highlights: string[]
  challenges: string[]
  nextSession?: string // What to prepare for next time
}

export interface JournalEntry {
  id: string
  title: string
  content: string
  date: Date
  tags: string[]
  isImportant: boolean
  relatedSessionId?: string
  relatedNpcId?: string
  relatedLocationId?: string
}

export interface NPC {
  id: string
  name: string
  description: string
  role: string // "Merchant", "Quest Giver", "Villain", "Ally", etc.
  location?: string
  notes: string
  firstMet: Date
  lastSeen?: Date
  importance: 'low' | 'medium' | 'high'
  disposition: 'friendly' | 'neutral' | 'hostile' | 'unknown'
  secrets?: string[]
}

export interface Location {
  id: string
  name: string
  description: string
  type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other'
  discovered: Date
  visited: Date[]
  notes: string
  dangers?: string[]
  resources?: string[]
  connections?: string[] // IDs of connected locations
}

// Campaign creation helper
export function createCampaign(name: string, description?: string): Campaign {
  return {
    id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name,
    description,
    created: new Date(),
    lastModified: new Date(),
    sessions: [],
    journal: [],
    npcs: [],
    locations: [],
    playerNotes: '',
    characterIds: [],
  }
}

// Session creation helper
export function createSession(title: string, summary: string): CampaignSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    title,
    date: new Date(),
    summary,
    notes: '',
    xpGained: 0,
    highlights: [],
    challenges: [],
  }
}

// Journal entry creation helper
export function createJournalEntry(
  title: string,
  content: string,
): JournalEntry {
  return {
    id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    title,
    content,
    date: new Date(),
    tags: [],
    isImportant: false,
  }
}

// NPC creation helper
export function createNPC(
  name: string,
  description: string,
  role: string,
): NPC {
  return {
    id: `npc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name,
    description,
    role,
    notes: '',
    firstMet: new Date(),
    importance: 'medium',
    disposition: 'neutral',
  }
}

// Location creation helper
export function createLocation(
  name: string,
  description: string,
  type: Location['type'],
): Location {
  return {
    id: `location-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name,
    description,
    type,
    discovered: new Date(),
    visited: [new Date()],
    notes: '',
  }
}
