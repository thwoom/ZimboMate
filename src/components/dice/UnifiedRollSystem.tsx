import type { Attributes } from '../../models/Character'
import type { RollResult } from '../../stores/diceStore'
import { BookOpen, Copy, Dices, Shuffle, Sparkles } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import {
  getAttributeModifier,
  resolveAttributeScore,
} from '../../models/Character'
import { useCharacterStore } from '../../stores/characterStore'
import { useDiceStore } from '../../stores/diceStore'
import { formatRollSummary } from '../../utils/diceFormatting'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { RollLog } from './RollLog'

interface UnifiedRollSystemProps {
  characterId: string
  className?: string
  showHistory?: boolean
}

interface QuickMove {
  id: string
  label: string
  moveId: string
  stat: keyof Attributes
  description: string
}

const STAT_ORDER: Array<keyof Attributes> = [
  'STR',
  'DEX',
  'CON',
  'INT',
  'WIS',
  'CHA',
]

const QUICK_MOVES: QuickMove[] = [
  {
    id: 'hack-and-slash',
    label: 'Hack & Slash',
    moveId: 'hack-and-slash',
    stat: 'STR',
    description: 'Trade blows in melee.',
  },
  {
    id: 'defy-danger',
    label: 'Defy Danger',
    moveId: 'defy-danger',
    stat: 'DEX',
    description: 'Avoid calamity with quick thinking or reflexes.',
  },
  {
    id: 'discern-realities',
    label: 'Discern Realities',
    moveId: 'discern-realities',
    stat: 'WIS',
    description: 'Read the situation before you.',
  },
  {
    id: 'spout-lore',
    label: 'Spout Lore',
    moveId: 'spout-lore',
    stat: 'INT',
    description: 'Share what you already know.',
  },
]

const getModifierDisplay = (value: number): string =>
  value >= 0 ? `+${value}` : `${value}`

