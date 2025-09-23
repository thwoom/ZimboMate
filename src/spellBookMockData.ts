// Authentic Dungeon World spell data from the SRD

// DW spell levels are simply numbered 1-9
export enum DWSpellLevel {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
  SIXTH = 6,
  SEVENTH = 7,
  EIGHTH = 8,
  NINTH = 9
}

// DW spell classes
export enum DWSpellClass {
  WIZARD = 'wizard',
  CLERIC = 'cleric'
}

// DW spell preparation status - Wizards prepare spells, Clerics have them granted
export enum DWSpellPreparationStatus {
  AVAILABLE = 'available',
  PREPARED = 'prepared',
  CAST = 'cast'
}

// Authentic Dungeon World Wizard spells from the SRD
export const dwWizardSpells = [
  // 1st Level Wizard Spells
  {
    id: 'detect-magic',
    name: 'Detect Magic',
    level: 1,
    class: 'wizard',
    range: 'Near',
    ongoing: true,
    description: 'One of your senses is briefly attuned to magic. The GM will tell you what here is magical.',
    preparationStatus: 'available' as const
  },
  {
    id: 'light',
    name: 'Light',
    level: 1,
    class: 'wizard',
    range: 'Touch',
    ongoing: false,
    description: 'An item you touch glows with arcane light, about as bright as a torch. It gives off no heat or sound and requires no fuel, but it is otherwise like a mundane torch. You have complete control of the color of the flame. The spell lasts as long as it is in your presence.',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    class: 'wizard',
    range: 'Near',
    ongoing: false,
    description: 'Projectiles of pure magic spring from your fingers. Deal 2d4 damage to one target.',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'charm-person',
    name: 'Charm Person',
    level: 1,
    class: 'wizard',
    range: 'Near',
    ongoing: true,
    description: 'The person (not beast or monster) you touch while casting this spell counts as your friend until they take damage or you prove otherwise.',
    preparationStatus: 'available' as const
  },
  {
    id: 'contact-spirits',
    name: 'Contact Spirits',
    level: 1,
    class: 'wizard',
    range: 'Self',
    ongoing: false,
    description: 'Name the spirit you wish to contact (or leave it to the GM). You pull that creature through the planes, just close enough to speak to you. It is bound to answer any one question you ask to the best of its ability.',
    preparationStatus: 'available' as const
  },

  // 3rd Level Wizard Spells
  {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    class: 'wizard',
    range: 'Near',
    ongoing: false,
    description: 'You evoke a mighty ball of flame that envelops your target and everyone nearby, inflicting 2d6 damage which ignores armor.',
    preparationStatus: 'available' as const
  },
  {
    id: 'dispel-magic',
    name: 'Dispel Magic',
    level: 3,
    class: 'wizard',
    range: 'Near',
    ongoing: false,
    description: 'Choose a spell or magic effect in your presence: this spell rips it apart. Lesser spells are ended, powerful magic is just reduced or dampened so long as you are near.',
    preparationStatus: 'available' as const
  },
  {
    id: 'invisibility',
    name: 'Invisibility',
    level: 3,
    class: 'wizard',
    range: 'Touch',
    ongoing: true,
    description: 'Touch an ally: nobody can see them. They\'re invisible! The spell persists until the target attacks or you dismiss the effect.',
    preparationStatus: 'available' as const
  },

  // 5th Level Wizard Spells
  {
    id: 'cage',
    name: 'Cage',
    level: 5,
    class: 'wizard',
    range: 'Near',
    ongoing: true,
    description: 'The target is held in a cage of magical force. Nothing can get in or out of the cage. The cage remains until you cast another spell or dismiss it.',
    preparationStatus: 'available' as const
  },
  {
    id: 'polymorph',
    name: 'Polymorph',
    level: 5,
    class: 'wizard',
    range: 'Near',
    ongoing: true,
    description: 'Your touch reshapes a creature entirely, they stay in the form you craft until you cast a spell. Describe the new shape you craft, including any stat changes, significant adaptations, or major weaknesses.',
    preparationStatus: 'available' as const
  }
];

