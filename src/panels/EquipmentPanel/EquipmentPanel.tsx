import React, { useState, useCallback } from 'react';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import './EquipmentPanel.css';

// Item tags from Dungeon World
export type ItemTag = 
  | 'awkward' | 'dangerous' | 'forceful' | 'messy' | 'piercing' 
  | 'precise' | 'reload' | 'stun' | 'thrown' | 'two-handed'
  | 'armor' | 'clumsy' | 'worn' | 'shield'
  | 'ration' | 'adventuring gear' | 'healing' | 'slow' | 'touch'
  | 'near' | 'far' | 'reach' | 'hand' | 'close';

export interface EquipmentItem {
  id: string;
  name: string;
  tags: ItemTag[];
  weight: number;
  uses?: number;
  maxUses?: number;
  damage?: string;
  armor?: number;
  description?: string;
  customMove?: string;
  value?: number;
  equipped: boolean;
}

interface EquipmentPanelState {
  items: EquipmentItem[];
  showDetails: string | null; // ID of item to show details for
}

const EquipmentPanel: React.FC<PanelProps & { panelState?: EquipmentPanelState }> = ({ 
  id, 
  panelState,
  onStateChange
}) => {
  const api = createPanelAPI(id);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Default state
  const defaultState: EquipmentPanelState = {
    items: [
      {
        id: 'longsword',
        name: 'Longsword',
        tags: ['close', 'piercing' as ItemTag],
        weight: 1,
        damage: '+1 damage',
        equipped: true,
        description: 'A well-balanced blade with a keen edge.',
      },
      {
        id: 'leather-armor',
        name: 'Leather Armor',
        tags: ['armor', 'worn' as ItemTag],
        weight: 1,
        armor: 1,
        equipped: true,
        description: 'Supple leather that offers protection without restricting movement.',
      },
      {
        id: 'adventuring-gear',
        name: 'Adventuring Gear',
        tags: ['adventuring gear' as ItemTag],
        weight: 1,
        uses: 5,
        maxUses: 5,
        equipped: true,
        description: 'A collection of useful items for exploration.',
      },
      {
        id: 'shield',
        name: 'Shield',
        tags: ['shield', 'awkward' as ItemTag],
        weight: 2,
        armor: 1,
        equipped: true,
        description: 'A sturdy wooden shield reinforced with iron bands.',
      },
      {
        id: 'healing-potion',
        name: 'Healing Potion',
        tags: ['healing', 'touch' as ItemTag],
        weight: 0,
        uses: 1,
        maxUses: 1,
        equipped: true,
        description: 'A vial of red liquid that restores 10 HP when consumed.',
        customMove: 'When you drink this potion, heal 10 HP.',
        value: 50,
      },
    ],
    showDetails: null,
  };
  
  const state = { ...defaultState, ...panelState };
  
  // Calculate total weight of all items (all are equipped)
  const totalWeight = state.items
    .reduce((sum: number, item: EquipmentItem) => sum + item.weight, 0);
  
  // Calculate total armor from all armor items
  const totalArmor = state.items
    .filter((item: EquipmentItem) => item.armor)
    .reduce((sum: number, item: EquipmentItem) => sum + (item.armor || 0), 0);
  
  // Send weight, armor, and damage updates to Character Stats panel
  const damageItems = state.items
    .filter((item: EquipmentItem) => item.damage)
    .map((item: EquipmentItem) => ({ name: item.name, damage: item.damage }));
  
  React.useEffect(() => {
    api.send('equipment-weight-changed', { totalWeight });
    api.send('equipment-armor-changed', { totalArmor });
    api.send('equipment-damage-changed', { damageItems });
  }, [totalWeight, totalArmor, state.items, api, damageItems]);
  
  // Listen for items being equipped from inventory
  React.useEffect(() => {
    const unsubscribe = api.listen('item-equipped', (data: { item: EquipmentItem }) => {
      if (onStateChange && data.item) {
        // Add the newly equipped item to our list
        const updatedItems = [...state.items, { ...data.item, equipped: true }];
        onStateChange({ ...state, items: updatedItems });
      }
    });
    
    return unsubscribe;
  }, [state, onStateChange, api]);
  
  // Handle unequip action
  const handleUnequip = (itemId: string) => {
    const item = state.items.find((i: EquipmentItem) => i.id === itemId);
    if (item) {
      const updatedItems = state.items.filter((i: EquipmentItem) => i.id !== itemId);
      const newState = { ...state, items: updatedItems };
      onStateChange?.(newState);
    }
  };

  // Handle use consumable
  const handleUseItem = (itemId: string) => {
    const item = state.items.find((i: EquipmentItem) => i.id === itemId);
    if (item && item.uses !== undefined && item.uses > 0) {
      let updatedItems: EquipmentItem[];
      if (item.uses === 1) {
        // Remove item if it's the last use
        updatedItems = state.items.filter((i: EquipmentItem) => i.id !== itemId);
      } else {
        // Decrease uses
        updatedItems = state.items.map((i: EquipmentItem) =>
          i.id === itemId ? { ...i, uses: i.uses! - 1 } : i
        );
      }
      const newState = { ...state, items: updatedItems };
      onStateChange?.(newState);
    }
  };
  
  // Show item details
  const handleShowDetails = (itemId: string) => {
    const newState = { ...state, showDetails: itemId };
    onStateChange?.(newState);
  };

  // Close item details
  const handleCloseDetails = () => {
    const newState = { ...state, showDetails: null };
    onStateChange?.(newState);
  };
  
  // Format item tags for display
  const formatTags = (tags: ItemTag[]): string => {
    return tags.join(', ');
  };
  
  // Get item properties display
  const getItemProperties = (item: EquipmentItem): string[] => {
    const props: string[] = [];
    if (item.damage) props.push(item.damage);
    if (item.armor) props.push(`${item.armor} armor`);
    if (item.weight) props.push(`${item.weight} weight`);
    if (item.uses !== undefined) props.push(`${item.uses}/${item.maxUses || item.uses} uses`);
    return props;
  };
  
  // Get the item to show details for
  const detailItem = state.showDetails ? state.items.find((i: EquipmentItem) => i.id === state.showDetails) : null;
  
  return (
    <div className="equipment-panel">
      <div className="equipment-header">
        <h2>Equipment</h2>
        <div className="equipment-summary">
          <span className="weight-total">Total Weight: {totalWeight}</span>
        </div>
      </div>
      
      <div className="equipment-list">
        {state.items.length === 0 ? (
          <div className="empty-state">
            <p>No equipment currently equipped.</p>
            <p className="empty-hint">Visit the Inventory panel to equip items.</p>
          </div>
        ) : (
          <div className="equipment-grid">
            {state.items.map((item: EquipmentItem) => (
              <div key={item.id} className="equipment-item">
                <div className="item-header">
                  <span className="item-name">{item.name}</span>
                  <span className="item-weight">{item.weight} weight</span>
                </div>
              
                <div className="item-tags">
                  {formatTags(item.tags)}
                </div>
              
                <div className="item-properties">
                  {getItemProperties(item).join(' • ')}
                </div>
              
                {item.description && (
                  <div className="item-description">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Item Details Modal */}
      {detailItem && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detailItem.name}</h3>
              <button className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Tags</h4>
                <p>{formatTags(detailItem.tags)}</p>
              </div>
              
              <div className="detail-section">
                <h4>Properties</h4>
                <p>{getItemProperties(detailItem).join(' • ')}</p>
              </div>
              
              {detailItem.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{detailItem.description}</p>
                </div>
              )}
              
              {detailItem.customMove && (
                <div className="detail-section">
                  <h4>Custom Move</h4>
                  <p className="custom-move">{detailItem.customMove}</p>
                </div>
              )}
              
              {detailItem.value !== undefined && (
                <div className="detail-section">
                  <h4>Value</h4>
                  <p>{detailItem.value} coin</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="action-button action-button--unequip"
                onClick={() => {
                  handleUnequip(detailItem.id);
                  handleCloseDetails();
                }}
              >
                Unequip
              </button>
              {detailItem.uses !== undefined && detailItem.uses > 0 && (
                <button 
                  className="action-button action-button--use"
                  onClick={() => {
                    handleUseItem(detailItem.id);
                    handleCloseDetails();
                  }}
                >
                  Use ({detailItem.uses} left)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default createPanel(
  {
    id: 'equipment',
    name: 'Equipment',
    icon: '⚔️',
    priority: 2,
  },
  EquipmentPanel,
  {
    getInitialState: (): EquipmentPanelState => ({
      items: [
        {
          id: 'longsword',
          name: 'Longsword',
          tags: ['close', 'piercing'] as ItemTag[],
          weight: 1,
          damage: '+1 damage',
          equipped: true,
          description: 'A well-balanced blade with a keen edge.',
        },
        {
          id: 'leather-armor',
          name: 'Leather Armor',
          tags: ['armor', 'worn'] as ItemTag[],
          weight: 1,
          armor: 1,
          equipped: true,
          description: 'Supple leather that offers protection without restricting movement.',
        },
        {
          id: 'adventuring-gear',
          name: 'Adventuring Gear',
          tags: ['adventuring gear'] as ItemTag[],
          weight: 1,
          uses: 5,
          maxUses: 5,
          equipped: true,
          description: 'A collection of useful items for exploration.',
        },
      ],
      showDetails: null,
    }),
  }
);
