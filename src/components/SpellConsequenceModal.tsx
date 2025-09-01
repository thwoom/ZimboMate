import React, { useEffect, useRef, useState } from 'react';
import './SpellConsequenceModal.css';

type Consequence = 'unwelcome-attention' | 'forget' | 'strain';

interface SpellConsequenceModalProps {
  isOpen: boolean;
  spellName: string;
  casterClass: 'Wizard' | 'Cleric';
  onConfirm: (choice: Consequence) => void;
  onCancel: () => void;
}

const SpellConsequenceModal: React.FC < SpellConsequenceModalProps> = ({
  isOpen,
  spellName,
  casterClass,
  onConfirm,
  onCancel,
}) => {
  const [choice, setChoice] = useState < Consequence>('unwelcome-attention');
  const dialogRef = useRef < HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setChoice('unwelcome-attention');
      // focus the first radio
      const first = dialogRef.current?.querySelector < HTMLInputElement>('input[type="radio"]');
      first?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const forgetLabel = casterClass === 'Cleric' ? 'Spell is revoked (remove from prepared)' : 'Forget the spell (remove from prepared)';

  return (
    <div className="spell-modal__backdrop" role="dialog" aria-modal="true" aria-labelledby="spell-modal - title">
      <div className="spell-modal__dialog" ref={dialogRef}>
        <div className="spell-modal__header">
          <h3 id="spell-modal-title">7–9: Choose a consequence</h3>
          <button className="spell-modal__close" aria-label="Close" onClick={onCancel}>×</button>
        </div>
        <div className="spell-modal__body">
          <p > Casting < strong>{spellName}</strong > succeeded, but with a cost. Choose one consequence per Dungeon World rules.
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
                <div className="spell-modal__option-desc">Until you next {casterClass === 'Cleric' ? 'Commune' : 'Prepare Spells'}.</div>
              </div>
            </label>
          </div>
        </div>
        <div className="spell-modal__footer">
          <button className="btn" onClick={() => onConfirm(choice)}>Confirm</button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SpellConsequenceModal;

