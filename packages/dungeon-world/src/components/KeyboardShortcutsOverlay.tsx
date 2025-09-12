import React from 'react'

const KeyboardShortcutsOverlay: React.FC = () => {
  return (
    <div className="hp-sidebar-glass-content" style={{minHeight: 200}}>
      <h3> Keyboard Shortcuts</h3>
      <div className="shortcuts-list" aria-label="Keyboard shortcuts">
        <div className="stat-item"><span className="stat-label">Increase HP</span><span className="stat-value">↑ or +</span></div>
        <div className="stat-item"><span className="stat-label">Decrease HP</span><span className="stat-value">↓ or -</span></div>
        <div className="stat-item"><span className="stat-label">Roll Attribute</span><span className="stat-value">1–6</span></div>
        <div className="stat-item"><span className="stat-label">Add XP</span><span className="stat-value">X</span></div>
        <div className="stat-item"><span className="stat-label">Rest</span><span className="stat-value">R</span></div>
        <div className="stat-item"><span className="stat-label">Roll 2d6</span><span className="stat-value">Space</span></div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsOverlay


