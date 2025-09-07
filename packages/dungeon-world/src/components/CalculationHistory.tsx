import type { CalculationChange } from '../services/CalculationHistory'

import React, { useState } from 'react'

import './CalculationHistory.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../utils/motion'

interface CalculationHistoryProps {
  changes: CalculationChange[]
  onClear?: () => void
  onExport?: () => void
}

export const CalculationHistory: React.FC <CalculationHistoryProps> = ({
  changes,
  onClear,
  onExport,
}) => {
  const [filter, setFilter] = useState <CalculationChange['type'] | 'all'>('all')
  const [showDetails, setShowDetails] = useState <Record <string, boolean>>({})

  const filteredChanges = filter === 'all'
    ? changes
    : changes.filter(change => change.type === filter)

  const formatTime = (date: Date) => {
    const _now = new Date()
    const diff = Date.now() - date.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60)
      return 'Just now'
    if (seconds < 3600)
      return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const getChangeIcon = (type: CalculationChange['type']) => {
    switch (type) {
      case 'hp': return '❤️'
      case 'armor': return '🛡️'
      case 'load': return '🎒'
      case 'xp': return '⭐'
      case 'damage': return '⚔️'
      case 'modifier': return '✨'
      case 'condition': return '🔮'
      default: return '📊'
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0)
      return 'positive'
    if (change < 0)
      return 'negative'
    return 'neutral'
  }

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const prefersReduced = useReducedMotion()

  return (
    <div className="calculation-history">
      <div className="history-header">
        <h3> Calculation History</h3>
        <div className="history-controls">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="filter-select"><SelectValue placeholder="All Changes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="hp">HP</SelectItem>
              <SelectItem value="armor">Armor</SelectItem>
              <SelectItem value="load">Load</SelectItem>
              <SelectItem value="xp">XP</SelectItem>
              <SelectItem value="damage">Damage</SelectItem>
              <SelectItem value="modifier">Modifiers</SelectItem>
              <SelectItem value="condition">Conditions</SelectItem>
            </SelectContent>
          </Select>
          {onExport && (
            <motion.button onClick={onExport} className="export-btn" whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              Export
            </motion.button>
          )}
          {onClear && (
            <motion.button onClick={onClear} className="clear-btn" whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              Clear
            </motion.button>
          )}
        </div>
      </div>

      <motion.div className="history-list" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {filteredChanges.length === 0
          ? (
              <motion.div className="no-history" variants={itemFadeIn}>No calculation changes recorded</motion.div>
            )
          : (
              filteredChanges.map(change => (
                <motion.div key={change.id} className={`history-item ${change.type}`} variants={itemFadeIn} whileHover={prefersReduced ? undefined : { scale: 1.01 }}>
                  <div className="history-main" onClick={() => toggleDetails(change.id)}>
                    <span className="change-icon">{getChangeIcon(change.type)}</span>
                    <div className="change-info">
                      <div className="change-description">
                        <strong>{change.reason}</strong>
                        <span className="change-field">
                          {' '}
                          (
                          {change.field}
                          )
                        </span>
                      </div>
                      <div className="change-values">
                        <span className="old-value">{change.oldValue}</span>
                        <span className="arrow">→</span>
                        <span className="new-value">{change.newValue}</span>
                        <span className={`change-amount ${getChangeColor(change.change)}`}>
                          {change.change > 0 ? '+' : ''}
                          {change.change}
                        </span>
                      </div>
                    </div>
                    <div className="change-time">{formatTime(change.timestamp)}</div>
                  </div>

                  {showDetails[change.id] && change.details && (
                    <motion.div className="history-details" variants={itemFadeIn}>
                      <pre>{JSON.stringify(change.details, null, 2)}</pre>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
      </motion.div>
    </div>
  )
}
