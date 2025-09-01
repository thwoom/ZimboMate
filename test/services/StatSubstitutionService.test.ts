import { StatSubstitutionService } from '../../src / services / StatSubstitutionService';
import { Character, CharacterClass } from '../../src / models / Character';

describe('StatSubstitutionService', () => {
  let mockCharacter: Character;

  beforeEach(() => {
    mockCharacter = {
      id: 'test - character',
      name: 'Test Fighter',
      class: 'Fighter' as CharacterClass,
      race: 'Human',
      level: 3,
      attributes: {
        STR: 16,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 8,
        CHA: 12,
      },
      knownMoves: ['fighter - advanced - 4'], // Defensive Fighter
      alignment: 'Good',
      hp: { current: 20, max: 20 },
      armor: 0,
      baseArmor: 0,
      damageDie: 'd10',
      xp: 0,
      load: { current: 0, max: 0 },
      baseLoad: 0,
      coin: 0,
      bonds: [],
      advancements: [],
      conditions: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false,
      },
    };
  });

  describe('getStatSubstitutions', () => {
    it('should return Defensive Fighter substitution for Defy Danger', () => {
      const _substitutions = StatSubstitutionService.getStatSubstitutions(mockCharacter, 'Defy Danger');

      expect(substitutions).toHaveLength(1);
      expect(substitutions[0]).toEqual({
        moveId: 'fighter - advanced - 4',
        moveName: 'Defensive Fighter',
        originalStat: 'unknown',
        substituteStat: 'CON',
        description: 'When you use Defy Danger, you may choose to use CON instead of unknown other stat.',
      });
    });

    it('should return empty array for moves without substitutions', () => {
      const _substitutions = StatSubstitutionService.getStatSubstitutions(mockCharacter, 'Hack and Slash');

      expect(substitutions).toHaveLength(0);
    });

    it('should return empty array for character without known moves', () => {
      mockCharacter.knownMoves = [];
      const substitutions = StatSubstitutionService.getStatSubstitutions(mockCharacter, 'Defy Danger');

      expect(substitutions).toHaveLength(0);
    });
  });

  describe('getAvailableStats', () => {
    it('should include CON for Defy Danger when character has Defensive Fighter', () => {
      const _stats = StatSubstitutionService.getAvailableStats(mockCharacter, 'Defy Danger', 'STR');

      expect(stats).toContain('STR');
      expect(stats).toContain('CON');
      expect(stats).toHaveLength(2);
    });

    it('should only return default stat when no substitutions available', () => {
      const stats = StatSubstitutionService.getAvailableStats(mockCharacter, 'Hack and Slash', 'STR');

      expect(stats).toEqual(['STR']);
    });
  });

  describe('hasStatSubstitution', () => {
    it('should return true for Defy Danger with Defensive Fighter', () => {
      const _hasSubstitution = StatSubstitutionService.hasStatSubstitution(mockCharacter, 'Defy Danger');

      expect(hasSubstitution).toBe(true);
    });

    it('should return false for moves without substitutions', () => {
      const hasSubstitution = StatSubstitutionService.hasStatSubstitution(mockCharacter, 'Hack and Slash');

      expect(hasSubstitution).toBe(false);
    });
  });

  describe('getBestStat', () => {
    it('should return CON when it has higher value than default stat', () => {
      mockCharacter.attributes.STR = 12; // Lower than CON (14)
      const _bestStat = StatSubstitutionService.getBestStat(mockCharacter, 'Defy Danger', 'STR');

      expect(bestStat).toBe('CON');
    });

    it('should return default stat when it has higher value than substitution', () => {
      mockCharacter.attributes.STR = 18; // Higher than CON (14)
      const _bestStat = StatSubstitutionService.getBestStat(mockCharacter, 'Defy Danger', 'STR');

      expect(bestStat).toBe('STR');
    });

    it('should return default stat when no substitutions available', () => {
      const bestStat = StatSubstitutionService.getBestStat(mockCharacter, 'Hack and Slash', 'STR');

      expect(bestStat).toBe('STR');
    });
  });

  describe('getSubstitutionExplanation', () => {
    it('should return explanation for CON substitution', () => {
      const _explanation = StatSubstitutionService.getSubstitutionExplanation(mockCharacter, 'Defy Danger', 'CON');

      expect(explanation).toBe('Using CON due to: Defensive Fighter');
    });

    it('should return null for non - substitution stat', () => {
      const _explanation = StatSubstitutionService.getSubstitutionExplanation(mockCharacter, 'Defy Danger', 'STR');

      expect(explanation).toBeNull();
    });

    it('should return null for moves without substitutions', () => {
      const explanation = StatSubstitutionService.getSubstitutionExplanation(mockCharacter, 'Hack and Slash', 'CON');

      expect(explanation).toBeNull();
    });
  });
});
