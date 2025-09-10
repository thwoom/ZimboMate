import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const QuickActionsCard: React.FC = () => {
  const preferred = useCharacter()
  const { state, updateCharacter } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  if (!c) return null
  const id = (c as any).id
  const hp = (c as any).hp?.current ?? 0
  const maxHp = (c as any).hp?.max ?? 0
  const xp = (c as any).xp ?? 0

  return (
    <article className="hud-card" aria-label="Quick Actions">
      <div className="hud-title">Quick Actions</div>
      <div className="hud-actions">
        <button className="hud-btn" type="button" onClick={() => id && updateCharacter(id, { hp: { ...(c as any).hp, current: maxHp } })}>Rest</button>
        <button className="hud-btn" type="button" onClick={() => id && updateCharacter(id, { xp: (xp + 1) as any })}>Add XP</button>
      </div>
    </article>
  )
}

export default QuickActionsCard


