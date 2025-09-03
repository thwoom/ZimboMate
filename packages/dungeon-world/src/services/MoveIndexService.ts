/**
 * Move Index Service-Handles search, filtering, and cross-references for move libraries
 */

import { getAdvancedMovesAtLevel } from '../data/advancedMoves';
import { Attribute, CharacterClass } from '../models/Character';
import { Move, MoveCategory } from '../models/Move';

export interface MoveIndexEntry {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  class?: CharacterClass;
  level?: number;
  rollStat?: Attribute;
  tags: string[];
  source: string;
  page?: number;
  prerequisites?: string[];
  crossReferences: string[]; // IDs of related moves, items, spells
}

export interface MoveSearchFilters {
  category?: MoveCategory[];
  class?: CharacterClass[];
  level?: number[];
  rollStat?: Attribute[];
  tags?: string[];
  source?: string[];
  hasPrerequisites?: boolean;
  hasCrossReferences?: boolean;
}

export interface MoveSearchResult {
  entries: MoveIndexEntry[];
  totalCount: number;
  searchTime: number;
  filters: MoveSearchFilters;
}

export interface MoveIndexStats {
  totalMoves: number;
  byCategory: Record<string, number>;
  byClass: Record<string, number>;
  byLevel: Record < number, number>;
  bySource: Record<string, number>;
  byTag: Record<string, number>;
}

class MoveIndexService {
  private moveIndex: Map < string, MoveIndexEntry> = new Map();
  private searchIndex: Map < string, Set < string>> = new Map(); // term -> move IDs
  private isInitialized = false;

  /**
   * Initialize the move index with all available moves
   */
  async initialize(): Promise < void> {
    if (this.isInitialized) return;

    // Index basic moves
    await this.indexBasicMoves();

    // Index advanced moves for all classes
    await this.indexAdvancedMoves();

    // Index special moves and custom content
    await this.indexSpecialMoves();

    // Index custom moves from storage
    await this.indexCustomContent();

    // Populate cross-references after all moves are indexed
    this.populateCrossReferences();

    // Build search index
    this.buildSearchIndex();

    this.isInitialized = true;
  }

  /**
   * Index basic moves (Defy Danger, Hack and Slash, etc.)
   */
  private async indexBasicMoves(): Promise < void> {
    const basicMoves: Move[] = [
      {
        id: 'defy-danger',
        name: 'Defy Danger',
        category: 'basic',
        description: 'When you act despite an imminent threat or suffer a calamity, you say what you do and roll. If you do it under fire, or in a storm, or while being charged by ogres, you roll + Dex. If you do it while you are being hacked at by a swordsman, you roll + Con. If you do it while you are falling from a cliff, you roll + Str. If you do it while you are being affected by an enemy spell, you roll + Int. If you do it while you are being interrogated by the city watch, you roll + Cha. If you do it while you are being stalked by a pack of wolves, you roll + Wis. On a 10+, you do what you set out to, the threat doesn\'t come to bear. On a 7-9, you stumble, hesitate, or flinch: the GM will offer you a worse outcome, hard bargain, or ugly choice.',
        trigger: 'When you act despite an imminent threat or suffer a calamity',
        triggerType: 'roll',
        rollStat: 'STR', // Default to STR, but can vary based on fiction
        onSuccess: 'You do what you set out to, the threat doesn\'t come to bear.',
        onPartial: 'You stumble, hesitate, or flinch: the GM will offer you a worse outcome, hard bargain, or ugly choice.',
        onFailure: 'Mark XP and the GM makes a move.',
        source: 'Core Rules',
        page: 16,
      },
      {
        id: 'hack-and-slash',
        name: 'Hack and Slash',
        category: 'basic',
        description: 'When you attack an enemy in melee, roll + Str. On a 10+, you deal your damage to the enemy and avoid their attack. At your option, you may choose to do + 1d6 damage but expose yourself to the enemy\'s attack. On a 7-9, you deal your damage to the enemy and the enemy makes an attack against you.',
        trigger: 'When you attack an enemy in melee',
        triggerType: 'roll',
        rollStat: 'STR',
        onSuccess: 'You deal your damage to the enemy and avoid their attack.',
        onPartial: 'You deal your damage to the enemy and the enemy makes an attack against you.',
        onFailure: 'Mark XP and the GM makes a move.',
        source: 'Core Rules',
        page: 16,
      },
      {
        id: 'volley',
        name: 'Volley',
        category: 'basic',
        description: 'When you take aim and shoot at an enemy at range, roll + Dex. On a 10+, you have a clear shot—deal your damage. On a 7-9, choose one (whichever you choose, you deal your damage): You have to move to get the shot placing you in danger as described by the GM, You have to take what you can get: -1d6 damage, You have to take several shots, reducing your ammo by one.',
        trigger: 'When you take aim and shoot at an enemy at range',
        triggerType: 'roll',
        rollStat: 'DEX',
        onSuccess: 'You have a clear shot—deal your damage.',
        onPartial: 'Choose one: move into danger, -1d6 damage, or use extra ammo.',
        onFailure: 'Mark XP and the GM makes a move.',
        source: 'Core Rules',
        page: 17,
      },
    ];

    for (const move of basicMoves) {
      this.indexMove(move);
    }
  }

