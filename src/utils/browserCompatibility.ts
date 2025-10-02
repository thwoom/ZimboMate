import { logger } from './logger'
/**
 * Browser Compatibility and Progressive Enhancement
 * Ensures core dice functionality works across browsers with graceful degradation
 */

// Feature detection utilities
export const BrowserFeatures = {
  // Core web APIs
  intersectionObserver: () => typeof IntersectionObserver !== 'undefined',
  requestAnimationFrame: () => typeof requestAnimationFrame !== 'undefined',
  localStorage: () => {
    try {
      const test = 'zimbo-test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    }
    catch {
      return false
    }
  },

  // Advanced APIs
  dragAndDrop: () => 'draggable' in document.createElement('div'),
  clipboard: () => navigator.clipboard && typeof navigator.clipboard.writeText === 'function',
  webShare: () => navigator.share && typeof navigator.share === 'function',
  serviceWorker: () => 'serviceWorker' in navigator,

  // Input methods
  touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  keyboard: () => true, // Always available
  mouse: () => matchMedia('(pointer: fine)').matches,

  // Display capabilities
  reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast: () => matchMedia('(prefers-contrast: high)').matches,
  darkMode: () => matchMedia('(prefers-color-scheme: dark)').matches,

  // Performance features
  webGL: () => {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    }
    catch {
      return false
    }
  },
}

// Browser-specific compatibility layers
export class CompatibilityLayer {
  private features: Record<string, boolean> = {}

  constructor() {
    this.detectFeatures()
  }

  private detectFeatures() {
    Object.entries(BrowserFeatures).forEach(([feature, detector]) => {
      this.features[feature] = detector()
    })

    logger.info('[Compatibility] Browser features:', this.features)
  }

  // Clipboard API with fallback
  async copyToClipboard(text: string): Promise<boolean> {
    if (this.features.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      }
      catch (error) {
        logger.warn('[Compatibility] Clipboard API failed, using fallback:', error)
      }
    }

    // Fallback method
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'

      document.body.appendChild(textArea)
      textArea.select()
      textArea.setSelectionRange(0, text.length)

      const success = document.execCommand('copy')
      document.body.removeChild(textArea)

      return success
    }
    catch {
      return false
    }
  }

  // Local storage with fallback
  setItem(key: string, value: string): boolean {
    if (this.features.localStorage) {
      try {
        localStorage.setItem(key, value)
        return true
      }
      catch (error) {
        logger.warn('[Compatibility] LocalStorage failed:', error)
      }
    }

    // Fallback to in-memory storage
    if (typeof window !== 'undefined') {
      const zimboWindow = window as WindowWithZimboStorage
      zimboWindow.__zimboFallbackStorage = zimboWindow.__zimboFallbackStorage ?? {}
      zimboWindow.__zimboFallbackStorage[key] = value
      return true
    }

    return false
  }

  getItem(key: string): string | null {
    if (this.features.localStorage) {
      try {
        return localStorage.getItem(key)
      }
      catch {
        // Fall through to fallback
      }
    }

    if (typeof window !== 'undefined') {
      const zimboWindow = window as WindowWithZimboStorage
      return zimboWindow.__zimboFallbackStorage?.[key] ?? null
    }

    return null
  }

  // Intersection Observer with fallback
  createIntersectionObserver(
    callback: (entries: ReadonlyArray<CompatibilityObserverEntry>) => void,
    options?: IntersectionObserverInit,
  ): CompatibilityObserver {
    if (this.features.intersectionObserver) {
      const observer = new IntersectionObserver(entries => callback(entries), options)
      return {
        observe: (element: Element) => observer.observe(element),
        unobserve: (element: Element) => observer.unobserve(element),
        disconnect: () => observer.disconnect(),
      }
    }

    const observedElements = new Set<Element>()

    const checkVisibility = () => {
      const entries: CompatibilityObserverEntry[] = Array.from(observedElements).map((element) => {
        const rect = element.getBoundingClientRect()
        const isIntersecting = rect.top < window.innerHeight && rect.bottom > 0

        return {
          target: element,
          isIntersecting,
          boundingClientRect: rect,
        }
      })

      callback(entries)
    }

    const throttledCheck = this.throttle(checkVisibility, 100)

    window.addEventListener('scroll', throttledCheck)
    window.addEventListener('resize', throttledCheck)

    return {
      observe: (element: Element) => {
        observedElements.add(element)
        checkVisibility()
      },
      unobserve: (element: Element) => {
        observedElements.delete(element)
      },
      disconnect: () => {
        observedElements.clear()
        window.removeEventListener('scroll', throttledCheck)
        window.removeEventListener('resize', throttledCheck)
      },
    }
  }

  // Animation with fallback
  animate(element: HTMLElement, animations: Keyframe[], options?: KeyframeAnimationOptions) {
    if ('animate' in element) {
      return element.animate(animations, options)
    }

    // CSS fallback for basic animations
    const duration = (options?.duration as number) || 1000
    const easing = options?.easing || 'ease'

    element.style.transition = `all ${duration}ms ${easing}`

    // Apply final state
    if (animations.length > 0) {
      const finalFrame = animations[animations.length - 1]
      if (finalFrame && typeof finalFrame === 'object') {
        Object.entries(finalFrame).forEach(([property, value]) => {
          if (value !== undefined && value !== null) {
            element.style.setProperty(property, String(value))
          }
        })
      }
    }

    // Return a fake animation object
    return {
      finished: new Promise<void>((resolve) => {
        setTimeout(() => resolve(), duration)
      }),
      cancel: () => {
        element.style.transition = ''
      },
    }
  }

  // Utility methods
  private throttle<T extends (...args: unknown[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }
}

