import type { CalculationChange } from '../services/CalculationHistory'

import React, { useState } from 'react'

import './CalculationHistory.css'

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

  return (
    <div className="calculation-history">
      <div className="history-header">
        <h3> Calculation History</h3>
        <div className="history-controls">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as string)}
            className="filter-select"
            aria-label="Filter calculation history by type"
          >
            <option value="all">All Changes</option>
            <option value="hp">HP</option>
            <option value="armor">Armor</option>
            <option value="load">Load</option>
            <option value="xp">XP</option>
            <option value="damage">Damage</option>
            <option value="modifier">Modifiers</option>
            <option value="condition">Conditions</option>
          </select>
          {onExport && (
            <button onClick={onExport} className="export-btn">
              Export
            </button>
          )}
          {onClear && (
            <button onClick={onClear} className="clear-btn">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="history-list">
        {filteredChanges.length === 0
          ? (
              <div className="no-history">No calculation changes recorded</div>
            )
          : (
              filteredChanges.map(change => (
                <div key={change.id} className={`history-item ${change.type}`}>
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
                    <div className="history-details">
                      <pre>{JSON.stringify(change.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
      </div>
    </div>
  )
}
