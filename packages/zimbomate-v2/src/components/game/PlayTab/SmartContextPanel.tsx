/**
 * SmartContextPanel - AI Game Assistant
 *
 * Provides contextual suggestions, situation awareness, and smart
 * recommendations based on current game state and recent actions.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  Info,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Zap,
  Shield,
  Heart,
  Star,
  ArrowRight,
  Eye,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import type { Character } from '../../../models/Character'
import type { GameMode, PlayTabTheme } from '../PlayTab'

interface SmartContextPanelProps {
  character: Character
  gameMode: GameMode
  theme: PlayTabTheme
  chronicleEnabled: boolean
  className?: string
}

interface Suggestion {
  id: string
  type: 'tip' | 'warning' | 'opportunity' | 'chronicle'
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  priority: 'high' | 'medium' | 'low'
  action?: {
    label: string
    onClick: () => void
  }
}

interface SiturationAlert {
  id: string
  type: 'danger' | 'opportunity' | 'reminder'
  message: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  timestamp: Date
}

const SuggestionCard: React.FC<{
  suggestion: Suggestion
  onDismiss: (id: string) => void
}> = ({ suggestion, onDismiss }) => {
  const Icon = suggestion.icon

  const priorityColor = {
    high: 'border-red-200 bg-red-50 dark:bg-red-950/20',
    medium: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
    low: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
  }

  const iconColor = {
    tip: 'text-blue-600',
    warning: 'text-red-600',
    opportunity: 'text-green-600',
    chronicle: 'text-purple-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-3 rounded-lg border ${priorityColor[suggestion.priority]} relative`}
    >
      <button
        onClick={() => onDismiss(suggestion.id)}
        className="absolute top-2 right-2 w-4 h-4 text-gray-400 hover:text-gray-600 text-xs"
      >
        ×
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Icon size={16} className={iconColor[suggestion.type]} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium mb-1">{suggestion.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {suggestion.description}
          </p>
          {suggestion.action && (
            <Button
              size="sm"
              variant="ghost"
              onClick={suggestion.action.onClick}
              className="text-xs px-2 py-1 h-auto"
            >
              {suggestion.action.label}
              <ArrowRight size={10} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const SituationBar: React.FC<{
  situation: string
  confidence: number
  gameMode: GameMode
}> = ({ situation, confidence, gameMode }) => {
  const modeColor = {
    combat: 'bg-red-500',
    exploration: 'bg-green-500',
    social: 'bg-blue-500',
    rest: 'bg-purple-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Current Situation</span>
        <Badge variant="secondary" className="text-xs">
          {confidence}% confident
        </Badge>
      </div>
      <div className={`p-3 rounded-lg ${modeColor[gameMode]} text-white`}>
        <p className="text-sm">{situation}</p>
      </div>
    </div>
  )
}

const QuickStats: React.FC<{ character: Character }> = ({ character }) => {
  const hp = character.hitPoints?.current || 0
  const maxHP = character.hitPoints?.max || 1
  const armor = character.armor || 0
  const load = character.load?.current || 0
  const maxLoad = character.load?.max || 10

  const hpPercentage = (hp / maxHP) * 100
  const loadPercentage = (load / maxLoad) * 100

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Quick Status</div>

      {/* HP Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Heart size={12} className={
            hpPercentage <= 25 ? 'text-red-500' :
            hpPercentage <= 50 ? 'text-yellow-500' :
            'text-green-500'
          } />
          <span>Health</span>
        </div>
        <span className="font-mono">{hp}/{maxHP}</span>
      </div>

      {/* Armor */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-blue-500" />
          <span>Armor</span>
        </div>
        <span className="font-mono">{armor}</span>
      </div>

      {/* Load Warning */}
      {loadPercentage >= 80 && (
        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle size={12} />
          <span>Heavy load ({load}/{maxLoad})</span>
        </div>
      )}
    </div>
  )
}

