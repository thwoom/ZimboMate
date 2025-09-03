/**
 * Advanced Character Options Step Component * Allows users to select compendium classes, race moves, and multiclass options
 */

import type {
  AdvancedCharacterTemplate,
  CompendiumClass,
  MulticlassConfig,
  RaceMove,
  ValidationResult,
} from '../models/AdvancedCharacterOptions'

import type { Character, Race } from '../models/Character'

import React, { useEffect, useState } from 'react'
import { advancedCharacterOptionsService } from '../services/AdvancedCharacterOptionsService'
import './AdvancedOptionsStep.css'

interface AdvancedOptionsStepProps {
  character: Partial <Character>
  onUpdate: (updates: Partial <Character>) => void
  onNext: () => void
  onBack: () => void
}

interface AdvancedOptionsState {
  selectedCompendiumClasses: string[]
  selectedRaceMoves: string[]
  multiclassConfig?: MulticlassConfig
  selectedTemplate?: string
  validation: ValidationResult
}

const AdvancedOptionsStep: React.FC <AdvancedOptionsStepProps> = ({
  character,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [state, setState] = useState <AdvancedOptionsState>({
    selectedCompendiumClasses: [],
    selectedRaceMoves: [],
    validation: { valid: true, errors: [], warnings: [], conflicts: [] },
  })

  const [activeTab, setActiveTab] = useState<'compendium' | 'race-moves' | 'multiclass' | 'templates'>('compendium')
  const [searchTerm, setSearchTerm] = useState('')

  // Get available options for the character
  const availableCompendiumClasses = advancedCharacterOptionsService.getAllCompendiumClasses()
    .filter((cc) => {
      const validation = advancedCharacterOptionsService.canTakeCompendiumClass(character as Character, cc)
      return validation.valid
    })

  const availableRaceMoves = advancedCharacterOptionsService.getRaceMoves(character.race as Race)
    .filter((rm) => {
      const validation = advancedCharacterOptionsService.canTakeRaceMove(character as Character, rm)
      return validation.valid
    })

  const availableTemplates = advancedCharacterOptionsService.getAllTemplates()
    .filter(t => t.level <= (character.level || 1))

  // Filter options based on search term
  const filteredCompendiumClasses = availableCompendiumClasses.filter(cc =>
    cc.name.toLowerCase().includes(searchTerm.toLowerCase())
    || cc.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRaceMoves = availableRaceMoves.filter(rm =>
    rm.name.toLowerCase().includes(searchTerm.toLowerCase())
    || rm.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredTemplates = availableTemplates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
    || t.description.toLowerCase().includes(searchTerm.toLowerCase())
    || t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Update validation when selections change
  useEffect(() => {
    const updatedCharacter = {
      ...character,
      compendiumClasses: state.selectedCompendiumClasses,
      raceMoves: state.selectedRaceMoves,
      multiclassConfig: state.multiclassConfig,
    } as Character

    const validation = advancedCharacterOptionsService.validateAdvancedCharacter(updatedCharacter)
    setState(prev => ({ ...prev, validation }))
  }, [state.selectedCompendiumClasses, state.selectedRaceMoves, state.multiclassConfig, character])

  const handleCompendiumClassToggle = (compendiumClassId: string) => {
    setState(prev => ({
      ...prev,
      selectedCompendiumClasses: prev.selectedCompendiumClasses.includes(compendiumClassId)
        ? prev.selectedCompendiumClasses.filter(id => id !== compendiumClassId)
        : [...prev.selectedCompendiumClasses, compendiumClassId],
    }))
  }

  const handleRaceMoveToggle = (raceMoveId: string) => {
    setState(prev => ({
      ...prev,
      selectedRaceMoves: prev.selectedRaceMoves.includes(raceMoveId)
        ? prev.selectedRaceMoves.filter(id => id !== raceMoveId)
        : [...prev.selectedRaceMoves, raceMoveId],
    }))
  }

  const _handleTemplateSelect = (templateId: string) => {
    const template = advancedCharacterOptionsService.getTemplate(templateId)
    if (!template)
      return

    setState(prev => ({
      ...prev,
      selectedTemplate: templateId,
      selectedCompendiumClasses: template.advanced.compendiumClasses || [],
      selectedRaceMoves: template.advanced.raceMoves || [],
      multiclassConfig: template.advanced.multiclass,
    }))

    // Apply template to character
    onUpdate({
      class: template.base.class,
      race: template.base.race,
      compendiumClasses: template.advanced.compendiumClasses,
      raceMoves: template.advanced.raceMoves,
      multiclassConfig: template.advanced.multiclass,
    })
  }

  const handleNext = () => {
    // Apply selected options to character
    const updates: Partial <Character> = {
      compendiumClasses: state.selectedCompendiumClasses,
      raceMoves: state.selectedRaceMoves,
      multiclassConfig: state.multiclassConfig,
    }

    onUpdate(updates)
    onNext()
  }

  const renderCompendiumClassCard = (compendiumClass: CompendiumClass) => {
    const isSelected = state.selectedCompendiumClasses.includes(compendiumClass.id)
    const validation = advancedCharacterOptionsService.canTakeCompendiumClass(character as Character, compendiumClass)

    return (
      <div
        key={compendiumClass.id}
        className={`compendium-class-card ${isSelected ? 'selected' : ''} ${!validation.valid ? 'disabled' : ''}`}
        onClick={() => validation.valid && handleCompendiumClassToggle(compendiumClass.id)}
      >
        <div className="card-header">
          <h3>{compendiumClass.name}</h3>
          <span className="source">{compendiumClass.source}</span>
        </div>
        <p className="description">{compendiumClass.description}</p>

        <div className="requirements">
          <h4> Requirements:</h4>
          <ul>
            <li>
              {' '}
              Level
              {compendiumClass.requirements.level}
              +
            </li>
            {compendiumClass.requirements.class && (
              <li>
                {' '}
                Class:
                {compendiumClass.requirements.class.join(', ')}
              </li>
            )}
            {compendiumClass.requirements.attributes && (
              <li>
                {' '}
                Attributes:
                {Object.entries(compendiumClass.requirements.attributes)
                  .map(([attr, value]) => `${attr} ${value}+`)
                  .join(', ')}
              </li>
            )}
            {compendiumClass.requirements.narrative && (
              <li>
                {' '}
                Narrative:
                {compendiumClass.requirements.narrative}
              </li>
            )}
          </ul>
        </div>

        <div className="benefits">
          <h4> Benefits:</h4>
          <ul>
            {compendiumClass.benefits.moves.map(moveId => (
              <li key={moveId}>
                Move:
                {moveId}
              </li>
            ))}
            {compendiumClass.benefits.attributeBonuses && (
              <li>
                {' '}
                Bonuses:
                {Object.entries(compendiumClass.benefits.attributeBonuses)
                  .map(([attr, bonus]) => `${attr} +${bonus}`)
                  .join(', ')}
              </li>
            )}
            {compendiumClass.benefits.specialAbilities?.map(ability => (
              <li key={ability}>{ability}</li>
            ))}
          </ul>
        </div>

        {!validation.valid && (
          <div className="validation-errors">
            {validation.errors.map(error => (
              <div key={error} className="error">{error}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderRaceMoveCard = (raceMove: RaceMove) => {
    const isSelected = state.selectedRaceMoves.includes(raceMove.id)
    const validation = advancedCharacterOptionsService.canTakeRaceMove(character as Character, raceMove)

    return (
      <div
        key={raceMove.id}
        className={`race-move-card ${isSelected ? 'selected' : ''} ${!validation.valid ? 'disabled' : ''}`}
        onClick={() => validation.valid && handleRaceMoveToggle(raceMove.id)}
      >
        <div className="card-header">
          <h3>{raceMove.name}</h3>
          <span className="race">{raceMove.race}</span>
        </div>
        <p className="description">{raceMove.description}</p>

        {raceMove.requirements && (
          <div className="requirements">
            <h4> Requirements:</h4>
            <ul>
              {raceMove.requirements.level && (
                <li>
                  {' '}
                  Level
                  {raceMove.requirements.level}
                  +
                </li>
              )}
              {raceMove.requirements.attributes && (
                <li>
                  {' '}
                  Attributes:
                  {Object.entries(raceMove.requirements.attributes)
                    .map(([attr, value]) => `${attr} ${value}+`)
                    .join(', ')}
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="benefits">
          <h4> Benefits:</h4>
          <ul>
            {raceMove.benefits.moveId && (
              <li>
                {' '}
                Move:
                {raceMove.benefits.moveId}
              </li>
            )}
            {raceMove.benefits.attributeBonuses && (
              <li>
                {' '}
                Bonuses:
                {Object.entries(raceMove.benefits.attributeBonuses)
                  .map(([attr, bonus]) => `${attr} +${bonus}`)
                  .join(', ')}
              </li>
            )}
            {raceMove.benefits.specialAbilities?.map(ability => (
              <li key={ability}>{ability}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderTemplateCard = (template: AdvancedCharacterTemplate) => {
    const isSelected = state.selectedTemplate === template.id

    return (
      <div
        key={template.id}
        className={`template-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleTemplateSelect(template.id)}
      >
        <div className="card-header">
          <h3>{template.name}</h3>
          <span className="level">
            Level
            {template.level}
          </span>
        </div>
        <p className="description">{template.description}</p>

        <div className="template-details">
          <div className="base-info">
            <h4> Base Character:</h4>
            <p>
              {template.base.class}
              {' '}
              {template.base.race}
            </p>
          </div>

          <div className="advanced-info">
            <h4> Advanced Options:</h4>
            <ul>
              {template.advanced.compendiumClasses?.map(ccId => (
                <li key={ccId}>
                  Compendium Class:
                  {ccId}
                </li>
              ))}
              {template.advanced.raceMoves?.map(rmId => (
                <li key={rmId}>
                  Race Move:
                  {rmId}
                </li>
              ))}
              {template.advanced.multiclass && (
                <li>
                  {' '}
                  Multiclass:
                  {template.advanced.multiclass.primaryClass}
                  {' '}
                  +
                  {template.advanced.multiclass.secondaryClass}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="template-meta">
          <span className={`difficulty ${template.difficulty}`}>{template.difficulty}</span>
          <span className="tags">{template.tags.join(', ')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="advanced-options-step">
      <div className="step-header">
        <h2> Advanced Character Options</h2>
        <p> Customize your character with compendium classes, race moves, and advanced templates.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search options..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'compendium' ? 'active' : ''}`}
          onClick={() => setActiveTab('compendium')}
        >
          Compendium Classes (
          {availableCompendiumClasses.length}
          )
        </button>
        <button
          className={`tab ${activeTab === 'race-moves' ? 'active' : ''}`}
          onClick={() => setActiveTab('race-moves')}
        >
          Race Moves (
          {availableRaceMoves.length}
          )
        </button>
        <button
          className={`tab ${activeTab === 'multiclass' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiclass')}
        >
          Multiclass
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates (
          {availableTemplates.length}
          )
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'compendium' && (
          <div className="compendium-classes">
            {filteredCompendiumClasses.length === 0
              ? (
                  <div className="no-options">
                    <p> No compendium classes available for your character.</p>
                  </div>
                )
              : (
                  <div className="options-grid">
                    {filteredCompendiumClasses.map(renderCompendiumClassCard)}
                  </div>
                )}
          </div>
        )}

        {activeTab === 'race-moves' && (
          <div className="race-moves">
            {filteredRaceMoves.length === 0
              ? (
                  <div className="no-options">
                    <p> No race moves available for your character.</p>
                  </div>
                )
              : (
                  <div className="options-grid">
                    {filteredRaceMoves.map(renderRaceMoveCard)}
                  </div>
                )}
          </div>
        )}

        {activeTab === 'multiclass' && (
          <div className="multiclass">
            <p> Multiclassing options will be implemented in a future update.</p>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates">
            {filteredTemplates.length === 0
              ? (
                  <div className="no-options">
                    <p> No templates available for your character level.</p>
                  </div>
                )
              : (
                  <div className="options-grid">
                    {filteredTemplates.map(renderTemplateCard)}
                  </div>
                )}
          </div>
        )}
      </div>

      {/* Selected Options Summary */}
      {(state.selectedCompendiumClasses.length > 0 || state.selectedRaceMoves.length > 0) && (
        <div className="selected-options">
          <h3> Selected Options:</h3>
          {state.selectedCompendiumClasses.length > 0 && (
            <div className="selected-group">
              <h4> Compendium Classes:</h4>
              <ul>
                {state.selectedCompendiumClasses.map((ccId) => {
                  const cc = advancedCharacterOptionsService.getCompendiumClass(ccId)
                  return <li key={ccId}>{cc?.name || ccId}</li>
                })}
              </ul>
            </div>
          )}
          {state.selectedRaceMoves.length > 0 && (
            <div className="selected-group">
              <h4> Race Moves:</h4>
              <ul>
                {state.selectedRaceMoves.map((rmId) => {
                  const rm = advancedCharacterOptionsService.getRaceMove(rmId)
                  return <li key={rmId}>{rm?.name || rmId}</li>
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Validation Messages */}
      {state.validation.errors.length > 0 && (
        <div className="validation-errors">
          <h3> Errors:</h3>
          {state.validation.errors.map(error => (
            <div key={error} className="error">{error}</div>
          ))}
        </div>
      )}

      {state.validation.warnings.length > 0 && (
        <div className="validation-warnings">
          <h3> Warnings:</h3>
          {state.validation.warnings.map(warning => (
            <div key={warning} className="warning">{warning}</div>
          ))}
        </div>
      )}

      {state.validation.conflicts.length > 0 && (
        <div className="validation-conflicts">
          <h3> Conflicts:</h3>
          {state.validation.conflicts.map(conflict => (
            <div key={conflict} className="conflict">{conflict}</div>
          ))}
        </div>
      )}

      <div className="step-actions">
        <button onClick={onBack} className="secondary-button">
          Back
        </button>
        <button
          onClick={handleNext}
          className="primary-button"
          disabled={!state.validation.valid}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AdvancedOptionsStep
