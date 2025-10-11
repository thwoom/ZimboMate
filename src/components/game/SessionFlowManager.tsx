/**
 * Session Flow Manager for ZimboMate V2
 * Manages integrated play session workflow and automatic state tracking
 * Phase 4C: Desktop Power Features - Smart Integration System
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Settings,
  Shield,
  SkipForward,
  Square,
  Sword,
  TrendingUp,
} from 'lucide-react'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import { useGameStateStore } from '../../stores/gameStateStore'
import { useSessionStore } from '../../stores/sessionStore'
import { Badge, Button, Card, CardContent, Progress } from '../ui'
import { XPAwardModal } from './XPAwardModal'

// Session phases
export type SessionPhase =
  | 'setup' // Pre-session setup
  | 'opening' // Opening scene
  | 'exploration' // General exploration/roleplay
  | 'encounter' // Combat or major challenge
  | 'resolution' // Post-encounter resolution
  | 'transition' // Moving between scenes
  | 'closing' // Session wrap-up
  | 'ended' // Session ended

// Flow state for tracking session progress
interface SessionFlow {
  phase: SessionPhase
  sceneCount: number
  encounterCount: number
  turnCount: number
  lastAction: string
  suggestedNextActions: string[]
  milestones: Array<{
    id: string
    phase: SessionPhase
    timestamp: Date
    description: string
    xpAwarded?: number
  }>
}

// Auto-tracking events
interface SessionEvent {
  id: string
  type:
    | 'roll'
    | 'move'
    | 'damage'
    | 'heal'
    | 'xp'
    | 'advancement'
    | 'scene_change'
  timestamp: Date
  characterId?: string
  description: string
  data?: any
}

type SessionEventsAction =
  | { type: 'append'; event: SessionEvent }
  | { type: 'prependRoll'; event: SessionEvent }

const sessionEventsReducer = (
  state: SessionEvent[],
  action: SessionEventsAction,
): SessionEvent[] => {
  switch (action.type) {
    case 'append':
      return [...state, action.event]

    case 'prependRoll':
      return [action.event, ...state].slice(0, 50)

    default:
      return state
  }
}

const getPhaseActions = (phase: SessionPhase): string[] => {
  switch (phase) {
    case 'setup':
      return ['Start session', 'Set opening scene', 'Review character sheets']
    case 'opening':
      return ['Introduce scene', 'Set the mood', 'Ask opening questions']
    case 'exploration':
      return [
        'Describe environment',
        'Encourage roleplay',
        'Present opportunities',
      ]
    case 'encounter':
      return [
        'Start combat tracker',
        'Roll initiative',
        'Track HP and conditions',
      ]
    case 'resolution':
      return [
        'Award XP',
        'Heal characters',
        'Distribute rewards',
        'Wrap up encounter',
      ]
    case 'transition':
      return [
        'Change scene',
        'Update environment',
        'Advance time',
        'Set new stakes',
      ]
    case 'closing':
      return [
        'Wrap up storylines',
        'Award end-of-session XP',
        'Plan next session',
      ]
    case 'ended':
      return ['Review session', 'Save progress', 'Schedule next session']
    default:
      return []
  }
}

const createMilestone = (
  phase: SessionPhase,
  description: string,
): SessionFlow['milestones'][number] => ({
  id: `milestone-${Date.now()}`,
  phase,
  timestamp: new Date(),
  description,
})

type SessionFlowAction =
  | { type: 'removeSuggestion'; suggestion: string }
  | {
      type: 'autoAdvance'
      eventType: 'roll' | 'combat_start' | 'combat_end' | 'scene_change'
      rollHistory: Array<{ moveName?: string }>
    }
  | { type: 'manualAdvance'; phase: SessionPhase }
  | { type: 'startOpening' }

const sessionFlowReducer = (
  state: SessionFlow,
  action: SessionFlowAction,
): SessionFlow => {
  switch (action.type) {
    case 'removeSuggestion':
      return {
        ...state,
        suggestedNextActions: state.suggestedNextActions.filter(
          (item) => item !== action.suggestion,
        ),
      }

    case 'autoAdvance': {
      const next: SessionFlow = {
        ...state,
        milestones: [...state.milestones],
      }

      if (action.eventType === 'roll') {
        if (state.phase === 'setup') {
          next.phase = 'opening'
          next.lastAction = 'Session started with first roll'
          next.suggestedNextActions = [
            'Continue opening scene',
            'Introduce characters',
          ]
          next.milestones.push(
            createMilestone('opening', 'Session began with first dice roll'),
          )
        }

        next.turnCount += 1

        if (state.phase === 'exploration') {
          const recentCombatRolls = action.rollHistory
            .slice(0, 3)
            .filter(
              (roll: any) =>
                roll.moveName?.includes('Hack and Slash') ||
                roll.moveName?.includes('Volley') ||
                roll.moveName?.includes('Defend'),
            ).length

          if (recentCombatRolls >= 2) {
            next.phase = 'encounter'
            next.encounterCount += 1
            next.lastAction = 'Combat encounter detected'
            next.suggestedNextActions = [
              'Start combat tracker',
              'Roll initiative',
              'Track HP',
            ]
          }
        }

        return next
      }

      if (action.eventType === 'combat_start') {
        next.phase = 'encounter'
        next.encounterCount += 1
        next.lastAction = 'Combat encounter started'
        next.suggestedNextActions = [
          'Roll initiative',
          'Track turn order',
          'Monitor HP',
        ]
        return next
      }

      if (action.eventType === 'combat_end') {
        next.phase = 'resolution'
        next.lastAction = 'Combat encounter resolved'
        next.suggestedNextActions = [
          'Award XP',
          'Heal characters',
          'Loot and rewards',
        ]
        return next
      }

      if (action.eventType === 'scene_change') {
        next.phase = 'transition'
        next.sceneCount += 1
        next.lastAction = 'Scene transition'
        next.suggestedNextActions = [
          'Set new scene',
          'Update environment',
          'Continue exploration',
        ]
        return next
      }

      return next
    }

    case 'manualAdvance':
      return {
        ...state,
        phase: action.phase,
        lastAction: `Manually advanced to ${action.phase}`,
        suggestedNextActions: getPhaseActions(action.phase),
        milestones: [
          ...state.milestones,
          createMilestone(action.phase, `Advanced to ${action.phase} phase`),
        ],
      }

    case 'startOpening':
      if (state.phase === 'opening') {
        return state
      }

      return {
        ...state,
        phase: 'opening',
      }

    default:
      return state
  }
}

interface SessionFlowManagerProps {
  compact?: boolean
  autoAdvance?: boolean
  showSuggestions?: boolean
}

export const SessionFlowManager: React.FC<SessionFlowManagerProps> = ({
  compact = false,
  autoAdvance = true,
  showSuggestions = true,
}) => {
  const { characters } = useCharacterStore()
  const {
    isSessionActive,
    startSession,
    combat,
    rollHistory,
    startCombat,
    endCombat,
  } = useSessionStore()
  const { advanceTime } = useGameStateStore()

  const [sessionFlow, dispatchSessionFlow] = useReducer(sessionFlowReducer, {
    phase: 'setup',
    sceneCount: 1,
    encounterCount: 0,
    turnCount: 0,
    lastAction: 'Session initialized',
    suggestedNextActions: ['Start session', 'Set opening scene'],
    milestones: [],
  })

  const [sessionEvents, dispatchSessionEvents] = useReducer(
    sessionEventsReducer,
    [],
  )
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true)
  const [showXPModal, setShowXPModal] = useState(false)

  // Handle XP award completion
  const handleXPAwarded = (
    totalXPAwarded: number,
    charactersAffected: number,
  ) => {
    // Add to session events for tracking
    const event: SessionEvent = {
      id: crypto.randomUUID(),
      type: 'xp-awarded',
      timestamp: new Date(),
      description: `Awarded ${totalXPAwarded} XP to ${charactersAffected} character${charactersAffected !== 1 ? 's' : ''}`,
      metadata: {
        totalXP: totalXPAwarded,
        charactersCount: charactersAffected,
      },
    }
    dispatchSessionEvents({ type: 'append', event })

    // Update session flow
    dispatchSessionFlow({ type: 'removeSuggestion', suggestion: 'Award XP' })
  }

  const handleAutoAdvance = useCallback(
    (eventType: 'roll' | 'combat_start' | 'combat_end' | 'scene_change') => {
      dispatchSessionFlow({
        type: 'autoAdvance',
        eventType,
        rollHistory,
      })
    },
    [dispatchSessionFlow, rollHistory],
  )

  useEffect(() => {
    if (!isSessionActive || !autoTrackingEnabled) return

    if (rollHistory.length > 0) {
      const latestRoll = rollHistory[0]
      const existingEvent = sessionEvents.find(
        (event) =>
          event.type === 'roll' &&
          event.timestamp.getTime() === latestRoll.timestamp.getTime(),
      )

      if (!existingEvent) {
        const rollEvent: SessionEvent = {
          id: `roll-${Date.now()}`,
          type: 'roll',
          timestamp: latestRoll.timestamp,
          characterId: latestRoll.characterId,
          description: `${latestRoll.moveName || 'Dice roll'}: ${latestRoll.total} (${latestRoll.result})`,
          data: latestRoll,
        }

        dispatchSessionEvents({ type: 'prependRoll', event: rollEvent })

        if (autoAdvance) {
          handleAutoAdvance('roll')
        }
      }
    }
  }, [
    autoAdvance,
    autoTrackingEnabled,
    handleAutoAdvance,
    isSessionActive,
    rollHistory,
    sessionEvents,
  ])

  // Manual phase advancement
  const advancePhase = (newPhase: SessionPhase) => {
    dispatchSessionFlow({ type: 'manualAdvance', phase: newPhase })

    // Trigger appropriate store actions
    switch (newPhase) {
      case 'encounter':
        if (!combat.isActive) {
          const characterIds = characters.map((c) => c.id)
          startCombat(characterIds)
        }
        break
      case 'resolution':
        if (combat.isActive) {
          endCombat()
        }
        break
      case 'transition':
        advanceTime('scene')
        break
    }
  }

  // Get suggested actions for each phase
  // Get phase color
  const getPhaseColor = (phase: SessionPhase) => {
    switch (phase) {
      case 'setup':
        return 'var(--muted-foreground)'
      case 'opening':
        return 'var(--primary)'
      case 'exploration':
        return 'var(--chart-2)'
      case 'encounter':
        return 'var(--destructive)'
      case 'resolution':
        return 'var(--accent)'
      case 'transition':
        return 'var(--chart-4)'
      case 'closing':
        return 'var(--chart-3)'
      case 'ended':
        return 'var(--muted)'
      default:
        return 'var(--primary)'
    }
  }

  // Get phase icon
  const getPhaseIcon = (phase: SessionPhase) => {
    switch (phase) {
      case 'setup':
        return Settings
      case 'opening':
        return Play
      case 'exploration':
        return BookOpen
      case 'encounter':
        return Sword
      case 'resolution':
        return CheckCircle
      case 'transition':
        return SkipForward
      case 'closing':
        return Square
      case 'ended':
        return Square
      default:
        return Play
    }
  }

  // Calculate session progress
  const getSessionProgress = () => {
    const phaseOrder: SessionPhase[] = [
      'setup',
      'opening',
      'exploration',
      'encounter',
      'resolution',
      'transition',
      'closing',
      'ended',
    ]
    const currentIndex = phaseOrder.indexOf(sessionFlow.phase)
    return (currentIndex / (phaseOrder.length - 1)) * 100
  }

  // Quick actions
  const quickActions = [
    {
      id: 'start-combat',
      label: 'Start Combat',
      icon: Sword,
      onClick: () => {
        const characterIds = characters.map((c) => c.id)
        startCombat(characterIds)
        advancePhase('encounter')
      },
      disabled: combat.isActive,
    },
    {
      id: 'end-combat',
      label: 'End Combat',
      icon: Shield,
      onClick: () => {
        endCombat()
        advancePhase('resolution')
      },
      disabled: !combat.isActive,
    },
    {
      id: 'next-scene',
      label: 'Next Scene',
      icon: SkipForward,
      onClick: () => {
        advanceTime('scene')
        advancePhase('transition')
      },
      disabled: false,
    },
    {
      id: 'award-xp',
      label: 'Award XP',
      icon: TrendingUp,
      onClick: () => {
        setShowXPModal(true)
      },
      disabled: false,
    },
  ]

  const suggestionItems = sessionFlow.suggestedNextActions.map(
    (action, index) => ({
      id: `${sessionFlow.phase}-${index}-${action}`,
      label: action,
    }),
  )

  if (!isSessionActive) {
    return (
      <Card variant='outline'>
        <CardContent>
          <div className='text-center space-y-4'>
            <div className='w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-primary/20'>
              <Play className='text-primary' size={24} />
            </div>
            <div>
              <h3 className='font-display text-lg mb-2'>No Active Session</h3>
              <p className='text-muted-foreground'>
                Start a session to enable flow management and auto-tracking.
              </p>
            </div>
            <Button
              variant='primary'
              onClick={() => {
                const characterIds = characters.map((c) => c.id)
                startSession('New Session', characterIds)
                dispatchSessionFlow({ type: 'startOpening' })
              }}
            >
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const PhaseIcon = getPhaseIcon(sessionFlow.phase)

  return (
    <>
      <Card variant='magical'>
        <CardContent>
          <div className='space-y-4'>
            {/* Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{
                    backgroundColor: getPhaseColor(sessionFlow.phase),
                    opacity: 0.2,
                  }}
                >
                  <PhaseIcon
                    size={20}
                    style={{ color: getPhaseColor(sessionFlow.phase) }}
                  />
                </div>
                <div>
                  <h3 className='font-display text-lg'>Session Flow</h3>
                  <p className='text-sm text-muted-foreground'>
                    {sessionFlow.phase.charAt(0).toUpperCase() +
                      sessionFlow.phase.slice(1)}{' '}
                    Phase
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>
                  Scene {sessionFlow.sceneCount}
                </Badge>
                {combat.isActive && (
                  <Badge variant='destructive'>
                    Combat Round {combat.round}
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Session Progress</span>
                <span className='text-muted-foreground'>
                  {Math.round(getSessionProgress())}%
                </span>
              </div>
              <Progress value={getSessionProgress()} className='h-2' />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4'
                >
                  {/* Current Status */}
                  <div className='p-3 rounded-lg bg-card'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Clock className='text-muted-foreground' size={16} />
                      <span className='text-sm font-medium'>Last Action</span>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {sessionFlow.lastAction}
                    </p>
                  </div>

                  {/* Suggested Actions */}
                  {showSuggestions &&
                    sessionFlow.suggestedNextActions.length > 0 && (
                      <div>
                        <h4 className='text-sm font-medium mb-2'>
                          Suggested Next Actions
                        </h4>
                        <div className='space-y-1'>
                          {suggestionItems.map((item) => (
                            <div
                              key={item.id}
                              className='flex items-center gap-2 text-sm p-2 rounded bg-card'
                            >
                              <CheckCircle className='text-chart-2' size={14} />
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Quick Actions */}
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Quick Actions</h4>
                    <div className='grid grid-cols-2 gap-2'>
                      {quickActions.map((action) => {
                        const ActionIcon = action.icon
                        return (
                          <Button
                            key={action.id}
                            variant='outline'
                            size='sm'
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className='justify-start gap-2'
                          >
                            <ActionIcon size={14} />
                            {action.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Phase Navigation */}
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Phase Control</h4>
                    <div className='flex flex-wrap gap-1'>
                      {(
                        [
                          'setup',
                          'opening',
                          'exploration',
                          'encounter',
                          'resolution',
                          'transition',
                          'closing',
                        ] as SessionPhase[]
                      ).map((phase) => (
                        <Button
                          key={phase}
                          variant={
                            sessionFlow.phase === phase ? 'primary' : 'ghost'
                          }
                          size='xs'
                          onClick={() => advancePhase(phase)}
                        >
                          {phase.charAt(0).toUpperCase() + phase.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <div className='text-lg font-bold'>
                        {sessionFlow.sceneCount}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Scenes
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {sessionFlow.encounterCount}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Encounters
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold'>
                        {rollHistory.length}
                      </div>
                      <div className='text-xs text-muted-foreground'>Rolls</div>
                    </div>
                  </div>

                  {/* Auto-tracking Toggle */}
                  <div className='flex items-center justify-between p-2 rounded bg-card'>
                    <span className='text-sm'>Auto-tracking</span>
                    <Button
                      variant={autoTrackingEnabled ? 'primary' : 'outline'}
                      size='xs'
                      onClick={() =>
                        setAutoTrackingEnabled(!autoTrackingEnabled)
                      }
                    >
                      {autoTrackingEnabled ? 'On' : 'Off'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* XP Award Modal */}
      <XPAwardModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
        onAwarded={handleXPAwarded}
      />
    </>
  )
}

export default SessionFlowManager
