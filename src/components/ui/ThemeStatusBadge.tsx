import { Palette } from 'lucide-react'
import React from 'react'
import { useTheme } from './ThemeContext'

interface ThemeStatusBadgeProps {
  /**
   * Optional override for the label that is shown inside the badge and used for accessibility.
   * When omitted, the current theme from the ThemeProvider is displayed.
   */
  label?: string
}

export function ThemeStatusBadge({ label }: ThemeStatusBadgeProps) {
  const { theme } = useTheme()
  const displayName = theme === 'matsu' ? 'Matsu' : theme
  const message = label ?? `Active Theme: ${displayName}`

  return (
    <div
      className='inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-card text-card-foreground'
      role='status'
      aria-live='polite'
      aria-label={message}
    >
      <Palette size={16} aria-hidden='true' />
      <span className='font-medium'>{message}</span>
    </div>
  )
}
