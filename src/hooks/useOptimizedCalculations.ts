import { useMemo, useRef, useEffect } from 'react';
import { CalculatedValues } from '../services/CalculationEngine';
import { optimizedCalculationEngine } from '../services/OptimizedCalculationEngine';
import { useGameStore } from '../store/GameStore';
import { COMMON_CONDITIONS } from '../models/Conditions';

interface OptimizedCalculationResult {
  values: CalculatedValues | null;
  isCalculating: boolean;
  cacheStats: {
    size: number;
    hitRate: number;
    oldestEntry: Date | null;
  };
  clearCache: () => void;
}

export function useOptimizedCalculations(): OptimizedCalculationResult {
  const { state } = useGameStore();
  const previousStateRef = useRef(state);
  const isCalculatingRef = useRef(false);
  const calculationIdRef = useRef(0);

  // Track what changed
  const changedFields = useMemo(() => {
    const changes: string[] = [];
    const prev = previousStateRef.current;

    if (!prev.activeCharacterId || !state.activeCharacterId) {
      return ['all'];
    }

    const prevChar = prev.characters[prev.activeCharacterId];
    const currChar = state.characters[state.activeCharacterId];

    if (!prevChar || !currChar) {
      return ['all'];
    }

    // Check character changes
    if (prevChar.hp.current !== currChar.hp.current) changes.push('hp');
    if (prevChar.xp !== currChar.xp) changes.push('xp');
    if (JSON.stringify(prevChar.attributes) !== JSON.stringify(currChar.attributes)) changes.push('attributes');
    if (JSON.stringify(prevChar.debilities) !== JSON.stringify(currChar.debilities)) changes.push('debilities');

    // Check inventory changes
    const prevInv = prev.inventories[prev.activeCharacterId];
    const currInv = state.inventories[state.activeCharacterId];

    if (prevInv && currInv) {
      if (prevInv.lastUpdated !== currInv.lastUpdated) changes.push('inventory');
    }

    // Check modifier changes
    if (prev.modifiers.modifiers.length !== state.modifiers.modifiers.length) changes.push('modifiers');

    previousStateRef.current = state;
    return changes;
  }, [state]);

  // Memoized calculation
  const calculatedValues = useMemo(() => {
    if (!state.activeCharacterId) return null;

    const character = state.characters[state.activeCharacterId];
    const inventory = state.inventories[state.activeCharacterId];

    if (!character || !inventory) return null;

    // Increment calculation ID for tracking
    const calculationId = ++calculationIdRef.current;
    isCalculatingRef.current = true;

    // Create context
    const context = {
      character,
      inventory,
      modifiers: state.modifiers,
      conditions: state.conditions,
      conditionDefinitions: COMMON_CONDITIONS as string,
      spellPreparation: state.spellPreparations[character.id],
    };

    // Use optimized engine
    const result = changedFields.includes('all') || changedFields.length > 3
      ? optimizedCalculationEngine.calculate(context)
      : optimizedCalculationEngine.calculateSelective(
          context,
          {} as CalculatedValues, // Would need previous calculated values
          changedFields,
        );

    // Mark calculation complete
    if (calculationId === calculationIdRef.current) {
      isCalculatingRef.current = false;
    }

    return result;
  }, [
    state.activeCharacterId,
    state.characters,
    state.inventories,
    state.modifiers,
    state.conditions,
    state.spellPreparations,
    changedFields,
  ]);

  // Cache management
  const clearCache = () => {
    optimizedCalculationEngine.clearCache();
  };

  const cacheStats = useMemo(() => {
    return optimizedCalculationEngine.getCacheStats();
  }, [calculatedValues]); // Update stats when calculations run

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: clear cache on unmount to free memory
      if (optimizedCalculationEngine.getCacheStats().size > 50) {
        optimizedCalculationEngine.clearCache();
      }
    };
  }, []);

  return {
    values: calculatedValues,
    isCalculating: isCalculatingRef.current,
    cacheStats,
    clearCache,
  };
}

// Hook for prefetching calculations
export function usePrefetchCalculations() {
  const { state } = useGameStore();

  const prefetchCharacterCalculations = (characterId: string) => {
    const character = state.characters[characterId];
    const inventory = state.inventories[characterId];

    if (!character || !inventory) return;

    // Create context
    const context = {
      character,
      inventory,
      modifiers: state.modifiers,
      conditions: state.conditions,
      conditionDefinitions: COMMON_CONDITIONS as string,
      spellPreparation: state.spellPreparations[characterId],
    };

    // Trigger calculation to warm cache
    optimizedCalculationEngine.calculate(context);
  };

  const prefetchAllCharacters = () => {
    Object.keys(state.characters).forEach(prefetchCharacterCalculations);
  };

  return {
    prefetchCharacterCalculations,
    prefetchAllCharacters,
  };
}
