import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge, Progress } from '../../ui'
import type { Alignment, Attributes, Character, CharacterClass, Race } from '../../../models/Character'
import { getAttributeModifier, getClassBaseHP, getClassBaseLoad, getClassDamageDie, calculateMaxHP, calculateMaxLoad, getStandardArray } from '../../../models/Character'
import type { Item } from '../../../models/Equipment'
import { useCharacterStore } from '../../../stores/characterStore'
import { dwWizardSpells, dwClericSpells } from '../../../spellBookMockData'

type StepId =
  | 'class'
  | 'identity'
  | 'alignment'
  | 'attributes'
  | 'derived'
  | 'bonds'
  | 'gear'
  | 'spellcasting'
  | 'review'

const ALL_CLASSES: CharacterClass[] = [
  'Fighter','Paladin','Ranger','Thief','Bard','Cleric','Druid','Wizard','Barbarian','Immolator'
]
// DW Class-specific racial options from the official SRD (corrected)
const CLASS_RACIAL_OPTIONS: Record<CharacterClass, Race[]> = {
  Fighter: ['Human', 'Elf', 'Dwarf', 'Halfling'],
  Paladin: ['Human'],
  Ranger: ['Human', 'Elf'],
  Thief: ['Human', 'Halfling', 'Elf'], // Fixed: Thieves can be Elves
  Bard: ['Human', 'Elf'],
  Cleric: ['Human', 'Dwarf', 'Elf'], // Fixed: Clerics can be Elves
  Druid: ['Human', 'Elf'],
  Wizard: ['Human', 'Elf'],
  Barbarian: ['Human'],
  Immolator: ['Human']
}

// DW Racial moves by class and race from the official SRD
const RACIAL_MOVES: Record<CharacterClass, Record<Race, string[]>> = {
  Fighter: {
    Human: ['Adaptability: Once per battle, you may reroll a single damage die (your choice).'],
    Elf: ['Elven Grace: Choose one weapon—you can always treat weapons of that type as having the precise tag.'],
    Dwarf: ['Dwarven Toughness: You have +2 HP at first level (+1 HP at each additional level).'],
    Halfling: ['Halfling Luck: When you defy danger on a 12+, you transcend the danger. You not only do what you set out to do, but the GM will offer you a better outcome, true beauty, or a moment of grace.'],
    Other: []
  },
  Paladin: {
    Human: ['Devotion: When you commune you get 1 hold, even on a miss.'],
    Other: []
  },
  Ranger: {
    Human: ['Favored Enemy: Choose a species of creature. When spout lore about creatures of that type, take +1. +2 damage against creatures of that type.'],
    Elf: ['Elven Eyes: When you undertake a perilous journey through wilderness, whatever job you take, you succeed as if you rolled a 10+.'],
    Other: []
  },
  Thief: {
    Human: ['Skilled: Choose any two skills. You have them.'],
    Halfling: ['Halfling Stealth: When you attack with a ranged weapon and miss, you can choose to deal your damage anyway, but then you\'re definitely in melee with whomever you attacked.'],
    Elf: ['Elven Grace: Choose one weapon—you can always treat weapons of that type as having the precise tag.'],
    Other: []
  },
  Bard: {
    Human: ['Healing Song: When you heal with magical song, you heal +2 HP.'],
    Elf: ['Elven Voice: When you perform, if the audience contains only elves, take +1.'],
    Other: []
  },
  Cleric: {
    Human: ['Serenity: When you cast a spell you ignore the first point of damage from spell backlash.'],
    Dwarf: ['Dwarven Clarity: When you commune, on a 10+ you get 1 extra hold.'],
    Elf: ['Elven Grace: Choose one weapon—you can always treat weapons of that type as having the precise tag.'],
    Other: []
  },
  Druid: {
    Human: ['Studied Essence: When you spend time in contemplation of an animal you may add its instinct to your sheet.'],
    Elf: ['Elven Instincts: Whenever you take animal form, hold 1. At any time while in animal form, spend your hold to make an additional move not available to that animal.'],
    Other: []
  },
  Wizard: {
    Human: ['Empowered Magic: Magic Missile deals d4+2 damage.'],
    Elf: ['Elven Magic: Choose another 1st-level wizard spell for your spellbook.'],
    Other: []
  },
  Barbarian: {
    Human: ['Khan of Khans: Your load is 11+Str instead of 8+Str.'],
    Other: []
  },
  Immolator: {
    Human: ['Zeal: You have +1 ongoing to cast a spell.'],
    Other: []
  }
}
// DW Class-specific alignment restrictions from the official SRD
const CLASS_ALIGNMENTS: Record<CharacterClass, Alignment[]> = {
  Fighter: ['Good', 'Lawful', 'Neutral', 'Chaotic', 'Evil'],
  Paladin: ['Lawful', 'Good'], // Paladins must be Lawful or Good
  Ranger: ['Chaotic', 'Good', 'Neutral'], // Rangers cannot be Lawful or Evil
  Thief: ['Chaotic', 'Neutral', 'Evil'], // Thieves cannot be Lawful or Good
  Bard: ['Good', 'Lawful', 'Neutral', 'Chaotic'], // Bards cannot be Evil
  Cleric: ['Good', 'Lawful', 'Neutral', 'Chaotic', 'Evil'], // Depends on deity
  Druid: ['Neutral', 'Chaotic'], // Druids must be Neutral or Chaotic
  Wizard: ['Good', 'Lawful', 'Neutral', 'Chaotic', 'Evil'],
  Barbarian: ['Chaotic', 'Neutral'], // Barbarians cannot be Lawful
  Immolator: ['Chaotic', 'Neutral', 'Evil'] // Immolators cannot be Lawful or Good
}

