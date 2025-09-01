import { Character, CharacterClass, Race, Alignment } from '../models/Character';
import { Item } from '../models/Equipment';
import { Bond } from '../models/Character';

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quick-start' | 'custom' | 'shared';
  characterData: Partial < Character>;
  selectedEquipment?: (Partial < Item> | Partial < unknown>)[];
  selectedMoves?: string[];
  bonds?: Partial < Bond>[];
  equipmentChoices?: Record < number, number>;
  personalityTraits?: string[];
  knownSpells?: string[];
  preparedSpells?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickStartTemplate extends CharacterTemplate {
  category: 'quick-start';
  icon?: string;
}

// Pre-made Quick Start Templates
export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: 'noble-knight',
    name: 'Noble Knight',
    description: 'A righteous warrior sworn to protect the innocent',
    category: 'quick-start',
    icon: '⚔️',
    characterData: {
      name: 'Sir Galahad',
      look: 'Shining armor, noble bearing, determined eyes',
      background: 'Born to nobility, trained from childhood in the arts of war and chivalry. Sworn to uphold justice and protect the innocent.',
      class: 'Paladin' as CharacterClass,
      race: 'Human' as Race,
      alignment: 'Lawful' as Alignment,
      coin: 10,
      attributes: {
        STR: 16,
        DEX: 9,
        CON: 13,
        INT: 12,
        WIS: 15,
        CHA: 8,
      },
    },
    selectedMoves: ['Lay on Hands', 'Armored', 'Quest'],
    selectedEquipment: [
      { name: 'Plate Mail', armor: 3, weight: 4 },
      { name: 'Longsword', damage: 'd8', weight: 2, tags: ['close', 'versatile'] },
      { name: 'Shield', armor: 1, weight: 2 },
      { name: 'Adventuring Gear', weight: 1 },
      { name: 'Dungeon Rations', uses: 5, weight: 1 },
      { name: 'Healing Potion', weight: 0 },
    ],
    equipmentChoices: { 0: 0 }, // First weapon choice
    personalityTraits: ['Honorable', 'Protective', 'Righteous'],
    bonds: [
      { text: '___ has stood by me in battle and can be trusted completely.' },
      { text: 'I have sworn to protect ___ from harm.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sneaky-rogue',
    name: 'Sneaky Rogue',
    description: 'A cunning thief who strikes from the shadows',
    category: 'quick-start',
    icon: '🗡️',
    characterData: {
      name: 'Shadow',
      look: 'Dark cloak, quick fingers, darting eyes',
      class: 'Thief' as CharacterClass,
      race: 'Halfling' as Race,
      alignment: 'Chaotic' as Alignment,
      attributes: {
        STR: 9,
        DEX: 16,
        CON: 12,
        INT: 13,
        WIS: 8,
        CHA: 15,
      },
    },
    selectedMoves: ['Trap Expert', 'Flexible Morals', 'Backstab'],
    bonds: [
      { text: '___ and I pulled off a job together.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'wise-sage',
    name: 'Wise Sage',
    description: 'A learned scholar wielding ancient magic',
    category: 'quick-start',
    icon: '🔮',
    characterData: {
      name: 'Elminster',
      look: 'Long robes, ancient staff, knowing smile',
      class: 'Wizard' as CharacterClass,
      race: 'Elf' as Race,
      alignment: 'Neutral' as Alignment,
      attributes: {
        STR: 8,
        DEX: 12,
        CON: 9,
        INT: 16,
        WIS: 15,
        CHA: 13,
      },
    },
    selectedMoves: ['Spellbook', 'Cast a Spell', 'Ritual'],
    bonds: [
      { text: '___ will play an important role in the events to come. I have foreseen it!' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'savage-warrior',
    name: 'Savage Warrior',
    description: 'A fierce barbarian from the frozen north',
    category: 'quick-start',
    icon: '🪓',
    characterData: {
      name: 'Grond',
      look: 'Massive frame, scarred skin, wild hair',
      class: 'Barbarian' as CharacterClass,
      race: 'Human' as Race,
      alignment: 'Chaotic' as Alignment,
      attributes: {
        STR: 16,
        DEX: 13,
        CON: 15,
        INT: 8,
        WIS: 9,
        CHA: 12,
      },
    },
    selectedMoves: ['Herculean Appetites', 'The Upper Hand', 'What Are You Waiting For?'],
    bonds: [
      { text: '___ shares my hunger for glory; the earth will tremble at our deeds!' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'devout-healer',
    name: 'Devout Healer',
    description: 'A faithful servant of the divine',
    category: 'quick-start',
    icon: '✨',
    characterData: {
      name: 'Brother Marcus',
      look: 'Simple robes, holy symbol, kind eyes',
      class: 'Cleric' as CharacterClass,
      race: 'Dwarf' as Race,
      alignment: 'Good' as Alignment,
      attributes: {
        STR: 12,
        DEX: 8,
        CON: 13,
        INT: 9,
        WIS: 16,
        CHA: 15,
      },
    },
    selectedMoves: ['Deity', 'Divine Guidance', 'Turn Undead', 'Cast a Spell'],
    bonds: [
      { text: '___ is a good and faithful person; I trust them implicitly.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'forest-guardian',
    name: 'Forest Guardian',
    description: 'A protector of nature and its creatures',
    category: 'quick-start',
    icon: '🌿',
    characterData: {
      name: 'Willow',
      look: 'Weathered features, natural clothing, animal companion',
      class: 'Ranger' as CharacterClass,
      race: 'Elf' as Race,
      alignment: 'Neutral' as Alignment,
      attributes: {
        STR: 13,
        DEX: 15,
        CON: 12,
        INT: 9,
        WIS: 16,
        CHA: 8,
      },
    },
    selectedMoves: ['Hunt and Track', 'Called Shot', 'Animal Companion'],
    bonds: [
      { text: '___ is a friend of nature, so I will be their friend as well.' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class CharacterTemplateService {
  private static instance: CharacterTemplateService;
  private readonly STORAGE_KEY = 'zimbomate_character_templates';

  private constructor() {}

  static getInstance(): CharacterTemplateService {
    if (!CharacterTemplateService.instance) {
      CharacterTemplateService.instance = new CharacterTemplateService();
    }
    return CharacterTemplateService.instance;
  }

  // Get all templates (quick-start + custom)
  getAllTemplates(): CharacterTemplate[] {
    const customTemplates = this.getCustomTemplates();
    return [...QUICK_START_TEMPLATES, ...customTemplates];
  }

  // Get only custom templates
  getCustomTemplates(): CharacterTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const templates = JSON.parse(stored);
      // Convert date strings back to Date objects
      return templates.map((t: unknown) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
    } catch (error) {
      return [];
    }
  }

  // Save a new custom template
  saveTemplate(template: Omit < CharacterTemplate, 'id' | 'createdAt' | 'updatedAt'>): CharacterTemplate {
    const newTemplate: CharacterTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const templates = this.getCustomTemplates();
    templates.push(newTemplate);
    this.saveToStorage(templates);

    return newTemplate;
  }

  // Update an existing template
  updateTemplate(id: string, updates: Partial < CharacterTemplate>): CharacterTemplate | null {
    const templates = this.getCustomTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) return null;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveToStorage(templates);
    return templates[index];
  }

  // Delete a template
  deleteTemplate(id: string): boolean {
    const templates = this.getCustomTemplates();
    const filtered = templates.filter(t => t.id !== id);

    if (filtered.length === templates.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  // Export template to JSON
  exportTemplate(template: CharacterTemplate): string {
    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import template from JSON
  importTemplate(jsonString: string): CharacterTemplate {
    try {
      const imported = JSON.parse(jsonString);

      // Validate required fields
      if (!imported.name || typeof imported.name !== 'string') {
        throw new Error('Template must have a valid name');
      }

      if (!imported.characterData || typeof imported.characterData !== 'object') {
        throw new Error('Template must contain character data');
      }

      // Validate character data has minimum required fields
      const charData = imported.characterData;
      if (!charData.class || !charData.race) {
        throw new Error('Template character data must include class and race');
      }

      // Validate arrays if present
      if (imported.selectedEquipment && !Array.isArray(imported.selectedEquipment)) {
        throw new Error('Selected equipment must be an array');
      }

      if (imported.selectedMoves && !Array.isArray(imported.selectedMoves)) {
        throw new Error('Selected moves must be an array');
      }

      if (imported.bonds && !Array.isArray(imported.bonds)) {
        throw new Error('Bonds must be an array');
      }

      // Create new template with imported data
      return this.saveTemplate({
        name: imported.name.trim(),
        description: imported.description || '',
        category: 'custom',
        characterData: imported.characterData,
        selectedEquipment: imported.selectedEquipment || [],
        selectedMoves: imported.selectedMoves || [],
        bonds: imported.bonds || [],
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check the file and try again.');
      }
      throw new Error(`Failed to import template: ${(error as Error).message}`);
    }
  }

  // Download template as file
  downloadTemplate(template: CharacterTemplate): void {
    const json = this.exportTemplate(template);
    const blob = new Blob([json], { type: 'application / json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private saveToStorage(templates: CharacterTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      }
  }
}

export const characterTemplateService = CharacterTemplateService.getInstance();
