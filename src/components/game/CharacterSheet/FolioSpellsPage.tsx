import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useMemo, useRef } from 'react'

import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '@/stores/characterStore'
import { useHoldStore } from '@/stores/holdStore'

export interface FolioSpellsPageProps {
  highlighted?: boolean
}

export default function FolioSpellsPage({
  highlighted = false,
}: FolioSpellsPageProps): JSX.Element {
  const activeCharacter = useCharacterStore((state) =>
    state.getActiveCharacter(),
  )
  const characterId = activeCharacter?.id ?? null

  const knownSpells = useMemo(
    () =>
      (activeCharacter?.knownSpells ?? []).filter(
        (spell) => typeof spell === 'string',
      ),
    [activeCharacter?.knownSpells],
  )

  const preparedSpells = useMemo(
    () =>
      (activeCharacter?.preparedSpells ?? []).filter(
        (spell) => typeof spell === 'string',
      ),
    [activeCharacter?.preparedSpells],
  )

  const holdSelector = useCallback(
    (state: ReturnType<typeof useHoldStore.getState>) =>
      characterId ? (state.characterHolds[characterId] ?? []) : [],
    [characterId],
  )

  const holdEntries = useHoldStore(holdSelector)

  const knownListRef = useRef<HTMLDivElement>(null)
  const preparedListRef = useRef<HTMLDivElement>(null)
  const holdListRef = useRef<HTMLDivElement>(null)

  const knownVirtualizer = useVirtualizer({
    count: knownSpells.length,
    getScrollElement: () => knownListRef.current,
    estimateSize: () => 48,
    overscan: 6,
  })

  const preparedVirtualizer = useVirtualizer({
    count: preparedSpells.length,
    getScrollElement: () => preparedListRef.current,
    estimateSize: () => 40,
    overscan: 4,
  })

  const holdVirtualizer = useVirtualizer({
    count: holdEntries.length,
    getScrollElement: () => holdListRef.current,
    estimateSize: () => 56,
    overscan: 4,
  })

  const totalHold = useMemo(
    () => holdEntries.reduce((acc, entry) => acc + entry.amount, 0),
    [holdEntries],
  )

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3 space-y-4'>
          <div>
            <h3 className='text-foreground text-sm font-medium'>Spellbook</h3>
            <p className='text-muted-foreground text-sm'>
              Track known and prepared spells without leaving the sheet.
            </p>
          </div>

          <section>
            <header className='text-muted-foreground flex items-center justify-between text-xs uppercase'>
              <span>Known spells</span>
              <span>{knownSpells.length}</span>
            </header>
            {knownSpells.length === 0 ? (
              <p className='text-muted-foreground mt-2 text-sm'>
                No spells known yet. Add spells from the spellbook manager.
              </p>
            ) : (
              <div
                ref={knownListRef}
                data-testid='known-spells-list'
                className='border-border mt-2 max-h-60 overflow-y-auto rounded-md border'
              >
                <div
                  style={{
                    height: `${knownVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {knownVirtualizer.getVirtualItems().map((virtualRow) => {
                    const spell = knownSpells[virtualRow.index]
                    if (!spell) return null

                      return (
                        <div
                          key={`${spell}-${virtualRow.index}`}
                          data-index={virtualRow.index}
                          data-testid={`known-spell-${spell}`}
                          className='bg-card/80 hover:bg-muted/40 absolute inset-x-0 mx-2 my-1 rounded-md border border-border px-3 py-2 text-sm shadow-sm transition-colors'
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                        <p className='text-foreground truncate font-medium'>
                          {spell}
                        </p>
                        <p className='text-muted-foreground text-[11px]'>
                          Known spell
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          <section>
            <header className='text-muted-foreground flex items-center justify-between text-xs uppercase'>
              <span>Prepared spells</span>
              <span>{preparedSpells.length}</span>
            </header>
            {preparedSpells.length === 0 ? (
              <p className='text-muted-foreground mt-2 text-sm'>
                Nothing prepared. Prepare spells to quick-cast during play.
              </p>
            ) : (
              <div
                ref={preparedListRef}
                className='border-border mt-2 max-h-40 overflow-y-auto rounded-md border'
              >
                <div
                  style={{
                    height: `${preparedVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {preparedVirtualizer.getVirtualItems().map((virtualRow) => {
                    const spell = preparedSpells[virtualRow.index]
                    if (!spell) return null

                    return (
                      <div
                        key={`${spell}-${virtualRow.index}`}
                        data-index={virtualRow.index}
                        className='bg-muted/30 absolute inset-x-0 mx-2 my-1 rounded-md border border-border px-3 py-2 text-sm'
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <p className='text-foreground truncate font-medium'>
                          {spell}
                        </p>
                        <p className='text-muted-foreground text-[11px]'>
                          Ready to cast
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3 space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-foreground text-sm font-medium'>Hold</h3>
            <span className='text-muted-foreground text-xs uppercase'>
              {totalHold} total
            </span>
          </div>
          {holdEntries.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              Spendable hold from moves like Defend or Trap Expert will appear
              here.
            </p>
          ) : (
            <div
              ref={holdListRef}
              className='border-border max-h-60 overflow-y-auto rounded-md border'
            >
              <div
                style={{
                  height: `${holdVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {holdVirtualizer.getVirtualItems().map((virtualRow) => {
                  const entry = holdEntries[virtualRow.index]
                  if (!entry) return null

                  return (
                    <div
                      key={entry.id}
                      data-index={virtualRow.index}
                      className='bg-card/80 hover:bg-muted/40 absolute inset-x-0 mx-2 my-1 rounded-md border border-border px-3 py-2 text-sm shadow-sm transition-colors'
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='text-foreground truncate font-medium'>
                            {entry.moveName}
                          </p>
                          <p className='text-muted-foreground text-[11px]'>
                            {entry.description}
                          </p>
                        </div>
                        <span className='bg-primary/10 text-primary rounded-full px-2 py-1 text-[11px] font-semibold'>
                          {entry.amount}
                        </span>
                      </div>
                      {entry.rollId ? (
                        <p className='text-muted-foreground mt-1 text-[11px]'>
                          Roll {entry.rollId}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
