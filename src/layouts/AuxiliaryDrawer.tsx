import React, { useState, useEffect } from 'react';
import { panelEventBus } from '../framework/PanelAPI';
import './AuxiliaryDrawer.css';

interface AuxiliaryDrawerProps {
  onClose: () => void;
}

interface RollResult {
  type: 'basic' | 'attribute';
  total: number;
  details?: string;
}

const AuxiliaryDrawer: React.FC<AuxiliaryDrawerProps> = ({ onClose }) => {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);
  
  useEffect(() => {
    // Listen for attribute rolls from panels
    const unsubscribe = panelEventBus.on('attribute-rolled', (event) => {
      const { attribute, roll1, roll2, modifier, total } = event.data;
      setLastRoll({
        type: 'attribute',
        total,
        details: `${attribute}: ${roll1}+${roll2}${modifier >= 0 ? '+' : ''}${modifier} = ${total}`
      });
    });
    
    return unsubscribe;
  }, []);
  return (
    <div className="auxiliary-drawer">
      <header className="auxiliary-drawer__header">
        <h3 className="auxiliary-drawer__title">Quick Tools</h3>
        <button
          className="auxiliary-drawer__close-button"
          onClick={onClose}
          title="Close drawer"
        >
          ✕
        </button>
      </header>

      <div className="auxiliary-drawer__content">
        <section className="auxiliary-drawer__section">
          <h4>Dice Roller</h4>
          <div className="dice-roller-placeholder">
            <button 
              className="dice-button"
              onClick={() => {
                const roll1 = Math.floor(Math.random() * 6) + 1;
                const roll2 = Math.floor(Math.random() * 6) + 1;
                const total = roll1 + roll2;
                setLastRoll({
                  type: 'basic',
                  total,
                  details: `${roll1}+${roll2} = ${total}`
                });
                
                // Emit dice roll event for panels to listen to
                panelEventBus.emit('aux-drawer', 'dice-rolled', {
                  roll1,
                  roll2,
                  total,
                  timestamp: Date.now()
                });
              }}
            >
              Roll 2d6
            </button>
            {lastRoll !== null && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {lastRoll.total}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0 }}>
                  {lastRoll.details}
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '4px 0 0 0' }}>
                  {lastRoll.total >= 10 ? '✓ Success!' : lastRoll.total >= 7 ? '~ Partial Success' : '✗ Miss...'}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="auxiliary-drawer__section">
          <h4>Quick Notes</h4>
          <textarea
            className="quick-notes-textarea"
            placeholder="Take quick notes during the session..."
            rows={6}
          />
        </section>

        <section className="auxiliary-drawer__section">
          <h4>Active Counters</h4>
          <div className="counters-placeholder">
            <p>Hold: 0</p>
            <p>Forward: 0</p>
            <p>Ongoing: 0</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuxiliaryDrawer;
