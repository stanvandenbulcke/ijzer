/** Small builders for tests. Not used by the app itself. */
import type { Workout, WorkoutExercise, WorkoutSet } from './types'

let counter = 0
const nextId = (prefix: string) => `${prefix}-${++counter}`

export function set(
  weightKg: number | null,
  reps: number | null,
  extra: Partial<WorkoutSet> = {},
): WorkoutSet {
  return {
    id: nextId('s'),
    type: 'working',
    weightKg,
    reps,
    rir: null,
    seconds: null,
    meters: null,
    completed: true,
    completedAt: null,
    note: '',
    pain: null,
    target: null,
    ...extra,
  }
}

export function exercise(
  exerciseId: string,
  sets: WorkoutSet[],
  extra: Partial<WorkoutExercise> = {},
): WorkoutExercise {
  return {
    id: nextId('we'),
    exerciseId,
    status: 'completed',
    skipReason: null,
    substitutedBy: null,
    sets,
    restSec: 120,
    progression: 'double',
    incrementKg: null,
    note: '',
    supersetGroup: null,
    routineExerciseId: null,
    ...extra,
  }
}

export function workout(
  startedAt: string,
  exercises: WorkoutExercise[],
  extra: Partial<Workout> = {},
): Workout {
  return {
    id: nextId('w'),
    routineId: null,
    name: 'Test',
    startedAt,
    finishedAt: startedAt,
    exercises,
    feeling: null,
    note: '',
    rest: null,
    ...extra,
  }
}
