import { AnimatePresence, motion } from 'framer-motion'
import {
  NotebookPen,
  Play,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'
import React, { useState } from 'react'
import ModeStatusBadge from './components/ui/ModeStatusBadge'
import Folio from './components/game/CharacterSheet/Folio'
import { ContextAwareSystem } from './components/game/ContextAwareSystem'
import { CharacterBuilder } from './components/game/creation/CharacterBuilder'
import { GameManagementTab } from './components/game/GameManagementTab'
import LevelUpBondReminder from './components/game/LevelUpBondReminder'
import { LevelUpWizard } from './components/game/LevelUpWizard'
import { PlayTab } from './components/game/PlayTab'
import { RightRail, SplitPane } from './components/layout'
import { Badge, Button, Card, CardContent, ThemeComponentShowcase } from './components/ui'
import { AuthProvider } from './components/ui/AuthProvider'
import { CommandPalette } from './components/ui/CommandPalette'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { SettingsPanel } from './components/ui/SettingsPanel'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeStatusBadge } from './components/ui/ThemeStatusBadge'
import { TooltipProvider } from './components/ui/tooltip'
import { useCapabilities } from './hooks/useCapabilities'
import { useDiceKeyboardShortcuts } from './hooks/useDiceKeyboardShortcuts'
import {
  useCommandPalette,
  useDiceShortcuts,
  useGlobalShortcuts,
  useNavigationShortcuts,
} from './hooks/useKeyboardShortcuts'
import { useCharacterStore } from './stores/characterStore'
import { logger } from './utils/logger'
import './utils/initializeMockData' // Initialize mock data for development
import './utils/exposeStoresForTesting'
import { DiceRollEffects } from './components/dice/DiceRollEffects'
import { ModeSelector } from './components/ui/ModeSelector'

type ActiveTab = 'play' | 'character' | 'game-management' | 'settings'

