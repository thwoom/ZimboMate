import React, { ReactNode } from 'react'
import { FrameSVGCorners } from '@arwes/frames'

interface HudPanelProps {
  title?: string
  subtitle?: string
  decor?: ReactNode
  children: ReactNode
  className?: string
}

export const HudPanel: React.FC<HudPanelProps> = ({
  title,
  subtitle,
  decor,
  children,
  className = ''
}) => {
  return (
    <div className={`arwes-frame relative ${className}`}>
      <FrameSVGCorners
        strokeWidth={1}
        cornerLength={20}
        cornerWidth={2}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'var(--arwes-frames-line-filter)'
        }}
      />
      
      <div className="arwes-frame-content">
        {(title || subtitle || decor) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-[#54DAD0] mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {decor && (
              <div className="text-[#54DAD0]">
                {decor}
              </div>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  )
}
