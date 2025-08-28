/**
 * Data validation and business rules for Dungeon World
 */

import { 
  Character, 
  CharacterClass, 
  Attribute, 
  Attributes,
  getClassBaseHP,
  getClassBaseLoad,
  getClassDamageDie
} from '../models/Character';
import { Item, Weapon, Armor, ItemTag } from '../models/Equipment';
import { Inventory, EncumbranceStatus } from '../models/Inventory';
import { Move, MoveCategory } from '../models/Move';

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Character validation rules
export const CharacterValidation = {
  /**
   * Validate character attributes
   */
  validateAttributes(attributes: Attributes): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check each attribute is in valid range (3-18)
    const attributeNames: Attribute[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    for (const attr of attributeNames) {
      const value = attributes[attr];
      if (value < 3 || value > 18) {
        errors.push(`${attr} must be between 3 and 18 (currently ${value})`);
      }
    }
    
    // Check total points (optional rule: 72 points total)
    const total = Object.values(attributes).reduce((sum, val) => sum + val, 0);
    if (total > 72) {
      warnings.push(`Total attribute points (${total}) exceed standard point buy limit of 72`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate character level and XP
   */
  validateLevelAndXP(level: number, xp: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (level < 1 || level > 10) {
      errors.push(`Level must be between 1 and 10 (currently ${level})`);
    }
    
    if (xp < 0) {
      errors.push(`XP cannot be negative (currently ${xp})`);
    }
    
    // Check if XP matches level appropriately
    const expectedMaxXP = level + 7;
    if (xp >= expectedMaxXP) {
      warnings.push(`Character has enough XP (${xp}/${expectedMaxXP}) to level up`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate complete character
   */
  validateCharacter(character: Character): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate name
    if (!character.name || character.name.trim().length === 0) {
      errors.push('Character must have a name');
    }
    
    // Validate attributes
    const attrResult = this.validateAttributes(character.attributes);
    errors.push(...attrResult.errors);
    warnings.push(...attrResult.warnings);
    
    // Validate level and XP
    const levelResult = this.validateLevelAndXP(character.level, character.xp);
    errors.push(...levelResult.errors);
    warnings.push(...levelResult.warnings);
    
    // Validate HP
    if (character.hp.current < 0) {
      warnings.push('Character HP is below 0 - Last Breath should be triggered');
    }
    if (character.hp.current > character.hp.max) {
      errors.push(`Current HP (${character.hp.current}) cannot exceed max HP (${character.hp.max})`);
    }
    
    // Validate base values match class
    const expectedBaseHP = getClassBaseHP(character.class);
    const expectedBaseLoad = getClassBaseLoad(character.class);
    const expectedDamageDie = getClassDamageDie(character.class);
    
    if (character.damageDie !== expectedDamageDie) {
      warnings.push(`Damage die (${character.damageDie}) doesn't match class default (${expectedDamageDie})`);
    }
    
    // Validate bonds
    if (character.bonds.length === 0) {
      warnings.push('Character has no bonds - consider adding bonds for better roleplay');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Item validation rules
export const ItemValidation = {
  /**
   * Validate item weight
   */
  validateWeight(item: Item): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (item.weight < 0) {
      errors.push(`Item weight cannot be negative (${item.name}: ${item.weight})`);
    }
    
    if (item.weight > 10) {
      warnings.push(`Item is extremely heavy (${item.name}: ${item.weight} weight)`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate item tags
   */
  validateTags(item: Item): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for conflicting tags
    const tags = item.tags.map(t => t.name);
    
    if (tags.includes('hand') && tags.includes('two-handed')) {
      errors.push(`Item cannot be both 'hand' and 'two-handed' (${item.name})`);
    }
    
    if (item.category === 'armor' && !tags.includes('worn')) {
      warnings.push(`Armor should have 'worn' tag (${item.name})`);
    }
    
    // Validate uses
    if (item.uses) {
      if (item.uses.current > item.uses.max) {
        errors.push(`Current uses (${item.uses.current}) cannot exceed max uses (${item.uses.max})`);
      }
      if (item.uses.current < 0) {
        errors.push(`Uses cannot be negative (${item.name})`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate complete item
   */
  validateItem(item: Item): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!item.name || item.name.trim().length === 0) {
      errors.push('Item must have a name');
    }
    
    if (item.quantity < 0) {
      errors.push(`Item quantity cannot be negative (${item.name}: ${item.quantity})`);
    }
    
    // Weight validation
    const weightResult = this.validateWeight(item);
    errors.push(...weightResult.errors);
    warnings.push(...weightResult.warnings);
    
    // Tag validation
    const tagResult = this.validateTags(item);
    errors.push(...tagResult.errors);
    warnings.push(...tagResult.warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Inventory validation rules
export const InventoryValidation = {
  /**
   * Validate inventory weight and encumbrance
   */
  validateEncumbrance(
    inventory: Inventory, 
    maxLoad: number,
    encumbranceStatus: EncumbranceStatus
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (encumbranceStatus === 'encumbered') {
      warnings.push('Character is encumbered (-1 ongoing to all rolls)');
    } else if (encumbranceStatus === 'overloaded') {
      errors.push('Character is overloaded and can barely move');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate equipped items
   */
  validateEquippedItems(items: Item[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for multiple armors equipped
    const equippedArmor = items.filter(item => 
      item.equipped && item.category === 'armor'
    );
    
    if (equippedArmor.length > 1) {
      errors.push('Cannot equip multiple armor pieces simultaneously');
    }
    
    // Check for two-handed weapon conflicts
    const equippedWeapons = items.filter(item => 
      item.equipped && item.category === 'weapon'
    );
    
    const twoHandedWeapons = equippedWeapons.filter(weapon =>
      weapon.tags.some(tag => tag.name === 'two-handed')
    );
    
    if (twoHandedWeapons.length > 0 && equippedWeapons.length > 1) {
      warnings.push('Two-handed weapon equipped with other weapons');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Move validation rules
export const MoveValidation = {
  /**
   * Validate move requirements
   */
  validateMoveRequirements(
    move: Move,
    characterLevel: number,
    characterClass: string,
    knownMoves: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check level requirement
    if (move.level && characterLevel < move.level) {
      errors.push(`Character level (${characterLevel}) too low for move "${move.name}" (requires ${move.level})`);
    }
    
    // Check class requirement
    if (move.requiresClass && characterClass !== move.requiresClass) {
      errors.push(`Move "${move.name}" requires ${move.requiresClass} class`);
    }
    
    // Check prerequisite move
    if (move.requiresMove && !knownMoves.includes(move.requiresMove)) {
      errors.push(`Move "${move.name}" requires prerequisite move with ID: ${move.requiresMove}`);
    }
    
    // Check if this replaces a move they don't have
    if (move.replaces && !knownMoves.includes(move.replaces)) {
      warnings.push(`Move "${move.name}" replaces a move you don't have (ID: ${move.replaces})`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Validate custom move
   */
  validateCustomMove(move: Move): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!move.name || move.name.trim().length === 0) {
      errors.push('Move must have a name');
    }
    
    if (!move.description || move.description.trim().length === 0) {
      errors.push('Move must have a description');
    }
    
    if (!move.trigger || move.trigger.trim().length === 0) {
      errors.push('Move must have a trigger');
    }
    
    // If it's a roll move, check for results
    if (move.triggerType === 'roll') {
      if (!move.rollStat) {
        errors.push('Roll moves must specify which stat to roll');
      }
      if (!move.onSuccess) {
        warnings.push('Roll move should specify 10+ result');
      }
      if (!move.onPartial) {
        warnings.push('Roll move should specify 7-9 result');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Business rules enforcement
export const BusinessRules = {
  /**
   * Apply debility effects
   */
  applyDebilityEffects(character: Character): Character {
    // Debilities are already handled in getEffectiveModifier
    // This is here for any additional debility effects
    return character;
  },

  /**
   * Apply encumbrance effects
   */
  applyEncumbranceEffects(
    character: Character, 
    encumbranceStatus: EncumbranceStatus
  ): { ongoing: number } {
    switch (encumbranceStatus) {
      case 'encumbered':
        return { ongoing: -1 };
      case 'overloaded':
        return { ongoing: -3 }; // Severely limited
      default:
        return { ongoing: 0 };
    }
  },

  /**
   * Check for automatic triggers
   */
  checkAutoTriggers(character: Character): string[] {
    const triggers: string[] = [];
    
    // Last Breath at 0 HP
    if (character.hp.current <= 0) {
      triggers.push('Last Breath');
    }
    
    // Level Up when XP threshold met
    if (character.xp >= character.level + 7) {
      triggers.push('Level Up');
    }
    
    return triggers;
  },

  /**
   * Validate character advancement
   */
  validateAdvancement(
    character: Character,
    newMove?: Move,
    statIncrease?: Attribute
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Can't advance if not eligible for level up
    if (character.xp < character.level + 7) {
      errors.push('Not enough XP to level up');
    }
    
    // Check stat increase limits
    if (statIncrease) {
      const currentValue = character.attributes[statIncrease];
      if (currentValue >= 18) {
        errors.push(`Cannot increase ${statIncrease} above 18`);
      }
    }
    
    // Validate new move if selecting one
    if (newMove) {
      const moveResult = MoveValidation.validateMoveRequirements(
        newMove,
        character.level + 1, // New level
        character.class,
        [] // Would need actual known moves
      );
      errors.push(...moveResult.errors);
      warnings.push(...moveResult.warnings);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// Combined validation function
export function validateGameState(
  character: Character | null,
  inventory: Inventory,
  moves: Move[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate character
  if (character) {
    const charResult = CharacterValidation.validateCharacter(character);
    errors.push(...charResult.errors);
    warnings.push(...charResult.warnings);
    
    // Check auto-triggers
    const triggers = BusinessRules.checkAutoTriggers(character);
    triggers.forEach(trigger => {
      warnings.push(`"${trigger}" move should be triggered`);
    });
  }
  
  // Validate inventory items
  Object.values(inventory.items).forEach(item => {
    const itemResult = ItemValidation.validateItem(item);
    errors.push(...itemResult.errors);
    warnings.push(...itemResult.warnings);
  });
  
  // Validate equipped items
  const equippedItems = Object.values(inventory.items).filter(item => item.equipped);
  const equipResult = InventoryValidation.validateEquippedItems(equippedItems);
  errors.push(...equipResult.errors);
  warnings.push(...equipResult.warnings);
  
  // Validate custom moves
  moves.forEach(move => {
    if (move.custom) {
      const moveResult = MoveValidation.validateCustomMove(move);
      errors.push(...moveResult.errors);
      warnings.push(...moveResult.warnings);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
