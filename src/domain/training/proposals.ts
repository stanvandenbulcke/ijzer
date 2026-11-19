import type { Suggestion } from '../strength/progression'
import type { WorkoutSet } from './types'

export interface Proposal {
  weightKg: number | null
  reps: number | null
}

/**
 * What a set is filled with when you tick it without typing (SPEC §1: same as last time in
 * one tap). Order of preference: what you typed → the progression suggestion → the same set
 * last time → the previous set of today → the routine target.
 */
export function proposeSet(params: {
  set: WorkoutSet
  /** Index among sets of the same type in this exercise (warm-up 1, 2… / working 1, 2…). */
  indexOfType: number
  previousSets: WorkoutSet[]
  suggestion: Suggestion | null
  earlierToday: WorkoutSet | undefined
}): Proposal {
  const { set, indexOfType, previousSets, suggestion, earlierToday } = params
  const sameType = previousSets.filter((s) => s.completed && s.type === set.type)
  const prevSame = sameType[indexOfType] ?? sameType.at(-1)

  if (set.type === 'warmup') {
    return {
      weightKg: set.weightKg ?? prevSame?.weightKg ?? null,
      reps: set.reps ?? prevSame?.reps ?? null,
    }
  }

  let reps = prevSame?.reps ?? earlierToday?.reps ?? set.target?.repMin ?? null
  if (suggestion?.reason === 'increase_weight' || suggestion?.reason === 'fixed_increase') {
    reps = suggestion.repMin ?? reps
  } else if (suggestion?.reason === 'add_rep' && prevSame) {
    // One more rep on the weakest set of last time, the others repeat.
    const reps0 = sameType.map((s) => s.reps ?? 0)
    const weakest = reps0.indexOf(Math.min(...reps0))
    if (weakest === indexOfType) reps = (prevSame.reps ?? 0) + 1
  }

  return {
    weightKg:
      set.weightKg ?? suggestion?.weightKg ?? prevSame?.weightKg ?? earlierToday?.weightKg ?? null,
    reps: set.reps ?? reps,
  }
}

/** "80 × 8 @2" for the "vorige keer" column. */
export function describeSet(
  set: Pick<WorkoutSet, 'weightKg' | 'reps' | 'rir'>,
  format: (n: number) => string,
): string {
  const base = `${format(set.weightKg ?? 0)} × ${set.reps ?? 0}`
  return set.rir === null ? base : `${base} @${set.rir}`
}
