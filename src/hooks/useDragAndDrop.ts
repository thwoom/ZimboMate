/**
 * Drag and Drop Hook for Stats
 * Provides desktop-optimized drag and drop functionality for stats to quick roll zones
 */

import type { Attributes } from '../models/Character'
import { useCallback, useRef, useState } from 'react'
import { useDiceStore } from '../stores/diceStore'
import { logger } from '../utils/logger'

interface DragData {
  type: 'stat' | 'move' | 'custom'
  stat?: keyof Attributes
  statValue?: number
  moveId?: string
  moveName?: string
  modifier?: number
  label?: string
}

export function useDragAndDrop(characterId: string) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragData, setDragData] = useState<DragData | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const { rollCustom } = useDiceStore()

  // Start dragging
  const startDrag = useCallback((data: DragData, event: React.DragEvent) => {
    logger.debug('[DragDrop] Starting drag', data)
    setIsDragging(true)
    setDragData(data)
    dragStartPos.current = { x: event.clientX, y: event.clientY }

    // Set drag image to be semi-transparent
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('application/json', JSON.stringify(data))

      // Create custom drag image
      const dragElement = event.currentTarget as HTMLElement
      const dragImage = dragElement.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '0.7'
      dragImage.style.transform = 'rotate(5deg)'
      dragImage.style.pointerEvents = 'none'

      // Append to body temporarily for drag image
      document.body.appendChild(dragImage)
      event.dataTransfer.setDragImage(dragImage, 0, 0)

      // Clean up drag image after a delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      }, 0)
    }
  }, [])

  // End dragging
  const endDrag = useCallback(() => {
    logger.debug('[DragDrop] Ending drag')
    setIsDragging(false)
    setDragData(null)
    setActiveDropZone(null)
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    async (event: React.DragEvent, dropZoneId: string) => {
      event.preventDefault()

      try {
        const dataString = event.dataTransfer.getData('application/json')
        if (!dataString) return

        const data: DragData = JSON.parse(dataString)
        logger.debug('[DragDrop] Handling drop', { data, dropZoneId })

        // Apply drop zone modifiers
        let finalModifier = data.modifier || 0
        let rollLabel = data.label || 'Drag & Drop Roll'

        switch (dropZoneId) {
          case 'advantage-roll':
            finalModifier += 1
            rollLabel += ' (Advantage +1)'
            break
          case 'power-roll':
            finalModifier += 2
            rollLabel += ' (Power +2)'
            break
          case 'quick-roll':
          default:
            rollLabel += ' (Quick Roll)'
            break
        }

        // Execute the appropriate roll based on drag data
        if (data.type === 'stat' && data.stat) {
          await rollCustom({
            modifier: finalModifier,
            context: {
              label: rollLabel,
              type: 'stat',
              stat: data.stat,
            },
            characterId,
          })
        } else if (data.type === 'move' && data.moveId && data.stat) {
          await rollCustom({
            modifier: finalModifier,
            context: {
              label: rollLabel,
              type: 'move',
              moveId: data.moveId,
              stat: data.stat,
            },
            characterId,
          })
        } else if (data.type === 'custom') {
          await rollCustom({
            modifier: finalModifier,
            context: { label: rollLabel, type: 'custom' },
            characterId,
          })
        }
      } catch (error) {
        logger.error('[DragDrop] Drop failed', error)
      } finally {
        endDrag()
      }
    },
    [characterId, rollCustom, endDrag],
  )

  // Handle drag over (for drop zone highlighting)
  const handleDragOver = useCallback(
    (event: React.DragEvent, dropZoneId: string) => {
      event.preventDefault()
      setActiveDropZone(dropZoneId)
    },
    [],
  )

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone (not just moving to a child)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setActiveDropZone(null)
    }
  }, [])

  // Create draggable props for components
  const getDraggableProps = useCallback(
    (data: DragData) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => startDrag(data, e),
      onDragEnd: endDrag,
      className:
        isDragging && dragData === data
          ? 'opacity-50 cursor-grabbing'
          : 'cursor-grab',
    }),
    [startDrag, endDrag, isDragging, dragData],
  )

  // Create drop zone props for components
  const getDropZoneProps = useCallback(
    (dropZoneId: string) => ({
      onDrop: (e: React.DragEvent) => handleDrop(e, dropZoneId),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, dropZoneId),
      onDragLeave: handleDragLeave,
      className: `${activeDropZone === dropZoneId ? 'bg-primary/10 border-primary/30 border-2 border-dashed' : 'border-2 border-transparent'} transition-all duration-200`,
    }),
    [handleDrop, handleDragOver, handleDragLeave, activeDropZone],
  )

  return {
    isDragging,
    dragData,
    activeDropZone,
    getDraggableProps,
    getDropZoneProps,
    startDrag,
    endDrag,
    handleDrop,
  }
}

// Convenience hook for stat dragging
export function useStatDrag(
  characterId: string,
  stat: keyof Attributes,
  statValue: number,
  label?: string,
) {
  const { getDraggableProps } = useDragAndDrop(characterId)

  return getDraggableProps({
    type: 'stat',
    stat,
    statValue,
    label: label || stat,
  })
}

// Convenience hook for move dragging
export function useMoveDrag(
  characterId: string,
  moveId: string,
  moveName: string,
  stat: keyof Attributes,
) {
  const { getDraggableProps } = useDragAndDrop(characterId)

  return getDraggableProps({
    type: 'move',
    moveId,
    moveName,
    stat,
  })
}
