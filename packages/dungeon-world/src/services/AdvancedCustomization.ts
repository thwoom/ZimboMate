/**
 * Advanced character customization features
 */

import { CharacterClass, Race } from '../models/Character';

export interface CustomPortrait {
  id: string;
  name: string;
  type: 'emoji' | 'image' | 'generated';
  data: string; // emoji, URL, or base64
  tags: string[];
  createdAt: Date;
}

export interface AppearanceOption {
  id: string;
  category: 'hair' | 'eyes' | 'skin' | 'build' | 'clothing' | 'accessories';
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface BackgroundGenerator {
  profession: string[];
  origin: string[];
  motivation: string[];
  secret: string[];
  flaw: string[];
}

export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  category: 'positive' | 'negative' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  accent?: string;
  pitch: 'high' | 'medium' | 'low';
  speed: 'fast' | 'normal' | 'slow';
  examples: string[];
}

class AdvancedCustomizationService {

  /**
   * Generate detailed appearance description
   */
  generateDetailedAppearance(race: Race, options?: Partial < AppearanceOption>[]): string {
    const appearances = this.getAppearanceOptions(race);
    const selected = options || this.selectRandomAppearance(appearances);

    const parts: string[] = [];

    // Build description from selected options
    const hair = selected.find(opt => opt?.category === 'hair');
    const eyes = selected.find(opt => opt?.category === 'eyes');
    const skin = selected.find(opt => opt?.category === 'skin');
    const build = selected.find(opt => opt?.category === 'build');
    const clothing = selected.find(opt => opt?.category === 'clothing');

    if (hair?.description) parts.push(hair.description);
    if (eyes?.description) parts.push(eyes.description);
    if (skin?.description) parts.push(skin.description);
    if (build?.description) parts.push(build.description);
    if (clothing?.description) parts.push(clothing.description);

    return parts.join(', ');
  }

  /**
   * Get appearance options for a race
   */
  getAppearanceOptions(race: Race): Record < string, AppearanceOption[]> {
    const baseOptions = {
      hair: [
        { id: 'hair-1', category: 'hair' as const, name: 'Long', description: 'long, flowing hair', rarity: 'common' as const },
        { id: 'hair-2', category: 'hair' as const, name: 'Short', description: 'short, practical hair', rarity: 'common' as const },
        { id: 'hair-3', category: 'hair' as const, name: 'Braided', description: 'intricately braided hair', rarity: 'uncommon' as const },
        { id: 'hair-4', category: 'hair' as const, name: 'Bald', description: 'a shaved or naturally bald head', rarity: 'common' as const },
      ],
      eyes: [
        { id: 'eyes-1', category: 'eyes' as const, name: 'Bright', description: 'bright, alert eyes', rarity: 'common' as const },
        { id: 'eyes-2', category: 'eyes' as const, name: 'Piercing', description: 'piercing, intense eyes', rarity: 'uncommon' as const },
        { id: 'eyes-3', category: 'eyes' as const, name: 'Kind', description: 'kind, gentle eyes', rarity: 'common' as const },
        { id: 'eyes-4', category: 'eyes' as const, name: 'Mysterious', description: 'mysterious, shadowed eyes', rarity: 'rare' as const },
      ],
      skin: [
        { id: 'skin-1', category: 'skin' as const, name: 'Fair', description: 'fair, pale skin', rarity: 'common' as const },
        { id: 'skin-2', category: 'skin' as const, name: 'Tanned', description: 'sun-tanned skin', rarity: 'common' as const },
        { id: 'skin-3', category: 'skin' as const, name: 'Dark', description: 'rich, dark skin', rarity: 'common' as const },
        { id: 'skin-4', category: 'skin' as const, name: 'Scarred', description: 'battle-scarred skin', rarity: 'uncommon' as const },
      ],
      build: [
        { id: 'build-1', category: 'build' as const, name: 'Sturdy', description: 'a sturdy, solid build', rarity: 'common' as const },
        { id: 'build-2', category: 'build' as const, name: 'Lean', description: 'a lean, athletic build', rarity: 'common' as const },
        { id: 'build-3', category: 'build' as const, name: 'Stocky', description: 'a stocky, powerful build', rarity: 'common' as const },
        { id: 'build-4', category: 'build' as const, name: 'Tall', description: 'an unusually tall frame', rarity: 'uncommon' as const },
      ],
      clothing: [
        { id: 'cloth-1', category: 'clothing' as const, name: 'Practical', description: 'practical, well-worn clothing', rarity: 'common' as const },
        { id: 'cloth-2', category: 'clothing' as const, name: 'Fine', description: 'fine, well-tailored garments', rarity: 'uncommon' as const },
        { id: 'cloth-3', category: 'clothing' as const, name: 'Rugged', description: 'rugged, travel-stained gear', rarity: 'common' as const },
        { id: 'cloth-4', category: 'clothing' as const, name: 'Exotic', description: 'exotic, foreign-style clothing', rarity: 'rare' as const },
      ],
    };

    // Race-specific modifications
    if (race === 'Elf') {
      baseOptions.hair.push(
        { id: 'elf-hair', category: 'hair', name: 'Silver', description: 'silver, ethereal hair', rarity: 'uncommon' },
      );
      baseOptions.eyes.push(
        { id: 'elf-eyes', category: 'eyes', name: 'Ancient', description: 'ancient, wise eyes', rarity: 'uncommon' },
      );
    }

    if (race === 'Dwarf') {
      baseOptions.hair.push(
        { id: 'dwarf-beard', category: 'hair', name: 'Magnificent Beard', description: 'a magnificent, well-groomed beard', rarity: 'common' },
      );
    }

    return baseOptions;
  }

