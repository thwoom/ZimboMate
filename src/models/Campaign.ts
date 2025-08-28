/**
 * Campaign and world data models for Dungeon World
 */

// NPC importance levels
export type NPCImportance = 
  | 'major'      // Key campaign NPCs
  | 'recurring'  // Appears multiple times
  | 'minor'      // One-off or background
  | 'deceased';  // No longer active

// NPC interface
export interface NPC {
  id: string;
  name: string;
  description: string;
  occupation?: string;
  location?: string;
  importance: NPCImportance;
  
  // Relationships
  faction?: string;
  relationships: {
    characterId?: string; // PC relationship
    npcId?: string; // NPC relationship
    type: string; // "ally", "enemy", "neutral", etc.
    description: string;
  }[];
  
  // Game stats (if needed)
  stats?: {
    hp?: number;
    armor?: number;
    damage?: string;
    moves?: string[];
  };
  
  // Notes and history
  notes: string[];
  firstMet?: Date;
  lastSeen?: Date;
  
  // Visual/audio
  appearance?: string;
  voice?: string;
  mannerisms?: string;
  
  tags: string[];
}

// Location types
export type LocationType = 
  | 'settlement'  // Town, city, village
  | 'dungeon'     // Dangerous underground
  | 'wilderness'  // Natural areas
  | 'landmark'    // Notable features
  | 'building'    // Specific structures
  | 'region';     // Large areas

// Location interface
export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  parent?: string; // Parent location ID
  
  // Mechanical aspects
  dangers: string[];
  treasures: string[];
  resources: string[];
  
  // NPCs present
  npcIds: string[];
  
  // Connections
  connectedLocations: {
    locationId: string;
    description: string; // How to get there
    travelTime?: string;
    dangers?: string[];
  }[];
  
  // Discovery
  discovered: boolean;
  visitCount: number;
  firstVisited?: Date;
  lastVisited?: Date;
  
  // Custom moves
  customMoves?: string[];
  
  // Notes
  notes: string[];
  secrets: string[]; // Hidden information
  
  tags: string[];
}

// Front types (campaign threats)
export type FrontType = 
  | 'ambitious_organization'
  | 'arcane_enemy'
  | 'barbaric_hordes'
  | 'corrupt_government'
  | 'cursed_place'
  | 'elemental_force'
  | 'hordes'
  | 'planar_force';

// Danger types within fronts
export type DangerType = 
  | 'ambitious_organization'
  | 'arcane_enemy'
  | 'brute'
  | 'criminal'
  | 'cursed_place'
  | 'disease'
  | 'elemental_force'
  | 'god'
  | 'horde'
  | 'monster';

// Front interface
export interface Front {
  id: string;
  name: string;
  type: FrontType;
  description: string;
  active: boolean;
  
  // Dangers within the front
  dangers: Danger[];
  
  // Cast (NPCs involved)
  castIds: string[];
  
  // Stakes (questions about what might happen)
  stakes: string[];
  
  // Doom clock
  doomClock: {
    name: string;
    segments: string[]; // What happens at each stage
    current: number; // Current position (0 = not started)
  };
  
  notes: string[];
  createdAt: Date;
}

// Danger within a front
export interface Danger {
  id: string;
  name: string;
  type: DangerType;
  impulse: string; // What drives this danger
  
  // Grim portents (signs of advancing doom)
  grimPortents: {
    description: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  
  // Impending doom
  impendingDoom: string;
  
  // Associated NPCs/Locations
  npcIds: string[];
  locationIds: string[];
  
  // Custom moves
  customMoves?: string[];
}

// Faction interface
export interface Faction {
  id: string;
  name: string;
  description: string;
  goals: string[];
  resources: string[];
  
  // Relationships with other factions
  relationships: {
    factionId: string;
    standing: 'allied' | 'friendly' | 'neutral' | 'hostile' | 'war';
    description: string;
  }[];
  
  // Members
  leaderIds: string[]; // NPC IDs
  memberIds: string[]; // NPC IDs
  
  // Locations
  headquartersId?: string;
  territoryIds: string[];
  
  // Power and influence
  power: 'weak' | 'moderate' | 'strong' | 'dominant';
  influence: 'local' | 'regional' | 'national' | 'global';
  
