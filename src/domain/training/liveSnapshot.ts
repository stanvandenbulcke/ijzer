import type { Workout } from './types'

/**
 * What a linked buddy sees live while you train (Stan chose: exercise, kg and reps). Built from
 * the running workout with the same honesty rules as everywhere: only ticked sets, skipped and
 * replaced exercises are marked, never shown as zeros.
 */
export interface LiveSet {
  kg: number | null
  reps: number | null
  seconds: number | null
  meters: number | null
  warmup: boolean
}

export interface LiveExercise {
  name: string
  state: 'doing' | 'skipped' | 'replaced'
  sets: LiveSet[]
}

export interface LiveSnapshot {
  workoutName: string
  startedAt: string
  lastSetAt: string | null
  exercises: LiveExercise[]
}

export const LIVE_VERSION = 1

export function liveSnapshot(
  workout: Workout,
  nameOf: (exerciseId: string) => string,
): LiveSnapshot {
  let lastSetAt: string | null = null
  const exercises: LiveExercise[] = []
  for (const item of workout.exercises) {
    const done = item.sets.filter((s) => s.completed)
    for (const s of done)
      if (s.completedAt && (!lastSetAt || s.completedAt > lastSetAt)) lastSetAt = s.completedAt
    const state =
      item.status === 'skipped' ? 'skipped' : item.status === 'substituted' ? 'replaced' : 'doing'
    if (state === 'doing' && done.length === 0) continue
    exercises.push({
      name: nameOf(item.exerciseId),
      state,
      sets: done.map((s) => ({
        kg: s.weightKg,
        reps: s.reps,
        seconds: s.seconds,
        meters: s.meters,
        warmup: s.type === 'warmup',
      })),
    })
  }
  return { workoutName: workout.name, startedAt: workout.startedAt, lastSetAt, exercises }
}

/** The newest ticked set across the snapshot, for a one-line "now doing" strip. */
export function latestSet(snapshot: LiveSnapshot): { exercise: string; set: LiveSet } | null {
  for (let i = snapshot.exercises.length - 1; i >= 0; i--) {
    const ex = snapshot.exercises[i]!
    const set = ex.sets.at(-1)
    if (ex.state === 'doing' && set) return { exercise: ex.name, set }
  }
  return null
}

/** Pair channel name; must match public.pair_topic() in supabase/migrations. */
export function pairTopic(a: string, b: string): string {
  return a < b ? `pair:${a}:${b}` : `pair:${b}:${a}`
}
