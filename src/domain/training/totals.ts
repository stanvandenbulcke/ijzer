import { estimateOneRepMax } from '../strength/e1rm'
import type { Exercise, Performance, Workout } from './types'
import { workoutVolumeKg } from './performances'

export interface LifetimeTotals {
  workouts: number
  sets: number
  reps: number
  tonnageKg: number
  minutes: number
}

/** Everything you ever did, for the fun "your career" stats. Honest rules as everywhere. */
export function lifetimeTotals(
  workouts: Workout[],
  perfs: Performance[],
  typeOf: (id: string) => Exercise['type'] | undefined,
): LifetimeTotals {
  return {
    workouts: workouts.filter((w) => w.finishedAt).length,
    sets: perfs.length,
    reps: perfs.reduce((n, p) => n + (p.set.reps ?? 0), 0),
    tonnageKg: workouts.reduce((t, w) => t + workoutVolumeKg(w, typeOf), 0),
    minutes: workouts.reduce(
      (m, w) =>
        m + (w.finishedAt ? (Date.parse(w.finishedAt) - Date.parse(w.startedAt)) / 60_000 : 0),
      0,
    ),
  }
}

/** Things to compare a tonnage with, heaviest last (approximate weights in kg). */
export const COMPARISONS = [
  { id: 'piano', kg: 300 },
  { id: 'cow', kg: 700 },
  { id: 'car', kg: 1_300 },
  { id: 'elephant', kg: 6_000 },
  { id: 'bus', kg: 12_000 },
  { id: 'trex', kg: 8_000 },
  { id: 'whale', kg: 150_000 },
] as const

export type ComparisonId = (typeof COMPARISONS)[number]['id']

/** The largest thing that fits at least once, and how many times: "2,4 olifanten". */
export function compareTonnage(kg: number): { id: ComparisonId; times: number } | null {
  const fitting = [...COMPARISONS].sort((a, b) => a.kg - b.kg).filter((c) => kg >= c.kg)
  const best = fitting.at(-1)
  return best ? { id: best.id, times: Math.round((kg / best.kg) * 10) / 10 } : null
}

/** Best estimated 1RM per exercise, strongest first: the "record wall". */
export function recordWall(
  perfs: Performance[],
  limit = 6,
): Array<{ exerciseId: string; e1rm: number; day: string }> {
  const best = new Map<string, { e1rm: number; day: string }>()
  for (const p of perfs) {
    const e = estimateOneRepMax(p.set.weightKg ?? 0, p.set.reps ?? 0)
    if (e === null) continue
    const cur = best.get(p.exerciseId)
    if (!cur || e > cur.e1rm) best.set(p.exerciseId, { e1rm: e, day: p.day })
  }
  return [...best.entries()]
    .map(([exerciseId, v]) => ({ exerciseId, ...v }))
    .sort((a, b) => b.e1rm - a.e1rm)
    .slice(0, limit)
}
