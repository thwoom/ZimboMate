import React from 'react';
import { VantaGlobeNet } from '../ui/arwes/VantaGlobeNet';
import { HudTextV2 } from '../ui/hud/HudTextV2';

export default function VantaDemo() {

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <VantaGlobeNet 
        color="#2A6A66"
        backgroundColor="#001215"
        mouseControls={true}
        touchControls={true}
      />
        <div className="p-8">
          <HudTextV2.Hero className="mb-8 text-center">
            Vanta.js Globe + Net Effect
          </HudTextV2.Hero>
          
          <div className="max-w-4xl mx-auto">
            <HudTextV2 effect="fade" className="text-center mb-8 text-lg">
              Combined 3D globe and grid network effect
            </HudTextV2>
            
            <div className="text-center mb-8">
              <HudTextV2 effect="fade" className="text-lg">
                🌐 3D Globe + 🌐 Grid Network
              </HudTextV2>
            </div>
            
            <div className="bg-black bg-opacity-50 p-6 rounded-lg backdrop-blur-sm">
              <HudTextV2 effect="typewriter" className="text-center">
                Combined Effect: <strong>Globe + Net</strong>
              </HudTextV2>
              <HudTextV2 effect="fade" className="text-center mt-4 text-sm opacity-80">
                Move your mouse to interact with the 3D globe
              </HudTextV2>
            </div>
          </div>
        </div>
    </div>
  );
}
