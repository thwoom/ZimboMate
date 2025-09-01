/**
 * Condition calculation utilities for Dungeon World
 */

import {
  Condition,
  Debility,
  OngoingEffect,
  TemporaryCondition,
  ConditionCalculation,
  DebilityType,
  OngoingEffectType,
} from '../models/Condition';
import { Attributes } from '../models/Character';

// Debility to attribute mapping
const DEBILITY_TO_ATTRIBUTE: Record < DebilityType, keyof Attributes> = {
  weak: 'STR',
  shaky: 'DEX',
  sick: 'CON',
  stunned: 'INT',
  confused: 'WIS',
  scarred: 'CHA',
};

// Ongoing effect value mapping
const ONGOING_EFFECT_VALUES: Record < OngoingEffectType, number> = {
  '+1 forward': 1,
  '-1 ongoing': -1,
  '+2 forward': 2,
  '-2 ongoing': -2,
  '+3 forward': 3,
  '-3 ongoing': -3,
  'advantage': 1, // Special handling needed
  'disadvantage': -1, // Special handling needed
  'immune': 0, // Special handling needed
  'vulnerable': -1,
  'resistant': 1,
};

/**
 * Calculate all stat modifiers for a character based on their conditions
 */
export function calculateConditionModifiers(
  characterId: string,
  conditions: Condition[],
): ConditionCalculation {

  const debilities = activeConditions.filter(c => c.type === 'debility') as Debility[];

  const temporaryConditions = activeConditions.filter(c => c.type === 'temporary_condition') as TemporaryCondition[];

  // Calculate debility modifiers
  const debilityModifiers: Record<string, number> = {};
  debilities.forEach(debility => {
    const attribute = DEBILITY_TO_ATTRIBUTE[debility.debilityType];
    if (attribute) {
      debilityModifiers[attribute] = (debilityModifiers[attribute] || 0)-1;
    }
  });

  // Calculate ongoing effect modifiers
  const ongoingModifiers: Record<string, number> = {};
  ongoingEffects.forEach(effect => {

    if (value !== 0) {
      // Apply to all applicable actions / rolls
      effect.appliesTo.forEach(action => {
        ongoingModifiers[action] = (ongoingModifiers[action] || 0) + value;
      });
    }
  });

  // Calculate temporary condition modifiers
  const tempModifiers: Record<string, number> = {};
  temporaryConditions.forEach(condition => {
    if (condition.statModifiers) {
      Object.entries(condition.statModifiers).forEach(([stat, modifier]) => {
        if (modifier !== undefined) {
          tempModifiers[stat] = (tempModifiers[stat] || 0) + modifier;
        }
      });
    }
  });

  // Combine all modifiers
  const totalModifiers: Record<string, number> = {};

  // Add debility modifiers
  Object.entries(debilityModifiers).forEach(([stat, modifier]) => {
    totalModifiers[stat] = (totalModifiers[stat] || 0) + modifier;
  });

  // Add ongoing effect modifiers
  Object.entries(ongoingModifiers).forEach(([action, modifier]) => {
    totalModifiers[action] = (totalModifiers[action] || 0) + modifier;
  });

  // Add temporary condition modifiers
  Object.entries(tempModifiers).forEach(([stat, modifier]) => {
    totalModifiers[stat] = (totalModifiers[stat] || 0) + modifier;
  });

  return {
    characterId,
    statModifiers: totalModifiers,
    activeEffects: ongoingEffects,
    activeDebilities: debilities,
    activeConditions: temporaryConditions,
    totalModifiers,
  };
}

/**
 * Get the effective attribute value after applying condition modifiers
 */
export function getEffectiveAttribute(
  baseAttribute: number,
  attributeName: keyof Attributes,
  conditions: Condition[],
): number {

  return Math.max(0, baseAttribute + modifier); // Attributes can't go below 0
}

/**
 * Check if a character has a specific debility
 */
export function hasDebility(
  conditions: Condition[],
  debilityType: DebilityType,
): boolean {
  return conditions.some(c =>
    c.type === 'debility' &&
    c.isActive &&
    !c.isResolved &&
    (c as Debility).debilityType === debilityType,
  );
}

/**
 * Get all active debilities for a character
 */
export function getActiveDebilities(conditions: Condition[]): Debility[] {
  return conditions.filter(c =>
    c.type === 'debility' &&
    c.isActive &&
    !c.isResolved,
  ) as Debility[];
}

/**
 * Get ongoing effects that apply to a specific action
 */
export function getOngoingEffectsForAction(
  conditions: Condition[],
  action: string,
): OngoingEffect[] {
  return conditions.filter(c =>
    c.type === 'ongoing_effect' &&
    c.isActive &&
    !c.isResolved &&
    (c as OngoingEffect).appliesTo.includes(action),
  ) as OngoingEffect[];
}

/**
 * Calculate the total modifier for a specific action
 */
