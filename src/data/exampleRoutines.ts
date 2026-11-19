import { newRoutineExercise } from '../domain/training/routineEdit'
import type { PlannedSet, Routine, RoutineExercise } from '../domain/training/types'

/**
 * Optional example routines (SPEC §4.3): clearly labelled, never forced, copied before use.
 * Balanced on purpose: rear delts, lengthened exercises (overhead triceps, incline curls,
 * seated leg curls, standing calves) and 10–20 weekly sets per muscle when done twice a week.
 */
function ex(
  id: string,
  exerciseId: string,
  compound: boolean,
  repMin: number,
  repMax: number,
  sets = 3,
): RoutineExercise {
  const base = newRoutineExercise(id, exerciseId, { compound, restSec: compound ? 150 : 90 })
  const work: PlannedSet = { type: 'working', repMin, repMax, rir: 2, weightKg: null }
  return {
    ...base,
    sets: [
      ...base.sets.filter((s) => s.type === 'warmup'),
      ...Array.from({ length: sets }, () => ({ ...work })),
    ],
  }
}

export const EXAMPLE_ROUTINES: Routine[] = [
  {
    id: 'example-push',
    name: 'Push',
    color: 'red',
    folder: 'Push/Pull/Legs',
    example: true,
    exercises: [
      ex('ep1', 'Barbell_Bench_Press_-_Medium_Grip', true, 6, 10),
      ex('ep2', 'Incline_Dumbbell_Press', true, 8, 12),
      ex('ep3', 'Dumbbell_Shoulder_Press', true, 8, 12, 2),
      ex('ep4', 'Cable_Seated_Lateral_Raise', false, 12, 15),
      ex('ep5', 'Cable_Rope_Overhead_Triceps_Extension', false, 10, 15),
      ex('ep6', 'Triceps_Pushdown_-_Rope_Attachment', false, 12, 15, 2),
    ],
  },
  {
    id: 'example-pull',
    name: 'Pull',
    color: 'blue',
    folder: 'Push/Pull/Legs',
    example: true,
    exercises: [
      ex('el1', 'Wide-Grip_Lat_Pulldown', true, 8, 12),
      ex('el2', 'Seated_Cable_Rows', true, 8, 12),
      ex('el3', 'One-Arm_Dumbbell_Row', true, 8, 12, 2),
      ex('el4', 'Face_Pull', false, 12, 15),
      ex('el5', 'Incline_Dumbbell_Curl', false, 10, 12),
      ex('el6', 'Hammer_Curls', false, 10, 12, 2),
    ],
  },
  {
    id: 'example-legs',
    name: 'Legs',
    color: 'green',
    folder: 'Push/Pull/Legs',
    example: true,
    exercises: [
      ex('eg1', 'Barbell_Squat', true, 6, 10),
      ex('eg2', 'Romanian_Deadlift', true, 8, 12),
      ex('eg3', 'Leg_Press', true, 10, 15),
      ex('eg4', 'Seated_Leg_Curl', false, 10, 15),
      ex('eg5', 'Leg_Extensions', false, 12, 15, 2),
      ex('eg6', 'Standing_Calf_Raises', false, 10, 15),
    ],
  },
]
