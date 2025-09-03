/**
 * Core condition and effect models for Dungeon World
 */

// The six core debilities in Dungeon World
export type DebilityType
  = | 'weak' // -1 to STR
    | 'shaky' // -1 to DEX
    | 'sick' // -1 to CON
    | 'stunned' // -1 to INT
    | 'confused' // -1 to WIS
    | 'scarred' // -1 to CHA

// Ongoing effect types
export type OngoingEffectType
  = | '+1 forward'
    | '-1 ongoing'
    | '+2 forward'
    | '-2 ongoing'
    | '+3 forward'
    | '-3 ongoing'
    | 'advantage'
    | 'disadvantage'
    | 'immune'
    | 'vulnerable'
    | 'resistant'

// Condition duration types
export type DurationType
  = | 'instant' // Immediate effect, no duration
    | 'until_end_of_turn' // Until end of current turn
    | 'until_end_of_scene' // Until end of current scene
    | 'until_rest' // Until next rest
    | 'until_dawn' // Until next dawn
    | 'permanent' // Permanent until removed
    | 'custom' // Custom duration with specific end time

// Condition source types
export type ConditionSource
  = | 'move' // From a character move
    | 'spell' // From a spell
    | 'item' // From an item or equipment
    | 'environment' // From environmental effects
    | 'npc' // From NPC actions
    | 'gm' // From GM decisions
    | 'manual' // Manually added

// Condition priority for stacking
export type ConditionPriority
  = | 'low' // Can be overridden by higher priority
    | 'normal' // Standard priority
    | 'high' // Overrides lower priority conditions
    | 'critical' // Cannot be overridden

// Base condition interface
export interface Condition {
  id: string
  characterId: string
  name: string
  description: string
  type: 'debility' | 'ongoing_effect' | 'temporary_condition'

  // Effect details
  debilityType?: DebilityType
  ongoingEffectType?: OngoingEffectType
  statModifiers?: Partial <Record<string, number>> // Generic stat modifiers

  // Duration and timing
  duration: DurationType
  startTime: Date
  endTime?: Date // For custom durations
  turnsRemaining?: number // For turn-based durations

  // Source and metadata
  source: ConditionSource
  sourceId?: string // ID of the move, spell, item, etc.
  priority: ConditionPriority

  // State
  isActive: boolean
  isResolved: boolean
  resolvedAt?: Date
  resolvedBy?: string // Character or GM who resolved it

  // Stacking and interactions
  canStack: boolean
  maxStacks?: number
  currentStacks: number

  // Visual and UI
  icon?: string
  color?: string
  category?: string

  // Notes and custom data
  notes?: string
  customData?: Record <string, unknown>

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// Debility-specific interface
export interface Debility extends Condition {
  type: 'debility'
  debilityType: DebilityType
  statModifiers: Record <DebilityType, number> // Maps debility to stat penalty
}

// Ongoing effect interface
export interface OngoingEffect extends Condition {
  type: 'ongoing_effect'
  ongoingEffectType: OngoingEffectType
  appliesTo: string[] // What actions / rolls this affects
  conditions?: string[] // When this effect applies
}

// Temporary condition interface
export interface TemporaryCondition extends Condition {
  type: 'temporary_condition'
  tempCategory: 'buff' | 'debuff' | 'neutral' // Renamed to avoid conflict with base category
  triggers?: string[] // What triggers this condition
  effects?: string[] // What effects this condition has
}

// Condition creation options
export interface CreateConditionOptions {
  characterId: string
  name: string
  description: string
  type: Condition['type']
  duration: DurationType
  source: ConditionSource
  sourceId?: string // ID of the move, spell, item, etc.
  priority?: ConditionPriority
  canStack?: boolean
  maxStacks?: number
  icon?: string
  color?: string
  category?: string
  notes?: string
  customData?: Record <string, unknown>

  // Type-specific options
  debilityType?: DebilityType
  ongoingEffectType?: OngoingEffectType
  appliesTo?: string[]
  conditions?: string[]
  tempCategory?: 'buff' | 'debuff' | 'neutral' // Renamed to avoid conflict
  triggers?: string[]
  effects?: string[]
  statModifiers?: Record<string, number>

  // Duration options
  endTime?: Date
  turnsRemaining?: number
}

// Condition filter options
export interface ConditionFilter {
  characterId?: string
  type?: Condition['type']
  isActive?: boolean
  isResolved?: boolean
  source?: ConditionSource
  priority?: ConditionPriority
  category?: string
  debilityType?: DebilityType
  ongoingEffectType?: OngoingEffectType
}

// Condition statistics
export interface ConditionStats {
  totalConditions: number
  activeConditions: number
  resolvedConditions: number
  debilities: number
  ongoingEffects: number
  temporaryConditions: number
  bySource: Record <ConditionSource, number>
  byPriority: Record <ConditionPriority, number>
  byType: Record <Condition['type'], number>
}

// Condition calculation result
export interface ConditionCalculation {
  characterId: string
  statModifiers: Record<string, number>
  activeEffects: OngoingEffect[]
  activeDebilities: Debility[]
  activeConditions: TemporaryCondition[]
  totalModifiers: Record<string, number>
}

// Condition notification
export interface ConditionNotification {
  id: string
  conditionId: string
  characterId: string
  type: 'expiring' | 'expired' | 'stack_limit' | 'conflict' | 'reminder'
  message: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}
