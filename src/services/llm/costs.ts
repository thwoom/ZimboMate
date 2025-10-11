import type { TokenUsage } from './types'
import process from 'node:process'

export interface ModelPricing {
  /**
   * USD cost per 1,000 input tokens.
   */
  inputPer1KUsd: number
  /**
   * USD cost per 1,000 output tokens.
   */
  outputPer1KUsd: number
}

type PricingRegistry = Record<string, ModelPricing>

const GLOBAL_PRICING_KEY = '__LLM_PRICING__'

const DEFAULT_PRICING: PricingRegistry = {
  // GPT-5 flagship family (pricing per 1K tokens)
  'gpt-5': {
    inputPer1KUsd: 0.00125,
    outputPer1KUsd: 0.01,
  },
  'gpt-5-chat-latest': {
    inputPer1KUsd: 0.00125,
    outputPer1KUsd: 0.01,
  },
  'gpt-5-mini': {
    inputPer1KUsd: 0.00025,
    outputPer1KUsd: 0.002,
  },
  'gpt-5-nano': {
    inputPer1KUsd: 0.00005,
    outputPer1KUsd: 0.0004,
  },
  'gpt-5-pro': {
    inputPer1KUsd: 0.015,
    outputPer1KUsd: 0.12,
  },
}

function normalizeModelKey(model: string): string {
  return model.trim().toLowerCase()
}

function resolvePricing(model: string): ModelPricing | undefined {
  const registry = resolvePricingRegistry()
  const direct = registry[model]
  if (direct) return direct

  const normalized = normalizeModelKey(model)
  for (const [key, pricing] of Object.entries(registry)) {
    const normalizedKey = normalizeModelKey(key)
    if (
      normalized === normalizedKey ||
      normalized.startsWith(`${normalizedKey}-`) ||
      normalized.includes(`${normalizedKey}@`)
    ) {
      return pricing
    }
  }

  return undefined
}

function resolvePricingRegistry(): PricingRegistry {
  const envPricing = resolveEnvPricing()
  const mergedWithEnv = envPricing
    ? { ...DEFAULT_PRICING, ...envPricing }
    : DEFAULT_PRICING

  const globalOverride = (globalThis as Record<string, unknown>)[
    GLOBAL_PRICING_KEY
  ]
  if (isPricingRegistry(globalOverride)) {
    return { ...mergedWithEnv, ...globalOverride }
  }

  return mergedWithEnv
}

function resolveEnvPricing(): PricingRegistry | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined

  const candidates = [
    process.env.LLM_PRICING_JSON,
    process.env.VITE_LLM_PRICING_JSON,
  ]

  for (const candidate of candidates) {
    const parsed = parsePricingRegistry(candidate)
    if (parsed) {
      return parsed
    }
  }

  return undefined
}

function parsePricingRegistry(value: unknown): PricingRegistry | undefined {
  if (!value || typeof value !== 'string') return undefined
  try {
    const parsed = JSON.parse(value) as unknown
    if (isPricingRegistry(parsed)) {
      return parsed
    }
  } catch {
    // ignore malformed JSON
  }
  return undefined
}

function isPricingRegistry(value: unknown): value is PricingRegistry {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as PricingRegistry).every((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const { inputPer1KUsd, outputPer1KUsd } = entry as ModelPricing
    return (
      typeof inputPer1KUsd === 'number' &&
      !Number.isNaN(inputPer1KUsd) &&
      inputPer1KUsd >= 0 &&
      typeof outputPer1KUsd === 'number' &&
      !Number.isNaN(outputPer1KUsd) &&
      outputPer1KUsd >= 0
    )
  })
}

export function estimateUsageCostCents(
  model: string,
  usage: TokenUsage,
): number | null {
  if (!model || !usage) return null

  const pricing = resolvePricing(model)
  if (!pricing) return null

  const inputUsd = (usage.inputTokens / 1000) * pricing.inputPer1KUsd
  const outputUsd = (usage.outputTokens / 1000) * pricing.outputPer1KUsd

  const totalUsd = Math.max(0, inputUsd + outputUsd)
  if (!Number.isFinite(totalUsd) || totalUsd <= 0) return null

  const cents = Math.round(totalUsd * 100)
  return cents > 0 ? cents : null
}
