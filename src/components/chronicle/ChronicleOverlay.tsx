/**
 * Chronicle Overlay System
 *
 * A floating overlay system that displays contextual Chronicle prompts
 * based on user actions throughout the app. Features elegant animations,
 * smart positioning, and integration with the action listener system.
 */

import type { ChroniclePrompt } from '../../services/ChronicleActionListenerService'
import type { MentionHighlight, ResourceChangeDisplay } from './highlightUtils'
import type { DeltaOperation } from '@/services/llm'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AtSign,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Link2,
  Feather,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Target,
  X,
  Zap,
} from 'lucide-react'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { isLlmUnifiedEnabled } from '@/utils/featureFlags'
import {
  describeDeltaOperation as formatDeltaOperation,
  undoChronicleBundle,
} from '@/services/chronicle'
import { useCharacterStore } from '@/stores/characterStore'
import { useChronicleStore } from '@/stores/chronicleStore'
import { chronicleActionListener } from '../../services/ChronicleActionListenerService'
import { contextIntelligence } from '../../services/ChronicleContextIntelligence'
import { useChronicleLLM } from './ChronicleProvider'
import { DeltaChecklist } from './DeltaChecklist'
import {
  buildMentionContext,
  collectMentionHighlights,
  collectResourceChanges,
  describeResourceChange,
  EMPTY_RESOURCE_HISTORY,
  formatActorLabel,
  formatRelativeTimeFromNow,
} from './highlightUtils'

const ZERO_USAGE = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
}
interface ChronicleOverlayProps {
  isEnabled?: boolean
  maxPrompts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

interface PromptOverlayState {
  prompts: ChroniclePrompt[]
  isVisible: boolean
}

type PromptOverlayAction =
  | { type: 'sync'; prompts: ChroniclePrompt[] }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

const arePromptsEqual = (
  current: ChroniclePrompt[],
  next: ChroniclePrompt[],
) => {
  if (current.length !== next.length) {
    return false
  }

  return current.every((prompt, index) => prompt.id === next[index]?.id)
}



const promptOverlayReducer = (
  state: PromptOverlayState,
  action: PromptOverlayAction,
): PromptOverlayState => {
  switch (action.type) {
    case 'sync': {
      const nextPrompts = action.prompts
      const nextVisibility = nextPrompts.length > 0

      if (
        arePromptsEqual(state.prompts, nextPrompts) &&
        state.isVisible === nextVisibility
      ) {
        return state
      }

      return {
        prompts: nextPrompts,
        isVisible: nextVisibility,
      }
    }

    case 'remove': {
      const nextPrompts = state.prompts.filter(
        (prompt) => prompt.id !== action.id,
      )

      if (nextPrompts.length === state.prompts.length) {
        return state
      }

      return {
        prompts: nextPrompts,
        isVisible: nextPrompts.length > 0,
      }
    }

    case 'clear': {
      if (state.prompts.length === 0 && !state.isVisible) {
        return state
      }

      return {
        prompts: [],
        isVisible: false,
      }
    }

    default:
      return state
  }
}

// Individual prompt card component
const ChroniclePromptCard: React.FC<{
  prompt: ChroniclePrompt
  index: number
  onAccept: (
    promptId: string,
    selectedEntry: string,
    customText?: string,
  ) => void
  onDismiss: (promptId: string) => void
}> = ({ prompt, index, onAccept, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(() => prompt.priority === 'high')
  const [customText, setCustomText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Auto-dismiss after expiration
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt.expiresAt < new Date()) {
        onDismiss(prompt.id)
      }
    }, prompt.expiresAt.getTime() - Date.now())

