import React, { useMemo } from 'react'

import { Card, CardContent } from '@/components/ui'
import { CLASS_MOVES } from '@/data/advancement/classMoves'
import { cn } from '@/lib/utils'
import { resolveAttributeScore } from '@/models/Character'
import { useCharacterStore } from '@/stores/characterStore'

import MoveChips from './widgets/MoveChips'

export interface FolioStatsPageProps {
  highlighted?: boolean
}

export default function FolioStatsPage({
  highlighted = false,
}: FolioStatsPageProps): JSX.Element {
  const { getActiveCharacter } = useCharacterStore()
  const ch = getActiveCharacter()
  const attrs = ch?.attributes ?? {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  }

  const advancedMoves = useMemo(
    () => {
      if (!ch) return []
      const classMoves = CLASS_MOVES[ch.class] ?? []
      const moveLookup = new Map(classMoves.map((move) => [move.id, move]))
      return (ch.knownMoves ?? [])
        .map((moveId) => moveLookup.get(moveId))
        .filter((move): move is (typeof classMoves)[number] => Boolean(move))
    },
    [ch],
  )

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Attributes
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map((k) => (
              <div
                key={k}
                data-testid={`attribute-${k}`}
                className='bg-muted/30 border-border rounded-md border p-2 text-center'
              >
                <div className='text-muted-foreground text-xs'>{k}</div>
                <div className='text-foreground text-lg font-semibold'>
                  {resolveAttributeScore(
                    (attrs as Record<string, unknown>)[k],
                    10,
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Basic Moves
          </h3>
          <MoveChips
            onSelect={() => {
              /* composer integration */
            }}
          />
        </CardContent>
      </Card>
      <Card
        className={cn(
          'md:col-span-2',
          highlighted && 'ring-2 ring-primary/60',
        )}
      >
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Advanced Moves
          </h3>
          {advancedMoves.length > 0 ? (
            <ul
              className='space-y-2'
              data-testid='advanced-move-list'
            >
              {advancedMoves.map((move) => (
                <li
                  key={move.id}
                  data-testid={`advanced-move-${move.id}`}
                  className='border-border bg-card/80 rounded-md border p-3 text-sm shadow-sm'
                >
                  <p className='text-foreground font-medium'>{move.name}</p>
                  <p className='text-muted-foreground text-xs mt-1 line-clamp-3'>
                    {move.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className='text-muted-foreground text-sm'
              data-testid='advanced-move-empty'
            >
              No advanced moves selected yet. Use the level-up wizard to add one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
