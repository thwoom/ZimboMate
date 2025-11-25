import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'

interface ThemeState {
  readonly theme: 'matsu'
  animations: boolean
  sounds: boolean
  toggleAnimations: () => void
  toggleSounds: () => void
}

export const useThemeStore = createWithEqualityFn<ThemeState>()(
  persist(
    (set) => ({
      theme: 'matsu',
      animations: true,
      sounds: true,
      toggleAnimations: () =>
        set((state) => ({ animations: !state.animations })),
      toggleSounds: () => set((state) => ({ sounds: !state.sounds })),
    }),
    {
      name: 'zimbomate-matsu-theme-storage',
    },
  ),
)
