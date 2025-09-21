import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { CharacterSheet } from './components/game/CharacterSheet'
import { StatRoller } from './components/game/StatRoller'
import { UnifiedRollSystem } from './components/dice/UnifiedRollSystem'
import { ChronicleProvider } from './components/chronicle/ChronicleProvider'
import { SessionManager } from './components/game/SessionManager'
import { AlignmentXPTracker } from './components/game/AlignmentXPTracker'
import { DebilityTracker } from './components/game/DebilityTracker'
import { ContextAwareSystem } from './components/game/ContextAwareSystem'
import { CommandPalette } from './components/ui/CommandPalette'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { Sparkles, User, Dice6, Settings, NotebookPen, Play } from 'lucide-react'
import { Card, CardContent, Button, Badge, ThemeComponentShowcase } from './components/ui'
import { DemoModal } from './components/ui/DemoModal'
import { DiceHistorySidebar } from './components/dice/DiceHistorySidebar'
import { QuickRollZones } from './components/dice/QuickRollZones'
import { CharacterBuilder } from './components/game/creation/CharacterBuilder'
import { PlayTab } from './components/game/PlayTab'
import { GameManagementTab } from './components/game/GameManagementTab'
import { SettingsPanel } from './components/ui/SettingsPanel'
import { useCharacterStore } from './stores/characterStore'
import { useCommandPalette, useNavigationShortcuts, useGlobalShortcuts, useDiceShortcuts } from './hooks/useKeyboardShortcuts'
import { useDiceKeyboardShortcuts } from './hooks/useDiceKeyboardShortcuts'
import './utils/initializeMockData' // Initialize mock data for development
import { ButtonDebugger } from './components/ui/ButtonDebugger'
import {
  diagnoseAllButtons,
  enableButtonDebugging,
  autoFixAllButtons,
  generateButtonReport,
  type ButtonDiagnostic
} from './utils/buttonUtils'
import { BugAntIcon, WrenchScrewdriverIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type ActiveTab = 'play' | 'character' | 'dice' | 'game-management' | 'settings' | 'button-debug'


const App: React.FC = () => {
  const { characters, getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('play')
  const [showCharacterBuilder, setShowCharacterBuilder] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<{ id: string; title: string } | null>(null)
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)
  const [buttonDiagnostics, setButtonDiagnostics] = useState<ButtonDiagnostic[]>([])
  const [debuggingEnabled, setDebuggingEnabled] = useState(false)
  const [autoFixCount, setAutoFixCount] = useState(0)

  // Dice sidebar state
  const [diceHistoryCollapsed, setDiceHistoryCollapsed] = useState(false)

  const tabs = [
    { id: 'play' as const, label: 'Play', icon: Play, featured: true },
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'game-management' as const, label: 'Game Management', icon: NotebookPen, description: 'Chronicle, Campaign, Monsters & More' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, enhanced: true },
    ...(process.env.NODE_ENV === 'development' ? [{ id: 'button-debug' as const, label: 'Button Debug', icon: WrenchScrewdriverIcon }] : [])
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

  // Dice shortcuts (legacy system)
  useDiceShortcuts((_stat) => {
    setActiveTab('dice')
  }, activeTab === 'dice' || activeTab === 'character')

  // New advanced dice keyboard shortcuts
  useDiceKeyboardShortcuts({
    characterId: 'eldara-moonwhisper', // TODO: Use actual active character ID
    enabled: true,
    modifierKey: 'none' // Direct key presses for fast gameplay
  })

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
      case 'play':
        return (
          <motion.div
            key="play"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div>
              <PlayTab />
            </div>
          </motion.div>
        )
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
              {characters.length === 0 || showCharacterBuilder ? (
                <div className="space-y-4">
                  {characters.length > 0 && (
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Create New Character</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCharacterBuilder(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <CharacterBuilder onFinished={() => setShowCharacterBuilder(false)} />
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCharacterBuilder(true)}
                    >
                      Create Character
                    </Button>
                  </div>
                  <CharacterSheet />
                </>
              )}
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
              <UnifiedRollSystem
                characterId="eldara-moonwhisper"
                layout="inline"
                showHistory={true}
                showQuickRolls={true}
                showCustomRolls={true}
                className="max-w-full"
              />

              {/* Chronicle-Enabled Stat Rolling */}
              <StatRoller
                characterName="Eldara Moonwhisper"
                statModifiers={{
                  STR: 1,
                  DEX: 2,
                  CON: 1,
                  INT: 4,
                  WIS: 3,
                  CHA: 2
                }}
                onStatRoll={(stat, result) => {
                  console.log(`${stat} roll result:`, result)
                }}
              />

              <ContextAwareSystem context="dice" compact />
            </div>
          </motion.div>
        )
      case 'game-management':
        return (
          <motion.div
            key="game-management"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <GameManagementTab />
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
            <SettingsPanel onDemoNavigate={handleDemoNavigate} />
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
        return (
          <motion.div
            key="play"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <PlayTab />
          </motion.div>
        )
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
    setShowSessionManager(false)
    console.log('Joined session:', session)
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChronicleProvider defaultEnabled={true}>
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
                        className={`relative whitespace-nowrap ${
                          tab.featured ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                        }`}
                        title={tab.description || tab.label}
                      >
                        <Icon size={16} />
                        {tab.label}
                        {tab.featured && !isActive && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            ★
                          </Badge>
                        )}
                        {tab.enhanced && !isActive && (
                          <Badge variant="default" className="ml-1 text-xs">
                            ✨
                          </Badge>
                        )}
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

          {/* Main Content Layout with Sidebar */}
          <div className="flex h-screen">
            {/* Dice History Sidebar */}
            <DiceHistorySidebar
              characterId={activeCharacter?.id || "fallback-character-id"}
              collapsed={diceHistoryCollapsed}
              onToggleCollapse={() => setDiceHistoryCollapsed(!diceHistoryCollapsed)}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                  {renderContent()}
                </AnimatePresence>
              </div>
            </main>
          </div>

          {/* Quick Roll Zones for Drag & Drop */}
          <QuickRollZones characterId="eldara-moonwhisper" />

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
        </ChronicleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App