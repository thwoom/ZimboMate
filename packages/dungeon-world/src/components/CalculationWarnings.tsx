import './CalculationWarnings.css';

import React, { useState } from 'react';

import { CalculationWarning } from '../services/CalculationWarnings';

interface CalculationWarningsProps {
  warnings: CalculationWarning[];
  suggestions?: string[];
  onAction?: (warning: CalculationWarning) => void;
}

export const CalculationWarnings: React.FC < CalculationWarningsProps> = ({
  warnings,
  suggestions = [],
  onAction,
}) => {
  const [expandedWarnings, setExpandedWarnings] = useState < Set < string>>(new Set());
  const [filter, setFilter] = useState < CalculationWarning['type'] | 'all'>('all');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedWarnings);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWarnings(newExpanded);
  };

  const getTypeIcon = (type: CalculationWarning['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
    }
  };

  const getCategoryIcon = (category: CalculationWarning['category']) => {
    switch (category) {
      case 'hp': return '❤️';
      case 'load': return '🎒';
      case 'equipment': return '⚔️';
      case 'xp': return '⭐';
      case 'attributes': return '💪';
      case 'general': return '📋';
    }
  };

  const filteredWarnings = filter === 'all'
    ? warnings
    : warnings.filter(w => w.type === filter);

  const warningCounts = {
    critical: warnings.filter(w => w.type === 'critical').length,
    error: warnings.filter(w => w.type === 'error').length,
    warning: warnings.filter(w => w.type === 'warning').length,
    info: warnings.filter(w => w.type === 'info').length,
  };

  if (warnings.length === 0) {
    return (
      <div className="calculation-warnings">
        <div className="no-warnings">
          <span className="check-icon">✅</span>
          <p > All calculations look good!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calculation-warnings">
      <div className="warnings-header">
        <h3 > Calculation Analysis</h3>
        <div className="warning-counts">
          {warningCounts.critical > 0 && (
            <span className="count critical">{warningCounts.critical} Critical</span>
          )}
          {warningCounts.error > 0 && (
            <span className="count error">{warningCounts.error} Errors</span>
          )}
          {warningCounts.warning > 0 && (
            <span className="count warning">{warningCounts.warning} Warnings</span>
          )}
          {warningCounts.info > 0 && (
            <span className="count info">{warningCounts.info} Info</span>
          )}
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({warnings.length})
        </button>
        <button
          className={`filter-tab ${filter === 'critical' ? 'active' : ''}`}
          onClick={() => setFilter('critical')}
          disabled={warningCounts.critical === 0}
        >
          Critical ({warningCounts.critical})
        </button>
        <button
          className={`filter-tab ${filter === 'error' ? 'active' : ''}`}
          onClick={() => setFilter('error')}
          disabled={warningCounts.error === 0}
        >
          Errors ({warningCounts.error})
        </button>
        <button
          className={`filter-tab ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
          disabled={warningCounts.warning === 0}
        >
          Warnings ({warningCounts.warning})
        </button>
        <button
          className={`filter-tab ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
          disabled={warningCounts.info === 0}
        >
          Info ({warningCounts.info})
        </button>
      </div>

      <div className="warnings-list">
        {filteredWarnings.map(warning => (
          <div
            key={warning.id}
            className={`warning-item ${warning.type} ${expandedWarnings.has(warning.id) ? 'expanded' : ''}`}
          >
            <div
              className="warning-header"
              onClick={() => toggleExpanded(warning.id)}
            >
              <div className="warning-icons">
                <span className="type-icon">{getTypeIcon(warning.type)}</span>
                <span className="category-icon">{getCategoryIcon(warning.category)}</span>
              </div>
              <div className="warning-content">
                <h4>{warning.title}</h4>
                <p>{warning.message}</p>
              </div>
              <button className="expand-btn">
                {expandedWarnings.has(warning.id) ? '▼' : '▶'}
              </button>
            </div>

            {expandedWarnings.has(warning.id) && (
              <div className="warning-details">
                {warning.suggestion && (
                  <div className="suggestion">
                    <strong > Suggestion:</strong> {warning.suggestion}
                  </div>
                )}

                {warning.details && (
                  <div className="details">
                    <strong > Details:</strong>
                    <pre>{JSON.stringify(warning.details, null, 2)}</pre>
                  </div>
                )}

                {warning.actionable && onAction && (
                  <button
                    className="action-btn"
                    onClick={() => onAction(warning)}
                  >
                    {warning.actionable.label}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="optimization-suggestions">
          <h4 > Optimization Tips</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion || "No suggestion"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};



