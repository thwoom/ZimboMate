import React, { useState, useEffect } from 'react';
import { IntegratedValidation } from '../hooks/useIntegratedValidation';
import './RealTimeValidation.css';

interface RealTimeValidationProps {
  validation: IntegratedValidation;
  compact?: boolean;
  showSuggestions?: boolean;
}

export const RealTimeValidation: React.FC < RealTimeValidationProps> = ({
  validation,
  compact = false,
  showSuggestions = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings' | 'info'>('all');

  // Auto-collapse if no issues
  useEffect(() => {
    if (compact && !validation.hasErrors && !validation.hasWarnings) {
      setIsExpanded(false);
    }
  }, [compact, validation.hasErrors, validation.hasWarnings]);

  const getStatusColor = () => {
    if (validation.hasErrors) return 'error';
    if (validation.hasWarnings) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (validation.hasErrors) return '❌';
    if (validation.hasWarnings) return '⚠️';
    return '✅';
  };

  const getStatusText = () => {
    const counts = [];
    if (validation.allErrors.length > 0) {
      counts.push(`${validation.allErrors.length} error${validation.allErrors.length > 1 ? 's' : ''}`);
    }
    if (validation.allWarnings.length > 0) {
      counts.push(`${validation.allWarnings.length} warning${validation.allWarnings.length > 1 ? 's' : ''}`);
    }
    if (validation.allInfo.length > 0) {
      counts.push(`${validation.allInfo.length} info`);
    }

    return counts.length > 0 ? counts.join(', ') : 'All validations passed';
  };

  const filteredItems = () => {
    switch (filter) {
      case 'errors':
        return validation.allErrors.map(err => ({ type: 'error', message: err }));
      case 'warnings':
        return validation.allWarnings.map(warn => ({ type: 'warning', message: warn }));
      case 'info':
        return validation.allInfo.map(info => ({ type: 'info', message: info }));
      default:
        return [
          ...validation.allErrors.map(err => ({ type: 'error', message: err })),
          ...validation.allWarnings.map(warn => ({ type: 'warning', message: warn })),
          ...validation.allInfo.map(info => ({ type: 'info', message: info })),
        ];
    }
  };

  if (compact && !isExpanded) {
    return (
      <div
        className={`realtime-validation compact ${getStatusColor()}`}
        onClick={() => setIsExpanded(true)}
      >
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
        <button className="expand-btn">▶</button>
      </div>
    );
  }

  return (
    <div className={`realtime-validation ${getStatusColor()} ${compact ? 'compact-expanded' : ''}`}>
      <div className="validation-header">
        <div className="header-content">
          <span className="status-icon">{getStatusIcon()}</span>
          <h3 > Validation Status</h3>
          <span className="status-summary">{getStatusText()}</span>
        </div>
        {compact && (
          <button
            className="collapse-btn"
            onClick={() => setIsExpanded(false)}
          >
            ▼
          </button>
        )}
      </div>

      {(validation.hasErrors || validation.hasWarnings || validation.allInfo.length > 0) && (
        <>
          <div className="filter-bar">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'errors' ? 'active' : ''}`}
              onClick={() => setFilter('errors')}
              disabled={validation.allErrors.length === 0}
            >
              Errors ({validation.allErrors.length})
            </button>
            <button
              className={`filter-btn ${filter === 'warnings' ? 'active' : ''}`}
              onClick={() => setFilter('warnings')}
              disabled={validation.allWarnings.length === 0}
            >
              Warnings ({validation.allWarnings.length})
            </button>
            <button
              className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
              onClick={() => setFilter('info')}
              disabled={validation.allInfo.length === 0}
            >
              Info ({validation.allInfo.length})
            </button>
          </div>

          <div className="validation-list">
            {filteredItems().map((item, index) => (
              <div key={index} className={`validation-item ${item.type}`}>
                <span className="item-icon">
                  {item.type === 'error' ? '❌' : item.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span className="item-message">{item.message}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {showSuggestions && validation.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4 > Suggestions</h4>
          <ul className="suggestions-list">
            {validation.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
