import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-lg border bg-(--color-surface) px-3 py-2 text-sm transition-all duration-200 placeholder:text-(--color-text-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-(--color-primary)/20 focus-visible:ring-(--color-primary) focus-visible:border-(--color-primary)',
        magical: 'magical-border focus-visible:ring-(--gold-500) focus-visible:shadow-magical',
        cyber: 'cyber-border focus-visible:ring-(--cyber-500) [data-theme="sci-fi"] &:block',
        ghost: 'border-transparent bg-(--color-surface-elevated) focus-visible:ring-(--color-primary)',
        error: 'border-(--danger-500) focus-visible:ring-(--danger-500) text-(--danger-600)'
      },
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        md: 'min-h-[80px] px-3 py-2',
        lg: 'min-h-[120px] px-4 py-3 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  helper?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, label, error, helper, ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium text-(--color-text-primary) font-ui"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(textareaVariants({ variant: error ? 'error' : variant, size, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-(--danger-500) font-ui">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-xs text-(--color-text-muted) font-ui">
            {helper}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }