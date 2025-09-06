import React, { useEffect, useMemo, useState } from 'react'
import { diceRollingService, type RollModifiers } from '../../services/DiceRollingService'
import { registerShortcut, setActiveScope } from '../../utils/KeyboardShortcuts'

interface DiceWidgetProps {
  scopeId: string
}

const DiceWidget: React.FC<DiceWidgetProps> = ({ scopeId }) => {
  const [modifier, setModifier] = useState<number>(0)
  const [advantage, setAdvantage] = useState(false)
  const [disadvantage, setDisadvantage] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [detail, setDetail] = useState<string>('')

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
      <div className="st-dice-row">
        <label htmlFor="mod-input">Modifier:</label>
        <input
          id="mod-input"
          type="number"
          value={modifier}
          onChange={e => setModifier(Number.parseInt(e.target.value || '0'))}
          aria-label="Roll modifier"
        />
        <label className="st-checkbox">
          <input
            type="checkbox"
            checked={advantage}
            onChange={e => { setAdvantage(e.target.checked); if (e.target.checked) setDisadvantage(false) }}
            aria-label="Advantage"
          />
          Advantage
        </label>
        <label className="st-checkbox">
          <input
            type="checkbox"
            checked={disadvantage}
            onChange={e => { setDisadvantage(e.target.checked); if (e.target.checked) setAdvantage(false) }}
            aria-label="Disadvantage"
          />
          Disadvantage
        </label>
        <button type="button" className="btn btn-primary" onClick={onRoll} aria-describedby="roll-help">
          Roll 2d6
        </button>
        <span id="roll-help" className="st-help">Ctrl+Shift+R</span>
      </div>
      <div className="st-dice-output" aria-live="polite">
        {summary && (
          <div>
            <div className="st-dice-summary">{summary}</div>
            <div className="st-dice-detail">{detail}</div>
          </div>
        )}
      </div>
      {disableConflict && <div className="st-warning" role="status">Cannot use advantage and disadvantage together</div>}
    </div>
  )
}

export default DiceWidget
