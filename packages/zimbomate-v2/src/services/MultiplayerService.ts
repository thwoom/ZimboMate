/**
 * MultiplayerService - WebSocket connection management and real-time synchronization
 * Handles session management, player coordination, and state synchronization
 */

export interface Player {
  id: string
  name: string
  characterId?: string
  isHost: boolean
  isConnected: boolean
  lastSeen: Date
  avatar?: string
}

export interface GameSession {
  id: string
  name: string
  hostId: string
  players: Player[]
  isActive: boolean
  createdAt: Date
  settings: SessionSettings
}

export interface SessionSettings {
  maxPlayers: number
  allowSpectators: boolean
  shareRolls: boolean
  syncCharacters: boolean
  requireApproval: boolean
}

export interface MultiplayerEvent {
  type: string
  playerId: string
  sessionId: string
  data: any
  timestamp: Date
}

export interface DiceRollEvent {
  rollId: string
  playerId: string
  playerName: string
  dice: number[]
  modifier: number
  total: number
  moveId?: string
  moveName?: string
  timestamp: Date
}

class MultiplayerService {
  private eventTarget: EventTarget
  private ws: WebSocket | null = null
  private currentSession: GameSession | null = null
  private currentPlayer: Player | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.eventTarget = new EventTarget()
    this.setupEventHandlers()
  }

  // EventEmitter-like interface using EventTarget
  on(type: string, callback: (event: any) => void) {
    this.eventTarget.addEventListener(type, callback as EventListener)
  }

  off(type: string, callback: (event: any) => void) {
    this.eventTarget.removeEventListener(type, callback as EventListener)
  }

  once(type: string, callback: (event: any) => void) {
    const onceCallback = (event: any) => {
      callback(event)
      this.off(type, onceCallback)
    }
    this.on(type, onceCallback)
  }

  emit(type: string, detail?: any) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }))
  }

  private setupEventHandlers() {
    this.on('connection_lost', this.handleConnectionLost.bind(this))
    this.on('reconnected', this.handleReconnected.bind(this))
  }

  // Connection Management
  async connect(serverUrl: string = 'ws://localhost:8080'): Promise<boolean> {
    try {
      this.ws = new WebSocket(serverUrl)
      
      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('Failed to create WebSocket'))
          return
        }

        this.ws.onopen = () => {
          console.log('Connected to multiplayer server')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = (event) => {
          console.log('Disconnected from multiplayer server', event.code, event.reason)
          this.stopHeartbeat()
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          if (event.code !== 1000) { // Not a normal closure
            this.handleConnectionLost()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)
      })
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected')
      this.ws = null
    }
    this.stopHeartbeat()
    this.currentSession = null
    this.currentPlayer = null
  }

  private handleConnectionLost() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('connection_failed')
    }
  }

  private handleReconnected() {
    // Rejoin session if we were in one
    if (this.currentSession && this.currentPlayer) {
      this.joinSession(this.currentSession.id, this.currentPlayer.name)
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', {})
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Session Management
  async createSession(sessionName: string, playerName: string, settings: Partial<SessionSettings> = {}): Promise<GameSession> {
    const defaultSettings: SessionSettings = {
      maxPlayers: 6,
      allowSpectators: true,
      shareRolls: true,
      syncCharacters: false,
      requireApproval: false,
      ...settings
    }

    const sessionData = {
      name: sessionName,
      playerName,
      settings: defaultSettings
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Session creation timeout'))
      }, 10000)

      const handler = (event: CustomEvent) => {
        const data = event.detail
        if (data.type === 'session_created') {
          clearTimeout(timeout)
          this.currentSession = data.session
          this.currentPlayer = data.player
          this.emit('session_created', data.session)
          resolve(data.session)
        } else if (data.type === 'error') {
          clearTimeout(timeout)
          reject(new Error(data.message))
        }
      }

      this.once('message', handler)
      this.send('create_session', sessionData)
    })
  }

  async joinSession(sessionId: string, playerName: string): Promise<GameSession> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join session timeout'))
      }, 10000)

      const handler = (event: CustomEvent) => {
        const data = event.detail
        if (data.type === 'session_joined') {
          clearTimeout(timeout)
          this.currentSession = data.session
          this.currentPlayer = data.player
          this.emit('session_joined', data.session)
          resolve(data.session)
        } else if (data.type === 'error') {
          clearTimeout(timeout)
          reject(new Error(data.message))
        }
      }

      this.once('message', handler)
      this.send('join_session', { sessionId, playerName })
    })
  }

  leaveSession() {
    if (this.currentSession) {
      this.send('leave_session', { sessionId: this.currentSession.id })
      this.currentSession = null
      this.currentPlayer = null
      this.emit('session_left')
    }
  }

  // Dice Sharing
  shareDiceRoll(rollData: Omit<DiceRollEvent, 'playerId' | 'playerName' | 'timestamp'>): void {
    if (!this.currentSession || !this.currentPlayer) {
      throw new Error('Not in a session')
    }

    const diceRollEvent: DiceRollEvent = {
      ...rollData,
      playerId: this.currentPlayer.id,
      playerName: this.currentPlayer.name,
      timestamp: new Date()
    }

    this.send('dice_roll', diceRollEvent)
    this.emit('dice_roll_shared', diceRollEvent)
  }

  // Real-time Synchronization
  syncGameState(stateType: string, data: any): void {
    if (!this.currentSession) {
      throw new Error('Not in a session')
    }

    this.send('sync_state', {
      sessionId: this.currentSession.id,
      stateType,
      data,
      timestamp: new Date()
    })
  }

  // Message Handling
  private handleMessage(rawData: string) {
    try {
      const data = JSON.parse(rawData)
      this.emit('message', data)

      switch (data.type) {
        case 'player_joined':
          this.handlePlayerJoined(data)
          break
        case 'player_left':
          this.handlePlayerLeft(data)
          break
        case 'dice_roll':
          this.handleDiceRoll(data)
          break
        case 'state_sync':
          this.handleStateSync(data)
          break
        case 'session_updated':
          this.handleSessionUpdated(data)
          break
        default:
          this.emit(data.type, data)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }

  private handlePlayerJoined(data: any) {
    if (this.currentSession) {
      this.currentSession.players.push(data.player)
      this.emit('player_joined', data.player)
    }
  }

  private handlePlayerLeft(data: any) {
    if (this.currentSession) {
      this.currentSession.players = this.currentSession.players.filter(
        p => p.id !== data.playerId
      )
      this.emit('player_left', data.player)
    }
  }

  private handleDiceRoll(data: DiceRollEvent) {
    this.emit('dice_roll_received', data)
  }

  private handleStateSync(data: any) {
    this.emit('state_sync_received', data)
  }

  private handleSessionUpdated(data: any) {
    if (this.currentSession) {
      this.currentSession = { ...this.currentSession, ...data.updates }
      this.emit('session_updated', this.currentSession)
    }
  }

  private send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }))
    } else {
      console.warn('Cannot send message: WebSocket not connected')
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get session(): GameSession | null {
    return this.currentSession
  }

  get player(): Player | null {
    return this.currentPlayer
  }

  get isHost(): boolean {
    return this.currentPlayer?.isHost ?? false
  }

  // Utility Methods
  getSessionPlayers(): Player[] {
    return this.currentSession?.players ?? []
  }

  getConnectedPlayers(): Player[] {
    return this.getSessionPlayers().filter(p => p.isConnected)
  }

  kickPlayer(playerId: string): void {
    if (!this.isHost) {
      throw new Error('Only the host can kick players')
    }

    this.send('kick_player', {
      sessionId: this.currentSession?.id,
      playerId
    })
  }

  updateSessionSettings(settings: Partial<SessionSettings>): void {
    if (!this.isHost) {
      throw new Error('Only the host can update session settings')
    }

    this.send('update_session', {
      sessionId: this.currentSession?.id,
      settings
    })
  }
}

export const multiplayerService = new MultiplayerService()
export default multiplayerService