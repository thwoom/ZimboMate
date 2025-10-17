/**
 * Game Management Tab - Administrative Gaming Features
 *
 * Consolidates all GM-focused and administrative features that don't belong
 * in active gameplay, including Chronicle Management as a primary feature.
 */

import { motion } from 'framer-motion'
import {
  BookOpen,
  Crown,
  Dice5,
  MapPin,
  Search,
  Settings as SettingsIcon,
  Skull,
  Sparkles,
  Sword,
  User,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Badge, Button, Card, CardContent, Input } from '../ui'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { BondTracker } from './BondTracker'
import { CampaignPanel } from './CampaignPanel'
import { ChroniclePanel } from './Chronicle/ChroniclePanel'
import { MonsterManager } from './MonsterManager'
import { UnifiedRollSystem } from '../dice/UnifiedRollSystem'
import { ContextAwareSystem } from './ContextAwareSystem'
import { useCharacterStore } from '../../stores/characterStore'

type GameManagementTabId =
  | 'chronicle'
  | 'campaign'
  | 'monsters'
  | 'multiplayer'
  | 'tools'

type ToolsSubTab = 'dice' | 'items' | 'monsters' | 'npcs'

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

interface GameManagementTabProps {
  className?: string
  initialTab?: GameManagementTabId
}

