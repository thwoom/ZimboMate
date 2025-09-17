import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice6, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from './Card'
import { Badge } from './Badge'

export interface RollResult {
  id: string
  type: 'basic' | 'attribute' | 'damage' | 'move'
  title: string
  dice: number[]
  modifier: number
  total: number
  outcome?: 'success' | 'partial' | 'failure'
  description?: string
  timestamp: Date
}

interface RollResultsToastProps {
  result: RollResult | null
  onClose: () => void
  duration?: number
}

export const RollResultsToast: React.FC<RollResultsToastProps> = ({
  result,
  onClose,
  duration = 4000
}) => {
  React.useEffect(() => {
    if (result) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [result, onClose, duration])

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'success': return 'var(--nature-500)'
      case 'partial': return 'var(--yellow-500)'
      case 'failure': return 'var(--red-500)'
      default: return 'var(--color-primary)'
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
      case 'failure': return 'Miss'
      default: return 'Roll Complete'
    }
  }

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <Card variant="magical" className="glass-surface border-2" style={{ borderColor: getOutcomeColor(result.outcome) }}>
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
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
                          borderColor: 'var(--color-primary)',
                          backgroundColor: 'var(--color-surface-elevated)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        {die}
                      </motion.div>
                    ))}
                  </div>
                  
                  {result.modifier !== 0 && (
                    <>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {result.modifier > 0 ? '+' : ''}{result.modifier}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>=</span>
                    </>
                  )}
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
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
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {result.description}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}