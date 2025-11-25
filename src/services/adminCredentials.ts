import { invoke } from '@tauri-apps/api/core'

interface RawCredentialsResponse {
  apiKey: string | null
  apiKeySource: string | null
  baseUrl: string
  baseUrlSource: string
  model: string
  modelSource: string
  projectId: string | null
  projectIdSource: string | null
  hasOverride: boolean
}

export type LlmCredentialSource = 'stored' | 'env' | 'none'

export interface LlmCredentials {
  apiKey: string | null
  apiKeySource: LlmCredentialSource
  baseUrl: string
  baseUrlSource: LlmCredentialSource
  model: string
  modelSource: LlmCredentialSource
  projectId: string | null
  projectIdSource: LlmCredentialSource
  hasOverride: boolean
}

export interface LlmSettingsUpdate {
  apiKey?: string | null
  baseUrl?: string | null
  model?: string | null
  projectId?: string | null
}

export class LlmSettingsUpdateError extends Error {
  constructor(message: string, public readonly fallback?: LlmCredentials) {
    super(message)
    this.name = 'LlmSettingsUpdateError'
  }
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'
const LOCAL_STORAGE_KEY = 'secretary.llmCredentials'

function isTauriAvailable(): boolean {
  return typeof globalThis !== 'undefined' && '__TAURI_IPC__' in globalThis
}

function shouldFallbackToLocal(error: unknown): boolean {
  if (!error) {
    return false
  }
  if (error instanceof Error) {
    const message = error.message ?? ''
    return (
      message.includes('__TAURI_IPC__') ||
      message.includes('window is not defined') ||
      message.includes('not implemented in this environment')
    )
  }
  return String(error).includes('__TAURI_IPC__')
}

function normalizeSource(raw: string | null): LlmCredentialSource {
  if (raw === 'stored' || raw === 'env') {
    return raw
  }
  return 'none'
}

function mapResponse(raw: RawCredentialsResponse): LlmCredentials {
  return {
    apiKey: raw.apiKey,
    apiKeySource: normalizeSource(raw.apiKeySource),
    baseUrl: raw.baseUrl,
    baseUrlSource: normalizeSource(raw.baseUrlSource),
    model: raw.model,
    modelSource: normalizeSource(raw.modelSource),
    projectId: raw.projectId,
    projectIdSource: normalizeSource(raw.projectIdSource),
    hasOverride: raw.hasOverride,
  }
}

export async function fetchLlmCredentials(): Promise<LlmCredentials> {
  if (!isTauriAvailable()) {
    return mapResponse(readLocalCredentials())
  }
  try {
    const response = await invoke<RawCredentialsResponse>('get_llm_credentials')
    return mapResponse(response)
  } catch (error) {
    if (shouldFallbackToLocal(error)) {
      console.warn('[secretary] falling back to local LLM credentials cache', error)
      return mapResponse(readLocalCredentials())
    }
    console.warn('[secretary] get_llm_credentials failed, using local cache as fallback', error)
    return mapResponse(readLocalCredentials())
  }
}

export async function updateLlmSettings(
  update: LlmSettingsUpdate,
): Promise<LlmCredentials> {
  const payload: Record<string, string> = {}

  if (Object.prototype.hasOwnProperty.call(update, 'apiKey')) {
    payload.apiKey = update.apiKey ?? ''
  }

  if (Object.prototype.hasOwnProperty.call(update, 'baseUrl')) {
    payload.baseUrl = update.baseUrl ?? ''
  }

  if (Object.prototype.hasOwnProperty.call(update, 'model')) {
    payload.model = update.model ?? ''
  }

  if (Object.prototype.hasOwnProperty.call(update, 'projectId')) {
    payload.projectId = update.projectId ?? ''
  }

  if (!isTauriAvailable()) {
    const raw = applyLocalUpdate(update)
    writeLocalCredentials(raw)
    return mapResponse(raw)
  }

  try {
    const response = await invoke<RawCredentialsResponse>('set_llm_credentials', payload)
    return mapResponse(response)
  } catch (error) {
    console.warn('[secretary] set_llm_credentials failed; persisting locally instead', error)
    const raw = applyLocalUpdate(update)
    writeLocalCredentials(raw)
    const fallback = mapResponse(raw)
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error while saving LLM settings.'

    throw new LlmSettingsUpdateError(
      `Unable to persist LLM settings via desktop bridge: ${message}`,
      fallback,
    )
  }
}

interface RawAdminPaths {
  credentialsFile: string | null
  logsDirectory: string
  workspaceRoot: string
}

export interface AdminPaths {
  credentialsFile: string | null
  logsDirectory: string
  workspaceRoot: string
}

export interface LlmUsageResponse {
  date: string
  payload: Record<string, unknown>
  projectId: string | null
}

export interface PortProcessInfo {
  localAddress: string
  localPort: number
  remoteAddress: string
  remotePort: number
  state: string
  pid: number
  processName?: string | null
  commandLine?: string | null
}

export async function fetchAdminPaths(): Promise<AdminPaths> {
  if (!isTauriAvailable()) {
    return {
      credentialsFile: null,
      logsDirectory: '',
      workspaceRoot: '',
    }
  }
  return await invoke<RawAdminPaths>('get_admin_paths')
}

export async function fetchLlmUsage(date?: string): Promise<LlmUsageResponse> {
  if (!isTauriAvailable()) {
    return {
      date: date ?? new Date().toISOString().slice(0, 10),
      payload: {},
      projectId: null,
    }
  }
  try {
    return await invoke<LlmUsageResponse>('fetch_llm_usage', date ? { date } : {})
  } catch (error) {
    console.warn('[secretary] fetch_llm_usage failed; returning empty payload', error)
    return {
      date: date ?? new Date().toISOString().slice(0, 10),
      payload: {},
      projectId: null,
    }
  }
}

export async function diagnosePort(port: number): Promise<PortProcessInfo[]> {
  if (!isTauriAvailable()) {
    return []
  }
  return await invoke<PortProcessInfo[]>('diagnose_dev_port', { port })
}

export async function terminateProcess(pid: number): Promise<void> {
  if (!isTauriAvailable()) {
    return
  }
  await invoke('terminate_process', { pid })
}

function readLocalCredentials(): RawCredentialsResponse {
  if (typeof globalThis === 'undefined' || !(globalThis as { localStorage?: Storage }).localStorage) {
    return createDefaultLocalCredentials()
  }

  try {
    const stored = globalThis.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) {
      return createDefaultLocalCredentials()
    }
    const parsed = JSON.parse(stored) as RawCredentialsResponse
    return normalizeLocalCredentials(parsed)
  } catch (error) {
    console.warn('[secretary] failed to parse stored LLM credentials', error)
    return createDefaultLocalCredentials()
  }
}

