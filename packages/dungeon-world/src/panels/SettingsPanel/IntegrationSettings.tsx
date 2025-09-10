import React, { useMemo, useState } from 'react'
import { useGameStore } from '../../store/GameStore'
import { exportKeymap, getRegisteredShortcuts, importKeymap, remapShortcut } from '../../utils/KeyboardShortcuts'
import { createPanel, type PanelProps } from '../../framework/Panel'
import './IntegrationSettings.css'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  contextMenuEnabled: z.boolean(),
  tooltipDelayMs: z.number().int().min(0, 'Must be >= 0').max(2000, 'Must be <= 2000'),
  highContrastMenu: z.boolean(),
  suspendShortcutsOnDialog: z.boolean(),
  overlayEnabled: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const IntegrationSettingsView: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const s = state.settings.integration!
  const [refreshKey, setRefreshKey] = useState(0)
  const [importText, setImportText] = useState('')
  const list = useMemo(() => getRegisteredShortcuts(), [refreshKey])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contextMenuEnabled: s.contextMenuEnabled,
      tooltipDelayMs: s.tooltipDelayMs,
      highContrastMenu: s.highContrastMenu,
      suspendShortcutsOnDialog: s.suspendShortcutsOnDialog,
      overlayEnabled: s.overlayEnabled,
    },
    mode: 'onSubmit',
  })

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

  const onSubmit = (values: FormValues) => {
    updateSettings({ integration: { ...s, ...values } })
    reset(values, { keepValues: true })
  }

  return (
    <div className="integration-settings">
      <h2>Integration Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label>
          <input type="checkbox" {...register('contextMenuEnabled')} defaultChecked={s.contextMenuEnabled} />
          Enable custom context menu
        </label>
        <br />
        <label>
          Tooltip delay (ms):{' '}
          <input type="number" min={0} max={2000} {...register('tooltipDelayMs', { valueAsNumber: true })} defaultValue={s.tooltipDelayMs} />
        </label>
        {errors.tooltipDelayMs && (<div className="form-error">{errors.tooltipDelayMs.message}</div>)}
        <br />
        <label>
          <input type="checkbox" {...register('highContrastMenu')} defaultChecked={s.highContrastMenu} />
          High contrast context menu
        </label>
        <br />
        <label>
          <input type="checkbox" {...register('suspendShortcutsOnDialog')} defaultChecked={s.suspendShortcutsOnDialog} />
          Suspend shortcuts when a dialog is open
        </label>
        <br />
        <label>
          <input type="checkbox" {...register('overlayEnabled')} defaultChecked={s.overlayEnabled} />
          Enable Shortcuts Overlay
        </label>
        <div className="is-button-row">
          <button type="submit" disabled={!isDirty}>Apply</button>
        </div>
      </form>

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


