import { useCallback, useState } from 'react'

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setStateInner] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue

      if (validate) {
        return validate(stored) ? stored : defaultValue
      }

      try {
        const parsed = JSON.parse(stored)
        return parsed as T
      } catch {
        return stored as unknown as T
      }
    } catch {
      return defaultValue
    }
  })

  const setState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStateInner((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          if (typeof nextValue === 'string') {
            localStorage.setItem(key, nextValue)
          } else {
            localStorage.setItem(key, JSON.stringify(nextValue))
          }
        } catch {}
        return nextValue
      })
    },
    [key],
  )

  return [state, setState]
}
