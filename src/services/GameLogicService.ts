/**
 * Game Logic Service for ZimboMate V2
 * Centralized game logic processing for roll consequences, combat, and character progression
 */

import type { RollResult } from '../components/ui/RollResultsToast'
import { useCharacterStore } from '../stores/characterStore'
import { characterStateService } from './CharacterStateService'
import { xpIntegrationService } from './XPIntegrationService'

export interface RollConsequence {
  id: string
  type:
    | 'xp_gain'
    | 'hp_change'
    | 'condition'
    | 'modifier'
    | 'resource_change'
    | 'level_up'
  description: string
  characterId: string
  automatic: boolean
  applied: boolean
  data: any
}

export interface CombatResult {
  damage: number
  armorReduction: number
  finalDamage: number
  conditions: string[]
  effects: string[]
}

export interface MoveConsequence {
  moveId: string
  moveName: string
  outcome: 'success' | 'partial' | 'failure'
  consequences: RollConsequence[]
  description: string
}

class GameLogicService {
  private pendingConsequences: Map<string, RollConsequence[]> = new Map()
  private combatState: Map<string, any> = new Map()

  /**
   * Process roll result and determine consequences
   */
  processRollResult(
    rollResult: RollResult,
    characterId: string,
    context?: {
      moveId?: string
      moveName?: string
      targetId?: string
      combatContext?: boolean
    },
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    // Handle XP gain on failures (6-)
    if (rollResult.outcome === 'failure' && rollResult.type !== 'damage') {
      consequences.push(
        this.createXPConsequence(characterId, rollResult, context),
      )
    }

    // Handle move-specific consequences
    if (context?.moveId && context?.moveName) {
      const moveConsequences = this.processMoveConsequences(
        rollResult,
        characterId,
        context.moveId,
        context.moveName,
        context.targetId,
      )
      consequences.push(...moveConsequences)
    }

    // Handle damage rolls
    if (rollResult.type === 'damage') {
      const damageConsequence = this.processDamageRoll(
        rollResult,
        characterId,
        context?.targetId,
      )
      if (damageConsequence) {
        consequences.push(damageConsequence)
      }
    }

    // Store pending consequences
    if (consequences.length > 0) {
      this.pendingConsequences.set(rollResult.id, consequences)
    }

    return consequences
  }

  /**
   * Apply consequences automatically or manually
   */
  applyConsequences(rollId: string, selectedConsequences?: string[]): void {
    const consequences = this.pendingConsequences.get(rollId)
    if (!consequences) return

    for (const consequence of consequences) {
      if (
        consequence.automatic ||
        selectedConsequences?.includes(consequence.id)
      ) {
        this.applyConsequence(consequence)
      }
    }

    // Clean up applied consequences
    this.pendingConsequences.set(
      rollId,
      consequences.filter((c) => !c.applied),
    )
  }

  /**
   * Create XP consequence for failed rolls
   */
  private createXPConsequence(
    characterId: string,
    rollResult: RollResult,
    _context?: any,
  ): RollConsequence {
    return {
      id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'xp_gain',
      description: `Gain 1 XP for rolling ${rollResult.total} (6-)`,
      characterId,
      automatic: true,
      applied: false,
      data: {
        amount: 1,
        source: 'failure',
        reason: `Failed ${rollResult.title} (rolled ${rollResult.total})`,
        rollId: rollResult.id,
      },
    }
  }

  /**
   * Process move-specific consequences
   */
  private processMoveConsequences(
    rollResult: RollResult,
    characterId: string,
    moveId: string,
    moveName: string,
    targetId?: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    // Common Dungeon World moves
    switch (moveId) {
      case 'hack-and-slash':
        consequences.push(
          ...this.processHackAndSlash(rollResult, characterId, targetId),
        )
        break
      case 'volley':
        consequences.push(
          ...this.processVolley(rollResult, characterId, targetId),
        )
        break
      case 'defy-danger':
        consequences.push(...this.processDefyDanger(rollResult, characterId))
        break
      case 'aid-interfere':
        consequences.push(
          ...this.processAidInterfere(rollResult, characterId, targetId),
        )
        break
      case 'discern-realities':
        consequences.push(
          ...this.processDiscernRealities(rollResult, characterId),
        )
        break
      case 'spout-lore':
        consequences.push(...this.processSpoutLore(rollResult, characterId))
        break
      case 'parley':
        consequences.push(
          ...this.processParley(rollResult, characterId, targetId),
        )
        break
      default:
        // Generic move consequences
        consequences.push(
          ...this.processGenericMove(rollResult, characterId, moveName),
        )
        break
    }

    return consequences
  }

