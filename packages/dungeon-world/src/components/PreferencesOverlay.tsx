import React from 'react'
import { useGameStore } from '../store/GameStore'
import { setStatsShowSpells, togglePanelOverride } from '../utils/preferences'

const PreferencesOverlay: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const overrideEnabled = state.settings.conditionalContent?.perPanel.stats.overrideEnabled || false
  const showSpells = state.settings.conditionalContent?.perPanel.stats.showSpells || false
  return (
    <div className="hp-sidebar-glass-content">
      <h3> Preferences</h3>
      <div className="combat-stats">
        <div className="stat-item">
          <label>
            <input
              type="checkbox"
              checked={overrideEnabled}
              onChange={() => {
                const next = togglePanelOverride(state.settings, 'stats')
                updateSettings({ conditionalContent: next.conditionalContent })
              }}
            />{' '}
            Override
          </label>
        </div>
        <div className="stat-item">
          <label>
            <input
              type="checkbox"
              checked={showSpells}
              onChange={(e) => {
                const next = setStatsShowSpells(state.settings, e.target.checked)
                updateSettings({ conditionalContent: next.conditionalContent })
              }}
              disabled={!overrideEnabled}
            />{' '}
            Show spells
          </label>
        </div>
      </div>
    </div>
  )
}

export default PreferencesOverlay


