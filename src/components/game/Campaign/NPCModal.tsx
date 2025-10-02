/**
 * NPC Modal - Modal dialog for creating and editing NPCs
 */

import type { NPC } from '../../../models/Campaign'
import * as Dialog from '@radix-ui/react-dialog'
import { Heart, HelpCircle, MapPin, Plus, Shield, Skull, Trash2, Users, X } from 'lucide-react'
import React, { useCallback, useEffect, useReducer } from 'react'

import { useModalForm } from '../../../hooks/useModalForm'
import { useStringListField } from '../../../hooks/useStringListField'
import { useCampaignStore } from '../../../stores/campaignStore'

import { Button, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'

interface NPCModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  npc?: NPC
}

interface NPCFormState {
  name: string
  description: string
  role: string
  location: string
  notes: string
  importance: 'low' | 'medium' | 'high'
  disposition: 'friendly' | 'neutral' | 'hostile' | 'unknown'
}

interface NPCFormErrors {
  name?: string
  description?: string
  role?: string
}

const ROLE_SUGGESTIONS = [
  'Merchant',
  'Quest Giver',
  'Villain',
  'Ally',
  'Guard',
  'Noble',
  'Scholar',
  'Innkeeper',
  'Blacksmith',
  'Priest',
  'Thief',
  'Hunter',
  'Farmer',
  'Sailor',
  'Soldier',
  'Mage',
  'Healer',
  'Leader',
]

const MAX_NPC_SECRETS = 5

const normaliseListValue = (value: string) => value.trim()

function createInitialState(npc?: NPC): NPCFormState {
  return {
    name: npc?.name ?? '',
    description: npc?.description ?? '',
    role: npc?.role ?? '',
    location: npc?.location ?? '',
    notes: npc?.notes ?? '',
    importance: npc?.importance ?? 'medium',
    disposition: npc?.disposition ?? 'neutral',
  }
}

function validateNPC(state: NPCFormState): NPCFormErrors {
  const errors: NPCFormErrors = {}

  const name = state.name.trim()
  const description = state.description.trim()
  const role = state.role.trim()

  if (!name)
    errors.name = 'Name is required'
  else if (name.length < 2)
    errors.name = 'Name must be at least 2 characters'

  if (!description)
    errors.description = 'Description is required'
  else if (description.length < 10)
    errors.description = 'Description must be at least 10 characters'

  if (!role)
    errors.role = 'Role is required'

  return errors
}

function getDispositionIcon(disposition: string) {
  switch (disposition) {
    case 'friendly': return <Heart size={16} className="text-chart-2" />
    case 'neutral': return <Shield size={16} className="text-primary" />
    case 'hostile': return <Skull size={16} className="text-destructive" />
    case 'unknown': return <HelpCircle size={16} className="text-muted-foreground" />
    default: return <HelpCircle size={16} />
  }
}

function getImportanceColor(importance: string) {
  switch (importance) {
    case 'high': return 'bg-destructive/20 text-destructive border-destructive/40/30'
    case 'medium': return 'bg-chart-4/120/20 text-chart-4 border-yellow-500/30'
    case 'low': return 'bg-muted/500/20 text-muted-foreground border-border/30'
    default: return 'bg-muted/500/20 text-muted-foreground border-border/30'
  }
}

