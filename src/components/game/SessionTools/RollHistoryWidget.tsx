/**
 * Roll History Widget - Complete roll and event log
 * Phase 4A: Essential for tracking dice rolls and outcomes
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Dice6,
  Filter,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'
import { useSessionStore } from '../../../stores'
import { Badge, Button, Card, CardContent } from '../../ui'

export interface DiceRoll {
  id: string
  dice: number[]
  modifier: number
  total: number
  result: 'failure' | 'partial' | 'success'
  move?: string
  character?: string
  timestamp: Date
  context?: string
}

interface RollHistoryWidgetProps {
  searchQuery?: string
  className?: string
}

export const RollHistoryWidget: React.FC<RollHistoryWidgetProps> = ({
  searchQuery = '',
  className = '',
}) => {
  const { rollHistory, clearRollHistory } = useSessionStore()
  const [filterResult, setFilterResult] = useState<string>('all')
  const [showStats, setShowStats] = useState(false)

  // Filter rolls based on search query and result
  const filteredRolls = rollHistory.filter((roll) => {
    const matchesSearch = !searchQuery
      || roll.move?.toLowerCase().includes(searchQuery.toLowerCase())
      || roll.character?.toLowerCase().includes(searchQuery.toLowerCase())
      || roll.context?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesResult = filterResult === 'all' || roll.result === filterResult

    return matchesSearch && matchesResult
  })

  // Sort rolls by timestamp (newest first)
  const sortedRolls = [...filteredRolls].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  // Calculate statistics
  const stats = {
    total: rollHistory.length,
    successes: rollHistory.filter(r => r.result === 'success').length,
    partials: rollHistory.filter(r => r.result === 'partial').length,
    failures: rollHistory.filter(r => r.result === 'failure').length,
    averageRoll: rollHistory.length > 0
      ? rollHistory.reduce((sum, r) => sum + r.total, 0) / rollHistory.length
      : 0,
    successRate: rollHistory.length > 0
      ? (rollHistory.filter(r => r.result === 'success').length / rollHistory.length) * 100
      : 0,
  }

  const getResultColor = (result: DiceRoll['result']) => {
    switch (result) {
      case 'success':
        return 'bg-chart-2/15 text-chart-2 border-chart-2/30'
      case 'partial':
        return 'bg-chart-4/15 text-chart-4 border-chart-4/30'
      case 'failure':
        return 'bg-destructive/15 text-destructive border-destructive/30'
    }
  }

  const getResultIcon = (result: DiceRoll['result']) => {
    switch (result) {
      case 'success':
        return <CheckCircle size={14} className="text-chart-2" />
      case 'partial':
        return <AlertTriangle size={14} className="text-chart-4" />
      case 'failure':
        return <Zap size={14} className="text-destructive" />
    }
  }

  const getResultLabel = (result: DiceRoll['result'], total: number) => {
    switch (result) {
      case 'success':
        return `Success (${total}+)`
      case 'partial':
        return `Partial Success (${total})`
      case 'failure':
        return `Failure (${total}-)`
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1)
      return 'Just now'
    if (diffMins < 60)
      return `${diffMins}m ago`
    if (diffHours < 24)
      return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const formatDiceRoll = (roll: DiceRoll) => {
    const diceStr = roll.dice.join(' + ')
    const modStr = roll.modifier !== 0 ? ` ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}` : ''
    return `2d6: [${diceStr}]${modStr} = ${roll.total}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dice6 size={20} />
          <span className="font-medium">Roll History</span>
          <Badge variant="secondary">{rollHistory.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="gap-1"
          >
            <BarChart3 size={14} />
            Stats
          </Button>

          {/* Result Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} />
            <select
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
              className="text-sm px-2 py-1 rounded border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="all">All Results</option>
              <option value="success">Successes</option>
              <option value="partial">Partials</option>
              <option value="failure">Failures</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="magical">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-chart-2">{stats.successes}</div>
                    <div className="text-sm text-muted-foreground">
                      Successes (10+)
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-chart-4">{stats.partials}</div>
                    <div className="text-sm text-muted-foreground">
                      Partials (7-9)
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{stats.failures}</div>
                    <div className="text-sm text-muted-foreground">
                      Failures (6-)
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.averageRoll.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">
                      Average Roll
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.successRate.toFixed(0)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Success Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Rolls
                    </div>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearRollHistory}
                        className="text-destructive hover:text-destructive"
                      >
                        Clear History
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rolls List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedRolls.map((roll, index) => (
            <motion.div
              key={roll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <Card variant="surface">
                <CardContent className="p-4 pt-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getResultIcon(roll.result)}
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getResultColor(roll.result)}`}
                        >
                          {getResultLabel(roll.result, roll.total)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatTimestamp(roll.timestamp)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">{roll.total}</div>
                        <div className="text-xs text-muted-foreground">
                          Total
                        </div>
                      </div>
                    </div>

                    {/* Roll Details */}
                    <div className="text-sm">
                      <div className="font-mono text-muted-foreground">
                        {formatDiceRoll(roll)}
                      </div>
                    </div>

                    {/* Context Information */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {roll.move && (
                        <Badge variant="secondary" className="gap-1">
                          <Target size={10} />
                          {roll.move}
                        </Badge>
                      )}
                      {roll.character && (
                        <Badge variant="secondary" className="gap-1">
                          <span>👤</span>
                          {roll.character}
                        </Badge>
                      )}
                      {roll.context && (
                        <span className="text-muted-foreground">
                          {roll.context}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedRolls.length === 0 && (
        <Card variant="surface">
          <CardContent className="p-6 pt-6">
            <div className="text-center py-8">
              <Dice6
                size={48}
                className="mx-auto mb-4 opacity-50 text-muted-foreground"
              />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filterResult !== 'all' ? 'No Matching Rolls' : 'No Rolls Yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filterResult !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start rolling dice to see your roll history! All 2d6 rolls will be tracked here with their outcomes.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {rollHistory.length > 0 && (
        <Card variant="surface">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Last roll:
                {' '}
                {rollHistory.length > 0 ? formatTimestamp(rollHistory[0].timestamp) : 'Never'}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} />
                <span>
                  {stats.successRate.toFixed(0)}
                  % success rate
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
