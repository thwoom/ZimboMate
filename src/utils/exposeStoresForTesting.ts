import { useCharacterStore } from '@/stores/characterStore'
import { useSessionStore } from '@/stores/sessionStore'

declare global {
  interface Window {
    __zimboStores?: Record<string, unknown>
  }
}

if (typeof window !== 'undefined') {
  window.__zimboStores = window.__zimboStores ?? {}
  if (!('character' in window.__zimboStores)) {
    window.__zimboStores.character = useCharacterStore
  }
  if (!('session' in window.__zimboStores)) {
    window.__zimboStores.session = useSessionStore
  }
}

export {}
