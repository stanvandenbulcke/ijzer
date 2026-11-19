import { localDay } from '../time'
import type { ExerciseType, Performance, Workout, WorkoutExercise, WorkoutSet } from './types'

/**
 * Skipped and substituted exercises never count as a performance (SPEC §4.4 "Regel voor
 * alle statistieken"). The substitute itself is a normal exercise and does count.
 */
export function wasPerformed(exercise: WorkoutExercise): boolean {
  return exercise.status !== 'skipped' && exercise.status !== 'substituted'
}

/** A completed set has the measurement its exercise type needs; otherwise it is not data. */
export function hasMeasurement(set: WorkoutSet, type: ExerciseType): boolean {
  switch (type) {
    case 'time':
      return (set.seconds ?? 0) > 0
    case 'distance':
      return (set.meters ?? 0) > 0
    default:
      return (set.reps ?? 0) > 0
  }
}

export interface PerformanceOptions {
  /** Warm-up sets never count for records or volume; set true only for "last time" values. */
  includeWarmups?: boolean
  typeOf?: (exerciseId: string) => ExerciseType | undefined
}

/**
 * Every completed set of finished workouts, oldest first. This is the single source for
 * charts, records, volume and suggestions, so the honesty rules live in one place.
 */
export function performances(workouts: Workout[], options: PerformanceOptions = {}): Performance[] {
  const result: Performance[] = []
  const finished = workouts
    .filter((w) => w.finishedAt !== null)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))

  for (const workout of finished) {
    const day = localDay(workout.startedAt)
    for (const exercise of workout.exercises) {
      if (!wasPerformed(exercise)) continue
      const type = options.typeOf?.(exercise.exerciseId) ?? 'weight_reps'
      for (const set of exercise.sets) {
        if (!set.completed || !hasMeasurement(set, type)) continue
        if (set.type === 'warmup' && !options.includeWarmups) continue
        result.push({
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          day,
          finishedAt: workout.finishedAt!,
          set,
        })
      }
    }
  }
  return result
}

export interface PreviousSession {
  workout: Workout
  sets: WorkoutSet[]
}

/**
 * The last finished workout in which the exercise was really done, before `beforeIso`.
 * "Vorige keer" always skips sessions where it was skipped or substituted.
 */
export function previousSession(
  workouts: Workout[],
  exerciseId: string,
  beforeIso?: string,
): PreviousSession | null {
  const candidates = workouts
    .filter((w) => w.finishedAt !== null && (!beforeIso || w.startedAt < beforeIso))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))

  for (const workout of candidates) {
    const sets = workout.exercises
      .filter((e) => e.exerciseId === exerciseId && wasPerformed(e))
      .flatMap((e) => e.sets.filter((s) => s.completed))
    if (sets.length > 0) return { workout, sets }
  }
  return null
}

/** Total tonnage (kg × reps) of completed, non-warm-up sets of weighted exercises. */
export function workoutVolumeKg(
  workout: Workout,
  typeOf: (exerciseId: string) => ExerciseType | undefined = () => 'weight_reps',
): number {
  let total = 0
  for (const exercise of workout.exercises) {
    if (!wasPerformed(exercise) || typeOf(exercise.exerciseId) !== 'weight_reps') continue
    for (const set of exercise.sets) {
      if (set.completed && set.type !== 'warmup') total += (set.weightKg ?? 0) * (set.reps ?? 0)
    }
  }
  return total
}

/** Number of completed non-warm-up sets in a workout. */
export function completedSetCount(workout: Workout): number {
  return workout.exercises
    .filter(wasPerformed)
    .reduce((n, e) => n + e.sets.filter((s) => s.completed && s.type !== 'warmup').length, 0)
}
