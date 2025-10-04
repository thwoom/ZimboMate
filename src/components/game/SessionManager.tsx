/**
 * SessionManager - Create/join session interface for multiplayer functionality
 * Provides UI for managing multiplayer game sessions
 */

import type {
  GameSession,
  SessionSettings,
} from '../../services/MultiplayerService'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, LogIn, Plus, Users, Wifi, WifiOff } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { multiplayerService } from '../../services/MultiplayerService'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '../ui'

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

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
}) => (
  <div className='flex items-center gap-2 mb-4'>
    {isConnected ? (
      <>
        <Wifi size={16} className='text-chart-2' />
        <span className='text-sm text-chart-2'>Connected to server</span>
      </>
    ) : isConnecting ? (
      <>
        <div className='animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full' />
        <span className='text-sm text-muted-foreground'>Connecting...</span>
      </>
    ) : (
      <>
        <WifiOff size={16} className='text-destructive' />
        <span className='text-sm text-destructive'>Disconnected</span>
      </>
    )}
  </div>
)

interface MenuViewProps {
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  onStartCreate: () => void
  onStartJoin: () => void
  onRetryConnection: () => void
}

const MenuView: React.FC<MenuViewProps> = ({
  isConnected,
  isConnecting,
  connectionError,
  onStartCreate,
  onStartJoin,
  onRetryConnection,
}) => (
  <motion.div
    className='space-y-4'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <ConnectionStatus isConnected={isConnected} isConnecting={isConnecting} />

    {connectionError && (
      <div className='p-3 bg-destructive/15 border border-destructive/30 rounded-lg text-destructive text-sm'>
        {connectionError}
      </div>
    )}

    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Button
        variant='primary'
        size='lg'
        onClick={onStartCreate}
        disabled={!isConnected}
        className='gap-2 h-20 flex-col'
      >
        <Plus size={24} />
        <span>Create Session</span>
      </Button>

      <Button
        variant='outline'
        size='lg'
        onClick={onStartJoin}
        disabled={!isConnected}
        className='gap-2 h-20 flex-col'
      >
        <LogIn size={24} />
        <span>Join Session</span>
      </Button>
    </div>

    {!isConnected && (
      <Button
        variant='outline'
        onClick={onRetryConnection}
        disabled={isConnecting}
        className='w-full gap-2'
      >
        <Wifi size={16} />
        {isConnecting ? 'Connecting...' : 'Connect to Server'}
      </Button>
    )}
  </motion.div>
)

interface CreateSessionViewProps {
  form: CreateSessionForm
  onFormChange: React.Dispatch<React.SetStateAction<CreateSessionForm>>
  onCreate: () => void
  onBack: () => void
}

const CreateSessionView: React.FC<CreateSessionViewProps> = ({
  form,
  onFormChange,
  onCreate,
  onBack,
}) => (
  <motion.div
    className='space-y-4'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <div className='flex items-center gap-2 mb-4'>
      <Plus size={20} className='text-primary' />
      <h3 className='text-lg font-display'>Create New Session</h3>
    </div>

    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium mb-2'>Session Name</label>
        <Input
          value={form.name}
          onChange={(e) =>
            onFormChange((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder='Epic Adventure Session'
          className='w-full'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>Your Name</label>
        <Input
          value={form.playerName}
          onChange={(e) =>
            onFormChange((prev) => ({ ...prev, playerName: e.target.value }))
          }
          placeholder='Game Master'
          className='w-full'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>Max Players</label>
        <Input
          type='number'
          min='2'
          max='12'
          value={form.maxPlayers}
          onChange={(e) =>
            onFormChange((prev) => ({
              ...prev,
              maxPlayers: Number.parseInt(e.target.value, 10) || 6,
            }))
          }
          className='w-full'
        />
      </div>

      <div className='space-y-3'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={form.allowSpectators}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                allowSpectators: e.target.checked,
              }))
            }
            className='rounded'
          />
          <span className='text-sm'>Allow spectators</span>
        </label>

        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={form.shareRolls}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                shareRolls: e.target.checked,
              }))
            }
            className='rounded'
          />
          <span className='text-sm'>Share dice rolls</span>
        </label>

        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={form.requireApproval}
            onChange={(e) =>
              onFormChange((prev) => ({
                ...prev,
                requireApproval: e.target.checked,
              }))
            }
            className='rounded'
          />
          <span className='text-sm'>Require approval to join</span>
        </label>
      </div>
    </div>

    <div className='flex gap-3 pt-4'>
      <Button
        variant='primary'
        onClick={onCreate}
        disabled={!form.name.trim() || !form.playerName.trim()}
        className='flex-1'
      >
        Create Session
      </Button>
      <Button variant='outline' onClick={onBack}>
        Back
      </Button>
    </div>
  </motion.div>
)

