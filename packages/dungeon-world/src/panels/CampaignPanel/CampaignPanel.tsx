import type { PanelProps } from '../../framework/Panel'

import type { Campaign } from '../../models/Campaign'
import React, { useEffect, useState } from 'react'

import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { campaignService } from '../../services/CampaignService'
import './CampaignPanel.css'

interface CampaignPanelState {
  selectedTab: 'sessions' | 'journal' | 'npcs' | 'locations'
  selectedCampaignId: string | null
  searchTerm: string
  showCreateModal: boolean
  showDetailsModal: boolean
  detailsItem: unknown | null
}

const CampaignPanel: React.FC <PanelProps> = ({ id }) => {
  const _api = createPanelAPI(id)
  const [panelState, setPanelState] = useState <CampaignPanelState>({
    selectedTab: 'sessions',
    selectedCampaignId: null,
    searchTerm: '',
    showCreateModal: false,
    showDetailsModal: false,
    detailsItem: null,
  })

  const [campaigns, setCampaigns] = useState <Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState <Campaign | null>(null)

  // Load campaigns on mount
  useEffect(() => {
    const allCampaigns = campaignService.getAllCampaigns()
    setCampaigns(allCampaigns)

    if (allCampaigns.length > 0 && !panelState.selectedCampaignId) {
      setPanelState(prev => ({ ...prev, selectedCampaignId: allCampaigns[0].id }))
      setSelectedCampaign(allCampaigns[0])
    }
  }, [])

  // Update selected campaign when ID changes
  useEffect(() => {
    if (panelState.selectedCampaignId) {
      const campaign = campaignService.getCampaign(panelState.selectedCampaignId)
      setSelectedCampaign(campaign || null)
    }
  }, [panelState.selectedCampaignId])

  const updateState = (updates: Partial <CampaignPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }

  const refreshCampaigns = () => {
    const allCampaigns = campaignService.getAllCampaigns()
    setCampaigns(allCampaigns)
  }

  const handleCreateCampaign = (name: string, description?: string) => {
    const newCampaign = campaignService.createCampaign(name, description)
    refreshCampaigns()
    setPanelState(prev => ({
      ...prev,
      selectedCampaignId: newCampaign.id,
      showCreateModal: false,
    }))
    setSelectedCampaign(newCampaign)
  }

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      campaignService.deleteCampaign(campaignId)
      refreshCampaigns()

      if (panelState.selectedCampaignId === campaignId) {
        const remainingCampaigns = campaignService.getAllCampaigns()
        if (remainingCampaigns.length > 0) {
          setPanelState(prev => ({ ...prev, selectedCampaignId: remainingCampaigns[0].id }))
          setSelectedCampaign(remainingCampaigns[0])
        }
        else {
          setPanelState(prev => ({ ...prev, selectedCampaignId: null }))
          setSelectedCampaign(null)
        }
      }
    }
  }

  const handleCreateItem = (type: string, data: any) => {
    if (!selectedCampaign)
      return

    switch (type) {
      case 'sessions':
        campaignService.addSession(selectedCampaign.id, data.title, data.summary)
        break
      case 'journal':
        campaignService.addJournalEntry(selectedCampaign.id, data.title, data.content)
        break
      case 'npcs':
        campaignService.addNPC(selectedCampaign.id, data.name, data.description, data.role)
        break
      case 'locations':
        campaignService.addLocation(selectedCampaign.id, data.name, data.description, data.type)
        break
    }

    refreshCampaigns()
    const updatedCampaign = campaignService.getCampaign(selectedCampaign.id)
    setSelectedCampaign(updatedCampaign || null)
    updateState({ showCreateModal: false })
  }

  const handleUpdateItem = (type: string, itemId: string, updates: any) => {
    if (!selectedCampaign)
      return

    switch (type) {
      case 'sessions':
        campaignService.updateSession(selectedCampaign.id, itemId, updates)
        break
      case 'journal':
        campaignService.updateJournalEntry(selectedCampaign.id, itemId, updates)
        break
      case 'npcs':
        campaignService.updateNPC(selectedCampaign.id, itemId, updates)
        break
      case 'locations':
        campaignService.updateLocation(selectedCampaign.id, itemId, updates)
        break
    }

    refreshCampaigns()
    const updatedCampaign = campaignService.getCampaign(selectedCampaign.id)
    setSelectedCampaign(updatedCampaign || null)
  }

  const handleDeleteItem = (type: string, itemId: string) => {
    if (!selectedCampaign)
      return

    if (confirm('Are you sure you want to delete this item?')) {
      switch (type) {
        case 'sessions':
          campaignService.deleteSession(selectedCampaign.id, itemId)
          break
        case 'journal':
          campaignService.deleteJournalEntry(selectedCampaign.id, itemId)
          break
        case 'npcs':
          campaignService.deleteNPC(selectedCampaign.id, itemId)
          break
        case 'locations':
          campaignService.deleteLocation(selectedCampaign.id, itemId)
          break
      }

      refreshCampaigns()
      const updatedCampaign = campaignService.getCampaign(selectedCampaign.id)
      setSelectedCampaign(updatedCampaign || null)
    }
  }

  const getFilteredItems = () => {
    if (!selectedCampaign)
      return []

    let items: unknown[] = []
    switch (panelState.selectedTab) {
      case 'sessions':
        items = selectedCampaign.sessions
        break
      case 'journal':
        items = selectedCampaign.journal
        break
      case 'npcs':
        items = selectedCampaign.npcs
        break
      case 'locations':
        items = selectedCampaign.locations
        break
    }

    if (panelState.searchTerm) {
      const searchLower = panelState.searchTerm.toLowerCase()
      items = items.filter((item) => {
        if (panelState.selectedTab === 'sessions') {
          return item.title.toLowerCase().includes(searchLower)
            || item.summary.toLowerCase().includes(searchLower)
        }
        else if (panelState.selectedTab === 'journal') {
          return item.title.toLowerCase().includes(searchLower)
            || item.content.toLowerCase().includes(searchLower)
        }
        else if (panelState.selectedTab === 'npcs') {
          return item.name.toLowerCase().includes(searchLower)
            || item.description.toLowerCase().includes(searchLower)
            || item.role.toLowerCase().includes(searchLower)
        }
        else if (panelState.selectedTab === 'locations') {
          return item.name.toLowerCase().includes(searchLower)
            || item.description.toLowerCase().includes(searchLower)
        }
        return false
      })
    }

    return items
  }

  const renderItemCard = (item: any) => {
    const handleEdit = () => {
      setPanelState(prev => ({
        ...prev,
        showDetailsModal: true,
        detailsItem: { ...item, type: panelState.selectedTab },
      }))
    }

    const handleDelete = () => {
      handleDeleteItem(panelState.selectedTab, item.id)
    }

    return (
      <div key={item.id} className="campaign-item-card">
        <div className="item-header">
          <h4>{item.title || item.name}</h4>
          <div className="item-actions">
            <button onClick={handleEdit} className="action-button edit">Edit</button>
            <button onClick={handleDelete} className="action-button delete">Delete</button>
          </div>
        </div>

        <div className="item-content">
          {panelState.selectedTab === 'sessions' && (
            <>
              <p className="item-summary">{item.summary}</p>
              <div className="item-meta">
                <span>
                  {' '}
                  XP:
                  {item.xpGained || 0}
                </span>
                <span>
                  {' '}
                  Date:
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            </>
          )}

          {panelState.selectedTab === 'journal' && (
            <>
              <p className="item-content-preview">
                {item.content.slice(0, 100)}
                ...
              </p>
              <div className="item-meta">
                <span>
                  {' '}
                  Date:
                  {new Date(item.date).toLocaleDateString()}
                </span>
                {item.isImportant && <span className="important-badge">Important</span>}
              </div>
            </>
          )}

          {panelState.selectedTab === 'npcs' && (
            <>
              <p className="item-description">{item.description}</p>
              <div className="item-meta">
                <span>
                  {' '}
                  Role:
                  {item.role}
                </span>
                <span>
                  {' '}
                  Importance:
                  {item.importance || 'Unknown'}
                </span>
                <span>
                  {' '}
                  Disposition:
                  {item.disposition || 'Unknown'}
                </span>
              </div>
            </>
          )}

          {panelState.selectedTab === 'locations' && (
            <>
              <p className="item-description">{item.description}</p>
              <div className="item-meta">
                <span>
                  {' '}
                  Type:
                  {item.type}
                </span>
                <span>
                  {' '}
                  Visits:
                  {item.visited?.length || 0}
                </span>
                <span>
                  {' '}
                  Discovered:
                  {new Date(item.discovered).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render modals BEFORE the early return
  const shouldShowCreateModal = panelState.showCreateModal && !selectedCampaign

  if (campaigns.length === 0) {
    return (
      <>
        <div className="campaign-panel">
          <div className="campaign-panel__header">
            <h2>🗺️ Campaigns</h2>
          </div>
          <div className="no-campaigns">
            <p> No campaigns found. Create your first campaign to get started!</p>
            <button
              className="primary-button"
              onClick={() => updateState({ showCreateModal: true })}
            >
              Create Campaign
            </button>
          </div>
        </div>

        {/* Create Campaign Modal-Rendered for no campaigns case */}
        {shouldShowCreateModal && (
          <CreateCampaignModal
            onConfirm={handleCreateCampaign}
            onCancel={() => updateState({ showCreateModal: false })}
          />
        )}
      </>
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <>
      <div className="campaign-panel">
        <div className="campaign-panel__header">
          <h2>🗺️ Campaigns</h2>
          <div className="campaign-selector">
            <select
              value={panelState.selectedCampaignId || ''}
              onChange={e => updateState({ selectedCampaignId: e.target.value })}
              aria-label="Select campaign"
            >
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => updateState({ showCreateModal: true })}
              className="primary-button"
            >
              New Campaign
            </button>
            <button
              onClick={() => handleDeleteCampaign(panelState.selectedCampaignId!)}
              className="delete-button"
              disabled={!panelState.selectedCampaignId}
            >
              Delete
            </button>
          </div>
        </div>

        {selectedCampaign && (
          <>
            <div className="campaign-info">
              <h3>{selectedCampaign.name}</h3>
              {selectedCampaign.description && (
                <p className="campaign-description">{selectedCampaign.description}</p>
              )}
              <div className="campaign-stats">
                <span>
                  {' '}
                  Sessions:
                  {selectedCampaign.sessions.length}
                </span>
                <span>
                  {' '}
                  Journal Entries:
                  {selectedCampaign.journal.length}
                </span>
                <span>
                  {' '}
                  NPCs:
                  {selectedCampaign.npcs.length}
                </span>
                <span>
                  {' '}
                  Locations:
                  {selectedCampaign.locations.length}
                </span>
              </div>
            </div>

            <div className="campaign-tabs">
              {(['sessions', 'journal', 'npcs', 'locations'] as const).map(tab => (
                <button
                  key={tab}
                  className={`tab-button ${panelState.selectedTab === tab ? 'active' : ''}`}
                  onClick={() => updateState({ selectedTab: tab })}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="campaign-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={`Search ${panelState.selectedTab}...`}
                  value={panelState.searchTerm}
                  onChange={e => updateState({ searchTerm: e.target.value })}
                  className="search-input"
                />
              </div>
              <button
                className="primary-button"
                onClick={() => updateState({ showCreateModal: true })}
              >
                Add
                {' '}
                {panelState.selectedTab.slice(0, -1)}
              </button>
            </div>

            <div className="campaign-content">
              {filteredItems.length === 0
                ? (
                    <div className="no-items">
                      <p>
                        {' '}
                        No
                        {panelState.selectedTab}
                        {' '}
                        found. Create your first one!
                      </p>
                    </div>
                  )
                : (
                    <div className="items-grid">
                      {filteredItems.map(renderItemCard)}
                    </div>
                  )}
            </div>
          </>
        )}
      </div>

      {/* Create Campaign Modal */}
      {panelState.showCreateModal && !selectedCampaign && (
        <CreateCampaignModal
          onConfirm={handleCreateCampaign}
          onCancel={() => updateState({ showCreateModal: false })}
        />
      )}

      {/* Add Item Modal */}
      {panelState.showCreateModal && selectedCampaign && (
        <AddItemModal
          type={panelState.selectedTab}
          onConfirm={handleCreateItem}
          onCancel={() => updateState({ showCreateModal: false })}
        />
      )}

      {/* Item Details Modal */}
      {panelState.showDetailsModal && panelState.detailsItem && (
        <ItemDetailsModal
          item={panelState.detailsItem}
          onUpdate={handleUpdateItem}
          onCancel={() => updateState({ showDetailsModal: false, detailsItem: null })}
        />
      )}
    </>
  )
}

// Modal Components
const CreateCampaignModal: React.FC<{
  onConfirm: (name: string, description?: string) => void
  onCancel: () => void
}> = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name.trim(), description.trim() || undefined)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3> Create New Campaign</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="campaign-name">Campaign Name *</label>
            <input
              id="campaign-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter campaign name"
              aria-label="Campaign name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="campaign-description">Description</label>
            <textarea
              id="campaign-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional campaign description"
              rows={3}
              aria-label="Campaign description"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="secondary-button">Cancel</button>
            <button type="submit" className="primary-button">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AddItemModal: React.FC<{
  type: 'sessions' | 'journal' | 'npcs' | 'locations'
  onConfirm: (type: string, data: any) => void
  onCancel: () => void
}> = ({ type, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState <unknown>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(type, formData)
  }

  const renderForm = () => {
    switch (type) {
      case 'sessions':
        return (
          <>
            <div className="form-group">
              <label htmlFor="session-title">Title *</label>
              <input
                id="session-title"
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter session title"
                aria-label="Session title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="session-summary">Summary *</label>
              <textarea
                id="session-summary"
                value={formData.summary || ''}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                required
                placeholder="Brief session summary"
                rows={3}
                aria-label="Session summary"
              />
            </div>
          </>
        )

      case 'journal':
        return (
          <>
            <div className="form-group">
              <label htmlFor="journal-title">Title *</label>
              <input
                id="journal-title"
                type="text"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter journal entry title"
                aria-label="Journal title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="journal-content">Content *</label>
              <textarea
                id="journal-content"
                value={formData.content || ''}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Journal entry content"
                rows={6}
                aria-label="Journal content"
              />
            </div>
          </>
        )

      case 'npcs':
        return (
          <>
            <div className="form-group">
              <label htmlFor="npc-name">Name *</label>
              <input
                id="npc-name"
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter NPC name"
                aria-label="NPC name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="npc-description">Description *</label>
              <textarea
                id="npc-description"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="NPC description"
                rows={3}
                aria-label="NPC description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="npc-role">Role *</label>
              <input
                id="npc-role"
                type="text"
                value={formData.role || ''}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                required
                placeholder="NPC role (e.g., Merchant, Quest Giver)"
                aria-label="NPC role"
              />
            </div>
          </>
        )

      case 'locations':
        return (
          <>
            <div className="form-group">
              <label htmlFor="location-name">Name *</label>
              <input
                id="location-name"
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter location name"
                aria-label="Location name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="location-description">Description *</label>
              <textarea
                id="location-description"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Location description"
                rows={3}
                aria-label="Location description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="location-type">Type</label>
              <select
                id="location-type"
                value={formData.type || 'other'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                aria-label="Location type"
              >
                <option value="city">City</option>
                <option value="town">Town</option>
                <option value="village">Village</option>
                <option value="dungeon">Dungeon</option>
                <option value="wilderness">Wilderness</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>
          {' '}
          Add New
          {type.slice(0, -1)}
        </h3>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="secondary-button">Cancel</button>
            <button type="submit" className="primary-button">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ItemDetailsModal: React.FC<{
  item: unknown
  onUpdate: (type: string, itemId: string, updates: any) => void
  onCancel: () => void
}> = ({ item, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(item.type, item.id, formData)
    onCancel()
  }

  const renderForm = () => {
    switch (item.type) {
      case 'sessions':
        return (
          <>
            <div className="form-group">
              <label htmlFor="edit-session-title">Title *</label>
              <input
                id="edit-session-title"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                aria-label="Session title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-session-summary">Summary *</label>
              <textarea
                id="edit-session-summary"
                value={formData.summary}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
                required
                rows={3}
                aria-label="Session summary"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-session-xp">XP Gained</label>
              <input
                id="edit-session-xp"
                type="number"
                value={formData.xpGained || 0}
                onChange={e => setFormData({ ...formData, xpGained: Number.parseInt(e.target.value) || 0 })}
                aria-label="XP gained"
              />
            </div>
          </>
        )

      case 'journal':
        return (
          <>
            <div className="form-group">
              <label htmlFor="edit-journal-title">Title *</label>
              <input
                id="edit-journal-title"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                aria-label="Journal title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-journal-content">Content *</label>
              <textarea
                id="edit-journal-content"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
                aria-label="Journal content"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isImportant || false}
                  onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
                  aria-label="Mark as important"
                />
                Mark as Important
              </label>
            </div>
          </>
        )

      case 'npcs':
        return (
          <>
            <div className="form-group">
              <label htmlFor="edit-npc-name">Name *</label>
              <input
                id="edit-npc-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                aria-label="NPC name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-npc-description">Description *</label>
              <textarea
                id="edit-npc-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                aria-label="NPC description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-npc-role">Role *</label>
              <input
                id="edit-npc-role"
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                required
                aria-label="NPC role"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-npc-importance">Importance</label>
              <select
                id="edit-npc-importance"
                value={formData.importance || 'medium'}
                onChange={e => setFormData({ ...formData, importance: e.target.value })}
                aria-label="NPC importance"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-npc-disposition">Disposition</label>
              <select
                id="edit-npc-disposition"
                value={formData.disposition || 'neutral'}
                onChange={e => setFormData({ ...formData, disposition: e.target.value })}
                aria-label="NPC disposition"
              >
                <option value="friendly">Friendly</option>
                <option value="neutral">Neutral</option>
                <option value="hostile">Hostile</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </>
        )

      case 'locations':
        return (
          <>
            <div className="form-group">
              <label htmlFor="edit-location-name">Name *</label>
              <input
                id="edit-location-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                aria-label="Location name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-location-description">Description *</label>
              <textarea
                id="edit-location-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                aria-label="Location description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-location-type">Type</label>
              <select
                id="edit-location-type"
                value={formData.type || 'other'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                aria-label="Location type"
              >
                <option value="city">City</option>
                <option value="town">Town</option>
                <option value="village">Village</option>
                <option value="dungeon">Dungeon</option>
                <option value="wilderness">Wilderness</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>
          {' '}
          Edit
          {item.type.slice(0, -1)}
        </h3>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="secondary-button">Cancel</button>
            <button type="submit" className="primary-button">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export the component separately for HMR compatibility
export { CampaignPanel }

// Export the panel configuration
const campaignPanelConfig = createPanel(
  {
    id: 'campaigns',
    name: 'Campaigns',
    icon: '🗺️',
    description: 'Manage campaign sessions, journal, NPCs, and locations',
    priority: 5,
  },
  CampaignPanel,
)

export default campaignPanelConfig
