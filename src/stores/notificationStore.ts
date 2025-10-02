/**
 * Notification Queue Management System
 * Handles dice roll notifications, XP awards, and other system messages
 * Prevents notification spam with intelligent queuing and prioritization
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'dice-roll' | 'xp-award' | 'hold-granted' | 'level-up' | 'achievement' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  icon?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  duration: number // milliseconds, 0 = permanent
  timestamp: number
  characterId?: string
  rollId?: string
  dismissible: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
}

interface NotificationState {
  // State
  activeNotifications: Notification[]
  notificationHistory: Notification[]
  maxActiveNotifications: number
  isEnabled: boolean
  preferences: {
    enableDiceRolls: boolean
    enableXPAwards: boolean
    enableHoldGrants: boolean
    enableLevelUps: boolean
    enableAchievements: boolean
    mutedDuration: number // 0 = not muted
  }

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  dismissAllNotifications: () => void
  muteNotifications: (durationMs: number) => void
  unmuteNotifications: () => void
  setPreference: <K extends keyof NotificationState['preferences']>(key: K, value: NotificationState['preferences'][K]) => void
  clearHistory: () => void
  getNotificationsByType: (type: NotificationType) => Notification[]
  getNotificationsByCharacter: (characterId: string) => Notification[]
}

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  'dice-roll': 3000,
  'xp-award': 4000,
  'hold-granted': 3500,
  'level-up': 8000,
  'achievement': 6000,
  'error': 6000,
  'info': 4000,
}

const PRIORITY_WEIGHTS: Record<Notification['priority'], number> = {
  urgent: 1000,
  high: 100,
  medium: 10,
  low: 1,
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeNotifications: [],
      notificationHistory: [],
      maxActiveNotifications: 3,
      isEnabled: true,
      preferences: {
        enableDiceRolls: true,
        enableXPAwards: true,
        enableHoldGrants: true,
        enableLevelUps: true,
        enableAchievements: true,
        mutedDuration: 0,
      },

      // Add notification with intelligent queuing
      addNotification: (notificationData) => {
        const state = get()

        // Check if notifications are muted
        if (!state.isEnabled || (state.preferences.mutedDuration > Date.now())) {
          return
        }

        // Check type-specific preferences
        const typeEnabled = (() => {
          switch (notificationData.type) {
            case 'dice-roll': return state.preferences.enableDiceRolls
            case 'xp-award': return state.preferences.enableXPAwards
            case 'hold-granted': return state.preferences.enableHoldGrants
            case 'level-up': return state.preferences.enableLevelUps
            case 'achievement': return state.preferences.enableAchievements
            default: return true
          }
        })()

        if (!typeEnabled)
          return

        const notification: Notification = {
          ...notificationData,
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          duration: notificationData.duration || DEFAULT_DURATIONS[notificationData.type] || 4000,
        }

        set((state) => {
          let newActive = [...state.activeNotifications]

          // Handle duplicate prevention for dice rolls
          if (notification.type === 'dice-roll' && notification.rollId) {
            newActive = newActive.filter(n => n.rollId !== notification.rollId)
          }

          // Add new notification
          newActive.push(notification)

          // Sort by priority and timestamp
          newActive.sort((a, b) => {
            const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]
            if (priorityDiff !== 0)
              return priorityDiff
            return b.timestamp - a.timestamp
          })

          // Limit active notifications
          if (newActive.length > state.maxActiveNotifications) {
            // Remove lowest priority, oldest notifications
            const removed = newActive.splice(state.maxActiveNotifications)

            // But keep urgent notifications
            removed.forEach((removedNotification) => {
              if (removedNotification.priority === 'urgent') {
                newActive[newActive.length - 1] = removedNotification
              }
            })
          }

          // Add to history
          const newHistory = [notification, ...state.notificationHistory].slice(0, 100) // Keep last 100

          console.log(`[Notifications] Added: ${notification.title} (${notification.type})`)

          return {
            activeNotifications: newActive,
            notificationHistory: newHistory,
          }
        })

        // Auto-dismiss if duration is set
        if (notification.duration > 0) {
          setTimeout(() => {
            get().dismissNotification(notification.id)
          }, notification.duration)
        }
      },

      // Dismiss specific notification
      dismissNotification: (id) => {
        set(state => ({
          activeNotifications: state.activeNotifications.filter(n => n.id !== id),
        }))
      },

      // Dismiss all notifications
      dismissAllNotifications: () => {
        set({ activeNotifications: [] })
      },

      // Mute notifications temporarily
      muteNotifications: (durationMs) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            mutedDuration: Date.now() + durationMs,
          },
        }))
      },

      // Unmute notifications
      unmuteNotifications: () => {
        set(state => ({
          preferences: {
            ...state.preferences,
            mutedDuration: 0,
          },
        }))
      },

      // Update preferences
      setPreference: (key, value) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }))
      },

      // Clear notification history
      clearHistory: () => {
        set({ notificationHistory: [] })
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const state = get()
        return state.notificationHistory.filter(n => n.type === type)
      },

      // Get notifications by character
      getNotificationsByCharacter: (characterId) => {
        const state = get()
        return state.notificationHistory.filter(n => n.characterId === characterId)
      },
    }),
    {
      name: 'zimbomate-notification-store',
      version: 1,
      // Don't persist active notifications - they should reset on page reload
      partialize: state => ({
        preferences: state.preferences,
        notificationHistory: state.notificationHistory,
        maxActiveNotifications: state.maxActiveNotifications,
        isEnabled: state.isEnabled,
      }),
    },
  ),
)

// Convenience functions for common notification types
export function notifyDiceRoll(result: number, outcome: 'success' | 'partial' | 'failure', context: string, characterId: string, rollId: string) {
  const outcomeEmojis = {
    success: '🎉',
    partial: '⚡',
    failure: '💪',
  }

  const outcomeMessages = {
    success: 'Great success!',
    partial: 'Partial success',
    failure: 'Learn from failure',
  }

  useNotificationStore.getState().addNotification({
    type: 'dice-roll',
    title: `${context}: ${result}`,
    message: outcomeMessages[outcome],
    icon: outcomeEmojis[outcome],
    priority: outcome === 'failure' ? 'medium' : 'low', // Failures are more important (XP!)
    duration: 3000,
    characterId,
    rollId,
    dismissible: true,
  })
}

export function notifyXPAward(amount: number, reason: string, characterId: string, newTotal?: number) {
  useNotificationStore.getState().addNotification({
    type: 'xp-award',
    title: `+${amount} XP`,
    message: newTotal ? `${reason} • Total: ${newTotal}` : reason,
    icon: '⭐',
    priority: 'medium',
    duration: 4000,
    characterId,
    dismissible: true,
  })
}

export function notifyHoldGranted(amount: number, moveName: string, characterId: string) {
  useNotificationStore.getState().addNotification({
    type: 'hold-granted',
    title: `${moveName}`,
    message: `Gained ${amount} hold`,
    icon: '🛡️',
    priority: 'medium',
    duration: 3500,
    characterId,
    dismissible: true,
  })
}

export function notifyLevelUp(newLevel: number, characterId: string) {
  useNotificationStore.getState().addNotification({
    type: 'level-up',
    title: `Level Up!`,
    message: `Congratulations! You are now level ${newLevel}`,
    icon: '🌟',
    priority: 'high',
    duration: 8000,
    characterId,
    dismissible: true,
    actions: [
      {
        label: 'View Character',
        action: () => {
          // Navigate to character sheet
          console.log('Navigate to character sheet')
        },
        style: 'primary',
      },
    ],
  })
}
