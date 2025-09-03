/**
 * Event-based API for panel communication
 */

export type PanelEventHandler = (data: any) => void

export interface PanelEvent {
  source: string
  target?: string
  type: string
  data: unknown
  timestamp: number
}

/**
 * Central event bus for panel communication
 */
export class PanelEventBus {
  private static instance: PanelEventBus
  private handlers: Map <string, Set <PanelEventHandler>> = new Map()
  private eventLog: PanelEvent[] = []
  private maxLogSize = 100

  private constructor() {}

  static getInstance(): PanelEventBus {
    if (!PanelEventBus.instance) {
      PanelEventBus.instance = new PanelEventBus()
    }
    return PanelEventBus.instance
  }

  /**
   * Emit an event to all listeners or a specific target
   */
  emit(source: string, type: string, data: unknown, target?: string): void {
    const event: PanelEvent = {
      source,
      target,
      type,
      data,
      timestamp: Date.now(),
    }

    // Log the event
    this.logEvent(event)

    // If target is specified, create a targeted event key
    const eventKeys = target
      ? [`${target}:${type}`, type] // Listen to both targeted and general events
      : [type]

    for (const key of eventKeys) {
      const handlers = this.handlers.get(key)
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(event)
          }
          catch (error) {
            console.error('Event handler error:', error)
          }
        }
      }
    }
  }

  /**
   * Subscribe to events
   */
  on(type: string, handler: PanelEventHandler, targetPanel?: string): () => void {
    const key = targetPanel ? `${targetPanel}:${type}` : type

    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set())
    }

    this.handlers.get(key)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(key)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.handlers.delete(key)
        }
      }
    }
  }

  /**
   * Subscribe to events for one-time execution
   */
  once(type: string, handler: PanelEventHandler, targetPanel?: string): () => void {
    const wrappedHandler: PanelEventHandler = (data) => {
      handler(data)
      unsubscribe()
    }
    const unsubscribe = this.on(type, wrappedHandler, targetPanel)
    return unsubscribe
  }

  /**
   * Remove all handlers for a specific event type
   */
  off(type: string, targetPanel?: string): void {
    const key = targetPanel ? `${targetPanel}:${type}` : type
    this.handlers.delete(key)
  }

  /**
   * Get recent event log
   */
  getEventLog(): PanelEvent[] {
    return [...this.eventLog]
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = []
  }

  private logEvent(event: PanelEvent): void {
    this.eventLog.push(event)
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift()
    }
  }
}

/**
 * Panel API for simplified panel communication
 */
export class PanelAPI {
  constructor(private panelId: string) {}

  /**
   * Send a message to another panel or broadcast
   */
  send(type: string, data: unknown, targetPanel?: string): void {
    panelEventBus.emit(this.panelId, type, data, targetPanel)
  }

  /**
   * Listen for messages
   */
  listen(type: string, handler: PanelEventHandler): () => void {
    return panelEventBus.on(type, handler, this.panelId)
  }

  /**
   * Listen for messages once
   */
  listenOnce(type: string, handler: PanelEventHandler): () => void {
    return panelEventBus.once(type, handler, this.panelId)
  }

  /**
   * Request data from another panel
   */
  async request <T = unknown>(targetPanel: string, type: string, data?: any): Promise <T> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).slice(2, 11)
      const responseType = `${type}:response:${requestId}`

      // Set up timeout
      const timeout = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Request to ${targetPanel} timed out`))
      }, 5000)

      // Listen for response
      const unsubscribe = this.listenOnce(responseType, (event: MessageEvent) => {
        clearTimeout(timeout)
        if (event.data?.error) {
          reject(new Error(event.data.error))
        }
        else {
          resolve(event.data?.result)
        }
      })

      // Send request
      this.send(`${type}:request`, { ...(data as Record<string, unknown>), requestId }, targetPanel)
    })
  }

  /**
   * Respond to requests from other panels
   */
  handleRequests(type: string, handler: (data: any) => unknown | Promise <unknown>): () => void {
    return this.listen(`${type}:request`, async (event: MessageEvent) => {
      const { requestId, ...requestData } = event.data || {}
      const responseType = `${type}:response:${requestId}`

      try {
        const result = await handler(requestData)
        panelEventBus.emit(this.panelId, responseType, { result }, event.source)
      }
      catch (error) {
        panelEventBus.emit(
          this.panelId,
          responseType,
          { error: error instanceof Error ? error.message : 'Unknown error' },
          event.source,
        )
      }
    })
  }
}

// Export singleton event bus
export const panelEventBus = PanelEventBus.getInstance()

// Factory function to create panel API
export function createPanelAPI(panelId: string): PanelAPI {
  return new PanelAPI(panelId)
}
