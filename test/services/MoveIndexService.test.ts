/**
 * Unit tests for MoveIndexService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  moveIndexService,
  MoveSearchFilters,
  MoveIndexEntry,
} from '../../src / services / MoveIndexService';

// Mock the advanced moves data
vi.mock('../../src / data / advancedMoves', () => ({
  getAdvancedMovesForClass: vi.fn(),
  getAdvancedMovesAtLevel: vi.fn((characterClass: string, level: number) => [
    {
      id: `${characterClass.toLowerCase()}-advanced-${level}`,
      name: `Test ${characterClass} Move Level ${level}`,
      description: `A test advanced move for ${characterClass} at level ${level}`,
      category: 'advanced',
      class: characterClass,
      level: level,
      source: 'Core Rules',
      page: 25,
    },
  ]),
}));

describe('MoveIndexService', () => {
  beforeEach(async() => {
    // Reset the service before each test
    await moveIndexService.initialize();
  });

  describe('initialization', () => {
    it('should initialize the move index', async() => {
      const _stats = await moveIndexService.getIndexStats();
      expect(stats.totalMoves).toBeGreaterThan(0);
    });

    it('should index basic moves', async() => {
      const basicMoves = await moveIndexService.getMovesByCategory('basic');
      expect(basicMoves.length).toBeGreaterThan(0);
      expect(basicMoves.some(move => move.name === 'Defy Danger')).toBe(true);
    });

    it('should index advanced moves', async() => {
      const advancedMoves = await moveIndexService.getMovesByCategory('advanced');
      expect(advancedMoves.length).toBeGreaterThan(0);
    });
  });

  describe('search functionality', () => {
    it('should search moves by name', async() => {
      const _results = await moveIndexService.searchMoves('Defy Danger');
      expect(results.entries.length).toBeGreaterThan(0);
      expect(results.entries[0].name).toContain('Defy Danger');
    });

    it('should search moves by description keywords', async() => {
      const _results = await moveIndexService.searchMoves('threat');
      expect(results.entries.length).toBeGreaterThan(0);
      expect(results.entries.some(move =>
        move.description.toLowerCase().includes('threat'),
      )).toBe(true);
    });

    it('should return empty results for non - existent search', async() => {
      const _results = await moveIndexService.searchMoves('nonexistentmove');
      expect(results.entries.length).toBe(0);
    });

    it('should respect search limits', async() => {
      const _results = await moveIndexService.searchMoves('', {}, 1);
      expect(results.entries.length).toBeLessThanOrEqual(1);
    });
  });

  describe('filtering', () => {
    it('should filter by category', async() => {
      const filters: MoveSearchFilters = {
        category: ['basic'],
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(results.entries.every(move => move.category === 'basic')).toBe(true);
    });

    it('should filter by class', async() => {
      const filters: MoveSearchFilters = {
        class: ['Fighter'],
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(results.entries.every(move => move.class === 'Fighter')).toBe(true);
    });

    it('should filter by roll stat', async() => {
      const filters: MoveSearchFilters = {
        rollStat: ['STR'],
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(results.entries.every(move => move.rollStat === 'STR')).toBe(true);
    });

    it('should filter by level range', async() => {
      const filters: MoveSearchFilters = {
        level: [2, 3],
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(results.entries.every(move =>
        move.level && move.level >= 2 && move.level <= 3,
      )).toBe(true);
    });

    it('should combine multiple filters', async() => {
      const filters: MoveSearchFilters = {
        category: ['advanced'],
        class: ['Fighter'],
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(results.entries.every(move =>
        move.category === 'advanced' && move.class === 'Fighter',
      )).toBe(true);
    });
  });

  describe('move retrieval', () => {
    it('should get move by ID', async() => {
      const _move = await moveIndexService.getMove('defy - danger');
      expect(move).not.toBeNull();
      expect(move?.name).toBe('Defy Danger');
    });

    it('should return null for non - existent move ID', async() => {
      const _move = await moveIndexService.getMove('nonexistent - id');
      expect(move).toBeNull();
    });

    it('should get moves by class', async() => {
      const _moves = await moveIndexService.getMovesByClass('Fighter');
      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(move => move.class === 'Fighter')).toBe(true);
    });

    it('should get moves by category', async() => {
      const moves = await moveIndexService.getMovesByCategory('basic');
      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(move => move.category === 'basic')).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should provide index statistics', async() => {
      const _stats = await moveIndexService.getIndexStats();

      expect(stats.totalMoves).toBeGreaterThan(0);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byClass).toBeDefined();
      expect(stats.byLevel).toBeDefined();
      expect(stats.bySource).toBeDefined();
      expect(stats.byTag).toBeDefined();
    });

    it('should count moves by category', async() => {
      const _stats = await moveIndexService.getIndexStats();
      expect(stats.byCategory.basic).toBeGreaterThan(0);
    });

    it('should count moves by class', async() => {
      const stats = await moveIndexService.getIndexStats();
      expect(stats.byClass.Fighter).toBeGreaterThan(0);
    });
  });

  describe('tags and sources', () => {
    it('should provide available tags', async() => {
      const tags = await moveIndexService.getAvailableTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toContain('basic');
      expect(tags).toContain('advanced');
    });

    it('should provide available sources', async() => {
      const sources = await moveIndexService.getAvailableSources();
      expect(sources.length).toBeGreaterThan(0);
      expect(sources).toContain('Core Rules');
    });
  });

  describe('cross - references', () => {
    it('should find cross - references in move descriptions', async() => {
      const _move = await moveIndexService.getMove('defy - danger');
      expect(move?.crossReferences).toBeDefined();
      expect(Array.isArray(move?.crossReferences)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should complete searches quickly', async() => {
      const _startTime = performance.now();
      await moveIndexService.searchMoves('defy');
      const _endTime = performance.now();

      const _searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle large result sets efficiently', async() => {
      const startTime = performance.now();
      const _results = await moveIndexService.searchMoves('', {}, 100);
      const endTime = performance.now();

      const searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe('move indexing', () => {
    it('should extract tags correctly', async() => {
      const _move = await moveIndexService.getMove('defy - danger');
      expect(move?.tags).toContain('basic');
      expect(move?.tags).toContain('varies');
    });

    it('should handle moves with prerequisites', async() => {
      const filters: MoveSearchFilters = {
        hasPrerequisites: true,
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(Array.isArray(results.entries)).toBe(true);
    });

    it('should handle moves with cross - references', async() => {
      const filters: MoveSearchFilters = {
        hasCrossReferences: true,
      };
      const _results = await moveIndexService.searchMoves('', filters);
      expect(Array.isArray(results.entries)).toBe(true);
    });
  });

  describe('search result structure', () => {
    it('should return properly structured search results', async() => {
      const _results = await moveIndexService.searchMoves('defy');

      expect(results).toHaveProperty('entries');
      expect(results).toHaveProperty('totalCount');
      expect(results).toHaveProperty('searchTime');
      expect(results).toHaveProperty('filters');

      expect(Array.isArray(results.entries)).toBe(true);
      expect(typeof results.totalCount).toBe('number');
      expect(typeof results.searchTime).toBe('number');
      expect(typeof results.filters).toBe('object');
    });

    it('should include move metadata in results', async() => {
      const results = await moveIndexService.searchMoves('defy');

      if (results.entries.length > 0) {
        const move = results.entries[0];
        expect(move).toHaveProperty('id');
        expect(move).toHaveProperty('name');
        expect(move).toHaveProperty('description');
        expect(move).toHaveProperty('category');
        expect(move).toHaveProperty('tags');
        expect(move).toHaveProperty('source');
        expect(move).toHaveProperty('crossReferences');
      }
    });
  });
});
