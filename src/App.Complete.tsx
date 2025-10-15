import type { GameSession } from './services/MultiplayerService'
import type { ButtonDiagnostic } from './utils/buttonUtils'
import {
  BugAntIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Dice6,
  NotebookPen,
  Play,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'
import React, { useState } from 'react'
import { ChronicleProvider } from './components/chronicle/ChronicleProvider'
import { UnifiedRollSystem } from './components/dice/UnifiedRollSystem'
import Folio from './components/game/CharacterSheet/Folio'
import { ContextAwareSystem } from './components/game/ContextAwareSystem'
import { CharacterBuilder } from './components/game/creation/CharacterBuilder'
import { GameManagementTab } from './components/game/GameManagementTab'
import LevelUpBondReminder from './components/game/LevelUpBondReminder'
import { LevelUpWizard } from './components/game/LevelUpWizard'
import { PlayTab } from './components/game/PlayTab'
import { SessionManager } from './components/game/SessionManager'
import { StatRoller } from './components/game/StatRoller'
import { RightRail, SplitPane } from './components/layout'
import {
  Badge,
  Button,
  Card,
  CardContent,
  ThemeComponentShowcase,
} from './components/ui'
import { AuthProvider } from './components/ui/AuthProvider'
import { ButtonDebugger } from './components/ui/ButtonDebugger'
import { CommandPalette } from './components/ui/CommandPalette'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { SettingsPanel } from './components/ui/SettingsPanel'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeStatusBadge } from './components/ui/ThemeStatusBadge'
import { TooltipProvider } from './components/ui/tooltip'
import { useDiceKeyboardShortcuts } from './hooks/useDiceKeyboardShortcuts'
import {
  useCommandPalette,
  useDiceShortcuts,
  useGlobalShortcuts,
  useNavigationShortcuts,
} from './hooks/useKeyboardShortcuts'
import { useCharacterStore } from './stores/characterStore'
import {
  autoFixAllButtons,
  diagnoseAllButtons,
  enableButtonDebugging,
  generateButtonReport,
} from './utils/buttonUtils'
import { logger } from './utils/logger'
import './utils/initializeMockData' // Initialize mock data for development
import './utils/exposeStoresForTesting'

type ActiveTab =
  | 'play'
  | 'character'
  | 'dice'
  | 'game-management'
  | 'settings'
  | 'button-debug'

