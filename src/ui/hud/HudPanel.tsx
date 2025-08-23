import React, { ReactNode } from 'react'
import { FrameCorners } from '@arwes/react-frames'
import * as Frames from '@arwes/react-frames'

// Sanity check for development
if (import.meta.env.DEV) {
  console.log('arwes/react-frames:', Object.keys(Frames)); // should list FrameCorners
}

interface HudPanelProps {
  title?: string
  subtitle?: string
  decor?: ReactNode
  children: ReactNode
  className?: string
  fullScreen?: boolean
}

export const HudPanel: React.FC<HudPanelProps> = ({
  title,
  subtitle,
  decor,
  children,
  className = '',
  fullScreen = false
}) => {
  return (
    <div className={`relative ${fullScreen ? 'absolute inset-0 w-full h-full' : ''} ${className}`}>
      <FrameCorners
        strokeWidth={2}
        className={fullScreen ? "absolute inset-0 w-full h-full" : "w-full h-full"}
      />
      
      <div 
        className="relative z-10 p-6"
        style={{
          background: 'rgba(0, 18, 21, 0.8)',
          backdropFilter: 'blur(4px)'
        }}
      >
        {(title || subtitle || decor) && (
          <div className="flex items-center justify-between mb-6">
            <div>
              {title && (
                <h3 className="text-xl font-bold text-[#54DAD0] mb-2 tracking-wide uppercase">
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
}
