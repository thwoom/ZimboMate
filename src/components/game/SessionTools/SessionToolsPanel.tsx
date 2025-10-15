/**
 * Session Tools Panel - Main container for session management tools
 * Phase 4A: Core Gameplay Features - Essential for actual play
 */

import { History, NotebookPen, Search, Target, Timer } from 'lucide-react'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Badge, Card, CardContent, Input } from '../../ui'
import { NotesWidget } from './NotesWidget'
import { RollHistoryWidget } from './RollHistoryWidget'
import { TimersWidget } from './TimersWidget'
import { TrackersWidget } from './TrackersWidget'

type SessionToolTab = 'notes' | 'trackers' | 'timers' | 'history'

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
      id: 'timers' as const,
      label: 'Timers',
      icon: Timer,
      description: 'Session timers and bookmarks',
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
      className={cn('space-y-6', className)}
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
      <Card variant='surface'>
        <CardContent className='p-3 sm:p-4'>
          <TabsList className='grid w-full grid-cols-2 gap-2 bg-muted/40 p-1 sm:grid-cols-4'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium data-[state=active]:shadow-primary sm:px-3'
                  title={tab.description}
                >
                  <Icon className='size-4 shrink-0' aria-hidden='true' />
                  <span className='truncate'>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </CardContent>
      </Card>

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
      <TabsContent value='timers' className='mt-0'>
        <TimersWidget />
      </TabsContent>
      <TabsContent value='history' className='mt-0'>
        <RollHistoryWidget searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  )
}