const App: React.FC = () => {
  const { characters, getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter
    ? getActiveCharacter()
    : (characters[0] ?? null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('play')
  const [showCharacterBuilder, setShowCharacterBuilder] = useState(false)
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)
  const [buttonDiagnostics, setButtonDiagnostics] = useState<
    ButtonDiagnostic[]
  >([])
  const [debuggingEnabled, setDebuggingEnabled] = useState(false)
  const [autoFixCount, setAutoFixCount] = useState(0)

  // Dice sidebar state

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1')

  const shouldShowButtonDebugTab =
    import.meta.env.DEV ||
    import.meta.env.VITE_ENABLE_BUTTON_DEBUG === 'true' ||
    isLocalhost

  const tabs = [
    { id: 'play' as const, label: 'Play', icon: Play, featured: true },
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    {
      id: 'game-management' as const,
      label: 'Game Management',
      icon: NotebookPen,
      description: 'Chronicle, Campaign, Monsters & More',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      enhanced: true,
    },
    ...(shouldShowButtonDebugTab
      ? [
          {
            id: 'button-debug' as const,
            label: 'Button Debug',
            icon: WrenchScrewdriverIcon,
          },
        ]
      : []),
  ]

  // Command palette integration
  const { registerCommandPalette, setIsOpen } = useCommandPalette()

  React.useLayoutEffect(() => {
    registerCommandPalette(
      () => setCommandPaletteOpen(true),
      () => setCommandPaletteOpen(false),
    )
  }, [registerCommandPalette])

  React.useLayoutEffect(() => {
    setIsOpen(commandPaletteOpen)
  }, [commandPaletteOpen, setIsOpen])

  React.useLayoutEffect(() => {
    const handlePaletteShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      )
        return
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() !== 'k') return

      event.preventDefault()
      if (!commandPaletteOpen) {
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handlePaletteShortcut)
    return () => document.removeEventListener('keydown', handlePaletteShortcut)
  }, [commandPaletteOpen])

  // Navigation shortcuts
  useNavigationShortcuts((tabId) => {
    setActiveTab(tabId as ActiveTab)
  })

  // Global shortcuts
  useGlobalShortcuts({
    onToggleTheme: () => {
      // Theme toggle logic would go here
      logger.info('Toggle theme')
    },
  })

  // Dice shortcuts (legacy system)
  useDiceShortcuts(
    (_stat) => {
      setActiveTab('dice')
    },
    activeTab === 'dice' || activeTab === 'character',
  )

  // New advanced dice keyboard shortcuts
  useDiceKeyboardShortcuts({
    characterId: activeCharacter?.id ?? '',
    enabled: activeTab === 'dice' && Boolean(activeCharacter),
    modifierKey: 'none', // Direct key presses for fast gameplay
  })

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'play':
        return (
          <motion.div
            key='play'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <div>
              <PlayTab />
            </div>
          </motion.div>
        )
      case 'character':
        return (
          <motion.div
            key='character'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <div className='space-y-8'>
              {characters.length === 0 || showCharacterBuilder ? (
                <div className='space-y-4'>
                  {characters.length > 0 && (
                    <div className='flex justify-between items-center'>
                      <h3 className='text-lg font-semibold'>
                        Create New Character
                      </h3>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setShowCharacterBuilder(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <CharacterBuilder
                    onFinished={() => setShowCharacterBuilder(false)}
                  />
                </div>
              ) : (
                <>
                  <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3 shadow-sm'>
                    <div className='space-y-1'>
                      <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                        Active Character
                      </p>
                      <div className='flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground'>
                        <span>{activeCharacter?.name ?? 'Unassigned'}</span>
                        {activeCharacter ? (
                          <Badge variant='outline' className='text-xs'>
                            Level {activeCharacter.level} ·{' '}
                            {activeCharacter.class}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowSessionManager(true)}
                      >
                        Manage Session
                      </Button>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() => setShowCharacterBuilder(true)}
                      >
                        Create Character
                      </Button>
                    </div>
                  </div>
                  <SplitPane
                    className='min-h-[720px] gap-4 md:gap-6'
                    left={<Folio className='h-full min-h-0' />}
                    right={
                      <RightRail
                        className='h-full min-h-0'
                        header={
                          activeCharacter ? (
                            <div className='space-y-3'>
                              <div className='flex items-center justify-between gap-3'>
                                <h3 className='text-sm font-semibold text-foreground'>
                                  {activeCharacter.name}
                                </h3>
                                <Badge variant='secondary' className='text-xs'>
                                  XP {activeCharacter.xp}
                                </Badge>
                              </div>
                              <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                                <span>
                                  HP {activeCharacter.hp.current}/
                                  {activeCharacter.hp.max}
                                </span>
                                <span>Armor {activeCharacter.armor}</span>
                                <span>
                                  Load {activeCharacter.load.current}/
                                  {activeCharacter.load.max}
                                </span>
                                <span>Coin {activeCharacter.coin}</span>
                              </div>
                            </div>
                          ) : null
                        }
                      >
                        <Card variant='surface'>
                          <CardContent className='space-y-3 p-4'>
                            <h4 className='text-sm font-semibold text-foreground'>
                              Quick Actions
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowCharacterBuilder(true)}
                              >
                                Edit in Builder
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setActiveTab('play')}
                              >
                                Jump to Play
                              </Button>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              Inline counters in the Folio apply updates
                              instantly via GPT-5. Use the builder for deeper
                              sheet edits.
                            </p>
                          </CardContent>
                        </Card>
                        <Card variant='surface'>
                          <CardContent className='p-4'>
                            <ContextAwareSystem context='character' compact />
                          </CardContent>
                        </Card>
                      </RightRail>
                    }
                  />
                </>
              )}
            </div>
          </motion.div>
        )
      case 'dice':
        return (
          <motion.div
            key='dice'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='max-w-2xl mx-auto'
          >
            <div className='space-y-6'>
              <UnifiedRollSystem
                characterId='eldara-moonwhisper'
                layout='inline'
                showHistory={true}
                showQuickRolls={true}
                showCustomRolls={true}
                className='max-w-full'
              />

              {/* Chronicle-Enabled Stat Rolling */}
              <StatRoller
                characterName='Eldara Moonwhisper'
                statModifiers={{
                  STR: 1,
                  DEX: 2,
                  CON: 1,
                  INT: 4,
                  WIS: 3,
                  CHA: 2,
                }}
                onStatRoll={(stat, result) => {
                  logger.info(`${stat} roll result:`, result)
                }}
              />

              <ContextAwareSystem context='dice' compact />
            </div>
          </motion.div>
        )
      case 'game-management':
        return (
          <motion.div
            key='game-management'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <GameManagementTab />
          </motion.div>
        )
      case 'settings':
        return (
          <motion.div
            key='settings'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <SettingsPanel />
          </motion.div>
        )
      case 'button-debug':
        return (
          <motion.div
            key='button-debug'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <div className='max-w-6xl mx-auto space-y-8'>
              {/* Button Debug Control Panel */}
              <Card variant='magical' padding='lg'>
                <CardContent>
                  <div className='space-y-6'>
                    <div>
                      <h2 className='text-display-md mb-2'>
                        ZimboMate v2 Button Debugger
                      </h2>
                      <p className='text-muted-foreground'>
                        Diagnose and fix button functionality issues throughout
                        the application
                      </p>
                    </div>

                    <div className='flex flex-wrap gap-4'>
                      <Button
                        variant='cyber'
                        onClick={() => {
                          const results = diagnoseAllButtons()
                          setButtonDiagnostics(results)
                          logger.info('🔍 Button diagnosis completed:', results)
                        }}
                      >
                        <BugAntIcon size={16} />
                        Run Diagnosis
                      </Button>

                      <Button
                        variant='secondary'
                        onClick={() => {
                          enableButtonDebugging()
                          setDebuggingEnabled(true)
                          logger.info('🔧 Button debugging enabled')
                        }}
                        disabled={debuggingEnabled}
                      >
                        <WrenchScrewdriverIcon size={16} />
                        {debuggingEnabled
                          ? 'Debugging Active'
                          : 'Enable Debug Mode'}
                      </Button>

                      <Button
                        variant='magical'
                        onClick={() => {
                          const fixed = autoFixAllButtons()
                          setAutoFixCount((prev) => prev + fixed)
                          logger.info(`🔧 Auto-fixed ${fixed} button issues`)
                        }}
                      >
                        <WrenchScrewdriverIcon size={16} />
                        Auto-Fix Issues
                      </Button>

                      <Button
                        variant='outline'
                        onClick={() => {
                          const report = generateButtonReport()
                          logger.info(report)

                          // Download report
                          const blob = new Blob([report], {
                            type: 'text/plain',
                          })
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
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className='text-center p-4 rounded-lg bg-popover'>
                        <div className='text-2xl font-bold text-[color:var(--nature-500)]'>
                          {buttonDiagnostics.filter((d) => d.working).length}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Working Buttons
                        </div>
                      </div>

                      <div className='text-center p-4 rounded-lg bg-popover'>
                        <div className='text-2xl font-bold text-[color:var(--red-500)]'>
                          {buttonDiagnostics.filter((d) => !d.working).length}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Issues Found
                        </div>
                      </div>

                      <div className='text-center p-4 rounded-lg bg-popover'>
                        <div className='text-2xl font-bold text-[color:var(--yellow-500)]'>
                          {autoFixCount}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Auto-Fixed
                        </div>
                      </div>

                      <div className='text-center p-4 rounded-lg bg-popover'>
                        <div className='text-2xl font-bold text-primary'>
                          {debuggingEnabled ? '🔧' : '💤'}
                        </div>
                        <div className='text-sm text-muted-foreground'>
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
                  logger.info(
                    `✅ Test result: ${testName} - ${success ? 'SUCCESS' : 'FAILED'}`,
                    details,
                  )
                }}
              />

              {/* Console Commands Help */}
              <Card>
                <CardContent>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Console Commands</h3>
                    <div className='grid md:grid-cols-2 gap-4 text-sm font-mono'>
                      <div>
                        <code className='text-primary'>
                          window.ZimboMate.debugButtons()
                        </code>
                        <p className='text-muted-foreground'>
                          Enable visual debugging
                        </p>
                      </div>
                      <div>
                        <code className='text-primary'>
                          window.ZimboMate.fixButtons()
                        </code>
                        <p className='text-muted-foreground'>
                          Auto-fix all issues
                        </p>
                      </div>
                      <div>
                        <code className='text-primary'>
                          window.ZimboMate.buttonReport()
                        </code>
                        <p className='text-muted-foreground'>Generate report</p>
                      </div>
                      <div>
                        <code className='text-primary'>
                          window.ZimboMate.diagnoseButtons()
                        </code>
                        <p className='text-muted-foreground'>Get diagnostics</p>
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
            key='play'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <PlayTab />
          </motion.div>
        )
    }
  }

  const handleSessionJoined = (session: GameSession) => {
    setShowSessionManager(false)
    logger.info('Joined session:', session)
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ChronicleProvider defaultEnabled={true}>
            <TooltipProvider delayDuration={200} skipDelayDuration={300}>
              <div className='texture' aria-hidden='true' />

              <div className='relative isolate min-h-screen transition-colors duration-300 bg-background text-foreground'>
                {/* Header */}
                <header className='sticky top-0 z-50 border-b border-primary/20 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm'>
                  <div className='container mx-auto px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <motion.div
                        className='flex items-center gap-3'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className='w-10 h-10 rounded-lg flex items-center justify-center bg-primary/20 text-primary'
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Sparkles className='w-6 h-6 text-primary' />
                        </motion.div>
                        <div>
                          <h1 className='font-display text-xl'>ZimboMate V2</h1>
                          <p className='text-sm text-muted-foreground'>
                            Dungeon World Companion
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <ThemeStatusBadge />
                      </motion.div>
                    </div>
                  </div>
                </header>

                {/* Navigation Tabs */}
                <nav
                  role='navigation'
                  aria-label='Primary'
                  className='sticky top-[73px] z-40 border-b border-primary/10 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80'
                >
                  <div className='container mx-auto px-6'>
                    <div className='flex gap-1 py-2 overflow-x-auto'>
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
                              size='sm'
                              onClick={() => setActiveTab(tab.id)}
                              className={`relative whitespace-nowrap ${
                                tab.featured ? 'ring-2 ring-primary/30 ' : ''
                              }`}
                              title={tab.description || tab.label}
                            >
                              <Icon size={16} />
                              {tab.label}
                              {tab.featured && !isActive && (
                                <Badge
                                  variant='secondary'
                                  className='ml-1 text-xs'
                                >
                                  ★
                                </Badge>
                              )}
                              {tab.enhanced && !isActive && (
                                <Badge
                                  variant='default'
                                  className='ml-1 text-xs'
                                >
                                  ✨
                                </Badge>
                              )}
                              {isActive && (
                                <motion.div
                                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary'
                                  layoutId='activeTab'
                                  transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30,
                                  }}
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
                <div className='flex min-h-[calc(100vh-12rem)] min-w-0'>
                  <main role='main' className='flex-1 min-h-0 overflow-y-auto'>
                    <div className='container mx-auto px-6 py-8 pb-12'>
                      <AnimatePresence mode='wait'>
                        {renderContent()}
                      </AnimatePresence>
                    </div>
                  </main>
                </div>

                {/* Footer */}
                <footer className='mt-16 border-t border-primary/20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85'>
                  <div className='container mx-auto px-6 py-8'>
                    <div className='flex items-center justify-between'>
                      <motion.div
                        className='flex items-center gap-3'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <User className='w-5 h-5 text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                          ZimboMate V2 • Built with React 19 & Tailwind v4
                        </span>
                      </motion.div>
                      <motion.div
                        className='text-sm text-muted-foreground'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        Phase 4D: Advanced File Management System Complete ✨
                      </motion.div>
                    </div>
                  </div>
                </footer>

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
                    logger.info('Command palette action:', actionId)
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
                <LevelUpWizard />
                <LevelUpBondReminder />
              </div>
            </TooltipProvider>
          </ChronicleProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
