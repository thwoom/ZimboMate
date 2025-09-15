import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Theme utilities
export function setTheme(theme: 'arcane-slate' | 'cinder-black' | 'high-contrast') {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('dw-theme', theme)
}

export function getTheme(): 'arcane-slate' | 'cinder-black' | 'high-contrast' {
  const stored = localStorage.getItem('dw-theme')
  if (stored && ['arcane-slate', 'cinder-black', 'high-contrast'].includes(stored)) {
    return stored as 'arcane-slate' | 'cinder-black' | 'high-contrast'
  }
  return 'arcane-slate'
}

export function initializeTheme() {
  const theme = getTheme()
  setTheme(theme)
}

// Keyboard shortcut utilities
export function formatShortcut(keys: string[]): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return keys
    .map(key => {
      switch (key.toLowerCase()) {
        case 'cmd':
        case 'meta':
          return isMac ? '⌘' : 'Ctrl'
        case 'ctrl':
          return isMac ? '⌃' : 'Ctrl'
        case 'alt':
          return isMac ? '⌥' : 'Alt'
        case 'shift':
          return isMac ? '⇧' : 'Shift'
        case 'enter':
          return '↵'
        case 'escape':
          return 'Esc'
        case 'arrowup':
          return '↑'
        case 'arrowdown':
          return '↓'
        case 'arrowleft':
          return '←'
        case 'arrowright':
          return '→'
        default:
          return key.toUpperCase()
      }
    })
    .join(isMac ? '' : '+')
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  firstElement?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// Animation utilities
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Responsive utilities
export function getBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  if (width < 1440) return 'desktop'
  return 'wide'
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}