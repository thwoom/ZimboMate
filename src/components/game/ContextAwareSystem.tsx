/**
 * Context-Aware System for ZimboMate V2
 * Provides intelligent suggestions based on character state, game context, and current situation
 * Phase 4C: Desktop Power Features - Smart Integration System
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  Zap, 
  Shield, 
  Heart, 
  Sword, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Clock,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../ui'
import { useCharacterStore } from '../../stores/characterStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useGameStateStore } from '../../stores/gameStateStore'
import { type Character, getEffectiveModifier, shouldLevelUp } from '../../models/Character'
import type { Move } from '../../models/Move'

// Suggestion types
export type SuggestionType = 
  | 'move' 
  | 'equipment' 
  | 'health' 
  | 'resource' 
  | 'advancement' 
  | 'tactical' 
  | 'roleplay'
  | 'warning'

export type SuggestionPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ContextSuggestion {
  id: string
  type: SuggestionType
  priority: SuggestionPriority
  title: string
  description: string
  reason: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible: boolean
  timestamp: Date
}

interface ContextAwareSystemProps {
  characterId?: string
  context?: 'character' | 'dice' | 'moves' | 'equipment' | 'session' | 'campaign'
  maxSuggestions?: number
  showDismissed?: boolean
  compact?: boolean
}

export const ContextAwareSystem: React.FC<ContextAwareSystemProps> = ({
  characterId,
  context = 'character',
  maxSuggestions = 5,
  showDismissed = false,
  compact = false
}) => {
  const { getActiveCharacter, getCharacter, healCharacter, levelUpCharacter } = useCharacterStore()
  const { rollHistory, combat, currentSession } = useSessionStore()
  const { gameTime, environment, globalModifiers } = useGameStateStore()
  
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  // Get the target character
  const character = characterId ? getCharacter(characterId) : getActiveCharacter()

  // Generate context-aware suggestions
  const suggestions = useMemo(() => {
    if (!character) return []

    const suggestions: ContextSuggestion[] = []
    const now = new Date()

    // Health-related suggestions
    if (character.hp.current <= character.hp.max * 0.25) {
      suggestions.push({
        id: 'critical-health',
        type: 'health',
        priority: 'critical',
        title: 'Critical Health!',
        description: `${character.name} has only ${character.hp.current}/${character.hp.max} HP remaining.`,
        reason: 'Character is in immediate danger',
        action: {
          label: 'Heal Character',
          onClick: () => healCharacter(character.id, Math.ceil(character.hp.max * 0.5))
        },
        dismissible: false,
        timestamp: now
      })
    } else if (character.hp.current <= character.hp.max * 0.5) {
      suggestions.push({
        id: 'low-health',
        type: 'health',
        priority: 'high',
        title: 'Low Health',
        description: `Consider healing or resting. Current HP: ${character.hp.current}/${character.hp.max}`,
        reason: 'Character health is below 50%',
        action: {
          label: 'Heal Character',
          onClick: () => healCharacter(character.id, Math.ceil(character.hp.max * 0.25))
        },
        dismissible: true,
        timestamp: now
      })
    }

    // Advancement suggestions
    if (shouldLevelUp(character)) {
      suggestions.push({
        id: 'level-up-ready',
        type: 'advancement',
        priority: 'high',
        title: 'Ready to Level Up!',
        description: `${character.name} has enough XP to advance to level ${character.level + 1}.`,
        reason: `Has ${character.xp} XP, needs ${character.level + 7}`,
        action: {
          label: 'Level Up',
          onClick: () => levelUpCharacter(character.id)
        },
        dismissible: false,
        timestamp: now
      })
    }

    // Load/encumbrance suggestions
    if (character.load.current > character.load.max) {
      suggestions.push({
        id: 'overencumbered',
        type: 'warning',
        priority: 'high',
        title: 'Overencumbered!',
        description: `Carrying ${character.load.current}/${character.load.max} load. Take -1 ongoing until fixed.`,
        reason: 'Load exceeds maximum capacity',
        dismissible: true,
        timestamp: now
      })
    } else if (character.load.current >= character.load.max * 0.8) {
      suggestions.push({
        id: 'heavy-load',
        type: 'equipment',
        priority: 'medium',
        title: 'Heavy Load',
        description: `Nearing max load (${character.load.current}/${character.load.max}). Consider dropping items.`,
        reason: 'Load is at 80% capacity',
        dismissible: true,
        timestamp: now
      })
    }

    // Debility warnings
    const activeDebilities = Object.entries(character.debilities).filter(([_, active]) => active)
    if (activeDebilities.length > 0) {
      suggestions.push({
        id: 'active-debilities',
        type: 'warning',
        priority: 'high',
        title: 'Active Debilities',
        description: `${activeDebilities.map(([name]) => name).join(', ')} affecting dice rolls.`,
        reason: 'Debilities reduce attribute modifiers',
        dismissible: true,
        timestamp: now
      })
    }

    // Combat-specific suggestions
    if (combat.isActive && context === 'dice') {
      const recentRolls = rollHistory.slice(0, 3)
      const recentFailures = recentRolls.filter(roll => roll.result === 'failure').length
      
      if (recentFailures >= 2) {
        suggestions.push({
          id: 'combat-struggling',
          type: 'tactical',
          priority: 'medium',
          title: 'Consider Different Tactics',
          description: 'Recent failures suggest trying a different approach or using Aid/Interfere.',
          reason: `${recentFailures} failures in last 3 rolls`,
          dismissible: true,
          timestamp: now
        })
      }

      // Suggest defensive moves if health is low
      if (character.hp.current <= character.hp.max * 0.4) {
        suggestions.push({
          id: 'combat-defensive',
          type: 'tactical',
          priority: 'high',
          title: 'Consider Defensive Actions',
          description: 'Low health in combat - consider Defend or retreating to safety.',
          reason: 'Low health during active combat',
          dismissible: true,
          timestamp: now
        })
      }
    }

    // Move suggestions based on context
    if (context === 'moves') {
      // Suggest contextual moves based on character state
      if (character.class === 'Wizard' && character.hp.current <= character.hp.max * 0.3) {
        suggestions.push({
          id: 'wizard-defensive-spells',
          type: 'move',
          priority: 'medium',
          title: 'Defensive Spells Available',
          description: 'Consider casting Shield or other protective spells.',
          reason: 'Wizard with low health should use defensive magic',
          dismissible: true,
          timestamp: now
        })
      }

      if (character.class === 'Cleric' && character.hp.current <= character.hp.max * 0.6) {
        suggestions.push({
          id: 'cleric-healing',
          type: 'move',
          priority: 'medium',
          title: 'Healing Magic Available',
          description: 'Use Cure Light Wounds or other healing spells.',
          reason: 'Cleric should consider self-healing',
          dismissible: true,
          timestamp: now
        })
      }
    }

    // Equipment suggestions
    if (context === 'equipment') {
      // Suggest equipment optimization based on class and stats
      const strMod = getEffectiveModifier('STR', character.attributes, character.debilities)
      const dexMod = getEffectiveModifier('DEX', character.attributes, character.debilities)

      if (character.class === 'Fighter' && strMod >= 2 && character.load.current < character.load.max * 0.7) {
        suggestions.push({
          id: 'fighter-heavy-armor',
          type: 'equipment',
          priority: 'low',
          title: 'Consider Heavier Armor',
          description: 'High STR allows for better armor without encumbrance issues.',
          reason: `STR modifier is +${strMod}, load capacity available`,
          dismissible: true,
          timestamp: now
        })
      }

      if (dexMod >= 2 && character.class === 'Thief') {
        suggestions.push({
          id: 'thief-ranged-weapons',
          type: 'equipment',
          priority: 'low',
          title: 'Ranged Weapons Recommended',
          description: 'High DEX makes ranged combat very effective.',
          reason: `DEX modifier is +${dexMod}`,
          dismissible: true,
          timestamp: now
        })
      }
    }

    // Session-specific suggestions
    if (currentSession && context === 'session') {
      const sessionDuration = Date.now() - currentSession.startTime.getTime()
      const hoursPlayed = sessionDuration / (1000 * 60 * 60)

      if (hoursPlayed > 3 && character.hp.current === character.hp.max) {
        suggestions.push({
          id: 'long-session-rest',
          type: 'roleplay',
          priority: 'low',
          title: 'Consider Taking a Rest',
          description: 'Long session - characters might want to rest and recover.',
          reason: `Session running for ${Math.floor(hoursPlayed)} hours`,
          dismissible: true,
          timestamp: now
        })
      }
    }

    // Environmental suggestions
    if (environment.lighting === 'dark' && character.race !== 'Elf' && character.race !== 'Dwarf') {
      suggestions.push({
        id: 'darkness-penalty',
        type: 'warning',
        priority: 'medium',
        title: 'Darkness Affects Vision',
        description: 'Poor lighting may impose penalties on sight-based actions.',
        reason: 'Current environment is dark',
        dismissible: true,
        timestamp: now
      })
    }

    // XP opportunity suggestions
    const recentFailures = rollHistory.slice(0, 5).filter(roll => roll.result === 'failure').length
    if (recentFailures === 0 && rollHistory.length >= 5) {
      suggestions.push({
        id: 'xp-opportunity',
        type: 'roleplay',
        priority: 'low',
        title: 'XP Opportunity',
        description: 'No recent failures - consider taking risks for XP and story development.',
        reason: 'No failures in last 5 rolls',
        dismissible: true,
        timestamp: now
      })
    }

    // Sort by priority and filter dismissed
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .filter(suggestion => showDismissed || !dismissedSuggestions.has(suggestion.id))
      .slice(0, maxSuggestions)
  }, [
    character,
    context,
    rollHistory,
    combat,
    currentSession,
    environment,
    dismissedSuggestions,
    showDismissed,
    maxSuggestions,
    healCharacter,
    levelUpCharacter
  ])

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]))
  }

  const getSuggestionIcon = (type: SuggestionType) => {
    switch (type) {
      case 'move': return BookOpen
      case 'equipment': return Shield
      case 'health': return Heart
      case 'resource': return Zap
      case 'advancement': return TrendingUp
      case 'tactical': return Target
      case 'roleplay': return Sparkles
      case 'warning': return AlertTriangle
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: SuggestionPriority) => {
    switch (priority) {
      case 'critical': return 'var(--destructive)'
      case 'high': return 'var(--chart-4)'
      case 'medium': return 'var(--primary)'
      case 'low': return 'var(--muted-foreground)'
    }
  }

  if (!character || suggestions.length === 0) {
    return null
  }

  return (
    <Card variant="magical">
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-primary" 
              size={20} />
            <h3 className="font-display text-lg">Smart Suggestions</h3>
            <Badge variant="secondary" size="sm">
              {suggestions.length}
            </Badge>
          </div>

          <AnimatePresence>
            {suggestions.map((suggestion, index) => {
              const Icon = getSuggestionIcon(suggestion.type)
              const isExpanded = expandedSuggestion === suggestion.id

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 ${
                      isExpanded ? 'ring-2' : 'hover:shadow-md'
                    }`}
                    style={{
                      ringColor: isExpanded ? getPriorityColor(suggestion.priority) : undefined
                    }}
                    onClick={() => setExpandedSuggestion(
                      isExpanded ? null : suggestion.id
                    )}
                  >
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: getPriorityColor(suggestion.priority),
                            opacity: 0.2 
                          }}
                        >
                          <Icon 
                            size={16} 
                            style={{ color: getPriorityColor(suggestion.priority) }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {suggestion.title}
                            </h4>
                            <Badge 
                              variant={suggestion.priority === 'critical' ? 'destructive' : 'secondary'}
                              size="xs"
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>

                          <p 
                            className="text-sm mb-2 text-muted-foreground">
                            {suggestion.description}
                          </p>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                              >
                                <div 
                                  className="text-xs p-2 rounded"
                                  style={{ 
                                    backgroundColor: 'var(--card)',
                                    color: 'var(--muted-foreground)'
                                  }}
                                >
                                  <strong>Why:</strong> {suggestion.reason}
                                </div>

                                <div className="flex items-center gap-2">
                                  {suggestion.action && (
                                    <Button
                                      variant="primary"
                                      size="xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        suggestion.action!.onClick()
                                      }}
                                    >
                                      {suggestion.action.label}
                                    </Button>
                                  )}

                                  {suggestion.dismissible && (
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDismiss(suggestion.id)
                                      }}
                                    >
                                      <X size={12} />
                                      Dismiss
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!compact && (
                            <span 
                              className="text-xs text-muted-foreground">
                              <Clock size={10} className="inline mr-1" />
                              {suggestion.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                          
                          <ChevronRight 
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {dismissedSuggestions.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissedSuggestions(new Set())}
              className="w-full"
            >
              Show {dismissedSuggestions.size} Dismissed Suggestion{dismissedSuggestions.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ContextAwareSystem
