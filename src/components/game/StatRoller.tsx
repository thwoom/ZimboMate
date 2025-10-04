/**
 * Stat Roller Component
 *
 * Specialized dice roller for attribute tests (STR, DEX, CON, INT, WIS, CHA).
 * Automatically integrates with Chronicle system to prompt "Why did you roll DEX?"
 * type questions after each roll.
 */

import { motion } from 'framer-motion'
import {
  Brain, // INT
  Eye, // WIS
  Heart, // CON
  Sparkles, // CHA
  Wind, // DEX
  Zap, // STR
} from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui'
import { ChronicleEnabledDiceRoller } from './ChronicleEnabledDiceRoller'

export type Stat = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

interface StatInfo {
  name: string
  fullName: string
  description: string
  icon: React.ReactNode
  examples: string[]
  color: string
}

const STAT_INFO: Record<Stat, StatInfo> = {
  STR: {
    name: 'STR',
    fullName: 'Strength',
    description: 'Physical power and athleticism',
    icon: <Zap size={16} />,
    examples: [
      'Lifting heavy objects',
      'Breaking down doors',
      'Wrestling',
      'Climbing',
    ],
    color: 'text-destructive',
  },
  DEX: {
    name: 'DEX',
    fullName: 'Dexterity',
    description: 'Agility, reflexes, and precision',
    icon: <Wind size={16} />,
    examples: [
      'Dodging attacks',
      'Sneaking quietly',
      'Picking locks',
      'Aiming accurately',
    ],
    color: 'text-chart-2',
  },
  CON: {
    name: 'CON',
    fullName: 'Constitution',
    description: 'Endurance and physical resilience',
    icon: <Heart size={16} />,
    examples: [
      'Resisting poison',
      'Enduring harsh weather',
      'Holding breath',
      'Fighting fatigue',
    ],
    color: 'text-accent',
  },
  INT: {
    name: 'INT',
    fullName: 'Intelligence',
    description: 'Reasoning and memory',
    icon: <Brain size={16} />,
    examples: [
      'Recalling lore',
      'Solving puzzles',
      'Understanding magic',
      'Analyzing clues',
    ],
    color: 'text-primary',
  },
  WIS: {
    name: 'WIS',
    fullName: 'Wisdom',
    description: 'Awareness and intuition',
    icon: <Eye size={16} />,
    examples: [
      'Noticing details',
      'Reading people',
      'Tracking',
      'Sensing danger',
    ],
    color: 'text-accent',
  },
  CHA: {
    name: 'CHA',
    fullName: 'Charisma',
    description: 'Force of personality and leadership',
    icon: <Sparkles size={16} />,
    examples: [
      'Persuading others',
      'Intimidating foes',
      'Performing',
      'Leading',
    ],
    color: 'text-chart-4',
  },
}

interface StatRollerProps {
  characterName?: string
  statModifiers?: Partial<Record<Stat, number>>
  onStatRoll?: (stat: Stat, result: any) => void
  disabled?: boolean
  showExamples?: boolean
  className?: string
}

const StatButton: React.FC<{
  stat: Stat
  modifier: number
  onRoll: (stat: Stat) => void
  disabled?: boolean
}> = ({ stat, modifier, onRoll, disabled }) => {
  const info = STAT_INFO[stat]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='h-full'
    >
      <Button
        variant='outline'
        onClick={() => onRoll(stat)}
        disabled={disabled}
        className='
          h-full w-full p-4 flex flex-col items-center gap-2
          hover:shadow-lg transition-all duration-200
          border-2 hover:border-primary/30
        '
      >
        <div className={`flex items-center gap-2 ${info.color}`}>
          {info.icon}
          <span className='font-bold text-lg'>{stat}</span>
        </div>

        <div className='text-sm font-medium text-foreground '>
          {info.fullName}
        </div>

        <div className='text-xs text-center text-muted-foreground  leading-tight'>
          {info.description}
        </div>

        {modifier !== 0 && (
          <div
            className={`
            text-xs font-mono px-2 py-1 rounded
            ${modifier >= 0 ? 'bg-chart-2/15 text-chart-2' : 'bg-destructive/15 text-destructive'}
          `}
          >
            {modifier >= 0 ? '+' : ''}
            {modifier}
          </div>
        )}
      </Button>
    </motion.div>
  )
}

