/**
 * Chronicle Template Service
 *
 * Provides rich, contextual templates for different action types.
 * Templates are dynamically selected based on action context, character state,
 * and narrative situation to provide intelligent chronicle suggestions.
 */

import type { ActionContext, ChronicleActionType } from './ChronicleActionListenerService'

// Template definition
export interface ChronicleTemplate {
  id: string
  name: string
  description: string
  actionTypes: ChronicleActionType[]

  // Conditions for when this template applies
  conditions: {
    results?: ('success' | 'partial' | 'failure')[]
    stats?: string[]
    situations?: ('combat' | 'exploration' | 'social' | 'downtime')[]
    intensity?: ('low' | 'medium' | 'high')[]
    emotionalTone?: ('positive' | 'negative' | 'neutral' | 'tense')[]
  }

  // Template variations
  variations: TemplateVariation[]

  // Priority for selection
  priority: number

  // Usage tracking
  usageCount?: number
  lastUsed?: Date
}

export interface TemplateVariation {
  template: string
  weight: number // Higher weight = more likely to be selected
  tags: string[] // Additional context tags
  examples: string[] // Example outputs
}

// Template variables that can be replaced
export interface TemplateVariables {
  character: string
  stat?: string
  move?: string
  item?: string
  action?: string
  result?: string
  total?: number
  target?: string
  weapon?: string
  damage?: number
  location?: string
  emotion?: string
  intensity?: string
}

export class ChronicleTemplateService {
  private templates: Map<string, ChronicleTemplate> = new Map()
  private userPreferences: Map<string, number> = new Map() // templateId -> preference score

  constructor() {
    this.initializeTemplates()
    this.loadUserPreferences()
  }

  /**
   * Get templates matching the action context
   */
  getTemplatesForContext(
    actionContext: ActionContext,
    situation?: string,
    intensity?: string,
    emotionalTone?: string
  ): ChronicleTemplate[] {
    const matchingTemplates: ChronicleTemplate[] = []

    for (const template of this.templates.values()) {
      if (this.templateMatchesContext(template, actionContext, situation, intensity, emotionalTone)) {
        matchingTemplates.push(template)
      }
    }

    // Sort by priority and user preference
    return matchingTemplates.sort((a, b) => {
      const prefA = this.userPreferences.get(a.id) || 0
      const prefB = this.userPreferences.get(b.id) || 0
      const scoreA = a.priority + prefA
      const scoreB = b.priority + prefB
      return scoreB - scoreA
    })
  }

  /**
   * Generate chronicle suggestions from templates
   */
  generateSuggestions(
    actionContext: ActionContext,
    situation?: string,
    intensity?: string,
    emotionalTone?: string,
    count = 3
  ): string[] {
    const templates = this.getTemplatesForContext(actionContext, situation, intensity, emotionalTone)
    const suggestions: string[] = []

    for (const template of templates.slice(0, count)) {
      const variation = this.selectVariation(template, actionContext)
      if (variation) {
        const suggestion = this.populateTemplate(variation.template, actionContext)
        if (suggestion && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion)
        }
      }
    }

