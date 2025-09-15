import React from 'react'
import { cn } from '../../lib/utils'

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys: string | string[]
  size?: 'sm' | 'default'
}

export function Kbd({ keys, size = 'default', className, ...props }: KbdProps) {
  const keyArray = Array.isArray(keys) ? keys : [keys]
  
  const formatKey = (key: string): string => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    
    switch (key.toLowerCase()) {
      case 'cmd':
      case 'meta':
        return isMac ? '⌘' : 'Ctrl'
      case 'ctrl':
        return isMac ? '⌃' : 'Ctrl'
      case 'alt':
        return isMac ? '⌥' : 'Alt'
      case 'shift':
        return isMac ? '⇧' : 'Shift'
      case 'enter':
        return '↵'
      case 'escape':
        return 'Esc'
      case 'arrowup':
        return '↑'
      case 'arrowdown':
        return '↓'
      case 'arrowleft':
        return '←'
      case 'arrowright':
        return '→'
      case 'space':
        return '␣'
      case 'tab':
        return '⇥'
      case 'backspace':
        return '⌫'
      case 'delete':
        return '⌦'
      default:
        return key.toUpperCase()
    }
  }

  return (
    <span className="inline-flex items-center gap-1" {...props}>
      {keyArray.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-text-tertiary text-xs">+</span>
          )}
          <kbd
            className={cn(
              'inline-flex items-center justify-center rounded border border-border bg-surface font-mono font-medium text-text-secondary shadow-sm',
              size === 'sm' ? 'h-5 min-w-[1.25rem] px-1 text-xs' : 'h-6 min-w-[1.5rem] px-1.5 text-sm',
              className
            )}
          >
            {formatKey(key)}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  )
}