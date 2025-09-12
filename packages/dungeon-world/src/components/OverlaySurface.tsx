import React, { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Rect = { left: number; top: number; width: number; height: number }

interface OverlaySurfaceProps {
  anchorRef?: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement | null>
  rect?: Rect | null
  children: React.ReactNode
  className?: string
}

/**
 * Renders children inside the global #overlay-panels root using the sidebar glass
 * stack. Provide either an anchorRef (measured) or an explicit rect.
 */
export const OverlaySurface: React.FC<OverlaySurfaceProps> = ({ anchorRef, rect: rectProp, children, className }) => {
  const overlayRoot = typeof document !== 'undefined' ? document.getElementById('overlay-panels') : null
  const [rect, setRect] = useState<Rect | null>(rectProp || null)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!anchorRef || !('current' in anchorRef) || !anchorRef.current) return
    const update = () => {
      const el = anchorRef.current as HTMLElement
      const r = el.getBoundingClientRect()
      setRect({ left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height })
    }
    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [anchorRef])

  const finalRect = rectProp || rect
  if (!overlayRoot || !finalRect) return null

  return createPortal(
    <div className="overlay-rect" style={{ left: finalRect.left, top: finalRect.top, width: finalRect.width, height: finalRect.height, bottom: 'auto', pointerEvents: 'auto' }}>
      <div className={`sidebar__inner ${className || ''}`.trim()} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>,
    overlayRoot
  )
}

export default OverlaySurface


