import './CharacterCreationAssistant.css';

import React, { useCallback, useEffect, useRef,useState } from 'react';

import { CharacterClass } from '../models/Character';
import { ValidationResult } from '../services/CharacterValidation';
import { randomGeneratorService } from '../services/RandomGenerators';

// Types matching the CharacterCreationPanel
type CharacterCreationStep =
  | 'intro'
  | 'templates'
  | 'name-look'
  | 'background'
  | 'portrait'
  | 'class'
  | 'race'
  | 'personality'
  | 'spells'
  | 'attributes'
  | 'level'
  | 'moves-equipment'
  | 'bonds'
  | 'alignment'
  | 'advanced-options'
  | 'review'
  | 'advancement';

interface CharacterCreationState {
  currentStep: CharacterCreationStep;
  characterData: unknown; // Using unknown for now to avoid complex imports
  [key: string]: unknown;
}

interface CharacterCreationAssistantProps {
  currentStep: CharacterCreationStep;
  currentState: CharacterCreationState;
  validationResult?: ValidationResult;
  onStateUpdate: (updates: Partial < CharacterCreationState>) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onFinalizeCharacter: () => void;
  canProceed: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

type AssistantMode = 'collapsed' | 'navigation' | 'tools' | 'validation' | 'help';

interface StepInfo {
  title: string;
  description: string;
  icon: string;
  tools: string[];
}

const STEP_INFO: Record < CharacterCreationStep, StepInfo> = {
  intro: {
    title: 'Getting Started',
    description: 'Choose how to create your character',
    icon: '🎭',
    tools: ['templates', 'random-full'],
  },
  templates: {
    title: 'Templates',
    description: 'Quick start templates',
    icon: '📋',
    tools: ['random-template', 'import-template'],
  },
  'name-look': {
    title: 'Identity',
    description: 'Name and appearance',
    icon: '👤',
    tools: ['random-name', 'random-look', 'name-generator'],
  },
  background: {
    title: 'Background',
    description: 'Character history and origins',
    icon: '📖',
    tools: ['random-background', 'background-suggestions'],
  },
  portrait: {
    title: 'Portrait',
    description: 'Character appearance',
    icon: '🖼️',
    tools: ['portrait-gallery', 'upload-custom'],
  },
  class: {
    title: 'Class',
    description: 'Choose your character class',
    icon: '⚔️',
    tools: ['random-class', 'class-quiz', 'compare-classes'],
  },
  race: {
    title: 'Race',
    description: 'Character ancestry',
    icon: '🧝',
    tools: ['random-race', 'race-suggestions'],
  },
  level: {
    title: 'Level',
    description: 'Starting level',
    icon: '📈',
    tools: ['set-level'],
  },
  advancement: {
    title: 'Advancement',
    description: 'Level advancement choices',
    icon: '⬆️',
    tools: ['auto-advance', 'balanced-advance'],
  },
  personality: {
    title: 'Personality',
    description: 'Traits and quirks',
    icon: '🎭',
    tools: ['random-personality', 'trait-suggestions'],
  },
  spells: {
    title: 'Spells',
    description: 'Starting magical abilities',
    icon: '✨',
    tools: ['random-spells', 'spell-recommendations'],
  },
  attributes: {
    title: 'Attributes',
    description: 'Assign ability scores',
    icon: '📊',
    tools: ['auto-assign', 'balanced-build', 'min-max-build'],
  },
  'moves-equipment': {
    title: 'Gear & Moves',
    description: 'Starting equipment and abilities',
    icon: '🎒',
    tools: ['random-gear', 'optimal-loadout', 'move-suggestions'],
  },
  bonds: {
    title: 'Bonds',
    description: 'Relationships with other characters',
    icon: '🤝',
    tools: ['bond-generator', 'relationship-ideas'],
  },
  alignment: {
    title: 'Alignment',
    description: 'Moral compass',
    icon: '⚖️',
    tools: ['alignment-quiz', 'alignment-guide'],
  },
  'advanced-options': {
    title: 'Advanced Options',
    description: 'Compendium classes and special abilities',
    icon: '🔧',
    tools: ['compendium-classes', 'race-moves', 'multiclassing'],
  },
  review: {
    title: 'Review',
    description: 'Final character overview',
    icon: '✅',
    tools: ['export-character', 'print-sheet', 'save-template'],
  },
};

export const CharacterCreationAssistant: React.FC < CharacterCreationAssistantProps> = ({
  currentStep,
  currentState,
  validationResult,
  onStateUpdate,
  onNextStep,
  onPreviousStep,
  onFinalizeCharacter,
  canProceed,
  position = 'bottom-center',
  className = '',
}) => {
  const [mode, setMode] = useState < AssistantMode>('collapsed');
  const [, setShowValidationDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const assistantRef = useRef < HTMLDivElement>(null);
  const stepInfo = STEP_INFO[currentStep];

  // Auto-collapse when step changes
  useEffect(() => {
    setMode('collapsed');
    setShowValidationDetails(false);
  }, [currentStep]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assistantRef.current && !assistantRef.current.contains(event.target as Node) && mode !== 'collapsed') {
          setMode('collapsed');
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl / Cmd + Enter to proceed
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canProceed) {
        e.preventDefault();
        if (currentStep === 'review') {
          onFinalizeCharacter();
        } else {
          onNextStep();
        }
      }

      // Ctrl / Cmd + Backspace to go back
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace' && currentStep !== 'intro') {
        e.preventDefault();
        onPreviousStep();
      }

      // Escape to collapse
      if (e.key === 'Escape') {
        e.preventDefault();
        setMode('collapsed');
      }

      // Space to toggle assistant
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setMode(prev => prev === 'collapsed' ? 'navigation' : 'collapsed');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, canProceed, currentStep, onNextStep, onPreviousStep, onFinalizeCharacter]);

  const handleRandomAction = useCallback((action: string) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    switch (action) {
      case 'random-name': {
        const randomName = randomGeneratorService.generateName();
        onStateUpdate({
          characterData: {
            ...currentState.characterData,
            name: randomName,
          },
        });
        break;
      }

      case 'random-background': {
        const randomBackground = randomGeneratorService.generateBackground();
        onStateUpdate({
          characterData: {
            ...currentState.characterData,
            background: randomBackground,
          },
        });
        break;
      }

      case 'random-class': {
        const classes: CharacterClass[] = ['Fighter', 'Cleric', 'Thief', 'Wizard', 'Ranger', 'Paladin', 'Bard', 'Druid', 'Barbarian'];
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        onStateUpdate({
          characterData: {
            ...currentState.characterData,
            class: randomClass,
          },
        });
        break;
      }

      case 'auto-assign': {
        // Auto-assign attributes using standard method
        const stats = randomGeneratorService.generateAttributes('roll');
        const attributes = {
          STR: stats[0],
          DEX: stats[1],
          CON: stats[2],
          INT: stats[3],
          WIS: stats[4],
          CHA: stats[5],
        };
        onStateUpdate({
          characterData: {
            ...currentState.characterData,
            attributes,
          },
        });
        break;
      }

      default:
        }
  }, [currentState, onStateUpdate]);

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left': return 'assistant-bottom-left';
      case 'bottom-right': return 'assistant-bottom-right';
      default: return 'assistant-bottom-center';
    }
  };

  const getNextLabel = () => {
    switch (currentStep) {
      case 'intro': return 'Get Started';
      case 'name-look': return 'Next: Background →';
      case 'background': return 'Next: Portrait →';
      case 'portrait': return 'Next: Personality →';
      case 'personality': return 'Next: Class →';
      case 'class': return 'Next: Race →';
      case 'race':
        return currentState.characterData.class === 'wizard'
          ? 'Next: Spells →'
          : 'Next: Attributes →';
      case 'spells': return 'Next: Attributes →';
      case 'attributes': return 'Next: Level →';
      case 'level': return 'Next: Gear & Moves →';
      case 'moves-equipment': return 'Next: Bonds →';
      case 'bonds': return 'Next: Alignment →';
      case 'alignment': return 'Next: Advanced Options →';
      case 'advanced-options': return 'Next: Review →';
      case 'review': return 'Create Character ✨';
      default: return 'Next →';
    }
  };

  const hasValidationIssues = validationResult &&
    (validationResult.errors.length > 0 || validationResult.warnings.length > 0);

  const renderCollapsedMode = () => (
    <div className="assistant-collapsed">
      <button
        className={`main-assistant-button ${isAnimating ? 'animating' : ''}`}
        onClick={() => setMode('navigation')}
        title="Character Creation Assistant (Space)"
      >
        <span className="assistant-icon">{stepInfo.icon}</span>
        <span className="step-progress">{Object.keys(STEP_INFO).indexOf(currentStep) + 1}/13</span>
        {hasValidationIssues && (
          <div className="validation-badge">
            {validationResult!.errors.length > 0 ? '⚠️' : '💡'}
          </div>
        )}
      </button>
    </div>
  );

  const renderNavigationMode = () => (
    <div className="assistant-navigation">
      <div className="assistant-header">
        <div className="step-info">
          <span className="step-icon">{stepInfo.icon}</span>
          <div className="step-details">
            <h3>{stepInfo.title}</h3>
            <p>{stepInfo.description}</p>
          </div>
        </div>
        <div className="mode-switchers">
          <button
            className={`mode-btn ${mode === 'navigation' ? 'active' : ''}`}
            onClick={() => setMode('navigation')}
            title="Navigation"
          >
            🧭
          </button>
          <button
            className={`mode-btn ${mode === 'tools' ? 'active' : ''}`}
            onClick={() => setMode('tools')}
            title="Tools & Generators"
          >
            🛠️
          </button>
          {hasValidationIssues && (
            <button
              className={`mode-btn ${mode === 'validation' ? 'active' : ''}`}
              onClick={() => setMode('validation')}
              title="Validation Issues"
            >
              {validationResult!.errors.length > 0 ? '⚠️' : '💡'}
            </button>
          )}
          <button
            className={`mode-btn ${mode === 'help' ? 'active' : ''}`}
            onClick={() => setMode('help')}
            title="Help & Tips"
          >
            ❓
          </button>
          <button
            className="close-btn"
            onClick={() => setMode('collapsed')}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="navigation-actions">
        {currentStep !== 'intro' && (
          <button
            className="nav-btn nav-btn-back"
            onClick={onPreviousStep}
            title="Previous step (Ctrl + Backspace)"
          >
            ← Back
          </button>
        )}
        <button
          className={`nav-btn nav-btn-next ${!canProceed ? 'disabled' : ''}`}
          onClick={currentStep === 'review' ? onFinalizeCharacter : onNextStep}
          disabled={!canProceed}
          title={`${getNextLabel()} (Ctrl + Enter)`}
        >
          {getNextLabel()}
        </button>
      </div>

      <div className="progress-indicator">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ '--progress': `${((Object.keys(STEP_INFO).indexOf(currentStep) + 1) / 13) * 100}%` } as React.CSSProperties}
          />
        </div>
        <span className="progress-text">
          Step {Object.keys(STEP_INFO).indexOf(currentStep) + 1} of 13
        </span>
      </div>
    </div>
  );

  const renderToolsMode = () => (
    <div className="assistant-tools">
      <div className="tools-grid">
        {stepInfo.tools.map(tool => (
          <button
            key={tool}
            className="tool-btn"
            onClick={() => handleRandomAction(tool)}
            title={`Generate ${tool.replace('-', ' ')}`}
          >
            <span className="tool-icon">
              {tool.includes('random') && '🎲'}
              {tool.includes('generator') && '⚡'}
              {tool.includes('suggestions') && '💡'}
              {tool.includes('quiz') && '🧠'}
              {tool.includes('auto') && '🤖'}
              {tool.includes('balanced') && '⚖️'}
              {tool.includes('optimal') && '🎯'}
              {tool.includes('export') && '📤'}
              {tool.includes('save') && '💾'}
            </span>
            <span className="tool-label">
              {tool.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderValidationMode = () => (
    <div className="assistant-validation">
      {validationResult && (
        <>
          {validationResult.errors.map(error => (
            <div key={error.id} className="validation-item validation-error">
              <span className="validation-icon">⚠️</span>
              <div className="validation-content">
                <strong>{error.field}:</strong> {error?.message || "Unknown error"}
              </div>
            </div>
          ))}
          {validationResult.warnings.map(warning => (
            <div key={warning.id} className="validation-item validation-warning">
              <span className="validation-icon">💡</span>
              <div className="validation-content">
                <strong>{warning.field}:</strong> {warning.message}
              </div>
            </div>
          ))}
          {validationResult.suggestions.map(suggestion => (
            <div key={suggestion.id} className="validation-item validation-suggestion">
              <span className="validation-icon">✨</span>
              <div className="validation-content">
                <strong>{suggestion.field}:</strong> {suggestion.message}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderHelpMode = () => (
    <div className="assistant-help">
      <div className="help-section">
        <h4 > Keyboard Shortcuts</h4>
        <div className="shortcut-list">
          <div className="shortcut-item">
            <kbd > Space</kbd> <span > Toggle Assistant</span>
          </div>
          <div className="shortcut-item">
            <kbd > Ctrl</kbd> + <kbd > Enter</kbd> <span > Next Step</span>
          </div>
          <div className="shortcut-item">
            <kbd > Ctrl</kbd> + <kbd > Backspace</kbd> <span > Previous Step</span>
          </div>
          <div className="shortcut-item">
            <kbd > Esc</kbd> <span > Close Assistant</span>
          </div>
        </div>
      </div>

      <div className="help-section">
        <h4 > Current Step Tips</h4>
        <div className="step-tips">
          {currentStep === 'attributes' && (
            <p>💡 Consider your class when assigning attributes. Warriors need STR, rogues need DEX, wizards need INT.</p>
          )}
          {currentStep === 'class' && (
            <p>💡 Each class has unique moves and playstyles. Take your time to read the descriptions.</p>
          )}
          {currentStep === 'bonds' && (
            <p>💡 Bonds create connections with other party members and drive roleplay opportunities.</p>
          )}
          {/* Add more step-specific tips */}
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={assistantRef}
      className={`character-creation-assistant ${getPositionClass()} ${className} mode-${mode}`}
    >
      {mode === 'collapsed' && renderCollapsedMode()}
      {mode === 'navigation' && renderNavigationMode()}
      {mode === 'tools' && renderToolsMode()}
      {mode === 'validation' && renderValidationMode()}
      {mode === 'help' && renderHelpMode()}
    </div>
  );
};

export default CharacterCreationAssistant;



