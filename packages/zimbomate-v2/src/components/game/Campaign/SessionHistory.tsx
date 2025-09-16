/**
 * Session History - Comprehensive session tracking and management
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  Trophy,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useCampaignStore } from '../../../stores/campaignStore'
import { formatSessionDuration, formatXPTotal, formatDateRelative, SessionSortBy } from '../../../campaignManagementMockData'
import type { CampaignSession } from '../../../models/Campaign'

interface SessionHistoryProps {
  campaignId: string
  searchQuery?: string
}

interface SessionCardProps {
  session: CampaignSession
  onEdit: (session: CampaignSession) => void
  onDelete: (sessionId: string) => void
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card variant="glass" padding="md" className="campaign-card campaign-card-hover">
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg font-semibold">
                  {session.title}
                </h3>
                <Badge variant="default" className="text-xs">
                  {formatXPTotal(session.xpGained)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDateRelative(session.date)}
                </div>
                {session.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatSessionDuration(session.duration)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(session)}
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(session.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {session.summary}
            </p>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t"
              style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}
            >
              {/* Notes */}
              {session.notes && (
                <div>
                  <h4 className="font-medium mb-2">Session Notes</h4>
                  <p 
                    className="text-sm p-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)' 
                    }}
                  >
                    {session.notes}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {session.highlights && session.highlights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star size={16} style={{ color: 'var(--gold-500)' }} />
                    Highlights
                  </h4>
                  <div className="space-y-2">
                    {session.highlights.map((highlight, index) => (
                      <div 
                        key={index}
                        className="text-sm p-2 rounded-lg flex items-start gap-2"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                      >
                        <Star size={12} style={{ color: 'var(--gold-500)', marginTop: '2px' }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {session.challenges && session.challenges.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} style={{ color: 'var(--color-importance-medium)' }} />
                    Challenges
                  </h4>
                  <div className="space-y-2">
                    {session.challenges.map((challenge, index) => (
                      <div 
                        key={index}
                        className="text-sm p-2 rounded-lg flex items-start gap-2"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                      >
                        <AlertTriangle size={12} style={{ color: 'var(--color-importance-medium)', marginTop: '2px' }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          {challenge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Session Prep */}
              {session.nextSession && (
                <div>
                  <h4 className="font-medium mb-2">Next Session Prep</h4>
                  <p 
                    className="text-sm p-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)' 
                    }}
                  >
                    {session.nextSession}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ 
  campaignId, 
  searchQuery = '' 
}) => {
  const [sortBy, setSortBy] = useState<SessionSortBy>(SessionSortBy.DATE)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const addSession = useCampaignStore(state => state.addSession)
  const updateSession = useCampaignStore(state => state.updateSession)
  const deleteSession = useCampaignStore(state => state.deleteSession)

  const filteredAndSortedSessions = useMemo(() => {
    if (!campaign) return []

    let sessions = [...campaign.sessions]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      sessions = sessions.filter(session =>
        session.title.toLowerCase().includes(query) ||
        session.summary.toLowerCase().includes(query) ||
        session.notes.toLowerCase().includes(query) ||
        session.highlights.some(h => h.toLowerCase().includes(query)) ||
        session.challenges.some(c => c.toLowerCase().includes(query))
      )
    }

    // Sort sessions
    sessions.sort((a, b) => {
      switch (sortBy) {
        case SessionSortBy.DATE:
          return b.date.getTime() - a.date.getTime()
        case SessionSortBy.XP_GAINED:
          return b.xpGained - a.xpGained
        case SessionSortBy.DURATION:
          return (b.duration || 0) - (a.duration || 0)
        case SessionSortBy.TITLE:
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sessions
  }, [campaign, searchQuery, sortBy])

  const handleEditSession = (session: CampaignSession) => {
    // TODO: Implement edit session modal
    console.log('Edit session:', session)
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(campaignId, sessionId)
    }
  }

  const handleCreateSession = () => {
    // TODO: Implement create session modal
    setShowCreateForm(true)
  }

  if (!campaign) {
    return (
      <Card variant="glass" padding="lg">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display">Session History</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {filteredAndSortedSessions.length} of {campaign.sessions.length} sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SessionSortBy)}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-text)'
            }}
          >
            <option value={SessionSortBy.DATE}>Sort by Date</option>
            <option value={SessionSortBy.XP_GAINED}>Sort by XP</option>
            <option value={SessionSortBy.DURATION}>Sort by Duration</option>
            <option value={SessionSortBy.TITLE}>Sort by Title</option>
          </select>
          <Button 
            variant="primary" 
            size="sm" 
            className="gap-2"
            onClick={handleCreateSession}
          >
            <Plus size={16} />
            Add Session
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      {filteredAndSortedSessions.length === 0 ? (
        <Card variant="glass" padding="lg" className="campaign-empty-state">
          <CardContent>
            <div className="text-center space-y-4">
              <Calendar size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
              <div>
                <h4 className="font-medium mb-2">
                  {campaign.sessions.length === 0 ? 'No sessions recorded' : 'No sessions match your search'}
                </h4>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {campaign.sessions.length === 0 
                    ? 'Add your first session to start tracking your campaign progress'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
              {campaign.sessions.length === 0 && (
                <Button 
                  variant="primary" 
                  size="md" 
                  className="gap-2"
                  onClick={handleCreateSession}
                >
                  <Plus size={16} />
                  Add First Session
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <SessionCard
                session={session}
                onEdit={handleEditSession}
                onDelete={handleDeleteSession}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}