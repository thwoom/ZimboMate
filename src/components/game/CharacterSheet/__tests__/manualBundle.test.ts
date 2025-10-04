import type { DeltaOperation } from '@/services/llm'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createManualBundle } from '../utils/manualBundle'

describe('createManualBundle', () => {
  const sampleOps: DeltaOperation[] = [
    { type: 'mark_xp', characterId: 'char-1', amount: 1 },
  ]

  const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')

  afterEach(() => {
    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', originalCryptoDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, 'crypto')
    }
  })

  it('wraps ops in a manual bundle with zero usage', () => {
    const bundle = createManualBundle(sampleOps)

    expect(bundle.ops).toEqual(sampleOps)
    expect(bundle.usage).toEqual({ inputTokens: 0, outputTokens: 0, totalTokens: 0 })
    expect(bundle.model).toBe('manual/folio')
    expect(bundle.idempotencyKey).toMatch(/^folio-inline-/)
    expect(bundle.entryId).toMatch(/^folio-inline-/)
  })

  it('falls back when crypto.randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })

    const bundle = createManualBundle(sampleOps)

    expect(bundle.idempotencyKey).toMatch(/^folio-inline-/)
    expect(bundle.entryId).toMatch(/^folio-inline-/)
  })

  it('uses crypto.randomUUID when available', () => {
    const mockUuid = 'mocked-uuid'
    const randomUUID = vi.fn(() => mockUuid)

    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID } as Pick<Crypto, 'randomUUID'>,
      configurable: true,
    })

    const bundle = createManualBundle(sampleOps)

    expect(randomUUID).toHaveBeenCalled()
    expect(bundle.idempotencyKey).toBe(`folio-inline-${mockUuid}`)
    expect(bundle.entryId).toBe(`folio-inline-${mockUuid}`)
  })
})
