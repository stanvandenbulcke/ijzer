import { emptyWorkout, startFromRoutine } from '../domain/training/workoutOps'
import type { Routine } from '../domain/training/types'
import type { WorkoutRow } from './db'
import { newId, now } from './rows'
import { getActiveWorkout, saveWorkout } from './workoutsRepo'

/**
 * Starts a workout from a routine (or empty). There is only ever one active workout:
 * if one is running, that one is returned instead of starting a second.
 */
export async function startWorkout(
  routine: Routine | null,
  emptyName: string,
): Promise<WorkoutRow> {
  const active = await getActiveWorkout()
  if (active) return active
  const workout = routine
    ? startFromRoutine(routine, now(), newId)
    : emptyWorkout(newId(), now(), emptyName)
  return saveWorkout(workout)
}
