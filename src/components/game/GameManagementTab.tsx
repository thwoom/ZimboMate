import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dice5, MapPin, Settings as SettingsIcon, Skull, NotebookPen } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input } from '../ui'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { BondTracker } from './BondTracker'
import { CampaignPanel } from './CampaignPanel'
import { MonsterManager } from './MonsterManager'
import { UnifiedRollSystem } from '../dice/UnifiedRollSystem'
import { ContextAwareSystem } from './ContextAwareSystem'
import { useCharacterStore } from '../../stores/characterStore'
import { useSecretaryStore } from '@/stores/secretaryStore'
import { SecretaryNotesPreview } from './SecretaryNotesPreview'
import { useCampaignStore } from '@/stores/campaignStore'
import { useMonsterStore } from '@/stores/monsterStore'

export type GameManagementTabId = 'campaign' | 'monsters' | 'tools'

interface GameManagementTabProps {
  className?: string
  initialTab?: GameManagementTabId
}

export const GameManagementTab: React.FC<GameManagementTabProps> = ({
  className = '',
  initialTab = 'campaign',
}) => {
  const [activeTab, setActiveTab] = useState<GameManagementTabId>(initialTab)
  const [quickNote, setQuickNote] = useState('')
  const [quickTag, setQuickTag] = useState('')
  const [quickMonster, setQuickMonster] = useState({ name: '', hp: '6', armor: '0', damage: 'd6' })

  const hasSeededCampaign = useRef(false)
  const activeCharacter = useCharacterStore((state) => state.getActiveCharacter?.())
  const activeCampaign = useCampaignStore((s) => s.getActiveCampaign())
  const ensureCampaign = useCampaignStore((s) => s.createCampaign)
  const campaigns = useCampaignStore((s) => s.campaigns)
  const monsterStore = useMonsterStore()
  const secretary = useSecretaryStore()
  const tabs = [
    { id: 'campaign' as const, label: 'Campaign', icon: MapPin, description: 'Sessions, journal, NPCs, locations' },
    { id: 'monsters' as const, label: 'Monsters', icon: Skull, description: 'Bestiary and custom monsters' },
    { id: 'tools' as const, label: 'Tools', icon: SettingsIcon, description: 'Dice and utilities' },
  ]

  useEffect(() => {
    if (hasSeededCampaign.current) return
    if (activeCampaign || campaigns.length > 0) return
    hasSeededCampaign.current = true
    ensureCampaign('Home Campaign', 'Auto-created so notes and secretary have a home.')
  }, [activeCampaign, campaigns.length, ensureCampaign])

  const renderContent = () => {
    switch (activeTab) {
      case 'campaign':
        return (
          <div className='space-y-6'>
            <CampaignPanel />
            <BondTracker />
            <Card variant='surface'>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <NotebookPen className='text-primary' size={16} />
                    <div className='font-semibold'>Secretary Quick Capture</div>
                  </div>
                  <Badge variant='outline'>Offline</Badge>
                </div>
                <div className='grid gap-2 md:grid-cols-2'>
                  <Input
                    placeholder='Note title or event...'
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                  />
                  <div className='flex gap-2'>
                    <Input
                      placeholder='Tag (npc, location, item...)'
                      value={quickTag}
                      onChange={(e) => setQuickTag(e.target.value)}
                    />
                    <Button
                      variant='primary'
                      onClick={() => {
                        if (!quickNote.trim()) return
                        const parse = {
                          text: quickNote,
                          actions: [
                            {
                              type: 'addNote' as const,
                              title: quickNote.trim(),
                              confidence: 1,
                              from: 'rules' as const,
                            },
                            ...(quickTag.trim()
                              ? [
                                  {
                                    type: 'addTag' as const,
                                    entityName: quickTag.trim(),
                                    tagType: 'npc' as const,
                                    confidence: 1,
                                    from: 'rules' as const,
                                  },
                                ]
                              : []),
                          ],
                          confidence: 1,
                          createdAt: Date.now(),
                        }
                        secretary.applyActions(parse)
                        setQuickNote('')
                        setQuickTag('')
                        if (!activeCampaign) {
                          // ensure at least one campaign exists for downstream views
                          ensureCampaign('Home Campaign')
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant='surface'>
              <CardContent className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='font-semibold'>Secretary Notes</div>
                  <Badge variant='outline'>Recent</Badge>
                </div>
                <SecretaryNotesPreview />
              </CardContent>
            </Card>
          </div>
        )
      case 'monsters':
        return <MonsterManager />
      case 'tools':
        return (
          <div className='space-y-6'>
            <Card variant='surface'>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='inline-flex items-center space-x-2'>
                    <Dice5 className='text-primary' />
                    <h2 className='text-lg font-semibold'>Dice Lab</h2>
                  </div>
                </div>
                <UnifiedRollSystem />
              </CardContent>
            </Card>

            <Card variant='surface'>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='inline-flex items-center space-x-2'>
                    <SettingsIcon className='text-primary' />
                    <h2 className='text-lg font-semibold'>Context Aware</h2>
                  </div>
                </div>
                <ContextAwareSystem />
              </CardContent>
            </Card>
            <Card variant='surface'>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='inline-flex items-center space-x-2'>
                    <Skull className='text-primary' />
                    <h2 className='text-lg font-semibold'>Quick Monster</h2>
                  </div>
                  <Badge variant='outline'>Ad-hoc</Badge>
                </div>
                <div className='grid gap-2 md:grid-cols-4'>
                  <Input
                    placeholder='Name'
                    value={quickMonster.name}
                    onChange={(e) => setQuickMonster((m) => ({ ...m, name: e.target.value }))}
                  />
                  <Input
                    placeholder='HP'
                    value={quickMonster.hp}
                    onChange={(e) => setQuickMonster((m) => ({ ...m, hp: e.target.value }))}
                  />
                  <Input
                    placeholder='Armor'
                    value={quickMonster.armor}
                    onChange={(e) => setQuickMonster((m) => ({ ...m, armor: e.target.value }))}
                  />
                  <Input
                    placeholder='Damage'
                    value={quickMonster.damage}
                    onChange={(e) => setQuickMonster((m) => ({ ...m, damage: e.target.value }))}
                  />
                </div>
                <Button
                  variant='primary'
                  onClick={() => {
                    if (!quickMonster.name.trim()) return
                    monsterStore.createQuickMonster(
                      quickMonster.name.trim(),
                      Number(quickMonster.hp) || 6,
                      Number(quickMonster.armor) || 0,
                      quickMonster.damage || 'd6',
                    )
                    setQuickMonster({ name: '', hp: '6', armor: '0', damage: 'd6' })
                  }}
                >
                  Add Quick Monster
                </Button>
                {monsterStore.quickMonsters.length > 0 && (
                  <div className='grid gap-2 md:grid-cols-2'>
                    {monsterStore.quickMonsters.slice(-4).reverse().map((m, idx) => (
                      <Card key={`${m.name}-${idx}`} variant='surface' className='border-dashed'>
                        <CardContent className='py-3 space-y-1'>
                          <div className='flex items-center justify-between text-sm font-semibold'>
                            <span>{m.name}</span>
                            <Badge variant='secondary'>HP {m.hp}</Badge>
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Armor {m.armor} | Damage {m.damage}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold'>Game Management</h2>
          <p className='text-sm text-muted-foreground'>Campaign, monsters, and tools.</p>
        </div>
        {activeCharacter ? (
          <Badge variant='default' className='magical-glow'>Ready</Badge>
        ) : (
          <Badge variant='secondary'>No character</Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GameManagementTabId)} className='space-y-4'>
        <TabsList className='w-full gap-1'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className='gap-2'>
              <tab.icon size={16} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card variant='surface'>
          <CardContent className='space-y-6'>
            {renderContent()}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

export default GameManagementTab

