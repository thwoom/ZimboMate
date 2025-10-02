/**
 * Monster and NPC models for Dungeon World
 * Based on official DW SRD creature rules
 */

export type MonsterSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan'

export type MonsterTag
  = | 'Magical' | 'Devious' | 'Amorphous' | 'Organized' | 'Intelligent' | 'Cautious'
    | 'Construct' | 'Planar' | 'Terrifying' | 'Undead' | 'Horde' | 'Group' | 'Solitary'
    | 'Stealthy' | 'Messy' | 'Forceful' | 'Ignores Armor' | 'Piercing' | 'Near' | 'Close'
    | 'Reach' | 'Far' | 'Throwing' | 'Reload' | 'Precise' | 'Area' | 'Divine'

export type MonsterOrigin
  = | 'Beast' | 'Humanoid' | 'Construct' | 'Undead' | 'Fey' | 'Elemental'
    | 'Dragon' | 'Aberration' | 'Demon' | 'Devil' | 'Giant' | 'Ooze' | 'Plant'

export interface MonsterMove {
  name: string
  description: string
  tags?: MonsterTag[]
}

export interface MonsterTemplate {
  id: string
  name: string
  description: string

  // Core Stats
  hp: number
  armor: number
  damage: string // e.g., "1d8+2", "1d6", "2d4+1"

  // Classification
  size: MonsterSize
  origin: MonsterOrigin
  tags: MonsterTag[]

  // Behavior
  instinct: string
  moves: MonsterMove[]

  // Optional combat details
  weaknesses?: string[]
  special?: string[]

  // Narrative details
  appearance?: string
  habitat?: string
  treasure?: string[]

  // Scaling
  minLevel?: number
  maxLevel?: number

