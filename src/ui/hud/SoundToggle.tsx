import React from 'react'
import { useSoundToggle } from '../arwes/ArwesProviders'

interface SoundToggleProps {
  className?: string
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const { enabled, toggle } = useSoundToggle()

  const handleToggle = () => {
    toggle()
  }

  const handleHover = () => {
    // Sound removed - UI only
  }

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={handleHover}
      className={`
        relative px-4 py-2 
        bg-transparent border border-[#54DAD0] 
        text-[#54DAD0] font-medium text-sm
        transition-all duration-200 ease-out
        hover:bg-[#54DAD0] hover:bg-opacity-10
        focus:outline-none focus:ring-2 focus:ring-[#54DAD0] focus:ring-opacity-50
        ${className}
      `}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 relative">
          {enabled ? (
            // Sound on icon
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
              <path d="M8 2.5a.5.5 0 0 0-.5-.5H5a.5.5 0 0 0-.5.5v3H2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5H4.5v3a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 .5-.5V2.5z"/>
              <path d="M10.5 7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z"/>
              <path d="M12.5 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
              <path d="M14.5 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5z"/>
            </svg>
          ) : (
            // Sound off icon
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
              <path d="M8 2.5a.5.5 0 0 0-.5-.5H5a.5.5 0 0 0-.5.5v3H2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5H4.5v3a.5.5 0 0 0 .5.5h2.5a.5.5 0 0 0 .5-.5V2.5z"/>
              <path d="M10.5 8.5L13 6l.5.5L11 9l2.5 2.5-.5.5L10.5 9.5 8 12l-.5-.5L10 9 7.5 6.5 8 6l2.5 2.5z"/>
            </svg>
          )}
        </div>
        <span>{enabled ? 'SOUND ON' : 'SOUND OFF'}</span>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent, rgba(84, 218, 208, 0.1), transparent)',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
        }}
      />
    </button>
  )
}
