import React, { useState } from 'react'
import { Button } from './Button'
import { autoFixAllButtons, diagnoseAllButtons } from '../../lib/buttonUtils'
import { WrenchScrewdriverIcon, BugAntIcon } from '@heroicons/react/24/outline'

interface QuickButtonDebugProps {
  className?: string
}

export const QuickButtonDebug: React.FC<QuickButtonDebugProps> = ({ className }) => {
  const [fixCount, setFixCount] = useState(0)
  const [diagnosisCount, setDiagnosisCount] = useState(0)
  
  const quickFix = () => {
    const fixed = autoFixAllButtons()
    setFixCount(fixed)
    console.log(`🔧 Quick-fixed ${fixed} button issues`)
    
    // Show notification
    if (fixed > 0) {
      const notification = document.createElement('div')
      notification.textContent = `Fixed ${fixed} button issues!`
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-success);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    }
  }
  
  const quickDiagnosis = () => {
    const results = diagnoseAllButtons()
    const issues = results.filter(r => !r.working).length
    setDiagnosisCount(issues)
    console.log(`🔍 Found ${issues} button issues:`, results.filter(r => !r.working))
    
    // Navigate to button debug panel
    window.dispatchEvent(new CustomEvent('navigate-panel', { 
      detail: { id: 'button-debug' } 
    }))
  }
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        size="xs"
        variant="outline"
        onClick={quickDiagnosis}
        title="Diagnose button issues"
      >
        <BugAntIcon className="w-3 h-3" />
        {diagnosisCount > 0 && (
          <span className="ml-1 text-xs">({diagnosisCount})</span>
        )}
      </Button>
      
      <Button
        size="xs"
        variant="warning"
        onClick={quickFix}
        title="Quick-fix button issues"
      >
        <WrenchScrewdriverIcon className="w-3 h-3" />
        {fixCount > 0 && (
          <span className="ml-1 text-xs">({fixCount})</span>
        )}
      </Button>
    </div>
  )
}