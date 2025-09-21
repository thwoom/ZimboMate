/**
 * Chronicle Action Listener Service
 *
 * This service acts as a global event listener for meaningful actions throughout the app,
 * providing contextual Chronicle prompts when users perform dice rolls, equipment actions,
 * combat moves, and other significant activities.
 *
 * Key Features:
 * - Event-driven architecture for listening to app-wide actions
 * - Context-aware prompt generation based on action type and current game state
 * - Integration with existing Chronicle store for seamless story building
 * - Smart filtering to avoid prompt overload
 * - Elegant floating overlay system for non-intrusive prompts
 */

import { useChronicleStore } from '../stores/chronicleStore'
import { chronicleTemplateService } from './ChronicleTemplateService'
import { contextIntelligence } from './ChronicleContextIntelligence'

// Action types that can trigger Chronicle prompts
export type ChronicleActionType =
  | 'dice_roll'
  | 'stat_roll'
  | 'move_roll'
  | 'damage_roll'
  | 'equipment_use'
  | 'equipment_equip'
  | 'equipment_drop'
  | 'item_acquire'
  | 'combat_action'
  | 'spell_cast'
  | 'advancement_gain'
  | 'character_creation'
  | 'session_milestone'

// Context data structure for different action types
export interface ActionContext {
  // Common fields
  actionType: ChronicleActionType
  timestamp: Date
  sessionId?: string
  characterId?: string
  characterName?: string

  // Dice roll context
  diceRoll?: {
    type: 'move' | 'stat' | 'damage' | 'custom'
    stat?: string // STR, DEX, CON, etc.
    moveName?: string
    result: 'success' | 'partial' | 'failure'
    total: number
    modifier: number
    dice: number[]
  }

  // Equipment context
  equipment?: {
    action: 'use' | 'equip' | 'unequip' | 'drop' | 'acquire'
    itemName: string
    itemType?: string
    quantity?: number
  }

  // Combat context
  combat?: {
    action: 'attack' | 'defend' | 'move_combat' | 'use_ability'
    target?: string
    weapon?: string
    damage?: number
  }

  // Location context (if available)
  location?: {
    currentLocation?: string
    previousLocation?: string
  }

  // Additional context for smart prompts
  gameState?: {
    inCombat?: boolean
    currentScene?: string
    recentEvents?: string[]
  }
}

// Chronicle prompt configuration
export interface ChroniclePrompt {
  id: string
  actionContext: ActionContext
  promptText: string
  suggestedEntries: string[]
  priority: 'low' | 'medium' | 'high'
  expiresAt: Date
  isVisible: boolean
  position?: { x: number; y: number }
}

// Action listener callback type
export type ActionListener = (context: ActionContext) => void

// Prompt generation strategies for different action types
interface PromptStrategy {
  generatePrompt(context: ActionContext): Promise<ChroniclePrompt | null>
  shouldPrompt(context: ActionContext): boolean
}

export class ChronicleActionListenerService {
  private listeners: Map<ChronicleActionType, ActionListener[]> = new Map()
  private activePrompts: ChroniclePrompt[] = []
  private promptStrategies: Map<ChronicleActionType, PromptStrategy> = new Map()
  private recentActions: ActionContext[] = []
  private isEnabled: boolean = true

  // Settings
  private maxActivePrompts = 2 // Prevent prompt overload
  private promptTimeout = 30000 // 30 seconds
  private minTimeBetweenPrompts = 5000 // 5 seconds cooldown
  private lastPromptTime = 0

  constructor() {
    this.initializePromptStrategies()
    this.startPromptCleanup()
  }

