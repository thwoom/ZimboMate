import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { CharacterSheet } from './components/game/CharacterSheet'
import { DiceRoller } from './components/game/DiceRoller'
import { MovesPanel } from './components/game/MovesPanel'
import { EquipmentPanel } from './components/game/EquipmentPanel'
import { Sparkles, User, Dice6, Scroll, Settings, Package } from 'lucide-react'
import { Card, CardContent, Button, Badge } from './components/ui'

type ActiveTab = 'character' | 'dice' | 'moves' | 'equipment' | 'settings'

// Mock character data for EquipmentPanel
const mockCharacter = {
  name: "Eldara Moonwhisper",
  class: "Wizard",
  level: 5,
  load: { current: 8, max: 12 },
  inventory: [
    {
      id: 'staff-of-power',
      name: 'Staff of Power',
      description: 'A magical staff crackling with arcane energy',
      category: 'weapon',
      weight: 1,
      equipped: true,
      damage: '1d8',
      tags: ['magical', 'two-handed']
    },
    {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores 2d4+2 HP when consumed',
      category: 'consumable',
      weight: 0,
      equipped: false,
      uses: 3
    },
    {
      id: 'spellbook',
      name: 'Arcane Spellbook',
      description: 'Contains prepared spells and magical knowledge',
      category: 'treasure',
      weight: 1,
      equipped: true,
      tags: ['magical', 'spellbook']
    },
    {
      id: 'leather-armor',
      name: 'Leather Armor',
      description: 'Light armor providing basic protection',
      category: 'armor',
      weight: 1,
      equipped: true,
      armor: 1,
      tags: ['worn']
    }
  ]
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('character')
  const [diceModifier, setDiceModifier] = useState(2)

  const tabs = [
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'moves' as const, label: 'Moves', icon: Scroll },
    { id: 'equipment' as const, label: 'Equipment', icon: Package },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ]

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'character':
        return (
          <motion.div
            key="character"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CharacterSheet />
          </motion.div>
        )
      case 'dice':
        return (
          <motion.div
            key="dice"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-2xl mx-auto"
          >
            <DiceRoller 
              modifier={diceModifier}
              onRoll={(result) => {
                console.log('Dice roll result:', result)
              }}
            />
          </motion.div>
        )
      case 'moves':
        return (
          <motion.div
            key="moves"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <MovesPanel 
              characterClass="wizard"
              onMoveSelect={(move) => {
                console.log('Selected move:', move)
                // Switch to dice tab when a move is selected
                setActiveTab('dice')
              }}
            />
          </motion.div>
        )
      case 'equipment':
        return (
          <motion.div
            key="equipment"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <EquipmentPanel
              character={mockCharacter as any}
              onItemEquip={(item) => console.log('Equipped:', item)}
              onItemUnequip={(item) => console.log('Unequipped:', item)}
              onItemUse={(item) => console.log('Used:', item)}
              onItemDrop={(item) => console.log('Dropped:', item)}
              onInventoryUpdate={(inventory) => console.log('Inventory updated:', inventory)}
            />
          </motion.div>
        )
      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card variant="glass" padding="lg">
              <CardContent>
                <div className="text-center space-y-6">
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                  >
                    <Settings 
                      size={32} 
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display mb-2">Settings & Preferences</h2>
                    <p 
                      className="max-w-md mx-auto"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Customize your ZimboMate experience with theme selection, 
                      audio controls, animation preferences, and character management.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Badge variant="default">Theme System ✅</Badge>
                    <Badge variant="secondary">Audio Controls 🔄</Badge>
                    <Badge variant="secondary">Animation Prefs 🔄</Badge>
                    <Badge variant="secondary">Export/Import 🔄</Badge>
                  </div>
                  <div className="pt-4">
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Advanced settings coming in Phase 3! 🚀
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      default:
        return <CharacterSheet />
    }
  }

  return (
    <ThemeProvider>
      <Tooltip.Provider delayDuration={200} skipDelayDuration={300}>
        <div 
          className="min-h-screen transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          {/* Header */}
          <header 
            className="sticky top-0 z-50 glass-surface border-b"
            style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}
          >
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles 
                      className="w-6 h-6" 
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </motion.div>
                  <div>
                    <h1 className="font-display text-xl">ZimboMate V2</h1>
                    <p 
                      className="text-sm" 
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Dungeon World Companion
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ThemeToggle />
                </motion.div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav 
            className="sticky top-[73px] z-40 glass-surface border-b"
            style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.1 }}
          >
            <div className="container mx-auto px-6">
              <div className="flex gap-1 py-2 overflow-x-auto">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Button
                        variant={isActive ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className="relative whitespace-nowrap"
                      >
                        <Icon size={16} />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer 
            className="mt-16 glass-surface border-t"
            style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}
          >
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <User 
                    className="w-5 h-5" 
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span 
                    className="text-sm" 
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    ZimboMate V2 • Built with React 19 & Tailwind v4
                  </span>
                </motion.div>
                <motion.div 
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  Phase 2: Core UI & Game Features Complete ✨
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