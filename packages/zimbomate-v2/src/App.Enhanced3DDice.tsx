import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedDice3D } from './components/3d/EnhancedDice3D'
import { Card, CardContent, Button, Badge } from './components/ui'
import { 
  Sparkles, 
  Settings, 
  Volume2, 
  VolumeX, 
  Palette, 
  Dices,
  BarChart3,
  History,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { audioService } from './services/AudioService'
import type { EnhancedDice3DResult } from './components/3d/EnhancedDice3D'
import * as THREE from 'three'

// Demo configuration types
interface DemoConfig {
  theme: 'fantasy' | 'sci-fi' | 'dark' | 'light'
  diceStyle: 'ivory' | 'obsidian' | 'crystal' | 'metal' | 'wood'
  tableStyle: 'felt' | 'wood' | 'stone' | 'magical'
  audioEnabled: boolean
  modifier: number
  autoRoll: boolean
  autoRollInterval: number
}

interface RollHistory {
  id: string
  result: EnhancedDice3DResult
  timestamp: number
}

interface RollStatistics {
  totalRolls: number
  averageRoll: number
  successRate: number
  partialRate: number
  failureRate: number
  highestRoll: number
  lowestRoll: number
  averageDuration: number
  totalCollisions: number
}

const Enhanced3DDiceDemo: React.FC = () => {
  // Demo state
  const [config, setConfig] = useState<DemoConfig>({
    theme: 'fantasy',
    diceStyle: 'ivory',
    tableStyle: 'felt',
    audioEnabled: true,
    modifier: 0,
    autoRoll: false,
    autoRollInterval: 3000
  })
  
  const [rollHistory, setRollHistory] = useState<RollHistory[]>([])
  const [currentResult, setCurrentResult] = useState<EnhancedDice3DResult | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [collisionEffects, setCollisionEffects] = useState<Array<{
    id: string
    position: [number, number, number]
    intensity: number
  }>>([])
  
  const autoRollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rollCountRef = useRef(0)
  
  // Calculate statistics
  const statistics: RollStatistics = React.useMemo(() => {
    if (rollHistory.length === 0) {
      return {
        totalRolls: 0,
        averageRoll: 0,
        successRate: 0,
        partialRate: 0,
        failureRate: 0,
        highestRoll: 0,
        lowestRoll: 0,
        averageDuration: 0,
        totalCollisions: 0
      }
    }
    
    const results = rollHistory.map(h => h.result)
    const totalRolls = results.length
    const averageRoll = results.reduce((sum, r) => sum + r.finalResult, 0) / totalRolls
    const successCount = results.filter(r => r.outcome === 'success').length
    const partialCount = results.filter(r => r.outcome === 'partial').length
    const failureCount = results.filter(r => r.outcome === 'failure').length
    const highestRoll = Math.max(...results.map(r => r.finalResult))
    const lowestRoll = Math.min(...results.map(r => r.finalResult))
    const averageDuration = results.reduce((sum, r) => sum + r.rollDuration, 0) / totalRolls
    const totalCollisions = results.reduce((sum, r) => sum + r.collisionCount, 0)
    
    return {
      totalRolls,
      averageRoll: Math.round(averageRoll * 100) / 100,
      successRate: Math.round((successCount / totalRolls) * 100),
      partialRate: Math.round((partialCount / totalRolls) * 100),
      failureRate: Math.round((failureCount / totalRolls) * 100),
      highestRoll,
      lowestRoll,
      averageDuration: Math.round(averageDuration * 100) / 100,
      totalCollisions
    }
  }, [rollHistory])
  
  // Handle dice roll completion
  const handleRollComplete = useCallback((result: EnhancedDice3DResult) => {
    const historyEntry: RollHistory = {
      id: `roll-${Date.now()}-${rollCountRef.current++}`,
      result,
      timestamp: Date.now()
    }
    
    setRollHistory(prev => [historyEntry, ...prev.slice(0, 49)]) // Keep last 50 rolls
    setCurrentResult(result)
    setIsRolling(false)
    
    console.log('Enhanced 3D Dice Result:', result)
  }, [])
  
  // Handle dice roll start
  const handleRollStart = useCallback(() => {
    setIsRolling(true)
    setCurrentResult(null)
  }, [])
  
  // Handle collision effects
  const handleCollision = useCallback((intensity: number, position: THREE.Vector3) => {
    const effect = {
      id: `collision-${Date.now()}-${Math.random()}`,
      position: [position.x, position.y, position.z] as [number, number, number],
      intensity
    }
    
    setCollisionEffects(prev => [...prev, effect])
    
    // Remove effect after animation
    setTimeout(() => {
      setCollisionEffects(prev => prev.filter(e => e.id !== effect.id))
    }, 1000)
  }, [])
  
  // Update configuration
  const updateConfig = useCallback((updates: Partial<DemoConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates }
      
      // Update audio service
      if ('audioEnabled' in updates || 'theme' in updates) {
        audioService.updateConfig({
          enabled: newConfig.audioEnabled,
          theme: newConfig.theme
        })
      }
      
      return newConfig
    })
  }, [])
  
  // Auto-roll functionality
  React.useEffect(() => {
    if (config.autoRoll && !isRolling) {
      autoRollTimerRef.current = setTimeout(() => {
        // Trigger auto roll by updating modifier slightly
        setConfig(prev => ({ ...prev, modifier: prev.modifier }))
      }, config.autoRollInterval)
    } else if (autoRollTimerRef.current) {
      clearTimeout(autoRollTimerRef.current)
      autoRollTimerRef.current = null
    }
    
    return () => {
      if (autoRollTimerRef.current) {
        clearTimeout(autoRollTimerRef.current)
      }
    }
  }, [config.autoRoll, config.autoRollInterval, isRolling])
  
  // Clear history
  const clearHistory = useCallback(() => {
    setRollHistory([])
    setCurrentResult(null)
  }, [])
  
  // Test audio system
  const testAudio = useCallback(() => {
    audioService.testAudio()
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-(--parchment-50) to-(--parchment-100) p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <Dices className="w-8 h-8 text-(--color-primary)" />
            <h1 className="text-4xl font-display font-bold text-(--parchment-900)">
              Enhanced 3D Dice System
            </h1>
            <Sparkles className="w-8 h-8 text-(--color-primary)" />
          </div>
          <p className="text-lg text-(--parchment-700) max-w-2xl mx-auto">
            Experience the most advanced 3D dice rolling system for Dungeon World. 
            Features realistic physics, spatial audio, and magical particle effects.
          </p>
          
          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Palette size={12} />
              {config.theme}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Dices size={12} />
              {config.diceStyle}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {config.audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              Audio {config.audioEnabled ? 'On' : 'Off'}
            </Badge>
            {config.autoRoll && (
              <Badge variant="primary" className="flex items-center gap-1">
                <Play size={12} />
                Auto Roll
              </Badge>
            )}
          </div>
        </motion.div>
        
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="magical" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-(--parchment-900)">
                  Control Panel
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className={showSettings ? 'bg-(--parchment-200)' : ''}
                  >
                    <Settings size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className={showHistory ? 'bg-(--parchment-200)' : ''}
                  >
                    <History size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className={showStats ? 'bg-(--parchment-200)' : ''}
                  >
                    <BarChart3 size={16} />
                  </Button>
                </div>
              </div>
              
              {/* Quick Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--parchment-800)">Theme</label>
                  <select
                    value={config.theme}
                    onChange={(e) => updateConfig({ theme: e.target.value as any })}
                    className="w-full p-2 rounded border border-(--parchment-300) bg-white"
                  >
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Sci-Fi</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--parchment-800)">Dice Style</label>
                  <select
                    value={config.diceStyle}
                    onChange={(e) => updateConfig({ diceStyle: e.target.value as any })}
                    className="w-full p-2 rounded border border-(--parchment-300) bg-white"
                  >
                    <option value="ivory">Ivory</option>
                    <option value="obsidian">Obsidian</option>
                    <option value="crystal">Crystal</option>
                    <option value="metal">Metal</option>
                    <option value="wood">Wood</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--parchment-800)">Table</label>
                  <select
                    value={config.tableStyle}
                    onChange={(e) => updateConfig({ tableStyle: e.target.value as any })}
                    className="w-full p-2 rounded border border-(--parchment-300) bg-white"
                  >
                    <option value="felt">Felt</option>
                    <option value="wood">Wood</option>
                    <option value="stone">Stone</option>
                    <option value="magical">Magical</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-(--parchment-800)">Modifier</label>
                  <input
                    type="number"
                    value={config.modifier}
                    onChange={(e) => updateConfig({ modifier: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded border border-(--parchment-300) bg-white"
                    min={-5}
                    max={5}
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={testAudio}
                  disabled={!config.audioEnabled}
                  className="flex items-center gap-2"
                >
                  <Volume2 size={20} />
                  Test Audio
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => updateConfig({ autoRoll: !config.autoRoll })}
                  className="flex items-center gap-2"
                >
                  {config.autoRoll ? <Pause size={20} /> : <Play size={20} />}
                  {config.autoRoll ? 'Stop Auto' : 'Start Auto'}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearHistory}
                  disabled={rollHistory.length === 0}
                  className="flex items-center gap-2"
                >
                  <RotateCcw size={20} />
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card variant="outline" padding="lg">
                <CardContent>
                  <h3 className="text-lg font-display font-bold text-(--parchment-900) mb-4">
                    Advanced Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-(--parchment-800)">
                          Audio Enabled
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateConfig({ audioEnabled: !config.audioEnabled })}
                        >
                          {config.audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-(--parchment-800)">
                          Auto Roll Interval (ms)
                        </label>
                        <input
                          type="number"
                          value={config.autoRollInterval}
                          onChange={(e) => updateConfig({ autoRollInterval: parseInt(e.target.value) || 3000 })}
                          className="w-full p-2 rounded border border-(--parchment-300) bg-white"
                          min={1000}
                          max={10000}
                          step={500}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-sm text-(--parchment-600)">
                        <h4 className="font-medium text-(--parchment-800) mb-2">Audio Features:</h4>
                        <ul className="space-y-1">
                          <li>• 3D Spatial Audio Positioning</li>
                          <li>• Realistic Collision Sounds</li>
                          <li>• Material-Based Audio Effects</li>
                          <li>• Outcome-Specific Feedback</li>
                          <li>• Theme-Appropriate Sound Libraries</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Dice Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedDice3D
            modifier={config.modifier}
            theme={config.theme}
            diceStyle={config.diceStyle}
            tableStyle={config.tableStyle}
            enableAudio={config.audioEnabled}
            enablePhysics={true}
            enableShadows={true}
            onRoll={handleRollComplete}
            onRollStart={handleRollStart}
            onRollComplete={handleRollComplete}
            onCollision={handleCollision}
          />
        </motion.div>
        
        {/* Current Result Display */}
        <AnimatePresence>
          {currentResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="magical" padding="lg">
                <CardContent>
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-display font-bold text-(--parchment-900)">
                      Latest Roll Result
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-(--color-primary)">
                          {currentResult.finalResult}
                        </div>
                        <div className="text-sm text-(--parchment-600)">Final Result</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-(--parchment-800)">
                          {currentResult.outcome.charAt(0).toUpperCase() + currentResult.outcome.slice(1)}
                        </div>
                        <div className="text-sm text-(--parchment-600)">Outcome</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-(--parchment-800)">
                          {currentResult.rollDuration.toFixed(1)}s
                        </div>
                        <div className="text-sm text-(--parchment-600)">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-(--parchment-800)">
                          {currentResult.collisionCount}
                        </div>
                        <div className="text-sm text-(--parchment-600)">Collisions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && statistics.totalRolls > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card variant="outline" padding="lg">
                <CardContent>
                  <h3 className="text-lg font-display font-bold text-(--parchment-900) mb-4">
                    Roll Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-(--color-primary)">
                        {statistics.totalRolls}
                      </div>
                      <div className="text-sm text-(--parchment-600)">Total Rolls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-(--color-primary)">
                        {statistics.averageRoll}
                      </div>
                      <div className="text-sm text-(--parchment-600)">Average Roll</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-(--nature-500)">
                        {statistics.successRate}%
                      </div>
                      <div className="text-sm text-(--parchment-600)">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-(--parchment-800)">
                        {statistics.averageDuration}s
                      </div>
                      <div className="text-sm text-(--parchment-600)">Avg Duration</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-(--gold-500)">
                        {statistics.partialRate}%
                      </div>
                      <div className="text-sm text-(--parchment-600)">Partial Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-(--danger-500)">
                        {statistics.failureRate}%
                      </div>
                      <div className="text-sm text-(--parchment-600)">Failure Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-(--parchment-800)">
                        {statistics.totalCollisions}
                      </div>
                      <div className="text-sm text-(--parchment-600)">Total Collisions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Roll History */}
        <AnimatePresence>
          {showHistory && rollHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card variant="outline" padding="lg">
                <CardContent>
                  <h3 className="text-lg font-display font-bold text-(--parchment-900) mb-4">
                    Roll History (Last {Math.min(rollHistory.length, 10)})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {rollHistory.slice(0, 10).map((roll, index) => (
                      <motion.div
                        key={roll.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-(--parchment-50) rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Badge
                            variant={
                              roll.result.outcome === 'success' ? 'success' :
                              roll.result.outcome === 'partial' ? 'warning' : 'danger'
                            }
                          >
                            {roll.result.finalResult}
                          </Badge>
                          <span className="text-sm text-(--parchment-700)">
                            {roll.result.dice1} + {roll.result.dice2} 
                            {roll.result.modifier !== 0 && ` + ${roll.result.modifier}`} = {roll.result.finalResult}
                          </span>
                        </div>
                        <div className="text-xs text-(--parchment-600)">
                          {new Date(roll.timestamp).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-(--parchment-600) space-y-2"
        >
          <p>
            Enhanced 3D Dice System • ZimboMate V2 • Built with Three.js, React Three Fiber & Rapier Physics
          </p>
          <p>
            Features: Realistic Physics • 3D Spatial Audio • PBR Materials • Particle Effects • Multi-Theme Support
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Enhanced3DDiceDemo