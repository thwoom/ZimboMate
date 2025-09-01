import { describe, it, expect } from 'vitest';
import { SpellCastingService } from '../../src / services / SpellCastingService';
import { DiceRollingService } from '../../src / services / DiceRollingService';
import { Character } from '../../src / models / Character';

describe('SpellCastingService - Prepare Spells / Commune Flows', () => {
  const service = new SpellCastingService(new DiceRollingService());

  const mockWizard: Character = {
    id: 'wizard - 1',
    name: 'Test Wizard',
    class: 'Wizard',
    race: 'Human',
    level: 3,
    alignment: 'Neutral',
    attributes: { STR: 12, DEX: 14, CON: 10, INT: 16, WIS: 12, CHA: 8 },
    debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
    hp: { current: 20, max: 20 },
    armor: 0,
    damageDie: 'd6',
    load: { current: 0, max: 5 },
    baseLoad: 5,
    coin: 0,
    xp: 0,
    inventory: [],
    preparedSpells: ['magic - missile', 'shield'],
    conditions: ['spellcasting - strain'],
    bonds: [],
    knownMoves: [],
    advancements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCleric: Character = {
    id: 'cleric - 1',
    name: 'Test Cleric',
    class: 'Cleric',
    race: 'Human',
    level: 2,
    alignment: 'Good',
    attributes: { STR: 10, DEX: 12, CON: 14, INT: 8, WIS: 16, CHA: 12 },
    debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
    hp: { current: 18, max: 18 },
    armor: 0,
    damageDie: 'd6',
    load: { current: 0, max: 5 },
    baseLoad: 5,
    coin: 0,
    xp: 0,
    inventory: [],
    preparedSpells: ['cure - light - wounds'],
    conditions: ['spellcasting - strain'],
    bonds: [],
    knownMoves: [],
    advancements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('prepareSpells', () => {
    it('should clear spellcasting strain when preparing spells', () => {
      const _result = service.prepareSpells(mockWizard, mockWizard.preparedSpells || []);

      expect(result.conditions).not.toContain('spellcasting - strain');
      expect(result.preparedSpells).toEqual(mockWizard.preparedSpells);
    });

    it('should clear spellcasting strain when communing (Cleric)', () => {
      const _result = service.prepareSpells(mockCleric, mockCleric.preparedSpells || []);

      expect(result.conditions).not.toContain('spellcasting - strain');
      expect(result.preparedSpells).toEqual(mockCleric.preparedSpells);
    });

    it('should preserve other conditions when clearing strain', () => {
      const wizardWithOtherConditions = {
        ...mockWizard,
        conditions: ['spellcasting - strain', 'other - condition'],
      };

      const _result = service.prepareSpells(wizardWithOtherConditions, wizardWithOtherConditions.preparedSpells || []);

      expect(result.conditions).not.toContain('spellcasting - strain');
      expect(result.conditions).toContain('other - condition');
    });

    it('should work when no strain is present', () => {
      const wizardWithoutStrain = {
        ...mockWizard,
        conditions: [],
      };

      const result = service.prepareSpells(wizardWithoutStrain, wizardWithoutStrain.preparedSpells || []);

      expect(result.conditions).toEqual([]);
      expect(result.preparedSpells).toEqual(wizardWithoutStrain.preparedSpells);
    });
  });

  describe('getPreparationBudget', () => {
    it('should return level + 1 for preparation budget', () => {
      expect(service.getPreparationBudget(mockWizard)).toBe(4); // Level 3 + 1
      expect(service.getPreparationBudget(mockCleric)).toBe(3); // Level 2 + 1
    });
  });

  describe('calculatePreparedLevels', () => {
    it('should calculate total levels excluding cantrips', () => {
      const spells = [
        { id: 'magic - missile', name: 'Magic Missile', level: 1, description: 'Test' },
        { id: 'shield', name: 'Shield', level: 1, description: 'Test' },
        { id: 'cantrip', name: 'Cantrip', level: 0, description: 'Test' },
      ];

      expect(service.calculatePreparedLevels(spells)).toBe(2); // 1 + 1 + 0
    });
  });
});