const App: React.FC = () => {
  const capabilities = useCapabilities()
  const { characters, getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter
    ? getActiveCharacter()
    : (characters[0] ?? null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('play')
  const [showCharacterBuilder, setShowCharacterBuilder] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)
  const [gameManagementInitialTab, setGameManagementInitialTab] = useState<
    'campaign' | 'monsters' | 'multiplayer' | 'tools'
  >('campaign')
  const [gameManagementResetToken, setGameManagementResetToken] = useState(0)
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false)
  const capabilitiesLoggedRef = React.useRef(false)

  const openGameManagement = (
    tab?: 'campaign' | 'monsters' | 'multiplayer' | 'tools',
  ) => {
    const resolved = tab ?? 'campaign'
    setGameManagementInitialTab(resolved)
    setGameManagementResetToken((token) => token + 1)
    setActiveTab('game-management')
  }

  React.useEffect(() => {
    setGameManagementInitialTab('campaign')
  }, [])

  React.useEffect(() => {
    const shouldLog =
      import.meta.env.DEV ||
      import.meta.env.VITE_ENABLE_CAPABILITIES_SNAPSHOT === 'true'
    if (!shouldLog) return
    if (capabilitiesLoggedRef.current) return
    capabilitiesLoggedRef.current = true
    logger.info('capabilities.snapshot', {
      mode: capabilities.mode,
      llmAllowed: capabilities.llmAllowed,
      canApplyAutomation: capabilities.canApplyAutomation,
      canUndoAutomation: capabilities.canUndoAutomation,
      rolloutStage: capabilities.rolloutStage,
    })
  }, [capabilities, logger])

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1')

const tabs: Array<{
    id: ActiveTab
    label: string
    icon: React.ComponentType<{ size?: number }>
    featured?: boolean
    enhanced?: boolean
    description?: string
  }> = [
    { id: 'play' as const, label: 'Play', icon: Play, featured: true },
    { id: 'character' as const, label: 'Character', icon: User },
    {
      id: 'game-management' as const,
      label: 'Game Management',
      icon: NotebookPen,
      description: 'Campaign, Monsters & More',
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      enhanced: true,
    },
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
    if (tabId === 'dice') {
      openGameManagement('tools')
      return
    }
    if (tabId === 'game-management') {
      setActiveTab('game-management')
      return
    }
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
    () => {
      openGameManagement('tools')
    },
    activeTab === 'character' ||
      activeTab === 'play' ||
      activeTab === 'game-management',
  )

  // New advanced dice keyboard shortcuts
  useDiceKeyboardShortcuts({
    characterId: activeCharacter?.id ?? '',
    enabled:
      (activeTab === 'play' || activeTab === 'game-management') &&
      Boolean(activeCharacter),
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
                  <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-border bg-card/60 px-6 py-4 shadow-sm transition-all duration-200 hover:shadow-md'>
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
                    showGutter={false}
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
      case 'game-management':
        return (
          <motion.div
            key='game-management'
            variants={tabVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <GameManagementTab
              key={`game-management-${gameManagementResetToken}`}
              initialTab={gameManagementInitialTab}
            />
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

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            <div className='texture' aria-hidden='true' />

              <div className='relative isolate min-h-screen transition-colors duration-300 bg-background text-foreground'>
                {/* Header */}
                <header className='sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-200'>
                  <div className='container mx-auto px-6 py-3'>
                    <div className='flex items-center justify-between'>
                      <motion.div
                        className='flex items-center gap-2'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className='w-8 h-8 rounded-md flex items-center justify-center bg-primary/10 text-primary'
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Sparkles className='w-5 h-5' />
                        </motion.div>
                        <h1 className='font-display text-lg font-semibold text-foreground'>
                          ZimboMate
                        </h1>
                      </motion.div>
                      <motion.div
                        className='flex items-center gap-3'
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <ModeStatusBadge onSwitch={() => setModeSelectorOpen(true)} />
                        <ThemeStatusBadge />
                      </motion.div>
                    </div>
                  </div>
                </header>

                {/* Navigation Tabs */}
                <nav
                  role='navigation'
                  aria-label='Primary'
                  className='sticky top-[57px] z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-200'
                >
                  <div className='container mx-auto px-6'>
                  <div className='flex gap-2 py-3 overflow-x-auto'>
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
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`relative whitespace-nowrap ${
                              tab.featured ? 'ring-2 ring-primary/30 ' : ''
                            }`}
                            title={tab.description || tab.label}
                            aria-expanded={isActive}
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
                    <div className='container mx-auto px-6 py-4 pb-16'>
                      <AnimatePresence mode='wait'>
                        {renderContent()}
                      </AnimatePresence>
                    </div>
                  </main>
                </div>


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
                    if (tabId === 'dice') {
                      openGameManagement('tools')
                      setCommandPaletteOpen(false)
                      return
                    }
                    if (tabId === 'game-management') {
                      setActiveTab('game-management')
                      setCommandPaletteOpen(false)
                      return
                    }
                    setActiveTab(tabId as ActiveTab)
                    setCommandPaletteOpen(false)
                  }}
                  onAction={(actionId) => {
                    logger.info('Command palette action:', actionId)
                    switch (actionId) {
                      case 'quick-roll-2d6':
                        openGameManagement('tools')
                        setCommandPaletteOpen(false)
                        break
                      case 'heal-character':
                        break
                      case 'new-note':
                        break
                      default:
                        break
                    }
                  }}
                />

                {/* Session Manager Modal */}
                {/* SessionManager removed for local-only flow */}
                <LevelUpWizard />
                <LevelUpBondReminder />
                <DiceRollEffects />
                {modeSelectorOpen ? (
                  <div className='fixed inset-0 z-[120] bg-background/95 backdrop-blur-sm'>
                    <ModeSelector
                      onSelected={() => setModeSelectorOpen(false)}
                      onDismiss={() => setModeSelectorOpen(false)}
                    />
                  </div>
                ) : null}
              </div>
            </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