  /**
   * Generate comprehensive background story
   */
  generateBackground(characterClass: CharacterClass, race: Race): string {
    const generator = this.getBackgroundGenerator();

    const profession = this.randomChoice(generator.profession);
    const origin = this.randomChoice(generator.origin);
    const motivation = this.randomChoice(generator.motivation);
    const secret = this.randomChoice(generator.secret);

    return `Born ${origin}, you once worked as ${profession}. ${motivation} drives you forward, though you harbor ${secret}. Your path as ${characterClass.toLowerCase()} began when fate called you to adventure.`;
  }

  /**
   * Get background story generator data
   */
  private getBackgroundGenerator(): BackgroundGenerator {
    return {
      profession: [
        'a blacksmith', 'a merchant', 'a farmer', 'a scholar', 'a soldier',
        'a sailor', 'a hunter', 'a healer', 'a performer', 'a thief',
        'a noble', 'a priest', 'a craftsperson', 'a guide', 'a guard',
      ],
      origin: [
        'in a bustling city', 'in a quiet village', 'in the wilderness',
        'in a mountain stronghold', 'by the sea', 'in foreign lands',
        'among nomads', 'in ancient ruins', 'in a hidden valley',
        'during wartime', 'in poverty', 'in luxury',
      ],
      motivation: [
        'A desire for justice', 'The need for redemption', 'Curiosity about the world',
        'A quest for knowledge', 'The call of adventure', 'A promise to keep',
        'Revenge against wrongdoers', 'The protection of others', 'A search for truth',
        'The pursuit of glory', 'A need to prove yourself', 'Ancient prophecy',
      ],
      secret: [
        'a dark secret from your past', 'knowledge of a hidden treasure',
        'the identity of your true parents', 'a curse upon your bloodline',
        'a debt that must be repaid', 'a forbidden love', 'a terrible mistake',
        'knowledge of coming danger', 'a sacred duty', 'a powerful enemy',
        'a lost memory', 'a divine calling',
      ],
      flaw: [
        'You trust too easily', 'You are haunted by the past', 'You seek approval',
        'You are overly proud', 'You fear commitment', 'You are quick to anger',
        'You are too curious', 'You avoid responsibility', 'You are pessimistic',
        'You are reckless', 'You are secretive', 'You are stubborn',
      ],
    };
  }

  /**
   * Generate personality traits
   */
  generatePersonalityTraits(count = 3): PersonalityTrait[] {
    const allTraits = this.getAllPersonalityTraits();
    const selected: PersonalityTrait[] = [];

    // Ensure variety in categories
    const categories: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];

    for (let i = 0; i < count && i < categories.length; i++) {
      const categoryTraits = allTraits.filter(t => t.category === categories[i]);
      if (categoryTraits.length > 0) {
        selected.push(this.randomChoice(categoryTraits));
      }
    }

    // Fill remaining slots with random traits
    while (selected.length < count && selected.length < allTraits.length) {
      const remaining = allTraits.filter(t => !selected.some(s => s.id === t.id));
      if (remaining.length > 0) {
        selected.push(this.randomChoice(remaining));
      } else {
        break;
      }
    }

