import { CharacterClass, Race, Alignment, Attributes } from '../models/Character';

// Name generation data
const FIRST_NAMES = {
  human: {
    male: ['Aldric', 'Bram', 'Cade', 'Darius', 'Edmund', 'Felix', 'Gareth', 'Hugo', 'Ivan', 'Jasper', 
           'Kieran', 'Leon', 'Marcus', 'Nolan', 'Oscar', 'Pierce', 'Quinn', 'Roland', 'Silas', 'Tobias'],
    female: ['Aria', 'Brenna', 'Cara', 'Diana', 'Elena', 'Freya', 'Gwen', 'Helena', 'Iris', 'Julia',
             'Kira', 'Luna', 'Maya', 'Nora', 'Ophelia', 'Piper', 'Quinn', 'Rosa', 'Stella', 'Thea'],
    neutral: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
              'Kai', 'Lake', 'Morgan', 'Nico', 'Onyx', 'Phoenix', 'River', 'Sage', 'Sky', 'Winter']
  },
  elf: {
    male: ['Aelrindel', 'Caelum', 'Elrond', 'Faelar', 'Galion', 'Haldir', 'Ilithien', 'Legolas', 'Mirion', 'Orion',
           'Silvain', 'Thranduil', 'Valandil'],
    female: ['Arwen', 'Celebrian', 'Elaria', 'Galadriel', 'Illyria', 'Luthien', 'Nimrodel', 'Silvara', 'Tauriel'],
    neutral: ['Aerin', 'Elm', 'Lore', 'Rain', 'Star', 'Whisper', 'Zephyr']
  },
  dwarf: {
    male: ['Balin', 'Dain', 'Dwalin', 'Gimli', 'Gloin', 'Grim', 'Thorin', 'Thrain', 'Ulfgar', 'Varric'],
    female: ['Dagna', 'Kili', 'Mira', 'Nori', 'Ragna', 'Thora', 'Ylva'],
    neutral: ['Flint', 'Iron', 'Stone', 'Steel']
  },
  halfling: {
    male: ['Bilbo', 'Drogo', 'Frodo', 'Merry', 'Pippin', 'Samwise', 'Tobold'],
    female: ['Belladonna', 'Daisy', 'Eglantine', 'Lobelia', 'Pearl', 'Poppy', 'Rosie'],
    neutral: ['Bailey', 'Clover', 'Pepper', 'Sunny']
  }
};

const SURNAMES = {
  human: ['Blackwood', 'Brightblade', 'Darkwater', 'Goldshire', 'Ironforge', 'Lightbringer', 'Nightfall', 
          'Redmane', 'Shadowmere', 'Silverstone', 'Stormwind', 'Winterhold'],
  elf: ['Moonwhisper', 'Starweaver', 'Sunblade', 'Windrunner', 'Leafsong', 'Silverleaf', 'Goldleaf'],
  dwarf: ['Battlehammer', 'Bronzebeard', 'Ironfoot', 'Stoneforge', 'Goldbeard', 'Fireforge'],
  halfling: ['Baggins', 'Brandybuck', 'Goodbarrel', 'Greenhill', 'Proudfoot', 'Underhill']
};

// Appearance descriptors
const APPEARANCE_DESCRIPTORS = {
  build: ['tall', 'short', 'stocky', 'lithe', 'muscular', 'lean', 'wiry', 'broad-shouldered', 'athletic'],
  hair: ['long', 'short', 'braided', 'wild', 'neat', 'flowing', 'cropped', 'shaved'],
  hairColor: ['black', 'brown', 'blonde', 'red', 'silver', 'white', 'gray', 'auburn'],
  eyes: ['piercing', 'kind', 'sharp', 'weary', 'bright', 'deep-set', 'wide', 'narrow'],
  eyeColor: ['blue', 'green', 'brown', 'gray', 'amber', 'hazel', 'violet', 'black'],
  feature: ['scarred face', 'tattooed arms', 'missing finger', 'crooked nose', 'perfect teeth', 
            'weathered hands', 'graceful movements', 'imposing presence', 'infectious smile']
};

class RandomGeneratorService {
  private static instance: RandomGeneratorService;

  private constructor() {}

  static getInstance(): RandomGeneratorService {
    if (!RandomGeneratorService.instance) {
      RandomGeneratorService.instance = new RandomGeneratorService();
    }
    return RandomGeneratorService.instance;
  }

