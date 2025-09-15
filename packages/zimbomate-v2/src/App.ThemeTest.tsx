import React from 'react'
import { motion } from 'framer-motion'
import { ThemeProvider, useTheme } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Button } from './components/ui/Button'
import { Card, CardContent } from './components/ui'
import { Sparkles, Palette, Moon, Sun, Rocket } from 'lucide-react'

const ThemeShowcase: React.FC = () => {
  const { theme, animations, sounds, toggleAnimations, toggleSounds } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case 'fantasy': return <Sparkles className="w-8 h-8" />
      case 'dark': return <Moon className="w-8 h-8" />
      case 'light': return <Sun className="w-8 h-8" />
      case 'sci-fi': return <Rocket className="w-8 h-8" />
      default: return <Palette className="w-8 h-8" />
    }
  }

  const getThemeDescription = () => {
    switch (theme) {
      case 'fantasy': return 'Magical parchment with golden accents and mystical purple highlights'
      case 'dark': return 'Dark mode with golden highlights and purple magical elements'
      case 'light': return 'Clean light theme with subtle golden touches'
      case 'sci-fi': return 'Futuristic cyber theme with neon blue and green accents'
      default: return 'Unknown theme'
    }
  }

  return (
    <div 
      className="min-h-screen p-8 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              opacity: 0.2 
            }}
          >
            <div style={{ color: 'var(--color-primary)' }}>
              {getThemeIcon()}
            </div>
          </div>
          <h1 
            className="text-4xl font-display font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            ZimboMate V2 Theme System
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {getThemeDescription()}
          </p>
        </motion.div>

        {/* Theme Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Palette 
                    className="w-6 h-6" 
                    style={{ color: 'var(--color-primary)' }}
                  />
                  <div>
                    <h3 
                      className="font-display text-lg font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Theme Selection
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Current: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Color Palette Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="default" padding="lg">
            <CardContent>
              <h3 
                className="font-display text-xl font-semibold mb-6"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Color Palette
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Primary', var: '--color-primary' },
                  { name: 'Secondary', var: '--color-secondary' },
                  { name: 'Accent', var: '--color-accent' },
                  { name: 'Surface', var: '--color-surface' }
                ].map((color) => (
                  <div key={color.name} className="text-center space-y-2">
                    <div 
                      className="w-full h-16 rounded-lg border"
                      style={{ 
                        backgroundColor: `var(${color.var})`,
                        borderColor: 'var(--color-border)'
                      }}
                    />
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {color.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Button Variants Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="default" padding="lg">
            <CardContent>
              <h3 
                className="font-display text-xl font-semibold mb-6"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Button Variants
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="magical">Magical</Button>
                <Button variant="cyber">Cyber</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="default" padding="lg">
            <CardContent>
              <h3 
                className="font-display text-xl font-semibold mb-6"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Animations: {animations ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleAnimations}
                  >
                    Toggle
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Sounds: {sounds ? 'Enabled' : 'Disabled'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSounds}
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Theme system fixed and working! ✨
          </p>
        </motion.div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemeShowcase />
    </ThemeProvider>
  )
}

export default App