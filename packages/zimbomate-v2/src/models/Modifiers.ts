/**
 * Temporary modifiers system for Dungeon World
 */

import type { Attribute } from './Character'

// Types of temporary modifiers
export type ModifierType
  = | 'forward' // +1 to next roll
    | 'ongoing' // +1 to all rolls until condition ends
    | 'hold' // Spend hold for specific effects
    | 'penalty' // Negative modifier
    | 'custom' // Custom modifier

// What the modifier applies to
export type ModifierTarget
  = | 'next-roll' // Only the next roll
    | 'specific-move' // A specific move
    | 'specific-attribute' // Rolls with a specific attribute
    | 'all-rolls' // All rolls
    | 'damage' // Damage rolls
    | 'armor' // Armor value
    | 'load' // Load capacity

// When the modifier expires
export type ModifierExpiry
  = | 'used' // After being used once
    | 'scene' // End of scene
    | 'session' // End of session
    | 'time' // After specific time
    | 'condition' // When a condition is met
    | 'hold' // Hold-based expiry
    | 'manual' // Manually removed

// Temporary modifier interface
export interface TemporaryModifier {
  id: string
  name: string
  type: ModifierType
  value: number // Can be negative for penalties
  source: string // What created this modifier (move name, item, etc.)
  target: ModifierTarget

  // Optional target specifics
  targetMove?: string // For specific-move target
  targetAttribute?: Attribute // For specific-attribute target

  // Expiry conditions
  expiry: ModifierExpiry
  expiryTime?: Date // For time-based expiry
  expiryCondition?: string // Description of condition

  // Hold-specific
  remaining?: number // For hold type
  holdOptions?: string[] // What the hold can be spent on

  // Metadata
  createdAt: Date
  active: boolean
}

// Collection of modifiers
export interface ModifierSet {
  modifiers: TemporaryModifier[]
  lastUpdated: Date
}

// Common modifier templates
export const COMMON_MODIFIERS = {
  aid: (source: string): Partial <TemporaryModifier> => ({
    name: 'Aid',
    type: 'forward',
    value: 1,
    source,
    target: 'next-roll',
    expiry: 'used',
  }),

  interfere: (source: string): Partial <TemporaryModifier> => ({
    name: 'Interfere',
    type: 'forward',
    value: -2,
    source,
    target: 'next-roll',
    expiry: 'used',
  }),

  bless: (source: string): Partial <TemporaryModifier> => ({
    name: 'Blessed',
    type: 'ongoing',
    value: 1,
    source,
    target: 'all-rolls',
    expiry: 'scene',
  }),

  defend: (holdAmount: number): Partial <TemporaryModifier> => ({
    name: 'Defend',
    type: 'hold',
    value: holdAmount,
    source: 'Defend move',
    target: 'specific-move',
    targetMove: 'defend',
    remaining: holdAmount,
    holdOptions: [
      'Redirect an attack to yourself',
      'Halve the attack\'s effect or damage',
      'Open up the attacker to an ally (+1 forward against attacker)',
      'Deal damage equal to your level to the attacker',
    ],
    expiry: 'scene',
  }),

  encumbered: (): Partial <TemporaryModifier> => ({
    name: 'Encumbered',
    type: 'penalty',
    value: -1,
    source: 'Carrying too much weight',
    target: 'all-rolls',
    expiry: 'condition',
    expiryCondition: 'Reduce carried weight below max load',
  }),
}

// Utility functions

/**
 * Apply modifiers to a roll
 */
export function applyModifiers(
  baseValue: number,
  modifiers: TemporaryModifier[],
  rollType: 'attribute' | 'damage' | 'move',
  attribute?: Attribute,
  moveName?: string,
): { total: number, appliedModifiers: TemporaryModifier[] } {
  let total = baseValue
  const appliedModifiers: TemporaryModifier[] = []

  for (const modifier of modifiers) {
    if (!modifier.active)
      continue

    let applies = false

    // Check if modifier applies to this roll
    switch (modifier.target) {
      case 'all-rolls':
        applies = true
        break
      case 'next-roll':
        applies = true
        break
      case 'specific-attribute':
        applies = rollType === 'attribute' && modifier.targetAttribute === attribute
        break
      case 'specific-move':
        applies = rollType === 'move' && modifier.targetMove === moveName
        break
      case 'damage':
        applies = rollType === 'damage'
        break
      default:
        break
    }

    if (applies) {
      total += modifier.value
      appliedModifiers.push(modifier)
    }
  }

  return { total, appliedModifiers }
}

/**
 * Use a modifier (for forward / used expiry)
 */
export function useModifier(
  modifier: TemporaryModifier,
): TemporaryModifier {
  if (modifier.expiry === 'used') {
    return { ...modifier, active: false }
  }

  if (modifier.type === 'hold' && modifier.remaining) {
    const newRemaining = modifier.remaining - 1
    return {
      ...modifier,
      remaining: newRemaining,
      active: newRemaining > 0,
    }
  }

  return modifier
}

/**
 * Check if a modifier has expired
 */
export function isModifierExpired(
  modifier: TemporaryModifier,
  currentTime: Date = new Date(),
): boolean {
  if (!modifier.active)
    return true

  switch (modifier.expiry) {
    case 'time':
      return modifier.expiryTime ? currentTime > modifier.expiryTime : false
    case 'used':
      return false // Handled by useModifier
    case 'hold':
      return modifier.remaining === 0
    default:
      return false // Scene / session / condition / manual handled elsewhere
  }
}

/**
 * Clean up expired modifiers
 */
export function cleanupModifiers(
  modifiers: TemporaryModifier[],
  currentTime: Date = new Date(),
): TemporaryModifier[] {
  return modifiers.filter(mod =>
    mod.active && !isModifierExpired(mod, currentTime),
  )
}

/**
 * Add a new modifier
 */
export function addModifier(
  modifierSet: ModifierSet,
  modifier: Partial <TemporaryModifier>,
): ModifierSet {
  const newModifier: TemporaryModifier = {
    id: generateId(),
    name: 'Unnamed Modifier',
    type: 'forward',
    value: 0,
    source: 'Unknown',
    target: 'next-roll',
    expiry: 'used',
    createdAt: new Date(),
    active: true,
    ...modifier,
  }

  return {
    modifiers: [...modifierSet.modifiers, newModifier],
    lastUpdated: new Date(),
  }
}

/**
 * Remove scene-based modifiers
 */
export function endScene(modifierSet: ModifierSet): ModifierSet {
  return {
    modifiers: modifierSet.modifiers.map(mod =>
      mod.expiry === 'scene' ? { ...mod, active: false } : mod,
    ),
    lastUpdated: new Date(),
  }
}

/**
 * Remove session-based modifiers
 */
export function endSession(modifierSet: ModifierSet): ModifierSet {
  return {
    modifiers: modifierSet.modifiers.map(mod =>
      (mod.expiry === 'session' || mod.expiry === 'scene')
        ? { ...mod, active: false }
        : mod,
    ),
    lastUpdated: new Date(),
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}