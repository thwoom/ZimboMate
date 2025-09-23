import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button,
  Input,
  Progress
} from '../ui'
import { Character } from '../../models/Character'
import { Inventory, calculateInventoryStats } from '../../models/Inventory'
import { useInventoryStore } from '../../stores/inventoryStore'
import { EquippedItemsDisplay } from './EquippedItemsDisplay'
import { InventoryContainer } from './InventoryContainer'
import { LoadTracker } from './LoadTracker'
import { InventoryControls } from './InventoryControls'
import { InventoryStats } from './InventoryStats'
import { Sword, Shield, Backpack, Search, Filter, SortAsc } from 'lucide-react'

interface EquipmentPanelProps {
  character: Character
  onItemEquip: (itemId: string) => void
  onItemUnequip: (itemId: string) => void
  onItemUse: (itemId: string) => void
  onItemDrop: (itemId: string) => void
  onInventoryUpdate: (inventory: Inventory) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  character,
  onItemEquip,
  onItemUnequip,
  onItemUse,
  onItemDrop,
  onInventoryUpdate
}) => {
  const { 
    inventory, 
    setInventory,
    inventoryView,
    sortBy,
    filterBy,
    searchQuery
  } = useInventoryStore()

  const [activeTab, setActiveTab] = useState('equipped')

  // Initialize inventory from character
  useEffect(() => {
    if (character.inventory && !inventory) {
      const mockInventory: Inventory = {
        items: {},
        containers: [
          {
            id: 'equipped',
            name: 'Equipped',
            category: 'equipped',
            items: [],
          },
          {
            id: 'carried',
            name: 'Carried',
            category: 'carried',
            items: [],
          },
          {
            id: 'consumables',
            name: 'Consumables',
            category: 'consumables',
            items: [],
          },
        ],
        quickSlots: [],
        lastUpdated: new Date(),
      }

      // Add character items to inventory
      character.inventory.forEach(item => {
        mockInventory.items[item.id] = item
        
        if (item.equipped) {
          const equippedContainer = mockInventory.containers.find(c => c.category === 'equipped')
          if (equippedContainer) {
            equippedContainer.items.push(item.id)
          }
        } else if (item.category === 'consumable') {
          const consumablesContainer = mockInventory.containers.find(c => c.category === 'consumables')
          if (consumablesContainer) {
            consumablesContainer.items.push(item.id)
          }
        } else {
          const carriedContainer = mockInventory.containers.find(c => c.category === 'carried')
          if (carriedContainer) {
            carriedContainer.items.push(item.id)
          }
        }
      })

      setInventory(mockInventory)
    }
  }, [character.inventory, inventory, setInventory])

  // Calculate inventory stats
  const inventoryStats = inventory ? calculateInventoryStats(inventory, character.load.max) : null

  const tabs = [
    { id: 'equipped', label: 'Equipped', icon: Sword },
    { id: 'inventory', label: 'Inventory', icon: Backpack },
    { id: 'stats', label: 'Statistics', icon: Shield }
  ]

  if (!inventory) {
    return (
      <Card variant="parchment">
        <CardContent className="p-6 pt-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Load Tracking */}
      <motion.div variants={cardVariants}>
        <Card variant="magical">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-(--parchment-900) font-bold">
                  <Backpack size={24} className="text-(--parchment-800)" />
                  Equipment & Inventory
                </CardTitle>
                <CardDescription className="text-lg text-(--parchment-700) font-semibold">
                  Manage your character's equipment and possessions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <LoadTracker
              currentLoad={character.load.current}
              maxLoad={character.load.max}
              encumbranceStatus={inventoryStats?.encumbranceStatus || 'normal'}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Equipment Interface */}
      <motion.div variants={cardVariants}>
        <Card variant="parchment">
          <CardContent className="p-6">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation */}
            <Tabs.List className="flex gap-1 p-1 bg-(--parchment-200) rounded-lg mb-6">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    asChild
                  >
                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                        isActive 
                          ? 'bg-card text-(--parchment-900) shadow-sm' 
                          : 'text-(--parchment-700) hover:text-(--parchment-900) hover:bg-(--parchment-100)'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={16} />
                      {tab.label}
                      
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="activeEquipmentTab"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </Tabs.Trigger>
                )
              })}
            </Tabs.List>

            {/* Tab Content */}
            <Tabs.Content value="equipped" asChild>
              <motion.div
                key={`equipped-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: activeTab === 'equipped' ? 'block' : 'none' }}
              >
                <EquippedItemsDisplay
                  inventory={inventory}
                  onItemUnequip={onItemUnequip}
                  onItemUse={onItemUse}
                />
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="inventory" asChild>
              <motion.div
                key={`inventory-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                style={{ display: activeTab === 'inventory' ? 'block' : 'none' }}
              >
                <InventoryControls />
                
                <div className="grid gap-6">
                  {inventory.containers
                    .filter(container => container.category !== 'equipped')
                    .map(container => (
                      <InventoryContainer
                        key={`container-${container.id}`}
                        container={container}
                        inventory={inventory}
                        onItemEquip={onItemEquip}
                        onItemUse={onItemUse}
                        onItemDrop={onItemDrop}
                      />
                    ))}
                </div>
              </motion.div>
            </Tabs.Content>

            <Tabs.Content value="stats" asChild>
              <motion.div
                key={`stats-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: activeTab === 'stats' ? 'block' : 'none' }}
              >
                {inventoryStats && (
                  <InventoryStats
                    stats={inventoryStats}
                    character={character}
                  />
                )}
              </motion.div>
            </Tabs.Content>
            </Tabs.Root>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}