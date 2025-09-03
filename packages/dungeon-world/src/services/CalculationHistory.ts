/**
 * Service for tracking calculation history and changes
 */

export interface CalculationChange {
  id: string
  timestamp: Date
  type: 'armor' | 'hp' | 'load' | 'xp' | 'damage' | 'modifier' | 'condition'
  field: string
  oldValue: number
  newValue: number
  change: number
  reason: string
  details?: Record <string, unknown>
}

export interface CalculationSnapshot {
  timestamp: Date
  values: {
    hp: { current: number, max: number }
    armor: number
    load: { current: number, max: number }
    xp: { current: number, threshold: number }
    damage: { die: string, bonus: number }
    modifiers: {
      ongoing: number
      forward: number
    }
    conditions: string[]
  }
}

export class CalculationHistoryService {
  private history: CalculationChange[] = []
  private snapshots: CalculationSnapshot[] = []
  private maxHistorySize = 100
  private maxSnapshotSize = 20

  /**
   * Record a calculation change
   */
  recordChange(change: Omit <CalculationChange, 'id' | 'timestamp'>): void {
    const entry: CalculationChange = {
      ...change,
      id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date(),
    }

    this.history.unshift(entry)

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize)
    }
  }

  /**
   * Record HP change
   */
  recordHPChange(oldHP: number, newHP: number, reason: string, details?: any): void {
    if (oldHP === newHP)
      return

    this.recordChange({
      type: 'hp',
      field: 'current',
      oldValue: oldHP,
      newValue: newHP,
      change: newHP - oldHP,
      reason,
      details,
    })
  }

  /**
   * Record armor change
   */
  recordArmorChange(oldArmor: number, newArmor: number, reason: string, details?: any): void {
    if (oldArmor === newArmor)
      return

    this.recordChange({
      type: 'armor',
      field: 'total',
      oldValue: oldArmor,
      newValue: newArmor,
      change: newArmor - oldArmor,
      reason,
      details,
    })
  }

  /**
   * Record load change
   */
  recordLoadChange(oldLoad: number, newLoad: number, reason: string, details?: any): void {
    if (oldLoad === newLoad)
      return

    this.recordChange({
      type: 'load',
      field: 'current',
      oldValue: oldLoad,
      newValue: newLoad,
      change: newLoad - oldLoad,
      reason,
      details,
    })
  }

  /**
   * Record XP change
   */
  recordXPChange(oldXP: number, newXP: number, reason: string, details?: any): void {
    if (oldXP === newXP)
      return

    this.recordChange({
      type: 'xp',
      field: 'current',
      oldValue: oldXP,
      newValue: newXP,
      change: newXP - oldXP,
      reason,
      details,
    })
  }

  /**
   * Record modifier change
   */
  recordModifierChange(
    modifierType: 'ongoing' | 'forward',
    oldValue: number,
    newValue: number,
    reason: string,
    details?: unknown,
  ): void {
    if (oldValue === newValue)
      return

    this.recordChange({
      type: 'modifier',
      field: modifierType,
      oldValue,
      newValue,
      change: newValue - oldValue,
      reason,
      details,
    })
  }

  /**
   * Record condition change
   */
  recordConditionChange(
    action: 'added' | 'removed',
    conditionName: string,
    modifierImpact: number,
    details?: unknown,
  ): void {
    this.recordChange({
      type: 'condition',
      field: conditionName,
      oldValue: action === 'added' ? 0 : 1,
      newValue: action === 'added' ? 1 : 0,
      change: modifierImpact,
      reason: `Condition ${action || 'No action'}: ${conditionName}`,
      details,
    })
  }

  /**
   * Take a snapshot of current values
   */
  takeSnapshot(values: CalculationSnapshot['values']): void {
    const snapshot: CalculationSnapshot = {
      timestamp: new Date(),
      values: { ...values },
    }

    this.snapshots.unshift(snapshot)

    // Trim snapshots if too many
    if (this.snapshots.length > this.maxSnapshotSize) {
      this.snapshots = this.snapshots.slice(0, this.maxSnapshotSize)
    }
  }

  /**
   * Get recent history
   */
  getRecentHistory(count = 10): CalculationChange[] {
    return this.history.slice(0, count)
  }

  /**
   * Get history by type
   */
  getHistoryByType(type: CalculationChange['type']): CalculationChange[] {
    return this.history.filter(change => change.type === type)
  }

  /**
   * Get history within time range
   */
  getHistoryInRange(startTime: Date, endTime: Date = new Date()): CalculationChange[] {
    return this.history.filter(
      change => change.timestamp >= startTime && change.timestamp <= endTime,
    )
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): CalculationSnapshot[] {
    return [...this.snapshots]
  }

  /**
   * Get snapshot at specific time
   */
  getSnapshotAt(time: Date): CalculationSnapshot | null {
    // Find the snapshot closest to but not after the given time
    return this.snapshots.find(snapshot => snapshot.timestamp <= time) || null
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * Clear snapshots
   */
  clearSnapshots(): void {
    this.snapshots = []
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      snapshots: this.snapshots,
      exportDate: new Date(),
    }, null, 2)
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): void {
    try {
      const data = JSON.parse(json)
      if (data.history && Array.isArray(data.history)) {
        this.history = data.history.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
      }
      if (data.snapshots && Array.isArray(data.snapshots)) {
        this.snapshots = data.snapshots.map((snapshot: any) => ({
          ...snapshot,
          timestamp: new Date(snapshot.timestamp),
        }))
      }
    }
    catch {
      throw new Error('Invalid history data format')
    }
  }

  /**
   * Get summary of changes
   */
  getSummary(): {
    totalChanges: number
    changesByType: Record <CalculationChange['type'], number>
    netChanges: Record<string, number>
    timeRange: { start: Date | null, end: Date | null }
  } {
    const changesByType: Record <CalculationChange['type'], number> = {
      armor: 0,
      hp: 0,
      load: 0,
      xp: 0,
      damage: 0,
      modifier: 0,
      condition: 0,
    }

    const netChanges: Record<string, number> = {
      hp: 0,
      armor: 0,
      load: 0,
      xp: 0,
    }

    for (const change of this.history) {
      changesByType[change.type]++
      if (change.type in netChanges) {
        netChanges[change.type] += change.change
      }
    }

    return {
      totalChanges: this.history.length,
      changesByType,
      netChanges,
      timeRange: {
        start: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null,
        end: this.history.length > 0 ? this.history[0].timestamp : null,
      },
    }
  }
}

// Singleton instance
export const calculationHistory = new CalculationHistoryService()
