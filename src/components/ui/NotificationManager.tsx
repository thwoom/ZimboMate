/**
 * Notification Manager Component
 * Displays and manages the notification queue with elegant animations
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Settings } from 'lucide-react'
import { useNotificationStore, type Notification } from '../../stores/notificationStore'
import { Button } from './Button'

interface NotificationManagerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

const NotificationItem: React.FC<{
  notification: Notification
  onDismiss: (id: string) => void
  index: number
}> = ({ notification, onDismiss, index }) => {
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-destructive/40 bg-destructive/12'
      case 'high': return 'border-orange-500 bg-chart-4/12'
      case 'medium': return 'border-primary/40 bg-primary/10'
      case 'low': return 'border-border bg-card'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }}
      className={`
        relative p-4 rounded-lg shadow-lg border max-w-sm mb-3
        ${getPriorityColor(notification.priority)}
        hover:shadow-xl transition-shadow duration-200
      `}
      whileHover={{ scale: 1.02 }}
    >
      {/* Priority indicator */}
      {notification.priority === 'urgent' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive/120 rounded-full animate-pulse" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {notification.icon && (
              <span className="text-lg">{notification.icon}</span>
            )}
            <h4 className="font-semibold text-sm text-foreground ">
              {notification.title}
            </h4>
          </div>

          <p className="text-sm text-foreground mb-3">
            {notification.message}
          </p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2">
              {notification.actions.map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    action.action()
                    onDismiss(notification.id)
                  }}
                  className="text-xs px-2 py-1"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {notification.dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="p-1 ml-2"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary/100 rounded-bl-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  position = 'top-right',
  className = ''
}) => {
  const {
    activeNotifications,
    dismissNotification,
    dismissAllNotifications,
    preferences,
    muteNotifications,
    unmuteNotifications,
    setPreference
  } = useNotificationStore()

  const isMuted = preferences.mutedDuration > Date.now()

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      default: return 'top-4 right-4'
    }
  }

  if (activeNotifications.length === 0) return null

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      {/* Controls */}
      <div className="flex justify-end mb-2 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isMuted ? unmuteNotifications() : muteNotifications(5 * 60 * 1000)}
          className="p-1 bg-card/80 backdrop-blur-sm"
          title={isMuted ? 'Unmute notifications' : 'Mute for 5 minutes'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </Button>

        {activeNotifications.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissAllNotifications}
            className="p-1 bg-card/80 backdrop-blur-sm"
            title="Dismiss all notifications"
          >
            <X size={14} />
            <span className="ml-1 text-xs">{activeNotifications.length}</span>
          </Button>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
            index={index}
          />
        ))}
      </AnimatePresence>

      {/* Muted indicator */}
      {isMuted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-2"
        >
          <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm rounded px-2 py-1">
            Notifications muted
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Settings component for notification preferences
export const NotificationSettings: React.FC<{
  className?: string
}> = ({ className = '' }) => {
  const { preferences, setPreference } = useNotificationStore()

  const toggleSetting = (key: keyof typeof preferences, value: boolean) => {
    setPreference(key, value)
  }

  return (
    <div className={`p-4 bg-card rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Settings size={16} className="text-muted-foreground" />
        <h3 className="font-semibold">Notification Settings</h3>
      </div>

      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm">Dice Roll Results</span>
          <input
            type="checkbox"
            checked={preferences.enableDiceRolls}
            onChange={(e) => toggleSetting('enableDiceRolls', e.target.checked)}
            className="rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm">XP Awards</span>
          <input
            type="checkbox"
            checked={preferences.enableXPAwards}
            onChange={(e) => toggleSetting('enableXPAwards', e.target.checked)}
            className="rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm">Hold Grants</span>
          <input
            type="checkbox"
            checked={preferences.enableHoldGrants}
            onChange={(e) => toggleSetting('enableHoldGrants', e.target.checked)}
            className="rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm">Level Ups</span>
          <input
            type="checkbox"
            checked={preferences.enableLevelUps}
            onChange={(e) => toggleSetting('enableLevelUps', e.target.checked)}
            className="rounded"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm">Achievements</span>
          <input
            type="checkbox"
            checked={preferences.enableAchievements}
            onChange={(e) => toggleSetting('enableAchievements', e.target.checked)}
            className="rounded"
          />
        </label>
      </div>
    </div>
  )
}



