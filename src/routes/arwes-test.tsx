import React from 'react'
import { HudHeading, HudBody } from '../ui/hud/HudText'
import HudPanel from '../ui/hud/HudPanel'

export default function ArwesTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <HudHeading>Arwes Alpha.23 Test</HudHeading>
      
      <div style={{ marginTop: '2rem' }}>
        <HudPanel>
          <HudHeading>Panel Title</HudHeading>
          <HudBody>
            This panel uses Arwes alpha.23 components with stable APIs.
            The background should show animated grid lines, dots, and moving lines.
          </HudBody>
          <HudBody>
            Text effects include decipher animation on headings and smooth entrance animations on body text.
          </HudBody>
        </HudPanel>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <HudPanel>
          <HudHeading>Second Panel</HudHeading>
          <HudBody>
            Multiple panels can be used to organize content in a futuristic HUD layout.
          </HudBody>
        </HudPanel>
      </div>
    </div>
  )
}
