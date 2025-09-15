import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Card, CardContent, Button, Badge } from '../ui'
import { Item, isWeapon, isArmor, formatTags } from '../../models/Equipment'
import { formatWeight, formatValue, formatItemQuantity } from '../../equipmentSystemMockData'
import { 
  Sword, 
  Shield, 
  Wine, 
  Gem, 
  Package, 
  MoreHorizontal,
  Eye,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface ItemCardProps {
  item: Item
  isEquipped: boolean
  onEquip?: (itemId: string) => void
  onUnequip?: (itemId: string) => void
  onUse?: (itemId: string) => void
  onDrop?: (itemId: string) => void
  onInspect?: (itemId: string) => void
  showActions?: boolean
  compact?: boolean
  isDragging?: boolean
}

const getItemIcon = (item: Item) => {
  switch (item.category) {
    case 'weapon':
      return Sword
    case 'armor':
      return Shield
    case 'consumable':
      return Wine
    case 'treasure':
      return Gem
    default:
      return Package
  }
}

const getRarityColor = (item: Item) => {
  // Simple rarity detection based on value
  if (!item.value) return 'item-common'
  if (item.value > 200) return 'item-legendary'
  if (item.value > 100) return 'item-rare'
  if (item.value > 50) return 'item-uncommon'
  return 'item-common'
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isEquipped,
  onEquip,
  onUnequip,
  onUse,
  onDrop,
  onInspect,
  showActions = true,
  compact = false,
  isDragging = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const ItemIcon = getItemIcon(item)
  const rarityClass = getRarityColor(item)

  const cardVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98
    }
  }

  const handleEquipToggle = () => {
    if (isEquipped && onUnequip) {
      onUnequip(item.id)
    } else if (!isEquipped && onEquip) {
      onEquip(item.id)
    }
  }

  const handleUse = () => {
    if (onUse) {
      onUse(item.id)
    }
  }

  const handleDrop = () => {
    if (onDrop) {
      onDrop(item.id)
    }
  }

  const handleInspect = () => {
    if (onInspect) {
      onInspect(item.id)
    }
  }

  const ItemTooltipContent = () => (
    <div className="space-y-3 max-w-sm">
      <div className="flex items-start gap-3">
        <ItemIcon size={20} className="text-(--parchment-800) mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-(--parchment-900) font-display">
            {item.name}
            {formatItemQuantity(item.quantity) && (
              <span className="ml-2 text-sm text-(--parchment-600)">
                {formatItemQuantity(item.quantity)}
              </span>
            )}
          </h4>
          <p className="text-xs text-(--parchment-600) capitalize font-ui">
            {item.category}
            {isEquipped && (
              <Badge variant="success" className="ml-2 text-xs">
                Equipped
              </Badge>
            )}
          </p>
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-(--parchment-700) font-body">
          {item.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-(--parchment-600)">Weight:</span>
          <span className="ml-1 text-(--parchment-800) font-medium">
            {formatWeight(item.weight)}
          </span>
        </div>
        {item.value && (
          <div>
            <span className="text-(--parchment-600)">Value:</span>
            <span className="ml-1 text-(--parchment-800) font-medium">
              {formatValue(item.value)}
            </span>
          </div>
        )}
      </div>

      {isWeapon(item) && item.damage && (
        <div className="text-xs">
          <span className="text-(--parchment-600)">Damage:</span>
          <span className="ml-1 text-(--parchment-800) font-medium">
            {item.damage}
          </span>
        </div>
      )}

      {isArmor(item) && (
        <div className="text-xs">
          <span className="text-(--parchment-600)">Armor:</span>
          <span className="ml-1 text-(--parchment-800) font-medium">
            {item.armorValue} AC
          </span>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="text-xs">
          <span className="text-(--parchment-600)">Tags:</span>
          <p className="text-(--parchment-700) mt-1">
            {formatTags(item.tags)}
          </p>
        </div>
      )}

      {item.uses && (
        <div className="text-xs">
          <span className="text-(--parchment-600)">Uses:</span>
          <span className="ml-1 text-(--parchment-800) font-medium">
            {item.uses.current}/{item.uses.max}
          </span>
        </div>
      )}
    </div>
  )

  if (compact) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.div
            className={`item-card ${isEquipped ? 'item-card-equipped' : ''} ${rarityClass} ${
              isDragging ? 'item-card-dragging' : ''
            } cursor-pointer h-full flex items-center justify-center p-2`}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <ItemIcon size={16} className="text-(--parchment-800)" />
          </motion.div>
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-(--color-surface) border border-(--parchment-300) rounded-lg p-3 shadow-lg z-50"
            sideOffset={5}
          >
            <ItemTooltipContent />
            <Tooltip.Arrow className="fill-(--color-surface)" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <motion.div
          className={`item-card ${isEquipped ? 'item-card-equipped' : ''} ${rarityClass} ${
            isDragging ? 'item-card-dragging' : ''
          }`}
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ItemIcon size={20} className="text-(--parchment-800)" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-(--parchment-900) font-display text-sm truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-(--parchment-600) capitalize font-ui">
                      {item.category}
                    </span>
                    {formatItemQuantity(item.quantity) && (
                      <Badge variant="secondary" className="text-xs">
                        {formatItemQuantity(item.quantity)}
                      </Badge>
                    )}
                    {isEquipped && (
                      <Badge variant="success" className="text-xs">
                        Equipped
                      </Badge>
                    )}
                  </div>
                </div>

                {showActions && (
                  <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-(--parchment-600) hover:text-(--parchment-800)"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="bg-(--color-surface) border border-(--parchment-300) rounded-lg p-1 shadow-lg z-50 min-w-[160px]"
                        sideOffset={5}
                      >
                        {!isEquipped && onEquip && (
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-(--parchment-100) cursor-pointer"
                            onClick={handleEquipToggle}
                          >
                            <ArrowUpRight size={14} />
                            Equip
                          </DropdownMenu.Item>
                        )}

                        {isEquipped && onUnequip && (
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-(--parchment-100) cursor-pointer"
                            onClick={handleEquipToggle}
                          >
                            <ArrowDownRight size={14} />
                            Unequip
                          </DropdownMenu.Item>
                        )}

                        {item.category === 'consumable' && onUse && (
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-(--parchment-100) cursor-pointer"
                            onClick={handleUse}
                          >
                            <Wine size={14} />
                            Use
                          </DropdownMenu.Item>
                        )}

                        {onInspect && (
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-(--parchment-100) cursor-pointer"
                            onClick={handleInspect}
                          >
                            <Eye size={14} />
                            Inspect
                          </DropdownMenu.Item>
                        )}

                        <DropdownMenu.Separator className="h-px bg-(--parchment-300) my-1" />

                        {onDrop && (
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-(--danger-100) text-(--danger-600) cursor-pointer"
                            onClick={handleDrop}
                          >
                            <Trash2 size={14} />
                            Drop
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-(--parchment-600)">
                <span>{formatWeight(item.weight)}</span>
                {item.value && <span>{formatValue(item.value)}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      </Tooltip.Trigger>
      
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-(--color-surface) border border-(--parchment-300) rounded-lg p-3 shadow-lg z-50"
          sideOffset={5}
        >
          <ItemTooltipContent />
          <Tooltip.Arrow className="fill-(--color-surface)" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}