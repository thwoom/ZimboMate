import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupGlobalErrorHandling } from '../components/ui/ErrorBoundary'
import { customMatchers } from '../utils/testing'

// Extend expect with custom matchers
expect.extend(customMatchers)

// Setup global error handling for tests
setupGlobalErrorHandling()

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock implementations for browser APIs
beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 16)
  }

  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id)
  }

  // Mock performance.mark for performance testing
  if (!global.performance.mark) {
    global.performance.mark = () => {}
  }

  if (!global.performance.measure) {
    global.performance.measure = () => {}
  }

  // Mock WebGL context for Three.js
  const mockWebGLContext = {
    getExtension: () => null,
    getParameter: () => null,
    createShader: () => null,
    shaderSource: () => {},
    compileShader: () => {},
    createProgram: () => null,
    attachShader: () => {},
    linkProgram: () => {},
    useProgram: () => {},
    createBuffer: () => null,
    bindBuffer: () => {},
    bufferData: () => {},
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    drawArrays: () => {},
    viewport: () => {},
    clearColor: () => {},
    clear: () => {},
  }

  HTMLCanvasElement.prototype.getContext = () => mockWebGLContext

  // Mock localStorage
  const localStorageMock = {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null,
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })

  // Mock URL.createObjectURL
  global.URL.createObjectURL = () => 'mock-url'
  global.URL.revokeObjectURL = () => {}

  // Mock Clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async (text: string) => {},
      readText: async () => 'mock-text',
    },
    writable: true,
  })

  // Mock getUserMedia for potential future features
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: async () => null,
    },
    writable: true,
  })
})

afterAll(() => {
  // Cleanup any global mocks if needed
})

// Console error suppression for expected errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress specific expected errors
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: An invalid form control') ||
        args[0].includes('Error: Uncaught [Error: WebGL not supported]')
      )
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveAccessibleName(expectedName: string): T
      toBeWithinPerformanceBudget(budget: number): T
    }
  }
}