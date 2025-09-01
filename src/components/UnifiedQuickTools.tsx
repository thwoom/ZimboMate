import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/GameStore';
import { diceRollingService, DiceRoll } from '../services/DiceRollingService';
import { smartMoveSuggestionService, MoveSuggestion } from '../services/SmartMoveSuggestionService';
import { rollAnalyticsService } from '../services/RollAnalyticsService';
import { ExportImportPanel } from './ExportImportPanel';
import { Attributes } from '../models/Character';
import { panelEventBus } from '../framework/PanelAPI';
import './UnifiedQuickTools.css';

interface UnifiedQuickToolsProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

type ToolMode = 'collapsed' | 'quick' | 'advanced' | 'suggestions' | 'history' | 'export-import';
type QuickAction = 'stat-roll' | 'move-suggestion' | 'notes' | 'counters';

interface Counter {
  id: string;
  name: string;
  value: number;
  max?: number;
  color?: string;
}

interface QuickNote {
  id: string;
  text: string;
  timestamp: number;
  tags?: string[];
}

export const UnifiedQuickTools: React.FC < UnifiedQuickToolsProps> = ({
  position = 'bottom-right',
  className = '',
}) => {
  const { state: gameState, updateCharacter, updateGameState } = useGameStore();
  const [mode, setMode] = useState < ToolMode>('collapsed');
  const [selectedStat, setSelectedStat] = useState < keyof Attributes>('STR');
  const [customModifier, setCustomModifier] = useState < number>(0);
  const [advantage, setAdvantage] = useState < boolean>(false);
  const [disadvantage, setDisadvantage] = useState < boolean>(false);
  const [description, setDescription] = useState < string>('');
  const [recentRolls, setRecentRolls] = useState < DiceRoll[]>([]);
  const [suggestions, setSuggestions] = useState < MoveSuggestion[]>([]);
  const [counters, setCounters] = useState < Counter[]>([
    { id: 'hold', name: 'Hold', value: 0, max: 3, color: '#4299e1' },
    { id: 'forward', name: 'Forward', value: 0, max: 3, color: '#48bb78' },
    { id: 'ongoing', name: 'Ongoing', value: 0, color: '#ed8936' },
  ]);
  const [quickNotes, setQuickNotes] = useState < QuickNote[]>([]);
  const [currentNote, setCurrentNote] = useState < string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [contextualAction, setContextualAction] = useState < QuickAction | null>(null);

  const toolsRef = useRef < HTMLDivElement>(null);

  // Get active character
  const character = gameState.activeCharacterId ?
    gameState.characters[gameState.activeCharacterId] : null;

  // Update recent rolls and suggestions
  useEffect(() => {
    const updateData = () => {
      setRecentRolls(diceRollingService.getRecentRolls(5));

      if (character && description) {
        const newSuggestions = smartMoveSuggestionService.getSuggestions(
          character,
          'unknown',
          diceRollingService.getRecentRolls(3),
          description,
        );
        setSuggestions(newSuggestions.slice(0, 3)); // Top 3 suggestions
      }
    };

    updateData();
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, [character, description]);

  // Detect contextual actions based on current panel
  useEffect(() => {
    const unsubscribe = panelEventBus.on('panel-activated', (event) => {
      const panelId = event.data.panelId;

      // Suggest contextual actions based on active panel
      switch (panelId) {
        case 'moves':
          setContextualAction('move-suggestion');
          break;
        case 'character-stats':
          setContextualAction('stat-roll');
          break;
        case 'session-tools':
          setContextualAction('counters');
          break;
        case 'lore-journal':
          setContextualAction('notes');
          break;
        default:
          setContextualAction(null);
      }
    });

    return unsubscribe;
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl / Cmd + D to toggle quick tools
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setMode(prev => prev === 'collapsed' ? 'quick' : 'collapsed');
      }

      // Quick stat rolls when tools are open
      if (mode !== 'collapsed') {
        const statKeys: { [key: string]: keyof Attributes } = {
          '1': 'STR', '2': 'DEX', '3': 'CON', '4': 'INT', '5': 'WIS', '6': 'CHA',
        };

        if (statKeys[e.key] && character) {
          e.preventDefault();
          if (mode === 'quick') {
            // In quick mode, immediately roll the stat
            handleQuickStatRoll(statKeys[e.key]);
          } else {
            // In other modes, just select the stat
            setSelectedStat(statKeys[e.key]);
          }
        }

        // Enter to roll selected stat
        if (e.key === 'Enter' && character) {
          e.preventDefault();
          handleQuickStatRoll(selectedStat);
        }

        // Escape to collapse or go back to quick mode
        if (e.key === 'Escape') {
          e.preventDefault();
          if (mode === 'quick') {
            setMode('collapsed');
          } else {
            setMode('quick'); // Go back to quick mode first, then collapse
          }
        }

        // Backspace to go back to quick mode
        if (e.key === 'Backspace' && mode !== 'quick') {
          e.preventDefault();
          setMode('quick');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, selectedStat, character]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        if (mode !== 'collapsed') {
          setMode('collapsed');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode]);

  const handleQuickStatRoll = useCallback((stat: keyof Attributes) => {
    if (!character) return;

    const roll = diceRollingService.rollStat(stat, character, {
      customModifier,
      description: description || `${stat} roll`,
      advantage,
      disadvantage,
    });

    handleRollResult(roll);

    // Reset modifiers after roll
    setAdvantage(false);
    setDisadvantage(false);
    setCustomModifier(0);
    setDescription('');
  }, [character, customModifier, description, advantage, disadvantage]);

  const handleMoveRoll = useCallback((suggestion: MoveSuggestion) => {
    if (!character || !suggestion.move.rollStat) return;

    const roll = diceRollingService.rollMove(suggestion.move, character, {
      customModifier,
      advantage,
      disadvantage,
    });

    handleRollResult(roll);
  }, [character, customModifier, advantage, disadvantage]);

  const handleRollResult = (roll: DiceRoll) => {
    // Animate
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    // Analytics
    rollAnalyticsService.recordRoll(roll);

    // XP handling
    if (diceRollingService.grantsXP(roll) && character && roll.result === 'failure') {
      const newXP = (character.xp || 0) + 1;
      updateCharacter(character.id, { xp: newXP });
    }

    // Update recent rolls
    setRecentRolls(diceRollingService.getRecentRolls(5));

    // Auto-switch to history mode briefly to show result
    if (mode === 'quick') {
      setMode('history');
      setTimeout(() => setMode('quick'), 3000);
    }
  };

  const updateCounter = (id: string, delta: number) => {
    setCounters(prev => prev.map(counter =>
      counter.id === id
        ? { ...counter, value: Math.max(0, Math.min(counter.max || 99, counter.value + delta)) }
        : counter,
    ));
  };

  const addQuickNote = () => {
    if (!currentNote.trim()) return;

    const note: QuickNote = {
      id: Date.now().toString(),
      text: currentNote.trim(),
      timestamp: Date.now(),
    };

    setQuickNotes(prev => [note, ...prev.slice(0, 9)]); // Keep last 10 notes
    setCurrentNote('');
  };

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left': return 'unified-tools-bottom-left';
      case 'top-right': return 'unified-tools-top-right';
      case 'top-left': return 'unified-tools-top-left';
      default: return 'unified-tools-bottom-right';
    }
  };

  const getStatModifier = (statValue: number): number => {
    if (statValue <= 3) return-3;
    if (statValue <= 5) return-2;
    if (statValue <= 8) return-1;
    if (statValue <= 12) return 0;
    if (statValue <= 15) return 1;
    if (statValue <= 17) return 2;
    return 3;
  };

  const renderCollapsedMode = () => (
    <div className="tools-collapsed">
      <button
        className={`main-tool-button ${isAnimating ? 'animating' : ''} ${!character ? 'disabled' : ''}`}
        onClick={() => setMode('quick')}
        disabled={!character}
        title={character ? 'Quick Tools (Ctrl + D)' : 'No character selected'}
      >
        <span className="tool-icon">🎲</span>
        {recentRolls.length > 0 && (
          <div className={`last-roll-badge ${recentRolls[0].result}`}>
            {recentRolls[0].total}
          </div>
        )}
        {contextualAction && (
          <div className="contextual-hint">
            {contextualAction === 'stat-roll' && '📊'}
            {contextualAction === 'move-suggestion' && '📜'}
            {contextualAction === 'notes' && '📝'}
            {contextualAction === 'counters' && '🔢'}
          </div>
        )}
      </button>
    </div>
  );

  // Shared header for all expanded modes
  const renderToolsHeader = () => (
    <div className="tools-header">
      <div className="header-left">
        {mode !== 'quick' && (
          <button
            className="back-btn"
            onClick={() => setMode('quick')}
            title="Back to Quick Tools (Backspace)"
          >
            ← Back
          </button>
        )}
        <h3 > Quick Tools
          {mode !== 'quick' && (
            <span className="mode-indicator">
              {mode === 'advanced' && '-Advanced'}
              {mode === 'suggestions' && '-Suggestions'}
              {mode === 'history' && '-History'}
              {mode === 'export-import' && '-Export / Import'}
            </span>
          )}
        </h3>
      </div>
      <div className="mode-switchers">
        <button
          className={`mode-btn ${mode === 'quick' ? 'active' : ''}`}
          onClick={() => setMode('quick')}
          title="Quick actions"
        >
          ⚡
        </button>
        <button
          className={`mode-btn ${mode === 'advanced' ? 'active' : ''}`}
          onClick={() => setMode('advanced')}
          title="Advanced options"
        >
          🔧
        </button>
        <button
          className={`mode-btn ${mode === 'suggestions' ? 'active' : ''}`}
          onClick={() => setMode('suggestions')}
          title="Move suggestions"
        >
          💡
        </button>
        <button
          className={`mode-btn ${mode === 'history' ? 'active' : ''}`}
          onClick={() => setMode('history')}
          title="Roll history"
        >
          📊
        </button>
        <button
          className={`mode-btn ${mode === 'export-import' ? 'active' : ''}`}
          onClick={() => setMode('export-import')}
          title="Export / Import"
        >
          💾
        </button>
        <button
          className="close-btn"
          onClick={() => setMode('collapsed')}
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>
    </div>
  );

  const renderQuickMode = () => (
    <div className="tools-quick">

      {character && (
        <div className="character-info">
          <span className="character-name">{character.name}</span>
          <span className="character-xp">XP: {character.xp || 0}</span>
        </div>
      )}

      <div className="quick-stats">
        {character && (Object.keys(character.attributes) as (keyof Attributes)[]).map((stat, index) => {
          const statValue = character.attributes[stat];
          const modifier = getStatModifier(statValue);

          return (
            <button
              key={stat}
              className="stat-quick-btn"
              onClick={() => handleQuickStatRoll(stat)}
              title={`${stat}: ${statValue} (${modifier >= 0 ? '+' : ''}${modifier})-Press ${index + 1}`}
            >
              <span className="stat-name">{stat}</span>
              <span className="stat-mod">{modifier >= 0 ? '+' : ''}{modifier}</span>
              <span className="hotkey">{index + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="quick-counters">
        {counters.map(counter => (
          <div key={counter.id} className="counter-quick">
            <span className="counter-name">{counter.name}</span>
            <div className="counter-controls">
              <button onClick={() => updateCounter(counter.id, -1)}>−</button>
              <span className={`counter-value counter-${counter.id}`}>
                {counter.value}{counter.max ? `/${counter.max}` : ''}
              </span>
              <button onClick={() => updateCounter(counter.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-note-input">
        <input
          type="text"
          placeholder="Quick note..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addQuickNote()}
          aria-label="Quick note input"
        />
        <button onClick={addQuickNote} disabled={!currentNote.trim()}>+</button>
      </div>
    </div>
  );

  const renderAdvancedMode = () => (
    <div className="tools-advanced">
      <div className="advanced-roll-setup">
        <div className="description-input">
          <input
            type="text"
            placeholder="Describe what you're doing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="stat-selector">
          <label > Stat to Roll:</label>
          <div className="stat-selector-buttons">
            {character && (Object.keys(character.attributes) as (keyof Attributes)[]).map((stat) => {
              const statValue = character.attributes[stat];
              const modifier = getStatModifier(statValue);

              return (
                <button
                  key={stat}
                  className={`stat-selector-btn ${selectedStat === stat ? 'selected' : ''}`}
                  onClick={() => setSelectedStat(stat)}
                  title={`${stat}: ${statValue} (${modifier >= 0 ? '+' : ''}${modifier})`}
                >
                  <span className="stat-name">{stat}</span>
                  <span className="stat-mod">{modifier >= 0 ? '+' : ''}{modifier}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="modifiers-row">
          <div className="modifier-input">
            <label > Modifier:</label>
            <input
              type="number"
              value={customModifier}
              onChange={(e) => setCustomModifier(parseInt(e.target.value) || 0)}
              aria-label="Custom roll modifier"
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={advantage}
              onChange={(e) => {
                setAdvantage(e.target.checked);
                if (e.target.checked) setDisadvantage(false);
              }}
            />
            Advantage
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={disadvantage}
              onChange={(e) => {
                setDisadvantage(e.target.checked);
                if (e.target.checked) setAdvantage(false);
              }}
            />
            Disadvantage
          </label>
        </div>

        <button
          className="advanced-roll-btn"
          onClick={() => handleQuickStatRoll(selectedStat)}
          disabled={!character}
        >
          🎲 Roll {selectedStat} {customModifier !== 0 && `(${customModifier >= 0 ? '+' : ''}${customModifier})`}
        </button>
      </div>
    </div>
  );

  const renderSuggestionsMode = () => (
    <div className="tools-suggestions">
      {suggestions.length === 0 ? (
        <p className="no-suggestions">Enter a description for move suggestions</p>
      ) : (
        <div className="suggestions-list">
          {suggestions.map(suggestion => (
            <div key={suggestion.move.id} className="suggestion-item">
              <div className="suggestion-header">
                <span className="move-name">{suggestion.move.name}</span>
                <span className="relevance">{suggestion.relevance}%</span>
              </div>
              <div className="suggestion-reason">{suggestion.reason}</div>
              {suggestion.move.rollStat && (
                <button
                  className="suggestion-roll-btn"
                  onClick={() => handleMoveRoll(suggestion)}
                >
                  Roll +{suggestion.move.rollStat}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistoryMode = () => (
    <div className="tools-history">
      <div className="recent-rolls">
        {recentRolls.length === 0 ? (
          <p className="no-rolls">No recent rolls</p>
        ) : (
          recentRolls.map(roll => (
            <div key={roll.id} className={`roll-item ${roll.result}`}>
              <div className="roll-header">
                <span className="roll-desc">{roll.description}</span>
                <span className="roll-time">
                  {new Date(roll.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="roll-result">
                <span className="roll-total">{roll.total}</span>
                <span className="roll-breakdown">
                  ({Array.isArray(roll.dice) ? roll.dice.join('+') : 'N / A'} {roll.modifier >= 0 ? '+' : ''}{roll.modifier})
                </span>
                <span className={`result-badge ${roll.result}`}>
                  {roll.result === 'success' && '✓'}
                  {roll.result === 'partial' && '~'}
                  {roll.result === 'failure' && '✗'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="recent-notes">
        <h4 > Recent Notes</h4>
        {quickNotes.length === 0 ? (
          <p className="no-notes">No notes yet</p>
        ) : (
          quickNotes.slice(0, 3).map(note => (
            <div key={note.id} className="note-item">
              <div className="note-text">{note.text}</div>
              <div className="note-time">
                {new Date(note.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Export / Import mode
  const renderExportImportMode = () => (
    <div className="tools-export-import">
      <ExportImportPanel
        gameState={gameState}
        onImport={updateGameState}
      />
    </div>
  );

  // Shared keyboard shortcuts help
  const renderKeyboardShortcuts = () => (
    <div className="keyboard-shortcuts">
      <small>
        <strong > Shortcuts:</strong>
        {mode !== 'quick' && ' Backspace (back), '}
        Esc (close), Ctrl + D (toggle)
        {mode === 'quick' && ', 1-6 (quick roll)'}
        {mode === 'advanced' && ', 1-6 (select stat), Enter (roll)'}
      </small>
    </div>
  );

  return (
    <div
      ref={toolsRef}
      className={`unified-quick - tools ${getPositionClass()} ${className} mode-${mode}`}
    >
      {mode === 'collapsed' && renderCollapsedMode()}
      {mode !== 'collapsed' && (
        <>
          {renderToolsHeader()}
          {mode === 'quick' && renderQuickMode()}
          {mode === 'advanced' && renderAdvancedMode()}
          {mode === 'suggestions' && renderSuggestionsMode()}
          {mode === 'history' && renderHistoryMode()}
          {mode === 'export-import' && renderExportImportMode()}
          {renderKeyboardShortcuts()}
        </>
      )}
    </div>
  );
};

export default UnifiedQuickTools;
