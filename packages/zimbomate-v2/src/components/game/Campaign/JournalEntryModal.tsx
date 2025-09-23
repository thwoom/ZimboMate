/**
 * Journal Entry Modal - Modal dialog for creating and editing journal entries
 */

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, BookOpen, Plus, Tag as TagIcon, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { useCampaignStore } from '../../../stores/campaignStore'
import type { JournalEntry } from '../../../models/Campaign'

interface JournalEntryModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  entry?: JournalEntry // If provided, we're editing; otherwise creating
  onSaved?: (entryId: string) => void
}

interface JournalEntryFormData {
  title: string
  content: string
  tags: string[]
  isImportant: boolean
  relatedSessionId?: string
  relatedNpcId?: string
  relatedLocationId?: string
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  entry,
  onSaved
}) => {
  const [formData, setFormData] = useState<JournalEntryFormData>({
    title: '',
    content: '',
    tags: [],
    isImportant: false
  })
  const [errors, setErrors] = useState<Partial<JournalEntryFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')

  const addJournalEntry = useCampaignStore(state => state.addJournalEntry)
  const updateJournalEntry = useCampaignStore(state => state.updateJournalEntry)

  // Initialize form data when modal opens or entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        content: entry.content,
        tags: [...entry.tags],
        isImportant: entry.isImportant,
        relatedSessionId: entry.relatedSessionId,
        relatedNpcId: entry.relatedNpcId,
        relatedLocationId: entry.relatedLocationId
      })
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
        isImportant: false
      })
    }
    setErrors({})
    setNewTag('')
  }, [entry, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<JournalEntryFormData> = {}

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    // Validate content
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters'
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
        content: formData.content.trim()
      }

      let entryId: string

      if (entry) {
        // Editing existing entry
        updateJournalEntry(campaignId, entry.id, trimmedData)
        entryId = entry.id
      } else {
        // Creating new entry
        entryId = crypto.randomUUID()
        const newEntry: JournalEntry = {
          id: entryId,
          date: new Date(),
          ...trimmedData
        }
        addJournalEntry(campaignId, newEntry)
      }

      onSaved?.(entryId)
      onClose()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      // In a real app, you'd show an error toast or message
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <CardTitle className="text-xl">
                  {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
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
                {/* Title Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Title
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isImportant: !prev.isImportant }))}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        formData.isImportant
                          ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-600 border border-gray-500/30'
                      }`}
                    >
                      <Star size={12} className={formData.isImportant ? 'fill-current' : ''} />
                      {formData.isImportant ? 'Important' : 'Mark Important'}
                    </button>
                  </div>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a descriptive title..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write about what happened, key decisions, important discoveries..."
                    className={`min-h-32 ${errors.content ? 'border-red-500' : ''}`}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm">{errors.content}</p>
                  )}
                </div>

                {/* Tags Field */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <TagIcon size={16} />
                    Tags
                  </label>

                  {/* Existing Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-red-500/20"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          #{tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Tag */}
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="ghost"
                      size="sm"
                      disabled={!newTag.trim() || formData.tags.length >= 10}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Press Enter or click + to add tags. Click tags to remove them. ({formData.tags.length}/10)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    {entry ? 'Last updated: ' + entry.date.toLocaleDateString() : 'Will be created today'}
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
                      {isSubmitting ? 'Saving...' : (entry ? 'Update' : 'Create')}
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