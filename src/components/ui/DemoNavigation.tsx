import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid, 
  List, 
  Filter, 
  Search, 
  Home, 
  ArrowLeft,
  Sparkles,
  Dices
} from 'lucide-react'
import { Button, Badge } from './index'

interface DemoNavigationProps {
  currentDemo?: string
  onNavigateHome: () => void
  onNavigateBack?: () => void
  categories: Array<{
    id: string
    label: string
    count: number
    color: string
  }>
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onToggleFilters: () => void
}

export const DemoNavigation: React.FC<DemoNavigationProps> = ({
  currentDemo,
  onNavigateHome,
  onNavigateBack,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="space-y-4">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentDemo ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Demos
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Dices className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                {currentDemo ? 'Demo Viewer' : 'ZimboMate V2 Demos'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentDemo ? 'Interactive demonstration' : 'Interactive component showcase'}
              </p>
            </div>
          </div>
        </div>

        {!currentDemo && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className={showFilters ? 'bg-popover' : ''}
            >
              <Filter size={16} />
            </Button>
            <div className="flex items-center bg-card rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="p-2"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="p-2"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <AnimatePresence>
        {showFilters && !currentDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-4 bg-card rounded-lg border border-border"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search demos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange('all')}
                  className="flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  All Demos
                  <Badge variant="secondary" className="text-xs">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </Badge>
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(category.id)}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${category.color}`}
                    />
                    {category.label}
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}