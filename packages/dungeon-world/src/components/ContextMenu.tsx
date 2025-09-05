import React, { useEffect, useRef, useState } from 'react'
import './ContextMenu.css'

interface MenuItem {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
}

interface ContextMenuProps {
  items: MenuItem[]
  x: number
  y: number
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, x, y, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty('--context-menu-top', `${y}px`)
      ref.current.style.setProperty('--context-menu-left', `${x}px`)
    }
  }, [x, y])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => (i + 1) % items.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => (i - 1 + items.length) % items.length)
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const item = items[activeIndex]
        if (item && !item.disabled) {
          item.onSelect()
          onClose()
        }
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
    }
  }, [onClose, items, activeIndex])

  useEffect(() => {
    // focus the menu container so it can receive key events
    ref.current?.focus()
  }, [])

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Context menu"
      className="context-menu"
      tabIndex={-1}
    >
      {items.map((item, idx) => (
        <button
          key={item.id}
          role="menuitem"
          onClick={() => !item.disabled && (item.onSelect(), onClose())}
          disabled={item.disabled}
          className={`context-menu__item ${idx === activeIndex ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
          tabIndex={idx === activeIndex ? 0 : -1}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ContextMenu
