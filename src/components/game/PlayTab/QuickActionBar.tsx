/**
 * QuickActionBar - One-Click Essentials
 *
 * Provides instant access to consumables, equipment swapping,
 * and emergency actions during active gameplay.
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Heart,
  Shield,
  Sword,
  Package,
  RotateCcw,
  AlertTriangle,
  Users,
  Star,
  Timer,
  Sparkles,
  Droplets,
  Flame,
  Plus,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { useChronicle } from '../../chronicle/ChronicleProvider'
import type { Character, Inventory } from '../../../models/Character'
import type { GameMode, PlayTabTheme } from '../PlayTab'

interface QuickActionBarProps {
  character: Character
  gameMode: GameMode
  theme: PlayTabTheme
  className?: string
}

interface QuickItem {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  type: 'consumable' | 'equipment' | 'emergency'
  uses?: number
  maxUses?: number
  color: string
  action: () => void
}

interface EmergencyAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  hotkey?: string
  action: () => void
}

const UseCounter: React.FC<{
  current: number
  max: number
  onIncrease: () => void
  onDecrease: () => void
}> = ({ current, max, onIncrease, onDecrease }) => {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Button
        variant="ghost"
        size="sm"
        onClick={onDecrease}
        disabled={current <= 0}
        className="w-5 h-5 p-0"
      >
        <Minus size={10} />
      </Button>
      <span className="font-mono text-xs min-w-[2ch] text-center">
        {current}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onIncrease}
        disabled={current >= max}
        className="w-5 h-5 p-0"
      >
        <Plus size={10} />
      </Button>
    </div>
  )
}

const QuickItemCard: React.FC<{
  item: QuickItem
  isActive: boolean
  onClick: () => void
}> = ({ item, isActive, onClick }) => {
  const Icon = item.icon

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative ${isActive ? 'ring-2 ring-primary/40' : ''}`}
    >
      <Card
        variant={isActive ? 'magical' : 'glass'}
        className={`cursor-pointer transition-all hover:shadow-md ${item.color}`}
        onClick={onClick}
      >
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto rounded-full bg-card/20 flex items-center justify-center">
            <Icon size={16} />
          </div>
          <div>
            <div className="text-xs font-medium truncate">{item.name}</div>
            {item.uses !== undefined && item.maxUses && (
              <div className="text-xs text-white/80">
                {item.uses}/{item.maxUses}
              </div>
            )}
          </div>
        </div>

        {/* Low uses warning */}
        {item.uses !== undefined && item.uses <= 1 && item.uses > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive/120 rounded-full flex items-center justify-center">
            <AlertTriangle size={8} className="text-white" />
          </div>
        )}
      </Card>
    </motion.div>
  )
}

