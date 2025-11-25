import { logger } from '@/utils/logger'
import type { EmbeddedRuntimeDownloadTelemetry } from '@/services/embeddedRuntime'

export interface EmbeddedDownloadTelemetryEvent
  extends EmbeddedRuntimeDownloadTelemetry {
  id: string
  recordedAt: number
  modelLabel?: string
}

type EmbeddedTelemetrySubscriber = (event: EmbeddedDownloadTelemetryEvent) => void

interface SubscribeOptions {
  replay?: boolean
  replayLimit?: number
}

const HISTORY_LIMIT = 32
const WINDOW_EVENT = 'embedded-runtime-download-telemetry'

const subscribers = new Set<EmbeddedTelemetrySubscriber>()
const history: EmbeddedDownloadTelemetryEvent[] = []

function cloneEvent(event: EmbeddedDownloadTelemetryEvent): EmbeddedDownloadTelemetryEvent {
  return JSON.parse(JSON.stringify(event)) as EmbeddedDownloadTelemetryEvent
}

function dispatchToWindow(event: EmbeddedDownloadTelemetryEvent) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<EmbeddedDownloadTelemetryEvent>(WINDOW_EVENT, { detail: event }),
  )
}

export function publishEmbeddedDownloadTelemetry(
  event: EmbeddedRuntimeDownloadTelemetry,
  modelLabel?: string,
): EmbeddedDownloadTelemetryEvent {
  const recordedAt = Date.now()
  const enriched: EmbeddedDownloadTelemetryEvent = {
    ...event,
    id: `embedded-telemetry-${event.kind}-${recordedAt}-${Math.random().toString(36).slice(2, 8)}`,
    recordedAt,
    modelLabel,
  }

  history.unshift(enriched)
  if (history.length > HISTORY_LIMIT) {
    history.length = HISTORY_LIMIT
  }

  logger.info('analytics.embedded_download', enriched)

  subscribers.forEach((subscriber) => {
    try {
      subscriber(cloneEvent(enriched))
    } catch (error) {
      logger.error('[embeddedRuntimeTelemetry] subscriber failed', error)
    }
  })

  dispatchToWindow(enriched)

  return enriched
}

export function subscribeEmbeddedDownloadTelemetry(
  subscriber: EmbeddedTelemetrySubscriber,
  options?: SubscribeOptions,
): () => void {
  subscribers.add(subscriber)

  if (options?.replay) {
    const limit =
      typeof options.replayLimit === 'number' && options.replayLimit > 0
        ? Math.min(options.replayLimit, HISTORY_LIMIT)
        : 10
    history.slice(0, limit).reverse().forEach((event) => {
      try {
        subscriber(cloneEvent(event))
      } catch (error) {
        logger.error('[embeddedRuntimeTelemetry] replay subscriber failed', error)
      }
    })
  }

  return () => {
    subscribers.delete(subscriber)
  }
}

export function getEmbeddedDownloadTelemetryHistory(
  limit = HISTORY_LIMIT,
): EmbeddedDownloadTelemetryEvent[] {
  if (limit <= 0) return []
  return history.slice(0, Math.min(limit, HISTORY_LIMIT)).map((event) => cloneEvent(event))
}

export function getEmbeddedDownloadTelemetryEventName(): string {
  return WINDOW_EVENT
}

export function __resetEmbeddedDownloadTelemetryForTests(): void {
  history.length = 0
  subscribers.clear()
}
