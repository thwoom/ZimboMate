import React from 'react'
import XpOverlay from './XpOverlay'
import CombatOverlay from './CombatOverlay'

const ProgressOverlay: React.FC = () => {
  return (
    <div className="hp-sidebar-glass-content">
      <div className="experience-composite" style={{ display: 'grid', gap: 12 }}>
        <XpOverlay />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
        <CombatOverlay />
      </div>
    </div>
  )
}

export default ProgressOverlay


