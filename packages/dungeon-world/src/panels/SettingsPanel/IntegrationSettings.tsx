import React, { useMemo, useState } from 'react'
import { useGameStore } from '../../store/GameStore'
import { exportKeymap, getRegisteredShortcuts, importKeymap, remapShortcut } from '../../utils/KeyboardShortcuts'
import { createPanel, type PanelProps } from '../../framework/Panel'
import './IntegrationSettings.css'

const IntegrationSettingsView: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const s = state.settings.integration!
  const [refreshKey, setRefreshKey] = useState(0)
  const [importText, setImportText] = useState('')
  const list = useMemo(() => getRegisteredShortcuts(), [refreshKey])

  const doRemap = (normalized: string, newCombo: string) => {
    if (!newCombo.trim()) return
    const ok = remapShortcut(normalized, newCombo)
    if (ok) setRefreshKey(k => k + 1)
  }

  const doExport = async () => {
    const json = JSON.stringify(exportKeymap(), null, 2)
    try {
      await navigator.clipboard?.writeText(json)
      alert('Keymap JSON copied to clipboard')
    } catch {
      setImportText(json)
    }
  }

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText)
      importKeymap(parsed)
      setRefreshKey(k => k + 1)
      alert('Keymap imported')
    } catch {
      alert('Invalid JSON')
    }
  }

  return (
    <div className="integration-settings">
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

      <hr />
      <h3>Keymap Editor</h3>
      <p>Remap existing shortcuts. Conflicts will be rejected.</p>
      <div>
        {list.map((i, idx) => (
          <div key={`${i.normalized}-${idx}`} className="is-grid-row">
            <span title={i.scope ?? 'global'}>{i.description || 'Shortcut'}</span>
            <code>{i.combo}</code>
            <input type="text" placeholder="New combo (e.g., ctrl+shift+k)" aria-label={`Remap ${i.combo}`} onKeyDown={(e) => { if (e.key === 'Enter') doRemap(i.normalized, (e.target as HTMLInputElement).value) }} />
            <button type="button" onClick={(e) => {
              const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement | null)
              if (input) doRemap(i.normalized, input.value)
            }}>Remap</button>
          </div>
        ))}
      </div>
      <div className="is-button-row">
        <button type="button" onClick={doExport}>Export Keymap</button>
        <button type="button" onClick={doImport}>Import Keymap</button>
      </div>
      <textarea value={importText} onChange={e => setImportText((e.target as HTMLTextAreaElement).value)} placeholder="Paste keymap JSON here" rows={6} className="is-textarea" />
    </div>
  )
}

const IntegrationSettingsPanel = createPanel(
  { id: 'settings-integration', name: 'Integration', icon: '⚙️' },
  ((props: PanelProps) => React.createElement(IntegrationSettingsView)) as React.FC<PanelProps>,
)

export default IntegrationSettingsPanel


