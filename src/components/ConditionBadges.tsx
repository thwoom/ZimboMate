import React from 'react';
import { Condition, ActiveCondition } from '../models/Conditions';
import '../styles/calculations.css';

interface ConditionBadgesProps {
  conditions: ActiveCondition[];
  definitions: Partial < Condition>[];
}

export const ConditionBadges: React.FC < ConditionBadgesProps> = ({
  conditions,
  definitions,
}) => {
  if (!conditions || conditions.length === 0) return null;

  const getConditionDefinition = (id: string) => {
    return definitions.find(def => def.id === id || def.name === id);
  };

  const getBadgeClass = (condition: Partial < Condition>) => {
    // Determine if condition is positive, negative, or neutral
    const hasNegativeModifiers =
      (condition.modifiers?.ongoing || 0) < 0 ||
      (condition.modifiers?.forward || 0) < 0 ||
      (condition.modifiers?.armor || 0) < 0;

    const hasPositiveModifiers =
      (condition.modifiers?.ongoing || 0) > 0 ||
      (condition.modifiers?.forward || 0) > 0 ||
      (condition.modifiers?.armor || 0) > 0;

    if (hasNegativeModifiers) return 'negative';
    if (hasPositiveModifiers) return 'positive';
    return 'neutral';
  };

  return (
    <div className="condition-badges-container">
      {conditions.map(activeCondition => {
        const definition = getConditionDefinition(activeCondition.conditionId);
        if (!definition) return null;

        const badgeClass = getBadgeClass(definition);
        const modifierText = [];

        if (definition.modifiers?.ongoing !== 0) {
          const ongoing = definition.modifiers?.ongoing || 0;
          modifierText.push(`${ongoing > 0 ? '+' : ''}${ongoing} ongoing`);
        }
        if (definition.modifiers?.forward !== 0) {
          const forward = definition.modifiers?.forward || 0;
          modifierText.push(`${forward > 0 ? '+' : ''}${forward} forward`);
        }
        if (definition.modifiers?.armor !== 0) {
          const armor = definition.modifiers?.armor || 0;
          modifierText.push(`${armor > 0 ? '+' : ''}${armor} armor`);
        }

        return (
          <span
            key={activeCondition.conditionId}
            className={`condition-badge ${badgeClass}`}
            title={`${definition.description}\n${modifierText.join(', ')}`}
          >
            {definition.name}
            {activeCondition.stacks > 1 && (
              <span className="stacks"> ({activeCondition.stacks})</span>
            )}
          </span>
        );
      })}
    </div>
  );
};
