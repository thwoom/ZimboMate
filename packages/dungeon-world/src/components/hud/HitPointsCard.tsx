import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const HitPointsCard: React.FC = () => {
  const preferred = useCharacter()
  const { state, updateCharacter } = useGameStore()
  const fallback = preferred || (state.activeCharacterId
    ? state.characters[state.activeCharacterId]
    : Object.values(state.characters)[0])
  const hp = (fallback as any)?.hp?.current ?? (fallback as any)?.hp ?? 0
  const maxHp = (fallback as any)?.hp?.max ?? (fallback as any)?.maxHp ?? 0
  const id = (fallback as any)?.id

  const change = (delta: number) => {
    if (!fallback || !id) return
    const current = Math.max(0, Math.min(maxHp || 0, hp + delta))
    if ((fallback as any)?.hp) {
      updateCharacter(id, { hp: { ...(fallback as any).hp, current } })
    } else {
      updateCharacter(id, { hp: { current, max: maxHp || 0 } as any })
    }
  }

  return (
    <article className="hud-card" aria-label="Hit Points">
      <div className="hud-title">Hit Points</div>
      <div className="hud-row">
        <span className="hud-large">{hp}</span>
        <span className="hud-sub">/ {maxHp}</span>
      </div>
      <div className="hud-actions">
        <button className="hud-btn" type="button" onClick={() => change(-1)}>-1</button>
        <button className="hud-btn" type="button" onClick={() => change(+1)}>+1</button>
      </div>
    </article>
  )
}

export default HitPointsCard


