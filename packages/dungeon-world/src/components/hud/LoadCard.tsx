import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const LoadCard: React.FC = () => {
  const preferred = useCharacter()
  const { state } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  const current = c ? ((c as any).load?.current ?? (c as any).load ?? 0) : 0
  const max = c ? ((c as any).load?.max ?? (c as any).maxLoad ?? 0) : 0

  return (
    <article className="hud-card" aria-label="Load">
      <div className="hud-title">Load</div>
      <div className="hud-row"><span className="hud-large">{current}</span><span className="hud-sub">/ {max}</span></div>
    </article>
  )
}

export default LoadCard


