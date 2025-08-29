/**
 * Advanced character level progression and advancement service
 */

import { Character, CharacterClass, Attributes } from '../models/Character';

export interface LevelProgression {
  level: number;
  xp: number;
  totalAdvancementPoints: number;
  attributeAdvancementPoints: number;
  moveAdvancementPoints: number;
  baseHP: number;
  spellSlots?: SpellSlots;
  startingCoin: number;
  equipmentTier: 'basic' | 'improved' | 'superior' | 'masterwork';
}

export interface SpellSlots {
  cantrips: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface AdvancementChoice {
  id: string;
  type: 'attribute' | 'move' | 'multiclass' | 'spell' | 'special';
  level: number;
  name: string;
  description: string;
  prerequisites?: string[];
  mutuallyExclusive?: string[];
  classRestriction?: CharacterClass[];
}

export interface AttributeAdvancement extends AdvancementChoice {
  type: 'attribute';
  attribute: keyof Attributes;
  bonus: number;
}

export interface MoveAdvancement extends AdvancementChoice {
  type: 'move';
  moveId: string;
  sourceClass: CharacterClass;
  isMulticlass: boolean;
  replaces?: string[];
}

export interface SpellAdvancement extends AdvancementChoice {
  type: 'spell';
  spellLevel: number;
  spellSchool?: string;
  isCantrip: boolean;
  isPrepared?: boolean;
}

export interface AdvancementPlan {
  targetLevel: number;
  selectedAdvancements: AdvancementChoice[];
  remainingChoices: number;
  isValid: boolean;
  validationErrors: string[];
  suggestions: string[];
}

class AdvancementService {
  
  /**
   * Get level progression data for a specific level
   */
  getLevelProgression(level: number, characterClass: CharacterClass): LevelProgression {
    // XP requirements for each level (Dungeon World standard)
    const xpRequirements = [0, 0, 7, 15, 24, 34, 45, 57, 70, 84, 99];
    
    // In Dungeon World, you get 1 advancement choice per level after 1st
    // You can choose: new move, multiclass move, OR +1 to any ability score
    const totalAdvancementPoints = Math.max(0, level - 1);
    
    // In DW, there's no separate limit on attribute vs move advancements
    // You can choose to improve attributes every level if you want
    // The only limit is the total number of advancement choices
    const attributeAdvancementPoints = totalAdvancementPoints; // Can use all for attributes
    const moveAdvancementPoints = totalAdvancementPoints; // Can use all for moves
    
    return {
      level,
      xp: level <= 10 ? xpRequirements[level] : 99 + (level - 10) * 15,
      totalAdvancementPoints,
      attributeAdvancementPoints,
      moveAdvancementPoints,
      baseHP: this.calculateBaseHP(level, characterClass),
      spellSlots: this.calculateSpellSlots(level, characterClass),
      startingCoin: this.calculateStartingCoin(level),
      equipmentTier: this.getEquipmentTier(level)
    };
  }

  /**
   * Get all available advancement choices for a character at a specific level
   */
  getAvailableAdvancements(
    character: Partial<Character>, 
    targetLevel: number,
    selectedAdvancements: AdvancementChoice[] = []
  ): AdvancementChoice[] {
    const choices: AdvancementChoice[] = [];
    
    if (!character.class) return choices;

    // Add attribute advancement choices (with current attributes to check caps)
    choices.push(...this.getAttributeAdvancements(targetLevel, character.attributes, selectedAdvancements));
    
    // Add move advancement choices
    choices.push(...this.getMoveAdvancements(character.class, targetLevel, character.knownMoves || []));
    
    // Add multiclass choices if eligible
    if (targetLevel >= 2) {
      choices.push(...this.getMulticlassAdvancements(character.class, targetLevel));
    }
    
    // Add spell choices for casters
    if (this.isSpellcaster(character.class)) {
      choices.push(...this.getSpellAdvancements(character.class, targetLevel));
    }
    
    return choices;
  }

