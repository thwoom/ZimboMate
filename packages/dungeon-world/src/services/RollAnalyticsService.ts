/**
 * Roll Analytics Service * Tracks roll performance, streaks, and provides insights
 */

import { RollResult } from '../models/Move';
import { DiceRoll } from './DiceRollingService';

export interface RollStats {
  totalRolls: number;
  successRate: number;
  partialRate: number;
  failureRate: number;
  averageRoll: number;
  bestStreak: number;
  worstStreak: number;
  currentStreak: { type: 'success' | 'failure' | 'mixed'; count: number };
}

export interface MoveStats extends RollStats {
  moveId: string;
  moveName: string;
  lastUsed: number;
  timesUsed: number;
}

export interface CharacterStats extends RollStats {
  characterId: string;
  characterName: string;
  xpGained: number;
  favoriteMove?: string;
  luckiestStat?: string;
  moveStats: Map < string, MoveStats>;
}

export interface SessionStats {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalRolls: number;
  xpGained: number;
  dramaticMoments: DiceRoll[]; // Natural 12s, snake eyes, etc.
  characterStats: Map < string, CharacterStats>;
}

export interface RollInsight {
  type: 'streak' | 'performance' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
  data?: unknown;
}

export class RollAnalyticsService {
  private sessionStats: Map < string, SessionStats> = new Map();
  private currentSessionId: string | null = null;
  private rollStreaks: Map < string, { type: RollResult; count: number }> = new Map();

