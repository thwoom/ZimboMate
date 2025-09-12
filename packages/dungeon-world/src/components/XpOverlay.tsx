import React, { useMemo, useState } from 'react'
import { useGameStore } from '../store/GameStore'
import { SpecialMovesService } from '../services/SpecialMovesService'
import { panelEventBus } from '../framework/PanelAPI'

const XpOverlay: React.FC = () => {
  const { state, updateCharacter } = useGameStore()

  const character = useMemo(() => {
    if (!state.activeCharacterId) return null
    return state.characters[state.activeCharacterId] || null
  }, [state])

  // Fallbacks when no character
  const [localLevel, setLocalLevel] = useState<number>(1)
  const [localXp, setLocalXp] = useState<number>(0)

  const level = character?.level ?? localLevel
  const xp = character?.xp ?? localXp
  const maxXp = level + 7

  const addXp = () => {
    const next = Math.min(maxXp, xp + 1)
    if (character) {
      updateCharacter(character.id, { xp: next })
      if (SpecialMovesService.canLevelUp({ ...character, xp: next })) {
        panelEventBus.emit('level-up-available', { character: character.name, level: character.level })
        panelEventBus.emit('open-levelup-modal')
      }
    } else {
      setLocalXp(next)
    }
  }

  const canLevel = character ? SpecialMovesService.canLevelUp(character) : false

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Experience</h3>
      <div className="experience-stats">
        <div className="stat-item"><span className="stat-label">Level:</span><span className="stat-value">{level}</span></div>
        <div className="stat-item"><span className="stat-label">XP:</span><span className="stat-value">{xp}/{maxXp}</span></div>
      </div>
      <div className="xp-bar">
        <progress className="xp-progress" max={Math.max(1, maxXp)} value={xp} aria-label="XP progress" />
      </div>
      <div className="quick-actions" style={{ marginTop: 8 }}>
        <button type="button" className="action-button action-button--xp" onClick={addXp} disabled={xp >= maxXp} aria-disabled={xp >= maxXp}>Add XP</button>
        {canLevel && (
          <button
            type="button"
            className="action-button action-button--level-up"
            onClick={() => panelEventBus.emit('open-levelup-modal')}
          >
            Level Up!
          </button>
        )}
      </div>
    </div>
  )
}

export default XpOverlay


