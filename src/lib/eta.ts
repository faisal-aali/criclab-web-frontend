/**
 * Formats a seconds-remaining estimate the way a person actually reads a
 * countdown: never a bare number of seconds once it gets past a minute (nobody
 * wants "137 seconds"), and never false precision at the low end.
 */
export function formatEta(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  if (seconds < 45) return 'Less than a minute'
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes === 1) return '~1 minute'
  return `~${minutes} minutes`
}

/** Absolute expected start, in the viewer's local timezone. */
export function formatExpectedAt(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return `today, ${time}`
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${date}, ${time}`
}

export function isWaitingToStart(status: string | undefined): boolean {
  return status === 'queued' || status === 'claimed'
}
