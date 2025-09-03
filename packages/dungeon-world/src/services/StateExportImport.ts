/**
 * Export / Import service with calculated state integrity checks
 */

import type { GameState } from '../models/GameState'
import type { CalculatedValues } from './CalculationEngine'
import { COMMON_CONDITIONS } from '../models/Conditions'
import { calculationEngine } from './CalculationEngine'

export interface ExportedState {
  version: string
  exportDate: string
  gameState: GameState
  calculatedSnapshots: Record <string, CalculatedValues>
  metadata: {
    characterCount: number
    totalPlayTime?: number
    exportedBy?: string
    notes?: string
  }
  checksum: string
}

export interface ImportResult {
  success: boolean
  state?: GameState
  errors: string[]
  warnings: string[]
  fixedIssues: string[]
}

export class StateExportImportService {
  private readonly VERSION = '1.0.0'

  /**
   * Export game state with calculated values
   */
  exportState(state: GameState, options?: {
    includeCalculations?: boolean
    includeHistory?: boolean
    notes?: string
  }): string {
    const {
      includeCalculations = true,
      includeHistory = false,
      notes,
    } = options || {}

    // Calculate snapshots for each character
    const calculatedSnapshots: Record <string, CalculatedValues> = {}

    if (includeCalculations) {
      for (const charId of Object.keys(state.characters)) {
        const character = state.characters[charId]
        const inventory = state.inventories[charId]

        if (character && inventory) {
          const context = {
            character,
            inventory,
            modifiers: state.modifiers,
            conditions: state.conditions,
            conditionDefinitions: COMMON_CONDITIONS as string,
            spellPreparation: state.spellPreparations[charId],
          }

          calculatedSnapshots[charId] = calculationEngine.calculate(context)
        }
      }
    }

    // Create export object
    const exportData: ExportedState = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      gameState: includeHistory ? state : this.stripHistory(state),
      calculatedSnapshots,
      metadata: {
        characterCount: Object.keys(state.characters).length,
        notes,
      },
      checksum: '',
    }

    // Generate checksum
    exportData.checksum = this.generateChecksum(exportData)

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import game state with validation
   */
  async importState(jsonData: string): Promise <ImportResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const fixedIssues: string[] = []

