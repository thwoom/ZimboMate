const FALSE_VALUES = new Set(['false', '0', 'off', 'no', ''])

type ProcessEnv = Record<string, unknown>

function getProcessEnv(): ProcessEnv | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined
  }

  const maybeProcess = (globalThis as { process?: { env?: ProcessEnv } }).process
  return maybeProcess?.env
}

function normalizeFlagValue(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    if (FALSE_VALUES.has(trimmed)) return false
    return trimmed.length > 0
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  return undefined
}

export function isLlmUnifiedEnabled(): boolean {
  try {
    const metaEnv = (
      import.meta as unknown as { env?: Record<string, unknown> }
    )?.env
    if (metaEnv && 'VITE_LLM_UNIFIED' in metaEnv) {
      const normalized = normalizeFlagValue(metaEnv.VITE_LLM_UNIFIED)
      if (typeof normalized === 'boolean') {
        return normalized
      }
    }
  } catch {
    // ignore - running outside Vite context
  }

  if (typeof globalThis !== 'undefined') {
    const override = (globalThis as Record<string, unknown>).__LLM_UNIFIED__
    const normalized = normalizeFlagValue(override)
    if (typeof normalized === 'boolean') {
      return normalized
    }
  }

  const processEnv = getProcessEnv()
  if (processEnv) {
    const envValue = processEnv.LLM_UNIFIED
    const normalized = normalizeFlagValue(envValue)
    if (typeof normalized === 'boolean') {
      return normalized
    }
  }

  const nodeEnv = processEnv?.NODE_ENV
  if (typeof nodeEnv === 'string' && nodeEnv === 'test') return true

  return false
}

const ROLLOUT_STAGE_VALUES = new Set(['dark', 'opt_in', 'default'] as const)

export type LlmRolloutStage = 'dark' | 'opt_in' | 'default'

function normalizeRolloutStage(value: unknown): LlmRolloutStage | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    if (ROLLOUT_STAGE_VALUES.has(trimmed as LlmRolloutStage)) {
      return trimmed as LlmRolloutStage
    }
  }

  return undefined
}

export function getLlmRolloutStage(): LlmRolloutStage {
  try {
    const metaEnv = (
      import.meta as unknown as { env?: Record<string, unknown> }
    )?.env
    if (metaEnv && 'VITE_LLM_ROLLOUT_STAGE' in metaEnv) {
      const normalized = normalizeRolloutStage(metaEnv.VITE_LLM_ROLLOUT_STAGE)
      if (normalized) return normalized
    }
  } catch {
    // ignore when running outside Vite
  }

  if (typeof globalThis !== 'undefined') {
    const override = (globalThis as Record<string, unknown>)
      .__LLM_ROLLOUT_STAGE__
    const normalized = normalizeRolloutStage(override)
    if (normalized) return normalized
  }

  const processEnv = getProcessEnv()
  if (processEnv) {
    const envValue = processEnv.LLM_ROLLOUT_STAGE
    const normalized = normalizeRolloutStage(envValue)
    if (normalized) return normalized
  }

  const nodeEnv = processEnv?.NODE_ENV
  if (typeof nodeEnv === 'string' && nodeEnv === 'test') return 'default'

  return 'default'
}
