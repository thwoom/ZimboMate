import React, { useMemo, useCallback, useState } from 'react'
import { useGameStore } from '../store/GameStore'

const HpOverlay: React.FC = () => {
  const { state, updateCharacter } = useGameStore()

  const character = useMemo(() => {
    if (!state.activeCharacterId) return null
    return state.characters[state.activeCharacterId] || null
  }, [state])

  // Mirror CharacterStatsPanel fallback defaults when no active character
  const DEFAULT_HP = 21
  const DEFAULT_MAX_HP = 21

  // Local fallback when no active character
  const [localHp, setLocalHp] = useState<number>(DEFAULT_HP)
  const [localMaxHp] = useState<number>(DEFAULT_MAX_HP)

  const hp = character?.hp?.current ?? localHp
  const maxHp = character?.hp?.max ?? localMaxHp

  const getHpClass = useCallback(() => {
    if (maxHp <= 0) return 'hp-bar__fill--dead'
    if (hp <= 0) return 'hp-bar__fill--dead'
    const pct = (hp / maxHp) * 100
    if (pct <= 25) return 'hp-bar__fill--critical'
    if (pct <= 50) return 'hp-bar__fill--injured'
    return 'hp-bar__fill--full'
  }, [hp, maxHp])

  const changeHp = (delta: number) => {
    const next = Math.max(0, Math.min(maxHp, hp + delta))
    if (character) {
      updateCharacter(character.id, { hp: { ...character.hp, current: next } })
    } else {
      setLocalHp(next)
    }
  }

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Hit Points</h3>
      <div className="hp-display">
        <button className="hp-button hp-button--minus" type="button" onClick={() => changeHp(-1)}>-</button>
        <div className="hp-value">
          <span className="hp-current">{hp}</span>
          <span className="hp-separator">/</span>
          <span className="hp-max">{maxHp}</span>
        </div>
        <button className="hp-button hp-button--plus" type="button" onClick={() => changeHp(1)}>+</button>
      </div>
      <div className="hp-bar">
        <progress className={`hp-progress ${getHpClass()}`} max={Math.max(1, maxHp)} value={hp} aria-label="HP progress" />
      </div>
    </div>
  )
}

export default HpOverlay


