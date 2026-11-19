import { daysBetween } from '../time'

export interface WeighIn {
  day: string
  kg: number
}

export interface TrendPoint extends WeighIn {
  trend: number
}

/** Smoothing per day (SPEC §5.5). */
export const TREND_ALPHA = 0.1

/**
 * Weight trend as an exponential moving average, robust to gaps (SPEC §5.5):
 * `trend = previous + (1 − (1 − α)^Δ) × (weight − previous)` with Δ the days since the last
 * weigh-in. Daily weight swings with water, salt and food; the trend shows the real direction.
 */
export function weightTrend(entries: WeighIn[], alpha = TREND_ALPHA): TrendPoint[] {
  const sorted = [...entries].sort((a, b) => a.day.localeCompare(b.day))
  const points: TrendPoint[] = []
  for (const entry of sorted) {
    const prev = points.at(-1)
    if (!prev) {
      points.push({ ...entry, trend: entry.kg })
      continue
    }
    const gap = Math.max(1, daysBetween(prev.day, entry.day))
    const trend = prev.trend + (1 - (1 - alpha) ** gap) * (entry.kg - prev.trend)
    points.push({ ...entry, trend })
  }
  return points
}

/**
 * Change of the trend per week, from the latest point and the last point at least a week
 * earlier. Null with too little data. "Trend: −0,6 kg/week (−0,5 %)".
 */
export function weeklyRate(points: TrendPoint[]): { kgPerWeek: number; pctPerWeek: number } | null {
  const last = points.at(-1)
  if (!last) return null
  const earlier = [...points].reverse().find((p) => daysBetween(p.day, last.day) >= 7)
  if (!earlier) return null
  const days = daysBetween(earlier.day, last.day)
  const kgPerWeek = ((last.trend - earlier.trend) / days) * 7
  return { kgPerWeek, pctPerWeek: (kgPerWeek / earlier.trend) * 100 }
}
