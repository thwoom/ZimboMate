import type { CharacterClass } from '../models/Character'
import type { Armor, Item, ItemCategory, Weapon } from '../models/Equipment'

export interface ClassStartingData {
  equipment: (Partial <Item> | Partial <Weapon> | Partial <Armor>)[]
  moves: string[]
  choices?: {
    equipment?: {
      prompt: string
      options: (Partial <Item> | Partial <Weapon> | Partial <Armor>)[][]
    }[]
    moves?: {
      prompt: string
      options: string[]
    }[]
  }
}

export const CLASS_STARTING_DATA: Record <CharacterClass, ClassStartingData> = {
  Fighter: {
    equipment: [
      {
        name: 'Scale Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }, { name: 'clumsy' }],
        weight: 3,
        armorValue: 2,
        description: 'Overlapping metal scales that provide good protection',
      } as Partial <Armor>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
    ],
    moves: ['Bend Bars Lift Gates', 'Armored'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your weapon:',
          options: [
            [{
              name: 'Longsword',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'piercing' }],
              weight: 1,
              damage: 'b[2d10]',
              description: 'A versatile blade',
            } as Partial <Weapon>],
            [{
              name: 'Battle Axe',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'messy' }],
              weight: 1,
              damage: 'b[2d10]',
              description: 'A brutal chopping weapon',
            } as Partial <Weapon>],
          ],
        },
        {
          prompt: 'Choose your secondary gear:',
          options: [
            [{
              name: 'Shield',
              category: 'armor' as ItemCategory,
              tags: [{ name: 'shield' }],
              weight: 2,
              armorValue: 1,
              description: 'Provides additional defense',
            } as Partial <Armor>],
            [{
              name: 'Two-handed Sword',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'reach' }, { name: 'messy' }, { name: 'forceful' }],
              weight: 2,
              damage: '1d6',
              description: 'A massive blade that requires both hands',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Paladin: {
    equipment: [
      {
        name: 'Plate Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }, { name: 'clumsy' }],
        weight: 5,
        armorValue: 3,
        description: 'Full plate protection blessed by the church',
      } as Partial <Armor>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
      {
        name: 'Holy Symbol',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'holy' }],
        weight: 0,
        description: 'Your deity\'s sacred symbol',
      },
    ],
    moves: ['Lay on Hands', 'Armored', 'Quest'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your blessed weapon:',
          options: [
            [{
              name: 'Halberd',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'reach' }, { name: 'messy' }, { name: 'forceful' }],
              weight: 2,
              damage: 'b[2d10]+1',
              description: 'A holy polearm',
            } as Partial <Weapon>],
            [{
              name: 'Long Sword',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'piercing' }],
              weight: 1,
              damage: 'b[2d10]',
              description: 'A blessed blade',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Ranger: {
    equipment: [
      {
        name: 'Leather Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Light protection that doesn\'t hinder movement',
      } as Partial <Armor>,
      {
        name: 'Hunter\'s Bow',
        category: 'weapon' as ItemCategory,
        tags: [{ name: 'near' }, { name: 'far' }],
        weight: 1,
        damage: '1d8',
        description: 'A well-crafted bow',
      } as Partial <Weapon>,
      {
        name: 'Bundle of Arrows',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'ammo' }],
        weight: 1,
        quantity: 3,
        description: 'Ammunition for your bow',
      },
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
    ],
    moves: ['Hunt and Track', 'Called Shot', 'Animal Companion'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your melee weapon:',
          options: [
            [{
              name: 'Spear',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'reach' }, { name: 'thrown' }, { name: 'near' }],
              weight: 1,
              damage: '1d8',
              description: 'Versatile for hunting and combat',
            } as Partial <Weapon>],
            [{
              name: 'Short Sword',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }],
              weight: 1,
              damage: '1d8',
              description: 'A quick blade for close encounters',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Wizard: {
    equipment: [
      {
        name: 'Leather Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Light protection that doesn\'t interfere with spellcasting',
      } as Partial <Armor>,
      {
        name: 'Spellbook',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'magical' }],
        weight: 1,
        description: 'Your collection of spells',
      },
      {
        name: 'Dagger',
        category: 'weapon' as ItemCategory,
        tags: [{ name: 'hand' }],
        weight: 1,
        damage: '1d4',
        description: 'A last resort',
      } as Partial <Weapon>,
      {
        name: 'Staff',
        category: 'weapon' as ItemCategory,
        tags: [{ name: 'close' }, { name: 'two-handed' }],
        weight: 1,
        damage: '1d4',
        description: 'A focus for your magic',
      } as Partial <Weapon>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
    ],
    moves: ['Spellbook', 'Cast a Spell', 'Ritual'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your healing supplies:',
          options: [
            [{
              name: 'Bag of Books',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'magical' }],
              weight: 2,
              uses: { current: 5, max: 5 },
              description: 'Reference materials and scrolls',
            }],
            [{
              name: 'Healing Potion',
              category: 'consumable' as ItemCategory,
              tags: [{ name: 'healing' }],
              weight: 0,
              quantity: 3,
              description: 'Restores health when consumed',
            }],
          ],
        },
      ],
    },
  },

  Cleric: {
    equipment: [
      {
        name: 'Leather Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Light protection blessed by your deity',
      } as Partial <Armor>,
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
      {
        name: 'Symbol of Your Deity',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'holy' }],
        weight: 0,
        description: 'Holy symbol of your faith',
      },
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
    ],
    moves: ['Deity', 'Divine Guidance', 'Turn Undead', 'Cast a Spell'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your weapon:',
          options: [
            [{
              name: 'Staff',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'two-handed' }],
              weight: 1,
              damage: '1d4',
              description: 'A simple weapon',
            } as Partial <Weapon>],
            [{
              name: 'Mace',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }],
              weight: 1,
              damage: '1d8',
              description: 'A blessed bludgeon',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Druid: {
    equipment: [
      {
        name: 'Hide Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Natural protection from animal hides',
      } as Partial <Armor>,
      {
        name: 'Wooden Shield',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'shield' }],
        weight: 1,
        armorValue: 1,
        description: 'Carved from ancient wood',
      } as Partial <Armor>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Poultices and Herbs',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'healing' }],
        weight: 1,
        uses: { current: 2, max: 2 },
        description: 'Natural healing remedies',
      },
      {
        name: 'Token of the Land',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'magical' }],
        weight: 0,
        description: 'A symbol of your connection to nature',
      },
    ],
    moves: ['Born of the Soil', 'By Nature Sustained', 'Spirit Tongue', 'Shapeshifter', 'Studied Essence'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your weapon:',
          options: [
            [{
              name: 'Shillelagh',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }],
              weight: 1,
              damage: '1d10',
              description: 'A living wooden club',
            } as Partial <Weapon>],
            [{
              name: 'Staff',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'two-handed' }],
              weight: 1,
              damage: '1d8',
              description: 'A natural walking stick',
            } as Partial <Weapon>],
            [{
              name: 'Spear',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'thrown' }, { name: 'near' }],
              weight: 1,
              damage: '1d8',
              description: 'Simple and effective',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Bard: {
    equipment: [
      {
        name: 'Leather Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Stylish and practical',
      } as Partial <Armor>,
      {
        name: 'Dueling Rapier',
        category: 'weapon' as ItemCategory,
        tags: [{ name: 'close' }, { name: 'precise' }],
        weight: 1,
        damage: '1d8',
        description: 'An elegant weapon',
      } as Partial <Weapon>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Bandages',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'healing' }],
        weight: 0,
        uses: { current: 3, max: 3 },
        description: 'For patching up wounds',
      },
    ],
    moves: ['Bardic Lore', 'Charming and Open', 'A Port in the Storm'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your instrument:',
          options: [
            [{
              name: 'Worn Fiddle',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'musical' }],
              weight: 0,
              description: 'Well-traveled and well-loved',
            }],
            [{
              name: 'Fine Lute',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'musical' }],
              weight: 0,
              description: 'Beautiful tone and craftsmanship',
            }],
            [{
              name: 'Flute',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'musical' }],
              weight: 0,
              description: 'Simple but enchanting',
            }],
          ],
        },
      ],
    },
  },

  Thief: {
    equipment: [
      {
        name: 'Leather Armor',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }],
        weight: 1,
        armorValue: 1,
        description: 'Silent and flexible',
      } as Partial <Armor>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
    ],
    moves: ['Trap Expert', 'Flexible Morals', 'Backstab'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your weapon:',
          options: [
            [{
              name: 'Dagger',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'hand' }],
              weight: 1,
              damage: '1d4',
              description: 'Quick and concealable',
            } as Partial <Weapon>],
            [{
              name: 'Rapier',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'precise' }],
              weight: 1,
              damage: '1d8',
              description: 'For when stealth fails',
            } as Partial <Weapon>],
          ],
        },
        {
          prompt: 'Choose your ranged option:',
          options: [
            [{
              name: 'Throwing Daggers',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'thrown' }, { name: 'near' }],
              weight: 0,
              quantity: 3,
              damage: '1d4',
              description: 'Silent and deadly',
            } as Partial <Weapon>],
            [{
              name: 'Short Bow',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'near' }],
              weight: 1,
              damage: '1d6',
              description: 'Strike from the shadows',
            } as Partial <Weapon>, {
              name: 'Bundle of Arrows',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'ammo' }],
              weight: 1,
              quantity: 3,
              description: 'Ammunition for your bow',
            }],
          ],
        },
        {
          prompt: 'Choose your tools:',
          options: [
            [{
              name: 'Vial of Poison',
              category: 'consumable' as ItemCategory,
              tags: [{ name: 'poison' }, { name: 'dangerous' }],
              weight: 0,
              uses: { current: 1, max: 1 },
              description: 'Apply to weapons for extra damage',
            }],
            [{
              name: 'Lockpicks',
              category: 'gear' as ItemCategory,
              tags: [{ name: 'tools' }],
              weight: 0,
              description: 'Professional grade',
            }],
          ],
        },
      ],
    },
  },

  Barbarian: {
    equipment: [
      {
        name: 'Dagger',
        category: 'weapon' as ItemCategory,
        tags: [{ name: 'hand' }],
        weight: 1,
        damage: '1d4',
        description: 'A simple blade',
      } as Partial <Weapon>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Dungeon Rations',
        category: 'consumable' as ItemCategory,
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        description: 'Trail rations that last for days',
      },
      {
        name: 'Token of Your Heritage',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'symbolic' }],
        weight: 0,
        description: 'Something from your homeland',
      },
    ],
    moves: ['Herculean Appetites', 'The Upper Hand', 'What Are You Waiting For?'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your primary weapon:',
          options: [
            [{
              name: 'Two-Handed Sword',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'forceful' }, { name: 'messy' }],
              weight: 2,
              damage: 'b[2d10]+1',
              description: 'A massive blade',
            } as Partial <Weapon>],
            [{
              name: 'Battleaxe',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'messy' }],
              weight: 1,
              damage: 'b[2d10]+1',
              description: 'For cleaving enemies',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },

  Immolator: {
    equipment: [
      {
        name: 'Dragon Hide',
        category: 'armor' as ItemCategory,
        tags: [{ name: 'armor' }, { name: 'worn' }, { name: 'fireproof' }],
        weight: 2,
        armorValue: 2,
        description: 'Scales that resist flame',
      } as Partial <Armor>,
      {
        name: 'Adventuring Gear',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'adventuring gear' }],
        weight: 1,
        uses: { current: 5, max: 5 },
        description: 'Rope, torches, rations, and other useful items',
      },
      {
        name: 'Symbol of Flame',
        category: 'gear' as ItemCategory,
        tags: [{ name: 'holy' }, { name: 'dangerous' }],
        weight: 0,
        description: 'Burns with inner fire',
      },
    ],
    moves: ['Burning Brand', 'Give Me Fuel, Give Me Fire', 'Zuko Style'],
    choices: {
      equipment: [
        {
          prompt: 'Choose your weapon:',
          options: [
            [{
              name: 'Firebrand',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'close' }, { name: 'dangerous' }],
              weight: 1,
              damage: '1d10',
              description: 'Wreathed in flame',
            } as Partial <Weapon>],
            [{
              name: 'Flaming Spear',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'reach' }, { name: 'thrown' }, { name: 'dangerous' }],
              weight: 1,
              damage: '1d8',
              description: 'Burns as it strikes',
            } as Partial <Weapon>],
            [{
              name: 'Ritual Dagger',
              category: 'weapon' as ItemCategory,
              tags: [{ name: 'hand' }],
              weight: 1,
              damage: '1d8',
              description: 'For blood and flame',
            } as Partial <Weapon>],
          ],
        },
      ],
    },
  },
}

export const CLASS_BOND_TEMPLATES: Record <CharacterClass, string[]> = {
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
    '___ witnessed me breaking the fundamental laws of magic. They saw me summon something I shouldn\'t have.',
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
    '___\'s ways are strange and confusing.',
    '___ is always getting into trouble-I must protect them from themselves.',
    '___ shares my hunger for glory; the earth will tremble at our deeds!',
  ],
  Immolator: [
    '___ has felt the hellish touch of fire, now they know my strength.',
    'I will teach ___ the true meaning of sacrifice.',
    'I cast something into the fire for ___ and the ashes still sing their name.',
    '___ will be the first sacrifice to the conflagration.',
  ],
}
