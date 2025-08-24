import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GLOBE from 'vanta/dist/vanta.globe.min';

// Make THREE available globally for Vanta.js
(window as any).THREE = THREE;

interface VantaGlobeNetProps {
  color?: string;
  backgroundColor?: string;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
}

export function VantaGlobeNet({ 
  color = '#2A6A66', // Darker teal
  backgroundColor = '#001215', // Dark background
  mouseControls = true,
  touchControls = true,
  gyroControls = false
}: VantaGlobeNetProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = GLOBE({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        size: 1.5, // Bigger globe
        points: 3, // Fewer points = less density
        maxDistance: 15, // Shorter connections = less clutter
        spacing: 25, // More space between points
        showLines: true,
        color: color,
        backgroundColor: backgroundColor
      });

      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, color, backgroundColor, mouseControls, touchControls, gyroControls]);

  return (
    <div 
      ref={vantaRef}
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: -2,
        width: '100vw', 
        height: '100vh',
        backgroundColor: backgroundColor // Fallback background color
      }}
    >
      {/* Dark overlay to dim the effect */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% black overlay
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
    </div>
  );
}

export default VantaGlobeNet;
