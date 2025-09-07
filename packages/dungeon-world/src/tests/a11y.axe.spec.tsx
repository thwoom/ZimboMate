import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import App from '../App'
import { configureAxe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations as any)

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
  },
})

describe('Accessibility', () => {
  it('App shell should have no critical axe violations', async () => {
    const { container } = render(<App />)
    const results: any = await axe(container)
    const critical = results.violations?.filter((v: any) => v.impact === 'critical' || v.impact === 'serious') || []
    expect(critical).toHaveLength(0)
  })
})
