/**
 * Phase 3.2 Complete Demo App - Showcasing all advanced game features
 * Demonstrates Advanced Move System, Equipment 3D Previews, and Multiplayer Features
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './components/ui'
import { MovesPanel } from './components/game/MovesPanel'
import { Equipment3DViewer } from './components/game/Equipment3DViewer'
import { SessionManager } from './components/game/SessionManager'
import { 
  Zap, 
  Sword, 
  Users, 
  Sparkles, 
  Crown,
  Target,
  Eye,
  Settings
} from 'lucide-react'

// Mock data
const mockCharacter = {
  id: 'char-1',
  name: 'Theron the Wise',
  class: 'wizard',
  level: 5,
  hp: { current: 18, max: 25 },
  stats: {
    strength: { value: 12, modifier: 1 },
    dexterity: { value: 14, modifier: 2 },
    constitution: { value: 13, modifier: 1 },
    intelligence: { value: 18, modifier: 4 },
    wisdom: { value: 16, modifier: 3 },
    charisma: { value: 15, modifier: 2 }
  },
  inventory: []
}

const mockEquipment = [
  {
    id: 'sword-1',
    name: 'Elven Longsword',
    category: 'weapon' as const,
    description: 'A beautifully crafted elven blade that gleams with inner light',
    weight: 3,
    value: 150,
    tags: ['close', 'forceful'],
    damage: '1d8+1',
    equipped: false,
    quantity: 1
  },
  {
    id: 'armor-1',
    name: 'Chainmail Armor',
    category: 'armor' as const,
    description: 'Well-maintained chainmail that provides excellent protection',
    weight: 15,
    value: 100,
    tags: ['armor', 'worn'],
    armorValue: 2,
    equipped: true,
    quantity: 1
  },
  {
    id: 'potion-1',
    name: 'Healing Potion',
    category: 'consumable' as const,
    description: 'A red liquid that glows with healing magic',
    weight: 0.5,
    value: 50,
    tags: ['healing'],
    uses: { current: 3, max: 3 },
    equipped: false,
    quantity: 3
  }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('moves')
  const [selectedTheme, setSelectedTheme] = useState<'fantasy' | 'dark' | 'light'>('fantasy')
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [selectedEquipment, setSelectedEquipment] = useState(mockEquipment[0])

  const handleMoveSelect = (move: any) => {
    console.log('Move selected:', move)
  }

  const handleRollComplete = (result: any) => {
    console.log('Roll completed:', result)
  }

  const handleSessionJoined = (session: any) => {
    setCurrentSession(session)
    setShowSessionManager(false)
    console.log('Joined session:', session)
  }

  const tabs = [
    { id: 'moves', label: 'Advanced Moves', icon: Zap },
    { id: 'equipment', label: '3D Equipment', icon: Sword },
    { id: 'multiplayer', label: 'Multiplayer', icon: Users }
  ]

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-parchment-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Crown size={64} className="text-gold-500 magical-glow" />
            </motion.div>
            
            <h1 className="text-display-lg mb-4">
              ZimboMate V2 - Phase 3.2 Complete
            </h1>
            
            <p className="text-body-lg text-parchment-700 max-w-3xl mx-auto mb-6">
              Experience the complete advanced game features: Intelligent move system with contextual suggestions, 
              immersive 3D equipment visualization, and real-time multiplayer functionality.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="success" className="gap-2">
                <Sparkles size={14} />
                Advanced Move System
              </Badge>
              <Badge variant="success" className="gap-2">
                <Eye size={14} />
                3D Equipment Previews
              </Badge>
              <Badge variant="success" className="gap-2">
                <Users size={14} />
                Multiplayer Ready
              </Badge>
            </div>

            {/* Theme Selection */}
            <div className="flex justify-center gap-2">
              {(['fantasy', 'dark', 'light'] as const).map(theme => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTheme(theme)}
                  className="capitalize"
                >
                  {theme}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Session Status */}
          {currentSession && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="magical" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={20} className="text-green-500" />
                      <div>
                        <h3 className="font-medium">Connected to: {currentSession.name}</h3>
                        <p className="text-sm text-(--color-text-secondary)">
                          {currentSession.players?.length || 0} players online
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSession(null)}
                    >
                      Leave Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="parchment" padding="lg">
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                {/* Tab Navigation */}
                <Tabs.List className="flex gap-1 p-1 bg-(--parchment-200) rounded-lg mb-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <Tabs.Trigger
                        key={tab.id}
                        value={tab.id}
                        asChild
                      >
                        <motion.button
                          className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all relative ${
                            isActive 
                              ? 'bg-(--color-surface) text-(--parchment-900) shadow-sm' 
                              : 'text-(--parchment-700) hover:text-(--parchment-900) hover:bg-(--parchment-100)'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon size={18} />
                          {tab.label}
                          
                          {isActive && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-primary)"
                              layoutId="activePhase3Tab"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      </Tabs.Trigger>
                    )
                  })}
                </Tabs.List>

                {/* Advanced Moves Tab */}
                <Tabs.Content value="moves" asChild>
                  <motion.div
                    key="moves-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <MovesPanel
                          character={mockCharacter}
                          characterClass="wizard"
                          onMoveSelect={handleMoveSelect}
                          onRollComplete={handleRollComplete}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <Card variant="glass" padding="md">
                          <CardHeader>
                            <CardTitle className="text-lg">Features</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Target size={16} className="text-green-500" />
                                <span>Contextual move suggestions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-500" />
                                <span>3D dice integration</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye size={16} className="text-purple-500" />
                                <span>Particle effect outcomes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap size={16} className="text-yellow-500" />
                                <span>Smart move filtering</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card variant="outline" padding="md">
                          <CardContent>
                            <h4 className="font-medium mb-2">Character Status</h4>
                            <div className="space-y-2 text-sm">
                              <div>Health: {mockCharacter.hp.current}/{mockCharacter.hp.max}</div>
                              <div>Level: {mockCharacter.level}</div>
                              <div>Class: {mockCharacter.class}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </Tabs.Content>

                {/* 3D Equipment Tab */}
                <Tabs.Content value="equipment" asChild>
                  <motion.div
                    key="equipment-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-display mb-4">Equipment Gallery</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {mockEquipment.map(item => (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Equipment3DViewer
                                item={item}
                                width={250}
                                height={200}
                                autoRotate={selectedEquipment.id === item.id}
                                onInspect={() => setSelectedEquipment(item)}
                                className={`cursor-pointer transition-all ${
                                  selectedEquipment.id === item.id 
                                    ? 'ring-2 ring-(--color-primary)/50' 
                                    : ''
                                }`}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display mb-4">Selected Item</h3>
                        <Equipment3DViewer
                          item={selectedEquipment}
                          width={400}
                          height={300}
                          autoRotate={true}
                          showControls={true}
                        />
                        
                        <Card variant="outline" padding="md" className="mt-4">
                          <CardContent>
                            <h4 className="font-medium mb-2">{selectedEquipment.name}</h4>
                            <p className="text-sm text-(--color-text-secondary) mb-3">
                              {selectedEquipment.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Weight: {selectedEquipment.weight} lbs</div>
                              <div>Value: {selectedEquipment.value} gp</div>
                              <div>Category: {selectedEquipment.category}</div>
                              <div>Quantity: {selectedEquipment.quantity}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                </Tabs.Content>

                {/* Multiplayer Tab */}
                <Tabs.Content value="multiplayer" asChild>
                  <motion.div
                    key="multiplayer-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-display mb-4">Multiplayer Features</h3>
                      
                      {!currentSession ? (
                        <div className="space-y-4">
                          <p className="text-(--color-text-secondary) mb-6">
                            Connect with friends for shared adventures and real-time dice rolling
                          </p>
                          
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => setShowSessionManager(true)}
                            className="gap-2 magical-glow"
                          >
                            <Users size={20} />
                            Start Multiplayer Session
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Card variant="magical" padding="lg">
                            <CardContent>
                              <h4 className="font-medium mb-4">Session: {currentSession.name}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-(--color-primary)">
                                    {currentSession.players?.length || 1}
                                  </div>
                                  <div className="text-sm text-(--color-text-secondary)">Players</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-500">
                                    ✓
                                  </div>
                                  <div className="text-sm text-(--color-text-secondary)">Connected</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-500">
                                    ∞
                                  </div>
                                  <div className="text-sm text-(--color-text-secondary)">Sync Active</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {[
                          { icon: Target, title: 'Shared Rolls', desc: 'Real-time dice sharing' },
                          { icon: Users, title: 'Session Sync', desc: 'Synchronized game state' },
                          { icon: Sparkles, title: 'Live Effects', desc: 'Shared particle effects' },
                          { icon: Settings, title: 'Host Controls', desc: 'Session management' }
                        ].map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card variant="glass" padding="md" className="text-center h-full">
                              <CardContent>
                                <feature.icon size={32} className="text-(--color-primary) mx-auto mb-3" />
                                <h4 className="font-medium mb-2">{feature.title}</h4>
                                <p className="text-sm text-(--color-text-secondary)">
                                  {feature.desc}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Tabs.Content>
              </Tabs.Root>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <p className="text-ui-small text-parchment-600">
              Phase 3.2 Complete - Advanced Game Features Ready for Epic Adventures! ✨
            </p>
          </motion.div>
        </div>

        {/* Session Manager Modal */}
        <SessionManager
          isVisible={showSessionManager}
          onClose={() => setShowSessionManager(false)}
          onSessionJoined={handleSessionJoined}
        />
      </div>
    </ThemeProvider>
  )
}