/**
 * Character State Service * Manages dynamic character state including modifiers, conditions, and resources
 */

export interface CharacterState {
  characterId: string
  conditions: Condition[]
  ongoingModifiers: OngoingModifier[]
  forwardModifiers: ForwardModifier[]
  resources: ResourceTracker[]
  bonds: BondState[]
  equipment: EquipmentState[]
  lastUpdated: number
}

export interface Condition {
  id: string
  name: string
  description: string
  effects: ConditionEffect[]
  duration: 'permanent' | 'scene' | 'encounter' | 'turn' | number // number = specific turns
  source: string
  severity: 'minor' | 'moderate' | 'severe' | 'critical'
}

export interface ConditionEffect {
  type: 'stat_modifier' | 'move_restriction' | 'damage_modifier' | 'special'
  target: string // stat name, move id, etc.
  value: number | string
  description: string
}

export interface OngoingModifier {
  id: string
  name: string
  value: number
  appliesTo: 'all' | 'stat' | 'move' | 'damage'
  target?: string // specific stat or move
  source: string
  duration: 'permanent' | 'scene' | 'encounter' | number
  stacks: boolean
}

export interface ForwardModifier {
  id: string
  name: string
  value: number
  appliesTo: 'next_roll' | 'next_move' | 'next_stat_roll'
  target?: string // specific move or stat
  source: string
  used: boolean
}

export interface ResourceTracker {
  id: string
  name: string
  current: number
  max: number
  type: 'hold' | 'uses' | 'ammo' | 'spell_slots' | 'custom'
  source: string // move or item that granted this
  refreshOn: 'rest' | 'scene' | 'session' | 'manual'
}

export interface BondState {
  id: string
  targetCharacterId: string
  targetName: string
  description: string
  strength: number // 0-3, affects Aid / Interfere
  lastUsed?: number
  timesUsed: number
}

export interface EquipmentState {
  itemId: string
  equipped: boolean
  condition: 'perfect' | 'good' | 'worn' | 'damaged' | 'broken'
  charges?: number
  maxCharges?: number
  modifiers: EquipmentModifier[]
}

export interface EquipmentModifier {
  type: 'stat' | 'damage' | 'armor' | 'special'
  value: number | string
  condition?: string // when this modifier applies
}

export class CharacterStateService {
  private characterStates: Map <string, CharacterState> = new Map()

  /**
   * Get character state (creates if doesn't exist)
   */
  getCharacterState(characterId: string): CharacterState {
    let state = this.characterStates.get(characterId)
    if (!state) {
      state = this.createDefaultState(characterId)
      this.characterStates.set(characterId, state)
    }
    return state
  }

  /**
   * Update character state
   */
  updateCharacterState(characterId: string, updates: Partial <CharacterState>): void {
    const _state = this.getCharacterState(characterId)
    Object.assign(state, updates, { lastUpdated: Date.now() })
    this.characterStates.set(characterId, state)
  }

  /**
   * Add condition to character
   */
  addCondition(characterId: string, condition: Condition): void {
    const _state = this.getCharacterState(characterId)

    // Remove existing condition with same name if it doesn't stack
    const existingIndex = state.conditions.findIndex(c => c.id === condition.id)
    if (existingIndex >= 0) {
      state.conditions.splice(existingIndex, 1)
    }

    state.conditions.push(condition)
    state.lastUpdated = Date.now()
  }

  /**
   * Remove condition from character
   */
  removeCondition(characterId: string, conditionId: string): void {
    const _state = this.getCharacterState(characterId)
    state.conditions = state.conditions.filter(c => c.id !== conditionId)
    state.lastUpdated = Date.now()
  }

  /**
   * Add ongoing modifier
   */
  addOngoingModifier(characterId: string, modifier: OngoingModifier): void {
    const _state = this.getCharacterState(characterId)

    // Handle stacking
    if (!modifier.stacks) {
      const existingIndex = state.ongoingModifiers.findIndex(m =>
        m.name === modifier.name && m.appliesTo === modifier.appliesTo && m.target === modifier.target,
      )
      if (existingIndex >= 0) {
        state.ongoingModifiers.splice(existingIndex, 1)
      }
    }

    state.ongoingModifiers.push(modifier)
    state.lastUpdated = Date.now()
  }

  /**
   * Add forward modifier
   */
  addForwardModifier(characterId: string, modifier: ForwardModifier): void {
    const _state = this.getCharacterState(characterId)
    state.forwardModifiers.push(modifier)
    state.lastUpdated = Date.now()
  }

  /**
   * Use forward modifier (marks as used)
   */
  useForwardModifier(characterId: string, modifierId: string): ForwardModifier | null {
    const _state = this.getCharacterState(characterId)
    const modifier = state.forwardModifiers.find(m => m.id === modifierId)
    if (modifier) {
      modifier.used = true
      state.lastUpdated = Date.now()
      return modifier
    }

    return null
  }

  /**
   * Clean up used forward modifiers
   */
  cleanupForwardModifiers(characterId: string): void {
    const _state = this.getCharacterState(characterId)
    state.forwardModifiers = state.forwardModifiers.filter(m => !m.used)
    state.lastUpdated = Date.now()
  }

  /**
   * Update resource tracker
   */
  updateResource(characterId: string, resourceId: string, newCurrent: number): void {
    const _state = this.getCharacterState(characterId)
    const resource = state.resources.find(r => r.id === resourceId)
    if (resource) {
      resource.current = Math.max(0, Math.min(resource.max, newCurrent))
      state.lastUpdated = Date.now()
    }
  }

