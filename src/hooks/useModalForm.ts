import { useCallback, useReducer, useRef, useState } from 'react'

export interface ModalFormValidationError<TErrors extends Record<string, unknown>> {
  status: 'validation-error'
  errors: TErrors
}

export interface ModalFormSuccess<TResult> {
  status: 'success'
  result: TResult
}

export interface ModalFormError {
  status: 'error'
  error: unknown
}

export type ModalFormSubmitResult<TResult, TErrors extends Record<string, unknown>>
  = ModalFormValidationError<TErrors>
    | ModalFormSuccess<TResult>
    | ModalFormError

interface ReplaceAction<TState> {
  type: 'replace'
  payload: TState
}

interface ApplyAction<TState> {
  type: 'apply'
  updater: (state: TState) => TState
}

type FormAction<TState> = ReplaceAction<TState> | ApplyAction<TState>

type ErrorsAction<TErrors extends Record<string, unknown>>
  = { type: 'reset', payload: TErrors }
    | { type: 'set', payload: TErrors }

export interface UseModalFormOptions<TState, TErrors extends Record<string, unknown>, TResult> {
  getInitialState: () => TState
  getInitialErrors?: () => TErrors
  validate?: (state: TState) => TErrors
  onSubmit: (state: TState) => Promise<TResult> | TResult
}

export interface UseModalFormReturn<TState, TErrors extends Record<string, unknown>, TResult> {
  state: TState
  setState: (updater: (state: TState) => TState) => void
  replaceState: (nextState: TState) => void
  reset: (nextState?: TState) => void
  errors: TErrors
  setErrors: (nextErrors: TErrors) => void
  resetErrors: () => void
  submit: () => Promise<ModalFormSubmitResult<TResult, TErrors>>
  isSubmitting: boolean
}

function formReducer<TState>(state: TState, action: FormAction<TState>): TState {
  if (action.type === 'replace')
    return action.payload

  return action.updater(state)
}

function errorsReducer<TErrors extends Record<string, unknown>>(
  _state: TErrors,
  action: ErrorsAction<TErrors>,
): TErrors {
  return action.payload
}

function hasValidationErrors(errors: Record<string, unknown>) {
  return Object.values(errors).some(value => value !== undefined && value !== null && value !== false && value !== '')
}

export function useModalForm<TState extends Record<string, unknown>, TErrors extends Record<string, unknown>, TResult = void>(
  options: UseModalFormOptions<TState, TErrors, TResult>,
): UseModalFormReturn<TState, TErrors, TResult> {
  const initialStateFactoryRef = useRef(options.getInitialState)
  initialStateFactoryRef.current = options.getInitialState

  const initialErrorsFactoryRef = useRef(options.getInitialErrors)
  initialErrorsFactoryRef.current = options.getInitialErrors

  const validateRef = useRef(options.validate)
  validateRef.current = options.validate

  const submitRef = useRef(options.onSubmit)
  submitRef.current = options.onSubmit

  const initialStateRef = useRef<TState>()
  if (!initialStateRef.current)
    initialStateRef.current = initialStateFactoryRef.current()

  const initialErrorsRef = useRef<TErrors>()
  if (!initialErrorsRef.current) {
    initialErrorsRef.current = initialErrorsFactoryRef.current
      ? initialErrorsFactoryRef.current()
      : {} as TErrors
  }

  const [state, dispatchState] = useReducer(formReducer<TState>, initialStateRef.current)
  const [errors, dispatchErrors] = useReducer(errorsReducer<TErrors>, initialErrorsRef.current)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const replaceState = useCallback((nextState: TState) => {
    dispatchState({ type: 'replace', payload: nextState })
  }, [])

  const setState = useCallback((updater: (current: TState) => TState) => {
    dispatchState({ type: 'apply', updater })
  }, [])

  const setErrors = useCallback((nextErrors: TErrors) => {
    dispatchErrors({ type: 'set', payload: nextErrors })
  }, [])

  const resetErrors = useCallback(() => {
    const freshErrors = initialErrorsFactoryRef.current
      ? initialErrorsFactoryRef.current()
      : {} as TErrors
    dispatchErrors({ type: 'reset', payload: freshErrors })
  }, [])

  const reset = useCallback((nextState?: TState) => {
    const computedState = nextState ?? initialStateFactoryRef.current()
    initialStateRef.current = computedState
    replaceState(computedState)
    resetErrors()
  }, [replaceState, resetErrors])

  const submit = useCallback(async (): Promise<ModalFormSubmitResult<TResult, TErrors>> => {
    const validator = validateRef.current

    if (validator) {
      const validationErrors = validator(state)
      setErrors(validationErrors)
      if (hasValidationErrors(validationErrors))
        return { status: 'validation-error', errors: validationErrors }
    }
    else {
      resetErrors()
    }

    setIsSubmitting(true)
    try {
      const result = await submitRef.current(state)
      return { status: 'success', result }
    }
    catch (error) {
      return { status: 'error', error }
    }
    finally {
      setIsSubmitting(false)
    }
  }, [resetErrors, setErrors, state])

  return {
    state,
    setState,
    replaceState,
    reset,
    errors,
    setErrors,
    resetErrors,
    submit,
    isSubmitting,
  }
}
