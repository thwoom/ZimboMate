/**
 * Character creation analytics and recommendation service
 */

import type { Attributes, Character, CharacterClass, Race } from '../models/Character'
import type { BuildEffectiveness } from './CharacterValidation'
import { characterValidationService } from './CharacterValidation'

export interface CreationAnalytics {
  buildScore: number // 0-100 overall build quality
  effectiveness: BuildEffectiveness
  recommendations: Recommendation[]
  warnings: AnalyticsWarning[]
  comparisons: BuildComparison[]
  playstyleMatch: PlaystyleAnalysis
}

export interface Recommendation {
  id: string
  type: 'attribute' | 'equipment' | 'move' | 'general'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: string
  impact: string
}

export interface AnalyticsWarning {
  id: string
  severity: 'critical' | 'moderate' | 'minor'
  title: string
  description: string
  suggestion: string
}

export interface BuildComparison {
  category: string
  yourBuild: number
  average: number
  optimal: number
  percentile: number // Where you rank vs other builds (0-100)
}

export interface PlaystyleAnalysis {
  primaryStyle: string
  secondaryStyle: string
  matchPercentage: number
  description: string
  strengths: string[]
  challenges: string[]
}

export interface PopularBuild {
  name: string
  class: CharacterClass
  race: Race
  attributes: Attributes
  popularity: number
  winRate: number
  description: string
}

class CreationAnalyticsService {
  /**
   * Analyze a character build and provide comprehensive analytics
   */
  analyzeCharacterBuild(character: Partial <Character>): CreationAnalytics {
    if (!character.class || !character.attributes) {
      return this.getEmptyAnalytics()
    }

    const effectiveness = characterValidationService.calculateBuildEffectiveness(character)
    const buildScore = this.calculateOverallBuildScore(character, effectiveness)
    const recommendations = this.generateRecommendations(character, effectiveness)
    const warnings = this.generateWarnings(character)
    const comparisons = this.generateBuildComparisons(character, effectiveness)
    const playstyleMatch = this.analyzePlaystyle(character, effectiveness)

    return {
      buildScore,
      effectiveness,
      recommendations,
      warnings,
      comparisons,
      playstyleMatch,
    }
  }

