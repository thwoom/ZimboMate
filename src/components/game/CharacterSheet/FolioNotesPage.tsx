import React from 'react'
import { Card, CardContent, Textarea } from '@/components/ui'
import { useSecretaryStore } from '@/stores/secretaryStore'

interface FolioNotesPageProps {
  highlighted?: boolean
  onNoteCreated?: (title?: string) => void
}

const FolioNotesPage: React.FC<FolioNotesPageProps> = ({ onNoteCreated }) => {
  const notes = useSecretaryStore((s) => s.notes)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const title = (data.get('title') as string) ?? ''
    const body = (data.get('body') as string) ?? ''
    useSecretaryStore.getState().applyActions({
      text: `${title} ${body}`,
      actions: [
        {
          type: 'addNote',
          title: title || 'Note',
          body,
          confidence: 1,
          from: 'rules',
        },
      ],
      confidence: 1,
      createdAt: Date.now(),
    })
    onNoteCreated?.(title)
    form.reset()
  }

  return (
    <Card>
      <CardContent className='space-y-3'>
        <form className='space-y-2' onSubmit={handleCreate}>
          <input name='title' placeholder='Note title' className='w-full rounded border px-2 py-1 text-sm' />
          <Textarea name='body' placeholder='Details' className='min-h-[120px]' />
          <button type='submit' className='rounded bg-primary px-3 py-1 text-sm text-primary-foreground'>Save note</button>
        </form>
        <div className='space-y-2'>
          {notes.map((note) => (
            <div key={note.id} className='rounded border px-2 py-1'>
              <div className='text-xs text-muted-foreground'>{new Date(note.createdAt).toLocaleTimeString()}</div>
              <div className='text-sm font-semibold'>{note.title}</div>
              {note.body ? <div className='text-xs text-muted-foreground'>{note.body}</div> : null}
            </div>
          ))}
          {notes.length === 0 && (
            <div className='text-sm text-muted-foreground'>No notes yet. Add one above.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default FolioNotesPage
