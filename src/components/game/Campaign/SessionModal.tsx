/**
 * Session Modal - Modal dialog for creating and editing campaign sessions
 */

import type { CampaignSession } from '../../../models/Campaign'
import * as Dialog from '@radix-ui/react-dialog'
import {
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  Star,
  Trophy,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useReducer } from 'react'

import { useModalForm } from '../../../hooks/useModalForm'
import { useStringListField } from '../../../hooks/useStringListField'
import { useCampaignStore } from '../../../stores/campaignStore'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  session?: CampaignSession
}

interface SessionFormState {
  title: string
  date: string // ISO date string for input
  duration: number // in minutes
  summary: string
  notes: string
  xpGained: number
  nextSession: string
}

interface SessionFormErrors {
  title?: string
  summary?: string
  duration?: string
  xpGained?: string
}

const MAX_SESSION_HIGHLIGHTS = 5
const MAX_SESSION_CHALLENGES = 5

const normaliseListValue = (value: string) => value.trim()

function createInitialState(session?: CampaignSession): SessionFormState {
  const defaultDate = new Date().toISOString().split('T')[0]
  return {
    title: session?.title ?? '',
    date: session ? session.date.toISOString().split('T')[0] : defaultDate,
    duration: session?.duration ?? 180,
    summary: session?.summary ?? '',
    notes: session?.notes ?? '',
    xpGained: session?.xpGained ?? 0,
    nextSession: session?.nextSession ?? '',
  }
}

