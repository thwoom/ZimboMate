/**
 * XP Notification Component
 * Shows animated notifications when XP is awarded for failed rolls
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'
import { useXPStore } from '../../stores/xpStore'

interface XPNotificationProps {
  characterId: string
  className?: string
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  characterId,
  className = ''
}) => {
  const { characterXP, characterLevel, showXPNotifications } = useXPStore()

  if (!showXPNotifications) return null

  const currentXP = characterXP[characterId] || 0
  const currentLevel = characterLevel[characterId] || 1

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {/* This would be triggered by XP events - simplified for now */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Star size={20} className="text-yellow-200" />
          </motion.div>

          <div className="flex-1">
            <div className="font-semibold text-sm">XP Gained!</div>
            <div className="text-xs text-yellow-100">
              Failed roll grants experience
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">+1</div>
            <div className="text-xs text-yellow-200">
              Level {currentLevel}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// XP Progress Bar Component
export const XPProgressBar: React.FC<{
  characterId: string
  className?: string
  compact?: boolean
}> = ({ characterId, className = '', compact = false }) => {
  const { characterXP, characterLevel, getXPForNextLevel, calculateLevelFromXP } = useXPStore()

  const totalXP = characterXP[characterId] || 0
  const currentLevel = characterLevel[characterId] || 1
  const xpForNextLevel = getXPForNextLevel(characterId)

  // Calculate current level progress
  let xpInCurrentLevel = totalXP
  for (let level = 1; level < currentLevel; level++) {
    xpInCurrentLevel -= (7 + (level - 1))
  }

  const progressPercentage = Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100)

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Star size={14} className="text-yellow-600" />
        <div className="text-sm font-medium">
          Level {currentLevel}
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-600">
          {xpInCurrentLevel}/{xpForNextLevel}
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600" />
          <span className="font-semibold text-sm">Experience</span>
        </div>
        <div className="text-sm text-gray-600">
          Level {currentLevel}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Total XP: {totalXP} • Next level needs {xpForNextLevel} XP
      </div>
    </div>
  )
}