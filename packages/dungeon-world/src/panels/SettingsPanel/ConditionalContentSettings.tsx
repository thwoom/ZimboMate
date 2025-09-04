import React from 'react'
import { createPanel } from '../../framework/Panel'
import { useGameStore } from '../../store/GameStore'
import './ConditionalContentSettings.css'

const ConditionalContentSettings: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const cc = state.settings.conditionalContent!
  return (
    <div className="settings-conditional">
      <h2>Conditional Content</h2>
      <div>
        <label>
          <input
            type="checkbox"
            checked={cc.global.preferClassRelevant}
            onChange={e => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, preferClassRelevant: e.target.checked } } })}
          />{' '}
          Prefer class-relevant content
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={cc.global.showAllMoves}
            onChange={e => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showAllMoves: e.target.checked } } })}
          />{' '}
          Show all moves
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={cc.global.showAllEquipment}
            onChange={e => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showAllEquipment: e.target.checked } } })}
          />{' '}
          Show all equipment
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={cc.global.showSpellsForNonCasters}
            onChange={e => updateSettings({ conditionalContent: { ...cc, global: { ...cc.global, showSpellsForNonCasters: e.target.checked } } })}
          />{' '}
          Show spells for non-casters
        </label>
      </div>
    </div>
  )
}

export default createPanel(
  {
    id: 'settings-conditional',
    name: 'Conditional Content',
    icon: '⚙️',
    priority: 10,
  },
  ConditionalContentSettings,
)


