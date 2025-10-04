/**
 * Class-specific moves for all Dungeon World classes
 * Based on official DW SRD
 */

import type { Move } from './Move'

// Fighter moves
export const FIGHTER_MOVES: Partial<Move>[] = [
  {
    id: 'bend-bars-lift-gates',
    name: 'Bend Bars, Lift Gates',
    category: 'class',
    level: 1,
    requiresClass: 'Fighter',
    description:
      'When you use pure strength to destroy an inanimate obstacle, roll+Str.',
    trigger: 'When you use pure strength to destroy an inanimate obstacle',
    triggerType: 'roll',
    rollStat: 'STR',
    onSuccess:
      "Choose 3 from the list: • It doesn't take a very long time • Nothing of value is damaged • It doesn't make an inordinate amount of noise • You can fix the thing again without a lot of effort",
    onPartial: 'Choose 2 from the list.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'armored',
    name: 'Armored',
    category: 'class',
    level: 1,
    requiresClass: 'Fighter',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'When wearing armor',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'signature-weapon',
    name: 'Signature Weapon',
    category: 'class',
    level: 1,
    requiresClass: 'Fighter',
    description:
      'This is your weapon. There are many like it, but this one is yours.',
    trigger: 'When creating character',
    triggerType: 'special',
  },
  {
    id: 'merciless',
    name: 'Merciless',
    category: 'class',
    level: 2,
    requiresClass: 'Fighter',
    description: 'When you deal damage, deal +1d4 damage.',
    trigger: 'When you deal damage',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'heirloom',
    name: 'Heirloom',
    category: 'class',
    level: 2,
    requiresClass: 'Fighter',
    description:
      'When you consult the spirits that reside within your signature weapon, they will give you an insight relating to the current situation, and might ask you some questions in return.',
    trigger: 'When you consult the spirits in your signature weapon',
    triggerType: 'action',
  },
  {
    id: 'armor-mastery',
    name: 'Armor Mastery',
    category: 'class',
    level: 2,
    requiresClass: 'Fighter',
    description:
      'When you make your armor take the brunt of damage dealt to you, the damage is negated but you must reduce the armor value of your armor or shield (your choice) by 1.',
    trigger: 'When you take damage while armored',
    triggerType: 'reactive',
  },
  {
    id: 'improved-weapon',
    name: 'Improved Weapon',
    category: 'class',
    level: 2,
    requiresClass: 'Fighter',
    requiresMove: 'signature-weapon',
    description: 'Choose an additional enhancement for your signature weapon.',
    trigger: 'When creating character',
    triggerType: 'special',
  },
]

// Wizard moves
export const WIZARD_MOVES: Partial<Move>[] = [
  {
    id: 'spellbook',
    name: 'Spellbook',
    category: 'class',
    level: 1,
    requiresClass: 'Wizard',
    description:
      'You have mastered several spells and inscribed them in your spellbook.',
    trigger: 'Starting move',
    triggerType: 'passive',
  },
  {
    id: 'prepare-spells',
    name: 'Prepare Spells',
    category: 'class',
    level: 1,
    requiresClass: 'Wizard',
    description:
      "When you spend uninterrupted time (an hour or so) in quiet contemplation with your spellbook, you: • Lose any spells you already have prepared • Prepare new spells of your choice from your spellbook whose total levels don't exceed your own level+1",
    trigger: 'When you spend time contemplating your spellbook',
    triggerType: 'action',
  },
  {
    id: 'cast-spell-wizard',
    name: 'Cast a Spell',
    category: 'class',
    level: 1,
    requiresClass: 'Wizard',
    description: "When you release a spell you've prepared, roll+Int.",
    trigger: 'When you cast a prepared spell',
    triggerType: 'roll',
    rollStat: 'INT',
    onSuccess:
      'The spell is successfully cast and you do not forget the spell—you may cast it again later.',
    onPartial:
      'The spell is cast, but choose one: • You draw unwelcome attention or put yourself in a spot. The GM will tell you how. • The spell disturbs the fabric of reality as it is cast—take -1 ongoing to cast a spell until the next time you Prepare Spells. • After it is cast, the spell is forgotten. You cannot cast the spell again until you prepare spells.',
    onFailure:
      'Something goes wrong. The GM will tell you what, but the spell is not forgotten.',
  },
  {
    id: 'ritual',
    name: 'Ritual',
    category: 'class',
    level: 1,
    requiresClass: 'Wizard',
    description:
      "When you draw on a place of power to create a magical effect, tell the GM what you're trying to achieve.",
    trigger: 'When you draw on a place of power for magic',
    triggerType: 'action',
  },
  {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    category: 'class',
    level: 2,
    requiresClass: 'Wizard',
    description:
      'When you have time and safety with your spellbook, you can cast any spell in your spellbook by expending a spell slot of the same or higher level.',
    trigger: 'When you have time and safety to cast',
    triggerType: 'action',
  },
  {
    id: 'empowered-magic',
    name: 'Empowered Magic',
    category: 'class',
    level: 2,
    requiresClass: 'Wizard',
    description:
      "When you cast a spell, on a 10+ you have the option of choosing from the 7-9 list. If you do, you may choose one of these effects as well: • The spell's effects are maximized • The spell's targets are doubled",
    trigger: 'When you cast a spell',
    triggerType: 'reactive',
  },
]

