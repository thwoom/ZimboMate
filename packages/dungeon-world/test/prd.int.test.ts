import { unlinkSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach,beforeEach, describe, expect, it } from 'vitest';

import { getPRD,getPRDService, PRDService } from '../src / services / prdService';

describe('PRD Service Integration', () => {
  const _testPrdPath = resolve(process.cwd(), 'test - service - prd.md');
  let service: PRDService;

  const _samplePRD = `# Test Service PRD

## Overview
This is a test PRD for service integration testing.

## Product Vision
A test product for service functionality.

## Core Features

### Feature A - Requirement 1 - Requirement 2

### Feature B - Requirement 3 - Requirement 4

## Technical Requirements

### Performance - Fast loading - Efficient caching

### Security - Data validation - Access control

## Success Metrics - 95% uptime - Response time < 100ms - Cache hit rate > 80%

## Timeline - Phase 1: Core service (Q1)
- Phase 2: Advanced features (Q2)`;

  beforeEach(() => {
    // Create test PRD file
    writeFileSync(testPrdPath, samplePRD);
    service = new PRDService(testPrdPath);
  });

  afterEach(() => {
    // Clean up test file and service cache
    try {
      unlinkSync(testPrdPath);
    } catch {
      // File might not exist, ignore
    }
    service.clearCache();
  });

  describe('PRDService', () => {
    it('should load PRD and cache it', () => {
      const _prd = service.getPRD();

      expect(prd.title).toBe('Test Service PRD');
      expect(prd.coreFeatures).toHaveLength(2);
      expect(service.isCached()).toBe(true);
    });

    it('should return cached PRD on subsequent calls', () => {
      // First call should load and cache
      const _prd1 = service.getPRD();
      const cacheStats1 = service.getCacheStats();

      expect(cacheStats1.size).toBe(1);
      expect(service.isCached()).toBe(true);

      // Second call should use cache
      const _prd2 = service.getPRD();
      const cacheStats2 = service.getCacheStats();

      expect(cacheStats2.size).toBe(1); // Same cache entry
      expect(prd1).toBe(prd2); // Same object reference
    });

    it('should invalidate cache when file changes', async() => {
      // Initial load
      const _prd1 = service.getPRD();
      expect(prd1.title).toBe('Test Service PRD');

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Modify the file
      const modifiedPRD = `# Modified Test Service PRD

## Overview
This is a modified test PRD.

## Product Vision
A modified test product.

## Core Features

### Modified Feature - Modified requirement

## Technical Requirements

### Performance - Modified requirement

## Success Metrics - Modified metric

## Timeline - Phase 1: Modified timeline (Q1)`;

      writeFileSync(testPrdPath, modifiedPRD);

      // Should reload due to file change
      const _prd2 = service.getPRD();
      expect(prd2.title).toBe('Modified Test Service PRD');
      expect(prd1).not.toBe(prd2); // Different object reference
    });

    it('should handle multiple file paths', () => {
      const testPrdPath2 = resolve(process.cwd(), 'test - service - prd - 2.md');
      const samplePRD2 = `# Test Service PRD 2

## Overview
Second test PRD.

## Product Vision
Second test product.

## Core Features

### Feature C - Requirement 5

## Technical Requirements

### Performance - Fast loading

## Success Metrics - 90% uptime

## Timeline - Phase 1: Core features (Q1)`;

      try {
        writeFileSync(testPrdPath2, samplePRD2);

        // Load both files
        const _prd1 = service.getPRD(testPrdPath);
        const _prd2 = service.getPRD(testPrdPath2);

        expect(prd1.title).toBe('Test Service PRD');
        expect(prd2.title).toBe('Test Service PRD 2');

        const cacheStats = service.getCacheStats();
        expect(cacheStats.size).toBe(2);
        expect(cacheStats.entries).toContain(testPrdPath);
        expect(cacheStats.entries).toContain(testPrdPath2);

        // Clean up
        unlinkSync(testPrdPath2);
      } catch {
        // Clean up if test fails
        try {
          unlinkSync(testPrdPath2);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    });

    it('should throw error for non - existent file', () => {
      expect(() => service.getPRD('non - existent.md')).toThrow(
        'PRD file not found',
      );
    });

    it('should refresh cache when requested', () => {
      // Initial load
      service.getPRD();
      expect(service.isCached()).toBe(true);

      // Force refresh
      service.refreshCache();
      expect(service.isCached()).toBe(false);

      // Should reload
      const _prd2 = service.getPRD();
      expect(prd2.title).toBe('Test Service PRD');
      expect(service.isCached()).toBe(true);
    });

    it('should clear all cache entries', () => {
      // Load a file
      service.getPRD();
      expect(service.getCacheStats().size).toBe(1);

      // Clear cache
      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
      expect(service.isCached()).toBe(false);
    });

    it('should provide cache statistics', () => {
      expect(service.getCacheStats().size).toBe(0);

      service.getPRD();
      const stats = service.getCacheStats();

      expect(stats.size).toBe(1);
      expect(stats.entries).toHaveLength(1);
      expect(stats.entries[0]).toBe(testPrdPath);
    });

    it('should track last modification time', () => {
      expect(service.getLastModified()).toBe(null);

      service.getPRD();
      const lastModified = service.getLastModified();

      expect(lastModified).toBeGreaterThan(0);
      expect(typeof lastModified).toBe('number');
    });
  });

  describe('Singleton Service', () => {
    it('should return the same service instance', () => {
      const service1 = getPRDService();
      const service2 = getPRDService();

      expect(service1).toBe(service2);
    });

    it('should use singleton for convenience function', () => {
      const _prd1 = getPRD(testPrdPath);
      const _prd2 = getPRD(testPrdPath);

      expect(prd1).toBe(prd2); // Same cached object
      expect(prd1.title).toBe('Test Service PRD');
      expect(prd2.title).toBe('Test Service PRD');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid PRD files gracefully', () => {
      const invalidPRD = `# Invalid PRD

## Overview
This PRD is missing required sections.`;

      writeFileSync(testPrdPath, invalidPRD);

      expect(() => service.getPRD()).toThrow();
    });

    it('should handle file deletion after caching', () => {
      // Load and cache
      service.getPRD();
      expect(service.isCached()).toBe(true);

      // Delete file
      unlinkSync(testPrdPath);

      // Should detect file is gone
      expect(service.isCached()).toBe(false);
      expect(() => service.getPRD()).toThrow('PRD file not found');
    });
  });

  describe('Performance', () => {
    it('should return same object reference for cached calls', () => {
      // First call (load and parse)
      const prd1 = service.getPRD();

      // Second call (from cache)
      const prd2 = service.getPRD();

      // Should return the same object reference due to caching
      expect(prd1).toBe(prd2);
      expect(service.isCached()).toBe(true);
    });
  });
});
