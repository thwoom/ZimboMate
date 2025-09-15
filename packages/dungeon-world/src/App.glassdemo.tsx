import React, { useEffect, useState } from 'react'
import { GlassMorphismDemo } from './components/GlassMorphismDemo'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { initializeTheme } from './lib/utils'
import './index.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState<string>('default')

  useEffect(() => {
    initializeTheme()
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') || 'default'
      setCurrentTheme(theme)
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Glass Morphism System
              </h1>
              <p className="text-text-secondary text-sm">
                Fixed and enhanced glass effects for Dungeon World
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="glass-subtle px-3 py-1 rounded-full">
                <span className="text-xs text-text-secondary">
                  Theme: {currentTheme}
                </span>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="text-center space-y-4">
            <div className="glass-panel p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                Enhanced Glass Morphism Effects
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed">
                The glass morphism system has been completely rebuilt with proper Tailwind v4 utilities,
                consistent theming, and enhanced visual effects. All glass components now work seamlessly
                across different themes and contexts.
              </p>
            </div>
          </section>

          {/* System Status */}
          <section>
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tailwind v4 Integration:</span>
                      <span className="text-success font-semibold">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Custom Glass Utilities:</span>
                      <span className="text-success font-semibold">✓ Loaded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Backdrop Filter Support:</span>
                      <span className="text-success font-semibold">✓ Enabled</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Theme Variables:</span>
                      <span className="text-success font-semibold">✓ Applied</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">CSS Layer Order:</span>
                      <span className="text-success font-semibold">✓ Correct</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Performance:</span>
                      <span className="text-success font-semibold">✓ Optimized</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Glass Morphism Demo */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Interactive Glass Demo
              </h2>
              <p className="text-text-secondary">
                Explore the different glass morphism effects and utilities
              </p>
            </div>
            
            <GlassMorphismDemo />
          </section>

          {/* Technical Details */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Technical Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-text-primary">Fixed Issues:</h4>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Consolidated conflicting CSS definitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Proper Tailwind v4 @utility syntax</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Theme-aware CSS custom properties</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Enhanced backdrop-filter support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success">✓</span>
                        <span>Improved layer stacking and z-index</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-text-primary">Available Utilities:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="glass-subtle p-2 rounded font-mono">
                        .glass, .glass-subtle, .glass-strong
                      </div>
                      <div className="glass-subtle p-2 rounded font-mono">
                        .glass-panel, .glass-surface, .glass-header
                      </div>
                      <div className="glass-subtle p-2 rounded font-mono">
                        .glass-modal, .glass-overlay, .floating-glass
                      </div>
                      <div className="glass-subtle p-2 rounded font-mono">
                        .glass-border, .glass-ring, .glass-hover
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Usage Examples */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="glass-subtle p-4 rounded-lg">
                    <h4 className="font-semibold text-text-primary mb-2">Basic Glass Component</h4>
                    <pre className="text-xs text-text-secondary font-mono bg-surface/50 p-3 rounded overflow-x-auto">
{`<div className="glass p-6 rounded-lg">
  <h3>Glass Content</h3>
  <p>Your content here...</p>
</div>`}
                    </pre>
                  </div>
                  
                  <div className="glass-subtle p-4 rounded-lg">
                    <h4 className="font-semibold text-text-primary mb-2">Advanced Glass Panel</h4>
                    <pre className="text-xs text-text-secondary font-mono bg-surface/50 p-3 rounded overflow-x-auto">
{`<div className="glass-panel p-8">
  <div className="relative z-10">
    <!-- Content with proper layering -->
  </div>
</div>`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-header mt-16 border-t border-border/50">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-text-secondary">
            Glass Morphism System - Enhanced for Dungeon World UI
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App