    return () => clearTimeout(timer)
  }, [prompt.expiresAt, prompt.id, onDismiss])

  const handleAccept = (entry?: string) => {
    const finalText = customText.trim() || entry || ''
    if (finalText) {
      onAccept(prompt.id, finalText, customText.trim() ? customText : undefined)
    }
  }

  const handleQuickInsert = (suggestion: string) => {
    setCustomText((prev) => {
      if (!prev.trim()) return suggestion
      return (
        prev +
        (prev.endsWith('.') || prev.endsWith('!') || prev.endsWith('?')
          ? ' '
          : '. ') +
        suggestion
      )
    })
  }

  const getPriorityIcon = () => {
    switch (prompt.priority) {
      case 'high':
        return <Zap size={16} className='text-chart-4' />
      case 'medium':
        return <Target size={16} className='text-primary' />
      case 'low':
        return <Clock size={16} className='text-muted-foreground' />
    }
  }

  const getPriorityColor = () => {
    switch (prompt.priority) {
      case 'high':
        return 'from-orange-400 to-red-500'
      case 'medium':
        return 'from-primary to-indigo-500'
      case 'low':
        return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: index * 0.1,
      }}
      className={`
        bg-card
        border border-border
        rounded-lg shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-[400px]
        ${prompt.priority === 'high' ? 'ring-2 ring-chart-4/30 ' : ''}
      `}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-3 border-b border-border'>
        <div className='flex items-center gap-2'>
          {getPriorityIcon()}
          <div
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${getPriorityColor()}`}
          />
          <span className='text-sm font-medium text-foreground '>
            Chronicle This?
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-1 hover:bg-muted hover:bg-muted rounded'
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDismiss(prompt.id)}
            className='p-1 hover:bg-muted hover:bg-muted rounded text-muted-foreground'
          >
            <X size={14} />
          </motion.button>
        </div>
      </div>

      {/* Prompt Text */}
      <div className='p-3'>
        <p className='text-sm text-foreground  leading-relaxed'>
          {prompt.promptText}
        </p>
      </div>

      {/* Primary Text Input Area (always visible when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-3 pb-3 space-y-3'>
              {/* Main Text Input */}
              <div className='space-y-2'>
                <label className='text-xs font-medium text-foreground '>
                  What happened?
                </label>
                <div className='relative'>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder='Describe what happened in this moment...'
                    autoFocus
                    className='
                      w-full h-24 p-3 text-sm
                      border-2 border-primary/30
                      rounded-lg resize-none
                      bg-card
                      focus:ring-2 focus:ring-primary/40 focus:border-primary/40
                      placeholder-muted-foreground placeholder-muted-foreground
                    '
                  />
                  {customText.length > 0 && (
                    <div className='absolute top-2 right-2'>
                      <span className='text-xs text-muted-foreground'>
                        {customText.length} chars
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Suggestions - Compact Pills */}
              {prompt.suggestedEntries &&
                prompt.suggestedEntries.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <label className='text-xs font-medium text-muted-foreground '>
                        Quick additions
                      </label>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className='text-xs text-primary hover:text-primary'
                      >
                        {showSuggestions ? 'Hide' : 'Show'} (
                        {prompt.suggestedEntries.length})
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className='flex flex-wrap gap-2'
                        >
                          {prompt.suggestedEntries.slice(0, 4).map((entry) => (
                            <motion.button
                              key={`${prompt.id}-${entry}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickInsert(entry)}
                              className='
                              px-2 py-1 text-xs
                              bg-primary/10 hover:bg-primary/10
                              border border-primary/30
                              rounded-full transition-colors
                              text-primary
                              max-w-32 truncate
                            '
                              title={entry}
                            >
                              + {entry}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              {/* Action Buttons */}
              <div className='flex gap-2 pt-2'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAccept()}
                  disabled={!customText.trim()}
                  className='
                    flex-1 px-4 py-2 text-sm font-medium
                    bg-primary hover:bg-primary/80
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    text-white rounded-lg transition-colors
                    flex items-center justify-center gap-2
                  '
                >
                  <BookOpen size={14} />
                  Chronicle It
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDismiss(prompt.id)}
                  className='
                    px-3 py-2 text-sm font-medium
                    bg-muted hover:bg-muted text-foreground
                    rounded-lg transition-colors
                  '
                >
                  Skip
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions (when collapsed) */}
      {!isExpanded && (
        <div className='flex gap-2 p-3 pt-0'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            className='
              flex-1 px-3 py-2 text-xs font-medium
              bg-primary hover:bg-primary/80 text-white
              rounded transition-colors
              flex items-center justify-center gap-1
            '
          >
            <Feather size={12} />
            Write Entry
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDismiss(prompt.id)}
            className='
              px-3 py-2 text-xs font-medium
              bg-muted hover:bg-muted text-foreground
               hover:bg-muted
              rounded transition-colors
            '
          >
            Skip
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// Main Chronicle Overlay component
export const ChronicleOverlay: React.FC<ChronicleOverlayProps> = ({
  isEnabled = true,
  maxPrompts = 2,
  position = 'top-right',
  className = '',
}) => {
  const {
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
    canUndoAutomation,
    recordTelemetry,
  } = useChronicleLLM()
  const llmUnifiedEnabled = useMemo(() => isLlmUnifiedEnabled(), [])
  const deltaHistory = useChronicleStore((state) => state.deltaHistory)
  const clearDeltaLog = useChronicleStore((state) => state.clearDeltaLog)
  const auditLog = useChronicleStore((state) => state.auditLog)
  const clearAuditLog = useChronicleStore((state) => state.clearAuditLog)
  const pendingBundle = useChronicleStore((state) => state.pendingDeltaBundle)
  const entities = useChronicleStore((state) => state.entities)
  const resourceHistory = useChronicleStore(
    (state) => state.resourceHistory ?? EMPTY_RESOURCE_HISTORY,
  )
  const getEntry = useChronicleStore((state) => state.getEntry)
  const setSelectedEntity = useChronicleStore((state) => state.setSelectedEntity)
  const incrementWikiView = useChronicleStore((state) => state.incrementWikiView)
  const getLinkedEntities = useChronicleStore((state) => state.getLinkedEntities)
  const relationshipsVersion = useChronicleStore((state) =>
    state.relationships
      .map((relationship) => `${relationship.id}:${relationship.lastUpdated ?? ''}`)
      .join('|'),
  )
  const getCharacter = useCharacterStore((state) => state.getCharacter)
  const [undoingBundleId, setUndoingBundleId] = useState<string | null>(null)
  const [tauriGuardDismissed, setTauriGuardDismissed] = useState(false)
  const [isAuditExpanded, setIsAuditExpanded] = useState(false)
  const [promptState, dispatchPromptState] = useReducer(promptOverlayReducer, {
    prompts: [],
    isVisible: false,
  })
  const { prompts: activePrompts, isVisible } = promptState

  const tauriBridge = (
    typeof window !== 'undefined'
      ? (window as typeof window & { __TAURI__?: unknown })
      : undefined
  )

  const isTauriRuntime = Boolean(tauriBridge?.__TAURI__)

  const showTauriGuard = !isTauriRuntime && !tauriGuardDismissed

  const visibleAuditEntries = useMemo(() => {
    const limit = isAuditExpanded ? Math.min(12, auditLog.length) : Math.min(5, auditLog.length)
    return auditLog.slice(0, limit)
  }, [auditLog, isAuditExpanded])

  const hasMoreAuditEntries = auditLog.length > visibleAuditEntries.length
  const canToggleAuditEntries = auditLog.length > 5 || isAuditExpanded

  const pendingRequestedAt = useMemo(() => {
    if (!pendingBundle?.requestedAt) {
      return undefined
    }
    const date = new Date(pendingBundle.requestedAt)
    return Number.isNaN(date.getTime()) ? undefined : date
  }, [pendingBundle?.requestedAt])

  const pendingRelative = useMemo(
    () => (pendingRequestedAt ? formatRelativeTimeFromNow(pendingRequestedAt) : undefined),
    [pendingRequestedAt],
  )

  const latestAutomation = deltaHistory.length > 0 ? deltaHistory[0] : null
  const latestEntry = useMemo(
    () => (latestAutomation ? getEntry(latestAutomation.entryId) : undefined),
    [latestAutomation, getEntry],
  )
  const describeDeltaOperation = useCallback((op: DeltaOperation) => {
    return formatDeltaOperation(op)
  }, [])

  const mentionHighlights = useMemo<MentionHighlight[]>(() => {

    if (!latestAutomation) return []

    return collectMentionHighlights(latestAutomation, entities).slice(0, 3)

  }, [entities, latestAutomation])

  const linkedMentionEdges = useMemo(() => {
    if (mentionHighlights.length === 0) {
      return new Map<string, ReturnType<typeof getLinkedEntities>>()
    }

    const toTimestamp = (value: Date | string | undefined) => {
      if (!value) return 0
      const date = value instanceof Date ? value : new Date(value)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    const map = new Map<string, ReturnType<typeof getLinkedEntities>>()

    mentionHighlights.forEach((highlight) => {
      const edges = getLinkedEntities(highlight.entityId).filter(
        (edge) => edge.entity && edge.otherEntityId !== highlight.entityId,
      )
      if (edges.length === 0) return

      const sorted = [...edges].sort(
        (a, b) =>
          toTimestamp(b.relationship.lastUpdated) -
          toTimestamp(a.relationship.lastUpdated),
      )
      map.set(highlight.entityId, sorted)
    })

    return map
  }, [getLinkedEntities, mentionHighlights, relationshipsVersion])

  const resolveCharacterName = useCallback(
    (characterId?: string | null) => {
      if (!characterId) return 'Unknown adventurer'

      const character = getCharacter(characterId)

      return character?.name ?? characterId
    },

    [getCharacter],
  )

  const bundleResourceChanges = useMemo(() => {
    return collectResourceChanges(latestAutomation, resourceHistory)
  }, [latestAutomation, resourceHistory])

  const handleEntityNavigate = useCallback(
    (entityId: string) => {
      setSelectedEntity(entityId)
      incrementWikiView(entityId)
    },
    [incrementWikiView, setSelectedEntity],
  )

  const resourceChangeDisplay = useMemo<ResourceChangeDisplay[]>(() => {
    if (!latestAutomation || bundleResourceChanges.length === 0) {
      return []
    }

    return bundleResourceChanges

      .slice(0, 5)

      .map((entry) => describeResourceChange(entry, resolveCharacterName))

      .filter((change): change is ResourceChangeDisplay => change !== null)
  }, [bundleResourceChanges, latestAutomation, resolveCharacterName])

  const mentionContextFallback = useMemo(
    () => latestEntry?.rawText ?? '',

    [latestEntry],
  )
  const automationStatus = useMemo(() => {
    if (isApplyingBundle) {
      return {
        label: 'Applying updates',
        message: 'Recording Chronicle deltas…',
        toneClass: 'bg-primary/10 text-primary border border-primary/30',
      }
    }

    if (isProposing) {
      return {
        label: 'Drafting entry',
        message: lastProgressEvent?.text ?? 'GPT-5 is parsing the latest note.',
        toneClass: 'bg-muted text-muted-foreground border border-border/60',
      }
    }

    if (lastProgressEvent) {
      return {
        label: lastProgressEvent.stage.replaceAll('_', ' '),
        message: lastProgressEvent.text,
        toneClass: 'bg-muted text-muted-foreground border border-border/60',
      }
    }

    if (lastTelemetryEvent) {
      const latency = `${Math.round(lastTelemetryEvent.latencyMs)}ms`
      return {
        label: 'Automation ready',
        message: `${latency}, ${lastTelemetryEvent.usage.totalTokens} tokens`,
        toneClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      }
    }

    return null
  }, [isApplyingBundle, isProposing, lastProgressEvent, lastTelemetryEvent])


  const latestActorLabel = useMemo(
    () => (latestAutomation ? formatActorLabel(latestAutomation.actor) : ''),
    [latestAutomation],
  )

  const latestAutomationStatusBadge = useMemo(() => {
    if (!latestAutomation?.status) return null
    type StatusKey = 'pending' | 'applied' | 'undone' | 'failed'
    const status = latestAutomation.status as StatusKey
    const statusConfig: Record<
      StatusKey,
      { label: string; variant: 'success' | 'warning' | 'outline' | 'destructive' | 'secondary' }
    > = {
      pending: { label: 'Pending', variant: 'warning' },
      applied: { label: 'Applied', variant: 'success' },
      undone: { label: 'Undone', variant: 'outline' },
      failed: { label: 'Failed', variant: 'destructive' },
    }
    const config = statusConfig[status] ?? { label: status, variant: 'secondary' }
    return (
      <Badge variant={config.variant} className='text-[9px] uppercase tracking-wide'>
        {config.label}
      </Badge>
    )
  }, [latestAutomation?.status])

  const statusChip = useMemo(() => {
    if (!automationStatus) return null

    return (
      <div
        className={`text-xs rounded-full px-3 py-1 font-medium flex flex-col sm:flex-row sm:items-center gap-1 ${automationStatus.toneClass}`}
      >
        <span>{automationStatus.label}</span>
        {automationStatus.message && (
          <span className='text-[11px] sm:text-xs font-normal text-muted-foreground'>
            {automationStatus.message}
          </span>
        )}
      </div>
    )
  }, [automationStatus])

  // Subscribe to action listener for new prompts
  useEffect(() => {
    if (!isEnabled) return

    const updatePrompts = () => {
      const prompts = chronicleActionListener.getActivePrompts()
      dispatchPromptState({
        type: 'sync',
        prompts: prompts.slice(0, maxPrompts),
      })
    }

    // Initial load
    updatePrompts()

    // Set up polling for prompt updates (in a real implementation, this would be event-driven)
    const interval = setInterval(updatePrompts, 1000)
    return () => clearInterval(interval)
  }, [isEnabled, maxPrompts])

  const handleAcceptPrompt = useCallback(
    (promptId: string, selectedEntry: string, customText?: string) => {
      chronicleActionListener.acceptPrompt(promptId, selectedEntry, customText)

      // Remove from local state
      dispatchPromptState({ type: 'remove', id: promptId })

      // Record user behavior for learning
      contextIntelligence.recordUserBehavior(
        activePrompts.find((p) => p.id === promptId)?.actionContext
          .actionType || 'dice_roll',
        true,
        Date.now(), // Would calculate actual response time
        customText || selectedEntry,
      )
    },
    [activePrompts],
  )

  const handleDismissPrompt = useCallback(
    (promptId: string) => {
      chronicleActionListener.dismissPrompt(promptId)

      // Remove from local state
      dispatchPromptState({ type: 'remove', id: promptId })

      // Record dismissal for learning
      contextIntelligence.recordUserBehavior(
        activePrompts.find((p) => p.id === promptId)?.actionContext
          .actionType || 'dice_roll',
        false,
        Date.now(),
        '',
      )
    },
    [activePrompts],
  )

  const handleUndoAutomation = useCallback(
    async (bundleId: string) => {
      if (!canUndoAutomation) return
      const targetAutomation = deltaHistory.find(
        (entry) => entry.bundleId === bundleId,
      )
      const entryId = targetAutomation?.entryId
      const undoStart =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
          ? performance.now()
          : Date.now()

      setUndoingBundleId(bundleId)
      try {
        const success = await undoChronicleBundle(bundleId, { actor: 'user' })
        const undoEnd =
          typeof performance !== 'undefined' &&
          typeof performance.now === 'function'
            ? performance.now()
            : Date.now()
        const latencyMs = Math.max(0, Math.round(undoEnd - undoStart))

        if (!success) {
          console.warn(`[chronicle] Unable to undo bundle ${bundleId}`)
          recordTelemetry({
            stage: 'undo',
            outcome: 'failure',
            bundleId,
            entryId,
            latencyMs,
            usage: ZERO_USAGE,
            costCents: 0,
            error: 'Undo rejected by executor',
          })
          return
        }
        clearDeltaLog(bundleId)
        recordTelemetry({
          stage: 'undo',
          outcome: 'success',
          bundleId,
          entryId,
          latencyMs,
          usage: ZERO_USAGE,
          costCents: 0,
        })
      } catch (error) {
        console.error('[chronicle] Undo bundle failed', error)
        const undoEnd =
          typeof performance !== 'undefined' &&
          typeof performance.now === 'function'
            ? performance.now()
            : Date.now()
        const latencyMs = Math.max(0, Math.round(undoEnd - undoStart))
        recordTelemetry({
          stage: 'undo',
          outcome: 'failure',
          bundleId,
          entryId,
          latencyMs,
          usage: ZERO_USAGE,
          costCents: 0,
          error: error instanceof Error ? error.message : 'Unknown undo error',
        })
      } finally {
        setUndoingBundleId(null)
      }
    },
    [canUndoAutomation, clearDeltaLog, deltaHistory, recordTelemetry],
  )

  const handleDismissAutomation = useCallback(
    (bundleId: string) => {
      clearDeltaLog(bundleId)
    },
    [clearDeltaLog],
  )

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const hasAutomationCard = Boolean(latestAutomation)

  if (!isEnabled || (!hasAutomationCard && !isVisible)) {
    return null
  }

  return (
    <div
      className={`fixed ${getPositionClasses()} z-[var(--layer-popover)] pointer-events-none ${className}`}
    >
      <div className='flex flex-col gap-3 pointer-events-auto'>
        {showTauriGuard && (
          <Alert variant='destructive' className='border-destructive/40 bg-destructive/10'>
            <ShieldAlert className='h-4 w-4 text-destructive' />
            <AlertTitle className='text-sm font-semibold text-destructive'>
              Desktop bridge unavailable
            </AlertTitle>
            <AlertDescription className='space-y-2 text-xs text-destructive/90'>
              <p>
                Chronicle automations need the Tauri desktop bridge. Launch the desktop shell to enable live Chronicle updates.
              </p>
              <div className='flex flex-wrap items-center gap-2 text-[11px] text-destructive'>
                <span className='rounded bg-destructive/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide'>
                  npm run dev:tauri
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-7 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                  onClick={() => setTauriGuardDismissed(true)}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {pendingBundle && (
          <Alert className='border-primary/50 bg-primary/5 shadow-sm'>
            <Loader2 className='h-4 w-4 animate-spin text-primary' />
            <AlertTitle className='flex items-center gap-2 text-sm font-semibold text-primary'>
              Chronicle bundle pending
              {isApplyingBundle && (
                <Badge variant='outline' className='text-[9px] uppercase tracking-wide text-primary'>
                  applying
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className='space-y-2 text-xs text-muted-foreground'>
              <div className='flex flex-wrap items-center gap-2 text-[11px] font-medium text-foreground'>
                <span>Entry {pendingBundle.entryId ?? '\u2014'}</span>
                {pendingBundle.bundleId && (
                  <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                    #{pendingBundle.bundleId.slice(-6)}
                  </Badge>
                )}
              </div>
              <p>
                {pendingBundle.autoApply
                  ? 'Auto-apply is enabled. The bundle will commit as soon as GPT-5 finishes.'
                  : 'Review the proposed changes in Chronicle to continue.'}
              </p>
              <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground'>
                <Clock size={11} />
                <span>{pendingRequestedAt ? pendingRequestedAt.toLocaleTimeString() : 'Awaiting timestamp'}</span>
                {pendingRelative && (
                  <>
                    <span aria-hidden='true'>&bull;</span>
                    <span>{pendingRelative}</span>
                  </>
                )}
              </div>
              {isApplyingBundle && (
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
                  <span>
                    {lastProgressEvent?.message ??
                      (typeof lastProgressEvent?.progress === 'number'
                        ? `Applying bundle (${Math.round(lastProgressEvent.progress)}%)`
                        : 'Applying bundle...')}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        {llmUnifiedEnabled ? statusChip : null}
        {llmUnifiedEnabled && latestAutomation && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className='bg-card border border-border rounded-lg shadow-lg p-3 flex flex-col max-h-[calc(100vh-12rem)] min-h-0'
          >
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  Latest Chronicle Update
                </p>
                <p className='text-xs text-muted-foreground'>
                  Entry {latestAutomation.entryId} -{' '}
                  {new Date(latestAutomation.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className='flex flex-col items-end gap-1 text-[10px] uppercase tracking-wide text-muted-foreground'>
                {latestAutomationStatusBadge}
                <span className='text-muted-foreground'>
                  {latestAutomation.appliedOps.length} applied
                  {latestAutomation.skippedOps.length > 0
                    ? ` - ${latestAutomation.skippedOps.length} skipped`
                    : ''}
                </span>
                {latestActorLabel && (
                  <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                    {latestActorLabel}
                  </Badge>
                )}
              </div>
            </div>
            <div className='mt-3 flex-1 overflow-y-auto space-y-3 pr-1 pb-3 min-h-0'>
              <div className='space-y-2'>
                {latestAutomation.appliedOps.length > 0 ? (
                  <DeltaChecklist
                    operations={latestAutomation.appliedOps}
                    renderDescription={describeDeltaOperation}
                    variant='readOnly'
                    size='compact'
                    showRuleReference
                    className='space-y-1'
                    itemClassName='bg-transparent border-border/40'
                  />
                ) : latestAutomation.status === 'pending' ? (
                  <div className='rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-xs text-muted-foreground'>
                    Applying bundle&hellip; updates will appear once the executor responds.
                  </div>
                ) : null}
                {latestAutomation.status === 'failed' && latestAutomation.error && (
                  <Alert variant='destructive' className='border-border/50 bg-destructive/10'>
                    <AlertTitle className='text-xs font-semibold'>
                      Automation failed
                    </AlertTitle>
                    <AlertDescription className='text-xs leading-relaxed'>
                      {latestAutomation.error}
                    </AlertDescription>
                  </Alert>
                )}
                {mentionHighlights.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      <AtSign size={12} /> Latest mentions
                    </div>
                    <div className='space-y-2'>
                      {mentionHighlights.map((highlight) => {
                        const linkedEdges =
                          linkedMentionEdges.get(highlight.entityId) ?? []
                        const visibleLinkedEdges = linkedEdges.slice(0, 3)
                        const hiddenLinkCount =
                          linkedEdges.length - visibleLinkedEdges.length

                        return (
                          <div
                            role='button'
                            tabIndex={0}
                            key={`${highlight.entityId}-${highlight.record.entryId}-${highlight.record.createdAt}`}
                            onClick={() => handleEntityNavigate(highlight.entityId)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                handleEntityNavigate(highlight.entityId)
                              }
                            }}
                            className='w-full cursor-pointer rounded-md border border-border/40 bg-muted/20 p-2 text-left text-xs leading-snug transition-colors hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30'
                          >
                            <div className='flex items-center gap-2 font-semibold text-foreground'>
                              <span>{highlight.entityName}</span>
                              <Badge
                                variant='outline'
                                className='text-[10px] uppercase tracking-wide'
                              >
                                {highlight.entityType}
                              </Badge>
                            </div>
                            <div className='mt-1 text-muted-foreground'>
                              {buildMentionContext(
                                highlight.record,
                                mentionContextFallback,
                              )}
                            </div>
                            {linkedEdges.length > 0 && (
                              <div className='mt-2 space-y-1'>
                                <div className='flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                                  <Link2 size={11} /> Linked entities
                                </div>
                                <div className='flex flex-wrap items-center gap-1'>
                                  {visibleLinkedEdges.map((edge) => {
                                    const linkedEntityName =
                                      edge.entity?.name ?? edge.otherEntityId
                                    const relationship = edge.relationship
                                    const updatedAt =
                                      relationship.lastUpdated instanceof Date
                                        ? relationship.lastUpdated
                                        : relationship.lastUpdated
                                        ? new Date(relationship.lastUpdated)
                                        : null
                                    const relativeUpdated =
                                      updatedAt && !Number.isNaN(updatedAt.getTime())
                                        ? formatRelativeTimeFromNow(updatedAt)
                                        : null
                                    const confidence =
                                      typeof relationship.confidence === 'number'
                                        ? `${Math.round(relationship.confidence * 100)}%`
                                        : undefined
                                    const relationshipStatus =
                                      (relationship as { status?: string }).status ??
                                      relationship.currentStatus

                                    return (
                                      <HoverCard
                                        key={`${highlight.entityId}-${edge.relationship.id}`}
                                      >
                                        <HoverCardTrigger asChild>
                                          <button
                                            type='button'
                                            onClick={(event) => {
                                              event.stopPropagation()
                                              handleEntityNavigate(edge.otherEntityId)
                                            }}
                                            className='inline-flex items-center gap-1 rounded-full border border-border/40 bg-card/80 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30'
                                            aria-label={`Open ${linkedEntityName}`}
                                          >
                                            <span className='font-medium text-foreground'>
                                              {linkedEntityName}
                                            </span>
                                            <Badge
                                              variant='outline'
                                              className='text-[9px] uppercase tracking-wide'
                                            >
                                              {relationship.type}
                                            </Badge>
                                          </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className='w-72 space-y-2 text-left'>
                                          <div className='flex items-center justify-between gap-2'>
                                            <span className='text-sm font-semibold text-foreground'>
                                              {linkedEntityName}
                                            </span>
                                            <Badge
                                              variant='outline'
                                              className='text-[10px] uppercase tracking-wide'
                                            >
                                              {relationship.type}
                                            </Badge>
                                          </div>
                                          <div className='grid gap-1 text-[11px] text-muted-foreground'>
                                            {relationshipStatus && (
                                              <div className='flex items-center justify-between'>
                                                <span>Status</span>
                                                <span className='uppercase tracking-wide'>
                                                  {relationshipStatus}
                                                </span>
                                              </div>
                                            )}
                                            {typeof relationship.strength === 'number' && (
                                              <div className='flex items-center justify-between'>
                                                <span>Strength</span>
                                                <span>{relationship.strength}</span>
                                              </div>
                                            )}
                                            {confidence && (
                                              <div className='flex items-center justify-between'>
                                                <span>Confidence</span>
                                                <span>{confidence}</span>
                                              </div>
                                            )}
                                            {relativeUpdated && (
                                              <div className='flex items-center justify-between'>
                                                <span>Last updated</span>
                                                <span>{relativeUpdated}</span>
                                              </div>
                                            )}
                                          </div>
                                          {relationship.description && (
                                            <p className='text-xs leading-snug text-foreground'>
                                              {relationship.description}
                                            </p>
                                          )}
                                        </HoverCardContent>
                                      </HoverCard>
                                    )
                                  })}
                                  {hiddenLinkCount > 0 && (
                                    <span className='text-[10px] text-muted-foreground/80'>
                                      +{hiddenLinkCount} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {resourceChangeDisplay.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      <Coins size={12} /> Resource updates
                    </div>
                    <div className='space-y-1'>
                      {resourceChangeDisplay.map(
                        ({ key, Icon, colorClass, message, detail }) => (
                          <div
                            key={key}
                            className='flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/10 px-2 py-1 text-xs'
                          >
                            <div className='flex items-center gap-2 text-foreground'>
                              <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
                              <span>{message}</span>
                            </div>
                            {detail && (
                              <span className='text-muted-foreground'>
                                {detail}
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
              {latestAutomation.skippedOps.length > 0 && (
                <Alert className='border-border/50 bg-muted/20'>
                  <AlertTitle className='text-xs font-semibold'>
                    Skipped
                  </AlertTitle>
                  <AlertDescription className='text-xs'>
                    <DeltaChecklist
                      operations={latestAutomation.skippedOps}
                      renderDescription={describeDeltaOperation}
                      variant='readOnly'
                      size='compact'
                      showRuleReference
                      className='space-y-1'
                      itemClassName='bg-transparent border-none p-0'
                    />
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className='mt-3 flex flex-wrap items-center gap-2'>
              {canUndoAutomation && latestAutomation.status === 'applied' && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    void handleUndoAutomation(latestAutomation.bundleId)
                  }
                  disabled={undoingBundleId === latestAutomation.bundleId}
                  className='gap-1'
                >
                  {undoingBundleId === latestAutomation.bundleId ? (
                    <>
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      Undoing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className='h-3.5 w-3.5' />
                      Undo
                    </>
                  )}
                </Button>
              )}
              <Button
                size='sm'
                variant='ghost'
                onClick={() =>
                  handleDismissAutomation(latestAutomation.bundleId)
                }
                disabled={undoingBundleId === latestAutomation.bundleId}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
        {visibleAuditEntries.length > 0 && (
          <div className='rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                <BookOpen size={12} />
                Audit history
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                  Showing {visibleAuditEntries.length} of {auditLog.length}
                </span>
                {(canToggleAuditEntries || hasMoreAuditEntries) && (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => setIsAuditExpanded((prev) => !prev)}
                    className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {isAuditExpanded
                      ? 'Show less'
                      : `Show more (+${Math.max(auditLog.length - visibleAuditEntries.length, 0)})`}
                  </Button>
                )}
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => clearAuditLog()}
                  disabled={auditLog.length === 0}
                  className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors'
                >
                  Clear audit
                </Button>
              </div>
            </div>
            <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
              {visibleAuditEntries.map((entry) => {
                const timestamp = new Date(entry.timestamp)
                const relativeLabel = formatRelativeTimeFromNow(timestamp)
                const bundleLabel = entry.bundleId
                  ? `#${entry.bundleId.slice(-6)}`
                  : undefined
                return (
                  <div
                    key={entry.id}
                    className='flex items-start justify-between gap-3 rounded-md border border-border/40 bg-card/70 px-2.5 py-2 text-xs'
                  >
                    <div className='space-y-1'>
                      <div className='flex flex-wrap items-center gap-2 font-semibold text-foreground'>
                        <Badge
                          variant={
                            entry.action === 'failed'
                              ? 'destructive'
                              : entry.action === 'applied'
                                ? 'success'
                                : 'outline'
                          }
                          className='text-[9px] uppercase tracking-wide'
                        >
                          {entry.action === 'applied'
                            ? 'Bundle applied'
                            : entry.action === 'undone'
                              ? 'Bundle undone'
                              : 'Bundle failed'}
                        </Badge>
                        {bundleLabel && (
                          <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                            {bundleLabel}
                          </Badge>
                        )}
                      </div>
                      <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground'>
                        <Clock size={11} />
                        <span>{timestamp.toLocaleTimeString()}</span>
                        <span aria-hidden='true'>&bull;</span>
                        <span>{relativeLabel}</span>
                      </div>
                      {entry.reason && (
                        <p className='text-[11px] text-muted-foreground/90'>{entry.reason}</p>
                      )}
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                        {formatActorLabel(entry.actor)}
                      </Badge>
                      <span className='text-[10px] text-muted-foreground'>
                        {entry.appliedOps.length} applied / {entry.skippedOps.length} skipped
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <AnimatePresence mode='popLayout'>
          {activePrompts.map((prompt, index) => (
            <ChroniclePromptCard
              key={prompt.id}
              prompt={prompt}
              index={index}
              onAccept={handleAcceptPrompt}
              onDismiss={handleDismissPrompt}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Hook for easy integration

export default ChronicleOverlay
