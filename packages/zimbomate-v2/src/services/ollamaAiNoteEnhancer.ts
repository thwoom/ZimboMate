import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export type CampaignVibe = 'fantasy' | 'scifi' | 'cyberpunk' | 'horror' | 'western' | 'modern';

export interface CharacterAction {
  type: 'apply_debility' | 'modify_hp' | 'add_gear' | 'spend_resource' | 'gain_xp' | 'update_bonds';
  params: any;
}

export interface EnhancementResult {
  enhanced_text: string;
  actions: CharacterAction[];
}

export interface AIProgress {
  progress: number; // 0-100
  text: string;
  time_remaining?: string;
  stage: string; // "downloading", "loading", "ready", "error"
}

export interface ModelInfo {
  name: string;
  size_gb: number;
  is_available: boolean;
  is_loaded: boolean;
}

export class OllamaAiNoteEnhancer {
  private ready = false;
  private initializationPromise?: Promise<void>;
  public onProgress?: (progress: AIProgress) => void;
  private currentModel = 'calebfahlgren/natural-functions';
  private progressListener?: () => Promise<void>;

  constructor() {
    // Set up progress event listener
    this.setupProgressListener();
  }

  private async setupProgressListener() {
    if (this.progressListener) return;

    try {
      this.progressListener = await listen<AIProgress>('llm_progress', (event) => {
        console.log('📊 LLM Progress:', event.payload);
        if (this.onProgress) {
          this.onProgress(event.payload);
        }
      });
    } catch (error) {
      console.error('Failed to set up progress listener:', error);
    }
  }

  async checkOllamaStatus(): Promise<boolean> {
    try {
      return await invoke<boolean>('check_ollama_status');
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      return await invoke<ModelInfo[]>('list_models');
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  async ensureModel(modelName: string): Promise<void> {
    try {
      await invoke('ensure_model', { modelName });
    } catch (error) {
      console.error('Failed to ensure model:', error);
      throw new Error(`Failed to ensure model ${modelName}: ${error}`);
    }
  }

  async initialize(modelName?: string): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.doInitialize(modelName);
    return this.initializationPromise;
  }

  private async doInitialize(modelName?: string): Promise<void> {
    const model = modelName || this.currentModel;

    try {
      console.log(`🚀 Initializing AI with model: ${model}`);

      // Check if Ollama is running
      const ollamaStatus = await this.checkOllamaStatus();
      if (!ollamaStatus) {
        throw new Error('Ollama is not running. Please start Ollama first.');
      }

      // Initialize the LLM service
      await invoke('initialize_llm', { modelName: model });

      this.ready = true;
      this.currentModel = model;

      console.log(`✅ AI Note Enhancer ready with ${model}!`);
    } catch (error) {
      console.error('❌ Failed to initialize AI Note Enhancer:', error);
      this.ready = false;
      throw error;
    }
  }

  async enhance(note: string, vibe: CampaignVibe = 'fantasy'): Promise<EnhancementResult> {
    if (!this.ready) {
      throw new Error('AI not ready - call initialize() first');
    }

    console.log(`🎭 Enhancing note with ${vibe} vibe:`, note);
    const startTime = Date.now();

    try {
      const result = await invoke<EnhancementResult>('enhance_note', {
        note,
        vibe,
      });

      const processingTime = Date.now() - startTime;
      console.log(`⚡ AI processing completed in ${processingTime}ms`);

      console.log('📝 Enhancement result:', {
        originalLength: note.length,
        enhancedLength: result.enhanced_text.length,
        actionsCount: result.actions.length,
        processingTime: `${processingTime}ms`,
      });

      // Validate that narrative was actually enhanced
      if (result.enhanced_text.trim() === note.trim()) {
        console.warn('⚠️ AI returned unchanged text - narrative enhancement may have failed');
      }

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ AI enhancement failed:', {
        error,
        note,
        vibe,
        processingTime: `${processingTime}ms`,
      });
      throw error;
    }
  }

  async isInitialized(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_llm_ready');
    } catch (error) {
      console.error('Failed to check if LLM is ready:', error);
      return false;
    }
  }

  // Legacy method for compatibility with existing code
  isReady(): boolean {
    return this.ready;
  }

  async dispose(): Promise<void> {
    // Clean up progress listener
    if (this.progressListener) {
      // Note: In Tauri 2.0, the unlisten function might be called differently
      // This is a placeholder - adjust based on actual Tauri API
      try {
        // this.progressListener(); // Call to unlisten
      } catch (error) {
        console.warn('Failed to clean up progress listener:', error);
      }
    }

    this.ready = false;
    this.initializationPromise = undefined;
    console.log('🧹 AI Note Enhancer disposed');
  }

  // Utility method to get available models with their status
  async getAvailableModels(): Promise<ModelInfo[]> {
    return this.listModels();
  }

  // Method to switch models if needed
  async switchModel(modelName: string): Promise<void> {
    this.ready = false;
    this.initializationPromise = undefined;
    this.currentModel = modelName;

    await this.initialize(modelName);
  }

  getCurrentModel(): string {
    return this.currentModel;
  }
}