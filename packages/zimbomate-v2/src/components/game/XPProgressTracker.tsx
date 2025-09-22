import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, Button, Badge } from '../ui'
import { 
  Star, TrendingUp, Award, Heart, Shield, Zap, 
  Calendar, AlertTriangle, ChevronRight, BarChart3
} from 'lucide-react'
import { xpIntegrationService, type XPEntry, type XPNotification } from '../../services/XPIntegrationService'
import { useCharacterStore } from '../../stores/characterStore'
import { getXPThreshold } from '../../models/Character'

interface XPProgressTrackerProps {
  characterId?: string
  compact?: boolean
  showNotifications?: boolean
}

export const XPProgressTracker: React.FC<XPProgressTrackerProps> = ({
  characterId,
  compact = false,
  showNotifications = true
}) => {
  const { getActiveCharacter, levelUpCharacter } = useCharacterStore()
  const [xpEntries, setXpEntries] = useState<XPEntry[]>([])
  const [notifications, setNotifications] = useState<XPNotification[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  const activeCharacter = getActiveCharacter()
  const effectiveCharacterId = characterId || activeCharacter?.id

  useEffect(() => {
    if (!effectiveCharacterId) return

    // Load XP data
    const entries = xpIntegrationService.getXPEntries(effectiveCharacterId, 20)
    const analyticsData = xpIntegrationService.getAnalytics(effectiveCharacterId)
    
    setXpEntries(entries)
    setAnalytics(analyticsData)

    // Set up notification listener
    const handleNotification = (notification: XPNotification) => {
      if (notification.characterId === effectiveCharacterId) {
        setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep last 5
      }
    }

    xpIntegrationService.addNotificationListener(handleNotification)
    
    // Load existing notifications
    const existingNotifications = xpIntegrationService.getNotifications()
      .filter(n => n.characterId === effectiveCharacterId)
    setNotifications(existingNotifications)

    return () => {
      xpIntegrationService.removeNotificationListener(handleNotification)
    }
  }, [effectiveCharacterId])

  const handleLevelUp = () => {
    if (effectiveCharacterId) {
      levelUpCharacter(effectiveCharacterId)
    }
  }

  const handleDismissNotification = (notificationId: string) => {
    xpIntegrationService.clearNotification(notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'failure': return <AlertTriangle size={14} />
      case 'bond-resolution': return <Heart size={14} />
      case 'alignment-good':
      case 'alignment-lawful':
      case 'alignment-neutral':
      case 'alignment-chaotic':
      case 'alignment-evil':
        return <Shield size={14} />
      case 'level-up': return <Star size={14} />
      case 'gm-award': return <Award size={14} />
      case 'end-of-session': return <Calendar size={14} />
      default: return <Zap size={14} />
    }
  }

  const getLevelThresholds = (level: number) => {
    // Use official DW rule: Current Level + 7
    return getXPThreshold(level)
  }

  const getCurrentLevel = (totalXP: number) => {
    // Start at level 1, check if we can level up
    let level = 1
    while (totalXP >= getXPThreshold(level)) {
      level++
    }
    return level
  }

  const getXPToNextLevel = (totalXP: number) => {
    const currentLevel = getCurrentLevel(totalXP)
    const nextThreshold = getXPThreshold(currentLevel)

    if (currentLevel >= 10) return 0 // Max level (arbitrary cap)
    return nextThreshold - totalXP
  }

  const getXPProgress = (totalXP: number) => {
    const currentLevel = getCurrentLevel(totalXP)

    if (currentLevel >= 10) return 100 // Max level

    const prevThreshold = currentLevel === 1 ? 0 : getXPThreshold(currentLevel - 1)
    const nextThreshold = getXPThreshold(currentLevel)

    const progress = ((totalXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  if (!effectiveCharacterId || !analytics) {
    return (
      <Card variant="muted">
        <CardContent className="p-4 text-center">
          <Star size={32} className="mx-auto text-(--color-text-muted) mb-2" />
          <p className="text-sm text-(--color-text-secondary)">
            Select a character to track XP progress
          </p>
        </CardContent>
      </Card>
    )
  }

  const currentLevel = getCurrentLevel(analytics.totalXP)
  const xpToNext = getXPToNextLevel(analytics.totalXP)
  const progressPercent = getXPProgress(analytics.totalXP)
  const canLevelUp = xpToNext <= 0 && currentLevel < 11

  if (compact) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-(--color-primary)" />
                <span className="font-semibold">{analytics.totalXP} XP</span>
              </div>
              <Badge variant="secondary" size="sm">
                Level {currentLevel}
              </Badge>
            </div>
            
            {canLevelUp ? (
              <Button variant="primary" size="sm" onClick={handleLevelUp}>
                Level Up!
              </Button>
            ) : (
              <span className="text-xs text-(--color-text-secondary)">
                {xpToNext} to next
              </span>
            )}
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-(--color-surface-muted) rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-(--color-primary)"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      <AnimatePresence>
        {showNotifications && notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative"
          >
            <Card variant={notification.type === 'level-up' ? 'success' : 'default'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: notification.entry.source.color,
                        opacity: 0.2 
                      }}
                    >
                      <div style={{ color: notification.entry.source.color }}>
                        {getSourceIcon(notification.entry.source.id)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.message}</p>
                      {notification.actions && (
                        <div className="flex gap-2 mt-2">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDismissNotification(notification.id)}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main XP Display */}
      <Card variant="magical">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star size={24} className="text-(--color-primary)" />
                <div>
                  <h3 className="text-lg font-display">Experience Points</h3>
                  <p className="text-sm text-(--color-text-secondary)">
                    Character progression and advancement
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <BarChart3 size={16} />
                {showHistory ? 'Hide' : 'Show'} Details
              </Button>
            </div>

            {/* Level and XP Display */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-4xl font-bold font-display">
                  Level {currentLevel}
                </div>
                <div className="text-xl font-semibold">
                  {analytics.totalXP} XP
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-(--color-text-secondary)">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{canLevelUp ? 'Ready!' : `${xpToNext} XP needed`}</span>
                </div>
                
                <div className="w-full bg-(--color-surface-muted) rounded-full h-3">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-(--color-primary) to-(--color-accent)"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Level Up Button */}
              {canLevelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleLevelUp}
                    className="gap-2"
                  >
                    <TrendingUp size={20} />
                    Level Up to {currentLevel + 1}!
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* XP Sources */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">XP Sources</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.xpBySource).map(([sourceId, amount]) => {
                    const source = xpIntegrationService.getXPSources().find(s => s.id === sourceId)
                    if (!source || amount === 0) return null
                    
                    return (
                      <div key={sourceId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div style={{ color: source.color }}>
                            {getSourceIcon(sourceId)}
                          </div>
                          <span className="text-sm">{source.name}</span>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {amount} XP
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent XP History */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Recent XP Gains</h4>
                <div className="space-y-3">
                  {xpEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ 
                          backgroundColor: entry.source.color,
                          opacity: 0.2 
                        }}
                      >
                        <div style={{ color: entry.source.color }}>
                          {getSourceIcon(entry.source.id)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            +{entry.amount} XP
                          </span>
                          <span className="text-xs text-(--color-text-muted)">
                            {entry.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-(--color-text-secondary) truncate">
                          {entry.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {xpEntries.length === 0 && (
                    <p className="text-sm text-(--color-text-secondary) text-center py-4">
                      No XP gained yet. Start adventuring!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}