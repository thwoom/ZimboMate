import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

import { hasTauriBridge } from '@/utils/tauriRuntime'

export type EmbeddedModelKind = 'rules' | 'narration'

export type EmbeddedModelStatus =
  | { state: 'missing' }
  | { state: 'ready'; loadedAt: string }
  | { state: 'loading'; progress: number }
  | { state: 'error'; message: string }

export interface EmbeddedModelDescriptor {
  kind: EmbeddedModelKind
  modelId: string
  displayName: string
  description: string
  quantization: string
  parameterCount: number
  sizeBytes: number
  expectedPath: string
  status: EmbeddedModelStatus
  resumeBytes?: number
}

export interface EmbeddedModelManifestEntry {
  kind: EmbeddedModelKind
  modelId: string
  displayName: string
  filename: string
  quantization: string
  parameterCount: number
  description: string
  downloadUrl: string
  sha256: string
  sizeBytes: number
}

export interface EmbeddedRuntimeManifest {
  models: EmbeddedModelManifestEntry[]
}

export type EmbeddedRuntimeDownloadTelemetryOutcome = 'success' | 'cancelled' | 'error'

export interface EmbeddedRuntimeDownloadTelemetry {
  kind: EmbeddedModelKind
  resumedFromBytes?: number
  receivedBytes: number
  downloadedBytes: number
  durationMs: number
  verifyDurationMs?: number
  totalBytes?: number
  outcome: EmbeddedRuntimeDownloadTelemetryOutcome
  errorMessage?: string
}

export interface EmbeddedRunResponse {
  message: string
}

export type EmbeddedRuntimeDownloadEvent =
  | {
      type: 'started'
      kind: EmbeddedModelKind
      totalBytes?: number
      resumedFromBytes?: number
    }
  | {
      type: 'progress'
      kind: EmbeddedModelKind
      receivedBytes: number
      totalBytes?: number
      percent?: number
    }
  | { type: 'verifying'; kind: EmbeddedModelKind }
  | { type: 'complete'; kind: EmbeddedModelKind }
  | { type: 'error'; kind: EmbeddedModelKind; message: string }
  | { type: 'cancelled'; kind: EmbeddedModelKind }
  | { type: 'telemetry'; telemetry: EmbeddedRuntimeDownloadTelemetry }

const DOWNLOAD_EVENT_CHANNELS = {
  started: 'embedded_runtime::download_started',
  progress: 'embedded_runtime::download_progress',
  verifying: 'embedded_runtime::download_verifying',
  complete: 'embedded_runtime::download_complete',
  error: 'embedded_runtime::download_error',
  cancelled: 'embedded_runtime::download_cancelled',
  telemetry: 'embedded_runtime::download_telemetry',
} as const

interface DownloadStartedPayload {
  kind: EmbeddedModelKind
  total_bytes?: number | null
  resumed_from_bytes?: number | null
}

interface DownloadProgressPayload {
  kind: EmbeddedModelKind
  received_bytes: number
  total_bytes?: number | null
  percent?: number | null
}

interface DownloadErrorPayload {
  kind: EmbeddedModelKind
  message: string
}

interface DownloadCancelledPayload {
  kind: EmbeddedModelKind
}

interface DownloadTelemetryPayload {
  kind: EmbeddedModelKind
  resumed_from_bytes?: number | null
  received_bytes: number
  downloaded_bytes: number
  duration_ms: number
  verify_duration_ms?: number | null
  total_bytes?: number | null
  error_message?: string | null
  outcome: EmbeddedRuntimeDownloadTelemetryOutcome
}

export function isEmbeddedRuntimeAvailable(): boolean {
  return hasTauriBridge()
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error ?? 'Unknown embedded runtime error')
}

export async function listEmbeddedModels(): Promise<EmbeddedModelDescriptor[]> {
  if (!isEmbeddedRuntimeAvailable()) {
    return []
  }
  try {
    return await invoke<EmbeddedModelDescriptor[]>('embedded_runtime_list_models')
  } catch (error) {
    throw new Error(`[embedded-runtime] list models failed: ${toErrorMessage(error)}`)
  }
}

export async function getEmbeddedRuntimeManifest(): Promise<EmbeddedRuntimeManifest> {
  if (!isEmbeddedRuntimeAvailable()) {
    return { models: [] }
  }
  try {
    return await invoke<EmbeddedRuntimeManifest>('embedded_runtime_get_manifest')
  } catch (error) {
    throw new Error(`[embedded-runtime] manifest failed: ${toErrorMessage(error)}`)
  }
}

export async function ensureEmbeddedModel(kind: EmbeddedModelKind): Promise<void> {
  if (!isEmbeddedRuntimeAvailable()) {
    return
  }
  try {
    await invoke('embedded_runtime_ensure_model', { kind })
  } catch (error) {
    throw new Error(`[embedded-runtime] ensure ${kind} failed: ${toErrorMessage(error)}`)
  }
}

export async function downloadEmbeddedModel(kind: EmbeddedModelKind): Promise<void> {
  if (!isEmbeddedRuntimeAvailable()) {
    throw new Error('Embedded runtime is not available')
  }
  try {
    await invoke('embedded_runtime_download_model', { kind })
  } catch (error) {
    throw new Error(`[embedded-runtime] download ${kind} failed: ${toErrorMessage(error)}`)
  }
}

