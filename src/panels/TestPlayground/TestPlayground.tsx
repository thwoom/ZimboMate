/**
 * Test Playground for manually testing data models and state management
 */

import React, { useState } from 'react';
import { Panel, PanelProps } from '../../framework/Panel';
import {
  useGameStore,
  useCharacter,
  useInventory,
  useCharacterActions,
  useInventoryActions,
  useRollActions,
  useCharacterStats,
  useValidatedCharacterUpdate,
  useValidatedItemOperations,
  useCharacterAdvancement,
  useGameStateValidation,
  useCalculatedValues,
  useArmorCalculations,
  useDamageCalculations,
  useLoadCalculations,
  useAutoCalculate
} from '../../store';
import {
  Character,
  getClassBaseHP,
  getClassBaseLoad,
  getClassDamageDie
} from '../../models/Character';
import { Item, Weapon, Armor } from '../../models/Equipment';
import { useValueAnimation } from '../../hooks/useValueAnimation';
import { ConditionBadges } from '../../components/ConditionBadges';
import { CalculationHistory } from '../../components/CalculationHistory';
import { ModifiersPanel } from '../../components/ModifiersPanel';
import { CalculationWarnings } from '../../components/CalculationWarnings';
import { COMMON_CONDITIONS } from '../../models/Conditions';
import { useCalculationHistory } from '../../hooks/useCalculationHistory';
import { useModifiers } from '../../hooks/useModifiers';
import { useIntegratedValidation } from '../../hooks/useIntegratedValidation';
import { RealTimeValidation } from '../../components/RealTimeValidation';
import '../../styles/calculations.css';
import './TestPlayground.css';

