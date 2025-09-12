import React, { useMemo } from 'react'
import { useGameStore } from '../store/GameStore'
import { getClassMapping } from '../utils/conditionalContent'

const ClassFocusOverlay: React.FC = () => {
  const { state } = useGameStore()
  const character = useMemo(() => state.activeCharacterId ? state.characters[state.activeCharacterId] : null, [state])
  const classMap = useMemo(() => character ? getClassMapping(character.class as any) : null, [character])
  const highlights = classMap?.statsHighlight || []
  return (
    <div className="hp-sidebar-glass-content">
      <h3> Class Focus</h3>
      <div className="class-focus-grid">
        <div className="focus-item"><span className="stat-label">Highlighted Attributes:</span><span className="stat-value">{highlights.join(', ') || '—'}</span></div>
        <div className="focus-item"><span className="stat-label">Armor Training:</span><span className="stat-value">{classMap?.equipment.armorTraining ? 'Yes' : 'No'}</span></div>
        <div className="focus-item"><span className="stat-label">Why it matters:</span><span className="stat-value">{highlights.length > 0 ? 'These attributes enhance core class moves and survivability.' : 'No special attribute emphasis for this class.'} Armor training reduces penalties from heavier armor.</span></div>
      </div>
    </div>
  )
}

export default ClassFocusOverlay


