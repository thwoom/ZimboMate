import React, { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'

interface ThemeContextType {
  isDark: boolean
  toggleDark: () => void
  animations: boolean
  sounds: boolean
  toggleAnimations: () => void
  toggleSounds: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { 
    isDark, 
    toggleDark, 
    animations, 
    sounds, 
    toggleAnimations, 
    toggleSounds 
  } = useThemeStore()

  useEffect(() => {
    // Apply dark mode class on mount and changes
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const value = {
    isDark,
    toggleDark,
    animations,
    sounds,
    toggleAnimations,
    toggleSounds,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}