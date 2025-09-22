/**
 * Contextual Roll Panel Component
 * Provides dedicated display space for roll results with rich interaction
 * Appears contextually near the roll source (stats, moves, etc.)
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Copy, Share2, X, Plus, Minus, Zap } from 'lucide-react'
import { useDiceStore, type RollResult } from '../../stores/diceStore'
import { Button } from '../ui/Button'
import { compatibility } from '../../utils/browserCompatibility'

interface ContextualRollPanelProps {
  roll: RollResult | null
  onClose?: () => void
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  anchorElement?: HTMLElement
  className?: string
}

interface RollPanelState {
  isVisible: boolean
  position: { x: number; y: number }
  showDetails: boolean
}

const DiceVisual: React.FC<{ value: number; size?: 'sm' | 'md' | 'lg' }> = ({
  value,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  }

  return (
    <motion.div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-white to-gray-100
        border-2 border-gray-300
        rounded-lg shadow-sm
        flex items-center justify-center
        font-bold text-gray-800
        relative
      `}
      whileHover={{ scale: 1.05, rotate: 2 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {value}
      {/* Dot pattern for authenticity */}
      <div className="absolute inset-1 pointer-events-none opacity-20">
        {Array.from({ length: Math.min(value, 6) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-gray-600 rounded-full"
            style={{
              left: `${20 + (i % 2) * 60}%`,
              top: `${20 + Math.floor(i / 2) * 30}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

const OutcomeIndicator: React.FC<{ outcome: RollResult['outcome'] }> = ({ outcome }) => {
  const config = {
    success: {
      color: 'bg-emerald-500',
      icon: '🎉',
      text: 'Success!',
      description: '10+ • You achieve your goal'
    },
    partial: {
      color: 'bg-amber-500',
      icon: '⚡',
      text: 'Partial Success',
      description: '7-9 • You succeed with complications'
    },
    failure: {
      color: 'bg-red-500',
      icon: '💪',
      text: 'Learn & Mark XP',
      description: '6- • Things go wrong, but you grow'
    }
  }

  const { color, icon, text, description } = config[outcome]

  return (
    <motion.div
      className={`
        ${color} text-white px-3 py-1 rounded-full
        text-sm font-semibold shadow-sm
        flex items-center gap-2
      `}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </motion.div>
  )
}

const ModifierBadge: React.FC<{ value: number; source: string }> = ({ value, source }) => {
  if (value === 0) return null

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded text-xs
      ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
    `}>
      {value > 0 ? <Plus size={10} /> : <Minus size={10} />}
      <span>{Math.abs(value)}</span>
      <span className="opacity-75">{source}</span>
    </div>
  )
}

const RollBreakdown: React.FC<{ roll: RollResult }> = ({ roll }) => {
  return (
    <div className="space-y-2 text-sm text-gray-600">
      {/* Dice breakdown */}
      <div className="flex items-center gap-2">
        <span>Roll:</span>
        <div className="flex gap-1">
          <DiceVisual value={roll.dice1} size="sm" />
          <span className="text-gray-400">+</span>
          <DiceVisual value={roll.dice2} size="sm" />
        </div>
        <span>= {roll.dice1 + roll.dice2}</span>
      </div>

      {/* Modifiers */}
      {roll.modifiers && roll.modifiers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {roll.modifiers.map((mod, i) => (
            <ModifierBadge key={i} value={mod.value} source={mod.source} />
          ))}
        </div>
      )}

      {/* Final calculation */}
      <div className="flex items-center gap-2 font-semibold">
        <span>Total:</span>
        <span className="text-lg">{roll.total}</span>
      </div>
    </div>
  )
}

export const ContextualRollPanel: React.FC<ContextualRollPanelProps> = ({
  roll,
  onClose,
  position = 'center',
  anchorElement,
  className = ''
}) => {
  const { rerollLast, addToHistory, getActiveCharacterId } = useDiceStore()
  const [panelState, setPanelState] = React.useState<RollPanelState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    showDetails: false
  })

  // Calculate position based on anchor element
  React.useEffect(() => {
    if (!roll || !anchorElement) return

    const rect = anchorElement.getBoundingClientRect()
    const positions = {
      top: { x: rect.left + rect.width / 2, y: rect.top - 10 },
      bottom: { x: rect.left + rect.width / 2, y: rect.bottom + 10 },
      left: { x: rect.left - 10, y: rect.top + rect.height / 2 },
      right: { x: rect.right + 10, y: rect.top + rect.height / 2 },
      center: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }

    setPanelState(prev => ({
      ...prev,
      isVisible: true,
      position: positions[position]
    }))
  }, [roll, anchorElement, position])

  const handleReroll = () => {
    if (!roll) return

    // Create a new roll with the same parameters
    rerollLast()
    onClose?.()
  }

  const handleCopy = async () => {
    if (!roll) return

    const rollText = `${roll.description}: ${roll.total} (${roll.dice1} + ${roll.dice2}${roll.modifiers?.map(m => ` ${m.value > 0 ? '+' : ''}${m.value}`).join('') || ''}) - ${roll.outcome}`

    const success = await compatibility.copyToClipboard(rollText)
    if (success) {
      // Could trigger a small success indication here
      console.log('Roll copied to clipboard')
    }
  }

  const handleShare = () => {
    if (!roll) return

    const rollText = `🎲 ${roll.description}: ${roll.total} - ${roll.outcome}`

    if (compatibility.hasFeature('webShare')) {
      navigator.share?.({
        title: 'Dice Roll Result',
        text: rollText
      }).catch(console.warn)
    } else {
      // Fallback to copy
      handleCopy()
    }
  }

  if (!roll) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`
          fixed z-[100] pointer-events-none
          ${className}
        `}
        style={{
          left: panelState.position.x,
          top: panelState.position.y,
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-xl
          p-4 max-w-sm
          pointer-events-auto
        ">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {roll.description}
              </h3>
              {roll.characterId && (
                <p className="text-xs text-gray-500 mt-1">
                  Character Roll
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 -mt-1 -mr-1"
            >
              <X size={14} />
            </Button>
          </div>

          {/* Main result display */}
          <div className="text-center mb-4">
            {/* Total result */}
            <motion.div
              className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
            >
              {roll.total}
            </motion.div>

            {/* Outcome indicator */}
            <OutcomeIndicator outcome={roll.outcome} />
          </div>

          {/* Dice visualization */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <DiceVisual value={roll.dice1} />
            <span className="text-gray-400 font-bold">+</span>
            <DiceVisual value={roll.dice2} />

            {roll.modifiers && roll.modifiers.length > 0 && (
              <>
                {roll.modifiers.map((mod, i) => (
                  <React.Fragment key={i}>
                    <span className={`text-sm font-bold ${mod.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {mod.value >= 0 ? '+' : ''}{mod.value}
                    </span>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          {/* Detailed breakdown (collapsible) */}
          {panelState.showDetails && (
            <motion.div
              className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <RollBreakdown roll={roll} />
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-between">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReroll}
                className="p-2"
                title="Reroll with same parameters"
              >
                <RotateCcw size={14} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-2"
                title="Copy result to clipboard"
              >
                <Copy size={14} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2"
                title="Share result"
              >
                <Share2 size={14} />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanelState(prev => ({ ...prev, showDetails: !prev.showDetails }))}
              className="p-2 text-xs"
              title="Toggle details"
            >
              <Zap size={14} />
            </Button>
          </div>

          {/* Effects indicators */}
          {(roll.effects?.xpAwarded || roll.effects?.holdGranted) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-1">
                {roll.effects.xpAwarded && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    +1 XP Awarded
                  </div>
                )}
                {roll.effects.holdGranted && (
                  <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    +{roll.effects.holdGranted} Hold
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing contextual roll panels
export const useContextualRollPanel = () => {
  const [activePanel, setActivePanel] = React.useState<{
    roll: RollResult
    anchorElement: HTMLElement
    position: ContextualRollPanelProps['position']
  } | null>(null)

  const showPanel = React.useCallback((
    roll: RollResult,
    anchorElement: HTMLElement,
    position: ContextualRollPanelProps['position'] = 'bottom'
  ) => {
    setActivePanel({ roll, anchorElement, position })
  }, [])

  const hidePanel = React.useCallback(() => {
    setActivePanel(null)
  }, [])

  // Auto-hide after delay
  React.useEffect(() => {
    if (!activePanel) return

    const timer = setTimeout(() => {
      hidePanel()
    }, 8000) // Auto-hide after 8 seconds

    return () => clearTimeout(timer)
  }, [activePanel, hidePanel])

  return {
    activePanel,
    showPanel,
    hidePanel,
    PanelComponent: activePanel ? (
      <ContextualRollPanel
        roll={activePanel.roll}
        anchorElement={activePanel.anchorElement}
        position={activePanel.position}
        onClose={hidePanel}
      />
    ) : null
  }
}