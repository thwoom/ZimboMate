import './AlignmentXPTracker.css';

import React, { useCallback,useEffect, useState } from 'react';

import { Character } from '../models/Character';
import { useCharacter,useGameStore } from '../store/GameStore';
import { AlignmentAction, AlignmentXPConfig } from '../types/XP';

interface AlignmentXPTrackerProps {
  characterId?: string;
  onAlignmentAction?: (action: AlignmentAction) => void;
}

export const AlignmentXPTracker: React.FC < AlignmentXPTrackerProps> = ({
  characterId,
  onAlignmentAction,
}) => {
  const { state } = useGameStore();
  const currentCharacter = useCharacter();
  const [alignmentActions, setAlignmentActions] = useState < AlignmentAction[]>([]);
  const [showActionForm, setShowActionForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState < string>('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionContext, setActionContext] = useState('');
  const [filter, setFilter] = useState < string>('all');
  const [config, setConfig] = useState < AlignmentXPConfig>({
    xpPerAlignmentAction: 1,
    maxAlignmentXPPerSession: 3,
    requireGMApproval: false,
    alignmentActions: {
      'Good': [
        'Defend someone weaker than you',
        'Help someone in need',
        'Sacrifice something for the greater good',
        'Show mercy to an enemy',
        'Protect the innocent',
      ],
      'Neutral': [
        'Maintain balance in a situation',
        'Help someone without taking sides',
        'Make a difficult choice',
        'Find a compromise',
        'Stay true to your word',
      ],
      'Chaotic': [
        'Act on impulse or emotion',
        'Challenge authority or tradition',
        'Create chaos or change',
        'Follow your heart over logic',
        'Break rules for a good cause',
      ],
      'Lawful': [
        'Follow a code or tradition',
        'Maintain order and structure',
        'Keep your promises',
        'Respect authority',
        'Uphold justice',
      ],
    },
  });

  const activeCharacterId = characterId || currentCharacter?.id;
  const activeCharacter = activeCharacterId ? state.characters[activeCharacterId] : undefined;

  // Load alignment actions when character changes
  useEffect(() => {
    if (activeCharacterId) {
      loadAlignmentActions();
    }
  }, [activeCharacterId]);

  const loadAlignmentActions = useCallback(() => {
    // This would typically load from a service
    // For now, we'll use local state
    const actions = JSON.parse(localStorage.getItem(`alignment-actions-${activeCharacterId}`) || '[]');
    setAlignmentActions(actions);
  }, [activeCharacterId]);

  const saveAlignmentActions = useCallback((actions: AlignmentAction[]) => {
    localStorage.setItem(`alignment-actions-${activeCharacterId}`, JSON.stringify(actions));
    setAlignmentActions(actions);
  }, [activeCharacterId]);

  const handleCreateAction = useCallback(() => {
    if (!activeCharacter || !selectedAction || !actionDescription) return;

    const newAction: AlignmentAction = {
      id: `alignment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      characterId: activeCharacter.id,
      alignment: activeCharacter.alignment,
      action: selectedAction,
      description: actionDescription,
      context: actionContext || undefined,
      timestamp: new Date(),
      xpTriggered: true,
      xpAmount: config.xpPerAlignmentAction,
    };

    const updatedActions =  [...alignmentActions, newAction];
    saveAlignmentActions(updatedActions);

    onAlignmentAction?.(newAction);

    // Reset form
    setSelectedAction('');
    setActionDescription('');
    setActionContext('');
    setShowActionForm(false);
  }, [activeCharacter, selectedAction, actionDescription, actionContext, config, alignmentActions, saveAlignmentActions, onAlignmentAction]);

  const handleDeleteAction = useCallback((actionId: string) => {
    if (confirm('Are you sure you want to delete this alignment action?')) {
      const updatedActions = alignmentActions.filter(action => action.id !== actionId);
      saveAlignmentActions(updatedActions);
    }
  }, [alignmentActions, saveAlignmentActions]);

  const getAlignmentActions = (alignment: string) => {
    return config.alignmentActions[alignment] || [];
  };

  const getAlignmentIcon = (alignment: string) => {
    switch (alignment) {
      case 'Good': return '🛡️';
      case 'Neutral': return '⚖️';
      case 'Chaotic': return '🌀';
      case 'Lawful': return '⚜️';
      default: return '❓';
    }
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'Good': return 'alignment-good';
      case 'Neutral': return 'alignment-neutral';
      case 'Chaotic': return 'alignment-chaotic';
      case 'Lawful': return 'alignment-lawful';
      default: return '';
    }
  };

  const filteredActions = alignmentActions.filter(action =>
    filter === 'all' || action.alignment === filter,
  );

  const totalXPEarned = alignmentActions
    .filter(action => action.xpTriggered)
    .reduce((sum, action) => sum + (action.xpAmount || 0), 0);

  const sessionActions = alignmentActions.filter(action => {
    const today = new Date();
    const actionDate = new Date(action.timestamp);
    return actionDate.toDateString() === today.toDateString();
  });

  const sessionXP = sessionActions
    .filter(action => action.xpTriggered)
    .reduce((sum, action) => sum + (action.xpAmount || 0), 0);

  if (!activeCharacterId || !activeCharacter) {
    return (
      <div className="alignment-xp-tracker">
        <div className="alignment-xp-tracker__empty">
          <h3 > No Character Selected</h3>
          <p > Please select a character to view their alignment actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alignment-xp-tracker">
      {/* Header with Stats */}
      <div className="alignment-xp-tracker__header">
        <h2 > Alignment XP Tracker</h2>
        <div className="alignment-xp-tracker__character-info">
          <span className={`alignment-xp-tracker__alignment ${getAlignmentColor(activeCharacter.alignment)}`}>
            {getAlignmentIcon(activeCharacter.alignment)} {activeCharacter.alignment}
          </span>
          <span className="alignment-xp-tracker__name">{activeCharacter.name}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="alignment-xp-tracker__stats">
        <div className="stat">
          <span className="stat__label">Total XP</span>
          <span className="stat__value">{totalXPEarned}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Session XP</span>
          <span className="stat__value">{sessionXP}/{config.maxAlignmentXPPerSession}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Actions</span>
          <span className="stat__value">{alignmentActions.length}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="alignment-xp-tracker__controls">
        <div className="alignment-xp-tracker__filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="alignment-xp-tracker__filter"
            aria-label="Filter alignment actions by alignment type"
          >
            <option value="all">All Alignments</option>
            <option value="Good">Good</option>
            <option value="Neutral">Neutral</option>
            <option value="Chaotic">Chaotic</option>
            <option value="Lawful">Lawful</option>
          </select>
        </div>

        <button
          onClick={() => setShowActionForm(true)}
          className="alignment-xp-tracker__create-btn"
          disabled={sessionXP >= config.maxAlignmentXPPerSession}
        >
          ✨ Log Alignment Action
        </button>
      </div>

      {/* Actions List */}
      <div className="alignment-xp-tracker__content">
        <h3 > Alignment Actions ({filteredActions.length})</h3>

        {filteredActions.length === 0 ? (
          <div className="alignment-xp-tracker__empty">
            <p > No alignment actions logged yet. Log your first action to start earning XP!</p>
          </div>
        ) : (
          <div className="alignment-xp-tracker__actions-list">
            {filteredActions.map(action => (
              <div key={action.id} className="alignment-xp-tracker__action">
                <div className="alignment-xp-tracker__action-header">
                  <span className={`alignment-xp-tracker__action-alignment ${getAlignmentColor(action.alignment)}`}>
                    {getAlignmentIcon(action.alignment)} {action.alignment}
                  </span>
                  <span className="alignment-xp-tracker__action-xp">
                    +{action.xpAmount || 0} XP
                  </span>
                  <div className="alignment-xp-tracker__action-actions">
                    <button
                      onClick={() => handleDeleteAction(action.id)}
                      className="alignment-xp-tracker__action-btn alignment-xp-tracker__action-btn--delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="alignment-xp-tracker__action-content">
                  <div className="alignment-xp-tracker__action-title">
                    {action.action}
                  </div>

                  <div className="alignment-xp-tracker__action-description">
                    {action.description}
                  </div>

                  {action.context && (
                    <div className="alignment-xp-tracker__action-context">
                      <strong > Context:</strong> {action.context}
                    </div>
                  )}
                </div>

                <div className="alignment-xp-tracker__action-meta">
                  <span>{new Date(action.timestamp).toLocaleDateString()}</span>
                  {action.xpTriggered && <span className="alignment-xp-tracker__xp-awarded">✨ XP Awarded</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Action Modal */}
      {showActionForm && (
        <CreateAlignmentActionForm
          character={activeCharacter}
          config={config}
          onCreate={handleCreateAction}
          onCancel={() => setShowActionForm(false)}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
          actionDescription={actionDescription}
          setActionDescription={setActionDescription}
          actionContext={actionContext}
          setActionContext={setActionContext}
        />
      )}
    </div>
  );
};

// Create Alignment Action Form Component
interface CreateAlignmentActionFormProps {
  character: Character;
  config: AlignmentXPConfig;
  onCreate: () => void;
  onCancel: () => void;
  selectedAction: string;
  setSelectedAction: (action: string) => void;
  actionDescription: string;
  setActionDescription: (description: string) => void;
  actionContext: string;
  setActionContext: (context: string) => void;
}

const CreateAlignmentActionForm: React.FC < CreateAlignmentActionFormProps> = ({
  character,
  config,
  onCreate,
  onCancel,
  selectedAction,
  setSelectedAction,
  actionDescription,
  setActionDescription,
  actionContext,
  setActionContext,
}) => {
  const alignmentActions = config.alignmentActions[character.alignment] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAction && actionDescription) {
      onCreate();
    }
  };

  return (
    <div className="alignment-xp-tracker__modal">
      <div className="alignment-xp-tracker__modal-content">
        <h3 > Log Alignment Action</h3>

        <div className="alignment-xp-tracker__character-preview">
          <strong>{character.name}</strong> ({character.alignment})
        </div>

        <form onSubmit={handleSubmit} className="alignment-xp-tracker__form">
          <div className="alignment-xp-tracker__form-group">
            <label > Alignment Action:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              required
              aria-label="Select alignment action to log"
            >
              <option value="">Select an action...</option>
              {alignmentActions.map(action => (
                <option key={action || "No action"} value={action || "No action"}>
                  {action || "No action"}
                </option>
              ))}
            </select>
          </div>

          <div className="alignment-xp-tracker__form-group">
            <label > Description:</label>
            <textarea
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              placeholder="Describe how you performed this alignment action..."
              required
              rows={3}
            />
          </div>

          <div className="alignment-xp-tracker__form-group">
            <label > Context (Optional):</label>
            <textarea
              value={actionContext}
              onChange={(e) => setActionContext(e.target.value)}
              placeholder="What was happening when you performed this action?"
              rows={2}
            />
          </div>

          <div className="alignment-xp-tracker__xp-info">
            <strong > XP Reward:</strong> +{config.xpPerAlignmentAction} XP
          </div>

          <div className="alignment-xp-tracker__form-actions">
            <button type="submit" className="alignment-xp-tracker__btn alignment-xp-tracker__btn--primary">
              Log Action (+{config.xpPerAlignmentAction} XP)
            </button>
            <button type="button" onClick={onCancel} className="alignment-xp-tracker__btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlignmentXPTracker;



