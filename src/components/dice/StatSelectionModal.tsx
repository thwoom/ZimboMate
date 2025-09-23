/**
 * Stat Selection Modal
 * Helps users choose which stat to use for ambiguous moves
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, BookOpen, Eye, Users, Dumbbell, Target } from 'lucide-react'
import { Button, Badge } from '../ui'
import { type Attributes } from '../../models/Character'
import { getStatOptionsForMove, type StatOption, formatStatExplanation } from '../../utils/moveStatDetection'
import { getAttributeModifier } from '../../models/Character'

interface StatSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (stat: keyof Attributes) => void
  moveId: string
  moveName: string
  characterStats: Record<keyof Attributes, number>
  characterClass?: string
}

const STAT_ICONS: Record<keyof Attributes, React.ComponentType<any>> = {
  STR: Dumbbell,
  DEX: Target,
  CON: Users, // Using shield-like icon
  INT: BookOpen,
  WIS: Eye,
  CHA: Zap
}

const STAT_COLORS: Record<keyof Attributes, string> = {
  STR: 'text-destructive bg-destructive/15',
  DEX: 'text-chart-2 bg-chart-2/15',
  CON: 'text-primary bg-primary/10',
  INT: 'text-accent bg-accent/15',
  WIS: 'text-chart-4 bg-chart-4/15',
  CHA: 'text-accent bg-pink-100'
}

export const StatSelectionModal: React.FC<StatSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  moveId,
  moveName,
  characterStats,
  characterClass
}) => {
  const [selectedStat, setSelectedStat] = useState<keyof Attributes | null>(null)
  const [hoveredStat, setHoveredStat] = useState<keyof Attributes | null>(null)

  const analysis = getStatOptionsForMove(moveId, characterClass)

  useEffect(() => {
    // Auto-select the primary stat or best stat
    if (analysis.primaryStat) {
      setSelectedStat(analysis.primaryStat)
    } else if (analysis.alternatives.length > 0) {
      // Find the best stat based on character values
      const bestOption = analysis.alternatives.reduce((best, current) => {
        const currentValue = characterStats[current.stat]
        const bestValue = characterStats[best.stat]
        return currentValue > bestValue ? current : best
      })
      setSelectedStat(bestOption.stat)
    }
  }, [analysis, characterStats])

  if (!isOpen) return null

  const handleSelect = () => {
    if (selectedStat) {
      onSelect(selectedStat)
    }
  }

  const getStatDisplay = (option: StatOption) => {
    const statValue = characterStats[option.stat]
    const modifier = getAttributeModifier(statValue)
    const Icon = STAT_ICONS[option.stat]

    return (
      <motion.div
        key={option.stat}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          selectedStat === option.stat
            ? 'border-primary/40 bg-primary/10'
            : 'border-border hover:border-border'
        }`}
        onClick={() => setSelectedStat(option.stat)}
        onMouseEnter={() => setHoveredStat(option.stat)}
        onMouseLeave={() => setHoveredStat(null)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${STAT_COLORS[option.stat]}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="font-semibold">{option.stat}</div>
              <div className="text-sm text-muted-foreground">
                {statValue} ({modifier >= 0 ? '+' : ''}{modifier})
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              option.confidence === 'high' ? 'border-chart-2/40 text-chart-2' :
              option.confidence === 'medium' ? 'border-yellow-500 text-chart-4' :
              'border-border text-foreground'
            }`}
          >
            {option.confidence}
          </Badge>
        </div>

        <div className="text-sm text-foreground  mb-2">
          {option.reason}
        </div>

        <div className="text-xs text-muted-foreground">
          Examples: {option.examples.join(', ')}
        </div>

        {(hoveredStat === option.stat || selectedStat === option.stat) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 pt-2 border-t border-border"
          >
            <div className="text-xs text-primary">
              Roll: 2d6{modifier >= 0 ? '+' : ''}{modifier} = 2d6{modifier >= 0 ? '+' : ''}{modifier}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold">Choose Your Approach</h2>
              <p className="text-sm text-muted-foreground  mt-1">
                How do you want to use <strong>{moveName}</strong>?
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground  mb-4">
                This move can be approached in different ways. Choose the stat that best represents how your character acts:
              </div>

              <div className="grid gap-3">
                {analysis.alternatives.map(option => getStatDisplay(option))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {analysis.isAmbiguous ? 'Multiple approaches possible' : 'Standard approach'} •
                Higher stats give better modifiers
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedStat}
                  className="px-6"
                >
                  Roll {selectedStat} {selectedStat && `(${getAttributeModifier(characterStats[selectedStat]) >= 0 ? '+' : ''}${getAttributeModifier(characterStats[selectedStat])})`}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}







