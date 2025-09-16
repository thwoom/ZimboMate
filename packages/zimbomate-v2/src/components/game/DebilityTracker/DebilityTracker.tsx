/**
 * Debility Tracker - Track debilities that affect dice rolls
 * Phase 4A: Essential for Dungeon World debility mechanics
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle,
  Activity,
  Users
} from 'lucide-react'
import { Card, CardContent, Badge } from '../../ui'
import { DebilityCard } from './DebilityCard'
import { DebilityEffects } from './DebilityEffects'
import { useCharacterStore } from '../../../stores'
import type { Debilities, Attribute } from '../../../models/Character'

interface DebilityTrackerProps {
  characterId?: string
  className?: string
}

export const DebilityTracker: React.FC<DebilityTrackerProps> = ({ 
  characterId,
  className = '' 
}) => {
  const { getActiveCharacter, updateCharacter } = useCharacterStore()

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
              Select a character to manage their debilities.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const debilities = character.debilities
  const activeDebilities = Object.entries(debilities).filter(([_, active]) => active)
  const debilityCount = activeDebilities.length

  const updateDebility = (debilityKey: keyof Debilities, active: boolean) => {
    const updatedDebilities = {
      ...character.debilities,
      [debilityKey]: active
    }
    updateCharacter(character.id, { debilities: updatedDebilities })
  }

  const clearAllDebilities = () => {
    const clearedDebilities: Debilities = {
      weak: false,
      shaky: false,
      sick: false,
      stunned: false,
      confused: false,
      scarred: false
    }
    updateCharacter(character.id, { debilities: clearedDebilities })
  }

  const debilityDefinitions = [
    {
      key: 'weak' as keyof Debilities,
      name: 'Weak',
      attribute: 'STR' as Attribute,
      description: 'Your muscles are weakened, reducing your physical strength',
      effect: '-1 to STR rolls',
      color: 'text-red-600 bg-red-100',
      active: debilities.weak
    },
    {
      key: 'shaky' as keyof Debilities,
      name: 'Shaky',
      attribute: 'DEX' as Attribute,
      description: 'Your hands tremble, affecting your dexterity and precision',
      effect: '-1 to DEX rolls',
      color: 'text-orange-600 bg-orange-100',
      active: debilities.shaky
    },
    {
      key: 'sick' as keyof Debilities,
      name: 'Sick',
      attribute: 'CON' as Attribute,
      description: 'You are ill or poisoned, weakening your constitution',
      effect: '-1 to CON rolls',
      color: 'text-green-600 bg-green-100',
      active: debilities.sick
    },
    {
      key: 'stunned' as keyof Debilities,
      name: 'Stunned',
      attribute: 'INT' as Attribute,
      description: 'Your mind is dazed, making it hard to think clearly',
      effect: '-1 to INT rolls',
      color: 'text-blue-600 bg-blue-100',
      active: debilities.stunned
    },
    {
      key: 'confused' as keyof Debilities,
      name: 'Confused',
      attribute: 'WIS' as Attribute,
      description: 'Your perception is clouded, affecting your wisdom',
      effect: '-1 to WIS rolls',
      color: 'text-purple-600 bg-purple-100',
      active: debilities.confused
    },
    {
      key: 'scarred' as keyof Debilities,
      name: 'Scarred',
      attribute: 'CHA' as Attribute,
      description: 'Physical or emotional scars affect your charisma',
      effect: '-1 to CHA rolls',
      color: 'text-pink-600 bg-pink-100',
      active: debilities.scarred
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Debility Tracker</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Track conditions that reduce your attribute modifiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={debilityCount > 0 ? "default" : "secondary"} 
            className={`gap-1 ${debilityCount > 0 ? 'bg-red-100 text-red-800' : ''}`}
          >
            <AlertTriangle size={12} />
            {debilityCount} Active
          </Badge>
          {debilityCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Activity size={12} />
              -{debilityCount} to rolls
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <Card variant={debilityCount > 0 ? "magical" : "glass"} padding="lg">
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle 
                size={24} 
                className={debilityCount > 0 ? "text-red-500" : "text-gray-400"}
              />
              <h3 className="text-xl font-medium">
                {debilityCount > 0 ? `${debilityCount} Active Debilities` : 'No Active Debilities'}
              </h3>
            </div>
            
            <p 
              className="max-w-md mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {debilityCount > 0 
                ? 'These debilities are currently affecting your dice rolls and attribute modifiers.'
                : 'Your character is in good health with no debilities affecting their abilities.'
              }
            </p>

            {debilityCount > 0 && (
              <div className="pt-4">
                <button
                  onClick={clearAllDebilities}
                  className="px-4 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Clear All Debilities
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debility Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {debilityDefinitions.map((debility, index) => (
          <motion.div
            key={debility.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <DebilityCard
              debility={debility}
              onToggle={(active) => updateDebility(debility.key, active)}
            />
          </motion.div>
        ))}
      </div>

      {/* Effects Summary */}
      {debilityCount > 0 && (
        <DebilityEffects 
          character={character}
          debilities={debilities}
        />
      )}

      {/* Help Text */}
      <Card variant="glass" padding="lg">
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              About Debilities
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h5 className="font-medium mb-2">How Debilities Work:</h5>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li>• Each debility reduces the related attribute modifier by 1</li>
                  <li>• This affects all dice rolls using that attribute</li>
                  <li>• Multiple debilities can stack their effects</li>
                  <li>• Debilities persist until healed or removed</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Removing Debilities:</h5>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                  <li>• Rest and medical attention</li>
                  <li>• Magical healing (some debilities)</li>
                  <li>• Specific moves or abilities</li>
                  <li>• GM discretion based on narrative</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}