import React, { useState, useEffect } from 'react';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { useGameStore } from '../../store/GameStore';
import { spellCastingService } from '../../services/SpellCastingService';
import { Spell as ServiceSpell, getSpellsForClass, SpellClass } from '../../services/Spells';
import SpellConsequenceModal from '../../components/SpellConsequenceModal';
import './SpellPanel.css';

interface SpellPanelState {
  selectedCategory: 'all' | 'prepared' | 'available' | 'cantrips';
  searchTerm: string;
  showSpellDetails: boolean;
}

const SpellPanel: React.FC < PanelProps> = ({ id }) => {
  const api = createPanelAPI(id);
  const { state: gameState, updateCharacter } = useGameStore();
  const [panelState, setPanelState] = useState < SpellPanelState>({
    selectedCategory: 'all',
    searchTerm: '',
    showSpellDetails: false,
  });

  const [spellModal, setSpellModal] = useState<{ open: boolean; spell?: ServiceSpell }>({ open: false });

  // Get active character
  const character = gameState.activeCharacterId ?
    gameState.characters[gameState.activeCharacterId] : null;

  // Spellcasting context
  const isCaster = Boolean(character && (character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Immolator'));
  const knownSpells: ServiceSpell[] = character && isCaster ? getSpellsForClass(character.class as SpellClass) : [];
  const preparedIds = (character?.preparedSpells || []);
  const preparedSpells = knownSpells.filter(s => preparedIds.includes(s.id));
  const cantrips = knownSpells.filter(s => s.level === 0);
  const leveledSpells = knownSpells.filter(s => s.level > 0);

  // Calculate spell budget and usage
  const budget = character ? spellCastingService.getPreparationBudget(character) : 0;
  const current = character ? spellCastingService.calculatePreparedLevels(preparedSpells) : 0;
  const hasStrain = character ? (character.conditions || []).includes('spellcasting-strain') : false;

  const levelCost = (spell: ServiceSpell) => spell.level === 0 ? 0 : spell.level;

  const updateState = (updates: Partial < SpellPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }));
  };

  const onTogglePrepare = (spellId: string) => {
    if (!character) return;
    const next = preparedIds.includes(spellId)
      ? preparedIds.filter(id => id !== spellId)
      : [...preparedIds, spellId];
    try {
      const updated = spellCastingService.prepareSpells(character, next);
      (updateCharacter as string)(character.id, { preparedSpells: updated.preparedSpells, conditions: updated.conditions });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const onPrepareSpells = () => {
    if (!character) return;
    // This is the explicit "Prepare Spells" action that clears strain
    const updated = spellCastingService.prepareSpells(character, preparedIds);
    (updateCharacter as string)(character.id, { conditions: updated.conditions });
  };

  const onCommune = () => {
    if (!character) return;
    // This is the explicit "Commune" action that clears strain
    const updated = spellCastingService.prepareSpells(character, preparedIds);
    (updateCharacter as string)(character.id, { conditions: updated.conditions });
  };

  const onCast = (spell: ServiceSpell) => {
    if (!character) return;
    try {
      const { roll, updated, tier } = spellCastingService.castPreparedSpell(character, spell);
      if (tier === '7-9') {
        setSpellModal({ open: true, spell });
        (updateCharacter as string)(character.id, { xp: updated.xp });
      } else {
        (updateCharacter as string)(character.id, { xp: updated.xp });
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const onConsequenceConfirm = (consequence: 'unwelcome-attention' | 'forget' | 'strain') => {
    if (!character || !spellModal.spell) return;
    const updated = spellCastingService.applySevenToNineConsequence(character, spellModal.spell, consequence);
    (updateCharacter as string)(character.id, {
      preparedSpells: updated.preparedSpells,
      conditions: updated.conditions,
    });
    setSpellModal({ open: false });
  };

  const getFilteredSpells = () => {
    let spells = knownSpells;

    // Filter by category
    switch (panelState.selectedCategory) {
      case 'prepared':
        spells = preparedSpells;
        break;
      case 'available':
        spells = leveledSpells.filter(s => !preparedIds.includes(s.id));
        break;
      case 'cantrips':
        spells = cantrips;
        break;
      default:
        spells = knownSpells;
    }

    // Filter by search
    if (panelState.searchTerm) {
      const searchLower = panelState.searchTerm.toLowerCase();
      spells = spells.filter(spell =>
        spell.name.toLowerCase().includes(searchLower) ||
        spell.description.toLowerCase().includes(searchLower),
      );
    }

    return spells;
  };

  if (!character) {
    return (
      <div className="spell-panel">
        <div className="spell-panel__header">
          <h2>✨ Spells</h2>
        </div>
        <div className="no-character">
          <p > No character selected. Create or select a character to manage spells.</p>
        </div>
      </div>
    );
  }

  if (!isCaster) {
    return (
      <div className="spell-panel">
        <div className="spell-panel__header">
          <h2>✨ Spells</h2>
        </div>
        <div className="no-spells">
          <p>{character.name} ({character.class}) does not cast spells.</p>
        </div>
      </div>
    );
  }

  const filteredSpells = getFilteredSpells();

  return (
    <div className="spell-panel">
      <div className="spell-panel__header">
        <h2>✨ Spells</h2>
        <div className="character-info">
          <span className="character-name">{character.name}</span>
          <span className="character-class">({character.class})</span>
        </div>
      </div>

      {/* Spell Budget */}
      <div className="spell-budget">
        <div className="spell-budget__label">
          Prepared levels: {current} / {budget} (cantrips / rotes don't count)
        </div>
        <div className="spell-budget__bar" aria-label={`Prepared ${current} of ${budget}`}>
          <div
            className="spell-budget__fill"
            style={{ width: `${Math.min(100, (current / Math.max(1, budget)) * 100)}%` }}
          />
        </div>
        <div className="spell-budget__details">
          <span > Level {character.level} + 1 = {budget} total levels</span>
        </div>
      </div>

      {/* Spellcasting Status and Actions */}
      <div className="spell-status-section">
        {hasStrain && (
          <div className="strain-warning">
            <span className="strain-icon">⚠️</span>
            <span className="strain-text">You have spellcasting strain (-1 ongoing to Cast a Spell)</span>
          </div>
        )}

        <div className="spell-actions-bar">
          {character.class === 'Wizard' && (
            <button
              className={`action-button primary-action ${hasStrain ? 'clear-strain' : ''}`}
              onClick={onPrepareSpells}
              title={hasStrain ? 'Prepare Spells-This will clear your spellcasting strain' : 'Prepare Spells-Refresh your spell preparation'}
            >
              {hasStrain ? '🔮 Prepare Spells (Clear Strain)' : '🔮 Prepare Spells'}
            </button>
          )}

          {character.class === 'Cleric' && (
            <button
              className={`action-button primary-action ${hasStrain ? 'clear-strain' : ''}`}
              onClick={onCommune}
              title={hasStrain ? 'Commune-This will clear your spellcasting strain' : 'Commune-Refresh your granted spells'}
            >
              {hasStrain ? '🙏 Commune (Clear Strain)' : '🙏 Commune'}
            </button>
          )}

          {character.class === 'Immolator' && (
            <button
              className={`action-button primary-action ${hasStrain ? 'clear-strain' : ''}`}
              onClick={onPrepareSpells}
              title={hasStrain ? 'Prepare Spells-This will clear your spellcasting strain' : 'Prepare Spells-Refresh your spell preparation'}
            >
              {hasStrain ? '🔥 Prepare Spells (Clear Strain)' : '🔥 Prepare Spells'}
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="spell-panel__controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search spells..."
            value={panelState.searchTerm}
            onChange={(e) => updateState({ searchTerm: e.target.value })}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {(['all', 'prepared', 'available', 'cantrips'] as const).map(category => (
            <button
              key={category}
              className={`category-button ${panelState.selectedCategory === category ? 'active' : ''}`}
              onClick={() => updateState({ selectedCategory: category })}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Spell List */}
      <div className="spell-list">
        {filteredSpells.length === 0 ? (
          <div className="no-spells-found">
            <p > No spells found matching your criteria.</p>
          </div>
        ) : (
          filteredSpells.map(spell => {
            const isPrepared = preparedIds.includes(spell.id);
            const wouldExceed = !isPrepared && (current + levelCost(spell) > budget);
            const prepareDisabled = !isPrepared && wouldExceed;
            const prepareTitle = prepareDisabled
              ? `Preparing this would exceed your budget (${current}+${levelCost(spell)} > ${budget})`
              : undefined;
            const castDisabled = spell.level !== 0 && !isPrepared;
            const castTitle = castDisabled
              ? 'You must prepare this spell before casting (DW rule)'
              : undefined;

            return (
              <div key={spell.id} className={`spell-card ${isPrepared ? 'prepared' : ''}`}>
                <div className="spell-header">
                  <div className="spell-name">{spell.name}</div>
                  <div className="spell-level">
                    {spell.level === 0 ? 'Cantrip / Rote' : `Level ${spell.level}`}
                  </div>
                </div>

                <div className="spell-description">{spell.description}</div>

                <div className="spell-actions">
                  <button
                    className={`action-button prepare-button ${isPrepared ? 'prepared' : ''}`}
                    onClick={() => !prepareDisabled && onTogglePrepare(spell.id)}
                    disabled={prepareDisabled}
                    title={prepareTitle}
                  >
                    {isPrepared ? '✓ Prepared' : 'Prepare'}
                  </button>

                  <button
                    className="action-button cast-button"
                    onClick={() => onCast(spell)}
                    disabled={castDisabled}
                    title={castTitle}
                  >
                    Cast
                  </button>
                </div>

                {isPrepared && (
                  <div className="spell-status">
                    <span className="status-badge prepared">Prepared</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Spell Consequence Modal */}
      <SpellConsequenceModal
        isOpen={spellModal.open}
        spellName={spellModal.spell?.name || ''}
        casterClass={character.class as 'Wizard' | 'Cleric'}
        onConfirm={onConsequenceConfirm}
        onCancel={() => setSpellModal({ open: false })}
      />
    </div>
  );
};

export default createPanel(
  {
    id: 'spells',
    name: 'Spells',
    icon: '✨',
    description: 'Manage spell preparation and casting',
    priority: 4,
  },
  SpellPanel,
);
