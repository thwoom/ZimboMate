import type { PanelProps } from '../../framework/Panel'

import type { ItemCategory, Tag } from '../../models/Equipment'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../../utils/motion'
import ContextMenu from '../../components/ContextMenu'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../components/ui/dropdown-menu'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import EquipmentSets from '../../components/EquipmentSets'
import LoadOptimizer from '../../components/LoadOptimizer'
import TagDisplay from '../../components/TagDisplay'
import { Card } from '../../components/ui/card'
import Tooltip from '../../components/Tooltip'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI, loadPanelState, savePanelState } from '../../framework/PanelAPI'
import { useGameStore } from '../../store/GameStore'
import { registerShortcut, setActiveScope } from '../../utils/KeyboardShortcuts'
import './InventoryPanel.css'

// Add Item Form Component (moved above default export to satisfy before-define)
interface AddItemFormProps {
  onAdd: (item: Omit<InventoryItem, 'id'>) => void
  onCancel: () => void
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'gear' as ItemCategory,
    weight: 0,
    value: 0,
    quantity: 1,
    description: '',
    tags: [] as Tag[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim())
      return

    onAdd({
      ...formData,
      equipped: false,
      uses: formData.category === 'consumable' ? { current: 1, max: 1 } : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ItemCategory })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weapon">Weapon</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="gear">Gear</SelectItem>
            <SelectItem value="consumable">Consumable</SelectItem>
            <SelectItem value="treasure">Treasure</SelectItem>
            <SelectItem value="magical">Magical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="weight">Weight:</label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: Number.parseFloat((e.target as HTMLInputElement).value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="value">Value (coins):</label>
          <Input
            id="value"
            type="number"
            min="0"
            value={formData.value}
            onChange={e => setFormData({ ...formData, value: Number.parseInt((e.target as HTMLInputElement).value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: Number.parseInt((e.target as HTMLInputElement).value) || 1 })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <Button type="submit">Add Item</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// Edit Item Form Component (moved above default export)
interface EditItemFormProps {
  item: InventoryItem
  onSave: (updates: Partial<InventoryItem>) => void
  onCancel: () => void
}

const EditItemForm: React.FC<EditItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    weight: item.weight,
    value: item.value || 0,
    quantity: item.quantity,
    description: item.description || '',
    tags: item.tags,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim())
      return

    onSave({
      ...formData,
      value: formData.value || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label htmlFor="edit-name">Name:</label>
        <Input
          id="edit-name"
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-category">Category:</label>
        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ItemCategory })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weapon">Weapon</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="gear">Gear</SelectItem>
            <SelectItem value="consumable">Consumable</SelectItem>
            <SelectItem value="treasure">Treasure</SelectItem>
            <SelectItem value="magical">Magical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-weight">Weight:</label>
          <Input
            id="edit-weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: Number.parseFloat((e.target as HTMLInputElement).value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-value">Value (coins):</label>
          <Input
            id="edit-value"
            type="number"
            min="0"
            value={formData.value}
            onChange={e => setFormData({ ...formData, value: Number.parseInt((e.target as HTMLInputElement).value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-quantity">Quantity:</label>
          <Input
            id="edit-quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={e => setFormData({ ...formData, quantity: Number.parseInt((e.target as HTMLInputElement).value) || 1 })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="edit-description">Description:</label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

// Item tags from Dungeon World
export type ItemTag
  = | 'awkward' | 'dangerous' | 'forceful' | 'messy' | 'piercing'
    | 'precise' | 'reload' | 'stun' | 'thrown' | 'two-handed'
    | 'armor' | 'clumsy' | 'worn' | 'shield'
    | 'ration' | 'adventuring gear' | 'healing' | 'slow' | 'touch'
    | 'near' | 'far' | 'reach' | 'hand' | 'close'

export interface InventoryItem {
  id: string
  name: string
  category: ItemCategory
  tags: Tag[]
  weight: number
  value?: number
  quantity: number
  equipped: boolean
  description?: string
  customMove?: string
  uses?: {
    current: number
    max: number
  }
}

interface InventoryPanelState {
  items: InventoryItem[]
  showAddItemModal: boolean
  showEditItemModal: boolean
  editingItem: InventoryItem | null
  searchQuery: string
  filterCategory: ItemCategory | 'all'
  sortBy: 'name' | 'weight' | 'value' | 'category'
  sortOrder: 'asc' | 'desc'
  showDetails: string | null // ID of item to show details for
}

const InventoryPanel: React.FC<PanelProps & { panelState?: InventoryPanelState }> = ({
  id,
  panelState,
  onStateChange,
}) => {
  const _api = createPanelAPI(id)
  const { state: gameState, setCharacter } = useGameStore()
  const searchRef = useRef<HTMLInputElement>(null)
  const persisted = loadPanelState<Pick<InventoryPanelState, 'searchQuery' | 'filterCategory' | 'sortBy' | 'sortOrder'>>(id, {
    searchQuery: '',
    filterCategory: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  })

  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null

  // Default state
  const defaultState: InventoryPanelState = {
    items: [
      {
        id: 'rations',
        name: 'Rations',
        category: 'consumable',
        tags: [{ name: 'ration' }],
        weight: 1,
        quantity: 5,
        equipped: false,
        description: 'Dried meat and hard bread for sustenance on the road.',
        uses: { current: 5, max: 5 },
      },
      {
        id: 'rope',
        name: 'Rope',
        category: 'gear',
        tags: [{ name: 'awkward' }],
        weight: 1,
        quantity: 1,
        equipped: false,
        description: '50 feet of sturdy hemp rope.',
      },
      {
        id: 'torch',
        name: 'Torch',
        category: 'gear',
        tags: [{ name: 'dangerous' }],
        weight: 1,
        quantity: 3,
        equipped: false,
        description: 'A wooden torch that provides light for 1 hour.',
        uses: { current: 3, max: 3 },
      },
      {
        id: 'healing-potion',
        name: 'Healing Potion',
        category: 'consumable',
        tags: [{ name: 'healing' }, { name: 'touch' }],
        weight: 0,
        value: 50,
        quantity: 2,
        equipped: false,
        description: 'A vial of red liquid that restores 10 HP when consumed.',
        customMove: 'When you drink this potion, heal 10 HP.',
        uses: { current: 2, max: 2 },
      },
      {
        id: 'gold-coins',
        name: 'Gold Coins',
        category: 'treasure',
        tags: [{ name: 'coins', value: 100 }],
        weight: 1,
        value: 100,
        quantity: 100,
        equipped: false,
        description: 'A pouch of gold coins.',
      },
    ],
    showAddItemModal: false,
    showEditItemModal: false,
    editingItem: null,
    searchQuery: persisted.searchQuery,
    filterCategory: persisted.filterCategory,
    sortBy: persisted.sortBy,
    sortOrder: persisted.sortOrder,
    showDetails: null,
  }

  const [state, setState] = useState<InventoryPanelState>(panelState || defaultState)

  useEffect(() => {
    setActiveScope(id)
    const unReg = registerShortcut({ combo: '/', handler: () => searchRef.current?.focus(), scope: id, preventDefault: true })
    return () => {
      setActiveScope(null)
      unReg()
    }
  }, [id])

  // Calculate total weight of all items
  const totalWeight = useMemo(() => {
    return state.items.reduce((total, item) => {
      return total + (item.weight * item.quantity)
    }, 0)
  }, [state.items])

  // Calculate total value of all items
  const totalValue = useMemo(() => {
    return state.items.reduce((total, item) => {
      return total + ((item.value || 0) * item.quantity)
    }, 0)
  }, [state.items])

  // Get character's load capacity
  const loadCapacity = character?.load?.max || 0
  const isEncumbered = totalWeight > loadCapacity
  const isHeavilyEncumbered = totalWeight > loadCapacity + 2

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const items = state.items.filter((item) => {
      // Filter by search query
      if (state.searchQuery && !item.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
        return false
      }

      // Filter by category
      if (state.filterCategory !== 'all' && item.category !== state.filterCategory) {
        return false
      }

      return true
    })

    // Sort items
    items.sort((a, b) => {
      let aValue: number | string, bValue: number | string

      switch (state.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'weight':
          aValue = a.weight
          bValue = b.weight
          break
        case 'value':
          aValue = a.value || 0
          bValue = b.value || 0
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      const compare = () => {
        if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue)
        const an = typeof aValue === 'number' ? aValue : Number(aValue)
        const bn = typeof bValue === 'number' ? bValue : Number(bValue)
        return an < bn ? -1 : an > bn ? 1 : 0
      }

      return state.sortOrder === 'asc' ? compare() : -compare()
    })

    return items
  }, [state.items, state.searchQuery, state.filterCategory, state.sortBy, state.sortOrder])

  // Update state helper
  const updateState = (updates: Partial<InventoryPanelState>) => {
    const newState = { ...state, ...updates }
    setState(newState)
    savePanelState(id, {
      searchQuery: newState.searchQuery,
      filterCategory: newState.filterCategory,
      sortBy: newState.sortBy,
      sortOrder: newState.sortOrder,
    })
    if (onStateChange) {
      onStateChange(newState)
    }
  }

  // Add new item
  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    }

    updateState({
      items: [...state.items, newItem],
      showAddItemModal: false,
    })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: [...(character.inventory || []), newItem],
      }
      setCharacter(updatedCharacter)
    }
  }

  // Edit existing item
  const editItem = (itemId: string, updates: Partial<InventoryItem>) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item,
    )

