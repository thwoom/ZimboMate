import React, { useEffect, useRef, useState } from 'react';
import VANTA from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';

interface VantaBackgroundProps {
  children?: React.ReactNode;
  variant?: 'net' | 'birds' | 'clouds' | 'fog' | 'globe' | 'topology' | 'waves';
}

export function VantaBackground({ 
  children, 
  variant = 'net' 
}: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        VANTA.NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x54DAD0,
          backgroundColor: 0x001215,
          points: 15.00,
          maxDistance: 25.00,
          spacing: 20.00,
          showLines: true
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div 
      ref={vantaRef}
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: -2,
        width: '100vw', 
        height: '100vh' 
      }}
    >
      {/* Content */}
      {children && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default VantaBackground;
