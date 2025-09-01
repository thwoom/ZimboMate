import { useEffect, useRef, useState, useCallback } from 'react';
import {
  calculationHistory,
  CalculationChange,
  CalculationSnapshot,
} from '../services/CalculationHistory';
import { CalculatedValues } from '../services/CalculationEngine';
import { Character } from '../models/Character';

export function useCalculationHistory(
  character: Character | null,
  calculatedValues: CalculatedValues | null,
) {
  const [recentChanges, setRecentChanges] = useState < CalculationChange[]>([]);
  const previousValues = useRef<{
    hp?: number;
    armor?: number;
    load?: number;
    xp?: number;
    ongoingMod?: number;
    forwardMod?: number;
  }>({});

  // Track changes
  useEffect(() => {
    if (!character || !calculatedValues) return;

    // Track HP changes
    if (previousValues.current.hp !== undefined &&
        previousValues.current.hp !== character.hp.current) {
      const reason = character.hp.current < previousValues.current.hp
        ? 'Took damage'
        : 'Healed';
      calculationHistory.recordHPChange(
        previousValues.current.hp,
        character.hp.current,
        reason,
      );
    }

    // Track armor changes
    if (previousValues.current.armor !== undefined &&
        previousValues.current.armor !== calculatedValues.totalArmor) {
      calculationHistory.recordArmorChange(
        previousValues.current.armor,
        calculatedValues.totalArmor,
        'Equipment or modifier change',
        {
          breakdown: {
            base: character.armor,
            equipped: calculatedValues.totalArmor-character.armor,
          },
        },
      );
    }

    // Track load changes
    if (previousValues.current.load !== undefined &&
        previousValues.current.load !== calculatedValues.currentLoad) {
      calculationHistory.recordLoadChange(
        previousValues.current.load,
        calculatedValues.currentLoad,
        'Inventory change',
        {
          encumbrance: calculatedValues.encumbranceStatus,
        },
      );
    }

    // Track XP changes
    if (previousValues.current.xp !== undefined &&
        previousValues.current.xp !== character.xp) {
      const reason = character.xp > previousValues.current.xp
        ? 'Gained XP'
        : 'Level up (XP reset)';
      calculationHistory.recordXPChange(
        previousValues.current.xp,
        character.xp,
        reason,
      );
    }

    // Track modifier changes
    if (previousValues.current.ongoingMod !== undefined &&
        previousValues.current.ongoingMod !== calculatedValues.ongoingModifier) {
      calculationHistory.recordModifierChange(
        'ongoing',
        previousValues.current.ongoingMod,
        calculatedValues.ongoingModifier,
        'Modifier applied / removed',
      );
    }

    if (previousValues.current.forwardMod !== undefined &&
        previousValues.current.forwardMod !== calculatedValues.forwardModifier) {
      calculationHistory.recordModifierChange(
        'forward',
        previousValues.current.forwardMod,
        calculatedValues.forwardModifier,
        'Modifier applied / removed',
      );
    }

    // Update previous values
    previousValues.current = {
      hp: character.hp.current,
      armor: calculatedValues.totalArmor,
      load: calculatedValues.currentLoad,
      xp: character.xp,
      ongoingMod: calculatedValues.ongoingModifier,
      forwardMod: calculatedValues.forwardModifier,
    };

    // Update recent changes
    setRecentChanges(calculationHistory.getRecentHistory(10));
  }, [character, calculatedValues]);

  // Take snapshot
  const takeSnapshot = useCallback(() => {
    if (!character || !calculatedValues) return;

    calculationHistory.takeSnapshot({
      hp: { current: character.hp.current, max: character.hp.max },
      armor: calculatedValues.totalArmor,
      load: { current: calculatedValues.currentLoad, max: calculatedValues.maxLoad },
      xp: { current: character.xp, threshold: calculatedValues.xpThreshold },
      damage: {
        die: character.damageDie,
        bonus: calculatedValues.damageBonus,
      },
      modifiers: {
        ongoing: calculatedValues.ongoingModifier,
        forward: calculatedValues.forwardModifier,
      },
      conditions: calculatedValues.activeConditions.map(c => c.name),
    });
  }, [character, calculatedValues]);

  // Get history methods
  const getHistory = useCallback((count?: number) => {
    return calculationHistory.getRecentHistory(count);
  }, []);

  const getHistoryByType = useCallback((type: CalculationChange['type']) => {
    return calculationHistory.getHistoryByType(type);
  }, []);

  const getSummary = useCallback(() => {
    return calculationHistory.getSummary();
  }, []);

  const clearHistory = useCallback(() => {
    calculationHistory.clearHistory();
    setRecentChanges([]);
  }, []);

  return {
    recentChanges,
    takeSnapshot,
    getHistory,
    getHistoryByType,
    getSummary,
    clearHistory,
    exportHistory: () => calculationHistory.exportHistory(),
    importHistory: (data: string) => {
      calculationHistory.importHistory(data);
      setRecentChanges(calculationHistory.getRecentHistory(10));
    },
  };
}
