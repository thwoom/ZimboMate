/**
 * Advancement selector component for choosing character improvements
 */

import React, { useState, useEffect } from 'react';
import { Character, CharacterClass, Attributes } from '../models/Character';
import './AdvancementSelector.css';
import { 
  advancementService, 
  AdvancementChoice, 
  AdvancementPlan,
  AttributeAdvancement,
  MoveAdvancement,
  SpellAdvancement
} from '../services/AdvancementService';

interface AdvancementSelectorProps {
  character: Partial<Character>;
  targetLevel: number;
  selectedAdvancements: AdvancementChoice[];
  onAdvancementsChange: (advancements: AdvancementChoice[], plan: AdvancementPlan) => void;
  disabled?: boolean;
}

export const AdvancementSelector: React.FC<AdvancementSelectorProps> = ({
  character,
  targetLevel,
  selectedAdvancements,
  onAdvancementsChange,
  disabled = false
}) => {
  const [availableChoices, setAvailableChoices] = useState<AdvancementChoice[]>([]);
  const [currentPlan, setCurrentPlan] = useState<AdvancementPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'attributes' | 'moves' | 'spells' | 'multiclass'>('attributes');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (character.class) {
      const choices = advancementService.getAvailableAdvancements(character, targetLevel, selectedAdvancements);
      setAvailableChoices(choices);
      
      const plan = advancementService.createAdvancementPlan(character, targetLevel, selectedAdvancements);
      setCurrentPlan(plan);
    }
  }, [character, targetLevel, selectedAdvancements]);

  const handleAdvancementToggle = (advancement: AdvancementChoice) => {
    if (disabled) return;

    const isSelected = selectedAdvancements.some(adv => adv.id === advancement.id);
    let newAdvancements: AdvancementChoice[];

    if (isSelected) {
      // Always allow deselection
      newAdvancements = selectedAdvancements.filter(adv => adv.id !== advancement.id);
    } else {
      // Check if we can add this advancement without exceeding limits
      const testAdvancements = [...selectedAdvancements, advancement];
      const testPlan = advancementService.createAdvancementPlan(character, targetLevel, testAdvancements);
      
      // If adding this would create validation errors, don't allow it
      if (testPlan.validationErrors.length > 0) {
        return; // Silently prevent the selection
      }
      
      newAdvancements = testAdvancements;
    }

    const newPlan = advancementService.createAdvancementPlan(character, targetLevel, newAdvancements);
    setCurrentPlan(newPlan);
    onAdvancementsChange(newAdvancements, newPlan);
  };

  const getFilteredChoices = (type: string) => {
    return availableChoices
      .filter(choice => choice.type === type)
      .filter(choice => 
        searchFilter === '' || 
        choice.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        choice.description.toLowerCase().includes(searchFilter.toLowerCase())
      );
  };

  const isAdvancementSelected = (advancement: AdvancementChoice) => {
    return selectedAdvancements.some(adv => adv.id === advancement.id);
  };

  const canSelectAdvancement = (advancement: AdvancementChoice) => {
    // If already selected, can always deselect
    if (isAdvancementSelected(advancement)) return true;
    
    // Test if adding this advancement would be valid
    const testAdvancements = [...selectedAdvancements, advancement];
    const testPlan = advancementService.createAdvancementPlan(character, targetLevel, testAdvancements);
    
    return testPlan.validationErrors.length === 0;
  };

  const getAdvancementDisabledReason = (advancement: AdvancementChoice) => {
    if (canSelectAdvancement(advancement)) return null;
    
    // Check specific reasons why it can't be selected
    const currentAttributeCount = selectedAdvancements.filter(adv => adv.type === 'attribute').length;
    const currentMoveCount = selectedAdvancements.filter(adv => adv.type === 'move').length;
    const progression = advancementService.getLevelProgression(targetLevel, character.class!);
    
    if (selectedAdvancements.length >= progression.totalAdvancementPoints) {
      return `All ${progression.totalAdvancementPoints} improvements selected`;
    }
    
    return 'Cannot select this advancement';
  };

  const canSelectMore = (type: string) => {
    if (!currentPlan) return false;
    
    if (type === 'attribute') {
      const selectedAttributes = selectedAdvancements.filter(adv => adv.type === 'attribute').length;
      return selectedAttributes < currentPlan.targetLevel - 1; // Simplified rule
    }
    
    return currentPlan.remainingChoices > 0;
  };

  const renderAttributeAdvancements = () => {
    const attributeChoices = getFilteredChoices('attribute') as AttributeAdvancement[];
    const baseAttributes = character.attributes || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    
    // Calculate current values including all selected attribute advancements
    const calculateCurrentValue = (attribute: keyof Attributes) => {
      const baseValue = baseAttributes[attribute];
      const selectedBonus = selectedAdvancements
        .filter((adv): adv is AttributeAdvancement => adv.type === 'attribute')
        .filter(adv => adv.attribute === attribute)
        .reduce((sum, adv) => sum + adv.bonus, 0);
      return baseValue + selectedBonus;
    };
    
    return (
      <div className="advancement-grid">
        {attributeChoices.map(advancement => {
          const isSelected = isAdvancementSelected(advancement);
          const canSelect = canSelectAdvancement(advancement);
          const disabledReason = getAdvancementDisabledReason(advancement);
          const currentValue = calculateCurrentValue(advancement.attribute);
          const newValue = currentValue + advancement.bonus;
          const isMaxed = currentValue >= 18;
          const isDisabled = isMaxed || !canSelect;
          
          return (
            <div
              key={advancement.id}
              className={`advancement-card attribute-card ${isSelected ? 'selected' : ''} ${isMaxed ? 'maxed' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && handleAdvancementToggle(advancement)}
              title={isDisabled ? (isMaxed ? 'Already at maximum (18)' : disabledReason || 'Cannot select') : undefined}
            >
              <div className="advancement-header">
                <h4>{advancement.name}</h4>
                <div className="attribute-values">
                  <span className="current-value">{currentValue}</span>
                  <span className="arrow">→</span>
                  <span className={`new-value ${isSelected ? 'selected' : ''}`}>
                    {newValue}
                  </span>
                </div>
              </div>
              <p className="advancement-description">{advancement.description}</p>
              {isDisabled && (
                <div className={`disabled-warning ${isMaxed ? 'maxed-warning' : 'limit-warning'}`}>
                  <span>
                    {isMaxed ? '⚠️ Already at maximum (18)' : `🚫 ${disabledReason}`}
                  </span>
                </div>
              )}
              <div className="advancement-footer">
                <span className="advancement-type">Attribute</span>
                {isSelected && <span className="selected-indicator">✓ Selected</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMoveAdvancements = () => {
    const moveChoices = getFilteredChoices('move') as MoveAdvancement[];
    
    return (
      <div className="advancement-grid">
        {moveChoices.map(advancement => {
          const isSelected = isAdvancementSelected(advancement);
          
          return (
            <div
              key={advancement.id}
              className={`advancement-card move-card ${isSelected ? 'selected' : ''} ${advancement.isMulticlass ? 'multiclass' : ''}`}
              onClick={() => handleAdvancementToggle(advancement)}
            >
              <div className="advancement-header">
                <h4>{advancement.name}</h4>
                {advancement.isMulticlass && (
                  <span className="multiclass-badge">Multiclass</span>
                )}
              </div>
              <p className="advancement-description">{advancement.description}</p>
              
              {advancement.prerequisites && advancement.prerequisites.length > 0 && (
                <div className="prerequisites">
                  <strong>Prerequisites:</strong>
                  <ul>
                    {advancement.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="advancement-footer">
                <span className="advancement-type">
                  {advancement.isMulticlass ? `${advancement.sourceClass} Move` : 'Class Move'}
                </span>
                {isSelected && <span className="selected-indicator">✓ Selected</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSpellAdvancements = () => {
    const spellChoices = getFilteredChoices('spell') as SpellAdvancement[];
    
    if (spellChoices.length === 0) {
      return (
        <div className="no-spells-message">
          <p>This class doesn't have spell advancement options.</p>
        </div>
      );
    }
    
    return (
      <div className="advancement-grid">
        {spellChoices.map(advancement => {
          const isSelected = isAdvancementSelected(advancement);
          
          return (
            <div
              key={advancement.id}
              className={`advancement-card spell-card ${isSelected ? 'selected' : ''} ${advancement.isCantrip ? 'cantrip' : ''}`}
              onClick={() => handleAdvancementToggle(advancement)}
            >
              <div className="advancement-header">
                <h4>{advancement.name}</h4>
                <span className="spell-level-badge">
                  {advancement.isCantrip ? 'Cantrip' : `Level ${advancement.spellLevel}`}
                </span>
              </div>
              <p className="advancement-description">{advancement.description}</p>
              
              <div className="advancement-footer">
                <span className="advancement-type">
                  {advancement.isPrepared ? 'Prepared Spell' : 'Known Spell'}
                </span>
                {isSelected && <span className="selected-indicator">✓ Selected</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlanSummary = () => {
    if (!currentPlan) return null;

    return (
      <div className="plan-summary">
        <div className="plan-header">
          <h3>Advancement Plan</h3>
          <div className="plan-progress">
            <span className="progress-text">
              {currentPlan.selectedAdvancements.length} / {currentPlan.targetLevel - 1} choices made
            </span>
            <div 
              className="progress-bar"
              style={{
                '--progress': `${(currentPlan.selectedAdvancements.length / Math.max(1, currentPlan.targetLevel - 1)) * 100}%`
              } as React.CSSProperties}
            >
              <div className="progress-fill" />
            </div>
          </div>
        </div>

        {currentPlan.remainingChoices > 0 && (
          <div className="remaining-choices">
            <span className="remaining-count">{currentPlan.remainingChoices}</span>
            <span className="remaining-text">advancement{currentPlan.remainingChoices > 1 ? 's' : ''} remaining</span>
          </div>
        )}

        {currentPlan.validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>⚠️ Issues Found:</h4>
            <ul>
              {currentPlan.validationErrors.map((error, index) => (
                <li key={index} className="error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {currentPlan.suggestions.length > 0 && (
          <div className="suggestions">
            <h4>💡 Suggestions:</h4>
            <ul>
              {currentPlan.suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {currentPlan.selectedAdvancements.length > 0 && (
          <div className="selected-summary">
            <h4>Selected Advancements:</h4>
            <div className="selected-list">
              {currentPlan.selectedAdvancements.map(advancement => (
                <div key={advancement.id} className="selected-item">
                  <span className="selected-name">{advancement.name}</span>
                  <span className="selected-type">{advancement.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!character.class) {
    return (
      <div className="advancement-selector-placeholder">
        <p>Select a character class first to see advancement options.</p>
      </div>
    );
  }

  if (targetLevel <= 1) {
    return (
      <div className="advancement-selector-placeholder">
        <p>Level 1 characters don't have advancement choices yet!</p>
      </div>
    );
  }

  return (
    <div className={`advancement-selector ${disabled ? 'disabled' : ''}`}>
      <div className="advancement-header">
        <h2>Character Advancement</h2>
        <p className="advancement-description">
          Choose how your level {targetLevel} {character.class} has grown in power.
        </p>
      </div>

      {renderPlanSummary()}

      <div className="advancement-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search advancements..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="advancement-tabs">
          <button
            className={`tab-button ${activeTab === 'attributes' ? 'active' : ''}`}
            onClick={() => setActiveTab('attributes')}
          >
            💪 Attribute Improvements ({getFilteredChoices('attribute').length})
          </button>
          <button
            className={`tab-button ${activeTab === 'moves' ? 'active' : ''}`}
            onClick={() => setActiveTab('moves')}
          >
            ⚔️ Class Abilities ({getFilteredChoices('move').filter(m => !(m as MoveAdvancement).isMulticlass).length})
          </button>
          <button
            className={`tab-button ${activeTab === 'multiclass' ? 'active' : ''}`}
            onClick={() => setActiveTab('multiclass')}
          >
            🎭 Multiclass Options ({getFilteredChoices('move').filter(m => (m as MoveAdvancement).isMulticlass).length})
          </button>
          <button
            className={`tab-button ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            ✨ Spells & Magic ({getFilteredChoices('spell').length})
          </button>
        </div>
      </div>

      <div className="advancement-content">
        {activeTab === 'attributes' && renderAttributeAdvancements()}
        {activeTab === 'moves' && renderMoveAdvancements()}
        {activeTab === 'multiclass' && (
          <div className="advancement-grid">
            {getFilteredChoices('move')
              .filter(m => (m as MoveAdvancement).isMulticlass)
              .map(advancement => {
                const isSelected = isAdvancementSelected(advancement);
                const moveAdv = advancement as MoveAdvancement;
                
                return (
                  <div
                    key={advancement.id}
                    className={`advancement-card move-card multiclass ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAdvancementToggle(advancement)}
                  >
                    <div className="advancement-header">
                      <h4>{advancement.name}</h4>
                      <span className="multiclass-badge">{moveAdv.sourceClass}</span>
                    </div>
                    <p className="advancement-description">{advancement.description}</p>
                    
                    {advancement.prerequisites && advancement.prerequisites.length > 0 && (
                      <div className="prerequisites">
                        <strong>Prerequisites:</strong>
                        <ul>
                          {advancement.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="advancement-footer">
                      <span className="advancement-type">Multiclass Move</span>
                      {isSelected && <span className="selected-indicator">✓ Selected</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        {activeTab === 'spells' && renderSpellAdvancements()}
      </div>
    </div>
  );
};

export default AdvancementSelector;
