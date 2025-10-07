import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

import { textareaVariants } from './textarea-variants'

export interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, size, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(textareaVariants({ className, variant, size }))}
      {...props}
    />
  )
}

export { Textarea }
