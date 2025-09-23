import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeStatusBadge } from './components/ui/ThemeStatusBadge'
import { CharacterSheet } from './components/game/CharacterSheet'
import { Sparkles, User, Dice6, Scroll, Settings } from 'lucide-react'
import { Card, CardContent, Button } from './components/ui'

type ActiveTab = 'character' | 'dice' | 'moves' | 'settings'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('character')

  const tabs = [
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'moves' as const, label: 'Moves', icon: Scroll },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'character':
        return <CharacterSheet />
      case 'dice':
        return (
          <Card variant="magical" padding="lg">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-display">Dice Roller</h2>
                <p className="text-(--color-text-secondary)">
                  Dice rolling system coming soon! This will include 2D6 mechanics 
                  for Dungeon World with beautiful animations and 3D effects.
                </p>
                <Button variant="primary">
                  <Dice6 size={16} />
                  Roll 2d6
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'moves':
        return (
          <Card variant="parchment" padding="lg">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-display">Moves & Spells</h2>
                <p className="text-(--color-text-secondary)">
                  Character moves and spell system coming soon! This will include 
                  all Dungeon World moves with contextual suggestions.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      case 'settings':
        return (
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-display">Settings</h2>
                <p className="text-(--color-text-secondary)">
                  Settings panel coming soon! This will include audio controls, 
                  animation preferences, and character import/export.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return <CharacterSheet />
    }
  }

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
                    <p className="text-sm text-(--color-text-secondary)">Dungeon World Companion</p>
                  </div>
                </div>
                <ThemeStatusBadge />
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="sticky top-[73px] z-40 glass-surface border-b border-(--color-primary)/10">
            <div className="container mx-auto px-6">
              <div className="flex gap-1 py-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className="relative"
                    >
                      <Icon size={16} />
                      {tab.label}
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-primary)"
                        />
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            {renderContent()}
          </main>

          {/* Footer */}
          <footer className="mt-16 glass-surface border-t border-(--color-primary)/20">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-(--color-text-muted)" />
                  <span className="text-sm text-(--color-text-secondary)">
                    ZimboMate V2 • Built with React 19 & Tailwind v4
                  </span>
                </div>
                <div className="text-sm text-(--color-text-muted)">
                  Phase 2: Core UI Components Complete ✨
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