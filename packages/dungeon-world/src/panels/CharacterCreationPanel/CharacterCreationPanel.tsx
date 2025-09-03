import type { PanelProps } from '../../framework/Panel'

import type {
  Alignment,
  Attributes,
  Bond,
  Character,
  CharacterClass,
  Race,
} from '../../models/Character'
import type { Armor, Item, Weapon } from '../../models/Equipment'

import type { AdvancementChoice, AdvancementPlan, LevelProgression } from '../../services/AdvancementService'
import type { CharacterTemplate } from '../../services/CharacterTemplates'
import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import AdvancedOptionsStep from '../../components/AdvancedOptionsStep'
import AdvancementSelector from '../../components/AdvancementSelector'

import CharacterCreationAssistant from '../../components/CharacterCreationAssistant'
import TagDisplay from '../../components/TagDisplay'
import { CLASS_BOND_TEMPLATES, CLASS_STARTING_DATA } from '../../data/classStartingData'
import { createPanel } from '../../framework/Panel'
import {
  calculateMaxHP,
  calculateMaxLoad,
  generateRolledScores,
  getClassBaseLoad,
  getClassDamageDie,
  getStandardArray,
} from '../../models/Character'
import { advancementService } from '../../services/AdvancementService'
import { portraitService } from '../../services/CharacterPortraits'
import { characterTemplateService } from '../../services/CharacterTemplates'
import { randomGeneratorService } from '../../services/RandomGenerators'
import { getSpellsForClass } from '../../services/Spells'
import { useGameStore } from '../../store/GameStore'
import './CharacterCreationPanel.css'

// Wizard steps-using the same type as CharacterCreationAssistant
type WizardStep
  = | 'intro'
    | 'templates'
    | 'name-look'
    | 'background'
    | 'portrait'
    | 'class'
    | 'race'
    | 'level'
    | 'personality'
    | 'spells'
    | 'attributes'
    | 'moves-equipment'
    | 'bonds'
    | 'alignment'
    | 'advanced-options'
    | 'review'
    | 'advancement'

interface CharacterCreationPanelState {
  currentStep: WizardStep
  characterData: Partial <Character>
  attributeMethod: 'roll' | 'array'
  rolledScores?: number[]
  assignedAttributes?: Partial <Attributes>
  selectedEquipment?: Partial <Item>[]
  equipmentChoices?: Record <number, number>
  selectedMoves?: string[]
  createdBonds?: Bond[]
  showTemplateImport?: boolean
  templateImportError?: string
  bondPartyTarget?: string
  humanBonusStat?: keyof Attributes
  otherRaceBonusStat?: keyof Attributes
  selectedLevel: number
  levelProgression?: LevelProgression
  selectedMove?: AdvancementChoice
  selectedStat?: AdvancementChoice
  advancementPlan?: AdvancementPlan
}

// Class descriptions for player-friendly selection
const CLASS_DESCRIPTIONS: Record <CharacterClass, {
  tagline: string
  description: string
  playstyle: string
  primaryStat: keyof Attributes
}> = {
  Fighter: {
    tagline: 'Master of weapons and armor',
    description: 'You\'re a warrior through and through. Whether you\'re defending the innocent or conquering for glory, you know how to use every weapon and piece of armor.',
    playstyle: 'Direct combat, protecting allies, and leading from the front',
    primaryStat: 'STR',
  },
  Paladin: {
    tagline: 'Holy warrior with divine purpose',
    description: 'You are a warrior in service to a deity or cause. Your faith gives you power, and your sword brings justice.',
    playstyle: 'Tanking damage, healing allies, and smiting evil',
    primaryStat: 'STR',
  },
  Ranger: {
    tagline: 'Master tracker and wilderness expert',
    description: 'The wilds are your home. You can track anything, shoot with deadly accuracy, and your animal companion fights by your side.',
    playstyle: 'Ranged combat, tracking, and exploration with animal companion',
    primaryStat: 'DEX',
  },
  Thief: {
    tagline: 'Cunning rogue and master of shadows',
    description: 'Quick, quiet, and deadly. You strike from the shadows, pick locks, disarm traps, and always have an escape plan.',
    playstyle: 'Stealth, backstabbing, trap detection, and skill expertise',
    primaryStat: 'DEX',
  },
  Bard: {
    tagline: 'Silver-tongued performer and lore keeper',
    description: 'Your words can inspire allies, devastate enemies, or unlock ancient secrets. You know a little bit about everything.',
    playstyle: 'Support, social encounters, and versatile magic through performance',
    primaryStat: 'CHA',
  },
  Cleric: {
    tagline: 'Divine spellcaster and healer',
    description: 'You serve a deity and channel their power. Heal the wounded, shield your allies, or call down divine wrath.',
    playstyle: 'Healing, support magic, and divine spellcasting',
    primaryStat: 'WIS',
  },
  Druid: {
    tagline: 'Shape-shifting guardian of nature',
    description: 'Nature bends to your will. Transform into beasts, command the elements, and protect the natural world.',
    playstyle: 'Shapeshifting, nature magic, and versatile problem solving',
    primaryStat: 'WIS',
  },
  Wizard: {
    tagline: 'Master of arcane magic',
    description: 'You\'ve studied the arcane arts and can bend reality to your will. Your spellbook holds incredible power.',
    playstyle: 'Powerful spells, ritual magic, and magical problem solving',
    primaryStat: 'INT',
  },
  Barbarian: {
    tagline: 'Primal warrior of untamed fury',
    description: 'Civilization is for the weak. Your rage and primal instincts make you a terrifying force in battle.',
    playstyle: 'High damage, berserker combat, and primal abilities',
    primaryStat: 'STR',
  },
  Immolator: {
    tagline: 'Wielder of consuming flame',
    description: 'Fire is your tool and your passion. You can heal with warmth or destroy with an inferno.',
    playstyle: 'Fire magic, area damage, and risk / reward mechanics',
    primaryStat: 'INT',
  },
}

// Race options per class
const CLASS_RACES: Record <CharacterClass, Race[]> = {
  Fighter: ['Human', 'Dwarf', 'Elf', 'Halfling'],
  Paladin: ['Human'],
  Ranger: ['Human', 'Elf'],
  Thief: ['Human', 'Halfling'],
  Bard: ['Human', 'Elf'],
  Cleric: ['Human', 'Dwarf'],
  Druid: ['Human', 'Elf', 'Halfling'],
  Wizard: ['Human', 'Elf'],
  Barbarian: ['Human'],
  Immolator: ['Human'],
}

// Use official DW standard array
const STANDARD_ARRAY = getStandardArray()

