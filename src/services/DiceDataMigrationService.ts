/**
 * Dice Data Migration Service
 * Handles versioned data schema evolution for dice rolling system
 * Ensures backwards compatibility across app versions
 */

import type { RollResult } from '../stores/diceStore'
import { logger } from '../utils/logger'

// Historical data formats for migration
interface RollResultV0 {
  // Legacy format before versioning
  id: string
  timestamp: number
  dice1: number
  dice2: number
  modifier: number
  total: number
  outcome: string
  context?: string
  moveId?: string
}

interface RollResultV1 extends RollResult {
  version: 1
}

// Future versions would be defined here
// interface RollResultV2 extends RollResult {
//   version: 2
//   newField?: string
// }

export type AnyRollResult = RollResultV0 | RollResultV1

/**
 * Migration registry - defines how to upgrade from each version to the next
 */
const MIGRATION_STEPS = {
  0: (data: RollResultV0): RollResultV1 => {
    logger.info('[DiceMigration] Migrating roll from v0 to v1:', data.id)

    return {
      version: 1,
      id: data.id,
      timestamp: data.timestamp,
      characterId: 'legacy-default', // Assign legacy rolls to default character

      dice1: data.dice1,
      dice2: data.dice2,
      diceTotal: data.dice1 + data.dice2,
      modifier: data.modifier,
      finalResult: data.total,
      outcome: (data.outcome as 'success' | 'partial' | 'failure') || 'failure',

      type: data.moveId ? 'move' : 'stat', // Best guess based on available data
      context: {
        label: data.context || 'Legacy Roll',
        moveId: data.moveId,
        description: data.context
          ? `Migrated: ${data.context}`
          : 'Migrated from legacy format',
      },

      effects: {}, // No effects data in v0
    }
  },

  // Future migration steps would go here:
  // 1: (data: RollResultV1): RollResultV2 => { ... }
}

/**
 * Detects the version of a roll result object
 */
function detectVersion(data: any): number {
  if (typeof data.version === 'number') {
    return data.version
  }

  // Pre-versioning format detection
  if (
    data.id &&
    data.timestamp &&
    data.dice1 &&
    data.dice2 &&
    typeof data.version === 'undefined'
  ) {
    return 0
  }

  throw new Error(
    `Unable to detect version for roll data: ${JSON.stringify(data)}`,
  )
}

/**
 * Migrates a single roll result to the latest version
 */
export function migrateRollResult(data: AnyRollResult): RollResultV1 {
  const currentVersion = detectVersion(data)
  const TARGET_VERSION = 1

  let result = data as any

  // Apply each migration step in sequence
  for (let version = currentVersion; version < TARGET_VERSION; version++) {
    const migrationStep =
      MIGRATION_STEPS[version as keyof typeof MIGRATION_STEPS]
    if (migrationStep) {
      result = migrationStep(result)
    } else {
      throw new Error(
        `No migration step defined for version ${version} -> ${version + 1}`,
      )
    }
  }

  return result
}

/**
 * Migrates an array of roll results, handling mixed versions
 */
export function migrateRollHistory(data: AnyRollResult[]): RollResultV1[] {
  const migrated: RollResultV1[] = []
  const errors: { index: number; error: string; data: any }[] = []

  data.forEach((item, index) => {
    try {
      migrated.push(migrateRollResult(item))
    } catch (error) {
      logger.error(
        `[DiceMigration] Failed to migrate roll at index ${index}:`,
        error,
      )
      errors.push({
        index,
        error: error instanceof Error ? error.message : String(error),
        data: item,
      })
    }
  })

  if (errors.length > 0) {
    logger.warn(
      `[DiceMigration] ${errors.length} rolls failed to migrate:`,
      errors,
    )
  }

  logger.info(
    `[DiceMigration] Successfully migrated ${migrated.length}/${data.length} rolls`,
  )
  return migrated
}

/**
 * Migrates character-scoped roll history map
 */
export function migrateCharacterRollHistory(
  data: Record<string, AnyRollResult[]>,
): Map<string, RollResultV1[]> {
  const migratedMap = new Map<string, RollResultV1[]>()

  Object.entries(data).forEach(([characterId, rolls]) => {
    try {
      const migratedRolls = migrateRollHistory(rolls)
      if (migratedRolls.length > 0) {
        migratedMap.set(characterId, migratedRolls)
      }
    } catch (error) {
      logger.error(
        `[DiceMigration] Failed to migrate rolls for character ${characterId}:`,
        error,
      )
    }
  })

  return migratedMap
}

/**
 * Validates that a roll result conforms to the expected schema
 */