function validateSession(state: SessionFormState): SessionFormErrors {
  const errors: SessionFormErrors = {}

  const title = state.title.trim()
  const summary = state.summary.trim()

  if (!title) errors.title = 'Session title is required'
  else if (title.length < 3)
    errors.title = 'Title must be at least 3 characters'

  if (!summary) errors.summary = 'Session summary is required'
  else if (summary.length < 10)
    errors.summary = 'Summary must be at least 10 characters'

  if (state.duration < 30)
    errors.duration = 'Duration must be at least 30 minutes'
  else if (state.duration > 960)
    errors.duration = 'Duration cannot exceed 16 hours'

  if (state.xpGained < 0) errors.xpGained = 'XP gained cannot be negative'
  else if (state.xpGained > 10)
    errors.xpGained = 'XP gained seems unusually high (max 10)'

  return errors
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  session,
}) => {
  const addSession = useCampaignStore((state) => state.addSession)
  const updateSession = useCampaignStore((state) => state.updateSession)
  const [newHighlight, dispatchNewHighlight] = useReducer(
    (_: string, value: string) => value,
    '',
  )
  const [newChallenge, dispatchNewChallenge] = useReducer(
    (_: string, value: string) => value,
    '',
  )

  const {
    items: highlights,
    addItem: addHighlight,
    removeItem: removeHighlight,
    replaceAll: replaceHighlights,
    canAddMore: canAddMoreHighlights,
  } = useStringListField(session?.highlights ?? [], {
    limit: MAX_SESSION_HIGHLIGHTS,
    normalise: normaliseListValue,
  })

  const {
    items: challenges,
    addItem: addChallenge,
    removeItem: removeChallenge,
    replaceAll: replaceChallenges,
    canAddMore: canAddMoreChallenges,
  } = useStringListField(session?.challenges ?? [], {
    limit: MAX_SESSION_CHALLENGES,
    normalise: normaliseListValue,
  })

  const handleSubmitForm = useCallback(
    async (formState: SessionFormState): Promise<string> => {
      const trimmedState = {
        ...formState,
        title: formState.title.trim(),
        summary: formState.summary.trim(),
        notes: formState.notes.trim(),
        nextSession: formState.nextSession.trim(),
      }

      const { date, ...rest } = trimmedState
      const payload: Partial<CampaignSession> = {
        ...rest,
        date: new Date(date),
        highlights,
        challenges,
      }

      if (session) {
        updateSession(campaignId, session.id, payload)
        return session.id
      }

      const created = addSession(
        campaignId,
        trimmedState.title,
        trimmedState.summary,
      )
      if (!created) throw new Error('Failed to create session')

      updateSession(campaignId, created.id, payload)
      return created.id
    },
    [addSession, campaignId, challenges, highlights, session, updateSession],
  )

  const {
    state,
    setState,
    reset: resetForm,
    errors,
    submit,
    isSubmitting,
  } = useModalForm<SessionFormState, SessionFormErrors, string>({
    getInitialState: useCallback(() => createInitialState(session), [session]),
    getInitialErrors: () => ({}),
    validate: validateSession,
    onSubmit: handleSubmitForm,
  })

  useEffect(() => {
    if (!isOpen) return

    resetForm(createInitialState(session))
    replaceHighlights(session?.highlights ?? [])
    replaceChallenges(session?.challenges ?? [])
    dispatchNewHighlight('')
    dispatchNewChallenge('')
  }, [
    dispatchNewChallenge,
    dispatchNewHighlight,
    isOpen,
    replaceChallenges,
    replaceHighlights,
    resetForm,
    session,
  ])

  const handleAddHighlight = useCallback(() => {
    if (addHighlight(newHighlight)) dispatchNewHighlight('')
  }, [addHighlight, newHighlight])

  const handleRemoveHighlight = useCallback(
    (highlightToRemove: string) => {
      removeHighlight(highlightToRemove)
    },
    [removeHighlight],
  )

  const handleAddChallenge = useCallback(() => {
    if (addChallenge(newChallenge)) dispatchNewChallenge('')
  }, [addChallenge, newChallenge])

  const handleRemoveChallenge = useCallback(
    (challengeToRemove: string) => {
      removeChallenge(challengeToRemove)
    },
    [removeChallenge],
  )

  const handleHighlightKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return

      event.preventDefault()
      handleAddHighlight()
    },
    [handleAddHighlight],
  )

  const handleChallengeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return

      event.preventDefault()
      handleAddChallenge()
    },
    [handleAddChallenge],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const result = await submit()

      if (result.status === 'success') {
        onClose()
        dispatchNewHighlight('')
        dispatchNewChallenge('')
      } else if (result.status === 'error') {
        console.error('Error saving session:', result.error)
      }
    },
    [dispatchNewChallenge, dispatchNewHighlight, onClose, submit],
  )

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          dispatchNewHighlight('')
          dispatchNewChallenge('')
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto'>
          <Card variant='surface'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-primary' />
                <CardTitle className='text-xl'>
                  {session ? 'Edit Session' : 'New Session'}
                </CardTitle>
              </div>
              <Dialog.Close asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <X className='h-4 w-4' />
                </Button>
              </Dialog.Close>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Title and Date Row */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Session Title</label>
                    <Input
                      value={state.title}
                      onChange={(event) => {
                        const { value } = event.target
                        setState((prev) => ({
                          ...prev,
                          title: value,
                        }))
                      }}
                      placeholder='Enter session title...'
                      className={errors.title ? 'border-destructive/40' : ''}
                    />
                    {errors.title && (
                      <p className='text-sm text-destructive'>{errors.title}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Date</label>
                    <Input
                      type='date'
                      value={state.date}
                      onChange={(event) => {
                        const { value } = event.target
                        setState((prev) => ({
                          ...prev,
                          date: value,
                        }))
                      }}
                    />
                  </div>
                </div>

                {/* Duration and XP Row */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium flex items-center gap-2'>
                      <Clock size={16} />
                      Duration (minutes)
                    </label>
                    <Input
                      type='number'
                      value={state.duration}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10)
                        setState((prev) => ({
                          ...prev,
                          duration: Number.isNaN(value) ? 0 : value,
                        }))
                      }}
                      min='30'
                      max='960'
                      className={errors.duration ? 'border-destructive/40' : ''}
                    />
                    {errors.duration && (
                      <p className='text-sm text-destructive'>
                        {errors.duration}
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground'>
                      Duration: {formatDuration(state.duration)}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium flex items-center gap-2'>
                      <Trophy size={16} />
                      XP Gained
                    </label>
                    <Input
                      type='number'
                      value={state.xpGained}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10)
                        setState((prev) => ({
                          ...prev,
                          xpGained: Number.isNaN(value) ? 0 : value,
                        }))
                      }}
                      min='0'
                      max='10'
                      className={errors.xpGained ? 'border-destructive/40' : ''}
                    />
                    {errors.xpGained && (
                      <p className='text-sm text-destructive'>
                        {errors.xpGained}
                      </p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Session Summary</label>
                  <Textarea
                    value={state.summary}
                    onChange={(event) => {
                      const { value } = event.target
                      setState((prev) => ({
                        ...prev,
                        summary: value,
                      }))
                    }}
                    placeholder='What happened during this session? Key events, decisions, plot progression...'
                    className={`min-h-20 ${errors.summary ? 'border-destructive/40' : ''}`}
                  />
                  {errors.summary && (
                    <p className='text-sm text-destructive'>{errors.summary}</p>
                  )}
                </div>

                {/* Highlights */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium flex items-center gap-2'>
                    <Star size={16} className='text-chart-4' />
                    Session Highlights
                  </label>

                  {/* Existing Highlights */}
                  {highlights.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {highlights.map((highlight) => (
                        <Badge
                          key={highlight}
                          variant='secondary'
                          className='text-xs cursor-pointer hover:bg-chart-4/120/20 bg-chart-4/120/10 text-chart-4'
                          onClick={() => handleRemoveHighlight(highlight)}
                        >
                          ⭐ {highlight} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Highlight */}
                  <div className='flex gap-2'>
                    <Input
                      value={newHighlight}
                      onChange={(event) =>
                        dispatchNewHighlight(event.target.value)
                      }
                      onKeyDown={handleHighlightKeyDown}
                      placeholder='Add a session highlight...'
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      onClick={handleAddHighlight}
                      variant='ghost'
                      size='sm'
                      disabled={!newHighlight.trim() || !canAddMoreHighlights}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {`${highlights.length}/${MAX_SESSION_HIGHLIGHTS} highlights`}
                  </p>
                </div>

                {/* Challenges */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium flex items-center gap-2'>
                    <AlertTriangle size={16} className='text-destructive' />
                    Challenges & Issues
                  </label>

                  {/* Existing Challenges */}
                  {challenges.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {challenges.map((challenge) => (
                        <Badge
                          key={challenge}
                          variant='secondary'
                          className='text-xs cursor-pointer hover:bg-destructive/20 bg-destructive/15 text-destructive'
                          onClick={() => handleRemoveChallenge(challenge)}
                        >
                          ⚠️ {challenge} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Challenge */}
                  <div className='flex gap-2'>
                    <Input
                      value={newChallenge}
                      onChange={(event) =>
                        dispatchNewChallenge(event.target.value)
                      }
                      onKeyDown={handleChallengeKeyDown}
                      placeholder='Add a challenge or issue...'
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      onClick={handleAddChallenge}
                      variant='ghost'
                      size='sm'
                      disabled={!newChallenge.trim() || !canAddMoreChallenges}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {`${challenges.length}/${MAX_SESSION_CHALLENGES} challenges`}
                  </p>
                </div>

                {/* Notes */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Additional Notes
                  </label>
                  <Textarea
                    value={state.notes}
                    onChange={(event) => {
                      const { value } = event.target
                      setState((prev) => ({
                        ...prev,
                        notes: value,
                      }))
                    }}
                    placeholder='Private GM notes, observations, things to remember...'
                    className='min-h-20'
                  />
                </div>

                {/* Next Session */}
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Next Session Preparation
                  </label>
                  <Textarea
                    value={state.nextSession}
                    onChange={(event) => {
                      const { value } = event.target
                      setState((prev) => ({
                        ...prev,
                        nextSession: value,
                      }))
                    }}
                    placeholder='What to prepare for next session? Plot hooks, NPCs to review, etc...'
                    className='min-h-20'
                  />
                </div>

                {/* Actions */}
                <div className='flex items-center justify-between pt-4'>
                  <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                    <span>
                      Duration:
                      {formatDuration(state.duration)}
                    </span>
                    {state.xpGained > 0 && (
                      <span className='flex items-center gap-1'>
                        <Trophy size={14} />
                        {state.xpGained} XP
                      </span>
                    )}
                  </div>
                  <div className='flex gap-3'>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => {
                        onClose()
                        dispatchNewHighlight('')
                        dispatchNewChallenge('')
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='primary'
                      disabled={isSubmitting}
                      className='min-w-20'
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : session
                          ? 'Update'
                          : 'Create'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
