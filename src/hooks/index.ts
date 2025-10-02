/**
 * Hooks Index for ZimboMate V2
 * Centralized exports for all custom React hooks
 * Complete V1→V2 parity achieved through comprehensive hook layer
 */

export { useActiveCharacter, useCharacterSwitcher } from './useActiveCharacter'
// UI Enhancement Hooks
export { useAnimations } from './useAnimations'
export type {
  // UI enhancement types
  AnimationPreferences,
  ParticleConfig,
  ShortcutAction,
  ShortcutCategory,
  StaggerConfig,
  UseAnimationsReturn,
  UseKeyboardShortcutsReturn,
} from './useAnimations'
export { useCampaign, useSimpleCampaign } from './useCampaign'

// Character Management Hooks
export { useCharacter, useCharacters } from './useCharacter'
// Type exports for external use
export type {
  DamageResult,
  HealingResult,
  HealthStatus,
  StatWithModifiers,
  UseActiveCharacterReturn,
  UseCharacterHealthReturn,
  // Character hooks types
  UseCharacterReturn,
  UseCharacterStatsReturn,
} from './useCharacter'
export { useCharacterHealth, useSimpleHealth } from './useCharacterHealth'
export { useCharacterStats, useStatModifiers } from './useCharacterStats'

// Game Mechanics Hooks
export { useDiceRoll, useSimpleDiceRoll } from './useDiceRoll'
export type {
  CastingResult,
  DragDropContext,
  EquipmentWithState,
  LoadCalculation,
  MoveExecutionContext,
  MoveExecutionResult,
  PreparedSpell,
  // Game mechanics types
  RollRequest,
  RollResult,
  SpellSlot,
  UseDiceRollReturn,
  UseEquipmentReturn,
  UseMoveReturn,
  UseSpellsReturn,
} from './useDiceRoll'
export { useEquipment } from './useEquipment'

export { useGameState, useSimpleGameState } from './useGameState'
export { useKeyboardShortcuts } from './useKeyboardShortcuts'

export { useMove } from './useMove'

// Session and Campaign Hooks
export { useSession, useSimpleSession } from './useSession'

export type {
  CampaignCharacter,
  CampaignStats,
  CombatTurn,
  Environment,
  // Session and campaign types
  SessionStats,
  TimeOfDay,
  UseCampaignReturn,
  UseGameStateReturn,
  UseSessionReturn,
  Weather,
} from './useSession'

export { useSpells } from './useSpells'
