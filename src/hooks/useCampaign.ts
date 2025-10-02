/**
 * useCampaign Hook for ZimboMate V2
 * Campaign operations, world management, and multi-character coordination
 * Integrates campaignStore with character and session management
 */

import type { Campaign, CampaignSession, JournalEntry, Location, NPC } from '../models/Campaign'
import { useCallback, useMemo } from 'react'
import { campaignService } from '../services/CampaignService'
import { useCampaignStore } from '../stores/campaignStore'
import { useCharacterStore } from '../stores/characterStore'

export interface CampaignCharacter {
  id: string
  name: string
  class: string
  level: number
  player: string
  isActive: boolean
  lastPlayed: Date
}

export interface CampaignStats {
  totalSessions: number
  totalPlayTime: number
  averageSessionLength: number
  totalXPAwarded: number
  charactersCreated: number
  locationsVisited: number
  npcsEncountered: number
}

export interface UseCampaignReturn {
  // Current campaign
  currentCampaign: Campaign | null
  isActiveCampaign: boolean

  // Campaign management
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Campaign
  updateCampaign: (updates: Partial<Campaign>) => void
  deleteCampaign: (campaignId: string) => void
  setActiveCampaign: (campaignId: string | null) => void

  // Campaign list
  allCampaigns: Campaign[]
  recentCampaigns: Campaign[]

  // Character management
  campaignCharacters: CampaignCharacter[]
  addCharacterToCampaign: (characterId: string) => void
  removeCharacterFromCampaign: (characterId: string) => void
  getCharacterCampaigns: (characterId: string) => Campaign[]

  // Session management
  campaignSessions: CampaignSession[]
  startCampaignSession: (name: string, characterIds: string[]) => void
  endCampaignSession: () => void
  getSessionHistory: () => CampaignSession[]

  // World management
  locations: Location[]
  npcs: NPC[]
  addLocation: (location: Omit<Location, 'id'>) => void
  updateLocation: (locationId: string, updates: Partial<Location>) => void
  addNPC: (npc: Omit<NPC, 'id'>) => void
  updateNPC: (npcId: string, updates: Partial<NPC>) => void

  // Journal management
  journalEntries: JournalEntry[]
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => void
  deleteJournalEntry: (entryId: string) => void
  searchJournal: (query: string) => JournalEntry[]

  // Campaign statistics
  campaignStats: CampaignStats

  // Import/Export
  exportCampaign: () => string
  importCampaign: (campaignData: string) => Campaign

