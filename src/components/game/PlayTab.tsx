/**
 * PlayTab - Immersive Storyteller Mode
 *
 * A story-first interface where Chronicle takes center stage (60% screen).
 * AI assists in background - enhancing notes, providing tools, enabling natural story flow.
 * Player remains the author, system acts as intelligent scribe.
 */

import type {
  ApplyDeltaBundleResult,
  DeltaOperation,
  ProposedDeltaBundle,
} from '../../services/llm'
import type { BadgeProps } from '../ui'
import type { FolioHighlight } from '@/components/game/CharacterSheet/Folio'
import type { EquipmentChange } from '@/components/game/CharacterSheet/FolioGearPage'
import type { BondReminderFocusDetail } from '@/constants/events'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircuitBoard,
  Dices,
  Ghost,
  Loader2,
  Orbit,
  RefreshCcw,
  Scroll,
  Send,
  ShieldAlert,
  Sparkles,
  Wand2,
  Lasso,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RollHUD } from '@/components/dice/RollHUD'
import Folio from '@/components/game/CharacterSheet/Folio'
import { RightRail, SplitPane } from '@/components/layout'
import { BOND_REMINDER_FOCUS_EVENT } from '@/constants/events'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import { formatRollSummary } from '@/utils/diceFormatting'
import { isLlmUnifiedEnabled } from '@/utils/featureFlags'
import { useIsTauriRuntime } from '@/utils/tauriRuntime'
import {
  describeDeltaOperation as formatDeltaOperation,
  undoChronicleBundle,
} from '../../services/chronicle'
import { useCharacterStore } from '../../stores/characterStore'
import { useChronicleStore } from '../../stores/chronicleStore'
import { AutomationStatusChip } from '../chronicle/AutomationStatusChip'
import { useChronicleLLM } from '../chronicle/ChronicleProvider'
import { DeltaChecklist } from '../chronicle/DeltaChecklist'
import { Badge, Button, Card, CardContent, Textarea } from '../ui'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface DiceRollContext {
  id: string
  result: number
  modifier: number
  stat: string
  timestamp: Date
  context?: string
  outcome?: string
}

interface PlayTabProps {
  className?: string
}

type ChronicleEntryStatus =
  | 'draft'
  | 'proposing'
  | 'ready'
  | 'applying'
  | 'applied'
  | 'error'

interface ChronicleEntryView {
  id: string
  rawText: string
  createdAt: Date
  narrative?: string
  bundle?: ProposedDeltaBundle
  warnings: string[]
  status: ChronicleEntryStatus
  selection: Record<number, boolean>
  result?: ApplyDeltaBundleResult
  errorMessage?: string
}

const STORY_STATUS_LABEL: Record<ChronicleEntryStatus, string> = {
  draft: 'Draft',
  proposing: 'Drafting',
  ready: 'Ready',
  applying: 'Applying',
  applied: 'Applied',
  error: 'Needs review',
}

const STORY_BADGE_VARIANT: Record<ChronicleEntryStatus, BadgeProps['variant']> =
  {
    draft: 'secondary',
    proposing: 'secondary',
    ready: 'secondary',
    applying: 'warning',
    applied: 'success',
    error: 'destructive',
  }

const RECENT_STORY_LIMIT = 5
const STORY_SNIPPET_LIMIT = 110

interface RecentStoryBarProps {
  entries: ChronicleEntryView[]
  onToggleOperation: (entryId: string, index: number, checked: boolean) => void
  onApply: (entryId: string, options?: { auto?: boolean }) => Promise<void>
  isApplyingBundle: boolean
  canApplyAutomation: boolean
  renderDeltaDescription: (op: DeltaOperation) => string
  maxEntries?: number
  className?: string
}

function getStorySnippet(entry: ChronicleEntryView): string {
  const base = entry.narrative ?? entry.rawText
  const sanitized = base.replace(/\s+/g, ' ').trim()
  if (!sanitized) return 'Pending chronicle entry'
  if (sanitized.length <= STORY_SNIPPET_LIMIT) return sanitized
  return `${sanitized.slice(0, STORY_SNIPPET_LIMIT - 1)}…`
}

function getUpdateCount(entry: ChronicleEntryView): number {
  return entry.bundle?.ops.length ?? 0
}