export function validateRollResult(data: any): data is RollResultV1 {
  const required = [
    'version',
    'id',
    'timestamp',
    'characterId',
    'dice1',
    'dice2',
    'diceTotal',
    'modifier',
    'finalResult',
    'outcome',
    'type',
    'context',
    'effects',
  ]

  return (
    required.every((field) => field in data) &&
    typeof data.version === 'number' &&
    typeof data.id === 'string' &&
    typeof data.timestamp === 'number' &&
    typeof data.characterId === 'string' &&
    typeof data.dice1 === 'number' &&
    typeof data.dice2 === 'number' &&
    typeof data.diceTotal === 'number' &&
    typeof data.modifier === 'number' &&
    typeof data.finalResult === 'number' &&
    ['success', 'partial', 'failure'].includes(data.outcome) &&
    ['stat', 'move', 'custom'].includes(data.type) &&
    typeof data.context === 'object' &&
    typeof data.effects === 'object'
  )
}

/**
 * Cleans up invalid or corrupted roll data
 */
export function cleanRollHistory(data: AnyRollResult[]): RollResultV1[] {
  return data
    .filter((roll) => {
      try {
        const migrated = migrateRollResult(roll)
        return validateRollResult(migrated)
      } catch {
        logger.warn('[DiceMigration] Removing invalid roll:', roll)
        return false
      }
    })
    .map((roll) => migrateRollResult(roll))
}

/**
 * Main migration service class
 */
export class DiceDataMigrationService {
  private static instance: DiceDataMigrationService

  static getInstance(): DiceDataMigrationService {
    if (!DiceDataMigrationService.instance) {
      DiceDataMigrationService.instance = new DiceDataMigrationService()
    }
    return DiceDataMigrationService.instance
  }

  /**
   * Migrates localStorage data to current version
   */
  migrateLocalStorage(storageKey: string = 'zimbomate-dice-store'): void {
    try {
      const rawData = localStorage.getItem(storageKey)
      if (!rawData) return

      const parsed = JSON.parse(rawData)
      const state = parsed.state || parsed

      if (state.rollHistoryByCharacter) {
        logger.info('[DiceMigration] Starting localStorage migration...')

        // Handle both Map format and Object format
        let historyData: Record<string, AnyRollResult[]>
        if (Array.isArray(state.rollHistoryByCharacter)) {
          // Convert Map entries array back to object
          historyData = Object.fromEntries(state.rollHistoryByCharacter)
        } else {
          historyData = state.rollHistoryByCharacter
        }

        const migratedHistory = migrateCharacterRollHistory(historyData)

        // Convert back to serializable format
        const serializedHistory = Array.from(migratedHistory.entries())

        const updatedState = {
          ...state,
          rollHistoryByCharacter: serializedHistory,
        }

        localStorage.setItem(
          storageKey,
          JSON.stringify({ state: updatedState }),
        )
        logger.info('[DiceMigration] localStorage migration completed')
      }
    } catch (error) {
      logger.error('[DiceMigration] Failed to migrate localStorage:', error)
      // Don't throw - let the app continue with empty state
    }
  }

  /**
   * Exports roll history in various formats
   */
  exportHistory(
    rolls: RollResult[],
    format: 'json' | 'csv' | 'text' = 'json',
  ): string {
    switch (format) {
      case 'csv': {
        const headers =
          'Timestamp,Character,Type,Label,Dice1,Dice2,Modifier,Total,Outcome\n'
        const rows = rolls
          .map((roll) =>
            [
              new Date(roll.timestamp).toISOString(),
              roll.characterId,
              roll.type,
              roll.context.label,
              roll.dice1,
              roll.dice2,
              roll.modifier,
              roll.finalResult,
              roll.outcome,
            ].join(','),
          )
          .join('\n')
        return headers + rows
      }
      case 'text': {
        return rolls
          .map(
            (roll) =>
              `${new Date(roll.timestamp).toLocaleString()} - ${roll.context.label}: ${roll.dice1}+${roll.dice2}+${roll.modifier}=${roll.finalResult} (${roll.outcome})`,
          )
          .join('\n')
      }
      case 'json':
      default:
        return JSON.stringify(rolls, null, 2)
    }
  }

  /**
   * Imports roll history from exported data
   */
  importHistory(data: string, format: 'json' | 'csv' = 'json'): RollResult[] {
    try {
      if (format === 'json') {
        const parsed = JSON.parse(data)
        const rolls = Array.isArray(parsed) ? parsed : [parsed]
        return migrateRollHistory(rolls)
      }

      // CSV import would be implemented here if needed
      throw new Error('CSV import not yet implemented')
    } catch (error) {
      logger.error('[DiceMigration] Failed to import history:', error)
      throw error
    }
  }
}

// Auto-migrate localStorage on module load
if (typeof window !== 'undefined') {
  DiceDataMigrationService.getInstance().migrateLocalStorage()
}
