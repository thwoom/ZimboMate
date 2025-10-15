import type {
  AdminPaths,
  LlmCredentials,
  LlmCredentialSource,
  LlmUsageResponse,
  PortProcessInfo,
} from '@/services/adminCredentials'
import { invoke } from '@tauri-apps/api/core'
import {
  Activity,
  FolderOpen,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  diagnosePort,
  fetchAdminPaths,
  fetchLlmCredentials,
  fetchLlmUsage,
  terminateProcess,
  updateLlmSettings,
} from '@/services/adminCredentials'
import { useChronicleStore } from '@/stores/chronicleStore'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Input } from './Input'
import { Label } from './label'

type StatusTone = 'neutral' | 'success' | 'error'

interface StatusMessage {
  tone: StatusTone
  message: string
}

interface FormState {
  apiKey: string
  baseUrl: string
  model: string
  projectId: string
}

const SOURCE_LABELS: Record<LlmCredentialSource, string> = {
  stored: 'Stored override (encrypted on this device)',
  env: 'Bundled .env value',
  none: 'No value configured',
}

const MASK = (value: string) =>
  value.length <= 8 ? '*'.repeat(value.length || 4) : `${value.slice(0, 4)}...${value.slice(-4)}`

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const TODAY = () => new Date().toISOString().slice(0, 10)

function mapCredentialsToForm(data: LlmCredentials): FormState {
  return {
    apiKey: data.apiKey ?? '',
    baseUrl: data.baseUrl,
    model: data.model,
    projectId: data.projectId ?? '',
  }
}

