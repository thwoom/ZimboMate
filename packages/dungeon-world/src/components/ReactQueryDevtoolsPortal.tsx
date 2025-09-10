import React from 'react'
import { createPortal } from 'react-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './ReactQueryDevtoolsPortal.css'

export default function ReactQueryDevtoolsPortal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onToggle = () => setOpen(v => !v)
    window.addEventListener('devtools:toggle', onToggle)
    return () => window.removeEventListener('devtools:toggle', onToggle)
  }, [])

  return createPortal(
    <div className="rq-portal-root">
      <div className="rq-portal-toggle">
        <button type="button" className="rq-portal-button" onClick={() => setOpen(v => !v)} aria-label="Toggle React Query Devtools">
          RQ
        </button>
      </div>
      {open && (
        <div className="rq-portal-panel">
          <ReactQueryDevtools initialIsOpen={true} buttonPosition="bottom-left" />
        </div>
      )}
    </div>,
    document.body,
  )
}