    // Fill remaining slots with fallback templates if needed
    while (suggestions.length < count && templates.length > suggestions.length) {
      const fallbackTemplate = templates[suggestions.length]
      const variation = fallbackTemplate.variations[0] // Use first variation
      const suggestion = this.populateTemplate(variation.template, actionContext)
      if (suggestion && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion)
      }
    }

    return suggestions
  }

  /**
   * Record template usage for learning
   */
  recordTemplateUsage(templateId: string, wasUseful: boolean): void {
    const template = this.templates.get(templateId)
    if (!template) return

    // Update usage count
    template.usageCount = (template.usageCount || 0) + 1
    template.lastUsed = new Date()

    // Update user preference
    const currentPref = this.userPreferences.get(templateId) || 0
    const adjustment = wasUseful ? 0.1 : -0.1
    this.userPreferences.set(templateId, currentPref + adjustment)

    this.saveUserPreferences()
  }

  // Private methods

  private templateMatchesContext(
    template: ChronicleTemplate,
    actionContext: ActionContext,
    situation?: string,
    intensity?: string,
    emotionalTone?: string
  ): boolean {
    // Check action type
    if (!template.actionTypes.includes(actionContext.actionType)) {
      return false
    }

    const { conditions } = template

    // Check result conditions
    if (conditions.results && actionContext.diceRoll) {
      if (!conditions.results.includes(actionContext.diceRoll.result)) {
        return false
      }
    }

    // Check stat conditions
    if (conditions.stats && actionContext.diceRoll?.stat) {
      if (!conditions.stats.includes(actionContext.diceRoll.stat)) {
        return false
      }
    }

    // Check situation conditions
    if (conditions.situations && situation) {
      if (!conditions.situations.includes(situation as any)) {
        return false
      }
    }

    // Check intensity conditions
    if (conditions.intensity && intensity) {
      if (!conditions.intensity.includes(intensity as any)) {
        return false
      }
    }

    // Check emotional tone conditions
    if (conditions.emotionalTone && emotionalTone) {
      if (!conditions.emotionalTone.includes(emotionalTone as any)) {
        return false
      }
    }

    return true
  }

  private selectVariation(template: ChronicleTemplate, actionContext: ActionContext): TemplateVariation | null {
    if (template.variations.length === 0) return null

    // Weighted random selection
    const totalWeight = template.variations.reduce((sum, v) => sum + v.weight, 0)
    let random = Math.random() * totalWeight

    for (const variation of template.variations) {
      random -= variation.weight
      if (random <= 0) {
        return variation
      }
    }

    return template.variations[0] // Fallback
  }

  private populateTemplate(templateString: string, actionContext: ActionContext): string {
    const variables: TemplateVariables = {
      character: actionContext.characterName || 'your character',
      stat: actionContext.diceRoll?.stat,
      move: actionContext.diceRoll?.moveName,
      result: actionContext.diceRoll?.result,
      total: actionContext.diceRoll?.total,
      item: actionContext.equipment?.itemName,
      action: actionContext.equipment?.action || actionContext.combat?.action,
      target: actionContext.combat?.target,
      weapon: actionContext.combat?.weapon,
      damage: actionContext.combat?.damage,
      location: actionContext.location?.currentLocation,
      // Default emotion and intensity can be overridden by caller
      emotion: 'determined',
      intensity: 'focused'
    }

    let result = templateString

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        result = result.replace(regex, String(value))
      }
    })

    // Clean up any unreplaced variables
    result = result.replace(/\{[^}]+\}/g, '...')

    return result
  }

  private initializeTemplates(): void {
    // Dice Roll Templates

    // Stat Roll Success Templates
    this.templates.set('stat-success-str', {
      id: 'stat-success-str',
      name: 'STR Success',
      description: 'Templates for successful strength rolls',
      actionTypes: ['stat_roll'],
      conditions: {
        results: ['success'],
        stats: ['STR']
      },
      variations: [
        {
          template: '{character} demonstrates incredible strength, easily {action} with pure physical power.',
          weight: 3,
          tags: ['strength', 'success', 'physical'],
          examples: ['Thorin demonstrates incredible strength, easily lifting the massive stone with pure physical power.']
        },
        {
          template: 'With a mighty heave, {character} overpowers the obstacle through sheer strength.',
          weight: 2,
          tags: ['strength', 'success', 'dramatic'],
          examples: ['With a mighty heave, Thorin overpowers the obstacle through sheer strength.']
        },
        {
          template: '{character}\'s muscles strain momentarily before succeeding through raw physical might.',
          weight: 2,
          tags: ['strength', 'success', 'effort'],
          examples: ['Thorin\'s muscles strain momentarily before succeeding through raw physical might.']
        }
      ],
      priority: 8
    })

    this.templates.set('stat-success-dex', {
      id: 'stat-success-dex',
      name: 'DEX Success',
      description: 'Templates for successful dexterity rolls',
      actionTypes: ['stat_roll'],
      conditions: {
        results: ['success'],
        stats: ['DEX']
      },
      variations: [
        {
          template: '{character} moves with fluid grace, their dexterity allowing perfect execution.',
          weight: 3,
          tags: ['dexterity', 'success', 'grace'],
          examples: ['Thorin moves with fluid grace, their dexterity allowing perfect execution.']
        },
        {
          template: 'Quick reflexes and nimble movements serve {character} well in this moment.',
          weight: 2,
          tags: ['dexterity', 'success', 'reflexes'],
          examples: ['Quick reflexes and nimble movements serve Thorin well in this moment.']
        },
        {
          template: '{character} demonstrates exceptional agility, navigating the challenge with ease.',
          weight: 2,
          tags: ['dexterity', 'success', 'agility'],
          examples: ['Thorin demonstrates exceptional agility, navigating the challenge with ease.']
        }
      ],
      priority: 8
    })

    // Failure Templates
    this.templates.set('dice-failure-universal', {
      id: 'dice-failure-universal',
      name: 'Universal Failure',
      description: 'Templates for any dice failure',
      actionTypes: ['dice_roll', 'stat_roll', 'move_roll'],
      conditions: {
        results: ['failure']
      },
      variations: [
        {
          template: 'Despite {character}\'s best efforts, things don\'t go according to plan. They learn from this setback and mark XP.',
          weight: 3,
          tags: ['failure', 'learning', 'xp'],
          examples: ['Despite Thorin\'s best efforts, things don\'t go according to plan. They learn from this setback and mark XP.']
        },
        {
          template: '{character} faces an unexpected complication, but failure often teaches us more than success.',
          weight: 2,
          tags: ['failure', 'complication', 'wisdom'],
          examples: ['Thorin faces an unexpected complication, but failure often teaches us more than success.']
        },
        {
          template: 'The dice show no mercy to {character}, but this failure will forge them into something stronger.',
          weight: 2,
          tags: ['failure', 'growth', 'drama'],
          examples: ['The dice show no mercy to Thorin, but this failure will forge them into something stronger.']
        }
      ],
      priority: 9
    })

    // Equipment Templates
    this.templates.set('equipment-use-weapon', {
      id: 'equipment-use-weapon',
      name: 'Weapon Use',
      description: 'Templates for using weapons',
      actionTypes: ['equipment_use'],
      conditions: {},
      variations: [
        {
          template: '{character} draws their {item}, its weight familiar and reassuring in their grip.',
          weight: 3,
          tags: ['weapon', 'preparation', 'comfort'],
          examples: ['Thorin draws their sword, its weight familiar and reassuring in their grip.']
        },
        {
          template: 'With practiced ease, {character} brings {item} to bear against the challenge ahead.',
          weight: 2,
          tags: ['weapon', 'skill', 'readiness'],
          examples: ['With practiced ease, Thorin brings their sword to bear against the challenge ahead.']
        },
        {
          template: '{character}\'s {item} gleams as they prepare to face whatever comes next.',
          weight: 2,
          tags: ['weapon', 'dramatic', 'anticipation'],
          examples: ['Thorin\'s sword gleams as they prepare to face whatever comes next.']
        }
      ],
      priority: 7
    })

    // Combat Templates
    this.templates.set('combat-attack-success', {
      id: 'combat-attack-success',
      name: 'Successful Attack',
      description: 'Templates for successful combat attacks',
      actionTypes: ['combat_action'],
      conditions: {
        situations: ['combat']
      },
      variations: [
        {
          template: '{character} strikes {target} with their {weapon}, dealing {damage} damage in a display of martial prowess.',
          weight: 3,
          tags: ['combat', 'attack', 'success', 'damage'],
          examples: ['Thorin strikes the orc with their sword, dealing 8 damage in a display of martial prowess.']
        },
        {
          template: 'The battle intensifies as {character}\'s attack finds its mark against {target}.',
          weight: 2,
          tags: ['combat', 'attack', 'intensity'],
          examples: ['The battle intensifies as Thorin\'s attack finds its mark against the orc.']
        },
        {
          template: '{character}\'s {weapon} cuts through the air, connecting with {target} in a decisive blow.',
          weight: 2,
          tags: ['combat', 'attack', 'decisive'],
          examples: ['Thorin\'s sword cuts through the air, connecting with the orc in a decisive blow.']
        }
      ],
      priority: 9
    })

    // Social/Emotional Templates
    this.templates.set('social-success-cha', {
      id: 'social-success-cha',
      name: 'CHA Success',
      description: 'Templates for successful charisma rolls',
      actionTypes: ['stat_roll'],
      conditions: {
        results: ['success'],
        stats: ['CHA'],
        situations: ['social']
      },
      variations: [
        {
          template: '{character}\'s words carry weight and conviction, swaying hearts and minds with natural charisma.',
          weight: 3,
          tags: ['charisma', 'success', 'persuasion'],
          examples: ['Thorin\'s words carry weight and conviction, swaying hearts and minds with natural charisma.']
        },
        {
          template: 'With charm and eloquence, {character} navigates the social situation masterfully.',
          weight: 2,
          tags: ['charisma', 'success', 'social'],
          examples: ['With charm and eloquence, Thorin navigates the social situation masterfully.']
        },
        {
          template: '{character}\'s presence commands attention and respect in this crucial moment.',
          weight: 2,
          tags: ['charisma', 'success', 'leadership'],
          examples: ['Thorin\'s presence commands attention and respect in this crucial moment.']
        }
      ],
      priority: 8
    })

    // Exploration Templates
    this.templates.set('exploration-discovery', {
      id: 'exploration-discovery',
      name: 'Discovery',
      description: 'Templates for exploration and discovery moments',
      actionTypes: ['stat_roll'],
      conditions: {
        stats: ['WIS', 'INT'],
        situations: ['exploration']
      },
      variations: [
        {
          template: '{character}\'s keen senses reveal something others might have missed in this place.',
          weight: 3,
          tags: ['exploration', 'wisdom', 'discovery'],
          examples: ['Thorin\'s keen senses reveal something others might have missed in this place.']
        },
        {
          template: 'Drawing upon experience and intuition, {character} pieces together the puzzle before them.',
          weight: 2,
          tags: ['exploration', 'intelligence', 'deduction'],
          examples: ['Drawing upon experience and intuition, Thorin pieces together the puzzle before them.']
        },
        {
          template: '{character} pauses, studying their surroundings with the careful eye of an experienced adventurer.',
          weight: 2,
          tags: ['exploration', 'caution', 'experience'],
          examples: ['Thorin pauses, studying their surroundings with the careful eye of an experienced adventurer.']
        }
      ],
      priority: 7
    })

    // Partial Success Templates
    this.templates.set('partial-success-universal', {
      id: 'partial-success-universal',
      name: 'Universal Partial Success',
      description: 'Templates for partial successes',
      actionTypes: ['dice_roll', 'stat_roll', 'move_roll'],
      conditions: {
        results: ['partial']
      },
      variations: [
        {
          template: '{character} succeeds, but the victory comes with unexpected complications.',
          weight: 3,
          tags: ['partial', 'success', 'complications'],
          examples: ['Thorin succeeds, but the victory comes with unexpected complications.']
        },
        {
          template: 'Things don\'t go entirely as planned for {character}, though they achieve their goal.',
          weight: 2,
          tags: ['partial', 'success', 'mixed'],
          examples: ['Things don\'t go entirely as planned for Thorin, though they achieve their goal.']
        },
        {
          template: '{character} finds success, but at a cost that will shape what happens next.',
          weight: 2,
          tags: ['partial', 'success', 'cost'],
          examples: ['Thorin finds success, but at a cost that will shape what happens next.']
        }
      ],
      priority: 8
    })

    // Environmental/Situational Templates
    this.templates.set('tense-moment', {
      id: 'tense-moment',
      name: 'Tense Moments',
      description: 'Templates for high-tension situations',
      actionTypes: ['dice_roll', 'stat_roll', 'move_roll', 'combat_action'],
      conditions: {
        emotionalTone: ['tense'],
        intensity: ['high']
      },
      variations: [
        {
          template: 'Time seems to slow as {character} faces this critical moment, everything hanging in the balance.',
          weight: 3,
          tags: ['tension', 'critical', 'drama'],
          examples: ['Time seems to slow as Thorin faces this critical moment, everything hanging in the balance.']
        },
        {
          template: 'The stakes have never been higher as {character} acts with decisive {intensity}.',
          weight: 2,
          tags: ['tension', 'stakes', 'decisive'],
          examples: ['The stakes have never been higher as Thorin acts with decisive focus.']
        },
        {
          template: '{character} feels the weight of the moment pressing down as they make their move.',
          weight: 2,
          tags: ['tension', 'pressure', 'weight'],
          examples: ['Thorin feels the weight of the moment pressing down as they make their move.']
        }
      ],
      priority: 9
    })
  }

  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('chronicle-template-preferences')
      if (saved) {
        const preferences = JSON.parse(saved)
        this.userPreferences = new Map(Object.entries(preferences))
      }
    } catch (error) {
      console.warn('Failed to load template preferences:', error)
    }
  }

  private saveUserPreferences(): void {
    try {
      const preferences = Object.fromEntries(this.userPreferences.entries())
      localStorage.setItem('chronicle-template-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.warn('Failed to save template preferences:', error)
    }
  }
}

// Export singleton instance
export const chronicleTemplateService = new ChronicleTemplateService()