// Minimal starting moves per class (seed; expand later)
const STARTING_MOVES: Record<CharacterClass, string[]> = {
  Fighter: ['Bend Bars, Lift Gates','Armored'],
  Paladin: ['Lay on Hands','Armored','Quest'],
  Ranger: ['Hunt and Track','Called Shot','Animal Companion'],
  Thief: ['Trap Expert','Flexible Morals','Backstab'],
  Bard: ['Bardic Lore','Charming and Open','A Port in the Storm'],
  Cleric: ['Deity','Divine Guidance','Turn Undead','Cast a Spell'],
  Druid: ['Born of the Soil','By Nature Sustained','Spirit Tongue','Shapeshifter','Studied Essence'],
  Wizard: ['Spellbook','Cast a Spell','Ritual'],
  Barbarian: ['Herculean Appetites','The Upper Hand','What Are You Waiting For?'],
  Immolator: ['Burning Brand','Give Me Fuel, Give Me Fire','Zuko Style'],
}

// Authentic Dungeon World starting equipment by class
const CLASS_STARTING_GEAR: Record<CharacterClass, {
  base: Partial<Item>[]
  choice?: { prompt: string; options: Partial<Item>[][] }
}> = {
  Fighter: {
    base: [
      { name: 'Chainmail', category: 'armor', weight: 3, equipped: true, tags: [{ name: 'worn' }, { name: 'mail' }], armorValue: 2, value: 40 } as any,
      { name: 'Sword', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'close' }, { name: 'messy' }], damage: '1d8', value: 15 } as any,
      { name: 'Shield', category: 'armor', weight: 2, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 15 } as any,
      { name: 'Javelin', category: 'weapon', weight: 1, equipped: false, tags: [{ name: 'thrown' }, { name: 'near' }], damage: '1d6', value: 5 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ]
  },
  Paladin: {
    base: [
      { name: 'Plate', category: 'armor', weight: 4, equipped: true, tags: [{ name: 'worn' }, { name: 'plate' }], armorValue: 3, value: 350 } as any,
      { name: 'Symbol of the Divine', category: 'gear', weight: 0, equipped: true, tags: [{ name: 'holy' }], value: 25 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose your weapon:',
      options: [
        [{ name: 'Halberd', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'reach' }, { name: 'two-handed' }], damage: '1d10', value: 9 } as any],
        [{ name: 'Sword', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'close' }, { name: 'messy' }], damage: '1d8', value: 15 } as any]
      ]
    }
  },
  Ranger: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
    ],
    choice: {
      prompt: 'Choose your weapon set:',
      options: [
        [{ name: 'Hunter\'s Bow', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'near' }, { name: 'far' }], damage: '1d8', value: 60 } as any,
         { name: 'Bundle of Arrows', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'ammo' }, { name: 'uses', value: 30 }], value: 1 } as any],
        [{ name: 'Shillelagh', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'close' }], damage: '1d8', value: 1 } as any]
      ]
    }
  },
  Thief: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Dagger', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'hand' }], damage: '1d4', value: 2 } as any,
      { name: 'Thieves\' Tools', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 3 }], value: 25 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Ragged Bow', category: 'weapon', weight: 2, equipped: false, tags: [{ name: 'near' }], damage: '1d6', value: 15 } as any,
         { name: 'Bundle of Arrows', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'ammo' }, { name: 'uses', value: 30 }], value: 1 } as any],
        [{ name: 'Rapier', category: 'weapon', weight: 1, equipped: false, tags: [{ name: 'close' }, { name: 'precise' }], damage: '1d8', value: 25 } as any]
      ]
    }
  },
  Bard: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Dueling Rapier', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'close' }, { name: 'precise' }], damage: '1d8', value: 25 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Healing Potion', category: 'consumable', weight: 0, equipped: false, tags: [{ name: 'magical' }], value: 50 } as any],
        [{ name: 'Bandages', category: 'gear', weight: 0, equipped: false, tags: [{ name: 'uses', value: 3 }], value: 5 } as any]
      ]
    }
  },
  Cleric: {
    base: [
      { name: 'Scale Mail', category: 'armor', weight: 3, equipped: true, tags: [{ name: 'worn' }, { name: 'mail' }], armorValue: 2, value: 50 } as any,
      { name: 'Shield', category: 'armor', weight: 2, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 15 } as any,
      { name: 'Warhammer', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'close' }], damage: '1d6', value: 8 } as any,
      { name: 'Symbol of the Divine', category: 'gear', weight: 0, equipped: true, tags: [{ name: 'holy' }], value: 25 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ]
  },
  Druid: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Shield', category: 'armor', weight: 2, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 15 } as any,
      { name: 'Scimitar', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'close' }], damage: '1d6', value: 10 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any],
        [{ name: 'Poultices and Herbs', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 2 }], value: 10 } as any]
      ]
    }
  },
  Wizard: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Spellbook', category: 'gear', weight: 1, equipped: true, tags: [{ name: 'magical' }], value: 50 } as any,
      { name: 'Dagger', category: 'weapon', weight: 1, equipped: false, tags: [{ name: 'hand' }], damage: '1d4', value: 2 } as any,
      { name: 'Staff', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'close' }, { name: 'two-handed' }], damage: '1d6', value: 1 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Bag of Books', category: 'gear', weight: 2, equipped: false, tags: [{ name: 'magical' }, { name: 'uses', value: 5 }], value: 10 } as any],
        [{ name: 'Healing Potion', category: 'consumable', weight: 0, equipped: false, tags: [{ name: 'magical' }], value: 50 } as any],
      ],
    }
  },
  Barbarian: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Axe', category: 'weapon', weight: 1, equipped: true, tags: [{ name: 'close' }], damage: '1d6', value: 5 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Two-handed Sword', category: 'weapon', weight: 2, equipped: false, tags: [{ name: 'close' }, { name: 'two-handed' }, { name: 'messy' }], damage: '1d10', value: 60 } as any],
        [{ name: 'Shield', category: 'armor', weight: 2, equipped: false, tags: [{ name: 'worn' }], armorValue: 1, value: 15 } as any]
      ]
    }
  },
  Immolator: {
    base: [
      { name: 'Leather Armor', category: 'armor', weight: 1, equipped: true, tags: [{ name: 'worn' }], armorValue: 1, value: 10 } as any,
      { name: 'Sword', category: 'weapon', weight: 2, equipped: true, tags: [{ name: 'close' }, { name: 'messy' }], damage: '1d8', value: 15 } as any,
      { name: 'Adventuring Gear', category: 'gear', weight: 1, equipped: false, tags: [{ name: 'uses', value: 5 }], value: 20 } as any,
      { name: 'Dungeon Rations', category: 'consumable', weight: 1, equipped: false, tags: [{ name: 'ration' }, { name: 'uses', value: 5 }], value: 10 } as any,
    ],
    choice: {
      prompt: 'Choose one:',
      options: [
        [{ name: 'Dagger', category: 'weapon', weight: 1, equipped: false, tags: [{ name: 'hand' }], damage: '1d4', value: 2 } as any],
        [{ name: 'Firebrand', category: 'weapon', weight: 1, equipped: false, tags: [{ name: 'close' }, { name: 'dangerous' }, { name: 'fiery' }], damage: '1d6', value: 20 } as any]
      ]
    }
  }
}

