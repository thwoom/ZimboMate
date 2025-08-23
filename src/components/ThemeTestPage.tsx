import React, { useState } from 'react'
import { Button, Panel, Toolbar, HudPill, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Slider } from './ui'

/**
 * Test page to verify visual parity across all three themes
 */
export const ThemeTestPage: React.FC = () => {
  const [theme, setTheme] = useState<'classic' | 'cosmic' | 'moebius'>('classic')
  
  // Apply theme to document and force re-render
  React.useEffect(() => {
    // Clear all theme attributes first
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('theme-classic', 'theme-cosmic', 'theme-moebius')
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.add(`theme-${theme}`)
    
    // Force a small delay to ensure DOM updates are processed
    setTimeout(() => {
      // Trigger a re-render by updating a dummy state
      setForceUpdate(prev => prev + 1)
    }, 10)
  }, [theme])
  
  // Force re-render state
  const [forceUpdate, setForceUpdate] = useState(0)
  
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="space-y-8">
        <Panel>
          <h1 className="text-3xl font-bold mb-4">Theme Visual Parity Test</h1>
          <p className="text-muted-foreground mb-6">
            Testing all components across Classic, Cosmic, and Moebius themes.
          </p>
          
          {/* Theme Controls */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={theme === 'classic' ? 'primary' : 'outline'}
              onClick={() => setTheme('classic')}
            >
              Classic
            </Button>
            <Button
              variant={theme === 'cosmic' ? 'primary' : 'outline'}
              onClick={() => setTheme('cosmic')}
            >
              Cosmic
            </Button>
            <Button
              variant={theme === 'moebius' ? 'primary' : 'outline'}
              onClick={() => setTheme('moebius')}
            >
              Moebius
            </Button>
          </div>
          
          <div className="text-sm font-medium">
            Current theme: <span className="font-bold text-primary">{theme}</span>
          </div>
        </Panel>
        
        {/* Button Variants */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Panel>
        
        {/* HUD Pills */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">HUD Pills</h2>
          <div className="flex flex-wrap gap-4">
            <HudPill variant="default">Active</HudPill>
            <HudPill variant="success">Online</HudPill>
            <HudPill variant="warning">Caution</HudPill>
            <HudPill variant="destructive">Offline</HudPill>
          </div>
        </Panel>
        
        {/* Toolbar */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Toolbar</h2>
          <Toolbar>
            <Button variant="outline" size="sm">Action 1</Button>
            <Button variant="outline" size="sm">Action 2</Button>
            <Button variant="outline" size="sm">Action 3</Button>
            <Switch aria-label="Toggle feature" />
          </Toolbar>
        </Panel>
        
        {/* Controls */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Volume Slider</label>
              <Slider defaultValue={[75]} max={100} step={1} className="w-64" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <label htmlFor="notifications" className="text-sm font-medium">
                Enable notifications
              </label>
            </div>
          </div>
        </Panel>
        
        {/* Tabs */}
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Tabs</h2>
          <Tabs defaultValue="character" className="w-full">
            <TabsList>
              <TabsTrigger value="character">Character</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="moves">Moves</TabsTrigger>
            </TabsList>
            <TabsContent value="character" className="mt-4">
              <Panel size="sm">
                <h3 className="font-semibold mb-2">Character Sheet</h3>
                <p className="text-sm text-muted-foreground">
                  Character information and stats would be displayed here.
                </p>
              </Panel>
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
              <Panel size="sm">
                <h3 className="font-semibold mb-2">Inventory</h3>
                <p className="text-sm text-muted-foreground">
                  Equipment and items would be listed here.
                </p>
              </Panel>
            </TabsContent>
            <TabsContent value="moves" className="mt-4">
              <Panel size="sm">
                <h3 className="font-semibold mb-2">Moves</h3>
                <p className="text-sm text-muted-foreground">
                  Available moves and abilities would be shown here.
                </p>
              </Panel>
            </TabsContent>
          </Tabs>
        </Panel>
        
        {/* Panel Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Panel size="sm">
            <h3 className="font-semibold mb-2">Small Panel</h3>
            <p className="text-sm text-muted-foreground">
              Compact panel with reduced padding.
            </p>
          </Panel>
          <Panel size="md">
            <h3 className="font-semibold mb-2">Medium Panel</h3>
            <p className="text-sm text-muted-foreground">
              Standard panel with default padding.
            </p>
          </Panel>
          <Panel size="lg">
            <h3 className="font-semibold mb-2">Large Panel</h3>
            <p className="text-sm text-muted-foreground">
              Spacious panel with generous padding.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
