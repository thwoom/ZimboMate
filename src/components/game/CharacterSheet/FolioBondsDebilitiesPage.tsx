import React from 'react'

import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface FolioBondsDebilitiesPageProps {
  highlighted?: boolean
}

export default function FolioBondsDebilitiesPage({
  highlighted = false,
}: FolioBondsDebilitiesPageProps): JSX.Element {
  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>Bonds</h3>
          <div className='text-muted-foreground text-sm'>
            Manage and resolve bonds.
          </div>
        </CardContent>
      </Card>
      <Card className={cn(highlighted && 'ring-2 ring-primary/60')}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Debilities
          </h3>
          <div className='text-muted-foreground text-sm'>
            Toggle Dungeon World debilities.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
