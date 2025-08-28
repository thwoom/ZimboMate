/**
 * React hooks for reactive calculations
 */

import { useMemo, useCallback } from 'react';
import { 
  useGameStore, 
  useCharacter, 
  useInventory,
  useSession,
  useSettings
} from './GameStore';
import { 
  CalculationContext,
  CalculatedValues,
  calculationEngine
} from '../services/CalculationEngine';
import { COMMON_CONDITIONS } from '../models/Conditions';
import { 
  calculateCombatArmor,
  calculateDamageOutput,
  getCombatPenalties,
  getWeaponRanges,
  hasWeaponProperty,
  getAmmunitionCount
} from '../utils/calculations/combatCalculations';
import {
  calculateDetailedLoad,
  getWeightReductions,
  calculateCoinWeight,
  suggestLoadOptimization
} from '../utils/calculations/loadCalculations';
import {
  getTotalAttributeModifier,
  isAttributeDebilitated,
  getAttributeMoves
} from '../utils/calculations/attributeCalculations';
import { Attribute } from '../models/Character';

/**
 * Main hook for reactive calculations
 */
export function useCalculatedValues(): CalculatedValues | null {
  const { state } = useGameStore();
  const character = useCharacter();
  
  // Get active character's data
  const activeCharId = state.activeCharacterId;
  const activeChar = activeCharId ? state.characters[activeCharId] : null;
  const inventory = activeCharId ? state.inventories[activeCharId] : null;
  
  return useMemo(() => {
    if (!activeChar || !inventory) return null;
    
    const context: CalculationContext = {
      character: activeChar,
      inventory,
      modifiers: state.modifiers,
      conditions: state.conditions,
      conditionDefinitions: COMMON_CONDITIONS as any[], // Type cast for now
      spellPreparation: activeCharId ? state.spellPreparations[activeCharId] : undefined
    };
    
    return calculationEngine.calculate(context);
  }, [activeChar, inventory, state.modifiers, state.conditions, state.spellPreparations, activeCharId]);
}

/**
 * Hook for armor calculations with detailed breakdown
 */
export function useArmorCalculations() {
  const { state } = useGameStore();
  const character = useCharacter();
  const inventory = useInventory();
  
  return useMemo(() => {
    if (!character || !inventory) return null;
    
    const calculation = calculateCombatArmor(
      character,
      inventory,
      state.modifiers.modifiers,
      COMMON_CONDITIONS as any[],
      state.conditions
    );
    
    // Build breakdown array for tooltip
    const breakdown = [];
    if (calculation.total > 0) {
      breakdown.push({ label: 'Total', value: calculation.total });
    }
    
    return {
      ...calculation,
      breakdown
    };
  }, [character, inventory, state.modifiers, state.conditions]);
}

/**
 * Hook for damage calculations with breakdown
 */
export function useDamageCalculations() {
  const { state } = useGameStore();
  const character = useCharacter();
  const inventory = useInventory();
  
  return useMemo(() => {
    if (!character || !inventory) return null;
    
    const calculation = calculateDamageOutput(
      character,
      inventory,
      state.modifiers.modifiers
    );
    
    // Build breakdown array for damage bonus
    const breakdown = [];
    if (calculation.bonusDamage > 0) {
      breakdown.push({ label: 'Bonus', value: calculation.bonusDamage });
    }
    
    return {
      ...calculation,
      breakdown
    };
  }, [character, inventory, state.modifiers]);
}

/**
 * Hook for load calculations with detailed breakdown
 */
export function useLoadCalculations() {
  const character = useCharacter();
  const inventory = useInventory();
  
  return useMemo(() => {
    if (!character || !inventory) return null;
    
    return calculateDetailedLoad(character, inventory);
  }, [character, inventory]);
}

/**
 * Hook for combat information
 */
export function useCombatInfo() {
  const character = useCharacter();
  const inventory = useInventory();
  
  return useMemo(() => {
    if (!character || !inventory) return null;
    
    return {
      penalties: getCombatPenalties(character, inventory),
      ranges: getWeaponRanges(inventory),
      ammunition: getAmmunitionCount(inventory),
      hasPrecise: hasWeaponProperty(inventory, 'precise'),
      hasForceful: hasWeaponProperty(inventory, 'forceful'),
      hasMessy: hasWeaponProperty(inventory, 'messy')
    };
  }, [character, inventory]);
}

/**
 * Hook for attribute calculations with all modifiers
 */
