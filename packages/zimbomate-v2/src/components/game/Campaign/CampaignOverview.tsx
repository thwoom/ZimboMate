/**
 * Campaign Overview - Statistics dashboard and quick actions
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  BookOpen,
  Users,
  MapPin,
  Trophy,
  Clock,
  Plus,
  Edit,
  Download,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useCampaignStore } from '../../../stores/campaignStore'
import { formatCampaignDuration, formatSessionDuration, formatXPTotal, formatDateRelative, toDate } from '../../../campaignManagementMockData'

interface CampaignOverviewProps {
  campaignId: string
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({ campaignId }) => {
  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const stats = useCampaignStore(state => state.getCampaignStats(campaignId))

  if (!campaign || !stats) {
    return (
      <Card variant="surface">
        <CardContent>
          <div className="text-center">
            <p style={{ color: 'var(--color-text-muted)' }}>
              Campaign not found
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions.toString(),
      icon: Calendar,
      color: 'var(--color-session)',
      description: 'Sessions played'
    },
    {
      title: 'Journal Entries',
      value: stats.totalJournalEntries.toString(),
      icon: BookOpen,
      color: 'var(--color-journal)',
      description: 'Important events recorded'
    },
    {
      title: 'NPCs Met',
      value: stats.totalNPCs.toString(),
      icon: Users,
      color: 'var(--color-npc)',
      description: 'Characters encountered'
    },
    {
      title: 'Locations',
      value: stats.totalLocations.toString(),
      icon: MapPin,
      color: 'var(--color-location)',
      description: 'Places discovered'
    },
    {
      title: 'Total XP',
      value: formatXPTotal(stats.totalXP),
      icon: Trophy,
      color: 'var(--gold-500)',
      description: 'Experience earned'
    },
    {
      title: 'Avg Session',
      value: formatSessionDuration(stats.averageSessionLength),
      icon: Clock,
      color: 'var(--color-primary)',
      description: 'Average session length'
    }
  ]

  const recentActivity = [
    ...campaign.sessions.slice(-3).map(session => ({
      type: 'session' as const,
      title: session.title,
      date: session.date,
      description: `${formatXPTotal(session.xpGained)} earned`
    })),
    ...campaign.journal.slice(-2).map(entry => ({
      type: 'journal' as const,
      title: entry.title,
      date: entry.date,
      description: entry.isImportant ? 'Important event' : 'Journal entry'
    }))
  ].sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Campaign Info */}
      <Card variant="magical">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{campaign.name}</CardTitle>
              <p style={{ color: 'var(--color-text-secondary)' }} className="mt-2">
                {campaign.description}
              </p>
              <div className="flex gap-4 mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <span>Created {formatDateRelative(campaign.created)}</span>
                <span>•</span>
                <span>Active for {formatCampaignDuration(campaign.created)}</span>
                <span>•</span>
                <span>Last updated {formatDateRelative(campaign.lastModified)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit size={16} />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card variant="surface" className="campaign-stat-card">
                <CardContent>
                  <div className="space-y-3">
                    <div 
                      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                      style={{ backgroundColor: stat.color, opacity: 0.2 }}
                    >
                      <Icon 
                        size={24} 
                        style={{ color: stat.color }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-display font-bold">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium">
                        {stat.title}
                      </div>
                      <div 
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {stat.description}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card variant="surface">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Add Session
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Journal Entry
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Add NPC
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus size={16} />
              Add Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="surface">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start adding sessions and journal entries!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={activity.type === 'session' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.type}
                    </Badge>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {activity.description}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {formatDateRelative(activity.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Notes */}
      {campaign.playerNotes && (
        <Card variant="parchment">
          <CardHeader>
            <CardTitle>Campaign Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ color: 'var(--color-text-primary)' }}>
              {campaign.playerNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}