  /**
   * Index advanced moves for all classes
   */
  private async indexAdvancedMoves(): Promise < void> {
    const classes: CharacterClass[] = ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Ranger', 'Paladin', 'Druid', 'Bard'];

    for (const characterClass of classes) {
      // Get all advanced moves for this class (levels 2-10)
      for (let level = 2; level <= 10; level++) {
        const moves = getAdvancedMovesAtLevel(characterClass, level);
        for (const move of moves) {
          this.indexMove({
            ...move,
            category: 'advanced',
            level: level,
            source: 'Core Rules',
            trigger: move.description.split('.')[0] || 'When you use this move',
            triggerType: 'roll',
          }, characterClass);
        }
      }
    }
  }

  /**
   * Index special moves (racial, multiclass, etc.)
   */
  private async indexSpecialMoves(): Promise < void> {
    // Add racial moves
    const racialMoves: Move[] = [
      {
        id: 'elf-racial',
        name: 'Elf Racial Move',
        category: 'special',
        description: 'Elves are long-lived and graceful, with a deep connection to magic.',
        trigger: 'When you use magic',
        triggerType: 'passive',
        source: 'Core Rules',
      },
      {
        id: 'dwarf-racial',
        name: 'Dwarf Racial Move',
        category: 'special',
        description: 'Dwarves are stout and hardy, with a natural affinity for stone and metal.',
        trigger: 'When you work with stone or metal',
        triggerType: 'passive',
        source: 'Core Rules',
      },
    ];

    for (const move of racialMoves) {
      this.indexMove(move);
    }
  }

  /**
   * Index custom moves from user-created content
   */
  indexCustomMoves(customMoves: unknown[]): void {
    for (const move of customMoves) {
      // Convert custom move format to Move format
      const moveEntry: Move = {
        id: move.id,
        name: move.name,
        category: move.category || 'basic',
        description: move.description,
        trigger: move.trigger || move.description.split('.')[0] || 'When you use this move',
        triggerType: 'roll',
        rollStat: move.rollStat || 'STR',
        onSuccess: move.onSuccess || 'You succeed.',
        onPartial: move.onPartial || 'You succeed with a cost.',
        onFailure: move.onFailure || 'You fail.',
        source: move.source || 'Custom',
        page: move.page,
      };

      this.indexMove(moveEntry, move.class);
    }
  }

  /**
   * Load and index custom content from localStorage
   */
  private async indexCustomContent(): Promise < void> {
    try {
      const customContent = localStorage.getItem('customContent');
      if (customContent) {
        const parsed = JSON.parse(customContent);
        if (parsed.moves && Array.isArray(parsed.moves)) {
          this.indexCustomMoves(parsed.moves);
        }
      }
    } catch {
      }
  }