// Global instance
export const compatibility = new CompatibilityLayer()

// Progressive enhancement helpers
export const ProgressiveEnhancement = {
  // Enhanced dice rolling with fallbacks
  createDiceRoller: () => {
    const hasAnimations = !compatibility.hasFeature('reducedMotion')
    const hasAdvancedFeatures = compatibility.hasFeature('intersectionObserver')

    return {
      enableAnimations: hasAnimations,
      enableLazyLoading: hasAdvancedFeatures,
      enableAdvancedHover: compatibility.hasFeature('mouse'),
      enableDragDrop: compatibility.hasFeature('dragAndDrop') && compatibility.hasFeature('mouse'),
    }
  },

  // Adaptive UI based on capabilities
  getUIConfig: () => {
    return {
      enableHoverEffects: compatibility.hasFeature('mouse'),
      enableTouchGestures: compatibility.hasFeature('touch'),
      enableKeyboardShortcuts: compatibility.hasFeature('keyboard'),
      enableNotifications: true, // Always available with fallbacks
      enableComplexAnimations: !compatibility.hasFeature('reducedMotion'),
      enableHighContrast: compatibility.hasFeature('highContrast'),
      showTooltips: compatibility.hasFeature('mouse'), // Touch users don't need hover tooltips
      enableRightClick: compatibility.hasFeature('mouse'),
    }
  },

  // Performance optimizations
  getPerformanceConfig: () => {
    const isLowEnd = !compatibility.hasFeature('webGL')
      || navigator.hardwareConcurrency < 4
      || navigator.deviceMemory < 4

    return {
      enableLazyLoading: compatibility.hasFeature('intersectionObserver'),
      reduceAnimations: compatibility.hasFeature('reducedMotion') || isLowEnd,
      limitNotifications: isLowEnd ? 2 : 3,
      enableVirtualization: isLowEnd,
      preloadImages: !isLowEnd,
    }
  },
}

// CSS custom properties for progressive enhancement
export function setCSSFeatures() {
  const root = document.documentElement

  root.style.setProperty('--supports-backdrop-filter', CSS.supports('backdrop-filter', 'blur(10px)') ? '1' : '0')

  root.style.setProperty('--supports-sticky', CSS.supports('position', 'sticky') ? '1' : '0')

  root.style.setProperty('--supports-grid', CSS.supports('display', 'grid') ? '1' : '0')

  root.style.setProperty('--supports-aspect-ratio', CSS.supports('aspect-ratio', '1/1') ? '1' : '0')

  // Set feature classes on body
  document.body.classList.toggle('supports-hover', compatibility.hasFeature('mouse'))
  document.body.classList.toggle('supports-touch', compatibility.hasFeature('touch'))
  document.body.classList.toggle('supports-motion', !compatibility.hasFeature('reducedMotion'))
  document.body.classList.toggle('supports-high-contrast', compatibility.hasFeature('highContrast'))
}

// Initialize compatibility features
export function initCompatibility() {
  setCSSFeatures()

  // Log browser support for debugging
  logger.info('[Compatibility] Browser info:', compatibility.getBrowserInfo())
  logger.info('[Compatibility] UI config:', ProgressiveEnhancement.getUIConfig())
  logger.info('[Compatibility] Performance config:', ProgressiveEnhancement.getPerformanceConfig())
}
