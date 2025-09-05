import React, { useEffect, useRef, useState } from 'react'
import './Tooltip.css'
import { recordTooltipShow } from '../utils/DevTelemetry'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  delayMs?: number
  placement?: Placement
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const Tooltip: React.FC<TooltipProps> = ({ content, children, delayMs, placement = 'top' }) => {
  const [visible, setVisible] = useState(false)
  const idRef = useRef(`tt_${Math.random().toString(36).slice(2)}`)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const bubbleRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)

  const resolveDelay = (): number => {
    if (typeof delayMs === 'number') return delayMs
    try {
      if (wrapRef.current) {
        const v = getComputedStyle(wrapRef.current).getPropertyValue('--tt-delay').trim()
        if (v.endsWith('ms')) return Number(v.replace('ms', ''))
        if (v.endsWith('s')) return Number(v.replace('s', '')) * 1000
        const n = Number(v)
        return Number.isFinite(n) ? n : 0
      }
    } catch {}
    return 0
  }

  const show = () => {
    if (timerRef.current)
      window.clearTimeout(timerRef.current)
    const d = resolveDelay()
    if (d > 0) {
      timerRef.current = window.setTimeout(() => { setVisible(true); try { recordTooltipShow() } catch {} }, d)
    } else {
      setVisible(true)
      try { recordTooltipShow() } catch {}
    }
  }
  const hide = () => {
    if (timerRef.current)
      window.clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        hide()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  useEffect(() => {
    if (visible && wrapRef.current && bubbleRef.current) {
      const wr = wrapRef.current.getBoundingClientRect()
      const br = bubbleRef.current.getBoundingClientRect()
      let top = 0
      let left = 0
      switch (placement) {
        case 'bottom':
          top = wr.height + 6
          left = Math.round(wr.width / 2 - br.width / 2)
          break
        case 'left':
          top = Math.round(wr.height / 2 - br.height / 2)
          left = -br.width - 6
          break
        case 'right':
          top = Math.round(wr.height / 2 - br.height / 2)
          left = wr.width + 6
          break
        case 'top':
        default:
          top = -br.height - 6
          left = Math.round(wr.width / 2 - br.width / 2)
          break
      }
      const vpW = window.innerWidth
      const vpH = window.innerHeight
      const absLeft = wr.left + left
      const absTop = wr.top + top
      if (absLeft < 4)
        left += 4 - absLeft
      else if (absLeft + br.width > vpW - 4)
        left -= (absLeft + br.width) - (vpW - 4)
      if (absTop < 4)
        top += 4 - absTop
      else if (absTop + br.height > vpH - 4)
        top -= (absTop + br.height) - (vpH - 4)

      wrapRef.current.style.setProperty('--tt-top', `${top}px`)
      wrapRef.current.style.setProperty('--tt-left', `${left}px`)
    }
  }, [visible, placement])

  const reduced = prefersReducedMotion()

  return (
    <span className={`tooltip-wrapper ${reduced ? 'reduced' : ''}`} ref={wrapRef} data-placement={placement}>
      {React.cloneElement(children, {
        'onMouseEnter': show,
        'onMouseLeave': hide,
        'onFocus': show,
        'onBlur': hide,
        'aria-describedby': visible ? idRef.current : undefined,
      })}
      {visible && (
        <span id={idRef.current} role="tooltip" className="tooltip-bubble" ref={bubbleRef}>
          {content}
        </span>
      )}
    </span>
  )
}

export default Tooltip
