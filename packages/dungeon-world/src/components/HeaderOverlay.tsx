import React, { useMemo } from 'react'
import { useGameStore } from '../store/GameStore'

const HeaderOverlay: React.FC = () => {
  const { state } = useGameStore()
  const character = useMemo(() => state.activeCharacterId ? state.characters[state.activeCharacterId] : null, [state])
  const name = character?.name || 'Unnamed Hero'
  const klass = character?.class || 'Fighter'
  const level = character?.level ?? 1
  const alignment = character?.alignment || 'Neutral'
  return (
    <div className="hp-sidebar-glass-content">
      <h2 className="character-name" style={{ textAlign: 'center' }}>{name}</h2>
      <div className="character-info" style={{ justifyContent: 'center' }}>
        <span className="character-class">{klass}</span>
        <span className="character-level">Level {level}</span>
        <span className="character-alignment">{alignment}</span>
      </div>
    </div>
  )
}

export default HeaderOverlay


