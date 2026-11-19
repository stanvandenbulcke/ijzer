const LOCALE = 'nl-BE'

const formatters = new Map<number, Intl.NumberFormat>()

/**
 * Formats a number the Belgian way: decimal comma, dot as thousands separator
 * ("1.640", "82,5"). Trailing zeros are dropped.
 */
export function formatNumber(value: number, maxDecimals = 1): string {
  let formatter = formatters.get(maxDecimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxDecimals })
    formatters.set(maxDecimals, formatter)
  }
  return formatter.format(value)
}

/** Seconds as m:ss for timers ("1:05"). Negative input is shown as 0:00. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const shortDay = new Intl.DateTimeFormat('nl-BE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const longDay = new Intl.DateTimeFormat('nl-BE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const clock = new Intl.DateTimeFormat('nl-BE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Brussels',
})

/** "16 nov." for a "YYYY-MM-DD" day. */
export function formatDayShort(day: string): string {
  return shortDay.format(new Date(`${day}T00:00:00Z`))
}

/** "maandag 16 november" for a "YYYY-MM-DD" day. */
export function formatDayLong(day: string): string {
  return longDay.format(new Date(`${day}T00:00:00Z`))
}

/** "17:42" in Belgian time for an ISO instant. */
export function formatClock(iso: string): string {
  return clock.format(new Date(iso))
}

/** Minutes as "1 u 05" or "48 min". */
export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes))
  return m >= 60 ? `${Math.floor(m / 60)} u ${String(m % 60).padStart(2, '0')}` : `${m} min`
}

/** Parses "78,4" or "78.4"; null when empty or not a number. */
export function parseDecimal(text: string): number | null {
  const cleaned = text.trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}
