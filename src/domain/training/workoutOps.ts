import type {
  Exercise,
  PlannedSet,
  Routine,
  SetType,
  SkipReason,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from './types'

/**
 * Pure operations on a workout. The active-workout screen calls these and saves the result
 * to IndexedDB right away, so every change survives closing the app (SPEC §4.4).
 */

export type IdFn = () => string

function blankSet(id: string, type: SetType, plan?: PlannedSet): WorkoutSet {
  return {
    id,
    type,
    weightKg: plan?.weightKg ?? null,
    reps: null,
    rir: null,
    seconds: null,
    meters: null,
    completed: false,
    completedAt: null,
    note: '',
    pain: null,
    target: plan ? { repMin: plan.repMin, repMax: plan.repMax, rir: plan.rir } : null,
  }
}

export function emptyWorkout(id: string, startedAt: string, name: string): Workout {
  return {
    id,
    routineId: null,
    name,
    startedAt,
    finishedAt: null,
    exercises: [],
    feeling: null,
    note: '',
    rest: null,
  }
}

export function startFromRoutine(routine: Routine, startedAt: string, newId: IdFn): Workout {
  return {
    ...emptyWorkout(newId(), startedAt, routine.name),
    routineId: routine.id,
    exercises: routine.exercises.map((re) => ({
      id: newId(),
      exerciseId: re.exerciseId,
      status: 'pending',
      skipReason: null,
      substitutedBy: null,
      sets: re.sets.map((plan) => blankSet(newId(), plan.type, plan)),
      restSec: re.restSec,
      progression: re.progression,
      incrementKg: re.incrementKg,
      note: re.note,
      supersetGroup: re.supersetGroup,
      routineExerciseId: re.id,
    })),
  }
}

export function addExercise(
  workout: Workout,
  exercise: Pick<Exercise, 'id'>,
  options: { newId: IdFn; restSec: number; sets?: number },
): Workout {
  const added: WorkoutExercise = {
    id: options.newId(),
    exerciseId: exercise.id,
    status: 'pending',
    skipReason: null,
    substitutedBy: null,
    sets: Array.from({ length: options.sets ?? 3 }, () => blankSet(options.newId(), 'working')),
    restSec: options.restSec,
    progression: 'double',
    incrementKg: null,
    note: '',
    supersetGroup: null,
    routineExerciseId: null,
  }
  return { ...workout, exercises: [...workout.exercises, added] }
}

function mapExercise(
  workout: Workout,
  exerciseId: string,
  fn: (e: WorkoutExercise) => WorkoutExercise,
): Workout {
  return { ...workout, exercises: workout.exercises.map((e) => (e.id === exerciseId ? fn(e) : e)) }
}

function mapSet(
  workout: Workout,
  exerciseId: string,
  setId: string,
  fn: (s: WorkoutSet) => WorkoutSet,
): Workout {
  return mapExercise(workout, exerciseId, (e) => ({
    ...e,
    sets: e.sets.map((s) => (s.id === setId ? fn(s) : s)),
  }))
}

export function updateSet(
  workout: Workout,
  exerciseId: string,
  setId: string,
  changes: Partial<WorkoutSet>,
): Workout {
  return mapSet(workout, exerciseId, setId, (s) => ({ ...s, ...changes }))
}

/**
 * Ticks a set off with the given values and starts the rest timer.
 * Values come from the inputs or, for a one-tap check, from the proposal.
 */
export function completeSet(
  workout: Workout,
  exerciseId: string,
  setId: string,
  values: Partial<Pick<WorkoutSet, 'weightKg' | 'reps' | 'rir' | 'seconds' | 'meters'>>,
  now: string,
  restSec?: number,
): Workout {
  const done = mapSet(workout, exerciseId, setId, (s) => ({
    ...s,
    ...values,
    completed: true,
    completedAt: now,
  }))
  const withStatus = mapExercise(done, exerciseId, (e) => ({
    ...e,
    status: 'in_progress',
    skipReason: null,
  }))
  const rest = restSec ?? workout.exercises.find((e) => e.id === exerciseId)?.restSec ?? 0
  return rest > 0 ? { ...withStatus, rest: { startedAt: now, durationSec: rest } } : withStatus
}

export function uncompleteSet(workout: Workout, exerciseId: string, setId: string): Workout {
  return mapSet(workout, exerciseId, setId, (s) => ({ ...s, completed: false, completedAt: null }))
}

export function addSet(
  workout: Workout,
  exerciseId: string,
  newId: IdFn,
  type: SetType = 'working',
): Workout {
  return mapExercise(workout, exerciseId, (e) => {
    const last = [...e.sets].reverse().find((s) => s.type === type) ?? e.sets.at(-1)
    const set = blankSet(newId(), type)
    return { ...e, sets: [...e.sets, { ...set, target: last?.target ?? null }] }
  })
}

export function removeSet(workout: Workout, exerciseId: string, setId: string): Workout {
  return mapExercise(workout, exerciseId, (e) => ({
    ...e,
    sets: e.sets.filter((s) => s.id !== setId),
  }))
}

/** "Overslaan": the exercise will count nowhere (SPEC §4.4). */
export function skipExercise(
  workout: Workout,
  exerciseId: string,
  reason: SkipReason | null,
): Workout {
  return mapExercise(workout, exerciseId, (e) => ({ ...e, status: 'skipped', skipReason: reason }))
}

/** Undo a skip: back to pending, or in progress if sets were already done. */
export function unskipExercise(workout: Workout, exerciseId: string): Workout {
  return mapExercise(workout, exerciseId, (e) => ({
    ...e,
    status: e.sets.some((s) => s.completed) ? 'in_progress' : 'pending',
    skipReason: null,
  }))
}

/** "Later doen": move to the end of the queue, e.g. when the machine is taken. */
export function moveToEnd(workout: Workout, exerciseId: string): Workout {
  const target = workout.exercises.find((e) => e.id === exerciseId)
  if (!target) return workout
  return {
    ...workout,
    exercises: [...workout.exercises.filter((e) => e.id !== exerciseId), target],
  }
}

/**
 * "Vervangen": the original gets status 'substituted' with a link to the replacement, which
 * takes over its place and set plan. Completed sets of the original stay with the original.
 */
export function substituteExercise(
  workout: Workout,
  exerciseId: string,
  replacementId: string,
  newId: IdFn,
): Workout {
  const index = workout.exercises.findIndex((e) => e.id === exerciseId)
  const original = workout.exercises[index]
  if (!original) return workout
  const replacement: WorkoutExercise = {
    ...original,
    id: newId(),
    exerciseId: replacementId,
    status: 'pending',
    skipReason: null,
    substitutedBy: null,
    sets: original.sets.map((s) => ({ ...blankSet(newId(), s.type), target: s.target })),
  }
  const exercises = [...workout.exercises]
  exercises.splice(
    index,
    1,
    { ...original, status: 'substituted', substitutedBy: replacement.id },
    replacement,
  )
  return { ...workout, exercises }
}

/**
 * Ends the workout. Exercises with at least one completed set are 'completed'; the rest are
 * 'skipped' (also when ending early), except substituted ones which keep their status.
 */
export function finishWorkout(workout: Workout, now: string): Workout {
  return {
    ...workout,
    finishedAt: now,
    rest: null,
    exercises: workout.exercises.map((e) => {
      if (e.status === 'substituted') return e
      if (e.sets.some((s) => s.completed)) return { ...e, status: 'completed' }
      return { ...e, status: 'skipped' }
    }),
  }
}

/** Seconds of rest left, from timestamps (correct even after the screen was off). */
export function restRemaining(workout: Workout, nowMs: number): number | null {
  if (!workout.rest) return null
  const end = Date.parse(workout.rest.startedAt) + workout.rest.durationSec * 1000
  return Math.max(0, Math.ceil((end - nowMs) / 1000))
}

export function adjustRest(workout: Workout, deltaSec: number): Workout {
  if (!workout.rest) return workout
  return {
    ...workout,
    rest: { ...workout.rest, durationSec: Math.max(0, workout.rest.durationSec + deltaSec) },
  }
}

export function clearRest(workout: Workout): Workout {
  return { ...workout, rest: null }
}

/** The exercise to show first: the first one that is not done, skipped or substituted. */
export function currentExerciseId(workout: Workout): string | null {
  const open = workout.exercises.find(
    (e) =>
      (e.status === 'pending' || e.status === 'in_progress') && e.sets.some((s) => !s.completed),
  )
  return open?.id ?? null
}

/** Inserts warm-up sets (from the warm-up calculator) before the working sets. */
export function insertWarmups(
  workout: Workout,
  exerciseId: string,
  warmups: Array<{ weightKg: number; reps: number }>,
  newId: IdFn,
): Workout {
  return mapExercise(workout, exerciseId, (e) => ({
    ...e,
    sets: [
      ...warmups.map((w) => ({
        ...blankSet(newId(), 'warmup'),
        weightKg: w.weightKg,
        reps: w.reps,
      })),
      ...e.sets.filter((s) => s.type !== 'warmup' || s.completed),
    ],
  }))
}

/** Removes an exercise that was added by mistake. Only allowed without completed sets. */
export function removeExercise(workout: Workout, exerciseId: string): Workout {
  const target = workout.exercises.find((e) => e.id === exerciseId)
  if (!target || target.sets.some((s) => s.completed)) return workout
  return { ...workout, exercises: workout.exercises.filter((e) => e.id !== exerciseId) }
}