// Cleric moves
export const CLERIC_MOVES: Partial<Move>[] = [
  {
    id: 'deity',
    name: 'Deity',
    category: 'class',
    level: 1,
    requiresClass: 'Cleric',
    description:
      'You serve and worship some deity or power which grants you spells.',
    trigger: 'Starting move',
    triggerType: 'passive',
  },
  {
    id: 'divine-guidance',
    name: 'Divine Guidance',
    category: 'class',
    level: 1,
    requiresClass: 'Cleric',
    description:
      "When you petition your deity according to the precept of your religion, you are granted some useful knowledge or boon related to your deity's domain.",
    trigger: 'When you petition your deity',
    triggerType: 'action',
  },
  {
    id: 'turn-undead',
    name: 'Turn Undead',
    category: 'class',
    level: 1,
    requiresClass: 'Cleric',
    description:
      'When you hold your holy symbol aloft and call on your deity for protection, roll+Wis.',
    trigger: 'When you turn undead',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess:
      'So long as you continue to pray and brandish your holy symbol, no undead may come within reach of you or your allies. This effects lasts as long as you maintain it and no longer.',
    onPartial:
      "You repel the undead, but choose one: • They flee, but only so far as to get out of your sight and they'll be back • The closest one doesn't flee, but its resistance prevents your holy symbol from working on it again • Hold 2 and spend 1 hold each round to keep a specific undead away from you",
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'commune',
    name: 'Commune',
    category: 'class',
    level: 1,
    requiresClass: 'Cleric',
    description:
      "When you spend uninterrupted time (an hour or so) in quiet contemplation with your deity, you: • Lose any spells you already prepared and prepare new spells of your choice whose total levels don't exceed your own level+1",
    trigger: 'When you commune with your deity',
    triggerType: 'action',
  },
  {
    id: 'cast-spell-cleric',
    name: 'Cast a Spell',
    category: 'class',
    level: 1,
    requiresClass: 'Cleric',
    description:
      'When you unleash a spell granted to you by your deity, roll+Wis.',
    trigger: 'When you cast a divine spell',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess:
      'The spell is successfully cast and you do not forget the spell.',
    onPartial:
      'The spell is cast, but choose one: • You draw the attention of something nasty • Your casting distances you from your deity—take -1 ongoing to cast a spell until the next time you commune • After casting it, the spell is forgotten',
    onFailure: 'Something bad happens and the spell is not forgotten.',
  },
  {
    id: 'divine-ward',
    name: 'Divine Ward',
    category: 'class',
    level: 2,
    requiresClass: 'Cleric',
    description: 'When you wear no armor or shield you get 2 armor.',
    trigger: 'When unarmored',
    triggerType: 'passive',
    ongoing: true,
  },
]

