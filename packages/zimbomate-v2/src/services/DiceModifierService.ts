/**
 * Dice Modifier Service for ZimboMate V2
 * Auto-apply debilities, equipment bonuses, and situational modifiers to dice rolls
 */

export interface ModifierSource {
  id: string
  name: string
  description: string
  type: 'debility' | 'equipment' | 'condition' | 'spell' | 'move' | 'situational'
  category: string
  icon: string
  color: string
}

export interface ActiveModifier {
  id: string
  source: ModifierSource
  value: number
  duration?: 'permanent' | 'encounter' | 'scene' | 'rounds'
  remainingRounds?: number
  affectedStats: string[] // Which stats this modifier affects
  conditions?: string[] // When this modifier applies
  stackable: boolean
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ModifierStack {
  stat: string
  modifiers: ActiveModifier[]
  totalModifier: number
  breakdown: Array<{
    source: string
    value: number
    description: string
  }>
}

export interface RollModifierContext {
  characterId: string
  stat?: string
  moveType?: string
  situation?: string[]
  equipment?: string[]
  conditions?: string[]
}

class DiceModifierService {
  private activeModifiers: Map<string, ActiveModifier[]> = new Map() // characterId -> modifiers
  private modifierSources: Map<string, ModifierSource> = new Map()

  constructor() {
    this.initializeModifierSources()
  }