  // Random utilities
  private random<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Name generation
  generateName(race?: Race, gender: 'male' | 'female' | 'neutral' = 'neutral'): string {
    const raceKey = race?.toLowerCase() as keyof typeof FIRST_NAMES || 'human';
    const nameData = FIRST_NAMES[raceKey] || FIRST_NAMES.human;
    const surnameData = SURNAMES[raceKey] || SURNAMES.human;

    // Try to get gender-specific names, fall back to neutral
    let firstNames = nameData[gender] || nameData.neutral || [];
    if (firstNames.length === 0) {
      // If no names for this gender, combine all available
      firstNames = [...(nameData.male || []), ...(nameData.female || []), ...(nameData.neutral || [])];
    }

    const firstName = this.random(firstNames);
    const surname = this.random(surnameData);
    
    return `${firstName} ${surname}`;
  }

  // Appearance generation
  generateAppearance(race?: Race, characterClass?: CharacterClass): string {
    const build = this.random(APPEARANCE_DESCRIPTORS.build);
    const hairLength = this.random(APPEARANCE_DESCRIPTORS.hair);
    const hairColor = this.random(APPEARANCE_DESCRIPTORS.hairColor);
    const eyeType = this.random(APPEARANCE_DESCRIPTORS.eyes);
    const eyeColor = this.random(APPEARANCE_DESCRIPTORS.eyeColor);
    const feature = this.random(APPEARANCE_DESCRIPTORS.feature);

    // Race-specific adjustments
    let raceSpecific = '';
    switch(race) {
      case 'Elf':
        raceSpecific = 'pointed ears, ';
        break;
      case 'Dwarf':
        raceSpecific = 'thick beard, ';
        break;
      case 'Halfling':
        raceSpecific = 'bare feet, ';
        break;
    }

    // Class-specific adjustments
    let classSpecific = '';
    switch(characterClass) {
      case 'Fighter':
      case 'Paladin':
        classSpecific = ' Carries themselves like a warrior.';
        break;
      case 'Wizard':
        classSpecific = ' Has an scholarly air about them.';
        break;
      case 'Thief':
        classSpecific = ' Moves with practiced stealth.';
        break;
      case 'Cleric':
        classSpecific = ' Radiates divine presence.';
        break;
    }

    return `A ${build} figure with ${hairLength} ${hairColor} hair and ${eyeType} ${eyeColor} eyes. ` +
           `${raceSpecific}Notable for their ${feature}.${classSpecific}`;
  }

  // Attribute generation
  generateAttributes(method: 'roll' | 'array' = 'roll'): number[] {
    if (method === 'array') {
      // Standard array
      return [16, 15, 13, 12, 9, 8];
    } else {
      // Roll 4d6 drop lowest, 6 times
      const scores: number[] = [];
      for (let i = 0; i < 6; i++) {
        const rolls = [1, 2, 3, 4].map(() => this.randomInt(1, 6));
        rolls.sort((a, b) => b - a);
        scores.push(rolls[0] + rolls[1] + rolls[2]);
      }
      return scores.sort((a, b) => b - a);
    }
  }

  // Assign attributes based on class preferences
  assignAttributesForClass(scores: number[], characterClass: CharacterClass): Attributes {
    const sorted = [...scores].sort((a, b) => b - a);
    const attributes: Partial<Attributes> = {};

    // Class-based stat priority
    const priorities: Record<CharacterClass, (keyof Attributes)[]> = {
      Fighter: ['STR', 'CON', 'DEX', 'WIS', 'CHA', 'INT'],
      Paladin: ['STR', 'CHA', 'CON', 'WIS', 'DEX', 'INT'],
      Ranger: ['DEX', 'WIS', 'STR', 'CON', 'INT', 'CHA'],
      Wizard: ['INT', 'WIS', 'CON', 'DEX', 'CHA', 'STR'],
      Cleric: ['WIS', 'CON', 'STR', 'CHA', 'DEX', 'INT'],
      Druid: ['WIS', 'CON', 'DEX', 'INT', 'STR', 'CHA'],
      Thief: ['DEX', 'CHA', 'INT', 'WIS', 'CON', 'STR'],
      Bard: ['CHA', 'DEX', 'INT', 'CON', 'WIS', 'STR'],
      Barbarian: ['STR', 'CON', 'DEX', 'WIS', 'CHA', 'INT'],
      Immolator: ['INT', 'CON', 'WIS', 'CHA', 'DEX', 'STR']
    };

    const classPriorities = priorities[characterClass];
    classPriorities.forEach((stat, index) => {
      attributes[stat] = sorted[index];
    });

    return attributes as Attributes;
  }