// Thief moves
export const THIEF_MOVES: Partial<Move>[] = [
  {
    id: 'trap-expert',
    name: 'Trap Expert',
    category: 'class',
    level: 1,
    requiresClass: 'Thief',
    description:
      'When you spend a moment to survey a dangerous area, roll+Dex.',
    trigger: 'When you survey for traps',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess:
      'You both notice the trap and find a way to get past it. If you act on the information, you and your allies will make it past without triggering the trap.',
    onPartial:
      'You notice the trap but will need time to find a way around it.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'tricks-of-the-trade',
    name: 'Tricks of the Trade',
    category: 'class',
    level: 1,
    requiresClass: 'Thief',
    description: 'When you pick locks or pockets or disable traps, roll+Dex.',
    trigger: 'When you use thievery skills',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You do it, no problem.',
    onPartial:
      'You still do it, but the GM will offer you two options between suspicion, danger, or cost.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'backstab',
    name: 'Backstab',
    category: 'class',
    level: 1,
    requiresClass: 'Thief',
    description:
      'When you attack a surprised or defenseless enemy with a melee weapon, you can choose to deal your damage or roll+Dex.',
    trigger: 'When you attack a surprised enemy',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess:
      'Choose two: • Deal your damage+1d6 • Avoid getting into melee with them • Create an advantage, +1 forward to you or an ally acting on it',
    onPartial: 'Choose one.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'flexible-morals',
    name: 'Flexible Morals',
    category: 'class',
    level: 1,
    requiresClass: 'Thief',
    description:
      'When someone tries to detect your alignment you can tell them any alignment you like.',
    trigger: 'When alignment is detected',
    triggerType: 'reactive',
  },
  {
    id: 'poisoner',
    name: 'Poisoner',
    category: 'class',
    level: 1,
    requiresClass: 'Thief',
    description:
      "You've mastered the care and use of a poison. Choose a poison from the list when you first take this move.",
    trigger: 'Starting move',
    triggerType: 'special',
  },
]

// Ranger moves
export const RANGER_MOVES: Partial<Move>[] = [
  {
    id: 'hunt-and-track',
    name: 'Hunt and Track',
    category: 'class',
    level: 1,
    requiresClass: 'Ranger',
    description:
      'When you follow a trail of clues left behind by passing creatures, roll+Wis.',
    trigger: 'When you track creatures',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess:
      "You follow the creature's trail until there's a significant change in its direction or mode of travel.",
    onPartial:
      'You follow the trail until there is a significant change, but choose one: • You have to slow down to avoid losing the trail or getting lost • The trail leads you through or into danger',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'called-shot',
    name: 'Called Shot',
    category: 'class',
    level: 1,
    requiresClass: 'Ranger',
    description:
      'When you attack a defenseless or surprised enemy at range, you can choose to deal your damage or name your target and roll+Dex.',
    trigger: 'When you make a precise ranged attack',
    triggerType: 'roll',
    rollStat: 'DEX',
    onSuccess: 'You deal your damage and the effect you named.',
    onPartial:
      'You deal your damage, but choose one: • Deal your damage • Achieve the effect you described',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'animal-companion',
    name: 'Animal Companion',
    category: 'class',
    level: 1,
    requiresClass: 'Ranger',
    description: 'You have a supernatural connection with a loyal animal.',
    trigger: 'Starting move',
    triggerType: 'special',
  },
  {
    id: 'command',
    name: 'Command',
    category: 'class',
    level: 1,
    requiresClass: 'Ranger',
    requiresMove: 'animal-companion',
    description:
      "When you work with your animal companion on something it's trained in and you attack the same target, add their ferocity to your damage.",
    trigger: 'When commanding your animal companion',
    triggerType: 'action',
  },
]

// Paladin moves
export const PALADIN_MOVES: Partial<Move>[] = [
  {
    id: 'lay-on-hands',
    name: 'Lay on Hands',
    category: 'class',
    level: 1,
    requiresClass: 'Paladin',
    description:
      'When you touch someone, skin to skin, and pray for their well-being, roll+Cha.',
    trigger: 'When you heal with divine power',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess: 'You heal 1d8 damage or remove one disease.',
    onPartial:
      "You heal 1d8 damage or remove one disease, but you're emotionally drained. You take -1 forward.",
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'armored-paladin',
    name: 'Armored',
    category: 'class',
    level: 1,
    requiresClass: 'Paladin',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'When wearing armor',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'quest',
    name: 'Quest',
    category: 'class',
    level: 1,
    requiresClass: 'Paladin',
    description:
      'When you dedicate yourself to a mission through prayer and ritual cleansing, state what you set out to do.',
    trigger: 'When you undertake a quest',
    triggerType: 'action',
  },
  {
    id: 'i-am-the-law',
    name: 'I Am The Law',
    category: 'class',
    level: 1,
    requiresClass: 'Paladin',
    description:
      'When you give an NPC an order based on your authority, roll+Cha.',
    trigger: 'When you command with authority',
    triggerType: 'roll',
    rollStat: 'CHA',
    onSuccess:
      'They choose one: • They do what you say • They back away cautiously, then flee • They attack you',
    onPartial:
      'They do what you say, but choose one: • They demand concrete assurance of your promise, right now • They do it for now, but there will be payback later',
    onFailure: 'Mark XP and the GM makes a move.',
  },
]

