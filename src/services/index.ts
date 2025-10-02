/**
 * Services Index for ZimboMate V2
 * Centralized exports for all game services
 */

export { AdvancementService, advancementService } from './AdvancementService'
export type {
  // Advancement types
  AdvancementOption,
  LevelUpResult,
  XPEntry,
  XPSource,
} from './AdvancementService'
export { CampaignService, campaignService } from './CampaignService'
export { CharacterStateService, characterStateService } from './CharacterStateService'
export type {
  BondState,
  // Character State types
  CharacterState,
  Condition,
  ConditionEffect,
  EquipmentModifier,
  EquipmentState,
  ForwardModifier,
  OngoingModifier,
  ResourceTracker,
} from './CharacterStateService'
export { DiceModifierService, diceModifierService } from './DiceModifierService'
export type {
  ActiveModifier,
  // Dice Modifier types
  ModifierSource,
  ModifierStack,
  RollModifierContext,
} from './DiceModifierService'

// Core game services
export { DiceRollingService, diceRollingService } from './DiceRollingService'
// Type exports for external use
export type {
  DiceExpression,
  DiceRoll,
  // Dice Rolling types
  DiceType,
  EnhancedDiceRoll,
  ModifierBreakdown,
  RollModifiers,
  RollOptions,
  RollTemplate,
  RollType,
} from './DiceRollingService'
export { EquipmentManagementService, equipmentManagementService } from './EquipmentManagementService'

export type {
  // Equipment Management types
  EquipmentSet,
} from './EquipmentManagementService'

// Phase 4C Desktop Power Features
export { KeyboardShortcutsService, keyboardShortcutsService } from './KeyboardShortcutsService'

export type {
  // Keyboard Shortcuts types
  KeyboardShortcut,
  ShortcutCategory,
} from './KeyboardShortcutsService'

export { MoveCompendiumService, moveCompendiumService } from './MoveCompendiumService'

export type {
  CompendiumMove,
  MoveComparison,
  MoveSearchOptions,
  // Move Compendium types
  MoveType,
  MoveUsageStats,
  MoveValidation,
  PrerequisiteCheck,
} from './MoveCompendiumService'

export { SpellCastingService, spellCastingService } from './SpellCastingService'

export type {
  CastingTier,
  // Spell Casting types
  ServiceSpell,
  SevenToNineConsequence,
  SpellCastingResult,
  SpellClass,
} from './SpellCastingService'

export { XPIntegrationService, xpIntegrationService } from './XPIntegrationService'

export type {
  XPAnalytics,
  XPEntry as XPIntegrationEntry,
  // XP Integration types
  XPSource as XPIntegrationSource,
  XPNotification,
} from './XPIntegrationService'
