/**
 * Optimized calculation engine with memoization and caching
 */

import {
  CalculatedValues,
  CalculationContext,
  CalculationEngine,
} from './CalculationEngine';

interface CacheEntry < T> {
  value: T;
  timestamp: number;
  hash: string;
}

export class OptimizedCalculationEngine {
  private cache = new Map < string, CacheEntry < unknown>>();
  private cacheMaxAge = 5000; // 5 seconds
  private cacheMaxSize = 100;
  private calculationEngine = CalculationEngine.getInstance();

  // Memoized functions
  private memoizedCalculations = new Map < string, Function>();

  constructor() {
    this.setupMemoization();
  }

  /**
   * Calculate with caching
   */
  calculate(context: CalculationContext): CalculatedValues {
    const cacheKey = this.generateCacheKey(context);
    const cached = this.getFromCache < CalculatedValues>(cacheKey);

    if (cached) {
      return cached;
    }

    // Use calculation engine
    const result = this.calculationEngine.calculate(context);

    // Cache the result
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * Setup memoized calculation functions
   */
  private setupMemoization() {
    // Memoize attribute modifier calculations
    this.memoizedCalculations.set('attributeModifiers', this.memoize(
      (attributes: any) => this.calculateAttributeModifiers(attributes),
      (attributes: any) => JSON.stringify(attributes),
    ));

    // Memoize effective modifier calculations
    this.memoizedCalculations.set('effectiveModifiers', this.memoize(
      (modifiers: unknown, debilities: any) => this.calculateEffectiveModifiers(modifiers, debilities),
      (modifiers: unknown, debilities: any) => `${JSON.stringify(modifiers)}-${JSON.stringify(debilities)}`,
    ));

    // Memoize armor calculations
    this.memoizedCalculations.set('armor', this.memoize(
      (baseArmor: number, items: unknown[], modifiers: unknown[]) => {
        return this.calculateTotalArmor(baseArmor, items, modifiers);
      },
      (baseArmor: number, items: unknown[], modifiers: unknown[]) =>
        `${baseArmor}-${items.map(i => i.id).join(',')}-${modifiers.map(m => m.id).join(',')}`,
    ));
  }

  /**
   * Generic memoization function
   */
  private memoize < T extends(...args: unknown[]) => unknown>(
    fn: T,
    keyGenerator: (...args: Parameters < T>) => string,
  ): T {
    const cache = new Map < string, ReturnType < T>>();

    return ((...args: Parameters < T>) => {
      const key = keyGenerator(...args);

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(...args);
      cache.set(key, result);

      // Limit cache size
      if (cache.size > 50) {
        const firstKey = cache.keys().next().value;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }

      return result;
    }) as T;
  }

  /**
   * Generate cache key from context
   */
  private generateCacheKey(context: CalculationContext): string {
    // Create a hash of relevant data
    const relevantData = {
      characterId: context.character.id,
      characterVersion: context.character.updatedAt,
      inventoryVersion: context.inventory.lastUpdated,
      modifiersCount: context.modifiers.modifiers.length,
      conditionsCount: context.conditions.length,
    };

    return `calc-${JSON.stringify(relevantData)}`;
  }

  /**
   * Get from cache if valid
   */
  private getFromCache < T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if cache is expired
    if (Date.now()-entry.timestamp > this.cacheMaxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set cache entry
   */
  private setCache < T>(key: string, value: T): void {
    const entry: CacheEntry < T> = {
      value,
      timestamp: Date.now(),
      hash: this.generateHash(value),
    };

    this.cache.set(key, entry);

    // Enforce cache size limit
    if (this.cache.size > this.cacheMaxSize) {
      // Remove oldest entries
      const sortedEntries = [...this.cache.entries()]
        .sort((a, b) => (a[1] as CacheEntry < unknown>).timestamp-(b[1] as CacheEntry < unknown>).timestamp);

      const entriesToRemove = sortedEntries.slice(0, this.cache.size-this.cacheMaxSize);
      for (const [key] of entriesToRemove) this.cache.delete(key);
    }
  }

  /**
   * Generate hash for cache validation
   */
  private generateHash(value: any): string {
    return JSON.stringify(value).length.toString(36);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: Date | null;
  } {
    const entries = [...this.cache.values()];
    const oldestEntry = entries.length > 0
      ? new Date(Math.min(...entries.map(e => (e as CacheEntry < unknown>).timestamp)))
      : null;

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits / misses for this
      oldestEntry,
    };
  }

  /**
   * Optimized batch calculations
   */
  calculateBatch(contexts: CalculationContext[]): CalculatedValues[] {
    // Pre-warm common calculations
    const commonAttributes = new Set < string>();
    const commonItems = new Set < string>();

    for (const context of contexts) {
      commonAttributes.add(JSON.stringify(context.character.attributes));
      Object.values(context.inventory.items).forEach((item: any) => {
        if (item.equipped) {
          commonItems.add(item.id);
        }
      });
    }

    // Calculate all contexts
    return contexts.map(context => this.calculate(context));
  }

  /**
   * Calculate with selective updates
   */
  calculateSelective(
    context: CalculationContext,
    previousValues: CalculatedValues,
    changedFields: string[],
  ): CalculatedValues {
    // If critical fields changed, recalculate everything
    const criticalFields = ['attributes', 'debilities', 'level', 'class'];
    if (changedFields.some(field => criticalFields.includes(field))) {
      return this.calculate(context);
    }

    // Otherwise, update only affected calculations
    const result = { ...previousValues };

    if (changedFields.includes('hp')) {
      // HP changes don't affect other calculations
      // Note: We can't access private validate method, so we'll recalculate
      return this.calculate(context);
    }

    if (changedFields.includes('inventory')) {
      // Recalculate load and armor
      const equippedItems = Object.values(context.inventory.items).filter((i: any) => i.equipped);
      result.currentLoad = Object.values(context.inventory.items).reduce(
        (sum: number, item: any) => sum + (item.weight * (item.quantity || 1)), 0,
      );
      // Note: We can't access private calculateTotalArmor method, so we'll recalculate
      return this.calculate(context);
    }

    if (changedFields.includes('xp')) {
      result.canLevelUp = context.character.xp >= result.xpThreshold;
    }

    return result;
  }

  // Helper methods that would normally be inherited
  private calculateAttributeModifiers(attributes: any): unknown {
    // This would need to be implemented or we could use the calculation engine
    return {};
  }

  private calculateEffectiveModifiers(modifiers: unknown, debilities: any): unknown {
    // This would need to be implemented or we could use the calculation engine
    return {};
  }

  private calculateTotalArmor(baseArmor: number, items: unknown[], modifiers: unknown[]): number {
    // This would need to be implemented or we could use the calculation engine
    return baseArmor;
  }
}

// Export optimized singleton
export const optimizedCalculationEngine = new OptimizedCalculationEngine();



