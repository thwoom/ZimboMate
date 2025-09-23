import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, Button } from '../ui'
import { Dice6, Plus, Minus } from 'lucide-react'

interface DiceResult {
  dice1: number
  dice2: number
  total: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'
}

interface DiceRollerProps {
  modifier?: number
  onRoll?: (result: DiceResult) => void
  disabled?: boolean
}

const diceVariants = {
  idle: {
    rotate: 0,
    scale: 1
  },
  rolling: {
    rotate: [0, 180, 360, 540, 720],
    scale: [1, 1.2, 1, 1.2, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut"
    }
  },
  result: {
    rotate: 0,
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const resultVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
}

const getOutcome = (total: number): 'success' | 'partial' | 'failure' => {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'failure'
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'success': return 'text-chart-2'
    case 'partial': return 'text-chart-4'
    case 'failure': return 'text-destructive'
    default: return 'text-foreground'
  }
}

const getOutcomeText = (outcome: string) => {
  switch (outcome) {
    case 'success': return 'Success! (10+)'
    case 'partial': return 'Partial Success (7-9)'
    case 'failure': return 'Failure (6-)'
    default: return ''
  }
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  modifier = 0,
  onRoll,
  disabled = false
}) => {
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<DiceResult | null>(null)
  const rollDice = useCallback(async () => {
    if (isRolling || disabled) return

    setIsRolling(true)
    setResult(null)
    // Simulate dice rolling delay
    await new Promise(resolve => setTimeout(resolve, 1500))

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
      outcome
    }

    setResult(diceResult)
    setIsRolling(false)
    onRoll?.(diceResult)
  }, [isRolling, disabled, modifier, onRoll])

  return (
    <Card variant="magical" className="relative overflow-hidden">
      <CardContent className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <h3 className="text-xl font-display">2d6 Roll</h3>
          {modifier !== 0 && (
            <div className="flex items-center gap-1 text-sm font-mono bg-popover px-2 py-1 rounded">
              {modifier > 0 ? <Plus size={12} /> : <Minus size={12} />}
              {Math.abs(modifier)}
            </div>
          )}
        </div>

        {/* Dice Display */}
        <div className="flex items-center justify-center gap-6">
          <motion.div
            variants={diceVariants}
            animate={isRolling ? "rolling" : result ? "result" : "idle"}
            className="relative"
          >
            <div className="w-16 h-16 bg-popover rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg">
              {isRolling ? (
                <Dice6 size={32} className="text-primary" />
              ) : result ? (
                <span className="text-2xl font-bold font-display">{result.dice1}</span>
              ) : (
                <Dice6 size={32} className="text-muted-foreground" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-display text-muted-foreground"
          >
            +
          </motion.div>

          <motion.div
            variants={diceVariants}
            animate={isRolling ? "rolling" : result ? "result" : "idle"}
            className="relative"
          >
            <div className="w-16 h-16 bg-popover rounded-lg border-2 border-primary/30 flex items-center justify-center shadow-lg">
              {isRolling ? (
                <Dice6 size={32} className="text-primary" />
              ) : result ? (
                <span className="text-2xl font-bold font-display">{result.dice2}</span>
              ) : (
                <Dice6 size={32} className="text-muted-foreground" />
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
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-3 dice-result roll-result"
            >
              <div className="text-center">
                <div className="text-sm text-muted-foreground font-mono">
                  {result.dice1} + {result.dice2} {modifier !== 0 ? `+ ${modifier}` : ''} = 
                </div>
                <div className={`text-4xl font-bold font-display ${getOutcomeColor(result.outcome)}`}>
                  {result.finalResult}
                </div>
                <div className={`text-lg font-medium ${getOutcomeColor(result.outcome)}`}>
                  {getOutcomeText(result.outcome)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Roll Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={rollDice}
            disabled={isRolling || disabled}
            className="w-full relative overflow-hidden"
          >
            <motion.div
              className="flex items-center gap-2"
              animate={isRolling ? { x: [0, 5, -5, 0] } : { x: 0 }}
              transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
            >
              <Dice6 size={20} />
              {isRolling ? 'Rolling...' : 'Roll 2d6'}
            </motion.div>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}



