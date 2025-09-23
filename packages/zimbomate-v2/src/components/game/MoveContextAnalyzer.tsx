/**
 * MoveContextAnalyzer - Intelligent move suggestions based on game state
 * Analyzes current situation and suggests optimal moves for the player
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, Badge } from '../ui'
import { Character } from '../../models/Character'
import { Brain, Target, Users, Eye, Zap, AlertTriangle } from 'lucide-react'

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
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface MoveContextAnalyzerProps {
  character: Character
  gameContext: GameContext
  onMoveSuggestion: (moveId: string) => void
  className?: string
}

const getStatScore = (stat: any): number => {
  if (stat == null) return 0
  if (typeof stat === 'number') return stat
  if (typeof stat === 'object') {
    if (typeof (stat as any).value === 'number') return (stat as any).value
    if (typeof (stat as any).score === 'number') return (stat as any).score
  }
  return 0
}

const analyzeContext = (character: Character, context: GameContext): MoveSuggestion[] => {
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
        icon: Target
      })
    }

    if (context.hasEnemiesNearby && getStatScore((character as any).stats?.strength) >= 13) {
      suggestions.push({
        moveId: 'hack-and-slash',
        name: 'Hack and Slash',
        reason: 'Strong character in melee range',
        priority: 'high',
        contextMatch: 0.85,
        icon: Target
      })
    }

    if (getStatScore((character as any).stats?.dexterity) >= 13) {
      suggestions.push({
        moveId: 'volley',
        name: 'Volley',
        reason: 'High dexterity for ranged attacks',
        priority: 'medium',
        contextMatch: 0.7,
        icon: Target
      })
    }
  }

  // Exploration context
  if (context.exploringNew) {
    if (getStatScore((character as any).stats?.wisdom) >= 13) {
      suggestions.push({
        moveId: 'discern-realities',
        name: 'Discern Realities',
        reason: 'High wisdom for understanding new areas',
        priority: 'high',
        contextMatch: 0.8,
        icon: Eye
      })
    }

    if (getStatScore((character as any).stats?.intelligence) >= 13) {
      suggestions.push({
        moveId: 'spout-lore',
        name: 'Spout Lore',
        reason: 'Use knowledge to understand situation',
        priority: 'medium',
        contextMatch: 0.75,
        icon: Brain
      })
    }
  }

  // Social context
  if (context.socialSituation) {
    if (getStatScore((character as any).stats?.charisma) >= 13) {
      suggestions.push({
        moveId: 'parley',
        name: 'Parley',
        reason: 'High charisma for social manipulation',
        priority: 'high',
        contextMatch: 0.85,
        icon: Users
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
      icon: Zap
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
      icon: AlertTriangle
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

const getPriorityColor = (priority: MoveSuggestion['priority']) => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-100'
    case 'medium': return 'text-yellow-600 bg-yellow-100'
    case 'low': return 'text-blue-600 bg-blue-100'
  }
}

export const MoveContextAnalyzer: React.FC<MoveContextAnalyzerProps> = ({
  character,
  gameContext,
  onMoveSuggestion,
  className = ''
}) => {
  const suggestions = useMemo(() => 
    analyzeContext(character, gameContext), 
    [character, gameContext]
  )

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
        <Brain size={20} className="text-(--color-primary)" />
        <h3 className="text-body-lg font-display text-(--color-text-primary)">
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
                    <div className="w-8 h-8 rounded-lg bg-(--color-primary)/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-(--color-primary)" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-ui-small font-medium text-(--color-text-primary) truncate">
                          {suggestion.name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-0.5 ${getPriorityColor(suggestion.priority)}`}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-(--color-text-secondary) leading-relaxed">
                        {suggestion.reason}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="text-xs text-(--color-text-secondary) font-mono">
                        {Math.round(suggestion.contextMatch * 100)}%
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
        <p className="text-xs text-(--color-text-secondary)">
          Suggestions based on current game context and character abilities
        </p>
      </motion.div>
    </motion.div>
  )
}