import { render, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'

import { Toaster } from '../sonner'

describe('toaster', () => {
  it('applies Matsu theme styles to the Sonner container', async () => {
    const { unmount } = render(<Toaster />)

    toast('testing matsu colors')

    await waitFor(() => {
      expect(
        document.querySelector('[data-sonner-toaster]'),
      ).toBeInTheDocument()
    })

    const toaster = document.querySelector('[data-sonner-toaster]') as HTMLElement

    expect(toaster).toHaveAttribute('data-sonner-theme', 'matsu')
    expect(toaster).toHaveStyle('--normal-bg: var(--popover)')
    expect(toaster).toHaveStyle('--normal-text: var(--popover-foreground)')
    expect(toaster).toHaveStyle('--normal-border: var(--border)')

    toast.dismiss()
    unmount()
  })
})
