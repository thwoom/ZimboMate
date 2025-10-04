/**
 * Chronicle-Enabled Dice Roller
 *
 * Enhanced dice roller that integrates with the Chronicle system
 * to automatically trigger contextual story prompts after rolls.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Dice6, Feather, Minus, Plus } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useChronicle } from '../chronicle/ChronicleProvider'
import { Button, Card, CardContent } from '../ui'

interface DiceResult {
  dice1: number
  dice2: number
  total: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'
}

interface ChronicleEnabledDiceRollerProps {
  modifier?: number
  stat?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
  move?: string
  characterName?: string
  onRoll?: (result: DiceResult) => void
  disabled?: boolean
  showChronicleIntegration?: boolean
  className?: string
}

const diceVariants = {
  idle: {
    rotate: 0,
    scale: 1,
  },
  rolling: {
    rotate: [0, 180, 360, 540, 720],
    scale: [1, 1.2, 1, 1.2, 1],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  result: {
    rotate: 0,
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

const resultVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
}

function getOutcome(total: number): 'success' | 'partial' | 'failure' {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'failure'
}

function getOutcomeColor(outcome: string) {
  switch (outcome) {
    case 'success':
      return 'text-chart-2'
    case 'partial':
      return 'text-chart-4'
    case 'failure':
      return 'text-destructive'
    default:
      return 'text-foreground'
  }
}

function getOutcomeText(outcome: string) {
  switch (outcome) {
    case 'success':
      return 'Success! (10+)'
    case 'partial':
      return 'Partial Success (7-9)'
    case 'failure':
      return 'Failure (6-) - Mark XP'
    default:
      return ''
  }
}

const StatIcon: React.FC<{ stat: string }> = ({ stat }) => {
  const getStatEmoji = (stat: string) => {
    switch (stat) {
      case 'STR':
        return '💪'
      case 'DEX':
        return '🏃'
      case 'CON':
        return '❤️'
      case 'INT':
        return '🧠'
      case 'WIS':
        return '👁️'
      case 'CHA':
        return '💫'
      default:
        return '🎲'
    }
  }

  return (
    <span className='text-lg' role='img' aria-label={stat}>
      {getStatEmoji(stat)}
    </span>
  )
}

export const ChronicleEnabledDiceRoller: React.FC<
  ChronicleEnabledDiceRollerProps
> = ({
  modifier = 0,
  stat,
  move,
  characterName,
  onRoll,
  disabled = false,
  showChronicleIntegration = true,
  className = '',
}) => {
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<DiceResult | null>(null)
  // Chronicle integration
  const { emitDiceRoll, isOverlayEnabled } = useChronicle()

  const rollDice = useCallback(async () => {
    if (isRolling || disabled) return

    setIsRolling(true)
    setResult(null)
    // Simulate dice rolling delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const dice1 = Math.floor(Math.random() * 6) + 1
    const dice2 = Math.floor(Math.random() * 6) + 1
    const total = dice1 + dice2
    const finalResult = total + modifier
    const outcome = getOutcome(finalResult)

    const diceResult: DiceResult = {
      dice1,
      dice2,
      total,
      modifier,
      finalResult,
      outcome,
    }

    setResult(diceResult)
    setIsRolling(false)
    // Hide particles after animation
    // Trigger Chronicle system if enabled
    if (showChronicleIntegration && isOverlayEnabled) {
      emitDiceRoll({
        characterName,
        stat,
        moveName: move,
        result: outcome,
        total: finalResult,
        modifier,
        dice: [dice1, dice2],
      })
    }

    // Call original onRoll callback
    onRoll?.(diceResult)
  }, [
    isRolling,
    disabled,
    modifier,
    onRoll,
    showChronicleIntegration,
    isOverlayEnabled,
    emitDiceRoll,
    characterName,
    stat,
    move,
  ])

  const getRollTitle = () => {
    if (move) return `${move} Roll`
    if (stat) return `${stat} Roll`
    return '2d6 Roll'
  }

  const getRollDescription = () => {
    if (move && stat) return `Rolling ${move} using ${stat}`
    if (stat) return `Testing ${stat} attribute`
    if (move) return `Performing ${move} move`
    return 'Rolling 2d6'
  }

  return (
    <Card variant='magical' className={`relative overflow-hidden ${className}`}>
      <CardContent className='text-center space-y-6'>
        {/* Header with context information */}
        <div className='space-y-2'>
          <div className='flex items-center justify-center gap-3'>
            {stat && <StatIcon stat={stat} />}
            <h3 className='text-xl font-display'>{getRollTitle()}</h3>
            {modifier !== 0 && (
              <div className='flex items-center gap-1 text-sm font-mono bg-muted  px-2 py-1 rounded'>
                {modifier > 0 ? <Plus size={12} /> : <Minus size={12} />}
                {Math.abs(modifier)}
              </div>
            )}
          </div>

          {(move || stat) && (
            <p className='text-sm text-muted-foreground '>
              {getRollDescription()}
            </p>
          )}

          {characterName && (
            <div className='flex items-center justify-center gap-2 text-sm text-primary'>
              <Feather size={12} />
              <span>{characterName}</span>
            </div>
          )}
        </div>

        {/* Dice Display */}
        <div className='flex items-center justify-center gap-6'>
          <motion.div
            variants={diceVariants}
            animate={isRolling ? 'rolling' : result ? 'result' : 'idle'}
            className='relative'
          >
            <div className='w-16 h-16 bg-popover rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg'>
              {isRolling ? (
                <Dice6 size={32} className='text-primary' />
              ) : result ? (
                <span className='text-2xl font-bold font-display'>
                  {result.dice1}
                </span>
              ) : (
                <Dice6 size={32} className='text-muted-foreground' />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='text-2xl font-display text-muted-foreground'
          >
            +
          </motion.div>

          <motion.div
            variants={diceVariants}
            animate={isRolling ? 'rolling' : result ? 'result' : 'idle'}
            className='relative'
          >
            <div className='w-16 h-16 bg-popover rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg'>
              {isRolling ? (
                <Dice6 size={32} className='text-primary' />
              ) : result ? (
                <span className='text-2xl font-bold font-display'>
                  {result.dice2}
                </span>
              ) : (
                <Dice6 size={32} className='text-muted-foreground' />
              )}
            </div>
          </motion.div>
        </div>

        {/* Result Display */}
        <AnimatePresence key={result?.finalResult || 'no-result'}>
          {result && (
            <motion.div
              key={`result-${result.finalResult}-${result.dice1}-${result.dice2}`}
              variants={resultVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='space-y-3 dice-result roll-result'
            >
              <div className='text-center'>
                <div className='text-sm text-muted-foreground  font-mono'>
                  {result.dice1} +{result.dice2}{' '}
                  {modifier !== 0 ? `+ ${modifier}` : ''} =
                </div>
                <div
                  className={`text-4xl font-bold font-display ${getOutcomeColor(result.outcome)}`}
                >
                  {result.finalResult}
                </div>
                <div
                  className={`text-lg font-medium ${getOutcomeColor(result.outcome)}`}
                >
                  {getOutcomeText(result.outcome)}
                </div>
              </div>

              {/* Chronicle Integration Indicator */}
              {showChronicleIntegration && isOverlayEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className='flex items-center justify-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1 rounded-full'
                >
                  <BookOpen size={12} />
                  <span>Chronicle prompt available</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Roll Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant='primary'
            size='lg'
            onClick={rollDice}
            disabled={isRolling || disabled}
            className='w-full relative overflow-hidden'
          >
            <motion.div
              className='flex items-center gap-2'
              animate={isRolling ? { x: [0, 5, -5, 0] } : { x: 0 }}
              transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
            >
              <Dice6 size={20} />
              {isRolling ? 'Rolling...' : `Roll ${getRollTitle()}`}
            </motion.div>
          </Button>
        </motion.div>

        {/* Chronicle Integration Toggle */}
        {showChronicleIntegration && (
          <div className='pt-2 border-t border-border'>
            <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground '>
              <BookOpen size={12} />
              <span>
                Chronicle prompts: {isOverlayEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Re-export original DiceRoller for backward compatibility
export { DiceRoller } from './DiceRoller'
