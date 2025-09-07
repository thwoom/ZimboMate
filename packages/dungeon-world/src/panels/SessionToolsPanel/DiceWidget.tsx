import React, { useEffect, useMemo, useState } from 'react'
import { diceRollingService, type RollModifiers } from '../../services/DiceRollingService'
import { registerShortcut, setActiveScope } from '../../utils/KeyboardShortcuts'
import { Input } from '../../components/ui/input'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'
import { motion, useReducedMotion } from 'framer-motion'
import { itemFadeIn } from '../../utils/motion'

interface DiceWidgetProps {
  scopeId: string
}

const DiceWidget: React.FC<DiceWidgetProps> = ({ scopeId }) => {
  const [modifier, setModifier] = useState<number>(0)
  const [advantage, setAdvantage] = useState(false)
  const [disadvantage, setDisadvantage] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [detail, setDetail] = useState<string>('')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setActiveScope(scopeId)
    const unregister = registerShortcut({
      combo: 'Ctrl+Shift+R',
      scope: scopeId,
      preventDefault: true,
      handler: () => onRoll(),
    })
    return () => { setActiveScope(null); unregister() }
  }, [scopeId])

  const onRoll = () => {
    const modifiers: RollModifiers = { stat: 0, ongoing: 0, forward: 0, other: modifier || 0 }
    const roll = diceRollingService.roll2d6(modifiers, { advantage, disadvantage })
    setSummary(diceRollingService.getRollSummary(roll))
    setDetail(diceRollingService.getResultText(roll))
    try {
      const text = `2d6${roll.modifier >= 0 ? '+' : ''}${roll.modifier} = ${roll.total} (${roll.result})`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any)?.__devTelemetry?.record?.('dice:roll')
      // Emit to session log if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { panelEventBus } = require('../../framework/PanelAPI') as any
      panelEventBus?.emit?.('session:log:add', { type: 'roll', text })
    } catch {}
  }

  const disableConflict = useMemo(() => advantage && disadvantage, [advantage, disadvantage])

  return (
    <div className="st-dice-widget">
      <div className="st-dice-row flex items-center gap-3">
        <label htmlFor="mod-input" className="text-sm text-[--color-muted-foreground]">Modifier:</label>
        <Input id="mod-input" type="number" value={modifier} onChange={e => setModifier(Number.parseInt((e.target as HTMLInputElement).value || '0'))} aria-label="Roll modifier" className="w-24" />
        <label className="st-checkbox flex items-center gap-2">
          <Switch checked={advantage} onCheckedChange={(v) => { setAdvantage(!!v); if (v) setDisadvantage(false) }} aria-label="Advantage" />
          <span>Advantage</span>
        </label>
        <label className="st-checkbox flex items-center gap-2">
          <Switch checked={disadvantage} onCheckedChange={(v) => { setDisadvantage(!!v); if (v) setAdvantage(false) }} aria-label="Disadvantage" />
          <span>Disadvantage</span>
        </label>
        <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          <Button type="button" onClick={onRoll} aria-describedby="roll-help">Roll 2d6</Button>
        </motion.div>
        <span id="roll-help" className="st-help text-xs text-[--color-muted-foreground]">Ctrl+Shift+R</span>
      </div>
      <div className="st-dice-output mt-2" aria-live="polite">
        {summary && (
          <motion.div variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <div className="st-dice-summary font-semibold">{summary}</div>
            <div className="st-dice-detail text-sm text-[--color-muted-foreground]">{detail}</div>
          </motion.div>
        )}
      </div>
      {disableConflict && <div className="st-warning mt-2 text-xs text-[--color-destructive]" role="status">Cannot use advantage and disadvantage together</div>}
    </div>
  )
}

export default DiceWidget
