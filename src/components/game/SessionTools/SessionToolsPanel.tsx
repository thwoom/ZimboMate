/**
 * Session Tools Panel - Main container for session management tools
 * Phase 4A: Core Gameplay Features - Essential for actual play
 */

import { History, NotebookPen, Search, Target } from 'lucide-react'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Badge, Card, CardContent, Input } from '../../ui'
import { NotesWidget } from './NotesWidget'
import { RollHistoryWidget } from './RollHistoryWidget'
import { TrackersWidget } from './TrackersWidget'

type SessionToolTab = 'notes' | 'trackers' | 'history'

interface SessionToolsPanelProps {
  className?: string
}

export const SessionToolsPanel: React.FC<SessionToolsPanelProps> = ({
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<SessionToolTab>('notes')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    {
      id: 'notes' as const,
      label: 'Notes',
      icon: NotebookPen,
      description: 'Session notes and important information',
    },
    {
      id: 'trackers' as const,
      label: 'Trackers',
      icon: Target,
      description: 'Custom counters and progress trackers',
    },
    {
      id: 'history' as const,
      label: 'History',
      icon: History,
      description: 'Roll history and event log',
    },
  ]

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as SessionToolTab)}
      className={cn('min-w-0 space-y-6', className)}
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-display mb-2'>Session Tools</h2>
          <p className='text-muted-foreground'>
            Essential tools for managing your Dungeon World sessions
          </p>
        </div>
        <Badge variant='default' className='magical-glow'>
          Phase 4A ✨
        </Badge>
      </div>

      {/* Tab Navigation */}
      <TabsList className='w-full gap-1'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className='gap-1.5'
              title={tab.description}
            >
              <Icon size={16} aria-hidden='true' />
              <span>{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {/* Search Bar (for notes and history) */}
      {(activeTab === 'notes' || activeTab === 'history') && (
        <Card variant='surface'>
          <CardContent className='p-4'>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
                aria-hidden='true'
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className='pl-9'
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <TabsContent value='notes' className='mt-0'>
        <NotesWidget searchQuery={searchQuery} />
      </TabsContent>
      <TabsContent value='trackers' className='mt-0'>
        <TrackersWidget />
      </TabsContent>
      <TabsContent value='history' className='mt-0'>
        <RollHistoryWidget searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  )
}