export function getActionModifier(
  conditions: Condition[],
  action: string,
): number {
  const effects = getOngoingEffectsForAction(conditions, action);
  return effects.reduce((total, effect) => {
    const value = ONGOING_EFFECT_VALUES[effect.ongoingEffectType];
    return total + value;
  }, 0);
}

/**
 * Check if conditions are conflicting
 */
export function checkConditionConflicts(conditions: Condition[]): {
  hasConflicts: boolean;
  conflicts: Array<{ condition1: Condition; condition2: Condition; reason: string }>;
} {

  const conflicts: Array<{ condition1: Condition; condition2: Condition; reason: string }> = [];

  // Check for conflicting ongoing effects on the same action
  const ongoingEffects = activeConditions.filter(c => c.type === 'ongoing_effect') as OngoingEffect[];
  const actionEffects: Record < string, OngoingEffect[]> = {};

  ongoingEffects.forEach(effect => {
    effect.appliesTo.forEach(action => {
      if (!actionEffects[action]) {
        actionEffects[action] = [];
      }
      actionEffects[action].push(effect);
    });
  });

  // Check for conflicts in each action
  Object.entries(actionEffects).forEach(([action, effects]) => {
    if (effects.length > 1) {
      // Check for conflicting modifiers
      const modifiers = effects.map(e => ONGOING_EFFECT_VALUES[e.ongoingEffectType]);
      const hasConflictingModifiers = modifiers.some(m => m > 0) && modifiers.some(m => m < 0);

      if (hasConflictingModifiers) {
        conflicts.push({
          condition1: effects[0],
          condition2: effects[1],
          reason: `Conflicting modifiers for action: ${action}`,
        });
      }
    }
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check if conditions are expiring soon
 */
export function getExpiringConditions(
  conditions: Condition[],
  withinMinutes = 5,
): Condition[] {

  const threshold = new Date(Date.now() + withinMinutes * 60 * 1000);

  return conditions.filter(condition => {
    if (!condition.isActive || condition.isResolved) return false;
    if (condition.duration === 'permanent') return false;
    if (!condition.endTime) return false;

    return condition.endTime <= threshold;
  });
}

/**
 * Get condition summary for a character
 */
export function getConditionSummary(conditions: Condition[]): {
  totalActive: number;
  totalResolved: number;
  debilities: number;
  ongoingEffects: number;
  temporaryConditions: number;
  expiringSoon: number;
} {
  const activeConditions = conditions.filter(c => c.isActive && !c.isResolved);
  const resolvedConditions = conditions.filter(c => c.isResolved);
  const expiringSoon = getExpiringConditions(conditions).length;

  return {
    totalActive: activeConditions.length,
    totalResolved: resolvedConditions.length,
    debilities: activeConditions.filter(c => c.type === 'debility').length,
    ongoingEffects: activeConditions.filter(c => c.type === 'ongoing_effect').length,
    temporaryConditions: activeConditions.filter(c => c.type === 'temporary_condition').length,
    expiringSoon,
  };
}

/**
 * Format duration for display
 */
export function formatDuration(condition: Condition): string {
  switch (condition.duration) {
    case 'instant':
      return 'Instant';
    case 'until_end_of_turn':
      return 'Until end of turn';
    case 'until_end_of_scene':
      return 'Until end of scene';
    case 'until_rest':
      return 'Until rest';
    case 'until_dawn':
      return 'Until dawn';
    case 'permanent':
      return 'Permanent';
    case 'custom':
      if (condition.endTime) {
        const now = new Date();
        const diff = condition.endTime.getTime()-Date.now();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        return 'Expiring soon';
      }
      return 'Custom duration';
    default:
      return 'Unknown duration';
  }
}

/**
 * Get condition icon and color
 */
export function getConditionDisplay(condition: Condition): {
  icon: string;
  color: string;
  label: string;
} {
  // Default values
  let icon = '⚡';
  let color = '#666666';
  let label = condition.name;

  // Set based on condition type
  switch (condition.type) {
    case 'debility':
      icon = '💀';
      color = '#ff4444';
      break;
    case 'ongoing_effect':
      const effect = condition as OngoingEffect;
      if (effect.ongoingEffectType.includes('+')) {
        icon = '✨';
        color = '#44ff44';
      } else if (effect.ongoingEffectType.includes('-')) {
        icon = '⚠️';
        color = '#ffaa00';
      } else {
        icon = '🔮';
        color = '#4444ff';
      }
      break;
    case 'temporary_condition':
      const temp = condition as TemporaryCondition;
      switch (temp.tempCategory) {
        case 'buff':
          icon = '🌟';
          color = '#44ff44';
          break;
        case 'debuff':
          icon = '💀';
          color = '#ff4444';
          break;
        case 'neutral':
          icon = '⚖️';
          color = '#666666';
          break;
      }
      break;
  }

  // Override with custom values if provided
  if (condition.icon) icon = condition.icon;
  if (condition.color) color = condition.color;

  return { icon, color, label };
}
