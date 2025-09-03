/**
 * Enhanced character template service with presets and custom templates
 */

import type { Alignment, Attributes, Character, CharacterClass, Race } from '../models/Character'
import type { Item } from '../models/Equipment'
import { characterValidationService } from './CharacterValidation'

export interface CharacterTemplate {
  id: string
  name: string
  description: string
  category: 'official' | 'community' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]

  // Character data
  characterClass: CharacterClass
  race: Race
  alignment: Alignment
  attributes: Attributes

  // Optional customizations
  suggestedName?: string
  suggestedLook?: string
  suggestedBackground?: string
  suggestedPersonality?: string[]
  suggestedVoice?: string

  // Equipment and moves
  startingEquipment: Item[]
  recommendedMoves?: string[]

  // Metadata
  author?: string
  version: string
  createdAt: Date
  updatedAt: Date

  // Build info
  buildNotes?: string
  playstyle: string[]
  strengths: string[]
  weaknesses: string[]

  // Validation
  isValid?: boolean
  validationNotes?: string[]
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templates: CharacterTemplate[]
}

export interface QuickStartTemplate {
  id: string
  name: string
  description: string
  icon: string
  characterClass: CharacterClass
  race: Race
  concept: string
  difficulty: 'beginner' | 'intermediate'
}

class CharacterTemplateService {
  /**
   * Get all available template categories
   */
  getTemplateCategories(): TemplateCategory[] {
    return [
      {
        id: 'beginner',
        name: 'Beginner Friendly',
        description: 'Simple, effective builds perfect for new players',
        icon: '🌟',
        templates: this.getBeginnerTemplates(),
      },
      {
        id: 'classic',
        name: 'Classic Archetypes',
        description: 'Traditional fantasy roles that everyone recognizes',
        icon: '⚔️',
        templates: this.getClassicTemplates(),
      },
      {
        id: 'specialized',
        name: 'Specialized Builds',
        description: 'Focused characters optimized for specific roles',
        icon: '🎯',
        templates: this.getSpecializedTemplates(),
      },
      {
        id: 'creative',
        name: 'Creative Concepts',
        description: 'Unique and interesting character concepts',
        icon: '🎨',
        templates: this.getCreativeTemplates(),
      },
      {
        id: 'custom',
        name: 'Custom Templates',
        description: 'Your saved character templates',
        icon: '💾',
        templates: this.getCustomTemplates(),
      },
    ]
  }

  /**
   * Get quick start templates for the intro screen
   */
  getQuickStartTemplates(): QuickStartTemplate[] {
    return [
      {
        id: 'warrior',
        name: 'Brave Warrior',
        description: 'A stalwart fighter who protects their allies',
        icon: '🛡️',
        characterClass: 'Fighter',
        race: 'Human',
        concept: 'Tank and damage dealer',
        difficulty: 'beginner',
      },
      {
        id: 'sneaky-thief',
        name: 'Sneaky Thief',
        description: 'A nimble rogue who strikes from the shadows',
        icon: '🗡️',
        characterClass: 'Thief',
        race: 'Halfling',
        concept: 'Stealth and utility',
        difficulty: 'beginner',
      },
      {
        id: 'wise-cleric',
        name: 'Wise Cleric',
        description: 'A divine healer who supports the party',
        icon: '✨',
        characterClass: 'Cleric',
        race: 'Human',
        concept: 'Healing and support',
        difficulty: 'intermediate',
      },
      {
        id: 'nature-ranger',
        name: 'Nature Ranger',
        description: 'A skilled tracker at home in the wilderness',
        icon: '🏹',
        characterClass: 'Ranger',
        race: 'Elf',
        concept: 'Ranged combat and tracking',
        difficulty: 'intermediate',
      },
    ]
  }

  /**
   * Create a character from a template
   */
  createCharacterFromTemplate(template: CharacterTemplate): Partial <Character> {
    return {
      name: template.suggestedName || this.generateNameForTemplate(template),
      class: template.characterClass,
      race: template.race,
      alignment: template.alignment,
      attributes: template.attributes,
      look: template.suggestedLook,
      background: template.suggestedBackground,
      personalityTraits: template.suggestedPersonality,
      voice: template.suggestedVoice,
      inventory: template.startingEquipment,
      knownMoves: template.recommendedMoves || [],
      level: 1,
      xp: 0,
      coin: this.calculateStartingCoin(template),
      notes: template.buildNotes || '',
    }
  }

