/**
 * Smart Move Suggestion Service * Provides context-aware move recommendations and build analysis
 */

import { Move, BASIC_MOVES, SPECIAL_MOVES } from '../models/Move';
import { Character } from '../models/Character';
import { DiceRoll } from './DiceRollingService';

export interface MoveSuggestion {
  move: Move;
  relevance: number; // 0-100 score
  reason: string;
  context: SuggestionContext;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SuggestionContext {
  situation: GameSituation;
  characterState: CharacterAnalysis;
  recentHistory: DiceRoll[];
  environmentalFactors: string[];
}

export type GameSituation =
  | 'combat'
  | 'exploration'
  | 'social'
  | 'danger'
  | 'investigation'
  | 'rest'
  | 'unknown';

export interface CharacterAnalysis {
  strongestStat: keyof Character['attributes'];
  weakestStat: keyof Character['attributes'];
  preferredMoves: string[];
  recentPerformance: 'excellent' | 'good' | 'poor' | 'mixed';
  missingEssentials: string[];
  buildSynergies: string[];
}

export interface BuildRecommendation {
  type: 'stat_focus' | 'move_synergy' | 'equipment_upgrade' | 'playstyle_tip';
  title: string;
  description: string;
  priority: number;
  moves?: Move[];
}

export class SmartMoveSuggestionService {
  private situationKeywords: Map < GameSituation, string[]> = new Map([
    ['combat', ['attack', 'damage', 'enemy', 'fight', 'battle', 'weapon', 'armor', 'defend']],
    ['exploration', ['search', 'investigate', 'explore', 'discover', 'hidden', 'secret', 'trap']],
    ['social', ['talk', 'convince', 'persuade', 'negotiate', 'lie', 'charm', 'intimidate']],
    ['danger', ['danger', 'threat', 'risk', 'hazard', 'peril', 'avoid', 'escape', 'survive']],
    ['investigation', ['clue', 'mystery', 'examine', 'study', 'analyze', 'deduce', 'solve']],
    ['rest', ['rest', 'camp', 'heal', 'recover', 'sleep', 'downtime', 'prepare']],
  ]);

  private moveContexts: Map < string, GameSituation[]> = new Map([
    ['hack-and-slash', ['combat']],
    ['volley', ['combat']],
    ['defend', ['combat', 'danger']],
    ['defy-danger', ['danger', 'combat', 'exploration']],
    ['spout-lore', ['investigation', 'exploration']],
    ['discern-realities', ['investigation', 'exploration', 'danger']],
    ['parley', ['social']],
    ['aid-or-interfere', ['combat', 'social', 'exploration']],
    ['make-camp', ['rest']],
  ]);

  /**
   * Get move suggestions based on current context
   */
  getSuggestions(
    character: Character,
    situation: GameSituation = 'unknown',
    recentRolls: DiceRoll[] = [],
    contextDescription?: string,
  ): MoveSuggestion[] {
    const analysis = this.analyzeCharacter(character, recentRolls);
    const detectedSituation = contextDescription ?
      this.detectSituation(contextDescription) : situation;

    const context: SuggestionContext = {
      situation: detectedSituation,
      characterState: analysis,
      recentHistory: recentRolls.slice(-5), // Last 5 rolls
      environmentalFactors: this.extractEnvironmentalFactors(contextDescription),
    };

    const suggestions: MoveSuggestion[] = [];

    // Get all available moves
    const allMoves = this.getAllAvailableMoves(character);

    // Score each move for relevance
    for (const move of allMoves) {
      const suggestion = this.scoreMoveRelevance(move, context, character);
      if (suggestion.relevance > 20) { // Only suggest moves with decent relevance
        suggestions.push(suggestion);
      }
    }

    // Sort by relevance and return top suggestions
    return suggestions
      .sort((a, b) => b.relevance-a.relevance)
      .slice(0, 8); // Top 8 suggestions
  }

