/**
 * Service for managing advanced character options * Handles compendium classes, race moves, multiclassing, and validation
 */

import {
  AdvancedCharacterTemplate,
  AdvancedOption,
  CompendiumClass,
  MulticlassConfig,
  RaceMove,
  ValidationResult,
} from '../models/AdvancedCharacterOptions';
import { Attribute,Character, Race } from '../models/Character';

// Sample compendium classes (these would come from official supplements)
export const COMPENDIUM_CLASSES: CompendiumClass[] = [
  {
    id: 'death-touched',
    name: 'Death-Touched',
    description: 'You have been to the Underworld and returned, forever marked by death.',
    source: 'Class Warfare',
    page: 45,
    requirements: {
      level: 2,
      narrative: 'Must have been to the Underworld and returned',
      attributes: { CON: 13 },
    },
    benefits: {
      moves: ['death-touched-resilience', 'death-touched-sight'],
      attributeBonuses: { CON: 1 },
      specialAbilities: ['Cannot be surprised by undead', 'Resistance to necrotic damage'],
    },
    advancement: {
      level2: ['death-touched-resilience', 'death-touched-sight'],
      level3: ['death-touched-command'],
      level4: ['death-touched-mastery'],
    },
    conflicts: {
      classes: ['Paladin'], // Conflicts with holy classes
      compendiumClasses: ['life-touched'],
    },
  },
  {
    id: 'dragon-blooded',
    name: 'Dragon-Blooded',
    description: 'You carry the blood of dragons, granting you draconic abilities.',
    source: 'Class Warfare',
    page: 52,
    requirements: {
      level: 2,
      narrative: 'Must have dragon ancestry or have been exposed to dragon magic',
      attributes: { CHA: 13 },
    },
    benefits: {
      moves: ['dragon-breath', 'dragon-scales'],
      attributeBonuses: { CHA: 1 },
      specialAbilities: ['Resistance to fire damage', 'Can speak Draconic'],
    },
    advancement: {
      level2: ['dragon-breath', 'dragon-scales'],
      level3: ['dragon-wings'],
      level4: ['dragon-form'],
    },
  },
];

// Sample race moves
export const RACE_MOVES: RaceMove[] = [
  {
    id: 'elf-heritage',
    name: 'Elf Heritage',
    description: 'Your elven blood grants you special abilities.',
    race: 'Elf',
    source: 'Core Rules',
    page: 15,
    requirements: {
      level: 1,
    },
    benefits: {
      moveId: 'elf-heritage-move',
      attributeBonuses: { DEX: 1 },
      specialAbilities: ['Darkvision', 'Resistance to charm effects'],
    },
  },
  {
    id: 'dwarf-stonecunning',
    name: 'Dwarf Stonecunning',
    description: 'Your dwarven heritage gives you mastery over stone and metal.',
    race: 'Dwarf',
    source: 'Core Rules',
    page: 16,
    requirements: {
      level: 1,
    },
    benefits: {
      moveId: 'dwarf-stonecunning-move',
      attributeBonuses: { CON: 1 },
      specialAbilities: ['Darkvision', 'Stonecunning (advantage on stone / metal related rolls)'],
    },
  },
  {
    id: 'halfling-luck',
    name: 'Halfling Luck',
    description: 'Your halfling luck helps you avoid danger.',
    race: 'Halfling',
    source: 'Core Rules',
    page: 17,
    requirements: {
      level: 1,
    },
    benefits: {
      moveId: 'halfling-luck-move',
      attributeBonuses: { DEX: 1 },
      specialAbilities: ['Lucky (reroll 1s on damage dice)', 'Nimble (advantage on DEX saves)'],
    },
  },
];

// Sample advanced character templates
export const ADVANCED_TEMPLATES: AdvancedCharacterTemplate[] = [
  {
    id: 'death-knight',
    name: 'Death Knight',
    description: 'A fallen paladin who has embraced death magic.',
    level: 3,
    base: {
      class: 'Paladin',
      race: 'Human',
      attributes: { STR: 15, CON: 14, CHA: 13 },
      startingMoves: ['Lay on Hands', 'Armored'],
      startingEquipment: [],
    },
    advanced: {
      compendiumClasses: ['death-touched'],
      raceMoves: [],
      customMoves: ['death-knight-aura'],
    },
    narrative: {
      background: 'A former paladin who fell from grace and now serves death itself.',
      personalityTraits: ['Brooding', 'Honorable despite corruption', 'Seeking redemption'],
      bonds: ['I will protect the innocent, even in death', 'I seek to understand my dark powers'],
      alignment: 'Lawful',
    },
    tags: ['dark', 'tank', 'magical'],
    difficulty: 'intermediate',
    estimatedPlaytime: '3-5 sessions to master',
  },
  {
    id: 'dragon-sorcerer',
    name: 'Dragon Sorcerer',
    description: 'A wizard with draconic heritage.',
    level: 2,
    base: {
      class: 'Wizard',
      race: 'Human',
      attributes: { INT: 16, CHA: 14, CON: 12 },
      startingMoves: ['Spellbook', 'Prepare Spells'],
      startingEquipment: [],
    },
    advanced: {
      compendiumClasses: ['dragon-blooded'],
      raceMoves: [],
      customMoves: ['dragon-magic'],
    },
    narrative: {
      background: 'A wizard who discovered their draconic ancestry.',
      personalityTraits: ['Proud', 'Scholarly', 'Draconic mannerisms'],
      bonds: ['I seek to master both arcane and draconic magic', 'I protect ancient knowledge'],
      alignment: 'Neutral',
    },
    tags: ['magical', 'caster', 'dragon'],
    difficulty: 'advanced',
    estimatedPlaytime: '5 + sessions to master',
  },
];

