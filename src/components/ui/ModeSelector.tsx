import React from 'react'
import { User as UserIcon, X } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { useAppModeStore } from '@/stores/appModeStore'

interface ModeSelectorProps {
  onSelected?: () => void
  onDismiss?: () => void
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  onSelected,
  onDismiss,
}) => {
  const setMode = useAppModeStore((s) => s.setMode)
  const completeFirstRun = useAppModeStore((s) => s.completeFirstRun)

  const choose = () => {
    setMode('sheet-only')
    completeFirstRun()
    onSelected?.()
    onDismiss?.()
  }

  return (
    <div className='relative min-h-screen flex items-center justify-center p-6 bg-background text-foreground'>
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Close mode selector'
          className='absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground transition hover:bg-card hover:text-foreground'
        >
          <X size={16} />
        </button>
      ) : null}
      <div className='w-full max-w-2xl'>
        <Card variant='elevated' className='border-primary/30'>
          <CardContent className='p-6 space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center'>
                <UserIcon size={18} />
              </div>
              <div>
                <h3 className='font-semibold'>Sheet-Only</h3>
                <p className='text-xs text-muted-foreground'>Ink & Steel - fast, focused, offline.</p>
              </div>
            </div>
            <ul className='text-sm list-disc pl-5 space-y-1'>
              <li>Full character sheet editing</li>
              <li>Dice and gameplay tools</li>
              <li>No AI, no background processes</li>
            </ul>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>Default</Badge>
              <Badge variant='outline'>Offline</Badge>
            </div>
            <Button variant='primary' className='w-full' onClick={() => choose()}>
              Start in Sheet-Only
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ModeSelector
