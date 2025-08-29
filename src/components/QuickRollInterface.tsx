import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/GameStore';
import { diceRollingService, DiceRoll, EnhancedDiceRoll } from '../services/DiceRollingService';
import { smartMoveSuggestionService, MoveSuggestion } from '../services/SmartMoveSuggestionService';
import { Character, Attributes } from '../models/Character';
import EnhancedDiceRoller from './EnhancedDiceRoller';
import './QuickRollInterface.css';

interface QuickRollInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
  onRoll?: (roll: DiceRoll) => void;
}

type QuickRollMode = 'stat' | 'move' | 'suggestions' | 'enhanced';

export const QuickRollInterface: React.FC<QuickRollInterfaceProps> = ({
  isVisible,
  onClose,
  onRoll
}) => {
  const { state: gameState } = useGameStore();
  const [mode, setMode] = useState<QuickRollMode>('stat');
  const [selectedStat, setSelectedStat] = useState<keyof Attributes>('STR');
  const [customModifier, setCustomModifier] = useState<number>(0);
  const [advantage, setAdvantage] = useState<boolean>(false);
  const [disadvantage, setDisadvantage] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MoveSuggestion[]>([]);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  // Get active character
  const character = gameState.activeCharacterId ? 
    gameState.characters[gameState.activeCharacterId] : null;

  // Load suggestions when character or description changes
  useEffect(() => {
    if (character && mode === 'suggestions') {
      const newSuggestions = smartMoveSuggestionService.getSuggestions(
        character,
        'unknown',
        diceRollingService.getRecentRolls(5),
        description
      );
      setSuggestions(newSuggestions);
    }
  }, [character, description, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isVisible) return;

      // Number keys for stats
      const statKeys: { [key: string]: keyof Attributes } = {
        '1': 'STR', '2': 'DEX', '3': 'CON', '4': 'INT', '5': 'WIS', '6': 'CHA'
      };

      if (statKeys[e.key]) {
        setSelectedStat(statKeys[e.key]);
        setMode('stat');
        e.preventDefault();
      }

      // Enter to roll
      if (e.key === 'Enter' && !e.shiftKey) {
        handleQuickRoll();
        e.preventDefault();
      }

      // Escape to close
      if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      }

      // Tab to cycle modes
      if (e.key === 'Tab') {
        const modes: QuickRollMode[] = ['stat', 'move', 'suggestions'];
        const currentIndex = modes.indexOf(mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setMode(modes[nextIndex]);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, mode, onClose]);

  const handleQuickRoll = useCallback(() => {
    if (!character) return;

    const roll = diceRollingService.rollStat(
      selectedStat,
      character,
      {
        customModifier,
        description: description || `${selectedStat} roll`,
        advantage,
        disadvantage
      }
    );

    setLastRoll(roll);
    onRoll?.(roll);

    // Reset modifiers after roll
    setAdvantage(false);
    setDisadvantage(false);
    setCustomModifier(0);
  }, [character, selectedStat, customModifier, description, advantage, disadvantage, onRoll]);

  const handleMoveRoll = useCallback((suggestion: MoveSuggestion) => {
    if (!character || !suggestion.move.rollStat) return;

    const roll = diceRollingService.rollMove(
      suggestion.move,
      character,
      {
        customModifier,
        advantage,
        disadvantage
      }
    );

    setLastRoll(roll);
    onRoll?.(roll);

    // Reset modifiers after roll
    setAdvantage(false);
    setDisadvantage(false);
    setCustomModifier(0);
  }, [character, customModifier, advantage, disadvantage, onRoll]);

  const getStatModifier = (statValue: number): number => {
    if (statValue <= 3) return -3;
    if (statValue <= 5) return -2;
    if (statValue <= 8) return -1;
    if (statValue <= 12) return 0;
    if (statValue <= 15) return 1;
    if (statValue <= 17) return 2;
    return 3;
  };

  const getTotalModifier = (): number => {
    if (!character) return 0;
    const statMod = getStatModifier(character.attributes[selectedStat]);
    return statMod + customModifier;
  };

  if (!isVisible) return null;

  return (
    <div className="quick-roll-overlay">
      <div className="quick-roll-interface">
        {/* Header */}
        <div className="quick-roll-header">
          <h3>Quick Roll</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {!character && (
          <div className="no-character-warning">
            <p>No character selected. Please select a character to roll.</p>
          </div>
        )}

        {character && (
          <>
            {/* Mode Tabs */}
            <div className="mode-tabs">
              <button
                className={`mode-tab ${mode === 'stat' ? 'active' : ''}`}
                onClick={() => setMode('stat')}
              >
                📊 Stat Roll
              </button>
              <button
                className={`mode-tab ${mode === 'move' ? 'active' : ''}`}
                onClick={() => setMode('move')}
              >
                📜 Move Roll
              </button>
              <button
                className={`mode-tab ${mode === 'suggestions' ? 'active' : ''}`}
                onClick={() => setMode('suggestions')}
              >
                💡 Suggestions
              </button>
              <button
                className={`mode-tab ${mode === 'enhanced' ? 'active' : ''}`}
                onClick={() => setMode('enhanced')}
              >
                🎲 Enhanced
              </button>
            </div>

            {/* Stat Roll Mode */}
            {mode === 'stat' && (
              <div className="stat-roll-mode">
                <div className="stat-selector">
                  {(Object.keys(character.attributes) as (keyof Attributes)[]).map((stat, index) => {
                    const statValue = character.attributes[stat];
                    const modifier = getStatModifier(statValue);
                    const isSelected = selectedStat === stat;
                    
                    return (
                      <button
                        key={stat}
                        className={`stat-button ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedStat(stat)}
                        title={`${stat}: ${statValue} (${modifier >= 0 ? '+' : ''}${modifier})`}
                      >
                        <span className="stat-name">{stat}</span>
                        <span className="stat-value">{statValue}</span>
                        <span className="stat-modifier">
                          {modifier >= 0 ? '+' : ''}{modifier}
                        </span>
                        <span className="hotkey">({index + 1})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="roll-modifiers">
                  <div className="modifier-input">
                    <label>Custom Modifier:</label>
                    <input
                      type="number"
                      value={customModifier}
                      onChange={(e) => setCustomModifier(parseInt(e.target.value) || 0)}
                      className="modifier-field"
                      aria-label="Custom modifier value"
                    />
                  </div>

                  <div className="advantage-controls">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={advantage}
                        onChange={(e) => {
                          setAdvantage(e.target.checked);
                          if (e.target.checked) setDisadvantage(false);
                        }}
                        aria-label="Roll with advantage"
                      />
                      Advantage (3d6, keep highest 2)
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={disadvantage}
                        onChange={(e) => {
                          setDisadvantage(e.target.checked);
                          if (e.target.checked) setAdvantage(false);
                        }}
                        aria-label="Roll with disadvantage"
                      />
                      Disadvantage (3d6, keep lowest 2)
                    </label>
                  </div>
                </div>

                <div className="description-input">
                  <input
                    type="text"
                    placeholder="Describe what you're doing..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="description-field"
                  />
                </div>

                <div className="roll-preview">
                  <span className="roll-formula">
                    2d6 + {selectedStat} ({getTotalModifier()}) = ?
                  </span>
                  {(advantage || disadvantage) && (
                    <span className="advantage-note">
                      {advantage ? 'with Advantage' : 'with Disadvantage'}
                    </span>
                  )}
                </div>

                <button
                  className="roll-button primary"
                  onClick={handleQuickRoll}
                >
                  🎲 Roll {selectedStat}
                </button>
              </div>
            )}

            {/* Move Suggestions Mode */}
            {mode === 'suggestions' && (
              <div className="suggestions-mode">
                <div className="context-input">
                  <input
                    type="text"
                    placeholder="Describe the situation for better suggestions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="context-field"
                  />
                </div>

                <div className="suggestions-list">
                  {suggestions.length === 0 ? (
                    <p className="no-suggestions">
                      Enter a situation description to get move suggestions.
                    </p>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.move.id}
                        className={`suggestion-item ${suggestion.priority}`}
                      >
                        <div className="suggestion-header">
                          <span className="move-name">{suggestion.move.name}</span>
                          <span className="relevance-score">{suggestion.relevance}%</span>
                        </div>
                        <div className="suggestion-reason">{suggestion.reason}</div>
                        {suggestion.move.rollStat && (
                          <div className="suggestion-stats">
                            <span>Roll + {suggestion.move.rollStat}</span>
                            <span>
                              ({getStatModifier(character.attributes[suggestion.move.rollStat]) >= 0 ? '+' : ''}
                              {getStatModifier(character.attributes[suggestion.move.rollStat])})
                            </span>
                          </div>
                        )}
                        {suggestion.move.rollStat && (
                          <button
                            className="suggestion-roll-button"
                            onClick={() => handleMoveRoll(suggestion)}
                          >
                            🎲 Roll
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Dice Mode */}
            {mode === 'enhanced' && (
              <div className="enhanced-mode">
                <EnhancedDiceRoller
                  compact={true}
                  showHistory={false}
                  onRoll={(enhancedRoll: EnhancedDiceRoll) => {
                    // Convert enhanced roll to legacy format for compatibility
                    const legacyRoll: DiceRoll = {
                      id: enhancedRoll.id,
                      timestamp: enhancedRoll.timestamp,
                      dice: enhancedRoll.results.length === 2 ? 
                        [enhancedRoll.results[0], enhancedRoll.results[1]] as [number, number] :
                        enhancedRoll.results.length === 3 ?
                        [enhancedRoll.results[0], enhancedRoll.results[1], enhancedRoll.results[2]] as [number, number, number] :
                        [enhancedRoll.results[0] || 1, enhancedRoll.results[1] || 1] as [number, number],
                      modifier: enhancedRoll.modifier,
                      total: enhancedRoll.finalResult,
                      result: enhancedRoll.rollResult || (enhancedRoll.success ? 'success' : 'failure'),
                      description: enhancedRoll.description,
                      advantage: enhancedRoll.advantage,
                      disadvantage: enhancedRoll.disadvantage
                    };
                    setLastRoll(legacyRoll);
                    onRoll?.(legacyRoll);
                  }}
                />
              </div>
            )}

            {/* Last Roll Result */}
            {lastRoll && (
              <div className={`last-roll-result ${lastRoll.result}`}>
                <div className="roll-summary">
                  <span className="roll-total">{lastRoll.total}</span>
                  <span className="roll-breakdown">
                    ({Array.isArray(lastRoll.dice) ? lastRoll.dice.join(' + ') : 'N/A'} + {lastRoll.modifier})
                  </span>
                </div>
                <div className={`result-tier ${lastRoll.result}`}>
                  {lastRoll.result === 'success' && '✓ Success! (10+)'}
                  {lastRoll.result === 'partial' && '~ Partial Success (7-9)'}
                  {lastRoll.result === 'failure' && '✗ Miss (6-) - Mark XP'}
                </div>
                {lastRoll.advantage && <div className="advantage-used">Used Advantage</div>}
                {lastRoll.disadvantage && <div className="disadvantage-used">Used Disadvantage</div>}
              </div>
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="keyboard-shortcuts">
              <small>
                <strong>Shortcuts:</strong> 1-6 (select stat), Enter (roll), Tab (switch mode), Esc (close)
              </small>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickRollInterface;
