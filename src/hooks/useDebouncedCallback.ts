import { useEffect, useRef } from 'react'

/** Stable debounced callback. Executes trailing only. */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 500
) {
  const fnRef = useRef(fn)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  function run(...args: Parameters<T>) {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => fnRef.current(...args), delay)
  }

  return run as T
}
