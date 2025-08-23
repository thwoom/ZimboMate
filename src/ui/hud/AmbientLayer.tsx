import React, { useEffect, useRef } from 'react'

export const AmbientLayer: React.FC = () => {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple CSS animation will handle the drift
  }, [])

  return (
    <div
      ref={layerRef}
      data-layer="ambient"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: `
          radial-gradient(ellipse at 30% 70%, rgba(84, 218, 208, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 30%, rgba(84, 218, 208, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 50%, rgba(84, 218, 208, 0.04) 0%, transparent 80%),
          linear-gradient(135deg, 
            rgba(0, 12, 10, 1) 0%, 
            rgba(0, 18, 21, 0.95) 30%, 
            rgba(0, 23, 26, 0.98) 60%, 
            rgba(7, 38, 40, 0.9) 100%
          )
        `,
        backgroundSize: '120% 120%, 150% 150%, 200% 200%, 100% 100%',
        animation: 'ambientDrift 25s ease-in-out infinite'
      }}
    >
      {/* Animated particles/dots */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#54DAD0] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Enhanced scan lines */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(84, 218, 208, 0.1) 3px,
              rgba(84, 218, 208, 0.1) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 80px,
              rgba(84, 218, 208, 0.05) 80px,
              rgba(84, 218, 208, 0.05) 82px
            )
          `
        }}
      />
      
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(84, 218, 208, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(84, 218, 208, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-8"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          mixBlendMode: 'screen'
        }}
      />
    </div>
  )
}
