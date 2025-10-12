import type { ChronicleTelemetryEventLog } from '@/types/chronicle'

type TelemetrySubscriber = (event: ChronicleTelemetryEventLog) => void

interface SubscribeOptions {
  /**
   * When true, immediately replay the most recent telemetry events to the
   * subscriber (up to `replayLimit`). Defaults to `false`.
   */
  replay?: boolean
  /**
   * Maximum number of historical events to replay when `replay` is enabled.
   * Defaults to 10.
   */
  replayLimit?: number
}

const HISTORY_LIMIT = 200
const WINDOW_EVENT = 'chronicle-telemetry'

const subscribers = new Set<TelemetrySubscriber>()
const history: ChronicleTelemetryEventLog[] = []

function cloneEvent(
  event: ChronicleTelemetryEventLog,
): ChronicleTelemetryEventLog {
  return JSON.parse(JSON.stringify(event)) as ChronicleTelemetryEventLog
}

function dispatchToWindow(event: ChronicleTelemetryEventLog) {
  if (typeof window === 'undefined') return

  const customEvent = new CustomEvent<ChronicleTelemetryEventLog>(
    WINDOW_EVENT,
    {
      detail: event,
    },
  )
  window.dispatchEvent(customEvent)
}

export function publishRolloutTelemetry(
  event: ChronicleTelemetryEventLog,
): void {
  const snapshot = cloneEvent(event)

  history.unshift(snapshot)
  if (history.length > HISTORY_LIMIT) {
    history.length = HISTORY_LIMIT
  }

  subscribers.forEach((subscriber) => {
    try {
      subscriber(snapshot)
    } catch (error) {
      // We intentionally swallow subscriber errors so a misbehaving dashboard
      // cannot break telemetry ingestion.
      console.error('[rolloutTelemetry] subscriber failed', error)
    }
  })

  dispatchToWindow(snapshot)
}

export function subscribeRolloutTelemetry(
  subscriber: TelemetrySubscriber,
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
        subscriber(event)
      } catch (error) {
        console.error('[rolloutTelemetry] replay subscriber failed', error)
      }
    })
  }

  return () => {
    subscribers.delete(subscriber)
  }
}

export function getRolloutTelemetryHistory(
  limit = HISTORY_LIMIT,
): ChronicleTelemetryEventLog[] {
  if (limit <= 0) return []
  return history.slice(0, Math.min(limit, HISTORY_LIMIT))
}

export function getRolloutTelemetryEventName(): string {
  return WINDOW_EVENT
}

export function __resetRolloutTelemetryForTests(): void {
  history.length = 0
  subscribers.clear()
}