  /**
   * Calculate overall build score (0-100)
   */
  private calculateOverallBuildScore(character: Partial <Character>, effectiveness: BuildEffectiveness): number {
    let score = effectiveness.overall

    // Bonus for balanced builds
    const scores = [effectiveness.combat, effectiveness.social, effectiveness.exploration, effectiveness.magic, effectiveness.survivability]
    const variance = this.calculateVariance(scores)
    if (variance < 200) { // Low variance = balanced
      score += 5
    }

    // Penalty for very low scores in unknown area
    const minScore = Math.min(...scores)
    if (minScore < 20) {
      score -= 10
    }

    // Class-specific bonuses
    if (character.class) {
      const classBonus = this.getClassSpecificBonus(character, effectiveness)
      score += classBonus
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(character: Partial <Character>, effectiveness: BuildEffectiveness): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (!character.attributes || !character.class)
      return recommendations

    // Attribute recommendations
    const attrRecs = this.getAttributeRecommendations(character.class, character.attributes)
    recommendations.push(...attrRecs)

    // Effectiveness-based recommendations
    if (effectiveness.combat < 40) {
      recommendations.push({
        id: 'low-combat',
        type: 'general',
        priority: 'high',
        title: 'Improve Combat Effectiveness',
        description: 'Your combat ability is below average. Consider focusing on your primary combat attribute.',
        action: 'Increase STR or DEX',
        impact: 'Better damage and hit chance in combat',
      })
    }

    if (effectiveness.social < 30) {
      recommendations.push({
        id: 'low-social',
        type: 'attribute',
        priority: 'medium',
        title: 'Consider Social Skills',
        description: 'Low social effectiveness may limit roleplay opportunities.',
        action: 'Increase CHA or take social moves',
        impact: 'Better interaction with NPCs and party members',
      })
    }

    // Class-specific recommendations
    const classRecs = this.getClassSpecificRecommendations(character.class, character.attributes)
    recommendations.push(...classRecs)

    return recommendations.slice(0, 5) // Limit to top 5
  }

  /**
   * Generate warnings for potential issues
   */
  private generateWarnings(character: Partial <Character>): AnalyticsWarning[] {
    const warnings: AnalyticsWarning[] = []

    if (!character.attributes || !character.class)
      return warnings

    // Check for dump stats
    const dumpStats = Object.entries(character.attributes).filter(([_, value]) => value <= 8)
    if (dumpStats.length > 1) {
      warnings.push({
        id: 'multiple-dump - stats',
        severity: 'moderate',
        title: 'Multiple Very Low Attributes',
        description: `You have ${dumpStats.length} attributes at 8 or below: ${dumpStats.map(([attr]) => attr).join(', ')}`,
        suggestion: 'Consider redistributing points to avoid multiple weaknesses',
      })
    }

    // Class-specific warnings
    const classWarnings = this.getClassSpecificWarnings(character.class, character.attributes)
    warnings.push(...classWarnings)

    return warnings
  }

  /**
   * Generate build comparisons
   */
  private generateBuildComparisons(character: Partial <Character>, effectiveness: BuildEffectiveness): BuildComparison[] {
    const comparisons: BuildComparison[] = []

    // Compare against average builds
    const averageEffectiveness = this.getAverageEffectiveness(character.class)
    const optimalEffectiveness = this.getOptimalEffectiveness(character.class)

    comparisons.push(
      {
        category: 'Combat',
        yourBuild: effectiveness.combat,
        average: averageEffectiveness.combat,
        optimal: optimalEffectiveness.combat,
        percentile: this.calculatePercentile(effectiveness.combat, averageEffectiveness.combat),
      },
      {
        category: 'Social',
        yourBuild: effectiveness.social,
        average: averageEffectiveness.social,
        optimal: optimalEffectiveness.social,
        percentile: this.calculatePercentile(effectiveness.social, averageEffectiveness.social),
      },
      {
        category: 'Exploration',
        yourBuild: effectiveness.exploration,
        average: averageEffectiveness.exploration,
        optimal: optimalEffectiveness.exploration,
        percentile: this.calculatePercentile(effectiveness.exploration, averageEffectiveness.exploration),
      },
      {
        category: 'Survivability',
        yourBuild: effectiveness.survivability,
        average: averageEffectiveness.survivability,
        optimal: optimalEffectiveness.survivability,
        percentile: this.calculatePercentile(effectiveness.survivability, averageEffectiveness.survivability),
      },
    )

    return comparisons
  }

  /**
   * Analyze playstyle match
   */
  private analyzePlaystyle(character: Partial <Character>, effectiveness: BuildEffectiveness): PlaystyleAnalysis {
    const scores = {
      'Tank': effectiveness.survivability + effectiveness.combat * 0.5,
      'Damage Dealer': effectiveness.combat + effectiveness.magic * 0.3,
      'Support': effectiveness.social + effectiveness.magic * 0.5,
      'Scout': effectiveness.exploration + effectiveness.social * 0.3,
      'Controller': effectiveness.magic + effectiveness.exploration * 0.3,
      'Face': effectiveness.social + effectiveness.survivability * 0.2,
    }

    const sortedStyles = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)

    const primaryStyle = sortedStyles[0][0]
    const secondaryStyle = sortedStyles[1][0]
    const matchPercentage = Math.min(100, Math.round(sortedStyles[0][1]))

    return {
      primaryStyle,
      secondaryStyle,
      matchPercentage,
      description: this.getPlaystyleDescription(primaryStyle),
      strengths: this.getPlaystyleStrengths(primaryStyle),
      challenges: this.getPlaystyleChallenges(primaryStyle),
    }
  }

