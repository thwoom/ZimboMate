import React, { useState, useEffect, useCallback } from 'react';
import { bondService } from '../services/BondService';
import { Bond, BondStatus, BondResolutionType } from '../types/Bond';
import { Character } from '../models/Character';
import { useGameStore, useCharacter } from '../store/GameStore';
import './BondTracker.css';

interface BondTrackerProps {
  characterId?: string;
  onBondResolved?: (bondId: string, xpGained: number) => void;
}

export const BondTracker: React.FC < BondTrackerProps> = ({
  characterId,
  onBondResolved,
}) => {
  const { state } = useGameStore();
  const currentCharacter = useCharacter();
  const [bonds, setBonds] = useState < Bond[]>([]);
  const [targetBonds, setTargetBonds] = useState < Bond[]>([]);
  const [selectedBond, setSelectedBond] = useState < Bond | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [filter, setFilter] = useState < BondStatus | 'all'>('all');
  const [bondStats, setBondStats] = useState < unknown>(null);

  const activeCharacterId = characterId || currentCharacter?.id;

  // Load bonds when character changes
  useEffect(() => {
    if (activeCharacterId) {
      loadBonds();
      loadBondStats();
    }
  }, [activeCharacterId]);

  const loadBonds = useCallback(() => {
    if (!activeCharacterId) return;

    const characterBonds = bondService.getBondsForCharacter(activeCharacterId);
    const targetingBonds = bondService.getBondsTargetingCharacter(activeCharacterId);

    setBonds(characterBonds);
    setTargetBonds(targetingBonds);
  }, [activeCharacterId]);

  const loadBondStats = useCallback(() => {
    if (!activeCharacterId) return;

    const stats = bondService.getBondStats(activeCharacterId);
    setBondStats(stats);
  }, [activeCharacterId]);

  const handleCreateBond = useCallback((targetCharacterId: string, description: string, template?: unknown) => {
    if (!activeCharacterId) return;

    const newBond = bondService.createBond(activeCharacterId, targetCharacterId, description, template);
    loadBonds();
    setShowCreateForm(false);
  }, [activeCharacterId, loadBonds]);

  const handleResolveBond = useCallback((bondId: string, resolution: unknown) => {
    const xpTrigger = bondService.resolveBond(bondId, resolution);
    if (xpTrigger) {
      onBondResolved?.(bondId, xpTrigger.amount);
    }
    loadBonds();
    loadBondStats();
    setShowResolveForm(false);
    setSelectedBond(null);
  }, [loadBonds, loadBondStats, onBondResolved]);

  const handleDeleteBond = useCallback((bondId: string) => {
    if (confirm('Are you sure you want to delete this bond?')) {
      bondService.deleteBond(bondId);
      loadBonds();
      loadBondStats();
    }
  }, [loadBonds, loadBondStats]);

  const filteredBonds = bonds.filter(bond =>
    filter === 'all' || bond.status === filter,
  );

  const getCharacterName = (characterId: string) => {
    const character = state.characters[characterId];
    return character?.name || 'Unknown Character';
  };

  const getStatusColor = (status: BondStatus) => {
    switch (status) {
      case BondStatus.ACTIVE: return 'status-active';
      case BondStatus.RESOLVED: return 'status-resolved';
      case BondStatus.BROKEN: return 'status-broken';
      default: return '';
    }
  };

  const getStatusIcon = (status: BondStatus) => {
    switch (status) {
      case BondStatus.ACTIVE: return '🔗';
      case BondStatus.RESOLVED: return '✅';
      case BondStatus.BROKEN: return '❌';
      default: return '❓';
    }
  };

  if (!activeCharacterId) {
    return (
      <div className="bond-tracker">
        <div className="bond-tracker__empty">
          <h3 > No Character Selected</h3>
          <p > Please select a character to view their bonds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bond-tracker">
      {/* Header with Stats */}
      <div className="bond-tracker__header">
        <h2 > Bond Tracker</h2>
        {bondStats && (
          <div className="bond-tracker__stats">
            <div className="stat">
              <span className="stat__label">Active Bonds:</span>
              <span className="stat__value">{bondStats.activeBonds}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Resolved:</span>
              <span className="stat__value">{bondStats.resolvedBonds}</span>
            </div>
            <div className="stat">
              <span className="stat__label">Total XP:</span>
              <span className="stat__value">{bondStats.totalXPEarned}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bond-tracker__controls">
        <div className="bond-tracker__filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BondStatus | 'all')}
            className="bond-tracker__filter"
          >
            <option value="all">All Bonds</option>
            <option value={BondStatus.ACTIVE}>Active</option>
            <option value={BondStatus.RESOLVED}>Resolved</option>
            <option value={BondStatus.BROKEN}>Broken</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bond-tracker__create-btn"
          disabled={bonds.length >= 3}
        >
          ✨ Create Bond
        </button>
      </div>

      {/* Bonds List */}
      <div className="bond-tracker__content">
        <div className="bond-tracker__bonds">
          <h3 > My Bonds ({filteredBonds.length})</h3>

          {filteredBonds.length === 0 ? (
            <div className="bond-tracker__empty">
              <p > No bonds found. Create your first bond to start earning XP!</p>
            </div>
          ) : (
            <div className="bond-tracker__bonds-list">
              {filteredBonds.map(bond => (
                <div key={bond.id} className="bond-tracker__bond">
                  <div className="bond-tracker__bond-header">
                    <span className={`bond-tracker__status ${getStatusColor(bond.status)}`}>
                      {getStatusIcon(bond.status)}
                    </span>
                    <span className="bond-tracker__target">
                      {getCharacterName(bond.targetCharacterId)}
                    </span>
                    <div className="bond-tracker__bond-actions">
                      {bond.status === BondStatus.ACTIVE && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBond(bond);
                              setShowResolveForm(true);
                            }}
                            className="bond-tracker__action-btn bond-tracker__action-btn--resolve"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleDeleteBond(bond.id)}
                            className="bond-tracker__action-btn bond-tracker__action-btn--delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bond-tracker__bond-description">
                    {bond.description}
                  </div>

                  {bond.notes && (
                    <div className="bond-tracker__bond-notes">
                      <strong > Notes:</strong> {bond.notes}
                    </div>
                  )}

                  {bond.tags.length > 0 && (
                    <div className="bond-tracker__bond-tags">
                      {bond.tags.map(tag => (
                        <span key={tag} className="bond-tracker__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bond-tracker__bond-meta">
                    <span > Created: {bond.createdAt.toLocaleDateString()}</span>
                    {bond.resolvedAt && (
                      <span > Resolved: {bond.resolvedAt.toLocaleDateString()}</span>
                    )}
                    {bond.xpAwarded && <span className="bond-tracker__xp-awarded">✨ XP Awarded</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bonds Targeting This Character */}
        {targetBonds.length > 0 && (
          <div className="bond-tracker__targeting">
            <h3 > Bonds Targeting Me ({targetBonds.length})</h3>
            <div className="bond-tracker__bonds-list">
              {targetBonds.map(bond => (
                <div key={bond.id} className="bond-tracker__bond bond-tracker__bond--targeting">
                  <div className="bond-tracker__bond-header">
                    <span className={`bond-tracker__status ${getStatusColor(bond.status)}`}>
                      {getStatusIcon(bond.status)}
                    </span>
                    <span className="bond-tracker__target">
                      {getCharacterName(bond.characterId)} → Me
                    </span>
                  </div>

                  <div className="bond-tracker__bond-description">
                    {bond.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Bond Modal */}
      {showCreateForm && (
        <CreateBondForm
          characterId={activeCharacterId}
          characters={state.characters}
          onCreate={handleCreateBond}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Resolve Bond Modal */}
      {showResolveForm && selectedBond && (
        <ResolveBondForm
          bond={selectedBond}
          onResolve={handleResolveBond}
          onCancel={() => {
            setShowResolveForm(false);
            setSelectedBond(null);
          }}
        />
      )}
    </div>
  );
};

// Create Bond Form Component
interface CreateBondFormProps {
  characterId: string;
  characters: { [key: string]: Character };
  onCreate: (targetCharacterId: string, description: string, template?: unknown) => void;
  onCancel: () => void;
}

const CreateBondForm: React.FC < CreateBondFormProps> = ({
  characterId,
  characters,
  onCreate,
  onCancel,
}) => {
  const [targetCharacterId, setTargetCharacterId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState < unknown>(null);
  const [templates, setTemplates] = useState < unknown[]>([]);

  useEffect(() => {
    const character = characters[characterId];
    if (character) {
      const availableTemplates = bondService.getBondTemplates(character.class);
      setTemplates(availableTemplates);
    }
  }, [characterId, characters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetCharacterId && description) {
      onCreate(targetCharacterId, description, selectedTemplate);
    }
  };

  const handleTemplateSelect = (template: unknown) => {
    setSelectedTemplate(template);
    setDescription(template.description);
  };

  const availableTargets = Object.values(characters).filter(c => c.id !== characterId);

  return (
    <div className="bond-tracker__modal">
      <div className="bond-tracker__modal-content">
        <h3 > Create New Bond</h3>

        <form onSubmit={handleSubmit} className="bond-tracker__form">
          <div className="bond-tracker__form-group">
            <label > Target Character:</label>
            <select
              value={targetCharacterId}
              onChange={(e) => setTargetCharacterId(e.target.value)}
              required
            >
              <option value="">Select a character...</option>
              {availableTargets.map(char => (
                <option key={char.id} value={char.id}>
                  {char.name} ({char.class})
                </option>
              ))}
            </select>
          </div>

          <div className="bond-tracker__form-group">
            <label > Bond Template (Optional):</label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setSelectedTemplate(template || null);
              }}
            >
              <option value="">Custom bond...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="bond-tracker__template-info">
              <h4>{selectedTemplate.name}</h4>
              <p>{selectedTemplate.description}</p>
              <p><strong > XP Trigger:</strong> {selectedTemplate.xpTrigger}</p>
            </div>
          )}

          <div className="bond-tracker__form-group">
            <label > Bond Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the bond between your characters..."
              required
              rows={3}
            />
          </div>

          <div className="bond-tracker__form-actions">
            <button type="submit" className="bond-tracker__btn bond-tracker__btn--primary">
              Create Bond
            </button>
            <button type="button" onClick={onCancel} className="bond-tracker__btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Resolve Bond Form Component
interface ResolveBondFormProps {
  bond: Bond;
  onResolve: (bondId: string, resolution: unknown) => void;
  onCancel: () => void;
}

const ResolveBondForm: React.FC < ResolveBondFormProps> = ({ bond, onResolve, onCancel }) => {
  const [resolutionType, setResolutionType] = useState < BondResolutionType>(BondResolutionType.FULFILLED);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description) {
      onResolve(bond.id, {
        type: resolutionType,
        description,
        timestamp: new Date(),
        xpAwarded: true,
        notes: notes || undefined,
      });
    }
  };

  return (
    <div className="bond-tracker__modal">
      <div className="bond-tracker__modal-content">
        <h3 > Resolve Bond</h3>

        <div className="bond-tracker__bond-preview">
          <strong > Bond:</strong> {bond.description}
        </div>

        <form onSubmit={handleSubmit} className="bond-tracker__form">
          <div className="bond-tracker__form-group">
            <label > Resolution Type:</label>
            <select
              value={resolutionType}
              onChange={(e) => setResolutionType(e.target.value as BondResolutionType)}
            >
              <option value={BondResolutionType.FULFILLED}>Fulfilled</option>
              <option value={BondResolutionType.BROKEN}>Broken</option>
              <option value={BondResolutionType.CHANGED}>Changed</option>
              <option value={BondResolutionType.COMPLETED}>Completed</option>
            </select>
          </div>

          <div className="bond-tracker__form-group">
            <label > Resolution Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how this bond was resolved..."
              required
              rows={3}
            />
          </div>

          <div className="bond-tracker__form-group">
            <label > Notes (Optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the resolution..."
              rows={2}
            />
          </div>

          <div className="bond-tracker__form-actions">
            <button type="submit" className="bond-tracker__btn bond-tracker__btn--primary">
              Resolve Bond (+1 XP)
            </button>
            <button type="button" onClick={onCancel} className="bond-tracker__btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BondTracker;
