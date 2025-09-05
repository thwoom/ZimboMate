import React from 'react'
import { useGameStore } from '../../store/GameStore'

const IntegrationSettings: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const s = state.settings.integration!
  return (
    <div>
      <h2>Integration Settings</h2>
      <label>
        <input type="checkbox" checked={s.contextMenuEnabled} onChange={e => updateSettings({ integration: { ...s, contextMenuEnabled: (e.target as HTMLInputElement).checked } })} />
        Enable custom context menu
      </label>
      <br />
      <label>
        Tooltip delay (ms):{' '}
        <input type="number" value={s.tooltipDelayMs} min={0} max={2000} onChange={e => updateSettings({ integration: { ...s, tooltipDelayMs: Number((e.target as HTMLInputElement).value) } })} />
      </label>
      <br />
      <label>
        <input type="checkbox" checked={s.highContrastMenu} onChange={e => updateSettings({ integration: { ...s, highContrastMenu: (e.target as HTMLInputElement).checked } })} />
        High contrast context menu
      </label>
      <br />
      <label>
        <input type="checkbox" checked={s.suspendShortcutsOnDialog} onChange={e => updateSettings({ integration: { ...s, suspendShortcutsOnDialog: (e.target as HTMLInputElement).checked } })} />
        Suspend shortcuts when a dialog is open
      </label>
      <br />
      <label>
        <input type="checkbox" checked={s.overlayEnabled} onChange={e => updateSettings({ integration: { ...s, overlayEnabled: (e.target as HTMLInputElement).checked } })} />
        Enable Shortcuts Overlay
      </label>
    </div>
  )
}

export default IntegrationSettings


