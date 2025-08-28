import React, { useState } from 'react';
import { PanelProps, createPanel } from '../../framework/Panel';
import { useGameStore } from '../../store/GameStore';
import {
  Character,
  CharacterClass,
  Race,
  Alignment,
  Attributes,
  getClassBaseHP,
  getClassBaseLoad,
  getClassDamageDie,
  calculateMaxHP,
  calculateMaxLoad
} from '../../models/Character';
import { v4 as uuidv4 } from 'uuid';
import { CLASS_STARTING_DATA, CLASS_BOND_TEMPLATES } from '../../data/classStartingData';
import { Item } from '../../models/Equipment';
import { Bond } from '../../models/Character';
import { getSpellsForClass } from '../../services/Spells';
import { characterTemplateService, CharacterTemplate, QUICK_START_TEMPLATES } from '../../services/CharacterTemplates';
import { portraitService, Portrait } from '../../services/CharacterPortraits';
import { randomGeneratorService } from '../../services/RandomGenerators';
import './CharacterCreationPanel.css';

// Wizard steps
type WizardStep = 
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
  | 'moves-equipment'
  | 'bonds'
  | 'alignment'
  | 'review';

interface CharacterCreationPanelState {
  currentStep: WizardStep;
  characterData: Partial<Character>;
  attributeMethod: 'roll' | 'array';
  rolledScores?: number[];
  assignedAttributes?: Partial<Attributes>;
  selectedEquipment?: Partial<Item>[];
  equipmentChoices?: Record<number, number>;
  selectedMoves?: string[];
  createdBonds?: Bond[];
  showTemplateImport?: boolean;
  templateImportError?: string;
  bondPartyTarget?: string;
}

// Class descriptions for player-friendly selection
const CLASS_DESCRIPTIONS: Record<CharacterClass, { 
  tagline: string; 
  description: string; 
  playstyle: string;
  primaryStat: keyof Attributes;
}> = {
  Fighter: {
    tagline: "Master of weapons and armor",
    description: "You're a warrior through and through. Whether you're defending the innocent or conquering for glory, you know how to use every weapon and piece of armor.",
    playstyle: "Direct combat, protecting allies, and leading from the front",
    primaryStat: 'STR'
  },
  Paladin: {
    tagline: "Holy warrior with divine purpose",
    description: "You are a warrior in service to a deity or cause. Your faith gives you power, and your sword brings justice.",
    playstyle: "Tanking damage, healing allies, and smiting evil",
    primaryStat: 'STR'
  },
  Ranger: {
    tagline: "Master tracker and wilderness expert",
    description: "The wilds are your home. You can track anything, shoot with deadly accuracy, and your animal companion fights by your side.",
    playstyle: "Ranged combat, tracking, and exploration with animal companion",
    primaryStat: 'DEX'
  },
  Thief: {
    tagline: "Cunning rogue and master of shadows",
    description: "Quick, quiet, and deadly. You strike from the shadows, pick locks, disarm traps, and always have an escape plan.",
    playstyle: "Stealth, backstabbing, trap detection, and skill expertise",
    primaryStat: 'DEX'
  },
  Bard: {
    tagline: "Silver-tongued performer and lore keeper",
    description: "Your words can inspire allies, devastate enemies, or unlock ancient secrets. You know a little bit about everything.",
    playstyle: "Support, social encounters, and versatile magic through performance",
    primaryStat: 'CHA'
  },
  Cleric: {
    tagline: "Divine spellcaster and healer",
    description: "You serve a deity and channel their power. Heal the wounded, shield your allies, or call down divine wrath.",
    playstyle: "Healing, support magic, and divine spellcasting",
    primaryStat: 'WIS'
  },
  Druid: {
    tagline: "Shape-shifting guardian of nature",
    description: "Nature bends to your will. Transform into beasts, command the elements, and protect the natural world.",
    playstyle: "Shapeshifting, nature magic, and versatile problem solving",
    primaryStat: 'WIS'
  },
  Wizard: {
    tagline: "Master of arcane magic",
    description: "You've studied the arcane arts and can bend reality to your will. Your spellbook holds incredible power.",
    playstyle: "Powerful spells, ritual magic, and magical problem solving",
    primaryStat: 'INT'
  },
  Barbarian: {
    tagline: "Primal warrior of untamed fury",
    description: "Civilization is for the weak. Your rage and primal instincts make you a terrifying force in battle.",
    playstyle: "High damage, berserker combat, and primal abilities",
    primaryStat: 'STR'
  },
  Immolator: {
    tagline: "Wielder of consuming flame",
    description: "Fire is your tool and your passion. You can heal with warmth or destroy with an inferno.",
    playstyle: "Fire magic, area damage, and risk/reward mechanics",
    primaryStat: 'INT'
  }
};

// Race options per class
const CLASS_RACES: Record<CharacterClass, Race[]> = {
  Fighter: ['Human', 'Dwarf', 'Elf', 'Halfling'],
  Paladin: ['Human'],
  Ranger: ['Human', 'Elf'],
  Thief: ['Human', 'Halfling'],
  Bard: ['Human', 'Elf'],
  Cleric: ['Human', 'Dwarf'],
  Druid: ['Human', 'Elf', 'Halfling'],
  Wizard: ['Human', 'Elf'],
  Barbarian: ['Human'],
  Immolator: ['Human']
};

// Standard ability array
const STANDARD_ARRAY = [16, 15, 13, 12, 9, 8];

