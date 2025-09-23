/**
 * Timers Widget - Session timing and bookmarks
 * Phase 4A: Essential for tracking session duration and important moments
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Timer, 
  Play, 
  Pause,
  Square,
  RotateCcw,
  Plus,
  Bookmark,
  Clock,
  Edit3,
  Trash2,
  Bell
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import { useSessionStore } from '../../../stores'

export interface SessionTimer {
  id: string
  name: string
  type: 'stopwatch' | 'countdown'
  duration: number // in seconds
  remaining: number // in seconds
  isRunning: boolean
  startTime?: Date
  endTime?: Date
  description?: string
}

export interface TimeBookmark {
  id: string
  name: string
  timestamp: Date
  sessionTime: number // seconds from session start
  description?: string
}

interface TimersWidgetProps {
  className?: string
}

export const TimersWidget: React.FC<TimersWidgetProps> = ({ 
  className = '' 
}) => {
  const { sessionTimers, timeBookmarks, sessionStartTime, addTimer, updateTimer, deleteTimer, addBookmark, deleteBookmark } = useSessionStore()
  const [isCreatingTimer, setIsCreatingTimer] = useState(false)
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false)
  const [newTimer, setNewTimer] = useState({
    name: '',
    type: 'countdown' as const,
    duration: 300, // 5 minutes default
    description: ''
  })
  const [newBookmark, setNewBookmark] = useState({
    name: '',
    description: ''
  })

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      sessionTimers.forEach(timer => {
        if (timer.isRunning) {
          if (timer.type === 'countdown' && timer.remaining > 0) {
            updateTimer(timer.id, { remaining: timer.remaining - 1 })
          } else if (timer.type === 'stopwatch') {
            updateTimer(timer.id, { remaining: timer.remaining + 1 })
          }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionTimers, updateTimer])

  const createTimer = () => {
    if (!newTimer.name.trim()) return

    const timer: SessionTimer = {
      id: `timer-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: newTimer.name.trim(),
      type: newTimer.type,
      duration: newTimer.duration,
      remaining: newTimer.type === 'countdown' ? newTimer.duration : 0,
      isRunning: false,
      description: newTimer.description.trim() || undefined
    }

    addTimer(timer)
    setNewTimer({
      name: '',
      type: 'countdown',
      duration: 300,
      description: ''
    })
    setIsCreatingTimer(false)
  }

  const createBookmark = () => {
    if (!newBookmark.name.trim()) return

    const sessionTime = sessionStartTime 
      ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
      : 0

    const bookmark: TimeBookmark = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: newBookmark.name.trim(),
      timestamp: new Date(),
      sessionTime,
      description: newBookmark.description.trim() || undefined
    }

    addBookmark(bookmark)
    setNewBookmark({ name: '', description: '' })
    setIsCreatingBookmark(false)
  }

  const toggleTimer = (timerId: string) => {
    const timer = sessionTimers.find(t => t.id === timerId)
    if (!timer) return

    if (timer.isRunning) {
      updateTimer(timerId, { 
        isRunning: false,
        endTime: new Date()
      })
    } else {
      updateTimer(timerId, { 
        isRunning: true,
        startTime: new Date()
      })
    }
  }

  const resetTimer = (timerId: string) => {
    const timer = sessionTimers.find(t => t.id === timerId)
    if (!timer) return

    updateTimer(timerId, {
      remaining: timer.type === 'countdown' ? timer.duration : 0,
      isRunning: false,
      startTime: undefined,
      endTime: undefined
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getCurrentSessionTime = () => {
    if (!sessionStartTime) return 0
    return Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
  }

  const getTimerProgress = (timer: SessionTimer) => {
    if (timer.type === 'stopwatch') return 0
    return timer.duration > 0 ? ((timer.duration - timer.remaining) / timer.duration) * 100 : 0
  }

  const isTimerExpired = (timer: SessionTimer) => {
    return timer.type === 'countdown' && timer.remaining <= 0
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer size={20} />
          <span className="font-medium">Session Timers</span>
          <Badge variant="secondary">{sessionTimers.length}</Badge>
        </div>
      </div>

      {/* Session Time */}
      <Card variant="magical">
        <CardContent className="text-center space-y-2 p-6 pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock size={20} />
              <span className="font-medium">Session Duration</span>
            </div>
            <div className="text-3xl font-bold">
              {formatTime(getCurrentSessionTime())}
            </div>
            <div className="text-sm text-muted-foreground">
              Started: {sessionStartTime ? sessionStartTime.toLocaleTimeString() : 'Not started'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Timer/Bookmark Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreatingTimer(true)}
          className="gap-2"
        >
          <Plus size={16} />
          Add Timer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingBookmark(true)}
          className="gap-2"
        >
          <Bookmark size={16} />
          Bookmark
        </Button>
      </div>

      {/* Create Timer Form */}
      <AnimatePresence>
        {isCreatingTimer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
        <Card variant="magical">
          <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timer Name
                    </label>
                    <input
                      type="text"
                      value={newTimer.name}
                      onChange={(e) => setNewTimer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Combat Round, Torch Duration, etc."
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)'
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Type
                      </label>
                      <select
                        value={newTimer.type}
                        onChange={(e) => setNewTimer(prev => ({ 
                          ...prev, 
                          type: e.target.value as 'countdown' | 'stopwatch' 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--primary)',
                          borderOpacity: 0.2,
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="countdown">Countdown</option>
                        <option value="stopwatch">Stopwatch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={Math.floor(newTimer.duration / 60)}
                        onChange={(e) => setNewTimer(prev => ({ 
                          ...prev, 
                          duration: (parseInt(e.target.value) || 5) * 60 
                        }))}
                        min="1"
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--primary)',
                          borderOpacity: 0.2,
                          color: 'var(--foreground)'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newTimer.description}
                      onChange={(e) => setNewTimer(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What is this timer for?"
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={createTimer}
                      disabled={!newTimer.name.trim()}
                    >
                      Create Timer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreatingTimer(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Bookmark Form */}
      <AnimatePresence>
        {isCreatingBookmark && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="magical">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bookmark Name
                    </label>
                    <input
                      type="text"
                      value={newBookmark.name}
                      onChange={(e) => setNewBookmark(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Important Discovery, Boss Fight, etc."
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)'
                      }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={newBookmark.description}
                      onChange={(e) => setNewBookmark(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What happened at this moment?"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={createBookmark}
                      disabled={!newBookmark.name.trim()}
                    >
                      Create Bookmark
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreatingBookmark(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Timers */}
      {sessionTimers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Active Timers</h4>
          <AnimatePresence>
            {sessionTimers.map((timer, index) => (
              <motion.div
                key={timer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card variant={isTimerExpired(timer) ? "magical" : "surface"}>
                  <CardContent className="p-4 pt-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{timer.name}</div>
                            <Badge variant={timer.type === 'countdown' ? 'default' : 'secondary'}>
                              {timer.type}
                            </Badge>
                            {isTimerExpired(timer) && (
                              <Badge variant="default" className="bg-destructive/15 text-destructive gap-1">
                                <Bell size={10} />
                                Expired
                              </Badge>
                            )}
                          </div>
                          {timer.description && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {timer.description}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTimer(timer.id)}
                            className="p-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isTimerExpired(timer) ? 'text-destructive' : ''}`}>
                          {formatTime(Math.abs(timer.remaining))}
                        </div>
                        {timer.type === 'countdown' && (
                          <div className="text-xs text-muted-foreground">
                            of {formatTime(timer.duration)}
                          </div>
                        )}
                      </div>

                      {/* Progress Bar (countdown only) */}
                      {timer.type === 'countdown' && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isTimerExpired(timer) ? 'bg-destructive/120' : 'bg-primary/100'
                            }`}
                            style={{ width: `${Math.min(100, getTimerProgress(timer))}%` }}
                          />
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTimer(timer.id)}
                          className="gap-1"
                        >
                          {timer.isRunning ? <Pause size={14} /> : <Play size={14} />}
                          {timer.isRunning ? 'Pause' : 'Start'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetTimer(timer.id)}
                          className="gap-1"
                        >
                          <RotateCcw size={14} />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Time Bookmarks */}
      {timeBookmarks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Time Bookmarks</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {timeBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <Card variant="surface">
                    <CardContent className="p-4 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bookmark size={14} className="text-primary" />
                          <div>
                            <div className="font-medium text-sm">{bookmark.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(bookmark.sessionTime)} into session
                            </div>
                            {bookmark.description && (
                              <div className="text-xs mt-1 text-muted-foreground">
                                {bookmark.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="p-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessionTimers.length === 0 && timeBookmarks.length === 0 && (
        <Card variant="surface">
          <CardContent className="p-6 pt-6">
            <div className="text-center py-8">
              <Timer 
                size={48} 
                className="mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Timers or Bookmarks</h3>
              <p className="text-muted-foreground">
                Create timers for combat rounds, torch duration, or other time-sensitive events. 
                Add bookmarks to mark important moments in your session!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



