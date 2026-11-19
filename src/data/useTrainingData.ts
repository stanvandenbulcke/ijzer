import { useMemo } from 'react'
import { performances } from '../domain/training/performances'
import type { Performance } from '../domain/training/types'
import { useExerciseLibrary, type ExerciseLibrary } from './catalog'
import type { WorkoutRow } from './db'
import { useFinishedWorkouts } from './workoutsRepo'

export interface TrainingData {
  library: ExerciseLibrary
  /** Finished workouts, newest first. */
  workouts: WorkoutRow[]
  /** All counted sets (no warm-ups), oldest first. */
  perfs: Performance[]
  perfsOf: (exerciseId: string) => Performance[]
}

/** Library + history + performances, computed once per change. `undefined` while loading. */
export function useTrainingData(): TrainingData | null | undefined {
  const library = useExerciseLibrary()
  const workouts = useFinishedWorkouts()
  return useMemo(() => {
    if (library === null) return null
    if (!library || !workouts) return undefined
    const perfs = performances(workouts, { typeOf: (id) => library.byId(id)?.type })
    const byExercise = new Map<string, Performance[]>()
    for (const p of perfs)
      byExercise.set(p.exerciseId, [...(byExercise.get(p.exerciseId) ?? []), p])
    return { library, workouts, perfs, perfsOf: (id: string) => byExercise.get(id) ?? [] }
  }, [library, workouts])
}
