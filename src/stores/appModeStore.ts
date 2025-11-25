import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'

export type AppMode = 'sheet-only'

interface AppModeState {
  mode: AppMode
  isFirstRun: boolean
  setMode: (mode?: AppMode) => void
  completeFirstRun: () => void
}

const STORAGE_KEY = 'zimbo.appMode'

let setStateRef: ((partial: Partial<AppModeState>) => void) | undefined

export const useAppModeStore = createWithEqualityFn<AppModeState>()(
  persist(
    (set) => {
      setStateRef = set
      return {
        mode: 'sheet-only',
        isFirstRun: false,
        setMode: () => set({ mode: 'sheet-only' }),
        completeFirstRun: () => set({ isFirstRun: false }),
      }
    },
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        try {
          const current = state?.mode
          if (!current) return

          setTimeout(() => {
            if (current === 'sheet-only') {
              setStateRef?.({ isFirstRun: false })
            }
          }, 0)
        } catch {
          // noop
        }
      },
    },
  ),
)
