import React, { useEffect, useRef, useState } from 'react'

import './SpellConsequenceModal.css'

type Consequence = 'unwelcome-attention' | 'forget' | 'strain'

interface SpellConsequenceModalProps {
  isOpen: boolean
  spellName: string
  casterClass: 'Wizard' | 'Cleric'
  onConfirm: (choice: Consequence) => void
  onCancel: () => void
}

const SpellConsequenceModal: React.FC <SpellConsequenceModalProps> = ({
  isOpen,
  spellName,
  casterClass,
  onConfirm,
  onCancel,
}) => {
  const [choice, setChoice] = useState <Consequence>('unwelcome-attention')
  const dialogRef = useRef <HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setChoice('unwelcome-attention')
      previouslyFocused.current = document.activeElement as HTMLElement
      // focus the first focusable
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      focusables && focusables[0]?.focus()

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
          return
        }
        if (e.key === 'Tab') {
          const list = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          if (!list || list.length === 0) return
          const first = list[0]
          const last = list[list.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
    return
  }, [isOpen, onCancel])

  useEffect(() => {
    return () => {
      previouslyFocused.current?.focus()
    }
  }, [])

  if (!isOpen)
    return null

  const forgetLabel = casterClass === 'Cleric' ? 'Spell is revoked (remove from prepared)' : 'Forget the spell (remove from prepared)'

  return (
    <div className="spell-modal__backdrop bg-black/40 backdrop-blur-sm">
      <div
        className="spell-modal__dialog bg-white/10 dark:bg-white/10 backdrop-blur-2xl border border-white/20"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="spell-modal-title"
        aria-describedby="spell-modal-desc"
      >
        <div className="spell-modal__header">
          <h3 id="spell-modal-title">7–9: Choose a consequence</h3>
          <button className="spell-modal__close" aria-label="Close" onClick={onCancel} type="button">×</button>
        </div>
        <div className="spell-modal__body" id="spell-modal-desc">
          <p>
            {' '}
            Casting
            <strong>{spellName}</strong>
            {' '}
            succeeded, but with a cost. Choose one consequence per Dungeon World rules.
          </p>
          <div className="spell-modal__options" role="radiogroup" aria-label="Spell consequence choices">
            <label className={`spell-modal__option ${choice === 'unwelcome-attention' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="consequence"
                value="unwelcome-attention"
                checked={choice === 'unwelcome-attention'}
                onChange={() => setChoice('unwelcome-attention')}
              />
              <div>
                <div className="spell-modal__option-title">Draw unwelcome attention or put yourself in a spot</div>
                <div className="spell-modal__option-desc">The GM will detail the immediate danger or complication.</div>
              </div>
            </label>

            <label className={`spell-modal__option ${choice === 'forget' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="consequence"
                value="forget"
                checked={choice === 'forget'}
                onChange={() => setChoice('forget')}
              />
              <div>
                <div className="spell-modal__option-title">{forgetLabel}</div>
                <div className="spell-modal__option-desc">You can prepare / commune again later to regain it.</div>
              </div>
            </label>

            <label className={`spell-modal__option ${choice === 'strain' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="consequence"
                value="strain"
                checked={choice === 'strain'}
                onChange={() => setChoice('strain')}
              />
              <div>
                <div className="spell-modal__option-title">-1 ongoing to Cast a Spell</div>
                <div className="spell-modal__option-desc">
                  Until you next
                  {casterClass === 'Cleric' ? 'Commune' : 'Prepare Spells'}
                  .
                </div>
              </div>
            </label>
          </div>
        </div>
        <div className="spell-modal__footer">
          <button className="btn" onClick={() => onConfirm(choice)} type="button">Confirm</button>
          <button className="btn btn-secondary" onClick={onCancel} type="button">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default SpellConsequenceModal
