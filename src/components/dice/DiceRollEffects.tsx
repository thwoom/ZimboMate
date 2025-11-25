import type { EnhancedRollResult } from '@/hooks/useEnhancedRollResults'
import {
  createEnhancedAttributeRoll,
  createEnhancedBasicRoll,
  createEnhancedMoveRoll,
} from '@/hooks/useEnhancedRollResults'
import { useDiceStore } from '@/stores/diceStore'
import type { RollOutcome, RollResult } from '@/stores/diceStore'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { EnhancedRollResultsToast } from '@/components/ui/EnhancedRollResultsToast'

const outcomeBurstClass: Record<RollOutcome, string> = {
  success: 'from-emerald-400/50 via-emerald-400/10 to-transparent',
  partial: 'from-amber-400/50 via-amber-400/10 to-transparent',
  failure: 'from-red-500/50 via-red-500/10 to-transparent',
}

const outcomeRingClass: Record<RollOutcome, string> = {
  success: 'border-emerald-300/60 shadow-emerald-300/30',
  partial: 'border-amber-300/60 shadow-amber-300/30',
  failure: 'border-red-400/60 shadow-red-400/30',
}

function toEnhancedRoll(roll: RollResult): EnhancedRollResult {
  const dice = [roll.dice1, roll.dice2]
  const modifier = roll.modifier
  const label = roll.context.label || (roll.type === 'move' ? 'Move Roll' : roll.type === 'stat' ? 'Stat Roll' : 'Dice Roll')

  const base =
    roll.type === 'move'
      ? createEnhancedMoveRoll(label, dice, modifier, roll.context.moveId)
      : roll.type === 'stat'
        ? createEnhancedAttributeRoll(label, dice, modifier)
        : createEnhancedBasicRoll(dice, modifier)

  return {
    ...base,
    id: roll.id,
    timestamp: new Date(roll.timestamp),
    consequences: [],
    characterId: roll.characterId,
    moveContext: roll.context.moveId
      ? {
          moveId: roll.context.moveId,
          moveName: roll.context.label ?? roll.context.moveId,
        }
      : undefined,
  }
}

/**
 * DiceRollEffects
 *
 * Listens for new dice rolls and triggers visual + toast feedback.
 * Mounted once near the application root to avoid layout churn.
 */
export const DiceRollEffects: React.FC = () => {
  const currentRoll = useDiceStore((state) => state.currentRoll)
  const [toastRoll, setToastRoll] = useState<EnhancedRollResult | null>(null)
  const [burst, setBurst] = useState<{ id: string; outcome: RollOutcome } | null>(null)
  const lastRollIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!currentRoll) return
    if (lastRollIdRef.current === currentRoll.id) return
    lastRollIdRef.current = currentRoll.id

    setToastRoll(toEnhancedRoll(currentRoll))
    setBurst({ id: currentRoll.id, outcome: currentRoll.outcome })

    const timeout = setTimeout(() => setBurst(null), 900)
    return () => clearTimeout(timeout)
  }, [currentRoll])

  const handleApplyConsequences = useMemo(
    () => (rollId: string, selected?: string[]) => {
      console.debug('[dice] applyConsequences placeholder', { rollId, selected })
    },
    [],
  )

  return (
    <>
      <EnhancedRollResultsToast
        result={toastRoll}
        onClose={() => setToastRoll(null)}
        onApplyConsequences={handleApplyConsequences}
        duration={5500}
      />

      <AnimatePresence>
        {burst && (
          <motion.div
            key={burst.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='pointer-events-none fixed inset-0 z-[70] flex items-start justify-center pt-16'
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1.25, opacity: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`h-48 w-48 rounded-full bg-gradient-to-br blur-3xl ${outcomeBurstClass[burst.outcome]}`}
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0.4 }}
              animate={{ scale: 1.05, opacity: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
              className={`absolute h-32 w-32 rounded-full border-4 ${outcomeRingClass[burst.outcome]} shadow-[0_0_40px]`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DiceRollEffects
