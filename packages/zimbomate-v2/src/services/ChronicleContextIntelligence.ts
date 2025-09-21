/**
 * Chronicle Context Intelligence Engine
 *
 * This engine analyzes the current game state, recent actions, character context,
 * and story patterns to generate intelligent Chronicle prompts and suggestions.
 *
 * Key Features:
 * - Analyzes recent actions to understand narrative flow
 * - Considers character state, location, and ongoing situations
 * - Generates contextually appropriate prompt suggestions
 * - Learns from user patterns to improve future suggestions
 * - Integrates with entity recognition for @mentions
 * - Provides smart templating based on action context
 */

import { useChronicleStore } from '../stores/chronicleStore'
import { useCharacterStore } from '../stores/characterStore'
import { useGameStateStore } from '../stores/gameStateStore'
import type { ActionContext, ChronicleActionType } from './ChronicleActionListenerService'
import { chronicleTemplateService } from './ChronicleTemplateService'

// Context analysis results
export interface ContextAnalysis {
  // Current situation
  situation: 'combat' | 'exploration' | 'social' | 'downtime' | 'unknown'
  intensity: 'low' | 'medium' | 'high'

  // Character context
  characterState: {
    currentHP?: number
    maxHP?: number
    isInjured?: boolean
    hasActiveHolds?: boolean
    recentXPGains?: number
  }

  // Narrative context
  narrative: {
    currentScene?: string
    recentEvents: string[]
    emotionalTone: 'positive' | 'negative' | 'neutral' | 'tense'
    pacing: 'slow' | 'normal' | 'fast'
  }

  // Entity context
  entities: {
    recentlyMentioned: string[]
    currentLocation?: string
    nearbyCharacters?: string[]
    availableItems?: string[]
  }

  // Prompt intelligence
  promptContext: {
    shouldPromptNow: boolean
    suggestedTriggers: ChronicleActionType[]
    recommendedStyle: 'detailed' | 'concise' | 'dramatic'
    suggestedEntities: string[]
  }
}

// Template for generating contextual prompts
export interface PromptTemplate {
  id: string
  actionTypes: ChronicleActionType[]
  situation: string[]
  template: string
  variables: string[]
  priority: number
  examples: string[]
}

// Learning data to improve suggestions over time
interface UserBehaviorPattern {
  userId?: string
  actionType: ChronicleActionType
  promptAcceptanceRate: number
  preferredPromptStyle: 'detailed' | 'concise' | 'dramatic'
  commonWords: string[]
  frequentEntityTypes: string[]
  avgResponseTime: number
}

export class ChronicleContextIntelligence {
  private userPatterns: Map<string, UserBehaviorPattern> = new Map()
  private promptTemplates: PromptTemplate[] = []
  private recentAnalyses: ContextAnalysis[] = []
  private entityCache: Map<string, any> = new Map() // Cache for frequently mentioned entities

  constructor() {
    this.initializePromptTemplates()
    this.loadUserPatterns()
  }

  /**
   * Analyze the current context and generate intelligent Chronicle suggestions
   */
  async analyzeContext(recentActions: ActionContext[]): Promise<ContextAnalysis> {
    const chronicleStore = useChronicleStore.getState()
    const characterStore = useCharacterStore.getState()
    const gameState = useGameStateStore.getState()

    // Analyze current situation
    const situation = this.determineSituation(recentActions, gameState)
    const intensity = this.calculateIntensity(recentActions, situation)

    // Analyze character state
    const characterState = this.analyzeCharacterState(characterStore, gameState)

    // Analyze narrative context
    const narrative = await this.analyzeNarrativeContext(recentActions, chronicleStore)

    // Analyze entity context
    const entities = await this.analyzeEntityContext(recentActions, chronicleStore)

    // Generate prompt intelligence
    const promptContext = this.generatePromptIntelligence(
      situation,
      intensity,
      recentActions,
      narrative,
      entities
    )

    const analysis: ContextAnalysis = {
      situation,
      intensity,
      characterState,
      narrative,
      entities,
      promptContext
    }

    // Cache this analysis
    this.recentAnalyses.push(analysis)
    if (this.recentAnalyses.length > 20) {
      this.recentAnalyses.shift()
    }

    return analysis
  }

