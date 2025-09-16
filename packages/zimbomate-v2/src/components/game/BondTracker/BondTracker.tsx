/**
 * Bond Tracker - Character relationship management and XP integration
 * Phase 4A: Essential for Dungeon World XP system
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  Check,
  Star,
  Users,
  Award
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import { BondCard } from './BondCard'
import { useCharacterStore } from '../../../stores'
import type { Bond } from '../../../models/Character'

interface BondTrackerProps {
  characterId?: string
  className?: string
}

export const BondTracker: React.FC<BondTrackerProps> = ({ 
  characterId,
  className = '' 
}) => {
  const { getActiveCharacter, updateCharacter, addXP } = useCharacterStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newBondText, setNewBondText] = useState('')
  const [newBondCharacter, setNewBondCharacter] = useState('')

  // Get character (use active if not specified)
  const character = characterId 
    ? useCharacterStore(state => state.getCharacter(characterId))
    : getActiveCharacter()

  if (!character) {
    return (
      <Card variant="glass" padding="lg" className={className}>
        <CardContent>
          <div className="text-center py-8">
            <Users 
              size={48} 
              className="mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <h3 className="text-lg font-medium mb-2">No Character Selected</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Select a character to manage their bonds.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const bonds = character.bonds || []
  const resolvedBonds = bonds.filter(bond => bond.resolved)
  const activeBonds = bonds.filter(bond => !bond.resolved)

  const createBond = () => {
    if (!newBondText.trim()) return

    const newBond: Bond = {
      id: `bond-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      text: newBondText.trim(),
      characterName: newBondCharacter.trim() || undefined,
      resolved: false
    }

    const updatedBonds = [...bonds, newBond]
    updateCharacter(character.id, { bonds: updatedBonds })
    
    setNewBondText('')
    setNewBondCharacter('')
    setIsCreating(false)
  }

  const updateBond = (bondId: string, updates: Partial<Bond>) => {
    const updatedBonds = bonds.map(bond => 
      bond.id === bondId ? { ...bond, ...updates } : bond
    )
    updateCharacter(character.id, { bonds: updatedBonds })
  }

  const deleteBond = (bondId: string) => {
    const updatedBonds = bonds.filter(bond => bond.id !== bondId)
    updateCharacter(character.id, { bonds: updatedBonds })
  }

  const resolveBond = (bondId: string) => {
    // Mark bond as resolved
    updateBond(bondId, { resolved: true })
    
    // Award XP for bond resolution (official Dungeon World rule)
    addXP(character.id, 1, 'bond_resolution', 'Resolved a bond with another character')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Character Bonds</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage relationships and earn XP through bond resolution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Heart size={12} />
            {activeBonds.length} Active
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Award size={12} />
            {resolvedBonds.length} Resolved
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      <Card variant="magical" padding="lg">
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold mb-1">{bonds.length}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Total Bonds
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1 text-green-600">{resolvedBonds.length}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Resolved (+XP)
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1 text-blue-600">{activeBonds.length}</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Active Bonds
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Bond Button */}
      <Card variant="glass" padding="sm">
        <CardContent>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="w-full gap-2"
          >
            <Plus size={16} />
            Add New Bond
          </Button>
        </CardContent>
      </Card>

      {/* Create Bond Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="magical" padding="lg">
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bond Text
                    </label>
                    <textarea
                      value={newBondText}
                      onChange={(e) => setNewBondText(e.target.value)}
                      placeholder="e.g., I will prove my worth to Theron by..."
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
                      value={newBondCharacter}
                      onChange={(e) => setNewBondCharacter(e.target.value)}
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
                      onClick={createBond}
                      disabled={!newBondText.trim()}
                    >
                      Create Bond
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false)
                        setNewBondText('')
                        setNewBondCharacter('')
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

      {/* Active Bonds */}
      {activeBonds.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            Active Bonds
          </h3>
          {activeBonds.map((bond, index) => (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <BondCard
                bond={bond}
                onUpdate={(updates) => updateBond(bond.id, updates)}
                onDelete={() => deleteBond(bond.id)}
                onResolve={() => resolveBond(bond.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolved Bonds */}
      {resolvedBonds.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Award size={20} className="text-green-500" />
            Resolved Bonds (+{resolvedBonds.length} XP)
          </h3>
          {resolvedBonds.map((bond, index) => (
            <motion.div
              key={bond.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <BondCard
                bond={bond}
                onUpdate={(updates) => updateBond(bond.id, updates)}
                onDelete={() => deleteBond(bond.id)}
                isResolved
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {bonds.length === 0 && (
        <Card variant="glass" padding="lg">
          <CardContent>
            <div className="text-center py-8">
              <Heart 
                size={48} 
                className="mx-auto mb-4 opacity-50"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <h3 className="text-lg font-medium mb-2">No Bonds Yet</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Create bonds with other characters to earn XP through roleplay and relationships!
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Dungeon World Rule:</strong> When you resolve a bond, mark XP and write a new bond or strengthen an existing one.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}