const StatExamples: React.FC<{ stat: Stat }> = ({ stat }) => {
  const info = STAT_INFO[stat]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mt-4 p-4 bg-muted/50  rounded-lg'
    >
      <div className='text-sm font-medium mb-2 flex items-center gap-2'>
        <span className={info.color}>{info.icon}</span>
        <span>
          Common
          {info.fullName} uses:
        </span>
      </div>
      <div className='grid grid-cols-2 gap-1 text-xs text-muted-foreground '>
        {info.examples.map((example, index) => (
          <div key={index} className='flex items-center gap-1'>
            <span className='w-1 h-1 bg-gray-400 rounded-full' />
            <span>{example}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export const StatRoller: React.FC<StatRollerProps> = ({
  characterName,
  statModifiers = {},
  onStatRoll,
  disabled = false,
  showExamples = true,
  className = '',
}) => {
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  const handleStatSelection = (stat: Stat) => {
    setSelectedStat(stat)
  }

  const handleDiceRoll = (result: any) => {
    setIsRolling(false)
    onStatRoll?.(selectedStat!, result)

    // Auto-close after a delay to allow viewing the result
    setTimeout(() => {
      if (!isRolling) {
        setSelectedStat(null)
      }
    }, 5000)
  }

  const handleBackToSelection = () => {
    setSelectedStat(null)
    setIsRolling(false)
  }

  if (selectedStat) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header with back button */}
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            onClick={handleBackToSelection}
            disabled={isRolling}
          >
            ← Back to Stats
          </Button>
          <div
            className={`flex items-center gap-2 ${STAT_INFO[selectedStat].color}`}
          >
            {STAT_INFO[selectedStat].icon}
            <span className='font-medium'>
              {STAT_INFO[selectedStat].fullName} Roll
            </span>
          </div>
        </div>

        {/* Dice Roller */}
        <ChronicleEnabledDiceRoller
          stat={selectedStat}
          modifier={statModifiers[selectedStat] || 0}
          characterName={characterName}
          onRoll={handleDiceRoll}
          disabled={disabled}
          showChronicleIntegration={true}
        />

        {/* Examples for the selected stat */}
        {showExamples && <StatExamples stat={selectedStat} />}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='text-center'>
        <h3 className='text-xl font-display mb-2'>Attribute Tests</h3>
        <p className='text-sm text-muted-foreground '>
          Choose an attribute to test
          {characterName && (
            <span className='block text-primary mt-1'>
              for
              {characterName}
            </span>
          )}
        </p>
      </div>

      {/* Stat Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {(Object.keys(STAT_INFO) as Stat[]).map((stat) => (
          <StatButton
            key={stat}
            stat={stat}
            modifier={statModifiers[stat] || 0}
            onRoll={handleStatSelection}
            disabled={disabled}
          />
        ))}
      </div>

      {/* General help text */}
      <div className='text-center space-y-2'>
        <p className='text-xs text-muted-foreground '>
          When you roll, you'll be prompted to chronicle why you needed to test
          that attribute
        </p>
        <div className='flex items-center justify-center gap-4 text-xs'>
          <span className='text-chart-2'>10+ Success</span>
          <span className='text-chart-4'>7-9 Partial</span>
          <span className='text-destructive'>6- Failure (XP)</span>
        </div>
      </div>
    </div>
  )
}

// Export individual stat roller for specific use cases
export const QuickStatRoll: React.FC<{
  stat: Stat
  modifier?: number
  characterName?: string
  onRoll?: (result: any) => void
  disabled?: boolean
}> = ({ stat, modifier = 0, characterName, onRoll, disabled }) => {
  return (
    <ChronicleEnabledDiceRoller
      stat={stat}
      modifier={modifier}
      characterName={characterName}
      onRoll={onRoll}
      disabled={disabled}
      showChronicleIntegration={true}
      className='max-w-md'
    />
  )
}
