/**
 * Stores Index for ZimboMate V2
 * Centralized exports for all Zustand stores
 */

// Core stores
export { useThemeStore } from './themeStore'
export { useInventoryStore } from './inventoryStore'
export { useCharacterStore } from './characterStore'
export { useSessionStore } from './sessionStore'
export { useCampaignStore } from './campaignStore'
export { useGameStateStore } from './gameStateStore'

// Type exports for external use
export type {
  // Character Store types
  Character,
} from '../models/Character'

export type {
  // Campaign Store types
  Campaign,
  CampaignSession,
  JournalEntry,
  NPC,
  Location,
} from '../models/Campaign'

export type {
  // Session Store types - these would be defined in sessionStore.ts
  GameSession,
  CombatState,
} from './sessionStore'

export type {
  // Game State Store types - these would be defined in gameStateStore.ts
  GlobalEffect,
  GameTime,
  PartyResource,
} from './gameStateStore'