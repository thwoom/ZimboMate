import type {
  Condition,
  ConditionFilter,
  ConditionNotification,
  ConditionPriority,
  ConditionSource,
  ConditionStats,
  DebilityType,
  DurationType,
  OngoingEffectType,
} from '../models/Condition'

import React, { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn, hudGlowPulse } from '../utils/motion'

import { conditionService } from '../services/ConditionService'
import { useCharacter } from '../store/GameStore'
import './ConditionTracker.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'

interface ConditionTrackerProps {
  characterId?: string
  onConditionResolved?: (conditionId: string) => void
}

// Forward-declare internal components to avoid use-before-define errors

const ConditionCard: React.FC<{
  condition: Condition
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  onStack: (id: string) => void
  onSelect: (condition: Condition) => void
  isResolved?: boolean
}> = props => <ConditionCardImpl {...props} />

const CreateConditionForm: React.FC<{
  onCreate: (conditionData: any) => void
  onCancel: () => void
}> = props => <CreateConditionFormImpl {...props} />

const ConditionDetailModal: React.FC<{
  condition: Condition
  onClose: () => void
  onResolve: (id: string) => void
  onDelete: (id: string) => void
}> = props => <ConditionDetailModalImpl {...props} />

export const ConditionTracker: React.FC <ConditionTrackerProps> = ({
  characterId,
  onConditionResolved,
}) => {
  const currentCharacter = useCharacter()
  const [conditions, setConditions] = useState <Condition[]>([])
  const [notifications, setNotifications] = useState <ConditionNotification[]>([])
  const [stats, setStats] = useState <ConditionStats | null>(null)
  const [filter, setFilter] = useState <ConditionFilter>({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState <Condition | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  const activeCharacterId = characterId || currentCharacter?.id

  const loadConditions = useCallback(() => {
    if (!activeCharacterId)
      return
    const characterConditions = conditionService.getConditionsForCharacter(activeCharacterId, filter)
    setConditions(characterConditions)
  }, [activeCharacterId, filter])

  const loadNotifications = useCallback(() => {
    if (!activeCharacterId)
      return
    const characterNotifications = conditionService.getNotifications(activeCharacterId)
    setNotifications(characterNotifications)
  }, [activeCharacterId])

  const loadStats = useCallback(() => {
    if (!activeCharacterId)
      return
    const characterStats = conditionService.getConditionStats(activeCharacterId)
    setStats(characterStats)
  }, [activeCharacterId])

  // Load conditions when character changes
  useEffect(() => {
    if (activeCharacterId) {
      loadConditions()
      loadNotifications()
      loadStats()
    }
  }, [activeCharacterId, loadConditions, loadNotifications, loadStats])

  // Listen for condition changes
  useEffect(() => {
    if (!activeCharacterId)
      return

    const unsubscribe = conditionService.addListener((allConditions) => {
      const characterConditions = allConditions.filter(c => c.characterId === activeCharacterId)
      setConditions(characterConditions)
      loadStats()
    })

    const unsubscribeNotifications = conditionService.addNotificationListener((allNotifications) => {
      const characterNotifications = allNotifications.filter(n => n.characterId === activeCharacterId)
      setNotifications(characterNotifications)
    })

    return () => {
      unsubscribe()
      unsubscribeNotifications()
    }
  }, [activeCharacterId, loadStats])

  const handleCreateCondition = useCallback((conditionData: any) => {
    if (!activeCharacterId)
      return

    try {
      const _newCondition = conditionService.createCondition({
        ...conditionData,
        characterId: activeCharacterId,
      })
      setShowCreateForm(false)
    }
    catch (error) {
      console.warn('Failed to create condition. Please check your input.', error)
    }
  }, [activeCharacterId])

  const handleResolveCondition = useCallback((conditionId: string) => {
    const resolved = conditionService.resolveCondition(conditionId, 'player')
    if (resolved) {
      onConditionResolved?.(conditionId)
    }
  }, [onConditionResolved])

  const handleDeleteCondition = useCallback((conditionId: string) => {
    // For now, delete directly without blocking confirm to satisfy no-alert rules
    conditionService.deleteCondition(conditionId)
  }, [])

  const handleStackCondition = useCallback((conditionId: string) => {
    conditionService.stackCondition(conditionId)
  }, [])

  const handleFilterChange = useCallback((newFilter: Partial <ConditionFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])

  const handleMarkNotificationRead = useCallback((notificationId: string) => {
    conditionService.markNotificationRead(notificationId)
  }, [])

  const handleDeleteNotification = useCallback((notificationId: string) => {
    conditionService.deleteNotification(notificationId)
  }, [])

  const filteredConditions = conditions.filter((condition) => {
    if (filter.type && condition.type !== filter.type)
      return false
    if (filter.isActive !== undefined && condition.isActive !== filter.isActive)
      return false
    if (filter.isResolved !== undefined && condition.isResolved !== filter.isResolved)
      return false
    if (filter.source && condition.source !== filter.source)
      return false
    if (filter.category && condition.category !== filter.category)
      return false
    return true
  })

  const activeConditions = filteredConditions.filter(c => c.isActive && !c.isResolved)
  const resolvedConditions = filteredConditions.filter(c => c.isResolved)

  const unreadNotifications = notifications.filter(n => !n.isRead)

  const prefersReduced = useReducedMotion()

  if (!activeCharacterId) {
    return (
      <motion.div className="condition-tracker" initial={prefersReduced ? undefined : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={itemFadeIn}>
        <div className="condition-tracker__no-character">
          <h3> No Character Selected</h3>
          <p> Please select a character to view their conditions.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="condition-tracker" initial={prefersReduced ? undefined : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={staggerContainer}>
      {/* Header with Stats */}
      <motion.div className="condition-tracker__header" variants={itemFadeIn}>
        <div className="condition-tracker__title">
          <h2>🎭 Condition Tracker</h2>
          <div className="condition-tracker__notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
            {unreadNotifications.length > 0 && (
              <motion.span className="condition-tracker__notification-count" animate={prefersReduced ? undefined : { scale: [1, 1.15, 1] }} transition={prefersReduced ? undefined : { duration: 1.1, repeat: Infinity }}>
                {unreadNotifications.length}
              </motion.span>
            )}
            🔔
          </div>
        </div>

        {stats && (
          <motion.div className="condition-tracker__stats" variants={staggerContainer}>
            <motion.div className="condition-tracker__stat" variants={itemFadeIn}>
              <span className="condition-tracker__stat-label">Active:</span>
              <span className="condition-tracker__stat-value">{stats.activeConditions}</span>
            </motion.div>
            <motion.div className="condition-tracker__stat" variants={itemFadeIn}>
              <span className="condition-tracker__stat-label">Debilities:</span>
              <span className="condition-tracker__stat-value condition-tracker__stat-value--debuff">{stats.debilities}</span>
            </motion.div>
            <motion.div className="condition-tracker__stat" variants={itemFadeIn}>
              <span className="condition-tracker__stat-label">Effects:</span>
              <span className="condition-tracker__stat-value condition-tracker__stat-value--buff">{stats.ongoingEffects}</span>
            </motion.div>
            <motion.div className="condition-tracker__stat" variants={itemFadeIn}>
              <span className="condition-tracker__stat-label">Temporary:</span>
              <span className="condition-tracker__stat-value">{stats.temporaryConditions}</span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div className="condition-tracker__notifications" variants={itemFadeIn}>
          <div className="condition-tracker__notifications-header">
            <h3> Notifications</h3>
            <button
              className="condition-tracker__close-btn"
              onClick={() => setShowNotifications(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="condition-tracker__notifications-list">
            {notifications.length === 0
              ? (
                  <p className="condition-tracker__no-notifications">No notifications</p>
                )
              : (
                  notifications.map(notification => (
                    <motion.div
                      key={notification.id}
                      className={`condition-tracker__notification condition-tracker__notification--${notification.priority} ${!notification.isRead ? 'condition-tracker__notification--unread' : ''}`}
                      variants={itemFadeIn}
                    >
                      <div className="condition-tracker__notification-content">
                        <p className="condition-tracker__notification-message">{notification.message}</p>
                        <span className="condition-tracker__notification-time">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="condition-tracker__notification-actions">
                        {!notification.isRead && (
                          <button
                            className="condition-tracker__notification-btn"
                            onClick={() => handleMarkNotificationRead(notification.id)}
                            type="button"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="condition-tracker__notification-btn condition-tracker__notification-btn--delete"
                          onClick={() => handleDeleteNotification(notification.id)}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div className="condition-tracker__controls" variants={itemFadeIn}>
        <motion.button
          className="condition-tracker__btn condition-tracker__btn--primary"
          onClick={() => setShowCreateForm(true)}
          type="button"
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
        >
          ➕ Add Condition
        </motion.button>

        <div className="condition-tracker__filters">
          <Select value={filter.type || 'all'} onValueChange={(v) => handleFilterChange({ type: v === 'all' ? undefined : v as Condition['type'] })}>
            <SelectTrigger className="w-56"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="debility">Debilities</SelectItem>
              <SelectItem value="ongoing_effect">Ongoing Effects</SelectItem>
              <SelectItem value="temporary_condition">Temporary Conditions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.source || 'all'} onValueChange={(v) => handleFilterChange({ source: v === 'all' ? undefined : v as ConditionSource })}>
            <SelectTrigger className="w-56"><SelectValue placeholder="All Sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="move">Move</SelectItem>
              <SelectItem value="spell">Spell</SelectItem>
              <SelectItem value="item">Item</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="npc">NPC</SelectItem>
              <SelectItem value="gm">GM</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.isActive === undefined ? 'all' : filter.isActive ? 'active' : 'resolved'} onValueChange={(v) => handleFilterChange({ isActive: v === 'all' ? undefined : v === 'active' })}>
            <SelectTrigger className="w-56"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Active Conditions */}
      <div className="condition-tracker__section">
        <h3>
          {' '}
          Active Conditions (
          {activeConditions.length}
          )
        </h3>
        {activeConditions.length === 0
          ? (
              <p className="condition-tracker__no-conditions">No active conditions</p>
            )
          : (
              <div className="condition-tracker__conditions-list">
                {activeConditions.map(condition => (
                  <ConditionCard
                    key={condition.id}
                    condition={condition}
                    onResolve={handleResolveCondition}
                    onDelete={handleDeleteCondition}
                    onStack={handleStackCondition}
                    onSelect={setSelectedCondition}
                  />
                ))}
              </div>
            )}
      </div>

      {/* Resolved Conditions */}
      {resolvedConditions.length > 0 && (
        <div className="condition-tracker__section">
          <h3>
            {' '}
            Resolved Conditions (
            {resolvedConditions.length}
            )
          </h3>
          <div className="condition-tracker__conditions-list condition-tracker__conditions-list--resolved">
            {resolvedConditions.map(condition => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                onResolve={handleResolveCondition}
                onDelete={handleDeleteCondition}
                onStack={handleStackCondition}
                onSelect={setSelectedCondition}
                isResolved
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Condition Modal */}
      {showCreateForm && (
        <CreateConditionForm
          onCreate={handleCreateCondition}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Condition Detail Modal */}
      {selectedCondition && (
        <ConditionDetailModal
          condition={selectedCondition}
          onClose={() => setSelectedCondition(null)}
          onResolve={handleResolveCondition}
          onDelete={handleDeleteCondition}
        />
      )}
    </motion.div>
  )
}

// Condition Card Component
interface ConditionCardProps {
  condition: Condition
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  onStack: (id: string) => void
  onSelect: (condition: Condition) => void
  isResolved?: boolean
}

function ConditionCardImpl({
  condition,
  onResolve,
  onDelete,
  onStack,
  onSelect,
  isResolved = false,
}: ConditionCardProps) {
  const _display = conditionService.getConditionDisplay(condition)
  const duration = conditionService.formatDuration(condition)

  return (
    <motion.div
      className={`condition-card condition-card--${condition.type} ${isResolved ? 'condition-card--resolved' : ''}`}
      onClick={() => onSelect(condition)}
      data-color={_display.color}
      variants={itemFadeIn}
      whileHover={{ scale: 1.01 }}
    >
      <div className="condition-card__header">
        <div className="condition-card__icon" data-color={_display.color}>
          {_display.icon}
        </div>
        <div className="condition-card__info">
          <h4 className="condition-card__name">{condition.name}</h4>
          <p className="condition-card__description">{condition.description}</p>
        </div>
        <div className="condition-card__status">
          {condition.currentStacks > 1 && (
            <span className="condition-card__stacks">
              ×
              {condition.currentStacks}
            </span>
          )}
          {isResolved && <span className="condition-card__resolved-badge">✓</span>}
        </div>
      </div>

      <div className="condition-card__details">
        <div className="condition-card__meta">
          <span className="condition-card__source">{condition.source}</span>
          <span className="condition-card__duration">{duration}</span>
        </div>

        {condition.notes && (
          <p className="condition-card__notes">{condition.notes}</p>
        )}
      </div>

      {!isResolved && (
        <div className="condition-card__actions">
          <button
            className="condition-card__btn condition-card__btn--resolve"
            onClick={(e) => {
              e.stopPropagation()
              onResolve(condition.id)
            }}
            type="button"
          >
            Resolve
          </button>
          {condition.canStack && (
            <button
              className="condition-card__btn condition-card__btn--stack"
              onClick={(e) => {
                e.stopPropagation()
                onStack(condition.id)
              }}
              type="button"
            >
              Stack
            </button>
          )}
          <button
            className="condition-card__btn condition-card__btn--delete"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(condition.id)
            }}
            type="button"
          >
            Delete
          </button>
        </div>
      )}
    </motion.div>
  )
}

// Create Condition Form Component
interface CreateConditionFormProps {
  onCreate: (conditionData: any) => void
  onCancel: () => void
}

function CreateConditionFormImpl({ onCreate, onCancel }: CreateConditionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'temporary_condition' as Condition['type'],
    duration: 'until_end_of_scene' as DurationType,
    source: 'manual' as ConditionSource,
    priority: 'normal' as ConditionPriority,
    canStack: false,
    maxStacks: 1,
    notes: '',

    // Type-specific fields
    debilityType: 'weak' as DebilityType,
    ongoingEffectType: '+1 forward' as OngoingEffectType,
    appliesTo: ['all'],
    category: 'neutral' as 'buff' | 'debuff' | 'neutral',
    statModifiers: {} as Record<string, number>,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  return (
    <div className="condition-tracker__modal">
      <div className="condition-tracker__modal-content">
        <h3> Create New Condition</h3>

        <form onSubmit={handleSubmit} className="condition-tracker__form">
          <div className="condition-tracker__form-group">
            <label htmlFor="cond-name"> Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="condition-tracker__input"
              id="cond-name"
            />
          </div>

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-desc"> Description:</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="condition-tracker__textarea"
              id="cond-desc"
            />
          </div>

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-type"> Type:</label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as Condition['type'] }))}>
              <SelectTrigger className="condition-tracker__select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="debility">Debility</SelectItem>
                <SelectItem value="ongoing_effect">Ongoing Effect</SelectItem>
                <SelectItem value="temporary_condition">Temporary Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-duration"> Duration:</label>
            <Select value={formData.duration} onValueChange={(v) => setFormData(prev => ({ ...prev, duration: v as DurationType }))}>
              <SelectTrigger className="condition-tracker__select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="until_end_of_turn">Until End of Turn</SelectItem>
                <SelectItem value="until_end_of_scene">Until End of Scene</SelectItem>
                <SelectItem value="until_rest">Until Rest</SelectItem>
                <SelectItem value="until_dawn">Until Dawn</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-source"> Source:</label>
            <Select value={formData.source} onValueChange={(v) => setFormData(prev => ({ ...prev, source: v as ConditionSource }))}>
              <SelectTrigger className="condition-tracker__select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="move">Move</SelectItem>
                <SelectItem value="spell">Spell</SelectItem>
                <SelectItem value="item">Item</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="npc">NPC</SelectItem>
                <SelectItem value="gm">GM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-priority"> Priority:</label>
            <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as ConditionPriority }))}>
              <SelectTrigger className="condition-tracker__select"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="condition-tracker__form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.canStack}
                onChange={e => setFormData(prev => ({ ...prev, canStack: e.target.checked }))}
              />
              Can Stack
            </label>
          </div>

          {formData.canStack && (
            <div className="condition-tracker__form-group">
              <label htmlFor="cond-max-stacks"> Max Stacks:</label>
              <input
                type="number"
                value={formData.maxStacks}
                onChange={e => setFormData(prev => ({ ...prev, maxStacks: Number.parseInt(e.target.value) || 1 }))}
                min="1"
                className="condition-tracker__input"
                id="cond-max-stacks"
              />
            </div>
          )}

          <div className="condition-tracker__form-group">
            <label htmlFor="cond-notes"> Notes:</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="condition-tracker__textarea"
              id="cond-notes"
            />
          </div>

          <div className="condition-tracker__form-actions">
            <button type="submit" className="condition-tracker__btn condition-tracker__btn--primary">
              Create Condition
            </button>
            <button type="button" className="condition-tracker__btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Condition Detail Modal Component
interface ConditionDetailModalProps {
  condition: Condition
  onClose: () => void
  onResolve: (id: string) => void
  onDelete: (id: string) => void
}

function ConditionDetailModalImpl({
  condition,
  onClose,
  onResolve,
  onDelete,
}: ConditionDetailModalProps) {
  const _display = conditionService.getConditionDisplay(condition)
  const duration = conditionService.formatDuration(condition)

  return (
    <div className="condition-tracker__modal">
      <div className="condition-tracker__modal-content">
        <div className="condition-tracker__modal-header">
          <h3>{condition.name}</h3>
          <button className="condition-tracker__close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="condition-tracker__modal-body">
          <div className="condition-tracker__detail-section">
            <h4> Description</h4>
            <p>{condition.description}</p>
          </div>

          <div className="condition-tracker__detail-section">
            <h4> Details</h4>
            <div className="condition-tracker__detail-grid">
              <div className="condition-tracker__detail-item">
                <span className="condition-tracker__detail-label">Type:</span>
                <span className="condition-tracker__detail-value">{condition.type}</span>
              </div>
              <div className="condition-tracker__detail-item">
                <span className="condition-tracker__detail-label">Source:</span>
                <span className="condition-tracker__detail-value">{condition.source}</span>
              </div>
              <div className="condition-tracker__detail-item">
                <span className="condition-tracker__detail-label">Priority:</span>
                <span className="condition-tracker__detail-value">{condition.priority}</span>
              </div>
              <div className="condition-tracker__detail-item">
                <span className="condition-tracker__detail-label">Duration:</span>
                <span className="condition-tracker__detail-value">{duration}</span>
              </div>
              <div className="condition-tracker__detail-item">
                <span className="condition-tracker__detail-label">Created:</span>
                <span className="condition-tracker__detail-value">
                  {new Date(condition.createdAt).toLocaleString()}
                </span>
              </div>
              {condition.isResolved && (
                <div className="condition-tracker__detail-item">
                  <span className="condition-tracker__detail-label">Resolved:</span>
                  <span className="condition-tracker__detail-value">
                    {condition.resolvedAt ? new Date(condition.resolvedAt).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {condition.notes && (
            <div className="condition-tracker__detail-section">
              <h4> Notes</h4>
              <p>{condition.notes}</p>
            </div>
          )}

          {condition.currentStacks > 1 && (
            <div className="condition-tracker__detail-section">
              <h4> Stacks</h4>
              <p>
                {' '}
                Current:
                {condition.currentStacks}
                {' '}
                / Max:
                {condition.maxStacks || 'Unlimited'}
              </p>
            </div>
          )}
        </div>

        <div className="condition-tracker__modal-actions">
          {!condition.isResolved && (
            <button
              className="condition-tracker__btn condition-tracker__btn--primary"
              onClick={() => {
                onResolve(condition.id)
                onClose()
              }}
              type="button"
            >
              Resolve Condition
            </button>
          )}
          <button
            className="condition-tracker__btn condition-tracker__btn--danger"
            onClick={() => {
              onDelete(condition.id)
              onClose()
            }}
            type="button"
          >
            Delete Condition
          </button>
          <button className="condition-tracker__btn" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