  /**
   * Process Hack and Slash move
   */
  private processHackAndSlash(
    rollResult: RollResult,
    characterId: string,
    targetId?: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      // Deal damage and avoid enemy attack
      consequences.push({
        id: `damage-${Date.now()}`,
        type: 'resource_change',
        description: 'Deal damage to enemy',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'deal_damage', targetId },
      })
    } else if (rollResult.outcome === 'partial') {
      // Deal damage but enemy attacks back
      consequences.push({
        id: `damage-${Date.now()}`,
        type: 'resource_change',
        description: 'Deal damage to enemy',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'deal_damage', targetId },
      })
      consequences.push({
        id: `counter-${Date.now()}`,
        type: 'hp_change',
        description: 'Enemy attacks you back',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'take_damage', source: 'enemy_counter' },
      })
    }
    // On failure, GM makes a move (no automatic consequences)

    return consequences
  }

  /**
   * Process Volley move
   */
  private processVolley(
    rollResult: RollResult,
    characterId: string,
    targetId?: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `ranged-damage-${Date.now()}`,
        type: 'resource_change',
        description: 'Deal ranged damage',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'deal_ranged_damage', targetId },
      })
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `ranged-damage-${Date.now()}`,
        type: 'resource_change',
        description: 'Deal ranged damage with complication',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'deal_ranged_damage', targetId, complication: true },
      })
    }

    return consequences
  }

  /**
   * Process Defy Danger move
   */
  private processDefyDanger(
    rollResult: RollResult,
    characterId: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      // No consequences - you avoid the danger
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `defy-partial-${Date.now()}`,
        type: 'condition',
        description: 'GM offers hard bargain, ugly choice, or worse outcome',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'gm_choice' },
      })
    }
    // On failure, GM makes a move

    return consequences
  }

  /**
   * Process Aid/Interfere move
   */
  private processAidInterfere(
    rollResult: RollResult,
    characterId: string,
    targetId?: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `aid-success-${Date.now()}`,
        type: 'modifier',
        description: 'Grant +1 forward to ally',
        characterId: targetId || characterId,
        automatic: true,
        applied: false,
        data: { type: 'forward_modifier', value: 1, source: 'aid' },
      })
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `aid-partial-${Date.now()}`,
        type: 'modifier',
        description: 'Grant +1 forward but expose yourself to danger',
        characterId: targetId || characterId,
        automatic: true,
        applied: false,
        data: { type: 'forward_modifier', value: 1, source: 'aid' },
      })
      consequences.push({
        id: `aid-danger-${Date.now()}`,
        type: 'condition',
        description: 'You expose yourself to danger',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'exposed_to_danger' },
      })
    }

    return consequences
  }

  /**
   * Process Discern Realities move
   */
  private processDiscernRealities(
    rollResult: RollResult,
    characterId: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `discern-success-${Date.now()}`,
        type: 'resource_change',
        description:
          'Ask 3 questions and get +1 forward when acting on answers',
        characterId,
        automatic: true,
        applied: false,
        data: { type: 'discern_hold', amount: 3 },
      })
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `discern-partial-${Date.now()}`,
        type: 'resource_change',
        description: 'Ask 1 question and get +1 forward when acting on answer',
        characterId,
        automatic: true,
        applied: false,
        data: { type: 'discern_hold', amount: 1 },
      })
    }

    return consequences
  }

  /**
   * Process Spout Lore move
   */
  private processSpoutLore(
    rollResult: RollResult,
    characterId: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `lore-success-${Date.now()}`,
        type: 'resource_change',
        description: 'GM tells you useful information',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'useful_information' },
      })
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `lore-partial-${Date.now()}`,
        type: 'resource_change',
        description: 'GM tells you useful information, but...',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'useful_information', complication: true },
      })
    }

    return consequences
  }

  /**
   * Process Parley move
   */
  private processParley(
    rollResult: RollResult,
    characterId: string,
    targetId?: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `parley-success-${Date.now()}`,
        type: 'resource_change',
        description: 'NPC does what you want',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'npc_compliance', targetId },
      })
    } else if (rollResult.outcome === 'partial') {
      consequences.push({
        id: `parley-partial-${Date.now()}`,
        type: 'resource_change',
        description:
          'NPC needs concrete assurance, evidence, or something in return',
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'npc_demands', targetId },
      })
    }

    return consequences
  }

  /**
   * Process generic move consequences
   */
  private processGenericMove(
    rollResult: RollResult,
    characterId: string,
    moveName: string,
  ): RollConsequence[] {
    const consequences: RollConsequence[] = []

    // Add generic forward modifier for successful moves
    if (rollResult.outcome === 'success') {
      consequences.push({
        id: `generic-success-${Date.now()}`,
        type: 'modifier',
        description: `${moveName} succeeds - gain +1 forward for related actions`,
        characterId,
        automatic: false,
        applied: false,
        data: { type: 'forward_modifier', value: 1, source: moveName },
      })
    }

    return consequences
  }

  /**
   * Process damage roll
   */
  private processDamageRoll(
    rollResult: RollResult,
    characterId: string,
    targetId?: string,
  ): RollConsequence | null {
    if (rollResult.type !== 'damage') return null

    return {
      id: `damage-apply-${Date.now()}`,
      type: 'hp_change',
      description: `Apply ${rollResult.total} damage`,
      characterId: targetId || characterId,
      automatic: false,
      applied: false,
      data: {
        type: 'apply_damage',
        amount: rollResult.total,
        source: rollResult.title,
      },
    }
  }

  /**
   * Apply individual consequence
   */
  private applyConsequence(consequence: RollConsequence): void {
    switch (consequence.type) {
      case 'xp_gain':
        this.applyXPGain(consequence)
        break
      case 'hp_change':
        this.applyHPChange(consequence)
        break
      case 'condition':
        this.applyCondition(consequence)
        break
      case 'modifier':
        this.applyModifier(consequence)
        break
      case 'resource_change':
        this.applyResourceChange(consequence)
        break
      case 'level_up':
        this.applyLevelUp(consequence)
        break
    }

    consequence.applied = true
  }

  /**
   * Apply XP gain
   */
  private applyXPGain(consequence: RollConsequence): void {
    const { amount, source, reason } = consequence.data
    xpIntegrationService.awardXP(
      consequence.characterId,
      source,
      amount,
      reason,
    )
  }

  /**
   * Apply HP change
   */
  private applyHPChange(consequence: RollConsequence): void {
    const characterStore = useCharacterStore.getState()
    const { amount, type } = consequence.data

    if (type === 'apply_damage') {
      characterStore.damageCharacter(consequence.characterId, amount)
    } else if (type === 'heal') {
      characterStore.healCharacter(consequence.characterId, amount)
    }
  }

  /**
   * Apply condition
   */
  private applyCondition(consequence: RollConsequence): void {
    const { conditionId, name, description, duration, effects } =
      consequence.data

    characterStateService.addCondition(consequence.characterId, {
      id: conditionId || `condition-${Date.now()}`,
      name: name || 'Unknown Condition',
      description: description || consequence.description,
      effects: effects || [],
      duration: duration || 'scene',
      source: 'move_consequence',
      severity: 'moderate',
    })
  }

  /**
   * Apply modifier
   */
  private applyModifier(consequence: RollConsequence): void {
    const { type, value, source } = consequence.data

    if (type === 'forward_modifier') {
      characterStateService.addForwardModifier(consequence.characterId, {
        id: `forward-${Date.now()}`,
        name: `+${value} forward`,
        value,
        appliesTo: 'next_roll',
        source,
        used: false,
      })
    } else if (type === 'ongoing_modifier') {
      characterStateService.addOngoingModifier(consequence.characterId, {
        id: `ongoing-${Date.now()}`,
        name: `${source} modifier`,
        value,
        appliesTo: 'all',
        source,
        duration: 'scene',
        stacks: false,
      })
    }
  }

  /**
   * Apply resource change
   */
  private applyResourceChange(consequence: RollConsequence): void {
    const data = consequence.data as {
      type: string
      amount: number
      resourceId?: string
      label?: string
    }
    const { type, amount, resourceId, label } = data

    if (type === 'discern_hold') {
      characterStateService.setResource(consequence.characterId, {
        id: resourceId ?? 'discern-realities-hold',
        name: label ?? 'Discern Realities Hold',
        current: amount,
        max: amount,
        type: 'hold',
        source: 'Discern Realities',
        refreshOn: 'scene',
      })
    }
  }

  /**
   * Apply level up
   */
  private applyLevelUp(consequence: RollConsequence): void {
    const characterStore = useCharacterStore.getState()
    characterStore.levelUpCharacter(consequence.characterId)
  }

  /**
   * Get pending consequences for a roll
   */
  getPendingConsequences(rollId: string): RollConsequence[] {
    return this.pendingConsequences.get(rollId) || []
  }

  /**
   * Clear pending consequences
   */
  clearPendingConsequences(rollId: string): void {
    this.pendingConsequences.delete(rollId)
  }

  /**
   * Calculate combat result with armor
   */
  calculateCombatDamage(
    baseDamage: number,
    armor: number,
    piercing: number = 0,
    conditions: string[] = [],
  ): CombatResult {
    const effectiveArmor = Math.max(0, armor - piercing)
    const armorReduction = Math.min(baseDamage, effectiveArmor)
    const finalDamage = Math.max(0, baseDamage - armorReduction)

    return {
      damage: baseDamage,
      armorReduction,
      finalDamage,
      conditions: conditions.filter((c) =>
        this.shouldApplyCondition(c, finalDamage),
      ),
      effects: this.calculateCombatEffects(finalDamage, conditions),
    }
  }

  /**
   * Check if condition should be applied based on damage
   */
  private shouldApplyCondition(condition: string, damage: number): boolean {
    // Example logic - customize based on your game rules
    switch (condition) {
      case 'stunned':
        return damage >= 5
      case 'bleeding':
        return damage >= 3
      case 'dazed':
        return damage >= 2
      default:
        return true
    }
  }

  /**
   * Calculate additional combat effects
   */
  private calculateCombatEffects(
    damage: number,
    conditions: string[],
  ): string[] {
    const effects: string[] = []

    if (damage >= 10) {
      effects.push('massive_damage')
    }
    if (damage >= 5) {
      effects.push('significant_wound')
    }
    if (conditions.includes('bleeding')) {
      effects.push('ongoing_damage')
    }

    return effects
  }
}

// Singleton instance
export const gameLogicService = new GameLogicService()
export { GameLogicService }
