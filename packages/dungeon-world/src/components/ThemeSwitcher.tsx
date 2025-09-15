import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'
import { 
  SunIcon, 
  MoonIcon, 
  SwatchIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { themeService, type ThemeMode } from '../services/ThemeService'

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  'arcane-slate': <MoonIcon className="w-4 h-4" />,
  'cinder-black': <SwatchIcon className="w-4 h-4" />,
  'high-contrast': <SunIcon className="w-4 h-4" />,
  'auto': <ComputerDesktopIcon className="w-4 h-4" />,
}

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('arcane-slate')
  const [availableThemes, setAvailableThemes] = useState(themeService.getAvailableThemes())

  useEffect(() => {
    // Initialize with current theme
    setCurrentTheme(themeService.getCurrentTheme())

    // Listen for theme changes
    const unsubscribe = themeService.addListener((theme) => {
      setCurrentTheme(theme)
    })

    return unsubscribe
  }, [])

  const switchTheme = (theme: ThemeMode) => {
    themeService.setTheme(theme)
  }

  return (
    <div className="flex items-center gap-1 p-1 glass rounded-lg">
      {availableThemes.map((theme) => (
        <Button
          key={theme.value}
          variant={currentTheme === theme.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchTheme(theme.value)}
          className={cn(
            'flex items-center gap-2',
            currentTheme === theme.value && 'shadow-sm'
          )}
          title={`Switch to ${theme.label} theme - ${theme.description}`}
        >
          {themeIcons[theme.value]}
          <span className="hidden sm:inline">{theme.label}</span>
        </Button>
      ))}
    </div>
  )
}