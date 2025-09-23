/**
 * Hooks Index for ZimboMate V2
 * Centralized exports for all custom React hooks
 * Complete V1→V2 parity achieved through comprehensive hook layer
 */

// Character Management Hooks
export { useCharacter, useCharacters } from './useCharacter'
export { useActiveCharacter, useCharacterSwitcher } from './useActiveCharacter'
export { useCharacterStats, useStatModifiers } from './useCharacterStats'
export { useCharacterHealth, useSimpleHealth } from './useCharacterHealth'

// Game Mechanics Hooks
export { useDiceRoll, useSimpleDiceRoll } from './useDiceRoll'
export { useMove } from './useMove'
export { useEquipment } from './useEquipment'
export { useSpells } from './useSpells'

// Session and Campaign Hooks
export { useSession, useSimpleSession } from './useSession'
export { useCampaign, useSimpleCampaign } from './useCampaign'
export { useGameState, useSimpleGameState } from './useGameState'

// UI Enhancement Hooks
export { useAnimations } from './useAnimations'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'

// Type exports for external use
export type {
  // Character hooks types
  UseCharacterReturn,
  UseActiveCharacterReturn,
  StatWithModifiers,
  UseCharacterStatsReturn,
  HealthStatus,
  DamageResult,
  HealingResult,
  UseCharacterHealthReturn,
} from './useCharacter'

export type {
  // Game mechanics types
  RollRequest,
  RollResult,
  UseDiceRollReturn,
  MoveExecutionContext,
  MoveExecutionResult,
  UseMoveReturn,
  EquipmentWithState,
  LoadCalculation,
  DragDropContext,
  UseEquipmentReturn,
  PreparedSpell,
  SpellSlot,
  CastingResult,
  UseSpellsReturn,
} from './useDiceRoll'

export type {
  // Session and campaign types
  SessionStats,
  CombatTurn,
  UseSessionReturn,
  CampaignCharacter,
  CampaignStats,
  UseCampaignReturn,
  TimeOfDay,
  Weather,
  Environment,
  UseGameStateReturn,
} from './useSession'

export type {
  // UI enhancement types
  AnimationPreferences,
  ParticleConfig,
  StaggerConfig,
  UseAnimationsReturn,
  ShortcutAction,
  ShortcutCategory,
  UseKeyboardShortcutsReturn,
} from './useAnimations'