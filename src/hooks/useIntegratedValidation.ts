import { useMemo, useCallback, useEffect, useState } from 'react';
import { useGameStore } from '../store/GameStore';
import { useCalculatedValues } from '../store/calculationHooks';
import { useGameStateValidation } from '../store/validationHooks';
import { ValidationResult } from '../services/Validation';
import { CalculationWarning } from '../services/CalculationWarnings';

export interface IntegratedValidation {
  // Combined validation results
  allErrors: string[];
  allWarnings: string[];
  allInfo: string[];
  
  // Categorized issues
  calculationErrors: string[];
  calculationWarnings: CalculationWarning[];
  validationErrors: string[];
  validationWarnings: string[];
  
  // Real-time validation status
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  
  // Suggestions
  suggestions: string[];
  
  // Validation helpers
  validateBeforeAction: (action: string) => { canProceed: boolean; issues: string[] };
  clearValidation: () => void;
}

export function useIntegratedValidation(): IntegratedValidation {
  const { state } = useGameStore();
  const calculatedValues = useCalculatedValues();
  const { errors: validationErrors, warnings: validationWarnings } = useGameStateValidation();
  const [customErrors, setCustomErrors] = useState<string[]>([]);
  
  // Combine all errors
  const allErrors = useMemo(() => {
    const errors: string[] = [];
    
    // Add calculation errors
    if (calculatedValues?.errors) {
      errors.push(...calculatedValues.errors);
    }
    
    // Add validation errors
    validationErrors.forEach(err => {
      errors.push(err);
    });
    
    // Add custom errors
    errors.push(...customErrors);
    
    // Add critical calculation warnings as errors
    calculatedValues?.detailedWarnings
      ?.filter(w => w.type === 'critical' || w.type === 'error')
      ?.forEach(w => errors.push(w.message));
    
    return errors;
  }, [calculatedValues, validationErrors, customErrors]);
  
  // Combine all warnings
  const allWarnings = useMemo(() => {
    const warnings: string[] = [];
    
    // Add calculation warnings
    if (calculatedValues?.warnings) {
      warnings.push(...calculatedValues.warnings);
    }
    
    // Add validation warnings
    validationWarnings.forEach(warn => {
      warnings.push(warn);
    });
    
    // Add non-critical calculation warnings
    calculatedValues?.detailedWarnings
      ?.filter(w => w.type === 'warning')
      ?.forEach(w => warnings.push(w.message));
    
    return warnings;
  }, [calculatedValues, validationWarnings]);
  
  // Extract info messages
  const allInfo = useMemo(() => {
    const info: string[] = [];
    
    calculatedValues?.detailedWarnings
      ?.filter(w => w.type === 'info')
      ?.forEach(w => info.push(w.message));
    
    return info;
  }, [calculatedValues]);
  
  // Combined suggestions
  const suggestions = useMemo(() => {
    const sugg: string[] = [];
    
    // Add optimization suggestions
    if (calculatedValues?.optimizationSuggestions) {
      sugg.push(...calculatedValues.optimizationSuggestions);
    }
    
    // Add suggestions from detailed warnings
    calculatedValues?.detailedWarnings?.forEach(w => {
      if (w.suggestion) {
        sugg.push(w.suggestion);
      }
    });
    
    return [...new Set(sugg)]; // Remove duplicates
  }, [calculatedValues]);
  
  // Validate before action
  const validateBeforeAction = useCallback((action: string): { canProceed: boolean; issues: string[] } => {
    const issues: string[] = [];
    const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null;
    const inventory = state.activeCharacterId ? state.inventories[state.activeCharacterId] : null;
    
    if (!character || !inventory) {
      return { canProceed: false, issues: ['No active character'] };
    }
    
    switch (action) {
      case 'levelUp':
        if (!calculatedValues?.canLevelUp) {
          issues.push('Not enough XP to level up');
        }
        if (character.level >= 10) {
          issues.push('Already at maximum level');
        }
        break;
        
      case 'equipItem':
        if (calculatedValues?.encumbranceStatus === 'overloaded') {
          issues.push('Cannot equip items while overloaded');
        }
        break;
        
      case 'rest':
        if (character.hp.current <= 0) {
          issues.push('Cannot rest while at 0 HP - resolve Last Breath first');
        }
        break;
        
      case 'travel':
        if (calculatedValues?.encumbranceStatus === 'overloaded') {
          issues.push('Cannot travel while overloaded');
        }
        if (character.hp.current <= 0) {
          issues.push('Cannot travel while at 0 HP');
        }
        break;
        
      case 'combat':
        if (character.hp.current <= 0) {
          issues.push('Cannot enter combat at 0 HP');
        }
        const hasWeapon = Object.values(inventory.items).some(item => 
          item.category === 'weapon' && item.equipped
        );
        if (!hasWeapon) {
          issues.push('No weapon equipped - will fight unarmed');
        }
        break;
    }
    
    // Check for critical errors
    const criticalErrors = calculatedValues?.detailedWarnings?.filter(
      w => w.type === 'critical'
    ) || [];
    
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(err => issues.push(err.message));
    }
    
    return {
      canProceed: issues.length === 0,
      issues
    };
  }, [state, calculatedValues]);
  
  // Real-time validation effect
  useEffect(() => {
    const errors: string[] = [];
    
    // Validate character state
    if (state.activeCharacterId) {
      const character = state.characters[state.activeCharacterId];
      const inventory = state.inventories[state.activeCharacterId];
      
      if (character && inventory) {
        // HP validation
        if (character.hp.current > character.hp.max) {
          errors.push('Current HP exceeds maximum HP');
        }
        
        // Inventory weight validation
        const totalWeight = Object.values(inventory.items).reduce((sum, item) => 
          sum + (item.weight * (item.quantity || 1)), 0
        );
        if (totalWeight < 0) {
          errors.push('Invalid inventory weight calculation');
        }
        
        // Attribute validation
        Object.entries(character.attributes).forEach(([attr, value]) => {
          if (value < 3 || value > 18) {
            errors.push(`${attr} attribute value (${value}) is outside valid range (3-18)`);
          }
        });
      }
    }
    
    setCustomErrors(errors);
  }, [state]);
  
  return {
    allErrors,
    allWarnings,
    allInfo,
    calculationErrors: calculatedValues?.errors || [],
    calculationWarnings: calculatedValues?.detailedWarnings || [],
    validationErrors,
    validationWarnings,
    isValid: allErrors.length === 0,
    hasErrors: allErrors.length > 0,
    hasWarnings: allWarnings.length > 0,
    suggestions,
    validateBeforeAction,
    clearValidation: () => setCustomErrors([])
  };
}
