import React from 'react'
import { cn } from '@/lib/utils'

export type CounterAdjust =
  | { kind: 'hp'; delta: number }
  | { kind: 'xp'; delta: number }
  | { kind: 'armor'; delta: number }
  | { kind: 'ammo'; delta: number }
  | { kind: 'hold'; delta: number }

export interface InlineCountersProps {
  className?: string
  hp: { current: number; max: number }
  xp: number
  armor: number
  ammo: number
  hold: number
  onAdjust?: (change: CounterAdjust) => void
}

function Counter({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string
  value: number | string
  onInc?: () => void
  onDec?: () => void
}) {
  return (
    <div className='bg-muted/30 border-border inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <button
        type='button'
        aria-label={`decrease ${label}`}
        onClick={onDec}
        className='text-muted-foreground hover:text-foreground -mx-1 rounded px-1'
      >
        −
      </button>
      <span className='text-foreground tabular-nums'>{value}</span>
      <button
        type='button'
        aria-label={`increase ${label}`}
        onClick={onInc}
        className='text-muted-foreground hover:text-foreground -mx-1 rounded px-1'
      >
        +
      </button>
    </div>
  )
}

export default function InlineCounters({
  className,
  hp,
  xp,
  armor,
  ammo,
  hold,
  onAdjust,
}: InlineCountersProps): JSX.Element {
  const emit = (change: CounterAdjust) => {
    if (!onAdjust) return
    if (change.delta === 0) return
    onAdjust(change)
  }

  return (
    <div data-slot='inline-counters' className={cn('flex flex-wrap items-center gap-2', className)}>
      <Counter
        label='HP'
        value={`${hp.current}/${hp.max}`}
        onInc={() => {
          const next = Math.min(hp.max, hp.current + 1)
          emit({ kind: 'hp', delta: next - hp.current })
        }}
        onDec={() => {
          const next = Math.max(0, hp.current - 1)
          emit({ kind: 'hp', delta: next - hp.current })
        }}
      />
      <Counter
        label='XP'
        value={xp}
        onInc={() => emit({ kind: 'xp', delta: 1 })}
        onDec={() => emit({ kind: 'xp', delta: xp > 0 ? -1 : 0 })}
      />
      <Counter
        label='Armor'
        value={armor}
        onInc={() => emit({ kind: 'armor', delta: 1 })}
        onDec={() => emit({ kind: 'armor', delta: armor > 0 ? -1 : 0 })}
      />
      <Counter
        label='Ammo'
        value={ammo}
        onInc={() => emit({ kind: 'ammo', delta: 1 })}
        onDec={() => emit({ kind: 'ammo', delta: ammo > 0 ? -1 : 0 })}
      />
      <Counter
        label='Hold'
        value={hold}
        onInc={() => emit({ kind: 'hold', delta: 1 })}
        onDec={() => emit({ kind: 'hold', delta: hold > 0 ? -1 : 0 })}
      />
    </div>
  )
}
