import React, { ReactNode } from 'react'
import { 
  FrameCorners, 
  FrameOctagon, 
  FrameNero,
  FrameKranox,
  FrameLines,
  FrameBase
} from '@arwes/react-frames'
import { Animator } from '@arwes/react-animator'
import type { AnimatorProps } from '@arwes/react-animator'


// Frame type options
export type FrameType = 'corners' | 'octagon' | 'nero' | 'kranox' | 'lines' | 'custom'

interface HudPanelV2Props {
  title?: string
  subtitle?: string
  decor?: ReactNode
  children: ReactNode
  className?: string
  fullScreen?: boolean
  frameType?: FrameType
  animator?: Partial<AnimatorProps>
  strokeWidth?: number
  padding?: boolean
  glowIntensity?: 'low' | 'medium' | 'high'
}

// Custom SVG frame definitions
const customFrameDefs = {
  hexagon: {
    polylines: [
      '0,50% 25%,0 75%,0 100%,50% 75%,100% 25%,100% 0,50%',
    ]
  },
  trapezoid: {
    polylines: [
      '15%,0 85%,0 100%,100% 0,100%',
    ]
  }
}

export const HudPanelV2: React.FC<HudPanelV2Props> = ({
  title,
  subtitle,
  decor,
  children,
  className = '',
  fullScreen = false,
  frameType = 'corners',
  animator,
  strokeWidth = 2,
  padding = true,
  glowIntensity = 'medium'
}) => {

  
  // Get glow styles based on intensity
  const getGlowStyles = () => {
    const glowMap = {
      low: {
        filter: 'drop-shadow(0 0 2px var(--arwes-frames-line-color))',
        '--arwes-frames-bg-color': 'rgba(10, 42, 42, 0.1)'
      },
      medium: {
        filter: 'drop-shadow(0 0 4px var(--arwes-frames-line-color)) drop-shadow(0 0 8px var(--arwes-frames-deco-color))',
        '--arwes-frames-bg-color': 'rgba(10, 42, 42, 0.2)'
      },
      high: {
        filter: 'drop-shadow(0 0 8px var(--arwes-frames-line-color)) drop-shadow(0 0 16px var(--arwes-frames-deco-color)) drop-shadow(0 0 24px rgba(84, 218, 208, 0.3))',
        '--arwes-frames-bg-color': 'rgba(10, 42, 42, 0.3)'
      }
    }
    return glowMap[glowIntensity]
  }

  // Render the appropriate frame type
  const renderFrame = () => {
    const frameProps = {
      strokeWidth,
      style: getGlowStyles() as React.CSSProperties,
      className: fullScreen ? "absolute inset-0 w-full h-full" : "w-full h-full"
    }

    switch (frameType) {
      case 'octagon':
        return <FrameOctagon {...frameProps} />
      
      case 'nero':
        return <FrameNero {...frameProps} />
      
      case 'kranox':
        return <FrameKranox {...frameProps} />
      
      case 'lines':
        return <FrameLines {...frameProps} />
      
      case 'custom':
        return (
          <FrameBase
            {...frameProps}
            svgPaths={customFrameDefs.hexagon}
          />
        )
      
      case 'corners':
      default:
        return <FrameCorners {...frameProps} />
    }
  }

  const content = (
    <div className={`relative ${fullScreen ? 'absolute inset-0 w-full h-full' : ''} ${className}`}>
      {renderFrame()}
      
      <div 
        className={`relative z-10 ${padding ? 'p-6' : ''}`}
        style={{
          background: 'rgba(0, 18, 21, 0.8)',
          backdropFilter: 'blur(4px)'
        }}
      >
        {(title || subtitle || decor) && (
          <div className="flex items-center justify-between mb-6">
            <div>
              {title && (
                <h3 
                  className="text-xl font-bold text-[#54DAD0] mb-2 tracking-wide uppercase"
                  style={{
                    textShadow: '0 0 10px rgba(84, 218, 208, 0.5)',
                    filter: 'drop-shadow(0 0 4px rgba(84, 218, 208, 0.3))'
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-300 opacity-80 tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
            {decor && (
              <div className="text-[#54DAD0] text-xl opacity-80">
                {decor}
              </div>
            )}
          </div>
        )}
        
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  )

  // Wrap with animator if props provided
  if (animator) {
    return (
      <Animator {...animator}>
        {content}
      </Animator>
    )
  }

  return content
}

// Specialized panel variants
export const HudCard: React.FC<Omit<HudPanelV2Props, 'frameType'>> = (props) => (
  <HudPanelV2 {...props} frameType="corners" glowIntensity="low" />
)

export const HudModal: React.FC<Omit<HudPanelV2Props, 'frameType' | 'fullScreen'>> = (props) => (
  <HudPanelV2 {...props} frameType="octagon" fullScreen glowIntensity="high" />
)

export const HudAlert: React.FC<Omit<HudPanelV2Props, 'frameType'>> = (props) => (
  <HudPanelV2 {...props} frameType="nero" glowIntensity="high" />
)

export const HudSection: React.FC<Omit<HudPanelV2Props, 'frameType'>> = (props) => (
  <HudPanelV2 {...props} frameType="lines" glowIntensity="low" />
)
