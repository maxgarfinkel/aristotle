/**
 * Add `days` to an ISO date string (YYYY-MM-DD) and return the result
 * in the same format. Uses UTC arithmetic to avoid DST shifts.
 */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const next = new Date(Date.UTC(y!, m! - 1, d! + days))
  return next.toISOString().substring(0, 10)
}

/** Returns tomorrow's date as an ISO string (YYYY-MM-DD). */
export function tomorrow(): string {
  const now = new Date()
  return addDays(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .toISOString()
      .substring(0, 10),
    1,
  )
}