const CLASS_BOND_TEMPLATES: Record<CharacterClass, string[]> = {
  Fighter: [
    '___ owes me their life, whether they admit it or not.',
    'I have sworn to protect ___.',
    '___ is soft, but I will make them hard like me.',
    '___ and I have fought side by side.',
  ],
  Paladin: [
    '___ has stood by me in battle and can be trusted completely.',
    'I respect the beliefs of ___.',
    '___ is a brave soul, I have much to learn from them.',
    '___ has insulted my deity; I must show them the true way.',
  ],
  Ranger: [
    '___ guided me when I first entered the city.',
    'I have shown ___ a secret rite of the Land.',
    '___ has tasted my blood and I theirs. We are bound by it.',
    '___ is a friend of nature, so I will be their friend as well.',
  ],
  Wizard: [
    '___ will play an important role in the events to come. I have foreseen it!',
    '___ is keeping an important secret from me.',
    '___ has been my apprentice. I taught them the basics of magic.',
    "___ witnessed me breaking the fundamental laws of magic. They saw me summon something I shouldn't have.",
  ],
  Cleric: [
    '___ has insulted my deity; I must show them the true way.',
    '___ is a good and faithful person; I trust them implicitly.',
    'I have ministered to ___; they have seen me at my most vulnerable.',
    '___ is in grave danger. My deity has revealed this to me in a vision.',
  ],
  Druid: [
    '___ smells more like prey than a hunter.',
    'The spirits spoke to me of a great danger that follows ___.',
    'I have showed ___ a secret rite of the Land.',
    '___ has tasted my blood and I theirs. We are bound by it.',
  ],
  Bard: [
    'This is not my first adventure with ___.',
    'I sang stories of ___ long before I ever met them in person.',
    '___ is often the butt of my jokes.',
    'I am writing a ballad about the adventures of ___.',
  ],
  Thief: [
    '___ and I pulled off a job together.',
    '___ hired me to steal something.',
    '___ has my back when things go wrong.',
    '___ knows I stole something important from them.',
  ],
  Barbarian: [
    '___ is puny and foolish, but amusing to me.',
    "___'s ways are strange and confusing.",
    '___ is always getting into trouble—I must protect them from themselves.',
    '___ shares my hunger for glory; the earth will tremble at our deeds!',
  ],
  Immolator: [
    '___ has felt the hellish touch of fire, now they know my strength.',
    'I will teach ___ the true meaning of sacrifice.',
    "I cast something into the fire for ___ and the ashes still sing their name.",
    '___ will be the first sacrifice to the conflagration.',
  ],
}

