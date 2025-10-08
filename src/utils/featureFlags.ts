const FALSE_VALUES = new Set(['false', '0', 'off', 'no', ''])

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
    const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> })
      ?.env
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

  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env.LLM_UNIFIED
    const normalized = normalizeFlagValue(envValue)
    if (typeof normalized === 'boolean') {
      return normalized
    }
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return true
  }

  return false
}
