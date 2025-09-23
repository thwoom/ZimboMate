/**
 * Chronicle Overlay System
 *
 * A floating overlay system that displays contextual Chronicle prompts
 * based on user actions throughout the app. Features elegant animations,
 * smart positioning, and integration with the action listener system.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Feather,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { chronicleActionListener, type ChroniclePrompt } from '../../services/ChronicleActionListenerService'
import { contextIntelligence } from '../../services/ChronicleContextIntelligence'
import { useChronicleStore } from '../../stores/chronicleStore'

interface ChronicleOverlayProps {
  isEnabled?: boolean
  maxPrompts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

// Individual prompt card component
const ChroniclePromptCard: React.FC<{
  prompt: ChroniclePrompt
  index: number
  onAccept: (promptId: string, selectedEntry: string, customText?: string) => void
  onDismiss: (promptId: string) => void
}> = ({ prompt, index, onAccept, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [customText, setCustomText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Auto-expand high priority prompts
  useEffect(() => {
    if (prompt.priority === 'high') {
      setIsExpanded(true)
    }
  }, [prompt.priority])

  // Auto-dismiss after expiration
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt.expiresAt < new Date()) {
        onDismiss(prompt.id)
      }
    }, prompt.expiresAt.getTime() - Date.now())

    return () => clearTimeout(timer)
  }, [prompt.expiresAt, prompt.id, onDismiss])

  const handleAccept = (entry?: string) => {
    const finalText = customText.trim() || entry || ''
    if (finalText) {
      onAccept(prompt.id, finalText, customText.trim() ? customText : undefined)
    }
  }

  const handleQuickInsert = (suggestion: string) => {
    setCustomText(prev => {
      if (!prev.trim()) return suggestion
      return prev + (prev.endsWith('.') || prev.endsWith('!') || prev.endsWith('?') ? ' ' : '. ') + suggestion
    })
  }

  const getPriorityIcon = () => {
    switch (prompt.priority) {
      case 'high': return <Zap size={16} className="text-chart-4" />
      case 'medium': return <Target size={16} className="text-primary" />
      case 'low': return <Clock size={16} className="text-muted-foreground" />
    }
  }

  const getPriorityColor = () => {
    switch (prompt.priority) {
      case 'high': return 'from-orange-400 to-red-500'
      case 'medium': return 'from-primary to-indigo-500'
      case 'low': return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.1
      }}
      className={`
        bg-card
        border border-border
        rounded-lg shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-[400px]
        ${prompt.priority === 'high' ? 'ring-2 ring-chart-4/30 ' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {getPriorityIcon()}
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPriorityColor()}`} />
          <span className="text-sm font-medium text-foreground ">
            Chronicle This?
          </span>
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted hover:bg-muted rounded"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDismiss(prompt.id)}
            className="p-1 hover:bg-muted hover:bg-muted rounded text-muted-foreground"
          >
            <X size={14} />
          </motion.button>
        </div>
      </div>

      {/* Prompt Text */}
      <div className="p-3">
        <p className="text-sm text-foreground  leading-relaxed">
          {prompt.promptText}
        </p>
      </div>

      {/* Primary Text Input Area (always visible when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Main Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground ">
                  What happened?
                </label>
                <div className="relative">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Describe what happened in this moment..."
                    autoFocus
                    className="
                      w-full h-24 p-3 text-sm
                      border-2 border-primary/30
                      rounded-lg resize-none
                      bg-card
                      focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                      placeholder-muted-foreground placeholder-muted-foreground
                    "
                  />
                  {customText.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs text-muted-foreground">
                        {customText.length} chars
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Suggestions - Compact Pills */}
              {prompt.suggestedEntries && prompt.suggestedEntries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground ">
                      Quick additions
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="text-xs text-primary hover:text-primary"
                    >
                      {showSuggestions ? 'Hide' : 'Show'} ({prompt.suggestedEntries.length})
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        {prompt.suggestedEntries.slice(0, 4).map((entry, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickInsert(entry)}
                            className="
                              px-2 py-1 text-xs
                              bg-primary/10 hover:bg-primary/10
                              border border-primary/30
                              rounded-full transition-colors
                              text-primary
                              max-w-32 truncate
                            "
                            title={entry}
                          >
                            + {entry}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAccept()}
                  disabled={!customText.trim()}
                  className="
                    flex-1 px-4 py-2 text-sm font-medium
                    bg-primary hover:bg-primary/80
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    text-white rounded-lg transition-colors
                    flex items-center justify-center gap-2
                  "
                >
                  <BookOpen size={14} />
                  Chronicle It
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDismiss(prompt.id)}
                  className="
                    px-3 py-2 text-sm font-medium
                    bg-muted hover:bg-muted text-foreground 
                    rounded-lg transition-colors
                  "
                >
                  Skip
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions (when collapsed) */}
      {!isExpanded && (
        <div className="flex gap-2 p-3 pt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            className="
              flex-1 px-3 py-2 text-xs font-medium
              bg-primary hover:bg-primary/80 text-white
              rounded transition-colors
              flex items-center justify-center gap-1
            "
          >
            <Feather size={12} />
            Write Entry
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDismiss(prompt.id)}
            className="
              px-3 py-2 text-xs font-medium
              bg-muted hover:bg-muted text-foreground
               hover:bg-muted 
              rounded transition-colors
            "
          >
            Skip
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// Main Chronicle Overlay component
export const ChronicleOverlay: React.FC<ChronicleOverlayProps> = ({
  isEnabled = true,
  maxPrompts = 2,
  position = 'top-right',
  className = ''
}) => {
  const [activePrompts, setActivePrompts] = useState<ChroniclePrompt[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Subscribe to action listener for new prompts
  useEffect(() => {
    if (!isEnabled) return

    const updatePrompts = () => {
      const prompts = chronicleActionListener.getActivePrompts()
      setActivePrompts(prompts.slice(0, maxPrompts))
      setIsVisible(prompts.length > 0)
    }

    // Initial load
    updatePrompts()

    // Set up polling for prompt updates (in a real implementation, this would be event-driven)
    const interval = setInterval(updatePrompts, 1000)
    return () => clearInterval(interval)
  }, [isEnabled, maxPrompts])

  const handleAcceptPrompt = useCallback((promptId: string, selectedEntry: string, customText?: string) => {
    chronicleActionListener.acceptPrompt(promptId, selectedEntry, customText)

    // Remove from local state
    setActivePrompts(prev => prev.filter(p => p.id !== promptId))

    // Record user behavior for learning
    contextIntelligence.recordUserBehavior(
      activePrompts.find(p => p.id === promptId)?.actionContext.actionType || 'dice_roll',
      true,
      Date.now(), // Would calculate actual response time
      customText || selectedEntry
    )
  }, [activePrompts])

  const handleDismissPrompt = useCallback((promptId: string) => {
    chronicleActionListener.dismissPrompt(promptId)

    // Remove from local state
    setActivePrompts(prev => prev.filter(p => p.id !== promptId))

    // Record dismissal for learning
    contextIntelligence.recordUserBehavior(
      activePrompts.find(p => p.id === promptId)?.actionContext.actionType || 'dice_roll',
      false,
      Date.now(),
      ''
    )
  }, [activePrompts])

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4'
      case 'top-right': return 'top-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      default: return 'top-4 right-4'
    }
  }

  if (!isEnabled || !isVisible || activePrompts.length === 0) {
    return null
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none ${className}`}>
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {activePrompts.map((prompt, index) => (
            <ChroniclePromptCard
              key={prompt.id}
              prompt={prompt}
              index={index}
              onAccept={handleAcceptPrompt}
              onDismiss={handleDismissPrompt}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Hook for easy integration
export const useChronicleOverlay = () => {
  const [isEnabled, setIsEnabled] = useState(true)

  const enableOverlay = () => setIsEnabled(true)
  const disableOverlay = () => setIsEnabled(false)
  const toggleOverlay = () => setIsEnabled(prev => !prev)

  return {
    isEnabled,
    enableOverlay,
    disableOverlay,
    toggleOverlay
  }
}





