import React from 'react'
import { useTheme } from './ThemeProvider'
import { Palette } from 'lucide-react'

export function ThemeToggle() {
  const { theme } = useTheme()
  const label = theme === 'matsu' ? 'Matsu Theme Active' : theme

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-card text-card-foreground"
      role="status"
      aria-label={`Active theme: ${label}`}
    >
      <Palette size={16} />
      <span className="font-medium">{label}</span>
    </div>
  )
}