  /**
   * Create an advancement plan for reaching a target level
   */
  createAdvancementPlan(
    character: Partial<Character>,
    targetLevel: number,
    selectedAdvancements: AdvancementChoice[] = []
  ): AdvancementPlan {
    const currentLevel = character.level || 1;
    const progression = this.getLevelProgression(targetLevel, character.class!);
    
    const plan: AdvancementPlan = {
      targetLevel,
      selectedAdvancements: [...selectedAdvancements],
      remainingChoices: progression.totalAdvancementPoints - selectedAdvancements.length,
      isValid: true,
      validationErrors: [],
      suggestions: []
    };

    // Validate the plan
    this.validateAdvancementPlan(plan, character);
    
    // Recalculate remaining choices after validation to account for constraints
    const attributeAdvancements = selectedAdvancements.filter(adv => adv.type === 'attribute');
    const moveAdvancements = selectedAdvancements.filter(adv => adv.type === 'move');
    
    const maxAttributeChoices = Math.min(progression.attributeAdvancementPoints, progression.totalAdvancementPoints);
    const maxMoveChoices = Math.min(progression.moveAdvancementPoints, progression.totalAdvancementPoints - attributeAdvancements.length);
    
    const usedChoices = attributeAdvancements.length + moveAdvancements.length;
    plan.remainingChoices = Math.max(0, progression.totalAdvancementPoints - usedChoices);
    
    // Add suggestions if needed and plan is valid
    if (plan.remainingChoices > 0 && plan.isValid) {
      const remaining = plan.remainingChoices;
      if (remaining === 1) {
        plan.suggestions.push(`You have 1 more improvement to choose.`);
      } else {
        plan.suggestions.push(`You have ${remaining} more improvements to choose.`);
      }
    }

    return plan;
  }

  /**
   * Apply advancement plan to character
   */
  applyAdvancementPlan(character: Partial<Character>, plan: AdvancementPlan): Partial<Character> {
    if (!plan.isValid) {
      throw new Error('Cannot apply invalid advancement plan');
    }

    const progression = this.getLevelProgression(plan.targetLevel, character.class!);
    const updatedCharacter: Partial<Character> = { ...character };

    // Update basic progression
    updatedCharacter.level = plan.targetLevel;
    updatedCharacter.xp = progression.xp;
    
    // Apply attribute advancements
    const attributeAdvancements = plan.selectedAdvancements.filter(
      (adv): adv is AttributeAdvancement => adv.type === 'attribute'
    );
    
    if (attributeAdvancements.length > 0) {
      updatedCharacter.attributes = { ...character.attributes } as Attributes;
      attributeAdvancements.forEach(adv => {
        if (updatedCharacter.attributes) {
          updatedCharacter.attributes[adv.attribute] += adv.bonus;
        }
      });
    }

    // Apply move advancements
    const moveAdvancements = plan.selectedAdvancements.filter(
      (adv): adv is MoveAdvancement => adv.type === 'move'
    );
    
    if (moveAdvancements.length > 0) {
      const newMoves = [...(character.knownMoves || [])];
      moveAdvancements.forEach(adv => {
        if (!newMoves.includes(adv.moveId)) {
          newMoves.push(adv.moveId);
        }
      });
      updatedCharacter.knownMoves = newMoves;
    }

    // Update HP based on level and CON
    if (updatedCharacter.attributes) {
      const conModifier = Math.floor((updatedCharacter.attributes.CON - 10) / 2);
      const maxHP = progression.baseHP + conModifier;
      updatedCharacter.hp = {
        current: maxHP,
        max: maxHP
      };
    }

    // Update starting resources
    updatedCharacter.coin = (updatedCharacter.coin || 0) + progression.startingCoin;

    return updatedCharacter;
  }

