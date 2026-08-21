import { useCallback, useRef, useState } from 'react'

type ConfirmRequest = {
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null)

  const requestConfirm = useCallback((options: ConfirmRequest | string) => {
    const config = typeof options === 'string' ? { message: options } : options

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setRequest(config)
    })
  }, [])

  const finish = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed)
    resolveRef.current = null
    setRequest(null)
  }, [])

  const handleConfirm = useCallback(() => finish(true), [finish])
  const handleCancel = useCallback(() => finish(false), [finish])

  return {
    requestConfirm,
    confirmRequest: request,
    handleConfirm,
    handleCancel,
  }
}
