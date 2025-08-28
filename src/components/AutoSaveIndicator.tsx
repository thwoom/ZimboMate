import React, { useEffect, useState } from 'react';
import './AutoSaveIndicator.css';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  message,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setFadeOut(false);

    // Auto-hide success message after delay
    if (status === 'saved') {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setIsVisible(false), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!isVisible) return null;

  const statusClass = `autosave-indicator ${status} ${fadeOut ? 'fade-out' : ''} ${className}`;

  return (
    <div className={statusClass}>
      <span className="autosave-icon">
        {status === 'saving' && '⏳'}
        {status === 'saved' && '✓'}
        {status === 'error' && '⚠'}
      </span>
      <span className="autosave-message">
        {message || getDefaultMessage(status)}
      </span>
    </div>
  );
};

function getDefaultMessage(status: AutoSaveIndicatorProps['status']): string {
  switch (status) {
    case 'saving':
      return 'Saving...';
    case 'saved':
      return 'All changes saved';
    case 'error':
      return 'Failed to save';
    default:
      return '';
  }
}
