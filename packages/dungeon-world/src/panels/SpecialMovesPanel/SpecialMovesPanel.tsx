import type { PanelProps } from '../../framework/Panel'

import React, { useState } from 'react'

import EndOfSessionModal from '../../components/EndOfSessionModal'
import LevelUpModal from '../../components/LevelUpModal'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { SpecialMovesService } from '../../services/SpecialMovesService'
import { useGameStore } from '../../store/GameStore'
import './SpecialMovesPanel.css'

interface SpecialMovesPanelState {
  showLevelUpModal: boolean
  showEndOfSessionModal: boolean
  showMakeCampModal: boolean
  showLastBreathModal: boolean
}

const SpecialMovesPanel: React.FC <PanelProps> = ({ id }) => {
  const api = createPanelAPI(id)
  const { state: gameState, updateCharacter } = useGameStore()
  const [panelState, setPanelState] = useState <SpecialMovesPanelState>({
    showLevelUpModal: false,
    showEndOfSessionModal: false,
    showMakeCampModal: false,
    showLastBreathModal: false,
  })

  // Get active character
  const character = gameState.activeCharacterId
    ? gameState.characters[gameState.activeCharacterId]
    : null

  // Special moves state
  const canLevelUp = character ? SpecialMovesService.canLevelUp(character) : false
  const shouldTriggerLastBreath = character ? SpecialMovesService.shouldTriggerLastBreath(character) : false
  const xpProgress = character ? SpecialMovesService.getXPProgress(character) : 0
  const nextLevelXP = character ? SpecialMovesService.getNextLevelXP(character) : 0

  const updateState = (updates: Partial <SpecialMovesPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }

  const handleLevelUp = (result: unknown, advancementChoice?: string) => {
    if (character && result.success) {
      // Update character with new level and XP
      const updates: unknown = {
        level: result.newLevel,
        xp: result.newXP,
      }

      // Add advancement choice to character's advancement history
      if (advancementChoice) {
        const newAdvancement = {
          level: result.newLevel,
          type: advancementChoice.includes('Increase') ? 'stat' : 'move',
          choice: advancementChoice,
          description: advancementChoice,
          timestamp: new Date(),
        }
        updates.advancements = [...(character.advancements || []), newAdvancement]
      }

      (updateCharacter as string)(character.id, updates)
    }
    updateState({ showLevelUpModal: false })
  }

  const handleEndOfSession = (result: any) => {
    if (character) {
      (updateCharacter as string)(character.id, { xp: result.totalXP })
    }
    updateState({ showEndOfSessionModal: false })
  }

  const handleMakeCamp = () => {
    if (!character)
      return

    const result = SpecialMovesService.makeCamp(character, true)

    if (result.success) {
      // Update HP
      const newHP = Math.min(character.hp.current + result.hpRestored, character.hp.max);
      (updateCharacter as string)(character.id, {
        hp: { ...character.hp, current: newHP },
      })

      // Note: Ration consumption would need inventory integration
      alert(result.message)
    }
    else {
      alert(result.message)
    }
  }

  const handleLastBreath = () => {
    if (!character)
      return

    const result = SpecialMovesService.lastBreath(character)
    alert(`${result.message}\n\nRoll: ${result.roll} (${result.tier})\nConsequence: ${result.consequence}`)
  }

  if (!character) {
    return (
      <div className="special-moves-panel">
        <div className="special-moves-panel__header">
          <h2>🎲 Special Moves</h2>
        </div>
        <div className="no-character">
          <p> No character selected. Create or select a character to access special moves.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="special-moves-panel">
      <div className="special-moves-panel__header">
        <h2>🎲 Special Moves</h2>
        <div className="character-info">
          <span className="character-name">{character.name}</span>
          <span className="character-class">
            (
            {character.class}
            )
          </span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="xp-progress-section">
        <div className="xp-progress-header">
          <h3> Experience Progress</h3>
          <span className="xp-current">
            {character.xp}
            {' '}
            XP
          </span>
        </div>
        <div className="xp-progress-bar">
          <div
            className="xp-progress-fill"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="xp-progress-details">
          <span>
            {' '}
            Level
            {character.level}
            {' '}
            →
            {character.level + 1}
          </span>
          <span>
            {nextLevelXP - character.xp}
            {' '}
            XP needed
          </span>
        </div>
      </div>

      {/* Special Moves Grid */}
      <div className="special-moves-grid">
        {/* Level Up */}
        <div className={`special-move-card ${canLevelUp ? 'available' : 'unavailable'}`}>
          <div className="move-header">
            <div className="move-icon">🎉</div>
            <div className="move-title">Level Up</div>
            <div className="move-status">
              {canLevelUp ? 'Ready!' : 'Not Ready'}
            </div>
          </div>
          <div className="move-description">
            Spend XP to gain a level and choose an advancement.
          </div>
          <button
            className="move-button"
            onClick={() => updateState({ showLevelUpModal: true })}
            disabled={!canLevelUp}
          >
            {canLevelUp ? 'Level Up!' : 'Need More XP'}
          </button>
        </div>

        {/* End of Session */}
        <div className="special-move-card available">
          <div className="move-header">
            <div className="move-icon">🏁</div>
            <div className="move-title">End of Session</div>
            <div className="move-status">Available</div>
          </div>
          <div className="move-description">
            Answer questions to gain XP based on session events.
          </div>
          <button
            className="move-button"
            onClick={() => updateState({ showEndOfSessionModal: true })}
          >
            End Session
          </button>
        </div>

        {/* Make Camp */}
        <div className="special-move-card available">
          <div className="move-header">
            <div className="move-icon">🏕️</div>
            <div className="move-title">Make Camp</div>
            <div className="move-status">Available</div>
          </div>
          <div className="move-description">
            Rest and recover HP equal to your level. Consumes 1 ration.
          </div>
          <button
            className="move-button"
            onClick={handleMakeCamp}
          >
            Make Camp
          </button>
        </div>

        {/* Last Breath */}
        <div className={`special-move-card ${shouldTriggerLastBreath ? 'critical' : 'available'}`}>
          <div className="move-header">
            <div className="move-icon">💀</div>
            <div className="move-title">Last Breath</div>
            <div className="move-status">
              {shouldTriggerLastBreath ? 'TRIGGERED!' : 'Available'}
            </div>
          </div>
          <div className="move-description">
            Roll 2d6 when you reach 0 HP to determine your fate.
          </div>
          <button
            className="move-button"
            onClick={handleLastBreath}
            disabled={!shouldTriggerLastBreath}
          >
            {shouldTriggerLastBreath ? 'Roll Last Breath!' : 'Not at 0 HP'}
          </button>
        </div>
      </div>

      {/* Character Status */}
      <div className="character-status">
        <h3> Character Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">HP:</span>
            <span className="status-value">
              {character.hp.current}
              {' '}
              /
              {character.hp.max}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Level:</span>
            <span className="status-value">{character.level}</span>
          </div>
          <div className="status-item">
            <span className="status-label">XP:</span>
            <span className="status-value">{character.xp}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Class:</span>
            <span className="status-value">{character.class}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LevelUpModal
        isOpen={panelState.showLevelUpModal}
        character={character}
        onConfirm={handleLevelUp}
        onCancel={() => updateState({ showLevelUpModal: false })}
      />

      <EndOfSessionModal
        isOpen={panelState.showEndOfSessionModal}
        character={character}
        onConfirm={handleEndOfSession}
        onCancel={() => updateState({ showEndOfSessionModal: false })}
      />
    </div>
  )
}

export default createPanel(
  {
    id: 'special-moves',
    name: 'Special Moves',
    icon: '🎲',
    description: 'Level Up, End of Session, Make Camp, and Last Breath',
    priority: 5,
  },
  SpecialMovesPanel,
)
