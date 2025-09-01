import React, { useState, useEffect } from 'react';
import { Move } from '../models/Move';
import { Character } from '../models/Character';
import { DiceRoll, diceRollingService, RollModifiers } from '../services/DiceRollingService';
import { StatSubstitutionService } from '../services/StatSubstitutionService';
import './DiceRoller.css';

interface DiceRollerProps {
  character?: Character;
  move?: Move;
  onRoll?: (roll: DiceRoll) => void;
  disabled?: boolean;
  className?: string;
}

export const DiceRoller: React.FC < DiceRollerProps> = ({
  character,
  move,
  onRoll,
  disabled = false,
  className = '',
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState < DiceRoll | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedStat, setSelectedStat] = useState < string>('');

  // Calculate modifiers for display
  const getModifiers = (): RollModifiers | null => {
    if (!character || !move?.rollStat) return null;

    const statToUse = selectedStat || move.rollStat;
    const statValue = character.attributes[statToUse as keyof typeof character.attributes];
    const statModifier = getStatModifier(statValue);

    return {
      stat: statModifier,
      ongoing: 0, // TODO: Get from character state
      forward: 0, // TODO: Get from character state
      other: move.rollModifier || 0,
    };
  };

  const getStatModifier = (statValue: number): number => {
    if (statValue <= 3) return -3;
    if (statValue <= 5) return -2;
    if (statValue <= 8) return -1;
    if (statValue <= 12) return 0;
    if (statValue <= 15) return 1;
    if (statValue <= 17) return 2;
    return 3;
  };

  const handleRoll = async() => {
    if (!character || !move || disabled || isRolling) return;

    setIsRolling(true);
    setShowResult(false);

    // Add rolling animation delay
    setTimeout(() => {
      try {
        // Use selected stat if available, otherwise use move's default stat
        const statToUse = selectedStat || move.rollStat;
        const roll = diceRollingService.rollStat(statToUse as string, character, {
          description: `${move.name} (${statToUse})`,
        });
        setLastRoll(roll);
        setShowResult(true);
        onRoll?.(roll);
      } catch (error) {
        } finally {
        setIsRolling(false);
      }
    }, 800); // Animation duration
  };

  const modifiers = getModifiers();
  const totalModifier = modifiers ?
    modifiers.stat + modifiers.ongoing + modifiers.forward + modifiers.other : 0;

  const canRoll = character && move && move.rollStat && !disabled;

  // Get available stats for this move
  const availableStats = character && move && move.rollStat ?
    StatSubstitutionService.getAvailableStats(character, move.name, move.rollStat) :
    [move?.rollStat].filter(Boolean);

  // Get substitution explanation
  const substitutionExplanation = character && move && selectedStat ?
    StatSubstitutionService.getSubstitutionExplanation(character, move.name, selectedStat) :
    null;

  // Initialize selected stat on mount
  useEffect(() => {
    if (character && move && move.rollStat && !selectedStat) {
      const bestStat = StatSubstitutionService.getBestStat(character, move.name, move.rollStat);
      setSelectedStat(bestStat);
    }
  }, [character, move, selectedStat]);

  return (
    <div className={`dice-roller ${className}`}>
      {/* Move Info */}
      {move && (
        <div className="dice-roller__move-info">
          <h4 className="move-name">{move.name}</h4>

          {/* Stat Selection */}
          {availableStats && availableStats.length > 1 && (
            <div className="stat-selection">
              <label className="stat-label">Choose Stat:</label>
              <div className="stat-options">
                {availableStats.map(stat => (
                  <button
                    key={stat}
                    className={`stat-option ${selectedStat === stat ? 'selected' : ''}`}
                    onClick={() => setSelectedStat(stat || '')}
                  >
                    {stat}
                    <span className="stat-value">
                      {character?.attributes[stat as keyof typeof character.attributes] || 0}
                    </span>
                  </button>
                ))}
              </div>
              {substitutionExplanation && (
                <div className="substitution-explanation">
                  {substitutionExplanation}
                </div>
              )}
            </div>
          )}

          {move.rollStat && (
            <div className="roll-info">
              <span className="roll-stat">
                Roll + {selectedStat || move.rollStat}
              </span>
              {modifiers && (
                <span className="roll-modifier">
                  ({totalModifier >= 0 ? '+' : ''}{totalModifier})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dice Display */}
      <div className="dice-roller__dice">
        <div className={`dice ${isRolling ? 'rolling' : ''}`}>
          <div className="die">
            <span className="die-face">
              {lastRoll && showResult ? lastRoll.dice[0] : '?'}
            </span>
          </div>
          <div className="die">
            <span className="die-face">
              {lastRoll && showResult ? lastRoll.dice[1] : '?'}
            </span>
          </div>
        </div>

        {modifiers && (
          <div className="modifier-display">
            <span className="modifier-text">
              {totalModifier >= 0 ? '+' : ''}{totalModifier}
            </span>
          </div>
        )}
      </div>

      {/* Roll Button */}
      <button
        className={`dice-roller__button ${!canRoll ? 'disabled' : ''}`}
        onClick={handleRoll}
        disabled={!canRoll || isRolling}
      >
        {isRolling ? 'Rolling...' : 'Roll Move'}
      </button>

      {/* Result Display */}
      {lastRoll && showResult && (
        <div className={`dice-roller__result ${lastRoll.result}`}>
          <div className="result-summary">
            <span className="result-total">{lastRoll.total}</span>
            <span className="result-calculation">
              ({lastRoll.dice.length === 3 ?
                `${lastRoll.dice.join(' + ')} (${lastRoll.advantage ? 'advantage' : 'disadvantage'})` :
                `${lastRoll.dice[0]} + ${lastRoll.dice[1]}`
              } + {lastRoll.modifier})
            </span>
          </div>

          <div className={`result-tier ${lastRoll.result}`}>
            {lastRoll.result === 'success' && '✓ Success! (10+)'}
            {lastRoll.result === 'partial' && '~ Partial Success (7-9)'}
            {lastRoll.result === 'failure' && '✗ Miss (6-)-Mark XP'}
          </div>

          {move && (
            <div className="result-description">
              {diceRollingService.getResultText(lastRoll)}
            </div>
          )}
        </div>
      )}

      {/* Probability Display (for advanced users) */}
      {modifiers && !isRolling && (
        <div className="dice-roller__probability">
          {(() => {
            const prob = diceRollingService.getSuccessProbability(totalModifier);
            return (
              <div
                className="probability-bars"
                style={{
                  '--success-width': `${prob.success}%`,
                  '--partial-width': `${prob.partial}%`,
                  '--failure-width': `${prob.failure}%`,
                } as React.CSSProperties}
              >
                <div className="prob-bar success">
                  <span>{prob.success}%</span>
                </div>
                <div className="prob-bar partial">
                  <span>{prob.partial}%</span>
                </div>
                <div className="prob-bar failure">
                  <span>{prob.failure}%</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;