export const UnifiedRollSystem: React.FC<UnifiedRollSystemProps> = ({
  characterId,
  className,
  showHistory = true,
}) => {
  const character = useCharacterStore(
    (state) =>
      state.characters.find((entry) => entry.id === characterId) ?? null,
  )

  const {
    rollStat,
    rollMove,
    rollCustom,
    reroll,
    isRolling,
    historyByCharacter,
  } = useDiceStore((state) => ({
    rollStat: state.rollStat,
    rollMove: state.rollMove,
    rollCustom: state.rollCustom,
    reroll: state.reroll,
    isRolling: state.isRolling,
    historyByCharacter: state.historyByCharacter,
  }))

  const history = historyByCharacter[characterId] ?? []

  const statCards = useMemo(() => {
    return STAT_ORDER.map((stat) => {
      const score = resolveAttributeScore(character?.attributes?.[stat], 10)
      return {
        stat,
        score,
        modifier: getAttributeModifier(score),
      }
    })
  }, [character])

  const [customLabel, setCustomLabel] = useState('')
  const [customModifier, setCustomModifier] = useState('0')
  const [customNotes, setCustomNotes] = useState('')
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const handleCopy = async (summary: string) => {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(summary)
        setCopyStatus('Copied to clipboard')
        setTimeout(() => setCopyStatus(null), 2000)
      }
    } catch {
      setCopyStatus('Copy failed')
      setTimeout(() => setCopyStatus(null), 2000)
    }
  }

  const handleStatRoll = async (stat: keyof Attributes, label?: string) => {
    const roll = await rollStat(stat, characterId, label)
    setLastRoll(roll)
  }

  const handleMoveRoll = async (move: QuickMove) => {
    const roll = await rollMove({
      moveId: move.moveId,
      stat: move.stat,
      characterId,
      label: move.label,
    })
    setLastRoll(roll)
  }

  const handleCustomRoll = async () => {
    const trimmedLabel = customLabel.trim()
    if (!trimmedLabel) {
      setCopyStatus('Add a label before rolling')
      setTimeout(() => setCopyStatus(null), 2000)
      return
    }

    const modifier = Number.parseInt(customModifier, 10) || 0
    const roll = await rollCustom({
      modifier,
      characterId,
      context: {
        label: trimmedLabel,
        description: customNotes || undefined,
      },
    })

    setLastRoll(roll)
    setCustomNotes('')
  }

  const handleReroll = async (rollId: string) => {
    const rerolled = await reroll(rollId)
    if (rerolled) {
      setLastRoll(rerolled)
    }
  }

  return (
    <div className={cn('space-y-8', className)}>
      <header className='rounded-lg border border-border bg-card p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='flex items-center gap-2 text-base font-semibold text-foreground'>
              <Dices className='h-4 w-4 text-primary' /> Unified Dice Roller
            </h2>
            <p className='text-sm text-muted-foreground'>
              Roll stats, trigger core moves, and keep a focused log without the
              gimmicks.
            </p>
          </div>

          {copyStatus && (
            <Badge variant='outline' className='bg-primary/10 text-primary'>
              {copyStatus}
            </Badge>
          )}
        </div>
      </header>

      {!character && (
        <div className='rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground'>
          Select or create a character to unlock tailored stat modifiers.
        </div>
      )}

      <section className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-chart-3' />
          <h3 className='text-sm font-semibold text-foreground'>Stat rolls</h3>
        </div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          {statCards.map((card) => (
            <button
              key={card.stat}
              type='button'
              className='flex flex-col rounded-lg border border-border bg-card/80 p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow'
              onClick={() => handleStatRoll(card.stat)}
              disabled={isRolling}
            >
              <span className='text-xs uppercase tracking-wide text-muted-foreground'>
                {card.stat}
              </span>
              <span className='text-2xl font-bold text-foreground'>
                {getModifierDisplay(card.modifier)}
              </span>
              <span className='text-[11px] text-muted-foreground'>
                Score
                {card.score}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-chart-4' />
          <h3 className='text-sm font-semibold text-foreground'>Core moves</h3>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          {QUICK_MOVES.map((move) => (
            <div
              key={move.id}
              className='rounded-lg border border-border bg-card/80 p-4 shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-sm font-semibold text-foreground'>
                    {move.label}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {move.description}
                  </p>
                </div>
                <Badge
                  variant='secondary'
                  className='bg-accent/20 text-accent-foreground'
                >
                  {move.stat}
                </Badge>
              </div>
              <Button
                size='sm'
                className='mt-3'
                onClick={() => handleMoveRoll(move)}
                disabled={isRolling}
              >
                Roll move
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Shuffle className='h-4 w-4 text-primary' />
          <h3 className='text-sm font-semibold text-foreground'>Custom roll</h3>
        </div>
        <div className='grid gap-3 rounded-lg border border-border bg-card/80 p-4 shadow-sm md:grid-cols-[2fr_1fr]'>
          <div className='space-y-3'>
            <div>
              <label
                className='text-xs font-medium text-muted-foreground'
                htmlFor='custom-roll-label'
              >
                Label
              </label>
              <Input
                id='custom-roll-label'
                placeholder='Aid another, Parley...'
                value={customLabel}
                onChange={(event) => setCustomLabel(event.target.value)}
              />
            </div>
            <div>
              <label
                className='text-xs font-medium text-muted-foreground'
                htmlFor='custom-roll-notes'
              >
                Notes (optional)
              </label>
              <Input
                id='custom-roll-notes'
                placeholder='Add context, stakes, or GM move'
                value={customNotes}
                onChange={(event) => setCustomNotes(event.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-col justify-end gap-3'>
            <div>
              <label
                className='text-xs font-medium text-muted-foreground'
                htmlFor='custom-roll-modifier'
              >
                Modifier
              </label>
              <Input
                id='custom-roll-modifier'
                type='number'
                value={customModifier}
                onChange={(event) => setCustomModifier(event.target.value)}
              />
            </div>
            <Button onClick={handleCustomRoll} disabled={isRolling}>
              <Dices className='mr-2 h-4 w-4' /> Roll custom
            </Button>
          </div>
        </div>
      </section>

      {lastRoll && (
        <section className='rounded-lg border border-border bg-card/80 p-4 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                Last roll
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {formatRollSummary(lastRoll)}
              </p>
            </div>
            <Button
              size='sm'
              variant='outline'
              onClick={() => handleCopy(formatRollSummary(lastRoll))}
            >
              <Copy className='mr-2 h-3 w-3' /> Copy summary
            </Button>
          </div>
        </section>
      )}

      {showHistory && (
        <RollLog rolls={history} onReroll={handleReroll} onCopy={handleCopy} />
      )}
    </div>
  )
}
