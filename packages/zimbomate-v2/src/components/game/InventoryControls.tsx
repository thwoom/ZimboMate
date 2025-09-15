import React from 'react'
import { motion } from 'framer-motion'
import * as Select from '@radix-ui/react-select'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Input, Button } from '../ui'
import { useInventoryStore } from '../../stores/inventoryStore'
import { InventoryView, ItemSortBy, InventoryFilter } from '../../equipmentSystemMockData'
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List, 
  MoreHorizontal,
  ChevronDown,
  X
} from 'lucide-react'

export const InventoryControls: React.FC = () => {
  const {
    inventoryView,
    sortBy,
    filterBy,
    searchQuery,
    setInventoryView,
    setSortBy,
    setFilterBy,
    setSearchQuery
  } = useInventoryStore()

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'weapons', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'treasure', label: 'Treasure' },
    { value: 'magical', label: 'Magical' },
    { value: 'equipped', label: 'Equipped' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'weight', label: 'Weight' },
    { value: 'value', label: 'Value' },
    { value: 'category', label: 'Category' },
    { value: 'recently_added', label: 'Recently Added' }
  ]

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--parchment-600)">
            <Search size={16} />
          </div>
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-(--parchment-600) hover:text-(--parchment-800)"
              onClick={handleClearSearch}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <ToggleGroup.Root
          type="single"
          value={inventoryView}
          onValueChange={(value) => value && setInventoryView(value as InventoryView)}
          className="flex border border-(--parchment-300) rounded-lg p-1 bg-(--color-surface)"
        >
          <ToggleGroup.Item
            value="grid"
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors data-[state=on]:bg-(--color-primary) data-[state=on]:text-white hover:bg-(--parchment-100)"
          >
            <Grid3X3 size={14} />
            <span className="hidden sm:inline">Grid</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="list"
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors data-[state=on]:bg-(--color-primary) data-[state=on]:text-white hover:bg-(--parchment-100)"
          >
            <List size={14} />
            <span className="hidden sm:inline">List</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="compact"
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors data-[state=on]:bg-(--color-primary) data-[state=on]:text-white hover:bg-(--parchment-100)"
          >
            <MoreHorizontal size={14} />
            <span className="hidden sm:inline">Compact</span>
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filter Select */}
        <div className="flex-1">
          <Select.Root value={filterBy} onValueChange={(value) => setFilterBy(value as InventoryFilter)}>
            <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm bg-(--color-surface) border border-(--parchment-300) rounded-lg hover:border-(--parchment-400) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-colors">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-(--parchment-600)" />
                <Select.Value />
              </div>
              <Select.Icon>
                <ChevronDown size={14} className="text-(--parchment-600)" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-(--color-surface) border border-(--parchment-300) rounded-lg shadow-lg z-50 overflow-hidden">
                <Select.Viewport className="p-1">
                  {filterOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-(--parchment-100) focus:bg-(--parchment-100) outline-none data-[state=checked]:bg-(--color-primary) data-[state=checked]:text-white"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Sort Select */}
        <div className="flex-1">
          <Select.Root value={sortBy} onValueChange={(value) => setSortBy(value as ItemSortBy)}>
            <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm bg-(--color-surface) border border-(--parchment-300) rounded-lg hover:border-(--parchment-400) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-colors">
              <div className="flex items-center gap-2">
                <SortAsc size={14} className="text-(--parchment-600)" />
                <Select.Value />
              </div>
              <Select.Icon>
                <ChevronDown size={14} className="text-(--parchment-600)" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-(--color-surface) border border-(--parchment-300) rounded-lg shadow-lg z-50 overflow-hidden">
                <Select.Viewport className="p-1">
                  {sortOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-(--parchment-100) focus:bg-(--parchment-100) outline-none data-[state=checked]:bg-(--color-primary) data-[state=checked]:text-white"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterBy !== 'all') && (
        <motion.div
          className="flex flex-wrap items-center gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs text-(--parchment-600) font-medium">Active filters:</span>
          
          {searchQuery && (
            <div className="flex items-center gap-1 px-2 py-1 bg-(--parchment-200) text-(--parchment-800) text-xs rounded-md">
              <Search size={12} />
              <span>"{searchQuery}"</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-(--parchment-600) hover:text-(--parchment-800)"
                onClick={handleClearSearch}
              >
                <X size={10} />
              </Button>
            </div>
          )}
          
          {filterBy !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-(--parchment-200) text-(--parchment-800) text-xs rounded-md">
              <Filter size={12} />
              <span>{filterOptions.find(opt => opt.value === filterBy)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-(--parchment-600) hover:text-(--parchment-800)"
                onClick={() => setFilterBy('all' as InventoryFilter)}
              >
                <X size={10} />
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}