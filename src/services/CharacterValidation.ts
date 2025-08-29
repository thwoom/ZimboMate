/**
 * Character validation service for Dungeon World rules
 */

import { Character, CharacterClass, Race, Attributes, Alignment } from '../models/Character';
import { Item, isWeapon, isArmor, hasTag } from '../models/Equipment';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  id: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  id: string;
  field: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ValidationSuggestion {
  id: string;
  field: string;
  message: string;
  action?: string;
}

export interface AttributeValidation {
  method: 'array' | 'pointbuy' | 'rolled';
  isValid: boolean;
  total: number;
  expectedTotal: number;
  distribution: 'balanced' | 'specialized' | 'extreme';
}

export interface BuildEffectiveness {
  overall: number; // 0-100
  combat: number;
  social: number;
  exploration: number;
  magic: number;
  survivability: number;
}

class CharacterValidationService {
  
  /**
   * Validate a complete character
   */
  validateCharacter(character: Partial<Character>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Basic field validation
    if (!character.name || character.name.trim().length === 0) {
      errors.push({
        id: 'missing-name',
        field: 'name',
        message: 'Character must have a name',
        severity: 'error'
      });
    }

    if (!character.class) {
      errors.push({
        id: 'missing-class',
        field: 'class',
        message: 'Character must have a class',
        severity: 'error'
      });
    }

    if (!character.race) {
      errors.push({
        id: 'missing-race',
        field: 'race',
        message: 'Character must have a race',
        severity: 'error'
      });
    }

    if (!character.alignment) {
      errors.push({
        id: 'missing-alignment',
        field: 'alignment',
        message: 'Character must have an alignment',
        severity: 'error'
      });
    }

    // Attribute validation
    if (character.attributes) {
      const attrValidation = this.validateAttributes(character.attributes);
      if (!attrValidation.isValid) {
        errors.push({
          id: 'invalid-attributes',
          field: 'attributes',
          message: `Attribute total (${attrValidation.total}) doesn't match expected (${attrValidation.expectedTotal})`,
          severity: 'error'
        });
      }

      // Check for dump stats
      const dumpStats = this.findDumpStats(character.attributes);
      if (dumpStats.length > 0) {
        warnings.push({
          id: 'dump-stats',
          field: 'attributes',
          message: `Very low stats detected: ${dumpStats.join(', ')}. This may limit character effectiveness.`,
          impact: 'medium'
        });
      }
    }

    // Class-specific validation
    if (character.class && character.attributes) {
      const classValidation = this.validateClassAttributes(character.class, character.attributes);
      warnings.push(...classValidation.warnings);
      suggestions.push(...classValidation.suggestions);
    }

    // Race-class compatibility
    if (character.race && character.class) {
      const compatibility = this.validateRaceClassCompatibility(character.race, character.class);
      if (compatibility.warnings.length > 0) {
        warnings.push(...compatibility.warnings);
      }
    }

    // Alignment validation
    if (character.class && character.alignment) {
      const alignmentCheck = this.validateClassAlignment(character.class, character.alignment);
      if (!alignmentCheck.isValid) {
        errors.push({
          id: 'invalid-alignment',
          field: 'alignment',
          message: alignmentCheck.message,
          severity: 'error'
        });
      }
    }

    // Equipment validation
    if (character.inventory && character.attributes) {
      const equipValidation = this.validateEquipment(character.inventory, character.attributes, character.class);
      warnings.push(...equipValidation.warnings);
      suggestions.push(...equipValidation.suggestions);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate attribute distribution
   */
  validateAttributes(attributes: Attributes, method: 'array' | 'pointbuy' | 'rolled' = 'array'): AttributeValidation {
    const values = Object.values(attributes);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    let expectedTotal: number;
    let isValid: boolean;

    switch (method) {
      case 'array':
        expectedTotal = 72; // 16+15+13+12+9+8 = 72
        isValid = total === expectedTotal;
        break;
      case 'pointbuy':
        expectedTotal = 72; // Same as array for simplicity
        isValid = total >= 60 && total <= 84; // Allow some flexibility
        break;
      case 'rolled':
        expectedTotal = 63; // Average of 3d6 * 6 = 10.5 * 6 = 63
        isValid = total >= 36 && total <= 108; // Wide range for rolled
        break;
    }

    // Determine distribution type
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const range = highest - lowest;
    
    let distribution: 'balanced' | 'specialized' | 'extreme';
    if (range <= 6) distribution = 'balanced';
    else if (range <= 10) distribution = 'specialized';
    else distribution = 'extreme';

    return {
      method,
      isValid,
      total,
      expectedTotal,
      distribution
    };
  }

  /**
   * Find attributes that are very low (8 or below)
   */
  private findDumpStats(attributes: Attributes): string[] {
    const dumpStats: string[] = [];
    Object.entries(attributes).forEach(([attr, value]) => {
      if (value <= 8) {
        dumpStats.push(attr);
      }
    });
    return dumpStats;
  }

  /**
   * Validate class-specific attribute requirements
   */
  private validateClassAttributes(characterClass: CharacterClass, attributes: Attributes): {
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const classRequirements: Record<CharacterClass, { primary: keyof Attributes; secondary?: keyof Attributes; avoid?: keyof Attributes }> = {
      'Fighter': { primary: 'STR', secondary: 'CON' },
      'Paladin': { primary: 'STR', secondary: 'WIS' },
      'Ranger': { primary: 'DEX', secondary: 'WIS' },
      'Thief': { primary: 'DEX', secondary: 'INT' },
      'Bard': { primary: 'CHA', secondary: 'INT' },
      'Cleric': { primary: 'WIS', secondary: 'STR' },
      'Druid': { primary: 'WIS', secondary: 'CON' },
      'Wizard': { primary: 'INT', secondary: 'DEX', avoid: 'STR' },
      'Barbarian': { primary: 'STR', secondary: 'CON', avoid: 'INT' },
      'Immolator': { primary: 'CON', secondary: 'INT' }
    };

    const req = classRequirements[characterClass];
    if (!req) return { warnings, suggestions };

    // Check primary attribute
    if (attributes[req.primary] < 13) {
      warnings.push({
        id: `low-primary-${req.primary}`,
        field: 'attributes',
        message: `${characterClass}s typically need high ${req.primary} (13+). Current: ${attributes[req.primary]}`,
        impact: 'high'
      });
    }

    // Check secondary attribute
    if (req.secondary && attributes[req.secondary] < 12) {
      suggestions.push({
        id: `improve-secondary-${req.secondary}`,
        field: 'attributes',
        message: `Consider increasing ${req.secondary} for better ${characterClass} effectiveness`,
        action: `Increase ${req.secondary}`
      });
    }

    // Check avoided attribute
    if (req.avoid && attributes[req.avoid] > 12) {
      suggestions.push({
        id: `high-avoided-${req.avoid}`,
        field: 'attributes',
        message: `High ${req.avoid} is unusual for ${characterClass}s, but can work for unique builds`,
      });
    }

    return { warnings, suggestions };
  }

  /**
   * Check race-class compatibility
   */
  private validateRaceClassCompatibility(race: Race, characterClass: CharacterClass): {
    warnings: ValidationWarning[];
  } {
    const warnings: ValidationWarning[] = [];

    // Define synergistic combinations
    const goodCombos: Record<Race, CharacterClass[]> = {
      'Human': ['Fighter', 'Paladin', 'Cleric', 'Bard'], // Versatile
      'Elf': ['Ranger', 'Wizard', 'Druid'], // Magical affinity
      'Dwarf': ['Fighter', 'Paladin', 'Cleric'], // Hardy and traditional
      'Halfling': ['Thief', 'Bard', 'Ranger'], // Small and nimble
      'Other': [] // No specific recommendations
    };

    const racialSynergy = goodCombos[race] || [];
    if (racialSynergy.length > 0 && !racialSynergy.includes(characterClass)) {
      warnings.push({
        id: 'race-class-mismatch',
        field: 'race',
        message: `${race}s typically excel as ${racialSynergy.join(', ')}. ${characterClass} is unusual but can work.`,
        impact: 'low'
      });
    }

    return { warnings };
  }

  /**
   * Validate class-alignment compatibility
   */
  private validateClassAlignment(characterClass: CharacterClass, alignment: Alignment): {
    isValid: boolean;
    message: string;
  } {
    const alignmentRestrictions: Record<CharacterClass, Alignment[]> = {
      'Paladin': ['Lawful', 'Good'],
      'Druid': ['Neutral', 'Chaotic'],
      'Fighter': ['Good', 'Lawful', 'Neutral', 'Chaotic', 'Evil'], // No restrictions
      'Ranger': ['Good', 'Lawful', 'Neutral', 'Chaotic'],
      'Thief': ['Neutral', 'Chaotic', 'Evil'],
      'Bard': ['Good', 'Neutral', 'Chaotic'],
      'Cleric': ['Good', 'Lawful', 'Neutral', 'Evil'], // Depends on deity
      'Wizard': ['Good', 'Lawful', 'Neutral', 'Chaotic', 'Evil'], // No restrictions
      'Barbarian': ['Neutral', 'Chaotic'],
      'Immolator': ['Good', 'Neutral', 'Chaotic', 'Evil'] // No restrictions
    };

    const allowedAlignments = alignmentRestrictions[characterClass] || [];
    const isValid = allowedAlignments.includes(alignment);

    return {
      isValid,
      message: isValid 
        ? `${alignment} ${characterClass} is valid`
        : `${characterClass}s cannot be ${alignment}. Allowed: ${allowedAlignments.join(', ')}`
    };
  }

  /**
   * Validate equipment load and effectiveness
   */
  private validateEquipment(inventory: Item[], attributes: Attributes, characterClass?: CharacterClass): {
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Calculate total weight
    const totalWeight = inventory.reduce((sum, item) => sum + (item.weight || 0), 0);
    
    // Calculate load capacity (base load varies by class)
    const classBaseLoad: Record<CharacterClass, number> = {
      'Fighter': 12, 'Paladin': 12, 'Ranger': 11, 'Thief': 9, 'Bard': 9,
      'Cleric': 10, 'Druid': 6, 'Wizard': 7, 'Barbarian': 8, 'Immolator': 9
    };
    
    const baseLoad = characterClass ? classBaseLoad[characterClass] : 10;
    const strModifier = Math.floor((attributes.STR - 10) / 2);
    const maxLoad = baseLoad + strModifier;

    // Check encumbrance
    if (totalWeight > maxLoad) {
      warnings.push({
        id: 'overencumbered',
        field: 'inventory',
        message: `Carrying ${totalWeight} weight, but max load is ${maxLoad}. Character is encumbered.`,
        impact: 'high'
      });
    } else if (totalWeight > maxLoad - 2) {
      warnings.push({
        id: 'near-encumbrance',
        field: 'inventory',
        message: `Close to encumbrance limit (${totalWeight}/${maxLoad}). Consider dropping items.`,
        impact: 'medium'
      });
    }

    // Check for missing essentials
    const hasWeapon = inventory.some(item => isWeapon(item) || hasTag(item, 'weapon'));
    const hasArmor = inventory.some(item => isArmor(item) || hasTag(item, 'armor'));
    const hasRations = inventory.some(item => hasTag(item, 'ration'));

    if (!hasWeapon) {
      suggestions.push({
        id: 'missing-weapon',
        field: 'inventory',
        message: 'Consider adding a weapon for combat effectiveness',
        action: 'Add weapon'
      });
    }

    if (!hasArmor && characterClass !== 'Wizard') {
      suggestions.push({
        id: 'missing-armor',
        field: 'inventory',
        message: 'Consider adding armor for protection',
        action: 'Add armor'
      });
    }

    if (!hasRations) {
      suggestions.push({
        id: 'missing-rations',
        field: 'inventory',
        message: 'Adventurers need food! Add some rations.',
        action: 'Add rations'
      });
    }

    return { warnings, suggestions };
  }

  /**
   * Calculate build effectiveness rating
   */
  calculateBuildEffectiveness(character: Partial<Character>): BuildEffectiveness {
    if (!character.attributes || !character.class) {
      return { overall: 0, combat: 0, social: 0, exploration: 0, magic: 0, survivability: 0 };
    }

    const attrs = character.attributes;
    const characterClass = character.class;

    // Base effectiveness from attributes
    const combat = this.calculateCombatEffectiveness(attrs, characterClass);
    const social = this.calculateSocialEffectiveness(attrs, characterClass);
    const exploration = this.calculateExplorationEffectiveness(attrs, characterClass);
    const magic = this.calculateMagicEffectiveness(attrs, characterClass);
    const survivability = this.calculateSurvivabilityEffectiveness(attrs, characterClass);

    const overall = Math.round((combat + social + exploration + magic + survivability) / 5);

    return { overall, combat, social, exploration, magic, survivability };
  }

  private calculateCombatEffectiveness(attrs: Attributes, characterClass: CharacterClass): number {
    const str = this.getModifier(attrs.STR);
    const dex = this.getModifier(attrs.DEX);
    const con = this.getModifier(attrs.CON);

    let base = 50; // Base effectiveness

    // Class bonuses
    const classBonuses: Record<CharacterClass, number> = {
      'Fighter': 25, 'Paladin': 20, 'Barbarian': 20, 'Ranger': 15,
      'Thief': 10, 'Cleric': 10, 'Druid': 5, 'Bard': 5, 'Wizard': 0, 'Immolator': 15
    };

    base += classBonuses[characterClass] || 0;

    // Attribute bonuses
    if (['Fighter', 'Paladin', 'Barbarian'].includes(characterClass)) {
      base += str * 5; // STR-based classes
    } else if (['Ranger', 'Thief'].includes(characterClass)) {
      base += dex * 5; // DEX-based classes
    }

    base += con * 3; // CON helps everyone in combat

    return Math.max(0, Math.min(100, base));
  }

  private calculateSocialEffectiveness(attrs: Attributes, characterClass: CharacterClass): number {
    const cha = this.getModifier(attrs.CHA);
    const int = this.getModifier(attrs.INT);
    const wis = this.getModifier(attrs.WIS);

    let base = 50;

    const classBonuses: Record<CharacterClass, number> = {
      'Bard': 25, 'Paladin': 15, 'Cleric': 10, 'Ranger': 5,
      'Fighter': 0, 'Thief': 5, 'Druid': 0, 'Wizard': 5, 'Barbarian': -10, 'Immolator': 0
    };

    base += classBonuses[characterClass] || 0;
    base += cha * 8; // CHA is primary for social
    base += int * 2; // INT helps with knowledge
    base += wis * 2; // WIS helps with insight

    return Math.max(0, Math.min(100, base));
  }

  private calculateExplorationEffectiveness(attrs: Attributes, characterClass: CharacterClass): number {
    const dex = this.getModifier(attrs.DEX);
    const int = this.getModifier(attrs.INT);
    const wis = this.getModifier(attrs.WIS);

    let base = 50;

    const classBonuses: Record<CharacterClass, number> = {
      'Ranger': 25, 'Thief': 20, 'Druid': 15, 'Bard': 10,
      'Fighter': 5, 'Paladin': 5, 'Cleric': 5, 'Wizard': 10, 'Barbarian': 10, 'Immolator': 5
    };

    base += classBonuses[characterClass] || 0;
    base += dex * 5; // DEX for stealth, traps
    base += wis * 5; // WIS for perception, tracking
    base += int * 3; // INT for knowledge

    return Math.max(0, Math.min(100, base));
  }

  private calculateMagicEffectiveness(attrs: Attributes, characterClass: CharacterClass): number {
    const int = this.getModifier(attrs.INT);
    const wis = this.getModifier(attrs.WIS);
    const cha = this.getModifier(attrs.CHA);

    let base = 0; // Most classes start at 0

    const classBonuses: Record<CharacterClass, number> = {
      'Wizard': 40, 'Cleric': 35, 'Druid': 35, 'Bard': 25, 'Paladin': 15,
      'Ranger': 10, 'Immolator': 20, 'Fighter': 0, 'Thief': 0, 'Barbarian': 0
    };

    base += classBonuses[characterClass] || 0;

    // Attribute bonuses based on class
    if (characterClass === 'Wizard') base += int * 8;
    else if (['Cleric', 'Druid'].includes(characterClass)) base += wis * 8;
    else if (characterClass === 'Bard') base += cha * 8;

    return Math.max(0, Math.min(100, base));
  }

  private calculateSurvivabilityEffectiveness(attrs: Attributes, characterClass: CharacterClass): number {
    const con = this.getModifier(attrs.CON);
    const dex = this.getModifier(attrs.DEX);
    const wis = this.getModifier(attrs.WIS);

    let base = 50;

    const classBonuses: Record<CharacterClass, number> = {
      'Fighter': 20, 'Paladin': 20, 'Barbarian': 25, 'Ranger': 15, 'Druid': 10,
      'Cleric': 15, 'Thief': 5, 'Bard': 5, 'Wizard': -10, 'Immolator': 10
    };

    base += classBonuses[characterClass] || 0;
    base += con * 8; // CON is primary for HP
    base += dex * 3; // DEX helps avoid damage
    base += wis * 2; // WIS for perception of danger

    return Math.max(0, Math.min(100, base));
  }

  private getModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }


}

export interface BuildEffectiveness {
  overall: number;
  combat: number;
  social: number;
  exploration: number;
  magic: number;
  survivability: number;
}

export const characterValidationService = new CharacterValidationService();
