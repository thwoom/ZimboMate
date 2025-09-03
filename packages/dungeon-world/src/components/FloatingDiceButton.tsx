import type { DiceRoll } from '../services/DiceRollingService'

import React, { useEffect, useState } from 'react'
import { diceRollingService } from '../services/DiceRollingService'

import { rollAnalyticsService } from '../services/RollAnalyticsService'
import { useGameStore } from '../store/GameStore'
import QuickRollInterface from './QuickRollInterface'
import './FloatingDiceButton.css'

interface FloatingDiceButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}

export const FloatingDiceButton: React.FC <FloatingDiceButtonProps> = ({
  position = 'bottom-right',
  className = '',
}) => {
  const { state: gameState, updateCharacter } = useGameStore()
  const [showQuickRoll, setShowQuickRoll] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [recentRolls, setRecentRolls] = useState <DiceRoll[]>([])
  const [showRollHistory, setShowRollHistory] = useState(false)

  // Get active character
  const character = gameState.activeCharacterId
    ? gameState.characters[gameState.activeCharacterId]
    : null

  // Update recent rolls periodically
  useEffect(() => {
    const updateRolls = () => {
      setRecentRolls(diceRollingService.getRecentRolls(3))
    }

    updateRolls()
    const interval = setInterval(updateRolls, 2000)
    return () => clearInterval(interval)
  }, [])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl / Cmd + D to open quick roll
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        setShowQuickRoll(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleRoll = (roll: DiceRoll) => {
    // Animate the button
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)

    // Record analytics
    const insights = rollAnalyticsService.recordRoll(roll)

    // Handle XP gain
    if (diceRollingService.grantsXP(roll) && character && roll.result === 'failure') {
      const newXP = (character.xp || 0) + 1
      updateCharacter(character.id, { xp: newXP })
    }

    // Show insights as notifications (could be enhanced with a toast system)
    for (const insight of insights) {
    }

    // Update recent rolls
    setRecentRolls(diceRollingService.getRecentRolls(3))
  }

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left': return 'floating-dice-bottom-left'
      case 'top-right': return 'floating-dice-top-right'
      case 'top-left': return 'floating-dice-top-left'
      default: return 'floating-dice-bottom-right'
    }
  }

  const getLastRollIndicator = () => {
    if (recentRolls.length === 0)
      return null

    const lastRoll = recentRolls[0]
    return (
      <div className={`last-roll - indicator ${lastRoll.result}`}>
        <span className="roll-total">{lastRoll.total}</span>
        <span className="roll-result-icon">
          {lastRoll.result === 'success' && '✓'}
          {lastRoll.result === 'partial' && '~'}
          {lastRoll.result === 'failure' && '✗'}
        </span>
      </div>
    )
  }

  return (
    <>
      <div className={`floating-dice-container ${getPositionClass()} ${className}`}>
        {/* Main Dice Button */}
        <button
          className={`floating-dice-button ${isAnimating ? 'rolling' : ''} ${!character ? 'disabled' : ''}`}
          onClick={() => setShowQuickRoll(true)}
          disabled={!character}
          title={character ? 'Quick Roll (Ctrl + D)' : 'No character selected'}
        >
          <span className="dice-icon">🎲</span>
          {getLastRollIndicator()}
        </button>

        {/* Roll History Mini Panel */}
        {recentRolls.length > 0 && (
          <div
            className={`roll-history-mini ${showRollHistory ? 'expanded' : ''}`}
            onMouseEnter={() => setShowRollHistory(true)}
            onMouseLeave={() => setShowRollHistory(false)}
          >
            <div className="roll-history-header">
              <span> Recent Rolls</span>
            </div>
            <div className="roll-history-items">
              {recentRolls.map((item, index) => (
                <div key={roll.id} className={`roll-history-item ${roll.result}`}>
                  <div className="roll-info">
                    <span className="roll-description">
                      {roll.description || 'Unknown Roll'}
                    </span>
                    <span className="roll-time">
                      {new Date(roll.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="roll-result">
                    <span className="roll-total">{roll.total}</span>
                    <span className={`result-icon ${roll.result}`}>
                      {roll.result === 'success' && '✓'}
                      {roll.result === 'partial' && '~'}
                      {roll.result === 'failure' && '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="quick-actions">
          <button
            className="quick-action-button"
            onClick={() => {
              if (character) {
                const _roll = diceRollingService.rollStat('STR', character, {
                  description: 'Quick STR roll',
                })
                handleRoll(roll)
              }
            }}
            disabled={!character}
            title="Quick STR roll"
          >
            STR
          </button>
          <button
            className="quick-action-button"
            onClick={() => {
              if (character) {
                const _roll = diceRollingService.rollStat('DEX', character, {
                  description: 'Quick DEX roll',
                })
                handleRoll(roll)
              }
            }}
            disabled={!character}
            title="Quick DEX roll"
          >
            DEX
          </button>
          <button
            className="quick-action-button"
            onClick={() => {
              if (character) {
                const _roll = diceRollingService.rollStat('WIS', character, {
                  description: 'Quick WIS roll',
                })
                handleRoll(roll)
              }
            }}
            disabled={!character}
            title="Quick WIS roll"
          >
            WIS
          </button>
        </div>

        {/* Character Indicator */}
        {character && (
          <div className="character-indicator">
            <span className="character-name">{character.name}</span>
            <span className="character-xp">
              XP:
              {character.xp || 0}
            </span>
          </div>
        )}
      </div>

      {/* Quick Roll Interface */}
      <QuickRollInterface
        isVisible={showQuickRoll}
        onClose={() => setShowQuickRoll(false)}
        onRoll={handleRoll}
      />
    </>
  )
}

export default FloatingDiceButton
