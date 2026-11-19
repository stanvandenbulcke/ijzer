import { fractionalSets, type MuscleVolume } from '../volume/fractionalSets'
import { planExercise } from './exercisePlan'
import { completedSetCount, performances, wasPerformed, workoutVolumeKg } from './performances'
import type { PRKind } from './records'
import type { Exercise, Performance, Workout } from './types'

export interface WorkoutSummary {
  minutes: number
  sets: number
  volumeKg: number
  prs: Array<{ exerciseId: string; kind: PRKind; weightKg: number | null; reps: number | null }>
  muscles: MuscleVolume
  skipped: string[]
  /** Change in tonnage vs. the previous workout of the same routine, as a fraction. */
  volumeChange: number | null
}

/** Numbers for the screen after a workout (SPEC §4.4 "Na afloop"). */
export function summarizeWorkout(
  workout: Workout,
  allFinished: Workout[],
  byId: (id: string) => Exercise | undefined,
): WorkoutSummary {
  const typeOf = (id: string) => byId(id)?.type
  const earlier = allFinished.filter((w) => w.id !== workout.id && w.startedAt < workout.startedAt)
  const history = performances(earlier, { typeOf })
  const historyOf = new Map<string, Performance[]>()
  for (const p of history) historyOf.set(p.exerciseId, [...(historyOf.get(p.exerciseId) ?? []), p])

  const prs: WorkoutSummary['prs'] = []
  for (const item of workout.exercises) {
    if (!wasPerformed(item)) continue
    const plan = planExercise({
      workout,
      exercise: item,
      type: typeOf(item.exerciseId) ?? 'weight_reps',
      finishedWorkouts: earlier,
      history: historyOf.get(item.exerciseId) ?? [],
      incrementKg: 2.5,
      cutting: false,
    })
    plan.prKinds.forEach((kinds, i) => {
      const set = item.sets[i]!
      if (kinds[0])
        prs.push({
          exerciseId: item.exerciseId,
          kind: kinds[0],
          weightKg: set.weightKg,
          reps: set.reps,
        })
    })
  }

  const volumeKg = workoutVolumeKg(workout, typeOf)
  const previous = workout.routineId
    ? earlier
        .filter((w) => w.routineId === workout.routineId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
    : undefined
  const previousVolume = previous ? workoutVolumeKg(previous, typeOf) : 0

  return {
    minutes: workout.finishedAt
      ? (Date.parse(workout.finishedAt) - Date.parse(workout.startedAt)) / 60_000
      : 0,
    sets: completedSetCount(workout),
    volumeKg,
    prs,
    muscles: fractionalSets(performances([workout], { typeOf }), byId),
    skipped: workout.exercises.filter((e) => e.status === 'skipped').map((e) => e.exerciseId),
    volumeChange:
      previous && previousVolume > 0 ? (volumeKg - previousVolume) / previousVolume : null,
  }
}
