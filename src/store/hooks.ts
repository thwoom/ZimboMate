/**
 * Custom hooks for game store operations
 */

import { useCallback, useMemo } from 'react';
import { useGameStore, useCharacter, useInventory } from './GameStore';
import {
  Character,
  getEffectiveModifier,
  shouldLevelUp,
  calculateMaxHP,
  calculateMaxLoad,
  Attribute,
} from '../models/Character';
import {
  Item,
  calculateTotalArmor,
  isWeapon,
  isArmor,
} from '../models/Equipment';
import {
  calculateInventoryStats,
  getEquippedItems,
  addItem as addItemToInventory,
  removeItem as removeItemFromInventory,
  toggleEquipped as toggleItemEquipped,
} from '../models/Inventory';
import {
  Roll,
  rollDice,
  addRoll as addRollToSession,
} from '../models/Session';
import { getRollResult } from '../models/Move';

/**
 * Hook for character-related operations
 */
export const useCharacterActions = () => {
  const { state, dispatch } = useGameStore();
  const character = useCharacter();

  const takeDamage = useCallback((damage: number) => {
    if (!character) return;

    const newHP = Math.max(0, character.hp.current-damage);
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        id: character.id,
        updates: { hp: { ...character.hp, current: newHP } },
      },
    });

    // Trigger Last Breath if HP reaches 0
    if (newHP === 0) {
      // This would trigger a modal or special UI
      }
  }, [character, dispatch]);

  const heal = useCallback((amount: number) => {
    if (!character) return;

    const maxHP = calculateMaxHP(character);
    const newHP = Math.min(maxHP, character.hp.current + amount);
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        id: character.id,
        updates: { hp: { ...character.hp, current: newHP, max: maxHP } },
      },
    });
  }, [character, dispatch]);

  const gainXP = useCallback((amount = 1) => {
    if (!character) return;

    const newXP = character.xp + amount;
    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        id: character.id,
        updates: { xp: newXP },
      },
    });

    // Check for level up
    if (shouldLevelUp({ ...character, xp: newXP })) {
      // This would trigger level up UI
    }
  }, [character, dispatch]);

  const toggleDebility = useCallback((debility: keyof Character['debilities']) => {
    if (!character) return;

    dispatch({
      type: 'UPDATE_CHARACTER',
      payload: {
        id: character.id,
        updates: {
          debilities: {
            ...character.debilities,
            [debility]: !character.debilities[debility],
          },
        },
      },
    });
  }, [character, dispatch]);

  return {
    takeDamage,
    heal,
    gainXP,
    toggleDebility,
  };
};

/**
 * Hook for inventory operations
 */
export const useInventoryActions = () => {
  const { state, dispatch } = useGameStore();
  const inventory = useInventory();
  const character = useCharacter();

  const addItem = useCallback((item: Item, containerId?: string) => {
    if (!character || !inventory) return;
    const newInventory = addItemToInventory(inventory, item, containerId);
    dispatch({
      type: 'SET_INVENTORY',
      payload: {
        characterId: character.id,
        inventory: newInventory,
      },
    });
  }, [character, inventory, dispatch]);

  const removeItem = useCallback((itemId: string) => {
    if (!character || !inventory) return;
    const newInventory = removeItemFromInventory(inventory, itemId);
    dispatch({
      type: 'SET_INVENTORY',
      payload: {
        characterId: character.id,
        inventory: newInventory,
      },
    });
  }, [character, inventory, dispatch]);

  const toggleEquipped = useCallback((itemId: string) => {
    if (!character || !inventory) return;
    const newInventory = toggleItemEquipped(inventory, itemId);
    dispatch({
      type: 'SET_INVENTORY',
      payload: {
        characterId: character.id,
        inventory: newInventory,
      },
    });

    // Armor will be auto-calculated by the calculation engine
  }, [character, inventory, dispatch]);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (!character || !inventory) return;
    const item = inventory.items[itemId];
    if (!item) return;

    const updatedItem = { ...item, quantity: Math.max(0, quantity) };
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        characterId: character.id,
        updates: {
          items: {
            ...inventory.items,
            [itemId]: updatedItem,
          },
        },
      },
    });
  }, [character, inventory, dispatch]);

  // Calculate current stats
  const stats = useMemo(() => {
    if (!character || !inventory) return null;
    const maxLoad = calculateMaxLoad(character);
    return calculateInventoryStats(inventory, maxLoad);
  }, [inventory, character]);

  return {
    addItem,
    removeItem,
    toggleEquipped,
    updateItemQuantity,
    stats,
  };
};

