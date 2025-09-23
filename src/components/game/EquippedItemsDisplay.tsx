import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui'
import { Inventory, getContainerItems } from '../../models/Inventory'
import { ItemCard } from './ItemCard'
import { EquipmentSlot } from './EquipmentSlot'
import { Sword, Shield, Shirt, Crown, Footprints, Hand } from 'lucide-react'

interface EquippedItemsDisplayProps {
  inventory: Inventory
  onItemUnequip: (itemId: string) => void
  onItemUse: (itemId: string) => void
}

const equipmentSlots = [
  { id: 'main-hand', name: 'Main Hand', icon: Sword, category: 'weapon' },
  { id: 'off-hand', name: 'Off Hand', icon: Shield, category: 'weapon' },
  { id: 'armor', name: 'Armor', icon: Shirt, category: 'armor' },
  { id: 'helmet', name: 'Helmet', icon: Crown, category: 'armor' },
  { id: 'boots', name: 'Boots', icon: Footprints, category: 'gear' },
  { id: 'accessory', name: 'Accessory', icon: Hand, category: 'gear' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const slotVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

export const EquippedItemsDisplay: React.FC<EquippedItemsDisplayProps> = ({
  inventory,
  onItemUnequip,
  onItemUse
}) => {
  const equippedItems = getContainerItems(inventory, 'equipped')

  // Group equipped items by type for slot assignment
  const getItemForSlot = (slotCategory: string) => {
    return equippedItems.find(item => {
      if (slotCategory === 'weapon') {
        return item.category === 'weapon'
      }
      if (slotCategory === 'armor') {
        return item.category === 'armor'
      }
      return item.category === 'gear'
    })
  }

  return (
    <Card variant="magical">
      <CardHeader>
        <CardTitle className="text-xl font-display text-(--parchment-900) flex items-center gap-2">
          <Sword size={20} className="text-(--parchment-800)" />
          Equipped Items
        </CardTitle>
        <p className="text-(--parchment-700) font-body">
          Currently equipped weapons, armor, and accessories
        </p>
      </CardHeader>

      <CardContent>
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Equipment Slots Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {equipmentSlots.map((slot) => {
              const equippedItem = getItemForSlot(slot.category)
              
              return (
                <motion.div
                  key={slot.id}
                  variants={slotVariants}
                >
                  <EquipmentSlot
                    slot={slot}
                    equippedItem={equippedItem}
                    onItemUnequip={onItemUnequip}
                  />
                </motion.div>
              )
            })}
          </motion.div>

          {/* All Equipped Items List */}
          {equippedItems.length > 0 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-(--parchment-900) font-display">
                All Equipped Items
              </h3>
              
              <div className="space-y-2">
                {equippedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ItemCard
                      item={item}
                      isEquipped={true}
                      onUnequip={onItemUnequip}
                      onUse={onItemUse}
                      showActions={true}
                      compact={false}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {equippedItems.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sword size={48} className="text-(--parchment-400) mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-(--parchment-700) mb-2 font-display">
                No Equipment
              </h3>
              <p className="text-(--parchment-600) font-body">
                Equip weapons, armor, and accessories to see them here.
              </p>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}