function writeLocalCredentials(raw: RawCredentialsResponse): void {
  if (typeof globalThis === 'undefined' || !(globalThis as { localStorage?: Storage }).localStorage) {
    return
  }

  try {
    globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(raw))
  } catch (error) {
    console.warn('[secretary] failed to persist LLM credentials locally', error)
  }
}

function createDefaultLocalCredentials(): RawCredentialsResponse {
  return {
    apiKey: null,
    apiKeySource: 'none',
    baseUrl: DEFAULT_BASE_URL,
    baseUrlSource: 'stored',
    model: DEFAULT_MODEL,
    modelSource: 'stored',
    projectId: null,
    projectIdSource: 'none',
    hasOverride: false,
  }
}

function normalizeLocalCredentials(raw: RawCredentialsResponse): RawCredentialsResponse {
  const normalized: RawCredentialsResponse = {
    apiKey: raw.apiKey ?? null,
    apiKeySource: raw.apiKey ? 'stored' : 'none',
    baseUrl: raw.baseUrl && raw.baseUrl.length > 0 ? raw.baseUrl : DEFAULT_BASE_URL,
    baseUrlSource: 'stored',
    model: raw.model && raw.model.length > 0 ? raw.model : DEFAULT_MODEL,
    modelSource: 'stored',
    projectId: raw.projectId ?? null,
    projectIdSource: raw.projectId ? 'stored' : 'none',
    hasOverride: false,
  }
  normalized.hasOverride = computeHasOverride(normalized)
  return normalized
}

function applyLocalUpdate(update: LlmSettingsUpdate): RawCredentialsResponse {
  const current = readLocalCredentials()

  if (Object.prototype.hasOwnProperty.call(update, 'apiKey')) {
    const value = update.apiKey?.trim() ?? ''
    current.apiKey = value.length > 0 ? value : null
    current.apiKeySource = current.apiKey ? 'stored' : 'none'
  }

  if (Object.prototype.hasOwnProperty.call(update, 'baseUrl')) {
    const value = update.baseUrl?.trim() ?? ''
    current.baseUrl = value.length > 0 ? value : DEFAULT_BASE_URL
    current.baseUrlSource = 'stored'
  }

  if (Object.prototype.hasOwnProperty.call(update, 'model')) {
    const value = update.model?.trim() ?? ''
    current.model = value.length > 0 ? value : DEFAULT_MODEL
    current.modelSource = 'stored'
  }

  if (Object.prototype.hasOwnProperty.call(update, 'projectId')) {
    const value = update.projectId?.trim() ?? ''
    current.projectId = value.length > 0 ? value : null
    current.projectIdSource = current.projectId ? 'stored' : 'none'
  }

  current.hasOverride = computeHasOverride(current)
  return current
}

function computeHasOverride(raw: RawCredentialsResponse): boolean {
  const apiKeyOverride = Boolean(raw.apiKey)
  const projectOverride = Boolean(raw.projectId)
  const baseOverride = raw.baseUrl !== DEFAULT_BASE_URL
  const modelOverride = raw.model !== DEFAULT_MODEL
  return apiKeyOverride || projectOverride || baseOverride || modelOverride
}