  /**
   * Refresh custom content in the index
   */
  async refreshCustomContent(): Promise < void> {
    // Remove existing custom moves from index
    const customMoveIds = [...this.moveIndex.keys()].filter(id =>
      this.moveIndex.get(id)?.source === 'Custom',
    );
    for (const id of customMoveIds) this.moveIndex.delete(id);

    // Rebuild search index
    this.buildSearchIndex();

    // Re-index custom content
    await this.indexCustomContent();

    // Rebuild search index again
    this.buildSearchIndex();
  }

  /**
   * Index a single move into the search index
   */
  private indexMove(move: Move, characterClass?: CharacterClass): void {
    const entry: MoveIndexEntry = {
      id: move.id,
      name: move.name,
      description: move.description,
      category: move.category,
      class: characterClass,
      level: move.level,
      rollStat: move.rollStat,
      tags: this.extractTags(move, characterClass),
      source: move.source || 'Core Rules',
      page: move.page,
      prerequisites: move.requiresMove ? [move.requiresMove] : undefined,
      crossReferences: [], // Initialize empty, will be populated later
    };

    this.moveIndex.set(move.id, entry);
  }

  /**
   * Extract tags from move data
   */
  private extractTags(move: Move, characterClass?: CharacterClass): string[] {
    const tags: string[] = [];

    // Category tags
    tags.push(move.category);

    // Class tags
    if (characterClass) {
      tags.push(characterClass.toLowerCase());
    }

    // Level tags
    if (move.level) {
      tags.push(`level-${move.level}`);
      if (move.level <= 3) tags.push('low-level');
      if (move.level >= 7) tags.push('high-level');
    }

    // Stat tags
    if (move.rollStat) {
      tags.push(move.rollStat.toLowerCase());

      // Special case for Defy Danger which can use multiple stats
      if (move.id === 'defy-danger') {
        tags.push('varies');
      }
    }

    // Special tags
    if (move.ongoing) tags.push('ongoing');
    if (move.forward) tags.push('forward');
    if (move.hold) tags.push('hold');

    return tags;
  }

  /**
   * Find cross-references to other moves, items, or spells
   */
  private findCrossReferences(move: Move): string[] {
    const references: string[] = [];

    // Look for references in description
    const description = move.description.toLowerCase();

    // Check for move references
    for (const [id, entry] of this.moveIndex.entries()) {
      if (description.includes(entry.name.toLowerCase())) {
        references.push(id);
      }
    }

    return references;
  }

  /**
   * Populate cross-references for all moves after indexing is complete
   */
  private populateCrossReferences(): void {
    for (const [id, entry] of this.moveIndex.entries()) {
      const move: Move = {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        category: entry.category,
        trigger: entry.description.split('.')[0] || 'When you use this move',
        triggerType: 'roll',
        rollStat: entry.rollStat,
        source: entry.source,
        page: entry.page,
      };

      entry.crossReferences = this.findCrossReferences(move);
    }
  }

  /**
   * Build the search index for fast text search
   */
  private buildSearchIndex(): void {
    for (const [id, entry] of this.moveIndex.entries()) {
      // Index by name
      this.addToSearchIndex(entry.name.toLowerCase(), id);

      // Index by description words
      const words = entry.description.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2) { // Only index words longer than 2 characters
          this.addToSearchIndex(word, id);
        }
      }

