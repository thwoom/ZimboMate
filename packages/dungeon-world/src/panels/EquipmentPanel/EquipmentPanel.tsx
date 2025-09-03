import './EquipmentPanel.css';

import React from 'react';

import TagDisplay from '../../components/TagDisplay';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { Tag } from '../../models/Equipment';
import { equipmentCalculationService, EquipmentStats } from '../../services/EquipmentCalculations';
import { useGameStore } from '../../store/GameStore';

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

const EquipmentPanel: React.FC < PanelProps & { panelState?: EquipmentPanelState }> = ({
  id,
  panelState,
  onStateChange,
}) => {
  const api = createPanelAPI(id);
  const { state: gameState, setCharacter } = useGameStore();

  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null;
  // Removed unused selectedItem state

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

  // Use character inventory if available, otherwise fall back to panel state
  const displayItems = character?.inventory || state.items;

  // Calculate equipment stats using the enhanced service
  const equipmentStats: EquipmentStats | null = character ?
    equipmentCalculationService.calculateEquipmentStats(character) : null;

  // Fallback calculations for when no character is available
  const totalWeight = equipmentStats?.totalWeight || displayItems
    .reduce((sum: number, item: EquipmentItem) => sum + item.weight, 0);

  const totalArmor = equipmentStats?.totalArmor || displayItems
    .filter((item: EquipmentItem) => item.armor)
    .reduce((sum: number, item: EquipmentItem) => sum + (item.armor || 0), 0);

  const damageItems = equipmentStats?.damageDice.map(dice => ({ name: 'Weapon', damage: dice })) ||
    displayItems
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
          i.id === itemId ? { ...i, uses: i.uses!-1 } : i,
        );
      }
      const newState =  { ...state, items: updatedItems };
      onStateChange?.(newState);
    }
  };

  // Removed unused handleShowDetails function

  // Close item details
  const handleCloseDetails = () => {
    const newState = { ...state, showDetails: null };
    onStateChange?.(newState);
  };

  // Convert ItemTag[] to Tag[] for TagDisplay component
  const convertToTags = (itemTags: ItemTag[]): Tag[] => {
    return itemTags.map(tag => ({ name: tag }));
  };

  // Handle use decrement for items
  const handleUseDecrement = (itemId: string) => {
    const itemIndex = state.items.findIndex((item: EquipmentItem) => item.id === itemId);
    if (itemIndex === -1) return;

    const item = state.items[itemIndex];
    if (!item.uses || item.uses <= 0) return;

    const updatedItems = [...state.items];
    updatedItems[itemIndex] = {
      ...item,
      uses: item.uses-1,
    };

    onStateChange?.({ items: updatedItems });

    api.send('item-used', {
      itemId,
      itemName: item.name,
      usesRemaining: item.uses-1,
    });
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
  // Auto-equip optimal gear
  const handleAutoEquip = () => {
    if (!character) return;

    const optimalGear = equipmentCalculationService.autoEquipOptimalGear(character);

    // Update character with optimally equipped items
    const updatedInventory = character.inventory?.map(item => {
      const optimal = optimalGear.find(opt => opt.id === item.id);
      return optimal ? { ...item, equipped: optimal.equipped } : { ...item, equipped: false };
    }) || [];

    // Update character in game store
    setCharacter({ ...character, inventory: updatedInventory });

    api.send('equipment-auto - equipped', {
      equippedCount: optimalGear.length,
    });
  };

  const detailItem = state.showDetails ? state.items.find((i: EquipmentItem) => i.id === state.showDetails) : null;

  return (
    <div className="equipment-panel">
      <div className="equipment-header">
        <h2 > Equipment</h2>
        {character && (
          <button
            className="btn btn-secondary auto-equip-btn"
            onClick={handleAutoEquip}
            title="Automatically equip optimal gear for your character"
          >
            🎯 Auto-Equip
          </button>
        )}
        <div className="equipment-summary">
          <div className="summary-stats">
            <span className="armor-total">Total Armor: {totalArmor}</span>
            <span className="weight-total">Total Weight: {totalWeight}</span>
            {equipmentStats && (
              <>
                <span className={`encumbrance-status encumbrance-${equipmentStats.encumbranceStatus}`}>
                  {equipmentStats.encumbranceStatus.charAt(0).toUpperCase() + equipmentStats.encumbranceStatus.slice(1)}
                </span>
                {equipmentStats.damageBonus > 0 && (
                  <span className="damage-bonus">Damage Bonus: +{equipmentStats.damageBonus}</span>
                )}
              </>
            )}
          </div>

          {/* Special Effects */}
          {equipmentStats && equipmentStats.specialEffects.length > 0 && (
            <div className="special-effects">
              <h4 > Active Effects:</h4>
              <div className="effects-list">
                {equipmentStats.specialEffects.map(effect => (
                  <div key={effect.id} className={`effect-item effect-${effect.type}`}>
                    <span className="effect-name">{effect.name}</span>
                    <span className="effect-description">{effect.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="equipment-list">
        {displayItems.length === 0 ? (
          <div className="empty-state">
            <p > No equipment currently equipped.</p>
            <p className="empty-hint">Visit the Inventory panel to equip items.</p>
          </div>
        ) : (
          <div className="equipment-grid">
            {displayItems.map((item: EquipmentItem) => (
              <div key={item.id} className="equipment-item">
                <div className="item-header">
                  <span className="item-name">{item.name}</span>
                  <span className="item-weight">{item.weight} weight</span>
                </div>

                <div className="item-tags">
                  <TagDisplay
                    tags={convertToTags(item.tags)}
                    showTooltips={true}
                    onUseDecrement={() => handleUseDecrement(item.id)}
                  />
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
                <h4 > Tags</h4>
                <TagDisplay
                  tags={convertToTags(detailItem.tags)}
                  showTooltips={true}
                />
              </div>

              <div className="detail-section">
                <h4 > Properties</h4>
                <p>{getItemProperties(detailItem).join(' • ')}</p>
              </div>

              {detailItem.description && (
                <div className="detail-section">
                  <h4 > Description</h4>
                  <p>{detailItem.description}</p>
                </div>
              )}

              {detailItem.customMove && (
                <div className="detail-section">
                  <h4 > Custom Move</h4>
                  <p className="custom-move">{detailItem.customMove}</p>
                </div>
              )}

              {detailItem.value !== undefined && (
                <div className="detail-section">
                  <h4 > Value</h4>
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
  },
);



