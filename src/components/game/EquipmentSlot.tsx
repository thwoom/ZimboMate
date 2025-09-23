import React from 'react'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Item } from '../../models/Equipment'
import { Button } from '../ui'
import { ArrowDownRight, LucideIcon } from 'lucide-react'

interface EquipmentSlotProps {
  slot: {
    id: string
    name: string
    icon: LucideIcon
    category: string
  }
  equippedItem?: Item
  onItemUnequip: (itemId: string) => void
}

export const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slot,
  equippedItem,
  onItemUnequip
}) => {
  const SlotIcon = slot.icon

  const handleUnequip = () => {
    if (equippedItem) {
      onItemUnequip(equippedItem.id)
    }
  }

  if (equippedItem) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.div
            className="equipment-slot equipment-slot-filled group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUnequip}
            style={{ cursor: 'pointer' }}
            title={`Click to unequip ${equippedItem.name}`}
          >
            <div className="flex flex-col items-center gap-2 p-3">
              <SlotIcon size={24} className="text-(--gold-600)" />
              <div className="text-center">
                <p className="text-xs font-semibold text-(--parchment-900) truncate max-w-[80px] font-display">
                  {equippedItem.name}
                </p>
                <p className="text-xs text-(--parchment-600) font-ui">
                  {slot.name}
                </p>
              </div>
            </div>

            {/* Unequip Button - always visible with subtle styling */}
            <motion.div
              className="absolute top-1 right-1 opacity-60 group-hover:opacity-100"
              initial={{ opacity: 0.6, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-(--parchment-600) hover:text-(--danger-600) bg-card/80 backdrop-blur-sm"
                onClick={handleUnequip}
              >
                <ArrowDownRight size={12} />
              </Button>
            </motion.div>
          </motion.div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-card border border-(--parchment-300) rounded-lg p-3 shadow-lg z-50 max-w-xs"
            sideOffset={5}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SlotIcon size={16} className="text-(--gold-600)" />
                <span className="font-semibold text-(--parchment-900) font-display">
                  {equippedItem.name}
                </span>
              </div>
              
              {equippedItem.description && (
                <p className="text-sm text-(--parchment-700) font-body">
                  {equippedItem.description}
                </p>
              )}
              
              <div className="text-xs text-(--parchment-600)">
                Equipped in {slot.name}
              </div>
            </div>
            <Tooltip.Arrow className="fill-card" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.div
          className="equipment-slot equipment-slot-hover"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center gap-2 p-3">
            <SlotIcon size={24} className="text-(--parchment-500)" />
            <div className="text-center">
              <p className="text-xs font-medium text-(--parchment-700) font-ui">
                {slot.name}
              </p>
              <p className="text-xs text-(--parchment-500) font-ui">
                Empty
              </p>
            </div>
          </div>
        </motion.div>
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-card border border-(--parchment-300) rounded-lg p-2 shadow-lg z-50"
          sideOffset={5}
        >
          <p className="text-sm text-(--parchment-700)">
            {slot.name} slot - drag an item here to equip
          </p>
          <Tooltip.Arrow className="fill-card" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}