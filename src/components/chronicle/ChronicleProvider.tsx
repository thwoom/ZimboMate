/**
 * Chronicle Provider
 *
 * Provides the contextual Chronicle system across the entire app.
 * Manages the overlay system, action listening, and context intelligence.
 */

/* eslint-disable react-refresh/only-export-components */

import type {
  ActionContext,
  ChronicleActionType,
} from '../../services/ChronicleActionListenerService'

import type {
  ApplyDeltaBundleRequest,
  ApplyDeltaBundleResult,
  LlmProgressEvent,
  LlmTelemetryEvent,
  NarrativeSettings,
  ProposeDeltasRequest,
  ProposeDeltasResponse,
  TokenUsage,
} from '../../services/llm'
import type {
  ChronicleSettings,
  ChronicleTelemetryEventLog,
} from '../../types/chronicle'
import type { LlmRolloutStage } from '@/utils/featureFlags'
import { invoke } from '@tauri-apps/api/core'
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getLlmRolloutStage } from '@/utils/featureFlags'
import { hasTauriBridge } from '@/utils/tauriRuntime'
import { applyChronicleDeltaBundle } from '../../services/chronicle'
import { chronicleActionListener } from '../../services/ChronicleActionListenerService'
import { estimateUsageCostCents, gpt5Client } from '../../services/llm'
import { computeSha256Hex } from '../../services/llm/hash'
import { useChronicleStore } from '../../stores/chronicleStore'
import { ChronicleOverlay } from './ChronicleOverlay'

interface ChronicleContextValue {
  emitAction: (context: ActionContext) => void
  isOverlayEnabled: boolean
  toggleOverlay: (enabled?: boolean) => void

  emitDiceRoll: (params: {
    characterName?: string
    stat?: string
    moveName?: string
    result: 'success' | 'partial' | 'failure'
    total: number
    modifier: number
    dice: number[]
  }) => void

  emitEquipmentAction: (params: {
    characterName?: string
    action: 'use' | 'equip' | 'unequip' | 'drop' | 'acquire'
    itemName: string
    itemType?: string
    quantity?: number
  }) => void

  emitCombatAction: (params: {
    characterName?: string
    action: 'attack' | 'defend' | 'move_combat' | 'use_ability'
    target?: string
    weapon?: string
    damage?: number
  }) => void

  overlayPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  setOverlayPosition: (
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
  ) => void
  maxPrompts: number
  setMaxPrompts: (max: number) => void
  settings: ChronicleSettings
  updateSettings: (settings: Partial<ChronicleSettings>) => void

  proposeEntryDeltas: (
    input: Omit<ProposeDeltasRequest, 'settings'>,
  ) => Promise<ProposeDeltasResponse>
  applyDeltaBundle: (
    payload: ApplyDeltaBundleRequest,
  ) => Promise<ApplyDeltaBundleResult>
  isProposing: boolean
  isApplyingBundle: boolean
  lastProgressEvent: LlmProgressEvent | null
  lastTelemetryEvent: LlmTelemetryEvent | null
  telemetryEvents: ChronicleTelemetryEventLog[]
  sessionCostCents: number
  costCapCents?: number
  remainingCostBudgetCents: number | null
  isCostGuardrailActive: boolean
  resetSessionCost: () => void
  rolloutStage: LlmRolloutStage
  canApplyAutomation: boolean
  canUndoAutomation: boolean
  canAutoApply: boolean
  recordTelemetry: (
    event: Partial<LlmTelemetryEvent>,
    source?: 'tauri' | 'client',
  ) => void
}

const ChronicleContext = createContext<ChronicleContextValue | null>(null)

const FALLBACK_CHRONICLE_SETTINGS: ChronicleSettings = {
  autoEntityCreation: false,
  minimumConfidenceForAutoCreation: 0.7,
  enableVoiceInput: false,
  enableSmartSuggestions: false,
  parseOnType: false,
  defaultEntityTypes: ['character', 'location', 'item'],
  customTags: [],
  autoApplyPolicy: {},
  tone: 'heroic',
  verbosity: 'standard',
  autoEquipWeapons: false,
}

let hasWarnedMissingChronicleContext = false
function warnMissingChronicleContext() {
  if (hasWarnedMissingChronicleContext) return
  hasWarnedMissingChronicleContext = true
  if (typeof console !== 'undefined') {
    console.warn(
      '[chronicle] useChronicleLLM called outside ChronicleProvider. Falling back to no-op implementation.',
    )
  }
}

