import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useMemo } from 'react'

import { isLlmUnifiedEnabled } from '@/utils/featureFlags'
import { useChronicleLLM } from './ChronicleProvider'

export type AutomationSeverity = 'success' | 'busy' | 'danger' | 'idle'

export interface AutomationStatusDescriptor {
  key: string
  label: string
  hint: string
  message?: string
  severity: AutomationSeverity
  isSpinner: boolean
  icon: LucideIcon
}

export interface AutomationStatusMeta {
  status: AutomationStatusDescriptor | null
  llmUnifiedEnabled: boolean
  flags: {
    isApplying: boolean
    isProposing: boolean
    hadError: boolean
    readOnly: boolean
  }
}

function toTitleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function useAutomationStatus(): AutomationStatusMeta {
  const {
    isApplyingBundle,
    isProposing,
    lastProgressEvent,
    lastTelemetryEvent,
    canApplyAutomation,
  } = useChronicleLLM()

  const llmUnifiedEnabled = useMemo(() => isLlmUnifiedEnabled(), [])

  if (!llmUnifiedEnabled) {
    return {
      status: null,
      llmUnifiedEnabled: false,
      flags: {
        isApplying: false,
        isProposing: false,
        hadError: false,
        readOnly: false,
      },
    }
  }

  const progressStage = lastProgressEvent?.stage
  const progressMessage =
    lastProgressEvent?.message ??
    (lastProgressEvent as { text?: string } | null)?.text ??
    ''

  let status: AutomationStatusDescriptor | null = null
  const hadError =
    progressStage === 'error' ||
    /error|fail/i.test(progressStage ?? '') ||
    /error|fail/i.test(progressMessage)

  if (!canApplyAutomation) {
    status = {
      key: 'read-only',
      label: 'Read-only',
      hint: 'Review mode',
      message:
        'Chronicle automations are in dark-launch review mode. Apply and undo actions are disabled.',
      severity: 'danger',
      isSpinner: false,
      icon: ShieldAlert,
    }
  } else if (hadError) {
    status = {
      key: progressStage ?? 'error',
      label: 'Automation Error',
      hint: 'Needs attention',
      message: progressMessage || 'Chronicle could not apply the last update.',
      severity: 'danger',
      isSpinner: false,
      icon: AlertTriangle,
    }
  } else if (isApplyingBundle) {
    status = {
      key: 'applying',
      label: 'Applying',
      hint: progressMessage || 'Saving updates',
      message: progressMessage || 'Recording Chronicle deltas…',
      severity: 'busy',
      isSpinner: true,
      icon: Loader2,
    }
  } else if (isProposing) {
    status = {
      key: 'drafting',
      label: 'Drafting',
      hint: progressMessage || 'Drafting entry',
      message: progressMessage || 'GPT-5 is parsing the latest note.',
      severity: 'busy',
      isSpinner: true,
      icon: Sparkles,
    }
  } else if (lastProgressEvent) {
    const stageLabel = toTitleCase(lastProgressEvent.stage ?? 'Chronicle automation')
    status = {
      key: lastProgressEvent.stage ?? 'progress',
      label: stageLabel,
      hint: stageLabel,
      message: progressMessage || stageLabel,
      severity: 'busy',
      isSpinner: false,
      icon: Sparkles,
    }
  } else if (lastTelemetryEvent) {
    const latency = `${Math.round(lastTelemetryEvent.latencyMs)}ms`
    status = {
      key: 'ready',
      label: 'LLM Ready',
      hint: latency,
      message: `${latency}, ${lastTelemetryEvent.usage.totalTokens} tokens`,
      severity: 'success',
      isSpinner: false,
      icon: CheckCircle2,
    }
  } else {
    status = {
      key: 'idle',
      label: 'LLM Idle',
      hint: 'Standby',
      message: 'Chronicle automation is idle.',
      severity: 'idle',
      isSpinner: false,
      icon: CheckCircle2,
    }
  }

  return {
    status,
    llmUnifiedEnabled,
    flags: {
      isApplying: isApplyingBundle,
      isProposing,
      hadError,
      readOnly: !canApplyAutomation,
    },
  }
}