  /**
   * Create a character from a quick start template
   */
  createCharacterFromQuickStart(quickStart: QuickStartTemplate): Partial <Character> {
    const fullTemplate = this.getTemplateByClassAndRace(quickStart.characterClass, quickStart.race)
    if (fullTemplate) {
      return this.createCharacterFromTemplate(fullTemplate)
    }

    // Fallback: create basic character
    return {
      name: this.generateNameForClass(quickStart.characterClass, quickStart.race),
      class: quickStart.characterClass,
      race: quickStart.race,
      alignment: this.getDefaultAlignment(quickStart.characterClass),
      attributes: this.getOptimalAttributes(quickStart.characterClass),
      inventory: this.getBasicStartingEquipment(quickStart.characterClass),
      level: 1,
      xp: 0,
    }
  }

  /**
   * Save a custom template
   */
  saveCustomTemplate(character: Partial <Character>, templateData: {
    name: string
    description: string
    buildNotes?: string
    playstyle: string[]
    tags: string[]
  }): CharacterTemplate {
    const template: CharacterTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name,
      description: templateData.description,
      category: 'custom',
      difficulty: 'intermediate',
      tags: templateData.tags,

      characterClass: character.class!,
      race: character.race!,
      alignment: character.alignment!,
      attributes: character.attributes!,

      suggestedName: character.name,
      suggestedLook: character.look,
      suggestedBackground: character.background,
      suggestedPersonality: character.personalityTraits,
      suggestedVoice: character.voice,

      startingEquipment: character.inventory || [],
      recommendedMoves: character.knownMoves,

      author: 'Player',
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date(),

      buildNotes: templateData.buildNotes,
      playstyle: templateData.playstyle,
      strengths: this.calculateStrengths(character),
      weaknesses: this.calculateWeaknesses(character),
    }

    // Validate template
    const validation = characterValidationService.validateCharacter(character)
    template.isValid = validation.isValid
    template.validationNotes = validation.errors.map(e => e.message)

    // Save to localStorage
    this.saveTemplateToStorage(template)

