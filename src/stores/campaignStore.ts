/**
 * Campaign Store for ZimboMate V2
 * Manages campaign state, world data, and multi-character campaigns
 * Integrates with CampaignService
 */

import type {
  Campaign,
  CampaignSession,
  JournalEntry,
  Location,
  NPC,
} from '../models/Campaign'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { campaignService } from '../services/CampaignService'

interface CampaignState {
  // Campaign data
  campaigns: Campaign[]
  activeCampaignId: string | null
  isLoading: boolean
  error: string | null

  // Search and filter
  searchQuery: string
  selectedTags: string[]

  // Campaign CRUD operations
  createCampaign: (name: string, description?: string) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  getCampaign: (id: string) => Campaign | undefined
  setActiveCampaign: (id: string | null) => void
  getActiveCampaign: () => Campaign | undefined

  // Campaign management
  duplicateCampaign: (id: string) => Campaign | undefined
  exportCampaign: (id: string) => string | undefined
  importCampaign: (campaignData: string) => Campaign

  // Session management
  addSession: (
    campaignId: string,
    title: string,
    summary: string,
  ) => CampaignSession | undefined
  updateSession: (
    campaignId: string,
    sessionId: string,
    updates: Partial<CampaignSession>,
  ) => void
  deleteSession: (campaignId: string, sessionId: string) => void

  // Journal management
  addJournalEntry: (
    campaignId: string,
    title: string,
    content: string,
  ) => JournalEntry | undefined
  updateJournalEntry: (
    campaignId: string,
    entryId: string,
    updates: Partial<JournalEntry>,
  ) => void
  deleteJournalEntry: (campaignId: string, entryId: string) => void

  // NPC management
  addNPC: (
    campaignId: string,
    name: string,
    description: string,
    role: string,
  ) => NPC | undefined
  updateNPC: (campaignId: string, npcId: string, updates: Partial<NPC>) => void
  deleteNPC: (campaignId: string, npcId: string) => void

  // Location management
  addLocation: (
    campaignId: string,
    name: string,
    description: string,
    type: Location['type'],
  ) => Location | undefined
  updateLocation: (
    campaignId: string,
    locationId: string,
    updates: Partial<Location>,
  ) => void
  deleteLocation: (campaignId: string, locationId: string) => void

  // Character association
  addCharacterToCampaign: (campaignId: string, characterId: string) => void
  removeCharacterFromCampaign: (campaignId: string, characterId: string) => void
  getCampaignsForCharacter: (characterId: string) => Campaign[]

  // Search functionality
  searchCampaign: (
    campaignId: string,
    query: string,
  ) => {
    sessions: CampaignSession[]
    journal: JournalEntry[]
    npcs: NPC[]
    locations: Location[]
  } | null

  // Statistics
  getCampaignStats: (campaignId: string) => {
    totalSessions: number
    totalJournalEntries: number
    totalNPCs: number
    totalLocations: number
    totalXP: number
    averageSessionLength: number
  } | null

