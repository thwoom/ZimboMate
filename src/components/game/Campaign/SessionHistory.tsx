/**
 * Session History - Comprehensive session tracking and management
 */

import type { CampaignSession } from '../../../models/Campaign'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { formatDateRelative, formatSessionDuration, formatXPTotal, SessionSortBy } from '../../../campaignManagementMockData'
import { useCampaignStore } from '../../../stores/campaignStore'
import { Badge, Button, Card, CardContent } from '../../ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog'
import { SessionModal } from './SessionModal'

interface SessionHistoryProps {
  campaignId: string
  searchQuery?: string
}

interface SessionCardProps {
  session: CampaignSession
  onEdit: (session: CampaignSession) => void
  onDelete: (session: CampaignSession) => void
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card variant="surface" className="campaign-card campaign-card-hover">
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
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                onClick={() => onDelete(session)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <p className="text-muted-foreground">
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
              className="space-y-4 pt-4 border-t border-primary/20"
            >
              {/* Notes */}
              {session.notes && (
                <div>
                  <h4 className="font-medium mb-2">Session Notes</h4>
                  <p
                    className="text-sm p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--card)',
                      color: 'var(--muted-foreground)',
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
                    <Star className="text-[color:var(--gold-500)]" size={16} />
                    Highlights
                  </h4>
                  <div className="space-y-2">
                    {session.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded-lg flex items-start gap-2 bg-card"
                      >
                        <Star size={12} className="mt-[2px] text-[color:var(--gold-500)]" />
                        <span className="text-muted-foreground">
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
                    <AlertTriangle className="text-chart-4" size={16} />
                    Challenges
                  </h4>
                  <div className="space-y-2">
                    {session.challenges.map((challenge, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 rounded-lg flex items-start gap-2 bg-card"
                      >
                        <AlertTriangle size={12} className="mt-[2px] text-chart-4" />
                        <span className="text-muted-foreground">
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
                      backgroundColor: 'var(--card)',
                      color: 'var(--muted-foreground)',
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
  searchQuery = '',
}) => {
  const [sortBy, setSortBy] = useState<SessionSortBy>(SessionSortBy.DATE)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<CampaignSession | undefined>()
  const [sessionToDelete, setSessionToDelete] = useState<CampaignSession | null>(null)

  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const deleteSession = useCampaignStore(state => state.deleteSession)
  const isDeleteDialogOpen = sessionToDelete !== null
  const filteredAndSortedSessions = useMemo(() => {
    if (!campaign)
      return []

    let sessions = [...campaign.sessions]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      sessions = sessions.filter(session =>
        session.title.toLowerCase().includes(query)
        || session.summary.toLowerCase().includes(query)
        || session.notes.toLowerCase().includes(query)
        || session.highlights.some(h => h.toLowerCase().includes(query))
        || session.challenges.some(c => c.toLowerCase().includes(query)),
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
    setEditingSession(session)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (session: CampaignSession) => {
    setSessionToDelete(session)
  }

  const closeDeleteDialog = () => {
    setSessionToDelete(null)
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open)
      closeDeleteDialog()
  }

  const confirmDeleteSession = () => {
    if (!sessionToDelete)
      return

    deleteSession(campaignId, sessionToDelete.id)
    setSessionToDelete(null)
  }

  const deleteDialogMessage = sessionToDelete
    ? `This will permanently delete "${sessionToDelete.title}".`
    : 'This will permanently delete the session.'

  const handleCreateSession = () => {
    setEditingSession(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingSession(undefined)
  }

  if (!campaign) {
    return (
      <Card variant="surface">
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground">
              Campaign not found
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display">Session History</h3>
            <p className="text-muted-foreground">
              {filteredAndSortedSessions.length}
              {' '}
              of
              {campaign.sessions.length}
              {' '}
              sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SessionSortBy)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--primary)',
                color: 'var(--foreground)',
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
        {filteredAndSortedSessions.length === 0
          ? (
              <Card variant="surface" className="campaign-empty-state">
                <CardContent>
                  <div className="text-center space-y-4">
                    <Calendar size={48} className="mx-auto text-muted-foreground" />
                    <div>
                      <h4 className="font-medium mb-2">
                        {campaign.sessions.length === 0 ? 'No sessions recorded' : 'No sessions match your search'}
                      </h4>
                      <p className="text-muted-foreground">
                        {campaign.sessions.length === 0
                          ? 'Add your first session to start tracking your campaign progress'
                          : 'Try adjusting your search terms or filters'}
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
            )
          : (
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
                      onDelete={handleDeleteRequest}
                    />
                  </motion.div>
                ))}
              </div>
            )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session</AlertDialogTitle>
            <AlertDialogDescription>{deleteDialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        campaignId={campaignId}
        session={editingSession}
      />
    </>
  )
}
