import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'
import { getXPThreshold } from '../../models/Character'

const ExperienceCard: React.FC = () => {
  const preferred = useCharacter()
  const { state, updateCharacter } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  const level = c ? (c as any).level ?? 1 : 1
  const xp = c ? (c as any).xp ?? 0 : 0
  const threshold = getXPThreshold(level)
  const id = (c as any)?.id

  const addXP = (delta = 1) => {
    if (!id) return
    updateCharacter(id, { xp: (xp + delta) as any })
  }

  return (
    <article className="hud-card" aria-label="Experience">
      <div className="hud-title">Experience</div>
      <div className="hud-row"><span className="hud-sub">Level</span><strong>{level}</strong></div>
      <div className="hud-row"><span className="hud-sub">XP</span><strong>{xp}</strong><span className="hud-sub">/ {threshold}</span></div>
      <div className="hud-actions">
        <button className="hud-btn" type="button" onClick={() => addXP(1)}>Add XP</button>
      </div>
    </article>
  )
}

export default ExperienceCard


