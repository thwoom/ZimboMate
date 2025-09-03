/**
 * Enhanced Spell Compendium Service
 *
 * Provides comprehensive spell management, search, filtering, and comparison * functionality for the Dungeon World control panel.
 */

import {
  CompendiumSpell,
  getSpellById,
  getSpellsByClass,
  searchSpells,
  SPELL_COMPENDIUM,
  SpellCategory,
  SpellLevel,
  SpellSchool,
} from '../data/spellCompendium';
import { Character, CharacterClass } from '../models/Character';

// Spell search and filter options
export interface SpellSearchOptions {
  query?: string;
  class?: CharacterClass;
  level?: SpellLevel;
  category?: SpellCategory;
  school?: SpellSchool;
  tags?: string[];
  maxLevel?: number;
  minLevel?: number;
}

// Spell comparison data
export interface SpellComparison {
  spell1: CompendiumSpell;
  spell2: CompendiumSpell;
  differences: {
    level: { spell1: SpellLevel; spell2: SpellLevel };
    school: { spell1: SpellSchool; spell2: SpellSchool };
    range: { spell1: string; spell2: string };
    duration: { spell1: string; spell2: string };
    tags: { spell1: string[]; spell2: string[] };
  };
  similarities: string[];
}

// Spell usage statistics
export interface SpellUsageStats {
  spellId: string;
  timesCast: number;
  lastCast?: Date;
  successRate: number;
  averageRoll: number;
  consequences: Record<string, number>;
}

// Spell preparation validation
export interface SpellPreparationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalLevels: number;
  maxLevels: number;
  remainingLevels: number;
  cantripsCount: number;
  leveledSpellsCount: number;
}

class SpellCompendiumService {

  /**
   * Get all spells with optional filtering
   */
  getAllSpells(options: SpellSearchOptions = {}): CompendiumSpell[] {
    let spells = SPELL_COMPENDIUM;

    // Filter by class
    if (options.class) {
      spells = spells.filter(spell => spell.category === options.class?.toLowerCase());
    }

    // Filter by level
    if (options.level !== undefined) {
      spells = spells.filter(spell => spell.level === options.level);
    }

    // Filter by category
    if (options.category) {
      spells = spells.filter(spell => spell.category === options.category);
    }

    // Filter by school
    if (options.school) {
      spells = spells.filter(spell => spell.school === options.school);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      spells = spells.filter(spell =>
        options.tags!.some(tag => spell.tags.includes(tag)),
      );
    }

    // Filter by level range
    if (options.maxLevel !== undefined) {
      spells = spells.filter(spell => spell.level <= options.maxLevel!);
    }
    if (options.minLevel !== undefined) {
      spells = spells.filter(spell => spell.level >= options.minLevel!);
    }

    // Search by query
    if (options.query) {
      spells = searchSpells(options.query);
    }

    return spells;
  }

  /**
   * Get spells available for a character based on their class and level
   */
  getAvailableSpells(character: Character): CompendiumSpell[] {
    const classSpells = getSpellsByClass(character.class);

    // Filter by character level (can't prepare spells higher than character level)
    return classSpells.filter(spell => spell.level <= character.level);
  }

  /**
   * Get cantrips / rotes for a character (level 0 spells)
   */
  getCantrips(character: Character): CompendiumSpell[] {
    return this.getAvailableSpells(character).filter(spell => spell.level === 0);
  }

  /**
   * Get leveled spells for a character (level 1 + spells)
   */
  getLeveledSpells(character: Character): CompendiumSpell[] {
    return this.getAvailableSpells(character).filter(spell => spell.level > 0);
  }

