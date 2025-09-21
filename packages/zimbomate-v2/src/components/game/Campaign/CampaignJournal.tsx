/**
 * Campaign Journal - Rich text journal for important campaign events
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Star,
  Tag,
  Calendar,
  Link,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useCampaignStore } from '../../../stores/campaignStore'
import { formatDateRelative, JournalSortBy } from '../../../campaignManagementMockData'
import { JournalEntryModal } from './JournalEntryModal'
import type { JournalEntry } from '../../../models/Campaign'

interface CampaignJournalProps {
  campaignId: string
  searchQuery?: string
}

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (entryId: string) => void
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card 
      variant={entry.isImportant ? "magical" : "glass"} 
      padding="md" 
      className="campaign-card campaign-card-hover"
    >
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg font-semibold">
                  {entry.title}
                </h3>
                {entry.isImportant && (
                  <Badge variant="default" className="importance-badge-high text-xs">
                    <Star size={12} />
                    Important
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDateRelative(entry.date)}
                </div>
                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag size={14} />
                    {entry.tags.length} tag{entry.tags.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(entry)}
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <p 
              style={{ color: 'var(--color-text-secondary)' }}
              className={expanded ? '' : 'line-clamp-3'}
            >
              {entry.content}
            </p>
            {entry.content.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs"
              >
                {expanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Related Items */}
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {entry.relatedSessionId && (
              <div className="flex items-center gap-1">
                <Link size={12} />
                Related to session
              </div>
            )}
            {entry.relatedNpcId && (
              <div className="flex items-center gap-1">
                <Link size={12} />
                Related to NPC
              </div>
            )}
            {entry.relatedLocationId && (
              <div className="flex items-center gap-1">
                <Link size={12} />
                Related to location
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const CampaignJournal: React.FC<CampaignJournalProps> = ({
  campaignId,
  searchQuery = ''
}) => {
  const [sortBy, setSortBy] = useState<JournalSortBy>(JournalSortBy.DATE)
  const [filterByImportance, setFilterByImportance] = useState<boolean | null>(null)
  const [filterByTag, setFilterByTag] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>()
  
  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const addJournalEntry = useCampaignStore(state => state.addJournalEntry)
  const updateJournalEntry = useCampaignStore(state => state.updateJournalEntry)
  const deleteJournalEntry = useCampaignStore(state => state.deleteJournalEntry)

  const allTags = useMemo(() => {
    if (!campaign) return []
    const tagSet = new Set<string>()
    campaign.journal.forEach(entry => {
      entry.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [campaign])

  const filteredAndSortedEntries = useMemo(() => {
    if (!campaign) return []

    let entries = [...campaign.journal]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      entries = entries.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by importance
    if (filterByImportance !== null) {
      entries = entries.filter(entry => entry.isImportant === filterByImportance)
    }

    // Filter by tag
    if (filterByTag) {
      entries = entries.filter(entry => entry.tags.includes(filterByTag))
    }

    // Sort entries
    entries.sort((a, b) => {
      switch (sortBy) {
        case JournalSortBy.DATE:
          return b.date.getTime() - a.date.getTime()
        case JournalSortBy.IMPORTANCE:
          if (a.isImportant && !b.isImportant) return -1
          if (!a.isImportant && b.isImportant) return 1
          return b.date.getTime() - a.date.getTime()
        case JournalSortBy.TITLE:
          return a.title.localeCompare(b.title)
        case JournalSortBy.TAGS:
          return a.tags.length - b.tags.length
        default:
          return 0
      }
    })

    return entries
  }, [campaign, searchQuery, sortBy, filterByImportance, filterByTag])

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournalEntry(campaignId, entryId)
    }
  }

  const handleCreateEntry = () => {
    setEditingEntry(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingEntry(undefined)
  }

  const handleEntrySaved = (entryId: string) => {
    // Entry saved successfully - modal will close automatically
    console.log('Journal entry saved:', entryId)
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
    <>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display">Campaign Journal</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {filteredAndSortedEntries.length} of {campaign.journal.length} entries
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="gap-2"
          onClick={handleCreateEntry}
        >
          <Plus size={16} />
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="sm">
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as JournalSortBy)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
            >
              <option value={JournalSortBy.DATE}>Sort by Date</option>
              <option value={JournalSortBy.IMPORTANCE}>Sort by Importance</option>
              <option value={JournalSortBy.TITLE}>Sort by Title</option>
              <option value={JournalSortBy.TAGS}>Sort by Tags</option>
            </select>

            <select
              value={filterByImportance === null ? '' : filterByImportance.toString()}
              onChange={(e) => {
                const value = e.target.value
                setFilterByImportance(value === '' ? null : value === 'true')
              }}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
            >
              <option value="">All Entries</option>
              <option value="true">Important Only</option>
              <option value="false">Regular Only</option>
            </select>

            {allTags.length > 0 && (
              <select
                value={filterByTag}
                onChange={(e) => setFilterByTag(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      {filteredAndSortedEntries.length === 0 ? (
        <Card variant="glass" padding="lg" className="campaign-empty-state">
          <CardContent>
            <div className="text-center space-y-4">
              <BookOpen size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
              <div>
                <h4 className="font-medium mb-2">
                  {campaign.journal.length === 0 ? 'No journal entries' : 'No entries match your filters'}
                </h4>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {campaign.journal.length === 0 
                    ? 'Start writing your campaign story and important events'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
              {campaign.journal.length === 0 && (
                <Button 
                  variant="primary" 
                  size="md" 
                  className="gap-2"
                  onClick={handleCreateEntry}
                >
                  <Plus size={16} />
                  Write First Entry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <JournalEntryCard
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            </motion.div>
          ))}
        </div>
      )}
      </div>

      {/* Journal Entry Modal */}
      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        campaignId={campaignId}
        entry={editingEntry}
        onSaved={handleEntrySaved}
      />
    </>
  )
}