const FALLBACK_CHRONICLE_LLM = {
  async proposeEntryDeltas(): Promise<ProposeDeltasResponse> {
    warnMissingChronicleContext()
    throw new Error('ChronicleProvider is not mounted')
  },
  async applyDeltaBundle(): Promise<ApplyDeltaBundleResult> {
    warnMissingChronicleContext()
    throw new Error('ChronicleProvider is not mounted')
  },
  isProposing: false,
  isApplyingBundle: false,
  lastProgressEvent: null as LlmProgressEvent | null,
  lastTelemetryEvent: null as LlmTelemetryEvent | null,
  telemetryEvents: [] as ChronicleTelemetryEventLog[],
  settings: FALLBACK_CHRONICLE_SETTINGS,
  updateSettings: (_partial: Partial<ChronicleSettings>) => {
    warnMissingChronicleContext()
  },
  sessionCostCents: 0,
  costCapCents: undefined as number | undefined,
  remainingCostBudgetCents: null as number | null,
  isCostGuardrailActive: false,
  resetSessionCost: () => {
    warnMissingChronicleContext()
  },
  rolloutStage: 'dark' as LlmRolloutStage,
  canApplyAutomation: false,
  canUndoAutomation: false,
  canAutoApply: false,
  recordTelemetry: () => {
    warnMissingChronicleContext()
  },
}

const ZERO_USAGE: TokenUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
}

interface ChronicleProviderProps {
  children: React.ReactNode
  defaultEnabled?: boolean
  overlayPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxPrompts?: number
}