type Draft = {
  name: string
  look?: string
  class?: CharacterClass
  race?: Race
  alignment?: Alignment
  attributes: Attributes
  bonds: string[]
  gear: Partial<Item>[]
  gearChoiceIndex?: number
  spellbook?: string[] // For Wizards: selected spells
  deity?: string // For Clerics/Paladins: chosen deity
}

const emptyAttributes: Attributes = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }

// Authentic Dungeon World deities for Clerics and Paladins
const DUNGEON_WORLD_DEITIES = [
  { name: 'Crom the Mighty', domain: 'War', alignment: 'Neutral' },
  { name: 'Thelen the Radiant', domain: 'Light', alignment: 'Good' },
  { name: 'Moradin the Forgefather', domain: 'Forge', alignment: 'Lawful' },
  { name: 'Kord the Storm Lord', domain: 'Storms', alignment: 'Chaotic' },
  { name: 'Pelor the Sun God', domain: 'Sun', alignment: 'Good' },
  { name: 'The Raven Queen', domain: 'Death', alignment: 'Neutral' },
  { name: 'Bahamut the Platinum Dragon', domain: 'Justice', alignment: 'Lawful' },
  { name: 'Melora the Wild Mother', domain: 'Nature', alignment: 'Neutral' },
  { name: 'Ioun the Knowing Mistress', domain: 'Knowledge', alignment: 'Neutral' },
  { name: 'Avandra the Change Bringer', domain: 'Freedom', alignment: 'Chaotic' }
]

// Helper functions for spellcasting
const isSpellcaster = (characterClass?: CharacterClass): boolean => {
  return characterClass === 'Wizard' || characterClass === 'Cleric'
}

const requiresDeity = (characterClass?: CharacterClass): boolean => {
  return characterClass === 'Cleric' || characterClass === 'Paladin'
}

const STORAGE_KEY = 'zmbv2-character-builder-draft'

