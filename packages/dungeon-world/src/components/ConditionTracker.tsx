import './ConditionTracker.css';

import React, { useCallback,useEffect, useState } from 'react';

import {
  Condition,
  ConditionFilter,
  ConditionNotification,
  ConditionPriority,
  ConditionSource,
  ConditionStats,
  DebilityType,
  DurationType,
  OngoingEffectType,
} from '../models/Condition';
import { conditionService } from '../services/ConditionService';
import { useCharacter } from '../store/GameStore';

interface ConditionTrackerProps {
  characterId?: string;
  onConditionResolved?: (conditionId: string) => void;
}

export const ConditionTracker: React.FC < ConditionTrackerProps> = ({
  characterId,
  onConditionResolved,
}) => {
  const currentCharacter = useCharacter();
  const [conditions, setConditions] = useState < Condition[]>([]);
  const [notifications, setNotifications] = useState < ConditionNotification[]>([]);
  const [stats, setStats] = useState < ConditionStats | null>(null);
  const [filter, setFilter] = useState < ConditionFilter>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState < Condition | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeCharacterId = characterId || currentCharacter?.id;

  // Load conditions when character changes
  useEffect(() => {
    if (activeCharacterId) {
      loadConditions();
      loadNotifications();
      loadStats();
    }
  }, [activeCharacterId]);

  // Listen for condition changes
  useEffect(() => {
    if (!activeCharacterId) return;

    const unsubscribe = conditionService.addListener((allConditions) => {
      const characterConditions = allConditions.filter(c => c.characterId === activeCharacterId);
      setConditions(characterConditions);
      loadStats();
    });

    const unsubscribeNotifications = conditionService.addNotificationListener((allNotifications) => {
      const characterNotifications = allNotifications.filter(n => n.characterId === activeCharacterId);
      setNotifications(characterNotifications);
    });

    return () => {
      unsubscribe();
      unsubscribeNotifications();
    };
  }, [activeCharacterId]);

  const loadConditions = useCallback(() => {
    if (!activeCharacterId) return;
    const characterConditions = conditionService.getConditionsForCharacter(activeCharacterId, filter);
    setConditions(characterConditions);
  }, [activeCharacterId, filter]);

  const loadNotifications = useCallback(() => {
    if (!activeCharacterId) return;
    const characterNotifications = conditionService.getNotifications(activeCharacterId);
    setNotifications(characterNotifications);
  }, [activeCharacterId]);

  const loadStats = useCallback(() => {
    if (!activeCharacterId) return;
    const characterStats = conditionService.getConditionStats(activeCharacterId);
    setStats(characterStats);
  }, [activeCharacterId]);

  const handleCreateCondition = useCallback((conditionData: any) => {
    if (!activeCharacterId) return;

    try {
      const _newCondition = conditionService.createCondition({
        ...conditionData,
        characterId: activeCharacterId,
      });
      setShowCreateForm(false);
    } catch {
      alert('Failed to create condition. Please check your input.');
    }
  }, [activeCharacterId]);

  const handleResolveCondition = useCallback((conditionId: string) => {
    const resolved = conditionService.resolveCondition(conditionId, 'player');
    if (resolved) {
      onConditionResolved?.(conditionId);
    }
  }, [onConditionResolved]);

  const handleDeleteCondition = useCallback((conditionId: string) => {
    if (confirm('Are you sure you want to delete this condition?')) {
      conditionService.deleteCondition(conditionId);
    }
  }, []);

  const handleStackCondition = useCallback((conditionId: string) => {
    conditionService.stackCondition(conditionId);
  }, []);

  const handleFilterChange = useCallback((newFilter: Partial < ConditionFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleMarkNotificationRead = useCallback((notificationId: string) => {
    conditionService.markNotificationRead(notificationId);
  }, []);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    conditionService.deleteNotification(notificationId);
  }, []);

  const filteredConditions = conditions.filter(condition => {
    if (filter.type && condition.type !== filter.type) return false;
    if (filter.isActive !== undefined && condition.isActive !== filter.isActive) return false;
    if (filter.isResolved !== undefined && condition.isResolved !== filter.isResolved) return false;
    if (filter.source && condition.source !== filter.source) return false;
    if (filter.category && condition.category !== filter.category) return false;
    return true;
  });

  const activeConditions = filteredConditions.filter(c => c.isActive && !c.isResolved);
  const resolvedConditions = filteredConditions.filter(c => c.isResolved);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (!activeCharacterId) {
    return (
      <div className="condition-tracker">
        <div className="condition-tracker__no-character">
          <h3 > No Character Selected</h3>
          <p > Please select a character to view their conditions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="condition-tracker">
      {/* Header with Stats */}
      <div className="condition-tracker__header">
        <div className="condition-tracker__title">
          <h2>🎭 Condition Tracker</h2>
          <div className="condition-tracker__notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
            {unreadNotifications.length > 0 && (
              <span className="condition-tracker__notification-count">{unreadNotifications.length}</span>
            )}
            🔔
          </div>
        </div>

        {stats && (
          <div className="condition-tracker__stats">
            <div className="condition-tracker__stat">
              <span className="condition-tracker__stat-label">Active:</span>
              <span className="condition-tracker__stat-value">{stats.activeConditions}</span>
            </div>
            <div className="condition-tracker__stat">
              <span className="condition-tracker__stat-label">Debilities:</span>
              <span className="condition-tracker__stat-value condition-tracker__stat-value--debuff">{stats.debilities}</span>
            </div>
            <div className="condition-tracker__stat">
              <span className="condition-tracker__stat-label">Effects:</span>
              <span className="condition-tracker__stat-value condition-tracker__stat-value--buff">{stats.ongoingEffects}</span>
            </div>
            <div className="condition-tracker__stat">
              <span className="condition-tracker__stat-label">Temporary:</span>
              <span className="condition-tracker__stat-value">{stats.temporaryConditions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="condition-tracker__notifications">
          <div className="condition-tracker__notifications-header">
            <h3 > Notifications</h3>
            <button
              className="condition-tracker__close-btn"
              onClick={() => setShowNotifications(false)}
            >
              ✕
            </button>
          </div>
          <div className="condition-tracker__notifications-list">
            {notifications.length === 0 ? (
              <p className="condition-tracker__no-notifications">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`condition-tracker__notification condition-tracker__notification--${notification.priority} ${!notification.isRead ? 'condition-tracker__notification--unread' : ''}`}
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
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="condition-tracker__notification-btn condition-tracker__notification-btn--delete"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="condition-tracker__controls">
        <button
          className="condition-tracker__btn condition-tracker__btn--primary"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Add Condition
        </button>

        <div className="condition-tracker__filters">
          <select
            value={filter.type || 'all'}
            onChange={(e) => handleFilterChange({ type: e.target.value === 'all' ? undefined : e.target.value as string })}
            className="condition-tracker__filter-select"
          >
            <option value="all">All Types</option>
            <option value="debility">Debilities</option>
            <option value="ongoing_effect">Ongoing Effects</option>
            <option value="temporary_condition">Temporary Conditions</option>
          </select>

          <select
            value={filter.source || 'all'}
            onChange={(e) => handleFilterChange({ source: e.target.value === 'all' ? undefined : e.target.value as string })}
            className="condition-tracker__filter-select"
          >
            <option value="all">All Sources</option>
            <option value="move">Move</option>
            <option value="spell">Spell</option>
            <option value="item">Item</option>
            <option value="environment">Environment</option>
            <option value="npc">NPC</option>
            <option value="gm">GM</option>
            <option value="manual">Manual</option>
          </select>

          <select
            value={filter.isActive === undefined ? 'all' : filter.isActive ? 'active' : 'resolved'}
            onChange={(e) => handleFilterChange({ isActive: e.target.value === 'all' ? undefined : e.target.value === 'active' })}
            className="condition-tracker__filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Active Conditions */}
      <div className="condition-tracker__section">
        <h3 > Active Conditions ({activeConditions.length})</h3>
        {activeConditions.length === 0 ? (
          <p className="condition-tracker__no-conditions">No active conditions</p>
        ) : (
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
          <h3 > Resolved Conditions ({resolvedConditions.length})</h3>
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
    </div>
  );
};

// Condition Card Component
interface ConditionCardProps {
  condition: Condition;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onStack: (id: string) => void;
  onSelect: (condition: Condition) => void;
  isResolved?: boolean;
}

const ConditionCard: React.FC < ConditionCardProps> = ({
  condition,
  onResolve,
  onDelete,
  onStack,
  onSelect,
  isResolved = false,
}) => {
  const _display = conditionService.getConditionDisplay(condition);
  const duration = conditionService.formatDuration(condition);

  return (
    <div
      className={`condition-card condition-card--${condition.type} ${isResolved ? 'condition-card--resolved' : ''}`}
      style={{ borderLeftColor: display.color }}
      onClick={() => onSelect(condition)}
    >
      <div className="condition-card__header">
        <div className="condition-card__icon" style={{ color: display.color }}>
          {display.icon}
        </div>
        <div className="condition-card__info">
          <h4 className="condition-card__name">{condition.name}</h4>
          <p className="condition-card__description">{condition.description}</p>
        </div>
        <div className="condition-card__status">
          {condition.currentStacks > 1 && (
            <span className="condition-card__stacks">×{condition.currentStacks}</span>
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
              e.stopPropagation();
              onResolve(condition.id);
            }}
          >
            Resolve
          </button>
          {condition.canStack && (
            <button
              className="condition-card__btn condition-card__btn--stack"
              onClick={(e) => {
                e.stopPropagation();
                onStack(condition.id);
              }}
            >
              Stack
            </button>
          )}
          <button
            className="condition-card__btn condition-card__btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(condition.id);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Create Condition Form Component
interface CreateConditionFormProps {
  onCreate: (conditionData: any) => void;
  onCancel: () => void;
}

const CreateConditionForm: React.FC < CreateConditionFormProps> = ({ onCreate, onCancel }) => {
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="condition-tracker__modal">
      <div className="condition-tracker__modal-content">
        <h3 > Create New Condition</h3>

        <form onSubmit={handleSubmit} className="condition-tracker__form">
          <div className="condition-tracker__form-group">
            <label > Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="condition-tracker__input"
            />
          </div>

          <div className="condition-tracker__form-group">
            <label > Description:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="condition-tracker__textarea"
            />
          </div>

          <div className="condition-tracker__form-group">
            <label > Type:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Condition['type'] }))}
              className="condition-tracker__select"
            >
              <option value="debility">Debility</option>
              <option value="ongoing_effect">Ongoing Effect</option>
              <option value="temporary_condition">Temporary Condition</option>
            </select>
          </div>

          <div className="condition-tracker__form-group">
            <label > Duration:</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value as DurationType }))}
              className="condition-tracker__select"
            >
              <option value="instant">Instant</option>
              <option value="until_end_of_turn">Until End of Turn</option>
              <option value="until_end_of_scene">Until End of Scene</option>
              <option value="until_rest">Until Rest</option>
              <option value="until_dawn">Until Dawn</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>

          <div className="condition-tracker__form-group">
            <label > Source:</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as ConditionSource }))}
              className="condition-tracker__select"
            >
              <option value="manual">Manual</option>
              <option value="move">Move</option>
              <option value="spell">Spell</option>
              <option value="item">Item</option>
              <option value="environment">Environment</option>
              <option value="npc">NPC</option>
              <option value="gm">GM</option>
            </select>
          </div>

          <div className="condition-tracker__form-group">
            <label > Priority:</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as ConditionPriority }))}
              className="condition-tracker__select"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="condition-tracker__form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.canStack}
                onChange={(e) => setFormData(prev => ({ ...prev, canStack: e.target.checked }))}
              />
              Can Stack
            </label>
          </div>

          {formData.canStack && (
            <div className="condition-tracker__form-group">
              <label > Max Stacks:</label>
              <input
                type="number"
                value={formData.maxStacks}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStacks: Number.parseInt(e.target.value) || 1 }))}
                min="1"
                className="condition-tracker__input"
              />
            </div>
          )}

          <div className="condition-tracker__form-group">
            <label > Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="condition-tracker__textarea"
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
  );
};

