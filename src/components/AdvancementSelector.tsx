/**
 * Official Dungeon World advancement selector-choose ONE move and ONE stat increase for EACH level
 */

import React, { useState, useEffect } from 'react';
import { Character } from '../models/Character';
import './AdvancementSelector.css';
import {
  advancementService,
  AdvancementChoice,
  AdvancementPlan,
} from '../services/AdvancementService';

interface AdvancementSelectorProps {
  character: Character;
  targetLevel: number;
  selectedMove?: AdvancementChoice;
  selectedStat?: AdvancementChoice;
  onAdvancementsChange: (move?: AdvancementChoice, stat?: AdvancementChoice, plan?: AdvancementPlan) => void;
  disabled?: boolean;
}

// New interface for tracking advancements across multiple levels
interface LevelAdvancement {
  level: number;
  selectedMove?: AdvancementChoice;
  selectedStat?: AdvancementChoice;
  isValid: boolean;
  validationErrors: string[];
}

export const AdvancementSelector: React.FC < AdvancementSelectorProps> = ({
  character,
  targetLevel,
  selectedMove,
  selectedStat,
  onAdvancementsChange,
  disabled = false,
}) => {
  const [levelAdvancements, setLevelAdvancements] = useState < LevelAdvancement[]>([]);
  const [currentLevel, setCurrentLevel] = useState < number>(2);
  const [availableMoves, setAvailableMoves] = useState < AdvancementChoice[]>([]);
  const [availableStats, setAvailableStats] = useState < AdvancementChoice[]>([]);
  const [activeTab, setActiveTab] = useState<'moves' | 'stats'>('moves');

  // Calculate how many levels we need to advance through
  const levelsToAdvance = targetLevel > 1 ? Array.from({ length: targetLevel-1 }, (_, i) => i + 2) : [];

  useEffect(() => {
    // Initialize level advancements for all levels from 2 to targetLevel
    const initialAdvancements: LevelAdvancement[] = levelsToAdvance.map(level => ({
      level,
      selectedMove: undefined,
      selectedStat: undefined,
      isValid: false,
      validationErrors: [],
    }));

    setLevelAdvancements(initialAdvancements);

    // Start with level 2
    if (levelsToAdvance.length > 0) {
      setCurrentLevel(2);
    }
  }, [targetLevel]);

  useEffect(() => {
    if (currentLevel < 2 || currentLevel > targetLevel) return;

    // Get all moves and stats that have been selected across all levels
    const allSelectedMoves = levelAdvancements
      .filter(adv => adv.selectedMove)
      .map(adv => adv.selectedMove!.id);

    const allSelectedStats = levelAdvancements
      .filter(adv => adv.selectedStat)
      .map(adv => adv.selectedStat!.id);

    // Create a temporary character with all stat improvements applied up to the current level
    const tempCharacter = { ...character };

    // Apply stat improvements from previous levels
    levelAdvancements
      .filter(adv => adv.level < currentLevel && adv.selectedStat)
      .forEach(adv => {
        if (adv.selectedStat?.attribute) {
          tempCharacter.attributes[adv.selectedStat.attribute]++;
        }
      });

    // Add moves selected in previous levels to knownMoves
    const selectedMovesFromPreviousLevels = levelAdvancements
      .filter(adv => adv.level < currentLevel && adv.selectedMove && adv.selectedMove.moveId)
      .map(adv => adv.selectedMove!.moveId!);

    tempCharacter.knownMoves = [
      ...(tempCharacter.knownMoves || []),
      ...selectedMovesFromPreviousLevels,
    ];

    // Get available choices for the current level
    let moves = advancementService.getAvailableAdvancedMoves(tempCharacter, currentLevel);
    let stats = advancementService.getAvailableStatImprovements(tempCharacter, currentLevel);

    // Filter out moves and stats that have already been selected in other levels
    moves = moves.filter(move => !allSelectedMoves.includes(move.id));
    stats = stats.filter(stat => !allSelectedStats.includes(stat.id));

    setAvailableMoves(moves);
    setAvailableStats(stats);
  }, [character, currentLevel, targetLevel, levelAdvancements]);

  const handleMoveSelect = (move: AdvancementChoice) => {
    if (disabled) return;

    const updatedAdvancements =  [...levelAdvancements];
    const levelIndex = currentLevel-2;

    if (levelIndex >= 0 && levelIndex < updatedAdvancements.length) {
      const newMove = updatedAdvancements[levelIndex].selectedMove?.id === move.id ? undefined : move;
      updatedAdvancements[levelIndex].selectedMove = newMove;

      // Validate this level's advancement
      const plan = advancementService.createAdvancementPlan(
        character,
        currentLevel,
        newMove,
        updatedAdvancements[levelIndex].selectedStat,
      );

      updatedAdvancements[levelIndex].isValid = plan.isValid;
      updatedAdvancements[levelIndex].validationErrors = plan.validationErrors;

      setLevelAdvancements(updatedAdvancements);

      // Update parent component with current level's choices
      onAdvancementsChange(newMove, updatedAdvancements[levelIndex].selectedStat, plan);
    }
  };

  const handleStatSelect = (stat: AdvancementChoice) => {
    if (disabled) return;

    const updatedAdvancements = [...levelAdvancements];
    const levelIndex = currentLevel-2;

    if (levelIndex >= 0 && levelIndex < updatedAdvancements.length) {
      const newStat = updatedAdvancements[levelIndex].selectedStat?.id === stat.id ? undefined : stat;
      updatedAdvancements[levelIndex].selectedStat = newStat;

      // Validate this level's advancement
      const plan = advancementService.createAdvancementPlan(
        character,
        currentLevel,
        updatedAdvancements[levelIndex].selectedMove,
        newStat,
      );

      updatedAdvancements[levelIndex].isValid = plan.isValid;
      updatedAdvancements[levelIndex].validationErrors = plan.validationErrors;

      setLevelAdvancements(updatedAdvancements);

      // Update parent component with current level's choices
      onAdvancementsChange(updatedAdvancements[levelIndex].selectedMove, newStat, plan);
    }
  };

  const getCurrentLevelAdvancement = (): LevelAdvancement | undefined => {
    return levelAdvancements.find(adv => adv.level === currentLevel);
  };

  const isAllLevelsComplete = (): boolean => {
    return levelAdvancements.every(adv => adv.isValid);
  };

  const renderLevelNavigation = () => {
    return (
      <div className="level-navigation">
        <h4>📈 Level Progression: 1 → {targetLevel}</h4>
        <div className="level-tabs">
          {levelsToAdvance.map(level => {
            const advancement = levelAdvancements.find(adv => adv.level === level);
            const isComplete = advancement?.isValid;
            const isCurrent = level === currentLevel;

            return (
              <button
                key={level}
                className={`level-tab ${isCurrent ? 'active' : ''} ${isComplete ? 'complete' : 'incomplete'}`}
                onClick={() => setCurrentLevel(level)}
              >
                Level {level}
                {isComplete && <span className="completion-indicator">✓</span>}
                {isCurrent && <span className="current-indicator">→</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMoveTab = () => {
    const classMoves = availableMoves.filter(move => !move.isMulticlass);
    const multiclassMoves = availableMoves.filter(move => move.isMulticlass);
    const currentAdvancement = getCurrentLevelAdvancement();

    return (
      <div className="advancement-tab-content">
        <div className="advancement-explanation">
          <h4>🎯 Level {currentLevel}-Choose Your New Ability</h4>
          <p > Select < strong > exactly one</strong > advanced move for level {currentLevel}. This represents new techniques, spells, or abilities your character has learned.</p>
        </div>

        {classMoves.length > 0 && (
          <div className="advancement-section">
            <h5>🛡️ {character.class} Moves</h5>
            <div className="advancement-grid">
              {classMoves.map(move => (
                <div
                  key={move.id}
                  className={`advancement-card move-card ${currentAdvancement?.selectedMove?.id === move.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleMoveSelect(move)}
                >
                  <div className="advancement-header">
                    <h6>{move.name}</h6>
                    {currentAdvancement?.selectedMove?.id === move.id && <span className="selected-indicator">✓</span>}
                  </div>
                  <p className="advancement-description">{move.description}</p>
                  {move.prerequisites && move.prerequisites.length > 0 && (
                    <div className="prerequisites">
                      <small > Prerequisites: {move.prerequisites.join(', ')}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {multiclassMoves.length > 0 && (
          <div className="advancement-section">
            <h5>🎭 Multiclass Moves</h5>
            <p className="section-description">Learn abilities from other classes</p>
            <div className="advancement-grid">
              {multiclassMoves.map(move => (
                <div
                  key={move.id}
                  className={`advancement-card move-card multiclass ${currentAdvancement?.selectedMove?.id === move.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => handleMoveSelect(move)}
                >
                  <div className="advancement-header">
                    <h6>{move.name}</h6>
                    {currentAdvancement?.selectedMove?.id === move.id && <span className="selected-indicator">✓</span>}
                    <span className="multiclass-badge">{move.sourceClass}</span>
                  </div>
                  <p className="advancement-description">{move.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableMoves.length === 0 && (
          <div className="no-choices">
            <p > No moves available for level {currentLevel}.</p>
          </div>
        )}
      </div>
    );
  };

  const renderStatTab = () => {
    const currentAdvancement = getCurrentLevelAdvancement();

    return (
      <div className="advancement-tab-content">
        <div className="advancement-explanation">
          <h4>💪 Level {currentLevel}-Choose Your Ability Improvement</h4>
          <p > Select < strong > exactly one</strong > ability score to increase by 1 for level {currentLevel}. Maximum is 18.</p>
        </div>

        <div className="advancement-section">
          <div className="advancement-grid stats-grid">
            {availableStats.map(stat => (
              <div
                key={stat.id}
                className={`advancement-card stat-card ${currentAdvancement?.selectedStat?.id === stat.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => handleStatSelect(stat)}
              >
                <div className="advancement-header">
                  <h6>{stat.name}</h6>
                  {currentAdvancement?.selectedStat?.id === stat.id && <span className="selected-indicator">✓</span>}
                </div>
                <p className="advancement-description">{stat.description}</p>
                {stat.attribute === 'CON' && (
                  <div className="bonus-note">
                    <small>💚 +1 HP when Constitution increases</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {availableStats.length === 0 && (
          <div className="no-choices">
            <p > All ability scores are at maximum (18).</p>
          </div>
        )}
      </div>
    );
  };

  const renderProgressSummary = () => {
    const completedLevels = levelAdvancements.filter(adv => adv.isValid).length;
    const totalLevels = levelAdvancements.length;
    const currentAdvancement = getCurrentLevelAdvancement();

    return (
      <div className="advancement-progress">
        <div className="progress-header">
          <h4>📊 Advancement Progress</h4>
          <div className="progress-stats">
            <span className="progress-text">
              {completedLevels} of {totalLevels} levels complete
            </span>
            <span className="progress-percentage">
              {Math.round((completedLevels / totalLevels) * 100)}%
            </span>
          </div>
        </div>

        <div className="level-summary">
          {levelAdvancements.map(adv => (
            <div key={adv.level} className={`level-summary-item ${adv.level === currentLevel ? 'current' : ''} ${adv.isValid ? 'complete' : 'incomplete'}`}>
              <span className="level-number">Level {adv.level}</span>
              <span className="level-move">{adv.selectedMove?.name || 'No move'}</span>
              <span className="level-stat">{adv.selectedStat?.name || 'No stat'}</span>
              <span className="level-status">
                {adv.isValid ? '✓' : '○'}
              </span>
            </div>
          ))}
        </div>

        {/* Show what's already been selected */}
        <div className="selected-items-summary">
          <h5>✅ Already Selected:</h5>
          <div className="selected-moves">
            <strong > Moves:</strong> {levelAdvancements
              .filter(adv => adv.selectedMove)
              .map(adv => `${adv.selectedMove!.name} (L${adv.level})`)
              .join(', ') || 'None'}
          </div>
          <div className="selected-stats">
            <strong > Stats:</strong> {levelAdvancements
              .filter(adv => adv.selectedStat)
              .map(adv => `${adv.selectedStat!.name} (L${adv.level})`)
              .join(', ') || 'None'}
          </div>
        </div>
      </div>
    );
  };

  // Don't render if no levels to advance
  if (levelsToAdvance.length === 0) {
    return (
      <div className="advancement-selector">
        <div className="advancement-header-section">
          <h3 > Level 1 Character</h3>
          <p > No advancement choices needed for level 1 characters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="advancement-selector">
      <div className="advancement-header-section">
        <h3 > Multi-Level Advancement: Level 1 → {targetLevel}</h3>
        <p className="advancement-subtitle">
          <strong > Official Dungeon World Rule:</strong > For each level from 2 to {targetLevel}, choose one advanced move AND increase one ability score by 1.
        </p>
      </div>

      {renderLevelNavigation()}
      {renderProgressSummary()}

      {/* Tab Navigation */}
      <div className="advancement-tabs">
        <button
          className={`tab-button ${activeTab === 'moves' ? 'active' : ''}`}
          onClick={() => setActiveTab('moves')}
        >
          ⚔️ Advanced Moves
          {getCurrentLevelAdvancement()?.selectedMove && <span className="tab-indicator">✓</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          💪 Ability Scores
          {getCurrentLevelAdvancement()?.selectedStat && <span className="tab-indicator">✓</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="advancement-content">
        {activeTab === 'moves' ? renderMoveTab() : renderStatTab()}
      </div>

      {/* Validation and Status */}
      {(() => {
        const currentAdvancement = getCurrentLevelAdvancement();
        if (!currentAdvancement) return null;

        return (
          <div className="advancement-status">
            {currentAdvancement.validationErrors && currentAdvancement.validationErrors.length > 0 && (
              <div className="validation-errors">
                {currentAdvancement.validationErrors.map((error, index) => (
                  <div key={index} className="error-message">
                    ⚠️ {error}
                  </div>
                ))}
              </div>
            )}

            <div className="selection-summary">
              <div className="summary-item">
                <span className="summary-label">Level {currentLevel} Move:</span>
                <span className={`summary-value ${currentAdvancement.selectedMove ? 'complete' : 'incomplete'}`}>
                  {currentAdvancement.selectedMove ? currentAdvancement.selectedMove.name : 'None'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Level {currentLevel} Stat:</span>
                <span className={`summary-value ${currentAdvancement.selectedStat ? 'complete' : 'incomplete'}`}>
                  {currentAdvancement.selectedStat ? currentAdvancement.selectedStat.name : 'None'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Level {currentLevel} Status:</span>
                <span className={`summary-value ${currentAdvancement.isValid ? 'valid' : 'invalid'}`}>
                  {currentAdvancement.isValid ? '✅ Complete' : '❌ Incomplete'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Overall Progress:</span>
                <span className={`summary-value ${isAllLevelsComplete() ? 'valid' : 'invalid'}`}>
                  {isAllLevelsComplete() ? '✅ All Levels Complete' : '❌ Levels Incomplete'}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdvancementSelector;