function RecentStoryBar({
  entries,
  onToggleOperation,
  onApply,
  isApplyingBundle,
  canApplyAutomation,
  maxEntries = RECENT_STORY_LIMIT,
  renderDeltaDescription,
  className,
}: RecentStoryBarProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [openEntryId, setOpenEntryId] = useState<string | null>(null)

  const visibleEntries = useMemo(() => {
    if (entries.length === 0) return [] as ChronicleEntryView[]
    return [...entries].slice(-maxEntries).reverse()
  }, [entries, maxEntries])

  if (entries.length === 0) {
    return (
      <Card variant='surface' className={cn('w-full', className)}>
        <CardContent className='flex items-center justify-center gap-3 px-4 py-3 text-muted-foreground'>
          <BookOpen
            size={20}
            className='opacity-50 text-muted-foreground'
            aria-hidden='true'
          />
          <div className='text-sm'>
            <span className='font-medium'>Your chronicle awaits...</span>
            <span className='ml-2 text-xs text-muted-foreground/70'>
              Write your story below to begin
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestEntry = entries[entries.length - 1]

  const renderUpdateChip = (entry: ChronicleEntryView, className?: string) => {
    const count = getUpdateCount(entry)
    if (count === 0) return null
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary',
          className,
        )}
      >
        <Sparkles className='h-3 w-3' aria-hidden='true' />
        {count} update{count > 1 ? 's' : ''}
      </span>
    )
  }

  const renderWarningChip = (
    entry: ChronicleEntryView,
    className?: string,
  ) => {
    if (entry.warnings.length === 0) return null
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive',
          className,
        )}
        title={entry.warnings.join('\n')}
      >
        <AlertTriangle className='h-3 w-3' aria-hidden='true' />
        Warnings
      </span>
    )
  }

  const renderApplyButton = (
    entry: ChronicleEntryView,
    options: { size?: 'sm' | 'xs'; className?: string } = {},
  ) => {
    if (!entry.bundle || entry.bundle.ops.length === 0) return null

    const isApplyingEntry = entry.status === 'applying'
    const isApplied = entry.status === 'applied'
    const disabled =
      isApplyingEntry || isApplyingBundle || !canApplyAutomation || isApplied

    return (
      <Button
        size={options.size ?? 'sm'}
        variant={isApplied ? 'outline' : 'primary'}
        disabled={disabled}
        className={cn(
          'gap-2',
          options.size === 'xs' ? 'h-7 px-2 text-xs' : '',
          options.className,
        )}
        onClick={() => {
          if (disabled) return
          void onApply(entry.id)
          setExpanded(true)
          setOpenEntryId(entry.id)
        }}
      >
        {isApplyingEntry ? (
          <>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            Applying...
          </>
        ) : isApplied ? (
          <>
            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
            Applied
          </>
        ) : (
          <>
            <CheckCircle2 className='h-3.5 w-3.5' />
            Apply
          </>
        )}
      </Button>
    )
  }

  const summaryStatusLabel = STORY_STATUS_LABEL[latestEntry.status]
  const summaryBadgeVariant =
    STORY_BADGE_VARIANT[latestEntry.status] ?? 'secondary'

  return (
    <Card variant='surface' className={cn('h-full w-full', className)}>
      <CardContent className='h-full px-4 py-3'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex min-w-0 items-start gap-2'>
              <BookOpen
                className='mt-0.5 h-4 w-4 shrink-0 text-primary'
                aria-hidden='true'
              />
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant={summaryBadgeVariant}
                    className='text-[10px] uppercase tracking-wide'
                  >
                    {summaryStatusLabel}
                  </Badge>
                  <span className='text-xs text-muted-foreground'>
                    {latestEntry.createdAt.toLocaleTimeString()}
                  </span>
                  {renderUpdateChip(latestEntry)}
                  {renderWarningChip(latestEntry)}
                </div>
                <p className='mt-1 text-sm font-semibold text-foreground truncate'>
                  {getStorySnippet(latestEntry)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {renderApplyButton(latestEntry, {
                className: 'hidden xl:inline-flex whitespace-nowrap',
              })}
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 shrink-0'
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                aria-label='Toggle recent story history'
              >
                {expanded ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

            {expanded && (
            <ul className='space-y-2 border-t-2 border-border pt-3'>
              {visibleEntries.map((entry) => {
                const isOpen = openEntryId === entry.id
                const badgeVariant =
                  STORY_BADGE_VARIANT[entry.status] ?? 'secondary'
                const statusLabel = STORY_STATUS_LABEL[entry.status]

                return (
                  <li
                    key={entry.id}
                    className='rounded-lg border-2 border-border bg-card/70'
                  >
                    <button
                      type='button'
                      onClick={() =>
                        setOpenEntryId((prev) => (prev === entry.id ? null : entry.id))
                      }
                      className='flex w-full items-start justify-between gap-3 px-3 py-2 text-left'
                    >
                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <Badge
                            variant={badgeVariant}
                            className='text-[10px] uppercase tracking-wide'
                          >
                            {statusLabel}
                          </Badge>
                          <span className='text-[11px] text-muted-foreground'>
                            {entry.createdAt.toLocaleTimeString()}
                          </span>
                          {renderUpdateChip(entry)}
                          {renderWarningChip(entry)}
                        </div>
                        <p className='mt-1 text-sm text-foreground truncate'>
                          {getStorySnippet(entry)}
                        </p>
                      </div>
                      <div className='flex shrink-0 items-center gap-2'>
                        {renderApplyButton(entry, {
                          size: 'xs',
                          className: 'hidden lg:inline-flex whitespace-nowrap',
                        })}
                        <ChevronDown
                          className={cn(
                            'h-3.5 w-3.5 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                          aria-hidden='true'
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div className='space-y-3 border-t border-border/60 px-3 py-3 text-sm leading-relaxed'>
                        <div className='whitespace-pre-wrap text-foreground'>
                          {entry.narrative ?? entry.rawText}
                        </div>

                        {entry.narrative && entry.narrative !== entry.rawText && (
                          <div className='text-[11px] text-muted-foreground italic'>
                            {entry.rawText}
                          </div>
                        )}

                        {entry.warnings.length > 0 && (
                          <Alert variant='destructive'>
                            <AlertTitle className='text-xs font-semibold flex items-center gap-1'>
                              <AlertTriangle className='h-3.5 w-3.5' />
                              Review this note
                            </AlertTitle>
                            <AlertDescription className='text-xs space-y-1'>
                              {entry.warnings.map((warning) => (
                                <div key={`${entry.id}-${warning}`}>{warning}</div>
                              ))}
                            </AlertDescription>
                          </Alert>
                        )}

                        {entry.bundle && entry.bundle.ops.length > 0 && (
                          <div className='space-y-2'>
                            <span className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                              Proposed updates
                            </span>
                            <DeltaChecklist
                              operations={entry.bundle.ops}
                              selection={entry.selection}
                              onToggle={(index, checked) =>
                                onToggleOperation(entry.id, index, checked)
                              }
                              disabled={
                                entry.status === 'applied' ||
                                entry.status === 'applying' ||
                                !canApplyAutomation
                              }
                              renderDescription={renderDeltaDescription}
                              showRuleReference
                            />
                            <div className='flex flex-wrap items-center gap-2'>
                              {renderApplyButton(entry, {
                                className: 'w-full justify-center sm:w-auto sm:justify-start',
                              })}
                              {entry.result && (
                                <span className='text-[11px] text-muted-foreground'>
                                  {entry.result.appliedOps.length} applied
                                  {entry.result.skippedOps.length > 0
                                    ? ` / ${entry.result.skippedOps.length} skipped`
                                    : ''}
                                </span>
                              )}
                              {!canApplyAutomation && (
                                <span className='text-[11px] text-muted-foreground'>
                                  Automation is in read-only mode.
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {entry.errorMessage && (
                          <Alert variant='destructive'>
                            <AlertTitle className='text-xs font-semibold'>
                              Automation failed
                            </AlertTitle>
                            <AlertDescription className='text-xs'>
                              {entry.errorMessage}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
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

type CampaignVibe =
  | 'fantasy'
  | 'scifi'
  | 'cyberpunk'
  | 'horror'
  | 'western'
  | 'modern'

// Campaign Vibe System for Context-Aware Enhancement

interface VibeDefinition {
  name: string
  icon: LucideIcon
  tagline: string
  combatTerms: string[]
  injuryTerms: string[]
  discoveryTerms: string[]
  atmosphereTerms: string[]
  movementTerms: string[]
  interactionTerms: string[]
}

const campaignVibes: Record<CampaignVibe, VibeDefinition> = {
  fantasy: {
    name: 'High Fantasy',
    icon: Wand2,
    tagline: 'fantasy',
    description: 'Mythic quests and arcane wonders color every scene.',
    combatTerms: ['battle', 'combat', 'skirmish', 'duel', 'clash'],
    injuryTerms: ['wounds', 'injuries', 'harm', 'damage'],
    discoveryTerms: ['discovered', 'uncovered', 'found', 'revealed'],
    atmosphereTerms: [
      'ancient',
      'mystical',
      'shadowed',
      'gleaming',
      'enchanted',
    ],
    movementTerms: ['traveled to', 'journeyed to', 'ventured to', 'approached'],
    interactionTerms: [
      'spoke with',
      'conversed with',
      'addressed',
      'encountered',
    ],
  },
  scifi: {
    name: 'Science Fiction',
    icon: Orbit,
    tagline: 'sci-fi',
    description: 'Starships, synthwave skylines, and cosmic discovery.',
    combatTerms: ['firefight', 'engagement', 'conflict', 'encounter', 'battle'],
    injuryTerms: ['damage', 'injuries', 'trauma', 'harm'],
    discoveryTerms: ['detected', 'scanned', 'identified', 'located', 'found'],
    atmosphereTerms: [
      'metallic',
      'sterile',
      'pulsing',
      'synthetic',
      'technological',
    ],
    movementTerms: ['proceeded to', 'navigated to', 'accessed', 'approached'],
    interactionTerms: [
      'interfaced with',
      'communicated with',
      'contacted',
      'met',
    ],
  },
  cyberpunk: {
    name: 'Cyberpunk',
    icon: CircuitBoard,
    tagline: 'cyberpunk',
    description: 'Neon alleyways, data heists, and chrome grit.',
    combatTerms: ['gunfight', 'clash', 'throwdown', 'run', 'firefight'],
    injuryTerms: ['damage', 'hurt', 'pain', 'bleeding', 'trauma'],
    discoveryTerms: ['jacked', 'accessed', 'hacked', 'found', 'located'],
    atmosphereTerms: [
      'neon-lit',
      'rain-slicked',
      'corporate',
      'underground',
      'digital',
    ],
    movementTerms: ['slipped to', 'moved to', 'hit', 'accessed'],
    interactionTerms: [
      'interfaced with',
      'contacted',
      'met with',
      'connected to',
    ],
  },
  horror: {
    name: 'Horror',
    icon: Ghost,
    tagline: 'horror',
    description: 'Whispers in the dark and dread around every corner.',
    combatTerms: [
      'struggled against',
      'fought desperately',
      'battled',
      'resisted',
    ],
    injuryTerms: [
      'terrible wounds',
      'grievous harm',
      'injuries',
      'pain',
      'trauma',
    ],
    discoveryTerms: ['uncovered', 'revealed', 'exposed', 'witnessed', 'found'],
    atmosphereTerms: ['dark', 'foreboding', 'twisted', 'unnatural', 'ominous'],
    movementTerms: ['crept to', 'approached', 'ventured to', 'entered'],
    interactionTerms: ['encountered', 'faced', 'confronted', 'met'],
  },
  western: {
    name: 'Wild West',
    icon: Lasso,
    tagline: 'western',
    description: 'Frontier legends, dusk duels, and dusty trails.',
    combatTerms: ['shootout', 'gunfight', 'brawl', 'showdown', 'scuffle'],
    injuryTerms: ['wounds', 'injuries', 'hurt', 'bleeding', 'damage'],
    discoveryTerms: [
      'spotted',
      'found',
      'came across',
      'discovered',
      'noticed',
    ],
    atmosphereTerms: ['dusty', 'sun-baked', 'weathered', 'frontier', 'rugged'],
    movementTerms: ['rode to', 'headed to', 'made for', 'approached'],
    interactionTerms: [
      'spoke with',
      'palavered with',
      'met with',
      'encountered',
    ],
  },
  modern: {
    name: 'Modern Day',
    icon: Building2,
    tagline: 'modern',
    description: 'Current-day intrigue and grounded drama.',
    combatTerms: ['fight', 'confrontation', 'altercation', 'struggle', 'clash'],
    injuryTerms: ['injuries', 'hurt', 'harm', 'wounds', 'damage'],
    discoveryTerms: ['found', 'discovered', 'noticed', 'spotted', 'located'],
    atmosphereTerms: ['urban', 'contemporary', 'familiar', 'everyday', 'busy'],
    movementTerms: ['went to', 'headed to', 'drove to', 'approached'],
    interactionTerms: ['talked to', 'spoke with', 'met with', 'contacted'],
  },
}

const SLOT_LABELS: Record<string, string> = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  armor: 'Armor',
}

const COMPOSER_KEYWORDS = {
  gear: [
    'equip',
    'unequip',
    'weapon',
    'blade',
    'bow',
    'shield',
    'armor',
    'gear',
  ],
  stats: ['hp', 'damage', 'heal', 'wound', 'xp', 'level', 'mark xp'],
  spells: ['spell', 'ritual', 'cast', 'hold', 'arcane', 'magic'],
  bonds: ['bond', 'debility', 'relationship', 'ally', 'friend', 'connection'],
  notes: ['note', 'journal', 'record', 'log'],
} as const

const includesAny = (source: string, targets: readonly string[]) =>
  targets.some((target) => source.includes(target))

// Smart pattern-based note enhancement
function enhanceNote(note: string, vibe: CampaignVibe = 'fantasy'): string {
  if (note.length < 3) return note

  const vibeConfig = campaignVibes[vibe]
  let enhanced = note.toLowerCase().trim()

  // Track @ mentions for special handling
  const npcs: string[] = []
  const locations: string[] = []

  // Extract @ mentions before processing
  enhanced = enhanced.replace(/@(\w+)/g, (match, name) => {
    if (
      enhanced.includes(`at the @${name}`) ||
      enhanced.includes(`to @${name}`)
    ) {
      locations.push(name)
      return `${name}`
    } else {
      npcs.push(name)
      return `${name}`
    }
  })

  // Common patterns and their enhancements
  const patterns = [
    // @ mention patterns (run first)
    {
      pattern: /ran\s+into\s+(\w+)\s+at\s+(?:the\s+)?(\w+)/gi,
      replacement: (match: string, person: string, place: string) => {
        const placeDesc = getLocationDescription(place, vibeConfig)
        return `You encountered ${person} at the ${placeDesc} ${place}`
      },
    },
    {
      pattern: /met\s+(\w+)\s+at\s+(?:the\s+)?(\w+)/gi,
      replacement: (match: string, person: string, place: string) => {
        const placeDesc = getLocationDescription(place, vibeConfig)
        return `You met with ${person} at the ${placeDesc} ${place}`
      },
    },

    // Combat patterns
    {
      pattern:
        /\bfought?\s+([^,]+)(?:,\s*(?:got|took)\s+(?:hurt|dmg|damage))?/gi,
      replacement: (_match: string, enemy: string) =>
        `You engaged ${enemy.trim()} in ${getRandomTerm(vibeConfig.combatTerms)}, suffering ${getRandomTerm(vibeConfig.injuryTerms)} in the struggle`,
    },
    {
      pattern: /fought?\s+(.+)/gi,
      replacement: (match: string, enemy: string) =>
        `You engaged ${enemy.trim()} in fierce ${getRandomTerm(vibeConfig.combatTerms)}`,
    },

    // Discovery patterns
    {
      pattern: /found\s+(.+)/gi,
      replacement: (match: string, item: string) =>
        `You ${getRandomTerm(vibeConfig.discoveryTerms)} ${addArticle(item.trim())}`,
    },

    // Movement patterns
    {
      pattern: /(?:went|traveled)\s+to\s+(?:the\s+)?(\w+)/gi,
      replacement: (match: string, place: string) => {
        const placeDesc = getLocationDescription(place, vibeConfig)
        return `You ${getRandomTerm(vibeConfig.movementTerms)} the ${placeDesc} ${place}`
      },
    },

    // Interaction patterns
    {
      pattern: /talked?\s+(?:to|with)\s+(.+)/gi,
      replacement: (match: string, person: string) =>
        `You ${getRandomTerm(vibeConfig.interactionTerms)} ${person.trim()}`,
    },

    // Injury patterns
    {
      pattern: /(?:got|took)\s+(?:hurt|dmg|damage)/gi,
      replacement: () =>
        `You suffered ${getRandomTerm(vibeConfig.injuryTerms)}`,
    },

    // Success/failure patterns
    {
      pattern: /(?:failed|missed)\s+(.+)/gi,
      replacement: (match: string, action: string) =>
        `Your attempt to ${action.trim()} was unsuccessful`,
    },
    {
      pattern: /(?:succeeded|made)\s+(.+)/gi,
      replacement: (match: string, action: string) =>
        `You successfully ${action.trim()}`,
    },

    // Social encounter patterns
    {
      pattern: /ran\s+into\s+(.+)/gi,
      replacement: (match: string, person: string) =>
        `You unexpectedly encountered ${person.trim()}`,
    },
    {
      pattern: /met\s+(?:with\s+)?(.+)/gi,
      replacement: (match: string, person: string) =>
        `You met with ${person.trim()}`,
    },
  ]

  // Apply patterns in order
  let wasProcessed = false
  for (const { pattern, replacement } of patterns) {
    const originalLength = enhanced.length
    enhanced = enhanced.replace(pattern, replacement)
    if (enhanced.length !== originalLength) {
      wasProcessed = true
    }
  }

  // If no patterns matched, add atmospheric flavor
  if (!wasProcessed && enhanced.length > 10) {
    enhanced = addAtmosphericFlavor(enhanced, vibeConfig)
  }

  // Basic formatting
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1)
  if (!/[.!?]$/.test(enhanced)) {
    enhanced += '.'
  }

  return enhanced
}

// Helper functions
function getRandomTerm(terms: string[]): string {
  return terms[Math.floor(Math.random() * terms.length)]
}

function addArticle(noun: string): string {
  if (
    noun.startsWith('the ') ||
    noun.startsWith('a ') ||
    noun.startsWith('an ')
  ) {
    return noun
  }
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const firstLetter = noun.charAt(0).toLowerCase()
  return vowels.includes(firstLetter) ? `an ${noun}` : `a ${noun}`
}

function getLocationDescription(
  location: string,
  vibeConfig: VibeDefinition,
): string {
  const locationName = location.toLowerCase()

  // Common location types with vibe-appropriate descriptors
  const locationMap: Record<string, string[]> = {
    tavern:
      vibeConfig.name === 'High Fantasy'
        ? ['bustling', 'warm', 'crowded']
        : vibeConfig.name === 'Cyberpunk'
          ? ['neon-lit', 'smoky', 'underground']
          : vibeConfig.name === 'Horror'
            ? ['dimly lit', 'shadowy', 'ominous']
            : vibeConfig.name === 'Wild West'
              ? ['dusty', 'frontier', 'rowdy']
              : vibeConfig.name === 'Science Fiction'
                ? ['sterile', 'metallic', 'synthetic']
                : ['busy', 'local', 'familiar'],

    inn:
      vibeConfig.name === 'High Fantasy'
        ? ['cozy', 'welcoming', 'ancient']
        : vibeConfig.name === 'Cyberpunk'
          ? ['run-down', 'neon-signed', 'corporate']
          : vibeConfig.name === 'Horror'
            ? ['abandoned', 'creaking', 'foreboding']
            : vibeConfig.name === 'Wild West'
              ? ['frontier', 'weathered', 'dusty']
              : vibeConfig.name === 'Science Fiction'
                ? ['automated', 'sterile', 'chrome']
                : ['comfortable', 'local', 'welcoming'],

    shop:
      vibeConfig.name === 'High Fantasy'
        ? ['cluttered', 'mystical', 'enchanted']
        : vibeConfig.name === 'Cyberpunk'
          ? ['black market', 'underground', 'digital']
          : vibeConfig.name === 'Horror'
            ? ['abandoned', 'dusty', 'cursed']
            : vibeConfig.name === 'Wild West'
              ? ['general', 'frontier', 'weathered']
              : vibeConfig.name === 'Science Fiction'
                ? ['automated', 'holographic', 'synthetic']
                : ['corner', 'neighborhood', 'busy'],

    market:
      vibeConfig.name === 'High Fantasy'
        ? ['bustling', 'colorful', 'magical']
        : vibeConfig.name === 'Cyberpunk'
          ? ['black', 'underground', 'data']
          : vibeConfig.name === 'Horror'
            ? ['abandoned', 'ghostly', 'empty']
            : vibeConfig.name === 'Wild West'
              ? ['frontier', 'trading', 'dusty']
              : vibeConfig.name === 'Science Fiction'
                ? ['orbital', 'automated', 'digital']
                : ['farmers', 'weekend', 'local'],
  }

  // Check for common location types
  for (const [type, descriptors] of Object.entries(locationMap)) {
    if (locationName.includes(type)) {
      return getRandomTerm(descriptors)
    }
  }

  // Default to atmospheric term
  return getRandomTerm(vibeConfig.atmosphereTerms)
}

function addAtmosphericFlavor(
  text: string,
  vibeConfig: VibeDefinition,
): string {
  const atmosphericPrefix = getRandomTerm(vibeConfig.atmosphereTerms)

  // Add subtle atmospheric enhancement without changing core meaning
  if (text.length < 20) {
    return `In the ${atmosphericPrefix} surroundings, ${text}`
  }

  return text
}

export const PlayTab: React.FC<PlayTabProps> = ({
  className = '',
}) => {
  const llmUnifiedEnabled = useMemo(() => isLlmUnifiedEnabled(), [])
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const autoLogDiceRolls = useDiceStore(
    (state) => state.settings.autoLogToChronicle ?? true,
  )
  const currentRoll = useDiceStore((state) => state.currentRoll)

  const deltaHistory = useChronicleStore((state) => state.deltaHistory)
  const clearDeltaLog = useChronicleStore((state) => state.clearDeltaLog)
  const recentDeltaHistory = useMemo(
    () => deltaHistory.slice(0, 5),
    [deltaHistory],
  )
  const [undoingBundleId, setUndoingBundleId] = useState<string | null>(null)
  const [isAutomationGuardDismissed, setIsAutomationGuardDismissed] =
    useState(false)
  const isTauriRuntime = useIsTauriRuntime()
  const showAutomationGuard = !isTauriRuntime && !isAutomationGuardDismissed
  const chronicleTextareaRef = useRef<HTMLTextAreaElement>(null)
  const lastLoggedRollId = useRef<string | null>(null)

  const {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    settings,
    updateSettings: _updateSettings,
    canApplyAutomation,
    canAutoApply,
  } = useChronicleLLM()

  const handleUndoBundle = useCallback(
    async (bundleId: string) => {
      setUndoingBundleId(bundleId)
      try {
        const success = await undoChronicleBundle(bundleId)
        if (!success) {
          console.warn(`[chronicle] Unable to undo bundle ${bundleId}`)
          return
        }
        clearDeltaLog(bundleId)
      } catch (error) {
        console.error('[chronicle] Undo bundle failed', error)
      } finally {
        setUndoingBundleId(null)
      }
    },
    [clearDeltaLog],
  )

  const [campaignVibe, setCampaignVibe] = useState<CampaignVibe>('fantasy')
  const vibeConfig = campaignVibes[campaignVibe]
  const VibeIcon = vibeConfig.icon
  const [transientFolioHighlight, setTransientFolioHighlight] =
    useState<FolioHighlight | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Chronicle state
  const [chronicleText, setChronicleText] = useState('')
  const [chronicleEntries, setChronicleEntries] = useState<
    ChronicleEntryView[]
  >([])
  const entriesRef = useRef<ChronicleEntryView[]>([])
  const [pendingDiceContext, setPendingDiceContext] =
    useState<DiceRollContext | null>(null)

  useEffect(() => {
    entriesRef.current = chronicleEntries
  }, [chronicleEntries])

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  // Chronicle automation helpers
  const updateEntry = useCallback(
    (
      entryId: string,
      updater:
        | Partial<ChronicleEntryView>
        | ((entry: ChronicleEntryView) => ChronicleEntryView),
    ) => {
      setChronicleEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== entryId) return entry
          if (typeof updater === 'function')
            return (
              updater as (entry: ChronicleEntryView) => ChronicleEntryView
            )(entry)
          return { ...entry, ...updater }
        }),
      )
    },
    [],
  )

  const resolveCharacterName = useCallback(
    (characterId?: string) => {
      if (
        !characterId ||
        characterId === '.' ||
        characterId === 'active_character'
      ) {
        return activeCharacter?.name ?? 'your character'
      }
      if (activeCharacter?.id && characterId === activeCharacter.id) {
        return activeCharacter.name
      }
      return characterId
    },
    [activeCharacter?.id, activeCharacter?.name],
  )

  const describeDeltaOperation = useCallback(
    (op: DeltaOperation) => {
      return formatDeltaOperation(op, resolveCharacterName)
    },
    [resolveCharacterName],
  )

  const buildSelectionMap = useCallback(
    (ops: DeltaOperation[], warnings: string[]) => {
      const selection: Record<number, boolean> = {}
      const hasWarnings = warnings.length > 0
      ops.forEach((op, index) => {
        if (!canAutoApply || hasWarnings) {
          selection[index] = false
          return
        }
        const policy = settings?.autoApplyPolicy?.[op.type] ?? 'confirm'
        selection[index] = policy === 'auto'
      })
      return selection
    },
    [canAutoApply, settings?.autoApplyPolicy],
  )

  const flashFolioHighlight = useCallback(
    (highlight: FolioHighlight, duration = 3000) => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      setTransientFolioHighlight({ ...highlight, focus: true })
      highlightTimeoutRef.current = setTimeout(() => {
        setTransientFolioHighlight(null)
      }, duration)
    },
    [],
  )

  useEffect(() => {
    const handler: EventListener = (event) => {
      const customEvent = event as CustomEvent<BondReminderFocusDetail>
      const levelLabel =
        typeof customEvent.detail?.level === 'number'
          ? `Level ${customEvent.detail.level}: revisit bonds`
          : 'Review bonds after level up'
      flashFolioHighlight(
        {
          page: 'bonds',
          label: levelLabel,
          focus: true,
        },
        6000,
      )
    }

    window.addEventListener(BOND_REMINDER_FOCUS_EVENT, handler)
    return () => {
      window.removeEventListener(BOND_REMINDER_FOCUS_EVENT, handler)
    }
  }, [flashFolioHighlight])

  const composerHighlight = useMemo<FolioHighlight | null>(() => {
    if (pendingDiceContext) {
      return { page: 'stats', label: 'Dice roll in progress', focus: false }
    }
    const trimmed = chronicleText.trim()
    if (!trimmed) return null
    const lower = chronicleText.toLowerCase()

    if (/@\w+/.test(trimmed)) {
      return { page: 'notes', label: 'Mention detected', focus: true }
    }
    if (includesAny(lower, COMPOSER_KEYWORDS.gear)) {
      return { page: 'gear', label: 'Gear keywords detected', focus: false }
    }
    if (includesAny(lower, COMPOSER_KEYWORDS.stats)) {
      return { page: 'stats', label: 'Stat keywords detected', focus: false }
    }
    if (includesAny(lower, COMPOSER_KEYWORDS.spells)) {
      return { page: 'spells', label: 'Spell keywords detected', focus: false }
    }
    if (includesAny(lower, COMPOSER_KEYWORDS.bonds)) {
      return { page: 'bonds', label: 'Bond keywords detected', focus: false }
    }
    if (includesAny(lower, COMPOSER_KEYWORDS.notes)) {
      return { page: 'notes', label: 'Note keywords detected', focus: false }
    }
    return null
  }, [chronicleText, pendingDiceContext])

  const folioHighlight: FolioHighlight | null =
    transientFolioHighlight ?? composerHighlight

  const handleNoteCreated = useCallback(
    (noteTitle?: string) => {
      const label = noteTitle ? `Saved note: ${noteTitle}` : 'Note saved'
      flashFolioHighlight({ page: 'notes', label, focus: true })
    },
    [flashFolioHighlight],
  )

  const handleFolioEquipmentChange = useCallback(
    ({ slot, action, itemName }: EquipmentChange) => {
      const slotLabel = SLOT_LABELS[slot] ?? slot
      const baseName = itemName ?? 'item'
      const label =
        action === 'equip'
          ? `Equipped ${baseName} (${slotLabel})`
          : `Unequipped ${baseName} (${slotLabel})`
      flashFolioHighlight({ page: 'gear', label, focus: true })
    },
    [flashFolioHighlight],
  )

  const shouldAutoApplyBundle = useCallback(
    (
      bundle: ProposedDeltaBundle,
      selection: Record<number, boolean>,
      warnings: string[],
    ) => {
      if (!canAutoApply) return false
      if (warnings.length > 0) return false
      if (bundle.ops.length === 0) return false
      return bundle.ops.every((_, index) => selection[index])
    },
    [canAutoApply],
  )

  const toggleOperationSelection = useCallback(
    (entryId: string, index: number, checked: boolean) => {
      updateEntry(entryId, (entry) => ({
        ...entry,
        selection: { ...entry.selection, [index]: checked },
        status: entry.status === 'applied' ? entry.status : 'ready',
        errorMessage: undefined,
      }))
    },
    [updateEntry],
  )

  const applyBundleForEntry = useCallback(
    async (entryId: string, { auto }: { auto?: boolean } = {}) => {
      const entrySnapshot = entriesRef.current.find(
        (entry) => entry.id === entryId,
      )
      if (!entrySnapshot || !entrySnapshot.bundle) {
        updateEntry(entryId, (entry) => ({
          ...entry,
          status: 'error',
          errorMessage: 'No delta bundle available for this entry.',
        }))
        return
      }

      const selectedIndices = Object.entries(entrySnapshot.selection)
        .filter(([, value]) => value)
        .map(([index]) => Number(index))
        .sort((a, b) => a - b)

      if (selectedIndices.length === 0) {
        updateEntry(entryId, (entry) => ({
          ...entry,
          status: 'ready',
          errorMessage: 'Select at least one update to apply.',
        }))
        return
      }

      if (!canApplyAutomation) {
        updateEntry(entryId, (entry) => ({
          ...entry,
          status: 'error',
          errorMessage:
            'Automation is currently in read-only mode. Review updates in Chronicle before applying.',
        }))
        return
      }

      updateEntry(entryId, (entry) => ({
        ...entry,
        status: 'applying',
        errorMessage: undefined,
      }))

      try {
        const result = await applyDeltaBundle({
          bundle: entrySnapshot.bundle,
          autoApply: Boolean(auto && canAutoApply),
          selectedOpIndices: selectedIndices,
        })

        updateEntry(entryId, (entry) => ({
          ...entry,
          status: 'applied',
          result,
          errorMessage: undefined,
        }))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to apply bundle.'
        updateEntry(entryId, (entry) => ({
          ...entry,
          status: 'error',
          errorMessage: message,
        }))
      }
    },
    [applyDeltaBundle, canApplyAutomation, canAutoApply, updateEntry],
  )

  const addChronicleEntry = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim()
      if (!trimmed) return

      const entryId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10)
      const createdAt = new Date()

      const baseEntry: ChronicleEntryView = {
        id: entryId,
        rawText: trimmed,
        createdAt,
        warnings: [],
        status: 'proposing',
        selection: {},
      }

      setChronicleEntries((prev) => [...prev, baseEntry])
      setChronicleText('')

      const previous = [...entriesRef.current]
        .reverse()
        .find((entry) => entry.status === 'applied' || entry.status === 'ready')

      const context = previous
        ? {
            previousEntry: {
              id: previous.id,
              rawText: previous.rawText,
              timestamp: previous.createdAt.toISOString(),
            },
          }
        : undefined

      try {
        const { bundle, warnings } = await proposeEntryDeltas({
          entryId,
          rawText: trimmed,
          context,
        })

        const selection = buildSelectionMap(bundle.ops, warnings)
        const auto = shouldAutoApplyBundle(bundle, selection, warnings)
        const narrative =
          bundle.narrative?.trim() || enhanceNote(trimmed, campaignVibe)

        updateEntry(entryId, (entry) => ({
          ...entry,
          narrative,
          bundle,
          warnings,
          selection,
          status: auto && canApplyAutomation ? 'applying' : 'ready',
          errorMessage: undefined,
        }))

        if (auto && canApplyAutomation) {
          await applyBundleForEntry(entryId, { auto: true })
        }
      } catch (error) {
        const narrative = enhanceNote(trimmed, campaignVibe)
        const message =
          error instanceof Error ? error.message : 'Failed to parse note.'

        updateEntry(entryId, (entry) => ({
          ...entry,
          narrative,
          warnings: [],
          status: 'error',
          errorMessage: message,
        }))
      } finally {
        setTimeout(() => {
          if (chronicleTextareaRef.current) {
            chronicleTextareaRef.current.scrollTop =
              chronicleTextareaRef.current.scrollHeight
          }
        }, 100)
      }
    },
    [
      applyBundleForEntry,
      buildSelectionMap,
      campaignVibe,
      canApplyAutomation,
      proposeEntryDeltas,
      shouldAutoApplyBundle,
      updateEntry,
    ],
  )

  const _handleDiceRoll = (roll: {
    finalResult: number
    modifier: number
    outcome: string
  }) => {
    const diceContext: DiceRollContext = {
      id: Math.random().toString(36).substr(2, 9),
      result: roll.finalResult,
      modifier: roll.modifier,
      stat: 'move',
      timestamp: new Date(),
      outcome: roll.outcome,
    }
    setPendingDiceContext(diceContext)
  }

  const _completeDiceContext = (context: string, outcome: string) => {
    if (pendingDiceContext) {
      const rollText = `${context} (${pendingDiceContext.stat} roll: ${pendingDiceContext.result}) - ${outcome}`
      void addChronicleEntry(rollText)
      setPendingDiceContext(null)
    }
  }

  useEffect(() => {
    if (!autoLogDiceRolls) {
      return
    }

    if (!currentRoll) {
      return
    }

    if (lastLoggedRollId.current === currentRoll.id) {
      return
    }

    if (activeCharacter?.id && currentRoll.characterId !== activeCharacter.id) {
      return
    }

    lastLoggedRollId.current = currentRoll.id
    const summary = formatRollSummary(currentRoll)
    void addChronicleEntry(summary)
  }, [autoLogDiceRolls, currentRoll, activeCharacter?.id, addChronicleEntry])

  if (!activeCharacter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('p-4', className)}
      >
        <Card variant='magical'>
          <CardContent className='p-6 pt-6'>
            <div className='space-y-4 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                <BookOpen size={24} className='text-muted-foreground' />
              </div>
              <div>
                <h2 className='mb-2 text-lg font-display'>
                  Ready to Chronicle?
                </h2>
                <p className='mb-4 text-sm text-muted-foreground'>
                  Create or select a character to begin your storytelling
                  adventure
                </p>
                <Button variant='primary' size='sm'>
                  Create Character
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col overflow-x-hidden bg-background',
        className,
      )}
    >
      <SplitPane
        className='flex-1 min-h-0 gap-4 overflow-hidden p-4 md:p-6'
        showGutter={false}
        left={
          <Folio
            highlight={folioHighlight}
            onNoteCreated={handleNoteCreated}
            onEquipmentChange={handleFolioEquipmentChange}
            className='h-full min-h-0'
          />
        }
        right={
          <RightRail
            className='h-full min-h-0'
            header={
              <div className='space-y-4 px-6'>
                {/* Always-visible latest roll summary with expandable history */}
                <div className='space-y-3'>
                  {/* Dice Roll HUD - Recent rolls and outcomes */}
                  <motion.div 
                    className='w-full'
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <RollHUD characterId={activeCharacter?.id} className='w-full' />
                  </motion.div>
                  {/* Story Chronicle Bar - Recent narrative entries */}
                  <motion.div 
                    className='w-full'
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <RecentStoryBar
                      entries={chronicleEntries}
                      onToggleOperation={toggleOperationSelection}
                      onApply={applyBundleForEntry}
                      isApplyingBundle={isApplyingBundle}
                      canApplyAutomation={canApplyAutomation}
                      renderDeltaDescription={describeDeltaOperation}
                      className='w-full'
                    />
                  </motion.div>
                </div>
                
                <AutomationStatusChip />
              </div>
            }
          >
            <div className='flex h-full min-h-0 flex-col overflow-hidden'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key='chronicle'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='flex h-full min-h-0 flex-col overflow-y-auto p-6'
                >
                    {/* Chronicle Canvas - Compact input area */}
                    <div className='mb-6'>
                      <Card variant='parchment'>
                        <CardContent className='space-y-4 p-4'>
                          <div className='flex flex-wrap items-center justify-between gap-3'>
                            <div className='flex flex-wrap items-center gap-2 md:gap-3'>
                              <div className='flex items-center gap-2'>
                                <Scroll size={18} className='text-primary' />
                                <div className='flex flex-col gap-1 md:flex-row md:items-center md:gap-3'>
                                  <div>
                                    <h2 className='text-lg font-display leading-tight'>
                                      Chronicle
                                    </h2>
                                    <p className='text-xs text-muted-foreground'>
                                      {vibeConfig.description}
                                    </p>
                                  </div>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                    <span className='font-semibold uppercase tracking-wide text-[11px]'>
                                      Tone
                                    </span>
                                    <Select
                                      value={campaignVibe}
                                      onValueChange={(value) =>
                                        setCampaignVibe(value as CampaignVibe)
                                      }
                                    >
                                      <SelectTrigger className='h-8 min-w-[160px] items-center gap-2 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-card/90 focus:outline-none focus:ring-2 focus:ring-primary/40'>
                                        <SelectValue placeholder='Tone'>
                                          <span className='flex items-center gap-2 text-[11px] uppercase tracking-wide'>
                                            <VibeIcon className='size-4 text-primary' aria-hidden='true' />
                                            {vibeConfig.tagline}
                                          </span>
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className='w-[220px] rounded-md border border-border bg-card text-foreground shadow-lg'>
                                        {Object.entries(campaignVibes).map(([key, config]) => {
                                          const Icon = config.icon
                                          return (
                                            <SelectItem key={key} value={key} className='text-xs'>
                                              <span className='flex w-full items-center gap-2 uppercase tracking-wide'>
                                                <Icon className='size-4 text-primary/80' aria-hidden='true' />
                                                {config.tagline}
                                              </span>
                                            </SelectItem>
                                          )
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant='secondary' className='text-xs self-start'>
                              {chronicleEntries.length} entries logged
                            </Badge>
                          </div>

                          {/* Chronicle Text Area */}
                          <div className='space-y-3'>
                            <Textarea
                              ref={chronicleTextareaRef}
                              value={chronicleText}
                              onChange={(e) => setChronicleText(e.target.value)}
                              placeholder="What happens in your adventure? Write your story here...

Tip: Write naturally - 'fought goblins, got hurt' becomes 'You battled the goblin raiders, suffering wounds in the fierce struggle.'"
                              className='resize-none text-sm leading-relaxed font-serif min-h-[180px]'
                            />


                            <div className='flex items-center justify-between'>
                              <Button
                                onClick={() =>
                                  void addChronicleEntry(chronicleText)
                                }
                                disabled={!chronicleText.trim() || isProposing}
                                className='gap-2'
                                size='sm'
                              >
                                {isProposing ? (
                                  <>
                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                    Parsing...
                                  </>
                                ) : (
                                  <>
                                    <Send size={14} />
                                    Add to Chronicle
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Entries & Dice Context */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                      <div className='space-y-6'>
                        {/* Automation Log */}
                        {llmUnifiedEnabled && (
                          <Card variant='surface'>
                            <CardContent className='p-4'>
                              <div className='flex items-center justify-between mb-3'>
                                <h3 className='font-semibold flex items-center gap-2'>
                                  <Sparkles size={16} />
                                  Automation Log
                                </h3>
                                <span className='text-xs text-muted-foreground'>
                                  Last
                                  {Math.min(recentDeltaHistory.length, 5)}{' '}
                                  bundles
                                </span>
                              </div>
                              {showAutomationGuard && (
                                <Alert
                                  variant='destructive'
                                  className='mb-3 border-destructive/40 bg-destructive/10'
                                >
                                  <ShieldAlert className='h-4 w-4 text-destructive' />
                                  <AlertTitle className='text-sm font-semibold text-destructive'>
                                    Desktop bridge unavailable
                                  </AlertTitle>
                                  <AlertDescription className='space-y-2 text-xs text-destructive/90'>
                                    <p>
                                      Chronicle automations need the Tauri
                                      desktop bridge. Launch the desktop shell
                                      to enable live Chronicle updates.
                                    </p>
                                    <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide'>
                                      <span className='rounded bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive'>
                                        npm run dev:tauri
                                      </span>
                                      <Button
                                        size='sm'
                                        variant='ghost'
                                        className='h-7 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                                        onClick={() =>
                                          setIsAutomationGuardDismissed(true)
                                        }
                                      >
                                        Dismiss
                                      </Button>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              )}
                              {recentDeltaHistory.length === 0 ? (
                                <div className='text-sm text-muted-foreground'>
                                  Run a Dungeon World move or jot a note to see
                                  Chronicle's updates.
                                </div>
                              ) : (
                                <div className='space-y-3 max-h-72 overflow-y-auto'>
                                  {recentDeltaHistory.map((log) => {
                                    const createdAt = new Date(log.createdAt)
                                    const appliedCount = log.appliedOps.length
                                    const skippedCount = log.skippedOps.length
                                    const statusVariant: BadgeProps['variant'] =
                                      skippedCount > 0
                                        ? 'warning'
                                        : appliedCount > 0
                                          ? 'success'
                                          : 'secondary'
                                    return (
                                       <div
                                        key={log.bundleId}
                                        className='rounded-md border-2 border-border bg-card p-3'
                                      >
                                        <div className='flex flex-wrap items-center justify-between gap-2'>
                                          <div className='space-y-0.5'>
                                            <div className='text-xs text-muted-foreground'>
                                              {createdAt.toLocaleTimeString()}
                                            </div>
                                            <div className='text-sm font-medium leading-tight'>
                                              Entry
                                              {log.entryId}
                                            </div>
                                          </div>
                                          <Badge
                                            variant={statusVariant}
                                            className='text-[10px] uppercase tracking-wide'
                                          >
                                            {appliedCount} applied
                                            {skippedCount > 0
                                              ? ` / ${skippedCount} skipped`
                                              : ''}
                                          </Badge>
                                        </div>
                                        {log.appliedOps.length > 0 && (
                                          <div className='mt-2'>
                                            <DeltaChecklist
                                              operations={log.appliedOps}
                                              renderDescription={
                                                describeDeltaOperation
                                              }
                                              variant='readOnly'
                                              size='compact'
                                              showRuleReference
                                              className='space-y-1'
                                              itemClassName='bg-transparent border-border/40'
                                            />
                                          </div>
                                        )}
                                        {skippedCount > 0 && (
                                          <Alert className='mt-3 border-border/60 bg-muted/30'>
                                            <AlertTitle className='text-xs font-semibold'>
                                              Skipped
                                            </AlertTitle>
                                            <AlertDescription className='text-xs space-y-0.5'>
                                              <DeltaChecklist
                                                operations={log.skippedOps}
                                                renderDescription={
                                                  describeDeltaOperation
                                                }
                                                variant='readOnly'
                                                size='compact'
                                                showRuleReference
                                                className='space-y-1'
                                                itemClassName='bg-transparent border-none p-0'
                                              />
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                                          <Button
                                            size='sm'
                                            variant='outline'
                                            disabled={
                                              !log.undoHandle ||
                                              undoingBundleId === log.bundleId
                                            }
                                            onClick={() =>
                                              void handleUndoBundle(
                                                log.bundleId,
                                              )
                                            }
                                            className='h-8 gap-2 px-3 text-xs'
                                          >
                                            {undoingBundleId ===
                                            log.bundleId ? (
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
                                          <Button
                                            size='sm'
                                            variant='ghost'
                                            disabled={
                                              undoingBundleId === log.bundleId
                                            }
                                            onClick={() =>
                                              clearDeltaLog(log.bundleId)
                                            }
                                            className='h-8 px-2 text-xs text-muted-foreground hover:text-foreground'
                                          >
                                            Dismiss
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                    </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </RightRail>
        }
      />
    </div>
  )
}

export default PlayTab
