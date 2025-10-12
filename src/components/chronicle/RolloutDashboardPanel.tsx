import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react'

import type { ChronicleTelemetryEventLog } from '@/types/chronicle'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/ui'
import { formatRelativeTimeFromNow } from './highlightUtils'
import {
  getRolloutTelemetryHistory,
  subscribeRolloutTelemetry,
} from '@/utils/rolloutTelemetry'

type TelemetryStage = ChronicleTelemetryEventLog['stage']
type TelemetryOutcome = ChronicleTelemetryEventLog['outcome']

const MAX_EVENTS = 50

const STAGE_LABELS: Record<TelemetryStage, string> = {
  propose: 'Propose',
  apply: 'Apply',
  undo: 'Undo',
  guardrail: 'Guardrail',
}

const OUTCOME_VARIANTS: Record<TelemetryOutcome, 'success' | 'warning' | 'destructive'> =
  {
    success: 'success',
    skipped: 'warning',
    failure: 'destructive',
  }

function formatUsd(cents?: number | null): string | null {
  if (typeof cents !== 'number' || Number.isNaN(cents)) return null
  return `$${(cents / 100).toFixed(2)}`
}

function formatLatency(latencyMs: number): string {
  if (!Number.isFinite(latencyMs)) return '—'
  if (latencyMs >= 1000) {
    return `${(latencyMs / 1000).toFixed(1)}s`
  }
  return `${Math.round(latencyMs)} ms`
}

interface DashboardSummary {
  stageCounts: Record<TelemetryStage, number>
  outcomeCounts: Record<TelemetryOutcome, number>
  averageLatency: number
  totalCostCents: number
  latestEvent?: ChronicleTelemetryEventLog
}

function buildSummary(
  events: ChronicleTelemetryEventLog[],
): DashboardSummary {
  const stageCounts: DashboardSummary['stageCounts'] = {
    propose: 0,
    apply: 0,
    undo: 0,
    guardrail: 0,
  }
  const outcomeCounts: DashboardSummary['outcomeCounts'] = {
    success: 0,
    failure: 0,
    skipped: 0,
  }

  let latencyTotal = 0
  let costTotal = 0
  let costSamples = 0

  events.forEach((event) => {
    stageCounts[event.stage] += 1
    outcomeCounts[event.outcome] += 1
    latencyTotal += event.latencyMs
    if (typeof event.costCents === 'number') {
      costTotal += event.costCents
      costSamples += 1
    }
  })

  return {
    stageCounts,
    outcomeCounts,
    averageLatency:
      events.length > 0 ? latencyTotal / events.length : 0,
    totalCostCents: costSamples > 0 ? costTotal : 0,
    latestEvent: events[0],
  }
}

