/**
 * CharacterStatusWidget - At-a-Glance Character Vitals
 *
 * Always-visible character status including animated health orb,
 * load meter, XP progress, active bonds, and debilities.
 */

import type { Character } from '../../../models/Character'
import type { GameMode, PlayTabTheme } from '../PlayTab'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Droplets,
  Heart,
  Package,
  Shield,
  Star,
  Wind,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, CardContent } from '../../ui'

interface CharacterStatusWidgetProps {
  character: Character
  gameMode: GameMode
  theme: PlayTabTheme
  className?: string
}

interface HealthOrbProps {
  current: number
  max: number
  size?: number
  variant?: 'primary' | 'danger' | 'warning'
}

const HealthOrb: React.FC<HealthOrbProps> = ({
  current,
  max,
  size = 80,
  variant = 'primary',
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const strokeDasharray = 2 * Math.PI * (size / 2 - 8)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

  const getColor = () => {
    if (percentage <= 25)
      return 'text-destructive'
    if (percentage <= 50)
      return 'text-chart-4'
    return 'text-chart-2'
  }

  const getPulseIntensity = () => {
    if (percentage <= 25)
      return 'animate-pulse'
    return ''
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${getPulseIntensity()}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted-foreground"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className={getColor()}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: strokeDasharray }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Heart size={16} className={`${getColor()} mb-1`} />
        <span className="text-lg font-bold font-display">
          {current}
        </span>
        <span className="text-xs text-muted-foreground">
          /
          {max}
        </span>
      </div>
    </div>
  )
}

const LoadMeter: React.FC<{ current: number, max: number }> = ({ current, max }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const isNearCapacity = percentage >= 80
  const isOverloaded = current > max

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1">
          <Package size={14} />
          Load
        </span>
        <span className={`font-mono ${isOverloaded ? 'text-destructive' : ''}`}>
          {current}
          /
          {max}
        </span>
      </div>

      <div className="relative h-2 bg-muted  rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isOverloaded
              ? 'bg-destructive/120'
              : isNearCapacity
                ? 'bg-chart-4/120'
                : 'bg-chart-2'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {isOverloaded && (
          <motion.div
            className="absolute top-0 right-0 h-full bg-destructive"
            style={{ width: `${(current - max) / max * 100}%` }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  )
}

const XPTracker: React.FC<{ xp: number, level: number }> = ({ xp, level }) => {
  const xpToNext = (level + 1) * 7 - xp
  const progress = xp - (level * 7)
  const progressMax = 7

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1">
          <Star size={14} />
          Level
          {' '}
          {level}
        </span>
        <span className="text-xs text-muted-foreground">
          {xpToNext}
          {' '}
          XP to next
        </span>
      </div>

      <div className="relative h-1.5 bg-muted  rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(progress / progressMax) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

const StatusEffect: React.FC<{
  type: 'debility' | 'condition' | 'buff'
  name: string
  icon: React.ReactNode
  color: string
}> = ({ type, name, icon, color }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`p-1.5 rounded-full ${color} text-white text-xs flex items-center justify-center`}
      title={name}
      whileHover={{ scale: 1.1 }}
    >
      {icon}
    </motion.div>
  )
}

export const CharacterStatusWidget: React.FC<CharacterStatusWidgetProps> = ({
  character,
  gameMode,
  theme,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [recentDamage, setRecentDamage] = useState<number | null>(null)

  // Calculate derived stats
  const armorTotal = character.armor || 0
  const loadCurrent = character.load?.current || 0
  const loadMax = character.load?.max || 10
  const xp = character.xp || 0
  const level = character.level || 1

  // Animate damage feedback
  useEffect(() => {
    if (recentDamage !== null) {
      const timer = setTimeout(() => setRecentDamage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [recentDamage])

  // Mock status effects (replace with real character state)
  const statusEffects = [
    // Example debilities
    ...(character.debilities?.weak ? [{ type: 'debility', name: 'Weak', icon: <Droplets size={12} />, color: 'bg-destructive/120' }] : []),
    ...(character.debilities?.shaky ? [{ type: 'debility', name: 'Shaky', icon: <Wind size={12} />, color: 'bg-chart-4/120' }] : []),
    // Add more status effects as needed
  ]

  const cardVariant
    = theme === 'combat'
      ? 'elevated'
      : theme === 'dungeon'
        ? 'parchment'
        : theme === 'tavern'
          ? 'magical'
          : 'glass'

  return (
    <Card
      variant={cardVariant}
      className={`h-full relative overflow-hidden ${className}`}
    >
      <CardContent className="h-full flex flex-col">
        {/* Character Name & Portrait */}
        <div className="text-center mb-4">
          <motion.div
            className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg"
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {character.name.charAt(0).toUpperCase()}
          </motion.div>
          <h3 className="font-display text-sm font-medium truncate">
            {character.name}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">
            {character.class}
            {' '}
            • Level
            {level}
          </p>
        </div>

        {/* Health Orb */}
        <div className="flex justify-center mb-4">
          <HealthOrb
            current={character.hitPoints?.current || 0}
            max={character.hitPoints?.max || 1}
            size={64}
          />
        </div>

        {/* Damage Feedback */}
        <AnimatePresence>
          {recentDamage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.6 }}
              className="absolute top-4 right-4 bg-destructive/120 text-white px-2 py-1 rounded text-xs font-bold"
            >
              -
              {recentDamage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Stats */}
        <div className="space-y-3 flex-1">
          {/* Armor */}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Shield size={14} />
              Armor
            </span>
            <span className="font-mono">{armorTotal}</span>
          </div>

          {/* Load */}
          <LoadMeter current={loadCurrent} max={loadMax} />

          {/* XP Progress */}
          <XPTracker xp={xp} level={level} />
        </div>

        {/* Status Effects */}
        {statusEffects.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Status Effects</div>
            <div className="flex flex-wrap gap-1">
              {statusEffects.map((effect, index) => (
                <StatusEffect
                  key={index}
                  type={effect.type as any}
                  name={effect.name}
                  icon={effect.icon}
                  color={effect.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game Mode Indicator */}
        <div className="mt-4 pt-3 border-t border-border">
          <Badge
            variant="secondary"
            className={`w-full justify-center text-xs ${
              gameMode === 'combat'
                ? 'bg-destructive/15 text-destructive'
                : gameMode === 'exploration'
                  ? 'bg-chart-2/15 text-chart-2'
                  : gameMode === 'social'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent/15 text-accent'
            }`}
          >
            {gameMode.toUpperCase()}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              // Quick heal action
              console.log('Quick heal')
            }}
          >
            <Heart size={12} className="mr-1" />
            Heal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => {
              // Mark XP action
              console.log('Mark XP')
            }}
          >
            <Star size={12} className="mr-1" />
            XP
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CharacterStatusWidget
