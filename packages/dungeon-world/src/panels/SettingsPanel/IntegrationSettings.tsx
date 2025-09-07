import React, { useMemo, useState } from 'react'
import { useGameStore } from '../../store/GameStore'
import { exportKeymap, getRegisteredShortcuts, importKeymap, remapShortcut } from '../../utils/KeyboardShortcuts'
import { createPanel, type PanelProps } from '../../framework/Panel'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Switch } from '../../components/ui/switch'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn, getVariant } from '../../utils/motion'

const IntegrationSettingsView: React.FC = () => {
  const { state, updateSettings } = useGameStore()
  const s = state.settings.integration!
  const [refreshKey, setRefreshKey] = useState(0)
  const [importText, setImportText] = useState('')
  const list = useMemo(() => getRegisteredShortcuts(), [refreshKey])
  const prefersReduced = useReducedMotion()

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
    <motion.div initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={getVariant('fade')}>
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Integration Settings</CardTitle>
          </CardHeader>
          <CardContent>
          <motion.div className="space-y-3" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={s.contextMenuEnabled} onCheckedChange={(v) => updateSettings({ integration: { ...s, contextMenuEnabled: !!v } })} />
              <span>Enable custom context menu</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <span>Tooltip delay (ms):</span>
              <Input type="number" value={s.tooltipDelayMs} onChange={e => updateSettings({ integration: { ...s, tooltipDelayMs: Number((e.target as HTMLInputElement).value) } })} />
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={s.highContrastMenu} onCheckedChange={(v) => updateSettings({ integration: { ...s, highContrastMenu: !!v } })} />
              <span>High contrast context menu</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={s.suspendShortcutsOnDialog} onCheckedChange={(v) => updateSettings({ integration: { ...s, suspendShortcutsOnDialog: !!v } })} />
              <span>Suspend shortcuts when a dialog is open</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={s.overlayEnabled} onCheckedChange={(v) => updateSettings({ integration: { ...s, overlayEnabled: !!v } })} />
              <span>Enable Shortcuts Overlay</span>
            </motion.label>

            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={state.settings.uiOverlays?.r3fHudEnabled !== false} onCheckedChange={(v) => updateSettings({ uiOverlays: { r3fHudEnabled: !!v } })} />
              <span>Enable 3D HUD overlay (R3F)</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={state.settings.uiOverlays?.introSceneEnabled !== false} onCheckedChange={(v) => updateSettings({ uiOverlays: { introSceneEnabled: !!v } })} />
              <span>Enable intro scene overlay (R3F)</span>
            </motion.label>
            <motion.label className="flex items-center gap-2" variants={itemFadeIn}>
              <Switch checked={state.settings.uiOverlays?.panelBackdropEnabled !== false} onCheckedChange={(v) => updateSettings({ uiOverlays: { panelBackdropEnabled: !!v } })} />
              <span>Enable panel backdrops (R3F)</span>
            </motion.label>
          </motion.div>

          <hr className="my-4 border-[--color-border]" />
          <h3 className="text-base font-semibold mb-2">Keymap Editor</h3>
          <p className="text-sm text-[--color-muted-foreground] mb-3">Remap existing shortcuts. Conflicts will be rejected.</p>

          <motion.div className="grid gap-2 [grid-template-columns:1fr_1fr_1fr_auto]" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            {list.map((i, idx) => (
              <motion.div key={`${i.normalized}-${idx}`} className="grid items-center gap-2" variants={itemFadeIn}>
                <span title={i.scope ?? 'global'}>{i.description || 'Shortcut'}</span>
                <code>{i.combo}</code>
                <Input placeholder="New combo (e.g., ctrl+shift+k)" aria-label={`Remap ${i.combo}`} onKeyDown={(e) => { if (e.key === 'Enter') doRemap(i.normalized, (e.target as HTMLInputElement).value) }} />
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Button type="button" onClick={(e) => {
                    const input = (e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement | null)
                    if (input) doRemap(i.normalized, input.value)
                  }}>Remap</Button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-3 flex items-center gap-2">
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              <Button type="button" onClick={doExport}>Export Keymap</Button>
            </motion.div>
            <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              <Button type="button" variant="secondary" onClick={doImport}>Import Keymap</Button>
            </motion.div>
          </div>
          <motion.textarea value={importText} onChange={e => setImportText((e.target as HTMLTextAreaElement).value)} placeholder="Paste keymap JSON here" rows={6} className="w-full mt-2" variants={itemFadeIn} />
          </CardContent>
        </Card>
      </HUDFrame>
    </motion.div>
  )
}

const IntegrationSettingsPanel = createPanel(
  { id: 'settings-integration', name: 'Integration', icon: '⚙️' },
  ((props: PanelProps) => React.createElement(IntegrationSettingsView)) as React.FC<PanelProps>,
)

export default IntegrationSettingsPanel


