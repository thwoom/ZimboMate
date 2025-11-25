import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  __resetEmbeddedDownloadTelemetryForTests,
  getEmbeddedDownloadTelemetryHistory,
  publishEmbeddedDownloadTelemetry,
  subscribeEmbeddedDownloadTelemetry,
} from '@/utils/embeddedRuntimeTelemetry'

const sampleEvent = {
  kind: 'rules' as const,
  resumedFromBytes: 1024,
  receivedBytes: 4096,
  downloadedBytes: 3072,
  durationMs: 1234,
  verifyDurationMs: 100,
  totalBytes: 8192,
  outcome: 'success' as const,
  errorMessage: undefined,
}

describe('embeddedRuntimeTelemetry', () => {
  afterEach(() => {
    __resetEmbeddedDownloadTelemetryForTests()
  })

  it('stores telemetry in history and notifies subscribers', () => {
    const subscriber = vi.fn()
    const unsubscribe = subscribeEmbeddedDownloadTelemetry(subscriber, { replay: true, replayLimit: 1 })

    expect(getEmbeddedDownloadTelemetryHistory()).toEqual([])
    const published = publishEmbeddedDownloadTelemetry(sampleEvent, 'Qwen Tools')

    expect(published.modelLabel).toBe('Qwen Tools')
    expect(getEmbeddedDownloadTelemetryHistory(1)[0].id).toBe(published.id)
    expect(subscriber).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('replays history when requested', () => {
    publishEmbeddedDownloadTelemetry(sampleEvent, 'Qwen Tools')
    const subscriber = vi.fn()

    const unsubscribe = subscribeEmbeddedDownloadTelemetry(subscriber, { replay: true, replayLimit: 5 })
    expect(subscriber).toHaveBeenCalledTimes(1)

    unsubscribe()
  })
})
