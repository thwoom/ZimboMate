import type { RollResult } from '@/stores/diceStore'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Copy, Dices, RotateCcw } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { RollLog } from './RollLog'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '@/stores/characterStore'
import { useDiceStore } from '@/stores/diceStore'
import { formatRollSummary } from '@/utils/diceFormatting'

interface RollHUDProps {
  characterId?: string
  className?: string
}

const toneByOutcome: Record<RollResult['outcome'], string> = {
  success: 'bg-chart-2/20 text-chart-2 border-chart-2/40',
  partial: 'bg-amber-500/15 text-amber-700 border-amber-600/40',
  failure: 'bg-destructive/15 text-destructive border-destructive/40',
}

const modFmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

export const RollHUD: React.FC<RollHUDProps> = ({ characterId, className }) => {
  const activeCharacter = useCharacterStore((s) => s.getActiveCharacter?.())
  const {
    currentRoll,
    isRolling,
    historyByCharacter,
    reroll,
    hudPinned,
    hudPosition,
    hudStyle,
    showMicro,
  } = useDiceStore((s) => ({
    currentRoll: s.currentRoll,
    isRolling: s.isRolling,
    historyByCharacter: s.historyByCharacter,
    reroll: s.reroll,
    hudPinned: s.settings.rollHudPinned,
    hudPosition: s.settings.rollHudPosition,
    hudStyle: s.settings.rollHudStyle,
    showMicro: s.settings.showBarMicroHistory,
  }))

  const targetCharacterId = characterId || activeCharacter?.id || ''
  const history = useMemo(() => {
    if (!targetCharacterId) return [] as RollResult[]
    return historyByCharacter[targetCharacterId] ?? []
  }, [historyByCharacter, targetCharacterId])

  const [expanded, setExpanded] = useState(false)
  const [animateDice, setAnimateDice] = useState(false)
  const [animateTotal, setAnimateTotal] = useState(false)
  const [flashOutcome, setFlashOutcome] = useState<RollResult['outcome'] | null>(null)

  const last = useMemo(() => {
    if (!targetCharacterId) return currentRoll
    return history[0] ?? currentRoll
  }, [currentRoll, history, targetCharacterId])

  const historyEntries = useMemo(() => {
    if (!last) return history
    return history.filter((roll) => roll.id !== last.id)
  }, [history, last])

  const fullHistory = useMemo(() => {
    if (!last) return historyEntries
    return [last, ...historyEntries]
  }, [historyEntries, last])

  const handleRerollEntry = useCallback(
    async (rollId: string) => {
      if (isRolling) {
        toast('Finish the current roll before rerolling.')
        return
      }

      try {
        const result = await reroll(rollId)
        if (result) {
          toast.success('Re-rolling dice...')
        } else {
          toast.warning('Unable to reroll that entry.')
        }
      } catch (error) {
        toast.error('Unable to reroll right now.', {
          description: error instanceof Error ? error.message : undefined,
        })
      }
    },
    [isRolling, reroll],
  )

  const handleRerollLatest = useCallback(async () => {
    if (!last) return
    await handleRerollEntry(last.id)
  }, [handleRerollEntry, last])

  const writeToClipboard = useCallback(async (text: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard unavailable')
      }
      await navigator.clipboard.writeText(text)
      toast.success('Roll summary copied to clipboard')
    } catch (error) {
      toast.error('Copy failed', {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }, [])

  const copySummary = useCallback(
    (roll: RollResult) => {
      void writeToClipboard(formatRollSummary(roll))
    },
    [writeToClipboard],
  )

  const handleHistoryCopy = useCallback(
    (summary: string) => {
      void writeToClipboard(summary)
    },
    [writeToClipboard],
  )

  // Animate on new roll
  const lastId = last?.id
  React.useEffect(() => {
    if (!lastId || !last) return
    setAnimateDice(true)
    setAnimateTotal(true)
    setFlashOutcome(last.outcome)

    const t1 = setTimeout(() => setAnimateDice(false), 700)
    const t2 = setTimeout(() => setAnimateTotal(false), 600)
    const t3 = setTimeout(() => setFlashOutcome(null), 800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [last, lastId])

  // Global keyboard shortcuts: H toggle history, R reroll
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable ||
        (target.closest && target.closest('input, textarea, [contenteditable="true"], select'))
      ) {
        return
      }

      if (e.key === 'h' || e.key === 'H') {
        setExpanded((v) => !v)
      } else if (e.key === 'r' || e.key === 'R') {
        void handleRerollLatest()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRerollLatest])

  if (!hudPinned || !last) return null

  const isBar = hudStyle === 'bar'

  const containerClass = cn(
    'sticky z-10',
    hudPosition === 'bottom' ? 'bottom-2' : 'top-2',
    className,
    isBar ? 'px-2 py-1.5' : '',
  )

  const diceClass = cn(
    'flex items-center justify-center rounded bg-muted text-foreground font-semibold',
    animateDice && 'animate-bounce',
    isBar ? 'h-6 w-6 text-sm' : 'h-7 w-7 text-sm',
  )

  const summaryTextClass = cn(
    isBar ? 'text-xs sm:text-sm' : 'text-sm',
    animateTotal && 'animate-pulse',
  )

  const actionButtonClass = cn('px-2.5', isBar ? 'h-7' : 'h-8')
  const flashBackground: Record<RollResult['outcome'], string> = {
    success: 'from-emerald-200/70 via-emerald-200/20 to-transparent',
    partial: 'from-amber-200/70 via-amber-200/20 to-transparent',
    failure: 'from-red-200/70 via-red-200/20 to-transparent',
  }

  const inner = (
    <div
      className={cn(
        'relative overflow-hidden',
        isBar ? 'rounded-sm' : 'rounded-md',
      )}
    >
      <AnimatePresence>
        {flashOutcome && (
          <motion.div
            key={flashOutcome}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={cn(
              'pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r blur-lg',
              flashBackground[flashOutcome],
            )}
          />
        )}
      </AnimatePresence>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <div
            role='img'
            aria-roledescription='die'
            aria-label={`First die showing ${last.dice1}`}
            className={diceClass}
          >
            {last.dice1}
          </div>
          <div className='text-muted-foreground text-sm font-medium'>+</div>
          <div
            role='img'
            aria-roledescription='die'
            aria-label={`Second die showing ${last.dice2}`}
            className={diceClass}
          >
            {last.dice2}
          </div>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge
              aria-label={`Outcome: ${last.outcome}`}
              className={cn(
                'border px-2 py-0.5 text-[10px] uppercase tracking-wide',
                toneByOutcome[last.outcome],
              )}
            >
              {last.outcome}
            </Badge>
            <span className='text-xs text-muted-foreground truncate'>
              {last.context.label}
            </span>
          </div>
          <div className={cn(summaryTextClass, 'mt-0.5')}>
            <span className='text-muted-foreground'>2d6</span>
            {last.modifier !== 0 && (
              <span className='text-muted-foreground'> {modFmt(last.modifier)}</span>
            )}
            <span className='text-muted-foreground'> = </span>
            <span className='font-semibold text-foreground'>{last.finalResult}</span>
          </div>
        </div>
      </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          <Button
            size='sm'
            variant='outline'
            className={cn(actionButtonClass, 'gap-1.5')}
            onClick={() => {
              void handleRerollLatest()
            }}
            aria-label='Reroll latest result'
          >
            <RotateCcw className='h-3.5 w-3.5' />
            {!isBar && <span>Reroll</span>}
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className={cn(actionButtonClass, 'gap-1.5')}
            onClick={() => copySummary(last)}
            aria-label='Copy roll summary'
          >
            <Copy className='h-3.5 w-3.5' />
            {!isBar && <span>Copy</span>}
          </Button>
          <Button
            size='sm'
            variant='outline'
            className={cn(actionButtonClass, 'gap-1.5')}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls='rollhud-history'
            aria-label='Toggle roll history'
          >
            {expanded ? (
              <ChevronUp className='h-3.5 w-3.5' />
            ) : (
              <ChevronDown className='h-3.5 w-3.5' />
            )}
            {!isBar && <span>History</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Card
      variant='surface'
      aria-live='polite'
      role='region'
      aria-label='Latest dice roll'
      className={containerClass}
    >
      <CardContent className={isBar ? 'p-0' : 'px-4 py-3'}>
        {inner}
        {isBar && showMicro && historyEntries.length > 0 && !expanded && (
          <div className='mt-1.5 flex items-center gap-1.5'>
            {historyEntries.slice(0, 10).map((r) => (
              <span
                key={r.id}
                title={`${r.context.label}: ${r.finalResult}`}
                className={cn(
                  'inline-block h-1.5 w-3 rounded-sm',
                  r.outcome === 'success'
                    ? 'bg-chart-2'
                    : r.outcome === 'partial'
                      ? 'bg-amber-400'
                      : 'bg-destructive',
                )}
              />
            ))}
          </div>
        )}

        {expanded && (
          <div id='rollhud-history' className='mt-3 border-t-2 border-border pt-3'>
            {fullHistory.length === 0 ? (
              <div className='text-xs text-muted-foreground'>
                No rolls yet. Make a move to start the log.
              </div>
            ) : (
              <>
                <div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
                  <span className='flex items-center gap-2'>
                    <Dices className='h-3.5 w-3.5 text-muted-foreground' aria-hidden='true' />
                    Recent Rolls
                  </span>
                  <span>{fullHistory.length}</span>
                </div>
                <RollLog
                  rolls={fullHistory}
                  onReroll={handleRerollEntry}
                  onCopy={handleHistoryCopy}
                  variant='embedded'
                  showHeader={false}
                  showFilters={false}
                  listClassName='max-h-48 overflow-y-auto pr-1'
                />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RollHUD