  /**
   * Analyze character build and provide recommendations
   */
  analyzeBuild(character: Character, recentRolls: DiceRoll[] = []): BuildRecommendation[] {
    const recommendations: BuildRecommendation[] = [];
    const analysis = this.analyzeCharacter(character, recentRolls);

    // Stat focus recommendations
    if (this.getStatModifier(character.attributes[analysis.strongestStat]) >= 2) {
      recommendations.push({
        type: 'stat_focus',
        title: `${analysis.strongestStat} Specialist`,
        description: `Your ${analysis.strongestStat} is excellent ! Focus on moves that use this stat.`,
        priority: 80,
        moves: this.getMovesForStat(analysis.strongestStat),
      });
    }

    // Weak stat recommendations
    if (this.getStatModifier(character.attributes[analysis.weakestStat]) <= -1) {
      recommendations.push({
        type: 'stat_focus',
        title: `Shore Up ${analysis.weakestStat}`,
        description: `Your ${analysis.weakestStat} is low. Consider avoiding moves that rely on it or find ways to boost it.`,
        priority: 60,
      });
    }

    // Performance-based recommendations
    if (analysis.recentPerformance === 'poor') {
      recommendations.push({
        type: 'playstyle_tip',
        title: 'Consider Different Approaches',
        description: 'Recent rolls have been tough. Try using Aid / Interfere with allies or look for environmental advantages.',
        priority: 70,
      });
    }

    // Build synergy recommendations
    for (const synergy of analysis.buildSynergies) {
      recommendations.push({
        type: 'move_synergy',
        title: `${synergy} Synergy`,
        description: `Your build works well with ${synergy.toLowerCase()} strategies.`,
        priority: 50,
      });
    }

    return recommendations.sort((a, b) => b.priority-a.priority);
  }

  /**
   * Get contextual tips for a specific move
   */
  getMoveAdvice(move: Move, character: Character, situation: GameSituation): string[] {
    const advice: string[] = [];
    const statMod = move.rollStat ? this.getStatModifier(character.attributes[move.rollStat]) : 0;

    // Stat-based advice
    if (move.rollStat) {
      if (statMod >= 2) {
        advice.push(`Your ${move.rollStat} (+${statMod}) makes this move very reliable!`);
      } else if (statMod <= -1) {
        advice.push(`Your ${move.rollStat} (${statMod}) makes this move risky. Consider getting help.`);
      }
    }

    // Situational advice
    const moveContexts = this.moveContexts.get(move.id) || [];
    if (moveContexts.includes(situation)) {
      advice.push(`Perfect for ${situation} situations!`);
    } else if (situation !== 'unknown') {
      advice.push(`This might not be ideal for ${situation}-consider alternatives.`);
    }

    // Move-specific advice
    switch (move.id) {
      case 'hack-and - slash':
        advice.push('Remember: you deal damage on 7+, but take damage on 7-9.');
        break;
      case 'defy-danger':
        advice.push('Choose the stat that best fits how you\'re avoiding the danger.');
        break;
      case 'aid-or-interfere':
        advice.push('Requires a bond with the target. +1 forward on 10+, +1 or-2 on 7-9.');
        break;
      case 'spout-lore':
        advice.push('Great for getting useful information from the GM.');
        break;
    }

    return advice;
  }

  /**
   * Private helper methods
   */
  private analyzeCharacter(character: Character, recentRolls: DiceRoll[]): CharacterAnalysis {
    const stats = character.attributes;
    const statEntries = Object.entries(stats) as [keyof typeof stats, number][];

    // Find strongest and weakest stats
    const sortedStats = statEntries.sort((a, b) => b[1]-a[1]);
    const strongestStat = sortedStats[0][0];
    const weakestStat = sortedStats[sortedStats.length-1][0];

    // Analyze recent performance
    const recentResults = recentRolls.slice(-10).map(r => r.result);
    const successCount = recentResults.filter(r => r === 'success').length;
    const failureCount = recentResults.filter(r => r === 'failure').length;

    let recentPerformance: CharacterAnalysis['recentPerformance'];
    if (successCount >= failureCount * 2) recentPerformance = 'excellent';
    else if (successCount > failureCount) recentPerformance = 'good';
    else if (failureCount > successCount * 2) recentPerformance = 'poor';
    else recentPerformance = 'mixed';

    // Find preferred moves (most used recently)
    const moveUsage = new Map < string, number>();
    recentRolls.forEach(roll => {
      if (roll.move) {
        moveUsage.set(roll.move.id, (moveUsage.get(roll.move.id) || 0) + 1);
      }
    });
    const preferredMoves = Array.from(moveUsage.entries())
      .sort((a, b) => b[1]-a[1])
      .slice(0, 3)
      .map(([moveId]) => moveId);

    // Identify missing essentials
    const missingEssentials: string[] = [];
    if (this.getStatModifier(stats.CON) < 0) missingEssentials.push('Low Constitution-consider defensive moves');
    if (this.getStatModifier(stats.WIS) < 0) missingEssentials.push('Low Wisdom-be careful with perception');

    // Build synergies (simplified)
    const buildSynergies: string[] = [];
    if (this.getStatModifier(stats.STR) >= 1 && this.getStatModifier(stats.CON) >= 1) {
      buildSynergies.push('Warrior');
    }
    if (this.getStatModifier(stats.INT) >= 1 && this.getStatModifier(stats.WIS) >= 1) {
      buildSynergies.push('Scholar');
    }
    if (this.getStatModifier(stats.DEX) >= 1 && this.getStatModifier(stats.CHA) >= 1) {
      buildSynergies.push('Trickster');
    }

    return {
      strongestStat,
      weakestStat,
      preferredMoves,
      recentPerformance,
      missingEssentials,
      buildSynergies,
    };
  }

