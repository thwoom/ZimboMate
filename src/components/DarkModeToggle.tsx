import React, { useState, useEffect } from 'react';
import { themeService, ThemeMode } from '../services/ThemeService';
import './DarkModeToggle.css';

const DarkModeToggle: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(themeService.getCurrentTheme());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = themeService.addListener(setCurrentTheme);
    return unsubscribe;
  }, []);

  const availableThemes = themeService.getAvailableThemes();

  const handleThemeSelect = (theme: ThemeMode) => {
    themeService.setTheme(theme);
    setShowDropdown(false);
  };

  const getThemeIcon = (theme: ThemeMode) => {
    switch (theme) {
      case 'dark': return '🌙';
      case 'light': return '☀️';
      case 'moon': return '🌚';
      case 'auto': return '🔄';
      case 'high-contrast': return '⚫';
      default: return '🌙';
    }
  };

  const getCurrentThemeLabel = () => {
    const theme = availableThemes.find(t => t.value === currentTheme);
    return theme?.label || 'Rose Pine';
  };

  return (
    <div className="theme-selector">
      <button
        className={`theme-toggle ${currentTheme}`}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Current theme: ${getCurrentThemeLabel()}`}
        title={`Current theme: ${getCurrentThemeLabel()}`}
      >
        <div className="theme-toggle__track">
          <div className="theme-toggle__thumb">
            <span className="theme-toggle__icon">
              {getThemeIcon(currentTheme)}
            </span>
          </div>
        </div>
        <span className="theme-toggle__label">{getCurrentThemeLabel()}</span>
        <span className="theme-toggle__arrow">▼</span>
      </button>

      {showDropdown && (
        <div className="theme-dropdown">
          <div className="theme-dropdown__backdrop" onClick={() => setShowDropdown(false)} />
          <div className="theme-dropdown__content">
            <div className="theme-dropdown__header">
              <h3 > Rose Pine Themes</h3>
            </div>
            {availableThemes.map(theme => (
              <button
                key={theme.value}
                className={`theme-option ${currentTheme === theme.value ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme.value)}
              >
                <span className="theme-option__icon">{getThemeIcon(theme.value)}</span>
                <div className="theme-option__info">
                  <span className="theme-option__label">{theme.label}</span>
                  <span className="theme-option__description">{theme.description}</span>
                </div>
                {currentTheme === theme.value && (
                  <span className="theme-option__check">✓</span>
                )}
              </button>
            ))}

            <div className="theme-dropdown__footer">
              <small > Powered by Rose Pine color palette</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DarkModeToggle;
