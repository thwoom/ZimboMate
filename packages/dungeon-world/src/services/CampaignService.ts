/**
 * Campaign service for local-only campaign management * Handles CRUD operations for campaigns, sessions, journal entries, NPCs, and locations
 */

import { Campaign, CampaignSession, createCampaign, createJournalEntry, createLocation,createNPC, createSession, JournalEntry, Location, NPC } from '../models/Campaign';

export class CampaignService {
  private campaigns: Map < string, Campaign> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  // Campaign Management
  createCampaign(name: string, description?: string): Campaign {
    const campaign = createCampaign(name, description);
    this.campaigns.set(campaign.id, campaign);
    this.saveToStorage();
    return campaign;
  }

  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  getAllCampaigns(): Campaign[] {
    return [...this.campaigns.values()];
  }

  updateCampaign(id: string, updates: Partial < Campaign>): Campaign | undefined {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updated = {
      ...campaign,
      ...updates,
      lastModified: new Date(),
    };

    this.campaigns.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  deleteCampaign(id: string): boolean {
    const deleted = this.campaigns.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Session Management
  addSession(campaignId: string, title: string, summary: string): CampaignSession | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const session = createSession(title, summary);
    const updated = {
      ...campaign,
      sessions: [...campaign.sessions, session],
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return session;
  }

  updateSession(campaignId: string, sessionId: string, updates: Partial < CampaignSession>): CampaignSession | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const sessionIndex = campaign.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return undefined;

    const updatedSession =  { ...campaign.sessions[sessionIndex], ...updates };
    const updatedSessions =  [...campaign.sessions];
    updatedSessions[sessionIndex] = updatedSession;

    const updated = {
      ...campaign,
      sessions: updatedSessions,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return updatedSession;
  }

  deleteSession(campaignId: string, sessionId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedSessions = campaign.sessions.filter(s => s.id !== sessionId);
    const updated = {
      ...campaign,
      sessions: updatedSessions,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return true;
  }

  // Journal Management
  addJournalEntry(campaignId: string, title: string, content: string): JournalEntry | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const entry = createJournalEntry(title, content);
    const updated = {
      ...campaign,
      journal: [...campaign.journal, entry],
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return entry;
  }

  updateJournalEntry(campaignId: string, entryId: string, updates: Partial < JournalEntry>): JournalEntry | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const entryIndex = campaign.journal.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return undefined;

    const updatedEntry = { ...campaign.journal[entryIndex], ...updates };
    const updatedJournal =  [...campaign.journal];
    updatedJournal[entryIndex] = updatedEntry;

    const updated = {
      ...campaign,
      journal: updatedJournal,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return updatedEntry;
  }

  deleteJournalEntry(campaignId: string, entryId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedJournal = campaign.journal.filter(e => e.id !== entryId);
    const updated = {
      ...campaign,
      journal: updatedJournal,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return true;
  }

  // NPC Management
  addNPC(campaignId: string, name: string, description: string, role: string): NPC | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const npc = createNPC(name, description, role);
    const updated = {
      ...campaign,
      npcs: [...campaign.npcs, npc],
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return npc;
  }

  updateNPC(campaignId: string, npcId: string, updates: Partial < NPC>): NPC | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const npcIndex = campaign.npcs.findIndex(n => n.id === npcId);
    if (npcIndex === -1) return undefined;

    const updatedNPC =  { ...campaign.npcs[npcIndex], ...updates };
    const updatedNPCs =  [...campaign.npcs];
    updatedNPCs[npcIndex] = updatedNPC;

    const updated = {
      ...campaign,
      npcs: updatedNPCs,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return updatedNPC;
  }

  deleteNPC(campaignId: string, npcId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedNPCs = campaign.npcs.filter(n => n.id !== npcId);
    const updated = {
      ...campaign,
      npcs: updatedNPCs,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return true;
  }

  // Location Management
  addLocation(campaignId: string, name: string, description: string, type: Location['type']): Location | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const location = createLocation(name, description, type);
    const updated = {
      ...campaign,
      locations: [...campaign.locations, location],
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return location;
  }

  updateLocation(campaignId: string, locationId: string, updates: Partial < Location>): Location | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    const locationIndex = campaign.locations.findIndex(l => l.id === locationId);
    if (locationIndex === -1) return undefined;

    const updatedLocation =  { ...campaign.locations[locationIndex], ...updates };
    const updatedLocations =  [...campaign.locations];
    updatedLocations[locationIndex] = updatedLocation;

    const updated = {
      ...campaign,
      locations: updatedLocations,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return updatedLocation;
  }

  deleteLocation(campaignId: string, locationId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedLocations = campaign.locations.filter(l => l.id !== locationId);
    const updated = {
      ...campaign,
      locations: updatedLocations,
      lastModified: new Date(),
    };

    this.campaigns.set(campaignId, updated);
    this.saveToStorage();
    return true;
  }

  // Search functionality
  searchCampaign(campaignId: string, query: string): {
    sessions: CampaignSession[];
    journal: JournalEntry[];
    npcs: NPC[];
    locations: Location[];
  } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return { sessions: [], journal: [], npcs: [], locations: [] };

    const lowerQuery = query.toLowerCase();

    const sessions = campaign.sessions.filter(s =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.summary.toLowerCase().includes(lowerQuery) ||
      s.notes.toLowerCase().includes(lowerQuery),
    );

    const journal = campaign.journal.filter(e =>
      e.title.toLowerCase().includes(lowerQuery) ||
      e.content.toLowerCase().includes(lowerQuery) ||
      e.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
    );

    const npcs = campaign.npcs.filter(n =>
      n.name.toLowerCase().includes(lowerQuery) ||
      n.description.toLowerCase().includes(lowerQuery) ||
      n.role.toLowerCase().includes(lowerQuery) ||
      n.notes.toLowerCase().includes(lowerQuery),
    );

    const locations = campaign.locations.filter(l =>
      l.name.toLowerCase().includes(lowerQuery) ||
      l.description.toLowerCase().includes(lowerQuery) ||
      l.notes.toLowerCase().includes(lowerQuery),
    );

    return { sessions, journal, npcs, locations };
  }

  // Export / Import functionality
  exportCampaign(campaignId: string): string {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    return JSON.stringify(campaign, null, 2);
  }

  importCampaign(campaignData: string): Campaign {
    try {
      const campaign = JSON.parse(campaignData) as Campaign;

      // Validate required fields
      if (!campaign.id || !campaign.name) {
        throw new Error('Invalid campaign data: missing required fields');
      }

      // Update timestamps
      campaign.lastModified = new Date();

      this.campaigns.set(campaign.id, campaign);
      this.saveToStorage();
      return campaign;
    } catch {
      throw new Error(`Failed to import campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Local storage persistence
  private saveToStorage(): void {
    try {
      const data = [...this.campaigns.entries()];
      localStorage.setItem('campaigns', JSON.stringify(data));
    } catch {
      }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('campaigns');
      if (data) {
        const campaigns = JSON.parse(data) as [string, Campaign][];
        this.campaigns = new Map(campaigns);
      }
    } catch {
      this.campaigns = new Map();
    }
  }
}

// Export singleton instance
export const campaignService = new CampaignService();



