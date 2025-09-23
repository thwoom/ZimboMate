/**
 * Alignment XP Tracker - Track alignment actions and XP rewards
 * Phase 4A: Essential for Dungeon World alignment-based XP system
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scale, 
  Shield, 
  Heart, 
  Zap,
  Skull,
  Plus, 
  Award,
  Calendar,
  Target
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import { AlignmentActionCard } from './AlignmentActionCard'
import { useCharacterStore } from '../../../stores'
import type { Alignment } from '../../../models/Character'

interface AlignmentAction {
  id: string
  description: string
  timestamp: Date
  xpAwarded: number
  alignment: Alignment
}

interface AlignmentXPTrackerProps {
  characterId?: string
  className?: string
}

export const AlignmentXPTracker: React.FC<AlignmentXPTrackerProps> = ({ 
  characterId,
  className = '' 
}) => {
  const { getActiveCharacter, updateCharacter, addXP } = useCharacterStore()
  const [alignmentActions, setAlignmentActions] = useState<AlignmentAction[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newAction, setNewAction] = useState({
    description: '',
    xpAmount: 1
  })

  // Get character (use active if not specified)
  const character = characterId 
    ? useCharacterStore(state => state.getCharacter(characterId))
    : getActiveCharacter()

  if (!character) {
    return (
      <Card variant="surface" className={className}>
        <CardContent>
          <div className="text-center py-8">
            <Scale 
              size={48} 
              className="mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <h3 className="text-lg font-medium mb-2">No Character Selected</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Select a character to track their alignment actions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getAlignmentIcon = (alignment: Alignment) => {
    switch (alignment) {
      case 'Good':
        return <Heart size={20} className="text-pink-500" />
      case 'Lawful':
        return <Shield size={20} className="text-blue-500" />
      case 'Neutral':
        return <Scale size={20} className="text-gray-500" />
      case 'Chaotic':
        return <Zap size={20} className="text-purple-500" />
      case 'Evil':
        return <Skull size={20} className="text-red-500" />
      default:
        return <Scale size={20} className="text-gray-500" />
    }
  }

  const getAlignmentColor = (alignment: Alignment) => {
    switch (alignment) {
      case 'Good':
        return 'text-pink-600 bg-pink-100'
      case 'Lawful':
        return 'text-blue-600 bg-blue-100'
      case 'Neutral':
        return 'text-gray-600 bg-gray-100'
      case 'Chaotic':
        return 'text-purple-600 bg-purple-100'
      case 'Evil':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlignmentDescription = (alignment: Alignment) => {
    switch (alignment) {
      case 'Good':
        return 'Act with compassion, mercy, and selflessness'
      case 'Lawful':
        return 'Uphold order, honor codes, and respect authority'
      case 'Neutral':
        return 'Maintain balance and act pragmatically'
      case 'Chaotic':
        return 'Embrace freedom, change, and personal liberty'
      case 'Evil':
        return 'Pursue selfish goals regardless of harm to others'
      default:
        return 'Follow your character\'s moral compass'
    }
  }

  const createAlignmentAction = () => {
    if (!newAction.description.trim()) return

    const action: AlignmentAction = {
      id: `alignment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      description: newAction.description.trim(),
      timestamp: new Date(),
      xpAwarded: newAction.xpAmount,
      alignment: character.alignment
    }

    setAlignmentActions(prev => [action, ...prev])
    
    // Award XP to character
    addXP(
      character.id, 
      newAction.xpAmount, 
      'alignment_action', 
      `Alignment action: ${newAction.description.slice(0, 50)}${newAction.description.length > 50 ? '...' : ''}`
    )
    
    setNewAction({ description: '', xpAmount: 1 })
    setIsCreating(false)
  }

  const updateAlignmentAction = (actionId: string, updates: Partial<AlignmentAction>) => {
    setAlignmentActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, ...updates } : action
    ))
  }

  const deleteAlignmentAction = (actionId: string) => {
    setAlignmentActions(prev => prev.filter(action => action.id !== actionId))
  }

  const totalXPFromAlignment = alignmentActions.reduce((sum, action) => sum + action.xpAwarded, 0)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Alignment XP Tracker</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Track roleplay actions that match your alignment to earn XP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className={`gap-1 ${getAlignmentColor(character.alignment)}`}>
            {getAlignmentIcon(character.alignment)}
            {character.alignment}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Award size={12} />
            +{totalXPFromAlignment} XP
          </Badge>
        </div>
      </div>

      {/* Current Alignment Info */}
      <Card variant="magical">
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              {getAlignmentIcon(character.alignment)}
              <h3 className="text-xl font-medium">{character.alignment} Alignment</h3>
            </div>
            
            <p 
              className="max-w-md mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {getAlignmentDescription(character.alignment)}
            </p>

            {character.alignmentMove && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Your Alignment Move:</h4>
                <p className="text-sm text-blue-700">
                  {character.alignmentMove}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{alignmentActions.length}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Alignment Actions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 text-green-600">+{totalXPFromAlignment}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  XP Earned
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Action Button */}
      <Card variant="surface">
        <CardContent>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="w-full gap-2"
          >
            <Plus size={16} />
            Record Alignment Action
          </Button>
        </CardContent>
      </Card>

      {/* Create Action Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="magical">
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Alignment Action Description
                    </label>
                    <textarea
                      value={newAction.description}
                      onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={`Describe how you acted according to your ${character.alignment} alignment...`}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-primary)',
                        borderOpacity: 0.2,
                        color: 'var(--color-text)'
                      }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      XP to Award
                    </label>
                    <select
                      value={newAction.xpAmount}
                      onChange={(e) => setNewAction(prev => ({ ...prev, xpAmount: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-primary)',
                        borderOpacity: 0.2,
                        color: 'var(--color-text)'
                      }}
                    >
                      <option value={1}>1 XP (Standard alignment action)</option>
                      <option value={2}>2 XP (Exceptional alignment action)</option>
                      <option value={3}>3 XP (Heroic alignment action)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={createAlignmentAction}
                      disabled={!newAction.description.trim()}
                    >
                      Award XP
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false)
                        setNewAction({ description: '', xpAmount: 1 })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alignment Actions History */}
      <div className="space-y-3">
        {alignmentActions.length === 0 ? (
          <Card variant="surface">
            <CardContent>
              <div className="text-center py-8">
                <Target 
                  size={48} 
                  className="mx-auto mb-4 opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <h3 className="text-lg font-medium mb-2">No Alignment Actions Yet</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Start recording actions that match your {character.alignment} alignment to earn XP!
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Dungeon World Rule:</strong> When you act according to your alignment, 
                    the GM may award you XP for good roleplay.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar size={20} />
              Alignment Actions History
            </h3>
            <AnimatePresence>
              {alignmentActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AlignmentActionCard
                    action={action}
                    onUpdate={(updates) => updateAlignmentAction(action.id, updates)}
                    onDelete={() => deleteAlignmentAction(action.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}