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
    success: 'border-chart-2/30 bg-chart-2/12',
    partial: 'border-chart-4/30 bg-chart-4/12',
    failure: 'border-destructive/30 bg-destructive/12'
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
            <span className="text-sm text-muted-foreground ">
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
            className="border-t border-border pt-2"
          >
            {/* Timestamp */}
            <div className="text-xs text-muted-foreground mb-2">
              {new Date(roll.timestamp).toLocaleString()}
            </div>

            {/* Effects */}
            {(roll.effects?.xpAwarded || roll.effects?.holdGranted) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {roll.effects.xpAwarded && (
                  <div className="bg-chart-4/15 text-chart-4 text-xs px-2 py-1 rounded-full">
                    +1 XP
                  </div>
                )}
                {roll.effects.holdGranted && (
                  <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    +{roll.effects.holdGranted} Hold
                  </div>
                )}
              </div>
            )}

            {/* Modifiers breakdown */}
            {roll.modifiers && roll.modifiers.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-foreground ">Modifiers:</div>
                {roll.modifiers.map((modifier, i) => (
                  <div key={i} className="text-xs text-muted-foreground  ml-2">
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
            <div className="bg-primary/100 w-3 h-3 rounded-full" />
            <h3 className="font-semibold text-foreground ">
              {date === new Date().toDateString() ? 'Today' : date}
            </h3>
            <div className="flex-1 h-px bg-muted " />
            <span className="text-sm text-muted-foreground">{dateRolls.length} rolls</span>
          </div>

          {/* Rolls for this date */}
          <div className="ml-6 space-y-2">
            {dateRolls.map((roll) => (
              <div key={roll.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 hover:bg-muted">
                <div className="text-xs text-muted-foreground w-16">
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
                  ${roll.outcome === 'success' ? 'bg-chart-2/12 text-chart-2' : ''}
                  ${roll.outcome === 'partial' ? 'bg-chart-4/12 text-chart-4' : ''}
                  ${roll.outcome === 'failure' ? 'bg-destructive/15 text-destructive' : ''}
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
      <div className="text-center text-muted-foreground py-8">
        No rolls to compare yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-primary">Total Rolls</div>
        </div>

        <div className="bg-chart-2/12 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-chart-2">{stats.successRate}%</div>
          <div className="text-sm text-chart-2">Success Rate</div>
        </div>

        <div className="bg-accent/12 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-accent">{stats.averageRoll}</div>
          <div className="text-sm text-accent">Average Roll</div>
        </div>

        <div className="bg-chart-4/12 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-chart-4">{stats.highestRoll}</div>
          <div className="text-sm text-chart-4">Highest Roll</div>
        </div>
      </div>

      {/* Outcome breakdown */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 size={16} />
          Outcome Distribution
        </h4>

        <div className="space-y-2">
          {(['success', 'partial', 'failure'] as const).map(outcome => {
            const count = stats.outcomes[outcome] || 0
            const percentage = (count / stats.total * 100).toFixed(1)

            const colors = {
              success: 'bg-chart-2/120',
              partial: 'bg-chart-4/120',
              failure: 'bg-destructive/120'
            }

            return (
              <div key={outcome} className="flex items-center gap-3">
                <div className="w-20 text-sm capitalize">{outcome}</div>
                <div className="flex-1 bg-muted  rounded-full h-2">
                  <div
                    className={`${colors[outcome]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-12">{count}</div>
                <div className="text-sm text-muted-foreground w-12">{percentage}%</div>
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
          <ModeIcon size={20} className="text-muted-foreground" />
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
              <div className="text-center text-muted-foreground py-8">
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