  notes: string[];
  tags: string[];
}

// Custom tags for organization
export interface CustomTag {
  id: string;
  name: string;
  color: string;
  category: 'npc' | 'location' | 'item' | 'general';
  description?: string;
}

// Complete campaign data
export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  
  // World building
  npcs: Record<string, NPC>;
  locations: Record<string, Location>;
  factions: Record<string, Faction>;
  fronts: Front[];
  
  // Organization
  customTags: CustomTag[];
  
  // Session tracking
  sessionCount: number;
  lastSessionDate?: Date;
  
  // Campaign-specific rules
  customRules?: string[];
  houseMoves?: string[];
  
  // Notes and planning
  gmNotes: string[];
  playerNotes: string[];
  
  // World details
  worldName?: string;
  currentDate?: string; // In-game date
  calendar?: string; // Calendar system description
}

// Utility functions

/**
 * Create a new campaign
 */
export function createNewCampaign(name: string, description: string): Campaign {
  return {
    id: generateId(),
    name,
    description,
    startDate: new Date(),
    npcs: {},
    locations: {},
    factions: {},
    fronts: [],
    customTags: [],
    sessionCount: 0,
    gmNotes: [],
    playerNotes: []
  };
}

/**
 * Add NPC to campaign
 */
export function addNPC(campaign: Campaign, npc: Omit<NPC, 'id'>): Campaign {
  const id = generateId();
  return {
    ...campaign,
    npcs: {
      ...campaign.npcs,
      [id]: { ...npc, id }
    }
  };
}

/**
 * Add location to campaign
 */
export function addLocation(campaign: Campaign, location: Omit<Location, 'id'>): Campaign {
  const id = generateId();
  return {
    ...campaign,
    locations: {
      ...campaign.locations,
      [id]: { ...location, id }
    }
  };
}

/**
 * Get NPCs at a location
 */
export function getNPCsAtLocation(campaign: Campaign, locationId: string): NPC[] {
  const location = campaign.locations[locationId];
  if (!location) return [];
  
  return location.npcIds
    .map(id => campaign.npcs[id])
    .filter((npc): npc is NPC => npc !== undefined);
}

/**
 * Get faction members
 */
export function getFactionMembers(campaign: Campaign, factionId: string): NPC[] {
  const faction = campaign.factions[factionId];
  if (!faction) return [];
  
  const allMemberIds = [...faction.leaderIds, ...faction.memberIds];
  return allMemberIds
    .map(id => campaign.npcs[id])
    .filter((npc): npc is NPC => npc !== undefined);
}

/**
 * Advance doom clock
 */
export function advanceDoomClock(front: Front): Front {
  if (front.doomClock.current >= front.doomClock.segments.length) {
    return front; // Already at maximum doom
  }
  
  return {
    ...front,
    doomClock: {
      ...front.doomClock,
      current: front.doomClock.current + 1
    }
  };
}

/**
 * Mark grim portent as completed
 */
export function completeGrimPortent(
  danger: Danger,
  portentIndex: number
): Danger {
  return {
    ...danger,
    grimPortents: danger.grimPortents.map((portent, index) =>
      index === portentIndex
        ? { ...portent, completed: true, completedAt: new Date() }
        : portent
    )
  };
}

/**
 * Search campaign content
 */
export function searchCampaign(
  campaign: Campaign,
  query: string
): {
  npcs: NPC[];
  locations: Location[];
  factions: Faction[];
} {
  const lowerQuery = query.toLowerCase();
  
  const npcs = Object.values(campaign.npcs).filter(npc =>
    npc.name.toLowerCase().includes(lowerQuery) ||
    npc.description.toLowerCase().includes(lowerQuery) ||
    npc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
  
  const locations = Object.values(campaign.locations).filter(location =>
    location.name.toLowerCase().includes(lowerQuery) ||
    location.description.toLowerCase().includes(lowerQuery) ||
    location.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
  
  const factions = Object.values(campaign.factions).filter(faction =>
    faction.name.toLowerCase().includes(lowerQuery) ||
    faction.description.toLowerCase().includes(lowerQuery) ||
    faction.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
  
  return { npcs, locations, factions };
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
