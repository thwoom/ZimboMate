import React, { useState, useMemo } from 'react';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { useGameStore } from '../../store/GameStore';
import { Item, Tag, ItemCategory } from '../../models/Equipment';
import TagDisplay from '../../components/TagDisplay';
import { useItem, canUseItem, getActiveTagEffects } from '../../utils/tagMechanics';
import './InventoryPanel.css';

// Item tags from Dungeon World
export type ItemTag =
  | 'awkward' | 'dangerous' | 'forceful' | 'messy' | 'piercing'
  | 'precise' | 'reload' | 'stun' | 'thrown' | 'two-handed'
  | 'armor' | 'clumsy' | 'worn' | 'shield'
  | 'ration' | 'adventuring gear' | 'healing' | 'slow' | 'touch'
  | 'near' | 'far' | 'reach' | 'hand' | 'close';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  tags: Tag[];
  weight: number;
  value?: number;
  quantity: number;
  equipped: boolean;
  description?: string;
  customMove?: string;
  uses?: {
    current: number;
    max: number;
  };
}

interface InventoryPanelState {
  items: InventoryItem[];
  showAddItemModal: boolean;
  showEditItemModal: boolean;
  editingItem: InventoryItem | null;
  searchQuery: string;
  filterCategory: ItemCategory | 'all';
  sortBy: 'name' | 'weight' | 'value' | 'category';
  sortOrder: 'asc' | 'desc';
  showDetails: string | null; // ID of item to show details for
}

