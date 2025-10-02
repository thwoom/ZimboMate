import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useModalForm } from '../useModalForm'

type SubmitReturn<T> = T extends Promise<infer R> ? R : never

describe('useModalForm', () => {
  const getInitialState = () => ({ name: '', notes: '' })
  const getInitialErrors = () => ({ name: undefined as string | undefined, notes: undefined as string | undefined })

  it('initialises state and errors using the provided factories', () => {
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      onSubmit: vi.fn(),
    }))

    expect(result.current.state).toEqual({ name: '', notes: '' })
    expect(result.current.errors).toEqual({ name: undefined, notes: undefined })
  })

  it('applies updater functions via setState', () => {
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      onSubmit: vi.fn(),
    }))

    act(() => {
      result.current.setState(prev => ({ ...prev, name: 'Scholar' }))
    })

    expect(result.current.state.name).toBe('Scholar')
  })

  it('replaces state when reset is called with a value', () => {
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      onSubmit: vi.fn(),
    }))

    act(() => {
      result.current.reset({ name: 'Alchemist', notes: 'Brews potions' })
    })

    expect(result.current.state).toEqual({ name: 'Alchemist', notes: 'Brews potions' })
  })

  it('runs validation before submission and returns validation errors', async () => {
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      validate: state => ({
        name: state.name ? undefined : 'Name is required',
        notes: undefined,
      }),
      onSubmit: vi.fn(),
    }))

    let submitResult: SubmitReturn<ReturnType<typeof result.current.submit>>

    await act(async () => {
      submitResult = await result.current.submit()
    })

    expect(submitResult).toEqual({
      status: 'validation-error',
      errors: {
        name: 'Name is required',
        notes: undefined,
      },
    })
  })

  it('passes validation, calls submit handler, and returns the handler result', async () => {
    const handleSubmit = vi.fn().mockResolvedValue('created-id')
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      validate: () => ({ name: undefined, notes: undefined }),
      onSubmit: handleSubmit,
    }))

    act(() => {
      result.current.setState(prev => ({ ...prev, name: 'Navigator' }))
    })

    let submitResult: SubmitReturn<ReturnType<typeof result.current.submit>>

    await act(async () => {
      submitResult = await result.current.submit()
    })

    expect(handleSubmit).toHaveBeenCalledWith({ name: 'Navigator', notes: '' })
    expect(submitResult).toEqual({ status: 'success', result: 'created-id' })
  })

  it('returns an error status when the submit handler throws', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Network broken'))
    const { result } = renderHook(() => useModalForm({
      getInitialState,
      getInitialErrors,
      validate: () => ({ name: undefined, notes: undefined }),
      onSubmit: handleSubmit,
    }))

    act(() => {
      result.current.setState(prev => ({ ...prev, name: 'Navigator' }))
    })

    let submitResult: SubmitReturn<ReturnType<typeof result.current.submit>>

    await act(async () => {
      submitResult = await result.current.submit()
    })

    expect(submitResult.status).toBe('error')
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
