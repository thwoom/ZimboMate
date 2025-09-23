/**
 * Game Management Tab - Administrative Gaming Features
 *
 * Consolidates all GM-focused and administrative features that don't belong
 * in active gameplay, including Chronicle Management as a primary feature.
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarClock,
  BookOpenText,
  Users,
  MapPin,
  LayoutPanelLeft,
  Search,
  Skull,
  Settings as SettingsIcon,
  Sparkles,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../ui'
import { CampaignPanel } from './CampaignPanel'
import { ChroniclePanel } from './Chronicle/ChroniclePanel'
import { MonsterManager } from './MonsterManager'
import { BondTracker } from './BondTracker'

type GameManagementTab = 'chronicle' | 'campaign' | 'monsters' | 'multiplayer' | 'tools'

interface GameManagementTabProps {
  className?: string
  initialTab?: GameManagementTab
}

export const GameManagementTab: React.FC<GameManagementTabProps> = ({
  className = '',
  initialTab = 'chronicle'
}) => {
  const [activeTab, setActiveTab] = useState<GameManagementTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    {
      id: 'chronicle' as const,
      label: 'Chronicle Management',
      icon: BookOpen,
      description: 'Story building, timeline, and narrative management',
      color: 'text-blue-600',
      featured: true
    },
    {
      id: 'campaign' as const,
      label: 'Campaign',
      icon: MapPin,
      description: 'Campaign overview, sessions, and long-term planning',
      color: 'text-green-600'
    },
    {
      id: 'monsters' as const,
      label: 'Monsters',
      icon: Skull,
      description: 'Monster management and encounter building',
      color: 'text-red-600'
    },
    {
      id: 'multiplayer' as const,
      label: 'Multiplayer',
      icon: Users,
      description: 'Session setup and player management',
      color: 'text-purple-600'
    },
    {
      id: 'tools' as const,
      label: 'GM Tools',
      icon: SettingsIcon,
      description: 'Additional utilities and session helpers',
      color: 'text-orange-600'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'chronicle':
        return <ChroniclePanel />
      case 'campaign':
        return (
          <div className="space-y-6">
            <CampaignPanel />
            <BondTracker />
          </div>
        )
      case 'monsters':
        return <MonsterManager />
      case 'multiplayer':
        return (
          <Card variant="magical">
            <CardContent>
              <div className="text-center space-y-6">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                >
                  <Users
                    size={32}
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-display mb-2">Multiplayer Sessions</h2>
                  <p
                    className="max-w-md mx-auto"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Connect with friends for shared adventures and real-time dice rolling.
                    Advanced multiplayer management features.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Badge variant="default">Real-time Dice Sharing ✅</Badge>
                  <Badge variant="default">Session Management ✅</Badge>
                  <Badge variant="default">WebSocket Integration ✅</Badge>
                  <Badge variant="secondary">Voice Chat 🔄</Badge>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="gap-2 magical-glow"
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
          <Card variant="magical">
            <CardContent>
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-display mb-2">GM Tools & Utilities</h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Additional tools for game masters and session management
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Session Timer */}
                  <Card variant="surface">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <CalendarClock size={20} className="text-blue-600" />
                        <h3 className="font-semibold">Session Timer</h3>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        Track session duration and breaks
                      </p>
                      <Button variant="outline" size="sm">Coming Soon</Button>
                    </CardContent>
                  </Card>

                  {/* Random Tables */}
                  <Card variant="surface">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles size={20} className="text-purple-600" />
                        <h3 className="font-semibold">Random Tables</h3>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        Generate names, encounters, and more
                      </p>
                      <Button variant="outline" size="sm">Coming Soon</Button>
                    </CardContent>
                  </Card>

                  {/* Initiative Tracker */}
                  <Card variant="surface">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <LayoutPanelLeft size={20} className="text-green-600" />
                        <h3 className="font-semibold">Initiative Tracker</h3>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        Combat order and turn management
                      </p>
                      <Button variant="outline" size="sm">Coming Soon</Button>
                    </CardContent>
                  </Card>

                  {/* Notes & References */}
                  <Card variant="surface">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpenText size={20} className="text-orange-600" />
                        <h3 className="font-semibold">Quick References</h3>
                      </div>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                        Rules, tables, and session notes
                      </p>
                      <Button variant="outline" size="sm">Coming Soon</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return <ChroniclePanel />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Game Management</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Administrative tools for GMs and session organization
          </p>
        </div>
        <Badge variant="default" className="magical-glow">
          Chronicle Enhanced ✨
        </Badge>
      </div>

      {/* Tab Navigation */}
      <Card variant="surface">
        <CardContent>
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
                  className={`relative flex-1 min-w-0 ${
                    tab.featured ? 'border-2 border-blue-200 dark:border-blue-800' : ''
                  }`}
                  title={tab.description}
                >
                  <Icon size={16} className={isActive ? '' : tab.color} />
                  <span className="truncate">{tab.label}</span>
                  {tab.featured && !isActive && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Featured
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                      layoutId="gameManagementTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search Bar (for applicable tabs) */}
      {(activeTab === 'chronicle' || activeTab === 'campaign' || activeTab === 'monsters') && (
        <Card variant="surface">
          <CardContent>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  borderOpacity: 0.2,
                  color: 'var(--color-text)'
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