  // Creation metadata
  official: boolean // true for SRD monsters, false for custom
  source?: string
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

// Quick monster creation for combat
export interface QuickMonster {
  name: string
  hp: number
  armor: number
  damage: string
  tags: MonsterTag[]
  instinct: string
  moves: string[] // Simplified move names
}

// Pre-made monster templates based on DW SRD
export const DW_MONSTER_TEMPLATES: MonsterTemplate[] = [
  {
    id: 'goblin-warrior',
    name: 'Goblin Warrior',
    description: 'Small, cunning humanoid with crude weapons and tribal organization.',
    hp: 3,
    armor: 1,
    damage: '1d6',
    size: 'Small',
    origin: 'Humanoid',
    tags: ['Group', 'Stealthy', 'Organized'],
    instinct: 'To raid and pillage',
    moves: [
      { name: 'Ambush from shadows', description: 'Attack from hiding with advantage' },
      { name: 'Rally the pack', description: 'Call for goblin reinforcements' },
      { name: 'Fight dirty', description: 'Use underhanded tactics in combat' },
    ],
    appearance: 'Green-skinned, pointed ears, crude leather armor and rusty weapons',
    habitat: 'Caves, ruins, dark forests',
    treasure: ['Crude weapons', 'A few coins', 'Tribal trinkets'],
    minLevel: 1,
    maxLevel: 3,
    official: true,
    source: 'Dungeon World SRD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'orc-warrior',
    name: 'Orc Warrior',
    description: 'Brutish humanoid warrior, stronger and more organized than goblins.',
    hp: 6,
    armor: 2,
    damage: '1d8+1',
    size: 'Medium',
    origin: 'Humanoid',
    tags: ['Group', 'Organized', 'Forceful'],
    instinct: 'To conquer and dominate',
    moves: [
      { name: 'Charge into battle', description: 'Rush forward with a powerful attack' },
      { name: 'Intimidate foes', description: 'Use size and ferocity to frighten enemies' },
      { name: 'Coordinated assault', description: 'Attack in formation with allies' },
    ],
    appearance: 'Large, muscular humanoid with tusks, crude armor and brutal weapons',
    habitat: 'Mountains, wastelands, fortified camps',
    treasure: ['Iron weapons', 'Chain mail scraps', 'War trophies'],
    minLevel: 2,
    maxLevel: 5,
    official: true,
    source: 'Dungeon World SRD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'skeleton-warrior',
    name: 'Skeleton Warrior',
    description: 'Animated bones of a long-dead warrior, still bearing arms.',
    hp: 4,
    armor: 2,
    damage: '1d6+1',
    size: 'Medium',
    origin: 'Undead',
    tags: ['Group', 'Undead', 'Organized'],
    instinct: 'To serve its master',
    moves: [
      { name: 'Fight without fear', description: 'Cannot be intimidated or frightened' },
      { name: 'Reform when broken', description: 'Reassemble from scattered bones' },
      { name: 'Ancient weapon mastery', description: 'Use weapons with old skill' },
    ],
    weaknesses: ['Holy water', 'Turn undead', 'Crushing damage'],
    appearance: 'Yellowed bones held together by dark magic, rusted weapons and armor',
    habitat: 'Crypts, dungeons, ancient battlefields',
    treasure: ['Ancient coins', 'Old weapons', 'Bone trinkets'],
    minLevel: 1,
    maxLevel: 4,
    official: true,
    source: 'Dungeon World SRD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'owlbear',
    name: 'Owlbear',
    description: 'A massive creature with the body of a bear and the head of an owl.',
    hp: 16,
    armor: 1,
    damage: '2d6+3',
    size: 'Large',
    origin: 'Beast',
    tags: ['Solitary', 'Forceful', 'Messy'],
    instinct: 'To hunt and kill',
    moves: [
      { name: 'Savage maul', description: 'Grab prey and tear it apart' },
      { name: 'Keen senses', description: 'Detect hidden or invisible foes' },
      { name: 'Territorial roar', description: 'Frighten away intruders' },
    ],
    appearance: 'Eight feet tall, brown feathers and fur, massive claws and beak',
    habitat: 'Deep forests, caves, wilderness areas',
    treasure: ['Owlbear pelt', 'Giant feathers', 'Natural treasures'],
    minLevel: 4,
    maxLevel: 7,
    official: true,
    source: 'Dungeon World SRD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: 'dragon-wyrmling',
    name: 'Dragon Wyrmling',
    description: 'A young dragon, smaller but still incredibly dangerous.',
    hp: 12,
    armor: 2,
    damage: '1d8+3',
    size: 'Large',
    origin: 'Dragon',
    tags: ['Solitary', 'Intelligent', 'Magical', 'Terrifying'],
    instinct: 'To grow in power and hoard treasure',
    moves: [
      { name: 'Breath weapon', description: 'Unleash elemental destruction', tags: ['Area', 'Far'] },
      { name: 'Draconic cunning', description: 'Outwit opponents with ancient intelligence' },
      { name: 'Magical resistance', description: 'Shrug off magical effects' },
    ],
    appearance: 'Scaled hide, glowing eyes, wings, and elemental breath',
    habitat: 'Mountain lairs, ancient ruins, treasure hoards',
    treasure: ['Gold and gems', 'Magic items', 'Ancient artifacts'],
    minLevel: 6,
    maxLevel: 10,
    official: true,
    source: 'Dungeon World SRD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Quick monster builder
export function createQuickMonster(
  name: string,
  hp: number,
  armor: number,
  damage: string,
  tags: MonsterTag[] = [],
  instinct: string = 'To survive',
  moves: string[] = ['Attack'],
): QuickMonster {
  return {
    name,
    hp,
    armor,
    damage,
    tags,
    instinct,
    moves,
  }
}

// Convert monster template to combat participant
export function monsterToCombatParticipant(monster: MonsterTemplate | QuickMonster, id?: string) {
  return {
    id: id || `monster-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: monster.name,
    type: 'monster' as const,
    hp: { current: monster.hp, max: monster.hp },
    armor: monster.armor,
    conditions: [],
    position: 'close' as const,
    isActive: true,
    isPlayer: false,
    // Add monster-specific data
    damage: monster.damage,
    tags: monster.tags,
    instinct: monster.instinct,
    moves: 'moves' in monster ? monster.moves : monster.moves.map(m => ({ name: m, description: m })),
  }
}

// Scale monster for different levels
export function scaleMonster(template: MonsterTemplate, targetLevel: number): MonsterTemplate {
  if (!template.minLevel || !template.maxLevel)
    return template

  const levelRange = template.maxLevel - template.minLevel
  const levelFactor = Math.max(1, (targetLevel - template.minLevel) / levelRange)

  return {
    ...template,
    hp: Math.floor(template.hp * levelFactor),
    armor: Math.min(4, Math.floor(template.armor * Math.sqrt(levelFactor))), // Armor scales slower
    // Damage scaling would need more complex parsing, keep simple for now
    name: targetLevel > template.maxLevel ? `Elite ${template.name}` : template.name,
  }
}

// Helper functions for GM tools
export const MONSTER_SIZE_MULTIPLIERS = {
  Tiny: 0.5,
  Small: 0.75,
  Medium: 1,
  Large: 1.5,
  Huge: 2,
  Gargantuan: 3,
}

export const MONSTER_ORGANIZATION_HP = {
  Solitary: 1,
  Group: 0.75,
  Horde: 0.5,
}