export function useAttributeCalculations(attribute: Attribute) {
  const { state } = useGameStore();
  const character = useCharacter();
  const values = useCalculatedValues();
  
  return useMemo(() => {
    if (!character || !values) return null;
    
    return {
      base: values.attributeModifiers[attribute],
      effective: values.effectiveModifiers[attribute],
      total: getTotalAttributeModifier(
        attribute,
        character,
        state.modifiers.modifiers,
        COMMON_CONDITIONS as any[],
        state.conditions
      ),
      isDebilitated: isAttributeDebilitated(attribute, character.debilities),
      associatedMoves: getAttributeMoves(attribute)
    };
  }, [attribute, character, values, state.modifiers, state.conditions]);
}

/**
 * Hook for optimization suggestions
 */
export function useOptimizationSuggestions() {
  const character = useCharacter();
  const inventory = useInventory();
  
  return useMemo(() => {
    if (!character || !inventory) return [];
    
    return suggestLoadOptimization(character, inventory);
  }, [character, inventory]);
}

/**
 * Hook that triggers recalculation on any relevant change
 */
export function useAutoCalculate() {
  const { state, dispatch } = useGameStore();
  const character = useCharacter();
  const inventory = useInventory();
  const values = useCalculatedValues();
  
  // Update max HP when it changes
  const updateMaxHP = useCallback(() => {
    if (!character || !values) return;
    
    const newMaxHP = values.maxHP;
    if (character.hp.max !== newMaxHP) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: {
          id: character.id,
          updates: {
            hp: {
              ...character.hp,
              max: newMaxHP,
              // Adjust current HP if it exceeds new max
              current: Math.min(character.hp.current, newMaxHP)
            }
          }
        }
      });
    }
  }, [character, values, dispatch]);
  
  // Update armor value when it changes
  const updateArmor = useCallback(() => {
    if (!character || !values) return;
    
    const newArmor = values.totalArmor;
    if (character.armor !== newArmor) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: {
          id: character.id,
          updates: { armor: newArmor }
        }
      });
    }
  }, [character, values, dispatch]);
  
  // Update load values when they change
  const updateLoad = useCallback(() => {
    if (!character || !values) return;
    
    const newMaxLoad = values.maxLoad;
    const newCurrentLoad = values.currentLoad;
    
    if (character.load.max !== newMaxLoad || character.load.current !== newCurrentLoad) {
      dispatch({
        type: 'UPDATE_CHARACTER',
        payload: {
          id: character.id,
          updates: {
            load: {
              current: newCurrentLoad,
              max: newMaxLoad
            }
          }
        }
      });
    }
  }, [character, values, dispatch]);
  
  // Auto-update coin weight
  const updateCoinWeight = useCallback(() => {
    if (!character || !inventory) return;
    
    const coinWeight = calculateCoinWeight(character.coin);
    const coinItemId = 'coin-weight';
    
    if (coinWeight > 0) {
      // Add or update coin weight item
      if (!inventory.items[coinItemId]) {
              dispatch({
        type: 'UPDATE_INVENTORY',
        payload: {
          characterId: character.id,
          updates: {
            items: {
              ...inventory.items,
              [coinItemId]: {
                id: coinItemId,
                name: 'Coins',
                category: 'treasure',
                tags: [],
                weight: coinWeight,
                quantity: 1,
                equipped: false,
                value: character.coin
              }
            }
          }
        }
      });
      } else if (inventory.items[coinItemId].weight !== coinWeight) {
        dispatch({
          type: 'UPDATE_INVENTORY',
          payload: {
            characterId: character.id,
            updates: {
              items: {
                ...inventory.items,
                [coinItemId]: {
                  ...inventory.items[coinItemId],
                  weight: coinWeight,
                  value: character.coin
                }
              }
            }
          }
        });
      }
    } else if (inventory.items[coinItemId]) {
      // Remove coin weight item if no coins
      const newItems = { ...inventory.items };
      delete newItems[coinItemId];
      dispatch({
        type: 'UPDATE_INVENTORY',
        payload: {
          characterId: character.id,
          updates: { items: newItems }
        }
      });
    }
  }, [character, inventory, dispatch]);
  
  return {
    updateMaxHP,
    updateArmor,
    updateLoad,
    updateCoinWeight,
    values
  };
}

/**
 * Hook for reactive XP and leveling
 */
export function useXPCalculations() {
  const character = useCharacter();
  const values = useCalculatedValues();
  
  const checkLevelUp = useCallback(() => {
    if (!character || !values) return false;
    return values.canLevelUp;
  }, [character, values]);
  
  const xpToNextLevel = useMemo(() => {
    if (!character || !values) return 0;
    return values.xpThreshold - character.xp;
  }, [character, values]);
  
  const xpPercentage = useMemo(() => {
    if (!character || !values) return 0;
    return (character.xp / values.xpThreshold) * 100;
  }, [character, values]);
  
  return {
    canLevelUp: values?.canLevelUp || false,
    xpThreshold: values?.xpThreshold || 0,
    xpToNextLevel,
    xpPercentage,
    checkLevelUp
  };
}