const CharacterCreationPanel: React.FC<PanelProps & { panelState?: CharacterCreationPanelState }> = ({
  panelState,
  onStateChange
}) => {
  const { setCharacter, state } = useGameStore();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const defaultState: CharacterCreationPanelState = {
    currentStep: 'intro',
    characterData: {},
    attributeMethod: 'array'
  };
  
  const currentState = { ...defaultState, ...panelState };
  
  const updateState = (updates: Partial<CharacterCreationPanelState>) => {
    onStateChange?.({ ...currentState, ...updates });
  };

  const nextStep = () => {
    const steps: WizardStep[] = ['intro', 'templates', 'name-look', 'background', 'portrait', 'class', 'race', 'personality', 'spells', 'attributes', 'moves-equipment', 'bonds', 'alignment', 'review'];
    const currentIndex = steps.indexOf(currentState.currentStep);
    if (currentIndex < steps.length - 1) {
      updateState({ currentStep: steps[currentIndex + 1] });
    }
  };

  const previousStep = () => {
    const steps: WizardStep[] = ['intro', 'templates', 'name-look', 'background', 'portrait', 'class', 'race', 'personality', 'spells', 'attributes', 'moves-equipment', 'bonds', 'alignment', 'review'];
    const currentIndex = steps.indexOf(currentState.currentStep);
    if (currentIndex > 0) {
      updateState({ currentStep: steps[currentIndex - 1] });
    }
  };

  const rollAbilityScores = () => {
    const rolls: number[] = [];
    for (let i = 0; i < 6; i++) {
      // Roll 4d6, drop lowest
      const dice = [1, 2, 3, 4].map(() => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => b - a);
      rolls.push(dice[0] + dice[1] + dice[2]);
    }
    rolls.sort((a, b) => b - a);
    updateState({ rolledScores: rolls });
  };

  const finalizeCharacter = () => {
    if (!currentState.characterData.name || 
        !currentState.characterData.class || 
        !currentState.characterData.race ||
        !currentState.characterData.alignment ||
        !currentState.assignedAttributes) {
      return;
    }

    const newCharacter: Character = {
      id: uuidv4(),
      name: currentState.characterData.name,
      look: currentState.characterData.look,
      portraitId: currentState.characterData.portraitId,
      background: currentState.characterData.background,
      personalityTraits: currentState.characterData.personalityTraits || [],
      voice: currentState.characterData.voice,
      class: currentState.characterData.class,
      race: currentState.characterData.race,
      alignment: currentState.characterData.alignment,
      alignmentMove: currentState.characterData.alignmentMove,
      level: 1,
      attributes: currentState.assignedAttributes as Attributes,
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false
      },
      hp: { current: 0, max: 0 }, // Will be calculated
      armor: 0,
      baseArmor: 0,
      damageDie: getClassDamageDie(currentState.characterData.class),
      xp: 0,
      load: { current: 0, max: 0 }, // Will be calculated
      baseLoad: getClassBaseLoad(currentState.characterData.class),
      coin: currentState.characterData.coin ?? 0,
      bonds: currentState.createdBonds || [],
      advancements: [],
      knownMoves: currentState.selectedMoves || [],
      conditions: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate HP and Load
    newCharacter.hp.max = calculateMaxHP(newCharacter);
    newCharacter.hp.current = newCharacter.hp.max;
    newCharacter.load.max = calculateMaxLoad(newCharacter);

    // Save the character
    setCharacter(newCharacter);
    
    // Show success message
    setShowSuccess(true);
    
    // Hide success and reset after delay
    setTimeout(() => {
      setShowSuccess(false);
      // Reset the wizard
      updateState({
        currentStep: 'intro',
        characterData: {},
        attributeMethod: 'array',
        rolledScores: undefined,
        assignedAttributes: undefined,
        selectedEquipment: undefined,
        equipmentChoices: undefined,
        selectedMoves: undefined,
        createdBonds: undefined
      });
    }, 2000);
  };

  const renderProgressBar = () => {
    const steps = ['Intro', 'Template', 'Name', 'Background', 'Portrait', 'Class', 'Race', 'Personality', 'Spells', 'Stats', 'Gear', 'Bonds', 'Alignment', 'Review'];
    const currentIndex = ['intro', 'templates', 'name-look', 'background', 'portrait', 'class', 'race', 'personality', 'spells', 'attributes', 'moves-equipment', 'bonds', 'alignment', 'review']
      .indexOf(currentState.currentStep);
    
    return (
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`progress-step ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderIntroStep = () => (
    <div className="wizard-step intro-step">
      <h1>Create Your Hero</h1>
      <div className="intro-content">
        <p className="intro-text">
          Welcome, adventurer! You're about to create a character for Dungeon World, 
          a game of fantasy adventure. Your character will explore dangerous places, 
          fight monsters, and uncover ancient treasures.
        </p>
        <div className="intro-tips">
          <h3>What you'll need to decide:</h3>
          <ul>
            <li>🎭 Your character's name and appearance</li>
            <li>⚔️ Your class - what kind of adventurer you are</li>
            <li>🎲 Your abilities - how strong, smart, and quick you are</li>
            <li>🤝 Your bonds - how you're connected to other characters</li>
            <li>⚖️ Your alignment - your moral compass</li>
          </ul>
        </div>
        <p className="intro-footer">
          Don't worry if you're new - we'll guide you through each step!
        </p>
      </div>
      <div className="wizard-actions">
        <button className="btn btn-primary btn-large" onClick={nextStep}>
          Choose a Template →
        </button>
        <button className="btn btn-secondary" onClick={() => {
          // Skip templates and go straight to name
          updateState({ currentStep: 'name-look' });
        }}>
          Create from Scratch
        </button>
      </div>
    </div>
  );

  const renderTemplatesStep = () => {
    const allTemplates = characterTemplateService.getAllTemplates();
    const quickStartTemplates = allTemplates.filter(t => t.category === 'quick-start');
    const customTemplates = allTemplates.filter(t => t.category === 'custom');

    const handleTemplateSelect = (template: CharacterTemplate) => {
      updateState({
        characterData: template.characterData,
        selectedEquipment: template.selectedEquipment,
        selectedMoves: template.selectedMoves,
        createdBonds: template.bonds?.map(b => ({ 
          id: b.id || uuidv4(), 
          text: b.text || '',
          characterName: b.characterName,
          resolved: false
        })),
        currentStep: 'review' // Jump to review since template fills everything
      });
    };

    const handleImportTemplate = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const imported = characterTemplateService.importTemplate(text);
          handleTemplateSelect(imported);
        } catch (error: any) {
          updateState({ templateImportError: error.message });
        }
      };
      input.click();
    };

    return (
      <div className="wizard-step templates-step">
        <h2>Choose a Starting Template</h2>
        <p className="step-intro">
          Start with a pre-made template for quick play, or create your own from scratch.
        </p>

        {currentState.templateImportError && (
          <div className="error-message">
            {currentState.templateImportError}
            <button onClick={() => updateState({ templateImportError: undefined })}>×</button>
          </div>
        )}

        <div className="template-sections">
          <div className="template-section">
            <h3>🚀 Quick Start Templates</h3>
            <div className="template-grid">
              {quickStartTemplates.map(template => (
                <div
                  key={template.id}
                  className="template-card quick-start"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="template-icon">{(template as any).icon}</div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className="template-class">
                    {template.characterData.class} • {template.characterData.race}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {customTemplates.length > 0 && (
            <div className="template-section">
              <h3>💾 Your Saved Templates</h3>
              <div className="template-grid">
                {customTemplates.map(template => (
                  <div
                    key={template.id}
                    className="template-card custom"
                  >
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <div className="template-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        Use
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => characterTemplateService.downloadTemplate(template)}
                      >
                        Export
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => {
                          if (confirm('Delete this template?')) {
                            characterTemplateService.deleteTemplate(template.id);
                            updateState({}); // Force re-render
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button className="btn btn-secondary" onClick={handleImportTemplate}>
            📁 Import Template
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const randomChar = randomGeneratorService.generateRandomCharacter();
              updateState({
                characterData: randomChar,
                currentStep: 'portrait'
              });
            }}
          >
            🎲 Surprise Me!
          </button>
          <button className="btn btn-primary" onClick={nextStep}>
            Create from Scratch →
          </button>
        </div>
      </div>
    );
  };

  const renderNameLookStep = () => (
    <div className="wizard-step name-look-step">
      <h2>Who Are You?</h2>
      <div className="step-content">
        <div className="form-group">
          <label htmlFor="character-name">Character Name <span className="tooltip" aria-label="Pick any fantasy-style name. You can randomize it if you’re unsure.">?</span></label>
          <input
            id="character-name"
            type="text"
            placeholder="Enter your character's name..."
            value={currentState.characterData.name || ''}
            onChange={(e) => updateState({
              characterData: { ...currentState.characterData, name: e.target.value }
            })}
            className="name-input"
          />
          <p className="field-help">Choose a name that fits a fantasy world</p>
        </div>

        <div className="form-group">
          <label htmlFor="character-looks">Appearance <span className="tooltip" aria-label="A short description others would notice at a glance.">?</span></label>
          <textarea
            id="character-looks"
            placeholder="Describe how your character looks..."
            value={currentState.characterData.look || ''}
            onChange={(e) => updateState({
              characterData: { ...currentState.characterData, look: e.target.value }
            })}
            rows={4}
            className="looks-input"
          />
          <p className="field-help">
            What do others see when they look at you? Consider your build, 
            hair, eyes, clothing, or any distinctive features.
          </p>
        </div>
      </div>
      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={previousStep}>
          ← Back
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const race = currentState.characterData.race as Race | undefined;
            const name = randomGeneratorService.generateName(race);
            updateState({
              characterData: { ...currentState.characterData, name }
            });
          }}
        >
          🎲 Random Name
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const race = currentState.characterData.race as Race | undefined;
            const cls = currentState.characterData.class as CharacterClass | undefined;
            const look = randomGeneratorService.generateAppearance(race, cls);
            updateState({
              characterData: { ...currentState.characterData, look }
            });
          }}
        >
          🎲 Random Appearance
        </button>
        <button 
          className="btn btn-primary" 
          onClick={nextStep}
          disabled={!currentState.characterData.name}
        >
          Next: Background →
        </button>
      </div>
    </div>
  );

  const renderBackgroundStep = () => {
    const current = currentState.characterData.background || '';
    return (
      <div className="wizard-step background-step">
        <h2>Background</h2>
        <p className="step-intro">
          Add a short backstory or motivation for your character. This helps roleplay and GM hooks.
        </p>
        <div className="form-group">
          <label htmlFor="character-background">Your Story</label>
          <textarea
            id="character-background"
            placeholder="Why do you adventure? Where are you from? What drives you?"
            value={current}
            onChange={(e) => updateState({
              characterData: { ...currentState.characterData, background: e.target.value }
            })}
            rows={6}
            className="background-input"
          />
          <p className="field-help">Keep it to a few sentences. You can always expand later.</p>
        </div>
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const bg = randomGeneratorService.generateBackground({
                class: currentState.characterData.class as CharacterClass | undefined,
                race: currentState.characterData.race as Race | undefined,
                alignment: currentState.characterData.alignment as Alignment | undefined
              });
              updateState({ characterData: { ...currentState.characterData, background: bg } });
            }}
          >
            🎲 Random Background
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
          >
            Next: Choose Portrait →
          </button>
        </div>
      </div>
    );
  };

  const renderPersonalityStep = () => {
    const traits = currentState.characterData.personalityTraits || [];
    const voice = currentState.characterData.voice || '';

    const presetTraits = ['brave','cautious','curious','stoic','hot-headed','compassionate','reckless','loyal','pragmatic','idealistic','sarcastic','cheerful','brooding','superstitious','methodical','impulsive'];

    const toggleTrait = (t: string) => {
      const set = new Set(traits);
      if (set.has(t)) set.delete(t); else set.add(t);
      updateState({ characterData: { ...currentState.characterData, personalityTraits: Array.from(set) } });
    };

    return (
      <div className="wizard-step personality-step">
        <h2>Personality & Voice</h2>
        <p className="step-intro">Choose a few traits and describe how your character speaks.</p>

        <div className="form-group">
          <h3>Traits</h3>
          <div className="traits-grid">
            {presetTraits.map(t => (
              <label key={t} className={`trait-chip ${traits.includes(t) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={traits.includes(t)}
                  onChange={() => toggleTrait(t)}
                />
                {t}
              </label>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => updateState({ characterData: { ...currentState.characterData, personalityTraits: randomGeneratorService.generatePersonalityTraits(3) } })}
            >
              🎲 Random Traits
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="voice">Voice / Mannerisms</label>
          <input
            id="voice"
            type="text"
            placeholder="e.g., raspy, measured cadence, northern accent"
            value={voice}
            onChange={(e) => updateState({ characterData: { ...currentState.characterData, voice: e.target.value } })}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <button className="btn btn-small btn-secondary" onClick={() => updateState({ characterData: { ...currentState.characterData, voice: randomGeneratorService.generateVoice() } })}>
              🎲 Random Voice
            </button>
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>← Back</button>
          <button className="btn btn-primary" onClick={() => {
            const caster: CharacterClass[] = ['Wizard','Cleric','Immolator'];
            if (currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)) {
              updateState({ currentStep: 'spells' });
            } else {
              updateState({ currentStep: 'attributes' });
            }
          }}>Next →</button>
        </div>
      </div>
    );
  };

  const renderSpellsStep = () => {
    const cls = currentState.characterData.class as CharacterClass | undefined;
    if (!cls || !['Wizard','Cleric','Immolator'].includes(cls)) {
      nextStep();
      return null;
    }
    const allSpells = getSpellsForClass(cls as any);
    const rotes = allSpells.filter(s => s.level === 0);
    const level1 = allSpells.filter(s => s.level === 1);

    // Defaults for selection if not set
    const selectedKnown = (currentState.characterData.knownSpells as string[]) || rotes.map(s => s.id);
    const selectedPrepared = (currentState.characterData.preparedSpells as string[]) || [];

    const togglePrepared = (id: string) => {
      const set = new Set(selectedPrepared);
      if (set.has(id)) set.delete(id); else set.add(id);
      updateState({ characterData: { ...currentState.characterData, preparedSpells: Array.from(set) } });
    };

    const toggleKnown = (id: string) => {
      const set = new Set(selectedKnown);
      if (set.has(id)) set.delete(id); else set.add(id);
      updateState({ characterData: { ...currentState.characterData, knownSpells: Array.from(set) } });
    };

    return (
      <div className="wizard-step spells-step">
        <h2>Choose Your Spells</h2>
        <p className="step-intro">Select your rotes/cantrips and level 1 spells.</p>

        {rotes.length > 0 && (
          <div className="spells-section">
            <h3>Rotes / Cantrips (always known)</h3>
            <div className="spells-grid">
              {rotes.map(spell => (
                <label key={spell.id} className="spell-card">
                  <input
                    type="checkbox"
                    checked={selectedKnown.includes(spell.id)}
                    onChange={() => toggleKnown(spell.id)}
                  />
                  <div className="spell-name">{spell.name}</div>
                  <div className="spell-desc">{spell.description}</div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="spells-section">
          <h3>Level 1 Spells</h3>
          <p className="field-help">Pick a few to prepare now; you can change after making camp.</p>
          <div className="spells-grid">
            {level1.map(spell => (
              <label key={spell.id} className={`spell-card ${selectedPrepared.includes(spell.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedPrepared.includes(spell.id)}
                  onChange={() => togglePrepared(spell.id)}
                />
                <div className="spell-name">{spell.name}</div>
                <div className="spell-desc">{spell.description}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>← Back</button>
          <button className="btn btn-primary" onClick={nextStep}>Next: Assign Abilities →</button>
        </div>
      </div>
    );
  };

  const renderPortraitStep = () => {
    const portraits = currentState.characterData.class && currentState.characterData.race
      ? portraitService.getSuggestedPortraits(currentState.characterData.class, currentState.characterData.race)
      : portraitService.getAllPortraits();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const name = prompt('Name your portrait:') || 'Custom Portrait';
        const portrait = await portraitService.addCustomPortrait(file, name);
        updateState({
          characterData: { ...currentState.characterData, portraitId: portrait.id }
        });
      } catch (error) {
        alert('Failed to upload portrait. Please try again.');
      }
    };

    return (
      <div className="wizard-step portrait-step">
        <h2>Choose Your Portrait</h2>
        <p className="step-intro">
          Select a portrait that represents your character. 
          {currentState.characterData.class && currentState.characterData.race && 
            ` Showing suggestions for ${currentState.characterData.race} ${currentState.characterData.class}.`}
        </p>

        <div className="portrait-grid">
          {portraits.map(portrait => (
            <div
              key={portrait.id}
              className={`portrait-card ${currentState.characterData.portraitId === portrait.id ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, portraitId: portrait.id }
              })}
              style={{ backgroundColor: portrait.color }}
            >
              <div className="portrait-emoji">{portrait.emoji}</div>
              <div className="portrait-name">{portrait.name}</div>
              {portrait.tags.includes('custom') && (
                <button
                  className="remove-portrait"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Remove this portrait?')) {
                      portraitService.removeCustomPortrait(portrait.id);
                      if (currentState.characterData.portraitId === portrait.id) {
                        updateState({
                          characterData: { ...currentState.characterData, portraitId: undefined }
                        });
                      }
                    }
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <label className="portrait-card upload-portrait">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <div className="portrait-emoji">📤</div>
            <div className="portrait-name">Upload Custom</div>
          </label>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
          >
            Next: Choose Class →
          </button>
        </div>
      </div>
    );
  };

  const renderClassStep = () => (
    <div className="wizard-step class-step">
      <h2>Choose Your Class</h2>
      <p className="step-intro">Your class defines your role in the party and the kinds of things you're good at.</p>
      <div className="class-grid">
        {(Object.keys(CLASS_DESCRIPTIONS) as CharacterClass[]).map(cls => (
          <div 
            key={cls}
            className={`class-card ${currentState.characterData.class === cls ? 'selected' : ''}`}
            onClick={() => updateState({
              characterData: { ...currentState.characterData, class: cls }
            })}
          >
            <h3>{cls}</h3>
            <p className="class-tagline">{CLASS_DESCRIPTIONS[cls].tagline}</p>
            <p className="class-description">{CLASS_DESCRIPTIONS[cls].description}</p>
            <div className="class-details">
              <span className="playstyle">🎮 {CLASS_DESCRIPTIONS[cls].playstyle}</span>
              <span className="primary-stat">📊 Primary: {CLASS_DESCRIPTIONS[cls].primaryStat}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={previousStep}>
          ← Back
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const classes = (Object.keys(CLASS_DESCRIPTIONS) as CharacterClass[]);
            const randomCls = classes[Math.floor(Math.random() * classes.length)];
            updateState({
              characterData: { ...currentState.characterData, class: randomCls }
            });
          }}
        >
          🎲 Random Class
        </button>
        <button 
          className="btn btn-primary" 
          onClick={nextStep}
          disabled={!currentState.characterData.class}
        >
          Next: Choose Race →
        </button>
      </div>
    </div>
  );

  const renderRaceStep = () => {
    const availableRaces = currentState.characterData.class 
      ? CLASS_RACES[currentState.characterData.class as CharacterClass]
      : [];

    const raceDescriptions: Record<Race, string> = {
      Human: "Ambitious and diverse, humans are the most common people in the world. They adapt quickly and excel at their chosen paths.",
      Elf: "Graceful and wise, elves have keen senses and a deep connection to nature and magic. They live long lives filled with wonder.",
      Dwarf: "Stout and sturdy, dwarves are master crafters and fierce warriors. They value tradition, honor, and a good ale.",
      Halfling: "Small but brave, halflings are nimble and lucky. They enjoy comfort but rise to adventure when called.",
      Other: "You come from a unique heritage, perhaps from distant lands or mixed bloodlines."
    };

    return (
      <div className="wizard-step race-step">
        <h2>Choose Your Heritage</h2>
        <p className="step-intro">
          Your race affects how you interact with the world and may provide special abilities.
          <span className="tooltip" aria-label="Some classes have limited race choices based on the setting.">?</span>
        </p>
        <div className="race-options">
          {availableRaces.map((race: Race) => (
            <div
              key={race}
              className={`race-card ${currentState.characterData.race === race ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, race }
              })}
            >
              <h3>{race}</h3>
              <p>{raceDescriptions[race as Race]}</p>
            </div>
          ))}
        </div>
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const available = (availableRaces as Race[]);
              if (!available || available.length === 0) return;
              const race = available[Math.floor(Math.random() * available.length)];
              updateState({
                characterData: { ...currentState.characterData, race }
              });
            }}
          >
            🎲 Random Race
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              const caster: CharacterClass[] = ['Wizard','Cleric','Immolator'];
              if (currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)) {
                updateState({ currentStep: 'personality' });
              } else {
                nextStep();
              }
            }}
            disabled={!currentState.characterData.race}
          >
            {(() => {
              const caster: CharacterClass[] = ['Wizard','Cleric','Immolator'];
              return currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)
                ? 'Next: Personality →'
                : 'Next: Assign Abilities →';
            })()}
          </button>
        </div>
      </div>
    );
  };

  const renderAttributesStep = () => {
    const attributeNames: (keyof Attributes)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const attributeDescriptions = {
      STR: "Strength - Physical power, melee damage, carrying capacity",
      DEX: "Dexterity - Agility, reflexes, ranged attacks, dodging",
      CON: "Constitution - Health, stamina, physical resilience",
      INT: "Intelligence - Reasoning, knowledge, spell power for wizards",
      WIS: "Wisdom - Perception, willpower, divine magic",
      CHA: "Charisma - Force of personality, leadership, social skills"
    };

    const scores = currentState.attributeMethod === 'roll' 
      ? currentState.rolledScores || []
      : STANDARD_ARRAY;

    const assignedCount = Object.keys(currentState.assignedAttributes || {}).length;
    const remainingScores = scores.filter((score: number, index: number) => {
      const assigned = Object.values(currentState.assignedAttributes || {}) as number[];
      return !assigned.includes(score) || 
        assigned.filter((s: number) => s === score).length <= scores.filter((s: number) => s === score).slice(0, index + 1).length - 1;
    });

    return (
      <div className="wizard-step attributes-step">
        <h2>Assign Your Abilities</h2>
        <div className="attribute-method-selector">
          <label>
            <input
              type="radio"
              value="array"
              checked={currentState.attributeMethod === 'array'}
              onChange={() => updateState({ attributeMethod: 'array', rolledScores: undefined })}
            />
            Standard Array (Balanced) <span className="tooltip" aria-label="A fair spread of numbers to keep things simple.">?</span>
          </label>
          <label>
            <input
              type="radio"
              value="roll"
              checked={currentState.attributeMethod === 'roll'}
              onChange={() => updateState({ attributeMethod: 'roll' })}
            />
            Roll for Stats (Random) <span className="tooltip" aria-label="Roll 4d6, drop the lowest, six times for a classic feel.">?</span>
          </label>
        </div>

        {currentState.attributeMethod === 'roll' && (
          <div className="roll-section">
            {!currentState.rolledScores ? (
              <button className="btn btn-primary" onClick={rollAbilityScores}>
                🎲 Roll Ability Scores
              </button>
            ) : (
              <div>
                <p className="rolled-scores">
                  You rolled: {currentState.rolledScores.join(', ')}
                </p>
                <button className="btn btn-secondary" onClick={rollAbilityScores}>
                  🎲 Reroll
                </button>
              </div>
            )}
          </div>
        )}

        {scores.length > 0 && (
          <>
            <div className="scores-to-assign">
              <h3>Available Scores:</h3>
              <div className="score-chips">
                {remainingScores.map((score: number, index: number) => (
                  <span key={index} className="score-chip">
                    {score}
                  </span>
                ))}
              </div>
            </div>

            <div className="attributes-grid">
              {attributeNames.map(attr => {
                const isRecommended = currentState.characterData.class && 
                  CLASS_DESCRIPTIONS[currentState.characterData.class as CharacterClass].primaryStat === attr;
                
                return (
                  <div key={attr} className={`attribute-assignment ${isRecommended ? 'recommended' : ''}`}>
                    <div className="attribute-header">
                      <h4>{attr}</h4>
                      {isRecommended && <span className="recommended-badge">Recommended</span>}
                    </div>
                    <p className="attribute-desc">{attributeDescriptions[attr]}</p>
                    <select
                      value={currentState.assignedAttributes?.[attr] || ''}
                      aria-label={`Select score for ${attr}`}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        const newAssigned = { ...currentState.assignedAttributes };
                        if (value) {
                          newAssigned[attr] = value;
                        } else {
                          delete newAssigned[attr];
                        }
                        updateState({ assignedAttributes: newAssigned });
                      }}
                    >
                      <option value="">Select...</option>
                      {scores.map((score: number, index: number) => {
                        const timesUsed = Object.values(currentState.assignedAttributes || {})
                          .filter(s => s === score).length;
                        const timesAvailable = scores.filter((s: number) => s === score).length;
                        const isAvailable = timesUsed < timesAvailable || 
                          currentState.assignedAttributes?.[attr] === score;
                        
                        return (
                          <option 
                            key={index} 
                            value={score} 
                            disabled={!isAvailable}
                          >
                            {score} {!isAvailable && '(already assigned)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const method = currentState.attributeMethod;
              const scores = method === 'roll'
                ? (currentState.rolledScores && currentState.rolledScores.length === 6
                    ? currentState.rolledScores
                    : ((): number[] => {
                        const rs = randomGeneratorService.generateAttributes('roll');
                        updateState({ rolledScores: rs });
                        return rs;
                      })())
                : STANDARD_ARRAY;
              const cls = currentState.characterData.class as CharacterClass | undefined;
              if (!cls) return;
              const assigned = randomGeneratorService.assignAttributesForClass(scores, cls);
              updateState({ assignedAttributes: assigned });
            }}
            disabled={!currentState.characterData.class}
          >
            ⚡ Auto-Assign (Recommended)
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={assignedCount !== 6}
          >
            Next: Starting Gear →
          </button>
        </div>
      </div>
    );
  };

  const renderAlignmentStep = () => {
    const alignmentDescriptions: Record<Alignment, string> = {
      Good: "You help others and protect the innocent",
      Lawful: "You follow rules, traditions, and keep your word",
      Neutral: "You act according to the situation and your needs",
      Chaotic: "You value freedom and reject restrictions",
      Evil: "You pursue power and don't care who gets hurt"
    };

    // Class-specific alignment moves would go here
    const classAlignments: Record<CharacterClass, Alignment[]> = {
      Fighter: ['Good', 'Neutral', 'Evil'],
      Paladin: ['Lawful', 'Good'],
      Ranger: ['Good', 'Neutral', 'Chaotic'],
      Thief: ['Neutral', 'Chaotic', 'Evil'],
      Bard: ['Good', 'Neutral', 'Chaotic'],
      Cleric: ['Good', 'Lawful', 'Evil'],
      Druid: ['Neutral', 'Chaotic'],
      Wizard: ['Good', 'Neutral', 'Evil'],
      Barbarian: ['Chaotic', 'Neutral'],
      Immolator: ['Neutral', 'Evil']
    };

    const availableAlignments = currentState.characterData.class
      ? classAlignments[currentState.characterData.class as CharacterClass]
      : [];

    return (
      <div className="wizard-step alignment-step">
        <h2>Choose Your Alignment</h2>
        <p className="step-intro">
          Your alignment guides your character's moral compass and grants you special XP triggers.
        </p>
        <div className="alignment-options">
          {availableAlignments.map((alignment: Alignment) => (
            <div
              key={alignment}
              className={`alignment-card ${currentState.characterData.alignment === alignment ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, alignment }
              })}
            >
              <h3>{alignment}</h3>
              <p>{alignmentDescriptions[alignment as Alignment]}</p>
            </div>
          ))}
        </div>
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const alignments = availableAlignments as Alignment[];
              if (!alignments || alignments.length === 0) return;
              const a = alignments[Math.floor(Math.random() * alignments.length)];
              updateState({
                characterData: { ...currentState.characterData, alignment: a }
              });
            }}
          >
            🎲 Random Alignment
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={!currentState.characterData.alignment}
          >
            Next: Review Character →
          </button>
        </div>
      </div>
    );
  };

  const renderMovesEquipmentStep = () => {
    const classData = currentState.characterData.class 
      ? CLASS_STARTING_DATA[currentState.characterData.class as CharacterClass]
      : null;
    
    if (!classData) return null;

    // Initialize equipment if not set
    if (!currentState.selectedEquipment) {
      updateState({ 
        selectedEquipment: classData.equipment,
        selectedMoves: classData.moves,
        equipmentChoices: {}
      });
    }

    const handleEquipmentChoice = (choiceIndex: number, optionIndex: number) => {
      const choice = classData.choices?.equipment?.[choiceIndex];
      if (!choice) return;

      const selectedOption = choice.options[optionIndex];
      const newChoices = { ...currentState.equipmentChoices, [choiceIndex]: optionIndex };
      
      // Rebuild equipment list with choices
      let newEquipment = [...classData.equipment];
      
      // Add all selected choice items
      Object.entries(newChoices).forEach(([idx, optIdx]) => {
        const choiceData = classData.choices?.equipment?.[parseInt(idx)];
        if (choiceData && typeof optIdx === 'number') {
          newEquipment = [...newEquipment, ...choiceData.options[optIdx as number]];
        }
      });

      updateState({ 
        equipmentChoices: newChoices,
        selectedEquipment: newEquipment
      });
    };

    return (
      <div className="wizard-step moves-equipment-step">
        <h2>Starting Moves & Equipment</h2>
        <p className="step-intro">
          Your class grants you special moves and starting gear for your adventures.
        </p>

        <div className="moves-section">
          <h3>Starting Moves</h3>
          <p className="section-intro">You begin play with these moves:</p>
          <div className="moves-list">
            {currentState.selectedMoves?.map((move: string) => (
              <div key={move} className="move-card">
                <h4>{move}</h4>
                <p className="move-description">
                  {/* Move descriptions would go here */}
                  A powerful ability that defines your class.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="equipment-section">
          <h3>Starting Equipment</h3>
          <div className="guaranteed-equipment">
            <h4>You start with:</h4>
            <ul className="equipment-list">
              {classData.equipment.map((item: any, index: number) => (
                <li key={index} className="equipment-item">
                  <span className="item-name">{item.name}</span>
                  {item.weight !== undefined && (
                    <span className="item-weight"> ({item.weight} weight)</span>
                  )}
                  {item.armor && <span className="item-armor"> [{item.armor} armor]</span>}
                  {item.damage && <span className="item-damage"> [{item.damage} damage]</span>}
                </li>
              ))}
            </ul>
          </div>

          {classData.choices?.equipment && (
            <div className="equipment-choices">
              {classData.choices.equipment.map((choice: any, choiceIndex: number) => (
                <div key={choiceIndex} className="equipment-choice">
                  <h4>{choice.prompt}</h4>
                  <div className="choice-options">
                    {choice.options.map((option: any[], optionIndex: number) => (
                      <div 
                        key={optionIndex}
                        className={`choice-option ${
                          currentState.equipmentChoices?.[choiceIndex] === optionIndex ? 'selected' : ''
                        }`}
                        onClick={() => handleEquipmentChoice(choiceIndex, optionIndex)}
                      >
                        {option.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="choice-item">
                            <h5>{item.name}</h5>
                            {item.description && <p>{item.description}</p>}
                            <div className="item-stats">
                              {item.weight !== undefined && <span>Weight: {item.weight}</span>}
                              {item.armor && <span>Armor: {item.armor}</span>}
                              {item.damage && <span>Damage: {item.damage}</span>}
                              {item.tags && (
                                <span className="item-tags">
                                  Tags: {item.tags.map((t: any) => t.name).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Starting Coin Selection */}
        <div className="coin-section" style={{ marginTop: '2rem' }}>
          <h3>Starting Coin</h3>
          <p className="field-help">Choose how much coin your character begins with.</p>
          <div className="coin-controls" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="starting-coin"><strong>Coin:</strong></label>
            <input
              id="starting-coin"
              type="number"
              min={0}
              value={currentState.characterData.coin ?? 0}
              onChange={(e) => updateState({
                characterData: { ...currentState.characterData, coin: Math.max(0, Number(e.target.value || 0)) }
              })}
              style={{ width: '100px' }}
            />
            <button
              className="btn btn-small btn-secondary"
              onClick={() => updateState({ characterData: { ...currentState.characterData, coin: 10 } })}
              aria-label="Use suggested coin"
            >
              Use Suggested
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => updateState({ characterData: { ...currentState.characterData, coin: (currentState.characterData.coin ?? 0) + 5 } })}
              aria-label="Add 5 coin"
            >
              +5
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => updateState({ characterData: { ...currentState.characterData, coin: (currentState.characterData.coin ?? 0) + 10 } })}
              aria-label="Add 10 coin"
            >
              +10
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                const d6 = () => Math.floor(Math.random() * 6) + 1;
                const roll = (d6() + d6()) * 10;
                updateState({ characterData: { ...currentState.characterData, coin: roll } });
              }}
            >
              🎲 Roll 2d6×10
            </button>
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={
              classData.choices?.equipment && 
              Object.keys(currentState.equipmentChoices || {}).length < classData.choices.equipment.length
            }
          >
            Next: Create Bonds →
          </button>
        </div>
      </div>
    );
  };

  const renderBondsStep = () => {
    const bondTemplates = currentState.characterData.class 
      ? CLASS_BOND_TEMPLATES[currentState.characterData.class as CharacterClass]
      : [];
    
    const bonds = currentState.createdBonds || [];
    const partyNames = Object.values(state.characters || {})
      .map((c: any) => c.name)
      .filter((n: any) => n && n.trim().length > 0);

    const addBond = () => {
      const newBond: Bond = {
        id: uuidv4(),
        text: '',
        resolved: false
      };
      updateState({ createdBonds: [...bonds, newBond] });
    };

    const updateBond = (bondId: string, text: string) => {
      const updatedBonds = bonds.map((bond: any) => 
        bond.id === bondId ? { ...bond, text } : bond
      );
      updateState({ createdBonds: updatedBonds });
    };

    const removeBond = (bondId: string) => {
      const updatedBonds = bonds.filter((bond: any) => bond.id !== bondId);
      updateState({ createdBonds: updatedBonds });
    };

    return (
      <div className="wizard-step bonds-step">
        <h2>Create Your Bonds</h2>
        <p className="step-intro">
          Bonds represent your character's relationships with other party members. 
          Fill in the blanks with character names or create your own bonds.
        </p>

        <div className="bond-templates">
          <h3>Bond Templates</h3>
          {partyNames.length > 0 && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="bond-party-target">Fill blanks with party member:</label>
              <select
                id="bond-party-target"
                value={currentState.bondPartyTarget || ''}
                onChange={(e) => updateState({ bondPartyTarget: e.target.value })}
              >
                <option value="">(none)</option>
                {partyNames.map((n: string) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
          <p className="templates-intro">
            Click a template to add it as a bond, then fill in the blank with another character's name:
          </p>
          <div className="template-list">
            {bondTemplates.map((template: string, index: number) => (
              <div 
                key={index} 
                className="bond-template"
                onClick={() => {
                  const newBond: Bond = {
                    id: uuidv4(),
                    text: currentState.bondPartyTarget ? template.replace('____', currentState.bondPartyTarget) : template,
                    resolved: false
                  };
                  updateState({ createdBonds: [...bonds, newBond] });
                }}
              >
                <span className="template-text">{template}</span>
                <span className="add-icon">+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="active-bonds">
          <h3>Your Bonds</h3>
          {bonds.length === 0 ? (
            <p className="no-bonds">No bonds created yet. Click templates above or create custom bonds.</p>
          ) : (
            <div className="bonds-list">
              {bonds.map((bond: any, index: number) => (
                <div key={bond.id} className="bond-item">
                  <span className="bond-number">{index + 1}.</span>
                  <textarea
                    value={bond.text}
                    onChange={(e) => updateBond(bond.id, e.target.value)}
                    placeholder="Enter your bond here..."
                    rows={2}
                    className="bond-input"
                  />
                  <button 
                    className="remove-bond"
                    onClick={() => removeBond(bond.id)}
                    aria-label="Remove bond"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button className="btn btn-secondary add-bond-btn" onClick={addBond}>
            + Add Custom Bond
          </button>
        </div>

        <div className="bonds-tips">
          <h4>💡 Tips:</h4>
          <ul>
            <li>Replace "____ " with another player character's name</li>
            <li>You can modify templates to better fit your character</li>
            <li>Create 2-3 bonds to start; you can add more during play</li>
            <li>Bonds drive character interaction and grant XP when resolved</li>
          </ul>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={bonds.length === 0}
          >
            Next: Choose Alignment →
          </button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const attrs = currentState.assignedAttributes as Attributes;
    const character = currentState.characterData;
    
    return (
      <div className="wizard-step review-step">
        <h2>Review Your Character</h2>
        <div className="character-summary">
          <div className="summary-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {character.name}</p>
            <p><strong>Class:</strong> {character.class}</p>
            <p><strong>Race:</strong> {character.race}</p>
            <p><strong>Alignment:</strong> {character.alignment}</p>
            <p><strong>Coin:</strong> {currentState.characterData.coin ?? 0}</p>
          </div>
          
          {character.look && (
            <div className="summary-section">
              <h3>Appearance</h3>
              <p>{character.look}</p>
            </div>
          )}
          
          <div className="summary-section">
            <h3>Abilities</h3>
            <div className="ability-summary">
              {attrs && Object.entries(attrs).map(([key, value]) => (
                <div key={key} className="ability-score">
                  <span className="ability-name">{key}</span>
                  <span className="ability-value">{value}</span>
                  <span className="ability-modifier">
                    ({value >= 16 ? '+2' : value >= 13 ? '+1' : value >= 9 ? '+0' : value >= 6 ? '-1' : value >= 4 ? '-2' : '-3'})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {character.background && (
            <div className="summary-section">
              <h3>Background</h3>
              <p>{character.background}</p>
            </div>
          )}

          {(currentState.characterData.personalityTraits || currentState.characterData.voice) && (
            <div className="summary-section">
              <h3>Personality</h3>
              {currentState.characterData.personalityTraits && currentState.characterData.personalityTraits.length > 0 && (
                <p><strong>Traits:</strong> {currentState.characterData.personalityTraits.join(', ')}</p>
              )}
              {currentState.characterData.voice && (
                <p><strong>Voice:</strong> {currentState.characterData.voice}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const templateName = prompt('Template name:');
              if (templateName) {
                characterTemplateService.saveTemplate({
                  name: templateName,
                  description: `${character.race} ${character.class} - ${character.name}`,
                  category: 'custom',
                  characterData: character,
                  selectedEquipment: currentState.selectedEquipment,
                  selectedMoves: currentState.selectedMoves,
                  bonds: currentState.createdBonds
                });
                alert('Template saved successfully!');
              }
            }}
          >
            💾 Save as Template
          </button>
          <button 
            className="btn btn-primary btn-large create-character" 
            onClick={finalizeCharacter}
          >
            ✨ Create Character
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentState.currentStep) {
      case 'intro':
        return renderIntroStep();
      case 'templates':
        return renderTemplatesStep();
      case 'name-look':
        return renderNameLookStep();
      case 'background':
        return renderBackgroundStep();
      case 'portrait':
        return renderPortraitStep();
      case 'class':
        return renderClassStep();
      case 'race':
        return renderRaceStep();
      case 'personality':
        return renderPersonalityStep();
      case 'spells':
        return renderSpellsStep();
      case 'attributes':
        return renderAttributesStep();
      case 'alignment':
        return renderAlignmentStep();
      case 'review':
        return renderReviewStep();
      case 'moves-equipment':
        return renderMovesEquipmentStep();
      case 'bonds':
        return renderBondsStep();
      default:
        return <div>Step not implemented yet: {currentState.currentStep}</div>;
    }
  };

  // Character preview
  const renderCharacterPreview = () => {
    const { characterData, assignedAttributes } = currentState;
    const hasBasicInfo = characterData.name && characterData.class && characterData.race;
    
    if (!hasBasicInfo && currentState.currentStep === 'intro') return null;
    
    return (
      <div className={`character-preview ${currentState.currentStep === 'intro' ? 'hidden' : ''}`}>
        <h3>Character Preview</h3>
        <div className="preview-content">
          {characterData.portraitId && (() => {
            const portrait = portraitService.getAllPortraits().find(p => p.id === characterData.portraitId);
            if (portrait) {
              return (
                <div className="preview-portrait" style={{ backgroundColor: portrait.color }}>
                  <div className="portrait-emoji">{portrait.emoji}</div>
                </div>
              );
            }
            return null;
          })()}
          {characterData.name && (
            <div className="preview-name">{characterData.name}</div>
          )}
          {characterData.class && characterData.race && (
            <div className="preview-class-race">
              {characterData.race} {characterData.class}
            </div>
          )}
          {characterData.alignment && (
            <div className="preview-alignment">{characterData.alignment}</div>
          )}
          {characterData.background && (
            <div className="preview-background">
              <em>{characterData.background}</em>
            </div>
          )}
          
          {assignedAttributes && Object.keys(assignedAttributes).length === 6 && (
            <div className="preview-attributes">
              <div className="attributes-mini-grid">
                {Object.entries(assignedAttributes).map(([attr, value]) => (
                  <div key={attr} className="attribute-mini">
                    <span className="attr-label">{attr}</span>
                    <span className="attr-value">{value as React.ReactNode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentState.selectedEquipment && currentState.selectedEquipment.length > 0 && (
            <div className="preview-equipment">
              <div className="equipment-count">
                🎒 {currentState.selectedEquipment.length} items
              </div>
            </div>
          )}
          
          {currentState.createdBonds && currentState.createdBonds.length > 0 && (
            <div className="preview-bonds">
              <div className="bonds-count">
                🤝 {currentState.createdBonds.length} bonds
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="character-creation-panel">
      {currentState.currentStep !== 'intro' && renderProgressBar()}
      <div className="wizard-content">
        {renderCurrentStep()}
        {renderCharacterPreview()}
      </div>
      {showSuccess && (
        <div className="success-message">
          ✨ Character Created Successfully! ✨
        </div>
      )}
    </div>
  );
};

export default createPanel(
  {
    id: 'character-creation',
    name: 'Create Character',
    icon: '✨',
    description: 'Create a new character for your adventures',
    priority: 1
  },
  CharacterCreationPanel,
  {
    getInitialState: (): CharacterCreationPanelState => ({
      currentStep: 'intro',
      characterData: {},
      attributeMethod: 'array'
    })
  }
);
