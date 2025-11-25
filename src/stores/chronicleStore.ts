// Chronicle removed: lightweight stub to satisfy legacy imports.
type Selector<T, R> = (state: T) => R

interface ChronicleState {
  settings: Record<string, unknown>
  sessionCostCents: number
  lastCostEventAt: number | null
  currentSessionId: string | null
  currentCampaignId: string | null
  deltaHistory: any[]
  auditLog: any[]
  addEntry: (..._args: any[]) => string
  updateEntryText?: (..._args: any[]) => void
  updateSettings: (_partial: Record<string, unknown>) => void
  resetSessionCost: () => void
  clearDeltaLog?: (..._args: any[]) => void
  logResourceChange?: (..._args: any[]) => void
  getEntry?: (_id: string) => any
}

const state: ChronicleState = {
  settings: {},
  sessionCostCents: 0,
  lastCostEventAt: null,
  currentSessionId: null,
  currentCampaignId: null,
  deltaHistory: [],
  auditLog: [],
  addEntry: () => '',
  updateEntryText: () => {},
  updateSettings: () => {},
  resetSessionCost: () => {},
  clearDeltaLog: () => {},
  logResourceChange: () => {},
  getEntry: () => null,
}

function selectorWrapper<R>(selector?: Selector<ChronicleState, R>): ChronicleState | R {
  return selector ? selector(state) : state
}

;(selectorWrapper as any).getState = (): ChronicleState => state
;(selectorWrapper as any).setState = (partial: any) => {
  const next = typeof partial === 'function' ? partial(state) : partial
  Object.assign(state, next)
}

export const useChronicleStore = selectorWrapper as unknown as <R>(
  selector?: Selector<ChronicleState, R>,
) => R

