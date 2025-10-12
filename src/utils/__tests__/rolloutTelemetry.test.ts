import { describe, expect, it, vi, beforeEach } from 'vitest'

import type { ChronicleTelemetryEventLog } from '@/types/chronicle'
import {
  getRolloutTelemetryEventName,
  getRolloutTelemetryHistory,
  publishRolloutTelemetry,
  subscribeRolloutTelemetry,
  __resetRolloutTelemetryForTests,
} from '../rolloutTelemetry'

const baseEvent: ChronicleTelemetryEventLog = {
  id: 'event-1',
  recordedAt: new Date().toISOString(),
  stage: 'propose',
  outcome: 'success',
  model: 'gpt-5-test',
  latencyMs: 123,
  usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
  entryId: 'entry-1',
  action: 'proposed',
  timestamp: new Date().toISOString(),
}

beforeEach(() => {
  __resetRolloutTelemetryForTests()
})

describe('rolloutTelemetry utilities', () => {
  it('notifies subscribers when telemetry is published', () => {
    const handler = vi.fn()
    const unsubscribe = subscribeRolloutTelemetry(handler)

    publishRolloutTelemetry(baseEvent)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0]?.[0]).toMatchObject({
      id: baseEvent.id,
      stage: 'propose',
    })

    unsubscribe()
  })

  it('replays history to new subscribers when requested', () => {
    publishRolloutTelemetry({ ...baseEvent, id: 'event-2', entryId: 'entry-2' })
    publishRolloutTelemetry({ ...baseEvent, id: 'event-3', entryId: 'entry-3' })

    const handler = vi.fn()
    const unsubscribe = subscribeRolloutTelemetry(handler, {
      replay: true,
      replayLimit: 1,
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0]?.[0].id).toBe('event-3')

    unsubscribe()
  })

  it('exposes recent history and dispatches browser events', () => {
    const eventName = getRolloutTelemetryEventName()
    const received: ChronicleTelemetryEventLog[] = []
    window.addEventListener(eventName, (event) => {
      if (event instanceof CustomEvent) {
        received.push(event.detail)
      }
    })

    publishRolloutTelemetry({ ...baseEvent, id: 'event-window' })

    const history = getRolloutTelemetryHistory(5)

    expect(history[0]?.id).toBe('event-window')
    expect(received[0]?.id).toBe('event-window')
  })
})
