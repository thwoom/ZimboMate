import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  animations: boolean
  sounds: boolean
  toggleDark: () => void
  toggleAnimations: () => void
  toggleSounds: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      animations: true,
      sounds: true,
      toggleDark: () => {
        set((state) => {
          const newDark = !state.isDark
          // Update the document class for dark mode
          if (newDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDark: newDark }
        })
      },
      toggleAnimations: () => set((state) => ({ animations: !state.animations })),
      toggleSounds: () => set((state) => ({ sounds: !state.sounds })),
    }),
    {
      name: 'zimbomate-matsu-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on hydration
        if (state?.isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)