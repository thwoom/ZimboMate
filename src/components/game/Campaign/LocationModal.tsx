/**
 * Location Modal - Modal dialog for creating and editing locations
 */

import type { Location } from '../../../models/Campaign'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Building, Castle, HelpCircle, Home, MapPin, Package, Plus, Trees, X } from 'lucide-react'
import React, { useCallback, useEffect, useReducer } from 'react'

import { useModalForm } from '../../../hooks/useModalForm'
import { useStringListField } from '../../../hooks/useStringListField'
import { useCampaignStore } from '../../../stores/campaignStore'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../ui'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  location?: Location
}

interface LocationFormState {
  name: string
  description: string
  type: Location['type']
  notes: string
  connections: string[]
}

interface LocationFormErrors {
  name?: string
  description?: string
}

const LOCATION_TYPES = [
  { value: 'city' as const, label: 'City', icon: <Building size={16} /> },
  { value: 'town' as const, label: 'Town', icon: <Home size={16} /> },
  { value: 'village' as const, label: 'Village', icon: <Home size={14} /> },
  { value: 'dungeon' as const, label: 'Dungeon', icon: <Castle size={16} /> },
  { value: 'wilderness' as const, label: 'Wilderness', icon: <Trees size={16} /> },
  { value: 'other' as const, label: 'Other', icon: <HelpCircle size={16} /> },
]

const MAX_LOCATION_DANGERS = 5
const MAX_LOCATION_RESOURCES = 5

const normaliseListValue = (value: string) => value.trim()

function createInitialState(location?: Location): LocationFormState {
  return {
    name: location?.name ?? '',
    description: location?.description ?? '',
    type: location?.type ?? 'town',
    notes: location?.notes ?? '',
    connections: [...(location?.connections ?? [])],
  }
}

function validateLocation(state: LocationFormState): LocationFormErrors {
  const errors: LocationFormErrors = {}

  const name = state.name.trim()
  const description = state.description.trim()

  if (!name)
    errors.name = 'Name is required'
  else if (name.length < 2)
    errors.name = 'Name must be at least 2 characters'

  if (!description)
    errors.description = 'Description is required'
  else if (description.length < 10)
    errors.description = 'Description must be at least 10 characters'

  return errors
}

