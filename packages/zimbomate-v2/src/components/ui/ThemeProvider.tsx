import React, { createContext, useContext, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { Theme } from '../../types/enums'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
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
    currentTheme, 
    setTheme, 
    animations, 
    sounds, 
    toggleAnimations, 
    toggleSounds 
  } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    const body = window.document.body
    root.setAttribute('data-theme', currentTheme)
    body.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  const value = {
    theme: currentTheme,
    setTheme,
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