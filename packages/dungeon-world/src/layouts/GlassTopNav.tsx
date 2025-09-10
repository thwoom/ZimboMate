import React from 'react'
import './GlassTopNav.css'

interface GlassTopNavProps {
  onMenuClick?: () => void
}

const GlassTopNav: React.FC <GlassTopNavProps> = ({ onMenuClick }) => {
  return (
    <header className="glass-topnav floating-glass" role="banner">
      <button
        className="topnav__menu"
        aria-label="Open navigation"
        onClick={onMenuClick}
        type="button"
      >
        ☰
      </button>
      <div className="topnav__brand">Dungeon World</div>
      <div className="topnav__right" />
    </header>
  )
}

export default GlassTopNav


