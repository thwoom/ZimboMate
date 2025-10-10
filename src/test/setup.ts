import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import { setupGlobalErrorHandling } from '../components/ui/ErrorBoundary'
import { logger } from '../utils/logger'
import { customMatchers } from '../utils/testing'

import '@testing-library/jest-dom'

if (typeof process !== 'undefined') {
  process.env.LLM_ROLLOUT_STAGE =
    process.env.LLM_ROLLOUT_STAGE ?? 'default'
}

vi.mock('@/services/llm', async () => {
  const actual =
    await vi.importActual<typeof import('@/services/llm')>('@/services/llm')

  type ProgressHandler = (event: any) => void
  type TelemetryHandler = (event: any) => void

  const state = {
    progressHandlers: new Set<ProgressHandler>(),
    telemetryHandlers: new Set<TelemetryHandler>(),
    proposeCalls: [] as any[],
    applyCalls: [] as any[],
    nextProposeResult: undefined as
      | undefined
      | ((request: any) => any | Promise<any>),
    nextApplyResult: undefined as
      | undefined
      | ((payload: any) => any | Promise<any>),
  }

  const controls = {
    reset() {
      state.proposeCalls = []
      state.applyCalls = []
      state.nextProposeResult = undefined
      state.nextApplyResult = undefined
    },
    emitProgress(event: any) {
      for (const handler of state.progressHandlers) handler(event)
    },
    emitTelemetry(event: any) {
      for (const handler of state.telemetryHandlers) handler(event)
    },
    setNextProposeResult(
      factory: ((request: any) => any | Promise<any>) | undefined,
    ) {
      state.nextProposeResult = factory
    },
    setNextApplyResult(
      factory: ((payload: any) => any | Promise<any>) | undefined,
    ) {
      state.nextApplyResult = factory
    },
    getProposeCalls() {
      return [...state.proposeCalls]
    },
    getApplyCalls() {
      return [...state.applyCalls]
    },
  }

  const schedule =
    globalThis.queueMicrotask ??
    ((cb: () => void) => Promise.resolve().then(cb))

  const fakeClient = {
    onProgress(handler: ProgressHandler) {
      state.progressHandlers.add(handler)
      schedule(() =>
        handler({ stage: 'idle', progress: 0, message: 'Mock idle event' }),
      )
      return () => state.progressHandlers.delete(handler)
    },
    onTelemetry(handler: TelemetryHandler) {
      state.telemetryHandlers.add(handler)
      return () => state.telemetryHandlers.delete(handler)
    },
    async proposeDeltas(request: any) {
      state.proposeCalls.push(request)
      if (state.nextProposeResult) {
        return await state.nextProposeResult(request)
      }
      const entryId =
        request?.entryId ?? `mock-entry-${Math.random().toString(36).slice(2)}`
      return {
        bundle: {
          entryId,
          narrative: request?.rawText?.trim()
            ? `${request.rawText.trim()} (mocked summary)`
            : 'Mock automation summary',
          ops: [],
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          reasoning: 'Mocked in test environment',
          idempotencyKey:
            request?.idempotencyKey ??
            `mock-bundle-${Math.random().toString(36).slice(2)}`,
          model: 'gpt-5-mock',
          createdAt: new Date().toISOString(),
        },
        warnings: [],
      }
    },
    async applyBundle(payload: any) {
      state.applyCalls.push(payload)
      if (state.nextApplyResult) {
        return await state.nextApplyResult(payload)
      }
      const bundle = payload?.bundle ?? { entryId: 'mock-bundle', ops: [] }
      const bundleId =
        bundle.idempotencyKey ??
        bundle.entryId ??
        `mock-bundle-${Math.random().toString(36).slice(2)}`
      const ops: any[] = Array.isArray(bundle.ops) ? bundle.ops : []
      const selected = new Set(payload?.selectedOpIndices ?? [])
      const appliedOps =
        selected.size > 0 ? ops.filter((_, index) => selected.has(index)) : ops
      const skippedOps =
        selected.size > 0 ? ops.filter((_, index) => !selected.has(index)) : []

      return {
        bundleId,
        appliedOps,
        skippedOps,
        undoHandle: {
          bundleId,
          issuedAt: new Date().toISOString(),
        },
      }
    },
  }

  controls.reset()

  const exported = {
    ...actual,
    gpt5Client: fakeClient,
  }

  ;(fakeClient as any).__mock = controls
  ;(exported as any).__mock = controls
  ;(globalThis as any).__LLM_MOCK__ = controls

  return exported
})

declare global {
  interface GlobalThis {
    logger?: typeof logger
  }
}

if (!globalThis.logger) {
  globalThis.logger = logger
}

expect.extend(customMatchers)
const getLlmMockControls = () => (globalThis as any).__LLM_MOCK__

beforeEach(() => {
  const controls = getLlmMockControls()
  if (controls?.reset) {
    controls.reset()
  }
})

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
let originalIntersectionObserver:
  | typeof globalThis.IntersectionObserver
  | undefined
let originalRequestAnimationFrame:
  | typeof globalThis.requestAnimationFrame
  | undefined
let originalCancelAnimationFrame:
  | typeof globalThis.cancelAnimationFrame
  | undefined
let originalCanvasGetContext:
  | typeof HTMLCanvasElement.prototype.getContext
  | undefined
