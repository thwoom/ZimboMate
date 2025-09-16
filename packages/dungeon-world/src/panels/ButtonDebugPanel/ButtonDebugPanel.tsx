import React, { useEffect, useState } from 'react'
import { createPanel, type PanelProps } from '../../framework/Panel'
import { Button } from '../../components/ui/Button'
import { ButtonDebugger } from '../../components/ui/ButtonDebugger'
import { 
  diagnoseAllButtons, 
  enableButtonDebugging, 
  autoFixAllButtons, 
  generateButtonReport,
  type ButtonDiagnostic 
} from '../../lib/buttonUtils'
import { 
  BugAntIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface TestResult {
  testName: string
  success: boolean
  details?: string
  timestamp: Date
}

interface ButtonDebugPanelState {
  diagnostics: ButtonDiagnostic[]
  testResults: TestResult[]
  debuggingEnabled: boolean
  autoFixCount: number
}

const ButtonDebugPanel: React.FC<PanelProps> = ({ id, panelState, onStateChange }) => {
  const [diagnostics, setDiagnostics] = useState<ButtonDiagnostic[]>(panelState?.diagnostics || [])
  const [testResults, setTestResults] = useState<TestResult[]>(panelState?.testResults || [])
  const [debuggingEnabled, setDebuggingEnabled] = useState(panelState?.debuggingEnabled || false)
  const [autoFixCount, setAutoFixCount] = useState(panelState?.autoFixCount || 0)
  
  useEffect(() => {
    // Initial diagnosis when panel loads
    runDiagnosis()
  }, [])
  
  useEffect(() => {
    // Save state changes
    if (onStateChange) {
      onStateChange({
        diagnostics,
        testResults,
        debuggingEnabled,
        autoFixCount
      })
    }
  }, [diagnostics, testResults, debuggingEnabled, autoFixCount, onStateChange])
  
  const runDiagnosis = () => {
    const results = diagnoseAllButtons()
    setDiagnostics(results)
    console.log('Button diagnosis completed:', results)
  }
  
  const enableDebugging = () => {
    enableButtonDebugging()
    setDebuggingEnabled(true)
    console.log('Button debugging enabled. Hover over buttons to see debug info.')
  }
  
  const autoFix = () => {
    const fixedCount = autoFixAllButtons()
    setAutoFixCount(prev => prev + fixedCount)
    runDiagnosis() // Re-run diagnosis after fixes
    console.log(`Auto-fixed ${fixedCount} button issues`)
  }
  
  const generateReport = () => {
    const report = generateButtonReport()
    console.log(report)
    
    // Also create a downloadable report
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zimbomate-button-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleTestResult = (testName: string, success: boolean, details?: string) => {
    const result: TestResult = {
      testName,
      success,
      details,
      timestamp: new Date()
    }
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }
  
  const workingButtons = diagnostics.filter(d => d.working).length
  const brokenButtons = diagnostics.filter(d => !d.working).length
  const successfulTests = testResults.filter(t => t.success).length
  
  return (
    <div className="button-debug-panel p-6 space-y-6">
      {/* Header */}
      <div className="glass rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Button Functionality Debugger</h1>
        <p className="text-(--color-text-secondary)">
          Diagnose and fix button issues throughout ZimboMate
        </p>
      </div>
      
      {/* Control Panel */}
      <div className="glass rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostic Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            variant="glass" 
            onClick={runDiagnosis}
          >
            <BugAntIcon className="w-4 h-4 mr-2" />
            Run Diagnosis
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={enableDebugging}
            disabled={debuggingEnabled}
          >
            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
            {debuggingEnabled ? 'Debugging Enabled' : 'Enable Debugging'}
          </Button>
          
          <Button 
            variant="warning" 
            onClick={autoFix}
          >
            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
            Auto-Fix Issues
          </Button>
          
          <Button 
            variant="outline" 
            onClick={generateReport}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
        
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-subtle p-4 rounded-lg">
            <div className="text-2xl font-bold text-(--color-success)">
              {workingButtons}
            </div>
            <div className="text-sm text-(--color-text-secondary)">
              Working Buttons
            </div>
          </div>
          
          <div className="glass-subtle p-4 rounded-lg">
            <div className="text-2xl font-bold text-(--color-danger)">
              {brokenButtons}
            </div>
            <div className="text-sm text-(--color-text-secondary)">
              Problematic Buttons
            </div>
          </div>
          
          <div className="glass-subtle p-4 rounded-lg">
            <div className="text-2xl font-bold text-(--color-warning)">
              {autoFixCount}
            </div>
            <div className="text-sm text-(--color-text-secondary)">
              Auto-Fixed Issues
            </div>
          </div>
          
          <div className="glass-subtle p-4 rounded-lg">
            <div className="text-2xl font-bold text-(--color-primary)">
              {successfulTests}
            </div>
            <div className="text-sm text-(--color-text-secondary)">
              Successful Tests
            </div>
          </div>
        </div>
      </div>
      
      {/* Issues List */}
      {brokenButtons > 0 && (
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-(--color-warning)" />
            Button Issues Found ({brokenButtons})
          </h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {diagnostics.filter(d => !d.working).map((diagnostic, index) => (
              <div key={index} className="glass-subtle p-4 rounded-lg">
                <div className="font-medium mb-2">
                  Button: "{diagnostic.element.textContent?.trim() || 'No text'}"
                </div>
                <div className="text-sm text-(--color-text-secondary) mb-2">
                  Class: {diagnostic.element.className || 'No classes'}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-(--color-danger) mb-1">Issues:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {diagnostic.issues.map((issue, i) => (
                        <li key={i} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="font-medium text-(--color-success) mb-1">Suggested Fixes:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {diagnostic.fixes.map((fix, i) => (
                        <li key={i} className="text-sm">{fix}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  result.success ? 'bg-(--color-success-subtle)' : 'bg-(--color-danger-subtle)'
                }`}
              >
                {result.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-(--color-success)" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-(--color-danger)" />
                )}
                
                <div className="flex-1">
                  <div className="font-medium">{result.testName}</div>
                  {result.details && (
                    <div className="text-sm text-(--color-text-secondary)">
                      {result.details}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-(--color-text-tertiary)">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Interactive Test Suite */}
      <div className="glass rounded-lg">
        <div className="p-6 border-b border-(--color-border)">
          <h2 className="text-xl font-semibold">Interactive Test Suite</h2>
          <p className="text-(--color-text-secondary) mt-1">
            Test different button variants and interactions to verify functionality
          </p>
        </div>
        <ButtonDebugger onTestResult={handleTestResult} />
      </div>
      
      {/* Quick Help */}
      <div className="glass rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Help</h2>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2">Console Commands</h3>
            <div className="space-y-1 font-mono text-xs">
              <div><code>window.debugButtons()</code> - Enable visual debugging</div>
              <div><code>window.fixButtons()</code> - Auto-fix all issues</div>
              <div><code>window.buttonReport()</code> - Generate report</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Common Issues</h3>
            <ul className="space-y-1 text-xs">
              <li>• Missing onClick handlers</li>
              <li>• CSS pointer-events: none</li>
              <li>• Buttons covered by other elements</li>
              <li>• Disabled state not properly managed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the panel configuration
const buttonDebugPanelConfig = createPanel(
  {
    id: 'button-debug',
    name: 'Button Debugger',
    icon: '🔧',
    description: 'Debug and fix button functionality issues',
    priority: 99, // Low priority, appears at bottom
    preload: false,
  },
  ButtonDebugPanel,
  {
    getInitialState: () => ({
      diagnostics: [],
      testResults: [],
      debuggingEnabled: false,
      autoFixCount: 0
    }),
  },
)

export default buttonDebugPanelConfig