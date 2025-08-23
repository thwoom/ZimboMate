import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hook to get the current theme from data attributes
 */
export function useTheme(): 'classic' | 'cosmic' | 'moebius' {
  // In a real app, this would use context or a store
  // For Storybook/demo purposes, we check the document
  const themeAttr = document.documentElement.getAttribute('data-theme')
  return (themeAttr as 'classic' | 'cosmic' | 'moebius') || 'classic'
}

/**
 * Get the theme to pass to Panda recipes
 */
export function getCurrentTheme(): 'classic' | 'cosmic' | 'moebius' {
  // Check both attribute and class for theme
  const themeAttr = document.documentElement.getAttribute('data-theme')
  const themeClass = document.documentElement.classList.contains('theme-cosmic') ? 'cosmic' :
                     document.documentElement.classList.contains('theme-moebius') ? 'moebius' : 'classic'
  
  return (themeAttr as 'classic' | 'cosmic' | 'moebius') || themeClass || 'classic'
}

/**
 * Augmented-UI attribute helper - returns both classes and data attributes
 */
export function getAugmentedUIClasses(theme: 'classic' | 'cosmic' | 'moebius', variant?: string): string {
  // Only apply augmented-ui to cosmic and moebius themes
  if (theme === 'classic') return ''
  
  const baseClasses = []
  
  if (theme === 'cosmic') {
    switch (variant) {
      case 'panel':
        baseClasses.push('aug-cosmic-glow')
        break
      case 'dialog':
        baseClasses.push('aug-cosmic-glow')
        break
      case 'toolbar':
        baseClasses.push('aug-cosmic-glow')
        break
      case 'button':
        baseClasses.push('aug-cosmic-glow')
        break
      default:
        baseClasses.push('aug-cosmic-glow')
    }
  } else if (theme === 'moebius') {
    switch (variant) {
      case 'panel':
        baseClasses.push('aug-moebius-wire')
        break
      case 'dialog':
        baseClasses.push('aug-moebius-wire')
        break
      case 'toolbar':
        baseClasses.push('aug-moebius-wire')
        break
      case 'button':
        baseClasses.push('aug-moebius-wire')
        break
      default:
        baseClasses.push('aug-moebius-wire')
    }
  }
  
  return baseClasses.join(' ')
}

/**
 * Get Augmented-UI data attributes for components
 */
export function getAugmentedUIAttrs(theme: 'classic' | 'cosmic' | 'moebius', variant?: string): Record<string, string> {
  if (theme === 'classic') return {}
  
  const attrs: Record<string, string> = {}
  
  if (theme === 'cosmic') {
    switch (variant) {
      case 'panel':
        attrs['data-augmented-ui'] = 'tl-clip br-clip border'
        break
      case 'dialog':
        attrs['data-augmented-ui'] = 'both-clip border'
        break
      case 'toolbar':
        attrs['data-augmented-ui'] = 'tl-clip tr-clip border'
        break
      case 'button':
        attrs['data-augmented-ui'] = 'tr-clip border'
        break
      default:
        attrs['data-augmented-ui'] = 'tl-clip border'
    }
  } else if (theme === 'moebius') {
    // Moebius: subtle wireframe aesthetic, not heavy clips
    switch (variant) {
      case 'panel':
        attrs['data-augmented-ui'] = 'tl-clip-x border'
        break
      case 'dialog':
        attrs['data-augmented-ui'] = 'tl-clip-x br-clip-x border'
        break
      case 'toolbar':
        attrs['data-augmented-ui'] = 'tl-clip-x border'
        break
      case 'button':
        // No augmented-ui for buttons in Moebius - just wireframe borders
        break
      default:
        attrs['data-augmented-ui'] = 'tl-clip-x border'
    }
  }
  
  return attrs
}
