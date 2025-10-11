import React from 'react'
import { cn } from '@/lib/utils'

export interface MoveChipsProps {
  className?: string
  onSelect: (moveId: string) => void
  moves?: { id: string; name: string; stat?: string }[]
}

const DEFAULT_MOVES: Required<MoveChipsProps>['moves'] = [
  { id: 'hack-and-slash', name: 'Hack & Slash', stat: 'STR' },
  { id: 'volley', name: 'Volley', stat: 'DEX' },
  { id: 'defy-danger', name: 'Defy Danger', stat: '—' },
  { id: 'defend', name: 'Defend', stat: '—' },
  { id: 'discern-realities', name: 'Discern Realities', stat: 'WIS' },
  { id: 'spout-lore', name: 'Spout Lore', stat: 'INT' },
]

export default function MoveChips({
  className,
  onSelect,
  moves = DEFAULT_MOVES,
}: MoveChipsProps): JSX.Element {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {moves.map((m) => (
        <button
          type='button'
          key={m.id}
          onClick={() => onSelect(m.id)}
          className='bg-card text-foreground hover:bg-muted/40 border-border inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          aria-label={`Use move ${m.name}`}
        >
          <span>{m.name}</span>
          {m.stat ? (
            <span className='text-muted-foreground text-xs'>· {m.stat}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