  /**
   * Register an action listener for a specific action type
   */
  addListener(actionType: ChronicleActionType, listener: ActionListener): () => void {
    if (!this.listeners.has(actionType)) {
      this.listeners.set(actionType, [])
    }

    const listeners = this.listeners.get(actionType)!
    listeners.push(listener)

    // Return cleanup function
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Emit an action event to trigger listeners and potential Chronicle prompts
   */
  emitAction(context: ActionContext): void {
    if (!this.isEnabled) return

    // Add to recent actions
    this.recentActions.push(context)
    if (this.recentActions.length > 10) {
      this.recentActions.shift()
    }

    // Notify listeners
    const listeners = this.listeners.get(context.actionType) || []
    listeners.forEach(listener => {
      try {
        listener(context)
      } catch (error) {
        console.error('Error in action listener:', error)
      }
    })

    // Generate Chronicle prompt if appropriate
    this.considerChroniclePrompt(context)
  }

  /**
   * Get all active Chronicle prompts
   */
  getActivePrompts(): ChroniclePrompt[] {
    return this.activePrompts.filter(p => p.isVisible)
  }

  /**
   * Dismiss a Chronicle prompt
   */
  dismissPrompt(promptId: string): void {
    const prompt = this.activePrompts.find(p => p.id === promptId)
    if (prompt) {
      prompt.isVisible = false
    }
  }

  /**
   * Accept a Chronicle prompt and create an entry
   */
  acceptPrompt(promptId: string, selectedEntry: string, customText?: string): void {
    const prompt = this.activePrompts.find(p => p.id === promptId)
    if (!prompt) return

    const chronicleStore = useChronicleStore.getState()

    // Create chronicle entry with action context
    const entryText = customText || selectedEntry
    const tags = this.generateTagsFromContext(prompt.actionContext)

    chronicleStore.addEntry({
      rawText: entryText,
      tags,
      sessionId: prompt.actionContext.sessionId || chronicleStore.currentSessionId || undefined,
      parsedEntities: [], // Will be parsed by Chronicle system
      actionContext: prompt.actionContext, // Store the original action for reference
      isSceneBreak: false,
      emotionalTone: this.inferEmotionalTone(entryText)
    })

    // Remove the prompt
    this.dismissPrompt(promptId)
  }

  /**
   * Enable/disable the action listener system
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled) {
      this.clearAllPrompts()
    }
  }

  /**
   * Clear all active prompts
   */
  clearAllPrompts(): void {
    this.activePrompts.forEach(p => p.isVisible = false)
  }

  /**
   * Get recent actions for context
   */
  getRecentActions(limit = 5): ActionContext[] {
    return this.recentActions.slice(-limit)
  }

  // Private methods

  private considerChroniclePrompt(context: ActionContext): void {
    // Check cooldown
    const now = Date.now()
    if (now - this.lastPromptTime < this.minTimeBetweenPrompts) {
      return
    }

    // Check active prompt limit
    const visiblePrompts = this.activePrompts.filter(p => p.isVisible)
    if (visiblePrompts.length >= this.maxActivePrompts) {
      return
    }

    // Get strategy for this action type
    const strategy = this.promptStrategies.get(context.actionType)
    if (!strategy || !strategy.shouldPrompt(context)) {
      return
    }

    // Generate prompt
    const prompt = strategy.generatePrompt(context)
    if (prompt) {
      this.activePrompts.push(prompt)
      this.lastPromptTime = now
    }
  }

  private initializePromptStrategies(): void {
    // Dice roll strategy
    this.promptStrategies.set('dice_roll', new DiceRollPromptStrategy())
    this.promptStrategies.set('stat_roll', new StatRollPromptStrategy())
    this.promptStrategies.set('move_roll', new MoveRollPromptStrategy())

    // Equipment strategy
    this.promptStrategies.set('equipment_use', new EquipmentPromptStrategy())
    this.promptStrategies.set('equipment_equip', new EquipmentPromptStrategy())

    // Combat strategy
    this.promptStrategies.set('combat_action', new CombatPromptStrategy())
  }

  private startPromptCleanup(): void {
    setInterval(() => {
      const now = new Date()
      this.activePrompts = this.activePrompts.filter(prompt => {
        if (prompt.expiresAt < now) {
          return false
        }
        return true
      })
    }, 5000) // Check every 5 seconds
  }

  private generateTagsFromContext(context: ActionContext): string[] {
    const tags: string[] = []

    if (context.characterName) {
      tags.push(`character:${context.characterName}`)
    }

    if (context.diceRoll?.stat) {
      tags.push(`stat:${context.diceRoll.stat}`)
    }

    if (context.diceRoll?.moveName) {
      tags.push(`move:${context.diceRoll.moveName}`)
    }

    if (context.equipment?.itemName) {
      tags.push(`equipment:${context.equipment.itemName}`)
    }

    if (context.combat) {
      tags.push('combat')
    }

    tags.push(`action:${context.actionType}`)

    return tags
  }

  private inferEmotionalTone(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase()

    const positiveWords = ['success', 'triumph', 'victory', 'amazing', 'excellent', 'great']
    const negativeWords = ['fail', 'disaster', 'terrible', 'awful', 'miss', 'fumble']

    const hasPositive = positiveWords.some(word => lowerText.includes(word))
    const hasNegative = negativeWords.some(word => lowerText.includes(word))

    if (hasPositive && !hasNegative) return 'positive'
    if (hasNegative && !hasPositive) return 'negative'
    return 'neutral'
  }

  private generatePromptId(): string {
    return `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }
}

// Prompt strategy implementations

class DiceRollPromptStrategy implements PromptStrategy {
  async generatePrompt(context: ActionContext): Promise<ChroniclePrompt | null> {
    if (!context.diceRoll) return null

    const { result, total } = context.diceRoll
    const character = context.characterName || 'your character'

    // Use template service for better suggestions
    const recentActions = [context] // Would get from action listener
    const contextAnalysis = await contextIntelligence.analyzeContext(recentActions)
    const suggestedEntries = chronicleTemplateService.generateSuggestions(
      context,
      contextAnalysis.situation,
      contextAnalysis.intensity,
      contextAnalysis.narrative.emotionalTone,
      3
    )

    // Generate context-aware prompt text
    let promptText: string
    if (result === 'success') {
      promptText = `${character} rolled a ${total}! Chronicle this success?`
    } else if (result === 'partial') {
      promptText = `${character} got a partial success (${total}). What's the complication?`
    } else {
      promptText = `${character} missed with a ${total}. What goes wrong?`
    }

    return {
      id: `dice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionContext: context,
      promptText,
      suggestedEntries: suggestedEntries.length > 0 ? suggestedEntries : [
        `${character}'s ${result} shapes what happens next.`
      ],
      priority: result === 'failure' ? 'high' : 'medium',
      expiresAt: new Date(Date.now() + 30000),
      isVisible: true
    }
  }

  shouldPrompt(context: ActionContext): boolean {
    // Always prompt for dice rolls - they're core moments
    return true
  }
}