  /**
   * Get suggested advancement builds for a class/level combination
   */
  getSuggestedBuilds(characterClass: CharacterClass, level: number): AdvancementPlan[] {
    const builds: AdvancementPlan[] = [];
    
    // Create different build archetypes
    const archetypes = this.getClassArchetypes(characterClass);
    
    archetypes.forEach(archetype => {
      const plan = this.generateArchetypeBuild(characterClass, level, archetype);
      if (plan) {
        builds.push(plan);
      }
    });

    return builds;
  }

  /**
   * Calculate base HP for class and level
   */
  private calculateBaseHP(level: number, characterClass: CharacterClass): number {
    const baseHP: Record<CharacterClass, number> = {
      'Barbarian': 8, 'Fighter': 10, 'Paladin': 10,
      'Ranger': 8, 'Cleric': 8, 'Druid': 6,
      'Thief': 6, 'Bard': 6, 'Wizard': 4, 'Immolator': 4
    };

    const classBase = baseHP[characterClass] || 6;
    
    // Additional HP per level (simplified - normally rolled)
    const hpPerLevel = Math.floor(classBase / 2) + 1;
    
    return classBase + (hpPerLevel * (level - 1));
  }

  /**
   * Calculate spell slots for caster classes
   */
  private calculateSpellSlots(level: number, characterClass: CharacterClass): SpellSlots | undefined {
    if (!this.isSpellcaster(characterClass)) {
      return undefined;
    }

    // Simplified spell progression - would be more complex in full implementation
    const baseSlots: SpellSlots = {
      cantrips: 0, level1: 0, level2: 0, level3: 0, level4: 0,
      level5: 0, level6: 0, level7: 0, level8: 0, level9: 0
    };

    if (characterClass === 'Wizard') {
      baseSlots.cantrips = Math.min(4, Math.floor(level / 2) + 1);
      baseSlots.level1 = Math.min(4, level);
      if (level >= 3) baseSlots.level2 = Math.min(3, level - 2);
      if (level >= 5) baseSlots.level3 = Math.min(3, level - 4);
      if (level >= 7) baseSlots.level4 = Math.min(2, level - 6);
      if (level >= 9) baseSlots.level5 = Math.min(2, level - 8);
    } else if (['Cleric', 'Druid'].includes(characterClass)) {
      baseSlots.level1 = Math.min(3, Math.floor(level / 2) + 1);
      if (level >= 3) baseSlots.level2 = Math.min(2, Math.floor((level - 1) / 2));
      if (level >= 5) baseSlots.level3 = Math.min(2, Math.floor((level - 3) / 2));
      if (level >= 7) baseSlots.level4 = Math.min(1, Math.floor((level - 5) / 2));
      if (level >= 9) baseSlots.level5 = Math.min(1, Math.floor((level - 7) / 2));
    }

    return baseSlots;
  }

  /**
   * Calculate starting coin for level
   */
  private calculateStartingCoin(level: number): number {
    // Base coin increases with level
    const baseCoin = [0, 0, 50, 100, 200, 350, 550, 800, 1100, 1450, 1850];
    return baseCoin[Math.min(level, 10)] || 1850 + (level - 10) * 400;
  }

  /**
   * Get equipment tier for level
   */
  private getEquipmentTier(level: number): 'basic' | 'improved' | 'superior' | 'masterwork' {
    if (level <= 2) return 'basic';
    if (level <= 4) return 'improved';
    if (level <= 7) return 'superior';
    return 'masterwork';
  }

