import React, { useCallback } from 'react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Dices, Info, NotebookPen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotesWidget } from './SessionTools/NotesWidget'
import { RollHistoryWidget } from './SessionTools/RollHistoryWidget'
import { ContextAwareSystem } from './ContextAwareSystem'
import { useCharacterStore } from '@/stores/characterStore'
import { useDiceStore } from '@/stores/diceStore'
import { useSecretaryStore } from '@/stores/secretaryStore'

interface NonChronicleRightRailProps {
  className?: string
}

/**
 * A rich, self-sufficient right rail for sheet-only mode.
 * Replaces Chronicle dock with quick actions, suggestions, and session tools
 * so the layout feels complete rather than missing a feature.
 */
export const NonChronicleRightRail: React.FC<NonChronicleRightRailProps> = ({
  className,
}) => {
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter?.()

  const rollCustom = useDiceStore((s) => s.rollCustom)
  const secretaryNotes = useSecretaryStore((s) => s.notes.slice(0, 5))
  const secretaryTags = useSecretaryStore((s) => s.tags.slice(0, 5))

  const onQuickRoll = useCallback(async () => {
    if (!activeCharacter) return
    await rollCustom({
      modifier: 0,
      characterId: activeCharacter.id,
      context: { label: 'Quick Roll' },
    })
  }, [activeCharacter, rollCustom])

  const scrollTo = (id: string) => () => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-4', className)}>
      <Card variant='surface'>
        <CardContent className='p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='flex items-center gap-2 font-semibold'>
              <Sparkles size={16} />
              Quick Actions
            </h3>
            <Badge variant='outline' className='text-xs'>Tabletop mode</Badge>
          </div>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
            <Button
              size='sm'
              variant='outline'
              onClick={onQuickRoll}
              disabled={!activeCharacter}
              title={activeCharacter ? 'Roll 2d6' : 'Create/select a character first'}
              className='justify-start'
            >
              <Dices size={16} /> Roll 2d6
            </Button>
            <Button size='sm' variant='outline' onClick={scrollTo('notes-widget')} className='justify-start'>
              <NotebookPen size={16} /> Notes
            </Button>
          </div>
          <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
            <Info size={14} className='text-muted-foreground' />
            Tip: Press Ctrl+K to open the command palette.
          </div>
        </CardContent>
      </Card>

      {activeCharacter ? (
        <Card variant='surface'>
          <CardContent className='p-0'>
            <ContextAwareSystem compact characterId={activeCharacter.id} />
          </CardContent>
        </Card>
      ) : null}

      <div id='notes-widget'>
        <NotesWidget />
      </div>

      <RollHistoryWidget />

      {(secretaryNotes.length > 0 || secretaryTags.length > 0) && (
        <Card variant='surface'>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='flex items-center gap-2 font-semibold'>
                <Sparkles size={16} />
                Secretary Notes
              </h3>
            </div>
            {secretaryNotes.length > 0 && (
              <div className='space-y-1 text-sm'>
                {secretaryNotes.map((note) => (
                  <div key={note.id} className='rounded border px-2 py-1'>
                    <div className='text-xs text-muted-foreground'>
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </div>
                    <div className='font-semibold'>{note.title}</div>
                    {note.body ? (
                      <div className='text-xs text-muted-foreground'>{note.body}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            {secretaryTags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {secretaryTags.map((tag) => (
                  <Badge key={tag.id} variant='secondary'>
                    {tag.name} · {tag.tagType}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NonChronicleRightRail