/**
 * Hook for dice rolling operations
 */
export const useRollActions = () => {
  const { state, dispatch } = useGameStore();
  const { session } = state;
  const character = useCharacter();

  const rollAttribute = useCallback((attribute: Attribute, customModifier = 0) => {
    if (!character) return null;

    const modifier = getEffectiveModifier(attribute, character.attributes, character.debilities) + customModifier;
    const { rolls, total } = rollDice('2d6');
    const finalTotal = total + modifier;
    const result = getRollResult(finalTotal);

    const roll: Omit < Roll, 'id' | 'timestamp'> = {
      type: 'attribute',
      dice: '2d6',
      rolls,
      modifier,
      total: finalTotal,
      attribute,
      result,
    };

    const newSession = addRollToSession(session, roll);
    dispatch({
      type: 'SET_SESSION',
      payload: newSession,
    });

    return { rolls, modifier, total: finalTotal, result };
  }, [character, session, dispatch]);

  const rollDamage = useCallback(() => {
    if (!character) return null;

    const damageDie = character.damageDie;
    const { rolls, total } = rollDice(`1${damageDie}`);

    const roll: Omit < Roll, 'id' | 'timestamp'> = {
      type: 'damage',
      dice: `1${damageDie}` as string,
      rolls,
      modifier: 0,
      total,
      description: 'Damage roll',
    };

    const newSession = addRollToSession(session, roll);
    dispatch({
      type: 'SET_SESSION',
      payload: newSession,
    });

    return { rolls, total };
  }, [character, session, dispatch]);

  const rollCustom = useCallback((dice: string, modifier = 0, description?: string) => {
    const { rolls, total } = rollDice(dice);
    const finalTotal = total + modifier;

    const roll: Omit < Roll, 'id' | 'timestamp'> = {
      type: 'custom',
      dice: 'custom',
      rolls,
      modifier,
      total: finalTotal,
      description,
    };

    const newSession = addRollToSession(session, roll);
    dispatch({
      type: 'SET_SESSION',
      payload: newSession,
    });

    return { rolls, modifier, total: finalTotal };
  }, [session, dispatch]);

  return {
    rollAttribute,
    rollDamage,
    rollCustom,
  };
};

/**
 * Hook for calculated character values
 */
export const useCharacterStats = () => {
  const character = useCharacter();
  const inventory = useInventory();

  return useMemo(() => {
    if (!character || !inventory) return null;

    const equippedItems = getEquippedItems(inventory);
    const totalArmor = calculateTotalArmor(equippedItems) + (character.baseArmor || 0);
    const maxHP = calculateMaxHP(character);
    const maxLoad = calculateMaxLoad(character);
    const inventoryStats = calculateInventoryStats(inventory, maxLoad);

    return {
      totalArmor,
      maxHP,
      maxLoad,
      currentLoad: inventoryStats.totalWeight,
      encumbranceStatus: inventoryStats.encumbranceStatus,
      isLevelUpAvailable: shouldLevelUp(character),
      effectiveModifiers: {
        STR: getEffectiveModifier('STR', character.attributes, character.debilities),
        DEX: getEffectiveModifier('DEX', character.attributes, character.debilities),
        CON: getEffectiveModifier('CON', character.attributes, character.debilities),
        INT: getEffectiveModifier('INT', character.attributes, character.debilities),
        WIS: getEffectiveModifier('WIS', character.attributes, character.debilities),
        CHA: getEffectiveModifier('CHA', character.attributes, character.debilities),
      },
    };
  }, [character, inventory]);
};