  // Utility
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook for managing campaigns and world state
 */
export function useCampaign(): UseCampaignReturn {
  const {
    campaigns,
    activeCampaignId,
    isLoading,
    error,
    createCampaign: storeCreateCampaign,
    updateCampaign: storeUpdateCampaign,
    deleteCampaign: storeDeleteCampaign,
    setActiveCampaign: storeSetActiveCampaign,
    addCharacterToCampaign: storeAddCharacterToCampaign,
    removeCharacterFromCampaign: storeRemoveCharacterFromCampaign,
    addLocation: storeAddLocation,
    updateLocation: storeUpdateLocation,
    addNPC: storeAddNPC,
    updateNPC: storeUpdateNPC,
    addJournalEntry: storeAddJournalEntry,
    updateJournalEntry: storeUpdateJournalEntry,
    deleteJournalEntry: storeDeleteJournalEntry,
    clearError: storeClearError,
  } = useCampaignStore()

  const { characters, getCharacter } = useCharacterStore()

  // Current campaign
  const currentCampaign = useMemo(() => {
    if (!activeCampaignId)
      return null
    return campaigns.find(c => c.id === activeCampaignId) || null
  }, [campaigns, activeCampaignId])

  const isActiveCampaign = useMemo(() => currentCampaign !== null, [currentCampaign])

  // Campaign lists
  const allCampaigns = useMemo(() => campaigns, [campaigns])

  const recentCampaigns = useMemo(() => {
    return campaigns
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [campaigns])

  // Character management
  const campaignCharacters = useMemo((): CampaignCharacter[] => {
    if (!currentCampaign)
      return []

    return currentCampaign.characterIds.map((characterId) => {
      const character = getCharacter(characterId)
      if (!character) {
        return {
          id: characterId,
          name: 'Unknown Character',
          class: 'Unknown',
          level: 1,
          player: 'Unknown',
          isActive: false,
          lastPlayed: new Date(),
        }
      }

      return {
        id: character.id,
        name: character.name,
        class: character.class,
        level: character.level,
        player: character.player || 'Unknown',
        isActive: true,
        lastPlayed: character.updatedAt,
      }
    })
  }, [currentCampaign, getCharacter])

  // World data
  const locations = useMemo(() => currentCampaign?.locations || [], [currentCampaign])
  const npcs = useMemo(() => currentCampaign?.npcs || [], [currentCampaign])
  const journalEntries = useMemo(() => currentCampaign?.journalEntries || [], [currentCampaign])
  const campaignSessions = useMemo(() => currentCampaign?.sessions || [], [currentCampaign])

  // Campaign statistics
  const campaignStats = useMemo((): CampaignStats => {
    if (!currentCampaign) {
      return {
        totalSessions: 0,
        totalPlayTime: 0,
        averageSessionLength: 0,
        totalXPAwarded: 0,
        charactersCreated: 0,
        locationsVisited: 0,
        npcsEncountered: 0,
      }
    }

    const sessions = currentCampaign.sessions
    const totalSessions = sessions.length
    const totalPlayTime = sessions.reduce((total, session) => {
      if (session.endTime) {
        return total + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime())
      }
      return total
    }, 0)
    const averageSessionLength = totalSessions > 0 ? totalPlayTime / totalSessions : 0
    const totalXPAwarded = sessions.reduce((total, session) => total + (session.xpAwarded || 0), 0)

    return {
      totalSessions,
      totalPlayTime,
      averageSessionLength,
      totalXPAwarded,
      charactersCreated: currentCampaign.characterIds.length,
      locationsVisited: currentCampaign.locations.length,
      npcsEncountered: currentCampaign.npcs.length,
    }
  }, [currentCampaign])

  // Campaign management
  const createCampaign = useCallback((campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    return storeCreateCampaign(campaignData)
  }, [storeCreateCampaign])

  const updateCampaign = useCallback((updates: Partial<Campaign>) => {
    if (!currentCampaign)
      return
    storeUpdateCampaign(currentCampaign.id, updates)
  }, [currentCampaign, storeUpdateCampaign])

  const deleteCampaign = useCallback((campaignId: string) => {
    storeDeleteCampaign(campaignId)
  }, [storeDeleteCampaign])

  const setActiveCampaign = useCallback((campaignId: string | null) => {
    storeSetActiveCampaign(campaignId)
  }, [storeSetActiveCampaign])

  // Character management
  const addCharacterToCampaign = useCallback((characterId: string) => {
    if (!currentCampaign)
      return
    storeAddCharacterToCampaign(currentCampaign.id, characterId)
  }, [currentCampaign, storeAddCharacterToCampaign])

  const removeCharacterFromCampaign = useCallback((characterId: string) => {
    if (!currentCampaign)
      return
    storeRemoveCharacterFromCampaign(currentCampaign.id, characterId)
  }, [currentCampaign, storeRemoveCharacterFromCampaign])

  const getCharacterCampaigns = useCallback((characterId: string) => {
    return campaigns.filter(campaign => campaign.characterIds.includes(characterId))
  }, [campaigns])

  // Session management
  const startCampaignSession = useCallback((name: string, characterIds: string[]) => {
    if (!currentCampaign)
      return

    const session: CampaignSession = {
      id: `session-${Date.now()}`,
      name,
      startTime: new Date(),
      characterIds,
      notes: '',
      xpAwarded: 0,
    }

    const updatedSessions = [...currentCampaign.sessions, session]
    updateCampaign({ sessions: updatedSessions })
  }, [currentCampaign, updateCampaign])

  const endCampaignSession = useCallback(() => {
    if (!currentCampaign || currentCampaign.sessions.length === 0)
      return

    const lastSession = currentCampaign.sessions[currentCampaign.sessions.length - 1]
    if (lastSession.endTime)
      return // Already ended

    const updatedSession = {
      ...lastSession,
      endTime: new Date(),
    }

    const updatedSessions = [
      ...currentCampaign.sessions.slice(0, -1),
      updatedSession,
    ]

    updateCampaign({ sessions: updatedSessions })
  }, [currentCampaign, updateCampaign])

  const getSessionHistory = useCallback(() => {
    return campaignSessions.sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
  }, [campaignSessions])

  // World management
  const addLocation = useCallback((location: Omit<Location, 'id'>) => {
    if (!currentCampaign)
      return
    storeAddLocation(currentCampaign.id, location)
  }, [currentCampaign, storeAddLocation])

  const updateLocation = useCallback((locationId: string, updates: Partial<Location>) => {
    if (!currentCampaign)
      return
    storeUpdateLocation(currentCampaign.id, locationId, updates)
  }, [currentCampaign, storeUpdateLocation])

  const addNPC = useCallback((npc: Omit<NPC, 'id'>) => {
    if (!currentCampaign)
      return
    storeAddNPC(currentCampaign.id, npc)
  }, [currentCampaign, storeAddNPC])

  const updateNPC = useCallback((npcId: string, updates: Partial<NPC>) => {
    if (!currentCampaign)
      return
    storeUpdateNPC(currentCampaign.id, npcId, updates)
  }, [currentCampaign, storeUpdateNPC])

  // Journal management
  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    if (!currentCampaign)
      return
    storeAddJournalEntry(currentCampaign.id, entry)
  }, [currentCampaign, storeAddJournalEntry])

  const updateJournalEntry = useCallback((entryId: string, updates: Partial<JournalEntry>) => {
    if (!currentCampaign)
      return
    storeUpdateJournalEntry(currentCampaign.id, entryId, updates)
  }, [currentCampaign, storeUpdateJournalEntry])

  const deleteJournalEntry = useCallback((entryId: string) => {
    if (!currentCampaign)
      return
    storeDeleteJournalEntry(currentCampaign.id, entryId)
  }, [currentCampaign, storeDeleteJournalEntry])

  const searchJournal = useCallback((query: string) => {
    return journalEntries.filter(entry =>
      entry.title.toLowerCase().includes(query.toLowerCase())
      || entry.content.toLowerCase().includes(query.toLowerCase())
      || entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())),
    )
  }, [journalEntries])

  // Import/Export
  const exportCampaign = useCallback(() => {
    if (!currentCampaign)
      return ''
    return campaignService.exportCampaign(currentCampaign)
  }, [currentCampaign])

  const importCampaign = useCallback((campaignData: string) => {
    const campaign = campaignService.importCampaign(campaignData)
    return storeCreateCampaign(campaign)
  }, [storeCreateCampaign])

  return {
    // Current campaign
    currentCampaign,
    isActiveCampaign,

    // Campaign management
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setActiveCampaign,

    // Campaign list
    allCampaigns,
    recentCampaigns,

    // Character management
    campaignCharacters,
    addCharacterToCampaign,
    removeCharacterFromCampaign,
    getCharacterCampaigns,

    // Session management
    campaignSessions,
    startCampaignSession,
    endCampaignSession,
    getSessionHistory,

    // World management
    locations,
    npcs,
    addLocation,
    updateLocation,
    addNPC,
    updateNPC,

    // Journal management
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    searchJournal,

    // Campaign statistics
    campaignStats,

    // Import/Export
    exportCampaign,
    importCampaign,

    // Utility
    isLoading,
    error,
    clearError: storeClearError,
  }
}

/**
 * Simplified campaign hook for basic campaign operations
 */
export function useSimpleCampaign() {
  const {
    currentCampaign,
    isActiveCampaign,
    setActiveCampaign,
    campaignCharacters,
    campaignStats,
  } = useCampaign()

  return {
    campaign: currentCampaign,
    isActive: isActiveCampaign,
    setActive: setActiveCampaign,
    characters: campaignCharacters,
    stats: campaignStats,
  }
}