const CharacterCreationPanel: React.FC <PanelProps & { panelState?: CharacterCreationPanelState }> = ({
  panelState,
  onStateChange,
}) => {
  const { setCharacter, state } = useGameStore()
  const [showSuccess, setShowSuccess] = useState(false)

  const defaultState: CharacterCreationPanelState = {
    currentStep: 'intro',
    characterData: {},
    attributeMethod: 'array',
    selectedLevel: 1,
  }

  const currentState = { ...defaultState, ...panelState }

  const updateState = (updates: Partial <CharacterCreationPanelState>) => {
    onStateChange?.({ ...currentState, ...updates })
  }

  // Racial bonus system
  const getRacialBonuses = (race: Race, humanBonusStat?: keyof Attributes): { attributes: Partial <Attributes>, hp: number, abilities: string[] } => {
    switch (race) {
      case 'Human': {
        const humanAttributes: Partial <Attributes> = {}
        if (humanBonusStat) {
          humanAttributes[humanBonusStat] = 1
        }
        return { attributes: humanAttributes, hp: 0, abilities: ['versatile', 'ambitious'] }
      }
      case 'Elf':
        return { attributes: { DEX: 1 }, hp: 0, abilities: ['keen_senses', 'ancient_wisdom'] }
      case 'Dwarf':
        return { attributes: { CON: 1 }, hp: 2, abilities: ['stone_sense'] }
      case 'Halfling':
        return { attributes: { DEX: 1 }, hp: 0, abilities: ['blessed_fortune', 'brave_heart'] }
      case 'Other': {
        const otherAttributes: Partial <Attributes> = {}
        if (humanBonusStat) { // Other race can also choose a stat like humans
          otherAttributes[humanBonusStat] = 1
        }
        return { attributes: otherAttributes, hp: 0, abilities: ['unique_heritage', 'cultural_wisdom'] }
      }
      default:
        return { attributes: {}, hp: 0, abilities: [] }
    }
  }

  const applyRacialBonuses = (baseAttributes: Attributes, race: Race): Attributes => {
    const chosenStat = race === 'Human'
      ? currentState.humanBonusStat
      : race === 'Other' ? currentState.otherRaceBonusStat : undefined
    const bonuses = getRacialBonuses(race, chosenStat)
    const result = { ...baseAttributes }

    for (const [attr, bonus] of Object.entries(bonuses.attributes)) {
      if (bonus && attr in result) {
        result[attr as keyof Attributes] += bonus
      }
    }

    return result
  }

  const nextStep = () => {
    const steps: WizardStep[] = ['intro', 'templates', 'name-look', 'background', 'portrait', 'class', 'race', 'personality', 'spells', 'attributes', 'level', 'moves-equipment', 'bonds', 'alignment', 'advanced-options', 'review']
    const currentIndex = steps.indexOf(currentState.currentStep)
    if (currentIndex < steps.length - 1) {
      updateState({ currentStep: steps[currentIndex + 1] })
    }
  }

  const previousStep = () => {
    const steps: WizardStep[] = ['intro', 'templates', 'name-look', 'background', 'portrait', 'class', 'race', 'personality', 'spells', 'attributes', 'level', 'moves-equipment', 'bonds', 'alignment', 'advanced-options', 'review']
    const currentIndex = steps.indexOf(currentState.currentStep)
    if (currentIndex > 0) {
      updateState({ currentStep: steps[currentIndex - 1] })
    }
  }

  const rollAbilityScores = () => {
    // Use official DW rule: roll 3d6 for each ability score
    const rolls = generateRolledScores()
    updateState({ rolledScores: rolls })
  }

  const finalizeCharacter = () => {
    if (!currentState.characterData.name
      || !currentState.characterData.class
      || !currentState.characterData.race
      || !currentState.characterData.alignment
      || !currentState.assignedAttributes) {
      return
    }

    // Apply racial bonuses to base attributes
    const baseAttributes = currentState.assignedAttributes as Attributes
    let finalAttributes = applyRacialBonuses(baseAttributes, currentState.characterData.race)
    const racialBonuses = getRacialBonuses(currentState.characterData.race)

    // Apply advancement improvements for higher level characters
    if (currentState.selectedLevel > 1 && currentState.advancementPlan) {
      const tempCharacter: Character = {
        ...currentState.characterData,
        attributes: finalAttributes,
        level: 1, // Start at level 1, then apply advancements
        advancements: [],
        knownMoves: currentState.selectedMoves || [],
      } as Character

      const characterWithAdvancements = advancementService.applyAdvancementPlan(
        tempCharacter,
        currentState.advancementPlan,
      )
      finalAttributes = characterWithAdvancements.attributes || finalAttributes
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
      level: currentState.selectedLevel,
      attributes: finalAttributes,
      debilities: {
        weak: false,
        shaky: false,
        sick: false,
        stunned: false,
        confused: false,
        scarred: false,
      },
      hp: { current: 0, max: 0 }, // Will be calculated
      armor: 0,
      baseArmor: 0,
      damageDie: getClassDamageDie(currentState.characterData.class),
      xp: currentState.levelProgression?.xp || 0,
      load: { current: 0, max: 0 }, // Will be calculated
      baseLoad: getClassBaseLoad(currentState.characterData.class),
      coin: currentState.characterData.coin ?? 0,
      bonds: currentState.createdBonds || [],
      advancements: [], // Will be populated by advancement plan if level > 1
      knownMoves: currentState.selectedMoves || [],
      conditions: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Calculate HP and Load (including racial bonuses)
    newCharacter.hp.max = calculateMaxHP(newCharacter) + racialBonuses.hp
    newCharacter.hp.current = newCharacter.hp.max
    newCharacter.load.max = calculateMaxLoad(newCharacter)

    // Save the character
    setCharacter(newCharacter)

    // Show success message
    setShowSuccess(true)

    // Hide success and reset after delay
    setTimeout(() => {
      setShowSuccess(false)
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
        createdBonds: undefined,
      })
    }, 2000)
  }

  const renderProgressBar = () => {
    const steps = [
      { id: 'intro', emoji: '🌟', label: 'Intro' },
      { id: 'templates', emoji: '📋', label: 'Template' },
      { id: 'name-look', emoji: '👤', label: 'Name' },
      { id: 'background', emoji: '📖', label: 'Background' },
      { id: 'portrait', emoji: '🎭', label: 'Portrait' },
      { id: 'class', emoji: '⚔️', label: 'Class' },
      { id: 'race', emoji: '🧝', label: 'Race' },
      { id: 'personality', emoji: '💭', label: 'Personality' },
      { id: 'spells', emoji: '✨', label: 'Spells' },
      { id: 'attributes', emoji: '🎲', label: 'Stats' },
      { id: 'level', emoji: '📈', label: 'Level' },
      { id: 'moves-equipment', emoji: '🎒', label: 'Gear' },
      { id: 'bonds', emoji: '🤝', label: 'Bonds' },
      { id: 'alignment', emoji: '⚖️', label: 'Alignment' },
      { id: 'advanced-options', emoji: '🔧', label: 'Advanced' },
      { id: 'review', emoji: '👁️', label: 'Review' },
    ]

    const currentIndex = steps.findIndex(step => step.id === currentState.currentStep)

    return (
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              // Allow navigation to completed steps or current step
              if (index <= currentIndex) {
                updateState({ currentStep: step.id as WizardStep })
              }
            }}
          >
            <div className="step-icon">{step.emoji}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderIntroStep = () => (
    <div className="wizard-step intro-step">
      <h1> Create Your Hero</h1>
      <div className="intro-content">
        <p className="intro-text">
          Welcome, adventurer ! You're about to create a character for Dungeon World,
          a game of fantasy adventure. Your character will explore dangerous places,
          fight monsters, and uncover ancient treasures.
        </p>
        <div className="intro-tips">
          <h3> What you'll need to decide:</h3>
          <ul>
            <li>🎭 Your character's name and appearance</li>
            <li>⚔️ Your class-what kind of adventurer you are</li>
            <li>🎲 Your abilities-how strong, smart, and quick you are</li>
            <li>🤝 Your bonds-how you're connected to other characters</li>
            <li>⚖️ Your alignment-your moral compass</li>
          </ul>
        </div>
        <p className="intro-footer">
          Don't worry if you're new-we'll guide you through each step!
        </p>
      </div>
      <div className="wizard-actions">
        <button className="btn btn-primary btn-large" onClick={nextStep}>
          Choose a Template →
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
          // Skip templates and go straight to name
            updateState({ currentStep: 'name-look' })
          }}
        >
          Create from Scratch
        </button>
      </div>
    </div>
  )

  const renderTemplatesStep = () => {
    const allTemplates = characterTemplateService.getAllTemplates()
    const quickStartTemplates = allTemplates.filter(t => t.category === 'quick-start')
    const customTemplates = allTemplates.filter(t => t.category === 'custom')

    const handleTemplateSelect = (template: CharacterTemplate) => {
      updateState({
        characterData: template.characterData,
        selectedEquipment: template.selectedEquipment,
        selectedMoves: template.selectedMoves,
        equipmentChoices: template.equipmentChoices,
        createdBonds: template.bonds?.map(b => ({
          id: b.id || uuidv4(),
          text: b.text || '',
          characterName: b.characterName,
          resolved: false,
        })),
        currentStep: 'level', // Jump to level selection to customize character level
      })
    }

    const handleImportTemplate = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file)
          return

        try {
          const text = await file.text()
          const imported = characterTemplateService.importTemplate(text)
          handleTemplateSelect(imported)
        }
        catch (error: any) {
          updateState({ templateImportError: error instanceof Error ? error.message : 'Import failed' })
        }
      }
      input.click()
    }

    return (
      <div className="wizard-step templates-step">
        <h2> Choose a Starting Template</h2>
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
                  <div className="template-icon">{template.characterData.class ? '⚔️' : '🎭'}</div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <div className="template-class">
                    {template.characterData.class}
                    {' '}
                    •
                    {template.characterData.race}
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
                            characterTemplateService.deleteTemplate(template.id)
                            updateState({}) // Force re-render
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
              const randomChar = randomGeneratorService.generateRandomCharacter()
              updateState({
                characterData: randomChar,
                currentStep: 'portrait',
              })
            }}
          >
            🎲 Surprise Me!
          </button>
          <button className="btn btn-primary" onClick={nextStep}>
            Create from Scratch →
          </button>
        </div>
      </div>
    )
  }

  const renderNameLookStep = () => (
    <div className="wizard-step name-look-step">
      <h2> Who Are You?</h2>
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="character-name">
            Character Name
            <span className="tooltip" aria-label="Pick unknown fantasy-style name. You can randomize it if you're unsure.">?</span>
          </label>
          <input
            id="character-name"
            type="text"
            placeholder="Enter your character's name..."
            value={currentState.characterData.name || ''}
            onChange={e => updateState({
              characterData: { ...currentState.characterData, name: e.target.value },
            })}
            className="name-input"
          />
          <p className="field-help">Choose a name that fits a fantasy world</p>
        </div>

        <div className="form-group">
          <label htmlFor="character-looks">
            Appearance
            <span className="tooltip" aria-label="A short description others would notice at a glance.">?</span>
          </label>
          <textarea
            id="character-looks"
            placeholder="Describe how your character looks..."
            value={currentState.characterData.look || ''}
            onChange={e => updateState({
              characterData: { ...currentState.characterData, look: e.target.value },
            })}
            rows={4}
            className="looks-input"
          />
          <p className="field-help">
            What do others see when they look at you? Consider your build,
            hair, eyes, clothing, or unknown distinctive features.
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
            const race = currentState.characterData.race as Race | undefined
            const name = randomGeneratorService.generateName(race)
            updateState({
              characterData: { ...currentState.characterData, name },
            })
          }}
        >
          🎲 Random Name
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const race = currentState.characterData.race as Race | undefined
            const cls = currentState.characterData.class as CharacterClass | undefined
            const look = randomGeneratorService.generateAppearance(race, cls)
            updateState({
              characterData: { ...currentState.characterData, look },
            })
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
  )

  const renderBackgroundStep = () => {
    const current = currentState.characterData.background || ''
    return (
      <div className="wizard-step background-step">
        <h2> Background</h2>
        <p className="step-intro">
          Add a short backstory or motivation for your character. This helps roleplay and GM hooks.
        </p>
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="character-background">Your Story</label>
            <textarea
              id="character-background"
              placeholder="Why do you adventure? Where are you from? What drives you?"
              value={current}
              onChange={e => updateState({
                characterData: { ...currentState.characterData, background: e.target.value },
              })}
              rows={6}
              className="background-input"
            />
            <p className="field-help">Keep it to a few sentences. You can always expand later.</p>
          </div>
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
                alignment: currentState.characterData.alignment as Alignment | undefined,
              })
              updateState({ characterData: { ...currentState.characterData, background: bg } })
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
    )
  }

  const renderPersonalityStep = () => {
    const traits = currentState.characterData.personalityTraits || []
    const voice = currentState.characterData.voice || ''

    const presetTraits = ['brave', 'cautious', 'curious', 'stoic', 'hot-headed', 'compassionate', 'reckless', 'loyal', 'pragmatic', 'idealistic', 'sarcastic', 'cheerful', 'brooding', 'superstitious', 'methodical', 'impulsive']

    const toggleTrait = (t: string) => {
      const set = new Set(traits)
      if (set.has(t))
        set.delete(t); else set.add(t)
      updateState({ characterData: { ...currentState.characterData, personalityTraits: [...set] } })
    }

    return (
      <div className="wizard-step personality-step">
        <h2> Personality & Voice</h2>
        <p className="step-intro">Choose a few traits and describe how your character speaks.</p>

        <div className="form-group">
          <h3> Traits</h3>
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
          <div className="margin-top-075">
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
            onChange={e => updateState({ characterData: { ...currentState.characterData, voice: e.target.value } })}
          />
          <div className="margin-top-05">
            <button className="btn btn-small btn-secondary" onClick={() => updateState({ characterData: { ...currentState.characterData, voice: randomGeneratorService.generateVoice() } })}>
              🎲 Random Voice
            </button>
          </div>
        </div>

        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>← Back</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const caster: CharacterClass[] = ['Wizard', 'Cleric', 'Immolator']
              if (currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)) {
                updateState({ currentStep: 'spells' })
              }
              else {
                updateState({ currentStep: 'attributes' })
              }
            }}
          >
            Next →
          </button>
        </div>
      </div>
    )
  }

  const renderSpellsStep = () => {
    const cls = currentState.characterData.class as CharacterClass | undefined
    if (!cls || !['Wizard', 'Cleric', 'Immolator'].includes(cls)) {
      nextStep()
      return null
    }
    const allSpells = getSpellsForClass(cls as 'Wizard' | 'Cleric' | 'Immolator')
    const rotes = allSpells.filter(s => s.level === 0)
    const level1 = allSpells.filter(s => s.level === 1)

    // Defaults for selection if not set
    const selectedKnown = (currentState.characterData.knownSpells as string[]) || rotes.map(s => s.id)
    const selectedPrepared = (currentState.characterData.preparedSpells as string[]) || []

    const togglePrepared = (id: string) => {
      const set = new Set(selectedPrepared)
      if (set.has(id))
        set.delete(id); else set.add(id)
      updateState({ characterData: { ...currentState.characterData, preparedSpells: [...set] } })
    }

    const toggleKnown = (id: string) => {
      const set = new Set(selectedKnown)
      if (set.has(id))
        set.delete(id); else set.add(id)
      updateState({ characterData: { ...currentState.characterData, knownSpells: [...set] } })
    }

    return (
      <div className="wizard-step spells-step">
        <h2> Choose Your Spells</h2>
        <p className="step-intro">Select your rotes / cantrips and level 1 spells.</p>

        {rotes.length > 0 && (
          <div className="spells-section">
            <h3> Rotes / Cantrips (always known)</h3>
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
          <h3> Level 1 Spells</h3>
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
          <button className="btn btn-primary" onClick={nextStep}>Next: Level →</button>
        </div>
      </div>
    )
  }

  const renderPortraitStep = () => {
    const portraits = currentState.characterData.class && currentState.characterData.race
      ? portraitService.getSuggestedPortraits(currentState.characterData.class, currentState.characterData.race)
      : portraitService.getAllPortraits()

    const handleFileUpload = async (event: React.ChangeEvent <HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file)
        return

      try {
        const name = prompt('Name your portrait:') || 'Custom Portrait'
        const portrait = await portraitService.addCustomPortrait(file, name)
        updateState({
          characterData: { ...currentState.characterData, portraitId: portrait.id },
        })
      }
      catch (error) {
        console.error('Portrait upload failed:', error)
        alert('Failed to upload portrait. Please try again.')
      }
    }

    return (
      <div className="wizard-step portrait-step">
        <h2> Choose Your Portrait</h2>
        <p className="step-intro">
          Select a portrait that represents your character.
          {currentState.characterData.class && currentState.characterData.race
            && ` Showing suggestions for ${currentState.characterData.race} ${currentState.characterData.class}.`}
        </p>

        <div className="portrait-grid">
          {portraits.map(portrait => (
            <div
              key={portrait.id}
              className={`portrait-card ${currentState.characterData.portraitId === portrait.id ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, portraitId: portrait.id },
              })}
              style={{ '--portrait-color': portrait.color } as React.CSSProperties}
            >
              <div className="portrait-emoji">{portrait.emoji}</div>
              <div className="portrait-name">{portrait.name}</div>
              {portrait.tags.includes('custom') && (
                <button
                  className="remove-portrait"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Remove this portrait?')) {
                      portraitService.removeCustomPortrait(portrait.id)
                      if (currentState.characterData.portraitId === portrait.id) {
                        updateState({
                          characterData: { ...currentState.characterData, portraitId: undefined },
                        })
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
              className="hidden-input"
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
    )
  }

  const renderClassStep = () => (
    <div className="wizard-step class-step">
      <div className="step-content-container">
        <h2> Choose Your Class</h2>
        <p className="step-intro">Your class defines your role in the party and the kinds of things you're good at.</p>
        <div className="class-grid">
          {(Object.keys(CLASS_DESCRIPTIONS) as CharacterClass[]).map(cls => (
            <div
              key={cls}
              className={`class-card ${currentState.characterData.class === cls ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, class: cls },
              })}
            >
              <h3>{cls}</h3>
              <p className="class-tagline">{CLASS_DESCRIPTIONS[cls].tagline}</p>
              <p className="class-description">{CLASS_DESCRIPTIONS[cls].description}</p>
              <div className="class-details">
                <span className="playstyle">
                  🎮
                  {CLASS_DESCRIPTIONS[cls].playstyle}
                </span>
                <span className="primary-stat">
                  📊 Primary:
                  {CLASS_DESCRIPTIONS[cls].primaryStat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wizard-actions-sticky">
        <button className="btn btn-secondary" onClick={previousStep}>
          ← Back
        </button>
        <div className="step-progress-indicator">
          Step 2 of 8
        </div>
        <div className="action-group">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const classes = Object.keys(CLASS_DESCRIPTIONS) as CharacterClass[]
              const randomCls = classes[Math.floor(Math.random() * classes.length)]
              updateState({
                characterData: { ...currentState.characterData, class: randomCls },
              })
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
    </div>
  )

  const renderLevelStep = () => {
    const { characterData, selectedLevel, selectedMove, selectedStat } = currentState

    if (!characterData.class) {
      return (
        <div className="step-content">
          <p className="error-message">Please select a class first.</p>
        </div>
      )
    }

    const handleLevelChange = (level: number, progression: LevelProgression) => {
      updateState({
        selectedLevel: level,
        levelProgression: progression,
        selectedMove: undefined, // Reset advancements when level changes
        selectedStat: undefined,
        advancementPlan: undefined,
      })
    }

    const handleAdvancementsChange = (move?: AdvancementChoice, stat?: AdvancementChoice, plan?: AdvancementPlan) => {
      // For multi-level advancement, we need to track all advancements
      // The AdvancementSelector now handles this internally, so we just need to track the overall plan
      updateState({
        selectedMove: move,
        selectedStat: stat,
        advancementPlan: plan,
      })
    }

    const needsAdvancements = selectedLevel > 1
    const hasValidAdvancements = needsAdvancements && currentState.advancementPlan?.isValid

    return (
      <div className="step-content">
        <div className="step-header">
          <h2>🎯 Choose Your Character's Power Level</h2>
          <div className="level-explanation">
            <p className="step-intro">
              <strong> New to Dungeon World?</strong>
              {' '}
              Start at Level 1-it's perfect for learning!
            </p>
            <p className="step-intro">
              <strong> Experienced player?</strong>
              {' '}
              Higher levels give you more abilities but require advancement choices.
            </p>
          </div>
        </div>

        <div className="level-wizard">
          {/* Step 1: Choose Level */}
          <div className="level-wizard-step">
            <div className="wizard-step-header">
              <span className="step-number">1</span>
              <h3> Select Starting Level</h3>
            </div>

            <div className="level-choice-cards">
              <div
                className={`level-choice-card ${selectedLevel === 1 ? 'selected' : ''}`}
                onClick={() => handleLevelChange(1, advancementService.getLevelProgression(1, characterData.class))}
              >
                <div className="level-card-header">
                  <span className="level-number">Level 1</span>
                  <span className="level-badge beginner">Beginner Friendly</span>
                </div>
                <div className="level-card-content">
                  <p><strong> Perfect for new players!</strong></p>
                  <p> Start with your class basics and learn the game naturally.</p>
                  <div className="level-benefits">
                    <span>✨ No complex choices</span>
                    <span>📚 Learn as you play</span>
                    <span>🎲 Full Dungeon World experience</span>
                  </div>
                </div>
              </div>

              <div
                className={`level-choice-card ${selectedLevel > 1 ? 'selected' : ''}`}
                onClick={() => selectedLevel === 1 && handleLevelChange(2, advancementService.getLevelProgression(2, characterData.class))}
              >
                <div className="level-card-header">
                  <span className="level-number">Level 2-10</span>
                  <span className="level-badge advanced">Advanced</span>
                </div>
                <div className="level-card-content">
                  <p><strong> For experienced players</strong></p>
                  <p> More powerful, but requires advancement choices.</p>
                  <div className="level-benefits">
                    <span>⚡ More abilities</span>
                    <span>🎯 Customization options</span>
                    <span>🏆 Higher starting resources</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedLevel > 1 && (
              <div className="level-fine-tuning">
                <label htmlFor="level-slider" className="level-label">
                  Fine-tune level:
                  {' '}
                  <span className="level-value">
                    Level
                    {selectedLevel}
                  </span>
                </label>
                <input
                  id="level-slider"
                  type="range"
                  min={2}
                  max={10}
                  value={selectedLevel}
                  onChange={e => handleLevelChange(Number.parseInt(e.target.value), advancementService.getLevelProgression(Number.parseInt(e.target.value), characterData.class))}
                  className="level-slider"
                />
                <div className="level-markers">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <span key={level} className={`level-marker ${level === selectedLevel ? 'active' : ''}`}>
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Level Benefits Preview */}
          {currentState.levelProgression && (
            <div className="level-benefits-preview">
              <h4>
                📊 Level
                {selectedLevel}
                {' '}
                Benefits
              </h4>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">❤️</span>
                  <span className="benefit-label">Hit Points</span>
                  <span className="benefit-value">
                    {currentState.levelProgression.baseHP}
                    {' '}
                    HP
                  </span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💰</span>
                  <span className="benefit-label">Starting Coin</span>
                  <span className="benefit-value">{currentState.levelProgression.startingCoin}</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⭐</span>
                  <span className="benefit-label">Experience</span>
                  <span className="benefit-value">
                    {currentState.levelProgression.xp}
                    {' '}
                    XP
                  </span>
                </div>
                {currentState.levelProgression.totalAdvancementPoints > 0 && (
                  <div className="benefit-item">
                    <span className="benefit-icon">🎯</span>
                    <span className="benefit-label">Advancement Points</span>
                    <span className="benefit-value">{currentState.levelProgression.totalAdvancementPoints}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Choose Advancements (only if level > 1) */}
          {needsAdvancements && characterData && characterData.class && (
            <div className="level-wizard-step">
              <div className="wizard-step-header">
                <span className="step-number">2</span>
                <h3> Choose Your Character Improvements</h3>
                <div className="step-explanation">
                  <p>
                    <strong>
                      {' '}
                      How did your character grow from Level 1 to Level
                      {selectedLevel}
                      ?
                    </strong>
                    {' '}
                    You get to make
                    {currentState.levelProgression.totalAdvancementPoints}
                    {' '}
                    advancement choices.
                  </p>
                  <div className="improvement-breakdown">
                    <div className="improvement-type">
                      <span className="improvement-icon">🎯</span>
                      <span className="improvement-text">
                        <strong> Each advancement</strong>
                        {' '}
                        lets you choose ONE of:
                        <small>
                          • +1 to unknown ability score (STR, DEX, CON, INT, WIS, or CHA)
                          <br />
                          • A new class move or advanced move
                          {' '}
                          <br />
                          • A move from another class (multiclass)
                          <br />
                          • New spells (for spellcasters)
                        </small>
                      </span>
                    </div>
                    <div className="improvement-type">
                      <span className="improvement-icon">⚖️</span>
                      <span className="improvement-text">
                        <strong> Your choice!</strong>
                        {' '}
                        You can focus on attributes, abilities, or mix them.
                        <small> Want a strong fighter? Take + 1 STR every level. Want versatility? Mix moves and stats.</small>
                      </span>
                    </div>
                  </div>
                  <div className="advancement-instructions">
                    <p><strong>📋 Instructions:</strong></p>
                    <ol>
                      <li>
                        {' '}
                        Click the
                        <strong>"Advanced Moves"</strong>
                        {' '}
                        tab and select one move
                      </li>
                      <li>
                        {' '}
                        Click the
                        <strong>"Ability Scores"</strong>
                        {' '}
                        tab and select one stat to increase
                      </li>
                      <li> Both selections are required to proceed</li>
                    </ol>
                  </div>
                </div>
              </div>

              <AdvancementSelector
                character={{
                  ...characterData,
                  // Use assigned attributes with racial bonuses if available, otherwise provide defaults
                  attributes: currentState.assignedAttributes && Object.keys(currentState.assignedAttributes).length === 6
                    ? applyRacialBonuses(currentState.assignedAttributes as Attributes, characterData.race)
                    : { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
                } as Character}
                targetLevel={selectedLevel}
                selectedMove={selectedMove}
                selectedStat={selectedStat}
                onAdvancementsChange={handleAdvancementsChange}
              />
            </div>
          )}

          {/* Progress Indicator */}
          <div className="level-wizard-progress">
            <div className="progress-steps">
              <div className="progress-step completed">
                <span className="progress-number">1</span>
                <span className="progress-label">Level Selected</span>
              </div>
              {needsAdvancements && (
                <div className={`progress-step ${hasValidAdvancements ? 'completed' : 'current'}`}>
                  <span className="progress-number">2</span>
                  <span className="progress-label">Choose Improvements</span>
                </div>
              )}
              <div className={`progress-step ${(!needsAdvancements || hasValidAdvancements) ? 'current' : ''}`}>
                <span className="progress-number">✓</span>
                <span className="progress-label">Ready to Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={nextStep}
            disabled={selectedLevel < 1 || (needsAdvancements && !hasValidAdvancements)}
          >
            Next: Advanced Options →
          </button>
        </div>
      </div>
    )
  }

  const renderRaceStep = () => {
    const availableRaces = currentState.characterData.class
      ? CLASS_RACES[currentState.characterData.class as CharacterClass]
      : []

    const raceInfo: Record <Race, { description: string, abilities: string[], mechanics: string }> = {
      Human: {
        description: 'Ambitious and diverse, humans are the most common people in the world. They adapt quickly to unknown situation and push themselves to excel at whatever they set their minds to.',
        abilities: [
          'Versatile: Choose one ability score to increase by 1',
          'Driven: Your determination and ambition help you learn faster from meaningful experiences',
        ],
        mechanics: 'Humans are adaptable and driven, gaining flexibility in their strengths and learning quickly from their actions.',
      },
      Elf: {
        description: 'Graceful and wise, elves have keen senses and a deep connection to nature and magic. Having lived for centuries, they possess knowledge that spans generations.',
        abilities: [
          'Keen Senses: You can naturally detect magical auras and enchantments around you',
          'Elven Grace: Your natural dexterity is enhanced (+1 DEX)',
          'Ancient Wisdom: Your long life grants you knowledge of historical events and forgotten lore',
        ],
        mechanics: 'Elves are naturally perceptive and agile, with the wisdom that comes from centuries of experience.',
      },
      Dwarf: {
        description: 'Stout and sturdy, dwarves are master crafters and fierce warriors. They value tradition, honor, and have an innate understanding of stone and metal.',
        abilities: [
          'Dwarven Toughness: Your hardy constitution grants you additional vitality (+2 HP)',
          'Stone Sense: You have an intuitive understanding of stonework, construction, and underground spaces',
          'Iron Constitution: Your natural resilience is enhanced (+1 CON)',
        ],
        mechanics: 'Dwarves are naturally hardy and tough, with an instinctive knowledge of craftsmanship and stonework.',
      },
      Halfling: {
        description: 'Small in stature but large in courage, halflings are naturally nimble and seem to have fortune smile upon them. They value comfort and community, but don\'t hesitate when adventure calls.',
        abilities: [
          'Blessed Fortune: You can call upon your natural luck in dire moments (3 luck points to reroll dice)',
          'Brave Heart: Your courage grows stronger when facing overwhelming odds',
          'Halfling Nimbleness: Your small size grants you enhanced agility (+1 DEX)',
        ],
        mechanics: 'Halflings are naturally lucky and brave, with enhanced agility that comes from their small stature.',
      },
      Other: {
        description: 'You come from a unique heritage-perhaps from distant lands, ancient bloodlines, or cultures unknown to most. Your background shapes you in ways others might not understand.',
        abilities: [
          'Unique Heritage: Your unusual background grants you a distinctive ability or trait',
          'Cultural Wisdom: You possess deep knowledge of your homeland and its customs',
          'Adaptive Nature: Your diverse background has strengthened one of your natural abilities (+1 to chosen stat)',
        ],
        mechanics: 'Your unique heritage provides distinctive advantages and knowledge that others lack.',
      },
    }

    return (
      <div className="wizard-step race-step">
        <h2> Choose Your Heritage</h2>
        <p className="step-intro">
          Your race affects how you interact with the world and may provide special abilities.
          <span className="tooltip" aria-label="Some classes have limited race choices based on the setting.">?</span>
        </p>
        <div className="race-options">
          {availableRaces.map((race: Race) => {
            const info = raceInfo[race as Race]
            return (
              <div
                key={race}
                className={`race-card ${currentState.characterData.race === race ? 'selected' : ''}`}
                onClick={() => updateState({
                  characterData: { ...currentState.characterData, race },
                })}
              >
                <div className="race-header">
                  <h3>{race}</h3>
                  <span className="race-mechanics">{info.mechanics}</span>
                </div>
                <p className="race-description">{info.description}</p>
                <div className="race-abilities">
                  <h4> Racial Abilities:</h4>
                  <ul>
                    {info.abilities.map((item, index) => (
                      <li key={index}>{ability}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const available = availableRaces as Race[]
              if (!available || available.length === 0)
                return
              const race = available[Math.floor(Math.random() * available.length)]
              updateState({
                characterData: { ...currentState.characterData, race },
              })
            }}
          >
            🎲 Random Race
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const caster: CharacterClass[] = ['Wizard', 'Cleric', 'Immolator']
              if (currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)) {
                updateState({ currentStep: 'personality' })
              }
              else {
                nextStep()
              }
            }}
            disabled={!currentState.characterData.race}
          >
            {(() => {
              const caster: CharacterClass[] = ['Wizard', 'Cleric', 'Immolator']
              return currentState.characterData.class && caster.includes(currentState.characterData.class as CharacterClass)
                ? 'Next: Personality →'
                : 'Next: Assign Abilities →'
            })()}
          </button>
        </div>
      </div>
    )
  }

  const renderAttributesStep = () => {
    const attributeNames: (keyof Attributes)[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
    const attributeDescriptions = {
      STR: 'Strength-Physical power, melee damage, carrying capacity',
      DEX: 'Dexterity-Agility, reflexes, ranged attacks, dodging',
      CON: 'Constitution-Health, stamina, physical resilience',
      INT: 'Intelligence-Reasoning, knowledge, spell power for wizards',
      WIS: 'Wisdom-Perception, willpower, divine magic',
      CHA: 'Charisma-Force of personality, leadership, social skills',
    }

    const scores = currentState.attributeMethod === 'roll'
      ? currentState.rolledScores || []
      : STANDARD_ARRAY

    const assignedCount = Object.keys(currentState.assignedAttributes || {}).length
    const remainingScores = scores.filter((score: number, index: number) => {
      const assigned = Object.values(currentState.assignedAttributes || {}) as number[]
      return !assigned.includes(score)
        || assigned.filter((s: number) => s === score).length <= scores.filter((s: number) => s === score).slice(0, index + 1).length - 1
    })

    return (
      <div className="wizard-step attributes-step">
        <h2> Assign Your Abilities</h2>
        <p className="step-intro">
          Choose how to determine your character's core abilities. Each method offers a different experience.
        </p>

        <div className="step-cards">
          {/* Card 1: Method Selection */}
          <div className="step-card method-card">
            <div className="card-header">
              <h3>🎲 Generation Method</h3>
              <p className="card-subtitle">How do you want to determine your stats?</p>
            </div>
            <div className="method-options">
              <div
                className={`method-option ${currentState.attributeMethod === 'array' ? 'selected' : ''}`}
                onClick={() => updateState({ attributeMethod: 'array', rolledScores: undefined })}
              >
                <div className="method-icon">📊</div>
                <div className="method-content">
                  <h4> Standard Array</h4>
                  <p> Balanced and fair-use predetermined values</p>
                  <div className="method-values">16, 15, 13, 12, 9, 8</div>
                </div>
              </div>
              <div
                className={`method-option ${currentState.attributeMethod === 'roll' ? 'selected' : ''}`}
                onClick={() => updateState({ attributeMethod: 'roll' })}
              >
                <div className="method-icon">🎲</div>
                <div className="method-content">
                  <h4> Roll for Stats</h4>
                  <p> Random and exciting-roll 3d6 for each ability</p>
                  <div className="method-values">Unpredictable results!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Rolling Section (if roll method selected) */}
          {currentState.attributeMethod === 'roll' && (
            <div className="step-card roll-card">
              <div className="card-header">
                <h3>🎲 Roll Your Stats</h3>
                <p className="card-subtitle">Generate your ability scores</p>
              </div>
              <div className="roll-controls">
                {!currentState.rolledScores
                  ? (
                      <button className="btn btn-primary btn-large" onClick={rollAbilityScores}>
                        🎲 Roll Ability Scores
                      </button>
                    )
                  : (
                      <div className="roll-results">
                        <div className="rolled-scores">
                          <span className="scores-label">Your rolls:</span>
                          <div className="scores-display">
                            {currentState.rolledScores.map((score: number, index: number) => (
                              <span key={index} className="score-value">{score}</span>
                            ))}
                          </div>
                        </div>
                        <button className="btn btn-secondary" onClick={rollAbilityScores}>
                          🎲 Reroll All
                        </button>
                      </div>
                    )}
              </div>
            </div>
          )}

          {/* Card 3: Attribute Assignment */}
          {scores.length > 0 && (
            <div className="step-card assignment-card">
              <div className="card-header">
                <h3>📊 Assign Your Abilities</h3>
                <p className="card-subtitle">Drag scores to abilities or use dropdowns</p>
              </div>

              <div className="available-scores">
                <h4> Available Scores:</h4>
                <div className="score-chips">
                  {remainingScores.map((score: number, index: number) => (
                    <span key={index} className="score-chip">
                      {score}
                    </span>
                  ))}
                </div>
              </div>

              <div className="attributes-grid">
                {attributeNames.map((attr) => {
                  const isRecommended = currentState.characterData.class
                    && CLASS_DESCRIPTIONS[currentState.characterData.class as CharacterClass].primaryStat === attr
                  const racialBonus = currentState.characterData.race ? getRacialBonuses(currentState.characterData.race).attributes[attr] || 0 : 0
                  const baseValue = currentState.assignedAttributes?.[attr] || 0
                  const finalValue = baseValue + racialBonus

                  return (
                    <div key={attr} className={`attribute-card ${isRecommended ? 'recommended' : ''}`}>
                      <div className="attribute-header">
                        <div className="attr-name-section">
                          <h4>{attr}</h4>
                          {isRecommended && <span className="recommended-badge">⭐ Primary</span>}
                        </div>
                        <div className="attr-value-section">
                          {baseValue > 0 && (
                            <div className="final-value">
                              {racialBonus > 0
                                ? (
                                    <span>
                                      {baseValue}
                                      {' '}
                                      +
                                      {' '}
                                      {racialBonus}
                                      {' '}
                                      =
                                      {' '}
                                      <strong>{finalValue}</strong>
                                    </span>
                                  )
                                : (
                                    <strong>{baseValue}</strong>
                                  )}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="attribute-desc">{attributeDescriptions[attr]}</p>
                      <select
                        value={currentState.assignedAttributes?.[attr] || ''}
                        aria-label={`Select score for ${attr}`}
                        className="attribute-select"
                        onChange={(e) => {
                          const value = e.target.value ? Number.parseInt(e.target.value) : undefined
                          const newAssigned = { ...currentState.assignedAttributes }
                          if (value) {
                            newAssigned[attr] = value
                          }
                          else {
                            delete newAssigned[attr]
                          }
                          updateState({ assignedAttributes: newAssigned })
                        }}
                      >
                        <option value="">Select score...</option>
                        {scores.map((score: number, index: number) => {
                          const timesUsed = Object.values(currentState.assignedAttributes || {})
                            .filter(s => s === score)
                            .length
                          const timesAvailable = scores.filter((s: number) => s === score).length
                          const isAvailable = timesUsed < timesAvailable
                            || currentState.assignedAttributes?.[attr] === score

                          return (
                            <option
                              key={index}
                              value={score}
                              disabled={!isAvailable}
                            >
                              {score}
                              {' '}
                              {!isAvailable && '(already assigned)'}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  )
                })}
              </div>

              <div className="auto-assign-section">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const cls = currentState.characterData.class as CharacterClass
                    if (!cls)
                      return
                    const assigned = randomGeneratorService.assignAttributesForClass(scores, cls)
                    updateState({ assignedAttributes: assigned })
                  }}
                  disabled={!currentState.characterData.class}
                >
                  ⚡ Auto-Assign (Recommended for
                  {' '}
                  {currentState.characterData.class}
                  )
                </button>
              </div>
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
              const method = currentState.attributeMethod
              const scores = method === 'roll'
                ? (currentState.rolledScores && currentState.rolledScores.length === 6
                    ? currentState.rolledScores
                    : ((): number[] => {
                        const rs = randomGeneratorService.generateAttributes('roll')
                        updateState({ rolledScores: rs })
                        return rs
                      })())
                : STANDARD_ARRAY
              const cls = currentState.characterData.class as CharacterClass | undefined
              if (!cls)
                return
              const assigned = randomGeneratorService.assignAttributesForClass(scores, cls)
              updateState({ assignedAttributes: assigned })
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
    )
  }

  const renderAlignmentStep = () => {
    const alignmentDescriptions: Record <Alignment, string> = {
      Good: 'You help others and protect the innocent',
      Lawful: 'You follow rules, traditions, and keep your word',
      Neutral: 'You act according to the situation and your needs',
      Chaotic: 'You value freedom and reject restrictions',
      Evil: 'You pursue power and don\'t care who gets hurt',
    }

    // Class-specific alignment moves would go here
    const classAlignments: Record <CharacterClass, Alignment[]> = {
      Fighter: ['Good', 'Neutral', 'Evil'],
      Paladin: ['Lawful', 'Good'],
      Ranger: ['Good', 'Neutral', 'Chaotic'],
      Thief: ['Neutral', 'Chaotic', 'Evil'],
      Bard: ['Good', 'Neutral', 'Chaotic'],
      Cleric: ['Good', 'Lawful', 'Evil'],
      Druid: ['Neutral', 'Chaotic'],
      Wizard: ['Good', 'Neutral', 'Evil'],
      Barbarian: ['Chaotic', 'Neutral'],
      Immolator: ['Neutral', 'Evil'],
    }

    const availableAlignments = currentState.characterData.class
      ? classAlignments[currentState.characterData.class as CharacterClass]
      : []

    return (
      <div className="wizard-step alignment-step">
        <h2> Choose Your Alignment</h2>
        <p className="step-intro">
          Your alignment guides your character's moral compass and grants you special XP triggers.
        </p>
        <div className="alignment-options">
          {availableAlignments.map((alignment: Alignment) => (
            <div
              key={alignment}
              className={`alignment-card ${currentState.characterData.alignment === alignment ? 'selected' : ''}`}
              onClick={() => updateState({
                characterData: { ...currentState.characterData, alignment },
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
              const alignments = availableAlignments as Alignment[]
              if (!alignments || alignments.length === 0)
                return
              const a = alignments[Math.floor(Math.random() * alignments.length)]
              updateState({
                characterData: { ...currentState.characterData, alignment: a },
              })
            }}
          >
            🎲 Random Alignment
          </button>
          <button
            className="btn btn-primary"
            onClick={nextStep}
            disabled={!currentState.characterData.alignment}
          >
            Next: Advanced Options →
          </button>
        </div>
      </div>
    )
  }

  const renderAdvancedOptionsStep = () => {
    return (
      <AdvancedOptionsStep
        character={currentState.characterData}
        onUpdate={updates => updateState({ characterData: { ...currentState.characterData, ...updates } })}
        onNext={nextStep}
        onBack={previousStep}
      />
    )
  }

  const renderMovesEquipmentStep = () => {
    const classData = currentState.characterData.class
      ? CLASS_STARTING_DATA[currentState.characterData.class as CharacterClass]
      : null

    if (!classData)
      return null

    // Initialize equipment if not set
    if (!currentState.selectedEquipment) {
      updateState({
        selectedEquipment: classData.equipment,
        selectedMoves: classData.moves,
        equipmentChoices: {},
      })
    }

    const handleEquipmentChoice = (choiceIndex: number, optionIndex: number) => {
      const choice = classData.choices?.equipment?.[choiceIndex]
      if (!choice)
        return

      const newChoices = { ...currentState.equipmentChoices, [choiceIndex]: optionIndex }

      // Rebuild equipment list with choices
      let newEquipment = [...classData.equipment]

      // Add all selected choice items
      for (const [idx, optIdx] of Object.entries(newChoices)) {
        const choiceData = classData.choices?.equipment?.[Number.parseInt(idx)]
        if (choiceData && typeof optIdx === 'number') {
          newEquipment = [...newEquipment, ...choiceData.options[optIdx as number]]
        }
      }

      updateState({
        equipmentChoices: newChoices,
        selectedEquipment: newEquipment,
      })
    }

    return (
      <div className="wizard-step moves-equipment-step">
        <div className="step-content-container">
          <h2> Starting Moves & Equipment</h2>
          <p className="step-intro">
            Your class grants you special moves and starting gear for your adventures.
          </p>

          <div className="step-cards">
            {/* Card 1: Starting Moves-Two Column Grid */}
            <div className="step-card moves-card">
              <div className="card-header">
                <h3>⚔️ Starting Moves</h3>
                <p className="card-subtitle">Your class abilities</p>
              </div>
              <div className="moves-grid-two-column">
                {currentState.selectedMoves?.map((move: string) => (
                  <div key={move} className="move-item">
                    <div className="move-icon">🎯</div>
                    <div className="move-content">
                      <h4 className="move-name">{move}</h4>
                      <p className="move-description">
                        A powerful ability that defines your class and combat style.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Starting Equipment-Multi-Column Pills */}
            <div className="step-card equipment-card">
              <div className="card-header">
                <h3>🎒 Starting Equipment</h3>
                <p className="card-subtitle">Your guaranteed gear</p>
              </div>
              <div className="equipment-grid-multi-column">
                {classData.equipment.map((item: Partial <Item> | Partial <Weapon> | Partial <Armor>, index: number) => (
                  <div key={index} className="equipment-pill">
                    <span className="item-name">{item.name}</span>
                    <div className="item-details">
                      {item.weight !== undefined && (
                        <span className="detail">
                          ⚖️
                          {item.weight}
                        </span>
                      )}
                      {'armor' in item && 'armor' in item && (
                        <span className="detail">
                          🛡️
                          {(item as { armor: number }).armor}
                        </span>
                      )}
                      {'damage' in item && 'damage' in item && (
                        <span className="detail">
                          ⚔️
                          {(item as { damage: string }).damage}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Gear Choices-Side-by-Side Comparison */}
            {classData.choices?.equipment && (
              <div className="step-card choices-card">
                <div className="card-header">
                  <h3>⚔️ Choose Your Gear</h3>
                  <p className="card-subtitle">Select your preferred equipment</p>
                </div>
                <div className="choices-container-wide">
                  {classData.choices.equipment.map((choice: { prompt: string, options: (Partial <Item> | Partial <Weapon> | Partial <Armor>)[][] }, choiceIndex: number) => (
                    <div key={choiceIndex} className="choice-group-wide">
                      <h4 className="choice-prompt">{choice.prompt}</h4>
                      <div className="choice-comparison-side-by-side">
                        {choice.options.map((option: (Partial <Item> | Partial <Weapon> | Partial <Armor>)[], optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`comparison-card-wide 
                              currentState.equipmentChoices?.[choiceIndex] === optionIndex ? 'selected' : ''}
                            }`}
                            onClick={() => handleEquipmentChoice(choiceIndex, optionIndex)}
                          >
                            <div className="selection-indicator">
                              {currentState.equipmentChoices?.[choiceIndex] === optionIndex && <span className="checkmark">✓</span>}
                            </div>
                            <div className="option-content">
                              {option.map((item: Partial <Item> | Partial <Weapon> | Partial <Armor>, itemIndex: number) => (
                                <div key={itemIndex} className="option-item">
                                  <h5 className="item-title">{item.name}</h5>
                                  {item.description && <p className="item-desc">{item.description}</p>}
                                  <div className="item-stats-grid">
                                    {item.weight !== undefined && (
                                      <div className="stat">
                                        ⚖️
                                        {item.weight}
                                        {' '}
                                        weight
                                      </div>
                                    )}
                                    {'armor' in item && 'armor' in item && (
                                      <div className="stat">
                                        🛡️
                                        {(item as { armor: number }).armor}
                                        {' '}
                                        armor
                                      </div>
                                    )}
                                    {'damage' in item && 'damage' in item && (
                                      <div className="stat">
                                        ⚔️
                                        {(item as { damage: string }).damage}
                                        {' '}
                                        damage
                                      </div>
                                    )}
                                    {item.tags && (
                                      <div className="stat tags">
                                        <TagDisplay
                                          tags={item.tags}
                                          showTooltips={true}
                                          className="item-tags-compact"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4: Starting Coin-Wide Bar Format */}
            <div className="step-card coin-card-wide">
              <div className="card-header">
                <h3>💰 Starting Coin</h3>
                <p className="card-subtitle">Your initial wealth</p>
              </div>
              <div className="coin-controls-wide">
                <div className="coin-display-large">
                  <div className="coin-icon">💰</div>
                  <div className="coin-amount">
                    <span className="coin-number">{currentState.characterData.coin ?? 0}</span>
                    <span className="coin-unit">coin</span>
                  </div>
                </div>
                <div className="coin-buttons-horizontal">
                  <button
                    className="btn btn-secondary coin-btn-wide"
                    onClick={() => updateState({ characterData: { ...currentState.characterData, coin: 10 } })}
                  >
                    📋 Use Standard (10)
                  </button>
                  <button
                    className="btn btn-secondary coin-btn-wide"
                    onClick={() => updateState({ characterData: { ...currentState.characterData, coin: (currentState.characterData.coin ?? 0) + 5 } })}
                  >
                    +5 Coin
                  </button>
                  <button
                    className="btn btn-secondary coin-btn-wide"
                    onClick={() => updateState({ characterData: { ...currentState.characterData, coin: (currentState.characterData.coin ?? 0) + 10 } })}
                  >
                    +10 Coin
                  </button>
                  <button
                    className="btn btn-primary coin-btn-wide"
                    onClick={() => {
                      const d6 = () => Math.floor(Math.random() * 6) + 1
                      const roll = (d6() + d6()) * 10
                      updateState({ characterData: { ...currentState.characterData, coin: roll } })
                    }}
                  >
                    🎲 Roll 2d6×10
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Sticky Footer */}
        <div className="wizard-actions-sticky">
          <button className="btn btn-secondary" onClick={previousStep}>
            ← Back
          </button>
          <div className="step-progress-indicator">
            Step 5 of 8
          </div>
          <button
            className="btn btn-primary"
            onClick={nextStep}
            disabled={
              classData.choices?.equipment
              && Object.keys(currentState.equipmentChoices || {}).length < classData.choices.equipment.length
            }
          >
            Next: Create Bonds →
          </button>
        </div>
      </div>
    )
  }

  const renderBondsStep = () => {
    const bondTemplates = currentState.characterData.class
      ? CLASS_BOND_TEMPLATES[currentState.characterData.class as CharacterClass]
      : []

    const bonds = currentState.createdBonds || []
    const partyNames = Object.values(state.characters || {})
      .map((c: Character) => c.name)
      .filter((n: string | undefined): n is string => n !== undefined && n.trim().length > 0)

    const addBond = () => {
      const newBond: Bond = {
        id: uuidv4(),
        text: '',
        resolved: false,
      }
      updateState({ createdBonds: [...bonds, newBond] })
    }

    const updateBond = (bondId: string, text: string) => {
      const updatedBonds = bonds.map((bond: Bond) =>
        bond.id === bondId ? { ...bond, text } : bond,
      )
      updateState({ createdBonds: updatedBonds })
    }

    const removeBond = (bondId: string) => {
      const updatedBonds = bonds.filter((bond: Bond) => bond.id !== bondId)
      updateState({ createdBonds: updatedBonds })
    }

    return (
      <div className="wizard-step bonds-step">
        <h2> Create Your Bonds</h2>
        <p className="step-intro">
          Bonds represent your character's relationships with other party members.
          Fill in the blanks with character names or create your own bonds.
        </p>

        <div className="bond-templates">
          <h3> Bond Templates</h3>
          {partyNames.length > 0 && (
            <div className="form-group margin-bottom-1">
              <label htmlFor="bond-party-target">Fill blanks with party member:</label>
              <select
                id="bond-party-target"
                value={currentState.bondPartyTarget || ''}
                onChange={e => updateState({ bondPartyTarget: e.target.value })}
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
                    text: currentState.bondPartyTarget ? template.replace('___', currentState.bondPartyTarget) : template,
                    resolved: false,
                  }
                  updateState({ createdBonds: [...bonds, newBond] })
                }}
              >
                <span className="template-text">{template}</span>
                <span className="add-icon">+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="active-bonds">
          <h3> Your Bonds</h3>
          {bonds.length === 0
            ? (
                <p className="no-bonds">No bonds created yet. Click templates above or create custom bonds.</p>
              )
            : (
                <div className="bonds-list">
                  {bonds.map((bond: Bond, index: number) => (
                    <div key={bond.id} className="bond-item">
                      <span className="bond-number">
                        {index + 1}
                        .
                      </span>
                      <textarea
                        value={bond.text}
                        onChange={e => updateBond(bond.id, e.target.value)}
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
            <li> Replace "___ " with another player character's name</li>
            <li> You can modify templates to better fit your character</li>
            <li> Create 2-3 bonds to start; you can add more during play</li>
            <li> Bonds drive character interaction and grant XP when resolved</li>
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
    )
  }

  const renderReviewStep = () => {
    const attrs = currentState.assignedAttributes as Attributes
    const character = currentState.characterData

    return (
      <div className="wizard-step review-step">
        <h2> Review Your Character</h2>
        <div className="character-summary">
          <div className="summary-section">
            <h3> Basic Information</h3>
            <p>
              <strong> Name:</strong>
              {' '}
              {character.name}
            </p>
            <p>
              <strong> Class:</strong>
              {' '}
              {character.class}
            </p>
            <p>
              <strong> Race:</strong>
              {' '}
              {character.race}
            </p>
            <p>
              <strong> Alignment:</strong>
              {' '}
              {character.alignment}
            </p>
            <p>
              <strong> Coin:</strong>
              {' '}
              {currentState.characterData.coin ?? 0}
            </p>
          </div>

          {character.look && (
            <div className="summary-section">
              <h3> Appearance</h3>
              <p>{character.look}</p>
            </div>
          )}

          <div className="summary-section">
            <h3> Abilities</h3>
            <div className="ability-summary">
              {attrs && Object.entries(attrs).map(([key, value]) => (
                <div key={key} className="ability-score">
                  <span className="ability-name">{key}</span>
                  <span className="ability-value">{value}</span>
                  <span className="ability-modifier">
                    (
                    {value >= 16 ? '+2' : value >= 13 ? '+1' : value >= 9 ? '+0' : value >= 6 ? '-1' : value >= 4 ? '-2' : '-3'}
                    )
                  </span>
                </div>
              ))}
            </div>
          </div>

          {character.background && (
            <div className="summary-section">
              <h3> Background</h3>
              <p>{character.background}</p>
            </div>
          )}

          {(currentState.characterData.personalityTraits || currentState.characterData.voice) && (
            <div className="summary-section">
              <h3> Personality</h3>
              {currentState.characterData.personalityTraits && currentState.characterData.personalityTraits.length > 0 && (
                <p>
                  <strong> Traits:</strong>
                  {' '}
                  {currentState.characterData.personalityTraits.join(', ')}
                </p>
              )}
              {currentState.characterData.voice && (
                <p>
                  <strong> Voice:</strong>
                  {' '}
                  {currentState.characterData.voice}
                </p>
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
              const templateName = prompt('Template name:')
              if (templateName) {
                characterTemplateService.saveTemplate({
                  name: templateName,
                  description: `${character.race} ${character.class}-${character.name}`,
                  category: 'custom',
                  characterData: character,
                  selectedEquipment: currentState.selectedEquipment,
                  selectedMoves: currentState.selectedMoves,
                  bonds: currentState.createdBonds,
                })
                alert('Template saved successfully!')
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
    )
  }

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentState.currentStep) {
      case 'intro':
        return renderIntroStep()
      case 'templates':
        return renderTemplatesStep()
      case 'name-look':
        return renderNameLookStep()
      case 'background':
        return renderBackgroundStep()
      case 'portrait':
        return renderPortraitStep()
      case 'class':
        return renderClassStep()
      case 'race':
        return renderRaceStep()
      case 'level':
        return renderLevelStep()
      case 'personality':
        return renderPersonalityStep()
      case 'spells':
        return renderSpellsStep()
      case 'attributes':
        return renderAttributesStep()
      case 'alignment':
        return renderAlignmentStep()
      case 'advanced-options':
        return renderAdvancedOptionsStep()
      case 'review':
        return renderReviewStep()
      case 'moves-equipment':
        return renderMovesEquipmentStep()
      case 'bonds':
        return renderBondsStep()
      default:
        return (
          <div>
            {' '}
            Step not implemented yet:
            {currentState.currentStep}
          </div>
        )
    }
  }

  return (
    <div className="character-creation-panel">
      {currentState.currentStep !== 'intro' && renderProgressBar()}
      <div className="wizard-content">
        {renderCurrentStep()}
      </div>
      {showSuccess && (
        <div className="success-message">
          ✨ Character Created Successfully! ✨
        </div>
      )}

      {/* Character Creation Assistant-Enhanced floating tools */}
      <CharacterCreationAssistant
        currentStep={currentState.currentStep}
        currentState={currentState}
        onStateUpdate={updateState}
        onNextStep={nextStep}
        onPreviousStep={previousStep}
        onFinalizeCharacter={finalizeCharacter}
        canProceed={true} // Simplified for now
        position="bottom-right"
      />
    </div>
  )
}

export default createPanel(
  {
    id: 'character-creation',
    name: 'Create Character',
    icon: '✨',
    description: 'Create a new character for your adventures',
    priority: 1,
  },
  CharacterCreationPanel,
  {
    getInitialState: (): CharacterCreationPanelState => ({
      currentStep: 'intro',
      // Ensure required fields exist so downstream components never see undefined
      characterData: {
        // Provide safe baseline attributes; real values will be set in Stats step
        attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        // Known moves starts empty to avoid undefined access during advancement
        knownMoves: [],
      } as Partial <Character>,
      attributeMethod: 'array',
      selectedLevel: 1,
    }),
    onMount: () => {
      // Clear unknown potentially corrupted state from previous sessions
      try {
        const corruptedState = localStorage.getItem('panel-state-character-creation')
        if (corruptedState) {
          const parsed = JSON.parse(corruptedState)
          if (parsed && typeof parsed === 'object' && !parsed.currentStep) {
            localStorage.removeItem('panel-state-character-creation')
          }
        }
      }
      catch (error) {
        console.error('State cleanup error:', error)
      }
    },
    onUnmount: () => {
      // Clean up unknown resources or event listeners
    },
    onActivate: () => {
    },
    onDeactivate: () => {
      // Save current state before deactivating
      try {
        // This will be handled by the panel state manager
      }
      catch (error) {
        console.error('Panel deactivation error:', error)
      }
    },
  },
)