export const SmartContextPanel: React.FC<SmartContextPanelProps> = ({
  character,
  gameMode,
  theme,
  chronicleEnabled,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [currentSituation, setCurrentSituation] = useState('')
  const [confidence, setConfidence] = useState(75)

  // Generate contextual suggestions based on game state
  const generateSuggestions = useMemo(() => {
    const newSuggestions: Suggestion[] = []

    // Health-based suggestions
    const hpPercentage = ((character.hitPoints?.current || 0) / (character.hitPoints?.max || 1)) * 100
    if (hpPercentage <= 25) {
      newSuggestions.push({
        id: 'low-hp-warning',
        type: 'warning',
        title: 'Low Health!',
        description: 'Consider healing or defensive actions',
        icon: Heart,
        priority: 'high',
        action: {
          label: 'Find Healing',
          onClick: () => console.log('Look for healing options')
        }
      })
    }

    // Load-based suggestions
    const loadPercentage = ((character.load?.current || 0) / (character.load?.max || 10)) * 100
    if (loadPercentage >= 80) {
      newSuggestions.push({
        id: 'heavy-load-tip',
        type: 'tip',
        title: 'Heavy Load',
        description: 'You may want to drop some items or find storage',
        icon: AlertTriangle,
        priority: 'medium'
      })
    }

    // Game mode specific suggestions
    switch (gameMode) {
      case 'combat':
        newSuggestions.push({
          id: 'combat-tip',
          type: 'tip',
          title: 'In Combat',
          description: 'Consider your positioning and action economy',
          icon: Target,
          priority: 'medium'
        })
        break

      case 'exploration':
        newSuggestions.push({
          id: 'exploration-opportunity',
          type: 'opportunity',
          title: 'Explore Wisely',
          description: 'Look for secrets and gather information',
          icon: Eye,
          priority: 'low'
        })
        break

      case 'social':
        newSuggestions.push({
          id: 'social-tip',
          type: 'opportunity',
          title: 'Social Interaction',
          description: 'This could be a chance to build bonds or gather intel',
          icon: Users,
          priority: 'medium'
        })
        break
    }

    // Chronicle suggestions
    if (chronicleEnabled) {
      newSuggestions.push({
        id: 'chronicle-reminder',
        type: 'chronicle',
        title: 'Chronicle Opportunity',
        description: 'Recent actions deserve a story entry',
        icon: BookOpen,
        priority: 'low',
        action: {
          label: 'Add to Chronicle',
          onClick: () => console.log('Open Chronicle')
        }
      })
    }

    return newSuggestions
  }, [character, gameMode, chronicleEnabled])

  // Update suggestions when game state changes
  useEffect(() => {
    setSuggestions(generateSuggestions)
  }, [generateSuggestions])

  // Update situation analysis
  useEffect(() => {
    const situations = {
      combat: 'Engaged in dangerous combat',
      exploration: 'Exploring unknown territory',
      social: 'In conversation with NPCs',
      rest: 'Taking time to rest and recover'
    }

    setCurrentSituation(situations[gameMode])

    // Mock confidence calculation based on character state
    const hpPercentage = ((character.hitPoints?.current || 0) / (character.hitPoints?.max || 1)) * 100
    const baseConfidence = hpPercentage > 50 ? 80 : 60
    setConfidence(baseConfidence + Math.floor(Math.random() * 20))
  }, [gameMode, character])

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  const cardVariant =
    theme === 'combat' ? 'elevated' :
    theme === 'dungeon' ? 'parchment' :
    theme === 'tavern' ? 'magical' :
    'glass'

  return (
    <Card
      variant={cardVariant}
      className={`h-full overflow-y-auto ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain size={16} className="text-blue-600" />
          Smart Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Situation Analysis */}
        <SituationBar
          situation={currentSituation}
          confidence={confidence}
          gameMode={gameMode}
        />

        {/* Quick Character Stats */}
        <QuickStats character={character} />

        {/* Contextual Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suggestions</span>
            <Badge variant="secondary" className="text-xs">
              {suggestions.length}
            </Badge>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {suggestions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-gray-500 py-4"
                >
                  <Lightbulb size={16} className="mx-auto mb-2 opacity-50" />
                  <p>No suggestions at the moment</p>
                  <p>Keep playing to get smart tips!</p>
                </motion.div>
              ) : (
                suggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onDismiss={dismissSuggestion}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chronicle Integration Status */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Chronicle</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${chronicleEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-gray-500">
                {chronicleEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SmartContextPanel