export const RolloutDashboardPanel: React.FC = () => {
  const [events, setEvents] = useState<ChronicleTelemetryEventLog[]>(() =>
    getRolloutTelemetryHistory(MAX_EVENTS),
  )
  const [stageFilter, setStageFilter] = useState<TelemetryStage | 'all'>('all')
  const [outcomeFilter, setOutcomeFilter] =
    useState<TelemetryOutcome | 'all'>('all')
  const [copyState, setCopyState] =
    useState<'idle' | 'copied' | 'error'>('idle')
  const [, startTransition] = useTransition()

  useEffect(() => {
    const unsubscribe = subscribeRolloutTelemetry(
      (event) => {
        startTransition(() => {
          setEvents((current) => {
            const withoutDuplicate = current.filter(
              (existing) => existing.id !== event.id,
            )
            return [event, ...withoutDuplicate].slice(0, MAX_EVENTS)
          })
        })
      },
      { replay: true, replayLimit: MAX_EVENTS },
    )

    return () => {
      unsubscribe()
    }
  }, [startTransition])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (stageFilter !== 'all' && event.stage !== stageFilter) return false
      if (outcomeFilter !== 'all' && event.outcome !== outcomeFilter) {
        return false
      }
      return true
    })
  }, [events, stageFilter, outcomeFilter])

  const summary = useMemo(
    () => buildSummary(events),
    [events],
  )

  const handleCopy = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(events.slice(0, 20), null, 2),
      )
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch (error) {
      console.error('[RolloutDashboardPanel] Failed to copy telemetry data', error)
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }, [events])

  const stageOptions: Array<{ value: TelemetryStage | 'all'; label: string }> =
    [
      { value: 'all', label: 'All stages' },
      { value: 'propose', label: 'Propose' },
      { value: 'apply', label: 'Apply' },
      { value: 'undo', label: 'Undo' },
      { value: 'guardrail', label: 'Guardrail' },
    ]

  const outcomeOptions: Array<{
    value: TelemetryOutcome | 'all'
    label: string
  }> = [
    { value: 'all', label: 'All outcomes' },
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' },
    { value: 'skipped', label: 'Skipped' },
  ]

  const totalEvents = events.length
  const filteredTotal = filteredEvents.length

  return (
    <Card variant='surface'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-lg font-semibold'>
          Chronicle Rollout Dashboard
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Real-time telemetry for GPT-5 automations. Monitor stage coverage,
          latency, guardrail skips, and session spend while we advance through
          the rollout stages.
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid gap-3 md:grid-cols-4'>
          {(
            Object.entries(summary.stageCounts) as Array<
              [TelemetryStage, number]
            >
          ).map(([stage, count]) => (
            <div
              key={stage}
              className='rounded-lg border border-border/60 bg-muted/20 px-3 py-3'
            >
              <div className='text-xs uppercase tracking-wide text-muted-foreground'>
                {STAGE_LABELS[stage]}
              </div>
              <div className='text-2xl font-semibold text-foreground'>
                {count}
              </div>
              <div className='text-[11px] text-muted-foreground/80'>
                {totalEvents > 0
                  ? `${Math.round((count / totalEvents) * 100)}% of events`
                  : 'No events yet'}
              </div>
            </div>
          ))}
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <div className='rounded-lg border border-border/60 bg-muted/20 px-3 py-3'>
            <div className='text-xs uppercase tracking-wide text-muted-foreground'>
              Outcomes
            </div>
            <div className='flex flex-wrap gap-2 mt-2'>
              {(Object.entries(summary.outcomeCounts) as Array<
                [TelemetryOutcome, number]
              >).map(([outcome, count]) => (
                <Badge
                  key={outcome}
                  variant={OUTCOME_VARIANTS[outcome]}
                  className='text-[11px]'
                >
                  {outcome} · {count}
                </Badge>
              ))}
            </div>
          </div>

          <div className='rounded-lg border border-border/60 bg-muted/20 px-3 py-3'>
            <div className='text-xs uppercase tracking-wide text-muted-foreground'>
              Average Latency
            </div>
            <div className='text-2xl font-semibold text-foreground'>
              {formatLatency(summary.averageLatency)}
            </div>
            <div className='text-[11px] text-muted-foreground/80'>
              Computed across the last {Math.min(totalEvents, MAX_EVENTS)} events
            </div>
          </div>

  <div className='rounded-lg border border-border/60 bg-muted/20 px-3 py-3'>
            <div className='text-xs uppercase tracking-wide text-muted-foreground'>
              Recorded Spend
            </div>
            <div className='text-2xl font-semibold text-foreground'>
              {formatUsd(summary.totalCostCents) ?? '$0.00'}
            </div>
            <div className='text-[11px] text-muted-foreground/80'>
              Based on telemetry reporting cost data
            </div>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {stageOptions.map((option) => (
            <Button
              key={option.value}
              variant={stageFilter === option.value ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setStageFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className='flex flex-wrap gap-2'>
          {outcomeOptions.map((option) => (
            <Button
              key={option.value}
              variant={
                outcomeFilter === option.value ? 'primary' : 'outline'
              }
              size='sm'
              onClick={() => setOutcomeFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            Showing {filteredTotal} of {totalEvents} recent events
          </span>
          <div className='flex items-center gap-2'>
            {summary.latestEvent ? (
              <span className='text-xs'>
                Updated{' '}
                {formatRelativeTimeFromNow(
                  new Date(summary.latestEvent.recordedAt),
                )}
              </span>
            ) : (
              <span className='text-xs'>No events captured yet</span>
            )}
            <Button
              size='sm'
              variant='outline'
              onClick={handleCopy}
              className='text-xs'
            >
              {copyState === 'copied'
                ? 'Copied!'
                : copyState === 'error'
                  ? 'Copy failed'
                  : 'Copy JSON'}
            </Button>
          </div>
        </div>

        <div className='rounded-lg border border-border/60 bg-muted/10 max-h-72 overflow-y-auto'>
          {filteredEvents.length === 0 ? (
            <div className='p-4 text-sm text-muted-foreground'>
              No telemetry events match the current filters yet. Trigger a
              Chronicle action or adjust the filters to refresh the feed.
            </div>
          ) : (
            <ul className='divide-y divide-border/60'>
              {filteredEvents.map((event) => {
                const recordedAt = new Date(event.recordedAt)
                const relative = formatRelativeTimeFromNow(recordedAt)
                return (
                  <li key={`${event.id}-${event.recordedAt}`}>
                    <div className='px-3 py-2 flex flex-col gap-2'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='text-[11px]'>
                            {STAGE_LABELS[event.stage]}
                          </Badge>
                          <Badge
                            variant={OUTCOME_VARIANTS[event.outcome]}
                            className='text-[11px]'
                          >
                            {event.outcome}
                          </Badge>
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          {recordedAt.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          · {relative}
                        </span>
                      </div>

                      <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                        <span>
                          Latency{' '}
                          <span className='font-semibold text-foreground'>
                            {formatLatency(event.latencyMs)}
                          </span>
                        </span>
                        {typeof event.costCents === 'number' ? (
                          <span>
                            Cost{' '}
                            <span className='font-semibold text-foreground'>
                              {formatUsd(event.costCents)}
                            </span>
                          </span>
                        ) : null}
                        <span>
                          Model{' '}
                          <span className='font-semibold text-foreground'>
                            {event.model}
                          </span>
                        </span>
                        <span>
                          Entry{' '}
                          <span className='font-semibold text-foreground'>
                            {event.entryId}
                          </span>
                        </span>
                        {event.bundleId ? (
                          <span>
                            Bundle{' '}
                            <span className='font-semibold text-foreground'>
                              {event.bundleId.slice(-8)}
                            </span>
                          </span>
                        ) : null}
                        {event.source ? (
                          <span>
                            Source{' '}
                            <span className='font-semibold text-foreground'>
                              {event.source}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RolloutDashboardPanel
