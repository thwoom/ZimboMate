// Mock data for Campaign Management System

// Campaign-related enums for the Campaign Management System
export enum LocationType {
  CITY = 'city',
  TOWN = 'town',
  VILLAGE = 'village',
  DUNGEON = 'dungeon',
  WILDERNESS = 'wilderness',
  OTHER = 'other',
}

export enum NPCImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum NPCDisposition {
  FRIENDLY = 'friendly',
  NEUTRAL = 'neutral',
  HOSTILE = 'hostile',
  UNKNOWN = 'unknown',
}

export enum CampaignSortBy {
  DATE_CREATED = 'dateCreated',
  DATE_MODIFIED = 'dateModified',
  NAME = 'name',
  SESSIONS_COUNT = 'sessionsCount',
}

export enum SessionSortBy {
  DATE = 'date',
  XP_GAINED = 'xpGained',
  DURATION = 'duration',
  TITLE = 'title',
}

export enum JournalSortBy {
  DATE = 'date',
  IMPORTANCE = 'importance',
  TITLE = 'title',
  TAGS = 'tags',
}

// String formatting functions for Campaign Management System
export function toDate(input: Date | string | number | null | undefined): Date {
  if (input instanceof Date) {
    return input
  }

  if (typeof input === 'number' || typeof input === 'string') {
    const parsed = new Date(input)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }

  return new Date()
}
export function formatCampaignDuration(created: Date | string | number): string {
  const createdDate = toDate(created)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1)
    return '1 day'
  if (diffDays < 30)
    return `${diffDays} days`
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
}