const TestPlayground: React.FC = () => {
  const { state, setCharacter, saveGame, loadGame, resetGame } = useGameStore();
  const character = useCharacter();
  const inventory = useInventory();
  const stats = useCharacterStats();
  const { takeDamage, heal, gainXP, toggleDebility } = useCharacterActions();
  const { addItem, toggleEquipped, updateItemQuantity } = useInventoryActions();
  const { rollAttribute, rollDamage } = useRollActions();
  const { levelUp, canLevelUp } = useCharacterAdvancement();
  const { errors, warnings } = useGameStateValidation();
  
  // Auto-calculation hooks
  const calculatedValues = useCalculatedValues();
  const armorCalc = useArmorCalculations();
  const damageCalc = useDamageCalculations();
  const loadCalc = useLoadCalculations();
  
  // Calculation history
  const {
    recentChanges,
    clearHistory,
    exportHistory
  } = useCalculationHistory(character, calculatedValues);
  
  // Modifiers
  const {
    modifiers,
    addModifier,
    removeModifier,
    updateModifier,
    clearExpiredModifiers
  } = useModifiers();
  
  // Integrated validation
  const integratedValidation = useIntegratedValidation();

  const [rollResults, setRollResults] = useState<any[]>([]);

  // Create test character
  const createTestCharacter = () => {
    const testChar: Character = {
      id: 'test-char-1',
      name: 'Test Hero',
      class: 'Fighter',
      race: 'Human',
      level: 1,
      alignment: 'Good',
      alignmentMove: 'Defend those weaker than you',
      attributes: {
        STR: 16,
        DEX: 14,
        CON: 13,
        INT: 9,
        WIS: 12,
        CHA: 8
      },
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false
      },
      hp: {
        current: getClassBaseHP('Fighter') + 1, // +1 from CON
        max: getClassBaseHP('Fighter') + 1
      },
      armor: 0,
      damageDie: getClassDamageDie('Fighter'),
      xp: 0,
      load: {
        current: 0,
        max: getClassBaseLoad('Fighter') + 2 // +2 from STR
      },
      baseLoad: getClassBaseLoad('Fighter'),
      coin: 50,
      bonds: [
        { id: '1', text: 'I have sworn to protect [Name]', resolved: false },
        { id: '2', text: '[Name] owes me their life', resolved: false }
      ],
      advancements: [],
      knownMoves: [],
      conditions: [],
      looks: 'Weathered face, kind eyes, muscular build',
      backstory: 'A veteran soldier turned adventurer',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCharacter(testChar);
  };

  // Create test items
  const createTestItems = () => {
    const sword: Weapon = {
      id: 'sword-1',
      name: 'Iron Sword',
      category: 'weapon',
      tags: [
        { name: 'close' },
        { name: 'weight', value: 1 }
      ],
      weight: 1,
      value: 10,
      quantity: 1,
      equipped: false,
      damage: '+1 damage'
    };

    const armor: Armor = {
      id: 'armor-1',
      name: 'Leather Armor',
      category: 'armor',
      tags: [
        { name: 'worn' },
        { name: 'weight', value: 1 }
      ],
      weight: 1,
      value: 10,
      quantity: 1,
      equipped: false,
      armorValue: 1
    };

    const potion: Item = {
      id: 'potion-1',
      name: 'Healing Potion',
      category: 'consumable',
      tags: [{ name: 'weight', value: 0 }],
      weight: 0,
      value: 50,
      quantity: 3,
      equipped: false,
      description: 'Heal 2d4 HP when consumed',
      uses: { current: 3, max: 3 }
    };

    addItem(sword, 'carried');
    addItem(armor, 'carried');
    addItem(potion, 'consumables');
  };

  // Handle rolls
  const handleAttributeRoll = (attr: keyof Character['attributes']) => {
    const result = rollAttribute(attr);
    if (result) {
      setRollResults(prev => [{
        type: 'attribute',
        attr,
        ...result,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    }
  };

  const handleDamageRoll = () => {
    const result = rollDamage();
    if (result) {
      setRollResults(prev => [{
        type: 'damage',
        ...result,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    }
  };

  // Render character stats
  const renderCharacterSection = () => {
    // Animation hooks for key values
    const hpAnimation = useValueAnimation(character?.hp.current || 0, 'hp');
    const armorAnimation = useValueAnimation(stats?.totalArmor || 0, 'armor');
    const xpAnimation = useValueAnimation(character?.xp || 0, 'xp');
    
    if (!character) {
      return (
        <div className="test-section">
          <h3>Character</h3>
          <button onClick={createTestCharacter}>Create Test Character</button>
        </div>
      );
    }

    return (
      <div className="test-section">
        <h3>Character: {character.name}</h3>
        <div className="stat-grid">
          <div>Class: {character.class}</div>
          <div>Level: {character.level}</div>
          <div>XP: <span {...xpAnimation}>{character.xp}</span>/{character.level + 7}</div>
          <div>HP: <span {...hpAnimation}>{character.hp.current}</span>/{character.hp.max}</div>
          <div>
            Armor: 
            {armorCalc?.breakdown ? (
              <span className="calculation-breakdown">
                <span {...armorAnimation}>{stats?.totalArmor || 0}</span>
                <span className="breakdown-tooltip">
                  {armorCalc.breakdown.map(b => `${b.label}: ${b.value >= 0 ? '+' : ''}${b.value}`).join(' ')}
                  {' = '}{stats?.totalArmor || 0}
                </span>
              </span>
            ) : (
              <span {...armorAnimation}>{stats?.totalArmor || 0}</span>
            )}
          </div>
          <div>Load: {stats?.currentLoad || 0}/{stats?.maxLoad || 0}</div>
        </div>
        
        {/* Condition badges */}
        {state.conditions.length > 0 && (
          <div className="conditions-section">
            <h4>Active Conditions</h4>
            <ConditionBadges 
              conditions={state.conditions} 
              definitions={COMMON_CONDITIONS}
            />
          </div>
        )}

        <h4>Attributes</h4>
        <div className="attribute-grid">
          {Object.entries(character.attributes).map(([attr, score]) => (
            <div key={attr} className="attribute-box">
              <span>{attr}: {score} ({stats?.effectiveModifiers[attr as keyof Character['attributes']] || 0})</span>
              <button onClick={() => handleAttributeRoll(attr as keyof Character['attributes'])}>
                Roll
              </button>
            </div>
          ))}
        </div>

        <h4>Debilities</h4>
        <div className="debility-grid">
          {Object.entries(character.debilities).map(([deb, active]) => (
            <label key={deb}>
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleDebility(deb as keyof Character['debilities'])}
              />
              {deb}
            </label>
          ))}
        </div>

        <h4>Actions</h4>
        <div className="action-buttons">
          <button onClick={() => takeDamage(3)}>Take 3 Damage</button>
          <button onClick={() => heal(5)}>Heal 5 HP</button>
          <button onClick={() => gainXP(2)}>Gain 2 XP</button>
          <button onClick={handleDamageRoll}>Roll Damage</button>
          {canLevelUp && (
            <button onClick={() => levelUp('STR')} className="level-up">
              Level Up! (Increase STR)
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render inventory section
  const renderInventorySection = () => {
    const items = inventory ? Object.values(inventory.items) : [];

    return (
      <div className="test-section">
        <h3>Inventory</h3>
        {items.length === 0 ? (
          <button onClick={createTestItems}>Create Test Items</button>
        ) : (
          <div className="item-list">
            {items.map(item => (
              <div key={item.id} className="item-row">
                <span className={item.equipped ? 'equipped' : ''}>
                  {item.name} (x{item.quantity}, {item.weight * item.quantity} weight)
                </span>
                <div className="item-actions">
                  <button onClick={() => toggleEquipped(item.id)}>
                    {item.equipped ? 'Unequip' : 'Equip'}
                  </button>
                  <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>-</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="inventory-stats">
          <div>Total Weight: {stats?.currentLoad || 0}</div>
          <div>Status: {stats?.encumbranceStatus || 'normal'}</div>
        </div>
      </div>
    );
  };

  // Render roll results
  const renderRollResults = () => (
    <div className="test-section">
      <h3>Roll Results</h3>
      <div className="roll-results">
        {rollResults.map((result, i) => (
          <div key={i} className={`roll-result ${result.result}`}>
            {result.type === 'attribute' ? (
              <>
                Roll+{result.attr}: {result.rolls.join('+')} + {result.modifier} = {result.total}
                ({result.result})
              </>
            ) : (
              <>
                Damage: {result.rolls.join('+')} = {result.total}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render validation section
  const renderValidationSection = () => (
    <div className="test-section">
      <h3>Validation Status</h3>
      {errors.length > 0 && (
        <div className="validation-errors">
          <h4>Errors:</h4>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="validation-warnings">
          <h4>Warnings:</h4>
          <ul>
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      {errors.length === 0 && warnings.length === 0 && (
        <div className="validation-success">✅ All validations passed</div>
      )}
    </div>
  );

  // Render auto-calculation section
  const renderCalculationsSection = () => {
    if (!calculatedValues) return null;

    return (
      <div className="test-section">
        <h3>Auto-Calculations</h3>
        
        <h4>Armor Breakdown</h4>
        {armorCalc && (
          <div className="calc-breakdown">
            {armorCalc.breakdown.map((item, i) => (
              <div key={i}>{item.label}: {item.value}</div>
            ))}
            <div className="total">Total: {armorCalc.total}</div>
          </div>
        )}

        <h4>Damage Output</h4>
        {damageCalc && (
          <div className="calc-breakdown">
            <div>Expression: {damageCalc.totalExpression}</div>
            {damageCalc.breakdown.map((item, i) => (
              <div key={i}>{item.label}: {item.value}</div>
            ))}
          </div>
        )}

        <h4>Load Details</h4>
        {loadCalc && (
          <div className="calc-breakdown">
            <div>Current: {loadCalc.currentLoad}/{loadCalc.maxLoad} ({loadCalc.percentage.toFixed(1)}%)</div>
            <div>Status: {loadCalc.status}</div>
            {loadCalc.penalties.map((penalty, i) => (
              <div key={i} className="error">{penalty.description}</div>
            ))}
          </div>
        )}

        <h4>Modifiers</h4>
        <div className="modifier-grid">
          <div>Ongoing: {calculatedValues.ongoingModifier}</div>
          <div>Forward: {calculatedValues.forwardModifier}</div>
          <div>Encumbrance: {calculatedValues.encumbrancePenalty}</div>
        </div>

        <h4>XP & Leveling</h4>
        <div>
          <div>XP: {character?.xp || 0}/{calculatedValues.xpThreshold}</div>
          <div>Can Level: {calculatedValues.canLevelUp ? 'Yes' : 'No'}</div>
        </div>

        <h4>Calculation Warnings</h4>
        {calculatedValues.warnings.length > 0 ? (
          <ul>
            {calculatedValues.warnings.map((warning, i) => (
              <li key={i} className="warning">{warning}</li>
            ))}
          </ul>
        ) : (
          <p className="success">✓ No calculation warnings</p>
        )}
      </div>
    );
  };

  // Render save/load section
  const renderSaveLoadSection = () => (
    <div className="test-section">
      <h3>Save/Load</h3>
      <div className="action-buttons">
        <button onClick={() => saveGame('Test Save')}>Save Game</button>
        <button onClick={() => loadGame()}>Load Game</button>
        <button onClick={resetGame} className="danger">Reset All</button>
      </div>
      <div className="save-info">
        <div>Is Dirty: {state.isDirty ? 'Yes' : 'No'}</div>
        <div>Last Saved: {state.lastSaved?.toLocaleString() || 'Never'}</div>
      </div>
    </div>
  );

  // Render calculation history section
  const renderHistorySection = () => (
    <div className="test-section">
      <h3>Calculation History</h3>
      <CalculationHistory
        changes={recentChanges}
        onClear={clearHistory}
        onExport={() => {
          const data = exportHistory();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `calculation-history-${new Date().toISOString()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      />
    </div>
  );

  // Render modifiers section
  const renderModifiersSection = () => (
    <div className="test-section">
      <h3>Temporary Modifiers</h3>
      <ModifiersPanel
        modifiers={modifiers}
        onAddModifier={addModifier}
        onRemoveModifier={removeModifier}
        onUpdateModifier={updateModifier}
        onClearExpired={clearExpiredModifiers}
      />
    </div>
  );

  // Render enhanced warnings section
  const renderWarningsSection = () => {
    if (!calculatedValues) return null;
    
    return (
      <div className="test-section">
        <h3>Analysis & Warnings</h3>
        <CalculationWarnings
          warnings={calculatedValues.detailedWarnings || []}
          suggestions={calculatedValues.optimizationSuggestions || []}
          onAction={(warning) => {
            console.log('Action triggered for warning:', warning);
            // Handle actionable warnings here
          }}
        />
      </div>
    );
  };

  return (
    <div className="test-playground">
      <h2>Test Playground</h2>
      
      {/* Real-time validation status */}
      <div className="validation-status-bar">
        <RealTimeValidation 
          validation={integratedValidation}
          compact={true}
          showSuggestions={true}
        />
      </div>
      
      <div className="playground-grid">
        {renderCharacterSection()}
        {renderInventorySection()}
        {renderRollResults()}
        {renderModifiersSection()}
        {renderWarningsSection()}
        {renderCalculationsSection()}
        {renderHistorySection()}
        {renderValidationSection()}
        {renderSaveLoadSection()}
      </div>
    </div>
  );
};

const TestPlaygroundPanel: Panel = {
  metadata: {
    id: 'test-playground',
    name: 'Test Playground',
    icon: '🧪',
    description: 'Manual testing environment for data models and state management',
    priority: 999 // Low priority, dev tool
  },
  component: TestPlayground as React.ComponentType<PanelProps>
};

export default TestPlaygroundPanel;