  /**
   * Get attribute advancement choices
   */
  private getAttributeAdvancements(
    level: number, 
    currentAttributes?: Attributes,
    selectedAdvancements: AdvancementChoice[] = []
  ): AttributeAdvancement[] {
    const attributes: (keyof Attributes)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const choices: AttributeAdvancement[] = [];
    
    // Calculate how many times each attribute has been selected
    const attributeSelections = selectedAdvancements
      .filter((adv): adv is AttributeAdvancement => adv.type === 'attribute')
      .reduce((acc, adv) => {
        acc[adv.attribute] = (acc[adv.attribute] || 0) + 1;
        return acc;
      }, {} as Record<keyof Attributes, number>);
    
    attributes.forEach(attr => {
      const baseValue = currentAttributes?.[attr] || 10;
      const selectedCount = attributeSelections[attr] || 0;
      const currentValue = baseValue + selectedCount;
      
      // Only offer the attribute if it's not at the cap (18)
      if (currentValue < 18) {
        // Create a unique ID for each potential selection
        const selectionNumber = selectedCount + 1;
        choices.push({
          id: `attr-${attr.toLowerCase()}-${selectionNumber}`,
          type: 'attribute' as const,
          level,
          name: `Increase ${attr}`,
          description: `Increase your ${attr} by 1 (${currentValue} → ${currentValue + 1}, maximum 18)`,
          attribute: attr,
          bonus: 1
        });
      }
    });
    
    return choices;
  }

  /**
   * Get move advancement choices for a class
   */
  private getMoveAdvancements(
    characterClass: CharacterClass, 
    level: number, 
    knownMoves: string[]
  ): MoveAdvancement[] {
    // This would pull from actual move data - simplified for now
    const classMoves = this.getClassMoves(characterClass, level);
    
    return classMoves
      .filter(move => !knownMoves.includes(move.id))
      .map(move => ({
        id: `move-${move.id}`,
        type: 'move' as const,
        level,
        name: move.name,
        description: move.description,
        moveId: move.id,
        sourceClass: characterClass,
        isMulticlass: false,
        prerequisites: move.prerequisites
      }));
  }

  /**
   * Get multiclass advancement choices
   */
  private getMulticlassAdvancements(characterClass: CharacterClass, level: number): MoveAdvancement[] {
    const otherClasses = this.getMulticlassOptions(characterClass);
    const multiclassMoves: MoveAdvancement[] = [];

    otherClasses.forEach(otherClass => {
      const moves = this.getClassMoves(otherClass, Math.min(level, 6)); // Multiclass moves capped
      moves.forEach(move => {
        multiclassMoves.push({
          id: `multiclass-${otherClass}-${move.id}`,
          type: 'move',
          level,
          name: `${move.name} (${otherClass})`,
          description: `${move.description} [Multiclass from ${otherClass}]`,
          moveId: move.id,
          sourceClass: otherClass,
          isMulticlass: true,
          prerequisites: [`Must have taken a move from ${otherClass} before`]
        });
      });
    });

    return multiclassMoves;
  }

  /**
   * Get spell advancement choices for casters
   */
  private getSpellAdvancements(characterClass: CharacterClass, level: number): SpellAdvancement[] {
    if (!this.isSpellcaster(characterClass)) return [];

    // Simplified spell choices - would be more comprehensive
    const spells: SpellAdvancement[] = [];
    
    for (let spellLevel = 1; spellLevel <= Math.min(5, Math.floor(level / 2) + 1); spellLevel++) {
      spells.push({
        id: `spell-${characterClass}-${spellLevel}`,
        type: 'spell',
        level,
        name: `Learn Level ${spellLevel} Spell`,
        description: `Choose a new level ${spellLevel} spell for your spellbook`,
        spellLevel,
        isCantrip: spellLevel === 0,
        isPrepared: characterClass !== 'Wizard'
      });
    }

    return spells;
  }

  /**
   * Check if class is a spellcaster
   */
  private isSpellcaster(characterClass: CharacterClass): boolean {
    return ['Wizard', 'Cleric', 'Druid', 'Immolator'].includes(characterClass);
  }

  /**
   * Get available moves for a class at a level
   */
  private getClassMoves(characterClass: CharacterClass, level: number): any[] {
    // This would pull from actual move data - placeholder for now
    return [
      { id: 'advanced-move-1', name: 'Advanced Move 1', description: 'An advanced class move', prerequisites: [] },
      { id: 'advanced-move-2', name: 'Advanced Move 2', description: 'Another advanced class move', prerequisites: [] }
    ];
  }

