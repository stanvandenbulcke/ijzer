import type { WorkoutSet } from './types'

export interface GhostResult {
  /** Work done so far today (kg × reps of completed working sets; reps for bodyweight). */
  now: number
  /** Work done last time after the same number of sets. */
  then: number
  delta: number
  /** Completed working sets so far today. */
  sets: number
}

const work = (s: WorkoutSet, byReps: boolean) =>
  byReps ? (s.reps ?? 0) : (s.weightKg ?? 0) * (s.reps ?? 0)
const working = (sets: WorkoutSet[]) => sets.filter((s) => s.completed && s.type !== 'warmup')

/**
 * "Race tegen jezelf" (ghost of last time): after n working sets today, compare with the first
 * n working sets of last time. Bodyweight exercises (no load) race on reps. Null when there is
 * nothing to race against yet.
 */
export function ghostForExercise(today: WorkoutSet[], previous: WorkoutSet[]): GhostResult | null {
  const done = working(today)
  const before = working(previous)
  if (done.length === 0 || before.length === 0) return null
  const byReps = [...done, ...before].every((s) => !s.weightKg)
  const now = done.reduce((t, s) => t + work(s, byReps), 0)
  const then = before.slice(0, done.length).reduce((t, s) => t + work(s, byReps), 0)
  return { now, then, delta: now - then, sets: done.length }
}

/** The whole session: sum of the per-exercise races (only exercises with a ghost count). */
export function ghostForSession(races: Array<GhostResult | null>): GhostResult | null {
  const valid = races.filter((r): r is GhostResult => r !== null)
  if (valid.length === 0) return null
  const now = valid.reduce((t, r) => t + r.now, 0)
  const then = valid.reduce((t, r) => t + r.then, 0)
  return { now, then, delta: now - then, sets: valid.reduce((t, r) => t + r.sets, 0) }
}