const InventoryPanel: React.FC < PanelProps & { panelState?: InventoryPanelState }> = ({
  id,
  panelState,
  onStateChange,
}) => {
  const api = createPanelAPI(id);
  const { state: gameState, setCharacter } = useGameStore();

  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null;

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
    searchQuery: '',
    filterCategory: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    showDetails: null,
  };

  const [state, setState] = useState < InventoryPanelState>(panelState || defaultState);

  // Calculate total weight of all items
  const totalWeight = useMemo(() => {
    return state.items.reduce((total, item) => {
      return total + (item.weight * item.quantity);
    }, 0);
  }, [state.items]);

  // Calculate total value of all items
  const totalValue = useMemo(() => {
    return state.items.reduce((total, item) => {
      return total + ((item.value || 0) * item.quantity);
    }, 0);
  }, [state.items]);

  // Get character's load capacity
  const loadCapacity = character?.load?.max || 0;
  const isEncumbered = totalWeight > loadCapacity;
  const isHeavilyEncumbered = totalWeight > loadCapacity + 2;

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let items = state.items.filter(item => {
      // Filter by search query
      if (state.searchQuery && !item.name.toLowerCase().includes(state.searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (state.filterCategory !== 'all' && item.category !== state.filterCategory) {
        return false;
      }

      return true;
    });

    // Sort items
    items.sort((a, b) => {
      let aValue: unknown, bValue: unknown;

      switch (state.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'weight':
          aValue = a.weight;
          bValue = b.weight;
          break;
        case 'value':
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue>bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return items;
  }, [state.items, state.searchQuery, state.filterCategory, state.sortBy, state.sortOrder]);

  // Update state helper
  const updateState = (updates: Partial < InventoryPanelState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  // Add new item
  const addItem = (item: Omit < InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    updateState({
      items: [...state.items, newItem],
      showAddItemModal: false,
    });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: [...(character.inventory || []), newItem],
      };
      setCharacter(updatedCharacter);
    }
  };

  // Edit existing item
  const editItem = (itemId: string, updates: Partial < InventoryItem>) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item,
    );

    updateState({
      items: updatedItems,
      showEditItemModal: false,
      editingItem: null,
    });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      };
      setCharacter(updatedCharacter);
    }
  };

  // Remove item
  const removeItem = (itemId: string) => {
    const updatedItems = state.items.filter(item => item.id !== itemId);

    updateState({ items: updatedItems });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      };
      setCharacter(updatedCharacter);
    }
  };

  // Use item (decrement uses)
  const useItem = (itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item || !item.uses || item.uses.current <= 0) return;

    const updatedItems = state.items.map(i =>
      i.id === itemId
        ? {
            ...i,
            uses: {
              current: i.uses!.current-1,
              max: i.uses!.max,
            },
            quantity: i.uses!.current-1 <= 0 ? i.quantity-1 : i.quantity,
          }
        : i,
    ).filter(i => i.quantity > 0); // Remove items with 0 quantity

    updateState({ items: updatedItems });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      };
      setCharacter(updatedCharacter);
    }
  };

  // Equip item
  const equipItem = (itemId: string) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, equipped: true } : item,
    );

    updateState({ items: updatedItems });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      };
      setCharacter(updatedCharacter);
    }
  };

  // Unequip item
  const unequipItem = (itemId: string) => {
    const updatedItems = state.items.map(item =>
      item.id === itemId ? { ...item, equipped: false } : item,
    );

    updateState({ items: updatedItems });

    // Update character inventory if character exists
    if (character) {
      const updatedCharacter = {
        ...character,
        inventory: updatedItems,
      };
      setCharacter(updatedCharacter);
    }
  };

  // Get weight status color
  const getWeightStatusColor = () => {
    if (isHeavilyEncumbered) return 'red';
    if (isEncumbered) return 'yellow';
    return 'green';
  };

  // Render item card
  const renderItemCard = (item: InventoryItem) => {
    const isSelected = state.showDetails === item.id;
    const canUse = item.uses && item.uses.current > 0;
    const canEquip = item.category === 'weapon' || item.category === 'armor';

    return (
      <div
        key={item.id}
        className={`inventory-item-card ${isSelected ? 'selected' : ''} ${item.equipped ? 'equipped' : ''}`}
        onClick={() => updateState({ showDetails: isSelected ? null : item.id })}
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
              <span className="badge value">{item.value} coins</span>
            )}
          </div>
        </div>

        <div className="item-content">
          <div className="item-stats">
            <span className="stat">Weight: {item.weight}</span>
            <span className="stat">Quantity: {item.quantity}</span>
            {item.uses && (
              <span className="stat">Uses: {item.uses.current}/{item.uses.max}</span>
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
              <strong > Custom Move:</strong> {item.customMove}
            </div>
          )}
        </div>

        <div className="item-actions">
          {canUse && (
            <button
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                useItem(item.id);
              }}
            >
              Use
            </button>
          )}

          {canEquip && !item.equipped && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                equipItem(item.id);
              }}
            >
              Equip
            </button>
          )}

          {canEquip && item.equipped && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                unequipItem(item.id);
              }}
            >
              Unequip
            </button>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              updateState({
                showEditItemModal: true,
                editingItem: item,
              });
            }}
          >
            Edit
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to remove ${item.name}?`)) {
                removeItem(item.id);
              }
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="inventory-panel">
      <div className="inventory-header">
        <h2 > Inventory</h2>
        <div className="inventory-summary">
          <div className={`weight-display ${getWeightStatusColor()}`}>
            <span className="weight-label">Weight:</span>
            <span className="weight-value">{totalWeight}</span>
            <span className="weight-capacity">/ {loadCapacity}</span>
            {isEncumbered && (
              <span className="encumbrance-warning">
                {isHeavilyEncumbered ? 'Heavily Encumbered!' : 'Encumbered!'}
              </span>
            )}
          </div>
          <div className="value-display">
            <span className="value-label">Total Value:</span>
            <span className="value-amount">{totalValue} coins</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search items..."
            value={state.searchQuery}
            onChange={(e) => updateState({ searchQuery: e.target.value })}
            className="search-input"
          />

          <label htmlFor="filter-category">Category:</label>
          <select
            id="filter-category"
            value={state.filterCategory}
            onChange={(e) => updateState({ filterCategory: e.target.value as ItemCategory | 'all' })}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="weapon">Weapons</option>
            <option value="armor">Armor</option>
            <option value="gear">Gear</option>
            <option value="consumable">Consumables</option>
            <option value="treasure">Treasure</option>
            <option value="magical">Magical</option>
          </select>

          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={state.sortBy}
            onChange={(e) => updateState({ sortBy: e.target.value as string })}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="weight">Sort by Weight</option>
            <option value="value">Sort by Value</option>
            <option value="category">Sort by Category</option>
          </select>

          <button
            onClick={() => updateState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="sort-order-btn"
          >
            {state.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => updateState({ showAddItemModal: true })}
        >
          Add Item
        </button>
      </div>

      <div className="inventory-content">
        {filteredAndSortedItems.length === 0 ? (
          <div className="empty-inventory">
            <p > No items found matching your criteria.</p>
            <button
              className="btn btn-secondary"
              onClick={() => updateState({
                searchQuery: '',
                filterCategory: 'all',
              })}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="inventory-grid">
            {filteredAndSortedItems.map(renderItemCard)}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {state.showAddItemModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 > Add New Item</h3>
            <AddItemForm
              onAdd={addItem}
              onCancel={() => updateState({ showAddItemModal: false })}
            />
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {state.showEditItemModal && state.editingItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 > Edit Item</h3>
            <EditItemForm
              item={state.editingItem}
              onSave={(updates) => editItem(state.editingItem!.id, updates)}
              onCancel={() => updateState({
                showEditItemModal: false,
                editingItem: null,
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Add Item Form Component
interface AddItemFormProps {
  onAdd: (item: Omit < InventoryItem, 'id'>) => void;
  onCancel: () => void;
}

const AddItemForm: React.FC < AddItemFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'gear' as ItemCategory,
    weight: 0,
    value: 0,
    quantity: 1,
    description: '',
    tags: [] as Tag[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      ...formData,
      equipped: false,
      uses: formData.category === 'consumable' ? { current: 1, max: 1 } : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
        >
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="gear">Gear</option>
          <option value="consumable">Consumable</option>
          <option value="treasure">Treasure</option>
          <option value="magical">Magical</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="weight">Weight:</label>
          <input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="value">Value (coins):</label>
          <input
            id="value"
            type="number"
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Add Item</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

// Edit Item Form Component
interface EditItemFormProps {
  item: InventoryItem;
  onSave: (updates: Partial < InventoryItem>) => void;
  onCancel: () => void;
}

const EditItemForm: React.FC < EditItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    weight: item.weight,
    value: item.value || 0,
    quantity: item.quantity,
    description: item.description || '',
    tags: item.tags,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      value: formData.value || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <div className="form-group">
        <label htmlFor="edit-name">Name:</label>
        <input
          id="edit-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-category">Category:</label>
        <select
          id="edit-category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
        >
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="gear">Gear</option>
          <option value="consumable">Consumable</option>
          <option value="treasure">Treasure</option>
          <option value="magical">Magical</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-weight">Weight:</label>
          <input
            id="edit-weight"
            type="number"
            min="0"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-value">Value (coins):</label>
          <input
            id="edit-value"
            type="number"
            min="0"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-quantity">Quantity:</label>
          <input
            id="edit-quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="edit-description">Description:</label>
        <textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save Changes</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

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
);
