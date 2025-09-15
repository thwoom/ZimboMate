/**
 * Advancement Service for ZimboMate V2
 * Handles character advancement, leveling up, and XP management
 * New service for V2 to handle character progression
 */

import type { Character, AdvancementChoice, Attribute, CharacterClass } from '../models/Character'
import { getXPThreshold, calculateMaxHP, calculateMaxLoad } from '../models/Character'

// Advancement options available when leveling up
export interface AdvancementOption {
  id: string
  type: 'move' | 'stat' | 'other'
  name: string
  description: string
  requirements?: string[]
  mutuallyExclusive?: string[] // Other options that can't be taken with this one
}

// Level up result
export interface LevelUpResult {
  character: Character
  availableOptions: AdvancementOption[]
  newLevel: number
  hpIncrease: number
  loadIncrease: number
}

// XP sources for tracking
export type XPSource = 
  | 'failed-roll' 
  | 'end-of-session' 
  | 'bond-resolution' 
  | 'alignment-move' 
  | 'gm-award' 
  | 'other'

// XP entry for history tracking
export interface XPEntry {
  id: string
  amount: number
  source: XPSource
  description: string
  timestamp: Date
  sessionId?: string
}

export class AdvancementService {
  private xpHistory: Map<string, XPEntry[]> = new Map()

  /**
   * Check if character should level up
   */
  shouldLevelUp(character: Character): boolean {
    return character.xp >= getXPThreshold(character.level)
  }

  /**
   * Get XP needed for next level
   */
  getXPNeeded(character: Character): number {
    const threshold = getXPThreshold(character.level)
    return Math.max(0, threshold - character.xp)
  }

  /**
   * Get XP progress as percentage
   */
  getXPProgress(character: Character): number {
    const threshold = getXPThreshold(character.level)
    return Math.min(100, (character.xp / threshold) * 100)
  }

  /**
   * Add XP to character
   */
  addXP(character: Character, amount: number, source: XPSource, description: string, sessionId?: string): Character {
    const entry: XPEntry = {
      id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      amount,
      source,
      description,
      timestamp: new Date(),
      sessionId,
    }

    // Add to history
    const history = this.xpHistory.get(character.id) || []
    history.push(entry)
    this.xpHistory.set(character.id, history)

    return {
      ...character,
      xp: character.xp + amount,
      updatedAt: new Date(),
    }
  }

  /**
   * Get XP history for character
   */
  getXPHistory(characterId: string): XPEntry[] {
    return this.xpHistory.get(characterId) || []
  }

  /**
   * Get XP statistics
   */
  getXPStats(characterId: string): {
    totalXP: number
    xpFromFailedRolls: number
    xpFromSessions: number
    xpFromBonds: number
    xpFromAlignment: number
    xpFromOther: number
    averageXPPerSession: number
  } {
    const history = this.getXPHistory(characterId)
    
    const stats = {
      totalXP: 0,
      xpFromFailedRolls: 0,
      xpFromSessions: 0,
      xpFromBonds: 0,
      xpFromAlignment: 0,
      xpFromOther: 0,
      averageXPPerSession: 0,
    }

    const sessionXP = new Map<string, number>()

    for (const entry of history) {
      stats.totalXP += entry.amount

      switch (entry.source) {
        case 'failed-roll':
          stats.xpFromFailedRolls += entry.amount
          break
        case 'end-of-session':
          stats.xpFromSessions += entry.amount
          break
        case 'bond-resolution':
          stats.xpFromBonds += entry.amount
          break
        case 'alignment-move':
          stats.xpFromAlignment += entry.amount
          break
        default:
          stats.xpFromOther += entry.amount
          break
      }

      // Track XP per session
      if (entry.sessionId) {
        const current = sessionXP.get(entry.sessionId) || 0
        sessionXP.set(entry.sessionId, current + entry.amount)
      }
    }

    // Calculate average XP per session
    if (sessionXP.size > 0) {
      const totalSessionXP = Array.from(sessionXP.values()).reduce((sum, xp) => sum + xp, 0)
      stats.averageXPPerSession = totalSessionXP / sessionXP.size
    }

    return stats
  }

  /**
   * Get available advancement options for a character
   */
  getAdvancementOptions(character: Character): AdvancementOption[] {
    const options: AdvancementOption[] = []

    // Stat improvements (can increase any stat by 1, max 18)
    for (const stat of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as Attribute[]) {
      if (character.attributes[stat] < 18) {
        options.push({
          id: `stat-${stat.toLowerCase()}`,
          type: 'stat',
          name: `Increase ${stat}`,
          description: `Increase your ${stat} by 1 (to ${character.attributes[stat] + 1})`,
        })
      }
    }

    // Class moves (this would be populated from move compendium)
    // For now, add placeholder options
    options.push({
      id: 'class-move-1',
      type: 'move',
      name: 'New Class Move',
      description: 'Learn a new move from your class',
    })

    // Advanced moves (levels 2-5)
    if (character.level >= 2 && character.level <= 5) {
      options.push({
        id: 'advanced-move',
        type: 'move',
        name: 'Advanced Move',
        description: 'Learn an advanced move from another class',
      })
    }

    // Master moves (levels 6-10)
    if (character.level >= 6) {
      options.push({
        id: 'master-move',
        type: 'move',
        name: 'Master Move',
        description: 'Learn a master move',
      })
    }

    return options
  }

