/**
 * PlayTab - Immersive Storyteller Mode
 *
 * A story-first interface where Chronicle takes center stage (60% screen).
 * AI assists in background - enhancing notes, providing tools, enabling natural story flow.
 * Player remains the author, system acts as intelligent scribe.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Swords,
  Map,
  Users,
  Timer,
  Dice6,
  Heart,
  Star,
  Eye,
  Brain,
  BicepsFlexed,
  BookOpen,
  Send,
  Plus,
  Target,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Scroll,
  Sword,
  Crown,
  Wrench
} from 'lucide-react'
import { Card, CardContent, Button, Badge, Progress, Input, Textarea } from '../ui'
import { PremiumProgressBar } from '../ui/PremiumProgressBar'
import { useCharacterStore } from '../../stores/characterStore'
import { useChronicle } from '../chronicle/ChronicleProvider'
import { ChronicleEnabledDiceRoller } from './ChronicleEnabledDiceRoller'
import { getXPThreshold } from '../../models/Character'
import { OllamaAiNoteEnhancer, CharacterAction, EnhancementResult, AIProgress, CampaignVibe } from '../../services/ollamaAiNoteEnhancer'

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
    name: "High Fantasy",
    combatTerms: ["battle", "combat", "skirmish", "duel", "clash"],
    injuryTerms: ["wounds", "injuries", "harm", "damage"],
    discoveryTerms: ["discovered", "uncovered", "found", "revealed"],
    atmosphereTerms: ["ancient", "mystical", "shadowed", "gleaming", "enchanted"],
    movementTerms: ["traveled to", "journeyed to", "ventured to", "approached"],
    interactionTerms: ["spoke with", "conversed with", "addressed", "encountered"]
  },
  scifi: {
    name: "Science Fiction",
    combatTerms: ["firefight", "engagement", "conflict", "encounter", "battle"],
    injuryTerms: ["damage", "injuries", "trauma", "harm"],
    discoveryTerms: ["detected", "scanned", "identified", "located", "found"],
    atmosphereTerms: ["metallic", "sterile", "pulsing", "synthetic", "technological"],
    movementTerms: ["proceeded to", "navigated to", "accessed", "approached"],
    interactionTerms: ["interfaced with", "communicated with", "contacted", "met"]
  },
  cyberpunk: {
    name: "Cyberpunk",
    combatTerms: ["gunfight", "clash", "throwdown", "run", "firefight"],
    injuryTerms: ["damage", "hurt", "pain", "bleeding", "trauma"],
    discoveryTerms: ["jacked", "accessed", "hacked", "found", "located"],
    atmosphereTerms: ["neon-lit", "rain-slicked", "corporate", "underground", "digital"],
    movementTerms: ["slipped to", "moved to", "hit", "accessed"],
    interactionTerms: ["interfaced with", "contacted", "met with", "connected to"]
  },
  horror: {
    name: "Horror",
    combatTerms: ["struggled against", "fought desperately", "battled", "resisted"],
    injuryTerms: ["terrible wounds", "grievous harm", "injuries", "pain", "trauma"],
    discoveryTerms: ["uncovered", "revealed", "exposed", "witnessed", "found"],
    atmosphereTerms: ["dark", "foreboding", "twisted", "unnatural", "ominous"],
    movementTerms: ["crept to", "approached", "ventured to", "entered"],
    interactionTerms: ["encountered", "faced", "confronted", "met"]
  },
  western: {
    name: "Wild West",
    combatTerms: ["shootout", "gunfight", "brawl", "showdown", "scuffle"],
    injuryTerms: ["wounds", "injuries", "hurt", "bleeding", "damage"],
    discoveryTerms: ["spotted", "found", "came across", "discovered", "noticed"],
    atmosphereTerms: ["dusty", "sun-baked", "weathered", "frontier", "rugged"],
    movementTerms: ["rode to", "headed to", "made for", "approached"],
    interactionTerms: ["spoke with", "palavered with", "met with", "encountered"]
  },
  modern: {
    name: "Modern Day",
    combatTerms: ["fight", "confrontation", "altercation", "struggle", "clash"],
    injuryTerms: ["injuries", "hurt", "harm", "wounds", "damage"],
    discoveryTerms: ["found", "discovered", "noticed", "spotted", "located"],
    atmosphereTerms: ["urban", "contemporary", "familiar", "everyday", "busy"],
    movementTerms: ["went to", "headed to", "drove to", "approached"],
    interactionTerms: ["talked to", "spoke with", "met with", "contacted"]
  }
}

// Smart pattern-based note enhancement
const enhanceNote = (note: string, vibe: CampaignVibe = 'fantasy'): string => {
  if (note.length < 3) return note

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
      }
    },
    {
      pattern: /met\s+(\w+)\s+at\s+(?:the\s+)?(\w+)/gi,
      replacement: (match: string, person: string, place: string) => {
        const placeDesc = getLocationDescription(place, vibeConfig)
        return `You met with ${person} at the ${placeDesc} ${place}`
      }
    },

    // Combat patterns
    {
      pattern: /fought?\s+(.+?),?\s*(?:got|took)\s+(?:hurt|dmg|damage)/gi,
      replacement: (match: string, enemy: string) =>
        `You engaged ${enemy.trim()} in ${getRandomTerm(vibeConfig.combatTerms)}, suffering ${getRandomTerm(vibeConfig.injuryTerms)} in the struggle`
    },
    {
      pattern: /fought?\s+(.+)/gi,
      replacement: (match: string, enemy: string) =>
        `You engaged ${enemy.trim()} in fierce ${getRandomTerm(vibeConfig.combatTerms)}`
    },

    // Discovery patterns
    {
      pattern: /found\s+(.+)/gi,
      replacement: (match: string, item: string) =>
        `You ${getRandomTerm(vibeConfig.discoveryTerms)} ${addArticle(item.trim())}`
    },

    // Movement patterns
    {
      pattern: /(?:went|traveled)\s+to\s+(?:the\s+)?(\w+)/gi,
      replacement: (match: string, place: string) => {
        const placeDesc = getLocationDescription(place, vibeConfig)
        return `You ${getRandomTerm(vibeConfig.movementTerms)} the ${placeDesc} ${place}`
      }
    },

    // Interaction patterns
    {
      pattern: /talked?\s+(?:to|with)\s+(.+)/gi,
      replacement: (match: string, person: string) =>
        `You ${getRandomTerm(vibeConfig.interactionTerms)} ${person.trim()}`
    },

    // Injury patterns
    {
      pattern: /(?:got|took)\s+(?:hurt|dmg|damage)/gi,
      replacement: () => `You suffered ${getRandomTerm(vibeConfig.injuryTerms)}`
    },

    // Success/failure patterns
    {
      pattern: /(?:failed|missed)\s+(.+)/gi,
      replacement: (match: string, action: string) =>
        `Your attempt to ${action.trim()} was unsuccessful`
    },
    {
      pattern: /(?:succeeded|made)\s+(.+)/gi,
      replacement: (match: string, action: string) =>
        `You successfully ${action.trim()}`
    },

    // Social encounter patterns
    {
      pattern: /ran\s+into\s+(.+)/gi,
      replacement: (match: string, person: string) =>
        `You unexpectedly encountered ${person.trim()}`
    },
    {
      pattern: /met\s+(?:with\s+)?(.+)/gi,
      replacement: (match: string, person: string) =>
        `You met with ${person.trim()}`
    }
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
const getRandomTerm = (terms: string[]): string => {
  return terms[Math.floor(Math.random() * terms.length)]
}

const addArticle = (noun: string): string => {
  if (noun.startsWith('the ') || noun.startsWith('a ') || noun.startsWith('an ')) {
    return noun
  }
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const firstLetter = noun.charAt(0).toLowerCase()
  return vowels.includes(firstLetter) ? `an ${noun}` : `a ${noun}`
}

const getLocationDescription = (location: string, vibeConfig: VibeDefinition): string => {
  const locationName = location.toLowerCase()

  // Common location types with vibe-appropriate descriptors
  const locationMap: Record<string, string[]> = {
    tavern: vibeConfig.name === 'High Fantasy' ? ['bustling', 'warm', 'crowded'] :
            vibeConfig.name === 'Cyberpunk' ? ['neon-lit', 'smoky', 'underground'] :
            vibeConfig.name === 'Horror' ? ['dimly lit', 'shadowy', 'ominous'] :
            vibeConfig.name === 'Wild West' ? ['dusty', 'frontier', 'rowdy'] :
            vibeConfig.name === 'Science Fiction' ? ['sterile', 'metallic', 'synthetic'] :
            ['busy', 'local', 'familiar'],

    inn: vibeConfig.name === 'High Fantasy' ? ['cozy', 'welcoming', 'ancient'] :
         vibeConfig.name === 'Cyberpunk' ? ['run-down', 'neon-signed', 'corporate'] :
         vibeConfig.name === 'Horror' ? ['abandoned', 'creaking', 'foreboding'] :
         vibeConfig.name === 'Wild West' ? ['frontier', 'weathered', 'dusty'] :
         vibeConfig.name === 'Science Fiction' ? ['automated', 'sterile', 'chrome'] :
         ['comfortable', 'local', 'welcoming'],

    shop: vibeConfig.name === 'High Fantasy' ? ['cluttered', 'mystical', 'enchanted'] :
          vibeConfig.name === 'Cyberpunk' ? ['black market', 'underground', 'digital'] :
          vibeConfig.name === 'Horror' ? ['abandoned', 'dusty', 'cursed'] :
          vibeConfig.name === 'Wild West' ? ['general', 'frontier', 'weathered'] :
          vibeConfig.name === 'Science Fiction' ? ['automated', 'holographic', 'synthetic'] :
          ['corner', 'neighborhood', 'busy'],

    market: vibeConfig.name === 'High Fantasy' ? ['bustling', 'colorful', 'magical'] :
            vibeConfig.name === 'Cyberpunk' ? ['black', 'underground', 'data'] :
            vibeConfig.name === 'Horror' ? ['abandoned', 'ghostly', 'empty'] :
            vibeConfig.name === 'Wild West' ? ['frontier', 'trading', 'dusty'] :
            vibeConfig.name === 'Science Fiction' ? ['orbital', 'automated', 'digital'] :
            ['farmers', 'weekend', 'local']
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

const addAtmosphericFlavor = (text: string, vibeConfig: VibeDefinition): string => {
  const atmosphericPrefix = getRandomTerm(vibeConfig.atmosphereTerms)

  // Add subtle atmospheric enhancement without changing core meaning
  if (text.length < 20) {
    return `In the ${atmosphericPrefix} surroundings, ${text}`
  }

  return text
}

// Mock AI assistance for creators (in real app would be actual AI)
const createItem = (input: string): CreatedItem => {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('sword')) {
    return {
      id,
      name: 'Forged Blade',
      tags: ['close', 'sharp'],
      description: 'A well-crafted sword with a keen edge and sturdy grip.',
      stats: '1d8 damage, close'
    }
  }

  return {
    id,
    name: input || 'Mysterious Item',
    tags: ['item'],
    description: 'An interesting item with unknown properties.',
    stats: 'Special properties unknown'
  }
}

const createNPC = (input: string): CreatedNPC => {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('merchant')) {
    return {
      id,
      name: 'Aldric Coinworth',
      appearance: 'A portly man with calculating eyes and fine clothes',
      drive: 'To profit from every transaction',
      quirk: 'Always counts coins twice',
      voice: 'Smooth and persuasive, with a slight wheeze',
      knows: 'Trade routes, valuable goods, local customs'
    }
  }

  return {
    id,
    name: input || 'Unnamed Person',
    appearance: 'An ordinary-looking individual',
    drive: 'To live their daily life',
    quirk: 'Has a memorable mannerism',
    voice: 'Speaks in a distinctive way',
    knows: 'Local gossip and common knowledge'
  }
}

const createMonster = (input: string): CreatedMonster => {
  const id = Math.random().toString(36).substr(2, 9)

  if (input.toLowerCase().includes('goblin')) {
    return {
      id,
      name: 'Goblin Raider',
      hp: 6,
      armor: 1,
      damage: '1d6',
      instinct: 'To raid and pillage',
      moves: ['Swarm with numbers', 'Strike from shadows', 'Flee when outnumbered']
    }
  }

  return {
    id,
    name: input || 'Unknown Creature',
    hp: 8,
    armor: 0,
    damage: '1d6',
    instinct: 'To survive',
    moves: ['Fight when cornered', 'Protect territory', 'Seek sustenance']
  }
}

export const PlayTab: React.FC<PlayTabProps> = ({ className = '' }) => {
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const { isOverlayEnabled } = useChronicle()
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
  const [aiEnhancer, setAiEnhancer] = useState<OllamaAiNoteEnhancer | null>(null)
  const [aiStatus, setAiStatus] = useState<'loading' | 'ready' | 'fallback' | 'error'>('loading')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [aiProgress, setAiProgress] = useState<AIProgress>({ progress: 0, text: "Starting AI...", stage: "loading" })

  // Initialize AI enhancer
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const enhancer = new OllamaAiNoteEnhancer()
        setAiStatus('loading')
        setAiProgress({ progress: 0, text: "Starting AI...", stage: "loading" })
        console.log('🤖 Starting AI initialization...')

        // Set up progress callback
        enhancer.onProgress = (progress) => {
          setAiProgress(progress)
        }

        // Set a timeout for AI initialization
        const timeout = setTimeout(() => {
          console.warn('⏰ AI taking longer than expected, falling back to pattern mode')
          setAiStatus('fallback')
          setAiProgress({ progress: 0, text: "Timed out - using pattern mode", stage: "error" })
        }, 120000) // 2 minutes timeout

        await enhancer.initialize()
        clearTimeout(timeout)

        setAiEnhancer(enhancer)
        setAiStatus('ready')
        setAiProgress({ progress: 100, text: "AI ready!", stage: "ready" })
        console.log('🎉 AI Note Enhancer ready!')
      } catch (error) {
        console.warn('⚠️ AI unavailable, using pattern fallback:', error)
        setAiStatus('fallback')
        setAiProgress({ progress: 0, text: "AI failed - using pattern mode", stage: "error" })
      }
    }

    initializeAI()

    return () => {
      if (aiEnhancer) {
        aiEnhancer.dispose()
      }
    }
  }, [])

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
    const { type, params } = action

    switch (type) {
      case 'apply_debility':
        console.log(`Applying debility: ${params.debility} (${params.reason})`)
        // TODO: Integrate with character store
        // characterStore.applyDebility(params.debility, params.reason)
        break

      case 'modify_hp':
        console.log(`Modifying HP: ${params.change > 0 ? '+' : ''}${params.change} (${params.reason})`)
        // TODO: Integrate with character store
        // characterStore.modifyHP(params.change, params.reason)
        break

      case 'add_gear':
        console.log(`Adding gear: ${params.name} - ${params.description}`)
        // TODO: Integrate with character store
        // characterStore.addGear(params.name, params.tags || [], params.description, params.weight, params.uses)
        break

      case 'spend_resource':
        console.log(`Spending resource: ${params.amount} ${params.resource} (${params.reason})`)
        // TODO: Integrate with character store
        // characterStore.spendResource(params.resource, params.amount, params.reason)
        break

      case 'gain_xp':
        console.log(`Gaining XP: ${params.amount} from ${params.trigger} (${params.description})`)
        // TODO: Integrate with character store
        // characterStore.gainXP(params.amount, params.trigger, params.description)
        break

      case 'update_bonds':
        console.log(`Updating bonds with ${params.character}: ${params.new_bond} (${params.action})`)
        // TODO: Integrate with character store
        // characterStore.updateBonds(params.character, params.new_bond, params.action)
        break

      default:
        console.warn('Unknown character action type:', type)
    }
  }

  // Chronicle management functions
  const addChronicleEntry = async (rawText: string) => {
    if (!rawText.trim()) return

    let enhanced = rawText
    let actions: CharacterAction[] = []

    setIsEnhancing(true)
    console.log(`🎭 Processing chronicle entry: "${rawText}"`)
    console.log(`🤖 AI Status: ${aiStatus}, AI Ready: ${!!aiEnhancer}`)

    try {
      // Try AI enhancement first
      if (aiStatus === 'ready' && aiEnhancer) {
        console.log('✨ Using AI enhancement...')
        const result = await aiEnhancer.enhance(rawText, campaignVibe)
        enhanced = result.enhancedText
        actions = result.actions
        console.log(`📝 Enhanced text: "${enhanced}"`)
        console.log(`⚡ Actions detected:`, actions)

        // Execute character actions
        actions.forEach(action => handleCharacterAction(action))
      } else if (aiStatus === 'fallback') {
        console.log('🔄 Using pattern-based fallback enhancement')
        // Fallback to pattern-based enhancement
        enhanced = enhanceNote(rawText, campaignVibe)
        console.log(`📝 Pattern enhanced: "${enhanced}"`)
      } else {
        console.log(`⚠️ No enhancement - AI status: ${aiStatus}, enhancer: ${!!aiEnhancer}`)
      }
    } catch (error) {
      console.warn('AI enhancement failed, using fallback:', error)
      enhanced = enhanceNote(rawText, campaignVibe)
    } finally {
      setIsEnhancing(false)
    }

    const entry: ChronicleEntry = {
      id: Math.random().toString(36).substr(2, 9),
      content: enhanced,
      timestamp: new Date(),
      enhanced: enhanced !== rawText,
      originalNote: enhanced !== rawText ? rawText : undefined
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

  const handleDiceRoll = (roll: { finalResult: number; modifier: number; outcome: string }) => {
    const diceContext: DiceRollContext = {
      id: Math.random().toString(36).substr(2, 9),
      result: roll.finalResult,
      modifier: roll.modifier,
      stat: 'move',
      timestamp: new Date(),
      outcome: roll.outcome
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
    if (!itemInput.trim()) return
    const item = createItem(itemInput)
    setCreatedItems(prev => [...prev, item])
    setItemInput('')
  }

  const handleCreateNPC = () => {
    if (!npcInput.trim()) return
    const npc = createNPC(npcInput)
    setCreatedNPCs(prev => [...prev, npc])
    setNpcInput('')
  }

  const handleCreateMonster = () => {
    if (!monsterInput.trim()) return
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
        <Card variant="magical" padding="lg">
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen size={24} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-display mb-2">Ready to Chronicle?</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
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
        className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
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
              <div className="text-sm text-gray-600">
                Level {activeCharacter.level} {activeCharacter.class}
              </div>

              {/* Campaign Vibe Selector */}
              <div className="space-y-2">
                <label htmlFor="campaign-setting" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Campaign Setting
                </label>
                <select
                  id="campaign-setting"
                  value={campaignVibe}
                  onChange={(e) => setCampaignVibe(e.target.value as CampaignVibe)}
                  className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {Object.entries(campaignVibes).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">
                  Current: {campaignVibes[campaignVibe].name}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>{activeCharacter.hp.current}/{activeCharacter.hp.max}</span>
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
                    <span>{activeCharacter.xp}/{xpNeeded}</span>
                  </div>
                  <Progress
                    value={activeCharacter.xp}
                    max={xpNeeded}
                    variant="experience"
                    className="h-2"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs font-medium">
                    {isSessionActive ? `${sessionTime}m` : 'Paused'}
                  </span>
                </div>
                <Button
                  variant={isSessionActive ? "destructive" : "primary"}
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
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                              🧠 AI Enhanced
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
                          {chronicleEntries.length} entries
                        </Badge>
                      </div>

                      {/* Chronicle Text Area */}
                      <div className="flex-1 flex flex-col">
                        <Textarea
                          ref={chronicleTextareaRef}
                          value={chronicleText}
                          onChange={(e) => setChronicleText(e.target.value)}
                          placeholder="What happens in your adventure? Write your story here...\n\nTip: Write naturally - 'fought goblins, got hurt' becomes 'You battled the goblin raiders, suffering wounds in the fierce struggle.'"
                          className="flex-1 resize-none text-base leading-relaxed font-serif"
                          style={{ minHeight: '400px' }}
                        />

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-blue-500" />
                            <span className="text-xs text-gray-600">AI enhancing your notes</span>
                          </div>
                          <Button
                            onClick={() => addChronicleEntry(chronicleText)}
                            disabled={!chronicleText.trim() || isEnhancing}
                            className="gap-2"
                          >
                            {isEnhancing ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enhancing...
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
                <div className="grid grid-cols-2 gap-6">
                  {/* Recent Chronicle Entries */}
                  <Card variant="glass">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Recent Story
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {chronicleEntries.slice(-5).map((entry) => (
                          <div key={entry.id} className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-primary/30">
                            <div className="text-sm leading-relaxed">
                              {entry.content}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-xs text-gray-500">
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
                          <div className="text-center text-gray-500 py-8">
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

                      {pendingDiceContext ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <div className="text-sm font-medium mb-2">Last Roll: {pendingDiceContext.result}</div>
                            <Input
                              placeholder="What were you trying to do?"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const context = (e.target as HTMLInputElement).value
                                  const outcome = pendingDiceContext.result >= 10 ? 'Success!' :
                                    pendingDiceContext.result >= 7 ? 'Partial success' : 'Things went wrong'
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
                      ) : (
                        <div className="space-y-4">
                          <ChronicleEnabledDiceRoller
                            move="Story Roll"
                            characterName={activeCharacter.name}
                            onRoll={handleDiceRoll}
                          />
                          <div className="text-xs text-center text-gray-500">
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
                        Create {toolsSubTab === 'items' ? 'Item' : toolsSubTab === 'monsters' ? 'Monster' : 'NPC'}
                      </h3>
                      <div className="space-y-3">
                        <Input
                          value={toolsSubTab === 'items' ? itemInput : toolsSubTab === 'monsters' ? monsterInput : npcInput}
                          onChange={(e) => {
                            if (toolsSubTab === 'items') setItemInput(e.target.value)
                            else if (toolsSubTab === 'monsters') setMonsterInput(e.target.value)
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
                  <Card variant="glass">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">
                        Your {toolsSubTab.charAt(0).toUpperCase() + toolsSubTab.slice(1)}
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {toolsSubTab === 'items' && createdItems.map(item => (
                          <div key={item.id} className="p-3 bg-white dark:bg-gray-800 rounded border">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.tags.join(', ')}</div>
                            <div className="text-sm mt-1">{item.description}</div>
                            <div className="text-xs font-mono mt-1">{item.stats}</div>
                          </div>
                        ))}

                        {toolsSubTab === 'monsters' && createdMonsters.map(monster => (
                          <div key={monster.id} className="p-3 bg-white dark:bg-gray-800 rounded border">
                            <div className="font-medium">{monster.name}</div>
                            <div className="text-xs text-gray-500">{monster.hp} HP, {monster.armor} armor</div>
                            <div className="text-sm mt-1">{monster.instinct}</div>
                            <ul className="text-xs mt-1 list-disc list-inside">
                              {monster.moves.map((move, i) => <li key={i}>{move}</li>)}
                            </ul>
                          </div>
                        ))}

                        {toolsSubTab === 'npcs' && createdNPCs.map(npc => (
                          <div key={npc.id} className="p-3 bg-white dark:bg-gray-800 rounded border">
                            <div className="font-medium">{npc.name}</div>
                            <div className="text-xs text-gray-500">{npc.quirk}</div>
                            <div className="text-sm mt-1">{npc.appearance}</div>
                            <div className="text-xs mt-1"><strong>Drive:</strong> {npc.drive}</div>
                            <div className="text-xs"><strong>Knows:</strong> {npc.knows}</div>
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