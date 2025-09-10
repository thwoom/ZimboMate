import React from 'react'
import './hud.css'

interface HudLayerProps {
  children: React.ReactNode
}

const HudLayer: React.FC<HudLayerProps> = ({ children }) => {
  return (
    <section className="hud-layer" aria-live="polite">
      {children}
    </section>
  )
}

export default HudLayer


