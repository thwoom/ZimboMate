/**
 * Debility Card - Individual debility toggle and display
 * Phase 4A: Essential for managing individual debilities
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Skull, 
  AlertTriangle, 
  HelpCircle,
  Heart,
  User,
  Activity
} from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import { Card, CardContent, Badge } from '../../ui'
import type { Debilities, Attribute } from '../../../models/Character'

interface DebilityDefinition {
  key: keyof Debilities
  name: string
  attribute: Attribute
  description: string
  effect: string
  color: string
  active: boolean
}

interface DebilityCardProps {
  debility: DebilityDefinition
  onToggle: (active: boolean) => void
}

export const DebilityCard: React.FC<DebilityCardProps> = ({
  debility,
  onToggle
}) => {
  const getDebilityIcon = (debilityKey: keyof Debilities) => {
    switch (debilityKey) {
      case 'weak':
        return <Activity size={20} className="text-destructive" />
      case 'shaky':
        return <Zap size={20} className="text-chart-4" />
      case 'sick':
        return <AlertTriangle size={20} className="text-chart-2" />
      case 'stunned':
        return <HelpCircle size={20} className="text-primary" />
      case 'confused':
        return <HelpCircle size={20} className="text-accent" />
      case 'scarred':
        return <Heart size={20} className="text-accent" />
      default:
        return <AlertTriangle size={20} className="text-muted-foreground" />
    }
  }

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
        return <AlertTriangle size={16} />
    }
  }

  return (
    <Card 
      variant={debility.active ? "magical" : "surface"}
      className={`relative transition-all duration-300 ${
        debility.active ? 'ring-2 ring-red-200' : ''
      }`}
    >
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getDebilityIcon(debility.key)}
              <div>
                <h4 className="font-medium">{debility.name}</h4>
                <Badge variant="secondary" className={`gap-1 text-xs ${debility.color}`}>
                  {getAttributeIcon(debility.attribute)}
                  {debility.attribute}
                </Badge>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <Switch.Root
              checked={debility.active}
              onCheckedChange={onToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${debility.active 
                  ? 'bg-destructive/120' 
                  : 'bg-muted'
                }
              `}
            >
              <Switch.Thumb
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-card transition-transform
                  ${debility.active ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </Switch.Root>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p 
              className="text-sm text-muted-foreground">
              {debility.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={debility.active ? "default" : "secondary"}
                className={`text-xs ${debility.active ? 'bg-destructive/15 text-destructive' : ''}`}
              >
                {debility.effect}
              </Badge>
            </div>
          </div>

          {/* Active State Indicator */}
          {debility.active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-destructive/12 rounded-lg border border-destructive/30"
            >
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle size={14} />
                <span className="font-medium">Active Debility</span>
              </div>
              <p className="text-xs text-destructive mt-1">
                This debility is currently affecting your {debility.attribute} rolls.
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}