  /**
   * Start a new session
   */
  startSession(sessionId?: string): string {
    const _id = sessionId || `session_${Date.now()}`;
    this.currentSessionId = id;

    const session: SessionStats = {
      sessionId: id,
      startTime: Date.now(),
      totalRolls: 0,
      xpGained: 0,
      dramaticMoments: [],
      characterStats: new Map(),
    };

    this.sessionStats.set(id, session);
    return id;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.currentSessionId) {
      const session = this.sessionStats.get(this.currentSessionId);
      if (session) {
        session.endTime = Date.now();
      }
      this.currentSessionId = null;
    }
  }

  /**
   * Record a roll for analytics
   */
  recordRoll(roll: DiceRoll): RollInsight[] {
    const insights: RollInsight[] = [];

    if (!this.currentSessionId) {
      this.startSession();
    }

    const session = this.sessionStats.get(this.currentSessionId!);
    if (!session) return insights;

    // Update session stats
    session.totalRolls++;

    // Track XP gains
    if (roll.result === 'failure' && roll.move) {
      session.xpGained++;
    }

    // Track dramatic moments
    if (this.isDramaticRoll(roll)) {
      session.dramaticMoments.push(roll);
      insights.push(this.createDramaticMomentInsight(roll));
    }

    // Update character stats
    if (roll.character) {
      this.updateCharacterStats(session, roll);
    }

    // Check for streaks
    const streakInsights = this.updateStreaks(roll);
    insights.push(...streakInsights);

    // Performance insights
    const performanceInsights = this.analyzePerformance(roll);
    insights.push(...performanceInsights);

    return insights;
  }

  /**
   * Get current session stats
   */
  getCurrentSessionStats(): SessionStats | null {
    if (!this.currentSessionId) return null;
    return this.sessionStats.get(this.currentSessionId) || null;
  }

  /**
   * Get character stats for current session
   */
  getCharacterStats(characterId: string): CharacterStats | null {
    const session = this.getCurrentSessionStats();
    if (!session) return null;
    return session.characterStats.get(characterId) || null;
  }

  /**
   * Get move performance stats
   */
  getMoveStats(moveId: string, characterId?: string): MoveStats | null {
    if (characterId) {
      const charStats = this.getCharacterStats(characterId);
      return charStats?.moveStats.get(moveId) || null;
    }

    // Aggregate across all characters
    const session = this.getCurrentSessionStats();
    if (!session) return null;

    let aggregated: MoveStats | null = null;
    for (const charStats of session.characterStats.values()) {
      const moveStats = charStats.moveStats.get(moveId);
      if (moveStats) {
        if (!aggregated) {
          aggregated = { ...moveStats };
        } else {
          // Combine stats
          aggregated.totalRolls += moveStats.totalRolls;
          aggregated.timesUsed += moveStats.timesUsed;
          // Recalculate rates
          // This is simplified-in reality you'd track raw counts
        }
      }
    }

    return aggregated;
  }

  /**
   * Get insights for character or session
   */
  getInsights(characterId?: string): RollInsight[] {
    const insights: RollInsight[] = [];
    const session = this.getCurrentSessionStats();
    if (!session) return insights;

    if (characterId) {
      const charStats = this.getCharacterStats(characterId);
      if (charStats) {
        insights.push(...this.generateCharacterInsights(charStats));
      }
    } else {
      insights.push(...this.generateSessionInsights(session));
    }

    return insights;
  }

  /**
   * Private helper methods
   */
  private isDramaticRoll(roll: DiceRoll): boolean {
    if (roll.dice.length === 2) {
      const [d1, d2] = roll.dice as [number, number];
      return (d1 === 6 && d2 === 6) || (d1 === 1 && d2 === 1) || roll.total >= 15 || roll.total <= 3;
    }
    return false;
  }

  private createDramaticMomentInsight(roll: DiceRoll): RollInsight {
    const [d1, d2] = roll.dice as [number, number];

    if (d1 === 6 && d2 === 6) {
      return {
        type: 'milestone',
        title: '🎲 Snake Eyes! (Double 6s)',
        description: `Rolled double 6s${roll.move ? ` on ${roll.move.name}` : ''}! Epic success!`,
        severity: 'success',
      };
    }

    if (d1 === 1 && d2 === 1) {
      return {
        type: 'milestone',
        title: '💀 Snake Eyes! (Double 1s)',
        description: `Rolled double 1s${roll.move ? ` on ${roll.move.name}` : ''}! Dramatic failure!`,
        severity: 'danger',
      };
    }

    if (roll.total >= 15) {
      return {
        type: 'milestone',
        title: '⭐ Incredible Roll!',
        description: `Rolled ${roll.total} total ! Amazing success!`,
        severity: 'success',
      };
    }

    return {
      type: 'milestone',
      title: '💥 Dramatic Failure',
      description: `Rolled ${roll.total} total. Things are about to get interesting...`,
      severity: 'danger',
    };
  }

  private updateCharacterStats(session: SessionStats, roll: DiceRoll): void {
    if (!roll.character) return;

    let charStats = session.characterStats.get(roll.character);
    if (!charStats) {
      charStats = {
        characterId: roll.character,
        characterName: roll.character, // Would get from character data
        totalRolls: 0,
        successRate: 0,
        partialRate: 0,
        failureRate: 0,
        averageRoll: 0,
        bestStreak: 0,
        worstStreak: 0,
        currentStreak: { type: 'mixed', count: 0 },
        xpGained: 0,
        moveStats: new Map(),
      };
      session.characterStats.set(roll.character, charStats);
    }

    // Update character roll stats
    charStats.totalRolls++;
    if (roll.result === 'failure') charStats.xpGained++;

    // Update move stats
    if (roll.move) {
      this.updateMoveStats(charStats, roll);
    }

    // Recalculate rates (simplified)
    this.recalculateStats(charStats);
  }

  private updateMoveStats(charStats: CharacterStats, roll: DiceRoll): void {
    if (!roll.move) return;

    let moveStats = charStats.moveStats.get(roll.move.id);
    if (!moveStats) {
      moveStats = {
        moveId: roll.move.id,
        moveName: roll.move.name,
        totalRolls: 0,
        successRate: 0,
        partialRate: 0,
        failureRate: 0,
        averageRoll: 0,
        bestStreak: 0,
        worstStreak: 0,
        currentStreak: { type: 'mixed', count: 0 },
        lastUsed: roll.timestamp,
        timesUsed: 0,
      };
      charStats.moveStats.set(roll.move.id, moveStats);
    }

    moveStats.totalRolls++;
    moveStats.timesUsed++;
    moveStats.lastUsed = roll.timestamp;

    this.recalculateStats(moveStats);
  }

  private recalculateStats(stats: RollStats): void {
    // This is a simplified version-in reality you'd track raw counts
    // For now, just placeholder logic
    stats.successRate = Math.random() * 100; // Would calculate from actual data
    stats.partialRate = Math.random() * 100;
    stats.failureRate = 100 - stats.successRate-stats.partialRate;
    stats.averageRoll = 7 + Math.random() * 6; // Would calculate from actual rolls
  }

  private updateStreaks(roll: DiceRoll): RollInsight[] {
    const insights: RollInsight[] = [];
    const characterId = roll.character || 'unknown';

    const currentStreak = this.rollStreaks.get(characterId) || { type: roll.result, count: 0 };

    if (currentStreak.type === roll.result) {
      currentStreak.count++;
    } else {
      // Streak broken, check if it was notable
      if (currentStreak.count >= 3) {
        insights.push({
          type: 'streak',
          title: `${currentStreak.type === 'success' ? '🔥' : '💀'} Streak Ended`,
          description: `${currentStreak.count} ${currentStreak.type}es in a row ended`,
          severity: currentStreak.type === 'success' ? 'success' : 'danger',
        });
      }

      // Start new streak
      currentStreak.type = roll.result;
      currentStreak.count = 1;
    }

    this.rollStreaks.set(characterId, currentStreak);

    // Check for ongoing streaks
    if (currentStreak.count >= 3 && currentStreak.count % 2 === 1) {
      insights.push({
        type: 'streak',
        title: `${currentStreak.type === 'success' ? '🔥' : '💀'} ${currentStreak.count} in a Row!`,
        description: `Currently on a ${currentStreak.count} ${currentStreak.type} streak`,
        severity: currentStreak.type === 'success' ? 'success' : 'warning',
      });
    }

    return insights;
  }

  private analyzePerformance(roll: DiceRoll): RollInsight[] {
    const insights: RollInsight[] = [];

    // Check for consistently low / high rolls
    if (roll.total <= 4 && roll.result === 'failure') {
      insights.push({
        type: 'suggestion',
        title: '💡 Consider Different Approach',
        description: 'Low roll-maybe try a different stat or get help from allies?',
        severity: 'info',
      });
    }

    if (roll.total >= 12 && roll.result === 'success') {
      insights.push({
        type: 'performance',
        title: '⭐ Excellent Roll!',
        description: 'High roll-you\'re on fire!',
        severity: 'success',
      });
    }

    return insights;
  }

  private generateCharacterInsights(charStats: CharacterStats): RollInsight[] {
    const insights: RollInsight[] = [];

    if (charStats.successRate > 70) {
      insights.push({
        type: 'performance',
        title: '🎯 High Performer',
        description: `${charStats.successRate.toFixed(1)}% success rate-excellent!`,
        severity: 'success',
      });
    }

    if (charStats.xpGained >= 3) {
      insights.push({
        type: 'milestone',
        title: '📈 Learning Experience',
        description: `Gained ${charStats.xpGained} XP this session from failures`,
        severity: 'info',
      });
    }

    return insights;
  }

  private generateSessionInsights(session: SessionStats): RollInsight[] {
    const insights: RollInsight[] = [];

    if (session.totalRolls >= 20) {
      insights.push({
        type: 'milestone',
        title: '🎲 Active Session',
        description: `${session.totalRolls} total rolls-lots of action!`,
        severity: 'info',
      });
    }

    if (session.dramaticMoments.length >= 3) {
      insights.push({
        type: 'milestone',
        title: '🎭 Dramatic Session',
        description: `${session.dramaticMoments.length} dramatic moments-epic adventure!`,
        severity: 'success',
      });
    }

    return insights;
  }
}

// Singleton instance
export const rollAnalyticsService = new RollAnalyticsService();



