import type { EnhancedRollResult } from '../../hooks/useEnhancedRollResults'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Dice6, Heart, Minus, Shield, Star, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card, CardContent } from './Card'

interface EnhancedRollResultsToastProps {
  result: EnhancedRollResult | null
  onClose: () => void
  onApplyConsequences: (rollId: string, selectedConsequences: string[]) => void
  duration?: number
}

export const EnhancedRollResultsToast: React.FC<EnhancedRollResultsToastProps> = ({
  result,
  onClose,
  onApplyConsequences,
  duration = 6000,
}) => {
  const [showConsequences, setShowConsequences] = useState(false)
  const [selectedConsequences, setSelectedConsequences] = useState<string[]>([])

  React.useEffect(() => {
    if (result && result.consequences.length === 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [result, onClose, duration])

  React.useEffect(() => {
    if (result && result.consequences.length > 0) {
      // Auto-select automatic consequences
      const autoConsequences = result.consequences
        .filter(c => c.automatic && !c.applied)
        .map(c => c.id)
      setSelectedConsequences(autoConsequences)

      // Show consequences panel if there are manual consequences
      const hasManualConsequences = result.consequences.some(c => !c.automatic && !c.applied)
      if (hasManualConsequences) {
        setShowConsequences(true)
      }
    }
  }, [result])

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'success': return 'var(--nature-500)'
      case 'partial': return 'var(--yellow-500)'
      case 'failure': return 'var(--red-500)'
      default: return 'var(--primary)'
    }
  }

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case 'success': return <TrendingUp size={16} />
      case 'partial': return <Minus size={16} />
      case 'failure': return <TrendingDown size={16} />
      default: return <Dice6 size={16} />
    }
  }

  const getOutcomeLabel = (outcome?: string) => {
    switch (outcome) {
      case 'success': return 'Success!'
      case 'partial': return 'Partial Success'
      case 'failure': return 'Miss - Mark XP'
      default: return 'Roll Complete'
    }
  }

  const getConsequenceIcon = (type: string) => {
    switch (type) {
      case 'xp_gain': return <Star size={14} />
      case 'hp_change': return <Heart size={14} />
      case 'condition': return <AlertTriangle size={14} />
      case 'modifier': return <Zap size={14} />
      case 'resource_change': return <Shield size={14} />
      default: return <Dice6 size={14} />
    }
  }

  const getConsequenceColor = (type: string) => {
    switch (type) {
      case 'xp_gain': return 'var(--yellow-500)'
      case 'hp_change': return 'var(--red-500)'
      case 'condition': return 'var(--orange-500)'
      case 'modifier': return 'var(--blue-500)'
      case 'resource_change': return 'var(--green-500)'
      default: return 'var(--muted-foreground)'
    }
  }

  const handleConsequenceToggle = (consequenceId: string) => {
    setSelectedConsequences(prev =>
      prev.includes(consequenceId)
        ? prev.filter(id => id !== consequenceId)
        : [...prev, consequenceId],
    )
  }

  const handleApplyConsequences = () => {
    if (result) {
      onApplyConsequences(result.id, selectedConsequences)
      setShowConsequences(false)

      // Close toast after applying consequences
      setTimeout(onClose, 1500)
    }
  }

  const pendingConsequences = result?.consequences.filter(c => !c.applied) || []
  const manualConsequences = pendingConsequences.filter(c => !c.automatic)

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <Card
            variant="magical"
            className="border-2 border-primary/30 bg-card/95 backdrop-blur shadow-lg"
            style={{ borderColor: getOutcomeColor(result.outcome) }}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getOutcomeColor(result.outcome), opacity: 0.2 }}
                    >
                      <div style={{ color: getOutcomeColor(result.outcome) }}>
                        {getOutcomeIcon(result.outcome)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{result.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>

                {/* Dice Display */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {result.dice.map((die, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm"
                        style={{
                          borderColor: 'var(--primary)',
                          backgroundColor: 'var(--popover)',
                          color: 'var(--foreground)',
                        }}
                      >
                        {die}
                      </motion.div>
                    ))}
                  </div>

                  {result.modifier !== 0 && (
                    <>
                      <span className="text-muted-foreground">
                        {result.modifier > 0 ? '+' : ''}
                        {result.modifier}
                      </span>
                      <span className="text-muted-foreground">=</span>
                    </>
                  )}

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                    className="text-2xl font-bold"
                    style={{ color: getOutcomeColor(result.outcome) }}
                  >
                    {result.total}
                  </motion.div>
                </div>

                {/* Outcome Badge */}
                {result.outcome && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Badge
                      variant={result.outcome === 'success' ? 'default' : result.outcome === 'partial' ? 'secondary' : 'outline'}
                      className="gap-1"
                    >
                      {getOutcomeIcon(result.outcome)}
                      {getOutcomeLabel(result.outcome)}
                    </Badge>
                  </motion.div>
                )}

                {/* Description */}
                {result.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-muted-foreground"
                  >
                    {result.description}
                  </motion.p>
                )}

                {/* Automatic Consequences */}
                {pendingConsequences.filter(c => c.automatic).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <h5 className="text-xs font-semibold text-foreground">
                      Automatic Effects:
                    </h5>
                    {pendingConsequences.filter(c => c.automatic).map(consequence => (
                      <div key={consequence.id} className="flex items-center gap-2 text-xs">
                        <div style={{ color: getConsequenceColor(consequence.type) }}>
                          {getConsequenceIcon(consequence.type)}
                        </div>
                        <span className="text-muted-foreground">
                          {consequence.description}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Manual Consequences */}
                {manualConsequences.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-foreground">
                        Choose Effects:
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConsequences(!showConsequences)}
                        className="text-xs"
                      >
                        {showConsequences ? 'Hide' : 'Show'}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {showConsequences && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {manualConsequences.map(consequence => (
                            <div key={consequence.id} className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                id={consequence.id}
                                checked={selectedConsequences.includes(consequence.id)}
                                onChange={() => handleConsequenceToggle(consequence.id)}
                                className="mt-0.5"
                              />
                              <label htmlFor={consequence.id} className="flex items-start gap-2 text-xs cursor-pointer">
                                <div style={{ color: getConsequenceColor(consequence.type) }}>
                                  {getConsequenceIcon(consequence.type)}
                                </div>
                                <span className="text-muted-foreground">
                                  {consequence.description}
                                </span>
                              </label>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleApplyConsequences}
                              className="text-xs"
                            >
                              Apply Selected
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowConsequences(false)
                                setTimeout(onClose, 500)
                              }}
                              className="text-xs"
                            >
                              Skip
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