export function formatSessionDuration(duration?: number): string {
  if (!duration)
    return 'Unknown duration'

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  if (hours === 0)
    return `${minutes}m`
  if (minutes === 0)
    return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatXPTotal(xp: number): string {
  if (xp === 0)
    return 'No XP'
  if (xp === 1)
    return '1 XP'
  return `${xp} XP`
}

export function formatDateRelative(date: Date | string | number): string {
  const d = toDate(date)
  const now = new Date()
  const diffTime = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0)
    return 'Today'
  if (diffDays === 1)
    return 'Yesterday'
  if (diffDays < 7)
    return `${diffDays} days ago`
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function formatNPCDisposition(disposition: NPCDisposition): string {
  switch (disposition) {
    case NPCDisposition.FRIENDLY: return 'Friendly'
    case NPCDisposition.NEUTRAL: return 'Neutral'
    case NPCDisposition.HOSTILE: return 'Hostile'
    case NPCDisposition.UNKNOWN: return 'Unknown'
    default: return 'Unknown'
  }
}

export function formatLocationType(type: LocationType): string {
  switch (type) {
    case LocationType.CITY: return 'City'
    case LocationType.TOWN: return 'Town'
    case LocationType.VILLAGE: return 'Village'
    case LocationType.DUNGEON: return 'Dungeon'
    case LocationType.WILDERNESS: return 'Wilderness'
    case LocationType.OTHER: return 'Other'
    default: return 'Unknown'
  }
}

// Mock campaigns data
export const mockCampaigns = [
  {
    id: 'campaign-1',
    name: 'The Sundered Realm',
    description: 'A tale of political intrigue and ancient magic in the borderlands of Kaeroth',
    created: new Date('2024-01-15'),
    lastModified: new Date('2024-12-18'),
    playerNotes: 'Remember to investigate the mysterious cult activities in the capital',
    characterIds: ['char-1', 'char-2'],
    sessions: [
      {
        id: 'session-1',
        title: 'The Tavern Meeting',
        date: new Date('2024-01-20'),
        duration: 180,
        summary: 'The party met in the Silver Flagon and received their first quest',
        notes: 'Great roleplay between characters, established party dynamics',
        xpGained: 2,
        highlights: ['Epic bar fight', 'Mysterious hooded figure'],
        challenges: ['Combat took too long', 'Need better NPC voices'],
        nextSession: 'Travel to the ancient ruins, prepare dungeon maps',
      },
      {
        id: 'session-2',
        title: 'The Ancient Ruins',
        date: new Date('2024-02-03'),
        duration: 240,
        summary: 'Explored the cursed temple and discovered the first artifact',
        notes: 'Players loved the puzzle mechanics, great atmosphere',
        xpGained: 3,
        highlights: ['Clever puzzle solution', 'Dramatic artifact reveal'],
        challenges: ['Lighting mechanics unclear', 'Need more trap variety'],
      },
    ],
    journal: [
      {
        id: 'journal-1',
        title: 'The Cult of the Void',
        content: 'Strange reports of missing villagers and dark rituals in the northern provinces. The cult seems to be seeking ancient artifacts.',
        date: new Date('2024-01-22'),
        tags: ['cult', 'mystery', 'artifacts'],
        isImportant: true,
        relatedSessionId: 'session-1',
      },
      {
        id: 'journal-2',
        title: 'The Crystal of Valdris',
        content: 'First artifact discovered - a glowing crystal that seems to resonate with magical energy. May be connected to the old kingdom.',
        date: new Date('2024-02-03'),
        tags: ['artifacts', 'magic', 'kingdom'],
        isImportant: true,
        relatedSessionId: 'session-2',
      },
    ],
    npcs: [
      {
        id: 'npc-1',
        name: 'Gareth the Innkeeper',
        description: 'A burly man with kind eyes and a mysterious past',
        role: 'Quest Giver',
        location: 'Millhaven',
        notes: 'Former soldier, knows more than he lets on',
        firstMet: new Date('2024-01-20'),
        lastSeen: new Date('2024-01-20'),
        importance: NPCImportance.MEDIUM,
        disposition: NPCDisposition.FRIENDLY,
        secrets: ['Was part of the royal guard', 'Knows about the cult'],
      },
      {
        id: 'npc-2',
        name: 'Lady Morwyn',
        description: 'Elegant noble with piercing blue eyes and silver hair',
        role: 'Patron',
        location: 'Capital City',
        notes: 'Hired the party for the artifact quest',
        firstMet: new Date('2024-01-20'),
        importance: NPCImportance.HIGH,
        disposition: NPCDisposition.NEUTRAL,
        secrets: ['Connected to the royal family', 'Has her own agenda'],
      },
    ],
    locations: [
      {
        id: 'location-1',
        name: 'Millhaven',
        description: 'A small trading town at the crossroads of major merchant routes',
        type: LocationType.TOWN,
        discovered: new Date('2024-01-20'),
        visited: [new Date('2024-01-20')],
        notes: 'Friendly people, good supplies, safe place to rest',
        resources: ['Inn', 'Blacksmith', 'General Store'],
        connections: ['location-2'],
      },
      {
        id: 'location-2',
        name: 'Temple of the Forgotten',
        description: 'Ancient ruins covered in mysterious runes and dark energy',
        type: LocationType.DUNGEON,
        discovered: new Date('2024-02-03'),
        visited: [new Date('2024-02-03')],
        notes: 'Dangerous but contains valuable artifacts',
        dangers: ['Cursed traps', 'Undead guardians', 'Unstable magic'],
        resources: ['Ancient artifacts', 'Magical components'],
        connections: ['location-1'],
      },
    ],
  },
  {
    id: 'campaign-2',
    name: 'Seas of Adventure',
    description: 'Pirate adventures on the high seas',
    created: new Date('2024-03-01'),
    lastModified: new Date('2024-12-15'),
    playerNotes: 'Focus on naval combat and exploration',
    characterIds: ['char-3'],
    sessions: [],
    journal: [],
    npcs: [],
    locations: [],
  },
] as const

// Mock campaign statistics
export const mockCampaignStats = {
  'campaign-1': {
    totalSessions: 2,
    totalJournalEntries: 2,
    totalNPCs: 2,
    totalLocations: 2,
    totalXP: 5,
    averageSessionLength: 210,
  },
  'campaign-2': {
    totalSessions: 0,
    totalJournalEntries: 0,
    totalNPCs: 0,
    totalLocations: 0,
    totalXP: 0,
    averageSessionLength: 0,
  },
} as const

// Root props for the campaign management system
export const mockRootProps = {
  initialCampaignId: 'campaign-1',
  showCreateCampaignModal: false,
  enableAdvancedFeatures: true,
}

// Initialize the campaign store with mock data
export function initializeMockCampaigns() {
  // This function can be called to populate the store with mock data
  // It's mainly for development/demo purposes
  return mockCampaigns
}
