import type { BootSnapshot, BootStageId } from './types'
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BootOrchestrator } from './bootOrchestrator'
import { createBootTaskController } from './bootTasks'
import { LoadingGate } from './LoadingGate'
import { BOOT_STAGE_DEFINITIONS } from './stages'

interface BootContextValue {
  snapshot: BootSnapshot
  dismissed: boolean
  dismiss: () => void
  retryStage: (id: BootStageId | null) => Promise<void>
  toggleSafeMode: (enabled: boolean) => void
}

const BootContext = createContext<BootContextValue | null>(null)

export const BootProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const orchestratorRef = useRef<BootOrchestrator | null>(null)
  if (!orchestratorRef.current) {
    orchestratorRef.current = new BootOrchestrator(BOOT_STAGE_DEFINITIONS)
  }
  const orchestrator = orchestratorRef.current
  const [snapshot, setSnapshot] = useState<BootSnapshot>(() => orchestrator.snapshot())
  const [dismissed, setDismissed] = useState(false)
  const readyAtRef = useRef<number | null>(null)
  const READY_HOLD_MS = 2200

  useEffect(() => orchestrator.subscribe((next) => setSnapshot(next)), [orchestrator])

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return undefined
    }
    const fallback = document.getElementById('boot-fallback')
    if (!fallback) return undefined
    fallback.classList.add('boot-fallback--fade')
    const timeout = window.setTimeout(() => fallback.remove(), 480)
    return () => window.clearTimeout(timeout)
  }, [])

  const taskController = useMemo(() => createBootTaskController(orchestrator), [orchestrator])

  useEffect(() => {
    taskController.startAll()
  }, [taskController])

  useEffect(() => {
    if (typeof window === 'undefined' || snapshot.percent > 0) return undefined
    const retryTimer = window.setTimeout(() => {
      if (orchestrator.snapshot().percent <= 0) {
        taskController.startAll()
      }
    }, 1200)
    return () => window.clearTimeout(retryTimer)
  }, [snapshot.percent, orchestrator, taskController])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (!(import.meta as ImportMeta).env?.DEV) return undefined
    ;(window as typeof window & { __zimboBoot?: unknown }).__zimboBoot = {
      orchestrator,
      restart: () => taskController.startAll(),
      snapshot: () => orchestrator.snapshot(),
    }
    return () => {
      if ((window as typeof window & { __zimboBoot?: unknown }).__zimboBoot) {
        delete (window as typeof window & { __zimboBoot?: unknown }).__zimboBoot
      }
    }
  }, [orchestrator, taskController])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (!snapshot.ready) return undefined
    if (readyAtRef.current === null) {
      readyAtRef.current = performance.now()
    }
    const elapsed = performance.now() - readyAtRef.current
    const delay = Math.max(READY_HOLD_MS - elapsed, 0)
    const timeout = window.setTimeout(() => setDismissed(true), delay)
    return () => window.clearTimeout(timeout)
  }, [snapshot.ready])

  useEffect(() => {
    if (!snapshot.ready) return undefined
    if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
      return undefined
    }
    performance.mark('zimbo-boot-ready')
    return undefined
  }, [snapshot.ready])

  const retryStage = useCallback(
    (id: BootStageId | null) => taskController.retryStage(id),
    [taskController],
  )

  const toggleSafeMode = useCallback(
    (enabled: boolean) => orchestrator.setSafeMode(enabled, enabled ? 'Safe mode enabled manually' : undefined),
    [orchestrator],
  )

  const value = useMemo<BootContextValue>(
    () => ({
      snapshot,
      dismissed,
      dismiss: () => setDismissed(true),
      retryStage,
      toggleSafeMode,
    }),
    [snapshot, dismissed, retryStage, toggleSafeMode],
  )

  return (
    <BootContext value={value}>
      {children}
      <LoadingGate />
    </BootContext>
  )
}

export function useBoot() {
  const context = use(BootContext)
  if (!context) {
    throw new Error('useBoot must be used within BootProvider')
  }
  return context
}

export function useOptionalBoot() {
  return use(BootContext)
}
