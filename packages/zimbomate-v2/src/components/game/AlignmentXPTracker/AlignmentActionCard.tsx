/**
 * Alignment Action Card - Individual alignment action display and management
 * Phase 4A: Essential for tracking alignment-based XP actions
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Scale, 
  Shield, 
  Heart, 
  Zap,
  Skull,
  Edit3, 
  Trash2, 
  Check, 
  X,
  Award,
  Calendar
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import type { Alignment } from '../../../models/Character'

interface AlignmentAction {
  id: string
  description: string
  timestamp: Date
  xpAwarded: number
  alignment: Alignment
}

interface AlignmentActionCardProps {
  action: AlignmentAction
  onUpdate: (updates: Partial<AlignmentAction>) => void
  onDelete: () => void
}

export const AlignmentActionCard: React.FC<AlignmentActionCardProps> = ({
  action,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editDescription, setEditDescription] = useState(action.description)
  const [editXP, setEditXP] = useState(action.xpAwarded)

  const getAlignmentIcon = (alignment: Alignment) => {
    switch (alignment) {
      case 'Good':
        return <Heart size={16} className="text-pink-500" />
      case 'Lawful':
        return <Shield size={16} className="text-blue-500" />
      case 'Neutral':
        return <Scale size={16} className="text-gray-500" />
      case 'Chaotic':
        return <Zap size={16} className="text-purple-500" />
      case 'Evil':
        return <Skull size={16} className="text-red-500" />
      default:
        return <Scale size={16} className="text-gray-500" />
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

  const handleSaveEdit = () => {
    if (!editDescription.trim()) return
    
    onUpdate({
      description: editDescription.trim(),
      xpAwarded: editXP
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditDescription(action.description)
    setEditXP(action.xpAwarded)
    setIsEditing(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Card variant="surface">
      <CardContent className="p-6 pt-6">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Action Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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
                XP Awarded
              </label>
              <select
                value={editXP}
                onChange={(e) => setEditXP(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  borderOpacity: 0.2,
                  color: 'var(--color-text)'
                }}
              >
                <option value={1}>1 XP (Standard)</option>
                <option value={2}>2 XP (Exceptional)</option>
                <option value={3}>3 XP (Heroic)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editDescription.trim()}
                className="gap-1"
              >
                <Check size={14} />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-1"
              >
                <X size={14} />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getAlignmentIcon(action.alignment)}
                  <Badge variant="secondary" className={`gap-1 ${getAlignmentColor(action.alignment)}`}>
                    {action.alignment}
                  </Badge>
                  <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                    <Award size={10} />
                    +{action.xpAwarded} XP
                  </Badge>
                </div>
                
                <p 
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {action.description}
                </p>

                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar size={12} />
                  <span>{formatTime(action.timestamp)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsEditing(true)}
                  title="Edit action"
                >
                  <Edit3 size={14} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onDelete}
                  title="Delete action"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}