export async function cancelEmbeddedDownload(kind: EmbeddedModelKind): Promise<void> {
  if (!isEmbeddedRuntimeAvailable()) {
    return
  }
  try {
    await invoke('embedded_runtime_cancel_download', { kind })
  } catch (error) {
    throw new Error(`[embedded-runtime] cancel ${kind} failed: ${toErrorMessage(error)}`)
  }
}

export async function getEmbeddedModelsDir(): Promise<string | null> {
  if (!isEmbeddedRuntimeAvailable()) {
    return null
  }
  try {
    return await invoke<string>('embedded_runtime_models_dir')
  } catch (error) {
    throw new Error(`[embedded-runtime] models dir failed: ${toErrorMessage(error)}`)
  }
}

export async function loadEmbeddedModel(kind: EmbeddedModelKind): Promise<void> {
  if (!isEmbeddedRuntimeAvailable()) {
    return
  }
  try {
    await invoke('embedded_runtime_load_model', { kind })
  } catch (error) {
    throw new Error(`[embedded-runtime] load ${kind} failed: ${toErrorMessage(error)}`)
  }
}

export async function runEmbeddedTools(
  kind: EmbeddedModelKind,
  prompt: string,
): Promise<EmbeddedRunResponse> {
  if (!isEmbeddedRuntimeAvailable()) {
    throw new Error('Embedded runtime is not available')
  }
  try {
    return await invoke<EmbeddedRunResponse>('embedded_runtime_run_tools', { kind, prompt })
  } catch (error) {
    throw new Error(`[embedded-runtime] run tools failed: ${toErrorMessage(error)}`)
  }
}

export async function runEmbeddedNarration(
  kind: EmbeddedModelKind,
  prompt: string,
): Promise<EmbeddedRunResponse> {
  if (!isEmbeddedRuntimeAvailable()) {
    throw new Error('Embedded runtime is not available')
  }
  try {
    return await invoke<EmbeddedRunResponse>('embedded_runtime_run_narration', {
      kind,
      prompt,
    })
  } catch (error) {
    throw new Error(`[embedded-runtime] run narration failed: ${toErrorMessage(error)}`)
  }
}

export async function openEmbeddedModelsDir(): Promise<void> {
  const dir = await getEmbeddedModelsDir()
  if (!dir) {
    return
  }
  const shell = (window as typeof window & {
    electron?: { shellOpenPath?: (path: string) => Promise<void> }
  }).electron
  await shell?.shellOpenPath?.(dir)
}

export async function listenEmbeddedRuntimeDownloads(
  handler: (event: EmbeddedRuntimeDownloadEvent) => void,
): Promise<UnlistenFn> {
  if (!isEmbeddedRuntimeAvailable()) {
    return () => {}
  }

  const unlisteners = await Promise.all([
    listen<DownloadStartedPayload>(DOWNLOAD_EVENT_CHANNELS.started, ({ payload }) => {
      handler({
        type: 'started',
        kind: payload.kind,
        totalBytes: payload.total_bytes ?? undefined,
        resumedFromBytes: payload.resumed_from_bytes ?? undefined,
      })
    }),
    listen<DownloadProgressPayload>(DOWNLOAD_EVENT_CHANNELS.progress, ({ payload }) => {
      handler({
        type: 'progress',
        kind: payload.kind,
        receivedBytes: payload.received_bytes ?? 0,
        totalBytes: payload.total_bytes ?? undefined,
        percent: payload.percent ?? undefined,
      })
    }),
    listen<DownloadStartedPayload>(DOWNLOAD_EVENT_CHANNELS.verifying, ({ payload }) => {
      handler({ type: 'verifying', kind: payload.kind })
    }),
    listen<DownloadStartedPayload>(DOWNLOAD_EVENT_CHANNELS.complete, ({ payload }) => {
      handler({ type: 'complete', kind: payload.kind })
    }),
    listen<DownloadErrorPayload>(DOWNLOAD_EVENT_CHANNELS.error, ({ payload }) => {
      handler({ type: 'error', kind: payload.kind, message: payload.message })
    }),
    listen<DownloadCancelledPayload>(DOWNLOAD_EVENT_CHANNELS.cancelled, ({ payload }) => {
      handler({ type: 'cancelled', kind: payload.kind })
    }),
    listen<DownloadTelemetryPayload>(DOWNLOAD_EVENT_CHANNELS.telemetry, ({ payload }) => {
      handler({
        type: 'telemetry',
        telemetry: {
          kind: payload.kind,
          resumedFromBytes: payload.resumed_from_bytes ?? undefined,
          receivedBytes: payload.received_bytes,
          downloadedBytes: payload.downloaded_bytes,
          durationMs: payload.duration_ms,
          verifyDurationMs: payload.verify_duration_ms ?? undefined,
          totalBytes: payload.total_bytes ?? undefined,
          outcome: payload.outcome,
          errorMessage: payload.error_message ?? undefined,
        },
      })
    }),
  ])

  return () => {
    for (const unlisten of unlisteners) {
      void unlisten()
    }
  }
}
