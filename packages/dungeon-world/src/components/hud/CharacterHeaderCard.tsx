import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const CharacterHeaderCard: React.FC = () => {
  const preferred = useCharacter()
  const { state } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  if (!c) return null

  const name = (c as any).name || 'Unnamed Hero'
  const clazz = (c as any).class
  const level = (c as any).level
  const alignment = (c as any).alignment

  return (
    <article className="hud-card" aria-label="Character">
      <div className="hud-title">Character</div>
      <div className="hud-row hud-center">
        <strong>{name}</strong>
      </div>
      <div className="hud-row"><span className="hud-sub">{clazz}</span><span className="hud-sub">Level {level}</span><span className="hud-sub">{alignment}</span></div>
    </article>
  )
}

export default CharacterHeaderCard