    return template
  }

  /**
   * Get beginner-friendly templates
   */
  private getBeginnerTemplates(): CharacterTemplate[] {
    return [
      {
        id: 'simple-fighter',
        name: 'Simple Fighter',
        description: 'A straightforward warrior perfect for learning the game',
        category: 'official',
        difficulty: 'beginner',
        tags: ['combat', 'tank', 'simple'],

        characterClass: 'Fighter',
        race: 'Human',
        alignment: 'Good',
        attributes: { STR: 16, DEX: 13, CON: 15, INT: 8, WIS: 12, CHA: 9 },

        suggestedName: 'Marcus',
        suggestedLook: 'A sturdy warrior with battle-worn armor and a determined expression',
        suggestedBackground: 'Former town guard who took up adventuring to protect the innocent',
        suggestedPersonality: ['Brave', 'Loyal', 'Straightforward'],

        startingEquipment: this.getBasicStartingEquipment('Fighter'),

        author: 'Dungeon World Team',
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),

        buildNotes: 'Focus on Strength and Constitution. Take Bend Bars, Lift Gates early.',
        playstyle: ['Front-line fighter', 'Damage dealer', 'Party protector'],
        strengths: ['High damage', 'Good armor', 'Simple to play'],
        weaknesses: ['Limited utility', 'Poor social skills'],

        isValid: true,
      },
      {
        id: 'helpful-cleric',
        name: 'Helpful Cleric',
        description: 'A supportive healer who keeps the party alive',
        category: 'official',
        difficulty: 'beginner',
        tags: ['healing', 'support', 'divine'],

        characterClass: 'Cleric',
        race: 'Human',
        alignment: 'Good',
        attributes: { STR: 12, DEX: 9, CON: 13, INT: 8, WIS: 16, CHA: 15 },

        suggestedName: 'Sister Mara',
        suggestedLook: 'Kind eyes and gentle hands, wearing simple robes with a holy symbol',
        suggestedBackground: 'Devoted to healing and helping others in need',
        suggestedPersonality: ['Compassionate', 'Wise', 'Patient'],

        startingEquipment: this.getBasicStartingEquipment('Cleric'),

        author: 'Dungeon World Team',
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),

        buildNotes: 'Prioritize Wisdom for spells. Take healing and support spells.',
        playstyle: ['Healer', 'Support caster', 'Divine magic'],
        strengths: ['Healing magic', 'Divine protection', 'Party support'],
        weaknesses: ['Limited combat ability', 'Spell dependency'],

        isValid: true,
      },
    ]
  }

  /**
   * Get classic archetype templates
   */
  private getClassicTemplates(): CharacterTemplate[] {
    return [
      {
        id: 'knight-paladin',
        name: 'Noble Knight',
        description: 'A righteous paladin devoted to justice and protection',
        category: 'official',
        difficulty: 'intermediate',
        tags: ['paladin', 'tank', 'divine', 'lawful'],

        characterClass: 'Paladin',
        race: 'Human',
        alignment: 'Lawful',
        attributes: { STR: 16, DEX: 9, CON: 15, INT: 12, WIS: 13, CHA: 8 },

        suggestedName: 'Sir Gareth',
        suggestedLook: 'Shining armor, noble bearing, and an unwavering gaze',
        suggestedBackground: 'Sworn to uphold justice and protect the innocent',
        suggestedPersonality: ['Honorable', 'Dutiful', 'Righteous'],

        startingEquipment: this.getBasicStartingEquipment('Paladin'),

        author: 'Community',
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),

        buildNotes: 'Balance STR and WIS. Focus on protection and healing spells.',
        playstyle: ['Tank', 'Healer', 'Divine warrior'],
        strengths: ['Heavy armor', 'Healing', 'Divine magic'],
        weaknesses: ['Alignment restrictions', 'Limited flexibility'],

        isValid: true,
      },
    ]
  }

  /**
   * Get specialized build templates
   */
  private getSpecializedTemplates(): CharacterTemplate[] {
    return [
      {
        id: 'archer-ranger',
        name: 'Master Archer',
        description: 'A ranger specialized in ranged combat and precision',
        category: 'official',
        difficulty: 'intermediate',
        tags: ['ranger', 'archer', 'dex', 'ranged'],

        characterClass: 'Ranger',
        race: 'Elf',
        alignment: 'Good',
        attributes: { STR: 9, DEX: 16, CON: 13, INT: 12, WIS: 15, CHA: 8 },

        suggestedName: 'Lyralei',
        suggestedLook: 'Keen eyes, steady hands, and a well-maintained bow',
        suggestedBackground: 'Guardian of the forest, protector of nature',
        suggestedPersonality: ['Observant', 'Patient', 'Independent'],

        startingEquipment: this.getArcherEquipment(),

        author: 'Community',
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),

        buildNotes: 'Maximize DEX for accuracy. Take Called Shot and other archery moves.',
        playstyle: ['Ranged damage', 'Tracking', 'Nature magic'],
        strengths: ['High accuracy', 'Good damage', 'Utility spells'],
        weaknesses: ['Fragile in melee', 'Ammo dependency'],

        isValid: true,
      },
    ]
  }

  /**
   * Get creative concept templates
   */
  private getCreativeTemplates(): CharacterTemplate[] {
    return [
      {
        id: 'scholar-wizard',
        name: 'Scholarly Wizard',
        description: 'A bookish mage who solves problems with knowledge and magic',
        category: 'community',
        difficulty: 'advanced',
        tags: ['wizard', 'scholar', 'utility', 'intelligence'],

        characterClass: 'Wizard',
        race: 'Human',
        alignment: 'Neutral',
        attributes: { STR: 8, DEX: 12, CON: 9, INT: 16, WIS: 13, CHA: 15 },

        suggestedName: 'Erasmus',
        suggestedLook: 'Ink-stained fingers, thick spectacles, and robes covered in pockets',
        suggestedBackground: 'Former university professor turned adventuring scholar',
        suggestedPersonality: ['Curious', 'Analytical', 'Absent-minded'],

        startingEquipment: this.getScholarEquipment(),

        author: 'Community',
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),

        buildNotes: 'Focus on utility spells and knowledge. Avoid direct combat.',
        playstyle: ['Problem solver', 'Utility caster', 'Knowledge expert'],
        strengths: ['Versatile magic', 'High intelligence', 'Utility'],
        weaknesses: ['Very fragile', 'Limited combat', 'Spell dependency'],

        isValid: true,
      },
    ]
  }

  /**
   * Get custom templates from storage
   */
  private getCustomTemplates(): CharacterTemplate[] {
    try {
      const stored = localStorage.getItem('zimbomate_custom_templates')
      return stored ? JSON.parse(stored) : []
    }
    catch {
      return []
    }
  }

  /**
   * Save template to localStorage
   */
  private saveTemplateToStorage(template: CharacterTemplate): void {
    try {
      const existing = this.getCustomTemplates()
      const updated = [...existing.filter(t => t.id !== template.id), template]
      localStorage.setItem('zimbomate_custom_templates', JSON.stringify(updated))
    }
    catch {
    }
  }

  /**
   * Get template by class and race combination
   */
  private getTemplateByClassAndRace(characterClass: CharacterClass, race: Race): CharacterTemplate | null {
    const allTemplates = [
      ...this.getBeginnerTemplates(),
      ...this.getClassicTemplates(),
      ...this.getSpecializedTemplates(),
      ...this.getCreativeTemplates(),
    ]

    return allTemplates.find(t => t.characterClass === characterClass && t.race === race) || null
  }

  /**
   * Generate appropriate name for template
   */
  private generateNameForTemplate(template: CharacterTemplate): string {
    return template.suggestedName || this.generateNameForClass(template.characterClass, template.race)
  }

  /**
   * Generate name based on class and race
   */
  private generateNameForClass(characterClass: CharacterClass, race: Race): string {
    const names: Record <string, string[]> = {
      Fighter: ['Marcus', 'Gareth', 'Thora', 'Bjorn'],
      Thief: ['Raven', 'Sly', 'Whisper', 'Shadow'],
      Cleric: ['Mara', 'Benedict', 'Seraphina', 'Aldric'],
      Wizard: ['Erasmus', 'Morgana', 'Zephyr', 'Sage'],
      Ranger: ['Lyralei', 'Strider', 'Willow', 'Hunter'],
      Paladin: ['Gareth', 'Celestine', 'Righteous', 'Dawn'],
      Bard: ['Melody', 'Verse', 'Harmony', 'Ballad'],
      Druid: ['Oakenheart', 'Moonwhisper', 'Thornwick', 'Sage'],
      Barbarian: ['Grok', 'Thunderfist', 'Wildmane', 'Rage'],
      Immolator: ['Blaze', 'Ember', 'Inferno', 'Ash'],
    }

    const classNames = names[characterClass] || ['Hero']
    return classNames[Math.floor(Math.random() * classNames.length)]
  }

  /**
   * Get default alignment for class
   */
  private getDefaultAlignment(characterClass: CharacterClass): Alignment {
    const defaults: Record <CharacterClass, Alignment> = {
      Fighter: 'Good',
      Paladin: 'Lawful',
      Ranger: 'Good',
      Thief: 'Chaotic',
      Bard: 'Chaotic',
      Cleric: 'Good',
      Druid: 'Neutral',
      Wizard: 'Neutral',
      Barbarian: 'Chaotic',
      Immolator: 'Neutral',
    }

    return defaults[characterClass] || 'Neutral'
  }

  /**
   * Get optimal attributes for class
   */
  private getOptimalAttributes(characterClass: CharacterClass): Attributes {
    const optimal: Record <CharacterClass, Attributes> = {
      Fighter: { STR: 16, DEX: 13, CON: 15, INT: 8, WIS: 12, CHA: 9 },
      Paladin: { STR: 16, DEX: 9, CON: 15, INT: 12, WIS: 13, CHA: 8 },
      Ranger: { STR: 12, DEX: 16, CON: 13, INT: 9, WIS: 15, CHA: 8 },
      Thief: { STR: 9, DEX: 16, CON: 12, INT: 15, WIS: 13, CHA: 8 },
      Bard: { STR: 8, DEX: 13, CON: 12, INT: 15, WIS: 9, CHA: 16 },
      Cleric: { STR: 12, DEX: 9, CON: 13, INT: 8, WIS: 16, CHA: 15 },
      Druid: { STR: 8, DEX: 13, CON: 15, INT: 12, WIS: 16, CHA: 9 },
      Wizard: { STR: 8, DEX: 12, CON: 9, INT: 16, WIS: 13, CHA: 15 },
      Barbarian: { STR: 16, DEX: 12, CON: 15, INT: 8, WIS: 13, CHA: 9 },
      Immolator: { STR: 12, DEX: 13, CON: 16, INT: 15, WIS: 9, CHA: 8 },
    }

    return optimal[characterClass] || { STR: 13, DEX: 13, CON: 13, INT: 13, WIS: 13, CHA: 13 }
  }

  /**
   * Get basic starting equipment for class
   */
  private getBasicStartingEquipment(characterClass: CharacterClass): Item[] {
    // This would return appropriate starting equipment based on class
    // For now, returning empty array-would be populated with actual equipment data
    return []
  }

  /**
   * Get specialized archer equipment
   */
  private getArcherEquipment(): Item[] {
    // Specialized equipment for archer build
    return []
  }

  /**
   * Get scholar equipment
   */
  private getScholarEquipment(): Item[] {
    // Books, scrolls, writing materials, etc.
    return []
  }

  /**
   * Calculate starting coin for template
   */
  private calculateStartingCoin(template: CharacterTemplate): number {
    // Base coin varies by class and background
    const baseCoin: Record <CharacterClass, number> = {
      Fighter: 20,
      Paladin: 15,
      Ranger: 10,
      Thief: 25,
      Bard: 20,
      Cleric: 15,
      Druid: 5,
      Wizard: 10,
      Barbarian: 15,
      Immolator: 10,
    }

    return baseCoin[template.characterClass] || 15
  }

  /**
   * Calculate character strengths
   */
  private calculateStrengths(character: Partial <Character>): string[] {
    const strengths: string[] = []

    if (!character.attributes || !character.class)
      return strengths

    const attrs = character.attributes

    // High attribute bonuses
    if (attrs.STR >= 16)
      strengths.push('High Strength')
    if (attrs.DEX >= 16)
      strengths.push('High Dexterity')
    if (attrs.CON >= 16)
      strengths.push('High Constitution')
    if (attrs.INT >= 16)
      strengths.push('High Intelligence')
    if (attrs.WIS >= 16)
      strengths.push('High Wisdom')
    if (attrs.CHA >= 16)
      strengths.push('High Charisma')

    // Class-specific strengths
    const classStrengths: Record <CharacterClass, string[]> = {
      Fighter: ['Combat prowess', 'Heavy armor'],
      Paladin: ['Divine magic', 'Healing'],
      Ranger: ['Tracking', 'Nature magic'],
      Thief: ['Stealth', 'Utility'],
      Bard: ['Social skills', 'Versatility'],
      Cleric: ['Healing magic', 'Divine protection'],
      Druid: ['Shapeshifting', 'Nature magic'],
      Wizard: ['Powerful magic', 'Utility spells'],
      Barbarian: ['High damage', 'Rage'],
      Immolator: ['Fire magic', 'Damage'],
    }

    strengths.push(...(classStrengths[character.class] || []))

    return strengths
  }

  /**
   * Calculate character weaknesses
   */
  private calculateWeaknesses(character: Partial <Character>): string[] {
    const weaknesses: string[] = []

    if (!character.attributes || !character.class)
      return weaknesses

    const attrs = character.attributes

    // Low attribute penalties
    if (attrs.STR <= 8)
      weaknesses.push('Low Strength')
    if (attrs.DEX <= 8)
      weaknesses.push('Low Dexterity')
    if (attrs.CON <= 8)
      weaknesses.push('Low Constitution')
    if (attrs.INT <= 8)
      weaknesses.push('Low Intelligence')
    if (attrs.WIS <= 8)
      weaknesses.push('Low Wisdom')
    if (attrs.CHA <= 8)
      weaknesses.push('Low Charisma')

    // Class-specific weaknesses
    const classWeaknesses: Record <CharacterClass, string[]> = {
      Fighter: ['Limited utility', 'Poor social skills'],
      Paladin: ['Alignment restrictions'],
      Ranger: ['Limited armor'],
      Thief: ['Low HP', 'Poor armor'],
      Bard: ['Jack of all trades'],
      Cleric: ['Spell dependency'],
      Druid: ['No metal equipment'],
      Wizard: ['Very fragile', 'Spell dependency'],
      Barbarian: ['Poor social skills', 'Limited utility'],
      Immolator: ['Self-damage risk'],
    }

    weaknesses.push(...(classWeaknesses[character.class] || []))

    return weaknesses
  }

  /**
   * Delete a custom template
   */
  deleteCustomTemplate(templateId: string): void {
    try {
      const existing = this.getCustomTemplates()
      const updated = existing.filter(t => t.id !== templateId)
      localStorage.setItem('zimbomate_custom_templates', JSON.stringify(updated))
    }
    catch {
    }
  }

  /**
   * Search templates by criteria
   */
  searchTemplates(query: string, filters: {
    category?: string
    difficulty?: string
    characterClass?: CharacterClass
    tags?: string[]
  } = {}): CharacterTemplate[] {
    const allCategories = this.getTemplateCategories()
    const allTemplates = allCategories.flatMap(cat => cat.templates)

    return allTemplates.filter((template) => {
      // Text search
      const matchesQuery = !query
        || template.name.toLowerCase().includes(query.toLowerCase())
        || template.description.toLowerCase().includes(query.toLowerCase())
        || template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

      // Category filter
      const matchesCategory = !filters.category || template.category === filters.category

      // Difficulty filter
      const matchesDifficulty = !filters.difficulty || template.difficulty === filters.difficulty

      // Class filter
      const matchesClass = !filters.characterClass || template.characterClass === filters.characterClass

      // Tags filter
      const matchesTags = !filters.tags?.length
        || filters.tags.some(tag => template.tags.includes(tag))

      return matchesQuery && matchesCategory && matchesDifficulty && matchesClass && matchesTags
    })
  }
}

export const characterTemplateService = new CharacterTemplateService()