function getNestedNumber(payload: Record<string, unknown>, path: string[]): number | null {
  let current: unknown = payload
  for (const segment of path) {
    if (typeof current !== 'object' || current === null) {
      return null
    }
    current = (current as Record<string, unknown>)[segment]
  }
  if (typeof current === 'number') return current
  if (typeof current === 'string') {
    const parsed = Number(current)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function getNestedArray(
  payload: Record<string, unknown>,
  path: string[],
): Record<string, unknown>[] {
  let current: unknown = payload
  for (const segment of path) {
    if (typeof current !== 'object' || current === null) {
      return []
    }
    current = (current as Record<string, unknown>)[segment]
  }
  if (Array.isArray(current)) {
    return current as Record<string, unknown>[]
  }
  return []
}

export const AdminOpenAISettings: React.FC = () => {
  const [credentialsLoading, setCredentialsLoading] = useState(true)
  const [savingCredentials, setSavingCredentials] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [credentialsStatus, setCredentialsStatus] = useState<StatusMessage | null>(null)
  const [credentials, setCredentials] = useState<LlmCredentials | null>(null)
  const [form, setForm] = useState<FormState>(() => ({
    apiKey: '',
    baseUrl: '',
    model: '',
    projectId: '',
  }))
  const [originalForm, setOriginalForm] = useState<FormState | null>(null)

  const [usage, setUsage] = useState<LlmUsageResponse | null>(null)
  const [usageDate, setUsageDate] = useState<string>(() => TODAY())
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageStatus, setUsageStatus] = useState<StatusMessage | null>(null)

  const [paths, setPaths] = useState<AdminPaths | null>(null)
  const [pathsStatus, setPathsStatus] = useState<StatusMessage | null>(null)

  const [diagnostics, setDiagnostics] = useState<PortProcessInfo[]>([])
  const [diagnosticsPort, setDiagnosticsPort] = useState<number>(1420)
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false)
  const [diagnosticsStatus, setDiagnosticsStatus] = useState<StatusMessage | null>(null)

  const costCapCents = useChronicleStore((state) => state.settings.costCapCents ?? null)
  const updateChronicleSettings = useChronicleStore((state) => state.updateSettings)
  const sessionCostCents = useChronicleStore((state) => state.sessionCostCents)
  const lastCostEventAt = useChronicleStore((state) => state.lastCostEventAt)
  const resetSessionCost = useChronicleStore((state) => state.resetSessionCost)

  const [guardrailStatus, setGuardrailStatus] = useState<StatusMessage | null>(null)
  const [costCapInput, setCostCapInput] = useState('')
  useEffect(() => {
    void loadCredentials()
    void loadPaths()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setCostCapInput(() =>
      costCapCents !== null ? (costCapCents / 100).toString() : '',
    )
  }, [costCapCents])

  async function loadCredentials() {
    setCredentialsLoading(true)
    setCredentialsStatus(null)
    try {
      const response = await fetchLlmCredentials()
      setCredentials(response)
      const mapped = mapCredentialsToForm(response)
      setForm(mapped)
      setOriginalForm(mapped)
    } catch (error) {
      setCredentialsStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? `Failed to load credentials: ${error.message}`
            : 'Failed to load credentials.',
      })
    } finally {
      setCredentialsLoading(false)
    }
  }

  async function loadPaths() {
    try {
      const response = await fetchAdminPaths()
      setPaths(response)
    } catch (error) {
      setPathsStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? `Unable to resolve admin paths: ${error.message}`
            : 'Unable to resolve admin paths.',
      })
    }
  }

  const isDirty = useMemo(() => {
    if (!originalForm) return false
    return (
      originalForm.apiKey !== form.apiKey ||
      originalForm.baseUrl !== form.baseUrl ||
      originalForm.model !== form.model ||
      originalForm.projectId !== form.projectId
    )
  }, [form, originalForm])

  const maskedKey = useMemo(() => (form.apiKey ? MASK(form.apiKey) : ''), [form.apiKey])

  function handleFormChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSavingCredentials(true)
    setCredentialsStatus(null)
    try {
      const payload = {
        apiKey: form.apiKey.trim(),
        baseUrl: form.baseUrl.trim(),
        model: form.model.trim(),
        projectId: form.projectId.trim(),
      }
      const response = await updateLlmSettings(payload)
      setCredentials(response)
      const mapped = mapCredentialsToForm(response)
      setForm(mapped)
      setOriginalForm(mapped)
      setCredentialsStatus({
        tone: 'success',
        message: 'LLM settings saved. Chronicle will use the updated configuration on next run.',
      })
    } catch (error) {
      setCredentialsStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? `Unable to save LLM settings: ${error.message}`
            : 'Unable to save LLM settings.',
      })
    } finally {
      setSavingCredentials(false)
    }
  }

  async function handleClearOverrides() {
    if (!originalForm) return
    setForm({ apiKey: '', baseUrl: '', model: '', projectId: '' })
    await handleSave()
  }

  async function handleTestConnection() {
    setTestingConnection(true)
    setCredentialsStatus(null)
    try {
      const modelName = form.model.trim().length > 0 ? form.model.trim() : null
      await invoke('initialize_llm', { modelName })
      setCredentialsStatus({
        tone: 'success',
        message: 'LLM initialization succeeded. Chronicle automation is ready.',
      })
      await loadCredentials()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Initialization failed. See console for details.'
      setCredentialsStatus({
        tone: 'error',
        message: `Initialization failed: ${message}`,
      })
    } finally {
      setTestingConnection(false)
    }
  }

  async function handleUsageRefresh() {
    if (!form.projectId.trim() && !(credentials?.projectId ?? '').trim()) {
      setUsageStatus({
        tone: 'error',
        message: 'Set a Project ID before requesting usage data.',
      })
      return
    }

    setUsageLoading(true)
    setUsageStatus(null)
    try {
      const response = await fetchLlmUsage(usageDate)
      setUsage(response)
      setUsageStatus({ tone: 'success', message: 'Usage data refreshed.' })
    } catch (error) {
      setUsage({
        date: usageDate,
        payload: {},
        projectId: (form.projectId || credentials?.projectId) ?? null,
      })
      setUsageStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? `Failed to load usage data: ${error.message}`
            : 'Failed to load usage data.',
      })
    } finally {
      setUsageLoading(false)
    }
  }

  async function handleRunDiagnostics() {
    setDiagnosticsLoading(true)
    setDiagnosticsStatus(null)
    try {
      const results = await diagnosePort(diagnosticsPort)
      setDiagnostics(results)
      setDiagnosticsStatus({
        tone: results.length === 0 ? 'neutral' : 'success',
        message:
          results.length === 0
            ? `No listeners detected on port ${diagnosticsPort}.`
            : `Found ${results.length} listener${results.length > 1 ? 's' : ''} on port ${diagnosticsPort}.`,
      })
    } catch (error) {
      setDiagnostics([])
      setDiagnosticsStatus({
        tone: 'error',
        message:
          error instanceof Error ? `Diagnostics failed: ${error.message}` : 'Diagnostics failed.',
      })
    } finally {
      setDiagnosticsLoading(false)
    }
  }

  async function handleTerminate(pid: number) {
    setDiagnosticsStatus(null)
    try {
      await terminateProcess(pid)
      setDiagnosticsStatus({
        tone: 'success',
        message: `Process ${pid} terminated.`,
      })
      await handleRunDiagnostics()
    } catch (error) {
      setDiagnosticsStatus({
        tone: 'error',
        message:
          error instanceof Error
            ? `Failed to terminate process: ${error.message}`
            : 'Failed to terminate process.',
      })
    }
  }

  async function handleTerminateAll() {
    const pids = diagnostics.map((entry) => entry.pid)
    for (const pid of pids) {
      await handleTerminate(pid)
    }
  }

