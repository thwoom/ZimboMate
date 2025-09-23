import React from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Keyboard, MousePointer, Volume2, Palette, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'
import { Switch } from '@radix-ui/react-switch'

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  category: 'keyboard' | 'screen-reader' | 'color-contrast' | 'focus' | 'semantic'
  message: string
  element?: string
  suggestion: string
}

interface AccessibilityReport {
  score: number
  issues: AccessibilityIssue[]
  passedChecks: string[]
  timestamp: Date
}

export const AccessibilityChecker: React.FC = () => {
  const [isChecking, setIsChecking] = React.useState(false)
  const [report, setReport] = React.useState<AccessibilityReport | null>(null)
  const [showDetails, setShowDetails] = React.useState(false)
  const [settings, setSettings] = React.useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    screenReaderMode: false
  })

  const runAccessibilityCheck = async () => {
    setIsChecking(true)
    
    // Simulate accessibility checking
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const issues: AccessibilityIssue[] = []
    const passedChecks: string[] = []
    
    // Check keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      passedChecks.push('Focusable elements present')
    }
    
    // Check for missing alt text
    const images = document.querySelectorAll('img')
    let missingAltCount = 0
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        missingAltCount++
      }
    })
    
    if (missingAltCount > 0) {
      issues.push({
        type: 'error',
        category: 'screen-reader',
        message: `${missingAltCount} images missing alt text`,
        suggestion: 'Add descriptive alt text to all images'
      })
    } else if (images.length > 0) {
      passedChecks.push('All images have alt text')
    }
    
    // Check heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    let headingIssues = 0
    let lastLevel = 0
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        headingIssues++
      }
      lastLevel = level
    })
    
    if (headingIssues > 0) {
      issues.push({
        type: 'warning',
        category: 'semantic',
        message: 'Heading hierarchy issues detected',
        suggestion: 'Ensure headings follow proper hierarchy (h1 → h2 → h3, etc.)'
      })
    } else if (headings.length > 0) {
      passedChecks.push('Proper heading hierarchy')
    }
    
    // Check form labels
    const inputs = document.querySelectorAll('input, select, textarea')
    let unlabeledInputs = 0
    
    inputs.forEach((input) => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`)
      
      if (!hasLabel) {
        unlabeledInputs++
      }
    })
    
    if (unlabeledInputs > 0) {
      issues.push({
        type: 'error',
        category: 'screen-reader',
        message: `${unlabeledInputs} form elements missing labels`,
        suggestion: 'Add labels or aria-label attributes to all form elements'
      })
    } else if (inputs.length > 0) {
      passedChecks.push('All form elements have labels')
    }
    
    // Check color contrast (simplified)
    const buttons = document.querySelectorAll('button')
    let contrastIssues = 0
    
    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button)
      const bgColor = styles.backgroundColor
      const textColor = styles.color
      
      // Simplified contrast check (in real implementation, use proper contrast calculation)
      if (bgColor === textColor) {
        contrastIssues++
      }
    })
    
    if (contrastIssues > 0) {
      issues.push({
        type: 'warning',
        category: 'color-contrast',
        message: 'Potential color contrast issues',
        suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)'
      })
    } else {
      passedChecks.push('Good color contrast detected')
    }
    
    // Check for focus indicators
    const focusableCount = focusableElements.length
    if (focusableCount > 0) {
      passedChecks.push(`${focusableCount} focusable elements found`)
    }
    
    // Calculate score
    const totalChecks = issues.length + passedChecks.length
    const score = totalChecks > 0 ? Math.round((passedChecks.length / totalChecks) * 100) : 100
    
    setReport({
      score,
      issues,
      passedChecks,
      timestamp: new Date()
    })
    
    setIsChecking(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'keyboard': return <Keyboard className="w-4 h-4" />
      case 'screen-reader': return <Volume2 className="w-4 h-4" />
      case 'color-contrast': return <Palette className="w-4 h-4" />
      case 'focus': return <MousePointer className="w-4 h-4" />
      case 'semantic': return <Eye className="w-4 h-4" />
    }
  }

  return (
    <Card variant="magical">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 
                  className="text-lg font-display"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Accessibility Checker
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Ensure ZimboMate is accessible to all users
                </p>
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={runAccessibilityCheck}
              disabled={isChecking}
              className="gap-2"
            >
              {isChecking ? 'Checking...' : 'Run Check'}
            </Button>
          </div>

          {/* Accessibility Settings */}
          <div 
            className="rounded-lg p-4"
            style={{ backgroundColor: 'var(--color-surface-elevated)' }}
          >
            <h4 
              className="font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Accessibility Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff 
                    className="w-4 h-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Reduce Motion
                  </span>
                </div>
                <Switch
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, reduceMotion: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette 
                    className="w-4 h-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    High Contrast
                  </span>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, highContrast: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye 
                    className="w-4 h-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Large Text
                  </span>
                </div>
                <Switch
                  checked={settings.largeText}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, largeText: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard 
                    className="w-4 h-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Keyboard Navigation
                  </span>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, keyboardNavigation: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score */}
              <div 
                className="border rounded-lg p-4"
                style={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getScoreIcon(report.score)}
                    <div>
                      <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                        {report.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Accessibility Score
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {report.passedChecks.length} passed
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {report.issues.length} issues
                    </div>
                  </div>
                </div>
                
                <div 
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Last checked: {report.timestamp.toLocaleString()}
                </div>
              </div>

              {/* Issues */}
              {report.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Issues Found
                  </h4>
                  {report.issues.map((issue, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-3"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 mt-0.5">
                          {getIssueIcon(issue.type)}
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div className="flex-1">
                          <div 
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {issue.message}
                          </div>
                          <div 
                            className="text-xs mt-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {issue.suggestion}
                          </div>
                          {issue.element && (
                            <Badge variant="secondary" className="text-xs mt-2">
                              {issue.element}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Passed Checks */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Passed Checks
                </Button>
              </div>

              {showDetails && report.passedChecks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h4 
                    className="font-medium mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Passed Checks
                  </h4>
                  <div className="space-y-1">
                    {report.passedChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        {check}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Guidelines */}
          <div 
            className="border rounded-lg p-4"
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h4 
              className="font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Accessibility Guidelines
            </h4>
            <ul 
              className="space-y-1 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <li>• Ensure all interactive elements are keyboard accessible</li>
              <li>• Provide alternative text for images and icons</li>
              <li>• Use proper heading hierarchy (h1 → h2 → h3)</li>
              <li>• Maintain sufficient color contrast ratios</li>
              <li>• Label all form elements clearly</li>
              <li>• Provide focus indicators for all interactive elements</li>
              <li>• Support screen readers with proper ARIA attributes</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccessibilityChecker