import React, { useEffect, useRef } from 'react'

import { panelRegistry } from '../framework/PanelRegistry'

import { PanelRouter } from '../framework/PanelRouter'
import './ContentArea.css'

interface ContentAreaProps {
  activePanelId: string
}

const ContentArea: React.FC <ContentAreaProps> = ({ activePanelId }) => {
  const activePanel = panelRegistry.getPanel(activePanelId)
  const panelTitle = activePanel?.metadata.name || 'Unknown Panel'
  const panelCount = panelRegistry.getAllPanels().length

  // Debug logging (commented out)
  // // Debug: Log when character creation is active
  if (process.env.NODE_ENV === 'development' && activePanelId === 'character-creation') {
  }

  // Debug function to toggle layout visualization
  const toggleLayoutDebug = () => {
    document.body.classList.toggle('debug-layout')
  }

  const bodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const track = el.querySelector('#overlay-scrollbar-track') as HTMLDivElement | null
    const thumb = el.querySelector('#overlay-scrollbar-thumb') as HTMLDivElement | null
    if (!track || !thumb) return

    let hideTimer: number | undefined
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const hasOverflow = scrollHeight - clientHeight > 1
      // Hide the overlay scrollbar entirely when there's nothing to scroll
      track.style.display = hasOverflow ? 'block' : 'none'
      if (!hasOverflow) return

      const ratio = clientHeight / Math.max(1, scrollHeight)
      const thumbHeight = Math.max(24, clientHeight * ratio)
      const maxTop = clientHeight - thumbHeight
      const top = scrollTop / Math.max(1, scrollHeight - clientHeight) * maxTop
      track.style.height = clientHeight + 'px'
      track.classList.add('is-visible')
      thumb.style.height = thumbHeight + 'px'
      thumb.style.transform = `translateY(${top}px)`
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => track.classList.remove('is-visible'), 800) as unknown as number
    }

    update()
    const onScroll = () => update()
    const onResize = () => update()
    el.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="content-area bg-transparent">
      <div ref={bodyRef} className={`content-area__body bg-transparent ${activePanelId === 'character-creation' ? 'content-area__body--full-width' : ''}`}>
        <div className="overlay-scrollbar-track" id="overlay-scrollbar-track">
          <div className="overlay-scrollbar-thumb" id="overlay-scrollbar-thumb" />
        </div>
        {panelCount > 0
          ? (
              <PanelRouter
                activePanelId={activePanelId}
                enableTransitions={true}
              />
            )
          : (
              <div className="content-area__placeholder glass-panel">
                <p> No panels registered</p>
                <p> Panels will appear here once they are registered in the system</p>
              </div>
            )}
      </div>
    </div>
  )
}

export default ContentArea
