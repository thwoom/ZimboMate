import type { Container, Inventory } from '../../models/Inventory'
import * as Collapsible from '@radix-ui/react-collapsible'
import { motion } from 'framer-motion'
import {
  Backpack,
  ChevronRight,
  Gem,
  Package,
  Plus,
  Wine,
} from 'lucide-react'
import React, { useState } from 'react'
import { getContainerItems } from '../../models/Inventory'
import { useInventoryStore } from '../../stores/inventoryStore'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { ItemCard } from './ItemCard'

interface InventoryContainerProps {
  container: Container
  inventory: Inventory
  onItemEquip: (itemId: string) => void
  onItemUse: (itemId: string) => void
  onItemDrop: (itemId: string) => void
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'carried':
      return Backpack
    case 'consumables':
      return Wine
    case 'treasure':
      return Gem
    default:
      return Package
  }
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

const contentVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

const itemsGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
}

export const InventoryContainer: React.FC<InventoryContainerProps> = ({
  container,
  inventory,
  onItemEquip,
  onItemUse,
  onItemDrop,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const { inventoryView, filterBy, searchQuery, sortBy } = useInventoryStore()

  const items = getContainerItems(inventory, container.id)
  const CategoryIcon = getCategoryIcon(container.category)

  // Filter and sort items
  let filteredItems = items

  // Apply search filter
  if (searchQuery) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
      || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }

  // Apply category filter
  if (filterBy !== 'all') {
    filteredItems = filteredItems.filter((item) => {
      switch (filterBy) {
        case 'weapons':
          return item.category === 'weapon'
        case 'armor':
          return item.category === 'armor'
        case 'consumables':
          return item.category === 'consumable'
        case 'treasure':
          return item.category === 'treasure'
        case 'magical':
          return item.tags.some(tag => tag.name === 'magical')
        case 'equipped':
          return item.equipped
        default:
          return true
      }
    })
  }

  // Apply sorting
  filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'weight':
        return (b.weight * b.quantity) - (a.weight * a.quantity)
      case 'value':
        return (b.value || 0) - (a.value || 0)
      case 'category':
        return a.category.localeCompare(b.category)
      default:
        return 0
    }
  })

  const getGridClass = () => {
    switch (inventoryView) {
      case 'list':
        return 'inventory-list'
      case 'compact':
        return 'inventory-compact'
      default:
        return 'inventory-grid'
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card variant="surface">
        <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
          <Collapsible.Trigger asChild>
            <CardHeader className="cursor-pointer hover:bg-(--parchment-100) transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon size={20} className="text-(--parchment-800)" />
                  <div>
                    <CardTitle className="text-lg font-display text-(--parchment-900)">
                      {container.name}
                    </CardTitle>
                    <p className="text-sm text-(--parchment-600) font-ui">
                      {filteredItems.length}
                      {' '}
                      {filteredItems.length === 1 ? 'item' : 'items'}
                      {container.maxWeight && (
                        <span className="ml-2">
                          • Max:
                          {' '}
                          {container.maxWeight}
                          {' '}
                          lbs
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} className="text-(--parchment-600)" />
                </motion.div>
              </div>
            </CardHeader>
          </Collapsible.Trigger>

          <Collapsible.Content asChild>
            <motion.div
              variants={contentVariants}
              initial="closed"
              animate={isOpen ? 'open' : 'closed'}
            >
              <CardContent className="pt-0">
                {filteredItems.length > 0 ? (
                  <motion.div
                    className={getGridClass()}
                    variants={itemsGridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredItems.map(item => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                      >
                        <ItemCard
                          item={item}
                          isEquipped={item.equipped}
                          onEquip={onItemEquip}
                          onUnequip={(itemId) => {
                            // Handle unequip logic here
                            console.log('Unequipping:', itemId)
                          }}
                          onUse={onItemUse}
                          onDrop={onItemDrop}
                          showActions={true}
                          compact={inventoryView === 'compact'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CategoryIcon size={48} className="text-(--parchment-400) mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-(--parchment-700) mb-2 font-display">
                      {searchQuery || filterBy !== 'all' ? 'No matching items' : `No ${container.name.toLowerCase()}`}
                    </h3>
                    <p className="text-(--parchment-600) font-body mb-4">
                      {searchQuery || filterBy !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : `Add items to your ${container.name.toLowerCase()} to see them here.`}
                    </p>

                    {container.category === 'carried' && !searchQuery && filterBy === 'all' && (
                      <Button variant="outline" size="sm">
                        <Plus size={16} />
                        Add Item
                      </Button>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          </Collapsible.Content>
        </Collapsible.Root>
      </Card>
    </motion.div>
  )
}