interface JoinSessionViewProps {
  form: JoinSessionForm
  onFormChange: React.Dispatch<React.SetStateAction<JoinSessionForm>>
  availableSessions: GameSession[]
  onJoin: (sessionId?: string) => void
  onBack: () => void
}

const JoinSessionView: React.FC<JoinSessionViewProps> = ({
  form,
  onFormChange,
  availableSessions,
  onJoin,
  onBack,
}) => (
  <motion.div
    className='space-y-4'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <div className='flex items-center gap-2 mb-4'>
      <LogIn size={20} className='text-primary' />
      <h3 className='text-lg font-display'>Join Session</h3>
    </div>

    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium mb-2'>Session ID</label>
        <Input
          value={form.sessionId}
          onChange={(e) =>
            onFormChange((prev) => ({ ...prev, sessionId: e.target.value }))
          }
          placeholder='Enter session ID'
          className='w-full'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>Your Name</label>
        <Input
          value={form.playerName}
          onChange={(e) =>
            onFormChange((prev) => ({ ...prev, playerName: e.target.value }))
          }
          placeholder='Player Name'
          className='w-full'
        />
      </div>
    </div>

    {availableSessions.length > 0 && (
      <div>
        <h4 className='text-sm font-medium mb-2'>Available Sessions</h4>
        <div className='space-y-2'>
          {availableSessions.map((session) => (
            <Card
              key={session.id}
              variant='outline'
              className='cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => onJoin(session.id)}
            >
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <h5 className='font-medium'>{session.name}</h5>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='secondary' className='text-xs'>
                        <Users size={10} className='mr-1' />
                        {session.players.length}/{session.settings.maxPlayers}
                      </Badge>
                      {session.players.some((player) => player.isHost) && (
                        <Crown size={12} className='text-chart-4' />
                      )}
                    </div>
                  </div>
                  <Button variant='ghost' size='sm'>
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )}

    <div className='flex gap-3 pt-4'>
      <Button
        variant='primary'
        onClick={() => onJoin()}
        disabled={!form.sessionId.trim() || !form.playerName.trim()}
        className='flex-1'
      >
        Join Session
      </Button>
      <Button variant='outline' onClick={onBack}>
        Back
      </Button>
    </div>
  </motion.div>
)

export const SessionManager: React.FC<SessionManagerProps> = ({
  onSessionJoined,
  onClose,
  isVisible,
}) => {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [_copiedSessionId, setCopiedSessionId] = useState(false)

  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    name: '',
    playerName: '',
    maxPlayers: 6,
    allowSpectators: true,
    shareRolls: true,
    requireApproval: false,
  })

  const [joinForm, setJoinForm] = useState<JoinSessionForm>({
    sessionId: '',
    playerName: '',
  })

  const [availableSessions, _setAvailableSessions] = useState<GameSession[]>([])

  const checkConnection = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (isVisible) {
      void checkConnection()
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
  }, [checkConnection, isVisible, onSessionJoined])

  const handleCreateSession = async () => {
    if (!createForm.name.trim() || !createForm.playerName.trim()) {
      return
    }

    try {
      const settings: Partial<SessionSettings> = {
        maxPlayers: createForm.maxPlayers,
        allowSpectators: createForm.allowSpectators,
        shareRolls: createForm.shareRolls,
        requireApproval: createForm.requireApproval,
      }

      await multiplayerService.createSession(
        createForm.name.trim(),
        createForm.playerName.trim(),
        settings,
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

  const _copySessionId = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId)
    setCopiedSessionId(true)
    setTimeout(() => setCopiedSessionId(false), 2000)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className='w-full max-w-md mx-4'
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant='magical'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users size={24} className='text-primary' />
                  Multiplayer Sessions
                </CardTitle>
              </CardHeader>

              <CardContent>
                <AnimatePresence mode='wait'>
                  {mode === 'menu' && (
                    <MenuView
                      key='menu'
                      isConnected={isConnected}
                      isConnecting={isConnecting}
                      connectionError={connectionError}
                      onStartCreate={() => setMode('create')}
                      onStartJoin={() => setMode('join')}
                      onRetryConnection={() => {
                        void checkConnection()
                      }}
                    />
                  )}
                  {mode === 'create' && (
                    <CreateSessionView
                      key='create'
                      form={createForm}
                      onFormChange={setCreateForm}
                      onCreate={handleCreateSession}
                      onBack={() => setMode('menu')}
                    />
                  )}
                  {mode === 'join' && (
                    <JoinSessionView
                      key='join'
                      form={joinForm}
                      onFormChange={setJoinForm}
                      availableSessions={availableSessions}
                      onJoin={handleJoinSession}
                      onBack={() => setMode('menu')}
                    />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
