import type { ModifierSet, TemporaryModifier } from '../models/Modifiers'

import React, { useState } from 'react'

import './ModifiersPanel.css'

interface ModifiersPanelProps {
  modifiers: ModifierSet
  onAddModifier: (modifier: Omit <TemporaryModifier, 'id'>) => void
  onRemoveModifier: (id: string) => void
  onUpdateModifier: (id: string, updates: Partial <TemporaryModifier>) => void
  onClearExpired?: () => void
}

export const ModifiersPanel: React.FC <ModifiersPanelProps> = ({
  modifiers,
  onAddModifier,
  onRemoveModifier,
  onUpdateModifier,
  onClearExpired,
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newModifier, setNewModifier] = useState <Partial <TemporaryModifier>>({
    name: '',
    value: 0,
    type: 'ongoing',
    source: '',
    target: 'all-rolls',
    expiry: 'scene',
  })

  const handleAddModifier = () => {
    if (!newModifier.name || newModifier.value === undefined)
      return

    onAddModifier({
      name: newModifier.name,
      value: newModifier.value,
      type: newModifier.type || 'ongoing',
      source: newModifier.source || 'Manual',
      target: newModifier.target || 'all-rolls',
      expiry: newModifier.expiry || 'scene',
      createdAt: new Date(),
      active: true,
    })

    // Reset form
    setNewModifier({
      name: '',
      value: 0,
      type: 'ongoing',
      source: '',
      target: 'all-rolls',
      expiry: 'scene',
    })
    setShowAddForm(false)
  }

  const getModifierIcon = (type: TemporaryModifier['type']) => {
    switch (type) {
      case 'ongoing': return '♾️'
      case 'forward': return '➡️'
      case 'hold': return '✊'
      default: return '✨'
    }
  }

  const getModifierClass = (value: number) => {
    if (value > 0)
      return 'positive'
    if (value < 0)
      return 'negative'
    return 'neutral'
  }

  const formatExpiry = (expiryTime?: Date) => {
    if (!expiryTime)
      return 'Permanent'

    const _now = new Date()
    const diff = expiryTime.getTime() - Date.now()

    if (diff <= 0)
      return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0)
      return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const isExpired = (modifier: TemporaryModifier) => {
    return modifier.expiryTime && new Date() > modifier.expiryTime
  }

  // Calculate aggregate modifiers
  const aggregates = {
    ongoing: modifiers.modifiers
      .filter(m => m.type === 'ongoing' && !isExpired(m))
      .reduce((sum, m) => sum + m.value, 0),
    forward: modifiers.modifiers
      .filter(m => m.type === 'forward' && !isExpired(m))
      .reduce((sum, m) => sum + m.value, 0),
    hold: modifiers.modifiers
      .filter(m => m.type === 'hold' && !isExpired(m))
      .reduce((sum, m) => sum + m.value, 0),
  }

  const activeModifiers = modifiers.modifiers.filter(m => !isExpired(m))
  const expiredModifiers = modifiers.modifiers.filter(m => isExpired(m))

  return (
    <div className="modifiers-panel">
      <div className="modifiers-header">
        <h3> Temporary Modifiers</h3>
        <button
          className="add-modifier-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕' : '+'}
          {' '}
          Add Modifier
        </button>
      </div>

      {/* Aggregate Display */}
      <div className="modifier-aggregates">
        <div className={`aggregate ${getModifierClass(aggregates.ongoing)}`}>
          <span className="aggregate-icon">♾️</span>
          <span className="aggregate-label">Ongoing</span>
          <span className="aggregate-value">
            {aggregates.ongoing > 0 ? '+' : ''}
            {aggregates.ongoing}
          </span>
        </div>
        <div className={`aggregate ${getModifierClass(aggregates.forward)}`}>
          <span className="aggregate-icon">➡️</span>
          <span className="aggregate-label">Forward</span>
          <span className="aggregate-value">
            {aggregates.forward > 0 ? '+' : ''}
            {aggregates.forward}
          </span>
        </div>
        <div className={`aggregate ${getModifierClass(aggregates.hold)}`}>
          <span className="aggregate-icon">✊</span>
          <span className="aggregate-label">Hold</span>
          <span className="aggregate-value">{aggregates.hold}</span>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="add-modifier-form">
          <input
            type="text"
            placeholder="Modifier name"
            value={newModifier.name}
            onChange={e => setNewModifier({ ...newModifier, name: e.target.value })}
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Value"
              value={newModifier.value}
              onChange={e => setNewModifier({ ...newModifier, value: Number.parseInt(e.target.value) || 0 })}
              className="value-input"
            />
            <select
              value={newModifier.type}
              onChange={e => setNewModifier({ ...newModifier, type: e.target.value as string })}
              aria-label="Modifier type"
            >
              <option value="ongoing">Ongoing</option>
              <option value="forward">Forward</option>
              <option value="hold">Hold</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Source (optional)"
              value={newModifier.source}
              onChange={e => setNewModifier({ ...newModifier, source: e.target.value })}
            />

          </div>
          <div className="form-actions">
            <button onClick={handleAddModifier} className="confirm-btn">
              Add
            </button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Modifiers */}
      <div className="modifiers-list">
        <h4> Active Modifiers</h4>
        {activeModifiers.length === 0
          ? (
              <div className="no-modifiers">No active modifiers</div>
            )
          : (
              activeModifiers.map(modifier => (
                <div key={modifier.id} className={`modifier-item ${getModifierClass(modifier.value)}`}>
                  <div className="modifier-main">
                    <span className="modifier-icon">{getModifierIcon(modifier.type)}</span>
                    <div className="modifier-info">
                      <div className="modifier-name">{modifier.name}</div>
                      <div className="modifier-details">
                        <span className="modifier-value">
                          {modifier.value > 0 ? '+' : ''}
                          {modifier.value}
                        </span>
                        <span className="modifier-source">
                          from
                          {modifier.source}
                        </span>
                      </div>
                    </div>
                    <div className="modifier-controls">
                      <span className="modifier-expiry">{formatExpiry(modifier.expiryTime)}</span>
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveModifier(modifier.id)}
                        title="Remove modifier"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
      </div>

      {/* Expired Modifiers */}
      {expiredModifiers.length > 0 && (
        <div className="expired-section">
          <div className="expired-header">
            <h4> Expired Modifiers</h4>
            {onClearExpired && (
              <button onClick={onClearExpired} className="clear-expired-btn">
                Clear All
              </button>
            )}
          </div>
          {expiredModifiers.map(modifier => (
            <div key={modifier.id} className="modifier-item expired">
              <span className="modifier-icon">{getModifierIcon(modifier.type)}</span>
              <span className="modifier-name">{modifier.name}</span>
              <button
                className="remove-btn"
                onClick={() => onRemoveModifier(modifier.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
