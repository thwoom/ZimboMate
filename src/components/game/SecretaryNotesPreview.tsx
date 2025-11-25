import React from 'react'
import { Badge } from '@/components/ui'
import { useSecretaryStore } from '@/stores/secretaryStore'

export const SecretaryNotesPreview: React.FC = () => {
  const notes = useSecretaryStore((s) => s.notes.slice(0, 5))
  const tags = useSecretaryStore((s) => s.tags.slice(0, 8))

  if (notes.length === 0 && tags.length === 0) {
    return <div className='text-sm text-muted-foreground'>No secretary notes yet.</div>
  }

  return (
    <div className='space-y-2'>
      {notes.length > 0 && (
        <div className='space-y-1'>
          {notes.map((note) => (
            <div key={note.id} className='rounded border px-2 py-1'>
              <div className='text-xs text-muted-foreground'>{new Date(note.createdAt).toLocaleTimeString()}</div>
              <div className='text-sm font-semibold'>{note.title}</div>
              {note.body ? <div className='text-xs text-muted-foreground'>{note.body}</div> : null}
            </div>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {tags.map((tag) => (
            <Badge key={tag.id} variant='secondary'>
              {tag.name} · {tag.tagType}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default SecretaryNotesPreview

