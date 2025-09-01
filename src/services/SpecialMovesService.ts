import { Character, getXPThreshold, getAttributeModifier } from '../models/Character';

export interface LevelUpResult {
  success: boolean;
  newLevel: number;
  newXP: number;
  message: string;
  advancementChoices?: string[];
}

export interface EndOfSessionResult {
  xpGained: number;
  totalXP: number;
  questions: {
    question: string;
    answered: boolean;
    xpValue: number;
  }[];
}

export interface MakeCampResult {
  success: boolean;
  rationsConsumed: number;
  hpRestored: number;
  message: string;
}

export interface LastBreathResult {
  success: boolean;
  roll: number;
  tier: '6-' | '7-9' | '10+';
  consequence: string;
  message: string;
}

export class SpecialMovesService {
  /**
   * Check if character can level up (has enough XP)
   */
  static canLevelUp(character: Character): boolean {
    const threshold = getXPThreshold(character.level);
    return character.xp >= threshold;
  }

  /**
   * Perform level up for character
   */
  static levelUp(character: Character, advancementChoice?: string): LevelUpResult {
    if (!this.canLevelUp(character)) {
      return {
        success: false,
        newLevel: character.level,
        newXP: character.xp,
        message: 'Not enough XP to level up',
      };
    }

    const newLevel = character.level + 1;
    const newXP = character.xp-getXPThreshold(character.level);

    // Generate advancement choices based on class
    const advancementChoices = this.getAdvancementChoices(character, newLevel);

    return {
      success: true,
      newLevel,
      newXP,
      message: `Leveled up to ${newLevel}!`,
      advancementChoices,
    };
  }

  /**
   * Get available advancement choices for a character at a given level
   */
  static getAdvancementChoices(character: Character, level: number): string[] {
    const choices: string[] = [];

    // All characters get stat advancement options
    choices.push('Increase STR by 1', 'Increase DEX by 1', 'Increase CON by 1',
                 'Increase INT by 1', 'Increase WIS by 1', 'Increase CHA by 1');

    // Class-specific moves (simplified-would need full move library)
    switch (character.class) {
      case 'Fighter':
        choices.push('Bend Bars, Lift Gates', 'Armored', 'Interrogator', 'Merciless');
        break;
      case 'Wizard':
        choices.push('Empowered Magic', 'Familiar', 'Spell Deflection', 'Counterspell');
        break;
      case 'Cleric':
        choices.push('Divine Guidance', 'Divine Protection', 'Divine Favor', 'Divine Intervention');
        break;
      case 'Thief':
        choices.push('Poisoner', 'Cautious', 'Connected', 'Wealth and Taste');
        break;
      case 'Ranger':
        choices.push('Wild Empathy', 'Called Shot', 'Viper\'s Strike', 'Camouflage');
        break;
      case 'Paladin':
        choices.push('I Am the Law', 'Lay on Hands', 'Armored', 'Bloody Aegis');
        break;
      case 'Bard':
        choices.push('Arcane Art', 'A Port in the Storm', 'Charming and Open', 'An Ear for Magic');
        break;
      case 'Druid':
        choices.push('By Nature Sustained', 'Elemental Mastery', 'Formcrafter', 'Naturalism');
        break;
      case 'Barbarian':
        choices.push('What Are You Waiting For?', 'My Love For You Is Like a Truck', 'Deny the Gods', 'The Upper Hand');
        break;
      case 'Immolator':
        choices.push('Burning Brand', 'We See Through the Flames', 'Cauterize', 'Fireproof');
        break;
    }

    return choices;
  }

  /**
   * Process End of Session move
   */
  static endOfSession(character: Character, answers: boolean[]): EndOfSessionResult {
    const questions = [
      { question: 'Did we learn something new and important about the world?', xpValue: 1 },
      { question: 'Did we overcome a notable monster or enemy?', xpValue: 1 },
      { question: 'Did we loot a memorable treasure?', xpValue: 1 },
      { question: 'Did we learn something new and important about another character?', xpValue: 1 },
      { question: 'Did we learn something new and important about our character?', xpValue: 1 },
      { question: 'Did we see the effects of our actions?', xpValue: 1 },
      { question: 'Did we overcome a notable monster or enemy?', xpValue: 1 },
      { question: 'Did we overcome the environment?', xpValue: 1 },
    ];

    let xpGained = 0;
    const answeredQuestions = questions.map((q, i) => {
      const answered = i < answers.length ? answers[i] : false;
      if (answered) xpGained += q.xpValue;
      return { ...q, answered };
    });

    const totalXP = character.xp + xpGained;

    return {
      xpGained,
      totalXP,
      questions: answeredQuestions,
    };
  }

  /**
   * Process Make Camp move
   */
  static makeCamp(character: Character, consumeRations = true): MakeCampResult {
    // Check if character has rations
    const hasRations = character.inventory?.some(item =>
      item.name.toLowerCase().includes('ration') && (item.uses?.current || 0) > 0,
    ) || false;

    if (consumeRations && !hasRations) {
      return {
        success: false,
        rationsConsumed: 0,
        hpRestored: 0,
        message: 'No rations available for Make Camp',
      };
    }

    // Calculate HP restoration (DW rule: recover HP equal to level)
    const hpRestored = character.level;
    const newHP = Math.min(character.hp.current + hpRestored, character.hp.max);
    const actualHPRestored = newHP-character.hp.current;

    // Consume rations if requested
    let rationsConsumed = 0;
    if (consumeRations && hasRations) {
      rationsConsumed = 1;
      // Note: Actual inventory update would be handled by the caller
    }

    return {
      success: true,
      rationsConsumed,
      hpRestored: actualHPRestored,
      message: `Camp made ! Restored ${actualHPRestored} HP${rationsConsumed > 0 ? ` and consumed ${rationsConsumed} ration` : ''}`,
    };
  }

  /**
   * Process Last Breath move (triggered at 0 HP)
   */
  static lastBreath(character: Character): LastBreathResult {
    // Roll 2d6 for Last Breath
    const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;

    let tier: '6-' | '7-9' | '10+';
    let consequence: string;
    let message: string;

    if (roll <= 6) {
      tier = '6-';
      consequence = 'You are dead';
      message = 'You have died. The GM will tell you what happens next.';
    } else if (roll <= 9) {
      tier = '7-9';
      consequence = 'You are dying';
      message = 'You are dying. Someone needs to stabilize you or you will die.';
    } else {
      tier = '10+';
      consequence = 'You are alive';
      message = 'You are alive ! You are unconscious and out of action.';
    }

    return {
      success: true,
      roll,
      tier,
      consequence,
      message,
    };
  }

  /**
   * Check if character should trigger Last Breath (at 0 HP)
   */
  static shouldTriggerLastBreath(character: Character): boolean {
    return character.hp.current <= 0;
  }

  /**
   * Get XP threshold for next level
   */
  static getNextLevelXP(character: Character): number {
    return getXPThreshold(character.level);
  }

  /**
   * Get XP progress toward next level (0 - 100%)
   */
  static getXPProgress(character: Character): number {
    const current = character.xp;
    const threshold = getXPThreshold(character.level);
    return Math.min(100, (current / threshold) * 100);
  }
}