// Bard moves
export const BARD_MOVES: Partial<Move>[] = [
  {
    id: 'bardic-lore',
    name: 'Bardic Lore',
    category: 'class',
    level: 1,
    requiresClass: 'Bard',
    description:
      'Choose an area of expertise: • Spells and Magicks • The Dead and Undead • Grand Histories of the Known World • A Bestiary of Creatures Unusual • The Planar Spheres • Legends of Heroes Past • Gods and Their Servants',
    trigger: 'Starting move',
    triggerType: 'special',
  },
  {
    id: 'charming-and-open',
    name: 'Charming and Open',
    category: 'class',
    level: 1,
    requiresClass: 'Bard',
    description:
      'When you speak frankly with someone, you can ask their player a question from the list below.',
    trigger: 'When you speak frankly',
    triggerType: 'action',
  },
  {
    id: 'a-port-in-the-storm',
    name: 'A Port in the Storm',
    category: 'class',
    level: 1,
    requiresClass: 'Bard',
    description:
      "When you return to a civilized place where you've spent time before, tell the GM when you were last here.",
    trigger: 'When you return to a familiar place',
    triggerType: 'action',
  },
  {
    id: 'arcane-art',
    name: 'Arcane Art',
    category: 'class',
    level: 1,
    requiresClass: 'Bard',
    description:
      'When you weave a performance into a basic spell, choose an ally and an effect: • Heal 1d8 damage • +1d4 forward to damage • Their mind is shaken clear of one enchantment • The next time someone successfully assists the target with aid, they get +2 instead of +1',
    trigger: 'When you perform magic',
    triggerType: 'action',
  },
]

// Druid moves
export const DRUID_MOVES: Partial<Move>[] = [
  {
    id: 'born-of-the-soil',
    name: 'Born of the Soil',
    category: 'class',
    level: 1,
    requiresClass: 'Druid',
    description:
      "You learned your magic in a place whose spirits are strong and ancient and they've marked you as one of them.",
    trigger: 'Starting move',
    triggerType: 'special',
  },
  {
    id: 'by-nature-sustained',
    name: 'By Nature Sustained',
    category: 'class',
    level: 1,
    requiresClass: 'Druid',
    description:
      "You don't need to eat or drink. If a move tells you to mark off a ration just ignore it.",
    trigger: 'Always active',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'spirit-tongue',
    name: 'Spirit Tongue',
    category: 'class',
    level: 1,
    requiresClass: 'Druid',
    description:
      'The grunts, barks, chirps, and calls of the creatures of the wild are as language to you.',
    trigger: 'When communicating with animals',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'shapeshifter',
    name: 'Shapeshifter',
    category: 'class',
    level: 1,
    requiresClass: 'Druid',
    description:
      'When you call upon the spirits to change your shape, roll+Wis.',
    trigger: 'When you shapeshift',
    triggerType: 'roll',
    rollStat: 'WIS',
    onSuccess: 'You take the shape you wished and hold 3.',
    onPartial: 'You take the shape you wished and hold 2.',
    onFailure:
      'You take the shape you wished and hold 1, but the spirits make a demand of you.',
  },
  {
    id: 'studied-essence',
    name: 'Studied Essence',
    category: 'class',
    level: 1,
    requiresClass: 'Druid',
    description:
      "When you spend time in contemplation of an animal you've encountered, you may add its essence to those you know.",
    trigger: 'When you study an animal',
    triggerType: 'action',
  },
]

