import type { ProgressionModel, WorkoutSet } from '../training/types'

export type SuggestionReason =
  | 'first_time'
  | 'increase_weight'
  | 'add_rep'
  | 'fixed_increase'
  | 'fixed_repeat'
  | 'rir_adjust'
  | 'cut_maintain'

export interface Suggestion {
  weightKg: number | null
  repMin: number | null
  repMax: number | null
  reason: SuggestionReason
  /** Numbers for the "Waarom?" text. */
  previous: { weightKg: number; reps: number[]; rir: Array<number | null> } | null
}

export interface ProgressionInput {
  model: ProgressionModel
  repMin: number | null
  repMax: number | null
  targetRir: number | null
  incrementKg: number
  /** Completed working sets of the last real session (from `previousSession`). */
  previousSets: WorkoutSet[]
  /** Goal is losing weight: keeping strength is a win too (SPEC §5.2). */
  cutting?: boolean
  /** Best e1RM of the last sessions, newest last; used to spot a decline in a cut. */
  recentE1rms?: number[]
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step

/**
 * Next target for one exercise (SPEC §5.2).
 * - double: all working sets at the top of the range with RIR ≤ target → add weight, back to
 *   the bottom of the range; otherwise same weight, one more rep on the weakest set.
 * - fixed: all sets hit the reps → add weight; otherwise repeat.
 * - rir: pick the weight that should leave `targetRir` reps in reserve, via the e1RM.
 */
export function suggestNext(input: ProgressionInput): Suggestion {
  const working = input.previousSets.filter((s) => s.completed && s.type !== 'warmup')
  const { repMin, repMax, targetRir, incrementKg } = input
  if (working.length === 0) {
    return { weightKg: null, repMin, repMax, reason: 'first_time', previous: null }
  }

  const topWeight = Math.max(...working.map((s) => s.weightKg ?? 0))
  const topSets = working.filter((s) => (s.weightKg ?? 0) === topWeight)
  const previous = {
    weightKg: topWeight,
    reps: topSets.map((s) => s.reps ?? 0),
    rir: topSets.map((s) => s.rir),
  }

  const recent = input.recentE1rms ?? []
  const declining = recent.length >= 2 && recent.at(-1)! < recent.at(-2)!
  if (input.cutting && declining) {
    return { weightKg: topWeight, repMin, repMax, reason: 'cut_maintain', previous }
  }

  const effortOk = (s: WorkoutSet) => targetRir === null || s.rir === null || s.rir <= targetRir

  if (input.model === 'fixed') {
    const target = repMax ?? repMin ?? 0
    const allHit = topSets.every((s) => (s.reps ?? 0) >= target)
    return allHit
      ? { weightKg: topWeight + incrementKg, repMin, repMax, reason: 'fixed_increase', previous }
      : { weightKg: topWeight, repMin, repMax, reason: 'fixed_repeat', previous }
  }

  if (input.model === 'rir' && repMax !== null && targetRir !== null) {
    // Reps to failure = reps + RIR; e1RM from the best of these sets (Epley).
    const e1rm = Math.max(
      ...topSets.map((s) => topWeight * (1 + ((s.reps ?? 0) + (s.rir ?? 0)) / 30)),
    )
    const reps = Math.round(((repMin ?? repMax) + repMax) / 2)
    const weightKg = Math.max(0, roundTo(e1rm / (1 + (reps + targetRir) / 30), incrementKg))
    return { weightKg, repMin, repMax, reason: 'rir_adjust', previous }
  }

  const top = repMax ?? repMin
  const allAtTop = top !== null && topSets.every((s) => (s.reps ?? 0) >= top && effortOk(s))
  if (allAtTop) {
    return {
      weightKg: topWeight + incrementKg,
      repMin,
      repMax: repMax,
      reason: 'increase_weight',
      previous,
    }
  }
  return { weightKg: topWeight, repMin, repMax, reason: 'add_rep', previous }
}
