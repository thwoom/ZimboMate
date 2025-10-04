import React, { useCallback, useState } from 'react'

import { Card, CardContent, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '@/stores/characterStore'
import { useChronicleStore } from '@/stores/chronicleStore'
import { logger } from '@/utils/logger'

import QuickNotePopover from './widgets/QuickNotePopover'

export interface FolioNotesPageProps {
  highlighted?: boolean
  onNoteCreated?: (title?: string) => void
}

export default function FolioNotesPage({
  highlighted = false,
  onNoteCreated,
}: FolioNotesPageProps): JSX.Element {
  const [title, setTitle] = useState('')

  const addEntry = useChronicleStore((state) => state.addEntry)
  const currentSessionId = useChronicleStore((state) => state.currentSessionId)
  const currentCampaignId = useChronicleStore((state) => state.currentCampaignId)
  const getActiveCharacter = useCharacterStore((state) => state.getActiveCharacter)

  const handleNoteSubmit = useCallback(
    async ({ body }: { title?: string; body: string }) => {
      const trimmedBody = body.trim()
      const trimmedTitle = title.trim()
      if (!trimmedBody) return

      const activeCharacter = getActiveCharacter()
      const rawText = trimmedTitle ? `${trimmedTitle}

${trimmedBody}` : trimmedBody

      try {
        addEntry({
          rawText,
          sessionId: currentSessionId ?? 'folio-notes',
          campaignId: currentCampaignId ?? undefined,
          parsedEntities: [],
          tags: ['folio-note'],
          isSceneBreak: false,
          userNotes: activeCharacter ? `Linked to ${activeCharacter.name}` : undefined,
        })
        onNoteCreated?.(trimmedTitle || undefined)
        setTitle('')
      } catch (error) {
        logger.error('[folio] Failed to add quick note', error)
      }
    },
    [addEntry, currentCampaignId, currentSessionId, getActiveCharacter, onNoteCreated, title],
  )

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>Notes</h3>
          <div className='text-muted-foreground mb-3 text-sm'>Attach quick notes to the chronicle without leaving your sheet.</div>
          <div className='flex items-center gap-2'>
            <Input
              aria-label='Note title'
              placeholder='Short title (optional)'
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <QuickNotePopover title={title} onSubmit={handleNoteSubmit}>
              <button
                type='button'
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm'
              >
                Add note
              </button>
            </QuickNotePopover>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