  /**
   * Generate smart prompt suggestions based on context
   */
  generateSmartPrompts(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    // Generate highly contextual suggestions based on the specific action
    const contextualSuggestions = this.generateContextualSuggestions(actionContext, contextAnalysis)

    // Add stat-specific suggestions if it's a stat roll
    const statSuggestions = this.generateStatSpecificSuggestions(actionContext, contextAnalysis)

    // Add situation-specific suggestions
    const situationSuggestions = this.generateSituationSuggestions(actionContext, contextAnalysis)

    // Combine all suggestions
    const allSuggestions = [...contextualSuggestions, ...statSuggestions, ...situationSuggestions]
    const uniqueSuggestions = allSuggestions.filter((suggestion, index) =>
      allSuggestions.indexOf(suggestion) === index
    )

    // Sort by relevance and limit results
    return this.rankSuggestions(uniqueSuggestions, actionContext, contextAnalysis).slice(0, 4)
  }

  /**
   * Generate entity mentions for @mention system
   */
  generateEntitySuggestions(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis,
    partialInput: string = ''
  ): Array<{ name: string; type: string; confidence: number }> {
    const suggestions: Array<{ name: string; type: string; confidence: number }> = []

    // Suggest recently mentioned entities
    contextAnalysis.entities.recentlyMentioned.forEach(entityName => {
      if (entityName.toLowerCase().includes(partialInput.toLowerCase())) {
        suggestions.push({
          name: entityName,
          type: 'recent',
          confidence: 0.9
        })
      }
    })

    // Suggest contextually relevant entities based on action type
    const contextualEntities = this.getContextualEntities(actionContext, contextAnalysis)
    contextualEntities.forEach(entity => {
      if (entity.name.toLowerCase().includes(partialInput.toLowerCase())) {
        suggestions.push(entity)
      }
    })

    // Sort by confidence and return top matches
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8)
  }

  /**
   * Learn from user behavior to improve future suggestions
   */
  recordUserBehavior(
    actionType: ChronicleActionType,
    promptAccepted: boolean,
    responseTime: number,
    finalText: string
  ): void {
    const userId = 'current-user' // Would get from auth system

    let pattern = this.userPatterns.get(userId)
    if (!pattern) {
      pattern = {
        actionType,
        promptAcceptanceRate: 0,
        preferredPromptStyle: 'concise',
        commonWords: [],
        frequentEntityTypes: [],
        avgResponseTime: 0
      }
    }

    // Update acceptance rate
    const currentAcceptance = pattern.promptAcceptanceRate
    pattern.promptAcceptanceRate = (currentAcceptance + (promptAccepted ? 1 : 0)) / 2

    // Update average response time
    pattern.avgResponseTime = (pattern.avgResponseTime + responseTime) / 2

    // Analyze text for patterns
    if (promptAccepted && finalText) {
      const words = finalText.toLowerCase().split(/\s+/)
      pattern.commonWords = this.updateWordFrequency(pattern.commonWords, words)

      // Determine preferred style based on text length
      if (finalText.length > 100) {
        pattern.preferredPromptStyle = 'detailed'
      } else if (finalText.length < 50) {
        pattern.preferredPromptStyle = 'concise'
      }
    }

    this.userPatterns.set(userId, pattern)
    this.saveUserPatterns()
  }

  // Private methods

  private determineSituation(
    recentActions: ActionContext[],
    gameState: any
  ): 'combat' | 'exploration' | 'social' | 'downtime' | 'unknown' {
    // Check for combat indicators
    const hasCombatActions = recentActions.some(action =>
      action.actionType === 'combat_action' ||
      action.actionType === 'damage_roll' ||
      action.combat
    )

    if (hasCombatActions || gameState?.inCombat) {
      return 'combat'
    }

    // Check for movement/exploration
    const hasMovement = recentActions.some(action =>
      action.location?.currentLocation !== action.location?.previousLocation
    )

    if (hasMovement) {
      return 'exploration'
    }

    // Check for social interaction
    const hasSocialRolls = recentActions.some(action =>
      action.diceRoll?.stat === 'CHA' ||
      action.diceRoll?.moveName?.toLowerCase().includes('parley')
    )

    if (hasSocialRolls) {
      return 'social'
    }

    // Default based on recent activity
    const recentActivity = recentActions.length > 0
    return recentActivity ? 'unknown' : 'downtime'
  }

  private calculateIntensity(
    recentActions: ActionContext[],
    situation: string
  ): 'low' | 'medium' | 'high' {
    const actionCount = recentActions.length
    const timeSpan = recentActions.length > 1
      ? recentActions[recentActions.length - 1].timestamp.getTime() - recentActions[0].timestamp.getTime()
      : 0

    // High intensity: lots of actions in short time, or combat
    if (situation === 'combat' || (actionCount >= 5 && timeSpan < 60000)) {
      return 'high'
    }

    // Medium intensity: moderate activity
    if (actionCount >= 3 || situation !== 'downtime') {
      return 'medium'
    }

    return 'low'
  }

  private analyzeCharacterState(characterStore: any, gameState: any): any {
    const activeCharacter = characterStore?.activeCharacter
    if (!activeCharacter) {
      return {}
    }

    return {
      currentHP: activeCharacter.hitPoints?.current,
      maxHP: activeCharacter.hitPoints?.max,
      isInjured: (activeCharacter.hitPoints?.current || 0) < (activeCharacter.hitPoints?.max || 0),
      hasActiveHolds: (activeCharacter.holds || []).length > 0,
      recentXPGains: 0 // Would track recent XP gains
    }
  }

  private async analyzeNarrativeContext(
    recentActions: ActionContext[],
    chronicleStore: any
  ): Promise<any> {
    const recentEntries = chronicleStore.entries.slice(-5)
    const recentEvents = recentActions.map(action => {
      if (action.diceRoll) {
        return `${action.diceRoll.type} roll: ${action.diceRoll.result}`
      }
      if (action.equipment) {
        return `${action.equipment.action} ${action.equipment.itemName}`
      }
      return `${action.actionType} action`
    })

    // Determine emotional tone from recent actions
    let emotionalTone: 'positive' | 'negative' | 'neutral' | 'tense' = 'neutral'
    const failures = recentActions.filter(a => a.diceRoll?.result === 'failure').length
    const successes = recentActions.filter(a => a.diceRoll?.result === 'success').length

    if (failures > successes) {
      emotionalTone = 'negative'
    } else if (successes > failures * 2) {
      emotionalTone = 'positive'
    } else if (recentActions.some(a => a.combat)) {
      emotionalTone = 'tense'
    }

    // Determine pacing
    const actionFrequency = recentActions.length / Math.max(1,
      (Date.now() - (recentActions[0]?.timestamp?.getTime() || Date.now())) / 60000
    )

    const pacing = actionFrequency > 2 ? 'fast' : actionFrequency < 0.5 ? 'slow' : 'normal'

    return {
      recentEvents,
      emotionalTone,
      pacing,
      currentScene: 'current scene' // Would be determined by game state
    }
  }

  private async analyzeEntityContext(
    recentActions: ActionContext[],
    chronicleStore: any
  ): Promise<any> {
    const recentEntries = chronicleStore.entries.slice(-10)
    const recentlyMentioned: string[] = []

    // Extract recently mentioned entities
    recentEntries.forEach((entry: any) => {
      if (entry.parsedEntities) {
        entry.parsedEntities.forEach((entity: any) => {
          if (!recentlyMentioned.includes(entity.name)) {
            recentlyMentioned.push(entity.name)
          }
        })
      }
    })

    return {
      recentlyMentioned: recentlyMentioned.slice(0, 10),
      currentLocation: 'current location', // Would be determined from game state
      nearbyCharacters: [], // Would be determined from game state
      availableItems: [] // Would be determined from inventory
    }
  }

  private generatePromptIntelligence(
    situation: string,
    intensity: string,
    recentActions: ActionContext[],
    narrative: any,
    entities: any
  ): any {
    // Determine if we should prompt now
    const shouldPromptNow = this.shouldPromptBasedOnContext(
      situation, intensity, recentActions, narrative
    )

    // Suggest relevant action triggers
    const suggestedTriggers: ChronicleActionType[] = []
    if (situation === 'combat') {
      suggestedTriggers.push('combat_action', 'damage_roll')
    }
    if (intensity === 'high') {
      suggestedTriggers.push('dice_roll', 'move_roll')
    }

    // Recommend style based on situation and user patterns
    let recommendedStyle: 'detailed' | 'concise' | 'dramatic' = 'concise'
    if (situation === 'combat' || intensity === 'high') {
      recommendedStyle = 'dramatic'
    } else if (narrative.pacing === 'slow') {
      recommendedStyle = 'detailed'
    }

    return {
      shouldPromptNow,
      suggestedTriggers,
      recommendedStyle,
      suggestedEntities: entities.recentlyMentioned.slice(0, 5)
    }
  }

  private shouldPromptBasedOnContext(
    situation: string,
    intensity: string,
    recentActions: ActionContext[],
    narrative: any
  ): boolean {
    // Don't prompt too frequently
    const lastPromptTime = this.getLastPromptTime()
    if (Date.now() - lastPromptTime < 10000) { // 10 seconds cooldown
      return false
    }

    // Always prompt for significant moments
    if (situation === 'combat' && intensity === 'high') {
      return true
    }

    // Prompt for dramatic moments
    if (narrative.emotionalTone === 'tense' && recentActions.length > 0) {
      return true
    }

    // Prompt for failures (learning opportunities)
    if (recentActions.some(a => a.diceRoll?.result === 'failure')) {
      return true
    }

    return false
  }

  private selectRelevantTemplates(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): PromptTemplate[] {
    return this.promptTemplates.filter(template => {
      // Match action type
      if (!template.actionTypes.includes(actionContext.actionType)) {
        return false
      }

      // Match situation
      if (!template.situation.includes(contextAnalysis.situation)) {
        return false
      }

      return true
    }).sort((a, b) => b.priority - a.priority)
  }

  private populateTemplate(
    template: PromptTemplate,
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string {
    let result = template.template

    // Replace common variables
    result = result.replace(/\{character\}/g, actionContext.characterName || 'your character')
    result = result.replace(/\{action\}/g, actionContext.actionType.replace('_', ' '))

    if (actionContext.diceRoll) {
      result = result.replace(/\{result\}/g, actionContext.diceRoll.result)
      result = result.replace(/\{stat\}/g, actionContext.diceRoll.stat || 'unknown')
      result = result.replace(/\{total\}/g, actionContext.diceRoll.total.toString())
    }

    if (actionContext.equipment) {
      result = result.replace(/\{item\}/g, actionContext.equipment.itemName)
      result = result.replace(/\{equipment_action\}/g, actionContext.equipment.action)
    }

    return result
  }

  private generateContextualSuggestions(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const suggestions: string[] = []
    const character = actionContext.characterName || 'I'

    // High-priority contextual suggestions based on action outcome and context
    if (actionContext.diceRoll) {
      const result = actionContext.diceRoll.result
      const total = actionContext.diceRoll.total
      const moveName = actionContext.diceRoll.moveName

      if (result === 'success' && total >= 12) {
        suggestions.push(`${character} exceeded expectations`)
        suggestions.push(`The success was more impressive than anticipated`)
      } else if (result === 'success') {
        suggestions.push(`${character} accomplished the goal`)
        suggestions.push(`Things went according to plan`)
      } else if (result === 'partial_success') {
        suggestions.push(`${character} succeeded, but with complications`)
        suggestions.push(`There was a cost to this success`)
      } else if (result === 'failure') {
        suggestions.push(`${character} faced an unexpected setback`)
        suggestions.push(`This didn't go as planned`)
      }

      // Move-specific context
      if (moveName) {
        if (moveName.toLowerCase().includes('hack') || moveName.toLowerCase().includes('slash')) {
          suggestions.push(`${character} struck with determination`)
          suggestions.push(`The combat was fierce and brutal`)
        } else if (moveName.toLowerCase().includes('defy')) {
          suggestions.push(`${character} refused to back down`)
          suggestions.push(`Danger was met head-on`)
        } else if (moveName.toLowerCase().includes('discern')) {
          suggestions.push(`${character} carefully observed the situation`)
          suggestions.push(`Important details became clear`)
        }
      }
    }

    return suggestions.filter(s => s.length > 0)
  }

  private generateStatSpecificSuggestions(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const suggestions: string[] = []
    const character = actionContext.characterName || 'I'

    if (actionContext.diceRoll?.stat) {
      const stat = actionContext.diceRoll.stat
      const result = actionContext.diceRoll.result

      switch (stat) {
        case 'STR':
          if (result === 'success') {
            suggestions.push(`${character} overpowered the obstacle`)
            suggestions.push(`Raw strength proved decisive`)
            suggestions.push(`Physical force was exactly what was needed`)
          } else if (result === 'failure') {
            suggestions.push(`${character} wasn't strong enough`)
            suggestions.push(`The physical challenge proved too much`)
            suggestions.push(`Brute force wasn't the answer`)
          } else {
            suggestions.push(`${character} strained with effort`)
            suggestions.push(`It required every ounce of strength`)
          }
          break

        case 'DEX':
          if (result === 'success') {
            suggestions.push(`${character} moved with perfect timing`)
            suggestions.push(`Agility and precision paid off`)
            suggestions.push(`The quick reflexes made all the difference`)
          } else if (result === 'failure') {
            suggestions.push(`${character} was too slow`)
            suggestions.push(`The timing was off`)
            suggestions.push(`Clumsiness at the worst moment`)
          } else {
            suggestions.push(`${character} managed with careful coordination`)
            suggestions.push(`It was a close call requiring dexterity`)
          }
          break

        case 'CON':
          if (result === 'success') {
            suggestions.push(`${character} endured through sheer toughness`)
            suggestions.push(`Resilience and stamina prevailed`)
            suggestions.push(`The constitution training paid off`)
          } else if (result === 'failure') {
            suggestions.push(`${character} reached physical limits`)
            suggestions.push(`The strain was too much to bear`)
            suggestions.push(`Exhaustion took its toll`)
          } else {
            suggestions.push(`${character} pushed through the discomfort`)
            suggestions.push(`It took significant physical effort`)
          }
          break

        case 'INT':
          if (result === 'success') {
            suggestions.push(`${character} figured out the solution`)
            suggestions.push(`Quick thinking saved the day`)
            suggestions.push(`The puzzle pieces fell into place`)
          } else if (result === 'failure') {
            suggestions.push(`${character} was stumped by the complexity`)
            suggestions.push(`The problem proved too challenging`)
            suggestions.push(`Logic wasn't enough this time`)
          } else {
            suggestions.push(`${character} worked through the problem`)
            suggestions.push(`It required careful analysis`)
          }
          break

        case 'WIS':
          if (result === 'success') {
            suggestions.push(`${character} trusted their instincts`)
            suggestions.push(`Experience and wisdom guided the choice`)
            suggestions.push(`The gut feeling was right`)
          } else if (result === 'failure') {
            suggestions.push(`${character} misread the situation`)
            suggestions.push(`The instincts were wrong this time`)
            suggestions.push(`Wisdom failed in this moment`)
          } else {
            suggestions.push(`${character} sensed something important`)
            suggestions.push(`Intuition provided partial clarity`)
          }
          break

        case 'CHA':
          if (result === 'success') {
            suggestions.push(`${character} was charming and persuasive`)
            suggestions.push(`The words had exactly the right effect`)
            suggestions.push(`Charisma won them over`)
          } else if (result === 'failure') {
            suggestions.push(`${character} said the wrong thing`)
            suggestions.push(`The social approach backfired`)
            suggestions.push(`Words failed to convince`)
          } else {
            suggestions.push(`${character} made some headway socially`)
            suggestions.push(`The conversation was complex`)
          }
          break
      }
    }

    return suggestions.filter(s => s.length > 0)
  }

  private generateSituationSuggestions(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const suggestions: string[] = []
    const character = actionContext.characterName || 'I'

    // Situation-based suggestions
    switch (contextAnalysis.situation) {
      case 'combat':
        if (contextAnalysis.intensity === 'high') {
          suggestions.push(`The battle reached a critical moment`)
          suggestions.push(`Adrenaline surged through the fight`)
        } else {
          suggestions.push(`The combat continued steadily`)
          suggestions.push(`Each move was calculated`)
        }
        break

      case 'exploration':
        suggestions.push(`${character} discovered something unexpected`)
        suggestions.push(`The environment revealed new details`)
        suggestions.push(`Careful exploration paid off`)
        break

      case 'social':
        suggestions.push(`The conversation took an interesting turn`)
        suggestions.push(`Social dynamics shifted`)
        suggestions.push(`Understanding grew between the participants`)
        break

      case 'downtime':
        suggestions.push(`${character} took time to reflect`)
        suggestions.push(`The quiet moment provided clarity`)
        suggestions.push(`Rest allowed for deeper thoughts`)
        break
    }

    // Emotional tone suggestions
    switch (contextAnalysis.narrative.emotionalTone) {
      case 'tense':
        suggestions.push(`Tension filled the air`)
        suggestions.push(`Everyone held their breath`)
        break
      case 'positive':
        suggestions.push(`Optimism grew stronger`)
        suggestions.push(`Things were looking up`)
        break
      case 'negative':
        suggestions.push(`The mood grew darker`)
        suggestions.push(`Concerns weighed heavily`)
        break
    }

    return suggestions.filter(s => s.length > 0)
  }

  private generatePatternBasedSuggestions(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    const suggestions: string[] = []
    const character = actionContext.characterName || 'your character'

    // Pattern-based suggestions based on user behavior
    const userId = 'current-user'
    const userPattern = this.userPatterns.get(userId)

    if (userPattern?.commonWords.length > 0) {
      const commonWord = userPattern.commonWords[0]
      suggestions.push(`${character} ${commonWord} in this moment.`)
    }

    return suggestions
  }

  private rankSuggestions(
    suggestions: string[],
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): string[] {
    // Simple ranking based on length preference and context relevance
    const userId = 'current-user'
    const userPattern = this.userPatterns.get(userId)
    const preferredStyle = userPattern?.preferredPromptStyle || 'concise'

    return suggestions.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Score based on length preference
      if (preferredStyle === 'detailed') {
        scoreA += a.length > 80 ? 10 : 0
        scoreB += b.length > 80 ? 10 : 0
      } else if (preferredStyle === 'concise') {
        scoreA += a.length < 60 ? 10 : 0
        scoreB += b.length < 60 ? 10 : 0
      }

      // Score based on context relevance
      if (contextAnalysis.entities.recentlyMentioned.some(entity =>
        a.toLowerCase().includes(entity.toLowerCase())
      )) {
        scoreA += 5
      }

      if (contextAnalysis.entities.recentlyMentioned.some(entity =>
        b.toLowerCase().includes(entity.toLowerCase())
      )) {
        scoreB += 5
      }

      return scoreB - scoreA
    })
  }

  private getContextualEntities(
    actionContext: ActionContext,
    contextAnalysis: ContextAnalysis
  ): Array<{ name: string; type: string; confidence: number }> {
    const entities: Array<{ name: string; type: string; confidence: number }> = []

    // Add character name if available
    if (actionContext.characterName) {
      entities.push({
        name: actionContext.characterName,
        type: 'character',
        confidence: 1.0
      })
    }

    // Add equipment entities
    if (actionContext.equipment) {
      entities.push({
        name: actionContext.equipment.itemName,
        type: 'item',
        confidence: 0.8
      })
    }

    // Add location entities
    if (contextAnalysis.entities.currentLocation) {
      entities.push({
        name: contextAnalysis.entities.currentLocation,
        type: 'location',
        confidence: 0.7
      })
    }

    return entities
  }

  private updateWordFrequency(currentWords: string[], newWords: string[]): string[] {
    const wordCount: Map<string, number> = new Map()

    // Count current words
    currentWords.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    // Add new words
    newWords.filter(word => word.length > 3).forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })

    // Return top words
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(entry => entry[0])
  }

  private getLastPromptTime(): number {
    // Would track when the last prompt was shown
    return Date.now() - 30000 // Placeholder
  }

  private initializePromptTemplates(): void {
    this.promptTemplates = [
      {
        id: 'dice-success-combat',
        actionTypes: ['dice_roll', 'move_roll'],
        situation: ['combat'],
        template: '{character} rolled {total} and {result}! What happens in this intense combat moment?',
        variables: ['character', 'total', 'result'],
        priority: 10,
        examples: ['Thorin rolled 12 and succeeded! What happens in this intense combat moment?']
      },
      {
        id: 'stat-roll-general',
        actionTypes: ['stat_roll'],
        situation: ['exploration', 'social', 'unknown'],
        template: 'Why did {character} need to test their {stat}? What were they trying to do?',
        variables: ['character', 'stat'],
        priority: 8,
        examples: ['Why did Thorin need to test their STR? What were they trying to do?']
      },
      {
        id: 'equipment-use-dramatic',
        actionTypes: ['equipment_use'],
        situation: ['combat', 'exploration'],
        template: '{character} used their {item} at a crucial moment. How did this change the situation?',
        variables: ['character', 'item'],
        priority: 7,
        examples: ['Thorin used their sword at a crucial moment. How did this change the situation?']
      }
      // More templates would be added here
    ]
  }

  private loadUserPatterns(): void {
    try {
      const saved = localStorage.getItem('chronicle-user-patterns')
      if (saved) {
        const patterns = JSON.parse(saved)
        this.userPatterns = new Map(Object.entries(patterns))
      }
    } catch (error) {
      console.warn('Failed to load user patterns:', error)
    }
  }

  private saveUserPatterns(): void {
    try {
      const patterns = Object.fromEntries(this.userPatterns.entries())
      localStorage.setItem('chronicle-user-patterns', JSON.stringify(patterns))
    } catch (error) {
      console.warn('Failed to save user patterns:', error)
    }
  }
}

// Export singleton instance
export const contextIntelligence = new ChronicleContextIntelligence()