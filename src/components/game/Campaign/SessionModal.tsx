/**
 * Session Modal - Modal dialog for creating and editing campaign sessions
 */

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calendar, Clock, Trophy, Plus, Trash2, Star, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { useCampaignStore } from '../../../stores/campaignStore'
import type { CampaignSession } from '../../../models/Campaign'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  session?: CampaignSession // If provided, we're editing; otherwise creating
  onSaved?: (sessionId: string) => void
}

interface SessionFormData {
  title: string
  date: string // ISO date string for input
  duration: number // in minutes
  summary: string
  notes: string
  xpGained: number
  highlights: string[]
  challenges: string[]
  nextSession: string
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  session,
  onSaved
}) => {
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    duration: 180, // 3 hours default
    summary: '',
    notes: '',
    xpGained: 0,
    highlights: [],
    challenges: [],
    nextSession: ''
  })
  const [errors, setErrors] = useState<Partial<SessionFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHighlight, setNewHighlight] = useState('')
  const [newChallenge, setNewChallenge] = useState('')

  const addSession = useCampaignStore(state => state.addSession)
  const updateSession = useCampaignStore(state => state.updateSession)

  // Initialize form data when modal opens or session changes
  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        date: session.date.toISOString().split('T')[0],
        duration: session.duration || 180,
        summary: session.summary,
        notes: session.notes,
        xpGained: session.xpGained,
        highlights: [...session.highlights],
        challenges: [...session.challenges],
        nextSession: session.nextSession || ''
      })
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        duration: 180,
        summary: '',
        notes: '',
        xpGained: 0,
        highlights: [],
        challenges: [],
        nextSession: ''
      })
    }
    setErrors({})
    setNewHighlight('')
    setNewChallenge('')
  }, [session, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<SessionFormData> = {}

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    // Validate summary
    if (!formData.summary.trim()) {
      newErrors.summary = 'Session summary is required'
    } else if (formData.summary.trim().length < 10) {
      newErrors.summary = 'Summary must be at least 10 characters'
    }

    // Validate duration
    if (formData.duration < 30) {
      newErrors.duration = 'Duration must be at least 30 minutes'
    } else if (formData.duration > 960) { // 16 hours
      newErrors.duration = 'Duration cannot exceed 16 hours'
    }

    // Validate XP
    if (formData.xpGained < 0) {
      newErrors.xpGained = 'XP gained cannot be negative'
    } else if (formData.xpGained > 10) {
      newErrors.xpGained = 'XP gained seems unusually high (max 10)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const trimmedData = {
        ...formData,
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        notes: formData.notes.trim(),
        nextSession: formData.nextSession.trim()
      }

      let sessionId: string

      if (session) {
        // Editing existing session
        const updatedSession: CampaignSession = {
          ...session,
          ...trimmedData,
          date: new Date(trimmedData.date)
        }
        updateSession(campaignId, session.id, updatedSession)
        sessionId = session.id
      } else {
        // Creating new session
        sessionId = crypto.randomUUID()
        const newSession: CampaignSession = {
          id: sessionId,
          ...trimmedData,
          date: new Date(trimmedData.date)
        }
        addSession(campaignId, newSession)
      }

      onSaved?.(sessionId)
      onClose()
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddHighlight = () => {
    const highlight = newHighlight.trim()
    if (highlight && !formData.highlights.includes(highlight) && formData.highlights.length < 5) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlight]
      }))
      setNewHighlight('')
    }
  }

  const handleRemoveHighlight = (highlightToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(highlight => highlight !== highlightToRemove)
    }))
  }

  const handleAddChallenge = () => {
    const challenge = newChallenge.trim()
    if (challenge && !formData.challenges.includes(challenge) && formData.challenges.length < 5) {
      setFormData(prev => ({
        ...prev,
        challenges: [...prev.challenges, challenge]
      }))
      setNewChallenge('')
    }
  }

  const handleRemoveChallenge = (challengeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.filter(challenge => challenge !== challengeToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: 'highlight' | 'challenge') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'highlight' && newHighlight.trim()) {
        handleAddHighlight()
      } else if (type === 'challenge' && newChallenge.trim()) {
        handleAddChallenge()
      }
    }
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">
                  {session ? 'Edit Session' : 'New Session'}
                </CardTitle>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title and Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter session title..."
                      className={errors.title ? 'border-destructive/40' : ''}
                    />
                    {errors.title && (
                      <p className="text-destructive text-sm">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Duration and XP Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock size={16} />
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      min="30"
                      max="960"
                      className={errors.duration ? 'border-destructive/40' : ''}
                    />
                    {errors.duration && (
                      <p className="text-destructive text-sm">{errors.duration}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatDuration(formData.duration)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Trophy size={16} />
                      XP Gained
                    </label>
                    <Input
                      type="number"
                      value={formData.xpGained}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpGained: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="10"
                      className={errors.xpGained ? 'border-destructive/40' : ''}
                    />
                    {errors.xpGained && (
                      <p className="text-destructive text-sm">{errors.xpGained}</p>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Summary</label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="What happened during this session? Key events, decisions, plot progression..."
                    className={`min-h-20 ${errors.summary ? 'border-destructive/40' : ''}`}
                  />
                  {errors.summary && (
                    <p className="text-destructive text-sm">{errors.summary}</p>
                  )}
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Star size={16} className="text-chart-4" />
                    Session Highlights
                  </label>

                  {/* Existing Highlights */}
                  {formData.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.highlights.map((highlight, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-chart-4/120/20 bg-chart-4/120/10 text-chart-4"
                          onClick={() => handleRemoveHighlight(highlight)}
                        >
                          ⭐ {highlight} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Highlight */}
                  <div className="flex gap-2">
                    <Input
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'highlight')}
                      placeholder="Add a session highlight..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddHighlight}
                      variant="ghost"
                      size="sm"
                      disabled={!newHighlight.trim() || formData.highlights.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ({formData.highlights.length}/5 highlights)
                  </p>
                </div>

                {/* Challenges */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} className="text-destructive" />
                    Challenges & Issues
                  </label>

                  {/* Existing Challenges */}
                  {formData.challenges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.challenges.map((challenge, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/20 bg-destructive/15 text-destructive"
                          onClick={() => handleRemoveChallenge(challenge)}
                        >
                          ⚠️ {challenge} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Challenge */}
                  <div className="flex gap-2">
                    <Input
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'challenge')}
                      placeholder="Add a challenge or issue..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddChallenge}
                      variant="ghost"
                      size="sm"
                      disabled={!newChallenge.trim() || formData.challenges.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ({formData.challenges.length}/5 challenges)
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Private GM notes, observations, things to remember..."
                    className="min-h-20"
                  />
                </div>

                {/* Next Session */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Next Session Preparation</label>
                  <Textarea
                    value={formData.nextSession}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextSession: e.target.value }))}
                    placeholder="What to prepare for next session? Plot hooks, NPCs to review, etc..."
                    className="min-h-20"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Duration: {formatDuration(formData.duration)}</span>
                    {formData.xpGained > 0 && (
                      <span className="flex items-center gap-1">
                        <Trophy size={14} />
                        {formData.xpGained} XP
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="min-w-20"
                    >
                      {isSubmitting ? 'Saving...' : (session ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}




