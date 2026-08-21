import { useCallback, useState } from 'react'
import { ApiError } from '../api'

type PendingKey = string | number | boolean | null

export type { PendingKey }

type RunOptions<T> = {
  key?: PendingKey
  errorFallback?: string
  onSuccess?: (result: T) => void | Promise<void>
}

export function useAsyncAction(defaultErrorFallback: string) {
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingKey, setPendingKey] = useState<PendingKey>(null)

  const run = useCallback(
    async <T>(action: () => Promise<T>, options: RunOptions<T> = {}) => {
      const key = options.key ?? true
      setPendingKey(key)
      setActionError(null)

      try {
        const result = await action()
        await options.onSuccess?.(result)
        return result
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : (options.errorFallback ?? defaultErrorFallback)
        setActionError(message)
        return undefined
      } finally {
        setPendingKey(null)
      }
    },
    [defaultErrorFallback],
  )

  const isPending = useCallback(
    (key: PendingKey = true) => pendingKey === key,
    [pendingKey],
  )

  return { actionError, setActionError, run, isPending, pendingKey }
}
