/**
 * Debility Effects - Shows how debilities affect dice rolls and modifiers
 * Phase 4A: Essential for understanding debility impact
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingDown,
  Dice6,
  Activity,
  Zap,
  Heart,
  HelpCircle,
  User
} from 'lucide-react'
import { Card, CardContent, Badge } from '../../ui'
import type { Character, Attribute, Debilities } from '../../../models/Character'
import { getAttributeModifier, getEffectiveModifier } from '../../../models/Character'

interface DebilityEffectsProps {
  character: Character
  debilities: Debilities
}

export const DebilityEffects: React.FC<DebilityEffectsProps> = ({
  character,
  debilities
}) => {
  const getScore = (v: any): number => {
    if (typeof v === 'number') return v
    if (v && typeof v.value === 'number') return v.value
    return 10
  }

  // Normalize attributes to numeric scores in case store holds { value, modifier }
  const normalizedAttributes = (Object.keys(character.attributes) as Attribute[]).reduce((acc, key) => {
    ;(acc as any)[key] = getScore((character.attributes as any)[key])
    return acc
  }, {} as Record<Attribute, number>) as any
  const getAttributeIcon = (attribute: Attribute) => {
    switch (attribute) {
      case 'STR':
        return <Activity size={16} />
      case 'DEX':
        return <Zap size={16} />
      case 'CON':
        return <Heart size={16} />
      case 'INT':
        return <User size={16} />
      case 'WIS':
        return <HelpCircle size={16} />
      case 'CHA':
        return <User size={16} />
      default:
        return <Activity size={16} />
    }
  }

  const attributeEffects = (Object.keys(character.attributes) as Attribute[]).map(attr => {
    const score = getScore((character.attributes as any)[attr])
    const baseModifier = getAttributeModifier(score)
    const effectiveModifier = getEffectiveModifier(attr, normalizedAttributes as any, debilities)
    const penalty = baseModifier - effectiveModifier
    
    return {
      attribute: attr,
      score,
      baseModifier,
      effectiveModifier,
      penalty,
      hasDebility: penalty > 0
    }
  }).filter(effect => effect.hasDebility)

  const totalPenalty = attributeEffects.reduce((sum, effect) => sum + effect.penalty, 0)

  if (attributeEffects.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="magical" padding="lg">
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={20} className="text-red-500" />
                <h3 className="text-lg font-medium">Debility Effects</h3>
              </div>
              <Badge variant="default" className="gap-1 bg-red-100 text-red-800">
                <Dice6 size={12} />
                -{totalPenalty} to rolls
              </Badge>
            </div>

            {/* Affected Attributes */}
            <div className="grid gap-3 md:grid-cols-2">
              {attributeEffects.map((effect, index) => (
                <motion.div
                  key={effect.attribute}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getAttributeIcon(effect.attribute)}
                      <span className="font-medium">{effect.attribute}</span>
                      <Badge variant="secondary" className="text-xs">
                        Score: {effect.score}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">
                        <span className="line-through">+{effect.baseModifier}</span>
                        {' → '}
                        <span className="font-bold">
                          {effect.effectiveModifier >= 0 ? '+' : ''}{effect.effectiveModifier}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <TrendingDown size={14} />
                    <span>-{effect.penalty} penalty from debility</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <Dice6 size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">
                    Dice Roll Impact
                  </h4>
                  <p className="text-sm text-yellow-700">
                    When making moves that use affected attributes, you'll roll 2d6 with reduced modifiers. 
                    This makes success (10+) harder to achieve and increases the chance of failure (6-).
                  </p>
                  {totalPenalty >= 3 && (
                    <p className="text-sm text-red-700 mt-2 font-medium">
                      ⚠️ Warning: Multiple debilities are severely impacting your character's effectiveness!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Healing Reminder */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Remember:</strong> Debilities can be healed through rest, medical attention, 
                magical healing, or specific moves. Work with your GM to find ways to recover!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}