class StatRollPromptStrategy implements PromptStrategy {
  generatePrompt(context: ActionContext): ChroniclePrompt | null {
    if (!context.diceRoll?.stat) return null

    const { stat, result, total } = context.diceRoll
    const character = context.characterName || 'your character'

    const statActions: Record<string, string[]> = {
      'STR': ['lifting', 'breaking', 'forcing', 'overpowering'],
      'DEX': ['dodging', 'sneaking', 'balancing', 'aiming'],
      'CON': ['enduring', 'resisting', 'surviving', 'persevering'],
      'INT': ['analyzing', 'reasoning', 'recalling', 'understanding'],
      'WIS': ['perceiving', 'intuiting', 'sensing', 'noticing'],
      'CHA': ['persuading', 'intimidating', 'deceiving', 'inspiring']
    }

    const actions = statActions[stat] || ['acting']
    const randomAction = actions[Math.floor(Math.random() * actions.length)]

    return {
      id: `stat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionContext: context,
      promptText: `Why did ${character} roll ${stat}? What were they ${randomAction}?`,
      suggestedEntries: [
        `${character} used their ${stat} to ${randomAction} in this situation.`,
        `The situation called for ${character} to test their ${stat}.`,
        `${character}'s ${stat} was put to the test.`
      ],
      priority: 'high',
      expiresAt: new Date(Date.now() + 30000),
      isVisible: true
    }
  }

  shouldPrompt(context: ActionContext): boolean {
    return true // Stat rolls are always significant
  }
}