// Barbarian moves
export const BARBARIAN_MOVES: Partial<Move>[] = [
  {
    id: 'herculean-appetites',
    name: 'Herculean Appetites',
    category: 'class',
    level: 1,
    requiresClass: 'Barbarian',
    description:
      'Others may content themselves with just a taste of wine, or dominion over a servant or two, but you want more.',
    trigger: 'Starting move',
    triggerType: 'special',
  },
  {
    id: 'the-upper-hand',
    name: 'The Upper Hand',
    category: 'class',
    level: 1,
    requiresClass: 'Barbarian',
    description: 'You take +1 ongoing to last breath rolls.',
    trigger: 'When making last breath rolls',
    triggerType: 'passive',
    ongoing: true,
  },
  {
    id: 'what-are-you-waiting-for',
    name: 'What Are You Waiting For?',
    category: 'class',
    level: 1,
    requiresClass: 'Barbarian',
    description: 'When you cry out a challenge to your enemies, roll+Con.',
    trigger: 'When you challenge enemies',
    triggerType: 'roll',
    rollStat: 'CON',
    onSuccess:
      'The nearest enemy makes an attack against you (if an attack is possible).',
    onPartial:
      'The nearest enemy makes an attack against you, and you take -1 forward.',
    onFailure: 'Mark XP and the GM makes a move.',
  },
  {
    id: 'full-plate-and-packing-steel',
    name: 'Full Plate and Packing Steel',
    category: 'class',
    level: 1,
    requiresClass: 'Barbarian',
    description: 'You ignore the clumsy tag on armor you wear.',
    trigger: 'When wearing armor',
    triggerType: 'passive',
    ongoing: true,
  },
]

// Immolator moves
export const IMMOLATOR_MOVES: Partial<Move>[] = [
  {
    id: 'burning-brand',
    name: 'Burning Brand',
    category: 'class',
    level: 1,
    requiresClass: 'Immolator',
    description:
      'When you conjure up a weapon or tool of pure flame, roll+Con.',
    trigger: 'When you create flame weapons',
    triggerType: 'roll',
    rollStat: 'CON',
    onSuccess:
      "Choose two: • It has all the tags you want • It's permanent • You don't take 1 damage",
    onPartial: 'Choose one.',
    onFailure: 'Mark XP, the GM makes a move, and you take 1 damage.',
  },
  {
    id: 'give-me-fuel-give-me-fire',
    name: 'Give Me Fuel, Give Me Fire',
    category: 'class',
    level: 1,
    requiresClass: 'Immolator',
    description:
      'When you consume something satisfying, choose one: • Heal damage equal to your level • Take +1 forward to your damage',
    trigger: 'When you consume fuel',
    triggerType: 'action',
  },
  {
    id: 'zuko-style',
    name: 'Zuko Style',
    category: 'class',
    level: 1,
    requiresClass: 'Immolator',
    description:
      'When you are in front of a dangerous enemy with no one beside you, take +2 ongoing so long as that remains true.',
    trigger: 'When fighting alone against danger',
    triggerType: 'passive',
    ongoing: true,
  },
]

// Combine all class moves
export const ALL_CLASS_MOVES: Partial<Move>[] = [
  ...FIGHTER_MOVES,
  ...WIZARD_MOVES,
  ...CLERIC_MOVES,
  ...THIEF_MOVES,
  ...RANGER_MOVES,
  ...PALADIN_MOVES,
  ...BARD_MOVES,
  ...DRUID_MOVES,
  ...BARBARIAN_MOVES,
  ...IMMOLATOR_MOVES,
]

// Helper functions for move management
export function getMovesForClass(characterClass: string): Partial<Move>[] {
  switch (characterClass.toLowerCase()) {
    case 'fighter':
      return FIGHTER_MOVES
    case 'wizard':
      return WIZARD_MOVES
    case 'cleric':
      return CLERIC_MOVES
    case 'thief':
      return THIEF_MOVES
    case 'ranger':
      return RANGER_MOVES
    case 'paladin':
      return PALADIN_MOVES
    case 'bard':
      return BARD_MOVES
    case 'druid':
      return DRUID_MOVES
    case 'barbarian':
      return BARBARIAN_MOVES
    case 'immolator':
      return IMMOLATOR_MOVES
    default:
      return []
  }
}

export function getStartingMovesForClass(
  characterClass: string,
): Partial<Move>[] {
  return getMovesForClass(characterClass).filter((move) => move.level === 1)
}

export function getAdvancedMovesForClass(
  characterClass: string,
  level: number,
): Partial<Move>[] {
  return getMovesForClass(characterClass).filter(
    (move) => move.level && move.level > 1 && move.level <= level,
  )
}
