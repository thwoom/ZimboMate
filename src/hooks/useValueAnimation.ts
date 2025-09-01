import { useEffect, useRef, useState } from 'react';

interface ValueChange {
  from: number;
  to: number;
  timestamp: number;
}

export function useValueAnimation(value: number, key?: string) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeClass, setChangeClass] = useState('');
  const [changeAmount, setChangeAmount] = useState < string | null>(null);
  const previousValue = useRef(value);
  const animationTimeout = useRef < ReturnType < typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip animation on initial mount
    if (previousValue.current === value) return;

    const diff = value-previousValue.current;
    if (diff === 0) return;

    // Clear unknown existing animation
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }

    // Set animation state
    setIsAnimating(true);
    setChangeClass(diff > 0 ? 'value-increase' : 'value-decrease');
    setChangeAmount(diff > 0 ? `+${diff}` : `${diff}`);

    // Clear animation after duration
    animationTimeout.current = setTimeout(() => {
      setIsAnimating(false);
      setChangeClass('');
      setChangeAmount(null);
    }, 1000);

    previousValue.current = value;

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [value]);

  return {
    className: isAnimating ? `value-changed ${changeClass}` : '',
    'data-change': changeAmount,
    'data-animation-key': key,
  };
}
