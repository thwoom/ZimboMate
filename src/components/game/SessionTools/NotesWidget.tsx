/**
 * Notes Widget - Persistent note-taking with search and organization
 * Phase 4A: Essential for actual Dungeon World gameplay sessions
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
  Clock,
  Edit3,
  Filter,
  NotebookPen,
  Plus,
  Star,
  Tag,
  Trash2,
} from 'lucide-react'
import React, { useState } from 'react'
import { useSessionStore } from '../../../stores'
import { Badge, Button, Card, CardContent } from '../../ui'

export interface Note {
  id: string
  content: string
  timestamp: Date
  tags: string[]
  importance: 'normal' | 'important' | 'critical'
  lastModified: Date
}

interface NotesWidgetProps {
  searchQuery?: string
  className?: string
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({
  searchQuery = '',
  className = '',
}) => {
  const { sessionNotes, addNote, updateNote, deleteNote } = useSessionStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({
    content: '',
    tags: [] as string[],
    importance: 'normal' as const,
  })
  const [tagInput, setTagInput] = useState('')
  const [filterImportance, setFilterImportance] = useState<string>('all')

  // Filter notes based on search query and importance
  const filteredNotes = sessionNotes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const matchesImportance =
      filterImportance === 'all' || note.importance === filterImportance

    return matchesSearch && matchesImportance
  })

  // Sort notes by importance and timestamp
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const importanceOrder = { critical: 3, important: 2, normal: 1 }
    const importanceDiff =
      importanceOrder[b.importance] - importanceOrder[a.importance]
    if (importanceDiff !== 0) return importanceDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const createNote = () => {
    if (!newNote.content.trim()) return

    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      content: newNote.content.trim(),
      timestamp: new Date(),
      tags: newNote.tags,
      importance: newNote.importance,
      lastModified: new Date(),
    }

    addNote(note)
    setNewNote({ content: '', tags: [], importance: 'normal' })
    setTagInput('')
    setIsCreating(false)
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setNewNote({
      content: note.content,
      tags: note.tags,
      importance: note.importance,
    })
    setTagInput(note.tags.join(', '))
  }

  const saveEdit = () => {
    if (!editingId || !newNote.content.trim()) return

    updateNote(editingId, {
      content: newNote.content.trim(),
      tags: newNote.tags,
      importance: newNote.importance,
      lastModified: new Date(),
    })

    setEditingId(null)
    setNewNote({ content: '', tags: [], importance: 'normal' })
    setTagInput('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setNewNote({ content: '', tags: [], importance: 'normal' })
    setTagInput('')
  }

  const handleTagInput = (value: string) => {
    setTagInput(value)
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    const uniqueTags = Array.from(new Set(tags))
    setNewNote((prev) => ({ ...prev, tags: uniqueTags }))
  }

  const getImportanceColor = (importance: Note['importance']) => {
    switch (importance) {
      case 'critical':
        return 'bg-destructive/15 text-destructive border-destructive/30'
      case 'important':
        return 'bg-chart-4/15 text-chart-4 border-chart-4/30'
      default:
        return 'bg-muted text-foreground border-border'
    }
  }

  const getImportanceIcon = (importance: Note['importance']) => {
    switch (importance) {
      case 'critical':
        return <Star size={12} className='text-destructive fill-current' />
      case 'important':
        return <Star size={12} className='text-chart-4 fill-current' />
      default:
        return <Star size={12} className='text-muted-foreground' />
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <NotebookPen size={20} />
          <span className='font-medium'>Session Notes</span>
          <Badge variant='secondary'>{sessionNotes.length}</Badge>
        </div>

        {/* Importance Filter */}
        <div className='flex items-center gap-2'>
          <Filter size={14} />
          <select
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value)}
            className='text-sm px-2 py-1 rounded border'
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value='all'>All Notes</option>
            <option value='critical'>Critical</option>
            <option value='important'>Important</option>
            <option value='normal'>Normal</option>
          </select>
        </div>
      </div>

      {/* Add Note Button */}
      <Button
        variant='primary'
        size='sm'
        onClick={() => setIsCreating(true)}
        className='w-full gap-2'
      >
        <Plus size={16} />
        Add Note
      </Button>

      {/* Create/Edit Note Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant='magical'>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {/* Note Content */}
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Note Content
                    </label>
                    <textarea
                      value={newNote.content}
                      onChange={(e) =>
                        setNewNote((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder='What happened in the session? Important NPCs, discoveries, plot developments...'
                      rows={4}
                      className='w-full px-3 py-2 rounded-lg border transition-colors resize-none'
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)',
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Tags (comma-separated)
                    </label>
                    <input
                      type='text'
                      value={tagInput}
                      onChange={(e) => handleTagInput(e.target.value)}
                      placeholder='combat, npc, location, plot, treasure'
                      className='w-full px-3 py-2 rounded-lg border transition-colors'
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)',
                      }}
                    />
                    {newNote.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {newNote.tags.map((tag) => (
                          <Badge
                            key={`draft-${tag}`}
                            variant='secondary'
                            className='text-xs'
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Importance */}
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Importance Level
                    </label>
                    <select
                      value={newNote.importance}
                      onChange={(e) =>
                        setNewNote((prev) => ({
                          ...prev,
                          importance: e.target.value as Note['importance'],
                        }))
                      }
                      className='w-full px-3 py-2 rounded-lg border transition-colors'
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        borderOpacity: 0.2,
                        color: 'var(--foreground)',
                      }}
                    >
                      <option value='normal'>Normal</option>
                      <option value='important'>Important</option>
                      <option value='critical'>Critical</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={editingId ? saveEdit : createNote}
                      disabled={!newNote.content.trim()}
                    >
                      {editingId ? 'Save Changes' : 'Add Note'}
                    </Button>
                    <Button variant='ghost' size='sm' onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className='space-y-3'>
        <AnimatePresence>
          {sortedNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card variant='surface'>
                <CardContent className='p-4 pt-4'>
                  <div className='space-y-3'>
                    {/* Header */}
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        {getImportanceIcon(note.importance)}
                        <Badge
                          variant='secondary'
                          className={`text-xs ${getImportanceColor(note.importance)}`}
                        >
                          {note.importance}
                        </Badge>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock size={12} />
                          {formatTimestamp(note.timestamp)}
                        </div>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => startEditing(note)}
                          className='p-1'
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteNote(note.id)}
                          className='p-1 text-destructive hover:text-destructive'
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='text-sm leading-relaxed'>
                      {note.content}
                    </div>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1'>
                        {note.tags.map((tag) => (
                          <Badge
                            key={`${note.id}-tag-${tag}`}
                            variant='secondary'
                            className='text-xs gap-1'
                          >
                            <Tag size={10} />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sortedNotes.length === 0 && (
        <Card variant='surface'>
          <CardContent className='p-6 pt-6'>
            <div className='text-center py-8'>
              <NotebookPen
                size={48}
                className='mx-auto mb-4 opacity-50 text-muted-foreground'
              />
              <h3 className='text-lg font-medium mb-2'>
                {searchQuery || filterImportance !== 'all'
                  ? 'No Matching Notes'
                  : 'No Notes Yet'}
              </h3>
              <p className='text-muted-foreground'>
                {searchQuery || filterImportance !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start documenting your Dungeon World adventure! Add notes about NPCs, discoveries, and important events.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {sessionNotes.length > 0 && (
        <Card variant='surface'>
          <CardContent className='p-4'>
            <div className='grid grid-cols-4 gap-4 text-center text-sm'>
              <div>
                <div className='font-medium'>{sessionNotes.length}</div>
                <div className='text-muted-foreground'>Total</div>
              </div>
              <div>
                <div className='font-medium text-destructive'>
                  {
                    sessionNotes.filter((n) => n.importance === 'critical')
                      .length
                  }
                </div>
                <div className='text-muted-foreground'>Critical</div>
              </div>
              <div>
                <div className='font-medium text-chart-4'>
                  {
                    sessionNotes.filter((n) => n.importance === 'important')
                      .length
                  }
                </div>
                <div className='text-muted-foreground'>Important</div>
              </div>
              <div>
                <div className='font-medium'>
                  {new Set(sessionNotes.flatMap((n) => n.tags)).size}
                </div>
                <div className='text-muted-foreground'>Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
