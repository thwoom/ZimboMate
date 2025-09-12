import React, { useMemo } from 'react'
import { useGameStore } from '../store/GameStore'

const CombatOverlay: React.FC = () => {
  const { state } = useGameStore()
  const character = useMemo(() => {
    if (!state.activeCharacterId) return null
    return state.characters[state.activeCharacterId] || null
  }, [state])

  const armor = character?.armor ?? 2
  const damage = (character as any)?.damageDie ?? 'd10'

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Combat Stats</h3>
      <div className="combat-stats">
        <div className="stat-item"><span className="stat-label">Armor:</span><span className="stat-value">{armor}</span></div>
        <div className="stat-item"><span className="stat-label">Damage:</span><span className="stat-value">{damage}</span></div>
      </div>
    </div>
  )
}

export default CombatOverlay


