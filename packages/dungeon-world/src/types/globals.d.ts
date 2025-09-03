/**
 * Global type definitions for browser APIs and common globals
 */

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="es6" />

// Ensure DOM types are available globally
declare global {
  // Browser APIs
  const Blob: typeof globalThis.Blob
  const URL: typeof globalThis.URL
  const FileReader: typeof globalThis.FileReader
  const URLSearchParams: typeof globalThis.URLSearchParams
  const btoa: typeof globalThis.btoa
  const atob: typeof globalThis.atob
  const requestAnimationFrame: typeof globalThis.requestAnimationFrame

  // DOM Events
  const KeyboardEvent: typeof globalThis.KeyboardEvent
  const MouseEvent: typeof globalThis.MouseEvent

  // DOM Elements
  const HTMLDivElement: typeof globalThis.HTMLDivElement
  const HTMLTextAreaElement: typeof globalThis.HTMLTextAreaElement
  const Node: typeof globalThis.Node

  // Browser dialogs
  const alert: typeof globalThis.alert
  const confirm: typeof globalThis.confirm
  const prompt: typeof globalThis.prompt
}

export {}
