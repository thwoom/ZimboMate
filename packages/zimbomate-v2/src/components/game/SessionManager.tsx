/**
 * SessionManager - Create/join session interface for multiplayer functionality
 * Provides UI for managing multiplayer game sessions
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '../ui'
import { multiplayerService, GameSession, SessionSettings } from '../../services/MultiplayerService'
import { 
  Users, 
  Plus, 
  LogIn, 
  Settings, 
  Crown, 
  Wifi, 
  WifiOff,
  Copy,
  Check,
  X
} from 'lucide-react'

interface SessionManagerProps {
  onSessionJoined: (session: GameSession) => void
  onClose: () => void
  isVisible: boolean
}

interface CreateSessionForm {
  name: string
  playerName: string
  maxPlayers: number
  allowSpectators: boolean
  shareRolls: boolean
  requireApproval: boolean
}

interface JoinSessionForm {
  sessionId: string
  playerName: string
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionJoined,
  onClose,
  isVisible
}) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [copiedSessionId, setCopiedSessionId] = useState(false)

  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    name: '',
    playerName: '',
    maxPlayers: 6,
    allowSpectators: true,
    shareRolls: true,
    requireApproval: false
  })

  const [joinForm, setJoinForm] = useState<JoinSessionForm>({
    sessionId: '',
    playerName: ''
  })

  const [availableSessions, setAvailableSessions] = useState<GameSession[]>([])

  useEffect(() => {
    if (isVisible) {
      checkConnection()
    }

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionError(null)
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
    }

    const handleError = (event: CustomEvent) => {
      const error = event.detail
      setConnectionError(error?.message || 'Connection failed')
      setIsConnecting(false)
    }

    const handleSessionCreated = (event: CustomEvent) => {
      const session = event.detail
      onSessionJoined(session)
    }

    const handleSessionJoined = (event: CustomEvent) => {
      const session = event.detail
      onSessionJoined(session)
    }

    multiplayerService.on('connected', handleConnected)
    multiplayerService.on('disconnected', handleDisconnected)
    multiplayerService.on('error', handleError)
    multiplayerService.on('session_created', handleSessionCreated)
    multiplayerService.on('session_joined', handleSessionJoined)

    return () => {
      multiplayerService.off('connected', handleConnected)
      multiplayerService.off('disconnected', handleDisconnected)
      multiplayerService.off('error', handleError)
      multiplayerService.off('session_created', handleSessionCreated)
      multiplayerService.off('session_joined', handleSessionJoined)
    }
  }, [isVisible, onSessionJoined])

  const checkConnection = async () => {
    if (multiplayerService.isConnected) {
      setIsConnected(true)
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      await multiplayerService.connect()
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to connect to server')
    }
  }

  const handleCreateSession = async () => {
    if (!createForm.name.trim() || !createForm.playerName.trim()) {
      return
    }

    try {
      const settings: Partial<SessionSettings> = {
        maxPlayers: createForm.maxPlayers,
        allowSpectators: createForm.allowSpectators,
        shareRolls: createForm.shareRolls,
        requireApproval: createForm.requireApproval
      }

      await multiplayerService.createSession(
        createForm.name.trim(),
        createForm.playerName.trim(),
        settings
      )
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to create session')
    }
  }

  const handleJoinSession = async (sessionId?: string) => {
    const id = sessionId || joinForm.sessionId.trim()
    const playerName = joinForm.playerName.trim()

    if (!id || !playerName) {
      return
    }

    try {
      await multiplayerService.joinSession(id, playerName)
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to join session')
    }
  }

  const copySessionId = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId)
    setCopiedSessionId(true)
    setTimeout(() => setCopiedSessionId(false), 2000)
  }

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 mb-4">
      {isConnected ? (
        <>
          <Wifi size={16} className="text-green-500" />
          <span className="text-sm text-green-600">Connected to server</span>
        </>
      ) : isConnecting ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-(--color-primary) border-t-transparent rounded-full" />
          <span className="text-sm text-(--color-text-secondary)">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-sm text-red-600">Disconnected</span>
        </>
      )}
    </div>
  )

  const MenuView = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ConnectionStatus />

      {connectionError && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {connectionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setMode('create')}
          disabled={!isConnected}
          className="gap-2 h-20 flex-col"
        >
          <Plus size={24} />
          <span>Create Session</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setMode('join')}
          disabled={!isConnected}
          className="gap-2 h-20 flex-col"
        >
          <LogIn size={24} />
          <span>Join Session</span>
        </Button>
      </div>

      {!isConnected && (
        <Button
          variant="outline"
          onClick={checkConnection}
          disabled={isConnecting}
          className="w-full gap-2"
        >
          <Wifi size={16} />
          {isConnecting ? 'Connecting...' : 'Connect to Server'}
        </Button>
      )}
    </motion.div>
  )

  const CreateSessionView = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Plus size={20} className="text-(--color-primary)" />
        <h3 className="text-lg font-display">Create New Session</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Session Name</label>
          <Input
            value={createForm.name}
            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Epic Adventure Session"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <Input
            value={createForm.playerName}
            onChange={(e) => setCreateForm(prev => ({ ...prev, playerName: e.target.value }))}
            placeholder="Game Master"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Players</label>
          <Input
            type="number"
            min="2"
            max="12"
            value={createForm.maxPlayers}
            onChange={(e) => setCreateForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 6 }))}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createForm.allowSpectators}
              onChange={(e) => setCreateForm(prev => ({ ...prev, allowSpectators: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Allow spectators</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createForm.shareRolls}
              onChange={(e) => setCreateForm(prev => ({ ...prev, shareRolls: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Share dice rolls</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={createForm.requireApproval}
              onChange={(e) => setCreateForm(prev => ({ ...prev, requireApproval: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Require approval to join</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="primary"
          onClick={handleCreateSession}
          disabled={!createForm.name.trim() || !createForm.playerName.trim()}
          className="flex-1"
        >
          Create Session
        </Button>
        <Button
          variant="outline"
          onClick={() => setMode('menu')}
        >
          Back
        </Button>
      </div>
    </motion.div>
  )

  const JoinSessionView = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LogIn size={20} className="text-(--color-primary)" />
        <h3 className="text-lg font-display">Join Session</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Session ID</label>
          <Input
            value={joinForm.sessionId}
            onChange={(e) => setJoinForm(prev => ({ ...prev, sessionId: e.target.value }))}
            placeholder="Enter session ID"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <Input
            value={joinForm.playerName}
            onChange={(e) => setJoinForm(prev => ({ ...prev, playerName: e.target.value }))}
            placeholder="Player Name"
            className="w-full"
          />
        </div>
      </div>

      {availableSessions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Available Sessions</h4>
          <div className="space-y-2">
            {availableSessions.map(session => (
              <Card
                key={session.id}
                variant="outline"
                padding="sm"
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleJoinSession(session.id)}
              >
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{session.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Users size={10} className="mr-1" />
                          {session.players.length}/{session.settings.maxPlayers}
                        </Badge>
                        {session.players.some(p => p.isHost) && (
                          <Crown size={12} className="text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="primary"
          onClick={() => handleJoinSession()}
          disabled={!joinForm.sessionId.trim() || !joinForm.playerName.trim()}
          className="flex-1"
        >
          Join Session
        </Button>
        <Button
          variant="outline"
          onClick={() => setMode('menu')}
        >
          Back
        </Button>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <Card variant="magical" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={24} className="text-(--color-primary)" />
                  Multiplayer Sessions
                </CardTitle>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {mode === 'menu' && <MenuView key="menu" />}
                  {mode === 'create' && <CreateSessionView key="create" />}
                  {mode === 'join' && <JoinSessionView key="join" />}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}