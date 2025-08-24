import React, { useEffect, useRef } from 'react';

interface VantaTopologyCDNProps {
  color?: number;
  backgroundColor?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
}

export function VantaTopologyCDN({ 
  color = 0x0f7a8a, // Darker teal color as hex integer
  backgroundColor = 0x31b1b, // Dark background as hex integer
  mouseControls = true,
  touchControls = true,
  gyroControls = false
}: VantaTopologyCDNProps) {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load p5.js and Vanta.js from CDN
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Load required scripts
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js');
        
        // Wait for VANTA to be available
        const waitForVanta = () => {
          if ((window as any).VANTA) {
            const vantaEffect = (window as any).VANTA.TOPOLOGY({
              el: vantaRef.current,
              mouseControls,
              touchControls,
              gyroControls,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color,
              backgroundColor
            });
            
            // Store the effect for cleanup
            (vantaRef.current as any).vantaEffect = vantaEffect;
          } else {
            setTimeout(waitForVanta, 100);
          }
        };
        
        waitForVanta();
      } catch (error) {
        console.error('Failed to load Vanta.js:', error);
      }
    };

    initVanta();

    // Cleanup function
    return () => {
      if (vantaRef.current && (vantaRef.current as any).vantaEffect) {
        (vantaRef.current as any).vantaEffect.destroy();
      }
    };
  }, [color, backgroundColor, mouseControls, touchControls, gyroControls]);

  return (
    <div 
      ref={vantaRef}
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: -2,
        width: '100vw', 
        height: '100vh',
        backgroundColor: `#${backgroundColor.toString(16).padStart(6, '0')}` // Convert hex int to CSS color
      }}
    >
             {/* CSS Grid overlay for sci-fi effect */}
       <div 
         style={{
           position: 'absolute',
           inset: 0,
           backgroundImage: `
             linear-gradient(rgba(19, 158, 177, 0.1) 1px, transparent 1px),
             linear-gradient(90deg, rgba(19, 158, 177, 0.1) 1px, transparent 1px)
           `,
           backgroundSize: '50px 50px',
           pointerEvents: 'none',
           zIndex: 2
         }}
       />
       
                       {/* Twinkling dots overlay aligned to grid intersections */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 3
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            // Calculate grid-aligned positions (50px grid)
            const gridSize = 50;
            const cols = Math.floor(window.innerWidth / gridSize);
            const rows = Math.floor(window.innerHeight / gridSize);
            
            // Random grid intersection
            const col = Math.floor(Math.random() * cols);
            const row = Math.floor(Math.random() * rows);
            
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  backgroundColor: 'rgba(19, 158, 177, 1)',
                  borderRadius: '50%',
                  left: `${col * gridSize}px`,
                  top: `${row * gridSize}px`,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            );
          })}
        </div>
        
                 {/* Falling lines from all directions */}
         <div 
           style={{
             position: 'absolute',
             inset: 0,
             pointerEvents: 'none',
             zIndex: 4
           }}
         >
           {Array.from({ length: 5 }, (_, i) => {
             const gridSize = 50;
             const cols = Math.floor(window.innerWidth / gridSize);
             const rows = Math.floor(window.innerHeight / gridSize);
             const direction = i % 4; // 0: top, 1: bottom, 2: left, 3: right
             const startDelay = Math.random() * 3;
             
             let lineStyle: any = {
               position: 'absolute',
               background: 'linear-gradient(to bottom, transparent, rgba(19, 158, 177, 0.8), transparent)',
               animation: `fallLine${direction} ${4 + Math.random() * 2}s linear infinite`,
               animationDelay: `${startDelay}s`
             };
             
             switch (direction) {
               case 0: // Top to bottom
                 lineStyle = {
                   ...lineStyle,
                   width: '1px',
                   height: '100vh',
                   left: `${Math.floor(Math.random() * cols) * gridSize}px`,
                   top: '-100vh',
                   background: 'linear-gradient(to bottom, transparent, rgba(19, 158, 177, 0.8), transparent)'
                 };
                 break;
               case 1: // Bottom to top
                 lineStyle = {
                   ...lineStyle,
                   width: '1px',
                   height: '100vh',
                   left: `${Math.floor(Math.random() * cols) * gridSize}px`,
                   top: '100vh',
                   background: 'linear-gradient(to top, transparent, rgba(19, 158, 177, 0.8), transparent)'
                 };
                 break;
               case 2: // Left to right
                 lineStyle = {
                   ...lineStyle,
                   width: '100vw',
                   height: '1px',
                   left: '-100vw',
                   top: `${Math.floor(Math.random() * rows) * gridSize}px`,
                   background: 'linear-gradient(to right, transparent, rgba(19, 158, 177, 0.8), transparent)'
                 };
                 break;
               case 3: // Right to left
                 lineStyle = {
                   ...lineStyle,
                   width: '100vw',
                   height: '1px',
                   left: '100vw',
                   top: `${Math.floor(Math.random() * rows) * gridSize}px`,
                   background: 'linear-gradient(to left, transparent, rgba(19, 158, 177, 0.8), transparent)'
                 };
                 break;
             }
             
             return (
               <div
                 key={`line-${i}`}
                 style={lineStyle}
               />
             );
           })}
         </div>
       
               <style>
          {`
            @keyframes twinkle {
              0%, 100% { opacity: 0.1; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            
                         @keyframes fallLine0 { /* Top to bottom */
               0% { 
                 transform: translateY(0);
                 opacity: 0;
               }
               10% { 
                 opacity: 1;
               }
               90% { 
                 opacity: 1;
               }
               100% { 
                 transform: translateY(100vh);
                 opacity: 0;
               }
             }
             
             @keyframes fallLine1 { /* Bottom to top */
               0% { 
                 transform: translateY(0);
                 opacity: 0;
               }
               10% { 
                 opacity: 1;
               }
               90% { 
                 opacity: 1;
               }
               100% { 
                 transform: translateY(-100vh);
                 opacity: 0;
               }
             }
             
             @keyframes fallLine2 { /* Left to right */
               0% { 
                 transform: translateX(0);
                 opacity: 0;
               }
               10% { 
                 opacity: 1;
               }
               90% { 
                 opacity: 1;
               }
               100% { 
                 transform: translateX(100vw);
                 opacity: 0;
               }
             }
             
             @keyframes fallLine3 { /* Right to left */
               0% { 
                 transform: translateX(0);
                 opacity: 0;
               }
               10% { 
                 opacity: 1;
               }
               90% { 
                 opacity: 1;
               }
               100% { 
                 transform: translateX(-100vw);
                 opacity: 0;
               }
             }
          `}
        </style>
    </div>
  );
}

export default VantaTopologyCDN;
