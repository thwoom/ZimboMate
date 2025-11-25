import React from 'react'
import { Card, CardContent } from '@/components/ui'

const EmbeddedRuntimePanel: React.FC = () => (
  <Card>
    <CardContent className='space-y-2'>
      <div className='font-semibold'>Embedded Runtime</div>
      <p className='text-sm text-muted-foreground'>Local model runtime is not used in this build.</p>
    </CardContent>
  </Card>
)

export default EmbeddedRuntimePanel
