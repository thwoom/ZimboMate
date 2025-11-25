import type { LucideIcon } from 'lucide-react'

export type BootStageId =
  | 'themeTokens'
  | 'fontFace'
  | 'storeHydration'
  | 'characterData'
  | 'routePrefetch'
  | 'fxReady'
  | 'finalize'

export type BootStageStatus =
  | 'pending'
  | 'active'
  | 'success'
  | 'warning'
  | 'failed'
  | 'skipped'

export interface BootStageDefinition {
  id: BootStageId
  label: string
  description: string
  weight: number
  optional?: boolean
  icon?: LucideIcon
}

export interface BootStageSnapshot extends BootStageDefinition {
  status: BootStageStatus
  progress: number
  message?: string
  startedAt?: number
  completedAt?: number
  lastUpdatedAt: number
}

export type BootDiagnosticLevel = 'info' | 'warning' | 'error'

export interface BootDiagnostic {
  id: string
  stageId?: BootStageId
  level: BootDiagnosticLevel
  message: string
  timestamp: number
}

export interface BootSnapshot {
  stages: BootStageSnapshot[]
  percent: number
  ready: boolean
  status: 'booting' | 'warning' | 'failed' | 'ready'
  activeStageId: BootStageId | null
  safeModeEnabled: boolean
  diagnostics: BootDiagnostic[]
}
