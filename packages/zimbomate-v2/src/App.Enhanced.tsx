import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { NavigationProvider, useNavigation } from './components/ui/NavigationRouter'
import { AuthProvider, useAuth } from './components/ui/AuthContext'
import { EnhancedRollResultsToast } from './components/ui/EnhancedRollResultsToast'
import { useEnhancedRollResults, createEnhancedBasicRoll, createEnhancedAttributeRoll, createEnhancedDamageRoll, createEnhancedMoveRoll } from './hooks/useEnhancedRollResults'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { CharacterSheet } from './components/game/CharacterSheet'
import { DiceRoller } from './components/game/DiceRoller'
import { MovesPanel } from './components/game/MovesPanel'
import { EquipmentPanel } from './components/game/EquipmentPanel'
import { SessionManager } from './components/game/SessionManager'
import { SessionToolsPanel } from './components/game/SessionTools'
import { BondTracker } from './components/game/BondTracker'
import { AlignmentXPTracker } from './components/game/AlignmentXPTracker'
import { DebilityTracker } from './components/game/DebilityTracker'
import { ContextAwareSystem } from './components/game/ContextAwareSystem'
import { SessionFlowManager } from './components/game/SessionFlowManager'
import { CommandPalette } from './components/ui/CommandPalette'
import { KeyboardShortcutsPanel } from './components/ui/KeyboardShortcutsPanel'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor'
import { AccessibilityChecker } from './components/ui/AccessibilityChecker'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { HelpSystem } from './components/ui/HelpSystem'
import { Sparkles, User, Dice6, Scroll, Settings, Package, Users, NotebookPen, MapPin, FolderOpen, ArrowLeft } from 'lucide-react'
import { Card, CardContent, Button, Badge } from './components/ui'
import { CampaignPanel } from './components/game/CampaignPanel'
import { FileManagementPanel } from './components/game/FileManagementPanel'
import { CombatPanel } from './components/game/CombatPanel'
import { XPProgressTracker } from './components/game/XPProgressTracker'
import { FileOperation } from './fileManagementMockData'
import { useCommandPalette, useNavigationShortcuts, useGlobalShortcuts, useDiceShortcuts } from './hooks/useKeyboardShortcuts'
import './utils/initializeMockData'

// Mock character data
const mockCharacter = {
  id: 'char-1',
  name: "Eldara Moonwhisper",
  class: "wizard",
  level: 5,
  hp: { current: 18, max: 25 },
  stats: {
    STR: { value: 12, modifier: 1 },
    DEX: { value: 14, modifier: 2 },
    CON: { value: 13, modifier: 1 },
    INT: { value: 18, modifier: 4 },
    WIS: { value: 16, modifier: 3 },
    CHA: { value: 15, modifier: 2 }
  },
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
    }
  ]
}

