import React, { useState, useEffect } from 'react';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { useGameStore } from '../../store/GameStore';
import { Move, BASIC_MOVES, SPECIAL_MOVES } from '../../models/Move';
import { DiceRoll, diceRollingService, EnhancedDiceRoll } from '../../services/DiceRollingService';
import { rollAnalyticsService, RollInsight } from '../../services/RollAnalyticsService';
import { smartMoveSuggestionService, MoveSuggestion } from '../../services/SmartMoveSuggestionService';
import { characterStateService } from '../../services/CharacterStateService';
import MoveCard from '../../components/MoveCard';
import EnhancedDiceRoller from '../../components/EnhancedDiceRoller';
import './MovesPanel.css';

interface MovesPanelState {
  selectedCategory: 'all' | 'basic' | 'class' | 'advanced' | 'master' | 'special';
  searchTerm: string;
  showRollHistory: boolean;
  showSuggestions: boolean;
  showInsights: boolean;
  showEnhancedDice: boolean;
  expandedMoves: Set<string>;
  contextDescription: string;
}

const MovesPanel: React.FC<PanelProps> = ({ id }) => {
  const api = createPanelAPI(id);
  const { state: gameState, updateCharacter } = useGameStore();
  const [panelState, setPanelState] = useState<MovesPanelState>({
    selectedCategory: 'all',
    searchTerm: '',
    showRollHistory: false,
    showSuggestions: true,
    showInsights: false,
    showEnhancedDice: true,
    expandedMoves: new Set(),
    contextDescription: ''
  });

  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [suggestions, setSuggestions] = useState<MoveSuggestion[]>([]);
  const [insights, setInsights] = useState<RollInsight[]>([]);

  // Get active character
  const character = gameState.activeCharacterId ? 
    gameState.characters[gameState.activeCharacterId] : null;

  // Update roll history when it changes
  useEffect(() => {
    const updateHistory = () => {
      setRollHistory(diceRollingService.getRecentRolls(20));
    };

    // Initial load
    updateHistory();

    // Set up periodic updates (in a real app, you'd use events)
    const interval = setInterval(updateHistory, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load suggestions when character or context changes
  useEffect(() => {
    if (character && panelState.showSuggestions) {
      const newSuggestions = smartMoveSuggestionService.getSuggestions(
        character,
        'unknown',
        rollHistory.slice(-5),
        panelState.contextDescription
      );
      setSuggestions(newSuggestions);
    }
  }, [character, panelState.contextDescription, panelState.showSuggestions, rollHistory]);

  // Load insights
  useEffect(() => {
    if (character && panelState.showInsights) {
      const characterInsights = rollAnalyticsService.getInsights(character.id);
      setInsights(characterInsights);
    }
  }, [character, panelState.showInsights]);

  // Get all available moves
  const getAllMoves = (): Move[] => {
    const moves: Move[] = [];
    
    // Add basic moves (always available)
    BASIC_MOVES.forEach(partialMove => {
      if (partialMove.name) {
        moves.push({
          id: `basic-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove
        } as Move);
      }
    });

    // Add special moves
    SPECIAL_MOVES.forEach(partialMove => {
      if (partialMove.name) {
        moves.push({
          id: `special-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove
        } as Move);
      }
    });

    // Add character's known moves (class moves, etc.)
    if (character) {
      // TODO: Get class moves and other learned moves from character
      // This would require a move database/service
    }

    return moves;
  };

  // Filter moves based on category and search
  const getFilteredMoves = (): Move[] => {
    let moves = getAllMoves();

    // Filter by category
    if (panelState.selectedCategory !== 'all') {
      moves = moves.filter(move => move.category === panelState.selectedCategory);
    }

    // Filter by search term
    if (panelState.searchTerm) {
      const searchLower = panelState.searchTerm.toLowerCase();
      moves = moves.filter(move => 
        move.name.toLowerCase().includes(searchLower) ||
        move.description?.toLowerCase().includes(searchLower) ||
        move.trigger?.toLowerCase().includes(searchLower)
      );
    }

    return moves;
  };

  const handleRoll = (roll: DiceRoll) => {
    // Record analytics and get insights
    const newInsights = rollAnalyticsService.recordRoll(roll);
    
    // Handle XP gain on failure
    if (diceRollingService.grantsXP(roll) && character) {
      const newXP = (character.xp || 0) + 1;
      updateCharacter(character.id, { xp: newXP });
    }

    // Update roll history
    setRollHistory(diceRollingService.getRecentRolls(20));
    
    // Add new insights
    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights, ...prev].slice(0, 10)); // Keep last 10 insights
    }
  };

  const handleUseMove = (move: Move) => {
    // Handle move usage (decrement uses, apply effects, etc.)
    if (move.uses && move.uses.current > 0) {
      // TODO: Update move uses in character data
      console.log(`Used move: ${move.name}`);
    }
  };

  const toggleMoveExpanded = (moveId: string) => {
    const newExpanded = new Set(panelState.expandedMoves);
    if (newExpanded.has(moveId)) {
      newExpanded.delete(moveId);
    } else {
      newExpanded.add(moveId);
    }
    setPanelState(prev => ({ ...prev, expandedMoves: newExpanded }));
  };

  const updateState = (updates: Partial<MovesPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }));
  };

  const filteredMoves = getFilteredMoves();

  return (
    <div className="moves-panel">
      <div className="moves-panel__header">
        <h2>Moves</h2>
        {character && (
          <div className="character-info">
            <span className="character-name">{character.name}</span>
            <span className="character-xp">XP: {character.xp || 0}</span>
          </div>
        )}
      </div>

      {!character && (
        <div className="no-character">
          <p>No character selected. Create or select a character to use moves.</p>
        </div>
      )}

      {character && (
        <>
          {/* Controls */}
          <div className="moves-panel__controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search moves..."
                value={panelState.searchTerm}
                onChange={(e) => updateState({ searchTerm: e.target.value })}
                className="search-input"
              />
            </div>

            <div className="category-filters">
              {(['all', 'basic', 'class', 'advanced', 'master', 'special'] as const).map(category => (
                <button
                  key={category}
                  className={`category-button ${panelState.selectedCategory === category ? 'active' : ''}`}
                  onClick={() => updateState({ selectedCategory: category })}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="context-description">
              <input
                type="text"
                placeholder="Describe the current situation for smart suggestions..."
                value={panelState.contextDescription}
                onChange={(e) => updateState({ contextDescription: e.target.value })}
                className="context-input"
              />
            </div>

            <div className="view-toggles">
              <button
                className={`toggle-button ${panelState.showEnhancedDice ? 'active' : ''}`}
                onClick={() => updateState({ showEnhancedDice: !panelState.showEnhancedDice })}
              >
                🎲 Enhanced Dice
              </button>
              <button
                className={`toggle-button ${panelState.showSuggestions ? 'active' : ''}`}
                onClick={() => updateState({ showSuggestions: !panelState.showSuggestions })}
              >
                💡 Smart Suggestions
              </button>
              <button
                className={`toggle-button ${panelState.showInsights ? 'active' : ''}`}
                onClick={() => updateState({ showInsights: !panelState.showInsights })}
              >
                📊 Analytics
              </button>
              <button
                className={`toggle-button ${panelState.showRollHistory ? 'active' : ''}`}
                onClick={() => updateState({ showRollHistory: !panelState.showRollHistory })}
              >
                📜 Roll History
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="moves-panel__content">
            {/* Enhanced Dice Roller */}
            {panelState.showEnhancedDice && (
              <div className="enhanced-dice-section">
                <h3>🎲 Enhanced Dice Roller</h3>
                <EnhancedDiceRoller
                  compact={false}
                  showHistory={true}
                  showAnimation={true}
                  animationTheme="classic"
                  soundEnabled={true}
                  onRoll={(enhancedRoll: EnhancedDiceRoll) => {
                    // Convert to legacy format for compatibility with existing systems
                    // Only create legacy roll for 2d6 or 3d6 (advantage/disadvantage) rolls
                    if (enhancedRoll.results.length === 2 || enhancedRoll.results.length === 3) {
                      const legacyRoll: DiceRoll = {
                        id: enhancedRoll.id,
                        dice: enhancedRoll.results as [number, number] | [number, number, number],
                        modifier: enhancedRoll.modifier,
                        total: enhancedRoll.finalResult,
                        result: enhancedRoll.rollResult || (enhancedRoll.success ? 'success' : 'failure'),
                        timestamp: enhancedRoll.timestamp,
                        description: `${enhancedRoll.expression.count}${enhancedRoll.expression.type}${enhancedRoll.modifier !== 0 ? (enhancedRoll.modifier > 0 ? '+' : '') + enhancedRoll.modifier : ''}`,
                        character: character?.name || 'Unknown'
                      };
                      setRollHistory(prev => [legacyRoll, ...prev.slice(0, 19)]);
                    }
                  }}
                />
              </div>
            )}

            {/* Smart Suggestions */}
            {panelState.showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3>💡 Smart Suggestions</h3>
                <div className="suggestions-grid">
                  {suggestions.slice(0, 6).map(suggestion => (
                    <div key={suggestion.move.id} className={`suggestion-card ${suggestion.priority}`}>
                      <div className="suggestion-header">
                        <span className="suggestion-move-name">{suggestion.move.name}</span>
                        <span className="suggestion-relevance">{suggestion.relevance}%</span>
                      </div>
                      <div className="suggestion-reason">{suggestion.reason}</div>
                      {suggestion.move.rollStat && character && (
                        <button
                          className="suggestion-roll-btn"
                          onClick={() => {
                            const roll = diceRollingService.rollMove(suggestion.move, character);
                            handleRoll(roll);
                          }}
                        >
                          🎲 Roll + {suggestion.move.rollStat}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Insights */}
            {panelState.showInsights && insights.length > 0 && (
              <div className="insights-section">
                <h3>📊 Roll Insights</h3>
                <div className="insights-list">
                  {insights.slice(0, 5).map((insight, index) => (
                    <div key={index} className={`insight-item ${insight.severity}`}>
                      <div className="insight-header">
                        <span className="insight-title">{insight.title}</span>
                        <span className="insight-type">{insight.type}</span>
                      </div>
                      <div className="insight-description">{insight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moves List */}
            <div className="moves-list">
              {filteredMoves.length === 0 ? (
                <div className="no-moves">
                  <p>No moves found matching your criteria.</p>
                </div>
              ) : (
                filteredMoves.map(move => (
                  <MoveCard
                    key={move.id}
                    move={move}
                    character={character}
                    onRoll={handleRoll}
                    onUse={handleUseMove}
                    expanded={panelState.expandedMoves.has(move.id)}
                    className="moves-list__item"
                  />
                ))
              )}
            </div>

            {/* Roll History Sidebar */}
            {panelState.showRollHistory && (
              <div className="roll-history">
                <div className="roll-history__header">
                  <h3>Recent Rolls</h3>
                  <button
                    className="clear-history-button"
                    onClick={() => {
                      diceRollingService.clearHistory();
                      setRollHistory([]);
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div className="roll-history__list">
                  {rollHistory.length === 0 ? (
                    <p className="no-rolls">No rolls yet.</p>
                  ) : (
                    rollHistory.map(roll => (
                      <div key={roll.id} className={`roll-item ${roll.result}`}>
                        <div className="roll-header">
                          <span className="roll-description">
                            {roll.description || 'Unknown Roll'}
                          </span>
                          <span className="roll-time">
                            {new Date(roll.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="roll-details">
                          <span className="roll-dice">
                            {roll.dice.length === 3 ? 
                              `${roll.dice.join(' + ')} (${roll.advantage ? 'adv' : 'dis'})` : 
                              `${roll.dice[0]} + ${roll.dice[1]}`
                            }
                          </span>
                          <span className="roll-modifier">
                            {roll.modifier >= 0 ? '+' : ''}{roll.modifier}
                          </span>
                          <span className="roll-total">
                            = {roll.total}
                          </span>
                          <span className={`roll-result ${roll.result}`}>
                            {roll.result === 'success' && '✓'}
                            {roll.result === 'partial' && '~'}
                            {roll.result === 'failure' && '✗'}
                          </span>
                        </div>

                        {diceRollingService.grantsXP(roll) && (
                          <div className="xp-gained">+1 XP</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Export the component separately for HMR compatibility
export { MovesPanel };

// Export the panel configuration
const movesPanelConfig = createPanel(
  {
    id: 'moves',
    name: 'Moves',
    icon: '📜',
    description: 'Roll moves, get suggestions, and track performance',
    priority: 3
  },
  MovesPanel
);

export default movesPanelConfig;
