import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import type { ChronicleTelemetryEventLog } from '@/types/chronicle'

const listeners: Array<(event: ChronicleTelemetryEventLog) => void> = []
const history: ChronicleTelemetryEventLog[] = [
  {
    id: 'event-1',
    recordedAt: new Date('2025-10-12T19:00:00Z').toISOString(),
    stage: 'propose',
    outcome: 'success',
    model: 'gpt-5-mock',
    latencyMs: 180,
    costCents: 25,
    usage: { inputTokens: 100, outputTokens: 90, totalTokens: 190 },
    bundleId: 'bundle-1',
    entryId: 'entry-1',
    source: 'tauri',
  },
]

vi.mock('@/utils/rolloutTelemetry', () => ({
  getRolloutTelemetryHistory: vi.fn(() => history),
  subscribeRolloutTelemetry: vi.fn(
    (handler: (event: ChronicleTelemetryEventLog) => void) => {
      listeners.push(handler)
      return () => {
        const index = listeners.indexOf(handler)
        if (index >= 0) {
          listeners.splice(index, 1)
        }
      }
    },
  ),
}))

vi.mock('@/components/chronicle/highlightUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/chronicle/highlightUtils')>()
  return {
    ...actual,
    formatRelativeTimeFromNow: () => 'just now',
  }
})

describe('RolloutDashboardPanel', () => {
  beforeEach(() => {
    listeners.splice(0, listeners.length)
  })

  it('renders summary metrics from initial telemetry history', async () => {
    const { RolloutDashboardPanel } = await import('../RolloutDashboardPanel')
    render(<RolloutDashboardPanel />)

    expect(screen.getByText('Chronicle Rollout Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Average Latency')).toBeInTheDocument()
    expect(screen.getAllByText('180 ms')[0]).toBeInTheDocument()
    expect(screen.getByText(/Recorded Spend/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Propose/)).not.toHaveLength(0)
    expect(screen.getByText(/entry-1/i)).toBeInTheDocument()
  })

  it('updates the feed when new telemetry arrives', async () => {
    const { RolloutDashboardPanel } = await import('../RolloutDashboardPanel')
    render(<RolloutDashboardPanel />)

    const newEvent: ChronicleTelemetryEventLog = {
      id: 'event-2',
      recordedAt: new Date('2025-10-12T19:05:00Z').toISOString(),
      stage: 'guardrail',
      outcome: 'skipped',
      model: 'gpt-5-mock',
      latencyMs: 42,
      costCents: 0,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      entryId: 'entry-guardrail',
      source: 'client',
    }

    act(() => {
      listeners.forEach((listener) => listener(newEvent))
    })

    expect(screen.getByText(/entry-guardrail/i)).toBeInTheDocument()
    expect(screen.getAllByText(/guardrail/i).length).toBeGreaterThan(0)
    expect(
      screen.getByText(
        (_content, element) => element?.textContent === 'Cost $0.00',
      ),
    ).toBeInTheDocument()
  })
})
