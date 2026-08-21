import type { PendingKey } from '../hooks/useAsyncAction'

export function getPendingId(
  prefix: string,
  pendingKey: PendingKey,
): number | null {
  if (typeof pendingKey !== 'string' || !pendingKey.startsWith(`${prefix}-`)) {
    return null
  }

  const id = Number(pendingKey.slice(prefix.length + 1))
  return Number.isInteger(id) ? id : null
}
