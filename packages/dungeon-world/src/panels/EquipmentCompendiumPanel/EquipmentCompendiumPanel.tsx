import React from 'react'
import EquipmentCompendium from '../../components/EquipmentCompendium'
import { createPanel } from '../../framework/Panel'

const equipmentCompendiumPanel = createPanel(
  {
    id: 'equipment-compendium',
    name: 'Equipment Compendium',
    icon: '📚',
    priority: 55,
    description: 'Browse and compare equipment from the Dungeon World compendium',
  },
  () => {
    return (
      <div className="panel equipment-compendium-panel">
        <EquipmentCompendium />
      </div>
    )
  },
)

export default equipmentCompendiumPanel
