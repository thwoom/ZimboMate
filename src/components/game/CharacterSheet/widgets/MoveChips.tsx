import { StatPickerPopover, type StatKey } from '@/components/ui/StatPickerPopover'
import { cn } from '@/lib/utils'

export interface MoveChipsProps {
  className?: string
  disabled?: boolean
  onRoll: (payload: { moveId: string; name: string; stat: StatKey }) => void
  moves?: MoveDefinition[]
}

interface MoveDefinition {
  id: string
  name: string
  stat?: StatKey | null
  description?: string
}

const DEFAULT_MOVES: MoveDefinition[] = [
  { id: 'hack-and-slash', name: 'Hack & Slash', stat: 'STR', description: 'Trade blows in melee.' },
  { id: 'volley', name: 'Volley', stat: 'DEX', description: 'Loose an arrow or shot from range.' },
  { id: 'defy-danger', name: 'Defy Danger', stat: null, description: 'Avoid calamity with whichever stat fits.' },
  { id: 'defend', name: 'Defend', stat: 'CON', description: 'Stand in defense of something important.' },
  { id: 'discern-realities', name: 'Discern Realities', stat: 'WIS', description: 'Read the situation before you.' },
  { id: 'spout-lore', name: 'Spout Lore', stat: 'INT', description: 'Share something you already know.' },
]

const chipClasses =
  'bg-card text-foreground hover:bg-muted/40 border-border inline-flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60'

export default function MoveChips({
  className,
  disabled = false,
  onRoll,
  moves = DEFAULT_MOVES,
}: MoveChipsProps): JSX.Element {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {moves.map((move) => {
        const statLabel = move.stat ?? 'Pick stat'

        if (move.stat) {
          return (
            <button
              key={move.id}
              type='button'
              className={chipClasses}
              disabled={disabled}
              onClick={() => onRoll({ moveId: move.id, name: move.name, stat: move.stat as StatKey })}
            >
              <span>{move.name}</span>
              <span className='text-muted-foreground text-xs'>{statLabel}</span>
            </button>
          )
        }

        return (
          <StatPickerPopover
            key={move.id}
            disabled={disabled}
            onSelect={(stat) => onRoll({ moveId: move.id, name: move.name, stat })}
            title={`Choose a stat for ${move.name}`}
            description='Basic moves can draw on different attributes. Pick the one that fits before rolling.'
          >
            <button
              type='button'
              className={chipClasses}
              disabled={disabled}
            >
              <span>{move.name}</span>
              <span className='text-muted-foreground text-xs'>{statLabel}</span>
            </button>
          </StatPickerPopover>
        )
      })}
    </div>
  )
}
