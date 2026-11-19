/** All day boundaries in the app follow Belgian time (SPEC §2: Europe/Brussels). */
export const TIME_ZONE = 'Europe/Brussels'

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Calendar day ("YYYY-MM-DD") of an instant, in Belgian time. */
export function localDay(instant: string | Date): string {
  return dayFormatter.format(typeof instant === 'string' ? new Date(instant) : instant)
}

/** Whole days between two "YYYY-MM-DD" days (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/** Adds days to a "YYYY-MM-DD" day. */
export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Monday of the ISO week containing `day`. */
export function weekStart(day: string): string {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay() // 0 = Sunday
  return addDays(day, -((weekday + 6) % 7))
}
