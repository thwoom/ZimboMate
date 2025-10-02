import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { logger } from '../utils/logger'

export type CampaignVibe = 'fantasy' | 'scifi' | 'cyberpunk' | 'horror' | 'western' | 'modern'

interface CharacterActionPayloads {
  apply_debility: { debility: string, reason: string }
  modify_hp: { change: number, reason: string }
  add_gear: {
    name: string
    description: string
    tags?: string[]
    weight?: number
    uses?: number
  }
  spend_resource: { resource: string, amount: number, reason: string }
  gain_xp: {
    amount: number
    trigger: 'failure' | 'alignment' | 'end_session' | 'discovery'
    description: string
  }
  update_bonds: { character: string, new_bond: string, action: 'create' | 'resolve' | 'update' }
}

export type CharacterActionType = keyof CharacterActionPayloads

export type CharacterAction = {
  [Type in CharacterActionType]: { type: Type, params: CharacterActionPayloads[Type] }
}[CharacterActionType]

export interface EnhancementResult {
  enhancedText: string
  actions: CharacterAction[]
}

export interface AIProgress {
  progress: number
  text: string
  time_remaining?: string
  stage: string
}

/**
 * Thin wrapper around the Tauri-powered ChatGPT integration.
 * Handles initialization, progress relaying, and note enhancement calls.
 */
export class ChatGPTNoteEnhancer {
  private ready = false
  private initializationPromise?: Promise<void>
  public onProgress?: (progress: AIProgress) => void
  private progressUnlisten?: () => Promise<void>
  private model: string

  constructor(defaultModel = 'gpt-5-chat-latest') {
    this.model = defaultModel
    void this.setupProgressListener()
  }

  private async setupProgressListener() {
    if (this.progressUnlisten)
      return

    try {
      this.progressUnlisten = await listen<AIProgress>('llm_progress', (event) => {
        logger.info('[ChatGPT] Progress update', event.payload)
        this.onProgress?.(event.payload)
      })
    }
    catch (error) {
      logger.error('Failed to set up LLM progress listener', error)
    }
  }

  private async checkServiceStatus(model?: string): Promise<void> {
    await invoke('check_llm_status', { modelName: model ?? this.model })
  }

  async initialize(modelName?: string): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.performInitialization(modelName)
    return this.initializationPromise
  }

  private async performInitialization(modelName?: string): Promise<void> {
    const targetModel = modelName ?? this.model

    logger.info(`[ChatGPT] Initializing note enhancer (model: ${targetModel})`)

    try {
      await this.checkServiceStatus(targetModel)
    }
    catch (error) {
      this.ready = false
      const message = error instanceof Error ? error.message : String(error)
      logger.error('ChatGPT status check failed', { error, targetModel })
      throw new Error(`ChatGPT Responses API check failed for ${targetModel}: ${message}`)
    }

    try {
      await invoke('initialize_llm', { modelName: targetModel })
      this.ready = true
      this.model = targetModel
      logger.info(`[ChatGPT] Note enhancer ready with ${targetModel}`)
    }
    catch (error) {
      this.ready = false
      logger.error('Failed to initialize ChatGPT note enhancer', error)
      throw error
    }
  }

  async enhance(note: string, vibe: CampaignVibe = 'fantasy'): Promise<EnhancementResult> {
    if (!this.ready) {
      throw new Error('ChatGPT is not ready - call initialize() before requesting enhancements.')
    }

    logger.info(`[ChatGPT] Enhancing note (${vibe} vibe)`, note)
    const start = performance.now()

    try {
      const result = await invoke<EnhancementResult>('enhance_note', { note, vibe })
      const durationMs = (performance.now() - start).toFixed(1)

      logger.info('[ChatGPT] Enhancement complete', {
        originalLength: note.length,
        enhancedLength: result.enhancedText.length,
        actions: result.actions.length,
        durationMs,
      })

      if (result.enhancedText.trim() === note.trim()) {
        logger.warn('[ChatGPT] Response matched the original text; consider using the pattern fallback')
      }

      return result
    }
    catch (error) {
      const durationMs = (performance.now() - start).toFixed(1)
      logger.error('[ChatGPT] Enhancement failed', { error, note, vibe, durationMs })
      throw error
    }
  }

  async isInitialized(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_llm_ready')
    }
    catch (error) {
      logger.error('Failed to query ChatGPT readiness', error)
      return false
    }
  }

  isReady(): boolean {
    return this.ready
  }

  async dispose(): Promise<void> {
    if (this.progressUnlisten) {
      try {
        await this.progressUnlisten()
      }
      catch (error) {
        logger.warn('Failed to remove LLM progress listener', error)
      }
      this.progressUnlisten = undefined
    }

    this.ready = false
    this.initializationPromise = undefined
    logger.info('[ChatGPT] Note enhancer disposed')
  }
}
