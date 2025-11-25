import React from 'react'

// Minimal stub Chronicle provider to satisfy legacy imports after Chronicle removal.

export interface ChronicleProviderProps {
  defaultEnabled?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export const ChronicleProvider: React.FC<ChronicleProviderProps> = ({ children }) => (
  <>{children}</>
)

export function useChronicle() {
  return {
    emitAction: () => {},
    emitDiceRoll: () => {},
    emitEquipmentAction: () => {},
    emitCombatAction: () => {},
    submitPromptEntry: () => Promise.resolve(null),
    dismissPromptEntry: () => {},
    state: {},
  }
}

export function useChronicleLLM() {
  return {
    isReady: false,
    lastError: null,
    settings: {},
    setSettings: () => {},
    telemetryEvents: [],
    applyDeltaBundle: async () => ({
      bundleId: '',
      appliedOps: [],
      skippedOps: [],
      undoHandle: { bundleId: '', issuedAt: new Date().toISOString() },
    }),
    proposeDeltas: async () => ({
      bundle: {
        entryId: '',
        narrative: '',
        ops: [],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        reasoning: '',
        idempotencyKey: '',
        model: '',
        createdAt: new Date().toISOString(),
      },
      warnings: [],
    }),
    canApplyAutomation: false,
    canAutoApply: false,
    embeddedRuntime: {
      listModels: async () => [],
      getManifest: async () => null,
      downloadModel: async () => {},
      cancelDownload: async () => {},
      modelsDir: async () => '',
      runTools: async () => ({ operations: [], appliedOps: [], skippedOps: [] }),
      runNarration: async () => ({ text: '' }),
    },
  }
}

export function withChronicle<T extends object>(Component: React.ComponentType<T>): React.FC<T> {
  return function Wrapped(props: T) {
    return (
      <ChronicleProvider>
        <Component {...props} />
      </ChronicleProvider>
    )
  }
}

export default ChronicleProvider
