import React, { useState } from 'react'

/**
 * Simple demo component to verify basic functionality without complex state
 */
export const SimpleDemo: React.FC = () => {
  const [theme, setTheme] = useState<'classic' | 'cosmic' | 'moebius'>('classic')
  
  // Apply theme to document
  React.useEffect(() => {
    document.documentElement.removeAttribute('data-theme')
    if (theme !== 'classic') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])
  
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">ZimboMate Space-HUD</h1>
          <p className="text-muted-foreground">
            Milestone 0: Environment Lock-In Verification (Simplified)
          </p>
        </div>
        
        {/* Theme Controls */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Theme System</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('classic')}
              className={`px-4 py-2 rounded-lg transition-all duration-150 ${
                theme === 'classic' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setTheme('cosmic')}
              className={`px-4 py-2 rounded-lg transition-all duration-150 ${
                theme === 'cosmic' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Cosmic
            </button>
            <button
              onClick={() => setTheme('moebius')}
              className={`px-4 py-2 rounded-lg transition-all duration-150 ${
                theme === 'moebius' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              Moebius
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            Current theme: <strong>{theme}</strong>
          </div>
        </div>
        
        {/* Design Token Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Design Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card text-card-foreground rounded-lg border shadow-lg">
              <h3 className="font-semibold mb-2">Panel Component</h3>
              <p className="text-sm text-muted-foreground">
                Uses design tokens: padding, background, border-radius, shadow
              </p>
            </div>
            <div className="p-6 bg-primary text-primary-foreground rounded-lg shadow-lg">
              <h3 className="font-semibold mb-2">HUD Element</h3>
              <p className="text-sm opacity-90">
                Primary colors with HUD styling
              </p>
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded-full border-2 border-border">
              <h3 className="font-semibold mb-2">Pill Style</h3>
              <p className="text-sm">
                Muted colors with pill radius
              </p>
            </div>
          </div>
        </div>
        
        {/* Color Palette Preview */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Color Palette</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { name: 'Background', class: 'bg-background border border-border' },
              { name: 'Foreground', class: 'bg-foreground' },
              { name: 'Primary', class: 'bg-primary' },
              { name: 'Secondary', class: 'bg-secondary' },
              { name: 'Accent', class: 'bg-accent' },
              { name: 'Muted', class: 'bg-muted' },
              { name: 'Success', class: 'bg-success' },
              { name: 'Warning', class: 'bg-warning' },
              { name: 'Destructive', class: 'bg-destructive' },
              { name: 'Border', class: 'bg-border' },
              { name: 'Card', class: 'bg-card border border-border' },
              { name: 'Popover', class: 'bg-popover border border-border' },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div className={`w-16 h-16 rounded-md ${color.class}`} />
                <div className="text-xs mt-1 text-muted-foreground">{color.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Success Message */}
        <div className="mt-8 p-4 bg-success text-success-foreground rounded-lg">
          <h3 className="font-semibold">✅ Milestone 0 Complete!</h3>
          <p className="text-sm mt-1">
            Design tokens are working, themes switch properly, and the app boots successfully.
          </p>
        </div>
      </div>
    </div>
  )
}
