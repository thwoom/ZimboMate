/**
 * PlayTab - Immersive Storyteller Mode
 *
 * A story-first interface where Chronicle takes center stage (60% screen).
 * AI assists in background - enhancing notes, providing tools, enabling natural story flow.
 * Player remains the author, system acts as intelligent scribe.
 */

import type { AIProgress, CampaignVibe, CharacterAction } from '../../services/chatgptNoteEnhancer'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Dice6,
  Loader2,
  RefreshCcw,
  Scroll,
  Send,
  Sparkles,
  Sword,
  User,
  Wrench,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getXPThreshold } from '../../models/Character'
import { ChatGPTNoteEnhancer } from '../../services/chatgptNoteEnhancer'
import { useCharacterStore } from '../../stores/characterStore'
import { logger } from '../../utils/logger'
import { useChronicle } from '../chronicle/ChronicleProvider'
import { Badge, Button, Card, CardContent, Input, Progress, Textarea } from '../ui'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { PremiumProgressBar } from '../ui/PremiumProgressBar'
import { ChronicleEnabledDiceRoller } from './ChronicleEnabledDiceRoller'

export type GameMode = 'exploration' | 'combat' | 'social' | 'rest'
export type ActiveTab = 'chronicle' | 'tools'
export type ToolsSubTab = 'items' | 'monsters' | 'npcs'

interface PlayTabProps {
  className?: string
}

interface DiceRollContext {
  id: string
  result: number
  modifier: number
  stat: string
  timestamp: Date
  context?: string
  outcome?: string
}

