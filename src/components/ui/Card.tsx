import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow',
  {
    variants: {
      variant: {
        default: 'border-border bg-card',
        surface: 'border-border bg-popover',
        elevated: 'border-transparent bg-popover shadow-lg shadow-primary/10',
        muted: 'border-border bg-muted text-muted-foreground',
        magical: 'card-magical',
        parchment: 'card-parchment',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/**
 * Props for the Matsu-themed Card component.
 *
 * @remarks
 * Supported variants: `default`, `surface`, `elevated`, `muted`, `magical`, and `parchment`.
 * The component does not expose a `padding` prop—apply spacing with `<CardHeader>`,
 * `<CardContent>`, `<CardFooter>`, or Tailwind utility classes on child elements instead.
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({
  ref,
  className,
  variant,
  ...props
}: CardProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}
Card.displayName = 'Card'

function CardHeader({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}
CardHeader.displayName = 'CardHeader'

function CardTitle({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.RefObject<HTMLHeadingElement | null>
}) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  )
}
CardTitle.displayName = 'CardTitle'

function CardDescription({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement | null>
}) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
CardDescription.displayName = 'CardDescription'

function CardContent({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement | null>
}) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
}
CardContent.displayName = 'CardContent'

function CardFooter({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
}
