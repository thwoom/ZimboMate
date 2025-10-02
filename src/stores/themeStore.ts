import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  readonly theme: 'matsu'
  animations: boolean
  sounds: boolean
  toggleAnimations: () => void
  toggleSounds: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      theme: 'matsu',
      animations: true,
      sounds: true,
      toggleAnimations: () => set(state => ({ animations: !state.animations })),
      toggleSounds: () => set(state => ({ sounds: !state.sounds })),
    }),
    {
      name: 'zimbomate-matsu-theme-storage',
    },
  ),
)
