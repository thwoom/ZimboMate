import React, { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { EquipmentPanel } from './components/game/EquipmentPanel'
import { Sparkles, User, Dice6, Scroll, Backpack, Settings } from 'lucide-react'
import { Card, CardContent, Button } from './components/ui'
import { mockCharacterWithInventory } from './equipmentSystemMockData'
import { useInventoryStore } from './stores/inventoryStore'

type ActiveTab = 'character' | 'equipment' | 'dice' | 'moves' | 'settings'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('equipment')
  const [character] = useState(mockCharacterWithInventory())
  const { setInventory } = useInventoryStore()

  // Initialize inventory store with character data
  React.useEffect(() => {
    if (character.inventory) {
      const mockInventory = {
        items: {},
        containers: [
          {
            id: 'equipped',
            name: 'Equipped',
            category: 'equipped' as const,
            items: [],
          },
          {
            id: 'carried',
            name: 'Carried',
            category: 'carried' as const,
            items: [],
          },
          {
            id: 'consumables',
            name: 'Consumables',
            category: 'consumables' as const,
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
  }, [character.inventory, setInventory])

  const tabs = [
    { id: 'character' as const, label: 'Character', icon: User },
    { id: 'equipment' as const, label: 'Equipment', icon: Backpack },
    { id: 'dice' as const, label: 'Dice', icon: Dice6 },
    { id: 'moves' as const, label: 'Moves', icon: Scroll },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ]

  const handleItemEquip = (itemId: string) => {
    console.log('Equipping item:', itemId)
  }

  const handleItemUnequip = (itemId: string) => {
    console.log('Unequipping item:', itemId)
  }

  const handleItemUse = (itemId: string) => {
    console.log('Using item:', itemId)
  }

  const handleItemDrop = (itemId: string) => {
    console.log('Dropping item:', itemId)
  }

  const handleInventoryUpdate = (inventory: any) => {
    console.log('Inventory updated:', inventory)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'character':
        return (
          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Character Sheet</h2>
                <p className="text-gray-600">Character sheet coming soon!</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'equipment':
        return (
          <EquipmentPanel
            character={character}
            onItemEquip={handleItemEquip}
            onItemUnequip={handleItemUnequip}
            onItemUse={handleItemUse}
            onItemDrop={handleItemDrop}
            onInventoryUpdate={handleInventoryUpdate}
          />
        )
      case 'dice':
        return (
          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-md mx-auto">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Dice Roller</h2>
                <p className="text-gray-600">Dice roller coming soon!</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'moves':
        return (
          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Moves Panel</h2>
                <p className="text-gray-600">Moves panel coming soon!</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'settings':
        return (
          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <p className="text-gray-600">
                  Settings panel coming soon! This will include audio controls, 
                  animation preferences, and character import/export.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return (
          <EquipmentPanel
            character={character}
            onItemEquip={handleItemEquip}
            onItemUnequip={handleItemUnequip}
            onItemUse={handleItemUse}
            onItemDrop={handleItemDrop}
            onInventoryUpdate={handleInventoryUpdate}
          />
        )
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl text-gray-900 font-semibold">ZimboMate V2</h1>
                    <p className="text-sm text-gray-600 font-medium">Equipment & Inventory System</p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ThemeToggle />
                </motion.div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="sticky top-[73px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-6">
              <div className="flex gap-1 py-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <motion.div
                      key={tab.id}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Button
                        variant={isActive ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className="relative"
                      >
                        <motion.div
                          className="flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </motion.div>
                        
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                            layoutId="activeTab"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="mt-16 bg-white/90 backdrop-blur-md border-t border-gray-200">
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Backpack className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    ZimboMate V2 • Equipment & Inventory System
                  </span>
                </motion.div>
                <motion.div 
                  className="text-sm text-gray-600 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Phase 3: Equipment Management System ✨
                </motion.div>
              </div>
            </div>
          </footer>
        </div>
    </ThemeProvider>
  )
}

export default App