  /**
   * Get multiclass options for a class
   */
  private getMulticlassOptions(characterClass: CharacterClass): CharacterClass[] {
    // All classes can multiclass into any other class in Dungeon World
    const allClasses: CharacterClass[] = [
      'Fighter', 'Wizard', 'Cleric', 'Thief', 'Bard', 'Ranger', 'Druid', 'Paladin', 'Barbarian', 'Immolator'
    ];
    
    return allClasses.filter(cls => cls !== characterClass);
  }

  /**
   * Get class archetypes for build suggestions
   */
  private getClassArchetypes(characterClass: CharacterClass): string[] {
    const archetypes: Record<CharacterClass, string[]> = {
      'Fighter': ['Tank', 'Damage Dealer', 'Versatile Warrior'],
      'Wizard': ['Blaster', 'Controller', 'Scholar'],
      'Cleric': ['Healer', 'Battle Cleric', 'Divine Scholar'],
      'Thief': ['Sneaky Scout', 'Face', 'Utility Expert'],
      'Ranger': ['Beast Master', 'Archer', 'Tracker'],
      'Paladin': ['Holy Warrior', 'Protector', 'Divine Champion'],
      'Bard': ['Support', 'Face', 'Jack of All Trades'],
      'Druid': ['Shapeshifter', 'Nature Wrath', 'Healer'],
      'Barbarian': ['Berserker', 'Tribal Warrior', 'Savage'],
      'Immolator': ['Fire Mage', 'Elemental Warrior', 'Destroyer']
    };

    return archetypes[characterClass] || ['Balanced'];
  }

  /**
   * Generate a build for a specific archetype
   */
  private generateArchetypeBuild(
    characterClass: CharacterClass, 
    level: number, 
    archetype: string
  ): AdvancementPlan | null {
    // This would generate optimized builds based on archetype
    // Simplified implementation for now
    const progression = this.getLevelProgression(level, characterClass);
    
    return {
      targetLevel: level,
      selectedAdvancements: [], // Would be populated with archetype-specific choices
      remainingChoices: progression.totalAdvancementPoints,
      isValid: true,
      validationErrors: [],
      suggestions: [`Optimized for ${archetype} playstyle`]
    };
  }

  /**
   * Validate an advancement plan
   */
  private validateAdvancementPlan(plan: AdvancementPlan, character: Partial<Character>): void {
    const errors: string[] = [];
    
    // Check total advancement points
    const progression = this.getLevelProgression(plan.targetLevel, character.class!);
    if (plan.selectedAdvancements.length > progression.totalAdvancementPoints) {
      errors.push('Too many advancements selected for target level');
    }

    // In Dungeon World, there's no separate limit on attribute vs move advancements
    // The only constraint is the total number of advancement choices
    // (Each level gives you 1 choice: new move OR +1 ability score)

    // Check for duplicate selections
    const ids = plan.selectedAdvancements.map(adv => adv.id);
    if (new Set(ids).size !== ids.length) {
      errors.push('Duplicate advancements selected');
    }

    // Check prerequisites
    plan.selectedAdvancements.forEach(adv => {
      if (adv.prerequisites) {
        adv.prerequisites.forEach(prereq => {
          // Simplified prerequisite checking
          if (!this.checkPrerequisite(prereq, character, plan)) {
            errors.push(`Prerequisite not met for ${adv.name}: ${prereq}`);
          }
        });
      }
    });

    plan.validationErrors = errors;
    plan.isValid = errors.length === 0;
  }

  /**
   * Check if a prerequisite is met
   */
  private checkPrerequisite(
    prerequisite: string, 
    character: Partial<Character>, 
    plan: AdvancementPlan
  ): boolean {
    // Simplified prerequisite checking - would be more comprehensive
    return true;
  }
}

export const advancementService = new AdvancementService();
