/**
 * Trackers Widget - Custom counters and progress tracking
 * Phase 4A: Essential for tracking session values and resources
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  Minus,
  Edit3, 
  Trash2, 
  RotateCcw,
  Flame,
  Zap,
  Heart,
  Shield,
  Coins,
  Clock
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from '../../ui'
import { useSessionStore } from '../../../stores'

export interface Tracker {
  id: string
  name: string
  current: number
  max: number
  min: number
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray'
  icon: string
  description?: string
  timestamp: Date
}

interface TrackersWidgetProps {
  className?: string
}

export const TrackersWidget: React.FC<TrackersWidgetProps> = ({ 
  className = '' 
}) => {
  const { sessionTrackers, addTracker, updateTracker, deleteTracker } = useSessionStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTracker, setNewTracker] = useState({
    name: '',
    current: 0,
    max: 10,
    min: 0,
    color: 'blue' as const,
    icon: 'target',
    description: ''
  })

  const iconOptions = [
    { value: 'target', icon: Target, label: 'Target' },
    { value: 'flame', icon: Flame, label: 'Flame' },
    { value: 'zap', icon: Zap, label: 'Lightning' },
    { value: 'heart', icon: Heart, label: 'Heart' },
    { value: 'shield', icon: Shield, label: 'Shield' },
    { value: 'coins', icon: Coins, label: 'Coins' },
    { value: 'clock', icon: Clock, label: 'Clock' }
  ]

  const colorOptions = [
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' }
  ]

  const createTracker = () => {
    if (!newTracker.name.trim()) return

    const tracker: Tracker = {
      id: `tracker-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: newTracker.name.trim(),
      current: Math.max(newTracker.min, Math.min(newTracker.max, newTracker.current)),
      max: newTracker.max,
      min: newTracker.min,
      color: newTracker.color,
      icon: newTracker.icon,
      description: newTracker.description.trim() || undefined,
      timestamp: new Date()
    }

    addTracker(tracker)
    setNewTracker({
      name: '',
      current: 0,
      max: 10,
      min: 0,
      color: 'blue',
      icon: 'target',
      description: ''
    })
    setIsCreating(false)
  }

  const startEditing = (tracker: Tracker) => {
    setEditingId(tracker.id)
    setNewTracker({
      name: tracker.name,
      current: tracker.current,
      max: tracker.max,
      min: tracker.min,
      color: tracker.color,
      icon: tracker.icon,
      description: tracker.description || ''
    })
  }

  const saveEdit = () => {
    if (!editingId || !newTracker.name.trim()) return

    updateTracker(editingId, {
      name: newTracker.name.trim(),
      current: Math.max(newTracker.min, Math.min(newTracker.max, newTracker.current)),
      max: newTracker.max,
      min: newTracker.min,
      color: newTracker.color,
      icon: newTracker.icon,
      description: newTracker.description.trim() || undefined
    })

    setEditingId(null)
    setNewTracker({
      name: '',
      current: 0,
      max: 10,
      min: 0,
      color: 'blue',
      icon: 'target',
      description: ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setNewTracker({
      name: '',
      current: 0,
      max: 10,
      min: 0,
      color: 'blue',
      icon: 'target',
      description: ''
    })
  }

  const adjustTracker = (trackerId: string, delta: number) => {
    const tracker = sessionTrackers.find(t => t.id === trackerId)
    if (!tracker) return

    const newValue = Math.max(tracker.min, Math.min(tracker.max, tracker.current + delta))
    updateTracker(trackerId, { current: newValue })
  }

  const resetTracker = (trackerId: string) => {
    const tracker = sessionTrackers.find(t => t.id === trackerId)
    if (!tracker) return

    updateTracker(trackerId, { current: tracker.max })
  }

  const getColorClasses = (color: Tracker['color']) => {
    const colorMap = {
      red: 'bg-red-500 text-white',
      orange: 'bg-orange-500 text-white',
      yellow: 'bg-yellow-500 text-black',
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white',
      gray: 'bg-gray-500 text-white'
    }
    return colorMap[color]
  }

  const getProgressColor = (color: Tracker['color']) => {
    const colorMap = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500'
    }
    return colorMap[color]
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ size: number }> } = {
      target: Target,
      flame: Flame,
      zap: Zap,
      heart: Heart,
      shield: Shield,
      coins: Coins,
      clock: Clock
    }
    return iconMap[iconName] || Target
  }

  const calculateProgress = (tracker: Tracker) => {
    const range = tracker.max - tracker.min
    const current = tracker.current - tracker.min
    return range > 0 ? (current / range) * 100 : 0
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={20} />
          <span className="font-medium">Custom Trackers</span>
          <Badge variant="secondary">{sessionTrackers.length}</Badge>
        </div>
      </div>

      {/* Add Tracker Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => setIsCreating(true)}
        className="w-full gap-2"
      >
        <Plus size={16} />
        Add Tracker
      </Button>

      {/* Create/Edit Tracker Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="magical" padding="lg">
              <CardContent>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tracker Name
                    </label>
                    <input
                      type="text"
                      value={newTracker.name}
                      onChange={(e) => setNewTracker(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Torch Duration, Spell Slots, Rations, etc."
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-primary)',
                        borderOpacity: 0.2,
                        color: 'var(--color-text)'
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Values */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current
                      </label>
                      <input
                        type="number"
                        value={newTracker.current}
                        onChange={(e) => setNewTracker(prev => ({ 
                          ...prev, 
                          current: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-primary)',
                          borderOpacity: 0.2,
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Maximum
                      </label>
                      <input
                        type="number"
                        value={newTracker.max}
                        onChange={(e) => setNewTracker(prev => ({ 
                          ...prev, 
                          max: parseInt(e.target.value) || 10 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-primary)',
                          borderOpacity: 0.2,
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Minimum
                      </label>
                      <input
                        type="number"
                        value={newTracker.min}
                        onChange={(e) => setNewTracker(prev => ({ 
                          ...prev, 
                          min: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-primary)',
                          borderOpacity: 0.2,
                          color: 'var(--color-text)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Icon and Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Icon
                      </label>
                      <select
                        value={newTracker.icon}
                        onChange={(e) => setNewTracker(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-primary)',
                          borderOpacity: 0.2,
                          color: 'var(--color-text)'
                        }}
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Color
                      </label>
                      <div className="flex gap-2">
                        {colorOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setNewTracker(prev => ({ 
                              ...prev, 
                              color: option.value as Tracker['color'] 
                            }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${option.class} ${
                              newTracker.color === option.value 
                                ? 'border-white shadow-lg scale-110' 
                                : 'border-gray-300'
                            }`}
                            title={option.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newTracker.description}
                      onChange={(e) => setNewTracker(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What does this tracker represent?"
                      className="w-full px-3 py-2 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-primary)',
                        borderOpacity: 0.2,
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={editingId ? saveEdit : createTracker}
                      disabled={!newTracker.name.trim()}
                    >
                      {editingId ? 'Save Changes' : 'Create Tracker'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trackers Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {sessionTrackers.map((tracker, index) => {
            const IconComponent = getIconComponent(tracker.icon)
            const progress = calculateProgress(tracker)
            
            return (
              <motion.div
                key={tracker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card variant="glass" padding="md">
                  <CardContent>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getColorClasses(tracker.color)}`}>
                            <IconComponent size={16} />
                          </div>
                          <div>
                            <div className="font-medium">{tracker.name}</div>
                            {tracker.description && (
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {tracker.description}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(tracker)}
                            className="p-1"
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTracker(tracker.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{tracker.current} / {tracker.max}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(tracker.color)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustTracker(tracker.id, -1)}
                            disabled={tracker.current <= tracker.min}
                            className="p-2"
                          >
                            <Minus size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => adjustTracker(tracker.id, 1)}
                            disabled={tracker.current >= tracker.max}
                            className="p-2"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetTracker(tracker.id)}
                          className="gap-1 text-xs"
                        >
                          <RotateCcw size={12} />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {sessionTrackers.length === 0 && (
        <Card variant="glass" padding="lg">
          <CardContent>
            <div className="text-center py-8">
              <Target 
                size={48} 
                className="mx-auto mb-4 opacity-50"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <h3 className="text-lg font-medium mb-2">No Trackers Yet</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Create custom trackers for torch duration, spell slots, rations, or any other session values you need to monitor!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}