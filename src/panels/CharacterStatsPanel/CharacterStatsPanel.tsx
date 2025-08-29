import React, { useEffect, useCallback } from 'react';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { useGameStore } from '../../store/GameStore';
import './CharacterStatsPanel.css';

interface CharacterStatsPanelState {
  // Basic Info
  name: string;
  class: string;
  alignment: string;
  
  // Stats
  hp: number;
  maxHp: number;
  armor: number;
  damage: string;
  level: number;
  xp: number;
  load: number;
  maxLoad: number;
  
  // Attributes
  attributes: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  
  // Debilities
  debilities: {
    weak: boolean;      // -1 STR
    shaky: boolean;     // -1 DEX
    sick: boolean;      // -1 CON
    confused: boolean;  // -1 INT
    scarred: boolean;   // -1 WIS
    stunned: boolean;   // -1 CHA
  };
}

const CharacterStatsPanel: React.FC<PanelProps & { panelState?: CharacterStatsPanelState }> = ({ 
  id, 
  panelState,
  onStateChange,
  isActive
}) => {
  const api = createPanelAPI(id);
  const { state: gameState, setCharacter } = useGameStore();
  
  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null;
  
  // Default state with migration for old data
  const defaultState: CharacterStatsPanelState = {
    name: 'Unnamed Hero',
    class: 'Fighter',
    alignment: 'Neutral',
    hp: 21,
    maxHp: 21,
    armor: 2,
    damage: 'd10',
    level: 1,
    xp: 0,
    load: 5,
    maxLoad: 12,
    attributes: {
      STR: 16,
      DEX: 13,
      CON: 15,
      INT: 8,
      WIS: 12,
      CHA: 9,
    },
    debilities: {
      weak: false,
      shaky: false,
      sick: false,
      confused: false,
      scarred: false,
      stunned: false,
    },
  };
  
  // Merge with existing state, ensuring all properties exist
  const state: CharacterStatsPanelState = {
    ...defaultState,
    ...panelState,
    attributes: {
      ...defaultState.attributes,
      ...(panelState?.attributes || {}),
    },
    debilities: {
      ...defaultState.debilities,
      ...(panelState?.debilities || {}),
    },
  };
  
  // Calculate attribute modifiers
  const getModifier = (score: number): number => {
    if (score <= 3) return -3;
    if (score <= 5) return -2;
    if (score <= 8) return -1;
    if (score <= 12) return 0;
    if (score <= 15) return 1;
    if (score <= 17) return 2;
    return 3;
  };
  
  // Apply debility penalties
  const getEffectiveModifier = useCallback((attribute: keyof typeof state.attributes): number => {
    let modifier = getModifier(state.attributes[attribute]);
    
    // Apply debility penalties
    if (attribute === 'STR' && state.debilities.weak) modifier -= 1;
    if (attribute === 'DEX' && state.debilities.shaky) modifier -= 1;
    if (attribute === 'CON' && state.debilities.sick) modifier -= 1;
    if (attribute === 'INT' && state.debilities.confused) modifier -= 1;
    if (attribute === 'WIS' && state.debilities.scarred) modifier -= 1;
    if (attribute === 'CHA' && state.debilities.stunned) modifier -= 1;
    
    return modifier;
  }, [state.attributes, state.debilities]);
  
  // Calculate max load based on class base + STR modifier
  const calculateMaxLoad = useCallback(() => {
    // Base load by class (DW rules)
    const classBaseLoad: Record<string, number> = {
      'Fighter': 12,
      'Paladin': 12,
      'Ranger': 11,
      'Barbarian': 8,
      'Cleric': 10,
      'Druid': 6,
      'Wizard': 7,
      'Bard': 9,
      'Thief': 9,
      'default': 10
    };
    
    const baseLoad = classBaseLoad[state.class] || classBaseLoad['default'];
    const strModifier = getEffectiveModifier('STR');
    return baseLoad + strModifier;
  }, [state.class, getEffectiveModifier]);

  const handleHpChange = useCallback((delta: number) => {
    const newHp = Math.max(0, Math.min(state.maxHp, state.hp + delta));
    if (onStateChange) {
      onStateChange({ ...state, hp: newHp });
    }
    
    // Emit event for other panels
    api.send('hp-changed', { hp: newHp, maxHp: state.maxHp });
    
    // Check for Last Breath
    if (newHp === 0 && state.hp > 0) {
      api.send('last-breath-triggered', { character: state.name });
    }
  }, [state, onStateChange, api]);
  
  const handleAddXP = useCallback(() => {
    const newXP = state.xp + 1;
    if (onStateChange) {
      onStateChange({ ...state, xp: newXP });
    }
    
    // Check for level up
    if (newXP >= state.level + 7) {
      api.send('level-up-available', { character: state.name, level: state.level });
    }
  }, [state, onStateChange, api]);
  
  const handleRest = useCallback(() => {
    if (onStateChange) {
      onStateChange({ ...state, hp: state.maxHp });
    }
    api.send('character-rested', { character: state.name });
  }, [state, onStateChange, api]);
  
  const handleDebilityToggle = (debility: keyof typeof state.debilities) => {
    if (onStateChange) {
      onStateChange({
        ...state,
        debilities: {
          ...state.debilities,
          [debility]: !state.debilities[debility],
        },
      });
    }
  };
  
  const formatModifier = (mod: number): string => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Get HP status color
  const getHpColor = (): string => {
    const hpPercent = (state.hp / state.maxHp) * 100;
    if (hpPercent > 50) return '#28a745';
    if (hpPercent > 25) return '#ffc107';
    return '#dc3545';
  };

  // Get HP status CSS class
  const getHpClass = (): string => {
    const hpPercent = (state.hp / state.maxHp) * 100;
    if (state.hp <= 0) return 'hp-bar__fill--dead';
    if (hpPercent <= 25) return 'hp-bar__fill--critical';
    if (hpPercent <= 50) return 'hp-bar__fill--injured';
    return 'hp-bar__fill--full';
  };
  
  const rollAttribute = useCallback((attribute: keyof typeof state.attributes) => {
    const modifier = getEffectiveModifier(attribute);
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const total = roll1 + roll2 + modifier;
    
    console.log('Rolling', attribute, ':', roll1, '+', roll2, '+', modifier, '=', total);
    
    api.send('attribute-rolled', {
      attribute,
      roll1,
      roll2,
      modifier,
      total,
      character: state.name
    });
  }, [state, api, getEffectiveModifier]);
  
  // Listen for equipment weight changes
  useEffect(() => {
    const unsubscribe = api.listen('equipment-weight-changed', (data: { totalWeight: number }) => {
      if (onStateChange) {
        onStateChange({ ...state, load: data.totalWeight });
      }
    });
    
    return unsubscribe;
  }, [state, onStateChange, api]);
  
  // Listen for healing item usage
  useEffect(() => {
    const unsubscribe = api.listen('healing-item-used', (data: { item: any; healAmount: number }) => {
      if (onStateChange) {
        const newHp = Math.min(state.maxHp, state.hp + data.healAmount);
        onStateChange({ ...state, hp: newHp });
        
        // Notify about the healing
        api.send('character-healed', { 
          character: state.name, 
          healAmount: data.healAmount,
          item: data.item.name,
          newHp 
        });
      }
    });
    
    return unsubscribe;
  }, [state, onStateChange, api]);
  
  // Listen for equipment armor changes
  useEffect(() => {
    const unsubscribe = api.listen('equipment-armor-changed', (data: { totalArmor: number }) => {
      if (onStateChange) {
        onStateChange({ ...state, armor: data.totalArmor });
      }
    });
    
    return unsubscribe;
  }, [state, onStateChange, api]);
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(e.key) {
        case 'ArrowUp':
        case '+':
          e.preventDefault();
          handleHpChange(1);
          break;
        case 'ArrowDown':
        case '-':
          e.preventDefault();
          handleHpChange(-1);
          break;
        case ' ':
          e.preventDefault();
          // Roll 2d6
          api.send('quick-roll', { type: '2d6' });
          break;
        case '1':
          e.preventDefault();
          rollAttribute('STR');
          break;
        case '2':
          e.preventDefault();
          rollAttribute('DEX');
          break;
        case '3':
          e.preventDefault();
          rollAttribute('CON');
          break;
        case '4':
          e.preventDefault();
          rollAttribute('INT');
          break;
        case '5':
          e.preventDefault();
          rollAttribute('WIS');
          break;
        case '6':
          e.preventDefault();
          rollAttribute('CHA');
          break;
        case 'x':
        case 'X':
          e.preventDefault();
          handleAddXP();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRest();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleHpChange, handleAddXP, handleRest, rollAttribute, api]);

  // Use character from game store if available, otherwise fall back to local state
  const displayCharacter = character || {
    name: state.name,
    class: state.class,
    level: state.level,
    alignment: state.alignment,
    hp: { current: state.hp, max: state.maxHp },
    armor: state.armor,
    damageDie: state.damage,
    xp: state.xp,
    load: { current: state.load, max: calculateMaxLoad() },
    attributes: state.attributes,
    debilities: state.debilities
  };

  return (
    <div className="character-stats-panel">
      {/* Character Header */}
      <div className="character-header">
        <h2 className="character-name">{displayCharacter.name}</h2>
        <div className="character-info">
          <span className="character-class">{displayCharacter.class}</span>
          <span className="character-level">Level {displayCharacter.level}</span>
          <span className="character-alignment">{displayCharacter.alignment}</span>
        </div>
      </div>
      
      <div className="stats-grid">
        {/* HP Section */}
        <div className="stat-card stat-card--hp">
          <h3>Hit Points</h3>
          <div className="hp-display">
            <button 
              className="hp-button hp-button--minus"
              onClick={() => handleHpChange(-1)}
            >
              -
            </button>
            <div className="hp-value">
              <span className="hp-current">{displayCharacter.hp?.current ?? state.hp}</span>
              <span className="hp-separator">/</span>
              <span className="hp-max">{displayCharacter.hp?.max ?? state.maxHp}</span>
            </div>
            <button 
              className="hp-button hp-button--plus"
              onClick={() => handleHpChange(1)}
            >
              +
            </button>
          </div>
          <div className="hp-bar">
            <div 
              className={`hp-bar__fill ${getHpClass()}`}
              style={{ 
                width: `${(state.hp / state.maxHp) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Armor & Damage */}
        <div className="stat-card">
          <h3>Combat Stats</h3>
          <div className="combat-stats">
            <div className="stat-item">
              <span className="stat-label">Armor:</span>
              <span className="stat-value">{state.armor}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Damage:</span>
              <span className="stat-value">{state.damage}</span>
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="stat-card">
          <h3>Experience</h3>
          <div className="experience-stats">
            <div className="stat-item">
              <span className="stat-label">Level:</span>
              <span className="stat-value">{state.level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">XP:</span>
              <span className="stat-value">{state.xp}/{state.level + 7}</span>
            </div>
          </div>
          <div className="xp-bar">
            <div 
              className="xp-bar__fill"
              style={{ width: `${(state.xp / (state.level + 7)) * 100}%` }}
            />
          </div>
          <div className="quick-actions">
            <button className="action-button action-button--xp" onClick={handleAddXP}>
              Add XP
            </button>
            {state.xp >= state.level + 7 && (
              <span className="level-up-ready">Level Up Available!</span>
            )}
          </div>
        </div>

        {/* Load */}
        <div className="stat-card">
          <h3>Load</h3>
          <div className="load-display">
            <span className="load-current">{state.load}</span>
            <span className="load-separator">/</span>
            <span className="load-max">{calculateMaxLoad()}</span>
          </div>
          <div className="load-bar">
            <div 
              className="load-bar__fill"
              style={{ 
                width: `${(state.load / calculateMaxLoad()) * 100}%`,
                backgroundColor: state.load > calculateMaxLoad() ? '#dc3545' : '#5e72e4'
              }}
            />
          </div>
          {state.load > calculateMaxLoad() && (
            <div className="load-warning">Encumbered!</div>
          )}
        </div>
      </div>

      {/* Attributes & Rolls */}
      <div className="attributes-section">
        <h3>Attributes</h3>
        <div className="attributes-grid">
          {(displayCharacter.attributes || state.attributes) && Object.entries(displayCharacter.attributes || state.attributes).map(([attr, score]) => {
            const modifier = getEffectiveModifier(attr as keyof typeof state.attributes);
            const hasDebility = (
              (attr === 'STR' && state.debilities.weak) ||
              (attr === 'DEX' && state.debilities.shaky) ||
              (attr === 'CON' && state.debilities.sick) ||
              (attr === 'INT' && state.debilities.confused) ||
              (attr === 'WIS' && state.debilities.scarred) ||
              (attr === 'CHA' && state.debilities.stunned)
            );
            
            return (
              <div key={attr} className="attribute-card">
                <button 
                  className={`attribute-button ${hasDebility ? 'attribute-button--debility' : ''}`}
                  title={`Roll 2d6${formatModifier(modifier)}`}
                  onClick={() => rollAttribute(attr as keyof typeof state.attributes)}
                >
                  <span className="attribute-name">{attr}</span>
                  <span className="attribute-score">{score as number}</span>
                  <span className="attribute-modifier">{formatModifier(modifier)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Debilities */}
      <div className="debilities-section">
        <h3>Debilities</h3>
        <div className="debilities-grid">
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.weak}
              onChange={() => handleDebilityToggle('weak')}
            />
            <span>Weak (-1 STR)</span>
          </label>
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.shaky}
              onChange={() => handleDebilityToggle('shaky')}
            />
            <span>Shaky (-1 DEX)</span>
          </label>
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.sick}
              onChange={() => handleDebilityToggle('sick')}
            />
            <span>Sick (-1 CON)</span>
          </label>
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.confused}
              onChange={() => handleDebilityToggle('confused')}
            />
            <span>Confused (-1 INT)</span>
          </label>
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.scarred}
              onChange={() => handleDebilityToggle('scarred')}
            />
            <span>Scarred (-1 WIS)</span>
          </label>
          <label className="debility-item">
            <input 
              type="checkbox" 
              checked={state.debilities.stunned}
              onChange={() => handleDebilityToggle('stunned')}
            />
            <span>Stunned (-1 CHA)</span>
          </label>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions-section">
        <button className="action-button action-button--rest" onClick={handleRest}>
          Rest (Restore HP)
        </button>
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">
        <h4>Keyboard Shortcuts</h4>
        <div className="shortcuts-grid">
          <span className="shortcut"><kbd>↑</kbd> / <kbd>+</kbd> Increase HP</span>
          <span className="shortcut"><kbd>↓</kbd> / <kbd>-</kbd> Decrease HP</span>
          <span className="shortcut"><kbd>1-6</kbd> Roll Attribute</span>
          <span className="shortcut"><kbd>X</kbd> Add XP</span>
          <span className="shortcut"><kbd>R</kbd> Rest</span>
          <span className="shortcut"><kbd>Space</kbd> Roll 2d6</span>
        </div>
      </div>
    </div>
  );
};

// Export the component separately for HMR compatibility
export { CharacterStatsPanel };

// Export the panel configuration
const characterStatsPanelConfig = createPanel(
  {
    id: 'character-stats',
    name: 'Character Stats',
    icon: '👤',
    description: 'View and manage character attributes, HP, and status',
    priority: 1,
    preload: true,
  },
  CharacterStatsPanel,
  {
    getInitialState: () => {
      const defaultState: CharacterStatsPanelState = {
        name: 'Unnamed Hero',
        class: 'Fighter',
        alignment: 'Neutral',
        hp: 21,
        maxHp: 21,
        armor: 2,
        damage: 'd10',
        level: 1,
        xp: 0,
        load: 5,
        maxLoad: 12,
        attributes: {
          STR: 16,
          DEX: 13,
          CON: 15,
          INT: 8,
          WIS: 12,
          CHA: 9,
        },
        debilities: {
          weak: false,
          shaky: false,
          sick: false,
          confused: false,
          scarred: false,
          stunned: false,
        },
      };
      return defaultState;
    },
  }
);

export default characterStatsPanelConfig;