  /**
   * Validate spell preparation for a character
   */
  validateSpellPreparation(
    character: Character,
    preparedSpellIds: string[],
  ): SpellPreparationValidation {
    const preparedSpells = preparedSpellIds
      .map(id => getSpellById(id))
      .filter((spell): spell is CompendiumSpell => spell !== undefined);

    const cantrips = preparedSpells.filter(spell => spell.level === 0);
    const leveledSpells = preparedSpells.filter(spell => spell.level > 0);

    const totalLevels = leveledSpells.reduce((sum, spell) => sum + spell.level, 0);
    const maxLevels = character.level + 1;
    const remainingLevels = maxLevels-totalLevels;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if total levels exceed limit
    if (totalLevels > maxLevels) {
      errors.push(`Total spell levels (${totalLevels}) exceed your limit (${maxLevels})`);
    }

    // Check if unknown spells are higher than character level
    const tooHighSpells = preparedSpells.filter(spell => spell.level > character.level);
    if (tooHighSpells.length > 0) {
      errors.push(`Cannot prepare spells higher than your level: ${tooHighSpells.map(s => s.name).join(', ')}`);
    }

    // Check if spells are from wrong class
    const wrongClassSpells = preparedSpells.filter(spell => spell.category !== character.class.toLowerCase());
    if (wrongClassSpells.length > 0) {
      errors.push(`Cannot prepare spells from other classes: ${wrongClassSpells.map(s => s.name).join(', ')}`);
    }

    // Warnings for inefficient preparation
    if (remainingLevels > 0 && remainingLevels <= 2) {
      warnings.push(`You have ${remainingLevels} spell level(s) remaining`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalLevels,
      maxLevels,
      remainingLevels,
      cantripsCount: cantrips.length,
      leveledSpellsCount: leveledSpells.length,
    };
  }

  /**
   * Compare two spells side by side
   */
  compareSpells(spell1Id: string, spell2Id: string): SpellComparison | null {
    const spell1 = getSpellById(spell1Id);
    const spell2 = getSpellById(spell2Id);

    if (!spell1 || !spell2) {
      return null;
    }

    const similarities: string[] = [];

    // Find similarities
    if (spell1.level === spell2.level) {
      similarities.push(`Same level (${spell1.level})`);
    }
    if (spell1.school === spell2.school) {
      similarities.push(`Same school (${spell1.school})`);
    }
    if (spell1.range === spell2.range) {
      similarities.push(`Same range (${spell1.range})`);
    }
    if (spell1.duration === spell2.duration) {
      similarities.push(`Same duration (${spell1.duration})`);
    }

    const commonTags = spell1.tags.filter(tag => spell2.tags.includes(tag));
    if (commonTags.length > 0) {
      similarities.push(`Common tags: ${commonTags.join(', ')}`);
    }

    return {
      spell1,
      spell2,
      differences: {
        level: { spell1: spell1.level, spell2: spell2.level },
        school: { spell1: spell1.school, spell2: spell2.school },
        range: { spell1: spell1.range || 'N / A', spell2: spell2.range || 'N / A' },
        duration: { spell1: spell1.duration || 'N / A', spell2: spell2.duration || 'N / A' },
        tags: { spell1: spell1.tags, spell2: spell2.tags },
      },
      similarities,
    };
  }

  /**
   * Get spell recommendations for a character
   */
  getSpellRecommendations(character: Character): {
    offensive: CompendiumSpell[];
    defensive: CompendiumSpell[];
    utility: CompendiumSpell[];
    healing: CompendiumSpell[];
  } {
    const availableSpells = this.getAvailableSpells(character);

    return {
      offensive: availableSpells.filter(spell =>
        spell.tags.includes('damage') ||
        spell.tags.includes('fire') ||
        spell.tags.includes('force'),
      ),
      defensive: availableSpells.filter(spell =>
        spell.tags.includes('protection') ||
        spell.tags.includes('defense') ||
        spell.tags.includes('armor') ||
        spell.tags.includes('barrier'),
      ),
      utility: availableSpells.filter(spell =>
        spell.tags.includes('utility') ||
        spell.tags.includes('movement') ||
        spell.tags.includes('detection'),
      ),
      healing: availableSpells.filter(spell =>
        spell.tags.includes('healing') ||
        spell.tags.includes('restoration'),
      ),
    };
  }

  /**
   * Get spell statistics and usage data
   */
  getSpellUsageStats(character: Character): SpellUsageStats[] {
    // This would integrate with actual usage tracking
    // For now, return empty stats
    const availableSpells = this.getAvailableSpells(character);

    return availableSpells.map(spell => ({
      spellId: spell.id,
      timesCast: 0,
      successRate: 0,
      averageRoll: 0,
      consequences: {},
    }));
  }

  /**
   * Get spell prerequisites and requirements
   */
  getSpellPrerequisites(spell: CompendiumSpell): string[] {
    const prerequisites: string[] = [];

    // Level requirements
    if (spell.level > 0) {
      prerequisites.push(`Character level ${spell.level} or higher`);
    }

    // Class requirements
    prerequisites.push(`${spell.category.charAt(0).toUpperCase() + spell.category.slice(1)} class`);

    // Custom prerequisites
    if (spell.prerequisites) {
      prerequisites.push(...spell.prerequisites);
    }

    return prerequisites;
  }

  /**
   * Get spell consequences for 7-9 rolls
   */
  getSpellConsequences(spell: CompendiumSpell): string[] {
    const baseConsequences = [
      'Draw unwelcome attention or put yourself in a spot',
      'The spell has an unintended effect',
      'The spell takes longer to cast than expected',
    ];

    return spell.consequences || baseConsequences;
  }

  /**
   * Get spell schools for filtering
   */
  getSpellSchools(): SpellSchool[] {
    return [
      'abjuration',
      'conjuration',
      'divination',
      'enchantment',
      'evocation',
      'illusion',
      'necromancy',
      'transmutation',
    ];
  }

  /**
   * Get spell levels for filtering
   */
  getSpellLevels(): SpellLevel[] {
    return [0, 1, 3, 5, 7, 9];
  }

  /**
   * Get common spell tags for filtering
   */
  getCommonTags(): string[] {
    const allTags = SPELL_COMPENDIUM.flatMap(spell => spell.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }

  /**
   * Export spell data for external use
   */
  exportSpellData(spells: CompendiumSpell[]): string {
    return JSON.stringify(spells, null, 2);
  }

  /**
   * Import spell data from external source
   */
  importSpellData(data: string): CompendiumSpell[] {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
}

export const spellCompendiumService = new SpellCompendiumService();



