import { useCallback, useMemo, useRef, useState } from 'react'

export interface UseStringListFieldOptions {
  limit?: number
  normalise?: (value: string) => string
}

export interface UseStringListFieldReturn {
  items: string[]
  canAddMore: boolean
  addItem: (value: string) => boolean
  removeItem: (value: string) => void
  replaceAll: (values: string[]) => void
  reset: () => void
}

const defaultNormaliser = (value: string) => value.trim().toLowerCase()

function sanitiseValues(
  values: string[],
  normalise: (value: string) => string,
  limit: number,
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of values) {
    const value = normalise(raw)
    if (!value || seen.has(value)) continue

    seen.add(value)
    result.push(value)

    if (result.length >= limit) break
  }

  return result
}

export function useStringListField(
  initialValues: string[] = [],
  options: UseStringListFieldOptions = {},
): UseStringListFieldReturn {
  const normalise = options.normalise ?? defaultNormaliser
  const limit = options.limit ?? Number.POSITIVE_INFINITY

  const initialList = useMemo(
    () => sanitiseValues(initialValues, normalise, limit),
    [initialValues, limit, normalise],
  )
  const initialRef = useRef(initialList)

  const [itemsState, setItemsState] = useState(initialRef.current)
  const itemsRef = useRef(itemsState)

  const commitItems = useCallback((next: string[]) => {
    itemsRef.current = next
    setItemsState(next)
  }, [])

  const addItem = useCallback(
    (rawValue: string) => {
      const value = normalise(rawValue)
      if (!value) return false

      const current = itemsRef.current
      if (current.includes(value) || current.length >= limit) return false

      commitItems([...current, value])
      return true
    },
    [commitItems, limit, normalise],
  )

  const removeItem = useCallback(
    (rawValue: string) => {
      const value = normalise(rawValue)
      commitItems(itemsRef.current.filter((item) => item !== value))
    },
    [commitItems, normalise],
  )

  const replaceAll = useCallback(
    (values: string[]) => {
      const next = sanitiseValues(values, normalise, limit)
      commitItems(next)
    },
    [commitItems, limit, normalise],
  )

  const reset = useCallback(() => {
    commitItems(initialRef.current)
  }, [commitItems])

  return {
    items: itemsState,
    canAddMore: itemsState.length < limit,
    addItem,
    removeItem,
    replaceAll,
    reset,
  }
}