// Condition Detail Modal Component
interface ConditionDetailModalProps {
  condition: Condition;
  onClose: () => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConditionDetailModal: React.FC < ConditionDetailModalProps> = ({
  condition,
  onClose,
  onResolve,
  onDelete,
}) => {
  const _display = conditionService.getConditionDisplay(condition);
  const duration = conditionService.formatDuration(condition);

  return (
    <div className="condition-tracker__modal">
      <div className="condition-tracker__modal-content">
        <div className="condition-tracker__modal-header">
          <h3>{condition.name}</h3>
          <button className="condition-tracker__close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="condition-tracker__modal-body">
          <div className="condition-tracker__detail-section">
            <h4 > Description</h4>
            <p>{condition.description}</p>
          </div>

          <div className="condition-tracker__detail-section">
            <h4 > Details</h4>
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
              <h4 > Notes</h4>
              <p>{condition.notes}</p>
            </div>
          )}

          {condition.currentStacks > 1 && (
            <div className="condition-tracker__detail-section">
              <h4 > Stacks</h4>
              <p > Current: {condition.currentStacks} / Max: {condition.maxStacks || 'Unlimited'}</p>
            </div>
          )}
        </div>

        <div className="condition-tracker__modal-actions">
          {!condition.isResolved && (
            <button
              className="condition-tracker__btn condition-tracker__btn--primary"
              onClick={() => {
                onResolve(condition.id);
                onClose();
              }}
            >
              Resolve Condition
            </button>
          )}
          <button
            className="condition-tracker__btn condition-tracker__btn--danger"
            onClick={() => {
              onDelete(condition.id);
              onClose();
            }}
          >
            Delete Condition
          </button>
          <button className="condition-tracker__btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};