export const ChronicleProvider: React.FC<ChronicleProviderProps> = ({
  children,
  defaultEnabled = true,
  overlayPosition: defaultPosition = 'top-right',
  maxPrompts: defaultMaxPrompts = 2,
}) => {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(defaultEnabled)
  const [overlayPosition, setOverlayPosition] = useState(defaultPosition)
  const [maxPrompts, setMaxPrompts] = useState(defaultMaxPrompts)
  const [isProposing, setIsProposing] = useState(false)
  const [isApplyingBundle, setIsApplyingBundle] = useState(false)
  const [lastProgressEvent, setLastProgressEvent] =
    useState<LlmProgressEvent | null>(null)
  const [lastTelemetryEvent, setLastTelemetryEvent] =
    useState<LlmTelemetryEvent | null>(null)

  const chronicleStore = useChronicleStore()
  const { logTelemetryEvent } = chronicleStore
  const sessionCostCents = useChronicleStore((state) => state.sessionCostCents)
  const telemetryEvents = useChronicleStore((state) =>
    state.getTelemetryEvents(25),
  )
  const recordSessionCost = useChronicleStore(
    (state) => state.recordSessionCost,
  )
  const resetSessionCost = useChronicleStore((state) => state.resetSessionCost)
  const currentSessionId = useChronicleStore((state) => state.currentSessionId)

  const rolloutStage = useMemo(() => getLlmRolloutStage(), [])
  const isRolloutDark = rolloutStage === 'dark'
  const canApplyAutomation = !isRolloutDark
  const canUndoAutomation = !isRolloutDark
  const canAutoApply = rolloutStage === 'default'

  const recordTelemetry = useCallback(
    (
      event: Partial<LlmTelemetryEvent>,
      source: 'tauri' | 'client' = 'client',
    ) => {
      const stage = event.stage ?? 'propose'
      const outcome = event.outcome ?? 'success'
      const usage = event.usage ?? ZERO_USAGE
      const normalizedUsage: TokenUsage = {
        inputTokens: Number(usage.inputTokens ?? 0),
        outputTokens: Number(usage.outputTokens ?? 0),
        totalTokens:
          Number(usage.totalTokens ?? 0) ||
          Number(usage.inputTokens ?? 0) + Number(usage.outputTokens ?? 0),
      }
      const model =
        event.model ??
        (stage === 'propose' ? 'gpt-5-chat-latest' : 'chronicle-delta-executor')
      const latencyMs = Number.isFinite(event.latencyMs)
        ? Number(event.latencyMs)
        : 0
      const computedCost =
        typeof event.costCents === 'number' && Number.isFinite(event.costCents)
          ? Math.max(0, Math.round(event.costCents))
          : estimateUsageCostCents(model, normalizedUsage)
      const costCents =
        typeof computedCost === 'number' && computedCost > 0
          ? computedCost
          : undefined
      const recordedAt = new Date().toISOString()
      const eventId =
        event.bundleId || event.entryId
          ? `${event.bundleId ?? event.entryId}:${stage}:${
              outcome ?? 'success'
            }:${recordedAt}`
          : (globalThis.crypto?.randomUUID?.() ??
            `telemetry-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 10)}`)

      const normalizedEvent: LlmTelemetryEvent = {
        model,
        latencyMs,
        usage: normalizedUsage,
        costCents,
        stage,
        outcome,
        bundleId: event.bundleId,
        entryId: event.entryId,
        error: event.error,
      }

      setLastTelemetryEvent(normalizedEvent)

      if (typeof logTelemetryEvent === 'function') {
        logTelemetryEvent({
          id: eventId,
          recordedAt,
          stage,
          outcome,
          model,
          latencyMs,
          usage: normalizedUsage,
          costCents,
          bundleId: event.bundleId,
          entryId: event.entryId,
          error: event.error,
          source,
        })
      }

      if (typeof costCents === 'number' && costCents > 0) {
        recordSessionCost(costCents, recordedAt)
      }
    },
    [logTelemetryEvent, recordSessionCost],
  )

  useEffect(() => {
    chronicleActionListener.setEnabled(isOverlayEnabled)
  }, [isOverlayEnabled])

  useEffect(() => {
    const offProgress = gpt5Client.onProgress(setLastProgressEvent)
    const offTelemetry = gpt5Client.onTelemetry((event) => {
      recordTelemetry(
        {
          ...event,
          stage: event.stage ?? 'propose',
          outcome: event.outcome ?? 'success',
        },
        'tauri',
      )
    })

    return () => {
      offProgress()
      offTelemetry()
    }
  }, [recordTelemetry])

  const previousSessionIdRef = useRef<string | null>(null)
  useEffect(() => {
    const normalized = currentSessionId ?? null
    if (previousSessionIdRef.current !== normalized) {
      resetSessionCost()
      previousSessionIdRef.current = normalized
    }
  }, [currentSessionId, resetSessionCost])

  const costCapCents = chronicleStore.settings.costCapCents
  const isCostGuardrailActive =
    typeof costCapCents === 'number' &&
    costCapCents >= 0 &&
    sessionCostCents >= costCapCents
  const remainingCostBudgetCents =
    typeof costCapCents === 'number' && costCapCents >= 0
      ? Math.max(0, costCapCents - sessionCostCents)
      : null

  const emitAction = useCallback(
    (context: ActionContext) => {
      const enrichedContext: ActionContext = {
        ...context,
        timestamp: context.timestamp ?? new Date(),
        sessionId:
          context.sessionId ?? chronicleStore.currentSessionId ?? undefined,
      }

      chronicleActionListener.emitAction(enrichedContext)
    },
    [chronicleStore.currentSessionId],
  )

  const emitDiceRoll = useCallback(
    (params: {
      characterName?: string
      stat?: string
      moveName?: string
      result: 'success' | 'partial' | 'failure'
      total: number
      modifier: number
      dice: number[]
    }) => {
      const actionType: ChronicleActionType = params.moveName
        ? 'move_roll'
        : params.stat
          ? 'stat_roll'
          : 'dice_roll'

      emitAction({
        actionType,
        timestamp: new Date(),
        characterName: params.characterName,
        diceRoll: {
          type: params.moveName ? 'move' : params.stat ? 'stat' : 'custom',
          stat: params.stat,
          moveName: params.moveName,
          result: params.result,
          total: params.total,
          modifier: params.modifier,
          dice: params.dice,
        },
      })
    },
    [emitAction],
  )

  const emitEquipmentAction = useCallback(
    (params: {
      characterName?: string
      action: 'use' | 'equip' | 'unequip' | 'drop' | 'acquire'
      itemName: string
      itemType?: string
      quantity?: number
    }) => {
      const actionType: ChronicleActionType =
        params.action === 'use' ? 'equipment_use' : 'equipment_equip'

      emitAction({
        actionType,
        timestamp: new Date(),
        characterName: params.characterName,
        equipment: {
          action: params.action,
          itemName: params.itemName,
          itemType: params.itemType,
          quantity: params.quantity,
        },
      })
    },
    [emitAction],
  )

  const emitCombatAction = useCallback(
    (params: {
      characterName?: string
      action: 'attack' | 'defend' | 'move_combat' | 'use_ability'
      target?: string
      weapon?: string
      damage?: number
    }) => {
      emitAction({
        actionType: 'combat_action',
        timestamp: new Date(),
        characterName: params.characterName,
        combat: {
          action: params.action,
          target: params.target,
          weapon: params.weapon,
          damage: params.damage,
        },
      })
    },
    [emitAction],
  )

  const toggleOverlay = useCallback(
    (enabled?: boolean) => {
      const nextEnabled = enabled ?? !isOverlayEnabled
      setIsOverlayEnabled(nextEnabled)
      chronicleActionListener.setEnabled(nextEnabled)
    },
    [isOverlayEnabled],
  )

  const buildNarrativeSettings = useCallback((): NarrativeSettings => {
    const settings = chronicleStore.settings
    return {
      tone: settings?.tone ?? 'heroic',
      verbosity: settings?.verbosity ?? 'standard',
      costCapCents: settings?.costCapCents,
      autoApplyPolicy: settings?.autoApplyPolicy ?? {},
      autoEquipWeapons: settings?.autoEquipWeapons ?? false,
    }
  }, [chronicleStore.settings])

  const updateSettings = useCallback(
    (partial: Partial<ChronicleSettings>) => {
      chronicleStore.updateSettings(partial)
    },
    [chronicleStore],
  )

  const buildGuardrailResponse = useCallback(
    async (
      input: Omit<ProposeDeltasRequest, 'settings'>,
    ): Promise<ProposeDeltasResponse> => {
      const createdAt = new Date().toISOString()
      const summary = input.rawText.trim()
      const truncatedSummary =
        summary.length > 240 ? `${summary.slice(0, 240)}...` : summary
      const capLine =
        typeof costCapCents === 'number'
          ? `Cost cap $${(costCapCents / 100).toFixed(
              2,
            )} / Session spend $${(sessionCostCents / 100).toFixed(2)}`
          : null
      const narrativeParts = [
        'Automation guardrail active: GPT-5 call skipped to respect the configured cost budget.',
        capLine,
        truncatedSummary ? `Captured note: ${truncatedSummary}` : undefined,
      ].filter(Boolean)
      const idempotencyKey = await computeSha256Hex(
        `${input.entryId}:guardrail:${createdAt}`,
      )

      return {
        bundle: {
          entryId: input.entryId,
          narrative: narrativeParts.join(' '),
          ops: [],
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          reasoning: 'cost_guardrail_triggered',
          idempotencyKey,
          model: 'guardrail-template',
          createdAt,
        },
        warnings: [
          'Session cost guardrail reached. GPT-5 call skipped; template narrative returned.',
        ],
      }
    },
    [costCapCents, sessionCostCents],
  )

  const proposeEntryDeltas = useCallback(
    async (input: Omit<ProposeDeltasRequest, 'settings'>) => {
      setIsProposing(true)

      const buildFallback = async (
        failureReason: string,
        additionalWarnings: string[] = [],
      ): Promise<ProposeDeltasResponse> => {
        const createdAt = new Date().toISOString()
        const idempotencyKey =
          typeof globalThis.crypto !== 'undefined' &&
          typeof globalThis.crypto.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : await computeSha256Hex(
                `${input.entryId}:fallback:${createdAt}:${Math.random()}`,
              )

        recordTelemetry(
          {
            stage: 'propose',
            outcome: 'failure',
            entryId: input.entryId,
            usage: ZERO_USAGE,
            model: 'chronicle-fallback',
            latencyMs: 0,
            costCents: 0,
            error: failureReason,
          },
          'client',
        )

        return {
          bundle: {
            entryId: input.entryId,
            narrative: input.rawText,
            ops: [],
            usage: ZERO_USAGE,
            reasoning: 'fallback_due_to_error',
            idempotencyKey,
            model: 'chronicle-fallback',
            createdAt,
          },
          warnings: [
            'Automation skipped: Chronicle could not reach GPT-5 for this note.',
            failureReason,
            ...additionalWarnings,
          ].filter(Boolean),
        }
      }

      const attemptPropose = async (
        attemptInput: Omit<ProposeDeltasRequest, 'settings'>,
        hasRetried: boolean,
      ): Promise<ProposeDeltasResponse> => {
        if (isCostGuardrailActive) {
          const fallback = await buildGuardrailResponse(attemptInput)
          setLastProgressEvent({
            progress: 100,
            stage: 'cost_guardrail',
            message:
              'Cost guardrail reached; returning template narrative without contacting GPT-5.',
          })
          recordTelemetry(
            {
              stage: 'guardrail',
              outcome: 'skipped',
              bundleId:
                fallback.bundle.idempotencyKey ?? fallback.bundle.entryId,
              entryId: fallback.bundle.entryId,
              usage: fallback.bundle.usage ?? ZERO_USAGE,
              model: fallback.bundle.model ?? 'guardrail-template',
              latencyMs: 0,
            },
            'client',
          )
          return fallback
        }

        const request: ProposeDeltasRequest = {
          ...attemptInput,
          settings: buildNarrativeSettings(),
        }

        if (!hasTauriBridge()) {
          return buildFallback(
            'Chronicle automation requires the Tauri desktop runtime to reach GPT-5.',
            [
              'Launch the desktop shell (`npm run dev:tauri`) so Chronicle can contact GPT-5, or continue with the template note.',
            ],
          )
        }

        try {
          return await gpt5Client.proposeDeltas(request)
        } catch (error) {
          const failureReason =
            error instanceof Error ? error.message : String(error ?? 'unknown error')
          const lowerReason = failureReason.toLowerCase()

          if (!hasRetried && lowerReason.includes('llm not ready')) {
            if (!hasTauriBridge()) {
              return buildFallback(
                'Chronicle automation requires the Tauri desktop runtime to reach GPT-5.',
                [
                  'Launch the desktop shell (`npm run dev:tauri`) so Chronicle can contact GPT-5, or continue with the template note.',
                ],
              )
            }
            try {
              await invoke('initialize_llm', { modelName: undefined })
              return await attemptPropose(attemptInput, true)
            } catch (initError) {
              const initMessage =
                initError instanceof Error
                  ? initError.message
                  : String(initError ?? 'initialization failed')
              return buildFallback(failureReason, [
                `Initialization attempt failed: ${initMessage}`,
              ])
            }
          }

          const extraWarnings =
            lowerReason.includes('llm not ready') && hasRetried
              ? [
                  'Chronicle attempted to initialize GPT-5 automatically. Try again in a few seconds.',
                ]
              : []

          return buildFallback(failureReason, extraWarnings)
        }
      }

      try {
        return await attemptPropose(input, false)
      } finally {
        setIsProposing(false)
      }
    },
    [
      buildGuardrailResponse,
      buildNarrativeSettings,
      isCostGuardrailActive,
      recordTelemetry,
    ],
  )

  const applyDeltaBundle = useCallback(
    async (payload: ApplyDeltaBundleRequest) => {
      if (!canApplyAutomation) {
        const blockedBundleId =
          payload.bundle.idempotencyKey ??
          payload.bundle.entryId ??
          `blocked-${Date.now()}`
        recordTelemetry({
          stage: 'apply',
          outcome: 'failure',
          bundleId: blockedBundleId,
          entryId: payload.bundle.entryId,
          usage: payload.bundle.usage ?? ZERO_USAGE,
          model: payload.bundle.model ?? 'chronicle-delta-executor',
          latencyMs: 0,
          costCents: 0,
          error: 'Automation is read-only in the current rollout stage.',
        })
        throw new Error('Automation is read-only in the current rollout stage.')
      }

      if (isCostGuardrailActive) {
        const guardrailBundleId =
          payload.bundle.idempotencyKey ??
          payload.bundle.entryId ??
          `guardrail-${Date.now()}`
        const timestamp = new Date().toISOString()
        const skippedOps = payload.bundle.ops ?? []

        setLastProgressEvent({
          progress: 100,
          stage: 'cost_guardrail',
          message: 'Cost guardrail reached; automation bundle skipped.',
        })

        chronicleStore.logDeltaResult({
          bundleId: guardrailBundleId,
          entryId: payload.bundle.entryId,
          appliedOps: [],
          skippedOps,
          createdAt: timestamp,
          actor: payload.autoApply ? 'auto' : 'manual',
          status: 'applied',
          requestedAt: timestamp,
          autoApply: Boolean(payload.autoApply),
        })

        chronicleStore.recordAuditEvent({
          id: `audit-${guardrailBundleId}`,
          bundleId: guardrailBundleId,
          entryId: payload.bundle.entryId,
          action: 'applied',
          actor: 'system',
          reason: 'cost_guardrail',
          timestamp,
          appliedOps: [],
          skippedOps,
        })

        recordTelemetry({
          stage: 'guardrail',
          outcome: 'skipped',
          bundleId: guardrailBundleId,
          entryId: payload.bundle.entryId,
          usage: ZERO_USAGE,
          model: payload.bundle.model ?? 'chronicle-delta-executor',
          latencyMs: 0,
          costCents: 0,
        })

        return {
          bundleId: guardrailBundleId,
          appliedOps: [],
          skippedOps,
          undoHandle: {
            bundleId: guardrailBundleId,
            issuedAt: timestamp,
          },
        }
      }

      setIsApplyingBundle(true)
      const applyRequestedAt = new Date()
      const bundleActor: 'auto' | 'manual' | 'system' | 'user' =
        payload.autoApply ? 'auto' : 'manual'

      chronicleStore.beginBundleApply({
        entryId: payload.bundle.entryId,
        requestedAt: applyRequestedAt.toISOString(),
        autoApply: Boolean(payload.autoApply),
        actor: bundleActor,
        bundleId:
          payload.bundle.idempotencyKey ?? payload.bundle.entryId ?? undefined,
        startedAt: applyRequestedAt.toISOString(),
      })

      const start =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
          ? performance.now()
          : Date.now()

      setLastProgressEvent({
        progress: 10,
        stage: 'applying_bundle',
        message: 'Applying Dungeon World updates...',
      })

      try {
        const result = await applyChronicleDeltaBundle(payload)

        setLastProgressEvent({
          progress: 100,
          stage: 'applied_bundle',
          message: 'Moves resolved and ledgers updated.',
        })

        const end =
          typeof performance !== 'undefined' &&
          typeof performance.now === 'function'
            ? performance.now()
            : Date.now()

        const durationMs = Math.max(0, Math.round(end - start))
        const completedAt = new Date()
        const resolvedBundleId =
          result.bundleId ??
          payload.bundle.idempotencyKey ??
          payload.bundle.entryId
        const usage = payload.bundle.usage ?? ZERO_USAGE

        recordTelemetry({
          latencyMs: durationMs,
          usage,
          stage: 'apply',
          outcome: 'success',
          bundleId: resolvedBundleId,
          entryId: payload.bundle.entryId,
          model: payload.bundle.model ?? 'chronicle-delta-executor',
          costCents: 0,
        })

        chronicleStore.finishBundleApply({
          bundleId: resolvedBundleId,
          entryId: payload.bundle.entryId,
          appliedOps: result.appliedOps,
          skippedOps: result.skippedOps,
          actor: bundleActor,
          undoHandle: result.undoHandle,
          completedAt: completedAt.toISOString(),
          requestedAt: applyRequestedAt.toISOString(),
          autoApply: Boolean(payload.autoApply),
          durationMs,
        })

        return result
      } catch (error) {
        setLastProgressEvent({
          progress: 100,
          stage: 'error',
          message:
            error instanceof Error ? error.message : 'Failed to apply bundle.',
        })

        const failureBundleId =
          useChronicleStore.getState().pendingDeltaBundle?.bundleId ??
          payload.bundle.idempotencyKey ??
          payload.bundle.entryId ??
          `bundle-${applyRequestedAt.getTime()}`
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        const failureEnd =
          typeof performance !== 'undefined' &&
          typeof performance.now === 'function'
            ? performance.now()
            : Date.now()
        const failureLatency = Math.max(0, Math.round(failureEnd - start))

        chronicleStore.recordBundleFailure({
          bundleId: failureBundleId,
          entryId: payload.bundle.entryId,
          actor: bundleActor,
          reason: 'Chronicle automation failed to apply.',
          error: errorMessage,
          occurredAt: new Date().toISOString(),
        })

        recordTelemetry({
          usage: payload.bundle.usage ?? ZERO_USAGE,
          stage: 'apply',
          outcome: 'failure',
          bundleId:
            payload.bundle.idempotencyKey ??
            payload.bundle.entryId ??
            undefined,
          entryId: payload.bundle.entryId,
          model: payload.bundle.model ?? 'chronicle-delta-executor',
          latencyMs: failureLatency,
          error: errorMessage,
          costCents: 0,
        })
        throw error
      } finally {
        chronicleStore.endBundleApply()
        setIsApplyingBundle(false)
      }
    },
    [
      canApplyAutomation,
      chronicleStore,
      isCostGuardrailActive,
      setLastProgressEvent,
      recordTelemetry,
    ],
  )

  const contextValue = useMemo<ChronicleContextValue>(
    () => ({
      emitAction,
      isOverlayEnabled,
      toggleOverlay,
      emitDiceRoll,
      emitEquipmentAction,
      emitCombatAction,
      overlayPosition,
      setOverlayPosition,
      maxPrompts,
      setMaxPrompts,
      settings: chronicleStore.settings,
      updateSettings,
      proposeEntryDeltas,
      applyDeltaBundle,
      isProposing,
      isApplyingBundle,
      lastProgressEvent,
      lastTelemetryEvent,
      telemetryEvents,
      sessionCostCents,
      costCapCents,
      remainingCostBudgetCents,
      isCostGuardrailActive,
      resetSessionCost,
      rolloutStage,
      canApplyAutomation,
      canUndoAutomation,
      canAutoApply,
      recordTelemetry,
    }),
    [
      applyDeltaBundle,
      chronicleStore.settings,
      emitAction,
      emitCombatAction,
      emitDiceRoll,
      emitEquipmentAction,
      isApplyingBundle,
      isOverlayEnabled,
      isCostGuardrailActive,
      isProposing,
      lastProgressEvent,
      lastTelemetryEvent,
      telemetryEvents,
      maxPrompts,
      overlayPosition,
      proposeEntryDeltas,
      recordTelemetry,
      setMaxPrompts,
      setOverlayPosition,
      sessionCostCents,
      toggleOverlay,
      updateSettings,
      costCapCents,
      remainingCostBudgetCents,
      resetSessionCost,
      rolloutStage,
      canApplyAutomation,
      canUndoAutomation,
      canAutoApply,
    ],
  )

  return (
    <ChronicleContext value={contextValue}>
      {children}
      <ChronicleOverlay
        isEnabled={isOverlayEnabled}
        position={overlayPosition}
        maxPrompts={maxPrompts}
      />
    </ChronicleContext>
  )
}

