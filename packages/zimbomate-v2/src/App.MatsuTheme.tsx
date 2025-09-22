import React from 'react'
import { ThemeProvider, useTheme } from './components/ui/ThemeProvider'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Progress } from './components/ui'
import { DiceRoller } from './components/game/DiceRoller'
import { StatRoller } from './components/game/StatRoller'
import { CharacterSheet } from './components/game/CharacterSheet'
import { Moon, Sun, Sparkles, Dice6, User } from 'lucide-react'

const ThemeToggle: React.FC = () => {
  const { isDark, toggleDark } = useTheme()
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDark}
      className="fixed top-4 right-4 z-50"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

const MatsuShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'dice' | 'character'>('overview')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-bold">ZimboMate V2</h1>
            <Dice6 className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Now featuring the beautiful Matsu theme - Ghibli Studio inspired design for your D&D adventures
          </p>
          <Badge variant="default" className="mt-4">Matsu Theme Active</Badge>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-card rounded-lg p-1 border">
            {[
              { id: 'overview', label: 'Theme Overview', icon: Sparkles },
              { id: 'dice', label: 'Dice System', icon: Dice6 },
              { id: 'character', label: 'Character Sheet', icon: User }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200
                  ${activeTab === id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matsu Theme Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">🎨 Ghibli Inspired</h3>
                    <p className="text-sm text-muted-foreground">
                      Warm, earthy colors reminiscent of Studio Ghibli films
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">📜 Textured Background</h3>
                    <p className="text-sm text-muted-foreground">
                      Subtle watercolor paper texture for authentic feel
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">🔤 Beautiful Typography</h3>
                    <p className="text-sm text-muted-foreground">
                      Nunito & PT Sans fonts for perfect readability
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Component Showcase</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="default">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="magical">Magical ✨</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="health">Health</Badge>
                    <Badge variant="mana">Mana</Badge>
                    <Badge variant="experience">Experience</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health</span>
                      <span>75/100</span>
                    </div>
                    <Progress value={75} className="progress-health" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span>450/500</span>
                    </div>
                    <Progress value={90} className="progress-experience" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'dice' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DiceRoller modifier={2} />
              <StatRoller 
                characterName="Eldara Moonwhisper"
                statModifiers={{ STR: 2, DEX: 1, CON: 0, INT: 3, WIS: 1, CHA: -1 }}
                showExamples={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'character' && (
          <div className="max-w-6xl mx-auto">
            <CharacterSheet />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>🎨 ZimboMate V2 with Matsu Theme</p>
          <p className="mt-1">Ghibli Studio inspired design for magical D&D adventures ✨</p>
        </div>
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MatsuShowcase />
    </ThemeProvider>
  )
}