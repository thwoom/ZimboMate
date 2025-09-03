import React, { useEffect, useRef } from 'react'

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        onClose()
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
  }, [onClose])

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Context menu"
      style={{ position: 'fixed', top: y, left: x, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6, minWidth: 160, zIndex: 1000 }}
    >
      {items.map(item => (
        <button
          key={item.id}
          role="menuitem"
          onClick={() => !item.disabled && (item.onSelect(), onClose())}
          disabled={item.disabled}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', color: item.disabled ? '#777' : '#fff', cursor: item.disabled ? 'not-allowed' : 'pointer' }}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ContextMenu