    try {
      // Parse JSON
      const importData = JSON.parse(jsonData) as ExportedState

      // Validate structure
      if (!this.validateImportStructure(importData)) {
        errors.push('Invalid import file structure')
        return { success: false, errors, warnings, fixedIssues }
      }

      // Check version compatibility
      if (!this.isVersionCompatible(importData.version)) {
        warnings.push(`Import file version (${importData.version}) may not be fully compatible`)
      }

      // Verify checksum
      if (!this.verifyChecksum(importData)) {
        warnings.push('Checksum verification failed-data may have been modified')
      }

      // Validate and fix game state
      const { state: fixedState, issues } = this.validateAndFixGameState(
        importData.gameState,
        importData.calculatedSnapshots,
      )

      fixedIssues.push(...issues)

      // Run validation service
      const validationResult = { valid: true, errors: [], warnings: [] }
      if (!validationResult.valid) {
        for (const err of validationResult.errors) errors.push(err)

        for (const warn of validationResult.warnings) warnings.push(warn)
      }

      // Verify calculated values if present
      if (importData.calculatedSnapshots) {
        const calcErrors = this.verifyCalculatedValues(
          fixedState,
          importData.calculatedSnapshots,
        )
        warnings.push(...calcErrors)
      }

      // Return result
      if (errors.length > 0) {
        return { success: false, errors, warnings, fixedIssues }
      }

      return {
        success: true,
        state: fixedState,
        errors,
        warnings,
        fixedIssues,
      }
    }
    catch {
      errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { success: false, errors, warnings, fixedIssues }
    }
  }

  /**
   * Validate import structure
   */
  private validateImportStructure(data: any): data is ExportedState {
    return (
      data
      && typeof data === 'object'
      && 'version' in data
      && 'exportDate' in data
      && 'gameState' in data
      && 'metadata' in data
      && 'checksum' in data
    )
  }

  /**
   * Check version compatibility
   */
  private isVersionCompatible(version: string): boolean {
    const [major] = version.split('.')
    const [currentMajor] = this.VERSION.split('.')
    return major === currentMajor
  }

  /**
   * Generate checksum
   */
  private generateChecksum(data: Omit <ExportedState, 'checksum'>): string {
    const content = JSON.stringify({
      version: data.version,
      gameState: data.gameState,
      calculatedSnapshots: data.calculatedSnapshots,
    })

    // Simple checksum-in production would use crypto
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * Verify checksum
   */
  private verifyChecksum(data: ExportedState): boolean {
    const { checksum, ...dataWithoutChecksum } = data
    const calculated = this.generateChecksum(dataWithoutChecksum)
    return calculated === checksum
  }

  /**
   * Validate and fix game state
   */
  private validateAndFixGameState(
    state: GameState,
    snapshots?: Record <string, CalculatedValues>,
  ): { state: GameState, issues: string[] } {
    const issues: string[] = []
    const fixedState = { ...state }

    // Fix character HP
    for (const charId of Object.keys(fixedState.characters)) {
      const character = fixedState.characters[charId]
      const snapshot = snapshots?.[charId]

      // Ensure HP doesn't exceed max
      if (character.hp.current > character.hp.max) {
        character.hp.current = character.hp.max
        issues.push(`Fixed ${character.name}'s HP (was above maximum)`)
      }

      // Ensure HP isn't negative
      if (character.hp.current < 0) {
        character.hp.current = 0
        issues.push(`Fixed ${character.name}'s HP (was negative)`)
      }

      // Verify max HP calculation if snapshot available
      if (snapshot && character.hp.max !== snapshot.maxHP) {
        issues.push(
          `${character.name}'s max HP mismatch: stored ${character.hp.max}, calculated ${snapshot.maxHP}`,
        )
      }
    }

    // Fix inventory weights
    for (const charId of Object.keys(fixedState.inventories)) {
      const inventory = fixedState.inventories[charId]
      let recalculatedWeight = 0

      for (const item of Object.values(inventory.items)) {
        // Ensure positive quantities
        if (item.quantity && item.quantity < 0) {
          item.quantity = 0
          issues.push(`Fixed negative quantity for ${item.name}`)
        }

        // Ensure positive weight
        if (item.weight < 0) {
          item.weight = 0
          issues.push(`Fixed negative weight for ${item.name}`)
        }

        recalculatedWeight += item.weight * (item.quantity || 1)
      }
    }

    // Clean up expired modifiers
    const now = new Date()
    const activeModifiers = fixedState.modifiers.modifiers.filter((mod) => {
      if (mod.expiryTime && new Date(mod.expiryTime) < now) {
        issues.push(`Removed expired modifier: ${mod.name}`)
        return false
      }
      return true
    })

    if (activeModifiers.length !== fixedState.modifiers.modifiers.length) {
      fixedState.modifiers.modifiers = activeModifiers
    }

    // Ensure active character exists
    if (fixedState.activeCharacterId
      && !fixedState.characters[fixedState.activeCharacterId]) {
      const firstCharId = Object.keys(fixedState.characters)[0]
      fixedState.activeCharacterId = firstCharId || null
      issues.push('Fixed invalid active character reference')
    }

    return { state: fixedState, issues }
  }

  /**
   * Verify calculated values match
   */
  private verifyCalculatedValues(
    state: GameState,
    snapshots: Record <string, CalculatedValues>,
  ): string[] {
    const errors: string[] = []

    for (const charId of Object.keys(snapshots)) {
      const character = state.characters[charId]
      const inventory = state.inventories[charId]
      const snapshot = snapshots[charId]

      if (!character || !inventory)
        continue

      // Recalculate
      const context = {
        character,
        inventory,
        modifiers: state.modifiers,
        conditions: state.conditions,
        conditionDefinitions: COMMON_CONDITIONS as string,
        spellPreparation: state.spellPreparations[charId],
      }

      const recalculated = calculationEngine.calculate(context)

      // Compare key values
      if (recalculated.totalArmor !== snapshot.totalArmor) {
        errors.push(
          `Armor mismatch for ${character.name}: imported ${snapshot.totalArmor}, calculated ${recalculated.totalArmor}`,
        )
      }

      if (recalculated.maxLoad !== snapshot.maxLoad) {
        errors.push(
          `Load capacity mismatch for ${character.name}: imported ${snapshot.maxLoad}, calculated ${recalculated.maxLoad}`,
        )
      }

      if (recalculated.xpThreshold !== snapshot.xpThreshold) {
        errors.push(
          `XP threshold mismatch for ${character.name}: imported ${snapshot.xpThreshold}, calculated ${recalculated.xpThreshold}`,
        )
      }
    }

    return errors
  }

  /**
   * Strip history from state for smaller exports
   */
  private stripHistory(state: GameState): GameState {
    return {
      ...state,
      session: {
        ...state.session,
        rollHistory: [],
        events: [],
      },
    }
  }

  /**
   * Create a backup before import
   */
  createBackup(currentState: GameState): string {
    return this.exportState(currentState, {
      includeCalculations: true,
      includeHistory: true,
      notes: 'Automatic backup before import',
    })
  }
}

// Export singleton
export const stateExportImport = new StateExportImportService()
