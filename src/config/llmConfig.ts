export type LlmRuntime = 'tauri' | 'local'

const DEFAULT_RUNTIME: LlmRuntime = 'local'

function normalizeRuntime(value: string | undefined): LlmRuntime {
  if (!value) return DEFAULT_RUNTIME
  const normalized = value.toLowerCase()
  if (normalized === 'local') return 'local'
  return DEFAULT_RUNTIME
}

export function getLlmRuntime(): LlmRuntime {
  const value = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_LLM_RUNTIME
  return normalizeRuntime(value)
}

export interface LocalLlmConfig {
  baseUrl: string
  voiceBaseUrl?: string
  apiKey?: string
  rulesModel: string
  voiceModel?: string
  requestTimeoutMs?: number
  maxRetries?: number
}

function readEnv(name: string): string | undefined {
  return (import.meta as { env?: Record<string, string | undefined> }).env?.[name]
}

export function getLocalLlmConfig(): LocalLlmConfig {
  const baseUrl = (readEnv('VITE_LOCAL_OPENAI_BASE_URL') ?? '').trim()
  const voiceBaseUrlRaw = readEnv('VITE_LOCAL_OPENAI_VOICE_BASE_URL')
  const voiceBaseUrl = voiceBaseUrlRaw
    ? voiceBaseUrlRaw.trim()
    : undefined
  const apiKey = readEnv('VITE_LOCAL_OPENAI_API_KEY')?.trim() || undefined
  const rulesModel = readEnv('VITE_LOCAL_RULES_MODEL')?.trim() || 'qwen3-instruct-2507'
  const voiceModel = readEnv('VITE_LOCAL_VOICE_MODEL')?.trim()
  const requestTimeoutMs = Number(readEnv('VITE_LOCAL_LLM_TIMEOUT_MS') ?? 3000)
  const maxRetries = Number(readEnv('VITE_LOCAL_LLM_MAX_RETRIES') ?? 1)

  return {
    baseUrl,
    voiceBaseUrl: voiceBaseUrl && voiceBaseUrl.length > 0 ? voiceBaseUrl : undefined,
    apiKey,
    rulesModel,
    voiceModel,
    requestTimeoutMs: Number.isFinite(requestTimeoutMs) ? requestTimeoutMs : 3000,
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : 1,
  }
}
