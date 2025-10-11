import type { CounterAdjust } from './widgets/InlineCounters'
import type { DeltaOperation } from '@/services/llm'

import React, { useCallback } from 'react'

import { useChronicleLLM } from '@/components/chronicle/ChronicleProvider'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '@/stores/characterStore'
import { logger } from '@/utils/logger'
import { createManualBundle } from './utils/manualBundle'
import InlineCounters from './widgets/InlineCounters'
export interface FolioHeaderProps {
  className?: string
  highlighted?: boolean
  focusLabel?: string
}

export default function FolioHeader({
  className,
  highlighted = false,
  focusLabel,
}: FolioHeaderProps): JSX.Element {
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const { applyDeltaBundle, canApplyAutomation, canAutoApply } =
    useChronicleLLM()

  const characterId = activeCharacter?.id ?? null
  const name = activeCharacter?.name ?? 'Adventurer'
  const klass = activeCharacter?.class ?? '-'
  const level = activeCharacter?.level ?? 1
  const hpCur = activeCharacter?.hp?.current ?? 0
  const hpMax = activeCharacter?.hp?.max ?? 0
  const xp = (activeCharacter as any)?.xp ?? 0
  const armor = (activeCharacter as any)?.armor ?? 0
  const ammo = (activeCharacter as any)?.ammo ?? 0
  const hold = (activeCharacter as any)?.hold ?? 0

  const handleCounterAdjust = useCallback(
    async (change: CounterAdjust) => {
      if (!characterId) {
        logger.warn(
          '[folio] Inline counter adjustment ignored: no active character',
        )
        return
      }
      if (!canApplyAutomation) {
        logger.warn(
          '[folio] Inline counter adjustment ignored: automation is read-only in this rollout stage.',
        )
        return
      }

      const ops: DeltaOperation[] = []

      switch (change.kind) {
        case 'hp': {
          const amount = Math.abs(change.delta)
          if (amount === 0) break
          if (change.delta < 0) {
            ops.push({
              type: 'apply_damage',
              characterId,
              amount,
              source: 'Folio manual adjust',
            })
          } else {
            ops.push({
              type: 'heal',
              characterId,
              amount,
              source: 'Folio manual adjust',
            })
          }
          break
        }
        case 'xp': {
          if (change.delta > 0) {
            ops.push({ type: 'mark_xp', characterId, amount: change.delta })
          } else if (change.delta < 0) {
            logger.warn(
              '[folio] XP reductions are not supported via manual counters yet',
            )
          }
          break
        }
        case 'ammo': {
          if (change.delta < 0) {
            ops.push({
              type: 'spend_ammo',
              characterId,
              amount: Math.abs(change.delta),
            })
          } else if (change.delta > 0) {
            logger.warn(
              '[folio] Ammo increases require inventory edits; skipping inline add',
            )
          }
          break
        }
        case 'hold': {
          logger.warn(
            '[folio] Hold adjustments need a move context; skipping inline change',
          )
          break
        }
        case 'armor': {
          logger.warn(
            '[folio] Armor adjustments are derived from gear; edit equipment instead',
          )
          break
        }
        default:
          break
      }

      if (ops.length === 0) return

      try {
        const bundle = createManualBundle(ops)
        await applyDeltaBundle({
          bundle,
          autoApply: canAutoApply,
          selectedOpIndices: ops.map((_, index) => index),
        })
      } catch (error) {
        logger.error('[folio] Failed to apply manual bundle', error)
      }
    },
    [applyDeltaBundle, canApplyAutomation, canAutoApply, characterId],
  )

  return (
    <header
      data-slot='folio-header'
      className={cn(
        'bg-card border-border flex items-center justify-between gap-4 rounded-lg border p-3 shadow-sm transition-shadow',
        highlighted && 'ring-2 ring-primary/60 shadow-primary/20',
        className,
      )}
    >
      <div className='min-w-0 space-y-1'>
        <h2 className='text-foreground truncate text-base font-semibold'>
          {name}
        </h2>
        <p className='text-muted-foreground text-sm'>
          Level {level} / {klass}
        </p>
        {focusLabel && (
          <div className='max-w-full break-words rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary whitespace-normal'>
            {focusLabel}
          </div>
        )}
      </div>
      <InlineCounters
        hp={{ current: hpCur, max: hpMax }}
        xp={xp}
        armor={armor}
        ammo={ammo}
        hold={hold}
        onAdjust={handleCounterAdjust}
      />
    </header>
  )
}