  /**
   * Get attribute recommendations for a class
   */
  private getAttributeRecommendations(characterClass: CharacterClass, attributes: Attributes): Recommendation[] {
    const recommendations: Recommendation[] = []

    const primaryStats: Record <CharacterClass, keyof Attributes> = {
      Fighter: 'STR',
      Paladin: 'STR',
      Barbarian: 'STR',
      Ranger: 'DEX',
      Thief: 'DEX',
      Cleric: 'WIS',
      Druid: 'WIS',
      Wizard: 'INT',
      Bard: 'CHA',
      Immolator: 'CON',
    }

    const primaryStat = primaryStats[characterClass]
    if (primaryStat && attributes[primaryStat] < 14) {
      recommendations.push({
        id: `low-${primaryStat}`,
        type: 'attribute',
        priority: 'high',
        title: `Increase ${primaryStat}`,
        description: `${characterClass}s rely heavily on ${primaryStat}. Your current score of ${attributes[primaryStat]} is below optimal.`,
        action: `Consider increasing ${primaryStat} to 15+`,
        impact: 'Significantly improves class effectiveness',
      })
    }

    return recommendations
  }

  /**
   * Get class-specific recommendations
   */
  private getClassSpecificRecommendations(characterClass: CharacterClass, attributes: Attributes): Recommendation[] {
    const recommendations: Recommendation[] = []

    switch (characterClass) {
      case 'Fighter':
        if (attributes.CON < 13) {
          recommendations.push({
            id: 'fighter-con',
            type: 'attribute',
            priority: 'medium',
            title: 'Increase Constitution',
            description: 'Fighters need good CON for survivability in melee combat.',
            action: 'Consider CON 13+',
            impact: 'More HP and better saves',
          })
        }
        break

      case 'Wizard':
        if (attributes.DEX < 12) {
          recommendations.push({
            id: 'wizard-dex',
            type: 'attribute',
            priority: 'medium',
            title: 'Improve Dexterity',
            description: 'Wizards are fragile and need DEX to avoid damage.',
            action: 'Consider DEX 12+',
            impact: 'Better AC and initiative',
          })
        }
        break

      case 'Cleric':
        if (attributes.STR < 12) {
          recommendations.push({
            id: 'cleric-str',
            type: 'attribute',
            priority: 'low',
            title: 'Consider Some Strength',
            description: 'Clerics often fight in melee and can benefit from moderate STR.',
            action: 'STR 12 + helps in combat',
            impact: 'Better melee effectiveness',
          })
        }
        break
    }

    return recommendations
  }

  /**
   * Get class-specific warnings
   */
  private getClassSpecificWarnings(characterClass: CharacterClass, attributes: Attributes): AnalyticsWarning[] {
    const warnings: AnalyticsWarning[] = []

    // Wizard with high STR is unusual
    if (characterClass === 'Wizard' && attributes.STR > 14) {
      warnings.push({
        id: 'wizard-high-str',
        severity: 'minor',
        title: 'Unusual Attribute Distribution',
        description: 'High STR is uncommon for Wizards, who typically focus on mental attributes.',
        suggestion: 'This could work for a unique "battle mage" concept, but may not be optimal',
      })
    }

    // Barbarian with high INT
    if (characterClass === 'Barbarian' && attributes.INT > 14) {
      warnings.push({
        id: 'barbarian-high-int',
        severity: 'minor',
        title: 'Unconventional Build',
        description: 'High INT is unusual for Barbarians, who typically rely on instinct over intellect.',
        suggestion: 'Consider if this fits your character concept',
      })
    }

    return warnings
  }

