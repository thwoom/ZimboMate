/**
 * Tests for the auto-calculation engine
 */

import { describe, it, expect } from 'vitest';
import { calculationEngine, CalculationContext } from '../../src/services/CalculationEngine';
import { Character } from '../../src/models/Character';
import { Inventory, createEmptyInventory } from '../../src/models/Inventory';
import { Item, Weapon, Armor } from '../../src/models/Equipment';
import { ModifierSet } from '../../src/models/Modifiers';
import { ActiveCondition, Condition } from '../../src/models/Conditions';

describe('CalculationEngine', () => {
  // Helper to create test character
  const createTestCharacter = (): Character => ({
    id: 'test-1',
    name: 'Test Hero',
    class: 'Fighter',
    level: 3,
    xp: 5,
    hp: { current: 15, max: 21 },
    armor: 0, // Will be calculated
    baseArmor: 2, // Manual base armor
    damageDie: 'd10',
    attributes: {
      STR: 16, // +2
      DEX: 13, // +1
      CON: 14, // +1
      INT: 9,  // +0
      WIS: 12, // +0
      CHA: 8   // -1
    },
    debilities: {
      weak: false,
      shaky: false,
      sick: false,
      stunned: false,
      confused: false,
      scarred: false
    },
    race: 'Human',
    alignment: 'Good',
    load: { current: 5, max: 12 },
    baseLoad: 10,
    coin: 150,
    bonds: [],
    advancements: [],
    knownMoves: [],
    conditions: [],
    looks: 'Weathered',
    backstory: 'A veteran',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Helper to create test inventory
  const createTestInventory = (): Inventory => {
    const inv = createEmptyInventory();
    
    // Add some test items
    const sword: Weapon = {
      id: 'sword-1',
      name: 'Long Sword',
      category: 'weapon',
      tags: [{ name: 'close' }, { name: 'weight', value: 1 }],
      weight: 1,
      value: 15,
      damage: '+1 damage',
      quantity: 1,
      equipped: true
    };
    
    const armor: Armor = {
      id: 'armor-1',
      name: 'Leather Armor',
      category: 'armor',
      tags: [{ name: 'worn' }, { name: 'weight', value: 1 }],
      weight: 1,
      value: 10,
      armorValue: 1,
      quantity: 1,
      equipped: true
    };
    
    const rations: Item = {
      id: 'rations-1',
      name: 'Rations',
      category: 'consumable',
      tags: [{ name: 'ration' }, { name: 'weight', value: 1 }],
      weight: 1,
      value: 5,
      quantity: 5,
      equipped: false
    };
    
    inv.items = {
      'sword-1': sword,
      'armor-1': armor,
      'rations-1': rations
    };
    
    return inv;
  };

  // Helper to create empty modifiers
  const createEmptyModifiers = (): ModifierSet => ({
    modifiers: [],
    lastUpdated: new Date()
  });

  describe('calculate', () => {
    it('should calculate basic values correctly', () => {
      const context: CalculationContext = {
        character: createTestCharacter(),
        inventory: createTestInventory(),
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      // Check attribute modifiers
      expect(result.attributeModifiers.STR).toBe(2);
      expect(result.attributeModifiers.DEX).toBe(1);
      expect(result.attributeModifiers.CON).toBe(1);
      expect(result.attributeModifiers.INT).toBe(0);
      expect(result.attributeModifiers.WIS).toBe(0);
      expect(result.attributeModifiers.CHA).toBe(-1);
      
      // Check max HP (Fighter base 10 + CON modifier 1 = 11, * level 3 = 33? No, it's base + CON)
      // Actually: Fighter base HP is 10, + CON modifier (1) = 11
      expect(result.maxHP).toBe(11);
      
      // Check armor (base 2 + leather 1 = 3)
      expect(result.totalArmor).toBe(3);
      
      // Check load (Fighter base 12 + STR modifier 2 = 14)
      expect(result.maxLoad).toBe(14);
      expect(result.currentLoad).toBe(7); // sword 1 + armor 1 + rations 5 = 7
      expect(result.encumbranceStatus).toBe('normal');
      
      // Check XP
      expect(result.xpThreshold).toBe(10); // Level 3 needs level + 7 = 10
      expect(result.canLevelUp).toBe(false); // Has 5, needs 10
    });

    it('should handle debilities correctly', () => {
      const character = createTestCharacter();
      character.debilities.weak = true; // -1 to STR
      character.debilities.shaky = true; // -1 to DEX
      
      const context: CalculationContext = {
        character,
        inventory: createEmptyInventory(),
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      // Effective modifiers should be reduced
      expect(result.effectiveModifiers.STR).toBe(1); // Was 2, now 1
      expect(result.effectiveModifiers.DEX).toBe(0); // Was 1, now 0
    });

    it('should calculate encumbrance correctly', () => {
      const character = createTestCharacter();
      const inventory = createTestInventory();
      
      // Add heavy items to trigger encumbrance
      const heavyItem: Item = {
        id: 'heavy-1',
        name: 'Heavy Rock',
        category: 'gear',
        tags: [{ name: 'weight', value: 8 }],
        weight: 8,
        value: 0,
        quantity: 1,
        equipped: false
      };
      
      inventory.items['heavy-1'] = heavyItem;
      
      const context: CalculationContext = {
        character,
        inventory,
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      expect(result.currentLoad).toBe(15); // 7 + 8 = 15
      expect(result.maxLoad).toBe(14); // Fighter base 12 + STR 2
      expect(result.encumbranceStatus).toBe('encumbered');
      expect(result.encumbrancePenalty).toBe(-1);
      expect(result.ongoingModifier).toBe(-1); // From encumbrance
    });

    it('should handle temporary modifiers', () => {
      const context: CalculationContext = {
        character: createTestCharacter(),
        inventory: createTestInventory(),
        modifiers: {
          modifiers: [
            {
              id: 'bless-1',
              name: 'Blessed',
              type: 'ongoing',
              value: 1,
              source: 'Cleric spell',
              target: 'all-rolls',
              expiry: 'scene',
              createdAt: new Date(),
              active: true
            },
            {
              id: 'aid-1',
              name: 'Aid',
              type: 'forward',
              value: 1,
              source: 'Ally help',
              target: 'next-roll',
              expiry: 'used',
              createdAt: new Date(),
              active: true
            }
          ],
          lastUpdated: new Date()
        },
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      expect(result.ongoingModifier).toBe(1); // From bless
      expect(result.forwardModifier).toBe(1); // From aid
    });

    it('should calculate damage correctly', () => {
      const context: CalculationContext = {
        character: createTestCharacter(),
        inventory: createTestInventory(), // Has +1 damage sword
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      expect(result.damageDie).toBe('d10'); // Fighter damage die
      expect(result.damageBonus).toBe(1); // From sword
    });

    it('should generate appropriate warnings', () => {
      const character = createTestCharacter();
      character.hp.current = 0; // At 0 HP
      character.xp = 15; // Enough to level up
      character.bonds = []; // No bonds
      
      const context: CalculationContext = {
        character,
        inventory: createTestInventory(),
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      expect(result.warnings).toContain('HP at 0 or below - Last Breath should be triggered');
      expect(result.warnings).toContain('Character has enough XP to level up');
      expect(result.warnings).toContain('Character has no bonds - consider adding bonds for better roleplay');
    });

    it('should detect equipment conflicts', () => {
      const inventory = createTestInventory();
      
      // Add second armor
      const secondArmor: Armor = {
        id: 'armor-2',
        name: 'Chain Mail',
        category: 'armor',
        tags: [{ name: 'worn' }, { name: 'weight', value: 3 }],
        weight: 3,
        value: 30,
        armorValue: 2,
        quantity: 1,
        equipped: true
      };
      
      inventory.items['armor-2'] = secondArmor;
      
      const context: CalculationContext = {
        character: createTestCharacter(),
        inventory,
        modifiers: createEmptyModifiers(),
        conditions: [],
        conditionDefinitions: []
      };
      
      const result = calculationEngine.calculate(context);
      
      expect(result.errors).toContain('Multiple armor pieces equipped - only one can be worn at a time');
    });
  });
});