  // Utility
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  refreshFromService: () => void
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      // Initial state - populate with mock data for development
      campaigns: [],
      activeCampaignId: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],

      // Campaign CRUD operations
      createCampaign: (name, description) => {
        try {
          const campaign = campaignService.createCampaign(name, description)

          set((state) => ({
            campaigns: [...state.campaigns, campaign],
            activeCampaignId: campaign.id,
            error: null,
          }))

          return campaign
        } catch (error) {
          const errorMessage = `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      updateCampaign: (id, updates) => {
        try {
          const updatedCampaign = campaignService.updateCampaign(id, updates)

          if (updatedCampaign) {
            set((state) => ({
              campaigns: state.campaigns.map((campaign) =>
                campaign.id === id ? updatedCampaign : campaign,
              ),
              error: null,
            }))
          } else {
            set({ error: 'Campaign not found' })
          }
        } catch (error) {
          set({
            error: `Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteCampaign: (id) => {
        try {
          const success = campaignService.deleteCampaign(id)

          if (success) {
            set((state) => ({
              campaigns: state.campaigns.filter(
                (campaign) => campaign.id !== id,
              ),
              activeCampaignId:
                state.activeCampaignId === id ? null : state.activeCampaignId,
              error: null,
            }))
          } else {
            set({ error: 'Campaign not found' })
          }
        } catch (error) {
          set({
            error: `Failed to delete campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      getCampaign: (id) => {
        const { campaigns } = get()
        return campaigns.find((campaign) => campaign.id === id)
      },

      setActiveCampaign: (id) => {
        const { campaigns } = get()
        if (id === null || campaigns.some((campaign) => campaign.id === id)) {
          set({ activeCampaignId: id, error: null })
        } else {
          set({ error: 'Campaign not found' })
        }
      },

      getActiveCampaign: () => {
        const { campaigns, activeCampaignId } = get()
        if (!activeCampaignId) return undefined
        return campaigns.find((campaign) => campaign.id === activeCampaignId)
      },

      // Campaign management
      duplicateCampaign: (id) => {
        try {
          const { campaigns, createCampaign } = get()
          const originalCampaign = campaigns.find(
            (campaign) => campaign.id === id,
          )

          if (!originalCampaign) {
            set({ error: 'Campaign not found' })
            return undefined
          }

          const duplicatedCampaign = createCampaign(
            `${originalCampaign.name} (Copy)`,
            originalCampaign.description,
          )

          // Copy campaign data (sessions, journal, etc.)
          const fullDuplicate: Campaign = {
            ...duplicatedCampaign,
            sessions: originalCampaign.sessions.map((session) => ({
              ...session,
              id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            })),
            journal: originalCampaign.journal.map((entry) => ({
              ...entry,
              id: `journal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            })),
            npcs: originalCampaign.npcs.map((npc) => ({
              ...npc,
              id: `npc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            })),
            locations: originalCampaign.locations.map((location) => ({
              ...location,
              id: `location-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            })),
          }

          get().updateCampaign(duplicatedCampaign.id, fullDuplicate)
          return fullDuplicate
        } catch (error) {
          set({
            error: `Failed to duplicate campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      exportCampaign: (id) => {
        try {
          return campaignService.exportCampaign(id)
        } catch (error) {
          set({
            error: `Failed to export campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      importCampaign: (campaignData) => {
        try {
          const campaign = campaignService.importCampaign(campaignData)

          set((state) => ({
            campaigns: [...state.campaigns, campaign],
            activeCampaignId: campaign.id,
            error: null,
          }))

          return campaign
        } catch (error) {
          const errorMessage = `Failed to import campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Session management
      addSession: (campaignId, title, summary) => {
        try {
          const session = campaignService.addSession(campaignId, title, summary)

          if (session) {
            // Refresh campaign data
            get().refreshFromService()
          }

          return session
        } catch (error) {
          set({
            error: `Failed to add session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      updateSession: (campaignId, sessionId, updates) => {
        try {
          campaignService.updateSession(campaignId, sessionId, updates)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteSession: (campaignId, sessionId) => {
        try {
          campaignService.deleteSession(campaignId, sessionId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // Journal management
      addJournalEntry: (campaignId, title, content) => {
        try {
          const entry = campaignService.addJournalEntry(
            campaignId,
            title,
            content,
          )

          if (entry) {
            get().refreshFromService()
          }

          return entry
        } catch (error) {
          set({
            error: `Failed to add journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      updateJournalEntry: (campaignId, entryId, updates) => {
        try {
          campaignService.updateJournalEntry(campaignId, entryId, updates)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to update journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteJournalEntry: (campaignId, entryId) => {
        try {
          campaignService.deleteJournalEntry(campaignId, entryId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to delete journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // NPC management
      addNPC: (campaignId, name, description, role) => {
        try {
          const npc = campaignService.addNPC(
            campaignId,
            name,
            description,
            role,
          )

          if (npc) {
            get().refreshFromService()
          }

          return npc
        } catch (error) {
          set({
            error: `Failed to add NPC: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      updateNPC: (campaignId, npcId, updates) => {
        try {
          campaignService.updateNPC(campaignId, npcId, updates)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to update NPC: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteNPC: (campaignId, npcId) => {
        try {
          campaignService.deleteNPC(campaignId, npcId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to delete NPC: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // Location management
      addLocation: (campaignId, name, description, type) => {
        try {
          const location = campaignService.addLocation(
            campaignId,
            name,
            description,
            type,
          )

          if (location) {
            get().refreshFromService()
          }

          return location
        } catch (error) {
          set({
            error: `Failed to add location: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return undefined
        }
      },

      updateLocation: (campaignId, locationId, updates) => {
        try {
          campaignService.updateLocation(campaignId, locationId, updates)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      deleteLocation: (campaignId, locationId) => {
        try {
          campaignService.deleteLocation(campaignId, locationId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to delete location: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      // Character association
      addCharacterToCampaign: (campaignId, characterId) => {
        try {
          campaignService.addCharacterToCampaign(campaignId, characterId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to add character to campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      removeCharacterFromCampaign: (campaignId, characterId) => {
        try {
          campaignService.removeCharacterFromCampaign(campaignId, characterId)
          get().refreshFromService()
        } catch (error) {
          set({
            error: `Failed to remove character from campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },

      getCampaignsForCharacter: (characterId) => {
        try {
          return campaignService.getCampaignsForCharacter(characterId)
        } catch (error) {
          set({
            error: `Failed to get campaigns for character: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return []
        }
      },

      // Search functionality
      searchCampaign: (campaignId, query) => {
        try {
          return campaignService.searchCampaign(campaignId, query)
        } catch (error) {
          set({
            error: `Failed to search campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return null
        }
      },

      // Statistics
      getCampaignStats: (campaignId) => {
        try {
          return campaignService.getCampaignStats(campaignId)
        } catch (error) {
          set({
            error: `Failed to get campaign stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
          return null
        }
      },

      // Utility
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedTags: (tags) => set({ selectedTags: tags }),

      clearError: () => set({ error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      refreshFromService: () => {
        try {
          const campaigns = campaignService.getAllCampaigns()
          set({ campaigns, error: null })
        } catch (error) {
          set({
            error: `Failed to refresh campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      },
    }),
    {
      name: 'zimbomate-campaign-storage',
      partialize: (state) => ({
        activeCampaignId: state.activeCampaignId,
        searchQuery: state.searchQuery,
        selectedTags: state.selectedTags,
      }),
      onRehydrateStorage: () => (state) => {
        // Refresh campaigns from service on hydration
        if (state) {
          state.refreshFromService()
        }
      },
    },
  ),
)