// Authentic Dungeon World Cleric spells from the SRD
export const dwClericSpells = [
  // 1st Level Cleric Spells
  {
    id: 'bless',
    name: 'Bless',
    level: 1,
    class: 'cleric',
    range: 'Near',
    ongoing: true,
    description: 'Your deity smiles upon a combatant of your choice. They take +1 ongoing to damage until combat ends.',
    preparationStatus: 'available' as const
  },
  {
    id: 'cure-light-wounds',
    name: 'Cure Light Wounds',
    level: 1,
    class: 'cleric',
    range: 'Touch',
    ongoing: false,
    description: 'At your touch wounds scab and bones cease bleeding. Heal an ally for 1d8 damage.',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'guidance',
    name: 'Guidance',
    level: 1,
    class: 'cleric',
    range: 'Touch',
    ongoing: false,
    description: 'The symbol of your deity appears before you and gestures towards the direction or course of action your deity would have you take then disappears.',
    preparationStatus: 'prepared' as const
  },
  {
    id: 'magic-weapon',
    name: 'Magic Weapon',
    level: 1,
    class: 'cleric',
    range: 'Touch',
    ongoing: true,
    description: 'The weapon you hold while casting does +1d4 damage until you dismiss this spell.',
    preparationStatus: 'available' as const
  },

  // 3rd Level Cleric Spells
  {
    id: 'cure-moderate-wounds',
    name: 'Cure Moderate Wounds',
    level: 3,
    class: 'cleric',
    range: 'Touch',
    ongoing: false,
    description: 'You staunch bleeding and set bones through divine magic. Heal an ally for 2d8+2 damage.',
    preparationStatus: 'available' as const
  },
  {
    id: 'darkness',
    name: 'Darkness',
    level: 3,
    class: 'cleric',
    range: 'Near',
    ongoing: true,
    description: 'Choose an area you can see: it\'s filled with supernatural darkness that blocks out all light.',
    preparationStatus: 'available' as const
  },
  {
    id: 'hold-person',
    name: 'Hold Person',
    level: 3,
    class: 'cleric',
    range: 'Near',
    ongoing: true,
    description: 'Choose a person you can see. Until you cast a spell or leave their presence, they cannot act except to speak.',
    preparationStatus: 'available' as const
  },

  // 5th Level Cleric Spells
  {
    id: 'cure-critical-wounds',
    name: 'Cure Critical Wounds',
    level: 5,
    class: 'cleric',
    range: 'Touch',
    ongoing: false,
    description: 'Make your healing touch miraculous. Heal an ally for 3d8+3 damage.',
    preparationStatus: 'available' as const
  },
  {
    id: 'raise-dead',
    name: 'Raise Dead',
    level: 5,
    class: 'cleric',
    range: 'Touch',
    ongoing: false,
    description: 'You return a corpse to a semblance of life. The corpse does your bidding to the best of its abilities, limited by what it can do in its current state.',
    preparationStatus: 'available' as const
  }
];

// Combined spell list for easy access
export const allDWSpells = [...dwWizardSpells, ...dwClericSpells];

// DW spell preparation system - no spell slots
export const mockDWSpellcasting = {
  // Wizards prepare Level + 1 spells
  wizardSpellsPrepared: 2, // Level 1 wizard prepares 2 spells
  wizardMaxPrepared: 2,

  // Clerics have access to all spells of their level and below
  clericLevel: 1,
  clericSpellsPerDay: {
    1: 2, // Can cast 2 first-level spells per day
    3: 0, // Cannot cast 3rd level yet
    5: 0  // Cannot cast 5th level yet
  }
};

// Character's current spell preparation (example)
export const mockPreparedSpells = {
  wizard: ['light', 'magic-missile'], // Wizard has these prepared
  cleric: ['cure-light-wounds', 'guidance'] // Cleric has these ready to cast
};