  /**
   * Level up character
   */
  levelUp(character: Character): LevelUpResult {
    if (!this.shouldLevelUp(character)) {
      throw new Error('Character does not have enough XP to level up')
    }

    const newLevel = character.level + 1
    const oldMaxHP = calculateMaxHP(character)
    const oldMaxLoad = calculateMaxLoad(character)

    // Create leveled up character
    const leveledCharacter: Character = {
      ...character,
      level: newLevel,
      updatedAt: new Date(),
    }

    // Recalculate derived stats
    const newMaxHP = calculateMaxHP(leveledCharacter)
    const newMaxLoad = calculateMaxLoad(leveledCharacter)

    // Update HP and load maximums
    leveledCharacter.hp = {
      current: character.hp.current + (newMaxHP - oldMaxHP), // Increase current HP by the increase in max
      max: newMaxHP,
    }

    leveledCharacter.load = {
      current: character.load.current,
      max: newMaxLoad,
    }

    const availableOptions = this.getAdvancementOptions(leveledCharacter)

    return {
      character: leveledCharacter,
      availableOptions,
      newLevel,
      hpIncrease: newMaxHP - oldMaxHP,
      loadIncrease: newMaxLoad - oldMaxLoad,
    }
  }

  /**
   * Apply advancement choice
   */
  applyAdvancement(character: Character, option: AdvancementOption): Character {
    const advancement: AdvancementChoice = {
      level: character.level,
      type: option.type,
      choice: option.id,
      description: option.description,
      timestamp: new Date(),
    }

    let updated = {
      ...character,
      advancements: [...character.advancements, advancement],
      updatedAt: new Date(),
    }

    // Apply the specific advancement
    switch (option.type) {
      case 'stat':
        const statMatch = option.id.match(/stat-(\w+)/)
        if (statMatch) {
          const stat = statMatch[1].toUpperCase() as Attribute
          updated.attributes = {
            ...updated.attributes,
            [stat]: Math.min(18, updated.attributes[stat] + 1),
          }
          
          // Recalculate derived stats if CON or STR changed
          if (stat === 'CON') {
            const newMaxHP = calculateMaxHP(updated)
            const hpIncrease = newMaxHP - updated.hp.max
            updated.hp = {
              current: updated.hp.current + hpIncrease,
              max: newMaxHP,
            }
          }
          
          if (stat === 'STR') {
            updated.load = {
              ...updated.load,
              max: calculateMaxLoad(updated),
            }
          }
        }
        break

      case 'move':
        // Add move to known moves
        updated.knownMoves = [...updated.knownMoves, option.id]
        break

      case 'other':
        // Handle other advancement types as needed
        break
    }

    return updated
  }

  /**
   * Get advancement history for character
   */
  getAdvancementHistory(character: Character): AdvancementChoice[] {
    return [...character.advancements].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Check if character can take a specific advancement
   */
  canTakeAdvancement(character: Character, option: AdvancementOption): {
    canTake: boolean
    reasons: string[]
  } {
    const reasons: string[] = []
    let canTake = true

    // Check requirements
    if (option.requirements) {
      for (const requirement of option.requirements) {
        // This would check specific requirements
        // For now, assume all requirements are met
      }
    }

    // Check mutually exclusive options
    if (option.mutuallyExclusive) {
      const takenChoices = character.advancements.map(a => a.choice)
      for (const exclusive of option.mutuallyExclusive) {
        if (takenChoices.includes(exclusive)) {
          reasons.push(`Cannot take because you already have ${exclusive}`)
          canTake = false
        }
      }
    }

    // Check stat limits
    if (option.type === 'stat') {
      const statMatch = option.id.match(/stat-(\w+)/)
      if (statMatch) {
        const stat = statMatch[1].toUpperCase() as Attribute
        if (character.attributes[stat] >= 18) {
          reasons.push(`${stat} is already at maximum (18)`)
          canTake = false
        }
      }
    }

    return { canTake, reasons }
  }

  /**
   * Reset character to level 1 (for testing or character recreation)
   */
  resetToLevel1(character: Character): Character {
    return {
      ...character,
      level: 1,
      xp: 0,
      advancements: [],
      knownMoves: [], // Reset to starting moves only
      hp: {
        current: calculateMaxHP({ ...character, level: 1 }),
        max: calculateMaxHP({ ...character, level: 1 }),
      },
      load: {
        current: 0,
        max: calculateMaxLoad({ ...character, level: 1 }),
      },
      updatedAt: new Date(),
    }
  }

  /**
   * Clear XP history for character (useful for testing)
   */
  clearXPHistory(characterId: string): void {
    this.xpHistory.delete(characterId)
  }
}

// Export singleton instance
export const advancementService = new AdvancementService()