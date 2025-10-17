import type { RollResult } from '../../stores/diceStore'
import { formatDistanceToNow } from 'date-fns'
import { Copy, RotateCcw } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import { formatRollSummary } from '../../utils/diceFormatting'
import { Button } from '../ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

interface RollLogProps {
  rolls: RollResult[]
  className?: string
  onReroll?: (rollId: string) => void | Promise<void>
  onCopy?: (text: string) => void
  variant?: 'card' | 'embedded'
  showHeader?: boolean
  showFilters?: boolean
  listClassName?: string
}

const outcomeTone: Record<RollResult['outcome'], string> = {
  success: 'bg-chart-2/20 text-chart-2 border-chart-2/40',
  partial: 'bg-amber-500/15 text-amber-700 border-amber-600/40',
  failure: 'bg-destructive/15 text-destructive border-destructive/40',
}


const typeFilterOptions: Array<{
  value: 'all' | RollResult['type']
  label: string
}> = [
  { value: 'all', label: 'All' },
  { value: 'stat', label: 'Stats' },
  { value: 'move', label: 'Moves' },
  { value: 'custom', label: 'Custom' },
]

const outcomeFilterOptions: Array<{
  value: 'all' | RollResult['outcome']
  label: string
}> = [
  { value: 'all', label: 'All outcomes' },
  { value: 'success', label: 'Successes' },
  { value: 'partial', label: 'Partials' },
  { value: 'failure', label: 'Failures' },
]

const formatModifier = (modifier: number): string =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`

export const RollLog: React.FC<RollLogProps> = ({
  rolls,
  className,
  onReroll,
  onCopy,
  variant = 'card',
  showHeader = true,
  showFilters = true,
  listClassName,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | RollResult['type']>(
    'all',
  )
  const [outcomeFilter, setOutcomeFilter] = useState<
    'all' | RollResult['outcome']
  >('all')

  const filteredRolls = useMemo(() => {
    return rolls.filter((roll) => {
      const typeMatches = typeFilter === 'all' || roll.type === typeFilter
      const outcomeMatches =
        outcomeFilter === 'all' || roll.outcome === outcomeFilter
      return typeMatches && outcomeMatches
    })
  }, [rolls, typeFilter, outcomeFilter])

  const containerClasses = cn(
    variant === 'embedded'
      ? 'space-y-3'
      : 'space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm',
    className,
  )

  const shouldRenderControls = showHeader || showFilters
  const controlsClass = cn(
    'flex flex-col gap-3 sm:flex-row sm:items-center',
    showHeader && showFilters ? 'sm:justify-between' : 'sm:justify-start',
  )

  const listClasses = cn('space-y-3', listClassName)

  return (
    <div className={containerClasses}>
      {shouldRenderControls && (
        <div className={controlsClass}>
          {showHeader ? (
            <div>
              <h3 className='text-sm font-semibold text-foreground'>Roll Log</h3>
              <p className='text-xs text-muted-foreground'>
                Track recent rolls, rerun them, or copy the notation for chat logs.
              </p>
            </div>
          ) : null}

          {showFilters ? (
            <div className='flex flex-wrap gap-2 text-xs'>
              <select
                aria-label='Filter by roll type'
                className='rounded-md border border-border bg-background px-2 py-1 text-xs'
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as RollResult['type'] | 'all')
                }
              >
                {typeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                aria-label='Filter by roll outcome'
                className='rounded-md border border-border bg-background px-2 py-1 text-xs'
                value={outcomeFilter}
                onChange={(event) =>
                  setOutcomeFilter(
                    event.target.value as RollResult['outcome'] | 'all',
                  )
                }
              >
                {outcomeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      )}

      {filteredRolls.length === 0 ? (
        variant === 'embedded' ? (
          <div className='text-xs text-muted-foreground'>
            No rolls yet. Make a move and the history will show up here.
          </div>
        ) : (
          <div className='rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground'>
            No rolls yet. Make a move and the history will show up here.
          </div>
        )
      ) : (
        <ul className={listClasses}>
          {filteredRolls.map((roll) => {
            const outcomeSymbol = 
              roll.outcome === 'success' ? '✓' : 
              roll.outcome === 'partial' ? '◐' : 
              '✗'
            
            return (
              <li
                key={roll.id}
                className={cn(
                  'group rounded border bg-background/80 px-2 py-1.5 transition-all hover:bg-background hover:shadow-sm',
                  outcomeTone[roll.outcome].replace('bg-', 'border-l-2 border-l-'),
                )}
              >
                <div className='flex items-center gap-2'>
                  {/* Compact dice display with modifier */}
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='flex items-center gap-0.5 shrink-0 cursor-help'>
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold border transition-transform group-hover:scale-105',
                              outcomeTone[roll.outcome],
                            )}
                          >
                            {roll.dice1}
                          </div>
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold border transition-transform group-hover:scale-105',
                              outcomeTone[roll.outcome],
                            )}
                          >
                            {roll.dice2}
                          </div>
                          {roll.modifier !== 0 && (
                            <span className='text-[10px] font-medium text-muted-foreground ml-0.5'>
                              {formatModifier(roll.modifier)}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        {roll.dice1} + {roll.dice2}
                        {roll.modifier !== 0 && ` ${formatModifier(roll.modifier)}`} = {roll.finalResult}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Outcome indicator */}
                  <span 
                    className={cn(
                      'text-sm font-bold shrink-0',
                      roll.outcome === 'success' ? 'text-chart-2' :
                      roll.outcome === 'partial' ? 'text-amber-700' :
                      'text-destructive'
                    )}
                    title={roll.outcome}
                  >
                    {outcomeSymbol}
                  </span>

                  {/* Result badge */}
                  <div
                    className={cn(
                      'flex h-5 items-center justify-center rounded px-1.5 text-xs font-bold shrink-0 min-w-[28px]',
                      outcomeTone[roll.outcome],
                    )}
                    title={`Result: ${roll.finalResult}`}
                  >
                    {roll.finalResult}
                  </div>

                  {/* Label with tooltip for full info */}
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className='text-xs font-medium text-foreground truncate min-w-0 flex-1 cursor-help'>
                          {roll.context.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5} className='max-w-xs'>
                        <div className='font-semibold mb-1'>{roll.context.label}</div>
                        {roll.context.description && (
                          <div className='text-muted-foreground'>{roll.context.description}</div>
                        )}
                        <div className='text-[10px] text-muted-foreground mt-1'>
                          {formatDistanceToNow(roll.timestamp, { addSuffix: true })}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Compact timestamp */}
                  <span className='text-[9px] text-muted-foreground/60 shrink-0 hidden sm:inline'>
                    {formatDistanceToNow(roll.timestamp, { addSuffix: true }).replace(' ago', '')}
                  </span>

                  {/* Actions */}
                  {(onReroll || onCopy) && (
                    <div className='flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                      {onReroll && (
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-5 w-5 p-0'
                          onClick={() => onReroll(roll.id)}
                          title='Reroll'
                        >
                          <RotateCcw className='h-3 w-3' />
                          <span className='sr-only'>Reroll</span>
                        </Button>
                      )}

                      {onCopy && (
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-5 w-5 p-0'
                          onClick={() => onCopy(formatRollSummary(roll))}
                          title='Copy summary'
                        >
                          <Copy className='h-3 w-3' />
                          <span className='sr-only'>Copy</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
