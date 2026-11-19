import { suggestNext, type Suggestion } from '../strength/progression'
import { localDay } from '../time'
import { previousSession } from './performances'
import { proposeSet, type Proposal } from './proposals'
import { detectPRs, type PRKind } from './records'
import { recentBestE1rms } from './series'
import type { ExerciseType, Performance, Workout, WorkoutExercise, WorkoutSet } from './types'

export interface ExercisePlan {
  /** Completed sets of the last real session, for the "vorige" column. */
  previousSets: WorkoutSet[]
  suggestion: Suggestion | null
  /** Per set of this exercise (same order): what a one-tap tick logs. */
  proposals: Proposal[]
  /** Per set: records it broke (empty if none or not completed). */
  prKinds: PRKind[][]
  /** Per set: the matching set of last time, for the ghost text. */
  previousBySet: Array<WorkoutSet | null>
}

/**
 * Everything the workout screen needs for one exercise, computed from history.
 * `history` are the performances of this exercise in finished workouts.
 */
export function planExercise(params: {
  workout: Workout
  exercise: WorkoutExercise
  type: ExerciseType
  finishedWorkouts: Workout[]
  history: Performance[]
  incrementKg: number
  cutting: boolean
}): ExercisePlan {
  const { workout, exercise, type, finishedWorkouts, history, incrementKg, cutting } = params
  const previous = previousSession(finishedWorkouts, exercise.exerciseId, workout.startedAt)
  const previousSets = previous?.sets ?? []
  const firstTarget = exercise.sets.find((s) => s.type !== 'warmup')?.target ?? null

  const suggestion =
    type === 'weight_reps' || type === 'bodyweight_reps'
      ? suggestNext({
          model: exercise.progression,
          repMin: firstTarget?.repMin ?? null,
          repMax: firstTarget?.repMax ?? null,
          targetRir: firstTarget?.rir ?? null,
          incrementKg,
          previousSets,
          cutting,
          recentE1rms: recentBestE1rms(history, 3),
        })
      : null

  // Earlier completed sets of this same exercise today also count when looking for PRs.
  const today: Performance[] = []
  const counters: Record<string, number> = {}
  const proposals: Proposal[] = []
  const prKinds: PRKind[][] = []
  const previousBySet: Array<WorkoutSet | null> = []
  let lastDoneToday: WorkoutSet | undefined

  for (const set of exercise.sets) {
    const indexOfType = (counters[set.type] = (counters[set.type] ?? -1) + 1)
    const sameType = previousSets.filter((s) => s.type === set.type)
    previousBySet.push(sameType[indexOfType] ?? null)
    proposals.push(
      proposeSet({ set, indexOfType, previousSets, suggestion, earlierToday: lastDoneToday }),
    )
    prKinds.push(set.completed ? detectPRs([...history, ...today], set, type) : [])
    if (set.completed && set.type !== 'warmup') {
      today.push({
        workoutId: workout.id,
        exerciseId: exercise.exerciseId,
        day: localDay(workout.startedAt),
        finishedAt: '',
        set,
      })
      lastDoneToday = set
    }
  }
  return { previousSets, suggestion, proposals, prKinds, previousBySet }
}
