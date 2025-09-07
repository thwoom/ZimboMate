import React, { useEffect, useRef, useState } from 'react'
import './ContextMenu.css'
import { recordMenuOpen, recordMenuSelect } from '../utils/DevTelemetry'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp } from '../utils/motion'

export interface MenuItem {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
  disabledReason?: string
}

interface ContextMenuProps {
  items: MenuItem[]
  x: number
  y: number
  onClose: () => void
}

const CLAMP_PADDING = 8

const ContextMenu: React.FC<ContextMenuProps> = ({ items, x, y, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const typeBufferRef = useRef<string>('')
  const typeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    recordMenuOpen()
    if (ref.current) {
      ref.current.style.setProperty('--context-menu-top', `${y}px`)
      ref.current.style.setProperty('--context-menu-left', `${x}px`)
      requestAnimationFrame(() => {
        const rect = ref.current!.getBoundingClientRect()
        const vpW = window.innerWidth
        const vpH = window.innerHeight
        let top = y
        let left = x
        if (rect.right > vpW - CLAMP_PADDING)
          left = Math.max(CLAMP_PADDING, vpW - rect.width - CLAMP_PADDING)
        if (rect.bottom > vpH - CLAMP_PADDING)
          top = Math.max(CLAMP_PADDING, y - rect.height)
        if (top < CLAMP_PADDING)
          top = CLAMP_PADDING
        if (left < CLAMP_PADDING)
          left = CLAMP_PADDING
        ref.current!.style.setProperty('--context-menu-top', `${top}px`)
        ref.current!.style.setProperty('--context-menu-left', `${left}px`)
      })
    }
  }, [x, y, items])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => (i + 1) % items.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => (i - 1 + items.length) % items.length)
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const item = items[activeIndex]
        if (item && !item.disabled) {
          recordMenuSelect(item.id)
          item.onSelect()
          onClose()
        }
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const ch = e.key.toLowerCase()
        const now = Date.now()
        if (typeTimerRef.current)
          window.clearTimeout(typeTimerRef.current)
        typeBufferRef.current += ch
        const buf = typeBufferRef.current
        const idx = items.findIndex(it => !it.disabled && it.label.toLowerCase().startsWith(buf))
        if (idx >= 0)
          setActiveIndex(idx)
        typeTimerRef.current = window.setTimeout(() => { typeBufferRef.current = '' }, 800)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        onClose()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
      if (typeTimerRef.current)
        window.clearTimeout(typeTimerRef.current)
    }
  }, [onClose, items, activeIndex])

  useEffect(() => {
    ref.current?.focus()
  }, [])

  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      ref={ref as any}
      role="menu"
      aria-label="Context menu"
      className="context-menu"
      tabIndex={-1}
      initial={prefersReduced ? false : 'hidden'}
      animate={prefersReduced ? undefined : 'visible'}
      variants={fadeInUp}
    >
      {items.map((item, idx) => (
        <div key={item.id} className="context-menu__row">
          <motion.button
            role="menuitem"
            onClick={() => !item.disabled && (recordMenuSelect(item.id), item.onSelect(), onClose())}
            disabled={item.disabled}
            className={`context-menu__item ${idx === activeIndex ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
            tabIndex={idx === activeIndex ? 0 : -1}
            type="button"
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          >
            {item.label}
          </motion.button>
          {item.disabled && item.disabledReason && (
            <span className="context-menu__reason" aria-hidden="true">{item.disabledReason}</span>
          )}
        </div>
      ))}
    </motion.div>
  )
}

export default ContextMenu
