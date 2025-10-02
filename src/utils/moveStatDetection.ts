/**
 * Smart Move Stat Detection
 * Analyzes moves and provides stat suggestions with ambiguity resolution
 */

import type { Attributes } from '../models/Character'

export interface StatOption {
  stat: keyof Attributes
  reason: string
  confidence: 'high' | 'medium' | 'low'
  examples: string[]
}

export interface MoveStatAnalysis {
  primaryStat?: keyof Attributes // Most common/default stat
  alternatives: StatOption[] // Other valid stats
  isAmbiguous: boolean // Whether the move can use multiple stats
  requiresChoice: boolean // Whether user input is needed
}

// Comprehensive move definitions with stat flexibility
const MOVE_STAT_MAPPING: Record<string, MoveStatAnalysis> = {
  // Basic Moves
  'hack-and-slash': {
    primaryStat: 'STR',
    alternatives: [
      { stat: 'STR', reason: 'Melee weapon attack with strength', confidence: 'high', examples: ['sword', 'axe', 'club'] },
      { stat: 'DEX', reason: 'Finesse weapon or precise strike', confidence: 'medium', examples: ['rapier', 'dagger', 'precise thrust'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  'volley': {
    primaryStat: 'DEX',
    alternatives: [
      { stat: 'DEX', reason: 'Ranged weapon attack', confidence: 'high', examples: ['bow', 'crossbow', 'thrown weapon'] },
      { stat: 'STR', reason: 'Heavy thrown weapon', confidence: 'low', examples: ['javelin', 'heavy spear'] },
    ],
    isAmbiguous: false,
    requiresChoice: false,
  },

  'defend': {
    primaryStat: 'CON',
    alternatives: [
      { stat: 'CON', reason: 'Physical endurance and toughness', confidence: 'high', examples: ['shield wall', 'taking hits'] },
      { stat: 'DEX', reason: 'Agile defense and dodging', confidence: 'medium', examples: ['parrying', 'deflecting'] },
      { stat: 'STR', reason: 'Overpowering attackers', confidence: 'low', examples: ['pushing back', 'breaking weapons'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  'spout-lore': {
    primaryStat: 'INT',
    alternatives: [
      { stat: 'INT', reason: 'Book learning and education', confidence: 'high', examples: ['scholarly knowledge', 'research'] },
      { stat: 'WIS', reason: 'Life experience and wisdom', confidence: 'medium', examples: ['folk wisdom', 'intuition'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  'discern-realities': {
    primaryStat: 'WIS',
    alternatives: [
      { stat: 'WIS', reason: 'Perception and awareness', confidence: 'high', examples: ['noticing details', 'sensing danger'] },
      { stat: 'INT', reason: 'Analysis and deduction', confidence: 'medium', examples: ['logical reasoning', 'investigation'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  'parley': {
    primaryStat: 'CHA',
    alternatives: [
      { stat: 'CHA', reason: 'Persuasion and social influence', confidence: 'high', examples: ['charm', 'intimidation', 'diplomacy'] },
      { stat: 'INT', reason: 'Logical argument and reasoning', confidence: 'medium', examples: ['debate', 'presenting facts'] },
      { stat: 'WIS', reason: 'Reading people and empathy', confidence: 'medium', examples: ['understanding motivations', 'emotional appeal'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  'aid-or-interfere': {
    primaryStat: 'CON', // This is actually based on bonds, but we'll use CON as default
    alternatives: [
      { stat: 'CON', reason: 'Default stat for aid/interfere', confidence: 'medium', examples: ['general assistance'] },
      { stat: 'STR', reason: 'Physical assistance', confidence: 'medium', examples: ['helping lift', 'physical support'] },
      { stat: 'DEX', reason: 'Precise assistance', confidence: 'medium', examples: ['steady hands', 'timing'] },
      { stat: 'INT', reason: 'Strategic assistance', confidence: 'medium', examples: ['tactical advice', 'knowledge'] },
      { stat: 'WIS', reason: 'Wise guidance', confidence: 'medium', examples: ['insight', 'intuition'] },
      { stat: 'CHA', reason: 'Inspirational support', confidence: 'medium', examples: ['encouragement', 'leadership'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },

  // Special Moves (examples)
  'defy-danger': {
    alternatives: [
      { stat: 'STR', reason: 'Power through with muscle', confidence: 'high', examples: ['breaking free', 'forcing doors'] },
      { stat: 'DEX', reason: 'Quick reflexes and agility', confidence: 'high', examples: ['dodging', 'acrobatics'] },
      { stat: 'CON', reason: 'Endure through toughness', confidence: 'high', examples: ['resisting poison', 'holding breath'] },
      { stat: 'INT', reason: 'Think your way out', confidence: 'high', examples: ['puzzle solving', 'quick thinking'] },
      { stat: 'WIS', reason: 'Intuition and awareness', confidence: 'high', examples: ['sensing danger', 'trusting instincts'] },
      { stat: 'CHA', reason: 'Force of personality', confidence: 'high', examples: ['inspiring others', 'commanding respect'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  },
}

// Class-specific move mappings
const CLASS_MOVES: Record<string, Record<string, MoveStatAnalysis>> = {
  fighter: {
    'bend-bars-lift-gates': {
      primaryStat: 'STR',
      alternatives: [
        { stat: 'STR', reason: 'Pure strength feat', confidence: 'high', examples: ['raw power'] },
      ],
      isAmbiguous: false,
      requiresChoice: false,
    },
  },
  thief: {
    'trap-expert': {
      primaryStat: 'DEX',
      alternatives: [
        { stat: 'DEX', reason: 'Careful manipulation', confidence: 'high', examples: ['disarming traps'] },
        { stat: 'INT', reason: 'Understanding mechanisms', confidence: 'medium', examples: ['analyzing trap design'] },
      ],
      isAmbiguous: true,
      requiresChoice: true,
    },
  },
  // Add more classes as needed
}

export function getStatOptionsForMove(moveId: string, characterClass?: string): MoveStatAnalysis {
  // Check class-specific moves first
  if (characterClass && CLASS_MOVES[characterClass]?.[moveId]) {
    return CLASS_MOVES[characterClass][moveId]
  }

  // Fall back to basic moves
  if (MOVE_STAT_MAPPING[moveId]) {
    return MOVE_STAT_MAPPING[moveId]
  }

  // Default fallback - most moves use the character's choice
  return {
    alternatives: [
      { stat: 'STR', reason: 'Physical approach', confidence: 'medium', examples: ['force', 'power'] },
      { stat: 'DEX', reason: 'Agile approach', confidence: 'medium', examples: ['speed', 'precision'] },
      { stat: 'CON', reason: 'Endurance approach', confidence: 'medium', examples: ['persistence', 'toughness'] },
      { stat: 'INT', reason: 'Intellectual approach', confidence: 'medium', examples: ['knowledge', 'analysis'] },
      { stat: 'WIS', reason: 'Intuitive approach', confidence: 'medium', examples: ['wisdom', 'awareness'] },
      { stat: 'CHA', reason: 'Social approach', confidence: 'medium', examples: ['personality', 'influence'] },
    ],
    isAmbiguous: true,
    requiresChoice: true,
  }
}

export function suggestBestStat(moveId: string, characterStats: Partial<Record<keyof Attributes, number>>, characterClass?: string): keyof Attributes {
  const analysis = getStatOptionsForMove(moveId, characterClass)

  // If there's a primary stat and it's not ambiguous, use it
  if (analysis.primaryStat && !analysis.isAmbiguous) {
    return analysis.primaryStat
  }

  // Find the highest stat among the alternatives
  let bestStat: keyof Attributes = 'STR'
  let bestValue = characterStats.STR || 10

  analysis.alternatives.forEach((option) => {
    const statValue = characterStats[option.stat] || 10
    if (statValue > bestValue || (statValue === bestValue && option.confidence === 'high')) {
      bestStat = option.stat
      bestValue = statValue
    }
  })

  return bestStat
}

export function getMoveAmbiguityLevel(moveId: string, characterClass?: string): 'none' | 'low' | 'high' {
  const analysis = getStatOptionsForMove(moveId, characterClass)

  if (!analysis.isAmbiguous)
    return 'none'

  const highConfidenceOptions = analysis.alternatives.filter(opt => opt.confidence === 'high')
  return highConfidenceOptions.length > 1 ? 'high' : 'low'
}

// Helper for UI components
export function formatStatExplanation(option: StatOption): string {
  return `${option.stat}: ${option.reason} (${option.examples.join(', ')})`
}