    return selected;
  }

  /**
   * Get all personality traits
   */
  private getAllPersonalityTraits(): PersonalityTrait[] {
    return [
      // Positive traits
      { id: 'brave', name: 'Brave', description: 'Faces danger without fear', category: 'positive', rarity: 'common' },
      { id: 'loyal', name: 'Loyal', description: 'Stands by friends and allies', category: 'positive', rarity: 'common' },
      { id: 'wise', name: 'Wise', description: 'Shows good judgment and insight', category: 'positive', rarity: 'uncommon' },
      { id: 'compassionate', name: 'Compassionate', description: 'Shows empathy and kindness', category: 'positive', rarity: 'common' },
      { id: 'determined', name: 'Determined', description: 'Never gives up on goals', category: 'positive', rarity: 'common' },
      { id: 'charismatic', name: 'Charismatic', description: 'Naturally inspiring and likeable', category: 'positive', rarity: 'uncommon' },

      // Negative traits
      { id: 'stubborn', name: 'Stubborn', description: 'Refuses to change mind easily', category: 'negative', rarity: 'common' },
      { id: 'impulsive', name: 'Impulsive', description: 'Acts without thinking', category: 'negative', rarity: 'common' },
      { id: 'prideful', name: 'Prideful', description: 'Has excessive self-regard', category: 'negative', rarity: 'common' },
      { id: 'pessimistic', name: 'Pessimistic', description: 'Expects the worst outcomes', category: 'negative', rarity: 'common' },
      { id: 'secretive', name: 'Secretive', description: 'Keeps thoughts and feelings hidden', category: 'negative', rarity: 'uncommon' },
      { id: 'jealous', name: 'Jealous', description: 'Envious of others\' success', category: 'negative', rarity: 'common' },

      // Neutral traits
      { id: 'curious', name: 'Curious', description: 'Always asking questions', category: 'neutral', rarity: 'common' },
      { id: 'methodical', name: 'Methodical', description: 'Approaches tasks systematically', category: 'neutral', rarity: 'common' },
      { id: 'artistic', name: 'Artistic', description: 'Appreciates and creates beauty', category: 'neutral', rarity: 'uncommon' },
      { id: 'analytical', name: 'Analytical', description: 'Breaks down complex problems', category: 'neutral', rarity: 'uncommon' },
      { id: 'spiritual', name: 'Spiritual', description: 'Deeply connected to faith or nature', category: 'neutral', rarity: 'uncommon' },
      { id: 'practical', name: 'Practical', description: 'Focuses on what works', category: 'neutral', rarity: 'common' },
    ];
  }

  /**
   * Generate voice and mannerisms
   */
  generateVoice(characterClass: CharacterClass, personalityTraits: string[]): VoiceOption {
    const voices = this.getVoiceOptions();

    // Filter based on class and personality
    let suitableVoices = voices;

    if (characterClass === 'Barbarian') {
      suitableVoices = voices.filter(v => v.pitch !== 'high' && v.name.includes('Gruff') || v.name.includes('Booming'));
    } else if (characterClass === 'Wizard') {
      suitableVoices = voices.filter(v => v.name.includes('Scholarly') || v.name.includes('Precise'));
    } else if (characterClass === 'Bard') {
      suitableVoices = voices.filter(v => v.name.includes('Melodious') || v.name.includes('Dramatic'));
    }

    return this.randomChoice(suitableVoices.length > 0 ? suitableVoices : voices);
  }

  /**
   * Get voice options
   */
  private getVoiceOptions(): VoiceOption[] {
    return [
      {
        id: 'gruff',
        name: 'Gruff',
        description: 'A rough, weathered voice',
        pitch: 'low',
        speed: 'slow',
        examples: ['*grumbles*', '*speaks in short sentences*', '*clears throat often*'],
      },
      {
        id: 'melodious',
        name: 'Melodious',
        description: 'A musical, pleasant voice',
        pitch: 'medium',
        speed: 'normal',
        examples: ['*speaks in flowing sentences*', '*hums occasionally*', '*uses poetic language*'],
      },
      {
        id: 'scholarly',
        name: 'Scholarly',
        description: 'A precise, educated voice',
        pitch: 'medium',
        speed: 'normal',
        examples: ['*uses complex vocabulary*', '*speaks methodically*', '*corrects others\' grammar*'],
      },
      {
        id: 'booming',
        name: 'Booming',
        description: 'A loud, commanding voice',
        pitch: 'low',
        speed: 'normal',
        examples: ['*speaks loudly*', '*emphasizes important words*', '*voice carries far*'],
      },
      {
        id: 'whispery',
        name: 'Whispery',
        description: 'A soft, mysterious voice',
        pitch: 'high',
        speed: 'slow',
        examples: ['*speaks softly*', '*pauses dramatically*', '*voice trails off*'],
      },
      {
        id: 'dramatic',
        name: 'Dramatic',
        description: 'An expressive, theatrical voice',
        pitch: 'medium',
        speed: 'fast',
        examples: ['*gestures while speaking*', '*changes tone frequently*', '*quotes literature*'],
      },
    ];
  }

  /**
   * Create custom portrait from emoji
   */
  createEmojiPortrait(emoji: string, name: string, tags: string[] = []): CustomPortrait {
    return {
      id: `emoji-${Date.now()}`,
      name,
      type: 'emoji',
      data: emoji,
      tags: ['emoji', ...tags],
      createdAt: new Date(),
    };
  }

  /**
   * Generate random custom portrait
   */
  generateRandomPortrait(characterClass: CharacterClass, race: Race): CustomPortrait {
    const classEmojis: Record < CharacterClass, string[]> = {
      'Fighter': ['⚔️', '🛡️', '🗡️', '⚡'],
      'Wizard': ['🧙', '✨', '📚', '🔮'],
      'Thief': ['🗡️', '🎭', '🔓', '💰'],
      'Cleric': ['✨', '🙏', '⭐', '💫'],
      'Ranger': ['🏹', '🌲', '🦅', '🐺'],
      'Paladin': ['⚔️', '✨', '🛡️', '⭐'],
      'Bard': ['🎵', '🎭', '🎪', '🎨'],
      'Druid': ['🌿', '🐻', '🌙', '🍃'],
      'Barbarian': ['⚡', '🔥', '💪', '🗯️'],
      'Immolator': ['🔥', '💥', '⚡', '🌋'],
    };

    const raceEmojis: Record < Race, string[]> = {
      'Human': ['👤', '🧑', '👨', '👩'],
      'Elf': ['🧝', '✨', '🌟', '🍃'],
      'Dwarf': ['🧔', '⛏️', '💎', '🏔️'],
      'Halfling': ['🧒', '🍞', '🏡', '🌻'],
      'Other': ['❓', '🎭', '👤', '✨'],
    };

    const classOptions = classEmojis[characterClass] || ['⚔️'];
    const raceOptions = raceEmojis[race] || ['👤'];

    const emoji = Math.random() > 0.5 ?
      this.randomChoice(classOptions) :
      this.randomChoice(raceOptions);

    return this.createEmojiPortrait(
      emoji,
      `${race} ${characterClass}`,
      [characterClass.toLowerCase(), race.toLowerCase()],
    );
  }

  /**
   * Select random appearance options
   */
  private selectRandomAppearance(options: Record < string, AppearanceOption[]>): AppearanceOption[] {
    const selected: AppearanceOption[] = [];

    for (const [category, categoryOptions] of Object.entries(options)) {
      if (categoryOptions.length > 0) {
        selected.push(this.randomChoice(categoryOptions));
      }
    }

    return selected;
  }

  /**
   * Random choice helper
   */
  private randomChoice < T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Save custom portrait
   */
  saveCustomPortrait(portrait: CustomPortrait): void {
    try {
      const existing = this.getCustomPortraits();
      const updated = [...existing.filter(p => p.id !== portrait.id), portrait];
      localStorage.setItem('zimbomate_custom_portraits', JSON.stringify(updated));
    } catch {
      }
  }

  /**
   * Get saved custom portraits
   */
  getCustomPortraits(): CustomPortrait[] {
    try {
      const stored = localStorage.getItem('zimbomate_custom_portraits');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete custom portrait
   */
  deleteCustomPortrait(portraitId: string): void {
    try {
      const existing = this.getCustomPortraits();
      const updated = existing.filter(p => p.id !== portraitId);
      localStorage.setItem('zimbomate_custom_portraits', JSON.stringify(updated));
    } catch {
      }
  }
}

export const advancedCustomizationService = new AdvancedCustomizationService();



