/**
 * NPC Manager - Detailed NPC management with relationships and tracking
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Users,
  Plus,
  Edit,
  Trash2,
  Heart,
  Shield,
  Skull,
  HelpCircle,
  MapPin,
  Calendar,
  Eye,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useCampaignStore } from '../../../stores/campaignStore'
import { formatDateRelative, formatNPCDisposition, NPCImportance, NPCDisposition } from '../../../campaignManagementMockData'
import type { NPC } from '../../../models/Campaign'

interface NPCManagerProps {
  campaignId: string
  searchQuery?: string
}

interface NPCCardProps {
  npc: NPC
  onEdit: (npc: NPC) => void
  onDelete: (npcId: string) => void
}

const getDispositionIcon = (disposition: NPCDisposition) => {
  switch (disposition) {
    case NPCDisposition.FRIENDLY:
      return <Heart size={14} style={{ color: 'var(--color-disposition-friendly)' }} />
    case NPCDisposition.NEUTRAL:
      return <Shield size={14} style={{ color: 'var(--color-disposition-neutral)' }} />
    case NPCDisposition.HOSTILE:
      return <Skull size={14} style={{ color: 'var(--color-disposition-hostile)' }} />
    case NPCDisposition.UNKNOWN:
      return <HelpCircle size={14} style={{ color: 'var(--color-disposition-unknown)' }} />
    default:
      return <HelpCircle size={14} />
  }
}

const getImportanceBadgeClass = (importance: NPCImportance) => {
  switch (importance) {
    case NPCImportance.HIGH:
      return 'importance-badge-high'
    case NPCImportance.MEDIUM:
      return 'importance-badge-medium'
    case NPCImportance.LOW:
      return 'importance-badge-low'
    default:
      return 'importance-badge-medium'
  }
}

const NPCCard: React.FC<NPCCardProps> = ({ npc, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card 
      variant={npc.importance === NPCImportance.HIGH ? "magical" : "glass"} 
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
                  {npc.name}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getImportanceBadgeClass(npc.importance)}`}
                >
                  {npc.importance}
                </Badge>
                <div className="flex items-center gap-1">
                  {getDispositionIcon(npc.disposition)}
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatNPCDisposition(npc.disposition)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Badge variant="outline" className="text-xs">
                  {npc.role}
                </Badge>
                {npc.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {npc.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  Met {formatDateRelative(npc.firstMet)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(npc)}
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(npc.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {npc.description}
            </p>
          </div>

          {/* Last Seen */}
          {npc.lastSeen && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Eye size={14} />
              Last seen {formatDateRelative(npc.lastSeen)}
            </div>
          )}

          {/* Notes */}
          {npc.notes && (
            <div>
              <p 
                className="text-sm p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)' 
                }}
              >
                {npc.notes}
              </p>
            </div>
          )}

          {/* Secrets */}
          {npc.secrets && npc.secrets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} style={{ color: 'var(--color-importance-high)' }} />
                <span className="font-medium text-sm">Secrets</span>
              </div>
              <div className="space-y-2">
                {npc.secrets.map((secret, index) => (
                  <div 
                    key={index}
                    className="text-sm p-2 rounded-lg flex items-start gap-2"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-importance-high)',
                      borderOpacity: 0.3
                    }}
                  >
                    <Lock size={12} style={{ color: 'var(--color-importance-high)', marginTop: '2px' }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {secret}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const NPCManager: React.FC<NPCManagerProps> = ({ 
  campaignId, 
  searchQuery = '' 
}) => {
  const [filterByImportance, setFilterByImportance] = useState<NPCImportance | ''>('')
  const [filterByDisposition, setFilterByDisposition] = useState<NPCDisposition | ''>('')
  const [sortBy, setSortBy] = useState<'name' | 'importance' | 'firstMet' | 'lastSeen'>('name')
  
  const campaign = useCampaignStore(state => state.getCampaign(campaignId))
  const addNPC = useCampaignStore(state => state.addNPC)
  const updateNPC = useCampaignStore(state => state.updateNPC)
  const deleteNPC = useCampaignStore(state => state.deleteNPC)

  const filteredAndSortedNPCs = useMemo(() => {
    if (!campaign) return []

    let npcs = [...campaign.npcs]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      npcs = npcs.filter(npc =>
        npc.name.toLowerCase().includes(query) ||
        npc.description.toLowerCase().includes(query) ||
        npc.role.toLowerCase().includes(query) ||
        npc.notes.toLowerCase().includes(query) ||
        (npc.location && npc.location.toLowerCase().includes(query)) ||
        (npc.secrets && npc.secrets.some(s => s.toLowerCase().includes(query)))
      )
    }

    // Filter by importance
    if (filterByImportance) {
      npcs = npcs.filter(npc => npc.importance === filterByImportance)
    }

    // Filter by disposition
    if (filterByDisposition) {
      npcs = npcs.filter(npc => npc.disposition === filterByDisposition)
    }

    // Sort NPCs
    npcs.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'importance':
          const importanceOrder = { high: 3, medium: 2, low: 1 }
          return importanceOrder[b.importance] - importanceOrder[a.importance]
        case 'firstMet':
          return b.firstMet.getTime() - a.firstMet.getTime()
        case 'lastSeen':
          if (!a.lastSeen && !b.lastSeen) return 0
          if (!a.lastSeen) return 1
          if (!b.lastSeen) return -1
          return b.lastSeen.getTime() - a.lastSeen.getTime()
        default:
          return 0
      }
    })

    return npcs
  }, [campaign, searchQuery, filterByImportance, filterByDisposition, sortBy])

  const handleEditNPC = (npc: NPC) => {
    // TODO: Implement edit NPC modal
    console.log('Edit NPC:', npc)
  }

  const handleDeleteNPC = (npcId: string) => {
    if (confirm('Are you sure you want to delete this NPC?')) {
      deleteNPC(campaignId, npcId)
    }
  }

  const handleCreateNPC = () => {
    // TODO: Implement create NPC modal
    console.log('Create NPC')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display">NPC Management</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {filteredAndSortedNPCs.length} of {campaign.npcs.length} NPCs
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="gap-2"
          onClick={handleCreateNPC}
        >
          <Plus size={16} />
          Add NPC
        </Button>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="sm">
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="importance">Sort by Importance</option>
              <option value="firstMet">Sort by First Met</option>
              <option value="lastSeen">Sort by Last Seen</option>
            </select>

            <select
              value={filterByImportance}
              onChange={(e) => setFilterByImportance(e.target.value as any)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
            >
              <option value="">All Importance</option>
              <option value={NPCImportance.HIGH}>High</option>
              <option value={NPCImportance.MEDIUM}>Medium</option>
              <option value={NPCImportance.LOW}>Low</option>
            </select>

            <select
              value={filterByDisposition}
              onChange={(e) => setFilterByDisposition(e.target.value as any)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text)'
              }}
            >
              <option value="">All Dispositions</option>
              <option value={NPCDisposition.FRIENDLY}>Friendly</option>
              <option value={NPCDisposition.NEUTRAL}>Neutral</option>
              <option value={NPCDisposition.HOSTILE}>Hostile</option>
              <option value={NPCDisposition.UNKNOWN}>Unknown</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* NPCs List */}
      {filteredAndSortedNPCs.length === 0 ? (
        <Card variant="glass" padding="lg" className="campaign-empty-state">
          <CardContent>
            <div className="text-center space-y-4">
              <Users size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
              <div>
                <h4 className="font-medium mb-2">
                  {campaign.npcs.length === 0 ? 'No NPCs added' : 'No NPCs match your filters'}
                </h4>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  {campaign.npcs.length === 0 
                    ? 'Add memorable characters you meet during your adventures'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
              </div>
              {campaign.npcs.length === 0 && (
                <Button 
                  variant="primary" 
                  size="md" 
                  className="gap-2"
                  onClick={handleCreateNPC}
                >
                  <Plus size={16} />
                  Add First NPC
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedNPCs.map((npc, index) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NPCCard
                npc={npc}
                onEdit={handleEditNPC}
                onDelete={handleDeleteNPC}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}