import type { LiveSet } from '../../../domain/training/liveSnapshot'
import { formatNumber } from '../../../i18n/format'

/** "60 kg × 10", "45 s", "500 m" or "× 12" for a bodyweight set. */
export function setText(set: LiveSet): string {
  if (set.seconds !== null) return `${formatNumber(set.seconds, 0)} s`
  if (set.meters !== null) return `${formatNumber(set.meters, 0)} m`
  const reps = set.reps ?? 0
  return set.kg ? `${formatNumber(set.kg, 2)} kg × ${reps}` : `× ${reps}`
}
