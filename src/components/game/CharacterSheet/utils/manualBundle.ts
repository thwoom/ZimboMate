import type { DeltaOperation, ProposedDeltaBundle } from '@/services/llm'

export function createManualBundle(ops: DeltaOperation[]): ProposedDeltaBundle {
  const stamp =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    entryId: `folio-inline-${stamp}`,
    narrative: '',
    ops,
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    idempotencyKey: `folio-inline-${stamp}`,
    model: 'manual/folio',
    createdAt: new Date().toISOString(),
  }
}
