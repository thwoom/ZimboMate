/**
 * Button utilities for debugging and fixing common button issues in ZimboMate v2
 */

export interface ButtonDiagnostic {
  element: HTMLButtonElement
  issues: string[]
  fixes: string[]
  working: boolean
}

/**
 * Diagnose button functionality issues
 */
export function diagnoseButton(button: HTMLButtonElement): ButtonDiagnostic {
  const issues: string[] = []
  const fixes: string[] = []

  // Check if button is disabled
  if (button.disabled) {
    issues.push('Button is disabled')
    fixes.push('Remove disabled attribute or check disable condition')
  }

  // Check for click handlers
  const hasOnClick = button.onclick !== null
  const hasEventListeners = (button as any).getEventListeners?.('click')?.length > 0

  if (!hasOnClick && !hasEventListeners) {
    issues.push('No click handler found')
    fixes.push('Add onClick handler or addEventListener')
  }

  // Check CSS pointer-events
  const computedStyle = window.getComputedStyle(button)
  if (computedStyle.pointerEvents === 'none') {
    issues.push('CSS pointer-events is set to none')
    fixes.push('Remove pointer-events: none from CSS')
  }

  // Check if button is hidden
  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
    issues.push('Button is hidden')
    fixes.push('Make button visible')
  }

  // Check z-index issues
  const zIndex = Number.parseInt(computedStyle.zIndex) || 0
  if (zIndex < 0) {
    issues.push('Button has negative z-index')
    fixes.push('Increase z-index value')
  }

  // Check for overlapping elements
  const rect = button.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const elementAtCenter = document.elementFromPoint(centerX, centerY)

  if (elementAtCenter && elementAtCenter !== button && !button.contains(elementAtCenter)) {
    issues.push('Button is covered by another element')
    fixes.push('Adjust z-index or element positioning')
  }

  // Check for form submission issues
  if (button.type === 'submit' && !button.form) {
    issues.push('Submit button not inside a form')
    fixes.push('Place button inside a form element or change type')
  }

  return {
    element: button,
    issues,
    fixes,
    working: issues.length === 0,
  }
}

/**
 * Diagnose all buttons on the page
 */
export function diagnoseAllButtons(): ButtonDiagnostic[] {
  const buttons = document.querySelectorAll('button')
  return Array.from(buttons).map(diagnoseButton)
}

/**
 * Fix common button issues automatically
 */
export function fixButtonIssues(button: HTMLButtonElement): boolean {
  let fixed = false

  // Remove pointer-events: none if present
  if (button.style.pointerEvents === 'none') {
    button.style.pointerEvents = 'auto'
    fixed = true
  }

  // Ensure button is focusable
  if (button.tabIndex < 0) {
    button.tabIndex = 0
    fixed = true
  }

  // Add basic click handler if none exists
  if (!button.onclick && !button.hasAttribute('data-has-listeners')) {
    button.onclick = function (e) {
      console.log('🔧 Auto-fixed button clicked:', this)
      // Prevent default if it's a submit button without a form
      if (this.type === 'submit' && !this.form) {
        e.preventDefault()
      }
    }
    button.setAttribute('data-has-listeners', 'true')
    fixed = true
  }

  return fixed
}

/**
 * Add debugging capabilities to buttons
 */
export function enableButtonDebugging(): void {
  // Add click logging to all buttons
  document.addEventListener('click', (e) => {
    if (e.target instanceof HTMLButtonElement) {
      console.log('🎯 Button clicked:', {
        element: e.target,
        text: e.target.textContent,
        disabled: e.target.disabled,
        type: e.target.type,
        className: e.target.className,
        hasOnClick: !!e.target.onclick,
        variant: e.target.getAttribute('data-variant'),
        event: e,
      })
    }
  }, true)

  // Add visual debugging
  const style = document.createElement('style')
  style.id = 'zimbomate-button-debug'
  style.textContent = `
    button:hover::after {
      content: '🔍 DEBUG';
      position: absolute;
      top: -25px;
      right: -10px;
      background: var(--primary);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
    }
    
    button:disabled::after {
      content: '❌ DISABLED';
      background: var(--red-500);
    }
    
    button[onclick=""]::after,
    button:not([onclick]):not([data-has-listeners])::after {
      content: '⚠️ NO HANDLER';
      background: var(--yellow-500);
      color: black;
    }
    
    button[data-working="false"]::after {
      content: '🚫 BROKEN';
      background: var(--red-600);
    }
  `
  document.head.appendChild(style)
}

/**
 * Create a button test report
 */
export function generateButtonReport(): string {
  const diagnostics = diagnoseAllButtons()
  const workingButtons = diagnostics.filter(d => d.working).length
  const brokenButtons = diagnostics.filter(d => !d.working)

  let report = `ZimboMate v2 Button Functionality Report\n`
  report += `========================================\n\n`
  report += `Total buttons: ${diagnostics.length}\n`
  report += `Working buttons: ${workingButtons}\n`
  report += `Problematic buttons: ${brokenButtons.length}\n\n`

  if (brokenButtons.length > 0) {
    report += `Issues found:\n`
    brokenButtons.forEach((diagnostic, index) => {
      report += `\n${index + 1}. Button: "${diagnostic.element.textContent?.trim() || 'No text'}"\n`
      report += `   Class: ${diagnostic.element.className}\n`
      report += `   Variant: ${diagnostic.element.getAttribute('data-variant') || 'unknown'}\n`
      report += `   Issues:\n`
      diagnostic.issues.forEach((issue) => {
        report += `   - ${issue}\n`
      })
      report += `   Suggested fixes:\n`
      diagnostic.fixes.forEach((fix) => {
        report += `   - ${fix}\n`
      })
    })
  }

  return report
}

/**
 * Auto-fix all button issues on the page
 */
export function autoFixAllButtons(): number {
  const buttons = document.querySelectorAll('button')
  let fixedCount = 0

  buttons.forEach((button) => {
    if (fixButtonIssues(button as HTMLButtonElement)) {
      fixedCount++
    }
  })

  return fixedCount
}

// Global debugging functions for console use
declare global {
  interface Window {
    ZimboMate: {
      debugButtons: () => void
      fixButtons: () => number
      buttonReport: () => string
      diagnoseButtons: () => ButtonDiagnostic[]
    }
  }
}

// Make debugging functions globally available under ZimboMate namespace
if (typeof window !== 'undefined') {
  window.ZimboMate = window.ZimboMate || {}
  window.ZimboMate.debugButtons = enableButtonDebugging
  window.ZimboMate.fixButtons = autoFixAllButtons
  window.ZimboMate.buttonReport = () => {
    const report = generateButtonReport()
    console.log(report)
    return report
  }
  window.ZimboMate.diagnoseButtons = diagnoseAllButtons
}
