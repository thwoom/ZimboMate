/**
 * Level selector component for advanced character creation
 */

import React, { useState, useEffect } from 'react';
import { CharacterClass } from '../models/Character';
import { advancementService, LevelProgression } from '../services/AdvancementService';
import './LevelSelector.css';

interface LevelSelectorProps {
  selectedLevel: number;
  characterClass: CharacterClass;
  onLevelChange: (level: number, progression: LevelProgression) => void;
  minLevel?: number;
  maxLevel?: number;
  disabled?: boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  characterClass,
  onLevelChange,
  minLevel = 1,
  maxLevel = 10,
  disabled = false
}) => {
  const [progression, setProgression] = useState<LevelProgression | null>(null);

  useEffect(() => {
    const newProgression = advancementService.getLevelProgression(selectedLevel, characterClass);
    setProgression(newProgression);
  }, [selectedLevel, characterClass]);

  const handleLevelChange = (level: number) => {
    const newProgression = advancementService.getLevelProgression(level, characterClass);
    setProgression(newProgression);
    onLevelChange(level, newProgression);
  };

  const levels = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => minLevel + i);

  return (
    <div className="level-selector">
      <div className="level-selector-header">
        <h3>Character Level</h3>
        <p className="level-description">
          Choose your character's starting level. Higher levels provide more abilities and resources.
        </p>
      </div>

      <div className="level-input-section">
        <div className="level-slider-container">
          <label htmlFor="level-slider" className="level-label">
            Level: <span className="level-value">{selectedLevel}</span>
          </label>
          <input
            id="level-slider"
            type="range"
            min={minLevel}
            max={maxLevel}
            value={selectedLevel}
            onChange={(e) => handleLevelChange(parseInt(e.target.value))}
            disabled={disabled}
            className="level-slider"
          />
          <div className="level-markers">
            {levels.map(level => (
              <span 
                key={level} 
                className={`level-marker ${level === selectedLevel ? 'active' : ''}`}
                onClick={() => !disabled && handleLevelChange(level)}
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="level-dropdown-container">
          <label htmlFor="level-dropdown" className="level-label">
            Or select directly:
          </label>
          <select
            id="level-dropdown"
            value={selectedLevel}
            onChange={(e) => handleLevelChange(parseInt(e.target.value))}
            disabled={disabled}
            className="level-dropdown"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {progression && (
        <div className="level-progression-info">
          <h4>Level {selectedLevel} Benefits</h4>
          <div className="progression-grid">
            <div className="progression-item">
              <span className="progression-label">Experience Points:</span>
              <span className="progression-value">{progression.xp} XP</span>
            </div>
            
            <div className="progression-item">
              <span className="progression-label">Base Hit Points:</span>
              <span className="progression-value">{progression.baseHP} HP</span>
            </div>
            
            <div className="progression-item">
              <span className="progression-label">Starting Coin:</span>
              <span className="progression-value">{progression.startingCoin} coins</span>
            </div>
            
            <div className="progression-item">
              <span className="progression-label">Equipment Tier:</span>
              <span className="progression-value">{progression.equipmentTier}</span>
            </div>

            {progression.totalAdvancementPoints > 0 && (
              <>
                <div className="progression-item">
                  <span className="progression-label">Advancement Points:</span>
                  <span className="progression-value">{progression.totalAdvancementPoints}</span>
                </div>
                
                <div className="progression-item">
                  <span className="progression-label">Attribute Improvements:</span>
                  <span className="progression-value">{progression.attributeAdvancementPoints}</span>
                </div>
                
                <div className="progression-item">
                  <span className="progression-label">New Moves:</span>
                  <span className="progression-value">{progression.moveAdvancementPoints}</span>
                </div>
              </>
            )}

            {progression.spellSlots && (
              <div className="progression-item spell-slots">
                <span className="progression-label">Spell Slots:</span>
                <div className="spell-slots-breakdown">
                  {progression.spellSlots.cantrips > 0 && (
                    <span className="spell-slot">Cantrips: {progression.spellSlots.cantrips}</span>
                  )}
                  {progression.spellSlots.level1 > 0 && (
                    <span className="spell-slot">1st: {progression.spellSlots.level1}</span>
                  )}
                  {progression.spellSlots.level2 > 0 && (
                    <span className="spell-slot">2nd: {progression.spellSlots.level2}</span>
                  )}
                  {progression.spellSlots.level3 > 0 && (
                    <span className="spell-slot">3rd: {progression.spellSlots.level3}</span>
                  )}
                  {progression.spellSlots.level4 > 0 && (
                    <span className="spell-slot">4th: {progression.spellSlots.level4}</span>
                  )}
                  {progression.spellSlots.level5 > 0 && (
                    <span className="spell-slot">5th: {progression.spellSlots.level5}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedLevel > 1 && (
            <div className="advancement-preview">
              <h5>🎯 What You'll Choose:</h5>
              <ul className="advancement-list">
                {progression.attributeAdvancementPoints > 0 && (
                  <li>
                    <strong>{progression.attributeAdvancementPoints}</strong> attribute improvement{progression.attributeAdvancementPoints > 1 ? 's' : ''} 
                    <span className="advancement-detail">(+1 to any stat)</span>
                  </li>
                )}
                {progression.moveAdvancementPoints > 0 && (
                  <li>
                    <strong>{progression.moveAdvancementPoints}</strong> new move{progression.moveAdvancementPoints > 1 ? 's' : ''} 
                    <span className="advancement-detail">(class abilities or multiclass options)</span>
                  </li>
                )}
                {progression.spellSlots && (
                  <li>
                    <strong>Spell selection</strong> 
                    <span className="advancement-detail">(choose spells for your available slots)</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedLevel === 1 && (
        <div className="level-one-info">
          <div className="info-box">
            <h5>📚 New to Dungeon World?</h5>
            <p>
              Level 1 is perfect for new players! You'll start with your class's basic moves 
              and can focus on learning the game without complex advancement choices.
            </p>
          </div>
        </div>
      )}

      {selectedLevel >= 6 && (
        <div className="high-level-warning">
          <div className="warning-box">
            <h5>⚡ High-Level Character</h5>
            <p>
              Level {selectedLevel} characters are quite powerful! Make sure your GM is 
              comfortable with high-level play and has appropriate challenges prepared.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelSelector;
