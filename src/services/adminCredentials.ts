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
  const response = await invoke<RawCredentialsResponse>('get_llm_credentials')
  return mapResponse(response)
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

  const response = await invoke<RawCredentialsResponse>('set_llm_credentials', payload)
  return mapResponse(response)
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
  const response = await invoke<RawAdminPaths>('get_admin_paths')
  return response
}

export async function fetchLlmUsage(date?: string): Promise<LlmUsageResponse> {
  const response = await invoke<LlmUsageResponse>('fetch_llm_usage', date ? { date } : {})
  return response
}

export async function diagnosePort(port: number): Promise<PortProcessInfo[]> {
  return await invoke<PortProcessInfo[]>('diagnose_dev_port', { port })
}

export async function terminateProcess(pid: number): Promise<void> {
  await invoke('terminate_process', { pid })
}
