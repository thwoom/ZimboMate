/**
 * Attribute-related calculations
 */

import { 
  Attributes, 
  Character,
  Attribute,
  getAttributeModifier as baseGetAttributeModifier,
  getEffectiveModifier as baseGetEffectiveModifier
} from '../../models/Character';
import { TemporaryModifier } from '../../models/Modifiers';
import { Condition, ActiveCondition } from '../../models/Conditions';

/**
 * Calculate all attribute modifiers at once
 */
export function calculateAllAttributeModifiers(attributes: Attributes): Record<Attribute, number> {
  return {
    STR: baseGetAttributeModifier(attributes.STR),
    DEX: baseGetAttributeModifier(attributes.DEX),
    CON: baseGetAttributeModifier(attributes.CON),
    INT: baseGetAttributeModifier(attributes.INT),
    WIS: baseGetAttributeModifier(attributes.WIS),
    CHA: baseGetAttributeModifier(attributes.CHA)
  };
}

/**
 * Calculate all effective modifiers (with debilities) at once
 */
export function calculateAllEffectiveModifiers(
  attributes: Attributes,
  debilities: Character['debilities']
): Record<Attribute, number> {
  return {
    STR: baseGetEffectiveModifier('STR', attributes, debilities),
    DEX: baseGetEffectiveModifier('DEX', attributes, debilities),
    CON: baseGetEffectiveModifier('CON', attributes, debilities),
    INT: baseGetEffectiveModifier('INT', attributes, debilities),
    WIS: baseGetEffectiveModifier('WIS', attributes, debilities),
    CHA: baseGetEffectiveModifier('CHA', attributes, debilities)
  };
}

/**
 * Get total modifier for a specific attribute including all sources
 */
export function getTotalAttributeModifier(
  attribute: Attribute,
  character: Character,
  temporaryModifiers: TemporaryModifier[] = [],
  conditions: Condition[] = [],
  activeConditions: ActiveCondition[] = []
): number {
  // Base effective modifier (includes debilities)
  let total = baseGetEffectiveModifier(attribute, character.attributes, character.debilities);
  
  // Add temporary modifiers targeting this attribute
  const relevantMods = temporaryModifiers.filter(
    mod => mod.active && 
    mod.target === 'specific-attribute' && 
    mod.targetAttribute === attribute
  );
  
  for (const mod of relevantMods) {
    total += mod.value;
  }
  
  // Add condition modifiers
  for (const condition of conditions) {
    const active = activeConditions.find(ac => 
      ac.conditionId === condition.id && 
      ac.characterId === character.id &&
      ac.active
    );
    
    if (active && condition.modifiers?.attributes?.[attribute]) {
      total += condition.modifiers.attributes[attribute];
    }
  }
  
  return total;
}

/**
 * Check if an attribute is debilitated
 */
export function isAttributeDebilitated(
  attribute: Attribute,
  debilities: Character['debilities']
): boolean {
  const debilityMap: Record<Attribute, keyof Character['debilities']> = {
    STR: 'weak',
    DEX: 'shaky',
    CON: 'sick',
    INT: 'stunned',
    WIS: 'confused',
    CHA: 'scarred'
  };
  
  return debilities[debilityMap[attribute]] || false;
}

/**
 * Get the name of the debility affecting an attribute
 */
export function getDebilityName(attribute: Attribute): string {
  const debilityNames: Record<Attribute, string> = {
    STR: 'Weak',
    DEX: 'Shaky',
    CON: 'Sick',
    INT: 'Stunned',
    WIS: 'Confused',
    CHA: 'Scarred'
  };
  
  return debilityNames[attribute];
}

/**
 * Calculate stat array total (for point buy validation)
 */
export function calculateStatTotal(attributes: Attributes): number {
  return Object.values(attributes).reduce((sum, value) => sum + value, 0);
}

/**
 * Validate attribute array (standard array is 16, 15, 13, 12, 9, 8 = 73 total)
 */
export function validateAttributeArray(attributes: Attributes): {
  valid: boolean;
  total: number;
  message?: string;
} {
  const total = calculateStatTotal(attributes);
  const values = Object.values(attributes).sort((a, b) => b - a);
  
  // Check if all attributes are in valid range
  const allInRange = values.every(v => v >= 3 && v <= 18);
  if (!allInRange) {
    return {
      valid: false,
      total,
      message: 'All attributes must be between 3 and 18'
    };
  }
  
  // Standard array check
  const standardArray = [16, 15, 13, 12, 9, 8];
  const isStandardArray = values.every((v, i) => v === standardArray[i]);
  
  if (isStandardArray) {
    return {
      valid: true,
      total,
      message: 'Using standard array'
    };
  }
  
  // Point buy validation (27 points, but we check total which is ~72-73)
  if (total > 73) {
    return {
      valid: false,
      total,
      message: `Total attribute points (${total}) exceed standard point buy limit`
    };
  }
  
  return {
    valid: true,
    total
  };
}

/**
 * Get attribute description for UI
 */
export function getAttributeDescription(attribute: Attribute): string {
  const descriptions: Record<Attribute, string> = {
    STR: 'Physical power and athletic ability',
    DEX: 'Agility, reflexes, and balance',
    CON: 'Health, stamina, and vital force',
    INT: 'Reasoning, memory, and analytical skill',
    WIS: 'Awareness, intuition, and insight',
    CHA: 'Force of personality and leadership'
  };
  
  return descriptions[attribute];
}

/**
 * Get moves commonly associated with an attribute
 */
export function getAttributeMoves(attribute: Attribute): string[] {
  const movesMap: Record<Attribute, string[]> = {
    STR: ['Hack and Slash', 'Bend Bars/Lift Gates'],
    DEX: ['Volley', 'Defy Danger (dodging)', 'Pick Locks'],
    CON: ['Defy Danger (endurance)', 'Carouse'],
    INT: ['Spout Lore', 'Discern Realities (investigation)'],
    WIS: ['Discern Realities', 'Hunt and Track'],
    CHA: ['Parley', 'Recruit', 'Carouse (charm)']
  };
  
  return movesMap[attribute] || [];
}