      // Index by tags
      for (const tag of entry.tags) {
        this.addToSearchIndex(tag.toLowerCase(), id);
      }
    }
  }

  /**
   * Add a term to the search index
   */
  private addToSearchIndex(term: string, moveId: string): void {
    if (!this.searchIndex.has(term)) {
      this.searchIndex.set(term, new Set());
    }
    this.searchIndex.get(term)!.add(moveId);
  }

  /**
   * Search moves with filters
   */
  async searchMoves(
    query = '',
    filters: MoveSearchFilters = {},
    limit = 50,
  ): Promise < MoveSearchResult> {
    const startTime = performance.now();

    // Ensure index is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    let results = [...this.moveIndex.values()];

    // Apply text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      const matchingIds = new Set < string>();

      // First try exact phrase match
      if (this.searchIndex.has(query.toLowerCase())) {
        for (const id of this.searchIndex.get(query.toLowerCase())!) {
          matchingIds.add(id);
        }
      }

      // Then try individual word matches
      for (const term of searchTerms) {
        if (this.searchIndex.has(term)) {
          for (const id of this.searchIndex.get(term)!) {
            matchingIds.add(id);
          }
        }
      }

      results = results.filter(entry => matchingIds.has(entry.id));
    }

    // Apply filters
    if (filters.category?.length) {
      results = results.filter(entry => filters.category!.includes(entry.category));
    }

    if (filters.class?.length) {
      results = results.filter(entry => entry.class && filters.class!.includes(entry.class));
    }

    if (filters.level?.length) {
      results = results.filter(entry => entry.level && filters.level!.includes(entry.level));
    }

    if (filters.rollStat?.length) {
      results = results.filter(entry => entry.rollStat && filters.rollStat!.includes(entry.rollStat));
    }

    if (filters.tags?.length) {
      results = results.filter(entry =>
        filters.tags!.some(tag => entry.tags.includes(tag)),
      );
    }

    if (filters.source?.length) {
      results = results.filter(entry => filters.source!.includes(entry.source));
    }

    if (filters.hasPrerequisites !== undefined) {
      results = results.filter(entry =>
        filters.hasPrerequisites ? entry.prerequisites && entry.prerequisites.length > 0 : !entry.prerequisites?.length,
      );
    }

    if (filters.hasCrossReferences !== undefined) {
      results = results.filter(entry =>
        filters.hasCrossReferences ? entry.crossReferences.length > 0 : entry.crossReferences.length === 0,
      );
    }

    // Sort by relevance (exact name matches first, then partial matches, then alphabetically)
    results.sort((a, b) => {
      const queryLower = query.toLowerCase();
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();

      const aExactMatch = aNameLower === queryLower;
      const bExactMatch = bNameLower === queryLower;
      const aStartsWith = aNameLower.startsWith(queryLower);
      const bStartsWith = bNameLower.startsWith(queryLower);
      const aContains = aNameLower.includes(queryLower);
      const bContains = bNameLower.includes(queryLower);

      // Exact matches first
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then starts with matches
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then contains matches
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      // Finally alphabetical
      return a.name.localeCompare(b.name);
    });

    // Apply limit
    const limitedResults = results.slice(0, limit);

    const endTime = performance.now();

    return {
      entries: limitedResults,
      totalCount: results.length,
      searchTime: endTime-startTime,
      filters,
    };
  }

  /**
   * Get move by ID
   */
  async getMove(id: string): Promise < MoveIndexEntry | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.moveIndex.get(id) || null;
  }

  /**
   * Get moves by class
   */
  async getMovesByClass(characterClass: string): Promise < MoveIndexEntry[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return [...this.moveIndex.values()]
      .filter(entry => entry.class === characterClass)
      .sort((a, b) => (a.level || 0) - (b.level || 0));
  }

  /**
   * Get moves by category
   */
  async getMovesByCategory(category: string): Promise < MoveIndexEntry[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return [...this.moveIndex.values()]
      .filter(entry => entry.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise < MoveIndexStats> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const stats: MoveIndexStats = {
      totalMoves: this.moveIndex.size,
      byCategory: {},
      byClass: {},
      byLevel: {},
      bySource: {},
      byTag: {},
    };

    for (const entry of this.moveIndex) {
      // Count by category
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;

      // Count by class
      if (entry.class) {
        stats.byClass[entry.class] = (stats.byClass[entry.class] || 0) + 1;
      }

      // Count by level
      if (entry.level) {
        stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      }

      // Count by source
      stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;

      // Count by tags
      for (const tag of entry.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * Get all available tags
   */
  async getAvailableTags(): Promise < string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const tags = new Set < string>();
    for (const entry of this.moveIndex) {
      for (const tag of entry.tags) tags.add(tag);
    }

    return [...tags].sort();
  }

  /**
   * Get all available sources
   */
  async getAvailableSources(): Promise < string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const sources = new Set < string>();
    for (const entry of this.moveIndex) {
      sources.add(entry.source);
    }

    return [...sources].sort();
  }
}

export const moveIndexService = new MoveIndexService();
export default moveIndexService;



