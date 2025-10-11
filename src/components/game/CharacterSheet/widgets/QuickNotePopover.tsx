import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface QuickNotePopoverProps {
  className?: string
  children: React.ReactNode
  title?: string
  onSubmit?: (note: { title?: string; body: string }) => void | Promise<void>
}

export default function QuickNotePopover({
  className,
  children,
  title,
  onSubmit,
}: QuickNotePopoverProps): JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [body, setBody] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const effectiveTitle = title?.trim()

  const handleSubmit = async () => {
    const trimmed = body.trim()
    if (!trimmed) return
    setIsSaving(true)
    try {
      await onSubmit?.({ title: effectiveTitle || undefined, body: trimmed })
      setBody('')
      setOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        if (!value) setBody('')
        setOpen(value)
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className={cn('w-96', className)} side='top' align='end'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='quick-note' className='text-muted-foreground text-xs'>
            {effectiveTitle ? `Quick note for ${effectiveTitle}` : 'Quick note'}
          </label>
          <textarea
            id='quick-note'
            className='bg-card border-border focus-visible:ring-ring w-full resize-none rounded-md border p-2 text-sm outline-none focus-visible:ring-2'
            placeholder='Keep it short and actionable.'
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <div className='flex items-center justify-end gap-2'>
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground text-sm'
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type='button'
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-60'
              onClick={handleSubmit}
              disabled={isSaving || body.trim().length === 0}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
