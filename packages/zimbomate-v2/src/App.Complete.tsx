import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
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
import { Sparkles, User, Dice6, Scroll, Settings, Package, Users, NotebookPen, MapPin, FolderOpen } from 'lucide-react'
import { Card, CardContent, Button, Badge, ThemeComponentShowcase } from './components/ui'
import { DemoQuickAccess } from './components/ui/DemoQuickAccess'
import { DemoModal } from './components/ui/DemoModal'
import { CampaignPanel } from './components/game/CampaignPanel'
import { FileManagementPanel } from './components/game/FileManagementPanel'
import { FileOperation } from './fileManagementMockData'
import { useCommandPalette, useNavigationShortcuts, useGlobalShortcuts, useDiceShortcuts } from './hooks/useKeyboardShortcuts'
import './utils/initializeMockData' // Initialize mock data for development
import { ButtonDebugger } from './components/ui/ButtonDebugger'
import { 
  diagnoseAllButtons, 
  enableButtonDebugging, 
  autoFixAllButtons, 
  generateButtonReport,
  type ButtonDiagnostic 
} from './utils/buttonUtils'
import { BugAntIcon, WrenchScrewdriverIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type ActiveTab = 'character' | 'dice' | 'moves' | 'equipment' | 'session-tools' | 'campaign' | 'file-management' | 'multiplayer' | 'settings' | 'button-debug'

// Mock character data for EquipmentPanel and MovesPanel
const mockCharacter = {
  id: 'char-1',
  name: "Eldara Moonwhisper",
  class: "wizard",
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
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; title: string } | null>(null)
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)
  const [buttonDiagnostics, setButtonDiagnostics] = useState<ButtonDiagnostic[]>([])
  const [debuggingEnabled, setDebuggingEnabled] = useState(false)
  const [autoFixCount, setAutoFixCount] = useState(0)

  const tabs = [
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'moves' as const, label: 'Moves', icon: Scroll },
    { id: 'equipment' as const, label: 'Equipment', icon: Package },
    { id: 'session-tools' as const, label: 'Session Tools', icon: NotebookPen },
    { id: 'campaign' as const, label: 'Campaign', icon: MapPin },
    { id: 'file-management' as const, label: 'File Management', icon: FolderOpen },
    { id: 'multiplayer' as const, label: 'Multiplayer', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'button-debug' as const, label: 'Button Debug', icon: WrenchScrewdriverIcon }
  ]

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
    setActiveTab(tabId as ActiveTab)
  })

  // Global shortcuts
  useGlobalShortcuts({
    onToggleTheme: () => {
      // Theme toggle logic would go here
      console.log('Toggle theme')
    }
  })

  // Dice shortcuts
  useDiceShortcuts((stat) => {
    if (stat) {
      // Set modifier based on stat and switch to dice tab
      const statModifiers = {
        strength: 1,
        dexterity: 2,
        constitution: 1,
        intelligence: 4,
        wisdom: 3,
        charisma: 2
      }
      setDiceModifier(statModifiers[stat as keyof typeof statModifiers] || 0)
    }
    setActiveTab('dice')
  }, activeTab === 'dice' || activeTab === 'character')

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
            <div className="space-y-8">
              <CharacterSheet />
              <ContextAwareSystem context="character" />
              <BondTracker />
              <AlignmentXPTracker />
              <DebilityTracker />
            </div>
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
            <div className="space-y-6">
              <DiceRoller 
                modifier={diceModifier}
                onRoll={(result) => {
                  console.log('Dice roll result:', result)
                }}
              />
              <ContextAwareSystem context="dice" compact />
            </div>
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
            <div className="space-y-6">
              <MovesPanel 
                character={mockCharacter as any}
                characterClass="wizard"
                onMoveSelect={(move) => {
                  console.log('Selected move:', move)
                  // Switch to dice tab when a move is selected
                  setActiveTab('dice')
                }}
                onRollComplete={(result) => {
                  console.log('Roll completed:', result)
                }}
              />
              <ContextAwareSystem context="moves" compact />
            </div>
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
      case 'session-tools':
        return (
          <motion.div
            key="session-tools"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="space-y-6">
              <SessionFlowManager />
              <SessionToolsPanel />
              <ContextAwareSystem context="session" compact />
            </div>
          </motion.div>
        )
      case 'campaign':
        return (
          <motion.div
            key="campaign"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="space-y-6">
              <CampaignPanel />
              <ContextAwareSystem context="campaign" compact />
            </div>
          </motion.div>
        )
      case 'file-management':
        return (
          <motion.div
            key="file-management"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="space-y-6">
              <FileManagementPanel
                onFileOperation={(operation: FileOperation, data: any) => {
                  console.log('File operation:', operation, data)
                  // Handle file operations here
                  switch (operation) {
                    case FileOperation.IMPORT:
                      console.log('Importing files:', data)
                      break
                    case FileOperation.EXPORT:
                      console.log('Exporting data:', data)
                      break
                    case FileOperation.BACKUP:
                      console.log('Creating backup:', data)
                      break
                    case FileOperation.RESTORE:
                      console.log('Restoring backup:', data)
                      break
                    case FileOperation.DELETE:
                      console.log('Deleting files:', data)
                      break
                    case FileOperation.RENAME:
                      console.log('Renaming file:', data)
                      break
                    case FileOperation.DUPLICATE:
                      console.log('Duplicating file:', data)
                      break
                    default:
                      console.log('Unknown operation:', operation, data)
                  }
                }}
              />
            </div>
          </motion.div>
        )
      case 'multiplayer':
        return (
          <motion.div
            key="multiplayer"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              <Card variant="magical" padding="lg">
                <CardContent>
                  <div className="text-center space-y-6">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                    >
                      <Users 
                        size={32} 
                        style={{ color: 'var(--color-primary)' }}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display mb-2">Multiplayer Sessions</h2>
                      <p 
                        className="max-w-md mx-auto"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Connect with friends for shared adventures and real-time dice rolling.
                        Phase 3.2 Advanced Features Complete!
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Badge variant="default">Real-time Dice Sharing ✅</Badge>
                      <Badge variant="default">Session Management ✅</Badge>
                      <Badge variant="default">WebSocket Integration ✅</Badge>
                      <Badge variant="secondary">Voice Chat 🔄</Badge>
                    </div>
                    {!currentSession ? (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setShowSessionManager(true)}
                        className="gap-2 magical-glow"
                      >
                        <Users size={20} />
                        Start Multiplayer Session
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-100 rounded-lg">
                          <h4 className="font-medium text-green-800">Connected to: {currentSession.name}</h4>
                          <p className="text-sm text-green-600">
                            {currentSession.players?.length || 1} players online
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentSession(null)}
                        >
                          Leave Session
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Keyboard Shortcuts Panel */}
              <KeyboardShortcutsPanel />

              {/* Performance Monitor */}
              <PerformanceMonitor />

              {/* Accessibility Checker */}
              <AccessibilityChecker />

              {/* Help System */}
              <HelpSystem />

              {/* Theme & Component Showcase */}
              <Card variant="magical" padding="lg">
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                      >
                        <Sparkles 
                          className="w-5 h-5" 
                          style={{ color: 'var(--color-primary)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-display">Theme & Component Showcase</h3>
                        <p 
                          className="text-sm" 
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          Explore themes, components, and styling utilities for development
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setThemeShowcaseOpen(true)}
                        className="gap-2"
                      >
                        <Sparkles size={16} />
                        Open Theme Showcase
                      </Button>
                      <Badge variant="secondary">Development Tool</Badge>
                    </div>
                    
                    <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <p>• Preview all theme variants (Fantasy, Dark, Light, Sci-Fi)</p>
                      <p>• Explore complete color system and typography</p>
                      <p>• Test all UI components and their variants</p>
                      <p>• View layout examples and patterns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Quick Access Section */}
              <Card variant="magical" padding="lg">
                <CardContent>
                  <DemoQuickAccess 
                    onDemoNavigate={handleDemoNavigate}
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )
      case 'button-debug':
        return (
          <motion.div
            key="button-debug"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Button Debug Control Panel */}
              <Card variant="magical" padding="lg">
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-display-md mb-2">ZimboMate v2 Button Debugger</h2>
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        Diagnose and fix button functionality issues throughout the application
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        variant="cyber" 
                        onClick={() => {
                          const results = diagnoseAllButtons()
                          setButtonDiagnostics(results)
                          console.log('🔍 Button diagnosis completed:', results)
                        }}
                      >
                        <BugAntIcon size={16} />
                        Run Diagnosis
                      </Button>
                      
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          enableButtonDebugging()
                          setDebuggingEnabled(true)
                          console.log('🔧 Button debugging enabled')
                        }}
                        disabled={debuggingEnabled}
                      >
                        <WrenchScrewdriverIcon size={16} />
                        {debuggingEnabled ? 'Debugging Active' : 'Enable Debug Mode'}
                      </Button>
                      
                      <Button 
                        variant="magical" 
                        onClick={() => {
                          const fixed = autoFixAllButtons()
                          setAutoFixCount(prev => prev + fixed)
                          console.log(`🔧 Auto-fixed ${fixed} button issues`)
                        }}
                      >
                        <WrenchScrewdriverIcon size={16} />
                        Auto-Fix Issues
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const report = generateButtonReport()
                          console.log(report)
                          
                          // Download report
                          const blob = new Blob([report], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'zimbomate-v2-button-report.txt'
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <DocumentTextIcon size={16} />
                        Download Report
                      </Button>
                    </div>
                    
                    {/* Status Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'var(--nature-500)' }}>
                          {buttonDiagnostics.filter(d => d.working).length}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Working Buttons
                        </div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'var(--red-500)' }}>
                          {buttonDiagnostics.filter(d => !d.working).length}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Issues Found
                        </div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'var(--yellow-500)' }}>
                          {autoFixCount}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Auto-Fixed
                        </div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                          {debuggingEnabled ? '🔧' : '💤'}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Debug Mode
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Interactive Test Suite */}
              <ButtonDebugger 
                onTestResult={(testName, success, details) => {
                  console.log(`✅ Test result: ${testName} - ${success ? 'SUCCESS' : 'FAILED'}`, details)
                }}
              />
              
              {/* Console Commands Help */}
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Console Commands</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                      <div>
                        <code style={{ color: 'var(--color-primary)' }}>window.ZimboMate.debugButtons()</code>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Enable visual debugging</p>
                      </div>
                      <div>
                        <code style={{ color: 'var(--color-primary)' }}>window.ZimboMate.fixButtons()</code>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Auto-fix all issues</p>
                      </div>
                      <div>
                        <code style={{ color: 'var(--color-primary)' }}>window.ZimboMate.buttonReport()</code>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Generate report</p>
                      </div>
                      <div>
                        <code style={{ color: 'var(--color-primary)' }}>window.ZimboMate.diagnoseButtons()</code>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Get diagnostics</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )
      default:
        return <CharacterSheet />
    }
  }

  const handleDemoNavigate = (demoId: string, demoTitle: string) => {
    setSelectedDemo({ id: demoId, title: demoTitle })
    setDemoModalOpen(true)
  }

  const handleCloseDemoModal = () => {
    setDemoModalOpen(false)
    setSelectedDemo(null)
  }

  const handleSessionJoined = (session: any) => {
    setCurrentSession(session)
    setShowSessionManager(false)
    console.log('Joined session:', session)
  }

  return (
    <ErrorBoundary>
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
                  Phase 4D: Advanced File Management System Complete ✨
                </motion.div>
              </div>
            </div>
          </footer>

          {/* Demo Modal */}
          <DemoModal
            isOpen={demoModalOpen}
            onClose={handleCloseDemoModal}
            demoId={selectedDemo?.id || null}
            demoTitle={selectedDemo?.title}
          />

          {/* Theme Component Showcase */}
          <ThemeComponentShowcase
            isOpen={themeShowcaseOpen}
            onClose={() => setThemeShowcaseOpen(false)}
          />

          {/* Command Palette */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onNavigate={(tabId) => {
              setActiveTab(tabId as ActiveTab)
              setCommandPaletteOpen(false)
            }}
            onAction={(actionId) => {
              console.log('Command palette action:', actionId)
              // Handle various actions here
              switch (actionId) {
                case 'quick-roll-2d6':
                  // Trigger dice roll
                  break
                case 'heal-character':
                  // Heal character
                  break
                case 'new-note':
                  // Create new note
                  break
                // Add more actions as needed
              }
            }}
          />

          {/* Session Manager Modal */}
          <SessionManager
            isVisible={showSessionManager}
            onClose={() => setShowSessionManager(false)}
            onSessionJoined={handleSessionJoined}
          />
        </div>
        </Tooltip.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App