import type {
  BootDiagnostic,
  BootDiagnosticLevel,
  BootSnapshot,
  BootStageDefinition,
  BootStageId,
  BootStageSnapshot,
} from './types'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))
const randomId = () => Math.random().toString(36).slice(2, 10)

export class BootOrchestrator {
  private readonly stageDefinitions: BootStageDefinition[]
  private readonly stages = new Map<BootStageId, BootStageSnapshot>()
  private readonly listeners = new Set<(snapshot: BootSnapshot) => void>()
  private diagnostics: BootDiagnostic[] = []
  private safeMode = false

  constructor(stageDefinitions: BootStageDefinition[]) {
    this.stageDefinitions = [...stageDefinitions]
    const now = Date.now()
    for (const def of this.stageDefinitions) {
      this.stages.set(def.id, {
        ...def,
        status: 'pending',
        progress: 0,
        message: def.description,
        lastUpdatedAt: now,
      })
    }
  }

  snapshot(): BootSnapshot {
    return this.buildSnapshot()
  }

  subscribe(listener: (snapshot: BootSnapshot) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  beginStage(id: BootStageId, message?: string) {
    this.updateStage(id, {
      status: 'active',
      progress: Math.max(5, this.stages.get(id)?.progress ?? 0),
      startedAt: Date.now(),
      completedAt: undefined,
      message: message ?? this.stages.get(id)?.message,
    })
  }

  setStageProgress(id: BootStageId, progress: number, message?: string) {
    const stage = this.stages.get(id)
    if (!stage) return
    const status = stage.status === 'pending' ? 'active' : stage.status
    this.updateStage(id, {
      status,
      progress: clamp(progress),
      message: message ?? stage.message,
    })
  }

  completeStage(id: BootStageId, message?: string) {
    this.updateStage(id, {
      status: 'success',
      progress: 100,
      completedAt: Date.now(),
      message: message ?? this.stages.get(id)?.message,
    })
  }

  warnStage(id: BootStageId, message: string) {
    this.addDiagnostic('warning', id, message)
    this.updateStage(id, {
      status: 'warning',
      progress: Math.max(60, this.stages.get(id)?.progress ?? 0),
      completedAt: Date.now(),
      message,
    })
  }

  failStage(id: BootStageId, message: string) {
    this.addDiagnostic('error', id, message)
    this.updateStage(id, {
      status: 'failed',
      progress: 100,
      completedAt: Date.now(),
      message,
    })
  }

  skipStage(id: BootStageId, message?: string) {
    this.updateStage(id, {
      status: 'skipped',
      progress: 100,
      completedAt: Date.now(),
      message: message ?? this.stages.get(id)?.message,
    })
  }

  setSafeMode(enabled: boolean, reason?: string) {
    if (this.safeMode === enabled) return
    this.safeMode = enabled
    if (reason) {
      this.addDiagnostic('warning', undefined, reason)
    }
    this.emit()
  }

  addDiagnostic(level: BootDiagnosticLevel, stageId: BootStageId | undefined, message: string) {
    this.diagnostics = [
      ...this.diagnostics,
      {
        id: randomId(),
        level,
        stageId,
        message,
        timestamp: Date.now(),
      },
    ].slice(-8)
    this.emit()
  }

  private updateStage(id: BootStageId, updates: Partial<BootStageSnapshot>) {
    const current = this.stages.get(id)
    if (!current) return
    this.stages.set(id, {
      ...current,
      ...updates,
      lastUpdatedAt: Date.now(),
    })
    this.emit()
  }

  private buildSnapshot(): BootSnapshot {
    const ordered = this.stageDefinitions.map((def) => this.stages.get(def.id)!)
    const percent = ordered.reduce((acc, stage) => acc + (stage.weight * (stage.progress ?? 0)) / 100, 0)
    const normalized = clamp(Math.round(percent))
    const ready = ordered.every((stage) =>
      stage.optional
        ? stage.status === 'success' || stage.status === 'warning' || stage.status === 'skipped'
        : stage.status === 'success',
    )
    const hasFailure = ordered.some((stage) => stage.status === 'failed')
    const hasWarning = ordered.some((stage) => stage.status === 'warning')
    const status: BootSnapshot['status'] = ready ? 'ready' : hasFailure ? 'failed' : hasWarning ? 'warning' : 'booting'
    const activeStage = ordered.find((stage) => stage.status === 'active') ?? ordered.find((stage) => stage.status === 'pending')

    return {
      stages: ordered,
      percent: normalized,
      ready,
      status,
      activeStageId: activeStage?.id ?? null,
      safeModeEnabled: this.safeMode,
      diagnostics: this.diagnostics.slice(-5),
    }
  }

  private emit() {
    const snapshot = this.buildSnapshot()
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot)
      } catch (error) {
        console.error('[boot] snapshot listener failed', error)
      }
    })
  }
}