const AppContent: React.FC = () => {
  const { currentRoute, navigate, goBack, canGoBack } = useNavigation()
  const { user } = useAuth()
  const { currentResult, showRollResult, clearResult, applyConsequences } = useEnhancedRollResults()
  const [diceModifier, setDiceModifier] = useState(2)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const tabs = [
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'moves' as const, label: 'Moves', icon: Scroll },
    { id: 'equipment' as const, label: 'Equipment', icon: Package },
    { id: 'combat' as const, label: 'Combat', icon: Sparkles },
    { id: 'session-tools' as const, label: 'Session Tools', icon: NotebookPen },
    { id: 'campaign' as const, label: 'Campaign', icon: MapPin },
    { id: 'file-management' as const, label: 'File Management', icon: FolderOpen },
    { id: 'multiplayer' as const, label: 'Multiplayer', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ]

  // Enhanced dice roll handler with game logic integration
  const handleDiceRoll = (dice: number[], modifier: number = 0, context?: { 
    type: string; 
    name?: string; 
    attribute?: string;
    moveId?: string;
    targetId?: string;
    combatContext?: boolean;
  }) => {
    let rollResult
    let moveContext
    
    if (context?.type === 'attribute' && context.attribute) {
      rollResult = createEnhancedAttributeRoll(context.attribute, dice, modifier)
    } else if (context?.type === 'damage' && context.name) {
      rollResult = createEnhancedDamageRoll(context.name, dice)
    } else if (context?.type === 'move' && context.name) {
      rollResult = createEnhancedMoveRoll(context.name, dice, modifier, context.moveId)
      moveContext = {
        moveId: context.moveId || context.name.toLowerCase().replace(/\s+/g, '-'),
        moveName: context.name,
        targetId: context.targetId,
        combatContext: context.combatContext
      }
    } else {
      rollResult = createEnhancedBasicRoll(dice, modifier)
    }
    
    showRollResult(rollResult, mockCharacter.id, moveContext)
  }

  // Command palette integration
  const { registerCommandPalette, setIsOpen } = useCommandPalette()
  
  React.useEffect(() => {
    registerCommandPalette(
      () => setCommandPaletteOpen(true),
      () => setCommandPaletteOpen(false)
    )
  }, [registerCommandPalette])

  React.useEffect(() => {
    setIsOpen(commandPaletteOpen)
  }, [commandPaletteOpen, setIsOpen])

  // Navigation shortcuts
  useNavigationShortcuts((tabId) => {
    navigate(tabId as any)
  })

  // Dice shortcuts with enhanced feedback
  useDiceShortcuts((stat) => {
    if (stat) {
      const statModifiers = {
        strength: 1, dexterity: 2, constitution: 1,
        intelligence: 4, wisdom: 3, charisma: 2
      }
      const modifier = statModifiers[stat as keyof typeof statModifiers] || 0
      setDiceModifier(modifier)
      
      // Auto-roll when using keyboard shortcut
      const dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
      handleDiceRoll(dice, modifier, { type: 'attribute', attribute: stat })
    }
    navigate('dice')
  }, currentRoute === 'dice' || currentRoute === 'character')

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'character':
        return (
          <motion.div key="character" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-8">
              <CharacterSheet />
              <XPProgressTracker />
              <ContextAwareSystem context="character" />
              <BondTracker />
              <AlignmentXPTracker />
              <DebilityTracker />
            </div>
          </motion.div>
        )
      case 'dice':
        return (
          <motion.div key="dice" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <DiceRoller 
                modifier={diceModifier}
                onRoll={(result) => {
                  handleDiceRoll(result.dice, result.modifier)
                }}
              />
              <ContextAwareSystem context="dice" compact />
            </div>
          </motion.div>
        )
      case 'moves':
        return (
          <motion.div key="moves" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-6">
              <MovesPanel 
                character={mockCharacter as any}
                characterClass="wizard"
                onMoveSelect={(move) => {
                  console.log('Selected move:', move)
                  navigate('dice')
                }}
                onRollComplete={(result) => {
                  handleDiceRoll(result.dice, result.modifier, { type: 'move', name: result.moveName })
                }}
              />
              <ContextAwareSystem context="moves" compact />
            </div>
          </motion.div>
        )
      case 'equipment':
        return (
          <motion.div key="equipment" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-6">
              <EquipmentPanel
                character={mockCharacter as any}
                onItemEquip={(item) => console.log('Equipped:', item)}
                onItemUnequip={(item) => console.log('Unequipped:', item)}
                onItemUse={(item) => console.log('Used:', item)}
                onItemDrop={(item) => console.log('Dropped:', item)}
                onInventoryUpdate={(inventory) => console.log('Inventory updated:', inventory)}
              />
              <ContextAwareSystem context="equipment" compact />
            </div>
          </motion.div>
        )
      case 'combat':
        return (
          <motion.div key="combat" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-6">
              <CombatPanel
                onRollDamage={(weaponName, dice) => {
                  handleDiceRoll(dice, 0, { type: 'damage', name: weaponName })
                }}
                onRollMove={(moveName, moveId, targetId) => {
                  const dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
                  handleDiceRoll(dice, diceModifier, { 
                    type: 'move', 
                    name: moveName, 
                    moveId,
                    targetId,
                    combatContext: true 
                  })
                }}
              />
              <ContextAwareSystem context="combat" compact />
            </div>
          </motion.div>
        )
      case 'session-tools':
        return (
          <motion.div key="session-tools" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-6">
              <SessionFlowManager />
              <SessionToolsPanel />
              <ContextAwareSystem context="session" compact />
            </div>
          </motion.div>
        )
      case 'campaign':
        return (
          <motion.div key="campaign" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="space-y-6">
              <CampaignPanel />
              <ContextAwareSystem context="campaign" compact />
            </div>
          </motion.div>
        )
      case 'settings':
        return (
          <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            <div className="max-w-4xl mx-auto space-y-8">
              <KeyboardShortcutsPanel />
              <PerformanceMonitor />
              <AccessibilityChecker />
              <HelpSystem />
            </div>
          </motion.div>
        )
      default:
        return <CharacterSheet />
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-surface border-b" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {canGoBack && (
                  <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
                    <ArrowLeft size={16} />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                  <h1 className="text-xl font-display font-bold">ZimboMate V2</h1>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = currentRoute === tab.id
                  return (
                    <Tooltip.Root key={tab.id}>
                      <Tooltip.Trigger asChild>
                        <Button
                          variant={isActive ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => navigate(tab.id)}
                          className="gap-2"
                        >
                          <Icon size={16} />
                          <span className="hidden lg:inline">{tab.label}</span>
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content side="bottom" className="glass-surface p-2 rounded text-xs">
                        {tab.label}
                      </Tooltip.Content>
                    </Tooltip.Root>
                  )
                })}
              </nav>
            </div>

            {/* User and Controls */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Welcome,</span>
                  <span className="font-medium">{user.name}</span>
                </div>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="gap-2"
              >
                <span className="text-xs">⌘K</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Enhanced Roll Results Toast */}
      <EnhancedRollResultsToast
        result={currentResult}
        onClose={clearResult}
        onApplyConsequences={applyConsequences}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NavigationProvider>
            <Tooltip.Provider delayDuration={200} skipDelayDuration={300}>
              <AppContent />
            </Tooltip.Provider>
          </NavigationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App