interface ChronicleEntry {
  id: string
  content: string
  timestamp: Date
  enhanced: boolean
  originalNote?: string
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

interface AiStatusCard {
  icon: React.ComponentType<{ className?: string }>
  iconClass?: string
  toneClass: string
  title: string
  message: string
  stageLabel?: string
  progress?: number
  action: React.ReactNode | null
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
    atmosphereTerms: ['ancient', 'mystical', 'shadowed', 'gleaming', 'enchanted'],
    movementTerms: ['traveled to', 'journeyed to', 'ventured to', 'approached'],
    interactionTerms: ['spoke with', 'conversed with', 'addressed', 'encountered'],
  },
  scifi: {
    name: 'Science Fiction',
    combatTerms: ['firefight', 'engagement', 'conflict', 'encounter', 'battle'],
    injuryTerms: ['damage', 'injuries', 'trauma', 'harm'],
    discoveryTerms: ['detected', 'scanned', 'identified', 'located', 'found'],
    atmosphereTerms: ['metallic', 'sterile', 'pulsing', 'synthetic', 'technological'],
    movementTerms: ['proceeded to', 'navigated to', 'accessed', 'approached'],
    interactionTerms: ['interfaced with', 'communicated with', 'contacted', 'met'],
  },
  cyberpunk: {
    name: 'Cyberpunk',
    combatTerms: ['gunfight', 'clash', 'throwdown', 'run', 'firefight'],
    injuryTerms: ['damage', 'hurt', 'pain', 'bleeding', 'trauma'],
    discoveryTerms: ['jacked', 'accessed', 'hacked', 'found', 'located'],
    atmosphereTerms: ['neon-lit', 'rain-slicked', 'corporate', 'underground', 'digital'],
    movementTerms: ['slipped to', 'moved to', 'hit', 'accessed'],
    interactionTerms: ['interfaced with', 'contacted', 'met with', 'connected to'],
  },
  horror: {
    name: 'Horror',
    combatTerms: ['struggled against', 'fought desperately', 'battled', 'resisted'],
    injuryTerms: ['terrible wounds', 'grievous harm', 'injuries', 'pain', 'trauma'],
    discoveryTerms: ['uncovered', 'revealed', 'exposed', 'witnessed', 'found'],
    atmosphereTerms: ['dark', 'foreboding', 'twisted', 'unnatural', 'ominous'],
    movementTerms: ['crept to', 'approached', 'ventured to', 'entered'],
    interactionTerms: ['encountered', 'faced', 'confronted', 'met'],
  },
  western: {
    name: 'Wild West',
    combatTerms: ['shootout', 'gunfight', 'brawl', 'showdown', 'scuffle'],
    injuryTerms: ['wounds', 'injuries', 'hurt', 'bleeding', 'damage'],
    discoveryTerms: ['spotted', 'found', 'came across', 'discovered', 'noticed'],
    atmosphereTerms: ['dusty', 'sun-baked', 'weathered', 'frontier', 'rugged'],
    movementTerms: ['rode to', 'headed to', 'made for', 'approached'],
    interactionTerms: ['spoke with', 'palavered with', 'met with', 'encountered'],
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

// Smart pattern-based note enhancement
function enhanceNote(note: string, vibe: CampaignVibe = 'fantasy'): string {
  if (note.length < 3)
    return note

  const vibeConfig = campaignVibes[vibe]
  let enhanced = note.toLowerCase().trim()

  // Track @ mentions for special handling
  const npcs: string[] = []
  const locations: string[] = []

  // Extract @ mentions before processing
  enhanced = enhanced.replace(/@(\w+)/g, (match, name) => {
    if (enhanced.includes(`at the @${name}`) || enhanced.includes(`to @${name}`)) {
      locations.push(name)
      return `${name}`
    }
    else {
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
      pattern: /fought?\s+(.+?),?\s*(?:got|took)\s+(?:hurt|dmg|damage)/gi,
      replacement: (match: string, enemy: string) =>
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
      replacement: () => `You suffered ${getRandomTerm(vibeConfig.injuryTerms)}`,
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
  if (noun.startsWith('the ') || noun.startsWith('a ') || noun.startsWith('an ')) {
    return noun
  }
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const firstLetter = noun.charAt(0).toLowerCase()
  return vowels.includes(firstLetter) ? `an ${noun}` : `a ${noun}`
}

function getLocationDescription(location: string, vibeConfig: VibeDefinition): string {
  const locationName = location.toLowerCase()

  // Common location types with vibe-appropriate descriptors
  const locationMap: Record<string, string[]> = {
    tavern: vibeConfig.name === 'High Fantasy'
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

    inn: vibeConfig.name === 'High Fantasy'
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

    shop: vibeConfig.name === 'High Fantasy'
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

    market: vibeConfig.name === 'High Fantasy'
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

function addAtmosphericFlavor(text: string, vibeConfig: VibeDefinition): string {
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
      moves: ['Swarm with numbers', 'Strike from shadows', 'Flee when outnumbered'],
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
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const { isOverlayEnabled: _isOverlayEnabled } = useChronicle()
  const chronicleTextareaRef = useRef<HTMLTextAreaElement>(null)

  // New state for Immersive Storyteller Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('chronicle')
  const [toolsSubTab, setToolsSubTab] = useState<ToolsSubTab>('items')
  const [characterPanelCollapsed, setCharacterPanelCollapsed] = useState(true)
  const [campaignVibe, setCampaignVibe] = useState<CampaignVibe>('fantasy')

  // Chronicle state
  const [chronicleText, setChronicleText] = useState('')
  const [chronicleEntries, setChronicleEntries] = useState<ChronicleEntry[]>([])
  const [pendingDiceContext, setPendingDiceContext] = useState<DiceRollContext | null>(null)

  // Tool creation state
  const [itemInput, setItemInput] = useState('')
  const [npcInput, setNpcInput] = useState('')
  const [monsterInput, setMonsterInput] = useState('')
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([])
  const [createdNPCs, setCreatedNPCs] = useState<CreatedNPC[]>([])
  const [createdMonsters, setCreatedMonsters] = useState<CreatedMonster[]>([])

  // Session management
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)

  // AI Enhancement state
  const [aiEnhancer, setAiEnhancer] = useState<ChatGPTNoteEnhancer | null>(null)
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'fallback' | 'error'>('loading')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [aiProgress, setAiProgress] = useState<AIProgress>({
    progress: 0,
    text: 'Contacting ChatGPT…',
    stage: 'initializing',
  })
  const aiEnhancerRef = useRef<ChatGPTNoteEnhancer | null>(null)

  const initializeChatGPT = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if (reset && aiEnhancerRef.current) {
        await aiEnhancerRef.current.dispose().catch(() => undefined)
        aiEnhancerRef.current = null
        setAiEnhancer(null)
      }

      let enhancer = aiEnhancerRef.current
      if (!enhancer) {
        enhancer = new ChatGPTNoteEnhancer()
        aiEnhancerRef.current = enhancer
        setAiEnhancer(enhancer)
      }

      setAiStatus('loading')
      setAiProgress({ progress: 0, text: 'Contacting ChatGPT…', stage: 'initializing' })

      enhancer.onProgress = (progress) => {
        setAiProgress(progress)
        if (progress.stage === 'ready') {
          setAiStatus('ready')
        }
        else if (progress.stage === 'error') {
          setAiStatus('fallback')
        }
      }

      const timeoutId = window.setTimeout(() => {
        logger.warn('⚠️ ChatGPT taking longer than expected, falling back to pattern mode')
        setAiStatus('fallback')
        setAiProgress({ progress: 0, text: 'Timed out – using pattern mode', stage: 'error' })
      }, 120000)

      try {
        await enhancer.initialize()
        clearTimeout(timeoutId)
        setAiStatus('ready')
        setAiProgress({ progress: 100, text: 'ChatGPT ready!', stage: 'ready' })
      }
      catch (error) {
        clearTimeout(timeoutId)
        logger.warn('⚠️ ChatGPT unavailable, using pattern fallback:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setAiStatus('fallback')
        setAiProgress({ progress: 0, text: `ChatGPT failed – ${errorMessage}`, stage: 'error' })
      }
    },
    [],
  )

  const handleRetryChatGPT = useCallback(() => {
    void initializeChatGPT({ reset: true })
  }, [initializeChatGPT])

  const statusDetails = useMemo<AiStatusCard>(() => {
    const stageValue
      = aiStatus === 'fallback' && aiProgress.stage === 'error' ? 'fallback' : aiProgress.stage

    const formatStage = (value?: string) => {
      if (!value)
        return undefined
      if (value === 'fallback')
        return 'Fallback'
      return value
        .split(/[-_\s]/)
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    }

    const stageLabel = formatStage(stageValue)
    const progressValue = (
      typeof aiProgress.progress === 'number' && Number.isFinite(aiProgress.progress)
    )
      ? Math.min(100, Math.max(0, Math.round(aiProgress.progress)))
      : undefined

    switch (aiStatus) {
      case 'ready':
        return {
          icon: CheckCircle2,
          iconClass: 'text-emerald-500',
          toneClass: 'border-emerald-300/70 bg-emerald-50/70 dark:bg-emerald-500/10',
          title: 'ChatGPT ready',
          message:
          aiProgress.text
          || 'Narrative enhancements and Dungeon World automation are standing by.',
          stageLabel: stageLabel ?? 'Ready',
          progress: undefined,
          action: null,
        }
      case 'fallback':
        return {
          icon: AlertTriangle,
          iconClass: 'text-amber-500',
          toneClass: 'border-amber-300/70 bg-amber-50/70 dark:bg-amber-500/10',
          title: 'Pattern fallback active',
          message:
          aiProgress.text
          || 'Using local heuristics until ChatGPT reconnects. Narration may be less dynamic.',
          stageLabel: stageLabel ?? 'Fallback',
          progress: undefined,
          action: (
            <Button onClick={handleRetryChatGPT} variant="outline" size="sm" className="gap-1 shrink-0">
              <RefreshCcw className="h-4 w-4" />
              Retry ChatGPT
            </Button>
          ),
        }
      case 'error':
        return {
          icon: AlertTriangle,
          iconClass: 'text-destructive',
          toneClass: 'border-destructive/60 bg-destructive/10',
          title: 'ChatGPT connection failed',
          message:
          aiProgress.text
          || 'We could not reach the Responses API. Verify your network and API key, then try again.',
          stageLabel: stageLabel ?? 'Error',
          progress: undefined,
          action: (
            <Button onClick={handleRetryChatGPT} variant="outline" size="sm" className="gap-1 shrink-0">
              <RefreshCcw className="h-4 w-4" />
              Retry ChatGPT
            </Button>
          ),
        }
      default:
        return {
          icon: Loader2,
          iconClass: 'text-primary animate-spin',
          toneClass: 'border-primary/60 bg-primary/10 dark:bg-primary/5',
          title: 'Connecting to ChatGPT',
          message: aiProgress.text || 'Negotiating a secure channel with OpenAI…',
          stageLabel: stageLabel ?? 'Initializing',
          progress: progressValue ?? 0,
          action: null,
        }
    }
  }, [aiStatus, aiProgress, handleRetryChatGPT])

  const aiStatusBanner = useMemo(() => {
    const Icon = statusDetails.icon
    return (
      <Alert variant="default" className={`mb-4 ${statusDetails.toneClass}`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${statusDetails.iconClass ?? ''}`} />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTitle className="text-sm font-semibold">{statusDetails.title}</AlertTitle>
              {statusDetails.stageLabel && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                  {statusDetails.stageLabel}
                </Badge>
              )}
            </div>
            <AlertDescription className="text-sm text-muted-foreground">
              {statusDetails.message}
            </AlertDescription>
            {typeof statusDetails.progress === 'number' && (
              <Progress value={statusDetails.progress} className="mt-3 h-1" />
            )}
          </div>
          {statusDetails.action}
        </div>
      </Alert>
    )
  }, [statusDetails])

  useEffect(() => {
    void initializeChatGPT()
    return () => {
      if (aiEnhancerRef.current) {
        void aiEnhancerRef.current.dispose()
        aiEnhancerRef.current = null
        setAiEnhancer(null)
      }
    }
  }, [initializeChatGPT])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 60000))
      }, 60000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, sessionStartTime])

  const startSession = () => {
    setIsSessionActive(true)
    setSessionStartTime(new Date())
  }

  const endSession = () => {
    setIsSessionActive(false)
    setSessionStartTime(null)
    setSessionTime(0)
  }

  // Character action handlers for AI function calls
  const handleCharacterAction = (action: CharacterAction) => {
    switch (action.type) {
      case 'apply_debility': {
        const { debility, reason } = action.params
        logger.info(`Applying debility: ${debility} (${reason})`)
        // TODO: Integrate with character store
        // characterStore.applyDebility(debility, reason)
        break
      }

      case 'modify_hp': {
        const { change, reason } = action.params
        const signedChange = change > 0 ? `+${change}` : `${change}`
        logger.info(`Modifying HP: ${signedChange} (${reason})`)
        // TODO: Integrate with character store
        // characterStore.modifyHP(change, reason)
        break
      }

      case 'add_gear': {
        const { name, description, tags, weight, uses } = action.params
        logger.info(`Adding gear: ${name} - ${description}`)
        // TODO: Integrate with character store
        // characterStore.addGear(name, tags ?? [], description, weight, uses)
        break
      }

      case 'spend_resource': {
        const { resource, amount, reason } = action.params
        logger.info(`Spending resource: ${amount} ${resource} (${reason})`)
        // TODO: Integrate with character store
        // characterStore.spendResource(resource, amount, reason)
        break
      }

      case 'gain_xp': {
        const { amount, trigger, description } = action.params
        logger.info(`Gaining XP: ${amount} from ${trigger} (${description})`)
        // TODO: Integrate with character store
        // characterStore.gainXP(amount, trigger, description)
        break
      }

      case 'update_bonds': {
        const { character, new_bond, action: bondAction } = action.params
        logger.info(`Updating bonds with ${character}: ${new_bond} (${bondAction})`)
        // TODO: Integrate with character store
        // characterStore.updateBonds(character, new_bond, bondAction)
        break
      }

      default:
        logger.warn('Unknown character action type:', action.type)
    }
  }

  // Chronicle management functions
  const addChronicleEntry = async (rawText: string) => {
    if (!rawText.trim())
      return

    let enhanced = rawText
    let actions: CharacterAction[] = []

    setIsEnhancing(true)
    logger.info(`🎭 Processing chronicle entry: "${rawText}"`)
    logger.info(`🤖 AI Status: ${aiStatus}, AI Ready: ${!!aiEnhancer}`)

    try {
      // Try AI enhancement first
      if (aiStatus === 'ready' && aiEnhancer) {
        logger.info('✨ Using AI enhancement...')
        const result = await aiEnhancer.enhance(rawText, campaignVibe)
        enhanced = result.enhancedText
        actions = result.actions
        logger.info(`📝 Enhanced text: "${enhanced}"`)
        logger.info(`⚡ Actions detected:`, actions)

        // Execute character actions
        actions.forEach(action => handleCharacterAction(action))
      }
      else if (aiStatus === 'fallback') {
        logger.info('🔄 Using pattern-based fallback enhancement')
        // Fallback to pattern-based enhancement
        enhanced = enhanceNote(rawText, campaignVibe)
        logger.info(`📝 Pattern enhanced: "${enhanced}"`)
      }
      else {
        logger.info(`⚠️ No enhancement - AI status: ${aiStatus}, enhancer: ${!!aiEnhancer}`)
      }
    }
    catch (error) {
      logger.warn('AI enhancement failed, using fallback:', error)
      enhanced = enhanceNote(rawText, campaignVibe)
    }
    finally {
      setIsEnhancing(false)
    }

    const entry: ChronicleEntry = {
      id: Math.random().toString(36).substr(2, 9),
      content: enhanced,
      timestamp: new Date(),
      enhanced: enhanced !== rawText,
      originalNote: enhanced !== rawText ? rawText : undefined,
    }

    setChronicleEntries(prev => [...prev, entry])
    setChronicleText('')

    // Auto-scroll chronicle
    setTimeout(() => {
      if (chronicleTextareaRef.current) {
        chronicleTextareaRef.current.scrollTop = chronicleTextareaRef.current.scrollHeight
      }
    }, 100)
  }

  const handleDiceRoll = (roll: { finalResult: number, modifier: number, outcome: string }) => {
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

  const completeDiceContext = (context: string, outcome: string) => {
    if (pendingDiceContext) {
      const rollText = `${context} (${pendingDiceContext.stat} roll: ${pendingDiceContext.result}) - ${outcome}`
      addChronicleEntry(rollText)
      setPendingDiceContext(null)
    }
  }

  // Tool creation functions
  const handleCreateItem = () => {
    if (!itemInput.trim())
      return
    const item = createItem(itemInput)
    setCreatedItems(prev => [...prev, item])
    setItemInput('')
  }

  const handleCreateNPC = () => {
    if (!npcInput.trim())
      return
    const npc = createNPC(npcInput)
    setCreatedNPCs(prev => [...prev, npc])
    setNpcInput('')
  }

  const handleCreateMonster = () => {
    if (!monsterInput.trim())
      return
    const monster = createMonster(monsterInput)
    setCreatedMonsters(prev => [...prev, monster])
    setMonsterInput('')
  }

  if (!activeCharacter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-4 ${className}`}
      >
        <Card variant="magical">
          <CardContent className="p-6 pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted  flex items-center justify-center">
                <BookOpen size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-display mb-2">Ready to Chronicle?</h2>
                <p className="text-muted-foreground  text-sm mb-4">
                  Create or select a character to begin your storytelling adventure
                </p>
                <Button variant="primary" size="sm">
                  Create Character
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const xpNeeded = getXPThreshold(activeCharacter.level)

  return (
    <div className={`flex h-screen overflow-hidden ${className}`}>
      {/* Collapsible Character Panel */}
      <motion.div
        initial={false}
        animate={{ width: characterPanelCollapsed ? 60 : 300 }}
        className="bg-muted/50  border-r border-border flex-shrink-0"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!characterPanelCollapsed && (
              <h3 className="text-lg font-semibold">{activeCharacter.name}</h3>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCharacterPanelCollapsed(!characterPanelCollapsed)}
              className="p-2"
            >
              {characterPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>

          {!characterPanelCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-sm text-muted-foreground">
                Level
                {' '}
                {activeCharacter.level}
                {' '}
                {activeCharacter.class}
              </div>

              {/* Campaign Vibe Selector */}
              <div className="space-y-2">
                <label htmlFor="campaign-setting" className="text-xs font-medium text-foreground ">
                  Campaign Setting
                </label>
                <select
                  id="campaign-setting"
                  value={campaignVibe}
                  onChange={e => setCampaignVibe(e.target.value as CampaignVibe)}
                  className="w-full text-xs p-2 rounded border border-border bg-card"
                >
                  {Object.entries(campaignVibes).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-muted-foreground">
                  Current:
                  {' '}
                  {campaignVibes[campaignVibe].name}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>
                      {activeCharacter.hp.current}
                      /
                      {activeCharacter.hp.max}
                    </span>
                  </div>
                  <Progress
                    value={activeCharacter.hp.current}
                    max={activeCharacter.hp.max}
                    variant="health"
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>XP</span>
                    <span>
                      {activeCharacter.xp}
                      /
                      {xpNeeded}
                    </span>
                  </div>
                  <Progress
                    value={activeCharacter.xp}
                    max={xpNeeded}
                    variant="experience"
                    className="h-2"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-chart-2' : 'bg-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {isSessionActive ? `${sessionTime}m` : 'Paused'}
                  </span>
                </div>
                <Button
                  variant={isSessionActive ? 'destructive' : 'primary'}
                  size="sm"
                  onClick={isSessionActive ? endSession : startSession}
                  className="w-full text-xs"
                >
                  {isSessionActive ? 'End Session' : 'Start Session'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-card">
          <div className="flex">
            <Button
              variant={activeTab === 'chronicle' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('chronicle')}
              className="rounded-none border-b-2 border-transparent data-[active]:border-primary"
              data-active={activeTab === 'chronicle'}
            >
              <BookOpen size={16} />
              Chronicle
            </Button>
            <Button
              variant={activeTab === 'tools' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('tools')}
              className="rounded-none border-b-2 border-transparent data-[active]:border-primary"
              data-active={activeTab === 'tools'}
            >
              <Wrench size={16} />
              Tools
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <div className="px-6 pt-6 pb-0">
            {aiStatusBanner}
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'chronicle' && (
              <motion.div
                key="chronicle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col p-6"
              >
                {/* Chronicle Canvas - 60% of available space */}
                <div className="flex-1 mb-6">
                  <Card variant="parchment" className="h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-display flex items-center gap-2">
                          <Scroll size={20} className="text-primary" />
                          Your Story
                          {aiStatus === 'loading' && (
                            <PremiumProgressBar
                              progress={aiProgress.progress}
                              text={aiProgress.text}
                              stage={aiProgress.stage as 'downloading' | 'loading' | 'ready' | 'error'}
                              timeRemaining={aiProgress.time_remaining}
                              modelSize="~4GB"
                              showDetails={true}
                              className="max-w-md"
                            />
                          )}
                          {aiStatus === 'ready' && (
                            <Badge variant="default" className="text-xs">
                              ChatGPT ready
                            </Badge>
                          )}
                          {aiStatus === 'fallback' && (
                            <Badge variant="outline" className="text-xs">
                              📝 Pattern Mode
                            </Badge>
                          )}
                          {aiStatus === 'error' && (
                            <Badge variant="destructive" className="text-xs">
                              ⚠️ AI Error
                            </Badge>
                          )}
                        </h2>
                        <Badge variant="secondary" className="text-xs">
                          {chronicleEntries.length}
                          {' '}
                          entries
                        </Badge>
                      </div>

                      {/* Chronicle Text Area */}
                      <div className="flex-1 flex flex-col">
                        <Textarea
                          ref={chronicleTextareaRef}
                          value={chronicleText}
                          onChange={e => setChronicleText(e.target.value)}
                          placeholder="What happens in your adventure? Write your story here...

Tip: Write naturally - 'fought goblins, got hurt' becomes 'You battled the goblin raiders, suffering wounds in the fierce struggle.'"
                          className="flex-1 resize-none text-base leading-relaxed font-serif"
                          style={{ minHeight: '400px' }}
                        />

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-xs text-muted-foreground">AI enhancing your notes</span>
                          </div>
                          <Button
                            onClick={() => addChronicleEntry(chronicleText)}
                            disabled={!chronicleText.trim() || isEnhancing}
                            className="gap-2"
                          >
                            {isEnhancing
                              ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enhancing...
                                  </>
                                )
                              : (
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
                <div className="grid grid-cols-2 gap-6">
                  {/* Recent Chronicle Entries */}
                  <Card variant="surface">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Recent Story
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {chronicleEntries.slice(-5).map(entry => (
                          <div key={entry.id} className="p-3 bg-card rounded border-l-4 border-primary/30">
                            <div className="text-sm leading-relaxed">
                              {entry.content}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-muted-foreground">
                                {entry.timestamp.toLocaleTimeString()}
                              </div>
                              {entry.enhanced && (
                                <Badge variant="secondary" className="text-xs">
                                  Enhanced
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {chronicleEntries.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Your chronicle awaits...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dice Context & Floating Dice */}
                  <Card variant="magical">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Dice6 size={16} />
                        Dice & Actions
                      </h3>

                      {pendingDiceContext
                        ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-primary/10 rounded border border-primary/30 ">
                                <div className="text-sm font-medium mb-2">
                                  Last Roll:
                                  {pendingDiceContext.result}
                                </div>
                                <Input
                                  placeholder="What were you trying to do?"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const context = (e.target as HTMLInputElement).value
                                      const outcome = pendingDiceContext.result >= 10
                                        ? 'Success!'
                                        : pendingDiceContext.result >= 7 ? 'Partial success' : 'Things went wrong'
                                      completeDiceContext(context, outcome)
                                    }
                                  }}
                                  className="mb-2"
                                />
                                <Input
                                  placeholder="What happened?"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const contextInput = e.target.parentElement?.querySelector('input') as HTMLInputElement
                                      const context = contextInput?.value || 'Something happened'
                                      const outcome = (e.target as HTMLInputElement).value
                                      completeDiceContext(context, outcome)
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )
                        : (
                            <div className="space-y-4">
                              <ChronicleEnabledDiceRoller
                                move="Story Roll"
                                characterName={activeCharacter.name}
                                onRoll={handleDiceRoll}
                              />
                              <div className="text-xs text-center text-muted-foreground">
                                Roll dice, then describe what happens
                              </div>
                            </div>
                          )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'tools' && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full p-6"
              >
                {/* Tools Sub-navigation */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={toolsSubTab === 'items' ? 'primary' : 'outline'}
                    onClick={() => setToolsSubTab('items')}
                    size="sm"
                  >
                    <Sword size={16} />
                    Items
                  </Button>
                  <Button
                    variant={toolsSubTab === 'monsters' ? 'primary' : 'outline'}
                    onClick={() => setToolsSubTab('monsters')}
                    size="sm"
                  >
                    <Crown size={16} />
                    Monsters
                  </Button>
                  <Button
                    variant={toolsSubTab === 'npcs' ? 'primary' : 'outline'}
                    onClick={() => setToolsSubTab('npcs')}
                    size="sm"
                  >
                    <User size={16} />
                    NPCs
                  </Button>
                </div>

                {/* Tools Content */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Creator Panel */}
                  <Card variant="elevated">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">
                        Create
                        {' '}
                        {toolsSubTab === 'items' ? 'Item' : toolsSubTab === 'monsters' ? 'Monster' : 'NPC'}
                      </h3>
                      <div className="space-y-3">
                        <Input
                          value={toolsSubTab === 'items' ? itemInput : toolsSubTab === 'monsters' ? monsterInput : npcInput}
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
                          onClick={toolsSubTab === 'items' ? handleCreateItem : toolsSubTab === 'monsters' ? handleCreateMonster : handleCreateNPC}
                          className="w-full gap-2"
                        >
                          <Sparkles size={16} />
                          Create with AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Created Items List */}
                  <Card variant="surface">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">
                        Your
                        {' '}
                        {toolsSubTab.charAt(0).toUpperCase() + toolsSubTab.slice(1)}
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {toolsSubTab === 'items' && createdItems.map(item => (
                          <div key={item.id} className="p-3 bg-card rounded border">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.tags.join(', ')}</div>
                            <div className="text-sm mt-1">{item.description}</div>
                            <div className="text-xs font-mono mt-1">{item.stats}</div>
                          </div>
                        ))}

                        {toolsSubTab === 'monsters' && createdMonsters.map(monster => (
                          <div key={monster.id} className="p-3 bg-card rounded border">
                            <div className="font-medium">{monster.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {monster.hp}
                              {' '}
                              HP,
                              {' '}
                              {monster.armor}
                              {' '}
                              armor
                            </div>
                            <div className="text-sm mt-1">{monster.instinct}</div>
                            <ul className="text-xs mt-1 list-disc list-inside">
                              {monster.moves.map((move, i) => <li key={i}>{move}</li>)}
                            </ul>
                          </div>
                        ))}

                        {toolsSubTab === 'npcs' && createdNPCs.map(npc => (
                          <div key={npc.id} className="p-3 bg-card rounded border">
                            <div className="font-medium">{npc.name}</div>
                            <div className="text-xs text-muted-foreground">{npc.quirk}</div>
                            <div className="text-sm mt-1">{npc.appearance}</div>
                            <div className="text-xs mt-1">
                              <strong>Drive:</strong>
                              {' '}
                              {npc.drive}
                            </div>
                            <div className="text-xs">
                              <strong>Knows:</strong>
                              {' '}
                              {npc.knows}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default PlayTab
