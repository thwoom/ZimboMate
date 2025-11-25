import type { StateStorage } from 'zustand/middleware'

type AsyncStateStorage = {
  getItem: (name: string) => Promise<string | null>
  setItem: (name: string, value: string) => Promise<void>
  removeItem: (name: string) => Promise<void>
}

const isTauriEnvironment =
  typeof window !== 'undefined' && typeof (window as Record<string, unknown>).__TAURI_IPC__ === 'function'

const storeCache = new Map<
  string,
  Promise<{ get: (key: string) => Promise<string | null>; set: (key: string, value: string) => Promise<void>; delete: (key: string) => Promise<void> }>
>()

async function getStoreDriver(storeName: string) {
  if (!storeCache.has(storeName)) {
    const loader = (async () => {
      const { Store } = await import('@tauri-apps/plugin-store')
      const store = await Store.load(`${storeName}.store`)

      return {
        get: async (key: string) => {
          const value = await store.get<string | null>(key)
          return typeof value === 'string' ? value : value === null ? null : JSON.stringify(value)
        },
        set: async (key: string, value: string) => {
          await store.set(key, value)
          await store.save()
        },
        delete: async (key: string) => {
          await store.delete(key)
          await store.save()
        },
      }
    })()

    storeCache.set(storeName, loader)
  }

  return storeCache.get(storeName)!
}

function createAsyncStateStorage(storeName: string): AsyncStateStorage {
  return {
    async getItem(name: string) {
      const driver = await getStoreDriver(storeName)
      return driver.get(name)
    },
    async setItem(name: string, value: string) {
      const driver = await getStoreDriver(storeName)
      await driver.set(name, value)
    },
    async removeItem(name: string) {
      const driver = await getStoreDriver(storeName)
      await driver.delete(name)
    },
  }
}

function createBrowserStateStorage(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }
      return window.localStorage.getItem(name)
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      window.localStorage.setItem(name, value)
    },
    removeItem: (name) => {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      window.localStorage.removeItem(name)
    },
  }
}

export function createNativeStateStorage(storeName: string): () => StateStorage | AsyncStateStorage {
  if (!isTauriEnvironment) {
    return () => createBrowserStateStorage()
  }
  return () => createAsyncStateStorage(storeName)
}
