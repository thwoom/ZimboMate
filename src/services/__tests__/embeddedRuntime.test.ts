import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

const eventModule = vi.hoisted(() => ({
  listen: vi.fn(),
}))
vi.mock('@tauri-apps/api/event', () => eventModule)
const listenMock = eventModule.listen as ReturnType<typeof vi.fn>

const bridgeModule = vi.hoisted(() => ({
  hasTauriBridge: vi.fn(() => true),
}))
vi.mock('@/utils/tauriRuntime', () => bridgeModule)
const hasTauriBridgeMock = bridgeModule.hasTauriBridge as ReturnType<typeof vi.fn>

import {
  listenEmbeddedRuntimeDownloads,
  type EmbeddedRuntimeDownloadEvent,
} from '@/services/embeddedRuntime'

describe('listenEmbeddedRuntimeDownloads', () => {
  beforeEach(() => {
    listenMock.mockReset()
    hasTauriBridgeMock.mockReturnValue(true)
  })

  it('returns a no-op unlisten when the bridge is unavailable', async () => {
    hasTauriBridgeMock.mockReturnValue(false)
    const unlisten = await listenEmbeddedRuntimeDownloads(() => {})
    expect(typeof unlisten).toBe('function')
    unlisten()
    expect(listenMock).not.toHaveBeenCalled()
  })

  it('normalizes download event payloads from Tauri', async () => {
    const callbacks: Record<string, (event: { payload: unknown }) => void> = {}
    listenMock.mockImplementation((eventName: string, handler: (event: any) => void) => {
      callbacks[eventName] = handler
      return Promise.resolve(() => {})
    })

    const events: EmbeddedRuntimeDownloadEvent[] = []
    const unsubscribe = await listenEmbeddedRuntimeDownloads((event) => {
      events.push(event)
    })

    callbacks['embedded_runtime::download_started']?.({
      payload: { kind: 'rules', total_bytes: 4_000, resumed_from_bytes: 1_000 },
    })
    callbacks['embedded_runtime::download_progress']?.({
      payload: {
        kind: 'rules',
        received_bytes: 2_000,
        total_bytes: 4_000,
        percent: 0.5,
      },
    })
    callbacks['embedded_runtime::download_verifying']?.({
      payload: { kind: 'rules' },
    })
    callbacks['embedded_runtime::download_complete']?.({
      payload: { kind: 'rules' },
    })
    callbacks['embedded_runtime::download_error']?.({
      payload: { kind: 'rules', message: 'checksum mismatch' },
    })
    callbacks['embedded_runtime::download_telemetry']?.({
      payload: {
        kind: 'rules',
        resumed_from_bytes: 1_000,
        received_bytes: 4_000,
        downloaded_bytes: 3_000,
        duration_ms: 5400,
        verify_duration_ms: 120,
        total_bytes: 8_000,
        error_message: null,
        outcome: 'success',
      },
    })

    unsubscribe()

    expect(events).toEqual([
      {
        type: 'started',
        kind: 'rules',
        totalBytes: 4_000,
        resumedFromBytes: 1_000,
      },
      {
        type: 'progress',
        kind: 'rules',
        receivedBytes: 2_000,
        totalBytes: 4_000,
        percent: 0.5,
      },
      { type: 'verifying', kind: 'rules' },
      { type: 'complete', kind: 'rules' },
      { type: 'error', kind: 'rules', message: 'checksum mismatch' },
      {
        type: 'telemetry',
        telemetry: {
          kind: 'rules',
          resumedFromBytes: 1_000,
          receivedBytes: 4_000,
          downloadedBytes: 3_000,
          durationMs: 5400,
          verifyDurationMs: 120,
          totalBytes: 8_000,
          outcome: 'success',
          errorMessage: undefined,
        },
      },
    ])
  })
})
