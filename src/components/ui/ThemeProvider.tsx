import React, { createContext, use } from 'react'
import { useThemeStore } from '../../stores/themeStore'

interface ThemeContextType {
  readonly theme: 'matsu'
  animations: boolean
  sounds: boolean
  toggleAnimations: () => void
  toggleSounds: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = use(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'matsu'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const {
    theme,
    animations,
    sounds,
    toggleAnimations,
    toggleSounds,
  } = useThemeStore()

  const value = {
    theme,
    animations,
    sounds,
    toggleAnimations,
    toggleSounds,
  }

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  )
}
