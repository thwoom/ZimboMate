/**
 * LiveChronicleStream - Real-Time Story Building
 *
 * Displays a live stream of chronicle entries as they happen,
 * with quick-add functionality and auto-suggestions based on recent events.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Send,
  Mic,
  MicOff,
  Edit3,
  Clock,
  User,
  Zap,
  Sparkles,
  ArrowDown,
  Hash,
  AtSign,
  Quote,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useChronicle } from '../../chronicle/ChronicleProvider'
import type { Character } from '../../../models/Character'
import type { GameMode, PlayTabTheme } from '../PlayTab'

interface LiveChronicleStreamProps {
  character: Character
  gameMode: GameMode
  theme: PlayTabTheme
  sessionStartTime: Date | null
  className?: string
}

interface ChronicleEntry {
  id: string
  timestamp: Date
  author: string
  content: string
  type: 'action' | 'dialogue' | 'discovery' | 'reaction'
  tags?: string[]
  isAutoSuggested?: boolean
}

interface QuickSuggestion {
  id: string
  text: string
  type: 'action' | 'dialogue' | 'discovery' | 'reaction'
  confidence: number
}

const EntryTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'action':
      return <Zap size={12} className="text-chart-4" />
    case 'dialogue':
      return <Quote size={12} className="text-primary" />
    case 'discovery':
      return <Sparkles size={12} className="text-chart-4" />
    case 'reaction':
      return <User size={12} className="text-chart-2" />
    default:
      return <BookOpen size={12} className="text-muted-foreground" />
  }
}

const ChronicleEntryCard: React.FC<{
  entry: ChronicleEntry
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}> = ({ entry, onEdit, onDelete }) => {
  const timeAgo = React.useMemo(() => {
    const now = new Date()
    const diff = now.getTime() - entry.timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }, [entry.timestamp])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-3 rounded-lg border border-border ${
        entry.isAutoSuggested ? 'bg-primary/10' : 'bg-card'
      }`}
    >
      <div className="flex items-start gap-2">
        <EntryTypeIcon type={entry.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{entry.author}</span>
              <Clock size={10} />
              <span>{timeAgo}</span>
            </div>
            {entry.isAutoSuggested && (
              <Badge variant="secondary" className="text-xs">
                Suggested
              </Badge>
            )}
          </div>

          <p className="text-sm text-foreground  leading-relaxed">
            {entry.content}
          </p>

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry.id)}
              className="w-6 h-6 p-0"
            >
              <Edit3 size={10} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id)}
              className="w-6 h-6 p-0 text-destructive hover:text-destructive"
            >
              <X size={10} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const QuickAddForm: React.FC<{
  onAdd: (content: string, type: string) => void
  suggestions: QuickSuggestion[]
}> = ({ onAdd, suggestions }) => {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<'action' | 'dialogue' | 'discovery' | 'reaction'>('action')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onAdd(content.trim(), selectedType)
      setContent('')
      textareaRef.current?.focus()
    }
  }

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    setContent(suggestion.text)
    setSelectedType(suggestion.type as any)
    textareaRef.current?.focus()
  }

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening)
      // TODO: Implement speech recognition
      console.log('Voice input:', isListening ? 'stopped' : 'started')
    }
  }

  const typeButtons = [
    { id: 'action', label: 'Action', icon: Zap, color: 'text-chart-4' },
    { id: 'dialogue', label: 'Dialogue', icon: Quote, color: 'text-primary' },
    { id: 'discovery', label: 'Discovery', icon: Sparkles, color: 'text-chart-4' },
    { id: 'reaction', label: 'Reaction', icon: User, color: 'text-chart-2' }
  ]

  return (
    <div className="space-y-3">
      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground ">Quick suggestions:</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 3).map(suggestion => (
              <Button
                key={suggestion.id}
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-2 py-1 h-auto bg-primary/10 hover:bg-primary/10"
              >
                <EntryTypeIcon type={suggestion.type} />
                <span className="ml-1 truncate max-w-32">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Type Selector */}
        <div className="flex gap-1">
          {typeButtons.map(type => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <Button
                key={type.id}
                type="button"
                variant={isSelected ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType(type.id as any)}
                className="flex-1 gap-1"
              >
                <Icon size={12} className={isSelected ? '' : type.color} />
                <span className="text-xs">{type.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Add a ${selectedType} to your chronicle...`}
            className="w-full p-2 text-sm border border-border rounded-lg bg-card resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleVoiceInput}
            className={`absolute top-2 right-2 w-6 h-6 p-0 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
          >
            {isListening ? <MicOff size={12} /> : <Mic size={12} />}
          </Button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim()}
            className="gap-1"
          >
            <Send size={12} />
            Add to Chronicle
          </Button>
        </div>
      </form>
    </div>
  )
}

