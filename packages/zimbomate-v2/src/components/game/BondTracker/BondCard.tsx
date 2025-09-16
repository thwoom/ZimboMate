/**
 * Bond Card - Individual bond display and resolution
 * Phase 4A: Essential for Dungeon World bond system
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  User,
  Award,
  Calendar
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import type { Bond } from '../../../models/Character'

interface BondCardProps {
  bond: Bond
  onUpdate: (updates: Partial<Bond>) => void
  onDelete: () => void
  onResolve?: () => void
  isResolved?: boolean
}

export const BondCard: React.FC<BondCardProps> = ({
  bond,
  onUpdate,
  onDelete,
  onResolve,
  isResolved = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(bond.text)
  const [editCharacter, setEditCharacter] = useState(bond.characterName || '')

  const handleSaveEdit = () => {
    if (!editText.trim()) return
    
    onUpdate({
      text: editText.trim(),
      characterName: editCharacter.trim() || undefined
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(bond.text)
    setEditCharacter(bond.characterName || '')
    setIsEditing(false)
  }

  return (
    <Card 
      variant={isResolved ? "glass" : "magical"} 
      padding="lg"
      className={`relative ${isResolved ? 'opacity-75' : ''}`}
    >
      <CardContent>
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bond Text
              </label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
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
                Character Name (optional)
              </label>
              <input
                type="text"
                value={editCharacter}
                onChange={(e) => setEditCharacter(e.target.value)}
                placeholder="Name of the character this bond is with"
                className="w-full px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  borderOpacity: 0.2,
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editText.trim()}
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
                  {isResolved ? (
                    <Award size={16} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Heart size={16} className="text-red-500 flex-shrink-0" />
                  )}
                  {bond.characterName && (
                    <Badge variant="secondary" className="gap-1">
                      <User size={10} />
                      {bond.characterName}
                    </Badge>
                  )}
                  {isResolved && (
                    <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                      <Award size={10} />
                      +1 XP
                    </Badge>
                  )}
                </div>
                
                <p 
                  className={`text-sm leading-relaxed ${isResolved ? 'line-through' : ''}`}
                  style={{ color: isResolved ? 'var(--color-text-muted)' : 'var(--color-text)' }}
                >
                  {bond.text}
                </p>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                {!isResolved && onResolve && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onResolve}
                    title="Resolve bond (+1 XP)"
                    className="gap-1 text-green-600 hover:text-green-700"
                  >
                    <Check size={14} />
                    Resolve
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsEditing(true)}
                  title="Edit bond"
                >
                  <Edit3 size={14} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onDelete}
                  title="Delete bond"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {/* Bond Resolution Info */}
            {!isResolved && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>How to resolve:</strong> When this bond is fulfilled through roleplay, 
                  click "Resolve" to gain 1 XP and create a new bond or strengthen an existing one.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}