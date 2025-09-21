/**
 * Location Modal - Modal dialog for creating and editing locations
 */

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, MapPin, Plus, Trash2, Building, Home, Castle, Mountain, Trees, HelpCircle, AlertTriangle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { useCampaignStore } from '../../../stores/campaignStore'
import { LocationType } from '../../../campaignManagementMockData'
import type { Location } from '../../../models/Campaign'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  location?: Location // If provided, we're editing; otherwise creating
  onSaved?: (locationId: string) => void
}

interface LocationFormData {
  name: string
  description: string
  type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other'
  notes: string
  dangers: string[]
  resources: string[]
  connections: string[]
}

const LOCATION_TYPES = [
  { value: 'city' as const, label: 'City', icon: <Building size={16} /> },
  { value: 'town' as const, label: 'Town', icon: <Home size={16} /> },
  { value: 'village' as const, label: 'Village', icon: <Home size={14} /> },
  { value: 'dungeon' as const, label: 'Dungeon', icon: <Castle size={16} /> },
  { value: 'wilderness' as const, label: 'Wilderness', icon: <Trees size={16} /> },
  { value: 'other' as const, label: 'Other', icon: <HelpCircle size={16} /> }
]

const getLocationIcon = (type: string) => {
  const locationType = LOCATION_TYPES.find(t => t.value === type)
  return locationType?.icon || <HelpCircle size={16} />
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  location,
  onSaved
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    type: 'town',
    notes: '',
    dangers: [],
    resources: [],
    connections: []
  })
  const [errors, setErrors] = useState<Partial<LocationFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newDanger, setNewDanger] = useState('')
  const [newResource, setNewResource] = useState('')

  const addLocation = useCampaignStore(state => state.addLocation)
  const updateLocation = useCampaignStore(state => state.updateLocation)
  const campaign = useCampaignStore(state => state.getCampaign(campaignId))

  // Initialize form data when modal opens or location changes
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        description: location.description,
        type: location.type,
        notes: location.notes,
        dangers: [...(location.dangers || [])],
        resources: [...(location.resources || [])],
        connections: [...(location.connections || [])]
      })
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'town',
        notes: '',
        dangers: [],
        resources: [],
        connections: []
      })
    }
    setErrors({})
    setNewDanger('')
    setNewResource('')
  }, [location, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<LocationFormData> = {}

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
        notes: formData.notes.trim()
      }

      let locationId: string

      if (location) {
        // Editing existing location
        updateLocation(campaignId, location.id, trimmedData)
        locationId = location.id
      } else {
        // Creating new location
        locationId = crypto.randomUUID()
        const newLocation: Location = {
          id: locationId,
          discovered: new Date(),
          visited: [new Date()],
          ...trimmedData
        }
        addLocation(campaignId, newLocation)
      }

      onSaved?.(locationId)
      onClose()
    } catch (error) {
      console.error('Error saving location:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddDanger = () => {
    const danger = newDanger.trim()
    if (danger && !formData.dangers.includes(danger) && formData.dangers.length < 5) {
      setFormData(prev => ({
        ...prev,
        dangers: [...prev.dangers, danger]
      }))
      setNewDanger('')
    }
  }

  const handleRemoveDanger = (dangerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      dangers: prev.dangers.filter(danger => danger !== dangerToRemove)
    }))
  }

  const handleAddResource = () => {
    const resource = newResource.trim()
    if (resource && !formData.resources.includes(resource) && formData.resources.length < 5) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resource]
      }))
      setNewResource('')
    }
  }

  const handleRemoveResource = (resourceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource !== resourceToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: 'danger' | 'resource') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'danger' && newDanger.trim()) {
        handleAddDanger()
      } else if (type === 'resource' && newResource.trim()) {
        handleAddResource()
      }
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="glass" padding="none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <CardTitle className="text-xl">
                  {location ? 'Edit Location' : 'New Location'}
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
                {/* Name and Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter location name..."
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCATION_TYPES.map(locationType => (
                        <button
                          key={locationType.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: locationType.value }))}
                          className={`flex items-center gap-1 px-2 py-2 rounded-lg border text-xs transition-colors ${
                            formData.type === locationType.value
                              ? 'bg-blue-500/20 text-blue-600 border-blue-500/30'
                              : 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20'
                          }`}
                        >
                          {locationType.icon}
                          {locationType.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the location's appearance, atmosphere, and notable features..."
                    className={`min-h-20 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes, history, important NPCs, quests..."
                    className="min-h-20"
                  />
                </div>

                {/* Dangers */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Dangers & Threats
                  </label>

                  {/* Existing Dangers */}
                  {formData.dangers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.dangers.map((danger, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-red-500/20 bg-red-500/10 text-red-700"
                          onClick={() => handleRemoveDanger(danger)}
                        >
                          ⚠️ {danger} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Danger */}
                  <div className="flex gap-2">
                    <Input
                      value={newDanger}
                      onChange={(e) => setNewDanger(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'danger')}
                      placeholder="Add a danger or threat..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddDanger}
                      variant="ghost"
                      size="sm"
                      disabled={!newDanger.trim() || formData.dangers.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ({formData.dangers.length}/5 dangers)
                  </p>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Package size={16} className="text-green-500" />
                    Resources & Services
                  </label>

                  {/* Existing Resources */}
                  {formData.resources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.resources.map((resource, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-green-500/20 bg-green-500/10 text-green-700"
                          onClick={() => handleRemoveResource(resource)}
                        >
                          📦 {resource} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Resource */}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, 'resource')}
                      placeholder="Add a resource or service..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddResource}
                      variant="ghost"
                      size="sm"
                      disabled={!newResource.trim() || formData.resources.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    ({formData.resources.length}/5 resources)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {getLocationIcon(formData.type)}
                      {LOCATION_TYPES.find(t => t.value === formData.type)?.label}
                    </div>
                    {formData.dangers.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-700">
                        {formData.dangers.length} danger{formData.dangers.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {formData.resources.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700">
                        {formData.resources.length} resource{formData.resources.length !== 1 ? 's' : ''}
                      </Badge>
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
                      {isSubmitting ? 'Saving...' : (location ? 'Update' : 'Create')}
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