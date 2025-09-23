/**
 * Session Flow Manager for ZimboMate V2
 * Manages integrated play session workflow and automatic state tracking
 * Phase 4C: Desktop Power Features - Smart Integration System
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Users, 
  Dice6, 
  Sword, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, Button, Badge, Progress } from '../ui'
import { useCharacterStore } from '../../stores/characterStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useGameStateStore } from '../../stores/gameStateStore'
import { XPAwardModal } from './XPAwardModal'
import type { Character } from '../../models/Character'

// Session phases
export type SessionPhase = 
  | 'setup'      // Pre-session setup
  | 'opening'    // Opening scene
  | 'exploration' // General exploration/roleplay
  | 'encounter'  // Combat or major challenge
  | 'resolution' // Post-encounter resolution
  | 'transition' // Moving between scenes
  | 'closing'    // Session wrap-up
  | 'ended'      // Session ended

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
  type: 'roll' | 'move' | 'damage' | 'heal' | 'xp' | 'advancement' | 'scene_change'
  timestamp: Date
  characterId?: string
  description: string
  data?: any
}

interface SessionFlowManagerProps {
  compact?: boolean
  autoAdvance?: boolean
  showSuggestions?: boolean
}

export const SessionFlowManager: React.FC<SessionFlowManagerProps> = ({
  compact = false,
  autoAdvance = true,
  showSuggestions = true
}) => {
  const { characters, getActiveCharacter } = useCharacterStore()
  const { 
    currentSession, 
    isSessionActive, 
    startSession, 
    endSession, 
    combat,
    rollHistory,
    startCombat,
    endCombat,
    nextRound,
    nextTurn
  } = useSessionStore()
  const { 
    gameTime, 
    advanceTime, 
    environment,
    getGameStateSnapshot
  } = useGameStateStore()

  const [sessionFlow, setSessionFlow] = useState<SessionFlow>({
    phase: 'setup',
    sceneCount: 1,
    encounterCount: 0,
    turnCount: 0,
    lastAction: 'Session initialized',
    suggestedNextActions: ['Start session', 'Set opening scene'],
    milestones: []
  })

  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([])
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(true)
  const [showXPModal, setShowXPModal] = useState(false)

  // Handle XP award completion
  const handleXPAwarded = (totalXPAwarded: number, charactersAffected: number) => {
    // Add to session events for tracking
    const event: SessionEvent = {
      id: crypto.randomUUID(),
      type: 'xp-awarded',
      timestamp: new Date(),
      description: `Awarded ${totalXPAwarded} XP to ${charactersAffected} character${charactersAffected !== 1 ? 's' : ''}`,
      metadata: {
        totalXP: totalXPAwarded,
        charactersCount: charactersAffected
      }
    }
    setSessionEvents(prev => [...prev, event])

    // Update session flow
    setSessionFlow(prev => ({
      ...prev,
      suggestedNextActions: prev.suggestedNextActions.filter(action => action !== 'Award XP')
    }))
  }

  // Auto-track session events
  useEffect(() => {
    if (!isSessionActive || !autoTrackingEnabled) return

    // Track roll events
    if (rollHistory.length > 0) {
      const latestRoll = rollHistory[0]
      const existingEvent = sessionEvents.find(e => 
        e.type === 'roll' && 
        e.timestamp.getTime() === latestRoll.timestamp.getTime()
      )

      if (!existingEvent) {
        const rollEvent: SessionEvent = {
          id: `roll-${Date.now()}`,
          type: 'roll',
          timestamp: latestRoll.timestamp,
          characterId: latestRoll.characterId,
          description: `${latestRoll.moveName || 'Dice roll'}: ${latestRoll.total} (${latestRoll.result})`,
          data: latestRoll
        }

        setSessionEvents(prev => [rollEvent, ...prev.slice(0, 49)]) // Keep last 50 events

        // Auto-advance session flow based on rolls
        if (autoAdvance) {
          handleAutoAdvance('roll', latestRoll)
        }
      }
    }
  }, [rollHistory, isSessionActive, autoTrackingEnabled, autoAdvance, sessionEvents])

  // Auto-advance session flow
  const handleAutoAdvance = useCallback((eventType: string, eventData: any) => {
    setSessionFlow(prev => {
      const newFlow = { ...prev }
      
      switch (eventType) {
        case 'roll':
          // If we're in setup and someone rolls, move to opening
          if (prev.phase === 'setup') {
            newFlow.phase = 'opening'
            newFlow.lastAction = 'Session started with first roll'
            newFlow.suggestedNextActions = ['Continue opening scene', 'Introduce characters']
            newFlow.milestones.push({
              id: `milestone-${Date.now()}`,
              phase: 'opening',
              timestamp: new Date(),
              description: 'Session began with first dice roll'
            })
          }
          
          // Track turn progression
          newFlow.turnCount += 1
          
          // If multiple combat rolls, suggest encounter phase
          if (prev.phase === 'exploration') {
            const recentCombatRolls = rollHistory.slice(0, 3).filter(roll => 
              roll.moveName?.includes('Hack and Slash') || 
              roll.moveName?.includes('Volley') ||
              roll.moveName?.includes('Defend')
            ).length
            
            if (recentCombatRolls >= 2) {
              newFlow.phase = 'encounter'
              newFlow.encounterCount += 1
              newFlow.lastAction = 'Combat encounter detected'
              newFlow.suggestedNextActions = ['Start combat tracker', 'Roll initiative', 'Track HP']
            }
          }
          break

        case 'combat_start':
          newFlow.phase = 'encounter'
          newFlow.encounterCount += 1
          newFlow.lastAction = 'Combat encounter started'
          newFlow.suggestedNextActions = ['Roll initiative', 'Track turn order', 'Monitor HP']
          break

        case 'combat_end':
          newFlow.phase = 'resolution'
          newFlow.lastAction = 'Combat encounter resolved'
          newFlow.suggestedNextActions = ['Award XP', 'Heal characters', 'Loot and rewards']
          break

        case 'scene_change':
          newFlow.phase = 'transition'
          newFlow.sceneCount += 1
          newFlow.lastAction = 'Scene transition'
          newFlow.suggestedNextActions = ['Set new scene', 'Update environment', 'Continue exploration']
          break
      }

      return newFlow
    })
  }, [rollHistory])

  // Manual phase advancement
  const advancePhase = (newPhase: SessionPhase) => {
    setSessionFlow(prev => ({
      ...prev,
      phase: newPhase,
      lastAction: `Manually advanced to ${newPhase}`,
      suggestedNextActions: getPhaseActions(newPhase),
      milestones: [
        ...prev.milestones,
        {
          id: `milestone-${Date.now()}`,
          phase: newPhase,
          timestamp: new Date(),
          description: `Advanced to ${newPhase} phase`
        }
      ]
    }))

    // Trigger appropriate store actions
    switch (newPhase) {
      case 'encounter':
        if (!combat.isActive) {
          const characterIds = characters.map(c => c.id)
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
  const getPhaseActions = (phase: SessionPhase): string[] => {
    switch (phase) {
      case 'setup':
        return ['Start session', 'Set opening scene', 'Review character sheets']
      case 'opening':
        return ['Introduce scene', 'Set the mood', 'Ask opening questions']
      case 'exploration':
        return ['Describe environment', 'Encourage roleplay', 'Present opportunities']
      case 'encounter':
        return ['Start combat tracker', 'Roll initiative', 'Track HP and conditions']
      case 'resolution':
        return ['Award XP', 'Heal characters', 'Distribute rewards', 'Wrap up encounter']
      case 'transition':
        return ['Change scene', 'Update environment', 'Advance time', 'Set new stakes']
      case 'closing':
        return ['Wrap up storylines', 'Award end-of-session XP', 'Plan next session']
      case 'ended':
        return ['Review session', 'Save progress', 'Schedule next session']
      default:
        return []
    }
  }

  // Get phase color
  const getPhaseColor = (phase: SessionPhase) => {
    switch (phase) {
      case 'setup': return 'var(--muted-foreground)'
      case 'opening': return 'var(--primary)'
      case 'exploration': return 'var(--chart-2)'
      case 'encounter': return 'var(--destructive)'
      case 'resolution': return 'var(--accent)'
      case 'transition': return 'var(--chart-4)'
      case 'closing': return 'var(--chart-3)'
      case 'ended': return 'var(--muted)'
      default: return 'var(--primary)'
    }
  }

  // Get phase icon
  const getPhaseIcon = (phase: SessionPhase) => {
    switch (phase) {
      case 'setup': return Settings
      case 'opening': return Play
      case 'exploration': return BookOpen
      case 'encounter': return Sword
      case 'resolution': return CheckCircle
      case 'transition': return SkipForward
      case 'closing': return Square
      case 'ended': return Square
      default: return Play
    }
  }

  // Calculate session progress
  const getSessionProgress = () => {
    const phaseOrder: SessionPhase[] = ['setup', 'opening', 'exploration', 'encounter', 'resolution', 'transition', 'closing', 'ended']
    const currentIndex = phaseOrder.indexOf(sessionFlow.phase)
    return (currentIndex / (phaseOrder.length - 1)) * 100
  }

  // Quick actions
  const quickActions = [
    {
      label: 'Start Combat',
      icon: Sword,
      onClick: () => {
        const characterIds = characters.map(c => c.id)
        startCombat(characterIds)
        advancePhase('encounter')
      },
      disabled: combat.isActive
    },
    {
      label: 'End Combat',
      icon: Shield,
      onClick: () => {
        endCombat()
        advancePhase('resolution')
      },
      disabled: !combat.isActive
    },
    {
      label: 'Next Scene',
      icon: SkipForward,
      onClick: () => {
        advanceTime('scene')
        advancePhase('transition')
      },
      disabled: false
    },
    {
      label: 'Award XP',
      icon: TrendingUp,
      onClick: () => {
        setShowXPModal(true)
      },
      disabled: false
    }
  ]

  if (!isSessionActive) {
    return (
      <Card variant="outline">
        <CardContent>
          <div className="text-center space-y-4">
            <div 
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-primary/20">
              <Play className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg mb-2">No Active Session</h3>
              <p className="text-muted-foreground">
                Start a session to enable flow management and auto-tracking.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                const characterIds = characters.map(c => c.id)
                startSession('New Session', characterIds)
                setSessionFlow(prev => ({ ...prev, phase: 'opening' }))
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
      <Card variant="magical">
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: getPhaseColor(sessionFlow.phase),
                  opacity: 0.2 
                }}
              >
                <PhaseIcon 
                  size={20} 
                  style={{ color: getPhaseColor(sessionFlow.phase) }}
                />
              </div>
              <div>
                <h3 className="font-display text-lg">Session Flow</h3>
                <p 
                  className="text-sm text-muted-foreground">
                  {sessionFlow.phase.charAt(0).toUpperCase() + sessionFlow.phase.slice(1)} Phase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Scene {sessionFlow.sceneCount}
              </Badge>
              {combat.isActive && (
                <Badge variant="destructive">
                  Combat Round {combat.round}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Session Progress
              </span>
              <span className="text-muted-foreground">
                {Math.round(getSessionProgress())}%
              </span>
            </div>
            <Progress 
              value={getSessionProgress()} 
              className="h-2"
            />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Current Status */}
                <div 
                  className="p-3 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-muted-foreground" size={16} />
                    <span className="text-sm font-medium">Last Action</span>
                  </div>
                  <p 
                    className="text-sm text-muted-foreground">
                    {sessionFlow.lastAction}
                  </p>
                </div>

                {/* Suggested Actions */}
                {showSuggestions && sessionFlow.suggestedNextActions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Suggested Next Actions</h4>
                    <div className="space-y-1">
                      {sessionFlow.suggestedNextActions.map((action, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 rounded bg-card">
                          <CheckCircle className="text-chart-2" 
                            size={14} />
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => {
                      const ActionIcon = action.icon
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.onClick}
                          disabled={action.disabled}
                          className="justify-start gap-2"
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
                  <h4 className="text-sm font-medium mb-2">Phase Control</h4>
                  <div className="flex flex-wrap gap-1">
                    {(['setup', 'opening', 'exploration', 'encounter', 'resolution', 'transition', 'closing'] as SessionPhase[]).map((phase) => (
                      <Button
                        key={phase}
                        variant={sessionFlow.phase === phase ? 'primary' : 'ghost'}
                        size="xs"
                        onClick={() => advancePhase(phase)}
                      >
                        {phase.charAt(0).toUpperCase() + phase.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{sessionFlow.sceneCount}</div>
                    <div 
                      className="text-xs text-muted-foreground">
                      Scenes
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{sessionFlow.encounterCount}</div>
                    <div 
                      className="text-xs text-muted-foreground">
                      Encounters
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{rollHistory.length}</div>
                    <div 
                      className="text-xs text-muted-foreground">
                      Rolls
                    </div>
                  </div>
                </div>

                {/* Auto-tracking Toggle */}
                <div className="flex items-center justify-between p-2 rounded bg-card">
                  <span className="text-sm">Auto-tracking</span>
                  <Button
                    variant={autoTrackingEnabled ? 'primary' : 'outline'}
                    size="xs"
                    onClick={() => setAutoTrackingEnabled(!autoTrackingEnabled)}
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