function getLocationIcon(type: string) {
  const locationType = LOCATION_TYPES.find(t => t.value === type)
  return locationType?.icon || <HelpCircle size={16} />
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  location,
}) => {
  const addLocation = useCampaignStore(state => state.addLocation)
  const updateLocation = useCampaignStore(state => state.updateLocation)

  const [newDanger, dispatchNewDanger] = useReducer((_: string, value: string) => value, '')
  const [newResource, dispatchNewResource] = useReducer((_: string, value: string) => value, '')

  const {
    items: dangers,
    addItem: addDanger,
    removeItem: removeDanger,
    replaceAll: replaceDangers,
    canAddMore: canAddMoreDangers,
  } = useStringListField(location?.dangers ?? [], {
    limit: MAX_LOCATION_DANGERS,
    normalise: normaliseListValue,
  })

  const {
    items: resources,
    addItem: addResource,
    removeItem: removeResource,
    replaceAll: replaceResources,
    canAddMore: canAddMoreResources,
  } = useStringListField(location?.resources ?? [], {
    limit: MAX_LOCATION_RESOURCES,
    normalise: normaliseListValue,
  })

  const handleSubmitForm = useCallback(async (formState: LocationFormState): Promise<string> => {
    const trimmedState = {
      ...formState,
      name: formState.name.trim(),
      description: formState.description.trim(),
      notes: formState.notes.trim(),
    }

    const payload: Partial<Location> = {
      ...trimmedState,
      dangers,
      resources,
    }

    if (location) {
      updateLocation(campaignId, location.id, payload)
      return location.id
    }

    const created = addLocation(campaignId, trimmedState.name, trimmedState.description, trimmedState.type)
    if (!created)
      throw new Error('Failed to create location')

    updateLocation(campaignId, created.id, payload)
    return created.id
  }, [addLocation, campaignId, dangers, location, resources, updateLocation])

  const {
    state,
    setState,
    reset: resetForm,
    errors,
    submit,
    isSubmitting,
  } = useModalForm<LocationFormState, LocationFormErrors, string>({
    getInitialState: useCallback(() => createInitialState(location), [location]),
    getInitialErrors: () => ({}),
    validate: validateLocation,
    onSubmit: handleSubmitForm,
  })

  useEffect(() => {
    if (!isOpen)
      return

    resetForm(createInitialState(location))
    replaceDangers(location?.dangers ?? [])
    replaceResources(location?.resources ?? [])
    dispatchNewDanger('')
    dispatchNewResource('')
  }, [dispatchNewDanger, dispatchNewResource, isOpen, location, replaceDangers, replaceResources, resetForm])

  const handleAddDanger = useCallback(() => {
    if (addDanger(newDanger))
      dispatchNewDanger('')
  }, [addDanger, newDanger])

  const handleRemoveDanger = useCallback((dangerToRemove: string) => {
    removeDanger(dangerToRemove)
  }, [removeDanger])

  const handleAddResource = useCallback(() => {
    if (addResource(newResource))
      dispatchNewResource('')
  }, [addResource, newResource])

  const handleRemoveResource = useCallback((resourceToRemove: string) => {
    removeResource(resourceToRemove)
  }, [removeResource])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>, type: 'danger' | 'resource') => {
    if (event.key !== 'Enter')
      return

    event.preventDefault()
    if (type === 'danger')
      handleAddDanger()
    else
      handleAddResource()
  }, [handleAddDanger, handleAddResource])

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await submit()

    if (result.status === 'success') {
      onClose()
      dispatchNewDanger('')
      dispatchNewResource('')
    }
    else if (result.status === 'error') {
      console.error('Error saving location:', result.error)
    }
  }, [dispatchNewDanger, dispatchNewResource, onClose, submit])

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          dispatchNewDanger('')
          dispatchNewResource('')
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
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
                      value={state.name}
                      onChange={(event) => {
                        const { value } = event.target
                        setState(prev => ({
                          ...prev,
                          name: value,
                        }))
                      }}
                      placeholder="Enter location name..."
                      className={errors.name ? 'border-destructive/40' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LOCATION_TYPES.map(locationType => (
                        <button
                          key={locationType.value}
                          type="button"
                          onClick={() => setState(prev => ({
                            ...prev,
                            type: locationType.value,
                          }))}
                          className={`flex items-center gap-1 px-2 py-2 rounded-lg border text-xs transition-colors ${
                            state.type === locationType.value
                              ? 'bg-primary/100/20 text-primary border-primary/40/30'
                              : 'bg-muted/500/10 text-muted-foreground border-border/20 hover:bg-muted/500/20'
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
                    value={state.description}
                    onChange={(event) => {
                      const { value } = event.target
                      setState(prev => ({
                        ...prev,
                        description: value,
                      }))
                    }}
                    placeholder="Describe the location's appearance, atmosphere, and notable features..."
                    className={`min-h-20 ${errors.description ? 'border-destructive/40' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm">{errors.description}</p>
                  )}
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
                    placeholder="Additional notes, history, important NPCs, quests..."
                    className="min-h-20"
                  />
                </div>

                {/* Dangers */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} className="text-destructive" />
                    Dangers & Threats
                  </label>

                  {/* Existing Dangers */}
                  {dangers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dangers.map(danger => (
                        <Badge
                          key={danger}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/20 bg-destructive/15 text-destructive"
                          onClick={() => handleRemoveDanger(danger)}
                        >
                          ⚠️
                          {' '}
                          {danger}
                          {' '}
                          ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Danger */}
                  <div className="flex gap-2">
                    <Input
                      value={newDanger}
                      onChange={event => dispatchNewDanger(event.target.value)}
                      onKeyDown={event => handleKeyDown(event, 'danger')}
                      placeholder="Add a danger or threat..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddDanger}
                      variant="ghost"
                      size="sm"
                      disabled={!newDanger.trim() || !canAddMoreDangers}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`${dangers.length}/${MAX_LOCATION_DANGERS} dangers`}
                  </p>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Package size={16} className="text-chart-2" />
                    Resources & Services
                  </label>

                  {/* Existing Resources */}
                  {resources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {resources.map(resource => (
                        <Badge
                          key={resource}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-chart-2/20 bg-chart-2/15 text-chart-2"
                          onClick={() => handleRemoveResource(resource)}
                        >
                          📦
                          {' '}
                          {resource}
                          {' '}
                          ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Resource */}
                  <div className="flex gap-2">
                    <Input
                      value={newResource}
                      onChange={event => dispatchNewResource(event.target.value)}
                      onKeyDown={event => handleKeyDown(event, 'resource')}
                      placeholder="Add a resource or service..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddResource}
                      variant="ghost"
                      size="sm"
                      disabled={!newResource.trim() || !canAddMoreResources}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {`${resources.length}/${MAX_LOCATION_RESOURCES} resources`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getLocationIcon(state.type)}
                      {LOCATION_TYPES.find(t => t.value === state.type)?.label}
                    </div>
                    {dangers.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-destructive/15 text-destructive">
                        {dangers.length}
                        {' '}
                        danger
                        {dangers.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {resources.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-chart-2/15 text-chart-2">
                        {resources.length}
                        {' '}
                        resource
                        {resources.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        onClose()
                        dispatchNewDanger('')
                        dispatchNewResource('')
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
