import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import * as chronicleService from '@/services/chronicle'
import { useChronicleStore } from '@/stores/chronicleStore'
import { ChronicleProvider, useChronicleLLM } from '../ChronicleProvider'

const getMockControls = () => (globalThis as any).__LLM_MOCK__
const PRICING_KEY = '__LLM_PRICING__'

describe('chronicle provider GPT-5 integration', () => {
  let originalTauri: unknown
  let originalPricing: unknown

  beforeEach(() => {
    originalTauri = (globalThis as any).__TAURI__
    originalPricing = (globalThis as any)[PRICING_KEY]
    ;(globalThis as any)[PRICING_KEY] = {
      'gpt-5-mock': { inputPer1KUsd: 0.5, outputPer1KUsd: 0.5 },
      'gpt-5-chat-latest': { inputPer1KUsd: 0.5, outputPer1KUsd: 0.5 },
    }
    ;(globalThis as any).__TAURI__ = { invoke: vi.fn() }
    ;(globalThis as any).__TAURI_IPC__ = {}
    useChronicleStore.setState({
      auditLog: [],
      deltaHistory: [],
      pendingDeltaBundle: null,
      telemetryEvents: [],
      sessionCostCents: 0,
      lastCostEventAt: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalTauri === undefined) {
      delete (globalThis as any).__TAURI__
    } else {
      ;(globalThis as any).__TAURI__ = originalTauri
    }
    delete (globalThis as any).__TAURI_IPC__
    if (originalPricing === undefined) {
      delete (globalThis as any)[PRICING_KEY]
    } else {
      ;(globalThis as any)[PRICING_KEY] = originalPricing
    }
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
        stage: 'propose',
        outcome: 'success',
        entryId: 'entry-telemetry',
      })
    })

    expect(result.current.lastTelemetryEvent?.latencyMs).toBe(123)
    expect(result.current.lastTelemetryEvent?.usage?.totalTokens).toBe(15)
    expect(result.current.lastTelemetryEvent?.stage).toBe('propose')
    expect(result.current.lastTelemetryEvent?.outcome).toBe('success')
    expect(result.current.lastTelemetryEvent?.costCents).toBe(1)

    const storeState = useChronicleStore.getState()
    expect(storeState.telemetryEvents).toHaveLength(1)
    expect(storeState.telemetryEvents[0]).toMatchObject({
      stage: 'propose',
      outcome: 'success',
      source: 'tauri',
      entryId: 'entry-telemetry',
      costCents: 1,
    })
    expect(storeState.sessionCostCents).toBe(1)
  })

  it('emits guardrail telemetry when the session cost cap is reached', async () => {
    const { result } = renderHook(() => useChronicleLLM(), { wrapper })

    act(() => {
      useChronicleStore.setState((state) => ({
        ...state,
        settings: { ...state.settings, costCapCents: 1 },
        sessionCostCents: 1,
      }))
    })

    let guardrailResponse:
      | Awaited<ReturnType<typeof result.current.proposeEntryDeltas>>
      | undefined

    await act(async () => {
      guardrailResponse = await result.current.proposeEntryDeltas({
        entryId: 'entry-guardrail',
        rawText: 'Budget exhausted, queue fallback.',
      })
    })

    expect(guardrailResponse?.bundle.ops).toHaveLength(0)
    expect(guardrailResponse?.warnings).toContain(
      'Session cost guardrail reached. GPT-5 call skipped; template narrative returned.',
    )

    const telemetry = useChronicleStore.getState().telemetryEvents
    expect(telemetry).not.toHaveLength(0)
    expect(telemetry[0]).toMatchObject({
      stage: 'guardrail',
      outcome: 'skipped',
      entryId: 'entry-guardrail',
      source: 'client',
    })
    expect(typeof telemetry[0].bundleId).toBe('string')
    expect(useChronicleStore.getState().sessionCostCents).toBe(1)
  })

  it('tracks pending bundle lifecycle and audit log when applying', async () => {
    const controls = getMockControls()
    const { result } = renderHook(() => useChronicleLLM(), { wrapper })

    const payload = {
      bundle: {
        entryId: 'entry-apply',
        narrative: 'Narrative',
        ops: [{ type: 'mark_xp', characterId: 'hero', amount: 1 }],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        reasoning: 'Test',
        idempotencyKey: 'idempotency-1',
        model: 'gpt-5-test',
        createdAt: '2025-10-07T12:00:00.000Z',
      },
      autoApply: false,
    }

    let resolveApply: ((value: any) => void) | undefined
    const deferredApply = new Promise((resolve) => {
      resolveApply = resolve
    })

    controls.setNextApplyResult(() => deferredApply)

    let applyResultPromise: Promise<unknown> | undefined
    act(() => {
      applyResultPromise = result.current.applyDeltaBundle(payload as any)
    })

    expect(useChronicleStore.getState().pendingDeltaBundle).toMatchObject({
      entryId: 'entry-apply',
      autoApply: false,
      actor: 'manual',
      status: 'applying',
      bundleId: 'idempotency-1',
    })

    expect(useChronicleStore.getState().deltaHistory[0]).toMatchObject({
      bundleId: 'idempotency-1',
      status: 'pending',
    })

    resolveApply?.({
      bundleId: 'bundle-applied',
      appliedOps: payload.bundle.ops,
      skippedOps: [],
      undoHandle: {
        bundleId: 'bundle-applied',
        issuedAt: '2025-10-07T12:00:01.000Z',
      },
    })

    expect(applyResultPromise).toBeDefined()

    await act(async () => {
      await applyResultPromise!
    })

    const store = useChronicleStore.getState()
    const expectedBundleId =
      payload.bundle.idempotencyKey ?? payload.bundle.entryId

    expect(store.pendingDeltaBundle).toBeNull()
    expect(store.deltaHistory[0]).toMatchObject({
      bundleId: expectedBundleId,
      entryId: 'entry-apply',
      actor: 'manual',
      status: 'applied',
      error: undefined,
    })
    expect(typeof store.deltaHistory[0].durationMs).toBe('number')
    expect(store.deltaHistory[0].undoHandle?.bundleId).toBe(expectedBundleId)

    expect(store.auditLog[0]).toMatchObject({
      bundleId: expectedBundleId,
      entryId: 'entry-apply',
      action: 'applied',
      actor: 'manual',
    })
  })

  it('records bundle failure when executor rejects apply', async () => {
    const applySpy = vi
      .spyOn(chronicleService, 'applyChronicleDeltaBundle')
      .mockRejectedValue(new Error('executor failure'))

    const { result } = renderHook(() => useChronicleLLM(), { wrapper })

    const payload = {
      bundle: {
        entryId: 'entry-failure',
        narrative: 'Narrative',
        ops: [{ type: 'mark_xp', characterId: 'hero', amount: 1 }],
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        reasoning: 'Test',
        idempotencyKey: 'idempotency-failure',
        model: 'gpt-5-test',
        createdAt: '2025-10-07T13:00:00.000Z',
      },
      autoApply: false,
    }

    let thrown: unknown
    await act(async () => {
      await result.current
        .applyDeltaBundle(payload as any)
        .catch((error: unknown) => {
          thrown = error
        })
    })

    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('executor failure')

    const store = useChronicleStore.getState()
    expect(store.pendingDeltaBundle).toBeNull()
    expect(store.deltaHistory[0]).toMatchObject({
      bundleId: 'idempotency-failure',
      entryId: 'entry-failure',
      status: 'failed',
      error: 'executor failure',
    })
    expect(store.auditLog[0]).toMatchObject({
      bundleId: 'idempotency-failure',
      entryId: 'entry-failure',
      action: 'failed',
    })

    expect(applySpy).toHaveBeenCalled()
  })
})
