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
