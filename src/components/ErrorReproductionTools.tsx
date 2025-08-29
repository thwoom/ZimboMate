import React, { useState, useEffect } from 'react';
import { userActionTracker } from '../services/UserActionTracker';
import { errorAnalyticsService } from '../services/ErrorAnalyticsService';
import './ErrorReproductionTools.css';

interface ErrorReproductionToolsProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  onClose: () => void;
}

const ErrorReproductionTools: React.FC<ErrorReproductionToolsProps> = ({
  error,
  errorInfo,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'reproduction' | 'timeline' | 'environment'>('reproduction');
  const [reproductionSteps, setReproductionSteps] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial reproduction steps based on user actions
    const errorTime = Date.now();
    const recentActions = userActionTracker.getActionsBeforeError(errorTime, 60000); // Last minute
    const steps = generateReproductionSteps(recentActions);
    setReproductionSteps(steps);
  }, [error]);

  const generateReproductionSteps = (actions: any[]): string[] => {
    const steps: string[] = [];
    
    // Add environment setup
    steps.push('1. Open the application in the browser');
    steps.push(`2. Navigate to: ${window.location.pathname}`);
    
    // Convert user actions to reproduction steps
    actions.forEach((action, index) => {
      const stepNumber = index + 3;
      switch (action.type) {
        case 'click':
          steps.push(`${stepNumber}. Click on ${action.description.replace('Clicked: ', '')}`);
          break;
        case 'input':
          steps.push(`${stepNumber}. Enter text in ${action.description.replace('Input in: ', '')}`);
          break;
        case 'navigation':
          steps.push(`${stepNumber}. Navigate to ${action.data?.url || 'new page'}`);
          break;
        case 'api-call':
          steps.push(`${stepNumber}. Trigger API call: ${action.description}`);
          break;
        default:
          if (action.description) {
            steps.push(`${stepNumber}. ${action.description}`);
          }
      }
    });

    steps.push(`${steps.length + 1}. Error should occur: ${error.message}`);
    
    return steps;
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedActions([]);
    userActionTracker.startTracking();
    
    // Track actions for the next 30 seconds or until stopped
    const recordingInterval = setInterval(() => {
      const recentActions = userActionTracker.getRecentActions(50);
      setRecordedActions(recentActions);
    }, 1000);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (isRecording) {
        stopRecording();
      }
      clearInterval(recordingInterval);
    }, 30000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    const finalActions = userActionTracker.getRecentActions(50);
    const newSteps = generateReproductionSteps(finalActions);
    setReproductionSteps(newSteps);
  };

  const copyReproductionSteps = async () => {
    const stepsText = reproductionSteps.join('\n');
    try {
      await navigator.clipboard.writeText(stepsText);
      alert('Reproduction steps copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateBugReport = () => {
    const environment = getEnvironmentInfo();
    const timeline = userActionTracker.getRecentActions(20);
    
    const bugReport = `# Bug Report

## Error Information
- **Error:** ${error.name}
- **Message:** ${error.message}
- **Timestamp:** ${new Date().toISOString()}

## Reproduction Steps
${reproductionSteps.map(step => `${step}`).join('\n')}

## Environment
- **Browser:** ${environment.browser}
- **OS:** ${environment.os}
- **Screen:** ${environment.screen}
- **URL:** ${environment.url}
- **User Agent:** ${environment.userAgent}

## User Timeline (Last 20 actions)
${timeline.map(action => `- ${new Date(action.timestamp).toLocaleTimeString()}: ${action.description}`).join('\n')}

## Stack Trace
\`\`\`
${error.stack}
\`\`\`

## Component Stack
\`\`\`
${errorInfo?.componentStack || 'Not available'}
\`\`\`
`;

    return bugReport;
  };

  const getEnvironmentInfo = () => {
    return {
      browser: navigator.userAgent.split(' ')[0],
      os: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  const exportBugReport = async () => {
    const report = generateBugReport();
    try {
      await navigator.clipboard.writeText(report);
      alert('Bug report copied to clipboard!');
    } catch (err) {
      // Fallback: create downloadable file
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bug-report-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const replayActions = () => {
    // This is a simplified replay - in a real implementation, you'd need more sophisticated action replay
    alert('Action replay is not fully implemented in this demo. This would programmatically repeat the recorded user actions.');
  };

  return (
    <div className="error-reproduction-tools">
      <div className="reproduction-header">
        <h3>🔧 Error Reproduction Tools</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="reproduction-tabs">
        <button 
          className={`tab ${activeTab === 'reproduction' ? 'active' : ''}`}
          onClick={() => setActiveTab('reproduction')}
        >
          📝 Reproduction
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          ⏱️ Timeline
        </button>
        <button 
          className={`tab ${activeTab === 'environment' ? 'active' : ''}`}
          onClick={() => setActiveTab('environment')}
        >
          🖥️ Environment
        </button>
      </div>

      <div className="reproduction-content">
        {activeTab === 'reproduction' && (
          <div className="reproduction-tab">
            <div className="reproduction-controls">
              <button 
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? '⏹️ Stop Recording' : '🔴 Record New Steps'}
              </button>
              
              <button className="copy-button" onClick={copyReproductionSteps}>
                📋 Copy Steps
              </button>
              
              <button className="export-button" onClick={exportBugReport}>
                📄 Export Bug Report
              </button>
            </div>

            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                Recording user actions... ({recordedActions.length} actions captured)
              </div>
            )}

            <div className="reproduction-steps">
              <h4>Reproduction Steps:</h4>
              <ol>
                {reproductionSteps.map((step, index) => (
                  <li key={index} className="reproduction-step">
                    {step.replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ol>
            </div>

            <div className="reproduction-actions">
              <button className="replay-button" onClick={replayActions}>
                ▶️ Replay Actions (Demo)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="timeline-tab">
            <h4>User Action Timeline (Last 20 actions):</h4>
            <div className="timeline-list">
              {userActionTracker.getRecentActions(20).map((action, index) => (
                <div key={action.id} className={`timeline-item ${action.type}`}>
                  <div className="timeline-time">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="timeline-type">{action.type}</div>
                  <div className="timeline-description">{action.description}</div>
                  {action.data && (
                    <div className="timeline-data">
                      {JSON.stringify(action.data, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'environment' && (
          <div className="environment-tab">
            <h4>Environment Information:</h4>
            <div className="environment-grid">
              {Object.entries(getEnvironmentInfo()).map(([key, value]) => (
                <div key={key} className="environment-item">
                  <strong>{key}:</strong>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>

            <h4>Error Analysis:</h4>
            <div className="error-analysis">
              {(() => {
                const analysis = errorAnalyticsService.analyzeError(error);
                return (
                  <div>
                    <div className="analysis-item">
                      <strong>Severity:</strong> 
                      <span className={`severity ${analysis.severity}`}>
                        {analysis.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="analysis-item">
                      <strong>Category:</strong> {analysis.category}
                    </div>
                    {analysis.suggestions.length > 0 && (
                      <div className="analysis-suggestions">
                        <strong>Suggestions:</strong>
                        <ul>
                          {analysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorReproductionTools;
