import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { ColorPalette } from './components/ui/ColorSwatch'
import { TypographyShowcase } from './components/ui/TypographyShowcase'
import { GlassMorphismShowcase } from './components/ui/GlassMorphismShowcase'
import { ComponentShowcase } from './components/ui/ComponentShowcase'
import { colorPalettes } from './themeSystemMockData'
import { Palette, Type, Sparkles, Settings, Layers } from 'lucide-react'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Tooltip.Provider>
        <div className="min-h-screen bg-(--color-background) transition-colors duration-300">
          {/* Header */}
          <header className="sticky top-0 z-50 glass-surface border-b border-(--color-primary)/20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-(--color-primary)/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-(--color-primary)" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl">ZimboMate V2</h1>
                    <p className="text-sm text-(--color-text-secondary)">Fantasy Theme System</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-display-lg mb-4">Fantasy Theme System</h1>
              <p className="text-body-lg text-(--color-text-secondary) max-w-3xl">
                A magical design system for ZimboMate V2 featuring multiple themes, 
                beautiful typography, and enchanted glass morphism effects. 
                Switch between Fantasy, Sci-Fi, Dark, and Light themes to see the magic unfold.
              </p>
            </div>

            <Tabs.Root defaultValue="colors" className="space-y-8">
              <Tabs.List className="flex gap-2 p-1 glass-surface rounded-lg">
                <Tabs.Trigger
                  value="colors"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 hover:opacity-80"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}
                >
                  <Palette size={16} />
                  Colors
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="typography"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 hover:opacity-80"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}
                >
                  <Type size={16} />
                  Typography
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="components"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 hover:opacity-80"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}
                >
                  <Layers size={16} />
                  UI Components
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="effects"
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 hover:opacity-80"
                  style={{ 
                    fontFamily: 'var(--font-ui)',
                    backgroundColor: 'var(--color-surface-elevated)'
                  }}
                >
                  <Sparkles size={16} />
                  Effects
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="colors" className="space-y-8">
                <div>
                  <h2 className="text-display-md mb-6">Color Palettes</h2>
                  <div className="grid gap-8">
                    {Object.values(colorPalettes).map((palette) => (
                      <ColorPalette
                        key={palette.variant}
                        variant={palette.variant}
                        title={palette.title}
                        colors={palette.colors}
                      />
                    ))}
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="typography">
                <TypographyShowcase />
              </Tabs.Content>

              <Tabs.Content value="components">
                <ComponentShowcase />
              </Tabs.Content>

              <Tabs.Content value="effects">
                <GlassMorphismShowcase />
              </Tabs.Content>
            </Tabs.Root>
          </main>

          {/* Footer */}
          <footer className="mt-16 glass-surface border-t" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}>
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    ZimboMate V2 Theme System • Built with React 19 & Tailwind v4
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Phase 2: Core UI Foundation
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Tooltip.Provider>
    </ThemeProvider>
  )
}

export default App