export const CharacterBuilder: React.FC<{ onFinished?: () => void }> = ({ onFinished }) => {
  const { createCharacter, setActiveCharacter } = useCharacterStore()
  const [step, setStep] = useState<StepId>('class')
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Draft) : { name: '', attributes: emptyAttributes, bonds: [], gear: [] }
    } catch {
      return { name: '', attributes: emptyAttributes, bonds: [], gear: [] }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  const steps: { id: StepId; title: string; desc?: string }[] = [
    { id: 'class', title: 'Choose Class' },
    { id: 'identity', title: 'Identity' },
    { id: 'alignment', title: 'Alignment' },
    { id: 'attributes', title: 'Assign Stats' },
    { id: 'derived', title: 'Derived Values' },
    { id: 'bonds', title: 'Bonds' },
    { id: 'gear', title: 'Starting Gear' },
    { id: 'spellcasting', title: 'Spellcasting' },
    { id: 'review', title: 'Review & Create' },
  ]
  const stepIndex = steps.findIndex(s => s.id === step)
  const canNext = useMemo(() => {
    switch (step) {
      case 'class': return !!draft.class
      case 'identity': return !!draft.name && !!draft.race
      case 'alignment': return !!draft.alignment
      case 'attributes': return true
      case 'derived': return true
      case 'bonds': return true
      case 'gear': return true
      case 'spellcasting': {
        // Skip if not a spellcaster/deity user, or validate required fields
        if (!isSpellcaster(draft.class) && !requiresDeity(draft.class)) return true
        if (requiresDeity(draft.class) && !draft.deity) return false
        if (draft.class === 'Wizard' && (!draft.spellbook || draft.spellbook.length === 0)) return false
        return true
      }
      case 'review': return true
      default: return false
    }
  }, [step, draft])

  const next = () => setStep(steps[Math.min(stepIndex + 1, steps.length - 1)].id)
  const back = () => setStep(steps[Math.max(stepIndex - 1, 0)].id)
  const saveAndExit = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }

  const updateAttr = (key: keyof Attributes, value: number) => {
    setDraft(d => ({ ...d, attributes: { ...d.attributes, [key]: value } }))
  }

  const derivedPreview = useMemo(() => {
    if (!draft.class) return null
    const base: Character = {
      id: 'temp',
      name: draft.name || 'Unnamed',
      class: draft.class,
      race: draft.race || 'Human',
      level: 1,
      alignment: draft.alignment || 'Neutral',
      attributes: draft.attributes,
      debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
      hp: { current: 1, max: 1 },
      armor: 0,
      damageDie: getClassDamageDie(draft.class),
      xp: 0,
      load: { current: 0, max: 0 },
      baseLoad: getClassBaseLoad(draft.class),
      coin: 0,
      bonds: [],
      advancements: [],
      knownMoves: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      conditions: [],
    }
    const maxHp = calculateMaxHP(base)
    const maxLoad = calculateMaxLoad(base)
    return { maxHp, maxLoad, damageDie: base.damageDie }
  }, [draft])

  const finalize = () => {
    if (!draft.class || !draft.race || !draft.alignment || !draft.name) return

    const bonds = (draft.bonds || []).filter(Boolean).map((text, i) => ({
      id: `bond-${i + 1}-${Date.now()}`,
      text,
      resolved: false,
    }))

    let gear: Partial<Item>[] = draft.gear
    if (draft.class) {
      const classGear = CLASS_STARTING_GEAR[draft.class]
      gear = [...classGear.base]
      if (classGear.choice && draft.gearChoiceIndex !== undefined) {
        gear.push(...classGear.choice.options[draft.gearChoiceIndex])
      }
    }

    const newChar = createCharacter({
      name: draft.name,
      look: draft.look,
      class: draft.class,
      race: draft.race,
      level: 1,
      alignment: draft.alignment,
      attributes: draft.attributes,
      debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
      hp: { current: derivedPreview?.maxHp || getClassBaseHP(draft.class), max: derivedPreview?.maxHp || getClassBaseHP(draft.class) },
      armor: 0,
      damageDie: getClassDamageDie(draft.class),
      xp: 0,
      load: { current: 0, max: derivedPreview?.maxLoad ?? getClassBaseLoad(draft.class) },
      baseLoad: getClassBaseLoad(draft.class),
      coin: 0,
      bonds,
      advancements: [],
      knownMoves: STARTING_MOVES[draft.class] || [],
      knownSpells: draft.spellbook || [],
      preparedSpells: draft.class === 'Wizard' ? (draft.spellbook || []) : [],
      deity: draft.deity,
      inventory: (gear || []).map((g, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        name: g.name || 'Item',
        category: (g as any).category || 'gear',
        weight: g.weight ?? 0,
        value: g.value,
        quantity: (g as any).quantity ?? 1,
        equipped: (g as any).equipped ?? false,
        tags: (g as any).tags ?? [],
      })) as Item[],
      notes: '',
      looks: draft.look || '',
      backstory: '',
    })

    setActiveCharacter(newChar.id)
    localStorage.removeItem(STORAGE_KEY)
    onFinished?.()
  }

  const StandardArrayAssign: React.FC = () => {
    const pool = getStandardArray()
    const [assignments, setAssignments] = useState<Record<keyof Attributes, number>>({
      STR: draft.attributes.STR, DEX: draft.attributes.DEX, CON: draft.attributes.CON,
      INT: draft.attributes.INT, WIS: draft.attributes.WIS, CHA: draft.attributes.CHA,
    })

    const used = new Set(Object.values(assignments))
    const remaining = pool.filter(v => !used.has(v))

    const setVal = (attr: keyof Attributes, value: number) => {
      setAssignments(a => {
        const prev = { ...a }
        prev[attr] = value
        return prev
      })
    }

    useEffect(() => {
      setDraft(d => ({ ...d, attributes: assignments as Attributes }))
    }, [assignments])

    return (
      <div className="space-y-4">
        <div className="text-sm text-(--color-text-secondary)">Standard Array: {pool.join(', ')}</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(assignments) as (keyof Attributes)[]).map(attr => (
            <Card key={attr} variant="glass" padding="md">
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{attr}</div>
                  <Badge variant="secondary">mod {getAttributeModifier(assignments[attr]) >= 0 ? `+${getAttributeModifier(assignments[attr])}` : getAttributeModifier(assignments[attr])}</Badge>
                </div>
                <select
                  className="w-full rounded-md border px-2 py-1 bg-(--color-surface) text-sm"
                  value={assignments[attr]}
                  onChange={e => setVal(attr, Number(e.target.value))}
                  aria-label={`Assign value to ${attr}`}
                  title={`Assign value to ${attr}`}
                >
                  {[assignments[attr], ...remaining].map(val => (
                    <option key={`${attr}-${val}`} value={val}>{val}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card variant="magical" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Character Builder</CardTitle>
            <CardDescription>Create a valid Dungeon World character</CardDescription>
          </div>
          <div className="min-w-[160px]">
            <Progress variant="experience" value={stepIndex + 1} max={steps.length} showLabel label={`Step ${stepIndex + 1} of ${steps.length}`} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {step === 'class' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_CLASSES.map(cls => (
                <Button
                  key={cls}
                  variant={draft.class === cls ? 'primary' : 'outline'}
                  onClick={() => {
                    setDraft(d => {
                      const availableRaces = CLASS_RACIAL_OPTIONS[cls]
                      const currentRace = d.race
                      const newRace = availableRaces.includes(currentRace || '') ? currentRace : availableRaces[0]

                      const availableAlignments = CLASS_ALIGNMENTS[cls]
                      const currentAlignment = d.alignment
                      const newAlignment = availableAlignments.includes(currentAlignment || '') ? currentAlignment : availableAlignments[0]

                      let newDraft = { ...d, class: cls, race: newRace, alignment: newAlignment }

                      // Class-specific attribute requirements
                      if (cls === 'Wizard') {
                        newDraft.attributes = { ...d.attributes, INT: Math.max(d.attributes.INT, 16) }
                      }

                      return newDraft
                    })
                  }}
                >
                  {cls}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 'identity' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Name</label>
                <Input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Your hero's name" />
              </div>
              <div>
                <label className="text-sm">Race</label>
                <select
                  className="w-full rounded-md border px-2 py-2 bg-(--color-surface)"
                  value={draft.race || ''}
                  onChange={e => setDraft(d => ({ ...d, race: e.target.value as Race }))}
                  aria-label="Select race"
                  title="Select race"
                >
                  <option value="" disabled>Select race</option>
                  {(draft.class ? CLASS_RACIAL_OPTIONS[draft.class] : []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm">Look (appearance)</label>
              <Input value={draft.look || ''} onChange={e => setDraft(d => ({ ...d, look: e.target.value }))} placeholder="e.g., Tired eyes, ink-stained hands" />
            </div>

            {/* Show racial move for selected class/race */}
            {draft.class && draft.race && RACIAL_MOVES[draft.class]?.[draft.race]?.length > 0 && (
              <Card variant="glass" padding="md">
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-(--color-primary)">Racial Move</div>
                    {RACIAL_MOVES[draft.class][draft.race].map((move, i) => (
                      <div key={i} className="text-sm text-(--color-text-secondary)">
                        {move}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'alignment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(draft.class ? CLASS_ALIGNMENTS[draft.class] : []).map(a => (
                <Button
                  key={a}
                  variant={draft.alignment === a ? 'primary' : 'outline'}
                  onClick={() => setDraft(d => ({ ...d, alignment: a }))}
                >
                  {a}
                </Button>
              ))}
            </div>
            {/* Show alignment restrictions */}
            {draft.class && (
              <div className="text-sm text-(--color-text-secondary)">
                <strong>{draft.class}</strong> can only be: {CLASS_ALIGNMENTS[draft.class].join(', ')}
              </div>
            )}
          </div>
        )}

        {step === 'attributes' && (
          <div className="space-y-4">
            <StandardArrayAssign />
          </div>
        )}

        {step === 'derived' && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card variant="parchment" padding="md">
              <CardContent>
                <div className="text-sm text-(--color-text-secondary)">Base HP + CON mod</div>
                <div className="text-2xl font-display">
                  {draft.class ? getClassBaseHP(draft.class) : '-'} + {getAttributeModifier(draft.attributes.CON)} = <b>{derivedPreview?.maxHp ?? '-'}</b>
                </div>
              </CardContent>
            </Card>
            <Card variant="parchment" padding="md">
              <CardContent>
                <div className="text-sm text-(--color-text-secondary)">Base Load + STR mod</div>
                <div className="text-2xl font-display">
                  {draft.class ? getClassBaseLoad(draft.class) : '-'} + {getAttributeModifier(draft.attributes.STR)} = <b>{derivedPreview?.maxLoad ?? '-'}</b>
                </div>
              </CardContent>
            </Card>
            <Card variant="parchment" padding="md">
              <CardContent>
                <div className="text-sm text-(--color-text-secondary)">Damage Die</div>
                <div className="text-2xl font-display">{draft.class ? getClassDamageDie(draft.class) : '-'}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'bonds' && (
          <div className="space-y-4">
            <div className="text-sm text-(--color-text-secondary)">Choose or write bonds. They can be updated later.</div>
            <div className="grid md:grid-cols-2 gap-3">
              {(draft.class ? CLASS_BOND_TEMPLATES[draft.class] : []).map((t, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setDraft(d => ({ ...d, bonds: Array.from(new Set([...(d.bonds || []), t])) }))}
                >
                  + {t}
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              {(draft.bonds || []).map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={b} onChange={e => {
                    const copy = [...draft.bonds]
                    copy[i] = e.target.value
                    setDraft(d => ({ ...d, bonds: copy }))
                  }} />
                  <Button variant="secondary" onClick={() => setDraft(d => ({ ...d, bonds: d.bonds.filter((_, idx) => idx !== i) }))}>Remove</Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => setDraft(d => ({ ...d, bonds: [...(d.bonds || []), ''] }))}>+ Custom Bond</Button>
            </div>
          </div>
        )}

        {step === 'gear' && (
          <div className="space-y-4">
            {draft.class ? (
              <>
                <div className="text-sm text-(--color-text-secondary)">Starting gear ({draft.class})</div>
                <ul className="list-disc pl-5 text-sm">
                  {CLASS_STARTING_GEAR[draft.class].base.map((g, i) => <li key={i}>{g.name}</li>)}
                </ul>
                {CLASS_STARTING_GEAR[draft.class].choice && (
                  <div className="mt-3">
                    <label className="text-sm">{CLASS_STARTING_GEAR[draft.class].choice!.prompt}</label>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      {CLASS_STARTING_GEAR[draft.class].choice!.options.map((opt, idx) => (
                        <Button
                          key={idx}
                          variant={draft.gearChoiceIndex === idx ? 'primary' : 'outline'}
                          onClick={() => setDraft(d => ({ ...d, gearChoiceIndex: idx }))}
                        >
                          {opt.map(item => item.name).join(', ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm">Select a class to see starting equipment.</div>
            )}
          </div>
        )}

        {step === 'spellcasting' && (
          <div className="space-y-4">
            {!isSpellcaster(draft.class) && !requiresDeity(draft.class) ? (
              <div className="text-center text-sm text-(--color-text-secondary)">
                {draft.class} does not require spellcasting setup.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Deity Selection for Clerics/Paladins */}
                {requiresDeity(draft.class) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Choose Your Deity</h3>
                    <div className="text-sm text-(--color-text-secondary) mb-4">
                      As a {draft.class}, your divine magic comes from your devotion to a deity.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DUNGEON_WORLD_DEITIES.map(deity => (
                        <Button
                          key={deity.name}
                          variant={draft.deity === deity.name ? 'primary' : 'outline'}
                          onClick={() => setDraft(d => ({ ...d, deity: deity.name }))}
                          className="flex flex-col items-start p-4 h-auto"
                        >
                          <div className="font-medium">{deity.name}</div>
                          <div className="text-xs opacity-75">Domain: {deity.domain}</div>
                          <div className="text-xs opacity-75">Alignment: {deity.alignment}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spellbook Selection for Wizards */}
                {draft.class === 'Wizard' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Choose Starting Spells</h3>
                    <div className="text-sm text-(--color-text-secondary) mb-4">
                      Select 3 first-level spells for your starting spellbook. You can learn more during play.
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {dwWizardSpells.filter(spell => spell.level === 1).map(spell => {
                        const isSelected = draft.spellbook?.includes(spell.id) || false
                        const canSelect = (draft.spellbook?.length || 0) < 3 || isSelected
                        return (
                          <Button
                            key={spell.id}
                            variant={isSelected ? 'primary' : 'outline'}
                            disabled={!canSelect}
                            onClick={() => {
                              setDraft(d => {
                                const currentSpells = d.spellbook || []
                                if (isSelected) {
                                  // Remove spell
                                  return { ...d, spellbook: currentSpells.filter(id => id !== spell.id) }
                                } else {
                                  // Add spell
                                  return { ...d, spellbook: [...currentSpells, spell.id] }
                                }
                              })
                            }}
                            className="flex flex-col items-start p-4 h-auto text-left"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="font-medium">{spell.name}</div>
                              <Badge variant="secondary" className="ml-auto">Level {spell.level}</Badge>
                            </div>
                            <div className="text-xs opacity-75 mt-1">{spell.description}</div>
                            <div className="text-xs opacity-50 mt-1">Range: {spell.range}</div>
                          </Button>
                        )
                      })}
                    </div>
                    {draft.spellbook && (
                      <div className="text-sm text-(--color-text-secondary) mt-3">
                        Selected: {draft.spellbook.length}/3 spells
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            <div className="text-sm">Review your character and click Create.</div>
            <ul className="text-sm space-y-1">
              <li><b>Name</b>: {draft.name || '-'}</li>
              <li><b>Class</b>: {draft.class || '-'}</li>
              <li><b>Race</b>: {draft.race || '-'}</li>
              <li><b>Alignment</b>: {draft.alignment || '-'}</li>
              <li><b>Attributes</b>: STR {draft.attributes.STR}, DEX {draft.attributes.DEX}, CON {draft.attributes.CON}, INT {draft.attributes.INT}, WIS {draft.attributes.WIS}, CHA {draft.attributes.CHA}</li>
              <li><b>HP</b>: {derivedPreview?.maxHp ?? '-'}, <b>Load</b>: {derivedPreview?.maxLoad ?? '-'}, <b>Damage</b>: {draft.class ? getClassDamageDie(draft.class) : '-'}</li>
              <li><b>Bonds</b>: {(draft.bonds || []).length}</li>
              <li><b>Starting Moves</b>: {draft.class ? STARTING_MOVES[draft.class].join(', ') : '-'}</li>
              {draft.deity && <li><b>Deity</b>: {draft.deity}</li>}
              {draft.spellbook && draft.spellbook.length > 0 && <li><b>Starting Spells</b>: {draft.spellbook.length}</li>}
            </ul>
          </div>
        )}
      </CardContent>

      <div className="flex items-center justify-between px-6 pb-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveAndExit}>Save Draft</Button>
          <Button variant="secondary" onClick={() => { localStorage.removeItem(STORAGE_KEY); setDraft({ name: '', attributes: emptyAttributes, bonds: [], gear: [] }) }}>Reset</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={back} disabled={stepIndex === 0}>Back</Button>
          {step !== 'review' ? (
            <Button variant="primary" onClick={next} disabled={!canNext}>Next</Button>
          ) : (
            <Button variant="primary" onClick={finalize} disabled={!draft.class || !draft.race || !draft.alignment || !draft.name}>Create Character</Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default CharacterBuilder


