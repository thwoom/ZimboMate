/**
 * Stores Index for ZimboMate V2
 * Centralized exports for all Zustand stores
 */

export type {
  // Campaign Store types
  Campaign,
  CampaignSession,
  JournalEntry,
  Location,
  NPC,
} from '../models/Campaign'
// Type exports for external use
export type {
  // Character Store types
  Character,
} from '../models/Character'
export { useCampaignStore } from './campaignStore'
export { useCharacterStore } from './characterStore'
export { useGameStateStore } from './gameStateStore'
export type {
  GameTime,
  // Game State Store types - these would be defined in gameStateStore.ts
  GlobalEffect,
  PartyResource,
} from './gameStateStore'

export { useInventoryStore } from './inventoryStore'

export { useSessionStore } from './sessionStore'
export { useSecretaryStore } from './secretaryStore'

export type {
  CombatState,
  // Session Store types - these would be defined in sessionStore.ts
  GameSession,
} from './sessionStore'

// Core stores
export { useThemeStore } from './themeStore'
