/**
 * Dungeon World Wizard spell list.
 * Source: docs/dungeon_world_wizard.yaml (Dungeon World SRD, CC-BY 3.0).
 */
export interface WizardSpell {
  id: string
  name: string
  level: number
  tags: string[]
  effect: string
  source: string
}

export const WIZARD_SPELLS: WizardSpell[] = [
  {
    "id": "light",
    "name": "Light",
    "level": 0,
    "tags": [
      "cantrip"
    ],
    "effect": "Touched item sheds torch‑bright, heatless light under your control (color) while in your presence.",
    "source": "Dungeon World SRD — Wizard Spells (Cantrips)"
  },
  {
    "id": "unseen_servant",
    "name": "Unseen Servant",
    "level": 0,
    "tags": [
      "cantrip",
      "ongoing"
    ],
    "effect": "Conjure an invisible carrier (Load 3) that follows and holds what you hand it; ends if damaged or it leaves your presence.",
    "source": "Dungeon World SRD — Wizard Spells (Cantrips)"
  },
  {
    "id": "prestidigitation",
    "name": "Prestidigitation",
    "level": 0,
    "tags": [
      "cantrip"
    ],
    "effect": "Minor magical tricks: cosmetic changes to a touched item (clean, soil, warm, cool, flavor, recolor) or small obvious illusions no larger than you.",
    "source": "Dungeon World SRD — Wizard Spells (Cantrips)"
  },
  {
    "id": "contact_spirits",
    "name": "Contact Spirits",
    "level": 1,
    "tags": [
      "summoning"
    ],
    "effect": "Name (or let GM name) a spirit; you draw it near to answer one question truthfully to the best of its ability.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "detect_magic",
    "name": "Detect Magic",
    "level": 1,
    "tags": [
      "divination"
    ],
    "effect": "Briefly attune a sense to magic; the GM tells you what here is magical.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "telepathy",
    "name": "Telepathy",
    "level": 1,
    "tags": [
      "divination",
      "ongoing"
    ],
    "effect": "Create a telepathic bond with one touched person; only one bond at a time.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "charm_person",
    "name": "Charm Person",
    "level": 1,
    "tags": [
      "enchantment",
      "ongoing"
    ],
    "effect": "Touched person (not beast/monster) treats you as a friend until harmed or you prove otherwise.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "invisibility",
    "name": "Invisibility",
    "level": 1,
    "tags": [
      "illusion",
      "ongoing"
    ],
    "effect": "Touch an ally; they become invisible until they attack or you dismiss the spell. While ongoing, you cannot cast a spell.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "magic_missile",
    "name": "Magic Missile",
    "level": 1,
    "tags": [
      "evocation"
    ],
    "effect": "Loose pure magical bolts that deal 2d4 damage to a single target.",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "alarm",
    "name": "Alarm",
    "level": 1,
    "tags": [],
    "effect": "Walk a wide circle; until you next prepare, you’re alerted if any creature crosses it (even while sleeping).",
    "source": "Dungeon World SRD — Wizard Spells (Level 1)"
  },
  {
    "id": "dispel_magic",
    "name": "Dispel Magic",
    "level": 3,
    "tags": [],
    "effect": "End a chosen spell or magic effect in your presence; lesser magics end entirely, stronger ones are suppressed while you remain nearby.",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "visions_through_time",
    "name": "Visions Through Time",
    "level": 3,
    "tags": [
      "divination"
    ],
    "effect": "Gaze into a reflective surface to witness a looming grim portent; the GM also tells you something useful about how to interfere with it.",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "fireball",
    "name": "Fireball",
    "level": 3,
    "tags": [
      "evocation"
    ],
    "effect": "Explosive flame engulfs the target and nearby creatures for 2d6 damage that ignores armor.",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "mimic",
    "name": "Mimic",
    "level": 3,
    "tags": [
      "ongoing"
    ],
    "effect": "Assume the exact physical form of someone you touch until you take damage or choose to end it; while ongoing you lose access to your wizard moves.",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "mirror_image",
    "name": "Mirror Image",
    "level": 3,
    "tags": [
      "illusion"
    ],
    "effect": "Create an illusory duplicate; when attacked roll d6 — on 4–6 the attack hits the image instead (then the spell ends).",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "sleep",
    "name": "Sleep",
    "level": 3,
    "tags": [
      "enchantment"
    ],
    "effect": "1d4 visible enemies (GM chooses) fall asleep; only sleep‑capable creatures are affected; they wake normally (noise, jolt, pain).",
    "source": "Dungeon World SRD — Wizard Spells (Level 3)"
  },
  {
    "id": "cage",
    "name": "Cage",
    "level": 5,
    "tags": [
      "evocation",
      "ongoing"
    ],
    "effect": "Imprison a target in force; nothing in or out. While ongoing you can’t leave sight of the cage; the target hears your thoughts.",
    "source": "Dungeon World SRD — Wizard Spells (Level 5)"
  },
  {
    "id": "contact_other_plane",
    "name": "Contact Other Plane",
    "level": 5,
    "tags": [
      "divination"
    ],
    "effect": "Open two‑way communication with a specified extraplanar entity; either side can end the contact at will.",
    "source": "Dungeon World SRD — Wizard Spells (Level 5)"
  },
  {
    "id": "polymorph",
    "name": "Polymorph",
    "level": 5,
    "tags": [
      "enchantment"
    ],
    "effect": "Touch reshapes a creature as you describe (including stat/trait changes). GM adds one or more constraints (instability, altered mind, unintended twist). Lasts until you cast a spell.",
    "source": "Dungeon World SRD — Wizard Spells (Level 5)"
  },
  {
    "id": "summon_monster",
    "name": "Summon Monster",
    "level": 5,
    "tags": [
      "summoning",
      "ongoing"
    ],
    "effect": "Conjure a monster that acts like a PC with only basic moves; stats: +1 to all, 1 HP, your damage die. Choose 1d6 traits (e.g., +2 to a stat, careful, d8 damage, extra HP per your level, a useful adaptation). Remains until it dies or you dismiss it. While ongoing you take −1 to cast.",
    "source": "Dungeon World SRD — Wizard Spells (Level 5)"
  },
  {
    "id": "dominate",
    "name": "Dominate",
    "level": 7,
    "tags": [
      "enchantment",
      "ongoing"
    ],
    "effect": "On touch you gain 1d4 hold to command: speak brief words, hand over an item, make a focused attack, or answer truthfully. Lose 1 hold if they take damage; while ongoing you cannot cast.",
    "source": "Dungeon World SRD — Wizard Spells (Level 7)"
  },
  {
    "id": "true_seeing_wiz",
    "name": "True Seeing",
    "level": 7,
    "tags": [
      "divination",
      "ongoing"
    ],
    "effect": "Perceive things as they truly are until you tell a lie or dismiss the spell. While ongoing you take −1 to cast.",
    "source": "Dungeon World SRD — Wizard Spells (Level 7)"
  },
  {
    "id": "shadow_walk",
    "name": "Shadow Walk",
    "level": 7,
    "tags": [
      "illusion"
    ],
    "effect": "Turn a chosen shadow into a one‑use portal for you and allies to a described location (description length ≤ your level).",
    "source": "Dungeon World SRD — Wizard Spells (Level 7)"
  },
  {
    "id": "contingency",
    "name": "Contingency",
    "level": 7,
    "tags": [
      "evocation"
    ],
    "effect": "Hold one 5th‑level‑or‑lower spell you know with a trigger (≤ your level words). It fires automatically on trigger or when you choose. Only one held spell at a time.",
    "source": "Dungeon World SRD — Wizard Spells (Level 7)"
  },
  {
    "id": "cloudkill",
    "name": "Cloudkill",
    "level": 7,
    "tags": [
      "summoning",
      "ongoing"
    ],
    "effect": "A deathly fog fills the area. Whenever a creature there takes damage, it takes an extra separate 1d6 (ignores armor). Persists while you can see the area or until you dismiss it.",
    "source": "Dungeon World SRD — Wizard Spells (Level 7)"
  },
  {
    "id": "antipathy",
    "name": "Antipathy",
    "level": 9,
    "tags": [
      "enchantment",
      "ongoing"
    ],
    "effect": "Name a target and a creature type or alignment: such creatures cannot bear to be within sight of the target and flee if they are.",
    "source": "Dungeon World SRD — Wizard Spells (Level 9)"
  },
  {
    "id": "alert",
    "name": "Alert",
    "level": 9,
    "tags": [
      "divination"
    ],
    "effect": "Describe an event; the GM tells you when it happens, anywhere. You may also view the location of the event. Only one Alert at a time.",
    "source": "Dungeon World SRD — Wizard Spells (Level 9)"
  },
  {
    "id": "soul_gem",
    "name": "Soul Gem",
    "level": 9,
    "tags": [],
    "effect": "Trap the soul of a dying creature in a gem. It is aware and can be influenced; moves against it are +1. You can free it (cannot be recaptured).",
    "source": "Dungeon World SRD — Wizard Spells (Level 9)"
  },
  {
    "id": "shelter",
    "name": "Shelter",
    "level": 9,
    "tags": [
      "evocation",
      "ongoing"
    ],
    "effect": "Conjure a structure of pure magic (hut to castle). Impervious to non‑magical harm. Persists until you leave or end it.",
    "source": "Dungeon World SRD — Wizard Spells (Level 9)"
  },
  {
    "id": "perfect_summons",
    "name": "Perfect Summons",
    "level": 9,
    "tags": [
      "summoning"
    ],
    "effect": "Teleport a creature to you by specific name or by brief type description (exact or an example of that type).",
    "source": "Dungeon World SRD — Wizard Spells (Level 9)"
  }
]
