import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Import different Vanta effects
import NET from 'vanta/dist/vanta.net.min';
import BIRDS from 'vanta/dist/vanta.birds.min';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import FOG from 'vanta/dist/vanta.fog.min';
import GLOBE from 'vanta/dist/vanta.globe.min';
import TOPOLOGY from 'vanta/dist/vanta.topology.min';
import WAVES from 'vanta/dist/vanta.waves.min';

interface VantaBackgroundAdvancedProps {
  children?: React.ReactNode;
  effect?: 'net' | 'birds' | 'clouds' | 'fog' | 'globe' | 'topology' | 'waves';
  color?: string;
  backgroundColor?: string;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
}

export function VantaBackgroundAdvanced({ 
  children,
  effect = 'net',
  color = '#54DAD0', // Arwes cyan
  backgroundColor = '#001215', // Arwes dark background
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 1,
  scaleMobile = 1
}: VantaBackgroundAdvancedProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    console.log('VantaBackgroundAdvanced: useEffect triggered', { effect, vantaEffect: !!vantaEffect, element: !!vantaRef.current });
    
    if (!vantaEffect && vantaRef.current) {
             const effectConfig = {
         el: vantaRef.current,
         THREE: THREE,
         mouseControls,
         touchControls,
         gyroControls,
         minHeight,
         minWidth,
         scale,
         scaleMobile,
         backgroundColor: parseInt(backgroundColor.replace('#', '0x'))
         // Removed color from base config to avoid conflicts
       };

      let vantaInstance: any;

      switch (effect) {
                 case 'net':
           vantaInstance = NET({
             el: vantaRef.current,
             THREE: THREE,
             mouseControls: true,
             touchControls: true,
             gyroControls: false,
             minHeight: 200,
             minWidth: 200,
             scale: 1,
             scaleMobile: 1,
             points: 8, // Fewer points = less density
             maxDistance: 15, // Shorter connections = less clutter
             spacing: 30, // More space between points
             showLines: true,
             // Note: lineWidth not supported by Vanta.js NET effect
             color: '#2A6A66', // Darker teal color
             backgroundColor: '#001215' // Dark background
           });
          break;
        case 'birds':
          vantaInstance = BIRDS({
            ...effectConfig,
            birdSize: 1.5,
            wingSpan: 20,
            separation: 50,
            alignment: 1,
            cohesion: 1,
            quantity: 3
          });
          break;
        case 'clouds':
          vantaInstance = CLOUDS({
            ...effectConfig,
            skyColor: parseInt(backgroundColor.replace('#', '0x')),
            cloudColor: parseInt(color.replace('#', '0x')),
            cloudShadowColor: parseInt(color.replace('#', '0x')),
            sunColor: parseInt(color.replace('#', '0x')),
            sunGlareColor: parseInt(color.replace('#', '0x')),
            sunlightColor: parseInt(color.replace('#', '0x')),
            speed: 1
          });
          break;
        case 'fog':
          vantaInstance = FOG({
            ...effectConfig,
            highlightColor: parseInt(color.replace('#', '0x')),
            midtoneColor: parseInt(color.replace('#', '0x')),
            lowlightColor: parseInt(color.replace('#', '0x')),
            baseColor: parseInt(backgroundColor.replace('#', '0x')),
            blurFactor: 0.6,
            speed: 1.5,
            zoom: 1.2
          });
          break;
                 case 'globe':
           vantaInstance = GLOBE({
             el: vantaRef.current,
             THREE: THREE,
             mouseControls: true,
             touchControls: true,
             gyroControls: false,
             minHeight: 200,
             minWidth: 200,
             scale: 1,
             scaleMobile: 1,
             size: 0.8, // Smaller globe
             points: 3, // Fewer points = less density
             maxDistance: 15, // Shorter connections = less clutter
             spacing: 25, // More space between points
             showLines: true,
             color: '#2A6A66', // Darker teal color
             backgroundColor: '#001215' // Dark background
           });
          break;
                 case 'topology':
           vantaInstance = TOPOLOGY({
             el: vantaRef.current,
             THREE: THREE,
             mouseControls: true,
             touchControls: true,
             gyroControls: false,
             minHeight: 200,
             minWidth: 200,
             scale: 1,
             scaleMobile: 1,
             points: 6.5,
             maxDistance: 25,
             spacing: 15,
             showLines: true,
             color: '#54DAD0', // Use CSS color string
             backgroundColor: '#001215' // Dark background
           });
          break;
        case 'waves':
          vantaInstance = WAVES({
            ...effectConfig,
            waveHeight: 20,
            shininess: 27,
            waveSpeed: 0.75,
            zoom: 0.75
          });
          break;
                 default:
           vantaInstance = NET({
             ...effectConfig,
             points: 15,
             maxDistance: 25,
             spacing: 20,
             showLines: true,
             // Note: lineWidth not supported by Vanta.js NET effect
             color: '#54DAD0', // Teal for lines and dots
             backgroundColor: '#000000' // Pure black background
           });
      }

      console.log('VantaBackgroundAdvanced: Setting vanta effect', vantaInstance);
      setVantaEffect(vantaInstance);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, effect, color, backgroundColor, mouseControls, touchControls, gyroControls, minHeight, minWidth, scale, scaleMobile]);

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
           pointerEvents: 'none'
         }}
       />
     </div>
   );
}

export default VantaBackgroundAdvanced;
