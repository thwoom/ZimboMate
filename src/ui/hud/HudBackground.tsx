import React from 'react'
import { Animator } from '@arwes/react-animator'
import { GridLines, Dots, MovingLines, Puffs } from '@arwes/react-bgs'
import { theme } from '../arwes/theme'

interface HudBackgroundProps {
  variant?: 'cosmic' | 'moebius' | 'minimal'
  children?: React.ReactNode
}

export const HudBackground: React.FC<HudBackgroundProps> = ({ 
  variant = 'cosmic',
  children 
}) => {
  // BRIGHT RED FOR TROUBLESHOOTING - hardcoded colors
  const gridColour = 'red'
  const dotColour = 'red' 
  const linesColour = 'red'

  const renderBackgroundLayers = () => {
    switch (variant) {
             case 'cosmic':
         return (
           <>
                           {/* Visible grid lines */}
              <GridLines 
                lineColor={gridColour}
                lineWidth={2}
                distance={80}
              />
              
              {/* Visible star field */}
              <Dots 
                color={dotColour}
                size={2}
                distance={60}
              />
              
              {/* Visible moving energy streams */}
              <MovingLines
                lineColor={linesColour}
                lineWidth={2}
                distance={300}
                speed={0.4}
              />
           </>
         )
        
      case 'moebius':
        return (
          <>
            {/* Minimalist grid */}
            <GridLines 
              lineColor="#9ca3af"
              lineWidth={1}
              distance={100}
              style={{ opacity: 0.05 }}
            />
            
            {/* Subtle dots */}
            <Dots 
              color="#374151"
              size={1}
              distance={80}
              style={{ opacity: 0.08 }}
            />
          </>
        )
        
      case 'minimal':
        return (
          <>
            {/* Single layer of dots */}
            <Dots 
              color={primaryDeco2}
              size={2}
              distance={120}
              style={{ opacity: 0.05 }}
            />
          </>
        )
        
      default:
        return null
    }
  }

     return (
     <div style={{ position: 'relative', width: '100%', height: '100%' }}>
       {/* TEST DIV - BRIGHT GREEN BACKGROUND */}
       <div 
         style={{ 
           position: 'absolute', 
           inset: 0, 
           background: 'lime',
           zIndex: -2
         }} 
       />
       
       {/* Background layers */}
       <Animator>
         <div 
           style={{ 
             position: 'absolute', 
             inset: 0, 
             zIndex: -1,
             overflow: 'hidden'
           }}
         >
           {renderBackgroundLayers()}
         </div>
       </Animator>
       
       {/* BRIGHT RED OVERLAY FOR TROUBLESHOOTING */}
       <div 
         style={{ 
           position: 'absolute', 
           inset: 0, 
           background: 'rgba(255, 0, 0, 0.5)',
           zIndex: 0
         }} 
       />
       
       {/* Content */}
       {children && (
         <div style={{ position: 'relative', zIndex: 1 }}>
           {children}
         </div>
       )}
     </div>
   )
 }

 // Export a full-screen background wrapper for page layouts
 export const HudPageBackground: React.FC<HudBackgroundProps & { className?: string }> = ({ 
   className = '',
   children,
   ...props 
 }) => {
   return (
     <div 
       className={`fixed inset-0 w-full h-full ${className}`}
       style={{ isolation: 'isolate' }}
     >
       <HudBackground {...props}>
         <div className="relative w-full h-full overflow-auto">
           {children}
         </div>
       </HudBackground>
     </div>
   )
 }
