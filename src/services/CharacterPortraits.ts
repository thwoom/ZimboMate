import { CharacterClass, Race } from '../models/Character';

export interface Portrait {
  id: string;
  name: string;
  emoji: string; // Using emoji as placeholder for actual portraits
  color: string; // Background color
  tags: string[];
  suggestedClasses?: CharacterClass[];
  suggestedRaces?: Race[];
  customUrl?: string; // For custom uploaded portraits
}

// Default fantasy character portraits using emojis as placeholders
export const DEFAULT_PORTRAITS: Portrait[] = [
  // Warriors & Fighters
  {
    id: 'warrior-1',
    name: 'Brave Warrior',
    emoji: '⚔️',
    color: '#8B4513',
    tags: ['warrior', 'fighter', 'brave'],
    suggestedClasses: ['Fighter', 'Paladin', 'Barbarian'],
    suggestedRaces: ['Human', 'Dwarf']
  },
  {
    id: 'knight-1',
    name: 'Noble Knight',
    emoji: '🛡️',
    color: '#4682B4',
    tags: ['knight', 'noble', 'armor'],
    suggestedClasses: ['Paladin', 'Fighter'],
    suggestedRaces: ['Human']
  },
  {
    id: 'barbarian-1',
    name: 'Wild Barbarian',
    emoji: '🪓',
    color: '#8B0000',
    tags: ['barbarian', 'wild', 'fierce'],
    suggestedClasses: ['Barbarian', 'Fighter'],
    suggestedRaces: ['Human', 'Other']
  },
  
  // Rogues & Rangers
  {
    id: 'rogue-1',
    name: 'Shadow Thief',
    emoji: '🗡️',
    color: '#2F4F4F',
    tags: ['rogue', 'thief', 'shadow'],
    suggestedClasses: ['Thief'],
    suggestedRaces: ['Human', 'Halfling']
  },
  {
    id: 'ranger-1',
    name: 'Forest Ranger',
    emoji: '🏹',
    color: '#228B22',
    tags: ['ranger', 'forest', 'archer'],
    suggestedClasses: ['Ranger'],
    suggestedRaces: ['Elf', 'Human']
  },
  
  // Magic Users
  {
    id: 'wizard-1',
    name: 'Wise Wizard',
    emoji: '🧙',
    color: '#4B0082',
    tags: ['wizard', 'mage', 'wise'],
    suggestedClasses: ['Wizard'],
    suggestedRaces: ['Elf', 'Human']
  },
  {
    id: 'druid-1',
    name: 'Nature Druid',
    emoji: '🌿',
    color: '#006400',
    tags: ['druid', 'nature', 'wild'],
    suggestedClasses: ['Druid'],
    suggestedRaces: ['Elf', 'Halfling', 'Human']
  },
  {
    id: 'cleric-1',
    name: 'Holy Cleric',
    emoji: '✨',
    color: '#FFD700',
    tags: ['cleric', 'holy', 'divine'],
    suggestedClasses: ['Cleric'],
    suggestedRaces: ['Human', 'Dwarf']
  },
  {
    id: 'immolator-1',
    name: 'Fire Mage',
    emoji: '🔥',
    color: '#FF4500',
    tags: ['immolator', 'fire', 'mage'],
    suggestedClasses: ['Immolator'],
    suggestedRaces: ['Human']
  },
  
  // Performers
  {
    id: 'bard-1',
    name: 'Charming Bard',
    emoji: '🎵',
    color: '#9370DB',
    tags: ['bard', 'performer', 'charming'],
    suggestedClasses: ['Bard'],
    suggestedRaces: ['Human', 'Elf']
  },
  
  // Generic portraits
  {
    id: 'adventurer-1',
    name: 'Brave Adventurer',
    emoji: '🗺️',
    color: '#5F9EA0',
    tags: ['adventurer', 'generic', 'brave']
  },
  {
    id: 'hero-1',
    name: 'Young Hero',
    emoji: '⭐',
    color: '#4169E1',
    tags: ['hero', 'young', 'generic']
  },
  {
    id: 'mystic-1',
    name: 'Mysterious Mystic',
    emoji: '🔮',
    color: '#8B008B',
    tags: ['mystic', 'mysterious', 'magic']
  },
  {
    id: 'wanderer-1',
    name: 'Lone Wanderer',
    emoji: '🚶',
    color: '#708090',
    tags: ['wanderer', 'lone', 'traveler']
  },
  {
    id: 'scholar-1',
    name: 'Wise Scholar',
    emoji: '📚',
    color: '#483D8B',
    tags: ['scholar', 'wise', 'learned']
  }
];

class CharacterPortraitService {
  private static instance: CharacterPortraitService;
  private readonly STORAGE_KEY = 'zimbomate_custom_portraits';
  private customPortraits: Portrait[] = [];

  private constructor() {
    this.loadCustomPortraits();
  }

  static getInstance(): CharacterPortraitService {
    if (!CharacterPortraitService.instance) {
      CharacterPortraitService.instance = new CharacterPortraitService();
    }
    return CharacterPortraitService.instance;
  }

  // Get all portraits
  getAllPortraits(): Portrait[] {
    return [...DEFAULT_PORTRAITS, ...this.customPortraits];
  }

  // Get portraits filtered by class/race
  getSuggestedPortraits(characterClass?: CharacterClass, race?: Race): Portrait[] {
    return this.getAllPortraits().filter(portrait => {
      if (characterClass && portrait.suggestedClasses && !portrait.suggestedClasses.includes(characterClass)) {
        return false;
      }
      if (race && portrait.suggestedRaces && !portrait.suggestedRaces.includes(race)) {
        return false;
      }
      return true;
    });
  }

  // Add custom portrait from file
  async addCustomPortrait(file: File, name: string, tags: string[] = []): Promise<Portrait> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (PNG, JPG, GIF, etc.)'));
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error('Image file is too large. Please select a file smaller than 5MB.'));
        return;
      }
      
      // Validate name
      if (!name || name.trim().length === 0) {
        reject(new Error('Please provide a name for the portrait.'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          if (!result) {
            reject(new Error('Failed to process image file.'));
            return;
          }
          
          const portrait: Portrait = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            emoji: '🖼️', // Custom portrait emoji
            color: '#696969',
            tags: ['custom', ...tags],
            customUrl: result // Store base64 data URL
          };
          
          this.customPortraits.push(portrait);
          this.saveCustomPortraits();
          resolve(portrait);
        } catch (error) {
          reject(new Error('Failed to create portrait from image file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file. Please try a different file.'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Remove custom portrait
  removeCustomPortrait(id: string): boolean {
    const index = this.customPortraits.findIndex(p => p.id === id);
    if (index !== -1) {
      this.customPortraits.splice(index, 1);
      this.saveCustomPortraits();
      return true;
    }
    return false;
  }

  private loadCustomPortraits(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.customPortraits = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading custom portraits:', error);
    }
  }

  private saveCustomPortraits(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.customPortraits));
    } catch (error) {
      console.error('Error saving custom portraits:', error);
    }
  }
}

export const portraitService = CharacterPortraitService.getInstance();