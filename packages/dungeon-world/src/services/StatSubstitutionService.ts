import type { Character } from '../models/Character'
import { getAdvancedMovesForClass } from '../data/advancedMoves'

export interface StatSubstitution {
  moveId: string
  moveName: string
  originalStat: string
  substituteStat: string
  description: string
}

export interface StatSubstitutionRule {
  targetMove: string // The move this affects (e.g., "Defy Danger")
  originalStat: string // The stat that would normally be used
  substituteStat: string // The stat that can be used instead
  condition?: string // Any additional conditions
}

/**
 * Service to handle stat substitution moves like "Defensive Fighter"
 * that allow characters to use different stats for certain moves
 */
export class StatSubstitutionService {
  private static readonly STAT_SUBSTITUTION_RULES: Record <string, StatSubstitutionRule[]> = {
    'Defy Danger': [
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'CON',
        condition: 'Defensive Fighter move',
      },
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'WIS',
        condition: 'Druid\'s Animal Companion move',
      },
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'WIS',
        condition: 'Cleric\'s Divine Guidance move',
      },
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'STR',
        condition: 'Barbarian\'s Unstoppable move',
      },
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'STR',
        condition: 'Paladin\'s Divine Favor move',
      },
      {
        targetMove: 'Defy Danger',
        originalStat: 'unknown',
        substituteStat: 'STR',
        condition: 'Ranger\'s Wild Empathy move',
      },
    ],
  }

  /**
   * Get all stat substitution options available to a character for a specific move
   */
  static getStatSubstitutions(character: Character, moveName: string): StatSubstitution[] {
    const substitutions: StatSubstitution[] = []

    if (!character.knownMoves || character.knownMoves.length === 0) {
      return substitutions
    }

    // Get the character's advanced moves (all levels up to character's level)
    const advancedMoves = getAdvancedMovesForClass(character.class, 1, character.level)
    const characterAdvancedMoves = advancedMoves.filter(move =>
      character.knownMoves.includes(move.id),
    )

    // Check for stat substitution moves
    for (const move of characterAdvancedMoves) {
      const substitution = this.parseStatSubstitutionMove(move, moveName)
      if (substitution) {
        substitutions.push(substitution)
      }
    }

    return substitutions
  }

  /**
   * Parse a move to see if it provides stat substitution for a target move
   */
  private static parseStatSubstitutionMove(move: unknown, targetMoveName: string): StatSubstitution | null {
    const description = move.description?.toLowerCase() || ''

    // Check if this move affects the target move
    if (!description.includes(targetMoveName.toLowerCase())) {
      return null
    }

    // Look for stat substitution patterns
    const statPatterns = [
      /use\s+(\w+)\s+instead\s+of\s+unknown\s+other\s+stat/i,
      /use\s+(\w+)\s+instead\s+of\s+(\w+)/i,
      /choose\s+to\s+use\s+(\w+)\s+instead/i,
      /may\s+use\s+(\w+)\s+instead/i,
    ]

    for (const pattern of statPatterns) {
      const match = description.match(pattern)
      if (match) {
        const substituteStat = match[1].toUpperCase()

        return {
          moveId: move.id,
          moveName: move.name,
          originalStat: 'unknown',
          substituteStat,
          description: move.description,
        }
      }
    }

    return null
  }

  /**
   * Get available stats for a move, including substitutions
   */
  static getAvailableStats(character: Character, moveName: string, defaultStat: string): string[] {
    const stats = [defaultStat]

    const substitutions = this.getStatSubstitutions(character, moveName)
    for (const sub of substitutions) {
      if (!stats.includes(sub.substituteStat)) {
        stats.push(sub.substituteStat)
      }
    }

    return stats
  }

  /**
   * Check if a character has stat substitution for a specific move
   */
  static hasStatSubstitution(character: Character, moveName: string): boolean {
    return this.getStatSubstitutions(character, moveName).length > 0
  }

  /**
   * Get the best stat to use for a move (considering substitutions)
   */
  static getBestStat(character: Character, moveName: string, defaultStat: string): string {
    const substitutions = this.getStatSubstitutions(character, moveName)

    if (substitutions.length === 0) {
      return defaultStat
    }

    // Find the substitution with the highest stat value
    let bestStat = defaultStat
    let bestValue = character.attributes[defaultStat as keyof typeof character.attributes] || 0

    for (const sub of substitutions) {
      const statValue = character.attributes[sub.substituteStat as keyof typeof character.attributes] || 0
      if (statValue > bestValue) {
        bestValue = statValue
        bestStat = sub.substituteStat
      }
    }

    return bestStat
  }

  /**
   * Get substitution explanation for UI display
   */
  static getSubstitutionExplanation(character: Character, moveName: string, selectedStat: string): string | null {
    const substitutions = this.getStatSubstitutions(character, moveName)
    const substitution = substitutions.find(sub => sub.substituteStat === selectedStat)

    if (substitution) {
      return `Using ${selectedStat} due to: ${substitution.moveName}`
    }

    return null
  }
}

export default StatSubstitutionService
