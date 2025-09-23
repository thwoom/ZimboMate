/**
 * Session Tools Panel - Main container for session management tools
 * Phase 4A: Core Gameplay Features - Essential for actual play
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  NotebookPen, 
  Timer, 
  Target, 
  History, 
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import { NotesWidget } from './NotesWidget'
import { TrackersWidget } from './TrackersWidget'
import { TimersWidget } from './TimersWidget'
import { RollHistoryWidget } from './RollHistoryWidget'

type SessionToolTab = 'notes' | 'trackers' | 'timers' | 'history'

interface SessionToolsPanelProps {
  className?: string
}

export const SessionToolsPanel: React.FC<SessionToolsPanelProps> = ({ 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<SessionToolTab>('notes')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { 
      id: 'notes' as const, 
      label: 'Notes', 
      icon: NotebookPen,
      description: 'Session notes and important information'
    },
    { 
      id: 'trackers' as const, 
      label: 'Trackers', 
      icon: Target,
      description: 'Custom counters and progress trackers'
    },
    { 
      id: 'timers' as const, 
      label: 'Timers', 
      icon: Timer,
      description: 'Session timers and bookmarks'
    },
    { 
      id: 'history' as const, 
      label: 'History', 
      icon: History,
      description: 'Roll history and event log'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesWidget searchQuery={searchQuery} />
      case 'trackers':
        return <TrackersWidget />
      case 'timers':
        return <TimersWidget />
      case 'history':
        return <RollHistoryWidget searchQuery={searchQuery} />
      default:
        return <NotesWidget searchQuery={searchQuery} />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Session Tools</h2>
          <p className="text-muted-foreground">
            Essential tools for managing your Dungeon World sessions
          </p>
        </div>
        <Badge variant="default" className="magical-glow">
          Phase 4A ✨
        </Badge>
      </div>

      {/* Tab Navigation */}
      <Card variant="surface">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 min-w-0"
                  title={tab.description}
                >
                  <Icon size={16} />
                  <span className="truncate">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      
                      layoutId="sessionToolTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search Bar (for notes and history) */}
      {(activeTab === 'notes' || activeTab === 'history') && (
        <Card variant="surface">
          <CardContent className="p-4">
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--primary)',
                  borderOpacity: 0.2,
                  color: 'var(--foreground)'
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