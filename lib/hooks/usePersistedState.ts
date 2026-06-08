import { useCallback, useEffect, useState } from 'react'

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setStateInner] = useState<T>(defaultValue)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return

      let value: T
      if (validate) {
        value = validate(stored) ? (stored as unknown as T) : defaultValue
      } else {
        try {
          value = JSON.parse(stored) as T
        } catch {
          value = stored as unknown as T
        }
      }
      setStateInner(value)
    } catch {}
  }, [key])

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
