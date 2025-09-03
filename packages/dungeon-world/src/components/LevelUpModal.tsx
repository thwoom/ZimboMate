import type { Character } from '../models/Character'

import type { LevelUpResult } from '../services/SpecialMovesService'

import React, { useEffect, useState } from 'react'
import { SpecialMovesService } from '../services/SpecialMovesService'
import './LevelUpModal.css'

interface LevelUpModalProps {
  isOpen: boolean
  character: Character
  onConfirm: (result: LevelUpResult, advancementChoice?: string) => void
  onCancel: () => void
}

const LevelUpModal: React.FC <LevelUpModalProps> = ({
  isOpen,
  character,
  onConfirm,
  onCancel,
}) => {
  const [selectedAdvancement, setSelectedAdvancement] = useState <string>('')
  const [levelUpResult, setLevelUpResult] = useState <LevelUpResult | null>(null)
  const [advancementChoices, setAdvancementChoices] = useState <string[]>([])

  useEffect(() => {
    if (isOpen && character) {
      // Check if character can level up
      const canLevelUp = SpecialMovesService.canLevelUp(character)
      if (canLevelUp) {
        const result = SpecialMovesService.levelUp(character)
        setLevelUpResult(result)
        setAdvancementChoices(result.advancementChoices || [])
      }
    }
  }, [isOpen, character])

  const handleConfirm = () => {
    if (levelUpResult && levelUpResult.success) {
      onConfirm(levelUpResult, selectedAdvancement)
    }
  }

  const handleCancel = () => {
    setSelectedAdvancement('')
    setLevelUpResult(null)
    onCancel()
  }

  if (!isOpen)
    return null

  const canLevelUp = SpecialMovesService.canLevelUp(character)
  const xpProgress = SpecialMovesService.getXPProgress(character)
  const nextLevelXP = SpecialMovesService.getNextLevelXP(character)

  return (
    <div className="modal-overlay">
      <div className="level-up-modal">
        <div className="modal-header">
          <h2>🎉 Level Up!</h2>
          <button className="modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {!canLevelUp
            ? (
                <div className="level-up-error">
                  <h3> Not Ready to Level Up</h3>
                  <p>
                    {' '}
                    You need
                    {nextLevelXP - character.xp}
                    {' '}
                    more XP to reach level
                    {character.level + 1}
                    .
                  </p>

                  <div className="xp-progress">
                    <div className="xp-progress-label">
                      XP Progress:
                      {' '}
                      {character.xp}
                      {' '}
                      /
                      {' '}
                      {nextLevelXP}
                    </div>
                    <div className="xp-progress-bar">
                      <div
                        className="xp-progress-fill"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                    <div className="xp-progress-percentage">
                      {Math.round(xpProgress)}
                      %
                    </div>
                  </div>
                </div>
              )
            : (
                <>
                  <div className="level-up-success">
                    <h3> Congratulations!</h3>
                    <p>
                      {character.name}
                      {' '}
                      has reached level
                      {' '}
                      {character.level + 1}
                      !
                    </p>

                    <div className="level-up-details">
                      <div className="detail-item">
                        <span className="detail-label">Current Level:</span>
                        <span className="detail-value">{character.level}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">New Level:</span>
                        <span className="detail-value">{character.level + 1}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">XP Spent:</span>
                        <span className="detail-value">{nextLevelXP}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Remaining XP:</span>
                        <span className="detail-value">{character.xp - nextLevelXP}</span>
                      </div>
                    </div>
                  </div>

                  <div className="advancement-selection">
                    <h3> Choose Your Advancement</h3>
                    <p> Select one advancement from the options below:</p>

                    <div className="advancement-options">
                      {advancementChoices.map((choice, index) => (
                        <label key={index} className="advancement-option">
                          <input
                            type="radio"
                            name="advancement"
                            value={choice}
                            checked={selectedAdvancement === choice}
                            onChange={e => setSelectedAdvancement(e.target.value)}
                          />
                          <span className="advancement-text">{choice}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
        </div>

        <div className="modal-footer">
          {canLevelUp
            ? (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleConfirm}
                    disabled={!selectedAdvancement}
                  >
                    Level Up!
                  </button>
                </>
              )
            : (
                <button
                  className="btn btn-primary"
                  onClick={handleCancel}
                >
                  Close
                </button>
              )}
        </div>
      </div>
    </div>
  )
}

export default LevelUpModal
