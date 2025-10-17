import type { Attributes } from '@/models/Character'
import React, { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type StatKey = keyof Attributes

export const STAT_ORDER: StatKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

interface StatPickerPopoverProps {
  children: React.ReactElement
  onSelect: (stat: StatKey) => void
  title?: string
  description?: string
  disabled?: boolean
}

export function StatPickerPopover({
  children,
  onSelect,
  title,
  description,
  disabled = false,
}: StatPickerPopoverProps): React.ReactElement {
  const [open, setOpen] = useState(false)

  const handleSelect = (stat: StatKey) => {
    onSelect(stat)
    setOpen(false)
  }

  if (disabled) {
    return React.cloneElement(children, { disabled: true })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-64 space-y-3' align='start'>
        {title ? <p className='text-sm font-semibold text-foreground'>{title}</p> : null}
        {description ? <p className='text-xs text-muted-foreground'>{description}</p> : null}
        <div className='grid grid-cols-3 gap-2'>
          {STAT_ORDER.map((stat) => (
            <Button
              key={stat}
              type='button'
              size='sm'
              variant='outline'
              onClick={() => handleSelect(stat)}
              className='font-semibold'
            >
              {stat}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
