/**
 * Bond Templates * Pre-defined bond templates for Dungeon World characters
 */

import { BondTemplate } from '../types/Bond';

export const bondTemplates: BondTemplate[] = [
  // Fighter Bonds
  {
    id: 'fighter-mentor',
    name: 'Mentor & Student',
    description: 'I am teaching {target} the ways of combat and survival',
    characterClasses: ['Fighter'],
    targetClasses: ['Fighter', 'Paladin', 'Ranger'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['mentorship', 'combat', 'training'],
    xpTrigger: 'When {target} successfully uses a combat technique I taught them',
  },
  {
    id: 'fighter-rival',
    name: 'Rival Warrior',
    description: 'I am competing with {target} to prove I am the better warrior',
    characterClasses: ['Fighter'],
    targetClasses: ['Fighter', 'Paladin', 'Ranger'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['competition', 'combat', 'rivalry'],
    xpTrigger: 'When I best {target} in a direct combat challenge',
  },
  {
    id: 'fighter-protector',
    name: 'Protector',
    description: 'I will protect {target} from harm, even at great cost to myself',
    characterClasses: ['Fighter'],
    targetClasses: ['Wizard', 'Cleric', 'Thief'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['protection', 'loyalty', 'sacrifice'],
    xpTrigger: 'When I successfully protect {target} from mortal danger',
  },

  // Wizard Bonds
  {
    id: 'wizard-apprentice',
    name: 'Master & Apprentice',
    description: 'I am teaching {target} the arcane arts and magical theory',
    characterClasses: ['Wizard'],
    targetClasses: ['Wizard', 'Bard'],
    alignmentPreferences: ['Neutral', 'Lawful'],
    tags: ['magic', 'teaching', 'knowledge'],
    xpTrigger: 'When {target} successfully casts a spell I taught them',
  },
  {
    id: 'wizard-rival',
    name: 'Arcane Rival',
    description: 'I am competing with {target} to prove my magical superiority',
    characterClasses: ['Wizard'],
    targetClasses: ['Wizard', 'Bard'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['magic', 'competition', 'pride'],
    xpTrigger: 'When I best {target} in a magical duel or contest',
  },
  {
    id: 'wizard-guardian',
    name: 'Magical Guardian',
    description: 'I will protect {target} from magical threats and curses',
    characterClasses: ['Wizard'],
    targetClasses: ['Fighter', 'Thief', 'Cleric'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'magic', 'warding'],
    xpTrigger: 'When I successfully protect {target} from a magical threat',
  },

  // Cleric Bonds
  {
    id: 'cleric-disciple',
    name: 'Spiritual Guide',
    description: 'I am guiding {target} on their spiritual journey and faith',
    characterClasses: ['Cleric'],
    targetClasses: ['Cleric', 'Paladin'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['faith', 'guidance', 'spirituality'],
    xpTrigger: 'When {target} acts in accordance with divine principles I taught',
  },
  {
    id: 'cleric-healer',
    name: 'Healer & Patient',
    description: 'I am responsible for {target}\'s spiritual and physical well-being',
    characterClasses: ['Cleric'],
    targetClasses: ['Fighter', 'Wizard', 'Thief'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['healing', 'care', 'responsibility'],
    xpTrigger: 'When I successfully heal {target} from a serious injury',
  },
  {
    id: 'cleric-convert',
    name: 'Seeker of Truth',
    description: 'I am trying to convert {target} to my faith and beliefs',
    characterClasses: ['Cleric'],
    targetClasses: ['Fighter', 'Wizard', 'Thief'],
    alignmentPreferences: ['Lawful', 'Good'],
    tags: ['conversion', 'faith', 'persuasion'],
    xpTrigger: 'When {target} shows interest in or converts to my faith',
  },

  // Thief Bonds
  {
    id: 'thief-partner',
    name: 'Criminal Partners',
    description: '{target} and I are partners in crime and heists',
    characterClasses: ['Thief'],
    targetClasses: ['Thief', 'Bard'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['crime', 'partnership', 'heists'],
    xpTrigger: 'When {target} and I successfully complete a heist together',
  },
  {
    id: 'thief-target',
    name: 'Mark & Thief',
    description: 'I am planning to steal something valuable from {target}',
    characterClasses: ['Thief'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['theft', 'deception', 'planning'],
    xpTrigger: 'When I successfully steal something valuable from {target}',
  },
  {
    id: 'thief-guardian',
    name: 'Shadow Guardian',
    description: 'I will protect {target} from threats they cannot see',
    characterClasses: ['Thief'],
    targetClasses: ['Wizard', 'Cleric'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'stealth', 'vigilance'],
    xpTrigger: 'When I secretly protect {target} from an unseen threat',
  },

  // Paladin Bonds
  {
    id: 'paladin-squire',
    name: 'Knight & Squire',
    description: 'I am training {target} in the ways of honor and chivalry',
    characterClasses: ['Paladin'],
    targetClasses: ['Fighter', 'Paladin'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['chivalry', 'honor', 'training'],
    xpTrigger: 'When {target} acts with honor and chivalry',
  },
  {
    id: 'paladin-quest',
    name: 'Quest Companions',
    description: '{target} and I are bound by a sacred quest or mission',
    characterClasses: ['Paladin'],
    targetClasses: ['Fighter', 'Cleric', 'Wizard'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['quest', 'mission', 'sacred'],
    xpTrigger: 'When we make progress on our sacred quest together',
  },
  {
    id: 'paladin-redeem',
    name: 'Redemption Seeker',
    description: 'I am trying to redeem {target} from their dark path',
    characterClasses: ['Paladin'],
    targetClasses: ['Thief', 'Wizard'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['redemption', 'faith', 'hope'],
    xpTrigger: 'When {target} shows signs of redemption or change',
  },

  // Ranger Bonds
  {
    id: 'ranger-scout',
    name: 'Wilderness Guide',
    description: 'I am teaching {target} the ways of the wilderness and survival',
    characterClasses: ['Ranger'],
    targetClasses: ['Fighter', 'Thief', 'Druid'],
    alignmentPreferences: ['Neutral', 'Good'],
    tags: ['wilderness', 'survival', 'nature'],
    xpTrigger: 'When {target} successfully uses wilderness skills I taught',
  },
  {
    id: 'ranger-hunter',
    name: 'Hunting Partners',
    description: '{target} and I are hunting partners, tracking dangerous prey',
    characterClasses: ['Ranger'],
    targetClasses: ['Fighter', 'Ranger'],
    alignmentPreferences: ['Neutral', 'Chaotic'],
    tags: ['hunting', 'tracking', 'partnership'],
    xpTrigger: 'When {target} and I successfully hunt dangerous prey together',
  },
  {
    id: 'ranger-warden',
    name: 'Nature\'s Warden',
    description: 'I will protect {target} from the dangers of the wilderness',
    characterClasses: ['Ranger'],
    targetClasses: ['Wizard', 'Cleric'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'nature', 'wilderness'],
    xpTrigger: 'When I protect {target} from a wilderness threat',
  },

  // Bard Bonds
  {
    id: 'bard-muse',
    name: 'Muse & Artist',
    description: '{target} is my muse, inspiring my greatest performances',
    characterClasses: ['Bard'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['inspiration', 'art', 'performance'],
    xpTrigger: 'When I create a masterpiece inspired by {target}',
  },
  {
    id: 'bard-story',
    name: 'Legendary Tale',
    description: 'I am writing the epic story of {target}\'s adventures',
    characterClasses: ['Bard'],
    targetClasses: ['Fighter', 'Paladin', 'Wizard'],
    alignmentPreferences: ['Neutral', 'Good'],
    tags: ['storytelling', 'legend', 'epic'],
    xpTrigger: 'When {target} performs a heroic deed worth immortalizing',
  },
  {
    id: 'bard-rival',
    name: 'Competing Performers',
    description: 'I am competing with {target} for fame and recognition',
    characterClasses: ['Bard'],
    targetClasses: ['Bard'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['competition', 'fame', 'performance'],
    xpTrigger: 'When I best {target} in a performance contest',
  },

  // Druid Bonds
  {
    id: 'druid-initiate',
    name: 'Nature\'s Initiate',
    description: 'I am teaching {target} the secrets of nature and druidic magic',
    characterClasses: ['Druid'],
    targetClasses: ['Ranger', 'Cleric'],
    alignmentPreferences: ['Neutral', 'Good'],
    tags: ['nature', 'magic', 'teaching'],
    xpTrigger: 'When {target} successfully uses druidic knowledge I taught',
  },
  {
    id: 'druid-warden',
    name: 'Sacred Grove',
    description: '{target} and I are protecting a sacred natural site together',
    characterClasses: ['Druid'],
    targetClasses: ['Ranger', 'Paladin'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'nature', 'sacred'],
    xpTrigger: 'When we successfully protect our sacred site from harm',
  },
  {
    id: 'druid-balance',
    name: 'Balance Keepers',
    description: 'I am helping {target} maintain the balance of nature',
    characterClasses: ['Druid'],
    targetClasses: ['Wizard', 'Cleric'],
    alignmentPreferences: ['Neutral'],
    tags: ['balance', 'nature', 'harmony'],
    xpTrigger: 'When we restore balance to a disrupted natural area',
  },

  // Barbarian Bonds
  {
    id: 'barbarian-kin',
    name: 'Blood Kin',
    description: '{target} and I are blood kin, bound by the same tribal heritage',
    characterClasses: ['Barbarian'],
    targetClasses: ['Barbarian', 'Fighter', 'Ranger'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['family', 'heritage', 'tribal'],
    xpTrigger: 'When {target} and I honor our shared heritage together',
  },
  {
    id: 'barbarian-rival',
    name: 'Fierce Rival',
    description: 'I am competing with {target} to prove my strength and dominance',
    characterClasses: ['Barbarian'],
    targetClasses: ['Barbarian', 'Fighter', 'Paladin'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['competition', 'strength', 'dominance'],
    xpTrigger: 'When I prove my superiority over {target} in combat or challenge',
  },
  {
    id: 'barbarian-protector',
    name: 'Tribal Guardian',
    description: 'I will protect {target} as if they were my own tribe member',
    characterClasses: ['Barbarian'],
    targetClasses: ['Wizard', 'Cleric', 'Thief'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'tribal', 'loyalty'],
    xpTrigger: 'When I successfully protect {target} from mortal danger',
  },
  {
    id: 'barbarian-mentor',
    name: 'Primal Teacher',
    description: 'I am teaching {target} the ways of primal strength and survival',
    characterClasses: ['Barbarian'],
    targetClasses: ['Fighter', 'Ranger', 'Thief'],
    alignmentPreferences: ['Neutral', 'Chaotic'],
    tags: ['teaching', 'primal', 'survival'],
    xpTrigger: 'When {target} successfully uses a primal technique I taught them',
  },

  // Immolator Bonds
  {
    id: 'immolator-disciple',
    name: 'Fire Disciple',
    description: 'I am teaching {target} the ways of flame and passion',
    characterClasses: ['Immolator'],
    targetClasses: ['Wizard', 'Bard'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['fire', 'teaching', 'passion'],
    xpTrigger: 'When {target} successfully uses fire magic I taught them',
  },
  {
    id: 'immolator-rival',
    name: 'Flame Rival',
    description: 'I am competing with {target} to prove my mastery of fire',
    characterClasses: ['Immolator'],
    targetClasses: ['Wizard', 'Immolator'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['fire', 'competition', 'mastery'],
    xpTrigger: 'When I best {target} in a contest of fire magic',
  },
  {
    id: 'immolator-guardian',
    name: 'Flame Guardian',
    description: 'I will protect {target} from those who would extinguish their inner fire',
    characterClasses: ['Immolator'],
    targetClasses: ['Wizard', 'Cleric', 'Thief'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['protection', 'fire', 'passion'],
    xpTrigger: 'When I successfully protect {target} from those who would harm their spirit',
  },
  {
    id: 'immolator-kindred',
    name: 'Kindred Flame',
    description: '{target} and I share a burning passion for the same cause',
    characterClasses: ['Immolator'],
    targetClasses: ['Fighter', 'Paladin', 'Bard'],
    alignmentPreferences: ['Chaotic', 'Good'],
    tags: ['passion', 'cause', 'kindred'],
    xpTrigger: 'When {target} and I advance our shared cause together',
  },

  // Universal Bonds
  {
    id: 'universal-friend',
    name: 'True Friends',
    description: '{target} and I are true friends, bound by trust and loyalty',
    characterClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    alignmentPreferences: ['Good', 'Neutral'],
    tags: ['friendship', 'loyalty', 'trust'],
    xpTrigger: 'When {target} and I demonstrate true friendship and loyalty',
  },
  {
    id: 'universal-enemy',
    name: 'Sworn Enemies',
    description: '{target} and I are sworn enemies, destined to clash',
    characterClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['enmity', 'conflict', 'destiny'],
    xpTrigger: 'When I defeat {target} in a decisive confrontation',
  },
  {
    id: 'universal-mystery',
    name: 'Mysterious Connection',
    description: '{target} and I share a mysterious connection from our past',
    characterClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    alignmentPreferences: ['Chaotic', 'Neutral'],
    tags: ['mystery', 'past', 'connection'],
    xpTrigger: 'When we discover something about our mysterious connection',
  },
  {
    id: 'universal-debt',
    name: 'Life Debt',
    description: 'I owe {target} a life debt that I must repay',
    characterClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    targetClasses: ['Fighter', 'Wizard', 'Cleric', 'Thief', 'Paladin', 'Ranger', 'Bard', 'Druid', 'Barbarian', 'Immolator'],
    alignmentPreferences: ['Good', 'Lawful'],
    tags: ['debt', 'honor', 'obligation'],
    xpTrigger: 'When I successfully repay my life debt to {target}',
  },
];

/**
 * Get bond templates for a specific character class
 */
export function getBondTemplatesForClass(characterClass: string): BondTemplate[] {
  return bondTemplates.filter(template =>
    template.characterClasses.includes(characterClass),
  );
}

/**
 * Get bond templates for a specific alignment
 */
export function getBondTemplatesForAlignment(alignment: string): BondTemplate[] {
  return bondTemplates.filter(template =>
    template.alignmentPreferences?.includes(alignment),
  );
}

/**
 * Get bond templates by tags
 */
export function getBondTemplatesByTags(tags: string[]): BondTemplate[] {
  return bondTemplates.filter(template =>
    tags.some(tag => template.tags.includes(tag)),
  );
}

/**
 * Get random bond template
 */
export function getRandomBondTemplate(): BondTemplate {
  const randomIndex = Math.floor(Math.random() * bondTemplates.length);
  return bondTemplates[randomIndex];
}

/**
 * Get bond template by ID
 */
export function getBondTemplateById(id: string): BondTemplate | undefined {
  return bondTemplates.find(template => template.id === id);
}
