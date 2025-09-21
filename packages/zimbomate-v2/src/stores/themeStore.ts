import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme } from '../types/enums'

interface ThemeState {
  currentTheme: Theme
  animations: boolean
  sounds: boolean
  setTheme: (theme: Theme) => void
  toggleAnimations: () => void
  toggleSounds: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: 'moonlit-grimoire' as Theme,
      animations: true,
      sounds: true,
      setTheme: (theme: Theme) => {
        set({ currentTheme: theme })
        // Update the document data-theme attribute
        document.documentElement.setAttribute('data-theme', theme)
      },
      toggleAnimations: () => set((state) => ({ animations: !state.animations })),
      toggleSounds: () => set((state) => ({ sounds: !state.sounds })),
    }),
    {
      name: 'zimbomate-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on hydration
        if (state?.currentTheme) {
          document.documentElement.setAttribute('data-theme', state.currentTheme)
        }
      },
    }
  )
)