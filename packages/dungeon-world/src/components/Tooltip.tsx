import React, { useEffect, useRef, useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false)
  const id = useRef(`tt_${Math.random().toString(36).slice(2)}`).current

  const show = () => setVisible(true)
  const hide = () => setVisible(false)

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        hide()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {React.cloneElement(children, {
        'onMouseEnter': show,
        'onMouseLeave': hide,
        'onFocus': show,
        'onBlur': hide,
        'aria-describedby': visible ? id : undefined,
      })}
      {visible && (
        <span
          id={id}
          role="tooltip"
          style={{ position: 'absolute', bottom: '100%', left: 0, transform: 'translateY(-6px)', background: '#111', color: '#fff', padding: '4px 8px', fontSize: 12, borderRadius: 4, whiteSpace: 'nowrap', pointerEvents: 'none' }}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export default Tooltip
