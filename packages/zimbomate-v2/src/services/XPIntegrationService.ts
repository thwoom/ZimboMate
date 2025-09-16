/**
 * XP Integration Service for ZimboMate V2
 * Centralized XP management from all sources with notifications and analytics
 */

export interface XPSource {
  id: string
  name: string
  description: string
  category: 'failure' | 'bond' | 'alignment' | 'advancement' | 'gm-award' | 'special'
  color: string
  icon: string
}

export interface XPEntry {
  id: string
  characterId: string
  source: XPSource
  amount: number
  reason: string
  timestamp: Date
  sessionId?: string
  metadata?: Record<string, any>
}

export interface XPNotification {
  id: string
  characterId: string
  entry: XPEntry
  message: string
  type: 'success' | 'milestone' | 'level-up'
  duration: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export interface XPAnalytics {
  totalXP: number
  xpBySource: Record<string, number>
  xpBySession: Record<string, number>
  averageXPPerSession: number
  mostCommonSource: XPSource
  xpTrend: Array<{
    date: Date
    amount: number
    cumulative: number
  }>
}

class XPIntegrationService {
  private xpEntries: Map<string, XPEntry[]> = new Map() // characterId -> entries
  private notifications: XPNotification[] = []
  private listeners: Set<(notification: XPNotification) => void> = new Set()
  private analyticsCache: Map<string, XPAnalytics> = new Map()

  // Predefined XP sources
  private xpSources: Map<string, XPSource> = new Map([
    ['failure', {
      id: 'failure',
      name: 'Failed Roll',
      description: 'XP gained from rolling 6- on a move',
      category: 'failure',
      color: 'var(--color-warning)',
      icon: 'AlertTriangle'
    }],
    ['bond-resolution', {
      id: 'bond-resolution',
      name: 'Bond Resolution',
      description: 'XP gained from resolving a bond with another character',
      category: 'bond',
      color: 'var(--color-success)',
      icon: 'Heart'
    }],
    ['alignment-good', {
      id: 'alignment-good',
      name: 'Good Alignment',
      description: 'XP gained from acting according to Good alignment',
      category: 'alignment',
      color: 'var(--color-info)',
      icon: 'Heart'
    }],
    ['alignment-lawful', {
      id: 'alignment-lawful',
      name: 'Lawful Alignment',
      description: 'XP gained from acting according to Lawful alignment',
      category: 'alignment',
      color: 'var(--color-primary)',
      icon: 'Shield'
    }],
    ['alignment-neutral', {
      id: 'alignment-neutral',
      name: 'Neutral Alignment',
      description: 'XP gained from acting according to Neutral alignment',
      category: 'alignment',
      color: 'var(--color-text-secondary)',
      icon: 'Scale'
    }],
    ['alignment-chaotic', {
      id: 'alignment-chaotic',
      name: 'Chaotic Alignment',
      description: 'XP gained from acting according to Chaotic alignment',
      category: 'alignment',
      color: 'var(--color-accent)',
      icon: 'Zap'
    }],
    ['alignment-evil', {
      id: 'alignment-evil',
      name: 'Evil Alignment',
      description: 'XP gained from acting according to Evil alignment',
      category: 'alignment',
      color: 'var(--color-danger)',
      icon: 'Skull'
    }],
    ['level-up', {
      id: 'level-up',
      name: 'Level Up',
      description: 'XP reset when leveling up',
      category: 'advancement',
      color: 'var(--color-success)',
      icon: 'Star'
    }],
    ['gm-award', {
      id: 'gm-award',
      name: 'GM Award',
      description: 'XP awarded by the GM for exceptional roleplay',
      category: 'gm-award',
      color: 'var(--color-primary)',
      icon: 'Award'
    }],
    ['end-of-session', {
      id: 'end-of-session',
      name: 'End of Session',
      description: 'XP gained at the end of a session',
      category: 'special',
      color: 'var(--color-accent)',
      icon: 'Calendar'
    }]
  ])

  /**
   * Award XP to a character
   */
  awardXP(
    characterId: string,
    sourceId: string,
    amount: number,
    reason: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): XPEntry {
    const source = this.xpSources.get(sourceId)
    if (!source) {
      throw new Error(`Unknown XP source: ${sourceId}`)
    }

    const entry: XPEntry = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      characterId,
      source,
      amount,
      reason,
      timestamp: new Date(),
      sessionId,
      metadata
    }

    // Add to character's XP entries
    if (!this.xpEntries.has(characterId)) {
      this.xpEntries.set(characterId, [])
    }
    this.xpEntries.get(characterId)!.push(entry)

    // Clear analytics cache for this character
    this.analyticsCache.delete(characterId)

    // Create notification
    this.createNotification(entry)

    // Check for level up
    this.checkLevelUp(characterId)

    return entry
  }

  /**
   * Get XP entries for a character
   */
  getXPEntries(characterId: string, limit?: number): XPEntry[] {
    const entries = this.xpEntries.get(characterId) || []
    const sortedEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? sortedEntries.slice(0, limit) : sortedEntries
  }

  /**
   * Get total XP for a character
   */
  getTotalXP(characterId: string): number {
    const entries = this.xpEntries.get(characterId) || []
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }

