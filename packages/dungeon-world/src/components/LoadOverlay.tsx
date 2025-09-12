import React, { useEffect, useMemo, useState } from 'react'
import { useGameStore } from '../store/GameStore'
import { calculateMaxLoad } from '../models/Character'
import { panelEventBus } from '../framework/PanelAPI'

const LoadOverlay: React.FC = () => {
  const { state, updateCharacter } = useGameStore()
  const character = useMemo(() => state.activeCharacterId ? state.characters[state.activeCharacterId] : null, [state])

  const [localLoad] = useState<number>(5)
  const [localMaxLoad] = useState<number>(14)

  const [equipLoad, setEquipLoad] = useState<number | null>(null)
  useEffect(() => {
    const off = panelEventBus.on('equipment-weight-changed', (evt: any) => {
      const totalWeight = evt?.data?.totalWeight
      if (typeof totalWeight === 'number') setEquipLoad(totalWeight)
    })
    return () => { off() }
  }, [])

  const maxFromChar = character ? calculateMaxLoad(character as any) : localMaxLoad
  const load = character ? (equipLoad ?? character.load?.current ?? localLoad) : (equipLoad ?? localLoad)
  const max = character ? maxFromChar : localMaxLoad
  const overloaded = load > max

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Load</h3>
      <div className="load-display"><div className="load-value"><span className="load-current">{load}</span><span className="load-separator">/</span><span className="load-max">{max}</span></div></div>
      <div className="load-bar"><progress className={`load-progress ${overloaded ? 'overloaded' : ''}`} max={Math.max(1, max)} value={load} aria-label="Load progress" /></div>
      {overloaded && <div className="load-warning">Encumbered!</div>}
      <div className="load-details"><span className="stat-label">Max Load Formula:</span><span className="stat-value">Base({character?.class ?? 'Fighter'}) + STR mod</span></div>
      <div className="load-details"><span className="stat-label">Encumbrance:</span><span className="stat-value">{overloaded ? 'Encumbered' : 'OK'}</span></div>
    </div>
  )
}

export default LoadOverlay


