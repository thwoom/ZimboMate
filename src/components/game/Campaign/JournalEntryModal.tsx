/**
 * Journal Entry Modal - Rich journal creation and editing surface
 */

import type { JournalEntry } from '../../../models/Campaign'
import * as Dialog from '@radix-ui/react-dialog'
import { BookOpen, Plus, Star, Tag as TagIcon, X } from 'lucide-react'
import React, { useCallback, useEffect, useReducer } from 'react'

import { useModalForm } from '../../../hooks/useModalForm'
import { useStringListField } from '../../../hooks/useStringListField'
import { useCampaignStore } from '../../../stores/campaignStore'

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'

interface JournalEntryModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  entry?: JournalEntry
}

interface JournalEntryFormState {
  title: string
  content: string
  isImportant: boolean
  relatedSessionId?: string
  relatedNpcId?: string
  relatedLocationId?: string
}

interface JournalEntryFormErrors {
  title?: string
  content?: string
}

const MAX_JOURNAL_TAGS = 10

function createInitialState(entry?: JournalEntry): JournalEntryFormState {
  return {
    title: entry?.title ?? '',
    content: entry?.content ?? '',
    isImportant: entry?.isImportant ?? false,
    relatedSessionId: entry?.relatedSessionId,
    relatedNpcId: entry?.relatedNpcId,
    relatedLocationId: entry?.relatedLocationId,
  }
}

function validateJournalEntry(state: JournalEntryFormState): JournalEntryFormErrors {
  const errors: JournalEntryFormErrors = {}

  const trimmedTitle = state.title.trim()
  const trimmedContent = state.content.trim()

  if (!trimmedTitle)
    errors.title = 'Title is required'
  else if (trimmedTitle.length < 3)
    errors.title = 'Title must be at least 3 characters'

  if (!trimmedContent)
    errors.content = 'Content is required'
  else if (trimmedContent.length < 10)
    errors.content = 'Content must be at least 10 characters'

  return errors
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  entry,
}) => {
  const addJournalEntry = useCampaignStore(state => state.addJournalEntry)
  const updateJournalEntry = useCampaignStore(state => state.updateJournalEntry)

  const [newTag, dispatchNewTag] = useReducer((_: string, value: string) => value, '')
  const {
    items: tags,
    addItem: addTag,
    removeItem: removeTag,
    replaceAll: replaceTags,
    canAddMore: canAddMoreTags,
  } = useStringListField(entry?.tags ?? [], { limit: MAX_JOURNAL_TAGS })

  const handleSubmitForm = useCallback(async (formState: JournalEntryFormState): Promise<string> => {
    const trimmedData = {
      ...formState,
      title: formState.title.trim(),
      content: formState.content.trim(),
      tags,
    }

    if (entry) {
      updateJournalEntry(campaignId, entry.id, trimmedData)
      return entry.id
    }

    const newEntryId = crypto.randomUUID()
    const newEntry: JournalEntry = {
      id: newEntryId,
      date: new Date(),
      ...trimmedData,
    }
    addJournalEntry(campaignId, newEntry)
    return newEntryId
  }, [addJournalEntry, campaignId, entry, tags, updateJournalEntry])

  const {
    state,
    setState,
    reset: resetForm,
    errors,
    submit,
    isSubmitting,
  } = useModalForm<JournalEntryFormState, JournalEntryFormErrors, string>({
    getInitialState: useCallback(() => createInitialState(entry), [entry]),
    getInitialErrors: () => ({}),
    validate: validateJournalEntry,
    onSubmit: handleSubmitForm,
  })

  useEffect(() => {
    if (!isOpen)
      return

    resetForm(createInitialState(entry))
    replaceTags(entry?.tags ?? [])
    dispatchNewTag('')
  }, [entry, isOpen, replaceTags, resetForm])

  const handleAddTag = useCallback(() => {
    if (!newTag.trim() || !canAddMoreTags)
      return

    if (addTag(newTag))
      dispatchNewTag('')
  }, [addTag, canAddMoreTags, newTag])

  const handleRemoveTag = useCallback((tag: string) => {
    removeTag(tag)
  }, [removeTag])

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await submit()

    if (result.status === 'success') {
      onClose()
      dispatchNewTag('')
    }
    else if (result.status === 'error') {
      console.error('Error saving journal entry:', result.error)
    }
  }, [dispatchNewTag, onClose, submit])

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          dispatchNewTag('')
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-primary focus:outline-none">
          <Card variant="surface">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-display">
                  {entry ? 'Edit Journal Entry' : 'Create Journal Entry'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Capture key campaign moments and tag them for quick discovery later.
                </p>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X size={16} />
                </Button>
              </Dialog.Close>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BookOpen size={20} className="text-primary" />
                    <div>
                      <p className="font-semibold">Campaign Journal</p>
                      <p className="text-sm text-muted-foreground">
                        Share session highlights, mysteries, and pivotal decisions with your party.
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {`${tags.length} tags`}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Title</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`gap-1 px-2 py-1 text-xs ${
                        state.isImportant
                          ? 'border border-yellow-500/30 bg-chart-4/120/20 text-chart-4'
                          : 'border border-border/30 bg-muted/500/20 text-muted-foreground'
                      }`}
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          isImportant: !prev.isImportant,
                        }))
                      }}
                    >
                      <Star size={12} className={state.isImportant ? 'fill-current' : ''} />
                      {state.isImportant ? 'Important' : 'Mark Important'}
                    </Button>
                  </div>
                  <Input
                    value={state.title}
                    onChange={(event) => {
                      const { value } = event.target
                      setState(prev => ({
                        ...prev,
                        title: value,
                      }))
                    }}
                    placeholder="Enter a descriptive title..."
                    className={errors.title ? 'border-destructive/40' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={state.content}
                    onChange={(event) => {
                      const { value } = event.target
                      setState(prev => ({
                        ...prev,
                        content: value,
                      }))
                    }}
                    placeholder="Write about what happened, key decisions, important discoveries..."
                    className={`min-h-32 ${errors.content ? 'border-destructive/40' : ''}`}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <TagIcon size={16} />
                    Tags
                  </label>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {`#${tag} ×`}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={event => dispatchNewTag(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!canAddMoreTags || !newTag.trim()}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Press Enter or click + to add tags. Click tags to remove them. ${tags.length}/${MAX_JOURNAL_TAGS}`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {entry ? `Last updated: ${entry.date.toLocaleDateString()}` : 'Will be created today'}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        onClose()
                        dispatchNewTag('')
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="min-w-20"
                      disabled={isSubmitting}
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
