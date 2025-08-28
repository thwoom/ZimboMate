/**
 * Data persistence service for saving and loading game state
 */

import { 
  GameState, 
  validateGameState, 
  migrateGameState,
  exportGameState,
  importGameState
} from '../models/GameState';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_SAVE: 'dungeonworld_save',
  SAVE_DATE: 'dungeonworld_save_date',
  AUTOSAVES: 'dungeonworld_autosaves',
  SETTINGS: 'dungeonworld_settings',
  BACKUP_PREFIX: 'dungeonworld_backup_'
};

// Save slot types
export interface SaveSlot {
  id: string;
  name: string;
  timestamp: Date;
  characterName?: string;
  characterLevel?: number;
  playTime?: number; // milliseconds
}

// Save metadata
export interface SaveMetadata {
  slots: SaveSlot[];
  lastSaveId: string | null;
  autoSaveId: string | null;
}

/**
 * Data persistence service
 */
export class DataPersistenceService {
  private static instance: DataPersistenceService;

  private constructor() {}

  static getInstance(): DataPersistenceService {
    if (!DataPersistenceService.instance) {
      DataPersistenceService.instance = new DataPersistenceService();
    }
    return DataPersistenceService.instance;
  }

  /**
   * Save game state to a specific slot
   */
  async saveGame(state: GameState, slotId?: string, slotName?: string): Promise<string> {
    try {
      const id = slotId || this.generateSaveId();
      const saveData = {
        ...state,
        saveId: id,
        saveDate: new Date().toISOString()
      };

      // Save to localStorage
      const key = `${STORAGE_KEYS.CURRENT_SAVE}_${id}`;
      localStorage.setItem(key, JSON.stringify(saveData));

      // Update metadata
      await this.updateSaveMetadata(id, slotName || 'Save', state);

      console.log(`Game saved to slot ${id}`);
      return id;
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game');
    }
  }

  /**
   * Load game state from a specific slot
   */
  async loadGame(slotId: string): Promise<GameState | null> {
    try {
      const key = `${STORAGE_KEYS.CURRENT_SAVE}_${slotId}`;
      const saveData = localStorage.getItem(key);
      
      if (!saveData) {
        console.log(`No save found for slot ${slotId}`);
        return null;
      }

      const parsedData = JSON.parse(saveData);
      
      // Validate the save data
      if (!validateGameState(parsedData)) {
        console.error('Invalid save data format');
        return null;
      }

      // Migrate if needed
      const state = migrateGameState(parsedData, parsedData.version);
      
      console.log(`Game loaded from slot ${slotId}`);
      return state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Quick save (overwrite current slot)
   */
  async quickSave(state: GameState): Promise<void> {
    const metadata = await this.getSaveMetadata();
    const slotId = metadata.lastSaveId || this.generateSaveId();
    await this.saveGame(state, slotId, 'Quick Save');
  }

  /**
   * Auto save
   */
  async autoSave(state: GameState): Promise<void> {
    const metadata = await this.getSaveMetadata();
    const slotId = metadata.autoSaveId || this.generateSaveId();
    await this.saveGame(state, slotId, 'Auto Save');
    
    // Update metadata to mark this as auto save
    metadata.autoSaveId = slotId;
    await this.setSaveMetadata(metadata);
  }

  /**
   * Get all save slots
   */
  async getSaveSlots(): Promise<SaveSlot[]> {
    const metadata = await this.getSaveMetadata();
    return metadata.slots.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Delete a save slot
   */
  async deleteSaveSlot(slotId: string): Promise<void> {
    try {
      // Remove save data
      const key = `${STORAGE_KEYS.CURRENT_SAVE}_${slotId}`;
      localStorage.removeItem(key);

      // Update metadata
      const metadata = await this.getSaveMetadata();
      metadata.slots = metadata.slots.filter(slot => slot.id !== slotId);
      
      if (metadata.lastSaveId === slotId) {
        metadata.lastSaveId = null;
      }
      if (metadata.autoSaveId === slotId) {
        metadata.autoSaveId = null;
      }
      
      await this.setSaveMetadata(metadata);
      
      console.log(`Deleted save slot ${slotId}`);
    } catch (error) {
      console.error('Failed to delete save slot:', error);
      throw new Error('Failed to delete save slot');
    }
  }

  /**
   * Export save to file
   */
  async exportSave(state: GameState, filename?: string): Promise<void> {
    try {
      const exportData = exportGameState(state);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `dungeonworld_save_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Save exported successfully');
    } catch (error) {
      console.error('Failed to export save:', error);
      throw new Error('Failed to export save');
    }
  }

  /**
   * Import save from file
   */
  async importSave(file: File): Promise<GameState | null> {
    try {
      const text = await file.text();
      const state = importGameState(text);
      
      if (!state) {
        throw new Error('Invalid save file');
      }
      
      // Save imported state to a new slot
      const slotId = this.generateSaveId();
      await this.saveGame(state, slotId, `Imported: ${file.name}`);
      
      console.log('Save imported successfully');
      return state;
    } catch (error) {
      console.error('Failed to import save:', error);
      throw new Error('Failed to import save');
    }
  }

  /**
   * Create backup
   */
  async createBackup(state: GameState): Promise<string> {
    const backupId = `${STORAGE_KEYS.BACKUP_PREFIX}${Date.now()}`;
    localStorage.setItem(backupId, JSON.stringify(state));
    
    // Keep only last 5 backups
    this.cleanupOldBackups(5);
    
    return backupId;
  }

  /**
   * Clear all save data
   */
  async clearAllSaves(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('dungeonworld_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('All save data cleared');
  }

  // Private helper methods

  private generateSaveId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async getSaveMetadata(): Promise<SaveMetadata> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTOSAVES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load save metadata:', error);
    }
    
    return {
      slots: [],
      lastSaveId: null,
      autoSaveId: null
    };
  }

  private async setSaveMetadata(metadata: SaveMetadata): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.AUTOSAVES, JSON.stringify(metadata));
  }

  private async updateSaveMetadata(
    slotId: string, 
    slotName: string, 
    state: GameState
  ): Promise<void> {
    const metadata = await this.getSaveMetadata();
    
    // Remove existing slot if it exists
    metadata.slots = metadata.slots.filter(slot => slot.id !== slotId);
    
    // Add new slot
    metadata.slots.push({
      id: slotId,
      name: slotName,
      timestamp: new Date(),
      characterName: state.activeCharacterId ? state.characters[state.activeCharacterId]?.name : undefined,
      characterLevel: state.activeCharacterId ? state.characters[state.activeCharacterId]?.level : undefined,
      playTime: state.session ? 
        new Date().getTime() - new Date(state.session.startTime).getTime() : 
        undefined
    });
    
    // Update last save
    metadata.lastSaveId = slotId;
    
    await this.setSaveMetadata(metadata);
  }

  private cleanupOldBackups(keepCount: number): void {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEYS.BACKUP_PREFIX))
      .sort((a, b) => b.localeCompare(a)); // Sort newest first
    
    // Remove old backups
    backupKeys.slice(keepCount).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const dataPersistence = DataPersistenceService.getInstance();
