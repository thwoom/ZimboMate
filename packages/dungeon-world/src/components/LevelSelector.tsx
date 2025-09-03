/**
 * Level selector component for choosing character level
 */

import './LevelSelector.css';

import React, { useEffect,useState } from 'react';

import { CharacterClass } from '../models/Character';
import { advancementService, LevelProgression } from '../services/AdvancementService';

interface LevelSelectorProps {
  selectedLevel: number;
  characterClass: CharacterClass;
  onLevelChange: (level: number, progression: LevelProgression) => void;
  minLevel?: number;
  maxLevel?: number;
  disabled?: boolean;
}

export const LevelSelector: React.FC < LevelSelectorProps> = ({
  selectedLevel,
  characterClass,
  onLevelChange,
  minLevel = 1,
  maxLevel = 10,
  disabled = false,
}) => {
  const [progression, setProgression] = useState < LevelProgression | null>(null);

  useEffect(() => {
    const newProgression = advancementService.getLevelProgression(selectedLevel, characterClass);
    setProgression(newProgression);
  }, [selectedLevel, characterClass]);

  const handleLevelChange = (level: number) => {
    const newProgression = advancementService.getLevelProgression(level, characterClass);
    setProgression(newProgression);
    onLevelChange(level, newProgression);
  };

  const levels = Array.from({ length: maxLevel-minLevel + 1 }, (_, i) => minLevel + i);

  return (
    <div className="level-selector">
      <div className="level-selector-header">
        <h3 > Choose Character Level</h3>
        <p className="level-description">
          Select your character's starting level. Higher levels require advancement choices.
        </p>
      </div>

      <div className="level-options">
        {levels.map(level => (
          <button
            key={level}
            className={`level-option ${selectedLevel === level ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && handleLevelChange(level)}
            disabled={disabled}
          >
            <span className="level-number">Level {level}</span>
            {level === 1 && <span className="level-badge">Beginner</span>}
            {level >= 6 && <span className="level-badge advanced">Advanced</span>}
          </button>
        ))}
      </div>

      {progression && (
        <div className="level-progression-info">
          <h4 > Level {selectedLevel} Requirements</h4>
          <div className="progression-grid">
            <div className="progression-item">
              <span className="progression-label">XP to Reach Level:</span>
              <span className="progression-value">{progression.xpRequired} XP</span>
            </div>

            <div className="progression-item">
              <span className="progression-label">XP for Next Level:</span>
              <span className="progression-value">{progression.xpForNext} XP</span>
            </div>
          </div>

          {progression.level > 1 && (
            <div className="advancement-info">
              <h5 > Official Dungeon World Advancement</h5>
              <p className="advancement-description">
                Each level up gives you < strong > exactly two things</strong>:
              </p>
              <div className="advancement-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">⚔️</span>
                  <span className="benefit-text">One new advanced move from your class</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💪</span>
                  <span className="benefit-text">+1 to unknown ability score (max 18)</span>
                </div>
              </div>
              <p className="advancement-note">
                You'll choose these improvements after selecting this level.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelSelector;



