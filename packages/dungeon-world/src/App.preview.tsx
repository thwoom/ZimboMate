import React, { useState, useEffect } from 'react'
import { PreviewProvider } from './components/PreviewProvider'
import { PreviewHpTile } from './components/tiles/PreviewHpTile'
import { PreviewXpTile } from './components/tiles/PreviewXpTile'
import { PreviewAttributesTile } from './components/tiles/PreviewAttributesTile'
import { PreviewCombatTile } from './components/tiles/PreviewCombatTile'
import { PreviewQuickActionsTile } from './components/tiles/PreviewQuickActionsTile'
import { Tile } from './components/ui/Tile'
import { SectionHeader } from './components/ui/SectionHeader'
import { StatGroup, StatItem } from './components/ui/StatGroup'
import { Meter } from './components/ui/Meter'
import { Button } from './components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card'
import { Kbd } from './components/ui/Kbd'
import { CommandPalette } from './components/ui/CommandPalette'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { PreviewInspector } from './components/PreviewInspector'
import { RollResultDisplay } from './components/RollResultDisplay'
import { ContextSwitcher, useContext } from './components/ContextSwitcher'
import { commandBus } from './lib/commandBus'
import { initializeTheme } from './lib/utils'
import './index.css'

function PreviewApp() {
  const { activeContext, setContext } = useContext()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commands, setCommands] = useState(commandBus.getCommands())
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [demoHp, setDemoHp] = useState(18)
  const [demoXp, setDemoXp] = useState(12)

  useEffect(() => {
    const unsubscribe = commandBus.subscribe(() => {
      setCommands(commandBus.getCommands())
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    initializeTheme()
  }, [])

  const handleDemoHpChange = (delta: number) => {
    setDemoHp(prev => Math.max(0, Math.min(24, prev + delta)))
  }

  const handleDemoXpAdd = () => {
    setDemoXp(prev => prev + 1)
  }

  const handleDemoRest = () => {
    setDemoHp(24)
  }

  return (
    <PreviewProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border/50 glass-subtle">
          <div className="flex h-header items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-text-primary">
                Dungeon World - Modern UI Preview
              </h1>
              <div className="hidden md:block">
                <ContextSwitcher
                  activeContext={activeContext}
                  onContextChange={setContext}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Command Palette:</span>
                <Kbd keys={['Cmd', 'K']} size="sm" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectorOpen(!inspectorOpen)}
              >
                Inspector
              </Button>
            </div>
          </div>
          
          <div className="md:hidden px-6 pb-3">
            <ContextSwitcher
              activeContext={activeContext}
              onContextChange={setContext}
            />
          </div>
        </header>

        <div className="flex flex-1">
          <main className={`flex-1 p-6 transition-all duration-300 ${inspectorOpen ? 'mr-80' : ''}`}>
            <div className="max-w-7xl mx-auto space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Live Demo - {activeContext.charAt(0).toUpperCase() + activeContext.slice(1)} Context</h2>
                <div className="grid grid-cols-12 gap-4 auto-rows-[4rem]">
                  <PreviewHpTile />
                  <PreviewXpTile />
                  <PreviewAttributesTile />
                  <PreviewCombatTile />
                  <PreviewQuickActionsTile />
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Theme System</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Arcane Slate (Default)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-primary"></div>
                          <span className="text-sm">Primary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-success"></div>
                          <span className="text-sm">Success</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-warning"></div>
                          <span className="text-sm">Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-danger"></div>
                          <span className="text-sm">Danger</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Glass Morphism</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="glass p-3 rounded-lg">
                          <span className="text-sm">Default Glass</span>
                        </div>
                        <div className="glass-subtle p-3 rounded-lg">
                          <span className="text-sm">Subtle Glass</span>
                        </div>
                        <div className="glass-strong p-3 rounded-lg">
                          <span className="text-sm">Strong Glass</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Typography</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h1 className="text-text-primary">Heading 1</h1>
                        <h3 className="text-text-primary">Heading 3</h3>
                        <p className="text-text-secondary">Secondary text</p>
                        <p className="text-text-tertiary">Tertiary text</p>
                        <code className="font-mono text-sm bg-surface px-2 py-1 rounded">Code text</code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-6">UI Components</h2>
                <div className="grid grid-cols-12 gap-4 auto-rows-[4rem]">
                  <Tile variant="elevated" rows={2} cols={3} className="space-y-4">
                    <SectionHeader 
                      title="Hit Points"
                      actions={
                        <Button variant="ghost" size="xs" onClick={handleDemoRest}>
                          Rest
                        </Button>
                      }
                    />
                    
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDemoHpChange(-1)}
                          disabled={demoHp <= 0}
                        >
                          <span className="text-lg">-</span>
                        </Button>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-text-primary">{demoHp}</div>
                          <div className="text-sm text-text-secondary">/ 24</div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDemoHpChange(1)}
                          disabled={demoHp >= 24}
                        >
                          <span className="text-lg">+</span>
                        </Button>
                      </div>
                      
                      <Meter
                        label=""
                        current={demoHp}
                        max={24}
                        variant="hp"
                        showValues={false}
                      />
                    </div>
                  </Tile>

                  <Tile variant="elevated" rows={1} cols={3} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <SectionHeader title="Experience" />
                      <Meter
                        label=""
                        current={demoXp}
                        max={15}
                        variant="xp"
                        showValues={true}
                        size="sm"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDemoXpAdd}>
                      +1 XP
                    </Button>
                  </Tile>

                  <Tile variant="elevated" rows={3} cols={3} className="space-y-4">
                    <SectionHeader title="Attributes" />
                    
                    <StatGroup columns={2}>
                      <StatItem label="STR" value={16} modifier={3} color="var(--color-stat-str)" />
                      <StatItem label="DEX" value={13} modifier={1} color="var(--color-stat-dex)" />
                      <StatItem label="CON" value={15} modifier={2} color="var(--color-stat-con)" />
                      <StatItem label="INT" value={8} modifier={-1} color="var(--color-stat-int)" />
                      <StatItem label="WIS" value={12} modifier={1} color="var(--color-stat-wis)" />
                      <StatItem label="CHA" value={9} modifier={-1} color="var(--color-stat-cha)" />
                    </StatGroup>
                  </Tile>

                  <Tile variant="elevated" rows={2} cols={3} className="space-y-4">
                    <SectionHeader title="Combat" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">2</div>
                        <div className="text-xs text-text-secondary uppercase">Armor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">d10</div>
                        <div className="text-xs text-text-secondary uppercase">Damage</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Roll Damage
                      </Button>
                    </div>
                  </Tile>

                  <Tile variant="ghost" rows={1} cols={6} className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm">Hack & Slash</Button>
                    <Button variant="outline" size="sm">Volley</Button>
                    <Button variant="outline" size="sm">Defend</Button>
                    <Button variant="outline" size="sm">Defy Danger</Button>
                    <Button variant="outline" size="sm">Aid/Interfere</Button>
                  </Tile>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Command System</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Keyboard Shortcuts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Command Palette</span>
                        <Kbd keys={['Cmd', 'K']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Add HP</span>
                        <Kbd keys={['↑']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Remove HP</span>
                        <Kbd keys={['↓']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Add XP</span>
                        <Kbd keys={['X']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rest</span>
                        <Kbd keys={['R']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roll 2d6</span>
                        <Kbd keys={['Space']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roll STR</span>
                        <Kbd keys={['1']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roll DEX</span>
                        <Kbd keys={['2']} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Roll CON</span>
                        <Kbd keys={['3']} size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Context System</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Play
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary mb-3">
                        Runtime actions and quick data. Vitals always visible with inspector on the right.
                      </p>
                      <div className="text-xs text-text-tertiary">
                        <Kbd keys={['Alt', '1']} size="sm" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        Prep
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary mb-3">
                        Leveling, attributes, load, spells, notes. Larger forms visible.
                      </p>
                      <div className="text-xs text-text-tertiary">
                        <Kbd keys={['Alt', '2']} size="sm" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                        Build
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary mb-3">
                        Character creation and edit flows. No inspector needed.
                      </p>
                      <div className="text-xs text-text-tertiary">
                        <Kbd keys={['Alt', '3']} size="sm" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-info"></div>
                        Reference
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary mb-3">
                        Moves, items, spells, rules browsing with inspector details.
                      </p>
                      <div className="text-xs text-text-tertiary">
                        <Kbd keys={['Alt', '4']} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </main>

          {inspectorOpen && (
            <aside className="fixed right-0 top-16 bottom-0 w-80 border-l border-border/50 glass-subtle overflow-y-auto">
              <PreviewInspector />
            </aside>
          )}
        </div>

        <RollResultDisplay />

        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          commands={commands}
        />
      </div>
    </PreviewProvider>
  )
}

export default PreviewApp