  /**
   * Add or update resource tracker
   */
  setResource(characterId: string, resource: ResourceTracker): void {
    const _state = this.getCharacterState(characterId)
    const existingIndex = state.resources.findIndex(r => r.id === resource.id)

    if (existingIndex >= 0) {
      state.resources[existingIndex] = resource
    }
    else {
      state.resources.push(resource)
    }

    state.lastUpdated = Date.now()
  }

  /**
   * Get total modifier for a specific context
   */
  getTotalModifier(
    characterId: string,
    context: 'stat' | 'move' | 'damage',
    target?: string,
  ): number {
    const _state = this.getCharacterState(characterId)
    let total = 0

    // Add ongoing modifiers
    for (const modifier of state.ongoingModifiers) {
      if (modifier.appliesTo === 'all'
        || (modifier.appliesTo === context && (!modifier.target || modifier.target === target))) {
        total += modifier.value
      }
    }

    // Add condition effects
    for (const condition of state.conditions) {
      for (const effect of condition.effects) {
        if (effect.type === `${context}modifier`
          && (!effect.target || effect.target === target)) {
          total += typeof effect.value === 'number' ? effect.value : 0
        }
      }
    }

    // Add equipment modifiers
    for (const equipment of state.equipment) {
      if (equipment.equipped) {
        for (const modifier of equipment.modifiers) {
          if (modifier.type === context) {
            total += typeof modifier.value === 'number' ? modifier.value : 0
          }
        }
      }
    }

    return total
  }

  /**
   * Get available forward modifiers for a context
   */
  getAvailableForwardModifiers(
    characterId: string,
    context: 'next_roll' | 'next_move' | 'next_stat_roll',
    target?: string,
  ): ForwardModifier[] {
    const _state = this.getCharacterState(characterId)
    return state.forwardModifiers.filter(m =>
      !m.used
      && m.appliesTo === context
      && (!m.target || m.target === target),
    )
  }

  /**
   * Get active conditions
   */
  getActiveConditions(characterId: string): Condition[] {
    const _state = this.getCharacterState(characterId)
    return state.conditions.filter(c => this.isConditionActive(c))
  }

  /**
   * Get bond strength with another character
   */
  getBondStrength(characterId: string, targetCharacterId: string): number {
    const _state = this.getCharacterState(characterId)
    const bond = state.bonds.find(b => b.targetCharacterId === targetCharacterId)
    return bond?.strength || 0
  }

  /**
   * Use bond (for Aid / Interfere)
   */
  useBond(characterId: string, targetCharacterId: string): boolean {
    const _state = this.getCharacterState(characterId)
    const bond = state.bonds.find(b => b.targetCharacterId === targetCharacterId)

    if (bond && bond.strength > 0) {
      bond.lastUsed = Date.now()
      bond.timesUsed++
      state.lastUpdated = Date.now()
      return true
    }

    return false
  }

  /**
   * Refresh resources based on trigger
   */
  refreshResources(characterId: string, trigger: 'rest' | 'scene' | 'session'): void {
    const _state = this.getCharacterState(characterId)

    for (const resource of state.resources) {
      if (resource.refreshOn === trigger) {
        resource.current = resource.max
      }
    }

    state.lastUpdated = Date.now()
  }

  /**
   * Advance time (for duration-based effects)
   */
  advanceTime(characterId: string, timeType: 'turn' | 'scene' | 'encounter'): void {
    const _state = this.getCharacterState(characterId)

    // Update condition durations
    state.conditions = state.conditions.filter((condition) => {
      if (typeof condition.duration === 'number') {
        condition.duration--
        return condition.duration > 0
      }
      return condition.duration !== timeType
    })

    // Update ongoing modifier durations
    state.ongoingModifiers = state.ongoingModifiers.filter((modifier) => {
      if (typeof modifier.duration === 'number') {
        modifier.duration--
        return modifier.duration > 0
      }
      return modifier.duration !== timeType
    })

    state.lastUpdated = Date.now()
  }

  /**
   * Private helper methods
   */
  private createDefaultState(characterId: string): CharacterState {
    return {
      characterId,
      conditions: [],
      ongoingModifiers: [],
      forwardModifiers: [],
      resources: [],
      bonds: [],
      equipment: [],
      lastUpdated: Date.now(),
    }
  }

  private isConditionActive(condition: Condition): boolean {
    if (condition.duration === 'permanent')
      return true
    if (typeof condition.duration === 'number')
      return condition.duration > 0
    return true // Scene / encounter conditions are active until explicitly removed
  }

  /**
   * Get character state summary for UI
   */
  getStateSummary(characterId: string): {
    activeConditions: number
    totalOngoingModifiers: number
    availableForwardModifiers: number
    resourcesNeedingAttention: number
  } {
    const _state = this.getCharacterState(characterId)

    return {
      activeConditions: this.getActiveConditions(characterId).length,
      totalOngoingModifiers: state.ongoingModifiers.length,
      availableForwardModifiers: state.forwardModifiers.filter(m => !m.used).length,
      resourcesNeedingAttention: state.resources.filter(r => r.current <= r.max * 0.25).length,
    }
  }
}

// Singleton instance
export const characterStateService = new CharacterStateService()
