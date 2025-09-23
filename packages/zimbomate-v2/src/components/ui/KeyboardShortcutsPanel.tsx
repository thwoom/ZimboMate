import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Keyboard, Command, Zap, User, Dice6, NotebookPen } from 'lucide-react'
import { keyboardShortcutsService, type ShortcutCategory } from '../../services/KeyboardShortcutsService'
import { Card, CardContent, Badge, Input } from '../ui'

interface KeyboardShortcutsPanelProps {
  className?: string
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get shortcuts grouped by category
  const shortcutCategories = useMemo(() => 
    keyboardShortcutsService.getShortcutsByCategory(),
    []
  )

  // Filter shortcuts based on search and category
  const filteredCategories = useMemo(() => {
    let categories = shortcutCategories

    // Filter by category
    if (selectedCategory !== 'all') {
      categories = categories.filter(cat => cat.id === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      categories = categories.map(category => ({
        ...category,
        shortcuts: category.shortcuts.filter(shortcut =>
          shortcut.description.toLowerCase().includes(query) ||
          shortcut.category.toLowerCase().includes(query) ||
          keyboardShortcutsService.formatShortcut(shortcut).toLowerCase().includes(query)
        )
      })).filter(category => category.shortcuts.length > 0)
    }

    return categories
  }, [shortcutCategories, searchQuery, selectedCategory])

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'global': return Command
      case 'navigation': return Keyboard
      case 'dice': return Dice6
      case 'character': return User
      case 'session': return NotebookPen
      default: return Zap
    }
  }

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'global': return 'var(--color-primary)'
      case 'navigation': return 'var(--color-accent)'
      case 'dice': return 'var(--color-warning)'
      case 'character': return 'var(--color-success)'
      case 'session': return 'var(--color-info)'
      default: return 'var(--color-text-secondary)'
    }
  }

  const allCategories = [
    { id: 'all', name: 'All Shortcuts', count: shortcutCategories.reduce((sum, cat) => sum + cat.shortcuts.length, 0) },
    ...shortcutCategories.map(cat => ({ id: cat.id, name: cat.name, count: cat.shortcuts.length }))
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-3">
        <div 
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
        >
          <Keyboard 
            size={32} 
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
        <div>
          <h2 className="text-2xl font-display mb-2">Keyboard Shortcuts</h2>
          <p 
            className="max-w-md mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Master ZimboMate with powerful keyboard shortcuts for lightning-fast gameplay.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card variant="glass" padding="md">
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <Input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => {
                const isSelected = selectedCategory === category.id
                const Icon = category.id === 'all' ? Keyboard : getCategoryIcon(category.id)
                
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent ${
                      isSelected
                        ? 'border-primary/40 bg-primary/10 text-primary shadow-sm supports-[backdrop-filter]:backdrop-blur-sm'
                        : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={16} />
                    {category.name}
                    <Badge variant="secondary" size="sm">
                      {category.count}
                    </Badge>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shortcuts List */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
                <Search size={32} className="mx-auto mb-3 opacity-50" />
                <p>No shortcuts found for "{searchQuery}"</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCategories.map((category, categoryIndex) => {
            const Icon = getCategoryIcon(category.id)
            const color = getCategoryColor(category.id)

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
              >
                <Card variant="magical" padding="lg">
                  <CardContent>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: color, backgroundOpacity: 0.2 }}
                      >
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-display" style={{ color: 'var(--color-text-primary)' }}>
                          {category.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {category.shortcuts.length} shortcuts
                        </p>
                      </div>
                    </div>

                    {/* Shortcuts Grid */}
                    <div className="grid gap-3">
                      {category.shortcuts.map((shortcut, index) => (
                        <motion.div
                          key={shortcut.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <div className="flex-1">
                            <h4 
                              className="font-medium mb-1"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {shortcut.description}
                            </h4>
                            {shortcut.context && (
                              <p 
                                className="text-xs"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                Available in: {shortcut.context.join(', ')}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!shortcut.enabled && (
                              <Badge variant="secondary" size="sm">
                                Disabled
                              </Badge>
                            )}
                            <kbd 
                              className="px-3 py-1 rounded border font-mono text-sm"
                              style={{ 
                                borderColor: 'var(--color-primary)',
                                borderOpacity: 0.3,
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text-primary)'
                              }}
                            >
                              {keyboardShortcutsService.formatShortcut(shortcut)}
                            </kbd>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Tips */}
      <Card variant="glass" padding="md">
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Zap size={16} style={{ color: 'var(--color-accent)' }} />
              Pro Tips
            </h4>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p>• Press <kbd className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.3 }}>Ctrl+K</kbd> anytime to open the command palette</p>
              <p>• Number keys (1-6) work as stat modifiers when in the dice tab</p>
              <p>• <kbd className="px-2 py-1 rounded border text-xs" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.3 }}>Space</kbd> is your quick roll button - works in most contexts</p>
              <p>• Tab navigation (Ctrl+1-6) works from anywhere in the app</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}