async function handleOpenPath(path: string) {
  try {
      await openPathWithTauri(path)
      setPathsStatus({ tone: 'success', message: 'Opening in file explorer...' })
  } catch (error) {
      setPathsStatus({
        tone: 'error',
        message:
          error instanceof Error ? `Unable to open path: ${error.message}` : 'Unable to open path.',
      })
    }
  }

  async function handleCopyPath(path: string) {
    try {
      await navigator.clipboard.writeText(path)
      setPathsStatus({ tone: 'success', message: 'Path copied to clipboard.' })
    } catch (error) {
      setPathsStatus({
        tone: 'error',
        message:
          error instanceof Error ? `Unable to copy path: ${error.message}` : 'Unable to copy path.',
      })
    }
  }

  async function handleCostCapSave() {
    const trimmed = costCapInput.trim()
    if (trimmed.length === 0) {
      updateChronicleSettings({ costCapCents: undefined })
      setGuardrailStatus({ tone: 'success', message: 'Automation cost cap cleared.' })
      return
    }

    const numeric = Number(trimmed)
    if (Number.isNaN(numeric) || numeric < 0) {
      setGuardrailStatus({
        tone: 'error',
        message: 'Provide a valid positive number for cost cap.',
      })
      return
    }

    updateChronicleSettings({ costCapCents: Math.round(numeric * 100) })
    setGuardrailStatus({ tone: 'success', message: 'Automation cost cap updated.' })
  }
  const totalUsageCents = usage
    ? getNestedNumber(usage.payload, ['accumulated_usage', 'total', 'usd_cents']) ??
      getNestedNumber(usage.payload, ['data', 'accumulated_usage', 'total', 'usd_cents'])
    : null

  const dailyUsage = usage
    ? getNestedArray(usage.payload, ['daily_usage']) ??
      getNestedArray(usage.payload, ['data', 'daily_usage'])
    : []

  const todaysUsageCents =
    dailyUsage.length > 0
      ? getNestedNumber(dailyUsage[0], ['usd_cents']) ??
        getNestedNumber(dailyUsage[0], ['total_usd_cents'])
      : null

  const sessionCostDollars = sessionCostCents / 100

  const apiKeySource = credentials?.apiKeySource ?? 'none'
  const baseUrlSource = credentials?.baseUrlSource ?? 'env'
  const modelSource = credentials?.modelSource ?? 'env'
  const projectIdSource = credentials?.projectIdSource ?? 'none'

  return (
    <div className='space-y-4'>
      <Card variant='surface'>
        <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-2'>
            {apiKeySource === 'none' ? (
              <ShieldAlert className='h-5 w-5 text-destructive' />
            ) : (
              <ShieldCheck className='h-5 w-5 text-primary' />
            )}
            <CardTitle className='text-lg font-semibold'>LLM Credential Hub</CardTitle>
          </div>
          <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
            <span>API Key: {SOURCE_LABELS[apiKeySource]}</span>
            <span>Base URL: {SOURCE_LABELS[baseUrlSource]}</span>
            <span>Model: {SOURCE_LABELS[modelSource]}</span>
            <span>Project ID: {SOURCE_LABELS[projectIdSource]}</span>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='admin-api-key'>API Key</Label>
              <Input
                id='admin-api-key'
                type='password'
                disabled={credentialsLoading || savingCredentials}
                placeholder='sk-proj-****************'
                value={form.apiKey}
                onChange={(event) => handleFormChange('apiKey', event.target.value)}
              />
              {form.apiKey && (
                <p className='text-xs text-muted-foreground'>Masked preview: {maskedKey}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='admin-base-url'>Base URL</Label>
              <Input
                id='admin-base-url'
                placeholder='https://api.openai.com/v1'
                disabled={credentialsLoading || savingCredentials}
                value={form.baseUrl}
                onChange={(event) => handleFormChange('baseUrl', event.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='admin-model'>Default Responses Model</Label>
              <Input
                id='admin-model'
                placeholder='gpt-5-chat-latest'
                disabled={credentialsLoading || savingCredentials}
                value={form.model}
                onChange={(event) => handleFormChange('model', event.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='admin-project-id'>Project ID</Label>
              <Input
                id='admin-project-id'
                placeholder='proj_xxxxx'
                disabled={credentialsLoading || savingCredentials}
                value={form.projectId}
                onChange={(event) => handleFormChange('projectId', event.target.value)}
              />
              <p className='text-xs text-muted-foreground'>Required for usage analytics.</p>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='primary'
              onClick={handleSave}
              disabled={credentialsLoading || savingCredentials || !isDirty}
            >
              {savingCredentials ? 'Saving…' : 'Save overrides'}
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={handleTestConnection}
              disabled={credentialsLoading || testingConnection}
            >
              {testingConnection ? 'Testing…' : 'Test connection'}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={handleClearOverrides}
              disabled={credentialsLoading || savingCredentials}
            >
              Clear overrides
            </Button>
            <Button type='button' variant='outline' onClick={loadCredentials} disabled={credentialsLoading}>
              Reload
            </Button>
          </div>

          {credentialsStatus && (
            <StatusBanner tone={credentialsStatus.tone} message={credentialsStatus.message} />
          )}
        </CardContent>
      </Card>

      <Card variant='surface'>
        <CardHeader className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg font-semibold'>Usage & Budget Monitor</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Label htmlFor='usage-date' className='text-xs text-muted-foreground'>
              Date
            </Label>
            <Input
              id='usage-date'
              type='date'
              value={usageDate}
              max={TODAY()}
              onChange={(event) => setUsageDate(event.target.value)}
              className='h-8 w-40 text-sm'
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleUsageRefresh}
              disabled={usageLoading}
              className='gap-1'
            >
              <RefreshCcw className='h-4 w-4' /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <MetricTile
              label='Estimated Total Spend'
              value={
                totalUsageCents !== null ? CURRENCY_FORMATTER.format(totalUsageCents / 100) : '—'
              }
              helper={`Project: ${
                (usage?.projectId ?? form.projectId ?? credentials?.projectId) ?? 'n/a'
              }`}
            />
            <MetricTile
              label='Selected Day Spend'
              value={
                todaysUsageCents !== null ? CURRENCY_FORMATTER.format(todaysUsageCents / 100) : '—'
              }
              helper={usage ? `Snapshot date: ${usage.date}` : 'Snapshot date: —'}
            />
            <MetricTile
              label='Session Spend (since launch)'
              value={CURRENCY_FORMATTER.format(sessionCostDollars)}
              helper={
                lastCostEventAt ? `Last updated ${new Date(lastCostEventAt).toLocaleString()}` : 'No billable events yet.'
              }
            />
          </div>

          {dailyUsage.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-muted-foreground'>Recent Daily Usage</h4>
              <div className='overflow-x-auto'>
                <table className='min-w-full text-left text-sm'>
                  <thead className='border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground'>
                    <tr>
                      <th className='py-2 pr-4'>Date</th>
                      <th className='py-2 pr-4'>Spend (USD)</th>
                      <th className='py-2 pr-4'>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyUsage.slice(0, 7).map((entry) => {
                      const dateValue = typeof entry.date === 'string' ? entry.date : '—'
                      const key =
                        typeof entry.date === 'string'
                          ? entry.date
                          : JSON.stringify(entry)
                      const cents =
                        getNestedNumber(entry, ['usd_cents']) ??
                        getNestedNumber(entry, ['total_usd_cents'])
                      return (
                        <tr key={key} className='border-b border-border/40'>
                          <td className='py-2 pr-4 text-sm'>{dateValue}</td>
                          <td className='py-2 pr-4 text-sm'>
                            {typeof cents === 'number'
                              ? CURRENCY_FORMATTER.format(cents / 100)
                              : '—'}
                          </td>
                          <td className='py-2 pr-4 text-xs text-muted-foreground'>
                            {JSON.stringify(entry)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {usageStatus && (
            <StatusBanner tone={usageStatus.tone} message={usageStatus.message} />
          )}
        </CardContent>
      </Card>

      <Card variant='surface'>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Automation Guardrails</CardTitle>
          <span className='text-xs text-muted-foreground'>Align Chronicle automation with your budget.</span>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid items-end gap-4 md:grid-cols-[1fr_auto_auto_auto]'>
            <div className='space-y-2'>
              <Label htmlFor='guardrail-cap'>Cost Cap (USD)</Label>
              <Input
                id='guardrail-cap'
                type='number'
                min='0'
                step='0.25'
                placeholder='Unlimited'
                value={costCapInput}
                onChange={(event) => setCostCapInput(event.target.value)}
              />
              <p className='text-xs text-muted-foreground'>Automation pauses when the estimated spend crosses this threshold.</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {[
                { label: 'No cap', value: '' },
                { label: '$5', value: '5' },
                { label: '$10', value: '10' },
                { label: '$25', value: '25' },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setCostCapInput(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Button type='button' variant='primary' size='sm' onClick={handleCostCapSave}>
              Save cap
            </Button>
            <Button type='button' variant='ghost' size='sm' onClick={() => setCostCapInput('')}>
              Clear
            </Button>
          </div>

          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <span>
              Session spend since launch:{' '}
              <span className='font-medium text-foreground'>
                {CURRENCY_FORMATTER.format(sessionCostDollars)}
              </span>
            </span>
            <Button type='button' variant='outline' size='sm' onClick={resetSessionCost}>
              Reset session counter
            </Button>
          </div>

          {guardrailStatus && (
            <StatusBanner tone={guardrailStatus.tone} message={guardrailStatus.message} />
          )}
        </CardContent>
      </Card>
      <Card variant='surface'>
        <CardHeader className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Stethoscope className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg font-semibold'>Diagnostics</CardTitle>
          </div>
          <div className='text-xs text-muted-foreground'>
            Monitor active dev servers and free ports without leaving the app.
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-wrap items-end gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='diagnostics-port'>Port</Label>
              <Input
                id='diagnostics-port'
                type='number'
                min='0'
                value={diagnosticsPort}
                onChange={(event) => setDiagnosticsPort(Number(event.target.value))}
                className='w-28'
              />
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={handleRunDiagnostics}
              disabled={diagnosticsLoading}
              className='gap-1'
            >
              <RefreshCcw className='h-4 w-4' /> Check port
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={handleTerminateAll}
              disabled={diagnostics.length === 0 || diagnosticsLoading}
            >
              Kill all listeners
            </Button>
          </div>

          <div className='overflow-x-auto rounded-md border border-border/60'>
            <table className='min-w-full divide-y divide-border/40 text-left text-sm'>
              <thead className='bg-muted/40 text-xs uppercase text-muted-foreground'>
                <tr>
                  <th className='py-2 px-3'>PID</th>
                  <th className='py-2 px-3'>Process</th>
                  <th className='py-2 px-3'>State</th>
                  <th className='py-2 px-3'>Local</th>
                  <th className='py-2 px-3'>Remote</th>
                  <th className='py-2 px-3 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/40'>
                {diagnostics.length === 0 ? (
                  <tr>
                    <td className='py-3 px-3 text-sm text-muted-foreground' colSpan={6}>
                      {diagnosticsStatus?.tone === 'error'
                        ? 'Diagnostics unavailable.'
                        : 'No active listeners found.'}
                    </td>
                  </tr>
                ) : (
                  diagnostics.map((entry) => (
                    <tr key={`${entry.pid}-${entry.localAddress}-${entry.localPort}`}>
                      <td className='py-2 px-3 font-mono text-xs text-muted-foreground'>
                        {entry.pid}
                      </td>
                      <td className='py-2 px-3 text-sm'>
                        <div className='font-medium text-foreground'>
                          {entry.processName ?? 'Unknown'}
                        </div>
                        <div className='max-w-xs truncate text-xs text-muted-foreground'>
                          {entry.commandLine ?? '—'}
                        </div>
                      </td>
                      <td className='py-2 px-3 text-sm text-muted-foreground'>{entry.state}</td>
                      <td className='py-2 px-3 text-xs text-muted-foreground'>
                        {entry.localAddress}:{entry.localPort}
                      </td>
                      <td className='py-2 px-3 text-xs text-muted-foreground'>
                        {entry.remoteAddress}:{entry.remotePort}
                      </td>
                      <td className='py-2 px-3 text-right'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleTerminate(entry.pid)}
                        >
                          Terminate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {diagnosticsStatus && (
            <StatusBanner tone={diagnosticsStatus.tone} message={diagnosticsStatus.message} />
          )}
        </CardContent>
      </Card>

      <Card variant='surface'>
        <CardHeader className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FolderOpen className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg font-semibold'>Paths & Backups</CardTitle>
          </div>
          <span className='text-xs text-muted-foreground'>Quick access for support and archiving.</span>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-3 md:grid-cols-2'>
            <PathRow
              label='Credentials file'
              path={paths?.credentialsFile ?? 'Not created yet'}
              disabled={!paths?.credentialsFile}
              onOpen={() => paths?.credentialsFile && handleOpenPath(paths.credentialsFile)}
              onCopy={() => paths?.credentialsFile && handleCopyPath(paths.credentialsFile)}
            />
            <PathRow
              label='Logs directory'
              path={paths?.logsDirectory ?? 'Unknown'}
              disabled={!paths?.logsDirectory}
              onOpen={() => paths?.logsDirectory && handleOpenPath(paths.logsDirectory)}
              onCopy={() => paths?.logsDirectory && handleCopyPath(paths.logsDirectory)}
            />
            <PathRow
              label='Workspace root'
              path={paths?.workspaceRoot ?? 'Unknown'}
              disabled={!paths?.workspaceRoot}
              onOpen={() => paths?.workspaceRoot && handleOpenPath(paths.workspaceRoot)}
              onCopy={() => paths?.workspaceRoot && handleCopyPath(paths.workspaceRoot)}
            />
          </div>

          {pathsStatus && <StatusBanner tone={pathsStatus.tone} message={pathsStatus.message} />}
        </CardContent>
      </Card>
    </div>
  )
}

async function openPathWithTauri(path: string): Promise<void> {
  const tauri = (globalThis as {
    __TAURI__?: {
      shell?: { open?: (target: string) => Promise<void> }
      invoke?: (command: string, args?: Record<string, unknown>) => Promise<unknown>
    }
  }).__TAURI__

  if (!tauri) {
    throw new Error('Tauri bridge is not available')
  }

  if (typeof tauri.shell?.open === 'function') {
    await tauri.shell.open(path)
    return
  }

  if (typeof tauri.invoke === 'function') {
    await tauri.invoke('plugin:shell|open', { path })
    return
  }

  throw new Error('Shell open API is unavailable in this runtime')
}

interface MetricTileProps {
  label: string
  value: string
  helper?: string
}

function MetricTile({ label, value, helper }: MetricTileProps) {
  return (
    <div className='rounded-lg border border-border/60 bg-card/40 p-4 shadow-sm'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-1 text-xl font-semibold text-foreground'>{value}</p>
      {helper && <p className='mt-1 text-xs text-muted-foreground'>{helper}</p>}
    </div>
  )
}

interface PathRowProps {
  label: string
  path: string
  disabled: boolean
  onOpen: () => void
  onCopy: () => void
}

function PathRow({ label, path, disabled, onOpen, onCopy }: PathRowProps) {
  return (
    <div className='flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 p-3 shadow-sm'>
      <div className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</div>
      <div className='break-all font-mono text-xs text-muted-foreground'>{path}</div>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm' onClick={onOpen} disabled={disabled}>
          Open
        </Button>
        <Button type='button' variant='ghost' size='sm' onClick={onCopy} disabled={disabled}>
          Copy path
        </Button>
      </div>
    </div>
  )
}

function StatusBanner({ tone, message }: StatusMessage) {
  const className =
    tone === 'success'
      ? 'border-success/40 bg-success/10 text-success'
      : tone === 'error'
        ? 'border-destructive/40 bg-destructive/10 text-destructive'
        : 'border-muted-foreground/40 bg-muted/20 text-muted-foreground'

  return <div className={`rounded-md border px-3 py-2 text-sm ${className}`}>{message}</div>
}