export const LiveChronicleStream: React.FC<LiveChronicleStreamProps> = ({
  character,
  gameMode,
  theme,
  sessionStartTime,
  className = ''
}) => {
  const [entries, setEntries] = useState<ChronicleEntry[]>([])
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { promptForChronicle, isOverlayEnabled } = useChronicle()

  // Generate contextual suggestions based on game mode and recent activity
  useEffect(() => {
    const generateSuggestions = () => {
      const baseSuggestions: QuickSuggestion[] = []

      switch (gameMode) {
        case 'combat':
          baseSuggestions.push(
            { id: '1', text: `${character.name} strikes with fierce determination`, type: 'action', confidence: 0.8 },
            { id: '2', text: `"This ends now!" ${character.name} shouts`, type: 'dialogue', confidence: 0.7 },
            { id: '3', text: 'The enemy reveals a weakness in their defense', type: 'discovery', confidence: 0.6 }
          )
          break

        case 'exploration':
          baseSuggestions.push(
            { id: '1', text: `${character.name} carefully examines the area`, type: 'action', confidence: 0.8 },
            { id: '2', text: 'Something glints in the shadows', type: 'discovery', confidence: 0.7 },
            { id: '3', text: `${character.name} feels a sense of unease`, type: 'reaction', confidence: 0.6 }
          )
          break

        case 'social':
          baseSuggestions.push(
            { id: '1', text: `${character.name} chooses their words carefully`, type: 'action', confidence: 0.8 },
            { id: '2', text: '"Perhaps we can help each other," they offer', type: 'dialogue', confidence: 0.7 },
            { id: '3', text: 'The NPC seems to be hiding something', type: 'discovery', confidence: 0.6 }
          )
          break

        case 'rest':
          baseSuggestions.push(
            { id: '1', text: `${character.name} reflects on recent events`, type: 'reaction', confidence: 0.8 },
            { id: '2', text: 'The peaceful moment allows for deeper thoughts', type: 'discovery', confidence: 0.7 },
            { id: '3', text: `${character.name} tends to their equipment`, type: 'action', confidence: 0.6 }
          )
          break
      }

      setSuggestions(baseSuggestions)
    }

    generateSuggestions()
  }, [gameMode, character.name])

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, autoScroll])

  const addEntry = useCallback((content: string, type: string) => {
    const newEntry: ChronicleEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      author: character.name,
      content,
      type: type as any,
      tags: extractTags(content),
      isAutoSuggested: false
    }

    setEntries(prev => [...prev, newEntry])
  }, [character.name])

  const editEntry = useCallback((id: string) => {
    console.log('Edit entry:', id)
    // TODO: Implement entry editing
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }, [])

  const extractTags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(match => match.substring(1)) : []
  }

  const cardVariant =
    theme === 'combat' ? 'elevated' :
    theme === 'dungeon' ? 'parchment' :
    theme === 'tavern' ? 'magical' :
    'glass'

  return (
    <Card
      variant={cardVariant}
      className={`h-full flex flex-col ${className}`}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen size={16} className="text-primary" />
            Live Chronicle
            {entries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {entries.length} entries
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            {!isOverlayEnabled && (
              <Badge variant="outline" className="text-xs">
                Chronicle Disabled
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Entries Stream */}
        <div
          ref={scrollRef}
          className={`space-y-2 overflow-y-auto pr-2 ${
            isExpanded ? 'flex-1' : 'max-h-32'
          }`}
          onScroll={(e) => {
            const element = e.target as HTMLElement
            const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight
            setAutoScroll(isAtBottom)
          }}
        >
          <AnimatePresence>
            {entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8"
              >
                <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Your chronicle begins here</p>
                <p className="text-xs">Document your adventure as it unfolds</p>
              </motion.div>
            ) : (
              entries.map(entry => (
                <ChronicleEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={editEntry}
                  onDelete={deleteEntry}
                />
              ))
            )}
          </AnimatePresence>

          {/* Scroll to Bottom Indicator */}
          {!autoScroll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sticky bottom-0 left-0 right-0 flex justify-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
                  setAutoScroll(true)
                }}
                className="bg-card shadow-lg gap-1"
              >
                <ArrowDown size={12} />
                New entries
              </Button>
            </motion.div>
          )}
        </div>

        {/* Quick Add Form */}
        <div className="mt-3 pt-3 border-t border-border flex-shrink-0">
          <QuickAddForm
            onAdd={addEntry}
            suggestions={suggestions}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveChronicleStream




