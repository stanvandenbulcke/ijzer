import type { MuscleId } from '../muscles/taxonomy'

/** How a set is measured (SPEC §4.2 custom exercises). */
export type ExerciseType = 'weight_reps' | 'bodyweight_reps' | 'assisted' | 'time' | 'distance'

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'ez_bar'
  | 'other'

/** 1 = trained directly, 0.5 = indirectly (fractional sets, SPEC §5.3). */
export type MuscleWeight = 1 | 0.5

export interface Exercise {
  id: string
  name: string
  equipment: Equipment
  type: ExerciseType
  unilateral: boolean
  muscles: Array<{ muscle: MuscleId; weight: MuscleWeight }>
  /** Trains the muscle at long length (SPEC Bijlage A6). */
  lengthened: boolean
  mechanic: 'compound' | 'isolation' | null
  quality: 'curated' | 'auto' | 'custom'
  aliases: string[]
  instructions: string[]
  /** Global exercises have two photos; custom ones may have none. */
  hasImages: boolean
  custom: boolean
}

export type SetType = 'warmup' | 'working' | 'drop' | 'failure'

export type ProgressionModel = 'double' | 'fixed' | 'rir'

export interface PlannedSet {
  type: SetType
  repMin: number | null
  repMax: number | null
  rir: number | null
  weightKg: number | null
}

export interface RoutineExercise {
  id: string
  exerciseId: string
  sets: PlannedSet[]
  restSec: number
  progression: ProgressionModel
  /** Smallest weight step for this exercise; null = from equipment settings. */
  incrementKg: number | null
  note: string
  /** Exercises sharing a group id form a superset. */
  supersetGroup: string | null
}

export type RoutineColor = 'yellow' | 'red' | 'blue' | 'green' | 'white'

export interface Routine {
  id: string
  name: string
  color: RoutineColor
  folder: string | null
  exercises: RoutineExercise[]
  /** True for example routines that can be copied. */
  example?: boolean
}

export interface WorkoutSet {
  id: string
  type: SetType
  /** kg. For bodyweight exercises: extra load; for assisted: assistance. */
  weightKg: number | null
  reps: number | null
  rir: number | null
  seconds: number | null
  meters: number | null
  /** Only completed sets exist as a performance (SPEC §4.4). */
  completed: boolean
  completedAt: string | null
  note: string
  pain: string | null
  /** Target from the routine, shown as the proposal. */
  target: { repMin: number | null; repMax: number | null; rir: number | null } | null
}

export type ExerciseStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'substituted'

export type SkipReason = 'busy' | 'time' | 'pain' | 'motivation' | 'other'

export interface WorkoutExercise {
  id: string
  exerciseId: string
  status: ExerciseStatus
  skipReason: SkipReason | null
  /** For status 'substituted': id of the WorkoutExercise that replaced this one. */
  substitutedBy: string | null
  sets: WorkoutSet[]
  restSec: number
  progression: ProgressionModel
  incrementKg: number | null
  note: string
  supersetGroup: string | null
  routineExerciseId: string | null
}

export interface Workout {
  id: string
  routineId: string | null
  name: string
  startedAt: string
  finishedAt: string | null
  exercises: WorkoutExercise[]
  feeling: 1 | 2 | 3 | 4 | 5 | null
  note: string
  /** Rest timer based on timestamps, so it is right even after the screen was off. */
  rest: { startedAt: string; durationSec: number } | null
}

/** A completed set as it counts in statistics, with its context. */
export interface Performance {
  workoutId: string
  exerciseId: string
  day: string
  finishedAt: string
  set: WorkoutSet
}
