import { useEffect, useState } from 'react'

type TauriBridgeWindow = typeof window & {
  __TAURI__?: unknown
  __TAURI_IPC__?: unknown
  __TAURI_INTERNALS__?: unknown
}

export function hasTauriBridge(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const candidate = window as TauriBridgeWindow

  if (typeof candidate.__TAURI_IPC__ === 'function') {
    return true
  }

  if (
    typeof candidate.__TAURI__ === 'object' &&
    candidate.__TAURI__ !== null
  ) {
    return true
  }

  if (
    typeof candidate.__TAURI_INTERNALS__ === 'object' &&
    candidate.__TAURI_INTERNALS__ !== null
  ) {
    return true
  }

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent?.toLowerCase() ?? ''
    if (ua.includes('tauri')) {
      return true
    }
  }

  return false
}

export function useIsTauriRuntime(): boolean {
  const [detected, setDetected] = useState(() => hasTauriBridge())

  useEffect(() => {
    if (detected || typeof window === 'undefined') {
      return
    }

    let disposed = false
    let attempts = 0
    const maxAttempts = 15
    const intervalMs = 200

    const intervalId = window.setInterval(() => {
      if (disposed) return
      if (hasTauriBridge()) {
        setDetected(true)
        window.clearInterval(intervalId)
        disposed = true
        return
      }

      attempts += 1
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId)
        disposed = true
      }
    }, intervalMs)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [detected])

  return detected
}
