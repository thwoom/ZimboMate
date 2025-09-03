/**
 * Condition Service for managing debilities, ongoing effects, and temporary conditions
 */

import type {
  Condition,
  ConditionFilter,
  ConditionNotification,
  ConditionPriority,
  ConditionSource,
  ConditionStats,
  CreateConditionOptions,
  Debility,
  OngoingEffect,
  TemporaryCondition,
} from '../models/Condition'
import {
  calculateConditionModifiers,
  checkConditionConflicts,
  formatDuration,
  getActiveDebilities,
  getConditionDisplay,
  getConditionSummary,
  getExpiringConditions,
  getOngoingEffectsForAction,
} from '../utils/conditionCalculations'

class ConditionService {
  private conditions: Map <string, Condition> = new Map()
  private notifications: Map <string, ConditionNotification> = new Map()
  private listeners: Set<(conditions: Condition[]) => void> = new Set()
  private notificationListeners: Set<(notifications: ConditionNotification[]) => void> = new Set()

  constructor() {
    this.loadConditions()
    this.loadNotifications()
    this.startExpirationCheck()
  }

  // ===== Condition Management =====

  /**
   * Create a new condition
   */
  createCondition(options: CreateConditionOptions): Condition {
    const id = `condition-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const now = new Date()

    let condition: Condition

    switch (options.type) {
      case 'debility':
        if (!options.debilityType) {
          throw new Error('Debility type is required for debility conditions')
        }
        condition = {
          id,
          characterId: options.characterId,
          name: options.name,
          description: options.description,
          type: 'debility',
          debilityType: options.debilityType,
          statModifiers: { [options.debilityType]: -1 },
          duration: options.duration,
          startTime: now,
          endTime: options.endTime,
          turnsRemaining: options.turnsRemaining,
          source: options.source,
          sourceId: options.sourceId,
          priority: options.priority || 'normal',
          isActive: true,
          isResolved: false,
          canStack: options.canStack || false,
          maxStacks: options.maxStacks,
          currentStacks: 1,
          icon: options.icon || '💀',
          color: options.color || '#ff4444',
          category: options.category || 'debuff',
          notes: options.notes,
          customData: options.customData,
          createdAt: now,
          updatedAt: now,
        } as Debility
        break

      case 'ongoing_effect':
        if (!options.ongoingEffectType) {
          throw new Error('Ongoing effect type is required for ongoing effect conditions')
        }
        condition = {
          id,
          characterId: options.characterId,
          name: options.name,
          description: options.description,
          type: 'ongoing_effect',
          ongoingEffectType: options.ongoingEffectType,
          appliesTo: options.appliesTo || ['all'],
          conditions: options.conditions,
          duration: options.duration,
          startTime: now,
          endTime: options.endTime,
          turnsRemaining: options.turnsRemaining,
          source: options.source,
          sourceId: options.sourceId,
          priority: options.priority || 'normal',
          isActive: true,
          isResolved: false,
          canStack: options.canStack || false,
          maxStacks: options.maxStacks,
          currentStacks: 1,
          icon: options.icon || '✨',
          color: options.color || '#44ff44',
          category: options.category || 'buff',
          notes: options.notes,
          customData: options.customData,
          createdAt: now,
          updatedAt: now,
        } as OngoingEffect
        break

      case 'temporary_condition':
        condition = {
          id,
          characterId: options.characterId,
          name: options.name,
          description: options.description,
          type: 'temporary_condition',
          tempCategory: options.tempCategory || 'neutral',
          triggers: options.triggers,
          effects: options.effects,
          statModifiers: options.statModifiers,
          duration: options.duration,
          startTime: now,
          endTime: options.endTime,
          turnsRemaining: options.turnsRemaining,
          source: options.source,
          sourceId: options.sourceId,
          priority: options.priority || 'normal',
          isActive: true,
          isResolved: false,
          canStack: options.canStack || false,
          maxStacks: options.maxStacks,
          currentStacks: 1,
          icon: options.icon || '⚡',
          color: options.color || '#666666',
          notes: options.notes,
          customData: options.customData,
          createdAt: now,
          updatedAt: now,
        } as TemporaryCondition
        break

      default:
        throw new Error(`Unknown condition type: ${options.type}`)
    }

    this.conditions.set(id, condition)
    this.saveConditions()
    this.notifyListeners()
    this.checkForConflicts(condition)

    return condition
  }

  /**
   * Get a condition by ID
   */
  getCondition(id: string): Condition | undefined {
    return this.conditions.get(id)
  }

  /**
   * Get all conditions for a character
   */
  getConditionsForCharacter(characterId: string, filter?: ConditionFilter): Condition[] {
    let conditions = [...this.conditions.values()]
      .filter(c => c.characterId === characterId)

    if (filter) {
      conditions = this.applyFilter(conditions, filter)
    }

    return conditions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get all active conditions for a character
   */
  getActiveConditions(characterId: string): Condition[] {
    return this.getConditionsForCharacter(characterId, { isActive: true })
  }

  /**
   * Update a condition
   */
  updateCondition(id: string, updates: Partial <Condition>): Condition | undefined {
    const condition = this.conditions.get(id)
    if (!condition)
      return undefined

    const updatedCondition = {
      ...condition,
      ...updates,
      updatedAt: new Date(),
    }

    this.conditions.set(id, updatedCondition)
    this.saveConditions()
    this.notifyListeners()

    return updatedCondition
  }

  /**
   * Resolve a condition
   */
  resolveCondition(id: string, resolvedBy?: string): boolean {
    const condition = this.conditions.get(id)
    if (!condition || condition.isResolved)
      return false

    const now = new Date()
    const updatedCondition = {
      ...condition,
      isActive: false,
      isResolved: true,
      resolvedAt: now,
      resolvedBy,
      updatedAt: now,
    }

    this.conditions.set(id, updatedCondition)
    this.saveConditions()
    this.notifyListeners()

    // Create resolution notification
    this.createNotification({
      conditionId: id,
      characterId: condition.characterId,
      type: 'reminder',
      message: `Condition "${condition.name}" has been resolved`,
      priority: 'normal',
    })

    return true
  }

  /**
   * Delete a condition
   */
  deleteCondition(id: string): boolean {
    const condition = this.conditions.get(id)
    if (!condition)
      return false

    this.conditions.delete(id)
    this.saveConditions()
    this.notifyListeners()

    return true
  }

  /**
   * Stack a condition (if it supports stacking)
   */
  stackCondition(id: string): boolean {
    const condition = this.conditions.get(id)
    if (!condition || !condition.canStack)
      return false

    if (condition.maxStacks && condition.currentStacks >= condition.maxStacks) {
      // Create stack limit notification
      this.createNotification({
        conditionId: id,
        characterId: condition.characterId,
        type: 'stack_limit',
        message: `Condition "${condition.name}" has reached maximum stacks`,
        priority: 'high',
      })
      return false
    }

    const updatedCondition = {
      ...condition,
      currentStacks: condition.currentStacks + 1,
      updatedAt: new Date(),
    }

    this.conditions.set(id, updatedCondition)
    this.saveConditions()
    this.notifyListeners()

    return true
  }

  // ===== Utility Methods =====

  /**
   * Apply filter to conditions
   */
  private applyFilter(conditions: Condition[], filter: ConditionFilter): Condition[] {
    return conditions.filter((condition) => {
      if (filter.type && condition.type !== filter.type)
        return false
      if (filter.isActive !== undefined && condition.isActive !== filter.isActive)
        return false
      if (filter.isResolved !== undefined && condition.isResolved !== filter.isResolved)
        return false
      if (filter.source && condition.source !== filter.source)
        return false
      if (filter.priority && condition.priority !== filter.priority)
        return false
      if (filter.category && condition.category !== filter.category)
        return false

      if (filter.debilityType && condition.type === 'debility') {
        const debility = condition as Debility
        if (debility.debilityType !== filter.debilityType)
          return false
      }

      if (filter.ongoingEffectType && condition.type === 'ongoing_effect') {
        const effect = condition as OngoingEffect
        if (effect.ongoingEffectType !== filter.ongoingEffectType)
          return false
      }

      return true
    })
  }

  /**
   * Clear all conditions/notifications (intended for tests)
   */
  clearAll(): void {
    this.conditions.clear()
    this.notifications.clear()
    try {
      localStorage.removeItem('conditions')
      localStorage.removeItem('condition-notifications')
    }
    catch {}
    this.notifyListeners()
    this.notifyNotificationListeners()
  }

  /**
   * Check for conflicts with a new condition
   */
  private checkForConflicts(newCondition: Condition): void {
    const characterConditions = this.getActiveConditions(newCondition.characterId)
    const { hasConflicts, conflicts } = checkConditionConflicts([...characterConditions, newCondition])

    if (hasConflicts) {
      for (const conflict of conflicts) {
        this.createNotification({
          conditionId: newCondition.id,
          characterId: newCondition.characterId,
          type: 'conflict',
          message: `Condition "${newCondition.name}" conflicts with "${conflict.condition2.name}"`,
          priority: 'high',
        })
      }
    }
  }

  /**
   * Get condition statistics for a character
   */
  getConditionStats(characterId: string): ConditionStats {
    const conditions = this.getConditionsForCharacter(characterId)
    const summary = getConditionSummary(conditions)

    const bySource: Record <ConditionSource, number> = {
      move: 0,
      spell: 0,
      item: 0,
      environment: 0,
      npc: 0,
      gm: 0,
      manual: 0,
    }

    const byPriority: Record <ConditionPriority, number> = {
      low: 0,
      normal: 0,
      high: 0,
      critical: 0,
    }

    const byType: Record <Condition['type'], number> = {
      debility: 0,
      ongoing_effect: 0,
      temporary_condition: 0,
    }

    for (const condition of conditions) {
      bySource[condition.source]++
      byPriority[condition.priority]++
      byType[condition.type]++
    }

    return {
      totalConditions: conditions.length,
      activeConditions: summary.totalActive,
      resolvedConditions: summary.totalResolved,
      debilities: summary.debilities,
      ongoingEffects: summary.ongoingEffects,
      temporaryConditions: summary.temporaryConditions,
      bySource,
      byPriority,
      byType,
    }
  }

  // ===== Notification Management =====

  /**
   * Create a notification
   */
  createNotification(options: {
    conditionId: string
    characterId: string
    type: ConditionNotification['type']
    message: string
    priority?: ConditionNotification['priority']
    expiresAt?: Date
  }): ConditionNotification {
    const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const now = new Date()

    const notification: ConditionNotification = {
      id,
      conditionId: options.conditionId,
      characterId: options.characterId,
      type: options.type,
      message: options.message,
      priority: options.priority || 'normal',
      isRead: false,
      createdAt: now,
      expiresAt: options.expiresAt,
    }

    this.notifications.set(id, notification)
    this.saveNotifications()
    this.notifyNotificationListeners()

    return notification
  }

  /**
   * Get notifications for a character
   */
  getNotifications(characterId: string): ConditionNotification[] {
    return [...this.notifications.values()]
      .filter(n => n.characterId === characterId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(id: string): boolean {
    const notification = this.notifications.get(id)
    if (!notification)
      return false

    const updatedNotification = {
      ...notification,
      isRead: true,
    }

    this.notifications.set(id, updatedNotification)
    this.saveNotifications()
    this.notifyNotificationListeners()

    return true
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): boolean {
    const deleted = this.notifications.delete(id)
    if (deleted) {
      this.saveNotifications()
      this.notifyNotificationListeners()
    }
    return deleted
  }

  // ===== Persistence =====

  private saveConditions(): void {
    try {
      const conditionsArray = [...this.conditions.values()]
      localStorage.setItem('conditions', JSON.stringify(conditionsArray))
    }
    catch {
    }
  }

  private loadConditions(): void {
    try {
      const stored = localStorage.getItem('conditions')
      if (stored) {
        const conditionsArray = JSON.parse(stored)
        this.conditions.clear()
        conditionsArray.forEach((condition: any) => {
          // Convert date strings back to Date objects
          condition.startTime = new Date(condition.startTime)
          condition.createdAt = new Date(condition.createdAt)
          condition.updatedAt = new Date(condition.updatedAt)
          if (condition.endTime)
            condition.endTime = new Date(condition.endTime)
          if (condition.resolvedAt)
            condition.resolvedAt = new Date(condition.resolvedAt)

          this.conditions.set(condition.id, condition)
        })
      }
    }
    catch {
    }
  }

  private saveNotifications(): void {
    try {
      const notificationsArray = [...this.notifications.values()]
      localStorage.setItem('condition-notifications', JSON.stringify(notificationsArray))
    }
    catch {
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('condition-notifications')
      if (stored) {
        const notificationsArray = JSON.parse(stored)
        this.notifications.clear()
        notificationsArray.forEach((notification: any) => {
          notification.createdAt = new Date(notification.createdAt)
          if (notification.expiresAt)
            notification.expiresAt = new Date(notification.expiresAt)

          this.notifications.set(notification.id, notification)
        })
      }
    }
    catch {
    }
  }

  // ===== Expiration Management =====

  private startExpirationCheck(): void {
    // Check for expiring conditions every minute
    setInterval(() => {
      this.checkExpiringConditions()
    }, 60000)
  }

  private checkExpiringConditions(): void {
    const allConditions = [...this.conditions.values()]
    const expiringConditions = getExpiringConditions(allConditions, 5) // 5 minutes

    for (const condition of expiringConditions) {
      this.createNotification({
        conditionId: condition.id,
        characterId: condition.characterId,
        type: 'expiring',
        message: `Condition "${condition.name}" will expire soon`,
        priority: 'high',
        expiresAt: condition.endTime,
      })
    }

    // Auto-resolve expired conditions
    const now = new Date()
    for (const condition of allConditions) {
      if (condition.isActive && condition.endTime && condition.endTime <= now) {
        this.resolveCondition(condition.id, 'system')
      }
    }
  }

  // ===== Event Listeners =====

  addListener(listener: (conditions: Condition[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  addNotificationListener(listener: (notifications: ConditionNotification[]) => void): () => void {
    this.notificationListeners.add(listener)
    return () => this.notificationListeners.delete(listener)
  }

  private notifyListeners(): void {
    const conditions = [...this.conditions.values()]
    for (const listener of this.listeners) listener(conditions)
  }

  private notifyNotificationListeners(): void {
    const notifications = [...this.notifications.values()]
    for (const listener of this.notificationListeners) listener(notifications)
  }

  // ===== Utility Methods =====

  /**
   * Get condition display information
   */
  getConditionDisplay(condition: Condition) {
    return getConditionDisplay(condition)
  }

  /**
   * Format condition duration
   */
  formatDuration(condition: Condition): string {
    return formatDuration(condition)
  }

  /**
   * Calculate condition modifiers for a character
   */
  calculateModifiers(characterId: string) {
    const conditions = this.getActiveConditions(characterId)
    return calculateConditionModifiers(characterId, conditions)
  }

  /**
   * Get active debilities for a character
   */
  getActiveDebilities(characterId: string): Debility[] {
    const conditions = this.getActiveConditions(characterId)
    return getActiveDebilities(conditions)
  }

  /**
   * Get ongoing effects for a specific action
   */
  getOngoingEffectsForAction(characterId: string, action: string): OngoingEffect[] {
    const conditions = this.getActiveConditions(characterId)
    return getOngoingEffectsForAction(conditions, action)
  }
}

// Export singleton instance
export const conditionService = new ConditionService()
