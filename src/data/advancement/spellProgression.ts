import type { CharacterClass } from '../../models/Character'

export interface SpellProgression {
  level: number
  cleric?: {
    newSpellsKnown?: number
    notes?: string
  }
  wizard?: {
    newSpellsKnown?: number
    notes?: string
  }
}

/**
 * Cleric and Wizard spell progression summary.
 * Source: docs/compendium_data.md (Dungeon World SRD, CC-BY 3.0).
 */
export const SPELL_PROGRESSION: SpellProgression[] = [
  {
    level: 1,
    cleric: {
      notes:
        'Access to all cleric rotes and any 1st-level cleric spells via Commune; prepared spell levels equal level + 1 (2 total); rotes are always prepared and do not count against the limit.',
    },
    wizard: {
      newSpellsKnown: 3,
      notes:
        'Spellbook starts with all cantrips plus three 1st-level spells; prepared spell levels equal level + 1 (2 total).',
    },
  },
  {
    level: 2,
    cleric: {
      notes:
        'Prepared spell capacity increases to 3 levels; may now request and prepare 2nd-level cleric spells during Commune.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 2 or lower to the spellbook; prepared spell capacity increases to 3 levels (max spell level 2).',
    },
  },
  {
    level: 3,
    cleric: {
      notes:
        'Prepared spell capacity increases to 4 levels; unlocks 3rd-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 3 or lower to the spellbook; prepared spell capacity increases to 4 levels (max spell level 3).',
    },
  },
  {
    level: 4,
    cleric: {
      notes:
        'Prepared spell capacity increases to 5 levels; unlocks 4th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 4 or lower to the spellbook; prepared spell capacity increases to 5 levels (max spell level 4).',
    },
  },
  {
    level: 5,
    cleric: {
      notes:
        'Prepared spell capacity increases to 6 levels; unlocks 5th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 5 or lower to the spellbook; prepared spell capacity increases to 6 levels (max spell level 5).',
    },
  },
  {
    level: 6,
    cleric: {
      notes:
        'Prepared spell capacity increases to 7 levels; unlocks 6th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 6 or lower to the spellbook; prepared spell capacity increases to 7 levels (max spell level 6).',
    },
  },
  {
    level: 7,
    cleric: {
      notes:
        'Prepared spell capacity increases to 8 levels; unlocks 7th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 7 or lower to the spellbook; prepared spell capacity increases to 8 levels (max spell level 7).',
    },
  },
  {
    level: 8,
    cleric: {
      notes:
        'Prepared spell capacity increases to 9 levels; unlocks 8th-level cleric spells (if available in the campaign).',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 8 or lower to the spellbook; prepared spell capacity increases to 9 levels (max spell level 8).',
    },
  },
  {
    level: 9,
    cleric: {
      notes:
        'Prepared spell capacity increases to 10 levels; unlocks 9th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 9 or lower to the spellbook; prepared spell capacity increases to 10 levels (max spell level 9).',
    },
  },
  {
    level: 10,
    cleric: {
      notes:
        'Prepared spell capacity increases to 11 levels; retains access up to 9th-level cleric spells.',
    },
    wizard: {
      newSpellsKnown: 1,
      notes:
        'Adds one spell of level 9 or lower to the spellbook; prepared spell capacity increases to 11 levels (max spell level remains 9 in standard play).',
    },
  },
]
