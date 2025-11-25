import { useMemo } from 'react'
import { getLlmRolloutStage } from '@/utils/featureFlags'
import { useIsTauriRuntime } from '@/utils/tauriRuntime'
import { useAppModeStore } from '@/stores/appModeStore'

export interface Capabilities {
  mode: 'sheet-only'
  llmAllowed: false
  canApplyAutomation: false
  canUndoAutomation: false
  rolloutStage: 'dark' | 'opt_in' | 'default'
}

export function useCapabilities(): Capabilities {
  useAppModeStore((s) => s.mode) // subscribe to keep reactivity if future changes
  useIsTauriRuntime() // keep hook usage for consistency
  const rolloutStage = useMemo(() => getLlmRolloutStage(), [])

  return {
    mode: 'sheet-only',
    llmAllowed: false,
    canApplyAutomation: false,
    canUndoAutomation: false,
    rolloutStage,
  }
}
