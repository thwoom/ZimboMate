/**
 * Unit tests for Validation service
 */

import { describe, it, expect } from 'vitest';
import {
  CharacterValidation,
  ItemValidation,
  InventoryValidation,
  MoveValidation,
  BusinessRules,
  validateGameState
} from '../../src/services/Validation';
import { Character, Attributes } from '../../src/models/Character';
import { Item, Armor } from '../../src/models/Equipment';
import { Move } from '../../src/models/Move';
import { createEmptyInventory } from '../../src/models/Inventory';

describe('Validation Service', () => {
  describe('CharacterValidation', () => {
    describe('validateAttributes', () => {
      it('should validate attribute ranges', () => {
        const validAttributes: Attributes = {
          STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
        };
        
        const result = CharacterValidation.validateAttributes(validAttributes);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch out-of-range attributes', () => {
        const invalidAttributes: Attributes = {
          STR: 19, // Too high
          DEX: 14,
          CON: 2,  // Too low
          INT: 12,
          WIS: 10,
          CHA: 8
        };
        
        const result = CharacterValidation.validateAttributes(invalidAttributes);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0]).toContain('STR must be between 3 and 18');
        expect(result.errors[1]).toContain('CON must be between 3 and 18');
      });

      it('should warn about high point totals', () => {
        const highAttributes: Attributes = {
          STR: 16, DEX: 16, CON: 16, INT: 14, WIS: 14, CHA: 14 // Total: 90
        };
        
        const result = CharacterValidation.validateAttributes(highAttributes);
        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toContain('exceed standard point buy limit');
      });
    });

    describe('validateLevelAndXP', () => {
      it('should validate valid level and XP', () => {
        const result = CharacterValidation.validateLevelAndXP(3, 5);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should catch invalid levels', () => {
        const result = CharacterValidation.validateLevelAndXP(11, 5);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Level must be between 1 and 10');
      });

      it('should warn about level up eligibility', () => {
        const result = CharacterValidation.validateLevelAndXP(3, 10); // 3 + 7 = 10
        expect(result.valid).toBe(true);
        expect(result.warnings[0]).toContain('Character has enough XP');
      });
    });

    describe('validateCharacter', () => {
      const createTestCharacter = (): Character => ({
        id: '1',
        name: 'Test Hero',
        class: 'Fighter',
        race: 'Human',
        level: 3,
        alignment: 'Good',
        attributes: { STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        debilities: {
          weak: false, shaky: false, sick: false,
          stunned: false, confused: false, scarred: false
        },
        hp: { current: 10, max: 11 },
        armor: 2,
        damageDie: 'd10',
        xp: 5,
        load: { current: 5, max: 14 },
        baseLoad: 12,
        coin: 50,
        bonds: [],
        advancements: [],
        knownMoves: [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      it('should validate a valid character', () => {
        const character = createTestCharacter();
        const result = CharacterValidation.validateCharacter(character);
        
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('Character has no bonds - consider adding bonds for better roleplay');
      });

      it('should catch missing name', () => {
        const character = createTestCharacter();
        character.name = '';
        
        const result = CharacterValidation.validateCharacter(character);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Character must have a name');
      });

      it('should warn about negative HP', () => {
        const character = createTestCharacter();
        character.hp.current = -2;
        
        const result = CharacterValidation.validateCharacter(character);
        expect(result.warnings).toContain('Character HP is below 0 - Last Breath should be triggered');
      });

      it('should catch HP exceeding max', () => {
        const character = createTestCharacter();
        character.hp.current = 15;
        character.hp.max = 11;
        
        const result = CharacterValidation.validateCharacter(character);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Current HP (15) cannot exceed max HP (11)');
      });
    });
  });

  describe('ItemValidation', () => {
    describe('validateWeight', () => {
      it('should validate normal weights', () => {
        const item: Item = {
          id: '1',
          name: 'Sword',
          category: 'weapon',
          tags: [],
          weight: 2,
          quantity: 1,
          equipped: false
        };
        
        const result = ItemValidation.validateWeight(item);
        expect(result.valid).toBe(true);
      });

      it('should catch negative weight', () => {
        const item: Item = {
          id: '1',
          name: 'Magic Feather',
          category: 'gear',
          tags: [],
          weight: -1,
          quantity: 1,
          equipped: false
        };
        
        const result = ItemValidation.validateWeight(item);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Item weight cannot be negative');
      });

      it('should warn about very heavy items', () => {
        const item: Item = {
          id: '1',
          name: 'Boulder',
          category: 'gear',
          tags: [],
          weight: 15,
          quantity: 1,
          equipped: false
        };
        
        const result = ItemValidation.validateWeight(item);
        expect(result.warnings[0]).toContain('Item is extremely heavy');
      });
    });

    describe('validateTags', () => {
      it('should catch conflicting weapon tags', () => {
        const item: Item = {
          id: '1',
          name: 'Broken Sword',
          category: 'weapon',
          tags: [
            { name: 'hand' },
            { name: 'two-handed' }
          ],
          weight: 1,
          quantity: 1,
          equipped: false
        };
        
        const result = ItemValidation.validateTags(item);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("cannot be both 'hand' and 'two-handed'");
      });

      it('should warn about missing armor tags', () => {
        const armor: Armor = {
          id: '1',
          name: 'Leather',
          category: 'armor',
          tags: [],
          weight: 1,
          quantity: 1,
          equipped: false,
          armorValue: 1
        };
        
        const result = ItemValidation.validateTags(armor);
        expect(result.warnings[0]).toContain("Armor should have 'worn' tag");
      });

      it('should validate uses', () => {
        const item: Item = {
          id: '1',
          name: 'Healing Potion',
          category: 'consumable',
          tags: [],
          weight: 0,
          quantity: 1,
          equipped: false,
          uses: { current: 5, max: 3 }
        };
        
        const result = ItemValidation.validateTags(item);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Current uses (5) cannot exceed max uses (3)');
      });
    });
  });

  describe('InventoryValidation', () => {
    describe('validateEncumbrance', () => {
      it('should validate normal load', () => {
        const result = InventoryValidation.validateEncumbrance(
          createEmptyInventory(),
          10,
          'normal'
        );
        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn about encumbrance', () => {
        const result = InventoryValidation.validateEncumbrance(
          createEmptyInventory(),
          10,
          'encumbered'
        );
        expect(result.warnings[0]).toContain('Character is encumbered');
      });

      it('should error on overload', () => {
        const result = InventoryValidation.validateEncumbrance(
          createEmptyInventory(),
          10,
          'overloaded'
        );
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Character is overloaded');
      });
    });

    describe('validateEquippedItems', () => {
      it('should catch multiple armors', () => {
        const items: Item[] = [
          {
            id: '1',
            name: 'Leather',
            category: 'armor',
            tags: [],
            weight: 1,
            quantity: 1,
            equipped: true
          },
          {
            id: '2',
            name: 'Chainmail',
            category: 'armor',
            tags: [],
            weight: 3,
            quantity: 1,
            equipped: true
          }
        ];
        
        const result = InventoryValidation.validateEquippedItems(items);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Cannot equip multiple armor pieces');
      });

      it('should warn about two-handed weapon conflicts', () => {
        const items: Item[] = [
          {
            id: '1',
            name: 'Greatsword',
            category: 'weapon',
            tags: [{ name: 'two-handed' }],
            weight: 3,
            quantity: 1,
            equipped: true
          },
          {
            id: '2',
            name: 'Dagger',
            category: 'weapon',
            tags: [{ name: 'hand' }],
            weight: 1,
            quantity: 1,
            equipped: true
          }
        ];
        
        const result = InventoryValidation.validateEquippedItems(items);
        expect(result.warnings[0]).toContain('Two-handed weapon equipped with other weapons');
      });
    });
  });

  describe('MoveValidation', () => {
    describe('validateMoveRequirements', () => {
      it('should validate level requirements', () => {
        const move: Move = {
          id: '1',
          name: 'Advanced Move',
          category: 'advanced',
          description: 'A powerful move',
          trigger: 'When you...',
          triggerType: 'action',
          level: 6
        };
        
        const result = MoveValidation.validateMoveRequirements(move, 5, 'Fighter', []);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('Character level (5) too low');
      });

      it('should validate class requirements', () => {
        const move: Move = {
          id: '1',
          name: 'Divine Favor',
          category: 'class',
          description: 'Call upon your deity',
          trigger: 'When you...',
          triggerType: 'action',
          requiresClass: 'Cleric'
        };
        
        const result = MoveValidation.validateMoveRequirements(move, 3, 'Fighter', []);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('requires Cleric class');
      });
    });

    describe('validateCustomMove', () => {
      it('should validate complete custom move', () => {
        const move: Move = {
          id: '1',
          name: 'Custom Attack',
          category: 'custom',
          description: 'A special attack',
          trigger: 'When you attack with style',
          triggerType: 'roll',
          rollStat: 'STR',
          onSuccess: 'Deal damage and impress',
          onPartial: 'Deal damage',
          custom: true
        };
        
        const result = MoveValidation.validateCustomMove(move);
        expect(result.valid).toBe(true);
      });

      it('should catch missing required fields', () => {
        const move: Move = {
          id: '1',
          name: '',
          category: 'custom',
          description: '',
          trigger: '',
          triggerType: 'roll',
          custom: true
        };
        
        const result = MoveValidation.validateCustomMove(move);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(4); // name, description, trigger, rollStat
      });

      it('should warn about missing roll results', () => {
        const move: Move = {
          id: '1',
          name: 'Roll Move',
          category: 'custom',
          description: 'A roll move',
          trigger: 'When you roll',
          triggerType: 'roll',
          rollStat: 'DEX',
          custom: true
        };
        
        const result = MoveValidation.validateCustomMove(move);
        expect(result.warnings).toHaveLength(2);
        expect(result.warnings[0]).toContain('should specify 10+ result');
        expect(result.warnings[1]).toContain('should specify 7-9 result');
      });
    });
  });

  describe('BusinessRules', () => {
    describe('checkAutoTriggers', () => {
      it('should detect Last Breath trigger', () => {
        const character = {
          hp: { current: 0, max: 10 },
          level: 3,
          xp: 5
        } as Character;
        
        const triggers = BusinessRules.checkAutoTriggers(character);
        expect(triggers).toContain('Last Breath');
      });

      it('should detect Level Up trigger', () => {
        const character = {
          hp: { current: 10, max: 10 },
          level: 3,
          xp: 10 // 3 + 7
        } as Character;
        
        const triggers = BusinessRules.checkAutoTriggers(character);
        expect(triggers).toContain('Level Up');
      });
    });

    describe('applyEncumbranceEffects', () => {
      it('should apply correct ongoing penalties', () => {
        const character = {} as Character;
        
        expect(BusinessRules.applyEncumbranceEffects(character, 'normal').ongoing).toBe(0);
        expect(BusinessRules.applyEncumbranceEffects(character, 'encumbered').ongoing).toBe(-1);
        expect(BusinessRules.applyEncumbranceEffects(character, 'overloaded').ongoing).toBe(-3);
      });
    });
  });
});
