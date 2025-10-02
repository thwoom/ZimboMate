import type { CSSProperties } from 'react'
import type { ToasterProps } from 'sonner'
import { Toaster as Sonner } from 'sonner'

type MatsuToasterProps = Omit<ToasterProps, 'theme'> & {
  readonly theme?: 'light' | 'matsu'
}

const matsuToastStyles: CSSProperties = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
}

function Toaster({ theme = 'matsu', style, ...props }: MatsuToasterProps) {
  const mergedStyles: CSSProperties = {
    ...matsuToastStyles,
    ...style,
  }

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={mergedStyles}
      {...props}
    />
  )
}

export { Toaster }
