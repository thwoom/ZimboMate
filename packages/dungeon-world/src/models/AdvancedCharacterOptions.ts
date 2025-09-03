/**
 * Advanced character options for Dungeon World * Includes compendium classes, race moves, and multiclass support
 */

import type { Attribute, CharacterClass, Race } from './Character'

// Compendium Class-Advanced character options from supplements
export interface CompendiumClass {
  id: string
  name: string
  description: string
  source: string // Which supplement / book this comes from
  page?: number

  // Requirements to take this compendium class
  requirements: {
    level: number // Minimum level required
    class?: CharacterClass[] // Required base class(es)
    race?: Race[] // Required race(s)
    moves?: string[] // Required moves
    attributes?: Partial <Record <Attribute, number>> // Required attribute minimums
    narrative?: string // Narrative requirements (e.g., "Must have been to the Underworld")
  }

  // What this compendium class provides
  benefits: {
    moves: string[] // Move IDs this class provides
    startingEquipment?: unknown[] // Starting equipment
    attributeBonuses?: Partial <Record <Attribute, number>> // Attribute bonuses
    specialAbilities?: string[] // Special abilities
  }

  // Advancement options
  advancement?: {
    level2?: string[] // Available moves at level 2
    level3?: string[]
    level4?: string[]
    level5?: string[]
    level6?: string[]
    level7?: string[]
    level8?: string[]
    level9?: string[]
    level10?: string[]
  }

  // Conflicts with other options
  conflicts?: {
    classes?: CharacterClass[] // Classes this conflicts with
    compendiumClasses?: string[] // Other compendium classes this conflicts with
    moves?: string[] // Moves this conflicts with
  }
}

// Race Move-Special abilities based on character race
export interface RaceMove {
  id: string
  name: string
  description: string
  race: Race
  source: string
  page?: number

  // Requirements
  requirements?: {
    level?: number
    attributes?: Partial <Record <Attribute, number>>
    narrative?: string
  }

  // What this race move provides
  benefits: {
    moveId?: string // Associated move ID
    attributeBonuses?: Partial <Record <Attribute, number>>
    specialAbilities?: string[]
    equipment?: unknown[]
  }

  // Conflicts
  conflicts?: {
    classes?: CharacterClass[]
    compendiumClasses?: string[]
    otherRaceMoves?: string[]
  }
}

// Multiclass Configuration
export interface MulticlassConfig {
  primaryClass: CharacterClass
  secondaryClass: CharacterClass

  // How multiclassing works
  rules: {
    levelRequirement: number // When multiclassing becomes available
    moveSelection: 'pick' | 'all' | 'choice' // How moves are selected
    maxMovesFromSecondary: number // Maximum moves from secondary class
    attributeRequirements?: Partial <Record <Attribute, number>>
  }

  // Available moves from secondary class
  availableMoves: string[]

  // Restrictions
  restrictions?: {
    incompatibleMoves?: string[]
    levelRestrictions?: Record <number, string[]> // Moves available at specific levels
  }
}

// Advanced Character Template
export interface AdvancedCharacterTemplate {
  id: string
  name: string
  description: string
  level: number

  // Base character setup
  base: {
    class: CharacterClass
    race: Race
    attributes: Partial <Record <Attribute, number>>
    startingMoves: string[]
    startingEquipment: unknown[]
  }

  // Advanced options
  advanced: {
    compendiumClasses?: string[] // Compendium class IDs
    raceMoves?: string[] // Race move IDs
    multiclass?: MulticlassConfig
    customMoves?: string[] // Custom move IDs
  }

  // Narrative elements
  narrative: {
    background: string
    personalityTraits: string[]
    bonds: string[]
    alignment: string
  }

  // Metadata
  tags: string[] // For categorization and search
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedPlaytime?: string // How long this character takes to play effectively
}

// Utility types
export type AdvancedOptionType = 'compendium-class' | 'race-move' | 'multiclass' | 'custom-move'

export interface AdvancedOption {
  type: AdvancedOptionType
  id: string
  name: string
  description: string
  requirements: unknown
  benefits: unknown
  conflicts?: unknown
}

// Validation result for advanced options
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  conflicts: string[]
}

// Character with advanced options
export interface AdvancedCharacter {
  // Standard character fields (from Character interface)
  id: string
  name: string
  class: CharacterClass
  race: Race
  level: number
  // ... other standard fields

  // Advanced options
  compendiumClasses: string[] // Compendium class IDs
  raceMoves: string[] // Race move IDs
  multiclassConfig?: MulticlassConfig
  customMoves: string[] // Custom move IDs

  // Validation state
  validation: ValidationResult
}
