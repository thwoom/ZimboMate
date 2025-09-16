import React, { useEffect, useState } from 'react'
import { Button } from './components/ui/Button'
import { ButtonDebugger } from './components/ui/ButtonDebugger'
import { 
  diagnoseAllButtons, 
  enableButtonDebugging, 
  autoFixAllButtons, 
  generateButtonReport,
  type ButtonDiagnostic 
} from './lib/buttonUtils'
import { 
  BugAntIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from 'lucide-react'

interface TestResult {
  testName: string
  success: boolean
  details?: string
  timestamp: Date
}

export default function App() {
  const [diagnostics, setDiagnostics] = useState<ButtonDiagnostic[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [debuggingEnabled, setDebuggingEnabled] = useState(false)
  const [autoFixCount, setAutoFixCount] = useState(0)
  
  useEffect(() => {
    // Initial diagnosis
    runDiagnosis()
  }, [])
  
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
    setAutoFixCount(fixedCount)
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
    a.download = 'button-report.txt'
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
    <div className="min-h-screen bg-(--color-background) text-(--color-text-primary)">
      {/* Header */}
      <div className="glass-header border-b border-(--color-border) p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">ZimboMate Button Functionality Fix</h1>
          <p className="text-(--color-text-secondary)">
            Diagnose and fix button issues throughout the application
          </p>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="glass rounded-lg p-6 mb-8">
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
              Generate Report
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
          <div className="glass rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-(--color-warning)" />
              Button Issues Found
            </h2>
            
            <div className="space-y-4">
              {diagnostics.filter(d => !d.working).map((diagnostic, index) => (
                <div key={index} className="glass-subtle p-4 rounded-lg">
                  <div className="font-medium mb-2">
                    Button: "{diagnostic.element.textContent?.trim() || 'No text'}"
                  </div>
                  <div className="text-sm text-(--color-text-secondary) mb-2">
                    Class: {diagnostic.element.className || 'No classes'}
                  </div>
                  
                  <div className="space-y-2">
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
          <div className="glass rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
            
            <div className="space-y-2">
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
        
        {/* Button Testing Component */}
        <div className="glass rounded-lg">
          <ButtonDebugger onTestResult={handleTestResult} />
        </div>
        
        {/* Instructions */}
        <div className="glass rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium mb-1">1. Run Diagnosis</div>
              <div className="text-(--color-text-secondary)">
                Scans all buttons on the page and identifies common issues like missing click handlers, 
                CSS conflicts, or accessibility problems.
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-1">2. Enable Debugging</div>
              <div className="text-(--color-text-secondary)">
                Adds visual debugging indicators and console logging for all button interactions. 
                Hover over buttons to see debug information.
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-1">3. Auto-Fix Issues</div>
              <div className="text-(--color-text-secondary)">
                Automatically fixes common button problems like missing click handlers, 
                pointer-events issues, and focus problems.
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-1">4. Test Buttons</div>
              <div className="text-(--color-text-secondary)">
                Use the button test section above to verify that different button variants 
                and states are working correctly.
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-1">5. Console Commands</div>
              <div className="text-(--color-text-secondary)">
                Use <code className="bg-(--color-surface) px-1 rounded">window.debugButtons()</code>, 
                <code className="bg-(--color-surface) px-1 rounded">window.fixButtons()</code>, or 
                <code className="bg-(--color-surface) px-1 rounded">window.buttonReport()</code> in 
                the browser console for additional debugging.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}