/**
 * Chronicle Panel - Natural storytelling interface
 * Replaces rigid Session Tools with flowing narrative chronicle
 */

import type { Entity } from '../../../types/chronicle'
import type { ChronicleParser } from '../../../utils/chronicleParser'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  AtSign,
  BookOpen,
  Clock,
  Eye,
  Hash,
  Loader2,
  Plus,
  Scroll,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChronicleLLM } from '@/components/chronicle/ChronicleProvider'
import { buildMentionContext, formatActorLabel, formatRelativeTimeFromNow } from '@/components/chronicle/highlightUtils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useCharacterStore } from '@/stores/characterStore'
import { useChronicleStore } from '@/stores/chronicleStore'
import { createChronicleParser } from '@/utils/chronicleParser'
import { logger } from '@/utils/logger'
import { Badge, Button, Card, CardContent } from '../../ui'

interface ChroniclePanelProps {
  className?: string
}

export const ChroniclePanel: React.FC<ChroniclePanelProps> = ({
  className = '',
}) => {
  // Store state
  const {
    entries,
    entities,
    currentSessionId,
    addEntry,
    addEntity,
    startSession,
    settings,
    resourceHistory,
    getEntry,
    getDeltaLog,
    auditLog,
    clearAuditLog,
    pendingDeltaBundle,
  } = useChronicleStore()

  // Local state
  const [chronicleText, setChronicleText] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const [showEntitySuggestions, setShowEntitySuggestions] = useState(false)
  const [entitySuggestions, setEntitySuggestions] = useState<Entity[]>([])
  const [currentAtMention, setCurrentAtMention] = useState<{
    query: string
    position: number
  } | null>(null)
  const [isProcessingMention, setIsProcessingMention] = useState(false)
  const [lastRecognizedEntity, setLastRecognizedEntity] = useState<
    string | null
  >(null)
  const selectedEntityId = useChronicleStore((state) => state.selectedEntity)
  const setSelectedEntityId = useChronicleStore((state) => state.setSelectedEntity)
  const getEntityById = useChronicleStore((state) => state.getEntity)
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null
    return getEntityById(selectedEntityId) ?? null
  }, [getEntityById, selectedEntityId])
  const handleSelectEntity = useCallback((entity: Entity) => {
    setSelectedEntityId(entity.id)
  }, [setSelectedEntityId])
  const getCharacter = useCharacterStore((state) => state.getCharacter)

  const resolveCharacterName = useCallback(
    (characterId?: string | null) => {
      if (!characterId) return 'Unknown adventurer'
      const character = getCharacter(characterId)
      return character?.name ?? characterId
    },
    [getCharacter],
  )
  const [activeView, setActiveView] = useState<
    'write' | 'timeline' | 'entities'
  >('write')
  const [searchQuery, setSearchQuery] = useState('')
  const { isApplyingBundle, lastProgressEvent } = useChronicleLLM()
  const [isTimelineAuditExpanded, setIsTimelineAuditExpanded] = useState(false)
  const [isTimelineGuardDismissed, setIsTimelineGuardDismissed] = useState(false)

  const tauriBridge = (
    typeof window !== 'undefined'
      ? (window as typeof window & { __TAURI__?: unknown })
      : undefined
  )
  const isTauriRuntime = Boolean(tauriBridge?.__TAURI__)
  const showTauriGuard = !isTauriRuntime && !isTimelineGuardDismissed

  const pendingRequestedAt = useMemo(() => {
    if (!pendingDeltaBundle?.requestedAt) {
      return undefined
    }

    const date = new Date(pendingDeltaBundle.requestedAt)
    return Number.isNaN(date.getTime()) ? undefined : date
  }, [pendingDeltaBundle?.requestedAt])

  const pendingRelative = useMemo(() => {
    return pendingRequestedAt
      ? formatRelativeTimeFromNow(pendingRequestedAt)
      : undefined
  }, [pendingRequestedAt])

  const visibleAuditEntries = useMemo(() => {
    const limit = isTimelineAuditExpanded
      ? Math.min(12, auditLog.length)
      : Math.min(4, auditLog.length)
    return auditLog.slice(0, limit)
  }, [auditLog, isTimelineAuditExpanded])

  const hasMoreAuditEntries = auditLog.length > visibleAuditEntries.length

  const handleNavigateToEntry = useCallback(
    (entryId: string, entityName?: string) => {
      setActiveView('timeline')
      if (entityName) {
        setSearchQuery(entityName)
      }
      setSelectedEntityId(null)
    },
    [setActiveView, setSearchQuery, setSelectedEntityId],
  )

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const parser = useRef<ChronicleParser>(createChronicleParser(entities))

  // Update parser when entities change
  useEffect(() => {
    parser.current.updateEntities(entities)
  }, [entities])

  // Start session if none exists
  useEffect(() => {
    if (!currentSessionId) {
      startSession()
    }
  }, [currentSessionId, startSession])

  // Debounce timer ref for performance optimization
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Handle @ mention detection with debouncing for performance
  const handleTextChange = useCallback(
    (value: string) => {
      setChronicleText(value)
      setIsWriting(value.length > 0)

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Debounced entity suggestion for @ mentions (500ms delay for performance)
      if (settings.parseOnType) {
        const textarea = textareaRef.current
        if (!textarea) return

        const cursorPos = textarea.selectionStart
        const textBeforeCursor = value.substring(0, cursorPos)
        const atMatch = textBeforeCursor.match(/@([a-z0-9\s]*)$/i)

        if (atMatch) {
          const query = atMatch[1]
          setIsProcessingMention(true)

          // PERFORMANCE: Debounce parsing by 500ms to reduce CPU usage
          debounceTimerRef.current = setTimeout(() => {
            logger.info(`🔍 @mention detected: query="${query}", processing...`)
            const suggestions = parser.current.getEntitySuggestions(query, 8)
            logger.info(`✅ Found ${suggestions.length} suggestions for "${query}"`)

            setCurrentAtMention({
              query,
              position: cursorPos,
            })
            setEntitySuggestions(suggestions)
            setShowEntitySuggestions(suggestions.length > 0)
            setIsProcessingMention(false)
          }, 500)
        } else {
          setShowEntitySuggestions(false)
          setCurrentAtMention(null)
          setIsProcessingMention(false)
          // Clear entity recognition after a delay if no @ mentions
          if (!value.includes('@')) {
            setTimeout(() => setLastRecognizedEntity(null), 2000)
          }
        }
      }
    },
    [settings.parseOnType],
  )

  // Handle entity suggestion selection
  const handleEntitySelect = useCallback(
    (entity: Entity) => {
      if (!currentAtMention || !textareaRef.current) return

      const textarea = textareaRef.current
      const cursorPos = currentAtMention.position
      const beforeAt = chronicleText.substring(
        0,
        cursorPos - currentAtMention.query.length - 1,
      )
      const afterCursor = chronicleText.substring(cursorPos)

      const newText = `${beforeAt}@${entity.name}${afterCursor}`
      setChronicleText(newText)

      // Move cursor after the entity name
      setTimeout(() => {
        const newCursorPos =
          cursorPos - currentAtMention.query.length + entity.name.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 10)

      setShowEntitySuggestions(false)
      setCurrentAtMention(null)
      setLastRecognizedEntity(`@${entity.name}`)
      // Clear success indicator after 3 seconds
      setTimeout(() => setLastRecognizedEntity(null), 3000)
    },
    [currentAtMention, chronicleText],
  )

  // Save chronicle entry
  const saveEntry = useCallback(async () => {
    if (!chronicleText.trim() || !currentSessionId) return

    const parseResult = parser.current.parseText(chronicleText)

    // Create new entities if they don't exist
    for (const mention of parseResult.entities) {
      if (!entities.find((e) => e.id === mention.entityId)) {
        // This is a new entity - create it
        const entityName = mention.mentionText.substring(1) // Remove @
        const entityType = 'character' // Default, could be smarter

        addEntity({
          name: entityName,
          type: entityType,
          description: `Created from: "${mention.context}"`,
          firstMention: '',
          lastMention: '',
          appearances: [],
          relationships: [],
          aliases: [],
          status: 'active',
          tags: [],
          importance: 1,
        })
      }
    }

    // Create chronicle entry
    const entryId = addEntry({
      sessionId: currentSessionId,
      rawText: chronicleText,
      parsedEntities: parseResult.entities,
      narrativeContext: parseResult.narrativeContext,
      emotionalTone: parseResult.emotionalTone,
      tags: parseResult.extractedTags,
      isSceneBreak: parseResult.isSceneBreak,
    })

    // Clear text and show success
    setChronicleText('')
    setIsWriting(false)

    logger.info('Chronicle entry saved:', entryId)
  }, [chronicleText, currentSessionId, entities, addEntity, addEntry])

  // Quick templates
  const templates = [
    { label: 'Combat', text: 'A fierce battle erupts as @' },
    { label: 'Discovery', text: 'The party discovers that @' },
    { label: 'NPC Meeting', text: 'We encounter @ who tells us that' },
    { label: 'Location', text: 'Arriving at @, we notice that' },
    {
      label: 'Mystery',
      text: 'Something strange happens with @ - we need to investigate',
    },
  ]

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setChronicleText((prev) => prev + (prev ? '\n\n' : '') + template)
    textareaRef.current?.focus()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-display mb-2'>Campaign Chronicle</h2>
          <p className='text-muted-foreground'>
            Tell your story naturally - @mention characters, locations, and
            events
          </p>
        </div>
        <Badge variant='default' className='magical-glow'>
          Session Active ✨
        </Badge>
      </div>

      {/* View Toggle */}
      <Card variant='surface'>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='flex gap-2'>
              <Button
                variant={activeView === 'write' ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => setActiveView('write')}
                className='gap-2'
              >
                <BookOpen size={16} />
                Write
              </Button>
              <Button
                variant={activeView === 'timeline' ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => setActiveView('timeline')}
                className='gap-2'
              >
                <Scroll size={16} />
                Timeline
              </Button>
              <Button
                variant={activeView === 'entities' ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => setActiveView('entities')}
                className='gap-2'
              >
                <Users size={16} />
                Entities ({entities.length})
              </Button>
            </div>

            {activeView !== 'write' && (
              <div className='flex items-center gap-2'>
                <Search size={14} />
                <input
                  type='text'
                  placeholder='Search chronicle...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='px-2 py-1 text-sm rounded border'
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <AnimatePresence mode='wait'>
        {activeView === 'write' && (
          <motion.div
            key='write'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quick Templates */}
            {!isWriting && (
              <Card variant='surface' className='mb-4'>
                <CardContent>
                  <div className='space-y-3'>
                    <h4 className='font-medium flex items-center gap-2'>
                      <Sparkles size={16} />
                      Quick Start Templates
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {templates.map((template) => (
                        <Button
                          key={template.label}
                          variant='outline'
                          size='sm'
                          onClick={() => handleTemplateSelect(template.text)}
                          className='text-sm'
                        >
                          {template.label}
                        </Button>
                      ))}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      💡 Use @mentions for characters and locations, #tags for
                      organization
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Writing Area */}
            <div className='relative'>
              <Card variant='magical' className='overflow-hidden'>
                <CardContent>
                  <div className='relative'>
                    {/* Writing Textarea with Visual Feedback */}
                    <div className='relative'>
                      <textarea
                        ref={textareaRef}
                        value={chronicleText}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="What's happening in your adventure? Use @mentions to reference characters and places..."
                        className={`w-full min-h-[300px] p-4 bg-transparent border-none resize-none focus:outline-none text-base leading-relaxed transition-all duration-200 ${
                          isProcessingMention
                            ? 'ring-2 ring-primary/30 ring-opacity-50'
                            : ''
                        }`}
                        style={{
                          color: 'var(--foreground)',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                        autoFocus
                      />

                      {/* Processing Indicator */}
                      <AnimatePresence>
                        {isProcessingMention && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-sm'
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderColor: 'rgb(59, 130, 246)',
                              color: 'rgb(59, 130, 246)',
                            }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            >
                              <Sparkles size={14} />
                            </motion.div>
                            <span className='text-xs font-medium'>
                              Recognizing entity...
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Success Indicator */}
                      <AnimatePresence>
                        {lastRecognizedEntity && !isProcessingMention && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8 }}
                            className='absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-sm'
                            style={{
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              borderColor: 'rgb(34, 197, 94)',
                              color: 'rgb(34, 197, 94)',
                            }}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                              <AtSign size={14} />
                            </motion.div>
                            <span className='text-xs font-medium'>
                              {lastRecognizedEntity} recognized
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Entity Suggestions with Processing State */}
                    <AnimatePresence>
                      {(showEntitySuggestions || isProcessingMention) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='absolute z-[var(--layer-popover)] mt-2'
                          style={{ left: '20px', top: '120px' }}
                        >
                          {isProcessingMention ? (
                            <div
                              className='p-3 rounded-lg border shadow-lg backdrop-blur-sm'
                              style={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                              }}
                            >
                              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                >
                                  <Sparkles
                                    size={16}
                                    className='text-primary'
                                  />
                                </motion.div>
                                <span>Searching for entities...</span>
                              </div>
                            </div>
                          ) : (
                            showEntitySuggestions &&
                            entitySuggestions.length > 0 && (
                              <EntitySuggestionPanel
                                suggestions={entitySuggestions}
                                onSelect={handleEntitySelect}
                                onClose={() => setShowEntitySuggestions(false)}
                              />
                            )
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Word Count & Save */}
                    <div className='flex items-center justify-between p-4 border-t border-border'>
                      <div className='text-sm text-muted-foreground'>
                        {chronicleText.length} characters
                        {chronicleText.trim() && (
                          <span className='ml-2'>
                            •{' '}
                            {chronicleText.split(/\s+/).filter((w) => w).length}{' '}
                            words
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setChronicleText('')}
                          disabled={!chronicleText.trim()}
                        >
                          Clear
                        </Button>
                        <Button
                          variant='primary'
                          size='sm'
                          onClick={saveEntry}
                          disabled={!chronicleText.trim()}
                          className='gap-2'
                        >
                          <Plus size={16} />
                          Save Entry
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeView === 'timeline' && (
          <motion.div
            key='timeline'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className='space-y-4'>
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
                    <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide'>
                      <span className='rounded bg-destructive/20 px-2 py-0.5 font-mono text-[10px] text-destructive'>
                        npm run dev:tauri
                      </span>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-7 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                        onClick={() => setIsTimelineGuardDismissed(true)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {pendingDeltaBundle && (
                <Alert className='border-primary/40 bg-primary/5 shadow-sm'>
                  <Loader2
                    className={`h-4 w-4 text-primary ${isApplyingBundle ? 'animate-spin' : 'animate-pulse'}`}
                  />
                  <AlertTitle className='flex items-center gap-2 text-sm font-semibold text-primary'>
                    Chronicle bundle pending
                    {isApplyingBundle && (
                      <Badge variant='outline' className='text-[9px] uppercase tracking-wide text-primary'>
                        applying
                      </Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription className='space-y-2 text-xs text-muted-foreground'>
                    <div className='flex flex-wrap items-center gap-2 text-sm font-medium text-foreground'>
                      <span>Entry {pendingDeltaBundle.entryId ?? '\u2014'}</span>
                      {pendingDeltaBundle.bundleId && (
                        <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                          #{pendingDeltaBundle.bundleId.slice(-6)}
                        </Badge>
                      )}
                    </div>
                    <p>
                      {pendingDeltaBundle.autoApply
                        ? 'Auto-apply is enabled. The bundle will commit as soon as GPT-5 finishes.'
                        : 'Review the proposed changes in Chronicle to continue.'}
                    </p>
                    <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground'>
                      <Clock size={11} />
                      <span>
                        {pendingRequestedAt
                          ? pendingRequestedAt.toLocaleTimeString()
                          : 'Awaiting timestamp'}
                      </span>
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

              {visibleAuditEntries.length > 0 && (
                <div className='rounded-lg border border-border bg-card/70 p-4 shadow-sm space-y-3'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      <BookOpen size={12} />
                      Audit history
                    </div>
                    <div className='flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground'>
                      <span>
                        Showing {visibleAuditEntries.length} of {auditLog.length}
                      </span>
                      {hasMoreAuditEntries && (
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => setIsTimelineAuditExpanded((prev) => !prev)}
                          className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
                        >
                          {isTimelineAuditExpanded
                            ? 'Show less'
                            : `Show more (+${Math.max(auditLog.length - visibleAuditEntries.length, 0)})`}
                        </Button>
                      )}
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => clearAuditLog()}
                        className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground'
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    {visibleAuditEntries.map((entry) => {
                      const timestamp = new Date(entry.timestamp)
                      const timestampLabel = Number.isNaN(timestamp.getTime())
                        ? 'Unknown time'
                        : timestamp.toLocaleTimeString()
                      const relativeLabel = Number.isNaN(timestamp.getTime())
                        ? undefined
                        : formatRelativeTimeFromNow(timestamp)
                      const bundleLabel = entry.bundleId
                        ? `#${entry.bundleId.slice(-6)}`
                        : undefined

                      return (
                        <div
                          key={entry.id}
                          className='flex items-start justify-between gap-3 rounded-md border border-border/40 bg-background/80 px-3 py-2 text-xs'
                        >
                          <div className='space-y-1'>
                            <div className='flex flex-wrap items-center gap-2 font-semibold text-foreground'>
                              <span>
                                {entry.action === 'applied'
                                  ? 'Bundle applied'
                                  : 'Bundle undone'}
                              </span>
                              {bundleLabel && (
                                <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                                  {bundleLabel}
                                </Badge>
                              )}
                            </div>
                            <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground'>
                              <Clock size={11} />
                              <span>{timestampLabel}</span>
                              {relativeLabel && (
                                <>
                                  <span aria-hidden='true'>&bull;</span>
                                  <span>{relativeLabel}</span>
                                </>
                              )}
                              <span aria-hidden='true'>&bull;</span>
                              <span>Entry {entry.entryId}</span>
                            </div>
                            {entry.reason && (
                              <p className='text-[11px] text-muted-foreground/90'>{entry.reason}</p>
                            )}
                          </div>
                          <div className='flex flex-col items-end gap-1 text-[10px] uppercase tracking-wide text-muted-foreground'>
                            <Badge variant='outline' className='text-[9px] uppercase tracking-wide'>
                              {formatActorLabel(entry.actor)}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <ChronicleTimeline
                entries={entries}
                entities={entities}
                resourceHistory={resourceHistory}
                getDeltaLog={getDeltaLog}
                resolveCharacterName={resolveCharacterName}
                searchQuery={searchQuery}
                onEntitySelect={handleSelectEntity}
              />
            </div>
          </motion.div>
        )}

        {activeView === 'entities' && (
          <motion.div
            key='entities'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {entities
                .filter(
                  (entity) =>
                    !searchQuery ||
                    entity.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    entity.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
                .sort((a, b) => b.importance - a.importance)
                .map((entity) => {
                  const mentionHistory = Array.isArray(entity.mentionHistory)
                    ? entity.mentionHistory
                    : []
                  const latestMention = mentionHistory[0]
                  const entryForMention =
                    latestMention && latestMention.entryId
                      ? getEntry(latestMention.entryId)
                      : undefined
                  const mentionSnippet =
                    latestMention
                      ? buildMentionContext(
                          latestMention,
                          entryForMention?.rawText ?? entity.description ?? '',
                        )
                      : null
                  const mentionDateRaw =
                    latestMention && latestMention.createdAt
                      ? new Date(latestMention.createdAt)
                      : null
                  const mentionDateLabel =
                    mentionDateRaw && !Number.isNaN(mentionDateRaw.getTime())
                      ? mentionDateRaw.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : null

                  return (
                    <Card
                      key={entity.id}
                      variant='surface'
                      className='cursor-pointer hover:shadow-lg transition-all'
                      onClick={() => handleSelectEntity(entity)}
                    >
                      <CardContent>
                        <div className='space-y-3'>
                          <div className='flex items-start justify-between gap-2'>
                            <div className='space-y-1'>
                              <h4 className='font-medium'>{entity.name}</h4>
                              {mentionDateLabel && (
                                <p className='text-[11px] text-muted-foreground'>
                                  Last mentioned {mentionDateLabel}
                                </p>
                              )}
                            </div>
                            <Badge variant='secondary' className='text-xs'>
                              {entity.type}
                            </Badge>
                          </div>
                          {entity.description && (
                            <p className='text-sm line-clamp-2 text-muted-foreground'>
                              {entity.description}
                            </p>
                          )}
                          {mentionSnippet && (
                            <div className='rounded-md border border-border/40 bg-muted/10 px-2 py-1 text-xs leading-snug text-muted-foreground'>
                              {mentionSnippet}
                            </div>
                          )}
                          <div className='flex items-center justify-between text-xs text-muted-foreground'>
                            <span>
                              {entity.mentionHistory?.length ?? entity.appearances.length} mentions
                            </span>
                            <div className='flex items-center gap-2'>
                              <div className='flex items-center gap-1'>
                                <Eye size={12} />
                                <ArrowRight size={12} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>

            {entities.length === 0 && (
              <Card variant='surface'>
                <CardContent>
                  <div className='text-center py-8'>
                    <Users size={48} className='mx-auto mb-4 opacity-50' />
                    <h3 className='text-lg font-medium mb-2'>
                      No Entities Yet
                    </h3>
                    <p className='text-muted-foreground'>
                      Start writing your chronicle and use @mentions to create
                      characters, locations, and other entities!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entity Preview Modal */}
      <AnimatePresence>
        {selectedEntity && (
          <EntityPreview
            entity={selectedEntity}
            entries={entries}
            onClose={() => setSelectedEntityId(null)}
            onNavigateToEntry={handleNavigateToEntry}
          />
        )}
      </AnimatePresence>

      {/* Helpful Tips */}
      {entries.length === 0 && activeView === 'write' && !isWriting && (
        <Card variant='surface'>
          <CardContent>
            <div className='text-sm space-y-2'>
              <h4 className='font-medium flex items-center gap-2'>
                <Hash size={14} />
                Writing Tips
              </h4>
              <ul className='space-y-1 ml-4 text-muted-foreground'>
                <li>
                  • Use @mentions to reference characters: "@Baron Redcloak
                  draws his sword"
                </li>
                <li>
                  • Tag locations with @: "We arrive at @Goblin's Den and hear
                  strange noises"
                </li>
                <li>
                  • Add hashtags for organization: "#combat #discovery #plot"
                </li>
                <li>
                  • Write naturally - the system will understand your story
                </li>
                <li>• Entities and relationships are created automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
