  // Generate a complete random character
  generateRandomCharacter(options?: {
    class?: CharacterClass;
    race?: Race;
    alignment?: Alignment;
  }): {
    name: string;
    look: string;
    class: CharacterClass;
    race: Race;
    alignment: Alignment;
    attributes: Attributes;
  } {
    // Random selections
    const characterClass = options?.class || this.random(['Fighter', 'Wizard', 'Cleric', 'Thief', 'Ranger', 'Bard', 'Druid', 'Paladin', 'Barbarian', 'Immolator'] as CharacterClass[]);
    const race = options?.race || this.random(['Human', 'Elf', 'Dwarf', 'Halfling'] as Race[]);
    const alignment = options?.alignment || this.random(['Good', 'Neutral', 'Evil', 'Lawful', 'Chaotic'] as Alignment[]);
    
    // Generate details
    const gender = this.random(['male', 'female', 'neutral'] as const);
    const name = this.generateName(race, gender);
    const look = this.generateAppearance(race, characterClass);
    const scores = this.generateAttributes('roll');
    const attributes = this.assignAttributesForClass(scores, characterClass);

    return {
      name,
      look,
      class: characterClass,
      race,
      alignment,
      attributes
    };
  }

  // Generate random bonds
  generateRandomBond(templates: string[]): string {
    const template = this.random(templates);
    const names = ['Aldric', 'Brenna', 'Cade', 'Diana', 'Edmund', 'Freya', 'Gareth', 'Helena'];
    const name = this.random(names);
    return template.replace('____', name);
  }

  // Background generation
  generateBackground(options?: { class?: CharacterClass; race?: Race; alignment?: Alignment }): string {
    const motives = [
      'seeking revenge for a past wrong',
      'searching for a lost relic of their people',
      'driven by prophetic dreams',
      'on the run from a powerful enemy',
      'trying to reclaim a fallen honor',
      'yearning to map the unknown',
      'hoping to cure a mysterious curse',
      'compelled by a divine mission'
    ];

    const pasts = [
      'a former soldier',
      'an exiled noble',
      'a temple acolyte',
      'a street urchin turned adventurer',
      'a failed apprentice',
      'a caravan guard',
      'a reformed brigand',
      'a village healer'
    ];

    const bonds = [
      'owes a life-debt to a companion',
      'is haunted by a promise left unfulfilled',
      'carries a token from a loved one',
      'fears what they might become',
      'trusts their instincts more than any rule',
      'keeps a diary of every journey'
    ];

    const cls = options?.class || this.random(['Fighter','Wizard','Cleric','Thief','Ranger','Bard','Druid','Paladin','Barbarian','Immolator'] as CharacterClass[]);
    const race = options?.race || this.random(['Human','Elf','Dwarf','Halfling'] as Race[]);
    const alignment = options?.alignment || this.random(['Good','Neutral','Evil','Lawful','Chaotic'] as Alignment[]);

    return `A ${race.toLowerCase()} ${cls.toLowerCase()} of ${alignment.toLowerCase()} bent, ${this.random(pasts)}, ` +
           `${this.random(motives)}; ${this.random(bonds)}.`;
  }

  // Personality & voice
  generatePersonalityTraits(count: number = 3): string[] {
    const traits = [
      'brave', 'cautious', 'curious', 'stoic', 'hot-headed', 'compassionate', 'reckless', 'loyal', 'pragmatic',
      'idealistic', 'sarcastic', 'cheerful', 'brooding', 'superstitious', 'methodical', 'impulsive'
    ];
    const result: string[] = [];
    while (result.length < count && traits.length > 0) {
      const i = Math.floor(Math.random() * traits.length);
      result.push(traits.splice(i, 1)[0]);
    }
    return result;
  }

  generateVoice(): string {
    const timbre = ['raspy', 'soft', 'booming', 'nasal', 'melodic', 'gravelly', 'silky', 'sharp'];
    const cadence = ['measured', 'hurried', 'drawling', 'staccato', 'sing-song'];
    const accent = ['northern', 'southern', 'aristocratic', 'rural', 'foreign', 'urban'];
    return `${this.random(timbre)}, ${this.random(cadence)} cadence, ${this.random(accent)} accent`;
  }
}

export const randomGeneratorService = RandomGeneratorService.getInstance();
