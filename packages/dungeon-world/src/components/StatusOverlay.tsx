import React from 'react'
import LoadOverlay from './LoadOverlay'
import DebilitiesOverlay from './DebilitiesOverlay'

const StatusOverlay: React.FC = () => {
  return (
    <div className="hp-sidebar-glass-content">
      <div className="status-composite" style={{ display: 'grid', gap: 12 }}>
        <LoadOverlay />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
        <DebilitiesOverlay />
      </div>
    </div>
  )
}

export default StatusOverlay


