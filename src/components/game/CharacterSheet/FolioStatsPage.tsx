import React from 'react'

import { Card, CardContent } from '@/components/ui'
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
    </div>
  )
}
