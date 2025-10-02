import type { Character } from '../../models/Character'
import type { Inventory } from '../../models/Inventory'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import { Backpack, Shield, Sword } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { calculateInventoryStats } from '../../models/Inventory'
import { useInventoryStore } from '../../stores/inventoryStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui'
import { EquippedItemsDisplay } from './EquippedItemsDisplay'
import { InventoryContainer } from './InventoryContainer'
import { InventoryControls } from './InventoryControls'
import { InventoryStats } from './InventoryStats'
import { LoadTracker } from './LoadTracker'

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
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

const TAB_CONFIG = [
  { id: 'equipped', label: 'Equipped', icon: Sword },
  { id: 'inventory', label: 'Inventory', icon: Backpack },
  { id: 'stats', label: 'Statistics', icon: Shield },
] as const

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  character,
  onItemEquip,
  onItemUnequip,
  onItemUse,
  onItemDrop,
  onInventoryUpdate,
}) => {
  const { inventory, setInventory } = useInventoryStore()
  const [activeTab, setActiveTab] = useState<(typeof TAB_CONFIG)[number]['id']>('equipped')

  useEffect(() => {
    if (!character.inventory || inventory) {
      return
    }

    const nextInventory: Inventory = {
      items: {},
      containers: [
        { id: 'equipped', name: 'Equipped', category: 'equipped', items: [] },
        { id: 'carried', name: 'Carried', category: 'carried', items: [] },
        { id: 'consumables', name: 'Consumables', category: 'consumables', items: [] },
      ],
      quickSlots: [],
      lastUpdated: new Date(),
    }

    character.inventory.forEach((item) => {
      nextInventory.items[item.id] = item

      if (item.equipped) {
        nextInventory.containers.find(container => container.category === 'equipped')?.items.push(item.id)
        return
      }

      if (item.category === 'consumable') {
        nextInventory.containers.find(container => container.category === 'consumables')?.items.push(item.id)
        return
      }

      nextInventory.containers.find(container => container.category === 'carried')?.items.push(item.id)
    })

    setInventory(nextInventory)
    onInventoryUpdate(nextInventory)
  }, [character.inventory, inventory, onInventoryUpdate, setInventory])

  const inventoryStats = useMemo(
    () => (inventory ? calculateInventoryStats(inventory, character.load.max) : null),
    [character.load.max, inventory],
  )

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

      <motion.div variants={cardVariants}>
        <Card variant="parchment">
          <CardContent className="p-6">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex gap-1 p-1 bg-(--parchment-200) rounded-lg mb-6">
                {TAB_CONFIG.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <Tabs.Trigger key={tab.id} value={tab.id} asChild>
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
                      </motion.button>
                    </Tabs.Trigger>
                  )
                })}
              </Tabs.List>

              <Tabs.Content value="equipped" asChild>
                <div className="space-y-6">
                  <InventoryControls
                    character={character}
                    inventory={inventory}
                    onItemEquip={onItemEquip}
                    onItemUnequip={onItemUnequip}
                    onItemUse={onItemUse}
                    onItemDrop={onItemDrop}
                  />

                  <EquippedItemsDisplay
                    character={character}
                    inventory={inventory}
                    onItemUnequip={onItemUnequip}
                    onItemUse={onItemUse}
                  />
                </div>
              </Tabs.Content>

              <Tabs.Content value="inventory" asChild>
                <InventoryContainer
                  character={character}
                  inventory={inventory}
                  onItemEquip={onItemEquip}
                  onItemUnequip={onItemUnequip}
                  onItemUse={onItemUse}
                  onItemDrop={onItemDrop}
                />
              </Tabs.Content>

              <Tabs.Content value="stats" asChild>
                <InventoryStats
                  character={character}
                  inventory={inventory}
                  inventoryStats={inventoryStats}
                />
              </Tabs.Content>
            </Tabs.Root>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