class AdvancedCharacterOptionsService {
  /**
   * Get all available compendium classes
   */
  getAllCompendiumClasses(): CompendiumClass[] {
    return COMPENDIUM_CLASSES;
  }

  /**
   * Get compendium class by ID
   */
  getCompendiumClass(id: string): CompendiumClass | undefined {
    return COMPENDIUM_CLASSES.find(cc => cc.id === id);
  }

  /**
   * Get all race moves for a specific race
   */
  getRaceMoves(race: Race): RaceMove[] {
    return RACE_MOVES.filter(rm => rm.race === race);
  }

  /**
   * Get race move by ID
   */
  getRaceMove(id: string): RaceMove | undefined {
    return RACE_MOVES.find(rm => rm.id === id);
  }

  /**
   * Get all advanced character templates
   */
  getAllTemplates(): AdvancedCharacterTemplate[] {
    return ADVANCED_TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): AdvancedCharacterTemplate | undefined {
    return ADVANCED_TEMPLATES.find(t => t.id === id);
  }

  /**
   * Get templates by difficulty level
   */
  getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): AdvancedCharacterTemplate[] {
    return ADVANCED_TEMPLATES.filter(t => t.difficulty === difficulty);
  }

  /**
   * Get templates by tags
   */
  getTemplatesByTags(tags: string[]): AdvancedCharacterTemplate[] {
    return ADVANCED_TEMPLATES.filter(t =>
      tags.some(tag => t.tags.includes(tag)),
    );
  }

  /**
   * Check if a character meets the requirements for a compendium class
   */
  canTakeCompendiumClass(
    character: Character,
    compendiumClass: CompendiumClass,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: string[] = [];

    // Check level requirement
    if (character.level < compendiumClass.requirements.level) {
      errors.push(`Requires level ${compendiumClass.requirements.level}, character is level ${character.level}`);
    }

    // Check class requirements
    if (compendiumClass.requirements.class &&
        !compendiumClass.requirements.class.includes(character.class)) {
      errors.push(`Requires one of: ${compendiumClass.requirements.class.join(', ')}`);
    }

    // Check race requirements
    if (compendiumClass.requirements.race &&
        !compendiumClass.requirements.race.includes(character.race)) {
      errors.push(`Requires one of: ${compendiumClass.requirements.race.join(', ')}`);
    }

    // Check attribute requirements
    if (compendiumClass.requirements.attributes) {
      for (const [attr, minValue] of Object.entries(compendiumClass.requirements.attributes)) {
        if (character.attributes[attr as Attribute] < minValue) {
          errors.push(`Requires ${attr} ${minValue}+`);
        }
      }
    }

    // Check move requirements
    if (compendiumClass.requirements.moves) {
      for (const moveId of compendiumClass.requirements.moves) {
        if (!character.knownMoves.includes(moveId)) {
          errors.push(`Requires move: ${moveId}`);
        }
      }
    }

    // Check conflicts
    if (compendiumClass.conflicts?.classes?.includes(character.class)) {
      conflicts.push(`Conflicts with class: ${character.class}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      conflicts,
    };
  }

  /**
   * Check if a character can take a race move
   */
  canTakeRaceMove(
    character: Character,
    raceMove: RaceMove,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: string[] = [];

    // Check race requirement
    if (character.race !== raceMove.race) {
      errors.push(`Requires race: ${raceMove.race}`);
    }

    // Check level requirement
    if (raceMove.requirements?.level && character.level < raceMove.requirements.level) {
      errors.push(`Requires level ${raceMove.requirements.level}`);
    }

    // Check attribute requirements
    if (raceMove.requirements?.attributes) {
      for (const [attr, minValue] of Object.entries(raceMove.requirements.attributes)) {
        if (character.attributes[attr as Attribute] < minValue) {
          errors.push(`Requires ${attr} ${minValue}+`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      conflicts,
    };
  }

  /**
   * Validate a character's advanced options
   */
  validateAdvancedCharacter(character: Character & {
    compendiumClasses?: string[];
    raceMoves?: string[];
    multiclassConfig?: MulticlassConfig;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: string[] = [];

    // Validate compendium classes
    if (character.compendiumClasses) {
      for (const ccId of character.compendiumClasses) {
        const cc = this.getCompendiumClass(ccId);
        if (!cc) {
          errors.push(`Unknown compendium class: ${ccId}`);
          continue;
        }

        const validation = this.canTakeCompendiumClass(character, cc);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
        conflicts.push(...validation.conflicts);
      }
    }

    // Validate race moves
    if (character.raceMoves) {
      for (const rmId of character.raceMoves) {
        const rm = this.getRaceMove(rmId);
        if (!rm) {
          errors.push(`Unknown race move: ${rmId}`);
          continue;
        }

        const validation = this.canTakeRaceMove(character, rm);
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
        conflicts.push(...validation.conflicts);
      }
    }

    // Validate multiclass configuration
    if (character.multiclassConfig) {
      const mc = character.multiclassConfig;

      if (character.level < mc.rules.levelRequirement) {
        errors.push(`Multiclassing requires level ${mc.rules.levelRequirement}`);
      }

      if (mc.primaryClass === mc.secondaryClass) {
        errors.push('Primary and secondary classes must be different');
      }

      // Check attribute requirements
      if (mc.rules.attributeRequirements) {
        for (const [attr, minValue] of Object.entries(mc.rules.attributeRequirements)) {
          if (character.attributes[attr as Attribute] < minValue) {
            errors.push(`Multiclassing requires ${attr} ${minValue}+`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      conflicts,
    };
  }

  /**
   * Get available advanced options for a character
   */
  getAvailableOptions(character: Character): AdvancedOption[] {
    const options: AdvancedOption[] = [];

    // Get available compendium classes
    for (const cc of COMPENDIUM_CLASSES) {
      const validation = this.canTakeCompendiumClass(character, cc);
      if (validation.valid) {
        options.push({
          type: 'compendium-class',
          id: cc.id,
          name: cc.name,
          description: cc.description,
          requirements: cc.requirements,
          benefits: cc.benefits,
          conflicts: cc.conflicts,
        });
      }
    }

    // Get available race moves
    for (const rm of RACE_MOVES) {
      const validation = this.canTakeRaceMove(character, rm);
      if (validation.valid) {
        options.push({
          type: 'race-move',
          id: rm.id,
          name: rm.name,
          description: rm.description,
          requirements: rm.requirements,
          benefits: rm.benefits,
          conflicts: rm.conflicts,
        });
      }
    }

    return options;
  }

  /**
   * Apply a compendium class to a character
   */
  applyCompendiumClass(character: Character, compendiumClassId: string): Character {
    const cc = this.getCompendiumClass(compendiumClassId);
    if (!cc) {
      throw new Error(`Unknown compendium class: ${compendiumClassId}`);
    }

    const validation = this.canTakeCompendiumClass(character, cc);
    if (!validation.valid) {
      throw new Error(`Cannot take compendium class: ${validation.errors.join(', ')}`);
    }

    // Apply benefits
    const updatedCharacter =  { ...character };

    // Add moves
    updatedCharacter.knownMoves = [...updatedCharacter.knownMoves, ...cc.benefits.moves];

    // Apply attribute bonuses
    if (cc.benefits.attributeBonuses) {
      for (const [attr, bonus] of Object.entries(cc.benefits.attributeBonuses)) {
        updatedCharacter.attributes[attr as Attribute] += bonus;
      }
    }

    // Add to compendium classes list
    if (!updatedCharacter.compendiumClasses) {
      updatedCharacter.compendiumClasses = [];
    }
    updatedCharacter.compendiumClasses.push(compendiumClassId);

    return updatedCharacter;
  }

  /**
   * Apply a race move to a character
   */
  applyRaceMove(character: Character, raceMoveId: string): Character {
    const rm = this.getRaceMove(raceMoveId);
    if (!rm) {
      throw new Error(`Unknown race move: ${raceMoveId}`);
    }

    const validation = this.canTakeRaceMove(character, rm);
    if (!validation.valid) {
      throw new Error(`Cannot take race move: ${validation.errors.join(', ')}`);
    }

    // Apply benefits
    const updatedCharacter = { ...character };

    // Add move if specified
    if (rm.benefits.moveId) {
      updatedCharacter.knownMoves = [...updatedCharacter.knownMoves, rm.benefits.moveId];
    }

    // Apply attribute bonuses
    if (rm.benefits.attributeBonuses) {
      for (const [attr, bonus] of Object.entries(rm.benefits.attributeBonuses)) {
        updatedCharacter.attributes[attr as Attribute] += bonus;
      }
    }

    // Add to race moves list
    if (!updatedCharacter.raceMoves) {
      updatedCharacter.raceMoves = [];
    }
    updatedCharacter.raceMoves.push(raceMoveId);

    return updatedCharacter;
  }
}

// Export singleton instance
export const advancedCharacterOptionsService = new AdvancedCharacterOptionsService();



