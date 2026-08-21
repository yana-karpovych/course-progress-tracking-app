import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api'

type UseResourceLoaderOptions = {
  errorFallback?: string
  validate?: () => string | null
  loadOnMount?: boolean
}

export function useResourceLoader<T>(
  loadFn: () => Promise<T>,
  options: UseResourceLoaderOptions = {},
) {
  const {
    errorFallback = 'Failed to load data',
    validate,
    loadOnMount = true,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(loadOnMount)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (showLoading = false) => {
      const validationError = validate?.() ?? null
      if (validationError) {
        setError(validationError)
        setData(null)
        setLoading(false)
        return
      }

      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      try {
        const result = await loadFn()
        setData(result)
        setHasLoaded(true)
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : errorFallback
        setError(message)
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [loadFn, validate, errorFallback],
  )

  useEffect(() => {
    if (loadOnMount) {
      load(true)
    }
  }, [load, loadOnMount])

  return { data, loading, hasLoaded, error, load, setData }
}
