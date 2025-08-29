import React, { useState } from 'react';
import { Move, requiresRoll } from '../models/Move';
import { Character } from '../models/Character';
import { DiceRoll } from '../services/DiceRollingService';
import DiceRoller from './DiceRoller';
import './MoveCard.css';

interface MoveCardProps {
  move: Move;
  character?: Character;
  onRoll?: (roll: DiceRoll) => void;
  onUse?: (move: Move) => void;
  expanded?: boolean;
  showRoller?: boolean;
  className?: string;
}

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  character,
  onRoll,
  onUse,
  expanded = false,
  showRoller = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showDiceRoller, setShowDiceRoller] = useState(false);

  const needsRoll = requiresRoll(move);
  const canUse = !move.uses || move.uses.current > 0;

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShowRoller = () => {
    if (needsRoll && character) {
      setShowDiceRoller(true);
    } else {
      // For non-roll moves, just trigger use
      onUse?.(move);
    }
  };

  const handleRoll = (roll: DiceRoll) => {
    onRoll?.(roll);
    setShowDiceRoller(false);
    
    // Trigger move use
    onUse?.(move);
  };

  const getMoveTypeIcon = () => {
    switch (move.category) {
      case 'basic': return '⚔️';
      case 'class': return '🎯';
      case 'advanced': return '⭐';
      case 'master': return '👑';
      case 'special': return '✨';
      default: return '📜';
    }
  };



  return (
    <div className={`move-card ${move.category} ${!canUse ? 'disabled' : ''} ${className}`}>
      {/* Move Header */}
      <div className="move-card__header" onClick={handleToggleExpanded}>
        <div className="move-info">
          <div className="move-title">
            <span className="move-icon">{getMoveTypeIcon()}</span>
            <h3 className="move-name">{move.name}</h3>
            {move.uses && (
              <span className="move-uses">
                {move.uses.current}/{move.uses.max}
              </span>
            )}
          </div>
          <div className="move-meta">
            <span 
              className={`move-trigger-type ${move.triggerType}`}
            >
              {move.triggerType}
            </span>
            {move.rollStat && (
              <span className="move-stat">
                + {move.rollStat}
              </span>
            )}
          </div>
        </div>
        
        <div className="move-actions">
          {needsRoll && character && showRoller && (
            <button
              className="roll-button"
              onClick={(e) => {
                e.stopPropagation();
                handleShowRoller();
              }}
              disabled={!canUse}
            >
              🎲 Roll
            </button>
          )}
          
          {!needsRoll && (
            <button
              className="use-button"
              onClick={(e) => {
                e.stopPropagation();
                handleShowRoller();
              }}
              disabled={!canUse}
            >
              Use
            </button>
          )}
          
          <button className="expand-button">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Move Details */}
      {isExpanded && (
        <div className="move-card__content">
          <div className="move-trigger">
            <strong>When:</strong> {move.trigger}
          </div>
          
          <div className="move-description">
            {move.description}
          </div>

          {/* Move Results */}
          {(move.onSuccess || move.onPartial || move.onFailure) && (
            <div className="move-results">
              {move.onSuccess && (
                <div className="result-item success">
                  <strong>10+:</strong> {move.onSuccess}
                </div>
              )}
              {move.onPartial && (
                <div className="result-item partial">
                  <strong>7-9:</strong> {move.onPartial}
                </div>
              )}
              {move.onFailure && (
                <div className="result-item failure">
                  <strong>6-:</strong> {move.onFailure}
                </div>
              )}
            </div>
          )}

          {/* Special Properties */}
          <div className="move-properties">
            {move.hold && (
              <span className="property hold">Hold {move.hold}</span>
            )}
            {move.ongoing && (
              <span className="property ongoing">Ongoing</span>
            )}
            {move.forward && (
              <span className="property forward">Forward</span>
            )}
            {move.level && (
              <span className="property level">Level {move.level}+</span>
            )}
          </div>

          {/* Source Info */}
          {(move.source || move.page) && (
            <div className="move-source">
              {move.source && <span>Source: {move.source}</span>}
              {move.page && <span>Page: {move.page}</span>}
            </div>
          )}
        </div>
      )}

      {/* Dice Roller Modal */}
      {showDiceRoller && needsRoll && character && (
        <div className="dice-roller-modal">
          <div className="modal-backdrop" onClick={() => setShowDiceRoller(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Roll {move.name}</h3>
              <button 
                className="close-button"
                onClick={() => setShowDiceRoller(false)}
              >
                ✕
              </button>
            </div>
            <DiceRoller
              move={move}
              character={character}
              onRoll={handleRoll}
              className="modal-dice-roller"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveCard;

