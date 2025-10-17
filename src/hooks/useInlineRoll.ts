import type { Attributes } from '@/models/Character'
import type { RollResult } from '@/stores/diceStore'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { useCharacterStore } from '@/stores/characterStore'
import { useDiceStore } from '@/stores/diceStore'
import { formatRollSummary } from '@/utils/diceFormatting'

type StatKey = keyof Attributes

interface InlineRollOptions {
  label?: string
  description?: string
}

interface MoveRollOptions extends InlineRollOptions {
  moveId: string
  stat: StatKey
}

interface CustomRollOptions extends InlineRollOptions {
  modifier: number
  stat?: StatKey
  moveId?: string
}

interface UseInlineRollOptions {
  characterId?: string
  onRollComplete?: (roll: RollResult) => void
}

const OUTCOME_TONE: Record<RollResult['outcome'], { variant: 'success' | 'warning' | 'error'; note: string }> = {
  success: { variant: 'success', note: '10+ Strong hit' },
  partial: { variant: 'warning', note: '7-9 Mixed result' },
  failure: { variant: 'error', note: '6- Miss' },
}

export function useInlineRoll(options: UseInlineRollOptions = {}) {
  const rollStat = useDiceStore((state) => state.rollStat)
  const rollMove = useDiceStore((state) => state.rollMove)
  const rollCustom = useDiceStore((state) => state.rollCustom)
  const isRolling = useDiceStore((state) => state.isRolling)
  const getActiveCharacter = useCharacterStore((state) => state.getActiveCharacter)

  const { characterId: preferredCharacterId, onRollComplete } = options

  const activeCharacter = getActiveCharacter?.()
  const resolvedCharacterId = preferredCharacterId ?? activeCharacter?.id ?? null

  const ensureCharacterId = useCallback(() => {
    if (!resolvedCharacterId) {
      toast('Select a character before rolling dice.', {
        description: 'Open the Character tab to create or choose a hero.',
      })
      throw new Error('No active character set')
    }

    return resolvedCharacterId
  }, [resolvedCharacterId])

  const showToast = useCallback((roll: RollResult, description?: string) => {
    const summary = formatRollSummary(roll)
    const tone = OUTCOME_TONE[roll.outcome]

    const toastDescription = description ?? tone.note

    switch (tone.variant) {
      case 'success':
        toast.success(summary, { description: toastDescription })
        break
      case 'warning':
        toast.warning(summary, { description: toastDescription })
        break
      default:
        toast.error(summary, { description: toastDescription })
    }
  }, [])

  const handleCompletion = useCallback(
    (roll: RollResult, description?: string) => {
      showToast(roll, description)
      onRollComplete?.(roll)
    },
    [onRollComplete, showToast],
  )

  const rollStatInline = useCallback(
    async (stat: StatKey, inlineOptions?: InlineRollOptions) => {
      try {
        const characterId = ensureCharacterId()
        const label = inlineOptions?.label ?? `${stat} Roll`
        const result = await rollStat(stat, characterId, label)
        handleCompletion(result, inlineOptions?.description)
        return result
      } catch (error) {
        return null
      }
    },
    [ensureCharacterId, handleCompletion, rollStat],
  )

  const rollMoveInline = useCallback(
    async (inlineOptions: MoveRollOptions) => {
      try {
        const characterId = ensureCharacterId()
        const label = inlineOptions.label ?? inlineOptions.moveId
        const result = await rollMove({
          moveId: inlineOptions.moveId,
          stat: inlineOptions.stat,
          characterId,
          label,
        })
        handleCompletion(result, inlineOptions.description)
        return result
      } catch (error) {
        return null
      }
    },
    [ensureCharacterId, handleCompletion, rollMove],
  )

  const rollCustomInline = useCallback(
    async (inlineOptions: CustomRollOptions) => {
      try {
        const characterId = ensureCharacterId()
        const contextLabel = inlineOptions.label ?? 'Custom Roll'
        const result = await rollCustom({
          modifier: inlineOptions.modifier,
          characterId,
          context: {
            label: contextLabel,
            stat: inlineOptions.stat,
            moveId: inlineOptions.moveId,
            description: inlineOptions.description,
          },
        })
        handleCompletion(result, inlineOptions.description)
        return result
      } catch (error) {
        return null
      }
    },
    [ensureCharacterId, handleCompletion, rollCustom],
  )

  return {
    rollStatInline,
    rollMoveInline,
    rollCustomInline,
    isRolling,
  }
}