    updateState({
      items: updatedItems,
      showEditItemModal: false,
      editingItem: null,
    })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      }
      setCharacter(updatedCharacter)
    }
  }

  // Remove item
  const removeItem = (itemId: string) => {
    const updatedItems = state.items.filter(item => item.id !== itemId)

    updateState({ items: updatedItems })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      }
      setCharacter(updatedCharacter)
    }
  }

  // Consume item (decrement uses)
  const consumeItem = (itemId: string) => {
    const item = state.items.find(i => i.id === itemId)
    if (!item || !item.uses || item.uses.current <= 0)
      return

    const updatedItems = state.items.map(i =>
      i.id === itemId
        ? {
            ...i,
            uses: {
              current: i.uses!.current - 1,
              max: i.uses!.max,
            },
            quantity: i.uses!.current - 1 <= 0 ? i.quantity - 1 : i.quantity,
          }
        : i,
    ).filter(i => i.quantity > 0) // Remove items with 0 quantity

    updateState({ items: updatedItems })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      }
      setCharacter(updatedCharacter)
    }
  }

  // Equip item
  const equipItem = (itemId: string) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, equipped: true } : item,
    )

    updateState({ items: updatedItems })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      }
      setCharacter(updatedCharacter)
    }
  }

  // Unequip item
  const unequipItem = (itemId: string) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, equipped: false } : item,
    )

    updateState({ items: updatedItems })

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      }
      setCharacter(updatedCharacter)
    }
  }

  // Get weight status color
  const getWeightStatusColor = () => {
    if (isHeavilyEncumbered)
      return 'red'
    if (isEncumbered)
      return 'yellow'
    return 'green'
  }

  const [menuState, setMenuState] = useState<{ open: boolean, x: number, y: number, item?: InventoryItem }>({ open: false, x: 0, y: 0 })
  const openContextMenu = (e: React.MouseEvent, item: InventoryItem) => {
    e.preventDefault()
    setMenuState({ open: true, x: e.clientX, y: e.clientY, item })
  }
  const closeContextMenu = () => setMenuState(prev => ({ ...prev, open: false }))

  // Render item card
  const renderItemCard = (item: InventoryItem) => {
    const isSelected = state.showDetails === item.id
    const canUse = item.uses && item.uses.current > 0
    const canEquip = item.category === 'weapon' || item.category === 'armor'

    return (
      <motion.div variants={itemFadeIn} whileHover={prefersReduced ? undefined : { scale: 1.01 }}>
        <Card
          key={item.id}
          className={`inventory-item-card ${isSelected ? 'selected' : ''} ${item.equipped ? 'equipped' : ''}`}
          onClick={() => updateState({ showDetails: isSelected ? null : item.id })}
          onContextMenu={e => openContextMenu(e, item)}
        >
          <div className="item-header">
            <h3 className="item-name">{item.name}</h3>
            <div className="item-badges">
              <span className={`badge category-${item.category}`}>
                {item.category}
              </span>
              {item.equipped && (
                <span className="badge equipped">Equipped</span>
              )}
              {item.value && (
                <span className="badge value">
                  {item.value}
                  {' '}
                  coins
                </span>
              )}
            </div>
          </div>

          <div className="item-content">
            <div className="item-stats">
              <span className="stat">
                Weight:
                {item.weight}
              </span>
              <span className="stat">
                Quantity:
                {item.quantity}
              </span>
              {item.uses && (
                <span className="stat">
                  Uses:
                  {item.uses.current}
                  /
                  {item.uses.max}
                </span>
              )}
            </div>

            {item.description && (
              <p className="item-description">{item.description}</p>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="item-tags">
                <TagDisplay tags={item.tags} />
              </div>
            )}

            {item.customMove && (
              <div className="item-custom-move">
                <strong> Custom Move:</strong>
                {' '}
                {item.customMove}
              </div>
            )}
          </div>

          <div className="item-actions">
            {canUse && (
              <Tooltip content="Use this item">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    consumeItem(item.id)
                  }}
                  type="button"
                >
                  Use
                </button>
              </Tooltip>
            )}

            {canEquip && !item.equipped && (
              <Tooltip content="Equip this item">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    equipItem(item.id)
                  }}
                  type="button"
                >
                  Equip
                </button>
              </Tooltip>
            )}

            {canEquip && item.equipped && (
              <Tooltip content="Unequip this item">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    unequipItem(item.id)
                  }}
                  type="button"
                >
                  Unequip
                </button>
              </Tooltip>
            )}

            <Tooltip content="Edit item">
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  updateState({
                    showEditItemModal: true,
                    editingItem: item,
                  })
                }}
                type="button"
              >
                Edit
              </button>
            </Tooltip>

            <Tooltip content="Remove item">
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  // eslint-disable-next-line no-alert
                  if (confirm(`Are you sure you want to remove ${item.name}?`)) {
                    removeItem(item.id)
                  }
                }}
                type="button"
              >
                Remove
              </button>
            </Tooltip>
          </div>
        </Card>
      </motion.div>
    )
  }

  const prefersReduced = useReducedMotion()

  return (
    <motion.div className="inventory-panel" initial={prefersReduced ? undefined : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={staggerContainer}>
      <motion.div variants={itemFadeIn}>
        <Card className="inventory-header">
          <h2> Inventory</h2>
          <div className="mt-2">
            <LoadOptimizer />
          </div>
          <div className="inventory-summary">
            <div className={`weight-display ${getWeightStatusColor()}`}>
              <span className="weight-label">Weight:</span>
              <span className="weight-value">{totalWeight}</span>
              <span className="weight-capacity">
                /
                {loadCapacity}
              </span>
              {isEncumbered && (
                <motion.span className="encumbrance-warning" animate={prefersReduced ? undefined : { scale: [1, 1.05, 1] }} transition={prefersReduced ? undefined : { duration: 1.2, repeat: Infinity }}>
                  {isHeavilyEncumbered ? 'Heavily Encumbered!' : 'Encumbered!'}
                </motion.span>
              )}
            </div>
            <div className="value-display">
              <span className="value-label">Total Value:</span>
              <span className="value-amount">
                {totalValue}
                {' '}
                coins
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
      <motion.div className="inventory-tools mb-4" variants={itemFadeIn}>
        <EquipmentSets />
      </motion.div>

      <motion.div className="inventory-controls" variants={itemFadeIn}>
        <div className="search-filter">
          <Input
            type="text"
            placeholder="Search items..."
            value={state.searchQuery}
            onChange={e => updateState({ searchQuery: (e.target as HTMLInputElement).value })}
            className="search-input"
            ref={searchRef}
          />

          <Select value={state.filterCategory} onValueChange={(v) => updateState({ filterCategory: v as any })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['all','weapon','armor','gear','consumable','treasure','magical'] as const).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.sortBy} onValueChange={(v) => updateState({ sortBy: v as any })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['name','weight','value','category'] as const).map(key => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => updateState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="sort-order-btn"
            type="button"
          >
            {state.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <Button onClick={() => updateState({ showAddItemModal: true })} type="button">Add Item</Button>
      </motion.div>

      <motion.div className="inventory-content" variants={staggerContainer}>
        {filteredAndSortedItems.length === 0
          ? (
              <motion.div className="empty-inventory" variants={itemFadeIn}>
                <p> No items found matching your criteria.</p>
                <Button variant="secondary" onClick={() => updateState({ searchQuery: '', filterCategory: 'all' })} type="button">Clear Filters</Button>
              </motion.div>
            )
          : (
              <motion.div className="inventory-grid" variants={staggerContainer}>
                {filteredAndSortedItems.map(item => (
                  <motion.div key={item.id} variants={itemFadeIn}>
                    {renderItemCard(item)}
                  </motion.div>
                ))}
              </motion.div>
            )}
      </motion.div>

      {/* Add Item Modal */}
      {state.showAddItemModal && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) updateState({ showAddItemModal: false }) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <AddItemForm
              onAdd={addItem}
              onCancel={() => updateState({ showAddItemModal: false })}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Item Modal */}
      {state.showEditItemModal && state.editingItem && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) updateState({ showEditItemModal: false, editingItem: null }) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <EditItemForm
              item={state.editingItem}
              onSave={(updates) => editItem(state.editingItem!.id, updates)}
              onCancel={() => updateState({ showEditItemModal: false, editingItem: null })}
            />
          </DialogContent>
        </Dialog>
      )}

      {menuState.open && menuState.item && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          onClose={closeContextMenu}
          items={[
            { id: 'equip', label: menuState.item.equipped ? 'Unequip' : 'Equip', onSelect: () => (menuState.item!.equipped ? unequipItem(menuState.item!.id) : equipItem(menuState.item!.id)) },
            { id: 'remove', label: 'Remove', onSelect: () => removeItem(menuState.item!.id) },
          ]}
        />
      )}
    </motion.div>
  )
}

// Create and export the panel
export default createPanel(
  {
    id: 'inventory',
    name: 'Inventory',
    icon: '🎒',
    description: 'Manage carried items, weight, and currency',
    priority: 3,
  },
  InventoryPanel,
  {
    getInitialState: () => ({
      items: [],
      showAddItemModal: false,
      showEditItemModal: false,
      editingItem: null,
      searchQuery: '',
      filterCategory: 'all' as ItemCategory | 'all',
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
      showDetails: null,
    }),
  },
)