export function useChronicle() {
  const context = use(ChronicleContext)
  if (!context) {
    throw new Error('useChronicle must be used within a ChronicleProvider')
  }
  return context
}

export function useChronicleLLM() {
  const context = use(ChronicleContext)

  if (!context) {
    return FALLBACK_CHRONICLE_LLM
  }

  const {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
    telemetryEvents,
    settings,
    updateSettings,
    sessionCostCents,
    costCapCents,
    remainingCostBudgetCents,
    isCostGuardrailActive,
    resetSessionCost,
    rolloutStage,
    canApplyAutomation,
    canUndoAutomation,
    canAutoApply,
    recordTelemetry,
  } = context

  return {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
    telemetryEvents,
    settings,
    updateSettings,
    sessionCostCents,
    costCapCents,
    remainingCostBudgetCents,
    isCostGuardrailActive,
    resetSessionCost,
    rolloutStage,
    canApplyAutomation,
    canUndoAutomation,
    canAutoApply,
    recordTelemetry,
  }
}

export function withChronicle<T extends object>(
  Component: React.ComponentType<T>,
) {
  return ({ ref, ...props }: T & { ref?: React.RefObject<unknown | null> }) => (
    <ChronicleProvider>
      <Component {...props} ref={ref} />
    </ChronicleProvider>
  )
}

export function useChronicleForDice() {
  const { emitDiceRoll } = useChronicle()
  return { chronicleDiceRoll: emitDiceRoll }
}

export function useChronicleForEquipment() {
  const { emitEquipmentAction } = useChronicle()
  return { chronicleEquipmentAction: emitEquipmentAction }
}

export function useChronicleForCombat() {
  const { emitCombatAction } = useChronicle()
  return { chronicleCombatAction: emitCombatAction }
}

export function useChroniclePrompt() {
  const { emitAction } = useChronicle()

  const promptForChronicle = useCallback(
    (
      message: string,
      actionType: ChronicleActionType = 'session_milestone',
      characterName?: string,
    ) => {
      emitAction({
        actionType,
        timestamp: new Date(),
        characterName,
        gameState: {
          currentScene: message,
        },
      })
    },
    [emitAction],
  )

  return { promptForChronicle }
}

/* eslint-enable react-refresh/only-export-components */
