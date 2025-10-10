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
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Crown,
  Loader2,
  RefreshCcw,
  Scroll,
  Send,
  ShieldAlert,
  Sparkles,
  Sword,
  User,
  Wrench,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Folio from '@/components/game/CharacterSheet/Folio'
import { RightRail, SplitPane } from '@/components/layout'
import { cn } from '@/lib/utils'
import { isLlmUnifiedEnabled } from '@/utils/featureFlags'
import {
  describeDeltaOperation as formatDeltaOperation,
  undoChronicleBundle,
} from '../../services/chronicle'
import { useCharacterStore } from '../../stores/characterStore'
import { useChronicleStore } from '../../stores/chronicleStore'
import { useChronicleLLM } from '../chronicle/ChronicleProvider'
import { DeltaChecklist } from '../chronicle/DeltaChecklist'
import { Badge, Button, Card, CardContent, Input, Textarea } from '../ui'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

interface DiceRollContext {
  id: string
  result: number
  modifier: number
  stat: string
  timestamp: Date
  context?: string
  outcome?: string
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

interface CreatedItem {
  id: string
  name: string
  tags: string[]
  description: string
  stats?: string
}

interface CreatedNPC {
  id: string
  name: string
  appearance: string
  drive: string
  quirk: string
  voice: string
  knows: string
}

interface CreatedMonster {
  id: string
  name: string
  hp: number
  armor: number
  damage: string
  instinct: string
  moves: string[]
}

type CampaignVibe =
  | 'fantasy'
  | 'scifi'
  | 'cyberpunk'
  | 'horror'
  | 'western'
  | 'modern'

interface AutomationSummary {
  label: string
  message: string
  badgeVariant: 'default' | 'destructive' | 'outline' | 'success' | 'warning' | 'secondary'
  alertVariant: 'default' | 'destructive'
  icon: React.ComponentType<{ className?: string }>
  spinning?: boolean
}

// Campaign Vibe System for Context-Aware Enhancement

interface VibeDefinition {
  name: string
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

// Mock AI assistance for creators (in real app would be actual AI)
function createItem(input: string): CreatedItem {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('sword')) {
    return {
      id,
      name: 'Forged Blade',
      tags: ['close', 'sharp'],
      description: 'A well-crafted sword with a keen edge and sturdy grip.',
      stats: '1d8 damage, close',
    }
  }

  return {
    id,
    name: input || 'Mysterious Item',
    tags: ['item'],
    description: 'An interesting item with unknown properties.',
    stats: 'Special properties unknown',
  }
}

function createNPC(input: string): CreatedNPC {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('merchant')) {
    return {
      id,
      name: 'Aldric Coinworth',
      appearance: 'A portly man with calculating eyes and fine clothes',
      drive: 'To profit from every transaction',
      quirk: 'Always counts coins twice',
      voice: 'Smooth and persuasive, with a slight wheeze',
      knows: 'Trade routes, valuable goods, local customs',
    }
  }

  return {
    id,
    name: input || 'Unnamed Person',
    appearance: 'An ordinary-looking individual',
    drive: 'To live their daily life',
    quirk: 'Has a memorable mannerism',
    voice: 'Speaks in a distinctive way',
    knows: 'Local gossip and common knowledge',
  }
}

function createMonster(input: string): CreatedMonster {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('goblin')) {
    return {
      id,
      name: 'Goblin Raider',
      hp: 6,
      armor: 1,
      damage: '1d6',
      instinct: 'To raid and pillage',
      moves: [
        'Swarm with numbers',
        'Strike from shadows',
        'Flee when outnumbered',
      ],
    }
  }

  return {
    id,
    name: input || 'Unknown Creature',
    hp: 8,
    armor: 0,
    damage: '1d6',
    instinct: 'To survive',
    moves: ['Fight when cornered', 'Protect territory', 'Seek sustenance'],
  }
}

