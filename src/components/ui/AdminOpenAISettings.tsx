import React from 'react'
import { ShieldOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Button } from './Button'

/**
 * AdminOpenAISettings
 *
 * Chronicle/LLM controls were removed. This panel now simply explains that
 * automation is offline so admins aren't left wondering where the toggle went.
 */
export const AdminOpenAISettings: React.FC = () => {
  return (
    <Card variant='elevated' className='border-primary/30 bg-card/80'>
      <CardHeader className='flex flex-row items-center gap-3'>
        <div className='rounded-md bg-primary/10 p-2 text-primary'>
          <ShieldOff size={18} />
        </div>
        <div>
          <CardTitle className='text-base'>Automation Disabled</CardTitle>
          <p className='text-xs text-muted-foreground'>
            Secretary runs locally with no LLM calls. No keys or credits required.
          </p>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <p className='text-sm text-muted-foreground'>
          We removed Chronicle and cloud LLM dependencies. If you need them in the future,
          reintroduce an AI provider and wire it to the secretary store; until then everything is
          fully offline.
        </p>
        <Button variant='secondary' disabled className='w-full'>
          LLM controls unavailable in offline mode
        </Button>
      </CardContent>
    </Card>
  )
}

export default AdminOpenAISettings