class MoveRollPromptStrategy implements PromptStrategy {
  generatePrompt(context: ActionContext): ChroniclePrompt | null {
    if (!context.diceRoll?.moveName) return null

    const { moveName, result } = context.diceRoll
    const character = context.characterName || 'your character'

    return {
      id: `move-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionContext: context,
      promptText: `${character} used ${moveName}. Chronicle the outcome?`,
      suggestedEntries: [
        `${character} attempted ${moveName} and ${result === 'success' ? 'succeeded' : result === 'partial' ? 'partially succeeded' : 'failed'}.`,
        `The ${moveName} move led to ${result === 'success' ? 'excellent results' : result === 'partial' ? 'mixed results' : 'complications'}.`,
        `${character}'s use of ${moveName} changed the situation.`
      ],
      priority: 'high',
      expiresAt: new Date(Date.now() + 30000),
      isVisible: true
    }
  }

  shouldPrompt(context: ActionContext): boolean {
    return true // Moves are always significant
  }
}

class EquipmentPromptStrategy implements PromptStrategy {
  generatePrompt(context: ActionContext): ChroniclePrompt | null {
    if (!context.equipment) return null

    const { action, itemName } = context.equipment
    const character = context.characterName || 'your character'

    const actionVerbs: Record<string, string> = {
      'use': 'used',
      'equip': 'equipped',
      'unequip': 'put away',
      'drop': 'dropped',
      'acquire': 'acquired'
    }

    const verb = actionVerbs[action] || 'interacted with'

    return {
      id: `equipment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionContext: context,
      promptText: `${character} ${verb} ${itemName}. Chronicle this moment?`,
      suggestedEntries: [
        `${character} ${verb} their ${itemName} at just the right moment.`,
        `The ${itemName} proved ${action === 'use' ? 'useful' : 'important'} to ${character}.`,
        `${character}'s decision to ${action === 'acquire' ? 'take' : action} the ${itemName} was significant.`
      ],
      priority: action === 'use' ? 'medium' : 'low',
      expiresAt: new Date(Date.now() + 25000),
      isVisible: true
    }
  }

  shouldPrompt(context: ActionContext): boolean {
    // Only prompt for meaningful equipment actions
    return context.equipment?.action === 'use' || context.equipment?.action === 'acquire'
  }
}

class CombatPromptStrategy implements PromptStrategy {
  generatePrompt(context: ActionContext): ChroniclePrompt | null {
    if (!context.combat) return null

    const { action, target, weapon, damage } = context.combat
    const character = context.characterName || 'your character'

    let promptText: string
    let suggestedEntries: string[]

    if (action === 'attack') {
      promptText = `${character} attacked${target ? ` ${target}` : ''}${weapon ? ` with ${weapon}` : ''}. Chronicle the combat?`
      suggestedEntries = [
        `${character} strikes ${target || 'their foe'}${weapon ? ` with their ${weapon}` : ''}${damage ? ` for ${damage} damage` : ''}.`,
        `The battle intensifies as ${character} launches their attack.`,
        `${character}'s combat prowess is on full display.`
      ]
    } else {
      promptText = `${character} ${action}ed in combat. What happened?`
      suggestedEntries = [
        `${character}'s ${action} in combat was ${['crucial', 'decisive', 'impressive'][Math.floor(Math.random() * 3)]}.`,
        `The tide of battle shifts as ${character} takes action.`,
        `${character} demonstrates their combat skills.`
      ]
    }

    return {
      id: `combat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actionContext: context,
      promptText,
      suggestedEntries,
      priority: 'high',
      expiresAt: new Date(Date.now() + 35000),
      isVisible: true
    }
  }

  shouldPrompt(context: ActionContext): boolean {
    return true // Combat actions are always worth chronicling
  }
}

// Export singleton instance
export const chronicleActionListener = new ChronicleActionListenerService()