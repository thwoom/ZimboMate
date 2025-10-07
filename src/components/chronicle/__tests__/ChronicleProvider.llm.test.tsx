import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import { ChronicleProvider, useChronicleLLM } from '../ChronicleProvider'
import { useChronicleStore } from '@/stores/chronicleStore'

const getMockControls = () => (globalThis as any).__LLM_MOCK__

describe('chronicle provider GPT-5 integration', () => {
  let originalTauri: unknown

  beforeEach(() => {
    originalTauri = (globalThis as any).__TAURI__
    ;(globalThis as any).__TAURI__ = { invoke: vi.fn() }
    ;(globalThis as any).__TAURI_IPC__ = {}
    useChronicleStore.setState({
      auditLog: [],
      deltaHistory: [],
      pendingDeltaBundle: null,
    })
  })

  afterEach(() => {
    if (originalTauri === undefined) {
      delete (globalThis as any).__TAURI__
    } else {
      ;(globalThis as any).__TAURI__ = originalTauri
    }
    delete (globalThis as any).__TAURI_IPC__
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChronicleProvider>{children}</ChronicleProvider>
  )

  it('routes proposeEntryDeltas through the GPT-5 mock client', async () => {
    const controls = getMockControls()
    expect(controls).toBeDefined()

    const { result } = renderHook(() => useChronicleLLM(), { wrapper })

    controls.setNextProposeResult((request: any) => ({
      bundle: {
        entryId: `${request.entryId}-custom`,
        narrative: 'Custom narrative',
        ops: [{ type: 'mark_xp', characterId: 'hero', amount: 1 }],
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        reasoning: 'Test override',
        idempotencyKey: request.idempotencyKey ?? 'custom-key',
        model: 'gpt-5-mock-test',
        createdAt: '2025-10-03T12:00:00.000Z',
      },
      warnings: ['mock-warning'],
    }))

    let response:
      | Awaited<ReturnType<typeof result.current.proposeEntryDeltas>>
      | undefined

    await act(async () => {
      response = await result.current.proposeEntryDeltas({
        entryId: 'entry-123',
        rawText: 'I scout ahead',
      })
    })

    expect(controls.getProposeCalls()).toHaveLength(1)
    expect(controls.getProposeCalls()[0].entryId).toBe('entry-123')
    expect(response?.bundle.entryId).toBe('entry-123-custom')
    expect(response?.warnings).toEqual(['mock-warning'])
    expect(result.current.isProposing).toBe(false)
  })

  it('updates progress and telemetry when the mock emits events', async () => {
    const controls = getMockControls()
    const { result } = renderHook(() => useChronicleLLM(), { wrapper })

    await waitFor(() => {
      expect(result.current.lastProgressEvent).toBeDefined()
    })

    act(() => {
      controls.emitProgress({
        stage: 'applying_bundle',
        progress: 42,
        message: 'Mid-application',
      })
    })

    expect(result.current.lastProgressEvent?.stage).toBe('applying_bundle')
    expect(result.current.lastProgressEvent?.progress).toBe(42)

    act(() => {
      controls.emitTelemetry({
        model: 'gpt-5-mock',
        latencyMs: 123,
        usage: { inputTokens: 5, outputTokens: 10, totalTokens: 15 },
      })
    })

    expect(result.current.lastTelemetryEvent?.latencyMs).toBe(123)
    expect(result.current.lastTelemetryEvent?.usage?.totalTokens).toBe(15)
  })
})


