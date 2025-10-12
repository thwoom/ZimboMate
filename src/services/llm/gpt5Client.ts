import type { UnlistenFn } from '@tauri-apps/api/event'
import type {
  ApplyDeltaBundleRequest,
  ApplyDeltaBundleResult,
  DeltaOperation,
  LlmProgressEvent,
  LlmTelemetryEvent,
  ProposeDeltasRequest,
  ProposeDeltasResponse,
  TokenUsage,
} from './types'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { ZodError } from 'zod'
import { stableStringify } from '@/utils/stableStringify'
import { computeSha256Hex } from './hash'
import {
  deltaSchemasForResponses,
  validateDeltaOperations,
} from './toolSchemas'

interface ChronicleProposeResponse {
  narrative: string
  operations: DeltaOperation[]
  usage: TokenUsage
  warnings?: string[]
  reasoning?: string
  model: string
  createdAt?: string
}

interface ChronicleApplyResponse {
  bundleId: string
  appliedOps: DeltaOperation[]
  skippedOps: DeltaOperation[]
  undoHandle: { bundleId: string; issuedAt: string }
}

interface ChronicleTelemetryEvent extends LlmTelemetryEvent {}

const PROGRESS_CHANNEL = 'llm_progress'
const TELEMETRY_CHANNEL = 'llm_telemetry'

export type ProgressHandler = (event: LlmProgressEvent) => void
export type TelemetryHandler = (event: ChronicleTelemetryEvent) => void

class Gpt5Client {
  private progressHandlers = new Set<ProgressHandler>()
  private telemetryHandlers = new Set<TelemetryHandler>()
  private progressUnlisten?: UnlistenFn
  private telemetryUnlisten?: UnlistenFn

  async proposeDeltas(
    request: ProposeDeltasRequest,
  ): Promise<ProposeDeltasResponse> {
    await this.ensureProgressListener()
    await this.ensureTelemetryListener()

    const response = await invoke<ChronicleProposeResponse>(
      'chronicle_propose_deltas',
      {
        request: {
          ...request,
          toolSchemas: deltaSchemasForResponses(),
        },
      },
    )

    let validatedOps: DeltaOperation[] = []
    let validationSource =
      stableStringify(response.operations ?? []) ?? '[]'
    const warnings = [...(response.warnings ?? [])]

    try {
      validatedOps = validateDeltaOperations(response.operations)
      validationSource = stableStringify(validatedOps)
      if (!validationSource) {
        validationSource = '[]'
      }
    } catch (error) {
      const details =
        error instanceof ZodError
          ? error.issues
              .slice(0, 2)
              .map((issue) => {
                const path = issue.path.join('.') || 'operation'
                return `${path}: ${issue.message}`
              })
              .join('; ')
          : error instanceof Error
            ? error.message
            : 'unknown validation error'

      console.error(
        '[gpt5Client] Invalid delta operations from GPT-5',
        details,
        response.operations,
      )

      warnings.push(
        `Automation skipped: Chronicle could not validate GPT-5's delta payload (${details}). The narrative was saved without state updates.`,
      )
      validatedOps = []
      validationSource = '[]'
    }

    const createdAt = response.createdAt ?? new Date().toISOString()
    const idempotencyKey = await computeSha256Hex(
      `${request.entryId}:${validationSource}`,
    )

    return {
      bundle: {
        entryId: request.entryId,
        narrative: response.narrative,
        ops: validatedOps,
        usage: response.usage,
        reasoning: response.reasoning,
        idempotencyKey,
        model: response.model,
        createdAt,
      },
      warnings,
    }
  }

  async applyBundle(
    payload: ApplyDeltaBundleRequest,
  ): Promise<ApplyDeltaBundleResult> {
    const response = await invoke<ChronicleApplyResponse>(
      'chronicle_apply_delta_bundle',
      {
        request: payload,
      },
    )

    const appliedOps = validateDeltaOperations(response.appliedOps)
    const skippedOps = validateDeltaOperations(response.skippedOps)

    return {
      bundleId: response.bundleId,
      appliedOps,
      skippedOps,
      undoHandle: response.undoHandle,
    }
  }

  onProgress(handler: ProgressHandler): () => void {
    this.progressHandlers.add(handler)
    void this.ensureProgressListener()
    return () => this.progressHandlers.delete(handler)
  }

  onTelemetry(handler: TelemetryHandler): () => void {
    this.telemetryHandlers.add(handler)
    void this.ensureTelemetryListener()
    return () => this.telemetryHandlers.delete(handler)
  }

  private async ensureProgressListener(): Promise<void> {
    if (this.progressUnlisten) {
      return
    }

    try {
      this.progressUnlisten = await listen<LlmProgressEvent>(
        PROGRESS_CHANNEL,
        (event) => {
          for (const handler of this.progressHandlers) {
            handler(event.payload)
          }
        },
      )
    } catch (error) {
      console.error('[gpt5Client] Failed to register progress listener', error)
    }
  }

  private async ensureTelemetryListener(): Promise<void> {
    if (this.telemetryUnlisten) {
      return
    }

    try {
      this.telemetryUnlisten = await listen<ChronicleTelemetryEvent>(
        TELEMETRY_CHANNEL,
        (event) => {
          for (const handler of this.telemetryHandlers) {
            handler(event.payload)
          }
        },
      )
    } catch (error) {
      console.error('[gpt5Client] Failed to register telemetry listener', error)
    }
  }
}

export const gpt5Client = new Gpt5Client()

export default gpt5Client
