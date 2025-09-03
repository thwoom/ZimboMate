import { Attributes, Character, getAttributeModifier } from '../models/Character';
import { DiceRoll,DiceRollingService, RollModifiers, RollOptions } from './DiceRollingService';
import type { Spell as ServiceSpell, SpellClass } from './Spells';
import { getSpellsForClass } from './Spells';

/** Utilities for Dungeon World spell preparation and casting (official rules) */
export class SpellCastingService {
  constructor(private dice: DiceRollingService) {}

  /** Which stat is used to cast spells for this character */
  public getSpellcastingStat(character: Character): keyof Attributes | undefined {
    if (character.class === 'Wizard') return 'INT';
    if (character.class === 'Cleric') return 'WIS';
    return undefined;
  }

  /** Cantrip / Rote check (level 0) */
  public isCantrip(spell: ServiceSpell): boolean {
    // In our model, cantrips / rotes are level 0
    return (spell.level as number) === 0;
  }

  /** Official preparation budget: Level + 1 total spell levels; cantrips / rotes don't count */
  public getPreparationBudget(character: Character): number {
    return character.level + 1;
  }

  /** Sum of non-cantrip spell levels in list */
  public calculatePreparedLevels(spells: ServiceSpell[]): number {
    return spells.reduce((sum, s) => sum + (this.isCantrip(s) ? 0 : (s.level as number)), 0);
    }

  /** Replace prepared spells for Wizard / Cleric according to budget rules */
  public prepareSpells(character: Character, selectedSpellIds: string[]): Character {
    const cls = (['Wizard', 'Cleric', 'Immolator'] as SpellClass[]).includes(character.class as string)
      ? (character.class as SpellClass)
      : undefined;
    if (!cls) throw new Error('This class does not cast spells.');
    const allKnown = getSpellsForClass(cls);
    const spells = selectedSpellIds
      .map(id => allKnown.find(s => s.id === id))
      .filter((s): s is ServiceSpell => Boolean(s));

    const totalLevels = this.calculatePreparedLevels(spells);
    if (totalLevels > this.getPreparationBudget(character)) {
      throw new Error('Preparation exceeds budget (level + 1)');
    }

    const updated: Character = {
      ...character,
      preparedSpells: selectedSpellIds,
      // Remove unknown spellcasting strain on new preparation / commune
      conditions: (character.conditions || []).filter(c => c !== 'spellcasting-strain'),
    };
    return updated;
  }

  /** Cast a prepared spell following DW rules. Returns the DiceRoll and an updated character. */
  public castPreparedSpell(character: Character, spell: ServiceSpell, options?: { advantage?: boolean; disadvantage?: boolean; description?: string }): { roll: DiceRoll; updated: Character; tier: '10+' | '7-9' | '6-'; } {
    const statKey = this.getSpellcastingStat(character);
    if (!statKey) throw new Error('This class does not cast spells.');

    // Verify the spell is prepared (DW requires prepared / granted spells)
    const prepared = character.preparedSpells || [];
    if (!prepared.includes(spell.id) && !this.isCantrip(spell)) {
      throw new Error('Spell is not prepared.');
    }

    // Compute modifiers: stat + ongoing penalties specific to casting
    const statMod = getAttributeModifier(character.attributes[statKey]);
    const hasStrain = (character.conditions || []).includes('spellcasting-strain');
    const ongoingPenalty = hasStrain ? -1 : 0;

    const modifiers: RollModifiers = {
      stat: statMod,
      ongoing: ongoingPenalty,
      forward: 0,
      other: 0,
    };
    const rollOptions: RollOptions = {
      character,
      description: options?.description ?? `Cast ${spell.name}`,
      advantage: options?.advantage,
      disadvantage: options?.disadvantage,
    };

    const _roll = this.dice.roll2d6(modifiers, rollOptions);

    // Apply DW outcomes
    let updated: Character = { ...character };
    let tier: '10+' | '7-9' | '6-';
    if (roll.total >= 10) {
      // 10+: success, retain spell
      tier = '10+';
    } else if (roll.total >= 7) {
      // 7–9: caller must choose one of DW-listed consequences (handled by UI)
      tier = '7 - 9';
    } else {
      // 6-: failure — mark XP immediately
      tier = '6-';
      updated = { ...updated, xp: (updated.xp || 0) + 1 } as Character;
    }

    return { roll, updated, tier };
  }

  /** Apply a 7–9 consequence. Returns an updated character. */
  public applySevenToNineConsequence(character: Character, spell: ServiceSpell, consequence: 'unwelcome-attention' | 'forget' | 'strain'): Character {
    if (consequence === 'forget') {
      // Wizard: forgotten; Cleric: revoked — same effect: remove from prepared
      const prepared = character.preparedSpells || [];
      return { ...character, preparedSpells: prepared.filter(id => id !== spell.id) };
    }
    if (consequence === 'strain') {
      // -1 ongoing to Cast a Spell until next Prepare / Commune
      const conditions = new Set(character.conditions || []);
      conditions.add('spellcasting-strain');
      return { ...character, conditions: [...conditions] };
    }
    // unwelcome-attention is fictional; no mechanical change here
    return character;
  }
}

export const spellCastingService = new SpellCastingService(new DiceRollingService());