  /**
   * Get average effectiveness for class
   */
  private getAverageEffectiveness(characterClass?: CharacterClass): BuildEffectiveness {
    // Simulated average data-in a real app, this would come from analytics
    const averages: Record <CharacterClass, BuildEffectiveness> = {
      Fighter: { overall: 65, combat: 75, social: 45, exploration: 55, magic: 20, survivability: 70 },
      Wizard: { overall: 60, combat: 30, social: 55, exploration: 60, magic: 85, survivability: 35 },
      Cleric: { overall: 70, combat: 55, social: 65, exploration: 50, magic: 75, survivability: 65 },
      Thief: { overall: 65, combat: 60, social: 55, exploration: 80, magic: 25, survivability: 45 },
      Ranger: { overall: 68, combat: 70, social: 50, exploration: 85, magic: 40, survivability: 60 },
      Paladin: { overall: 72, combat: 70, social: 60, exploration: 45, magic: 55, survivability: 80 },
      Bard: { overall: 66, combat: 45, social: 85, exploration: 65, magic: 60, survivability: 50 },
      Druid: { overall: 64, combat: 50, social: 55, exploration: 75, magic: 70, survivability: 60 },
      Barbarian: { overall: 63, combat: 80, social: 35, exploration: 60, magic: 15, survivability: 75 },
      Immolator: { overall: 61, combat: 65, social: 45, exploration: 50, magic: 65, survivability: 55 },
    }

    return characterClass
      ? averages[characterClass]
      : { overall: 65, combat: 60, social: 55, exploration: 60, magic: 50, survivability: 60 }
  }

  /**
   * Get optimal effectiveness for class
   */
  private getOptimalEffectiveness(characterClass?: CharacterClass): BuildEffectiveness {
    // Theoretical optimal builds
    const optimal: Record <CharacterClass, BuildEffectiveness> = {
      Fighter: { overall: 85, combat: 95, social: 60, exploration: 70, magic: 30, survivability: 90 },
      Wizard: { overall: 80, combat: 45, social: 70, exploration: 75, magic: 100, survivability: 50 },
      Cleric: { overall: 88, combat: 70, social: 85, exploration: 65, magic: 95, survivability: 85 },
      Thief: { overall: 82, combat: 75, social: 70, exploration: 95, magic: 35, survivability: 60 },
      Ranger: { overall: 85, combat: 85, social: 65, exploration: 100, magic: 55, survivability: 75 },
      Paladin: { overall: 90, combat: 85, social: 80, exploration: 60, magic: 70, survivability: 95 },
      Bard: { overall: 84, combat: 60, social: 100, exploration: 80, magic: 75, survivability: 65 },
      Druid: { overall: 82, combat: 65, social: 70, exploration: 90, magic: 85, survivability: 75 },
      Barbarian: { overall: 80, combat: 100, social: 45, exploration: 75, magic: 20, survivability: 90 },
      Immolator: { overall: 78, combat: 80, social: 60, exploration: 65, magic: 80, survivability: 70 },
    }

    return characterClass
      ? optimal[characterClass]
      : { overall: 85, combat: 80, social: 75, exploration: 80, magic: 70, survivability: 80 }
  }

  /**
   * Calculate percentile ranking
   */
  private calculatePercentile(value: number, average: number): number {
    // Simplified percentile calculation
    const ratio = value / average
    if (ratio >= 1.3)
      return 90
    if (ratio >= 1.2)
      return 80
    if (ratio >= 1.1)
      return 70
    if (ratio >= 1.0)
      return 60
    if (ratio >= 0.9)
      return 40
    if (ratio >= 0.8)
      return 30
    if (ratio >= 0.7)
      return 20
    return 10
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squaredDiffs = numbers.map(n => (n - mean) ** 2)
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }

  /**
   * Get class-specific bonus
   */
  private getClassSpecificBonus(character: Partial <Character>, effectiveness: BuildEffectiveness): number {
    if (!character.class)
      return 0

    // Bonus for playing to class strengths
    const classStrengths: Record <CharacterClass, keyof BuildEffectiveness> = {
      Fighter: 'combat',
      Barbarian: 'combat',
      Paladin: 'survivability',
      Wizard: 'magic',
      Cleric: 'magic',
      Druid: 'magic',
      Thief: 'exploration',
      Ranger: 'exploration',
      Bard: 'social',
      Immolator: 'combat',
    }

    const strength = classStrengths[character.class]
    if (strength && effectiveness[strength] > 75) {
      return 5 // Bonus for excelling in class strength
    }

    return 0
  }

