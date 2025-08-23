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
  // Get colors from theme
  const primaryColor = theme.colors.primary(5) || '#54dad0'
  const primaryDeco1 = theme.colors.primary(0) || '#2f7d7a'
  const primaryDeco2 = theme.colors.primary(1) || '#54dad0'
  const primaryDeco3 = theme.colors.primary(2) || '#8ff6ff'

  const renderBackgroundLayers = () => {
    switch (variant) {
      case 'cosmic':
        return (
          <>
            {/* Subtle grid */}
            <GridLines 
              lineColor={primaryDeco1}
              lineWidth={1}
              distance={100}
              style={{ opacity: 0.08 }}
            />
            
            {/* Soft star field */}
            <Dots 
              color={primaryDeco3}
              size={1}
              distance={80}
              style={{ opacity: 0.15 }}
            />
            
            {/* Gentle energy streams */}
            <MovingLines
              lineColor={primaryDeco2}
              lineWidth={1}
              distance={400}
              speed={0.3}
              style={{ opacity: 0.1 }}
            />
            
            {/* Very subtle atmospheric fog */}
            <Puffs
              color={primaryColor}
              size={600}
              quantity={2}
              style={{ opacity: 0.03 }}
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
              style={{ opacity: 0.1 }}
            />
            
            {/* Subtle dots */}
            <Dots 
              color="#374151"
              size={1}
              distance={80}
              style={{ opacity: 0.15 }}
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
              style={{ opacity: 0.1 }}
            />
          </>
        )
        
      default:
        return null
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
