import React from 'react'

const KeyboardShortcutsOverlay: React.FC = () => {
  return (
    <div className="hp-sidebar-glass-content">
      <h3> Keyboard Shortcuts</h3>
      <div className="shortcuts-list shortcuts-list--compact" aria-label="Keyboard shortcuts">
        <div className="stat-item"><span className="stat-label">+ HP</span><span className="stat-value">↑ / +</span></div>
        <div className="stat-item"><span className="stat-label">- HP</span><span className="stat-value">↓ / -</span></div>
        <div className="stat-item"><span className="stat-label">Roll Stat</span><span className="stat-value">1–6</span></div>
        <div className="stat-item"><span className="stat-label">+ XP</span><span className="stat-value">X</span></div>
        <div className="stat-item"><span className="stat-label">Rest</span><span className="stat-value">R</span></div>
        <div className="stat-item"><span className="stat-label">2d6</span><span className="stat-value">Space</span></div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsOverlay


