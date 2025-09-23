/**
 * Dice History Sidebar Component
 * Always-visible sidebar showing dice roll history with re-roll and copy functionality
 * Desktop-optimized with rich interactions
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui'
import { Dices, Copy, RotateCcw, Trash2, Download, Filter, ChevronDown, ChevronRight, Clock, TrendingUp, TrendingDown, Minus, Check, MoreHorizontal, FileText } from 'lucide-react'
import { useDiceStore, type RollResult } from '../../stores/diceStore'
import { RollHistoryExportDialog } from './RollHistoryExportDialog'
import { format } from 'date-fns'

interface DiceHistorySidebarProps {
  characterId: string
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

type FilterType = 'all' | 'success' | 'partial' | 'failure' | 'stats' | 'moves' | 'custom'
type SortType = 'newest' | 'oldest' | 'result' | 'type'

const outcomeColors = {
  success: 'text-chart-2 bg-chart-2/15',
  partial: 'text-chart-4 bg-chart-4/15',
  failure: 'text-destructive bg-destructive/15'
}

const outcomeIcons = {
  success: TrendingUp,
  partial: Minus,
  failure: TrendingDown
}

export const DiceHistorySidebar: React.FC<DiceHistorySidebarProps> = ({
  characterId,
  className = '',
  collapsed = false,
  onToggleCollapse
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const {
    getHistoryForCharacter,
    clearHistoryForCharacter,
    exportHistory,
    rerollWithSameContext,
    copyRollToClipboard,
    isRolling
  } = useDiceStore()

  const rawHistory = getHistoryForCharacter(characterId)

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = rawHistory

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(roll => {
        switch (filter) {
          case 'success': return roll.outcome === 'success'
          case 'partial': return roll.outcome === 'partial'
          case 'failure': return roll.outcome === 'failure'
          case 'stats': return roll.type === 'stat'
          case 'moves': return roll.type === 'move'
          case 'custom': return roll.type === 'custom'
          default: return true
        }
      })
    }

    // Apply sort
    filtered = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'newest': return b.timestamp - a.timestamp
        case 'oldest': return a.timestamp - b.timestamp
        case 'result': return b.finalResult - a.finalResult
        case 'type': return a.type.localeCompare(b.type)
        default: return b.timestamp - a.timestamp
      }
    })

    return filtered
  }, [rawHistory, filter, sort])

  // Stats
  const stats = useMemo(() => {
    const total = rawHistory.length
    const successes = rawHistory.filter(r => r.outcome === 'success').length
    const partials = rawHistory.filter(r => r.outcome === 'partial').length
    const failures = rawHistory.filter(r => r.outcome === 'failure').length
    const average = total > 0 ? (rawHistory.reduce((sum, r) => sum + r.finalResult, 0) / total).toFixed(1) : '0'

    return { total, successes, partials, failures, average }
  }, [rawHistory])

  const handleReroll = async (roll: RollResult) => {
    try {
      await rerollWithSameContext(roll.id)
    } catch (error) {
      console.error('Failed to reroll:', error)
    }
  }

  const [copiedRoll, setCopiedRoll] = useState<string | null>(null)

  const handleCopy = (roll: RollResult, format: 'simple' | 'detailed' | 'notation' = 'simple') => {
    let copyText: string

    switch (format) {
      case 'detailed':
        copyText = `${roll.context.label}: ${roll.dice1} + ${roll.dice2} ${roll.modifier >= 0 ? '+' : ''}${roll.modifier} = ${roll.finalResult} (${roll.outcome})`
        break
      case 'notation':
        copyText = `[[2d6${roll.modifier >= 0 ? '+' : ''}${roll.modifier}]] = ${roll.finalResult}`
        break
      default:
        copyText = `${roll.context.label}: ${roll.finalResult} (${roll.outcome})`
    }

    navigator.clipboard.writeText(copyText)
    setCopiedRoll(roll.id)
    setTimeout(() => setCopiedRoll(null), 2000)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleClear = () => {
    if (confirm('Clear all dice history? This cannot be undone.')) {
      clearHistoryForCharacter(characterId)
    }
  }

  if (collapsed) {
    return (
      <motion.div
        className={`bg-card border-r border-border ${className}`}
        style={{ width: '60px' }}
      >
        <div className="p-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="p-3">
          <div className="text-center">
            <Dices size={20} className="mx-auto mb-2 text-muted-foreground" />
            <div className="text-xs text-muted-foreground writing-mode-vertical">
              {stats.total} rolls
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      id="dice-history-content"
      role="complementary"
      aria-labelledby="dice-history-heading"
      className={`bg-card border-r border-border flex flex-col ${className}`}
      style={{ width: '320px', minWidth: '320px' }}
      initial={{ width: 0 }}
      animate={{ width: 320 }}
      exit={{ width: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dices size={20} className="text-primary" aria-hidden="true" />
            <h2 id="dice-history-heading" className="text-lg font-semibold">Dice History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label="Collapse dice history sidebar"
            aria-expanded={!collapsed}
            aria-controls="dice-history-content"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className="text-sm font-semibold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-chart-2">{stats.successes}</div>
            <div className="text-xs text-muted-foreground">10+</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-chart-4">{stats.partials}</div>
            <div className="text-xs text-muted-foreground">7-9</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-destructive">{stats.failures}</div>
            <div className="text-xs text-muted-foreground">6-</div>
          </div>
        </div>

        {/* Filter Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter size={14} />
            Filters ({filter}, {sort})
          </span>
          {showFilters ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border p-3"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="w-full text-sm border border-border rounded px-2 py-1"
                >
                  <option value="all">All Rolls</option>
                  <option value="success">Success (10+)</option>
                  <option value="partial">Partial (7-9)</option>
                  <option value="failure">Failure (6-)</option>
                  <option value="stats">Stat Rolls</option>
                  <option value="moves">Move Rolls</option>
                  <option value="custom">Custom Rolls</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="w-full text-sm border border-border rounded px-2 py-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="result">By Result</option>
                  <option value="type">By Type</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download size={14} className="mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex-1"
            disabled={stats.total === 0}
          >
            <Trash2 size={14} className="mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Dices size={32} className="mx-auto mb-2 opacity-50" />
              <div className="text-sm">No rolls yet</div>
              <div className="text-xs">Start rolling to see history</div>
            </div>
          ) : (
            filteredHistory.map((roll, index) => {
              const OutcomeIcon = outcomeIcons[roll.outcome]

              return (
                <motion.div
                  key={roll.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border p-3 hover:bg-muted/50 hover:bg-muted group"
                  whileHover={{ scale: 1.01, x: 2 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{roll.context.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {roll.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(roll.timestamp, 'HH:mm:ss')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={`${outcomeColors[roll.outcome]} text-xs`}>
                        <OutcomeIcon size={10} className="mr-1" />
                        {roll.finalResult}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    {/* Dice Visual */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground  mb-1">
                      <div className="flex items-center gap-1">
                        <motion.div
                          className="w-5 h-5 bg-gradient-to-br from-primary/12 to-primary/20 border border-primary/30 rounded shadow-sm text-primary flex items-center justify-center text-xs font-bold"
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {roll.dice1}
                        </motion.div>
                        <span className="text-muted-foreground">+</span>
                        <motion.div
                          className="w-5 h-5 bg-gradient-to-br from-primary/12 to-primary/20 border border-primary/30 rounded shadow-sm text-primary flex items-center justify-center text-xs font-bold"
                          whileHover={{ rotate: -5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {roll.dice2}
                        </motion.div>
                        <span className="text-muted-foreground">{roll.modifier >= 0 ? '+' : ''}{roll.modifier}</span>
                        <span className="text-muted-foreground">=</span>
                        <span className={`font-semibold ${
                          roll.outcome === 'success' ? 'text-chart-2' :
                          roll.outcome === 'partial' ? 'text-chart-4' :
                          'text-destructive'
                        }`}>
                          {roll.finalResult}
                        </span>
                      </div>
                    </div>

                    {/* Roll Breakdown */}
                    <div className="text-xs text-muted-foreground ">
                      Base: {roll.dice1 + roll.dice2} {roll.modifier !== 0 && `• Modifier: ${roll.modifier >= 0 ? '+' : ''}${roll.modifier}`}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReroll(roll)}
                      className="text-xs px-2 py-1 h-6 hover:bg-primary/10 hover:text-primary"
                      disabled={isRolling}
                    >
                      <RotateCcw size={10} className="mr-1" />
                      Reroll
                    </Button>

                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(roll, 'simple')}
                        className={`text-xs px-2 py-1 h-6 hover:bg-chart-2/12 hover:text-chart-2 ${
                          copiedRoll === roll.id ? 'bg-chart-2/15 text-chart-2' : ''
                        }`}
                      >
                        {copiedRoll === roll.id ? (
                          <>
                            <Check size={10} className="mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={10} className="mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    {/* More Actions Dropdown */}
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs px-1 py-1 h-6 hover:bg-muted"
                      >
                        <MoreHorizontal size={10} />
                      </Button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-1 bg-card rounded-lg shadow-lg border border-border py-1 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <button
                          onClick={() => handleCopy(roll, 'detailed')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-muted hover:bg-muted"
                        >
                          Copy Detailed
                        </button>
                        <button
                          onClick={() => handleCopy(roll, 'notation')}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-muted hover:bg-muted"
                        >
                          Copy Dice Notation
                        </button>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => {
                            // Share roll result
                            if (navigator.share) {
                              navigator.share({
                                title: 'Dice Roll Result',
                                text: `${roll.context.label}: ${roll.finalResult} (${roll.outcome})`
                              })
                            }
                          }}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-muted hover:bg-muted"
                        >
                          Share Result
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Export Dialog */}
      <RollHistoryExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        characterId={characterId}
      />
    </motion.div>
  )
}






