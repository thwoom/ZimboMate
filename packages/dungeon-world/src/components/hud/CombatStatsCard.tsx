import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const CombatStatsCard: React.FC = () => {
  const preferred = useCharacter()
  const { state } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  const armor = c ? (typeof (c as any).armor === 'number' ? (c as any).armor : 0) : 0
  const damage = c ? ((c as any).damageDie || (c as any).damage || 'd6') : 'd6'

  return (
    <article className="hud-card" aria-label="Combat Stats">
      <div className="hud-title">Combat</div>
      <div className="hud-row"><span className="hud-sub">Armor</span><strong>{armor}</strong></div>
      <div className="hud-row"><span className="hud-sub">Damage</span><strong>{damage}</strong></div>
    </article>
  )
}

export default CombatStatsCard