  /**
   * Initialize predefined modifier sources
   */
  private initializeModifierSources() {
    const sources: ModifierSource[] = [
      // Debilities
      {
        id: 'debility-weak',
        name: 'Weak',
        description: 'Reduces Strength-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },
      {
        id: 'debility-shaky',
        name: 'Shaky',
        description: 'Reduces Dexterity-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },
      {
        id: 'debility-sick',
        name: 'Sick',
        description: 'Reduces Constitution-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },
      {
        id: 'debility-stunned',
        name: 'Stunned',
        description: 'Reduces Intelligence-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },
      {
        id: 'debility-confused',
        name: 'Confused',
        description: 'Reduces Wisdom-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },
      {
        id: 'debility-scarred',
        name: 'Scarred',
        description: 'Reduces Charisma-based rolls by 1',
        type: 'debility',
        category: 'debility',
        icon: 'Minus',
        color: 'var(--color-danger)'
      },

      // Equipment bonuses
      {
        id: 'equipment-magical-weapon',
        name: 'Magical Weapon',
        description: 'Bonus from magical weapon',
        type: 'equipment',
        category: 'weapon',
        icon: 'Sword',
        color: 'var(--color-accent)'
      },
      {
        id: 'equipment-armor-bonus',
        name: 'Armor Bonus',
        description: 'Defensive bonus from armor',
        type: 'equipment',
        category: 'armor',
        icon: 'Shield',
        color: 'var(--color-primary)'
      },

      // Conditions
      {
        id: 'condition-blessed',
        name: 'Blessed',
        description: 'Divine blessing provides bonus to rolls',
        type: 'condition',
        category: 'beneficial',
        icon: 'Star',
        color: 'var(--color-success)'
      },
      {
        id: 'condition-cursed',
        name: 'Cursed',
        description: 'Curse provides penalty to rolls',
        type: 'condition',
        category: 'detrimental',
        icon: 'Skull',
        color: 'var(--color-danger)'
      },

      // Situational
      {
        id: 'situational-advantage',
        name: 'Advantage',
        description: 'Favorable circumstances provide bonus',
        type: 'situational',
        category: 'circumstance',
        icon: 'TrendingUp',
        color: 'var(--color-success)'
      },
      {
        id: 'situational-disadvantage',
        name: 'Disadvantage',
        description: 'Unfavorable circumstances provide penalty',
        type: 'situational',
        category: 'circumstance',
        icon: 'TrendingDown',
        color: 'var(--color-warning)'
      }
    ]

    sources.forEach(source => {
      this.modifierSources.set(source.id, source)
    })
  }

  /**
   * Add modifier to character
   */
  addModifier(
    characterId: string,
    sourceId: string,
    value: number,
    affectedStats: string[],
    options: {
      duration?: 'permanent' | 'encounter' | 'scene' | 'rounds'
      remainingRounds?: number
      conditions?: string[]
      stackable?: boolean
      metadata?: Record<string, any>
    } = {}
  ): ActiveModifier {
    const source = this.modifierSources.get(sourceId)
    if (!source) {
      throw new Error(`Unknown modifier source: ${sourceId}`)
    }

    const modifier: ActiveModifier = {
      id: `modifier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source,
      value,
      affectedStats,
      duration: options.duration || 'permanent',
      remainingRounds: options.remainingRounds,
      conditions: options.conditions,
      stackable: options.stackable !== false,
      timestamp: new Date(),
      metadata: options.metadata
    }

    if (!this.activeModifiers.has(characterId)) {
      this.activeModifiers.set(characterId, [])
    }

    const characterModifiers = this.activeModifiers.get(characterId)!
    
    // Check if non-stackable modifier already exists
    if (!modifier.stackable) {
      const existingIndex = characterModifiers.findIndex(m => 
        m.source.id === sourceId && !m.stackable
      )
      if (existingIndex !== -1) {
        characterModifiers[existingIndex] = modifier
        return modifier
      }
    }

    characterModifiers.push(modifier)
    return modifier
  }

  /**
   * Remove modifier from character
   */
  removeModifier(characterId: string, modifierId: string): boolean {
    const modifiers = this.activeModifiers.get(characterId)
    if (!modifiers) return false

    const index = modifiers.findIndex(m => m.id === modifierId)
    if (index === -1) return false

    modifiers.splice(index, 1)
    return true
  }

  /**
   * Remove all modifiers of a specific type
   */
  removeModifiersByType(characterId: string, type: string): number {
    const modifiers = this.activeModifiers.get(characterId)
    if (!modifiers) return 0

    const initialLength = modifiers.length
    this.activeModifiers.set(
      characterId,
      modifiers.filter(m => m.source.type !== type)
    )

    return initialLength - (this.activeModifiers.get(characterId)?.length || 0)
  }

  /**
   * Get all active modifiers for character
   */
  getActiveModifiers(characterId: string): ActiveModifier[] {
    return this.activeModifiers.get(characterId) || []
  }

  /**
   * Get modifier stack for a specific stat
   */
  getModifierStack(characterId: string, stat: string): ModifierStack {
    const modifiers = this.getActiveModifiers(characterId)
    const applicableModifiers = modifiers.filter(m => 
      m.affectedStats.includes(stat) || m.affectedStats.includes('all')
    )

    const totalModifier = applicableModifiers.reduce((sum, m) => sum + m.value, 0)
    
    const breakdown = applicableModifiers.map(m => ({
      source: m.source.name,
      value: m.value,
      description: m.source.description
    }))

    return {
      stat,
      modifiers: applicableModifiers,
      totalModifier,
      breakdown
    }
  }

  /**
   * Calculate total modifier for a roll context
   */
  calculateRollModifier(context: RollModifierContext): {
    totalModifier: number
    breakdown: Array<{
      source: string
      value: number
      description: string
      category: string
    }>
  } {
    const modifiers = this.getActiveModifiers(context.characterId)
    let applicableModifiers: ActiveModifier[] = []

    // Filter modifiers based on context
    for (const modifier of modifiers) {
      let applies = false

      // Check stat-specific modifiers
      if (context.stat && (
        modifier.affectedStats.includes(context.stat) ||
        modifier.affectedStats.includes('all')
      )) {
        applies = true
      }

      // Check conditional modifiers
      if (modifier.conditions && context.situation) {
        const hasMatchingCondition = modifier.conditions.some(condition =>
          context.situation!.includes(condition)
        )
        if (hasMatchingCondition) {
          applies = true
        }
      }

      // Equipment modifiers
      if (modifier.source.type === 'equipment' && context.equipment) {
        const hasMatchingEquipment = context.equipment.some(item =>
          modifier.metadata?.equipmentId === item
        )
        if (hasMatchingEquipment) {
          applies = true
        }
      }

      if (applies) {
        applicableModifiers.push(modifier)
      }
    }

    const totalModifier = applicableModifiers.reduce((sum, m) => sum + m.value, 0)
    
    const breakdown = applicableModifiers.map(m => ({
      source: m.source.name,
      value: m.value,
      description: m.source.description,
      category: m.source.category
    }))

    return { totalModifier, breakdown }
  }

  /**
   * Apply debilities from character state
   */
  applyDebilities(characterId: string, debilities: Record<string, boolean>) {
    // Remove existing debility modifiers
    this.removeModifiersByType(characterId, 'debility')

    // Add active debilities
    const debilityMap: Record<string, string> = {
      weak: 'strength',
      shaky: 'dexterity',
      sick: 'constitution',
      stunned: 'intelligence',
      confused: 'wisdom',
      scarred: 'charisma'
    }

    Object.entries(debilities).forEach(([debility, isActive]) => {
      if (isActive && debilityMap[debility]) {
        this.addModifier(
          characterId,
          `debility-${debility}`,
          -1,
          [debilityMap[debility]],
          { duration: 'permanent', stackable: false }
        )
      }
    })
  }

  /**
   * Apply equipment modifiers
   */
  applyEquipmentModifiers(characterId: string, equipment: any[]) {
    // Remove existing equipment modifiers
    this.removeModifiersByType(characterId, 'equipment')

    equipment.forEach(item => {
      if (item.equipped && item.modifiers) {
        item.modifiers.forEach((mod: any) => {
          this.addModifier(
            characterId,
            `equipment-${mod.type}`,
            mod.value,
            mod.affectedStats || ['all'],
            {
              duration: 'permanent',
              stackable: mod.stackable !== false,
              metadata: { equipmentId: item.id, equipmentName: item.name }
            }
          )
        })
      }
    })
  }

  /**
   * Update round-based modifiers
   */
  updateRoundBasedModifiers(characterId: string) {
    const modifiers = this.getActiveModifiers(characterId)
    const updatedModifiers: ActiveModifier[] = []

    modifiers.forEach(modifier => {
      if (modifier.duration === 'rounds' && modifier.remainingRounds !== undefined) {
        if (modifier.remainingRounds > 1) {
          modifier.remainingRounds--
          updatedModifiers.push(modifier)
        }
        // Modifier expires if remainingRounds reaches 0
      } else {
        updatedModifiers.push(modifier)
      }
    })

    this.activeModifiers.set(characterId, updatedModifiers)
  }

  /**
   * Clear encounter-based modifiers
   */
  clearEncounterModifiers(characterId: string) {
    const modifiers = this.getActiveModifiers(characterId)
    this.activeModifiers.set(
      characterId,
      modifiers.filter(m => m.duration !== 'encounter')
    )
  }

  /**
   * Get modifier preview for UI
   */
  getModifierPreview(characterId: string, stat: string): {
    hasModifiers: boolean
    totalModifier: number
    preview: string
    color: string
  } {
    const stack = this.getModifierStack(characterId, stat)
    
    if (stack.totalModifier === 0) {
      return {
        hasModifiers: false,
        totalModifier: 0,
        preview: '',
        color: 'var(--color-text-secondary)'
      }
    }

    const sign = stack.totalModifier > 0 ? '+' : ''
    const color = stack.totalModifier > 0 
      ? 'var(--color-success)' 
      : 'var(--color-danger)'

    return {
      hasModifiers: true,
      totalModifier: stack.totalModifier,
      preview: `${sign}${stack.totalModifier}`,
      color
    }
  }

  /**
   * Export modifier data
   */
  exportModifierData(characterId: string): any {
    return {
      characterId,
      modifiers: this.getActiveModifiers(characterId),
      exportDate: new Date()
    }
  }

  /**
   * Import modifier data
   */
  importModifierData(data: any): boolean {
    try {
      if (!data.characterId || !Array.isArray(data.modifiers)) {
        return false
      }

      this.activeModifiers.set(data.characterId, data.modifiers)
      return true
    } catch (error) {
      console.error('Failed to import modifier data:', error)
      return false
    }
  }
}

// Singleton instance
export const diceModifierService = new DiceModifierService()
export { DiceModifierService }