/**
 * SessionFlowControls - Session Management Tools
 *
 * Handles session timing, break reminders, and session flow controls.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Pause,
  Play,
  Square,
  Timer,
  Coffee,
  Clock,
  BarChart3
} from 'lucide-react'
import { Button, Badge } from '../../ui'

interface SessionFlowControlsProps {
  sessionStartTime: Date | null
  onEndSession: () => void
  className?: string
}

export const SessionFlowControls: React.FC<SessionFlowControlsProps> = ({
  sessionStartTime,
  onEndSession,
  className = ''
}) => {
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState(0)

  // Update session duration every minute
  useEffect(() => {
    if (!sessionStartTime || isPaused) return

    const interval = setInterval(() => {
      const now = new Date()
      const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000) - pausedTime
      setSessionDuration(Math.max(0, duration))
    }, 60000) // Update every minute

    // Initial calculation
    const now = new Date()
    const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000) - pausedTime
    setSessionDuration(Math.max(0, duration))

    return () => clearInterval(interval)
  }, [sessionStartTime, isPaused, pausedTime])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getSessionStatus = () => {
    if (sessionDuration >= 180) return { status: 'Long session', color: 'text-red-500' }
    if (sessionDuration >= 120) return { status: 'Extended play', color: 'text-yellow-500' }
    if (sessionDuration >= 60) return { status: 'Good session', color: 'text-green-500' }
    return { status: 'Getting started', color: 'text-blue-500' }
  }

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resuming - don't add to paused time yet
      setIsPaused(false)
    } else {
      // Pausing - start tracking pause time
      setIsPaused(true)
      // In a real implementation, we'd track the pause start time
    }
  }

  const suggestBreak = sessionDuration > 0 && sessionDuration % 90 === 0 && !isPaused

  const sessionInfo = getSessionStatus()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Session Duration */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-gray-600" />
        <span className="font-mono text-sm">
          {formatDuration(sessionDuration)}
        </span>
        <Badge
          variant="secondary"
          className={`text-xs ${sessionInfo.color}`}
        >
          {sessionInfo.status}
        </Badge>
      </div>

      {/* Session Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePauseToggle}
          className="gap-1"
        >
          {isPaused ? (
            <Play size={14} />
          ) : (
            <Pause size={14} />
          )}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onEndSession}
          className="gap-1 text-red-600 hover:text-red-700"
        >
          <Square size={14} />
          End Session
        </Button>
      </div>

      {/* Break Suggestion */}
      {suggestBreak && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-xs text-orange-600"
        >
          <Coffee size={12} />
          <span>Consider a break</span>
        </motion.div>
      )}
    </div>
  )
}

export default SessionFlowControls