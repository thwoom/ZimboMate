import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { EmbeddedRuntimePanel } from '../EmbeddedRuntimePanel'

const mockDownload = vi.fn()
const mockCancel = vi.fn()
const mockOpenDir = vi.fn()

vi.mock('@/components/chronicle/ChronicleProvider', () => {
  const KB = 1024
  const now = 1_725_000_000_000
  return {
    useChronicleLLM: () => ({
      embeddedRuntime: {
        isEnabled: true,
        models: [
          {
            kind: 'rules',
            modelId: 'rules-model',
            displayName: 'Qwen Tools',
            description: 'Rules model',
            quantization: 'Q4_K_M',
            parameterCount: 7,
            sizeBytes: 8 * KB,
            expectedPath: '/models/qwen',
            status: { state: 'ready', loadedAt: new Date().toISOString() },
            resumeBytes: undefined,
          },
        ],
        modelsDir: '/models',
        isChecking: false,
        error: null,
        refresh: vi.fn(),
        isDownloading: false,
        downloads: {},
        telemetry: [
          {
            kind: 'rules' as const,
            resumedFromBytes: 3 * KB,
            receivedBytes: 12 * KB,
            downloadedBytes: 5 * KB,
            durationMs: 2400,
            verifyDurationMs: 150,
            totalBytes: 12 * KB,
            outcome: 'success' as const,
            errorMessage: undefined,
            recordedAt: now,
          },
        ],
      },
    }),
  }
})

vi.mock('@/services/embeddedRuntime', () => ({
  cancelEmbeddedDownload: (...args: unknown[]) => mockCancel(...args),
  downloadEmbeddedModel: (...args: unknown[]) => mockDownload(...args),
  openEmbeddedModelsDir: (...args: unknown[]) => mockOpenDir(...args),
}))

describe('EmbeddedRuntimePanel telemetry', () => {
  it('renders recent download telemetry rows', () => {
    render(<EmbeddedRuntimePanel />)

    expect(screen.getByText(/Recent downloads/i)).toBeInTheDocument()
    const table = screen.getByTestId('embedded-download-telemetry')
    expect(within(table).getByText('Qwen Tools')).toBeInTheDocument()
    expect(screen.getByText(/success/i)).toBeInTheDocument()
    expect(within(table).getByText('5.00 KB / 12.00 KB')).toBeInTheDocument()
    expect(within(table).getByText('3.00 KB')).toBeInTheDocument()
  })
})
