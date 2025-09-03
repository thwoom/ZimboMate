/**
 * 3D Dice Animation Component for Dungeon World * Provides satisfying visual feedback for dice rolls
 */

import './DiceAnimation.css';

import React, { useEffect, useRef, useState } from 'react';

import { DiceType,EnhancedDiceRoll } from '../services/DiceRollingService';

interface DiceAnimationProps {
  roll?: EnhancedDiceRoll | null;
  onAnimationComplete?: () => void;
  theme?: 'classic' | 'neon' | 'wood' | 'metal' | 'bone';
  size?: 'small' | 'medium' | 'large';
  soundEnabled?: boolean;
}

interface DiceState {
  id: string;
  type: DiceType;
  value: number;
  x: number;
  y: number;
  rotation: number;
  animating: boolean;
}

const DiceAnimation: React.FC < DiceAnimationProps> = ({
  roll,
  onAnimationComplete,
  theme = 'classic',
  size = 'medium',
  soundEnabled = true,
}) => {
  const containerRef = useRef < HTMLDivElement>(null);
  const [dice, setDice] = useState < DiceState[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioContextRef = useRef < AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as string).webkitAudioContext)();
      } catch {
        }
    }
  }, [soundEnabled]);

  // Play dice sound effect
  const playDiceSound = (diceType: DiceType, count: number) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Different frequencies for different dice
    const frequencies: Record < DiceType, number> = {
      'd4': 800,
      'd6': 600,
      'd8': 500,
      'd10': 400,
      'd12': 350,
      'd20': 300,
    };

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequencies[diceType], ctx.currentTime);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    // Add multiple dice clattering sound
    if (count > 1) {
      setTimeout(() => {
        const oscillator2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        oscillator2.frequency.setValueAtTime(frequencies[diceType] * 1.2, ctx.currentTime);
        oscillator2.type = 'sawtooth';
        gainNode2.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        oscillator2.start(ctx.currentTime);
        oscillator2.stop(ctx.currentTime + 0.2);
      }, 100);
    }
  };

  // Animate dice roll
  useEffect(() => {
    if (!roll || !containerRef.current) return;

    setIsAnimating(true);
    playDiceSound(roll.expression.type, roll.expression.count);

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Create dice states
    const newDice: DiceState[] = roll.results.map((item, index) => ({
      id: `${roll.id}_${index}`,
      type: roll.expression.type,
      value,
      x: Math.random() * (containerRect.width-60) + 30,
      y: Math.random() * (containerRect.height-60) + 30,
      rotation: Math.random() * 360,
      animating: true,
    }));

    setDice(newDice);

    // Animation sequence
    setTimeout(() => {
      setDice(prev => prev.map(die => ({
        ...die,
        animating: false,
      })));
    }, 1000);

    setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
    }, 1500);

  }, [roll, onAnimationComplete, soundEnabled]);

  const getDiceSymbol = (type: DiceType, value: number): string => {
    // Special symbols for different dice types
    switch (type) {
      case 'd4':
        return '▲';
      case 'd6': {
        // Use actual die faces for d6
        const d6Faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return d6Faces[value-1] || value.toString();
      }
      case 'd8':
        return '◆';
      case 'd10':
        return '◯';
      case 'd12':
        return '◉';
      case 'd20':
        return '◈';
      default:
        return value.toString();
    }
  };

  const getDiceColor = (type: DiceType, theme: string): string => {
    const colors: Record < string, Record < DiceType, string>> = {
      classic: {
        'd4': '#ff6b6b',
        'd6': '#4ecdc4',
        'd8': '#45b7d1',
        'd10': '#96ceb4',
        'd12': '#feca57',
        'd20': '#ff9ff3',
      },
      neon: {
        'd4': '#ff0080',
        'd6': '#00ff80',
        'd8': '#0080ff',
        'd10': '#80ff00',
        'd12': '#ff8000',
        'd20': '#8000ff',
      },
      wood: {
        'd4': '#8b4513',
        'd6': '#a0522d',
        'd8': '#cd853f',
        'd10': '#daa520',
        'd12': '#b8860b',
        'd20': '#d2691e',
      },
      metal: {
        'd4': '#708090',
        'd6': '#778899',
        'd8': '#696969',
        'd10': '#808080',
        'd12': '#a9a9a9',
        'd20': '#c0c0c0',
      },
      bone: {
        'd4': '#f5f5dc',
        'd6': '#fff8dc',
        'd8': '#faf0e6',
        'd10': '#fdf5e6',
        'd12': '#fffacd',
        'd20': '#fffff0',
      },
    };

    return colors[theme]?.[type] || colors.classic[type];
  };

  const getSizeClass = (size: string): string => {
    switch (size) {
      case 'small': return 'dice-small';
      case 'large': return 'dice-large';
      default: return 'dice-medium';
    }
  };

  if (!roll) {
    return (
      <div className="dice-animation-container empty" ref={containerRef}>
        <div className="roll-prompt">
          🎲 Ready to roll!
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dice-animation-container ${theme} ${getSizeClass(size)} ${isAnimating ? 'animating' : ''}`}
      ref={containerRef}
    >
      {dice.map((die) => (
        <div
          key={die.id}
          className={`dice ${die.type} ${die.animating ? 'rolling' : 'settled'}`}
          style={{
            left: `${die.x}px`,
            top: `${die.y}px`,
            transform: `rotate(${die.rotation}deg)`,
            backgroundColor: getDiceColor(die.type, theme),
            '--dice-color': getDiceColor(die.type, theme),
          } as React.CSSProperties}
        >
          <div className="dice-face">
            <span className="dice-symbol">
              {getDiceSymbol(die.type, die.value)}
            </span>
            <span className="dice-value">
              {die.value}
            </span>
          </div>
        </div>
      ))}

      {/* Roll Result Overlay */}
      {!isAnimating && roll && (
        <div className="roll-result-overlay">
          <div className="roll-total">
            {roll.finalResult}
          </div>
          {roll.rollResult && (
            <div className={`roll-outcome ${roll.rollResult}`}>
              {roll.rollResult === 'success' && '✅ Success!'}
              {roll.rollResult === 'partial' && '⚠️ Partial Success'}
              {roll.rollResult === 'failure' && '❌ Failure-Mark XP!'}
            </div>
          )}
          {roll.success !== undefined && (
            <div className={`roll-outcome ${roll.success ? 'success' : 'failure'}`}>
              {roll.success ? '✅ Success!' : '❌ Failure'}
              {roll.targetNumber && ` (Target: ${roll.targetNumber})`}
            </div>
          )}
        </div>
      )}

      {/* Particle Effects for Critical Results */}
      {!isAnimating && roll?.rollResult === 'success' && (
        <div className="success-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}>✨</div>
          ))}
        </div>
      )}

      {!isAnimating && roll?.rollResult === 'failure' && (
        <div className="failure-particles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}>💥</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiceAnimation;



