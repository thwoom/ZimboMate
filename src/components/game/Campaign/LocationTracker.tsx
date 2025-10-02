/**
 * Location Tracker - World building interface for tracking discovered locations
 */

import type { Location } from '../../../models/Campaign'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Building,
  Calendar,
  Castle,
  Edit,
  Eye,
  HelpCircle,
  Home,
  MapPin,
  Package,
  Plus,
  Route,
  Trash2,
  Trees,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { formatDateRelative, formatLocationType, LocationType } from '../../../campaignManagementMockData'
import { useCampaignStore } from '../../../stores/campaignStore'
import { Badge, Button, Card, CardContent } from '../../ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog'
import { LocationModal } from './LocationModal'

interface LocationTrackerProps {
  campaignId: string
  searchQuery?: string
}

interface LocationCardProps {
  location: Location
  onEdit: (location: Location) => void
  onDelete: (location: Location) => void
}

function getLocationTypeIcon(type: LocationType) {
  switch (type) {
    case LocationType.CITY:
      return <Building className="text-chart-3" size={16} />
    case LocationType.TOWN:
      return <Home className="text-chart-4" size={16} />
    case LocationType.VILLAGE:
      return <Home className="text-chart-2" size={14} />
    case LocationType.DUNGEON:
      return <Castle className="text-[color:var(--muted)]" size={16} />
    case LocationType.WILDERNESS:
      return <Trees className="text-chart-2" size={16} />
    case LocationType.OTHER:
      return <HelpCircle className="text-accent" size={16} />
    default:
      return <MapPin size={16} />
  }
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onDelete }) => {
  return (
    <Card
      variant="surface"
      className="campaign-card campaign-card-hover"
    >
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg font-semibold">
                  {location.name}
                </h3>
                <div className="flex items-center gap-1">
                  {getLocationTypeIcon(location.type)}
                  <Badge variant="outline" className="text-xs">
                    {formatLocationType(location.type)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Discovered
                  {' '}
                  {formatDateRelative(location.discovered)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  Visited
                  {' '}
                  {location.visited.length}
                  {' '}
                  time
                  {location.visited.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(location)}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(location)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-muted-foreground">
              {location.description}
            </p>
          </div>

          {/* Last Visited */}
          {location.visited.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye size={14} />
              Last visited
              {' '}
              {formatDateRelative(location.visited[location.visited.length - 1])}
            </div>
          )}

          {/* Notes */}
          {location.notes && (
            <div>
              <p
                className="text-sm p-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {location.notes}
              </p>
            </div>
          )}

          {/* Dangers */}
          {location.dangers && location.dangers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-destructive" size={14} />
                <span className="font-medium text-sm">Dangers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {location.dangers.map((danger, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: 'var(--destructive)',
                      color: 'white',
                      opacity: 0.8,
                    }}
                  >
                    {danger}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {location.resources && location.resources.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-chart-4" size={14} />
                <span className="font-medium text-sm">Resources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {location.resources.map((resource, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: 'var(--chart-4)',
                      color: 'white',
                      opacity: 0.8,
                    }}
                  >
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Connections */}
          {location.connections && location.connections.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Route className="text-primary" size={14} />
                <span className="font-medium text-sm">Connected Locations</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {location.connections.length}
                {' '}
                connection
                {location.connections.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  campaignId,
  searchQuery = '',
}) => {
  const [filterByType, setFilterByType] = useState<LocationType | ''>('')
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'discovered' | 'visited'>('name')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | undefined>()
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)

  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const deleteLocation = useCampaignStore(state => state.deleteLocation)
  const isDeleteDialogOpen = locationToDelete !== null

  const filteredAndSortedLocations = useMemo(() => {
    if (!campaign)
      return []

    let locations = [...campaign.locations]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      locations = locations.filter(location =>
        location.name.toLowerCase().includes(query)
        || location.description.toLowerCase().includes(query)
        || location.notes.toLowerCase().includes(query)
        || (location.dangers && location.dangers.some(d => d.toLowerCase().includes(query)))
        || (location.resources && location.resources.some(r => r.toLowerCase().includes(query))),
      )
    }

    // Filter by type
    if (filterByType) {
      locations = locations.filter(location => location.type === filterByType)
    }

    // Sort locations
    locations.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'discovered':
          return b.discovered.getTime() - a.discovered.getTime()
        case 'visited':
          return b.visited.length - a.visited.length
        default:
          return 0
      }
    })

    return locations
  }, [campaign, searchQuery, filterByType, sortBy])

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (location: Location) => {
    setLocationToDelete(location)
  }

  const closeDeleteDialog = () => {
    setLocationToDelete(null)
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open)
      closeDeleteDialog()
  }

  const confirmDeleteLocation = () => {
    if (!locationToDelete)
      return

    deleteLocation(campaignId, locationToDelete.id)
    setLocationToDelete(null)
  }

  const deleteDialogMessage = locationToDelete
    ? `This will permanently delete "${locationToDelete.name}".`
    : 'This will permanently delete the location.'

  const handleCreateLocation = () => {
    setEditingLocation(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingLocation(undefined)
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
            <h3 className="text-xl font-display">Location Tracker</h3>
            <p className="text-muted-foreground">
              {filteredAndSortedLocations.length}
              {' '}
              of
              {campaign.locations.length}
              {' '}
              locations
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={handleCreateLocation}
          >
            <Plus size={16} />
            Add Location
          </Button>
        </div>

        {/* Filters */}
        <Card variant="surface">
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--primary)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
                <option value="discovered">Sort by Discovery Date</option>
                <option value="visited">Sort by Visit Count</option>
              </select>

              <select
                value={filterByType}
                onChange={e => setFilterByType(e.target.value as any)}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--primary)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="">All Types</option>
                <option value={LocationType.CITY}>City</option>
                <option value={LocationType.TOWN}>Town</option>
                <option value={LocationType.VILLAGE}>Village</option>
                <option value={LocationType.DUNGEON}>Dungeon</option>
                <option value={LocationType.WILDERNESS}>Wilderness</option>
                <option value={LocationType.OTHER}>Other</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Locations List */}
        {filteredAndSortedLocations.length === 0
          ? (
              <Card variant="surface" className="campaign-empty-state">
                <CardContent>
                  <div className="text-center space-y-4">
                    <MapPin size={48} className="mx-auto text-muted-foreground" />
                    <div>
                      <h4 className="font-medium mb-2">
                        {campaign.locations.length === 0 ? 'No locations discovered' : 'No locations match your filters'}
                      </h4>
                      <p className="text-muted-foreground">
                        {campaign.locations.length === 0
                          ? 'Explore and document the world around you'
                          : 'Try adjusting your search terms or filters'}
                      </p>
                    </div>
                    {campaign.locations.length === 0 && (
                      <Button
                        variant="primary"
                        size="md"
                        className="gap-2"
                        onClick={handleCreateLocation}
                      >
                        <Plus size={16} />
                        Add First Location
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAndSortedLocations.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <LocationCard
                      location={location}
                      onEdit={handleEditLocation}
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
            <AlertDialogTitle>Delete location</AlertDialogTitle>
            <AlertDialogDescription>{deleteDialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        campaignId={campaignId}
        location={editingLocation}
      />
    </>
  )
}
