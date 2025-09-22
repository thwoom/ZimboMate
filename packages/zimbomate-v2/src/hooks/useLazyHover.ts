/**
 * Lazy Hover System with Intersection Observer
 * Optimizes hover interactions by only enabling them when elements are visible
 * Prevents performance issues with large numbers of rollable elements
 */

import { useEffect, useRef, useState, useCallback } from 'react'

interface LazyHoverOptions {
  enabled?: boolean
  rootMargin?: string
  threshold?: number
  enabledDistance?: number // Distance in pixels to pre-enable hover before element enters viewport
}

interface HoverState {
  isVisible: boolean
  isHoverEnabled: boolean
  isHovered: boolean
}

export const useLazyHover = ({
  enabled = true,
  rootMargin = '50px',
  threshold = 0.1,
  enabledDistance = 100
}: LazyHoverOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [hoverState, setHoverState] = useState<HoverState>({
    isVisible: false,
    isHoverEnabled: false,
    isHovered: false
  })

  // Intersection Observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const isVisible = entry.isIntersecting
      const isNearViewport = entry.boundingClientRect.top < (window.innerHeight + enabledDistance) &&
                            entry.boundingClientRect.bottom > -enabledDistance

      setHoverState(prev => ({
        ...prev,
        isVisible,
        isHoverEnabled: isNearViewport
      }))
    })
  }, [enabledDistance])

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || !elementRef.current) return

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    })

    observerRef.current.observe(elementRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [enabled, handleIntersection, rootMargin, threshold])

  // Hover event handlers - only work when enabled
  const handleMouseEnter = useCallback(() => {
    if (hoverState.isHoverEnabled) {
      setHoverState(prev => ({ ...prev, isHovered: true }))
    }
  }, [hoverState.isHoverEnabled])

  const handleMouseLeave = useCallback(() => {
    if (hoverState.isHoverEnabled) {
      setHoverState(prev => ({ ...prev, isHovered: false }))
    }
  }, [hoverState.isHoverEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    elementRef,
    isVisible: hoverState.isVisible,
    isHoverEnabled: hoverState.isHoverEnabled,
    isHovered: hoverState.isHovered && hoverState.isHoverEnabled,
    hoverProps: hoverState.isHoverEnabled ? {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    } : {}
  }
}

// Hook for managing multiple lazy hover elements efficiently
export const useLazyHoverManager = (options: LazyHoverOptions = {}) => {
  const [elements, setElements] = useState<Map<string, HoverState>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map())

  const registerElement = useCallback((id: string, element: HTMLElement) => {
    elementsRef.current.set(id, element)

    setElements(prev => new Map(prev.set(id, {
      isVisible: false,
      isHoverEnabled: false,
      isHovered: false
    })))

    if (observerRef.current) {
      observerRef.current.observe(element)
    }
  }, [])

  const unregisterElement = useCallback((id: string) => {
    const element = elementsRef.current.get(id)
    if (element && observerRef.current) {
      observerRef.current.unobserve(element)
    }

    elementsRef.current.delete(id)
    setElements(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const setHoverState = useCallback((id: string, isHovered: boolean) => {
    setElements(prev => {
      const current = prev.get(id)
      if (!current || !current.isHoverEnabled) return prev

      const next = new Map(prev)
      next.set(id, { ...current, isHovered })
      return next
    })
  }, [])

  // Set up intersection observer
  useEffect(() => {
    if (!options.enabled) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        // Find the element ID
        let elementId: string | null = null
        for (const [id, element] of elementsRef.current) {
          if (element === entry.target) {
            elementId = id
            break
          }
        }

        if (!elementId) return

        const isVisible = entry.isIntersecting
        const isNearViewport = entry.boundingClientRect.top < (window.innerHeight + (options.enabledDistance || 100)) &&
                              entry.boundingClientRect.bottom > -(options.enabledDistance || 100)

        setElements(prev => {
          const current = prev.get(elementId!)
          if (!current) return prev

          const next = new Map(prev)
          next.set(elementId!, {
            ...current,
            isVisible,
            isHoverEnabled: isNearViewport
          })
          return next
        })
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.1
    })

    // Observe existing elements
    elementsRef.current.forEach(element => {
      observerRef.current!.observe(element)
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [options])

  const getElementState = useCallback((id: string): HoverState | null => {
    return elements.get(id) || null
  }, [elements])

  const getHoverProps = useCallback((id: string) => {
    const state = elements.get(id)
    if (!state?.isHoverEnabled) {
      return {}
    }

    return {
      onMouseEnter: () => setHoverState(id, true),
      onMouseLeave: () => setHoverState(id, false)
    }
  }, [elements, setHoverState])

  return {
    registerElement,
    unregisterElement,
    getElementState,
    getHoverProps,
    getStats: () => ({
      totalElements: elements.size,
      visibleElements: Array.from(elements.values()).filter(s => s.isVisible).length,
      hoverEnabledElements: Array.from(elements.values()).filter(s => s.isHoverEnabled).length,
      hoveredElements: Array.from(elements.values()).filter(s => s.isHovered).length
    })
  }
}

// Performance monitoring hook
export const useHoverPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    totalHoverElements: 0,
    activeHoverElements: 0,
    averageHoverEnableTime: 0,
    performanceScore: 100
  })

  const startTime = useRef<number>(0)

  const trackHoverEnable = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const trackHoverDisable = useCallback(() => {
    if (startTime.current > 0) {
      const duration = performance.now() - startTime.current
      setMetrics(prev => ({
        ...prev,
        averageHoverEnableTime: (prev.averageHoverEnableTime + duration) / 2
      }))
    }
  }, [])

  const updateElementCounts = useCallback((total: number, active: number) => {
    setMetrics(prev => {
      const performanceScore = total > 0 ? Math.max(0, 100 - ((active / total) * 50)) : 100

      return {
        ...prev,
        totalHoverElements: total,
        activeHoverElements: active,
        performanceScore
      }
    })
  }, [])

  return {
    metrics,
    trackHoverEnable,
    trackHoverDisable,
    updateElementCounts
  }
}