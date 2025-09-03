/**
 * Unit tests for Character model
 */

import { describe, expect,it } from 'vitest';

import {
  calculateMaxHP,
  calculateMaxLoad,
  Character,
  getAttributeModifier,
  getClassBaseHP,
  getClassBaseLoad,
  getClassDamageDie,
  getEffectiveModifier,
  getXPThreshold,
  shouldLevelUp,
} from '../../src / models / Character';

describe('Character Model', () => {
  describe('getAttributeModifier', () => {
    it('should calculate correct modifiers for attribute scores', () => {
      expect(getAttributeModifier(3)).toBe(-3);
      expect(getAttributeModifier(4)).toBe(-2);
      expect(getAttributeModifier(5)).toBe(-2);
      expect(getAttributeModifier(6)).toBe(-1);
      expect(getAttributeModifier(8)).toBe(-1);
      expect(getAttributeModifier(9)).toBe(0);
      expect(getAttributeModifier(12)).toBe(0);
      expect(getAttributeModifier(13)).toBe(1);
      expect(getAttributeModifier(15)).toBe(1);
      expect(getAttributeModifier(16)).toBe(2);
      expect(getAttributeModifier(17)).toBe(2);
      expect(getAttributeModifier(18)).toBe(3);
    });
  });

  describe('getEffectiveModifier', () => {
    const attributes = {
      STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8,
    };

    it('should return base modifier when no debilities', () => {
      const _debilities = {
        weak: false, shaky: false, sick: false,
        stunned: false, confused: false, scarred: false,
      };

      expect(getEffectiveModifier('STR', attributes, debilities)).toBe(2);
      expect(getEffectiveModifier('DEX', attributes, debilities)).toBe(1);
      expect(getEffectiveModifier('CHA', attributes, debilities)).toBe(-1);
    });

    it('should apply debility penalties', () => {
      const debilities = {
        weak: true, shaky: true, sick: false,
        stunned: false, confused: false, scarred: true,
      };

      expect(getEffectiveModifier('STR', attributes, debilities)).toBe(1); // 2 - 1
      expect(getEffectiveModifier('DEX', attributes, debilities)).toBe(0); // 1 - 1
      expect(getEffectiveModifier('CHA', attributes, debilities)).toBe(-2); // -1 - 1
    });
  });

  describe('XP calculations', () => {
    it('should calculate correct XP threshold', () => {
      expect(getXPThreshold(1)).toBe(8);  // 1 + 7
      expect(getXPThreshold(3)).toBe(10); // 3 + 7
      expect(getXPThreshold(10)).toBe(17); // 10 + 7
    });

    it('should correctly determine if character should level up', () => {
      const _character = {
        level: 3,
        xp: 9,
      } as Character;

      expect(shouldLevelUp(character)).toBe(false); // 9 < 10

      character.xp = 10;
      expect(shouldLevelUp(character)).toBe(true); // 10 >= 10

      character.xp = 15;
      expect(shouldLevelUp(character)).toBe(true); // 15 >= 10
    });
  });

  describe('Class - specific values', () => {
    it('should return correct base HP for each class', () => {
      expect(getClassBaseHP('Fighter')).toBe(10);
      expect(getClassBaseHP('Wizard')).toBe(4);
      expect(getClassBaseHP('Thief')).toBe(6);
      expect(getClassBaseHP('Cleric')).toBe(8);
    });

    it('should return correct base load for each class', () => {
      expect(getClassBaseLoad('Fighter')).toBe(12);
      expect(getClassBaseLoad('Wizard')).toBe(7);
      expect(getClassBaseLoad('Thief')).toBe(9);
      expect(getClassBaseLoad('Druid')).toBe(6);
    });

    it('should return correct damage die for each class', () => {
      expect(getClassDamageDie('Fighter')).toBe('d10');
      expect(getClassDamageDie('Wizard')).toBe('d4');
      expect(getClassDamageDie('Ranger')).toBe('d8');
      expect(getClassDamageDie('Bard')).toBe('d6');
    });
  });

  describe('calculateMaxHP', () => {
    it('should calculate max HP correctly', () => {
      const character: Character = {
        id: '1',
        name: 'Test Fighter',
        class: 'Fighter',
        race: 'Human',
        level: 1,
        alignment: 'Good',
        attributes: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 8 },
        debilities: {
          weak: false, shaky: false, sick: false,
          stunned: false, confused: false, scarred: false,
        },
        hp: { current: 10, max: 10 },
        armor: 0,
        damageDie: 'd10',
        xp: 0,
        load: { current: 0, max: 0 },
        baseLoad: 12,
        coin: 0,
        bonds: [],
        advancements: [],
        knownMoves: [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Fighter base HP (10) + CON modifier (15 = +1) = 11
      expect(calculateMaxHP(character)).toBe(11);

      // With sick debility (CON - 1)
      character.debilities.sick = true;
      expect(calculateMaxHP(character)).toBe(10); // 10 + 0

      // Low CON
      character.attributes.CON = 6; // -1 modifier
      character.debilities.sick = false;
      expect(calculateMaxHP(character)).toBe(9); // 10 - 1

      // Very low CON with debility
      character.attributes.CON = 3; // -3 modifier
      character.debilities.sick = true; // additional - 1
      // Fighter base HP (10) + CON modifier (-3) + debility (-1) = 6
      expect(calculateMaxHP(character)).toBe(6);

      // Test minimum HP safeguard with Wizard (base HP 4)
      character.class = 'Wizard';
      character.attributes.CON = 3; // -3 modifier
      character.debilities.sick = true; // additional - 1
      // Wizard base HP (4) + CON modifier (-3) + debility (-1) = 0, but min is 1
      expect(calculateMaxHP(character)).toBe(1);
    });
  });

  describe('calculateMaxLoad', () => {
    it('should calculate max load correctly', () => {
      const character: Character = {
        id: '1',
        name: 'Test Fighter',
        class: 'Fighter',
        race: 'Human',
        level: 1,
        alignment: 'Good',
        attributes: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 8 },
        debilities: {
          weak: false, shaky: false, sick: false,
          stunned: false, confused: false, scarred: false,
        },
        hp: { current: 10, max: 10 },
        armor: 0,
        damageDie: 'd10',
        xp: 0,
        load: { current: 0, max: 0 },
        baseLoad: 12,
        coin: 0,
        bonds: [],
        advancements: [],
        knownMoves: [],
        conditions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Fighter base load (12) + STR modifier (16 = +2) = 14
      expect(calculateMaxLoad(character)).toBe(14);

      // With weak debility (STR - 1)
      character.debilities.weak = true;
      expect(calculateMaxLoad(character)).toBe(13); // 12 + 1

      // Low STR
      character.attributes.STR = 8; // -1 modifier
      character.debilities.weak = false;
      expect(calculateMaxLoad(character)).toBe(11); // 12 - 1

      // Very low STR (should never go below 1)
      character.attributes.STR = 3; // -3 modifier
      character.debilities.weak = true; // additional - 1
      expect(calculateMaxLoad(character)).toBe(8); // 12 - 4 = 8 (not below 1)
    });
  });
});
