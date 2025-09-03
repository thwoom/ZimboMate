export type SpellClass = 'Wizard' | 'Cleric' | 'Immolator';

export interface Spell {
  id: string; // unique identifier
  name: string;
  level: number; // 0: rotes / cantrips for wizard / cleric
  description: string;
}

export const SPELLS: Record < SpellClass, Spell[]> = {
  Wizard: [
    { id: 'wiz_cantrip_light', name: 'Light', level: 0, description: 'An item you touch glows with arcane light.' },
    { id: 'wiz_cantrip_prestidigitation', name: 'Prestidigitation', level: 0, description: 'Perform minor tricks of true magic.' },
    { id: 'wiz_cantrip_unseen_servant', name: 'Unseen Servant', level: 0, description: 'A specter assists you with simple tasks.' },
    { id: 'wiz_lvl1_magic_missile', name: 'Magic Missile', level: 1, description: 'Bolts of force strike your target.' },
    { id: 'wiz_lvl1_invisibility', name: 'Invisibility', level: 1, description: 'Render a subject invisible for a time.' },
    { id: 'wiz_lvl1_shield', name: 'Shield', level: 1, description: 'A shimmering barrier protects you.' },
  ],
  Cleric: [
    { id: 'clr_rote_light', name: 'Light', level: 0, description: 'A holy light illuminates your path.' },
    { id: 'clr_rote_sanctify', name: 'Sanctify', level: 0, description: 'Purify a food or object of unclean taint.' },
    { id: 'clr_rote_guidance', name: 'Guidance', level: 0, description: 'Your deity grants insight to an ally.' },
    { id: 'clr_lvl1_cure_light_wounds', name: 'Cure Light Wounds', level: 1, description: 'Heal an ally’s wounds with divine grace.' },
    { id: 'clr_lvl1_bless', name: 'Bless', level: 1, description: 'Bolster your allies with divine favor.' },
    { id: 'clr_lvl1_detect_alignment', name: 'Detect Alignment', level: 1, description: 'Discern the alignment of a person or creature.' },
  ],
  Immolator: [
    { id: 'imm_spark', name: 'Spark', level: 0, description: 'You kindle a small flame from nothing.' },
    { id: 'imm_scorch', name: 'Scorch', level: 1, description: 'Wreathe your hand in fire to burn your foe.' },
    { id: 'imm_heat_metal', name: 'Heat Metal', level: 1, description: 'Objects grow painfully hot at your command.' },
  ],
};

export function getSpellsForClass(cls: SpellClass): Spell[] {
  return SPELLS[cls] || [];
}




