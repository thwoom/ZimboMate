import React from 'react'
import * as Select from '@radix-ui/react-select'
import { useTheme } from './ThemeProvider'
import { Palette, ChevronDown, Check } from 'lucide-react'
import { Theme } from '../../types/enums'

const themes = [
  { value: 'fantasy' as Theme, label: 'Fantasy', icon: '🏰' },
  { value: 'dark' as Theme, label: 'Dark', icon: '🌑' },
  { value: 'light' as Theme, label: 'Light', icon: '☀️' },
  { value: 'sci-fi' as Theme, label: 'Sci-Fi', icon: '🚀' },
  { value: 'moonlit-grimoire' as Theme, label: 'Moonlit Grimoire', icon: '🌙' },
  { value: 'dragonforge-ember' as Theme, label: 'Dragonforge Ember', icon: '🔥' },
  { value: 'enchanted-grove' as Theme, label: 'Enchanted Grove', icon: '🌿' },
  { value: 'arcane-storm' as Theme, label: 'Arcane Storm', icon: '⚡' },
  { value: 'ancient-sandstone' as Theme, label: 'Ancient Sandstone', icon: '🏺' }
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select.Root value={theme} onValueChange={(value) => setTheme(value as Theme)}>
      <Select.Trigger
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:opacity-90 focus:outline-none"
        aria-label="Select theme"
      >
        <Palette size={16} />
        <Select.Value placeholder="Theme" />
        <Select.Icon>
          <ChevronDown size={14} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content 
          className="z-[1000] overflow-hidden rounded-lg border shadow-lg min-w-[140px]"
          position="popper"
          sideOffset={6}
          style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}
        >
          <Select.Viewport className="p-1">
            {themes.map((themeOption) => (
              <Select.Item
                key={themeOption.value}
                value={themeOption.value}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer outline-none relative transition-colors"
                style={{
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{themeOption.icon}</span>
                <Select.ItemText>{themeOption.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}