  private detectSituation(description: string): GameSituation {
    const lowerDesc = description.toLowerCase();

    for (const [situation, keywords] of this.situationKeywords.entries()) {
      const matchCount = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (matchCount >= 2) {
        return situation;
      }
    }

    return 'unknown';
  }

  private extractEnvironmentalFactors(description?: string): string[] {
    if (!description) return [];

    const factors: string[] = [];
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('dark')) factors.push('darkness');
    if (lowerDesc.includes('loud') || lowerDesc.includes('noise')) factors.push('noise');
    if (lowerDesc.includes('crowd')) factors.push('crowded');
    if (lowerDesc.includes('trap')) factors.push('trapped');
    if (lowerDesc.includes('magic')) factors.push('magical');

    return factors;
  }

  private getAllAvailableMoves(character: Character): Move[] {
    const moves: Move[] = [];

    // Add basic moves
    BASIC_MOVES.forEach(partialMove => {
      if (partialMove.name) {
        moves.push({
          id: `basic-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove,
        } as Move);
      }
    });

    // Add special moves
    SPECIAL_MOVES.forEach(partialMove => {
      if (partialMove.name) {
        moves.push({
          id: `special-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove,
        } as Move);
      }
    });

    // TODO: Add character's known class moves

    return moves;
  }

  private scoreMoveRelevance(
    move: Move,
    context: SuggestionContext,
    character: Character,
  ): MoveSuggestion {
    let relevance = 0;
    let reason = '';
    let priority: MoveSuggestion['priority'] = 'low';

    // Base relevance for move type
    const moveContexts = this.moveContexts.get(move.id) || [];
    if (moveContexts.includes(context.situation)) {
      relevance += 40;
      reason = `Perfect for ${context.situation} situations`;
      priority = 'high';
    } else if (context.situation === 'unknown') {
      relevance += 20;
      reason = 'Generally useful move';
    }

    // Stat compatibility
    if (move.rollStat) {
      const statMod = this.getStatModifier(character.attributes[move.rollStat]);
      relevance += Math.max(0, statMod * 10 + 20); // +20 base, +10 per modifier point

      if (statMod >= 2) {
        reason += ` (excellent ${move.rollStat} +${statMod})`;
        priority = priority === 'low' ? 'medium' : priority;
      } else if (statMod <= -1) {
        relevance -= 15;
        reason += ` (risky with ${move.rollStat} ${statMod})`;
      }
    }

    // Recent usage patterns
    const recentMoveUse = context.recentHistory.filter(r => r.move?.id === move.id).length;
    if (recentMoveUse > 0) {
      relevance -= recentMoveUse * 5; // Slight penalty for overuse
      reason += ` (used ${recentMoveUse} times recently)`;
    }

    // Performance-based adjustments
    if (context.characterState.recentPerformance === 'poor' && move.id === 'aid-or-interfere') {
      relevance += 15;
      reason += ' (consider getting help)';
      priority = 'medium';
    }

    // Environmental factors
    for (const factor of context.environmentalFactors) {
      if (factor === 'darkness' && move.rollStat === 'WIS') {
        relevance += 10;
        reason += ' (useful in darkness)';
      }
    }

    // Ensure minimum relevance for basic moves
    if (move.category === 'basic' && relevance < 30) {
      relevance = 30;
    }

    return {
      move,
      relevance: Math.min(100, Math.max(0, relevance)),
      reason: reason || 'Available move',
      context,
      priority,
    };
  }

  private getMovesForStat(stat: keyof Character['attributes']): Move[] {
    return this.getAllAvailableMoves({} as Character)
      .filter(move => move.rollStat === stat);
  }

  private getStatModifier(statValue: number): number {
    if (statValue <= 3) return -3;
    if (statValue <= 5) return -2;
    if (statValue <= 8) return -1;
    if (statValue <= 12) return 0;
    if (statValue <= 15) return 1;
    if (statValue <= 17) return 2;
    return 3;
  }
}

// Singleton instance
export const smartMoveSuggestionService = new SmartMoveSuggestionService();
