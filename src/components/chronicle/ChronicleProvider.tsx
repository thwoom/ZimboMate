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
import type { ChronicleSettings } from '../../types/chronicle'
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { applyChronicleDeltaBundle } from '../../services/chronicle'
import { chronicleActionListener } from '../../services/ChronicleActionListenerService'
import { gpt5Client } from '../../services/llm'
import { useChronicleStore } from '../../stores/chronicleStore'
import { ChronicleOverlay } from './ChronicleOverlay'
import { computeSha256Hex } from '../../services/llm/hash'
import { getLlmRolloutStage, type LlmRolloutStage } from '@/utils/featureFlags'

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
  sessionCostCents: number
  costCapCents?: number
  remainingCostBudgetCents: number | null
  isCostGuardrailActive: boolean
  resetSessionCost: () => void
  rolloutStage: LlmRolloutStage
  canApplyAutomation: boolean
  canUndoAutomation: boolean
  canAutoApply: boolean
  recordTelemetry: (event: Partial<LlmTelemetryEvent>) => void
}

const ChronicleContext = createContext<ChronicleContextValue | null>(null)

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
  const sessionCostCents = useChronicleStore((state) => state.sessionCostCents)
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
    (event: Partial<LlmTelemetryEvent>) => {
      const usage = event.usage ?? ZERO_USAGE
      setLastTelemetryEvent({
        model: event.model ?? 'chronicle-delta-executor',
        latencyMs: event.latencyMs ?? 0,
        usage,
        costCents: event.costCents,
        stage: event.stage,
        outcome: event.outcome,
        bundleId: event.bundleId,
        entryId: event.entryId,
        error: event.error,
      })
    },
    [],
  )

  useEffect(() => {
    chronicleActionListener.setEnabled(isOverlayEnabled)
  }, [isOverlayEnabled])

  useEffect(() => {
    const offProgress = gpt5Client.onProgress(setLastProgressEvent)
    const offTelemetry = gpt5Client.onTelemetry((event) => {
      if (
        typeof event.costCents === 'number' &&
        Number.isFinite(event.costCents) &&
        event.costCents > 0
      ) {
        recordSessionCost(event.costCents, new Date().toISOString())
      }
      recordTelemetry(event)
    })

    return () => {
      offProgress()
      offTelemetry()
    }
  }, [recordSessionCost, recordTelemetry])

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
      try {
        if (isCostGuardrailActive) {
          const fallback = await buildGuardrailResponse(input)
          setLastProgressEvent({
            progress: 100,
            stage: 'cost_guardrail',
            message:
              'Cost guardrail reached; returning template narrative without contacting GPT-5.',
          })
          return fallback
        }

        const request: ProposeDeltasRequest = {
          ...input,
          settings: buildNarrativeSettings(),
        }

        return await gpt5Client.proposeDeltas(request)
      } finally {
        setIsProposing(false)
      }
    },
    [buildGuardrailResponse, buildNarrativeSettings, isCostGuardrailActive],
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
          costCents: 0,
          error: 'Automation is read-only in the current rollout stage.',
        })
        throw new Error(
          'Automation is read-only in the current rollout stage.',
        )
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
          stage: 'apply',
          outcome: 'skipped',
          bundleId: guardrailBundleId,
          entryId: payload.bundle.entryId,
          usage: ZERO_USAGE,
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
        recordTelemetry({
          usage: payload.bundle.usage ?? ZERO_USAGE,
          stage: 'apply',
          outcome: 'failure',
          bundleId:
            payload.bundle.idempotencyKey ?? payload.bundle.entryId ?? undefined,
          entryId: payload.bundle.entryId,
          error: error instanceof Error ? error.message : 'Unknown error',
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
  const {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
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
  } = useChronicle()

  return {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
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