const EmergencyButton: React.FC<{
  action: EmergencyAction
  disabled?: boolean
}> = ({ action, disabled = false }) => {
  const Icon = action.icon

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        variant="outline"
        className={`w-full h-16 flex flex-col gap-1 ${action.color} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={disabled ? undefined : action.action}
      >
        <Icon size={20} />
        <span className="text-xs">{action.name}</span>
        {action.hotkey && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {action.hotkey}
          </Badge>
        )}
      </Button>
    </motion.div>
  )
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  character,
  gameMode,
  theme,
  className = ''
}) => {
  const { emitEquipmentAction } = useChronicle()
  const [selectedCategory, setSelectedCategory] = useState<'consumables' | 'equipment' | 'emergency'>('consumables')

  // Extract consumable items from inventory
  const consumableItems = character.inventory?.filter(
    item => item.category === 'consumable' && (item.uses || 0) > 0
  ) || []

  // Convert inventory items to QuickItems
  const quickConsumables: QuickItem[] = consumableItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    icon: getItemIcon(item),
    type: 'consumable',
    uses: item.uses || 0,
    maxUses: item.uses || 1, // This would come from item definition
    color: getItemColor(item),
    action: () => useItem(item)
  }))

  // Quick equipment items (equipped weapons/armor)
  const equippedItems = character.inventory?.filter(item => item.equipped) || []
  const quickEquipment: QuickItem[] = equippedItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    icon: getItemIcon(item),
    type: 'equipment',
    color: getItemColor(item),
    action: () => swapEquipment(item)
  }))

  // Emergency actions based on game mode
  const emergencyActions: EmergencyAction[] = [
    {
      id: 'aid',
      name: 'Aid Another',
      description: 'Help a party member',
      icon: Users,
      color: 'bg-primary/100 hover:bg-primary text-white',
      hotkey: 'A',
      action: () => triggerEmergencyAction('aid')
    },
    {
      id: 'last-breath',
      name: 'Last Breath',
      description: 'Death saving throw',
      icon: Heart,
      color: 'bg-destructive hover:bg-destructive/75 text-white',
      hotkey: 'L',
      action: () => triggerEmergencyAction('last-breath')
    },
    {
      id: 'mark-xp',
      name: 'Mark XP',
      description: 'Failed roll XP',
      icon: Star,
      color: 'bg-accent hover:bg-accent text-white',
      hotkey: 'X',
      action: () => triggerEmergencyAction('mark-xp')
    }
  ]

  // Add game mode specific emergency actions
  if (gameMode === 'combat') {
    emergencyActions.unshift({
      id: 'defend-other',
      name: 'Defend Other',
      description: 'Protect an ally',
      icon: Shield,
      color: 'bg-chart-2 hover:bg-chart-2/85 text-white',
      hotkey: 'D',
      action: () => triggerEmergencyAction('defend-other')
    })
  }

  function getItemIcon(item: Inventory) {
    switch (item.category) {
      case 'consumable':
        if (item.name.toLowerCase().includes('healing')) return Heart
        if (item.name.toLowerCase().includes('potion')) return Droplets
        return Package
      case 'weapon':
        return Sword
      case 'armor':
        return Shield
      default:
        return Package
    }
  }

  function getItemColor(item: Inventory) {
    switch (item.category) {
      case 'consumable':
        return 'bg-chart-2 hover:bg-chart-2/85 text-white'
      case 'weapon':
        return 'bg-destructive/120 hover:bg-destructive text-white'
      case 'armor':
        return 'bg-primary/100 hover:bg-primary text-white'
      default:
        return 'bg-muted/500 hover:bg-gray-600 text-white'
    }
  }

  const useItem = useCallback((item: Inventory) => {
    console.log(`Using ${item.name}`)

    // Trigger Chronicle system
    emitEquipmentAction({
      characterName: character.name,
      action: 'use',
      itemName: item.name,
      itemType: item.category || 'item'
    })

    // TODO: Implement actual item usage logic
  }, [character.name, emitEquipmentAction])

  const swapEquipment = useCallback((item: Inventory) => {
    console.log(`Swapping ${item.name}`)

    // TODO: Implement equipment swapping logic
  }, [])

  const triggerEmergencyAction = useCallback((actionId: string) => {
    console.log(`Emergency action: ${actionId}`)

    // TODO: Implement emergency actions
  }, [])

  const currentItems =
    selectedCategory === 'consumables' ? quickConsumables :
    selectedCategory === 'equipment' ? quickEquipment :
    []

  const cardVariant =
    theme === 'combat' ? 'elevated' :
    theme === 'dungeon' ? 'parchment' :
    theme === 'tavern' ? 'magical' :
    'glass'

  return (
    <Card
      variant={cardVariant}
      className={`h-full overflow-y-auto ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap size={16} className="text-chart-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Category Selector */}
        <div className="flex gap-1">
          <Button
            variant={selectedCategory === 'consumables' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('consumables')}
            className="flex-1 text-xs"
          >
            <Droplets size={12} className="mr-1" />
            Items
          </Button>
          <Button
            variant={selectedCategory === 'equipment' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('equipment')}
            className="flex-1 text-xs"
          >
            <Sword size={12} className="mr-1" />
            Gear
          </Button>
          <Button
            variant={selectedCategory === 'emergency' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('emergency')}
            className="flex-1 text-xs"
          >
            <AlertTriangle size={12} className="mr-1" />
            SOS
          </Button>
        </div>

        {/* Content Area */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            {/* Consumables */}
            {selectedCategory === 'consumables' && (
              <motion.div
                key="consumables"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {quickConsumables.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    <Package size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No consumable items</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {quickConsumables.map(item => (
                      <QuickItemCard
                        key={item.id}
                        item={item}
                        isActive={false}
                        onClick={item.action}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Equipment */}
            {selectedCategory === 'equipment' && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {quickEquipment.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    <Sword size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No equipped items</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quickEquipment.map(item => (
                      <QuickItemCard
                        key={item.id}
                        item={item}
                        isActive={false}
                        onClick={item.action}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Emergency Actions */}
            {selectedCategory === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {emergencyActions.map(action => (
                  <EmergencyButton
                    key={action.id}
                    action={action}
                    disabled={false}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game Mode Specific Quick Tips */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            {gameMode === 'combat' && '⚔️ Combat: Use items strategically'}
            {gameMode === 'exploration' && '🗺️ Exploration: Conserve resources'}
            {gameMode === 'social' && '🤝 Social: Items can be conversation tools'}
            {gameMode === 'rest' && '🏕️ Rest: Perfect time to organize gear'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActionBar





