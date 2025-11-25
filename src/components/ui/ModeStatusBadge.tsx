import React from 'react'
import { Badge, Button } from '@/components/ui'
import { useAppModeStore } from '@/stores/appModeStore'

export const ModeStatusBadge: React.FC = () => {
  useAppModeStore((state) => state.mode)
  const label = 'Sheet-Only'
  const description = 'Offline play mode'

  return (
    <div className='flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs'>
      <Badge variant='outline' className='border-none text-xs'>
        {label}
      </Badge>
      <span className='text-muted-foreground'>{description}</span>
    </div>
  )
}

export default ModeStatusBadge
