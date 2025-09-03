/**
 * Validation hooks that integrate with the game store
 */

import { useCallback, useEffect, useState } from 'react';

import { Attribute,Character } from '../models/Character';
import { Item } from '../models/Equipment';
import { calculateInventoryStats } from '../models/Inventory';
import { Move } from '../models/Move';
import {
  BusinessRules,
  CharacterValidation,
  InventoryValidation,
  ItemValidation,
  MoveValidation,
  validateGameState,
  ValidationResult,
} from '../services/Validation';
import { useCharacter, useGameStore, useInventory, useMoves } from './GameStore';

/**
 * Hook for validated character updates
 */
export const useValidatedCharacterUpdate = () => {
  const { updateCharacter } = useGameStore();
  const character = useCharacter();
  const [lastValidation, setLastValidation] = useState < ValidationResult | null>(null);

  const updateCharacterWithValidation = useCallback((updates: Partial < Character>) => {
    if (!character) return;

    // Create updated character for validation
    const updatedCharacter = { ...character, ...updates };

    // Validate the updated character
    const validation = CharacterValidation.validateCharacter(updatedCharacter);
    setLastValidation(validation);

    // Log warnings
    for (const warning of validation.warnings) {
      }

    // Only update if valid (or if we're fixing errors)
    if (validation.valid || validation.errors.length < lastValidation?.errors.length!) {
      updateCharacter(character.id, updates);

      // Check for auto-triggers after update
      const triggers = BusinessRules.checkAutoTriggers(updatedCharacter);
      if (triggers.length > 0) {
        // This would trigger UI notifications or modals
      }
    } else {
      // Log errors and don't update
      for (const error of validation.errors) {
        }
    }
  }, [character, updateCharacter, lastValidation]);

  return {
    updateCharacterWithValidation,
    lastValidation,
  };
};

/**
 * Hook for validated item operations
 */
export const useValidatedItemOperations = () => {
  const { updateInventory } = useGameStore();
  const inventory = useInventory();
  const character = useCharacter();

  const addItemWithValidation = useCallback((item: Item) => {
    if (!inventory || !character) return false;

    // Validate item
    const validation = ItemValidation.validateItem(item);

    if (!validation.valid) {
      for (const error of validation.errors) {
        }
      return false;
    }

    // Check if adding this item would cause encumbrance issues
    const newInventory = {
      ...inventory,
      items: { ...inventory.items, [item.id]: item },
    };

    const stats = calculateInventoryStats(
      newInventory,
      character.load.max,
    );

    const encumbranceValidation = InventoryValidation.validateEncumbrance(
      newInventory,
      character.load.max,
      stats.encumbranceStatus,
    );

    // Warn about encumbrance
    for (const warning of encumbranceValidation.warnings) {
      }

    // Add the item
    updateInventory(character.id, {
      ...inventory,
      items: { ...inventory.items, [item.id]: item },
    });

    return true;
  }, [inventory, character, updateInventory]);

  const equipItemWithValidation = useCallback((itemId: string) => {
    if (!inventory || !character) return false;

    const item = inventory.items[itemId];
    if (!item) return false;

    // Create a copy with the item equipped
    const updatedItems = { ...inventory.items };
    updatedItems[itemId] = { ...item, equipped: true };

    // Check equipped items validation
    const _equippedItems = Object.values(updatedItems).filter(i => i.equipped);
    const validation = InventoryValidation.validateEquippedItems(equippedItems);

    if (!validation.valid) {
      for (const error of validation.errors) {
        }
      return false;
    }

    // Warn about issues
    for (const warning of validation.warnings) {
      }

    // Update the inventory
    updateInventory(character.id, {
      ...inventory,
      items: updatedItems,
    });

    return true;
  }, [inventory, character, updateInventory]);

  return {
    addItemWithValidation,
    equipItemWithValidation,
  };
};

/**
 * Hook for validated move operations
 */
export const useValidatedMoveOperations = () => {
  const { addMove, updateMove } = useGameStore();
  const character = useCharacter();
  const moves = useMoves();

  const addMoveWithValidation = useCallback((move: Move) => {
    if (!character) return false;

    // Validate custom move structure
    if (move.custom) {
      const validation = MoveValidation.validateCustomMove(move);

      if (!validation.valid) {
        for (const error of validation.errors) {
          }
        return false;
      }
    }

    // Validate move requirements
    const knownMoveIds = moves.map(m => m.id);
    const reqValidation = MoveValidation.validateMoveRequirements(
      move,
      character.level,
      character.class,
      knownMoveIds,
    );

    if (!reqValidation.valid) {
      for (const error of reqValidation.errors) {
        }
      return false;
    }

    // Add the move
    addMove(move);
    return true;
  }, [character, moves, addMove]);

  return {
    addMoveWithValidation,
  };
};

/**
 * Hook for character advancement validation
 */
export const useCharacterAdvancement = () => {
  const { updateCharacter } = useGameStore();
  const character = useCharacter();
  const { addMoveWithValidation } = useValidatedMoveOperations();

  const levelUp = useCallback((
    statIncrease?: Attribute,
    newMove?: Move,
  ) => {
    if (!character) return false;

    // Validate advancement
    const validation = BusinessRules.validateAdvancement(
      character,
      newMove,
      statIncrease,
    );

    if (!validation.valid) {
      for (const error of validation.errors) {
        }
      return false;
    }

    // Apply level up
    const updates: Partial < Character> = {
      level: character.level + 1,
      xp: character.xp-(character.level + 7), // Reset XP
    };

    // Apply stat increase
    if (statIncrease) {
      updates.attributes = {
        ...character.attributes,
        [statIncrease]: Math.min(18, character.attributes[statIncrease] + 1),
      };
    }

    // Update character
    updateCharacter(character.id, updates);

    // Add new move if selected
    if (newMove) {
      addMoveWithValidation(newMove);
    }

    return true;
  }, [character, updateCharacter, addMoveWithValidation]);

  return {
    levelUp,
    canLevelUp: character ? character.xp >= character.level + 7 : false,
  };
};

/**
 * Hook for overall game state validation
 */
export const useGameStateValidation = () => {
  const { state } = useGameStore();
  const [validation, setValidation] = useState < ValidationResult | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Get active character and inventory
    const activeCharacter = state.activeCharacterId ? state.characters[state.activeCharacterId] : null;
    const activeInventory = state.activeCharacterId ? state.inventories[state.activeCharacterId] : null;

    // Run validation on state changes
    const result = activeInventory ? validateGameState(
      activeCharacter,
      activeInventory,
      state.customMoves,
    ) : { valid: true, errors: [], warnings: [] };

    setValidation(result);
    setIsValid(result.valid);

    // Log unknown issues
    if (result.errors.length > 0) {
      }
    if (result.warnings.length > 0) {
      }
  }, [state.characters, state.inventories, state.activeCharacterId, state.customMoves]);

  return {
    validation,
    isValid,
    errors: validation?.errors || [],
    warnings: validation?.warnings || [],
  };
};



