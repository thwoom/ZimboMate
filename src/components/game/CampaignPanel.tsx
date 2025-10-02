/**
 * Campaign Panel - Main container for campaign management
 * Phase 4B: Campaign Management - GM Tools for long-term campaign continuity
 */

import { motion } from 'framer-motion'
import {
  BookOpenText,
  CalendarClock,
  LayoutPanelLeft,
  MapPin,
  Plus,
  Scroll,
  Search,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'
import { useCampaignStore } from '../../stores/campaignStore'
import { Badge, Button, Card, CardContent } from '../ui'
import { CampaignJournal } from './Campaign/CampaignJournal'
import { CampaignOverview } from './Campaign/CampaignOverview'
import { CampaignSelector } from './Campaign/CampaignSelector'
import { CreateCampaignModal } from './Campaign/CreateCampaignModal'
import { LocationTracker } from './Campaign/LocationTracker'
import { NPCManager } from './Campaign/NPCManager'
import { SessionHistory } from './Campaign/SessionHistory'

type CampaignTab = 'overview' | 'sessions' | 'journal' | 'npcs' | 'locations'

interface CampaignPanelProps {
  className?: string
  initialTab?: CampaignTab
}

export const CampaignPanel: React.FC<CampaignPanelProps> = ({
  className = '',
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<CampaignTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const activeCampaign = useCampaignStore(state => state.getActiveCampaign())
  const campaigns = useCampaignStore(state => state.campaigns)
  const setActiveCampaign = useCampaignStore(state => state.setActiveCampaign)

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: LayoutPanelLeft,
      description: 'Campaign statistics and quick actions',
    },
    {
      id: 'sessions' as const,
      label: 'Sessions',
      icon: CalendarClock,
      description: 'Session history and planning',
    },
    {
      id: 'journal' as const,
      label: 'Journal',
      icon: BookOpenText,
      description: 'Campaign notes and important events',
    },
    {
      id: 'npcs' as const,
      label: 'NPCs',
      icon: Users,
      description: 'Character relationships and tracking',
    },
    {
      id: 'locations' as const,
      label: 'Locations',
      icon: MapPin,
      description: 'World building and exploration',
    },
  ]

  const renderContent = () => {
    if (!activeCampaign) {
      return (
        <Card variant="surface">
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-primary/20"
              >
                <Scroll
                  className="text-primary"
                  size={32}
                />
              </div>
              <div>
                <h3 className="text-xl font-display mb-2">No Campaign Selected</h3>
                <p className="text-muted-foreground">
                  Select an existing campaign or create a new one to get started.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {campaigns.length > 0 && (
                  <CampaignSelector
                    onCampaignSelect={setActiveCampaign}
                  />
                )}
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={16} />
                  Create Campaign
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <CampaignOverview campaignId={activeCampaign.id} />
      case 'sessions':
        return <SessionHistory campaignId={activeCampaign.id} searchQuery={searchQuery} />
      case 'journal':
        return <CampaignJournal campaignId={activeCampaign.id} searchQuery={searchQuery} />
      case 'npcs':
        return <NPCManager campaignId={activeCampaign.id} searchQuery={searchQuery} />
      case 'locations':
        return <LocationTracker campaignId={activeCampaign.id} searchQuery={searchQuery} />
      default:
        return <CampaignOverview campaignId={activeCampaign.id} />
    }
  }

  const handleCampaignCreated = (campaignId: string) => {
    // Automatically select the newly created campaign
    setActiveCampaign(campaignId)
    // Switch to overview tab to show the new campaign
    setActiveTab('overview')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display mb-2">Campaign Management</h2>
          <p className="text-muted-foreground">
            {activeCampaign ? `Managing: ${activeCampaign.name}` : 'GM tools for long-term campaign continuity'}
          </p>
        </div>
        <Badge variant="default" className="magical-glow">
          Phase 4B ✨
        </Badge>
      </div>

      {activeCampaign && (
        <>
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

                          layoutId="campaignTab"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search Bar (for applicable tabs) */}
          {(activeTab === 'sessions' || activeTab === 'journal' || activeTab === 'npcs' || activeTab === 'locations') && (
            <Card variant="surface">
              <CardContent className="p-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
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
        </>
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

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  )
}
