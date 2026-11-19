import { THRESHOLDS } from '../analysis/thresholds'
import type { MuscleId } from '../muscles/taxonomy'
import type { Exercise, Performance } from '../training/types'

export type MuscleVolume = Partial<Record<MuscleId, number>>

/**
 * Fractional sets per muscle (SPEC §5.3): every completed working set gives +1 to the
 * muscles it trains directly and +0.5 to indirect ones. Warm-ups, skipped exercises and
 * unchecked sets are already excluded by `performances`. Sets with a logged RIR above
 * `rirCutoff` count 0: too far from failure to be much of a stimulus.
 */
export function fractionalSets(
  perfs: Performance[],
  exerciseById: (id: string) => Exercise | undefined,
  rirCutoff: number = THRESHOLDS.rirCutoff,
): MuscleVolume {
  const volume: MuscleVolume = {}
  for (const { exerciseId, set } of perfs) {
    if (set.type === 'warmup') continue
    if (set.rir !== null && set.rir > rirCutoff) continue
    const exercise = exerciseById(exerciseId)
    if (!exercise) continue
    for (const { muscle, weight } of exercise.muscles) {
      volume[muscle] = (volume[muscle] ?? 0) + weight
    }
  }
  return volume
}

/** Fractional sets for a planned routine: every non-warm-up set counts as done. */
export function plannedVolume(
  items: Array<{ exerciseId: string; workingSets: number }>,
  exerciseById: (id: string) => Exercise | undefined,
): MuscleVolume {
  const volume: MuscleVolume = {}
  for (const { exerciseId, workingSets } of items) {
    for (const { muscle, weight } of exerciseById(exerciseId)?.muscles ?? []) {
      volume[muscle] = (volume[muscle] ?? 0) + weight * workingSets
    }
  }
  return volume
}

export type VolumeZone = 'none' | 'low' | 'moderate' | 'target' | 'high' | 'veryHigh'

/** Zone of a weekly fractional-set count (R1). The bands are practical rules of thumb. */
export function volumeZone(sets: number, t = THRESHOLDS.volume): VolumeZone {
  if (sets <= 0) return 'none'
  if (sets < t.low) return 'low'
  if (sets < t.target) return 'moderate'
  if (sets < t.high) return 'target'
  if (sets < t.veryHigh) return 'high'
  return 'veryHigh'
}
