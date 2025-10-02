/**
 * MoveContextAnalyzer - Intelligent move suggestions based on game state
 * Analyzes current situation and suggests optimal moves for the player
 */

import type { Character } from '../../models/Character'
import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Eye, Target, Users, Zap } from 'lucide-react'
import React, { useMemo } from 'react'
import { Badge, Card, CardContent } from '../ui'

interface GameContext {
  inCombat: boolean
  hasEnemiesNearby: boolean
  lowHealth: boolean
  hasSpellsReady: boolean
  hasAllies: boolean
  inDanger: boolean
  exploringNew: boolean
  socialSituation: boolean
}

interface MoveSuggestion {
  moveId: string
  name: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  contextMatch: number
  icon: React.ComponentType<{ size?: number, className?: string }>
}

interface MoveContextAnalyzerProps {
  character: Character
  gameContext: GameContext
  onMoveSuggestion: (moveId: string) => void
  className?: string
}

function getStatScore(value: number | undefined): number {
  return typeof value === 'number' ? value : 0
}

function analyzeContext(character: Character, context: GameContext): MoveSuggestion[] {
  const suggestions: MoveSuggestion[] = []

  // Combat context analysis
  if (context.inCombat) {
    if (character.hp.current < character.hp.max * 0.3) {
      suggestions.push({
        moveId: 'defend',
        name: 'Defend',
        reason: 'Low health - prioritize defense',
        priority: 'high',
        contextMatch: 0.9,
        icon: Target,
      })
    }

    if (context.hasEnemiesNearby && getStatScore(character.attributes.STR) >= 13) {
      suggestions.push({
        moveId: 'hack-and-slash',
        name: 'Hack and Slash',
        reason: 'Strong character in melee range',
        priority: 'high',
        contextMatch: 0.85,
        icon: Target,
      })
    }

    if (getStatScore(character.attributes.DEX) >= 13) {
      suggestions.push({
        moveId: 'volley',
        name: 'Volley',
        reason: 'High dexterity for ranged attacks',
        priority: 'medium',
        contextMatch: 0.7,
        icon: Target,
      })
    }
  }

  // Exploration context
  if (context.exploringNew) {
    if (getStatScore(character.attributes.WIS) >= 13) {
      suggestions.push({
        moveId: 'discern-realities',
        name: 'Discern Realities',
        reason: 'High wisdom for understanding new areas',
        priority: 'high',
        contextMatch: 0.8,
        icon: Eye,
      })
    }

    if (getStatScore(character.attributes.INT) >= 13) {
      suggestions.push({
        moveId: 'spout-lore',
        name: 'Spout Lore',
        reason: 'Use knowledge to understand situation',
        priority: 'medium',
        contextMatch: 0.75,
        icon: Brain,
      })
    }
  }

  // Social context
  if (context.socialSituation) {
    if (getStatScore(character.attributes.CHA) >= 13) {
      suggestions.push({
        moveId: 'parley',
        name: 'Parley',
        reason: 'High charisma for social manipulation',
        priority: 'high',
        contextMatch: 0.85,
        icon: Users,
      })
    }
  }

  // Spellcasting context
  if (context.hasSpellsReady && character.class === 'wizard') {
    suggestions.push({
      moveId: 'cast-spell',
      name: 'Cast a Spell',
      reason: 'Spells prepared and ready to cast',
      priority: 'medium',
      contextMatch: 0.8,
      icon: Zap,
    })
  }

  // Danger context
  if (context.inDanger) {
    suggestions.push({
      moveId: 'defy-danger',
      name: 'Defy Danger',
      reason: 'Immediate danger requires action',
      priority: 'high',
      contextMatch: 0.95,
      icon: AlertTriangle,
    })
  }

  // Sort by priority and context match
  return suggestions.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityWeight[a.priority]
    const bPriority = priorityWeight[b.priority]

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    return b.contextMatch - a.contextMatch
  }).slice(0, 3) // Top 3 suggestions
}

function getPriorityColor(priority: MoveSuggestion['priority']) {
  switch (priority) {
    case 'high': return 'text-destructive bg-destructive/15'
    case 'medium': return 'text-chart-4 bg-chart-4/15'
    case 'low': return 'text-primary bg-primary/10'
  }
}

export const MoveContextAnalyzer: React.FC<MoveContextAnalyzerProps> = ({
  character,
  gameContext,
  onMoveSuggestion,
  className = '',
}) => {
  const suggestions = useMemo(() =>
    analyzeContext(character, gameContext), [character, gameContext])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain size={20} className="text-primary" />
        <h3 className="text-body-lg font-display text-foreground">
          Suggested Moves
        </h3>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon

          return (
            <motion.div
              key={suggestion.moveId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                variant="surface"
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                onClick={() => onMoveSuggestion(suggestion.moveId)}
              >
                <CardContent className="p-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-ui-small font-medium text-foreground truncate">
                          {suggestion.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 ${getPriorityColor(suggestion.priority)}`}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.reason}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="text-xs text-muted-foreground font-mono">
                        {Math.round(suggestion.contextMatch * 100)}
                        %
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <p className="text-xs text-muted-foreground">
          Suggestions based on current game context and character abilities
        </p>
      </motion.div>
    </motion.div>
  )
}
