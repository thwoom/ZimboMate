import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import { setupGlobalErrorHandling } from '../components/ui/ErrorBoundary'
import { logger } from '../utils/logger'
import { customMatchers } from '../utils/testing'

import '@testing-library/jest-dom'

declare global {
  // Provide the shared logger for components that assume a global logger binding.
  // Vitest runs in jsdom where we control the global namespace.

  var logger: typeof logger
}

if (!globalThis.logger) {
  globalThis.logger = logger
}

expect.extend(customMatchers)

const teardownGlobalErrorHandling = setupGlobalErrorHandling()
const loggerConsoleError = console.error

function noop() {}

function createStorageMock(): Storage {
  const store = new Map<string, string>()

  const storage: Partial<Storage> = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      const keys = Array.from(store.keys())
      return index >= 0 && index < keys.length ? keys[index] : null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  }

  return storage as Storage
}

let originalResizeObserver: typeof globalThis.ResizeObserver | undefined
let originalIntersectionObserver: typeof globalThis.IntersectionObserver | undefined
let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame | undefined
let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame | undefined
let originalCanvasGetContext: typeof HTMLCanvasElement.prototype.getContext | undefined
let originalUrlCreateObjectURL: typeof URL.createObjectURL | undefined
let originalUrlRevokeObjectURL: typeof URL.revokeObjectURL | undefined
let performanceMarkPatched = false
let performanceMeasurePatched = false
let matchMediaDescriptor: PropertyDescriptor | undefined
let localStorageDescriptor: PropertyDescriptor | undefined
let sessionStorageDescriptor: PropertyDescriptor | undefined
let clipboardDescriptor: PropertyDescriptor | undefined
let mediaDevicesDescriptor: PropertyDescriptor | undefined
let rafId = 0
const rafHandles = new Map<number, ReturnType<typeof setTimeout>>()

beforeAll(() => {
  const MockResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  originalResizeObserver = globalThis.ResizeObserver
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof globalThis.ResizeObserver

  const MockIntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  originalIntersectionObserver = globalThis.IntersectionObserver
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof globalThis.IntersectionObserver

  matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia')
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    }),
  })

  originalRequestAnimationFrame = globalThis.requestAnimationFrame
  originalCancelAnimationFrame = globalThis.cancelAnimationFrame
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    const id = ++rafId
    const handle = setTimeout(() => {
      callback(performance.now())
      rafHandles.delete(id)
    }, 16)
    rafHandles.set(id, handle)
    return id
  }
  globalThis.cancelAnimationFrame = (handle: number) => {
    const timeoutHandle = rafHandles.get(handle)
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      rafHandles.delete(handle)
    }
  }

  if (!globalThis.performance.mark) {
    globalThis.performance.mark = (() => undefined) as typeof globalThis.performance.mark
    performanceMarkPatched = true
  }

  if (!globalThis.performance.measure) {
    globalThis.performance.measure = (() => undefined) as typeof globalThis.performance.measure
    performanceMeasurePatched = true
  }

  originalCanvasGetContext = HTMLCanvasElement.prototype.getContext
  const mockWebGLContext = {
    getExtension: () => null,
    getParameter: () => null,
    createShader: () => null,
    shaderSource: noop,
    compileShader: noop,
    createProgram: () => null,
    attachShader: noop,
    linkProgram: noop,
    useProgram: noop,
    createBuffer: () => null,
    bindBuffer: noop,
    bufferData: noop,
    enableVertexAttribArray: noop,
    vertexAttribPointer: noop,
    drawArrays: noop,
    viewport: noop,
    clearColor: noop,
    clear: noop,
  }
  HTMLCanvasElement.prototype.getContext = () => mockWebGLContext as unknown as RenderingContext

  localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
  sessionStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createStorageMock(),
  })
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: createStorageMock(),
  })

  originalUrlCreateObjectURL = globalThis.URL.createObjectURL
  originalUrlRevokeObjectURL = globalThis.URL.revokeObjectURL
  globalThis.URL.createObjectURL = () => 'mock-url'
  globalThis.URL.revokeObjectURL = noop

  clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (_text: string) => {},
      readText: async () => 'mock-text',
    } as Clipboard,
  })

  mediaDevicesDescriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: async () => null,
    } as MediaDevices,
  })

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string'
      && (
        args[0].includes('Warning: ReactDOM.render is no longer supported')
        || args[0].includes('Warning: An invalid form control')
        || args[0].includes('Error: Uncaught [Error: WebGL not supported]')
      )
    ) {
      return
    }
    loggerConsoleError.call(console, ...args)
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  // Flush any pending timers created by components/utilities
  try {
    vi.runOnlyPendingTimers()
  }
  catch {}
  vi.clearAllTimers()
})

afterAll(() => {
  vi.useRealTimers()
  rafHandles.clear()
  rafId = 0

  if (originalResizeObserver) {
    globalThis.ResizeObserver = originalResizeObserver
  }
  else {
    delete (global as Record<string, unknown>).ResizeObserver
  }

  if (originalIntersectionObserver) {
    globalThis.IntersectionObserver = originalIntersectionObserver
  }
  else {
    delete (global as Record<string, unknown>).IntersectionObserver
  }

  if (matchMediaDescriptor) {
    Object.defineProperty(window, 'matchMedia', matchMediaDescriptor)
  }
  else {
    delete (window as Record<string, unknown>).matchMedia
  }

  if (originalRequestAnimationFrame) {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
  }
  else {
    delete (global as Record<string, unknown>).requestAnimationFrame
  }

  if (originalCancelAnimationFrame) {
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  }
  else {
    delete (global as Record<string, unknown>).cancelAnimationFrame
  }

  if (performanceMarkPatched) {
    delete (performance as Record<string, unknown>).mark
  }

  if (performanceMeasurePatched) {
    delete (performance as Record<string, unknown>).measure
  }

  if (originalCanvasGetContext) {
    HTMLCanvasElement.prototype.getContext = originalCanvasGetContext
  }

  if (localStorageDescriptor) {
    Object.defineProperty(window, 'localStorage', localStorageDescriptor)
  }
  else {
    delete (window as Record<string, unknown>).localStorage
  }

  if (sessionStorageDescriptor) {
    Object.defineProperty(window, 'sessionStorage', sessionStorageDescriptor)
  }
  else {
    delete (window as Record<string, unknown>).sessionStorage
  }

  if (originalUrlCreateObjectURL) {
    globalThis.URL.createObjectURL = originalUrlCreateObjectURL
  }
  else {
    delete (globalThis.URL as unknown as Record<string, unknown>).createObjectURL
  }

  if (originalUrlRevokeObjectURL) {
    globalThis.URL.revokeObjectURL = originalUrlRevokeObjectURL
  }
  else {
    delete (globalThis.URL as unknown as Record<string, unknown>).revokeObjectURL
  }

  if (clipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  }
  else {
    Reflect.deleteProperty(navigator as Record<string, unknown>, 'clipboard')
  }

  if (mediaDevicesDescriptor) {
    Object.defineProperty(navigator, 'mediaDevices', mediaDevicesDescriptor)
  }
  else {
    Reflect.deleteProperty(navigator as Record<string, unknown>, 'mediaDevices')
  }

  console.error = loggerConsoleError
  teardownGlobalErrorHandling?.()
})

// Global test utilities
declare global {
  interface CustomMatchers<R = unknown> {
    toHaveAccessibleName(expectedName: string): R
    toBeWithinPerformanceBudget(budget: number): R
  }
}
