/**
 * Services Index for ZimboMate V2
 * Centralized exports for all game services
 */

// Core game services
export { DiceRollingService, diceRollingService } from './DiceRollingService'
export { CharacterStateService, characterStateService } from './CharacterStateService'
export { CampaignService, campaignService } from './CampaignService'
export { EquipmentManagementService, equipmentManagementService } from './EquipmentManagementService'
export { MoveCompendiumService, moveCompendiumService } from './MoveCompendiumService'
export { SpellCastingService, spellCastingService } from './SpellCastingService'
export { AdvancementService, advancementService } from './AdvancementService'

// Phase 4C Desktop Power Features
export { KeyboardShortcutsService, keyboardShortcutsService } from './KeyboardShortcutsService'
export { XPIntegrationService, xpIntegrationService } from './XPIntegrationService'
export { DiceModifierService, diceModifierService } from './DiceModifierService'

// Type exports for external use
export type {
  // Dice Rolling types
  DiceType,
  RollType,
  DiceExpression,
  EnhancedDiceRoll,
  DiceRoll,
  ModifierBreakdown,
  RollModifiers,
  RollOptions,
  RollTemplate,
} from './DiceRollingService'

export type {
  // Character State types
  CharacterState,
  Condition,
  ConditionEffect,
  OngoingModifier,
  ForwardModifier,
  ResourceTracker,
  BondState,
  EquipmentState,
  EquipmentModifier,
} from './CharacterStateService'

export type {
  // Equipment Management types
  EquipmentSet,
} from './EquipmentManagementService'

export type {
  // Move Compendium types
  MoveType,
  CompendiumMove,
  MoveSearchOptions,
  MoveComparison,
  MoveUsageStats,
  MoveValidation,
  PrerequisiteCheck,
} from './MoveCompendiumService'

export type {
  // Spell Casting types
  ServiceSpell,
  SpellClass,
  CastingTier,
  SpellCastingResult,
  SevenToNineConsequence,
} from './SpellCastingService'

export type {
  // Advancement types
  AdvancementOption,
  LevelUpResult,
  XPSource,
  XPEntry,
} from './AdvancementService'

export type {
  // Keyboard Shortcuts types
  KeyboardShortcut,
  ShortcutCategory,
} from './KeyboardShortcutsService'

export type {
  // XP Integration types
  XPSource as XPIntegrationSource,
  XPEntry as XPIntegrationEntry,
  XPNotification,
  XPAnalytics,
} from './XPIntegrationService'

export type {
  // Dice Modifier types
  ModifierSource,
  ActiveModifier,
  ModifierStack,
  RollModifierContext,
} from './DiceModifierService'