export const PlayTab: React.FC<PlayTabProps> = ({ className = '' }) => {
  const llmUnifiedEnabled = useMemo(() => isLlmUnifiedEnabled(), [])
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const deltaHistory = useChronicleStore((state) => state.deltaHistory)
  const clearDeltaLog = useChronicleStore((state) => state.clearDeltaLog)
  const recentDeltaHistory = useMemo(
    () => deltaHistory.slice(0, 5),
    [deltaHistory],
  )
  const [undoingBundleId, setUndoingBundleId] = useState<string | null>(null)
  const [isAutomationGuardDismissed, setIsAutomationGuardDismissed] =
    useState(false)
  const tauriBridge =
    typeof window !== 'undefined'
      ? (window as typeof window & { __TAURI__?: unknown })
      : undefined
  const isTauriRuntime = Boolean(tauriBridge?.__TAURI__)
  const showAutomationGuard = !isTauriRuntime && !isAutomationGuardDismissed
  const chronicleTextareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    proposeEntryDeltas,
    applyDeltaBundle,
    isProposing,
    isApplyingBundle,
    lastProgressEvent,
    lastTelemetryEvent,
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

  // New state for Immersive Storyteller Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('chronicle')
  const [toolsSubTab, setToolsSubTab] = useState<ToolsSubTab>('items')
  const [campaignVibe, setCampaignVibe] = useState<CampaignVibe>('fantasy')
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

  // Tool creation state
  const [itemInput, setItemInput] = useState('')
  const [npcInput, setNpcInput] = useState('')
  const [monsterInput, setMonsterInput] = useState('')
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([])
  const [createdNPCs, setCreatedNPCs] = useState<CreatedNPC[]>([])
  const [createdMonsters, setCreatedMonsters] = useState<CreatedMonster[]>([])

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

  const automationStatus = useMemo<AutomationSummary | null>(() => {
    const progressStage = lastProgressEvent?.stage
    const progressMessage =
      lastProgressEvent?.message ??
      (lastProgressEvent as { text?: string } | null)?.text ??
      ''

    if (!canApplyAutomation) {
      return {
        label: 'Automation read-only',
        message:
          'Chronicle automations are in dark-launch review mode. Apply and undo actions are disabled.',
        badgeVariant: 'warning',
        alertVariant: 'default',
        icon: ShieldAlert,
        spinning: false,
      }
    }

    if (progressStage === 'error') {
      return {
        label: 'Automation error',
        message:
          progressMessage || 'Chronicle could not apply the last update.',
        badgeVariant: 'destructive',
        alertVariant: 'destructive',
        icon: AlertTriangle,
        spinning: false,
      }
    }

    if (isApplyingBundle) {
      return {
        label: 'Applying updates',
        message: progressMessage || 'Syncing selected deltas to your sheet.',
        badgeVariant: 'warning',
        alertVariant: 'default',
        icon: Loader2,
        spinning: true,
      }
    }

    if (isProposing) {
      return {
        label: 'Drafting deltas',
        message: progressMessage || 'GPT-5 is parsing the latest note.',
        badgeVariant: 'secondary',
        alertVariant: 'default',
        icon: Sparkles,
        spinning: false,
      }
    }

    if (lastProgressEvent) {
      const stageLabel = lastProgressEvent.stage
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
      return {
        label: stageLabel,
        message: progressMessage,
        badgeVariant: 'secondary',
        alertVariant: 'default',
        icon: Sparkles,
        spinning: false,
      }
    }

    if (lastTelemetryEvent) {
      const latency = `${Math.round(lastTelemetryEvent.latencyMs)} ms`
      const tokens = `${lastTelemetryEvent.usage.totalTokens} tokens`
      return {
        label: 'Automation ready',
        message: `${latency} / ${tokens}`,
        badgeVariant: 'success',
        alertVariant: 'default',
        icon: CheckCircle2,
        spinning: false,
      }
    }

    return null
  }, [
    canApplyAutomation,
    isApplyingBundle,
    isProposing,
    lastProgressEvent,
    lastTelemetryEvent,
  ])

  const automationBanner = useMemo(() => {
    if (!automationStatus) return null

    const Icon = automationStatus.icon

    return (
      <Alert variant={automationStatus.alertVariant} className='shadow-sm'>
        <Icon
          className={
            automationStatus.spinning ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
          }
        />
        <AlertTitle className='text-sm font-semibold'>
          {automationStatus.label}
        </AlertTitle>
        {automationStatus.message && (
          <AlertDescription className='text-sm'>
            {automationStatus.message}
          </AlertDescription>
        )}
      </Alert>
    )
  }, [automationStatus])

  // Tool creation functions
  // Tool creation functions
  const handleCreateItem = () => {
    if (!itemInput.trim()) return
    const item = createItem(itemInput)
    setCreatedItems((prev) => [...prev, item])
    setItemInput('')
  }

  const handleCreateNPC = () => {
    if (!npcInput.trim()) return
    const npc = createNPC(npcInput)
    setCreatedNPCs((prev) => [...prev, npc])
    setNpcInput('')
  }

  const handleCreateMonster = () => {
    if (!monsterInput.trim()) return
    const monster = createMonster(monsterInput)
    setCreatedMonsters((prev) => [...prev, monster])
    setMonsterInput('')
  }

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
        'flex h-screen flex-col overflow-hidden bg-background',
        className,
      )}
    >
      <SplitPane
        className='flex-1 gap-4 overflow-hidden p-4 md:p-6'
        left={
          <Folio
            highlight={folioHighlight}
            onNoteCreated={handleNoteCreated}
            onEquipmentChange={handleFolioEquipmentChange}
            className='h-full'
          />
        }
        right={
          <RightRail
            className='h-full'
            header={
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    variant={activeTab === 'chronicle' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('chronicle')}
                    className='flex items-center gap-2 rounded-md border-b-2 border-transparent data-[active]:border-primary'
                    data-active={activeTab === 'chronicle'}
                  >
                    <BookOpen size={16} />
                    Chronicle
                  </Button>
                  <Button
                    variant={activeTab === 'tools' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('tools')}
                    className='flex items-center gap-2 rounded-md border-b-2 border-transparent data-[active]:border-primary'
                    data-active={activeTab === 'tools'}
                  >
                    <Wrench size={16} />
                    Tools
                  </Button>
                </div>
                {automationBanner ? <div>{automationBanner}</div> : null}
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                  <label
                    htmlFor='campaign-setting'
                    className='font-semibold uppercase tracking-wide text-muted-foreground'
                  >
                    Campaign Setting
                  </label>
                  <select
                    id='campaign-setting'
                    value={campaignVibe}
                    onChange={(event) =>
                      setCampaignVibe(event.target.value as CampaignVibe)
                    }
                    className='min-w-[160px] rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground shadow-sm'
                  >
                    {Object.entries(campaignVibes).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                  <span className='font-medium text-foreground'>
                    {campaignVibes[campaignVibe].name}
                  </span>
                </div>
              </div>
            }
          >
            <div className='flex h-full flex-col overflow-hidden'>
              <AnimatePresence mode='wait'>
                {activeTab === 'chronicle' && (
                  <motion.div
                    key='chronicle'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className='h-full flex flex-col p-6'
                  >
                    {/* Chronicle Canvas - 60% of available space */}
                    <div className='flex-1 mb-6'>
                      <Card variant='parchment' className='h-full'>
                        <CardContent className='p-6 h-full flex flex-col'>
                          <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-xl font-display flex items-center gap-2'>
                              <Scroll size={20} className='text-primary' />
                              Your Story
                              {automationStatus && (
                                <Badge
                                  variant={automationStatus.badgeVariant}
                                  className='text-xs flex items-center gap-1'
                                >
                                  <automationStatus.icon
                                    className={
                                      automationStatus.spinning
                                        ? 'h-3.5 w-3.5 animate-spin'
                                        : 'h-3.5 w-3.5'
                                    }
                                  />
                                  {automationStatus.label}
                                </Badge>
                              )}
                            </h2>
                            <Badge variant='secondary' className='text-xs'>
                              {chronicleEntries.length} entries
                            </Badge>
                          </div>

                          {/* Chronicle Text Area */}
                          <div className='flex-1 flex flex-col'>
                            <Textarea
                              ref={chronicleTextareaRef}
                              value={chronicleText}
                              onChange={(e) => setChronicleText(e.target.value)}
                              placeholder="What happens in your adventure? Write your story here...
        
        Tip: Write naturally - 'fought goblins, got hurt' becomes 'You battled the goblin raiders, suffering wounds in the fierce struggle.'"
                              className='flex-1 resize-none text-base leading-relaxed font-serif'
                              style={{ minHeight: '400px' }}
                            />

                            <div className='flex justify-between items-center mt-4'>
                              <div className='flex items-center gap-2'>
                                <Sparkles size={14} className='text-primary' />
                                <span className='text-xs text-muted-foreground'>
                                  GPT-5 automation parses every note
                                </span>
                              </div>
                              <Button
                                onClick={() =>
                                  void addChronicleEntry(chronicleText)
                                }
                                disabled={!chronicleText.trim() || isProposing}
                                className='gap-2'
                              >
                                {isProposing ? (
                                  <>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    Parsing...
                                  </>
                                ) : (
                                  <>
                                    <Send size={16} />
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
                        {/* Recent Chronicle Entries */}
                        <Card variant='surface'>
                          <CardContent className='p-4'>
                            <h3 className='font-semibold mb-3 flex items-center gap-2'>
                              <BookOpen size={16} />
                              Recent Story
                            </h3>
                            <div className='space-y-3 max-h-72 overflow-y-auto'>
                              {[...chronicleEntries]
                                .slice(-5)
                                .reverse()
                                .map((entry) => {
                                  const statusLabel = (() => {
                                    switch (entry.status) {
                                      case 'proposing':
                                        return 'Drafting'
                                      case 'applying':
                                        return 'Applying'
                                      case 'applied':
                                        return 'Applied'
                                      case 'error':
                                        return 'Needs review'
                                      default:
                                        return 'Ready'
                                    }
                                  })()

                                  const badgeVariant: BadgeProps['variant'] =
                                    entry.status === 'applied'
                                      ? 'success'
                                      : entry.status === 'error'
                                        ? 'destructive'
                                        : entry.status === 'applying'
                                          ? 'warning'
                                          : 'secondary'

                                  return (
                                    <div
                                      key={`${entry.id}`}
                                      className='rounded-lg border border-border/60 bg-card p-3 shadow-sm'
                                    >
                                      <div className='flex flex-wrap items-center justify-between gap-2'>
                                        <div className='flex items-center gap-2'>
                                          <Badge
                                            variant={badgeVariant}
                                            className='text-[10px] uppercase tracking-wide'
                                          >
                                            {statusLabel}
                                          </Badge>
                                          <span className='text-xs text-muted-foreground'>
                                            {entry.createdAt.toLocaleTimeString()}
                                          </span>
                                        </div>
                                        {entry.bundle &&
                                          entry.bundle.ops.length > 0 && (
                                            <span className='text-[11px] text-muted-foreground'>
                                              {entry.bundle.ops.length} update
                                              {entry.bundle.ops.length === 1
                                                ? ''
                                                : 's'}
                                            </span>
                                          )}
                                      </div>

                                      <div className='mt-2 text-sm leading-relaxed whitespace-pre-wrap'>
                                        {entry.narrative ?? entry.rawText}
                                      </div>

                                      {entry.narrative &&
                                        entry.narrative !== entry.rawText && (
                                          <div className='mt-2 text-[11px] text-muted-foreground italic'>
                                            {entry.rawText}
                                          </div>
                                        )}

                                      {entry.warnings.length > 0 && (
                                        <Alert
                                          variant='destructive'
                                          className='mt-3'
                                        >
                                          <AlertTitle className='text-xs font-semibold flex items-center gap-1'>
                                            <AlertTriangle className='h-3.5 w-3.5' />
                                            Review this note
                                          </AlertTitle>
                                          <AlertDescription className='text-xs space-y-1'>
                                            {entry.warnings.map((warning) => (
                                              <div
                                                key={`${entry.id}-${warning}`}
                                              >
                                                {warning}
                                              </div>
                                            ))}
                                          </AlertDescription>
                                        </Alert>
                                      )}

                                      {entry.bundle &&
                                        entry.bundle.ops.length > 0 && (
                                          <div className='mt-3 space-y-2'>
                                            <span className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                                              Proposed updates
                                            </span>
                                            <DeltaChecklist
                                              operations={entry.bundle.ops}
                                              selection={entry.selection}
                                              onToggle={(index, checked) =>
                                                toggleOperationSelection(
                                                  entry.id,
                                                  index,
                                                  checked,
                                                )
                                              }
                                              disabled={
                                                entry.status === 'applied' ||
                                                entry.status === 'applying' ||
                                                !canApplyAutomation
                                              }
                                              renderDescription={
                                                describeDeltaOperation
                                              }
                                              showRuleReference
                                            />
                                            <div className='flex flex-wrap items-center gap-2 pt-1'>
                                              <Button
                                                size='sm'
                                                variant={
                                                  entry.status === 'applied'
                                                    ? 'outline'
                                                    : 'primary'
                                                }
                                                onClick={() =>
                                                  void applyBundleForEntry(
                                                    entry.id,
                                                  )
                                                }
                                                disabled={
                                                  entry.status === 'applying' ||
                                                  isApplyingBundle ||
                                                  !canApplyAutomation
                                                }
                                                className='gap-2'
                                              >
                                                {entry.status === 'applying' ? (
                                                  <>
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                    Applying...
                                                  </>
                                                ) : entry.status ===
                                                  'applied' ? (
                                                  <>
                                                    <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                                                    Applied
                                                  </>
                                                ) : (
                                                  <>
                                                    <CheckCircle2 className='h-4 w-4' />
                                                    Apply selected
                                                  </>
                                                )}
                                              </Button>
                                              {entry.result && (
                                                <span className='text-[11px] text-muted-foreground'>
                                                  {
                                                    entry.result.appliedOps
                                                      .length
                                                  }{' '}
                                                  applied
                                                  {entry.result.skippedOps
                                                    .length > 0
                                                    ? ` / ${entry.result.skippedOps.length} skipped`
                                                    : ''}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {entry.errorMessage && (
                                        <Alert
                                          variant='destructive'
                                          className='mt-3'
                                        >
                                          <AlertTitle className='text-xs font-semibold'>
                                            Automation failed
                                          </AlertTitle>
                                          <AlertDescription className='text-xs'>
                                            {entry.errorMessage}
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </div>
                                  )
                                })}
                              {chronicleEntries.length === 0 && (
                                <div className='text-center text-muted-foreground py-8'>
                                  <BookOpen
                                    size={32}
                                    className='mx-auto mb-2 opacity-50'
                                  />
                                  <p className='text-sm'>
                                    Your chronicle awaits...
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

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
                                {Math.min(recentDeltaHistory.length, 5)} bundles
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
                                    Chronicle automations need the Tauri desktop bridge. Launch the desktop shell to enable live Chronicle updates.
                                  </p>
                                  <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide'>
                                    <span className='rounded bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive'>
                                      npm run dev:tauri
                                    </span>
                                    <Button
                                      size='sm'
                                      variant='ghost'
                                      className='h-7 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                                      onClick={() => setIsAutomationGuardDismissed(true)}
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
                                      className='rounded-md border border-border/60 bg-card p-3'
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
                                        <Alert
                                          className='mt-3 border-border/60 bg-muted/30'
                                        >
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
                                            void handleUndoBundle(log.bundleId)
                                          }
                                          className='h-8 gap-2 px-3 text-xs'
                                        >
                                          {undoingBundleId === log.bundleId ? (
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

                      <div className='space-y-6'>
                        {/* Tools Sub-navigation */}
                        <div className='flex gap-2 mb-6'>
                          <Button
                            variant={
                              toolsSubTab === 'items' ? 'primary' : 'outline'
                            }
                            onClick={() => setToolsSubTab('items')}
                            size='sm'
                          >
                            <Sword size={16} />
                            Items
                          </Button>
                          <Button
                            variant={
                              toolsSubTab === 'monsters' ? 'primary' : 'outline'
                            }
                            onClick={() => setToolsSubTab('monsters')}
                            size='sm'
                          >
                            <Crown size={16} />
                            Monsters
                          </Button>
                          <Button
                            variant={
                              toolsSubTab === 'npcs' ? 'primary' : 'outline'
                            }
                            onClick={() => setToolsSubTab('npcs')}
                            size='sm'
                          >
                            <User size={16} />
                            NPCs
                          </Button>
                        </div>

                        {/* Tools Content */}
                        <div className='grid grid-cols-2 gap-6'>
                          {/* Creator Panel */}
                          <Card variant='elevated'>
                            <CardContent className='p-4'>
                              <h3 className='font-semibold mb-3'>
                                Create{' '}
                                {toolsSubTab === 'items'
                                  ? 'Item'
                                  : toolsSubTab === 'monsters'
                                    ? 'Monster'
                                    : 'NPC'}
                              </h3>
                              <div className='space-y-3'>
                                <Input
                                  value={
                                    toolsSubTab === 'items'
                                      ? itemInput
                                      : toolsSubTab === 'monsters'
                                        ? monsterInput
                                        : npcInput
                                  }
                                  onChange={(e) => {
                                    if (toolsSubTab === 'items')
                                      setItemInput(e.target.value)
                                    else if (toolsSubTab === 'monsters')
                                      setMonsterInput(e.target.value)
                                    else setNpcInput(e.target.value)
                                  }}
                                  placeholder={`Describe your ${toolsSubTab.slice(0, -1)}...`}
                                />
                                <Button
                                  onClick={
                                    toolsSubTab === 'items'
                                      ? handleCreateItem
                                      : toolsSubTab === 'monsters'
                                        ? handleCreateMonster
                                        : handleCreateNPC
                                  }
                                  className='w-full gap-2'
                                >
                                  <Sparkles size={16} />
                                  Create with AI
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Created Items List */}
                          <Card variant='surface'>
                            <CardContent className='p-4'>
                              <h3 className='font-semibold mb-3'>
                                Your{' '}
                                {toolsSubTab.charAt(0).toUpperCase() +
                                  toolsSubTab.slice(1)}
                              </h3>
                              <div className='space-y-3 max-h-96 overflow-y-auto'>
                                {toolsSubTab === 'items' &&
                                  createdItems.map((item) => (
                                    <div
                                      key={item.id}
                                      className='p-3 bg-card rounded border'
                                    >
                                      <div className='font-medium'>
                                        {item.name}
                                      </div>
                                      <div className='text-xs text-muted-foreground'>
                                        {item.tags.join(', ')}
                                      </div>
                                      <div className='text-sm mt-1'>
                                        {item.description}
                                      </div>
                                      <div className='text-xs font-mono mt-1'>
                                        {item.stats}
                                      </div>
                                    </div>
                                  ))}

                                {toolsSubTab === 'monsters' &&
                                  createdMonsters.map((monster) => (
                                    <div
                                      key={monster.id}
                                      className='p-3 bg-card rounded border'
                                    >
                                      <div className='font-medium'>
                                        {monster.name}
                                      </div>
                                      <div className='text-xs text-muted-foreground'>
                                        {monster.hp} HP, {monster.armor} armor
                                      </div>
                                      <div className='text-sm mt-1'>
                                        {monster.instinct}
                                      </div>
                                      <ul className='text-xs mt-1 list-disc list-inside'>
                                        {monster.moves.map((move) => (
                                          <li key={`${monster.id}-${move}`}>
                                            {move}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}

                                {toolsSubTab === 'npcs' &&
                                  createdNPCs.map((npc) => (
                                    <div
                                      key={npc.id}
                                      className='p-3 bg-card rounded border'
                                    >
                                      <div className='font-medium'>
                                        {npc.name}
                                      </div>
                                      <div className='text-xs text-muted-foreground'>
                                        {npc.quirk}
                                      </div>
                                      <div className='text-sm mt-1'>
                                        {npc.appearance}
                                      </div>
                                      <div className='text-xs mt-1'>
                                        <strong>Drive:</strong> {npc.drive}
                                      </div>
                                      <div className='text-xs'>
                                        <strong>Knows:</strong> {npc.knows}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </RightRail>
        }
      />
    </div>
  )
}

export default PlayTab

