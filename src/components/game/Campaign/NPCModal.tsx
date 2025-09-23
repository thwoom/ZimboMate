/**
 * NPC Modal - Modal dialog for creating and editing NPCs
 */

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import { X, Users, Plus, Trash2, Heart, Shield, Skull, HelpCircle, MapPin, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { useCampaignStore } from '../../../stores/campaignStore'
import { NPCImportance, NPCDisposition } from '../../../campaignManagementMockData'
import type { NPC } from '../../../models/Campaign'

interface NPCModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  npc?: NPC // If provided, we're editing; otherwise creating
  onSaved?: (npcId: string) => void
}

interface NPCFormData {
  name: string
  description: string
  role: string
  location: string
  notes: string
  importance: 'low' | 'medium' | 'high'
  disposition: 'friendly' | 'neutral' | 'hostile' | 'unknown'
  secrets: string[]
}

const ROLE_SUGGESTIONS = [
  'Merchant', 'Quest Giver', 'Villain', 'Ally', 'Guard', 'Noble',
  'Scholar', 'Innkeeper', 'Blacksmith', 'Priest', 'Thief', 'Hunter',
  'Farmer', 'Sailor', 'Soldier', 'Mage', 'Healer', 'Leader'
]

const getDispositionIcon = (disposition: string) => {
  switch (disposition) {
    case 'friendly': return <Heart size={16} className="text-chart-2" />
    case 'neutral': return <Shield size={16} className="text-primary" />
    case 'hostile': return <Skull size={16} className="text-destructive" />
    case 'unknown': return <HelpCircle size={16} className="text-muted-foreground" />
    default: return <HelpCircle size={16} />
  }
}

const getImportanceColor = (importance: string) => {
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
  onSaved
}) => {
  const [formData, setFormData] = useState<NPCFormData>({
    name: '',
    description: '',
    role: '',
    location: '',
    notes: '',
    importance: 'medium',
    disposition: 'neutral',
    secrets: []
  })
  const [errors, setErrors] = useState<Partial<NPCFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSecret, setNewSecret] = useState('')

  const addNPC = useCampaignStore(state => state.addNPC)
  const updateNPC = useCampaignStore(state => state.updateNPC)

  // Initialize form data when modal opens or NPC changes
  useEffect(() => {
    if (npc) {
      setFormData({
        name: npc.name,
        description: npc.description,
        role: npc.role,
        location: npc.location || '',
        notes: npc.notes,
        importance: npc.importance,
        disposition: npc.disposition,
        secrets: [...(npc.secrets || [])]
      })
    } else {
      setFormData({
        name: '',
        description: '',
        role: '',
        location: '',
        notes: '',
        importance: 'medium',
        disposition: 'neutral',
        secrets: []
      })
    }
    setErrors({})
    setNewSecret('')
  }, [npc, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<NPCFormData> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    // Validate role
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required'
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        role: formData.role.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim()
      }

      let npcId: string

      if (npc) {
        // Editing existing NPC
        updateNPC(campaignId, npc.id, trimmedData)
        npcId = npc.id
      } else {
        // Creating new NPC
        npcId = crypto.randomUUID()
        const newNPC: NPC = {
          id: npcId,
          firstMet: new Date(),
          ...trimmedData
        }
        addNPC(campaignId, newNPC)
      }

      onSaved?.(npcId)
      onClose()
    } catch (error) {
      console.error('Error saving NPC:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddSecret = () => {
    const secret = newSecret.trim()
    if (secret && !formData.secrets.includes(secret) && formData.secrets.length < 5) {
      setFormData(prev => ({
        ...prev,
        secrets: [...prev.secrets, secret]
      }))
      setNewSecret('')
    }
  }

  const handleRemoveSecret = (secretToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      secrets: prev.secrets.filter(secret => secret !== secretToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSecret.trim()) {
      e.preventDefault()
      handleAddSecret()
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
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter NPC name..."
                      className={errors.name ? 'border-destructive/40' : ''}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <div className="relative">
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the NPC's appearance, personality, and notable characteristics..."
                    className={`min-h-20 ${errors.description ? 'border-destructive/40' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm">{errors.description}</p>
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
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Where can they be found?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Importance</label>
                    <select
                      value={formData.importance}
                      onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--primary)',
                        color: 'var(--foreground)'
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
                        onClick={() => setFormData(prev => ({ ...prev, disposition: disp }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                          formData.disposition === disp
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
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes, interactions, quest connections..."
                    className="min-h-20"
                  />
                </div>

                {/* Secrets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Secrets & Hidden Information</label>

                  {/* Existing Secrets */}
                  {formData.secrets.length > 0 && (
                    <div className="space-y-2">
                      {formData.secrets.map((secret, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted/500/10 rounded-lg">
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
                      onChange={(e) => setNewSecret(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a secret or hidden info..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSecret}
                      variant="ghost"
                      size="sm"
                      disabled={!newSecret.trim() || formData.secrets.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Enter or click + to add secrets. ({formData.secrets.length}/5)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs border ${getImportanceColor(formData.importance)}`}>
                      {formData.importance.charAt(0).toUpperCase() + formData.importance.slice(1)} Importance
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getDispositionIcon(formData.disposition)}
                      {formData.disposition.charAt(0).toUpperCase() + formData.disposition.slice(1)}
                    </div>
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