  /**
   * Get playstyle description
   */
  private getPlaystyleDescription(playstyle: string): string {
    const descriptions: Record <string, string> = {
      'Tank': 'You excel at protecting allies and absorbing damage in combat.',
      'Damage Dealer': 'You focus on dealing maximum damage to enemies.',
      'Support': 'You help allies succeed through buffs, healing, and assistance.',
      'Scout': 'You excel at gathering information and navigating challenges.',
      'Controller': 'You manipulate the battlefield and environment to your advantage.',
      'Face': 'You handle social interactions and negotiations for the party.',
    }

    return descriptions[playstyle] || 'You have a unique and versatile playstyle.'
  }

  /**
   * Get playstyle strengths
   */
  private getPlaystyleStrengths(playstyle: string): string[] {
    const strengths: Record <string, string[]> = {
      'Tank': ['High survivability', 'Protects allies', 'Controls enemy attention'],
      'Damage Dealer': ['High damage output', 'Ends fights quickly', 'Intimidating presence'],
      'Support': ['Keeps party healthy', 'Enhances ally abilities', 'Versatile problem solving'],
      'Scout': ['Gathers intelligence', 'Avoids danger', 'Finds hidden opportunities'],
      'Controller': ['Battlefield manipulation', 'Creative solutions', 'Tactical advantage'],
      'Face': ['Social influence', 'Information gathering', 'Conflict resolution'],
    }

    return strengths[playstyle] || ['Versatile', 'Adaptable', 'Unique approach']
  }

  /**
   * Get playstyle challenges
   */
  private getPlaystyleChallenges(playstyle: string): string[] {
    const challenges: Record <string, string[]> = {
      'Tank': ['Limited damage output', 'Relies on party support', 'Can be bypassed'],
      'Damage Dealer': ['May be fragile', 'Limited utility', 'Resource dependent'],
      'Support': ['Vulnerable alone', 'Limited direct impact', 'Party dependent'],
      'Scout': ['May lack combat power', 'Information overload', 'Risk of isolation'],
      'Controller': ['Complex to play', 'Situational abilities', 'Resource management'],
      'Face': ['Combat limitations', 'Situational usefulness', 'Pressure to perform'],
    }

    return challenges[playstyle] || ['May lack specialization', 'Jack of all trades']
  }

  /**
   * Get empty analytics for invalid characters
   */
  private getEmptyAnalytics(): CreationAnalytics {
    return {
      buildScore: 0,
      effectiveness: { overall: 0, combat: 0, social: 0, exploration: 0, magic: 0, survivability: 0 },
      recommendations: [],
      warnings: [],
      comparisons: [],
      playstyleMatch: {
        primaryStyle: 'Unknown',
        secondaryStyle: 'Unknown',
        matchPercentage: 0,
        description: 'Complete character creation to see analytics',
        strengths: [],
        challenges: [],
      },
    }
  }

  /**
   * Get popular builds for comparison
   */
  getPopularBuilds(characterClass?: CharacterClass): PopularBuild[] {
    const allBuilds: PopularBuild[] = [
      {
        name: 'Tank Fighter',
        class: 'Fighter',
        race: 'Human',
        attributes: { STR: 16, DEX: 12, CON: 15, INT: 8, WIS: 13, CHA: 9 },
        popularity: 85,
        winRate: 78,
        description: 'Classic front-line fighter focused on protection and damage',
      },
      {
        name: 'Battle Cleric',
        class: 'Cleric',
        race: 'Human',
        attributes: { STR: 14, DEX: 9, CON: 13, INT: 8, WIS: 16, CHA: 15 },
        popularity: 72,
        winRate: 82,
        description: 'Versatile healer who can hold their own in combat',
      },
      {
        name: 'Sneaky Thief',
        class: 'Thief',
        race: 'Halfling',
        attributes: { STR: 8, DEX: 16, CON: 12, INT: 15, WIS: 13, CHA: 9 },
        popularity: 68,
        winRate: 75,
        description: 'Stealthy scout with excellent utility and trap skills',
      },
    ]

    return characterClass
      ? allBuilds.filter(build => build.class === characterClass)
      : allBuilds
  }
}

export const creationAnalyticsService = new CreationAnalyticsService()
