import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeStatusBadge } from './components/ui/ThemeStatusBadge'
import { Dice3D } from './components/3d/Dice3D'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from './components/ui'
import { Box, Sparkles, Settings, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { mockDice3DProps, mockDiceResult } from './dice3DMockData'

const App: React.FC = () => {
  const [modifier, setModifier] = useState(2)
  const [enablePhysics, setEnablePhysics] = useState(true)
  const [enableShadows, setEnableShadows] = useState(true)
  const [enableAudio, setEnableAudio] = useState(true)
  const [rollHistory, setRollHistory] = useState<any[]>([])

  const handleRoll = (result: any) => {
    setRollHistory(prev => [result, ...prev.slice(0, 4)])
    console.log('3D Dice Result:', result)
  }

  const adjustModifier = (delta: number) => {
    setModifier(prev => Math.max(-5, Math.min(5, prev + delta)))
  }

  const resetSettings = () => {
    setModifier(2)
    setEnablePhysics(true)
    setEnableShadows(true)
    setEnableAudio(true)
    setRollHistory([])
  }

  return (
    <ThemeProvider>
      <Tooltip.Provider>
        <div className="min-h-screen bg-(--color-background) transition-colors duration-300">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-(--color-surface)/95 backdrop-blur-md border-b border-(--parchment-300)/30 shadow-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-(--parchment-800)/20 border border-(--parchment-700)/30 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box className="w-6 h-6 text-(--parchment-800)" />
                  </motion.div>
                  <div>
                    <h1 className="font-display text-xl text-(--parchment-900) font-semibold">ZimboMate V2</h1>
                    <p className="text-sm text-(--parchment-700) font-medium">3D Dice Rolling System</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ThemeStatusBadge />
                </motion.div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-(--color-primary)" />
                <h1 className="text-display-lg">3D Dice Rolling</h1>
              </div>
              <p className="text-body-lg text-(--color-text-secondary) max-w-3xl">
                Experience realistic physics-based dice rolling with magical theming. 
                Built with Three.js and React Three Fiber for immersive Dungeon World gameplay.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Dice Roller */}
              <div className="lg:col-span-2">
                <Dice3D
                  modifier={modifier}
                  enablePhysics={enablePhysics}
                  enableShadows={enableShadows}
                  onRoll={handleRoll}
                />
              </div>

              {/* Controls & History */}
              <div className="space-y-6">
                {/* Settings */}
                <Card variant="parchment" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-(--parchment-900)">
                      <Settings size={20} />
                      Settings
                    </CardTitle>
                    <CardDescription className="text-(--parchment-700)">
                      Customize your 3D dice experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Modifier Control */}
                    <div>
                      <label className="text-sm font-medium text-(--parchment-800) mb-2 block">
                        Modifier: {modifier >= 0 ? '+' : ''}{modifier}
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustModifier(-1)}
                          disabled={modifier <= -5}
                        >
                          -1
                        </Button>
                        <Badge variant="secondary" className="min-w-[3rem] text-center">
                          {modifier >= 0 ? '+' : ''}{modifier}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustModifier(1)}
                          disabled={modifier >= 5}
                        >
                          +1
                        </Button>
                      </div>
                    </div>

                    {/* Physics Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-(--parchment-800)">Physics</span>
                      <Button
                        variant={enablePhysics ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setEnablePhysics(!enablePhysics)}
                      >
                        {enablePhysics ? 'On' : 'Off'}
                      </Button>
                    </div>

                    {/* Shadows Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-(--parchment-800)">Shadows</span>
                      <Button
                        variant={enableShadows ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setEnableShadows(!enableShadows)}
                      >
                        {enableShadows ? 'On' : 'Off'}
                      </Button>
                    </div>

                    {/* Audio Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-(--parchment-800)">Audio</span>
                      <Button
                        variant={enableAudio ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setEnableAudio(!enableAudio)}
                        className="flex items-center gap-1"
                      >
                        {enableAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        {enableAudio ? 'On' : 'Off'}
                      </Button>
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSettings}
                      className="w-full flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Reset Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Roll History */}
                <Card variant="glass" padding="lg">
                  <CardHeader>
                    <CardTitle className="text-(--parchment-900)">Roll History</CardTitle>
                    <CardDescription className="text-(--parchment-700)">
                      Recent dice roll results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rollHistory.length === 0 ? (
                      <p className="text-sm text-(--parchment-600) text-center py-4">
                        No rolls yet. Roll the dice to see history!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {rollHistory.map((roll, index) => (
                          <motion.div
                            key={roll.timestamp}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-(--parchment-100) rounded-lg border border-(--parchment-300)"
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-mono text-(--parchment-800)">
                                {roll.dice1} + {roll.dice2}
                                {roll.modifier !== 0 && ` + ${roll.modifier}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  roll.outcome === 'success' 
                                    ? 'success' 
                                    : roll.outcome === 'partial' 
                                    ? 'default' 
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {roll.finalResult}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 bg-(--color-surface)/90 backdrop-blur-md border-t border-(--parchment-300)/30">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Box className="w-5 h-5 text-(--parchment-600)" />
                  <span className="text-sm text-(--parchment-700) font-medium">
                    ZimboMate V2 • 3D Dice with Three.js & React Three Fiber
                  </span>
                </motion.div>
                <motion.div 
                  className="text-sm text-(--parchment-600) font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Phase 3: 3D Physics & Immersive Experience ✨
                </motion.div>
              </div>
            </div>
          </footer>
        </div>
      </Tooltip.Provider>
    </ThemeProvider>
  )
}

export default App