  /**
   * Get XP analytics for a character
   */
  getAnalytics(characterId: string): XPAnalytics {
    if (this.analyticsCache.has(characterId)) {
      return this.analyticsCache.get(characterId)!
    }

    const entries = this.xpEntries.get(characterId) || []
    
    // Calculate analytics
    const totalXP = entries.reduce((sum, entry) => sum + entry.amount, 0)
    
    const xpBySource: Record<string, number> = {}
    entries.forEach(entry => {
      xpBySource[entry.source.id] = (xpBySource[entry.source.id] || 0) + entry.amount
    })

    const xpBySession: Record<string, number> = {}
    entries.forEach(entry => {
      if (entry.sessionId) {
        xpBySession[entry.sessionId] = (xpBySession[entry.sessionId] || 0) + entry.amount
      }
    })

    const sessionCount = Object.keys(xpBySession).length
    const averageXPPerSession = sessionCount > 0 ? totalXP / sessionCount : 0

    const mostCommonSourceId = Object.entries(xpBySource)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    const mostCommonSource = mostCommonSourceId ? this.xpSources.get(mostCommonSourceId)! : this.xpSources.get('failure')!

    // Calculate XP trend
    const xpTrend = entries
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .reduce((trend, entry) => {
        const cumulative = (trend[trend.length - 1]?.cumulative || 0) + entry.amount
        trend.push({
          date: entry.timestamp,
          amount: entry.amount,
          cumulative
        })
        return trend
      }, [] as Array<{ date: Date; amount: number; cumulative: number }>)

    const analytics: XPAnalytics = {
      totalXP,
      xpBySource,
      xpBySession,
      averageXPPerSession,
      mostCommonSource,
      xpTrend
    }

    this.analyticsCache.set(characterId, analytics)
    return analytics
  }

  /**
   * Get available XP sources
   */
  getXPSources(): XPSource[] {
    return Array.from(this.xpSources.values())
  }

  /**
   * Add notification listener
   */
  addNotificationListener(listener: (notification: XPNotification) => void) {
    this.listeners.add(listener)
  }

  /**
   * Remove notification listener
   */
  removeNotificationListener(listener: (notification: XPNotification) => void) {
    this.listeners.delete(listener)
  }

  /**
   * Get pending notifications
   */
  getNotifications(): XPNotification[] {
    return [...this.notifications]
  }

  /**
   * Clear notification
   */
  clearNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
  }

  /**
   * Create XP notification
   */
  private createNotification(entry: XPEntry) {
    const notification: XPNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      characterId: entry.characterId,
      entry,
      message: this.formatXPMessage(entry),
      type: entry.amount >= 3 ? 'milestone' : 'success',
      duration: entry.amount >= 3 ? 8000 : 5000,
      actions: entry.source.category === 'failure' ? [
        {
          label: 'View Character',
          action: () => {
            // Navigate to character sheet
            console.log('Navigate to character sheet')
          }
        }
      ] : undefined
    }

    this.notifications.push(notification)
    
    // Notify listeners
    this.listeners.forEach(listener => listener(notification))

    // Auto-clear notification after duration
    setTimeout(() => {
      this.clearNotification(notification.id)
    }, notification.duration)
  }

  /**
   * Format XP gain message
   */
  private formatXPMessage(entry: XPEntry): string {
    const amount = entry.amount > 0 ? `+${entry.amount}` : entry.amount.toString()
    return `${amount} XP from ${entry.source.name}: ${entry.reason}`
  }

  /**
   * Check if character should level up
   */
  private checkLevelUp(characterId: string) {
    const totalXP = this.getTotalXP(characterId)
    
    // Dungeon World level up thresholds: 7, 15, 24, 34, 45, 57, 70, 84, 99, 115+
    const levelThresholds = [7, 15, 24, 34, 45, 57, 70, 84, 99, 115]
    
    // Find current level based on XP
    let currentLevel = 1
    for (let i = 0; i < levelThresholds.length; i++) {
      if (totalXP >= levelThresholds[i]) {
        currentLevel = i + 2 // Level 2, 3, 4, etc.
      } else {
        break
      }
    }

    // Check if character has enough XP for next level
    const nextThreshold = levelThresholds[currentLevel - 1]
    if (nextThreshold && totalXP >= nextThreshold) {
      this.createLevelUpNotification(characterId, currentLevel + 1)
    }
  }

  /**
   * Create level up notification
   */
  private createLevelUpNotification(characterId: string, newLevel: number) {
    const notification: XPNotification = {
      id: `levelup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      characterId,
      entry: {
        id: 'level-up-check',
        characterId,
        source: this.xpSources.get('level-up')!,
        amount: 0,
        reason: `Ready to advance to level ${newLevel}`,
        timestamp: new Date()
      },
      message: `🎉 Ready to Level Up! You can advance to level ${newLevel}`,
      type: 'level-up',
      duration: 10000,
      actions: [
        {
          label: 'Level Up Now',
          action: () => {
            console.log('Trigger level up process')
          }
        },
        {
          label: 'View Character',
          action: () => {
            console.log('Navigate to character sheet')
          }
        }
      ]
    }

    this.notifications.push(notification)
    this.listeners.forEach(listener => listener(notification))
  }

  /**
   * Export XP data for backup
   */
  exportXPData(characterId: string): any {
    return {
      characterId,
      entries: this.xpEntries.get(characterId) || [],
      analytics: this.getAnalytics(characterId),
      exportDate: new Date()
    }
  }

  /**
   * Import XP data from backup
   */
  importXPData(data: any): boolean {
    try {
      if (!data.characterId || !Array.isArray(data.entries)) {
        return false
      }

      this.xpEntries.set(data.characterId, data.entries)
      this.analyticsCache.delete(data.characterId)
      return true
    } catch (error) {
      console.error('Failed to import XP data:', error)
      return false
    }
  }
}

// Singleton instance
export const xpIntegrationService = new XPIntegrationService()
export { XPIntegrationService }