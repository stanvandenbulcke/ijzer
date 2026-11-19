import { estimateOneRepMax } from '../strength/e1rm'
import type { Performance, WorkoutSet } from './types'

export interface SeriesPoint {
  day: string
  value: number
}

export interface SessionSummary {
  workoutId: string
  day: string
  sets: WorkoutSet[]
  bestSet: WorkoutSet
  bestE1rm: number | null
  volume: number
}

/** Groups performances of ONE exercise per workout, oldest first. */
export function sessions(perfs: Performance[]): SessionSummary[] {
  const byWorkout = new Map<string, Performance[]>()
  for (const p of perfs) byWorkout.set(p.workoutId, [...(byWorkout.get(p.workoutId) ?? []), p])
  return [...byWorkout.entries()].map(([workoutId, list]) => {
    const sets = list.map((p) => p.set)
    const e1rms = sets.map((s) => estimateOneRepMax(s.weightKg ?? 0, s.reps ?? 0))
    const best = Math.max(...e1rms.map((e) => e ?? 0))
    const bestSet = [...sets].sort(
      (a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? 0) - (a.reps ?? 0),
    )[0]!
    return {
      workoutId,
      day: list[0]!.day,
      sets,
      bestSet,
      bestE1rm: best > 0 ? best : null,
      volume: sets.reduce((v, s) => v + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    }
  })
}

/**
 * Best e1RM per session (SPEC §4.8). Sessions with only sets above 12 reps have no
 * trustworthy e1RM and are left out: a gap, not a zero.
 */
export function e1rmSeries(perfs: Performance[]): SeriesPoint[] {
  // Two sessions on one day become one point (the best), so a chart never draws a vertical line.
  const byDay = new Map<string, number>()
  for (const s of sessions(perfs)) {
    if (s.bestE1rm === null) continue
    byDay.set(s.day, Math.max(byDay.get(s.day) ?? 0, Math.round(s.bestE1rm * 10) / 10))
  }
  return [...byDay.entries()].map(([day, value]) => ({ day, value }))
}

/** Best e1RM per session, newest last; used by stagnation and progression rules. */
export function recentBestE1rms(perfs: Performance[], count: number): number[] {
  return e1rmSeries(perfs)
    .slice(-count)
    .map((p) => p.value)
}
