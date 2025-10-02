import type { RollResult } from '../../stores/diceStore'
import { formatDistanceToNow } from 'date-fns'
import { Copy, RotateCcw } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import { formatRollSummary } from '../../utils/diceFormatting'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface RollLogProps {
  rolls: RollResult[]
  className?: string
  onReroll?: (rollId: string) => void | Promise<void>
  onCopy?: (text: string) => void
}

const outcomeTone: Record<RollResult['outcome'], string> = {
  success: 'bg-chart-2/20 text-chart-2 border-chart-2/40',
  partial: 'bg-chart-4/20 text-chart-4 border-chart-4/40',
  failure: 'bg-destructive/15 text-destructive border-destructive/40',
}

const rollTypeLabels: Record<RollResult['type'], string> = {
  stat: 'Stat',
  move: 'Move',
  custom: 'Custom',
}

const typeFilterOptions: Array<{ value: 'all' | RollResult['type'], label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'stat', label: 'Stats' },
  { value: 'move', label: 'Moves' },
  { value: 'custom', label: 'Custom' },
]

const outcomeFilterOptions: Array<{ value: 'all' | RollResult['outcome'], label: string }> = [
  { value: 'all', label: 'All outcomes' },
  { value: 'success', label: 'Successes' },
  { value: 'partial', label: 'Partials' },
  { value: 'failure', label: 'Failures' },
]

const formatModifier = (modifier: number): string => (modifier >= 0 ? `+${modifier}` : `${modifier}`)

export const RollLog: React.FC<RollLogProps> = ({ rolls, className, onReroll, onCopy }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | RollResult['type']>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | RollResult['outcome']>('all')

  const filteredRolls = useMemo(() => {
    return rolls.filter((roll) => {
      const typeMatches = typeFilter === 'all' || roll.type === typeFilter
      const outcomeMatches = outcomeFilter === 'all' || roll.outcome === outcomeFilter
      return typeMatches && outcomeMatches
    })
  }, [rolls, typeFilter, outcomeFilter])

  return (
    <div className={cn('space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Roll Log</h3>
          <p className="text-xs text-muted-foreground">
            Track recent rolls, rerun them, or copy the notation for chat logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            aria-label="Filter by roll type"
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value as RollResult['type'] | 'all')}
          >
            {typeFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by roll outcome"
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            value={outcomeFilter}
            onChange={event => setOutcomeFilter(event.target.value as RollResult['outcome'] | 'all')}
          >
            {outcomeFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRolls.length === 0
        ? (
            <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No rolls yet. Make a move and the history will show up here.
            </div>
          )
        : (
            <ul className="space-y-3">
              {filteredRolls.map(roll => (
                <li
                  key={roll.id}
                  className="rounded-md border border-border bg-background/80 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn('border px-2 py-0 text-[10px] uppercase tracking-wide', outcomeTone[roll.outcome])}>
                          {roll.outcome}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">{rollTypeLabels[roll.type]}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(roll.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-foreground">
                        {roll.context.label}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {roll.dice1}
                        {' '}
                        +
                        {roll.dice2}
                        {roll.modifier !== 0 && (
                          <span>
                            {' '}
                            {formatModifier(roll.modifier)}
                          </span>
                        )}
                        {' '}
                        =
                        {' '}
                        <span className="font-semibold text-foreground">{roll.finalResult}</span>
                      </div>

                      {roll.context.description && (
                        <div className="text-[11px] text-muted-foreground">
                          {roll.context.description}
                        </div>
                      )}
                    </div>

                    {(onReroll || onCopy) && (
                      <div className="flex shrink-0 gap-2">
                        {onReroll && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() => onReroll(roll.id)}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Reroll
                          </Button>
                        )}

                        {onCopy && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => onCopy(formatRollSummary(roll))}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
    </div>
  )
}
