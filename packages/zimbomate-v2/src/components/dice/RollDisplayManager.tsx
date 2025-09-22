/**
 * Roll Display Manager Component
 * Manages dedicated display spaces for roll results across the application
 * Provides different display modes: contextual panels, persistent results, roll comparisons
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Grid, Clock, Maximize2, Minimize2 } from 'lucide-react'
import { useDiceStore, type RollResult } from '../../stores/diceStore'
import { useCharacterStore } from '../../stores/characterStore'
import { ContextualRollPanel, useContextualRollPanel } from './ContextualRollPanel'
import { Button } from '../ui/Button'

interface RollDisplayManagerProps {
  displayMode?: 'contextual' | 'persistent' | 'comparison' | 'timeline'
  maxVisibleRolls?: number
  className?: string
}

interface PersistentRollCardProps {
  roll: RollResult
  onExpand?: () => void
  onRemove?: () => void
  isExpanded?: boolean
}

const PersistentRollCard: React.FC<PersistentRollCardProps> = ({
  roll,
  onExpand,
  onRemove,
  isExpanded = false
}) => {
  const outcomeColors = {
    success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
    partial: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    failure: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
  }

  const outcomeIcons = {
    success: '🎉',
    partial: '⚡',
    failure: '💪'
  }

  return (
    <motion.div
      className={`
        ${outcomeColors[roll.outcome]}
        border rounded-lg p-3 shadow-sm
        hover:shadow-md transition-all duration-200
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{outcomeIcons[roll.outcome]}</span>
            <h4 className="font-semibold text-sm truncate">{roll.description}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{roll.total}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({roll.dice1} + {roll.dice2}
              {roll.modifiers?.map(m => ` ${m.value >= 0 ? '+' : ''}${m.value}`).join('') || ''})
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="p-1"
            title={isExpanded ? "Minimize" : "Expand details"}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-2"
          >
            {/* Timestamp */}
            <div className="text-xs text-gray-500 mb-2">
              {new Date(roll.timestamp).toLocaleString()}
            </div>

            {/* Effects */}
            {(roll.effects?.xpAwarded || roll.effects?.holdGranted) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {roll.effects.xpAwarded && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    +1 XP
                  </div>
                )}
                {roll.effects.holdGranted && (
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    +{roll.effects.holdGranted} Hold
                  </div>
                )}
              </div>
            )}

            {/* Modifiers breakdown */}
            {roll.modifiers && roll.modifiers.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Modifiers:</div>
                {roll.modifiers.map((modifier, i) => (
                  <div key={i} className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                    {modifier.value >= 0 ? '+' : ''}{modifier.value} from {modifier.source}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TimelineView: React.FC<{ rolls: RollResult[] }> = ({ rolls }) => {
  const groupedRolls = React.useMemo(() => {
    const groups: Record<string, RollResult[]> = {}

    rolls.forEach(roll => {
      const date = new Date(roll.timestamp).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(roll)
    })

    return Object.entries(groups).sort(([a], [b]) =>
      new Date(b).getTime() - new Date(a).getTime()
    )
  }, [rolls])

  return (
    <div className="space-y-4">
      {groupedRolls.map(([date, dateRolls]) => (
        <div key={date} className="relative">
          {/* Date header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {date === new Date().toDateString() ? 'Today' : date}
            </h3>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-500">{dateRolls.length} rolls</span>
          </div>

          {/* Rolls for this date */}
          <div className="ml-6 space-y-2">
            {dateRolls.map((roll) => (
              <div key={roll.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="text-xs text-gray-500 w-16">
                  {new Date(roll.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex-1">
                  <span className="font-medium">{roll.description}</span>
                  <span className="ml-2 font-bold">{roll.total}</span>
                </div>
                <div className={`
                  px-2 py-1 rounded-full text-xs
                  ${roll.outcome === 'success' ? 'bg-emerald-100 text-emerald-700' : ''}
                  ${roll.outcome === 'partial' ? 'bg-amber-100 text-amber-700' : ''}
                  ${roll.outcome === 'failure' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {roll.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ComparisonView: React.FC<{ rolls: RollResult[] }> = ({ rolls }) => {
  const stats = React.useMemo(() => {
    if (rolls.length === 0) return null

    const outcomes = rolls.reduce((acc, roll) => {
      acc[roll.outcome] = (acc[roll.outcome] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageRoll = rolls.reduce((sum, roll) => sum + roll.total, 0) / rolls.length
    const highestRoll = Math.max(...rolls.map(r => r.total))
    const lowestRoll = Math.min(...rolls.map(r => r.total))

    return {
      total: rolls.length,
      outcomes,
      averageRoll: averageRoll.toFixed(1),
      highestRoll,
      lowestRoll,
      successRate: ((outcomes.success || 0) / rolls.length * 100).toFixed(1)
    }
  }, [rolls])

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        No rolls to compare yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-600">Total Rolls</div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.successRate}%</div>
          <div className="text-sm text-emerald-600">Success Rate</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.averageRoll}</div>
          <div className="text-sm text-purple-600">Average Roll</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.highestRoll}</div>
          <div className="text-sm text-orange-600">Highest Roll</div>
        </div>
      </div>

      {/* Outcome breakdown */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Outcome Distribution
        </h4>

        <div className="space-y-2">
          {(['success', 'partial', 'failure'] as const).map(outcome => {
            const count = stats.outcomes[outcome] || 0
            const percentage = (count / stats.total * 100).toFixed(1)

            const colors = {
              success: 'bg-emerald-500',
              partial: 'bg-amber-500',
              failure: 'bg-red-500'
            }

            return (
              <div key={outcome} className="flex items-center gap-3">
                <div className="w-20 text-sm capitalize">{outcome}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${colors[outcome]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-12">{count}</div>
                <div className="text-sm text-gray-500 w-12">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const RollDisplayManager: React.FC<RollDisplayManagerProps> = ({
  displayMode = 'persistent',
  maxVisibleRolls = 10,
  className = ''
}) => {
  const { getAllRolls } = useDiceStore()
  const { activeCharacterId } = useCharacterStore()
  const { PanelComponent } = useContextualRollPanel()

  const [currentMode, setCurrentMode] = React.useState(displayMode)
  const [expandedRolls, setExpandedRolls] = React.useState<Set<string>>(new Set())

  const characterId = activeCharacterId
  const allRolls = getAllRolls()
  const recentRolls = allRolls.slice(0, maxVisibleRolls)

  const toggleExpanded = (rollId: string) => {
    setExpandedRolls(prev => {
      const next = new Set(prev)
      if (next.has(rollId)) {
        next.delete(rollId)
      } else {
        next.add(rollId)
      }
      return next
    })
  }

  const modeIcons = {
    contextual: Grid,
    persistent: Maximize2,
    comparison: BarChart3,
    timeline: Clock
  }

  const ModeIcon = modeIcons[currentMode]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ModeIcon size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold">Roll Display</h2>
        </div>

        <div className="flex gap-1">
          {(['persistent', 'timeline', 'comparison'] as const).map(mode => (
            <Button
              key={mode}
              variant={currentMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentMode(mode)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* Display content based on mode */}
      <div className="min-h-[200px]">
        {currentMode === 'persistent' && (
          <div className="grid gap-3">
            <AnimatePresence>
              {recentRolls.map(roll => (
                <PersistentRollCard
                  key={roll.id}
                  roll={roll}
                  isExpanded={expandedRolls.has(roll.id)}
                  onExpand={() => toggleExpanded(roll.id)}
                />
              ))}
            </AnimatePresence>

            {recentRolls.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No recent rolls to display
              </div>
            )}
          </div>
        )}

        {currentMode === 'timeline' && (
          <TimelineView rolls={allRolls} />
        )}

        {currentMode === 'comparison' && (
          <ComparisonView rolls={allRolls} />
        )}
      </div>

      {/* Contextual panels overlay */}
      {PanelComponent}
    </div>
  )
}