export const NPCModal: React.FC<NPCModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  npc,
}) => {
  const addNPC = useCampaignStore(state => state.addNPC)
  const updateNPC = useCampaignStore(state => state.updateNPC)
  const [newSecret, dispatchNewSecret] = useReducer((_: string, value: string) => value, '')

  const {
    items: secrets,
    addItem: addSecret,
    removeItem: removeSecret,
    replaceAll: replaceSecrets,
    canAddMore: canAddMoreSecrets,
  } = useStringListField(npc?.secrets ?? [], {
    limit: MAX_NPC_SECRETS,
    normalise: normaliseListValue,
  })

  const handleSubmitForm = useCallback(async (formState: NPCFormState): Promise<string> => {
    const trimmedState = {
      ...formState,
      name: formState.name.trim(),
      description: formState.description.trim(),
      role: formState.role.trim(),
      location: formState.location.trim(),
      notes: formState.notes.trim(),
    }

    const payload: Partial<NPC> = {
      ...trimmedState,
      secrets,
    }

    if (npc) {
      updateNPC(campaignId, npc.id, payload)
      return npc.id
    }

    const created = addNPC(campaignId, trimmedState.name, trimmedState.description, trimmedState.role)
    if (!created)
      throw new Error('Failed to create NPC')

    updateNPC(campaignId, created.id, payload)
    return created.id
  }, [addNPC, campaignId, npc, secrets, updateNPC])

  const {
    state,
    setState,
    reset: resetForm,
    errors,
    submit,
    isSubmitting,
  } = useModalForm<NPCFormState, NPCFormErrors, string>({
    getInitialState: useCallback(() => createInitialState(npc), [npc]),
    getInitialErrors: () => ({}),
    validate: validateNPC,
    onSubmit: handleSubmitForm,
  })

  useEffect(() => {
    if (!isOpen)
      return

    resetForm(createInitialState(npc))
    replaceSecrets(npc?.secrets ?? [])
    dispatchNewSecret('')
  }, [dispatchNewSecret, isOpen, npc, replaceSecrets, resetForm])

  const handleAddSecret = useCallback(() => {
    if (addSecret(newSecret))
      dispatchNewSecret('')
  }, [addSecret, newSecret])

  const handleRemoveSecret = useCallback((secretToRemove: string) => {
    removeSecret(secretToRemove)
  }, [removeSecret])

  const handleSecretKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter')
      return

    event.preventDefault()
    handleAddSecret()
  }, [handleAddSecret])

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await submit()

    if (result.status === 'success') {
      onClose()
      dispatchNewSecret('')
    }
    else if (result.status === 'error') {
      console.error('Error saving NPC:', result.error)
    }
  }, [dispatchNewSecret, onClose, submit])

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          dispatchNewSecret('')
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">
                  {npc ? 'Edit NPC' : 'New NPC'}
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
                {/* Name and Role Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={state.name}
                      onChange={(event) => {
                        const { value } = event.target
                        setState(prev => ({
                          ...prev,
                          name: value,
                        }))
                      }}
                      placeholder="Enter NPC name..."
                      className={errors.name ? 'border-destructive/40' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <div className="relative">
                      <Input
                        value={state.role}
                        onChange={(event) => {
                          const { value } = event.target
                          setState(prev => ({
                            ...prev,
                            role: value,
                          }))
                        }}
                        placeholder="Enter or select role..."
                        list="role-suggestions"
                        className={errors.role ? 'border-destructive/40' : ''}
                      />
                      <datalist id="role-suggestions">
                        {ROLE_SUGGESTIONS.map(role => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                    </div>
                    {errors.role && (
                      <p className="text-destructive text-sm">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={state.description}
                    onChange={(event) => {
                      const { value } = event.target
                      setState(prev => ({
                        ...prev,
                        description: value,
                      }))
                    }}
                    placeholder="Describe the NPC's appearance, personality, and notable characteristics..."
                    className={`min-h-20 ${errors.description ? 'border-destructive/40' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Location and Importance Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin size={16} />
                      Location
                    </label>
                    <Input
                      value={state.location}
                      onChange={(event) => {
                        const { value } = event.target
                        setState(prev => ({
                          ...prev,
                          location: value,
                        }))
                      }}
                      placeholder="Where can they be found?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Importance</label>
                    <select
                      value={state.importance}
                      onChange={(event) => {
                        const value = event.target.value as NPCFormState['importance']
                        setState(prev => ({
                          ...prev,
                          importance: value,
                        }))
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Disposition */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disposition toward Party</label>
                  <div className="flex gap-3">
                    {(['friendly', 'neutral', 'hostile', 'unknown'] as const).map(disp => (
                      <button
                        key={disp}
                        type="button"
                        onClick={() => setState(prev => ({
                          ...prev,
                          disposition: disp,
                        }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          state.disposition === disp
                            ? 'bg-primary/100/20 text-primary border-primary/40/30'
                            : 'bg-muted/500/10 text-muted-foreground border-border/20 hover:bg-muted/500/20'
                        }`}
                      >
                        {getDispositionIcon(disp)}
                        {disp.charAt(0).toUpperCase() + disp.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={state.notes}
                    onChange={(event) => {
                      const { value } = event.target
                      setState(prev => ({
                        ...prev,
                        notes: value,
                      }))
                    }}
                    placeholder="Additional notes, interactions, quest connections..."
                    className="min-h-20"
                  />
                </div>

                {/* Secrets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Secrets & Hidden Information</label>

                  {/* Existing Secrets */}
                  {secrets.length > 0 && (
                    <div className="space-y-2">
                      {secrets.map(secret => (
                        <div key={secret} className="flex items-start gap-2 p-3 bg-muted/500/10 rounded-lg">
                          <div className="flex-1 text-sm">{secret}</div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveSecret(secret)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Secret */}
                  <div className="flex gap-2">
                    <Input
                      value={newSecret}
                      onChange={event => dispatchNewSecret(event.target.value)}
                      onKeyDown={handleSecretKeyDown}
                      placeholder="Add a secret or hidden info..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSecret}
                      variant="ghost"
                      size="sm"
                      disabled={!newSecret.trim() || !canAddMoreSecrets}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`Press Enter or click + to add secrets. ${secrets.length}/${MAX_NPC_SECRETS}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs border ${getImportanceColor(state.importance)}`}>
                      {state.importance.charAt(0).toUpperCase() + state.importance.slice(1)}
                      {' '}
                      Importance
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getDispositionIcon(state.disposition)}
                      {state.disposition.charAt(0).toUpperCase() + state.disposition.slice(1)}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        onClose()
                        dispatchNewSecret('')
                      }}
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
                      {isSubmitting ? 'Saving...' : (npc ? 'Update' : 'Create')}
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