export const GameManagementTab: React.FC<GameManagementTabProps> = ({
  className = '',
  initialTab = 'chronicle',
}) => {
  const [activeTab, setActiveTab] = useState<GameManagementTabId>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [toolsSubTab, setToolsSubTab] = useState<ToolsSubTab>('dice')
  const [itemInput, setItemInput] = useState('')
  const [npcInput, setNpcInput] = useState('')
  const [monsterInput, setMonsterInput] = useState('')
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([])
  const [createdNPCs, setCreatedNPCs] = useState<CreatedNPC[]>([])
  const [createdMonsters, setCreatedMonsters] = useState<CreatedMonster[]>([])

  const activeCharacter = useCharacterStore((state) => state.getActiveCharacter?.())

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return createdItems
    return createdItems.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [createdItems, normalizedQuery])

  const filteredMonsters = useMemo(() => {
    if (!normalizedQuery) return createdMonsters
    return createdMonsters.filter((monster) => {
      const haystack = `${monster.name} ${monster.instinct} ${monster.moves.join(' ')}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [createdMonsters, normalizedQuery])

  const filteredNPCs = useMemo(() => {
    if (!normalizedQuery) return createdNPCs
    return createdNPCs.filter((npc) => {
      const haystack = `${npc.name} ${npc.quirk} ${npc.knows} ${npc.appearance}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [createdNPCs, normalizedQuery])

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

  const tabs = [
    {
      id: 'chronicle' as const,
      label: 'Chronicle',
      icon: BookOpen,
      description: 'Story building, timeline, and narrative management',
      featured: true,
    },
    {
      id: 'campaign' as const,
      label: 'Campaign',
      icon: MapPin,
      description: 'Campaign overview, sessions, and long-term planning',
    },
    {
      id: 'monsters' as const,
      label: 'Monsters',
      icon: Skull,
      description: 'Monster management and encounter building',
    },
    {
      id: 'multiplayer' as const,
      label: 'Multiplayer',
      icon: Users,
      description: 'Session setup and player management',
    },
    {
      id: 'tools' as const,
      label: 'Tools',
      icon: SettingsIcon,
      description: 'Additional utilities and session helpers',
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'chronicle':
        return <ChroniclePanel />
      case 'campaign':
        return (
          <div className='space-y-6'>
            <CampaignPanel />
            <BondTracker />
          </div>
        )
      case 'monsters':
        return <MonsterManager />
      case 'multiplayer':
        return (
          <Card variant='magical'>
            <CardContent>
              <div className='text-center space-y-6'>
                <div className='w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-primary/20'>
                  <Users className='text-primary' size={32} />
                </div>
                <div>
                  <h2 className='text-2xl font-display mb-2'>
                    Multiplayer Sessions
                  </h2>
                  <p className='max-w-md mx-auto text-muted-foreground'>
                    Connect with friends for shared adventures and real-time
                    dice rolling. Advanced multiplayer management features.
                  </p>
                </div>
                <div className='flex flex-wrap gap-3 justify-center'>
                  <Badge variant='default'>Real-time Dice Sharing ✅</Badge>
                  <Badge variant='default'>Session Management ✅</Badge>
                  <Badge variant='default'>WebSocket Integration ✅</Badge>
                  <Badge variant='secondary'>Voice Chat 🔄</Badge>
                </div>
                <Button
                  variant='primary'
                  size='lg'
                  className='gap-2 magical-glow'
                >
                  <Users size={20} />
                  Start Multiplayer Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'tools':
        return (
          <div className='space-y-6'>
            <Tabs
              value={toolsSubTab}
              onValueChange={(value) => setToolsSubTab(value as ToolsSubTab)}
            >
              <TabsList className='grid w-full grid-cols-1 gap-2 bg-muted/40 p-1 sm:grid-cols-4'>
                <TabsTrigger
                  value='dice'
                  className='flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:shadow-primary'
                >
                  <Dice5 className='size-4 shrink-0' aria-hidden='true' />
                  <span className='truncate'>Dice</span>
                </TabsTrigger>
                <TabsTrigger
                  value='items'
                  className='flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:shadow-primary'
                >
                  <Sword className='size-4 shrink-0' aria-hidden='true' />
                  <span className='truncate'>Items</span>
                </TabsTrigger>
                <TabsTrigger
                  value='monsters'
                  className='flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:shadow-primary'
                >
                  <Crown className='size-4 shrink-0' aria-hidden='true' />
                  <span className='truncate'>Monsters</span>
                </TabsTrigger>
                <TabsTrigger
                  value='npcs'
                  className='flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:shadow-primary'
                >
                  <User className='size-4 shrink-0' aria-hidden='true' />
                  <span className='truncate'>NPCs</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {toolsSubTab === 'dice' ? (
              <div className='space-y-6'>
                {activeCharacter ? (
                  <>
                    <Card variant='elevated'>
                      <CardContent className='p-4'>
                        <UnifiedRollSystem
                          characterId={activeCharacter.id}
                          className='rounded-lg border border-border/60 bg-card/70 p-1'
                          showHistory={false}
                        />
                      </CardContent>
                    </Card>
                    <Card variant='surface'>
                      <CardContent className='p-4'>
                        <ContextAwareSystem context='dice' compact />
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card variant='surface' className='border border-dashed border-primary/40'>
                    <CardContent className='space-y-4 p-6 text-center'>
                      <p className='text-sm text-muted-foreground'>
                        Choose or create a character to unlock stat-based dice rolls,
                        move tracking, and AI-powered summaries.
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Head to the Campaign tab or Character Builder to assign an active hero.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className='grid gap-6 lg:grid-cols-2'>
                <Card variant='elevated'>
                  <CardContent className='space-y-3 p-4'>
                    <h3 className='font-semibold'>
                      Create{' '}
                      {toolsSubTab === 'items'
                        ? 'Item'
                        : toolsSubTab === 'monsters'
                          ? 'Monster'
                          : 'NPC'}
                    </h3>
                    <Input
                      value={
                        toolsSubTab === 'items'
                          ? itemInput
                          : toolsSubTab === 'monsters'
                            ? monsterInput
                            : npcInput
                      }
                      onChange={(event) => {
                        const value = event.target.value
                        if (toolsSubTab === 'items') setItemInput(value)
                        else if (toolsSubTab === 'monsters') setMonsterInput(value)
                        else setNpcInput(value)
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
                    <p className='text-xs text-muted-foreground'>
                      {toolsSubTab === 'items'
                        ? 'Describe damage tags or quirks to generate balanced loot.'
                        : toolsSubTab === 'monsters'
                          ? 'Provide instincts or tactics to shape encounter behavior.'
                          : 'Mention personality cues to craft memorable NPCs.'}
                    </p>
                  </CardContent>
                </Card>
                <Card variant='surface'>
                  <CardContent className='space-y-4 p-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold'>
                        Your{' '}
                        {toolsSubTab.charAt(0).toUpperCase() +
                          toolsSubTab.slice(1)}
                      </h3>
                      {normalizedQuery && (
                        <span className='text-xs text-muted-foreground'>
                          Filtering by “{searchQuery}”
                        </span>
                      )}
                    </div>
                    <div className='max-h-96 space-y-3 overflow-y-auto pr-1'>
                      {toolsSubTab === 'items' &&
                        (filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
                            <div
                              key={item.id}
                              className='rounded-lg border border-border/60 bg-card/70 p-3'
                            >
                              <div className='font-medium'>{item.name}</div>
                              <div className='text-xs text-muted-foreground'>
                                {item.tags.join(', ')}
                              </div>
                              <div className='mt-1 text-sm'>{item.description}</div>
                              {item.stats ? (
                                <div className='mt-1 text-xs font-mono'>{item.stats}</div>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            {createdItems.length === 0
                              ? 'No items yet—use the generator to craft your first one.'
                              : 'No items match your search.'}
                          </p>
                        ))}

                      {toolsSubTab === 'monsters' &&
                        (filteredMonsters.length > 0 ? (
                          filteredMonsters.map((monster) => (
                            <div
                              key={monster.id}
                              className='rounded-lg border border-border/60 bg-card/70 p-3'
                            >
                              <div className='font-medium'>{monster.name}</div>
                              <div className='text-xs text-muted-foreground'>
                                {monster.hp} HP, {monster.armor} armor — {monster.damage} damage
                              </div>
                              <div className='mt-1 text-sm'>{monster.instinct}</div>
                              <ul className='mt-1 list-inside list-disc text-xs'>
                                {monster.moves.map((move) => (
                                  <li key={`${monster.id}-${move}`}>{move}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            {createdMonsters.length === 0
                              ? 'No monsters yet—generate a threat to populate your world.'
                              : 'No monsters match your search.'}
                          </p>
                        ))}

                      {toolsSubTab === 'npcs' &&
                        (filteredNPCs.length > 0 ? (
                          filteredNPCs.map((npc) => (
                            <div
                              key={npc.id}
                              className='rounded-lg border border-border/60 bg-card/70 p-3'
                            >
                              <div className='font-medium'>{npc.name}</div>
                              <div className='text-xs text-muted-foreground'>
                                {npc.quirk}
                              </div>
                              <div className='mt-1 text-sm'>{npc.appearance}</div>
                              <div className='mt-1 text-xs'>
                                <strong>Drive:</strong> {npc.drive}
                              </div>
                              <div className='text-xs'>
                                <strong>Knows:</strong> {npc.knows}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            {createdNPCs.length === 0
                              ? 'No NPCs yet—ask the assistant for a quick personality sketch.'
                              : 'No NPCs match your search.'}
                          </p>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )
      default:
        return <ChroniclePanel />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-display mb-2'>Game Management</h2>
          <p className='text-muted-foreground'>
            Administrative tools for GMs and session organization
          </p>
        </div>
        <Badge variant='default' className='magical-glow'>
          Chronicle Enhanced ✨
        </Badge>
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GameManagementTabId)}
        className='min-w-0'
      >
        <TabsList className='w-full gap-1'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className='gap-1.5'
                title={tab.description}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.featured && !isActive && (
                  <Badge variant='secondary' className='ml-1 text-xs'>
                    ★
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Search Bar (for applicable tabs) */}
      {(activeTab === 'chronicle' ||
        activeTab === 'campaign' ||
        activeTab === 'monsters') && (
        <Card variant='surface'>
          <CardContent>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
              />
              <input
                type='text'
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-lg border transition-colors'
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--primary)',
                  borderOpacity: 0.2,
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}

export default GameManagementTab