let originalUrlCreateObjectURL: typeof URL.createObjectURL | undefined
let originalUrlRevokeObjectURL: typeof URL.revokeObjectURL | undefined
let performanceMarkPatched = false
let performanceMeasurePatched = false
let matchMediaDescriptor: PropertyDescriptor | undefined
let localStorageDescriptor: PropertyDescriptor | undefined
let sessionStorageDescriptor: PropertyDescriptor | undefined
let clipboardDescriptor: PropertyDescriptor | undefined
let mediaDevicesDescriptor: PropertyDescriptor | undefined
let scrollToDescriptor: PropertyDescriptor | undefined
let originalWebGLRenderingContext:
  | typeof globalThis.WebGLRenderingContext
  | undefined
let originalWebGL2RenderingContext:
  | typeof globalThis.WebGL2RenderingContext
  | undefined
let rafId = 0
const rafHandles = new Map<number, ReturnType<typeof setTimeout>>()

beforeAll(() => {
  const MockResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  originalResizeObserver = globalThis.ResizeObserver
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof globalThis.ResizeObserver

  const MockIntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  originalIntersectionObserver = globalThis.IntersectionObserver
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof globalThis.IntersectionObserver

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

  scrollToDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollTo')
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
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
    globalThis.performance.mark = (() =>
      undefined) as typeof globalThis.performance.mark
    performanceMarkPatched = true
  }

  if (!globalThis.performance.measure) {
    globalThis.performance.measure = (() =>
      undefined) as typeof globalThis.performance.measure
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
  HTMLCanvasElement.prototype.getContext = () =>
    mockWebGLContext as unknown as RenderingContext

  originalWebGLRenderingContext = (globalThis as any).WebGLRenderingContext
  originalWebGL2RenderingContext = (globalThis as any).WebGL2RenderingContext
  if (!(globalThis as any).WebGLRenderingContext) {
    ;(globalThis as any).WebGLRenderingContext =
      function WebGLRenderingContext() {}
  }
  if (!(globalThis as any).WebGL2RenderingContext) {
    ;(globalThis as any).WebGL2RenderingContext =
      function WebGL2RenderingContext() {}
  }

  localStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'localStorage',
  )
  sessionStorageDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'sessionStorage',
  )
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

  mediaDevicesDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'mediaDevices',
  )
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: async () => null,
    } as MediaDevices,
  })

  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: An invalid form control') ||
        args[0].includes('Error: Uncaught [Error: WebGL not supported]'))
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
  } catch {}
  vi.clearAllTimers()
})

afterAll(() => {
  vi.useRealTimers()
  rafHandles.clear()
  rafId = 0

  if (originalResizeObserver) {
    globalThis.ResizeObserver = originalResizeObserver
  } else {
    delete (globalThis as Record<string, unknown>).ResizeObserver
  }

  if (originalIntersectionObserver) {
    globalThis.IntersectionObserver = originalIntersectionObserver
  } else {
    delete (globalThis as Record<string, unknown>).IntersectionObserver
  }

  if (matchMediaDescriptor) {
    Object.defineProperty(window, 'matchMedia', matchMediaDescriptor)
  } else {
    delete (window as Record<string, unknown>).matchMedia
  }

  if (originalRequestAnimationFrame) {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
  } else {
    delete (globalThis as Record<string, unknown>).requestAnimationFrame
  }

  if (originalCancelAnimationFrame) {
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  } else {
    delete (globalThis as Record<string, unknown>).cancelAnimationFrame
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
  if (originalWebGLRenderingContext) {
    ;(globalThis as any).WebGLRenderingContext = originalWebGLRenderingContext
  } else {
    delete (globalThis as any).WebGLRenderingContext
  }

  if (originalWebGL2RenderingContext) {
    ;(globalThis as any).WebGL2RenderingContext = originalWebGL2RenderingContext
  } else {
    delete (globalThis as any).WebGL2RenderingContext
  }

  if (localStorageDescriptor) {
    Object.defineProperty(window, 'localStorage', localStorageDescriptor)
  } else {
    delete (window as Record<string, unknown>).localStorage
  }

  if (sessionStorageDescriptor) {
    Object.defineProperty(window, 'sessionStorage', sessionStorageDescriptor)
  } else {
    delete (window as Record<string, unknown>).sessionStorage
  }

  if (originalUrlCreateObjectURL) {
    globalThis.URL.createObjectURL = originalUrlCreateObjectURL
  } else {
    delete (globalThis.URL as unknown as Record<string, unknown>)
      .createObjectURL
  }

  if (originalUrlRevokeObjectURL) {
    globalThis.URL.revokeObjectURL = originalUrlRevokeObjectURL
  } else {
    delete (globalThis.URL as unknown as Record<string, unknown>)
      .revokeObjectURL
  }

  if (clipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  } else {
    Reflect.deleteProperty(navigator as Record<string, unknown>, 'clipboard')
  }

  if (mediaDevicesDescriptor) {
    Object.defineProperty(navigator, 'mediaDevices', mediaDevicesDescriptor)
  } else {
    Reflect.deleteProperty(navigator as Record<string, unknown>, 'mediaDevices')
  }

  if (scrollToDescriptor) {
    Object.defineProperty(window, 'scrollTo', scrollToDescriptor)
  } else {
    delete (window as Record<string, unknown>).scrollTo
  }

  console.error = loggerConsoleError
  teardownGlobalErrorHandling?.()
})

// Global test utilities
declare global {
  interface CustomMatchers<R = unknown> {
    toHaveAccessibleName: (expectedName: string) => R
    toBeWithinPerformanceBudget: (budget: number) => R
  }
}
