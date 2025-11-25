import type { CounterAdjust } from './widgets/InlineCounters'
import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '@/stores/characterStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import InlineCounters from './widgets/InlineCounters'
import { logger } from '@/utils/logger'

export interface FolioHeaderProps {
  className?: string
  highlighted?: boolean
  focusLabel?: string
}

const FolioHeader: React.FC<FolioHeaderProps> = ({ className, highlighted = false, focusLabel }) => {
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
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
    (change: CounterAdjust) => {
      if (!characterId) {
        logger.warn('[folio] Inline counter adjustment ignored: no active character')
        return
      }
      switch (change.kind) {
        case 'hp': {
          const amount = Math.abs(change.delta)
          if (amount === 0) break
          if (change.delta < 0) useCharacterStore.getState().damageCharacter?.(characterId, amount)
          else useCharacterStore.getState().healCharacter?.(characterId, amount)
          break
        }
        case 'xp': {
          if (change.delta > 0) {
            useCharacterStore.getState().addXP?.(characterId, change.delta)
          }
          break
        }
        case 'ammo': {
          if (change.delta < 0) {
            const inv = useInventoryStore.getState()
            const active = inv.inventories?.[characterId]
            if (active && active.items.length > 0) {
              const idx = active.items.findIndex((item) => item.tags?.includes('ammo'))
              if (idx >= 0) {
                const item = active.items[idx]
                const uses = Math.max(0, (item.uses ?? 1) - Math.abs(change.delta))
                inv.updateItem?.(characterId, item.id, { uses })
              }
            }
          }
          break
        }
        default:
          break
      }
    },
    [characterId],
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
        <h2 className='text-foreground truncate text-base font-semibold'>{name}</h2>
        <p className='text-muted-foreground text-sm'>Level {level} / {klass}</p>
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

export default FolioHeader
