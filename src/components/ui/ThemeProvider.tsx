import type { ThemeContextValue } from './ThemeContext'
import React, { useMemo } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { ThemeContext } from './ThemeContext'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'matsu'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, animations, sounds, toggleAnimations, toggleSounds } =
    useThemeStore()

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      animations,
      sounds,
      toggleAnimations,
      toggleSounds,
    }),
    [animations, sounds, theme, toggleAnimations, toggleSounds],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
