import type { PlannedSet, Routine, RoutineExercise, SetType } from './types'

/**
 * Pure helpers for the routine builder. The builder edits sets "as a group" (number of
 * warm-ups and working sets, one rep range) and per set only for the type (drop/failure).
 */

export function blankRoutine(id: string): Routine {
  return { id, name: '', color: 'yellow', folder: null, exercises: [] }
}

const plan = (
  type: SetType,
  repMin: number | null,
  repMax: number | null,
  rir: number | null,
): PlannedSet => ({
  type,
  repMin,
  repMax,
  rir,
  weightKg: null,
})

export function newRoutineExercise(
  id: string,
  exerciseId: string,
  options: { compound: boolean; restSec: number },
): RoutineExercise {
  const [repMin, repMax] = options.compound ? [6, 10] : [10, 15]
  return {
    id,
    exerciseId,
    restSec: options.restSec,
    progression: 'double',
    incrementKg: null,
    note: '',
    supersetGroup: null,
    sets: [
      ...(options.compound ? [plan('warmup', 8, 8, null)] : []),
      plan('working', repMin, repMax, 2),
      plan('working', repMin, repMax, 2),
      plan('working', repMin, repMax, 2),
    ],
  }
}

export const workingSets = (e: RoutineExercise) => e.sets.filter((s) => s.type !== 'warmup')
export const warmupSets = (e: RoutineExercise) => e.sets.filter((s) => s.type === 'warmup')

/** Warm-ups first, then working sets; keeps the types of existing sets where possible. */
export function setCounts(e: RoutineExercise, warmups: number, working: number): RoutineExercise {
  const w = warmupSets(e)
  const k = workingSets(e)
  const template = k[0] ?? plan('working', 8, 12, 2)
  const nextWarm = Array.from(
    { length: Math.max(0, warmups) },
    (_, i) => w[i] ?? plan('warmup', 8, 8, null),
  )
  const nextWork = Array.from(
    { length: Math.max(1, working) },
    (_, i) => k[i] ?? { ...template, type: 'working' as const },
  )
  return { ...e, sets: [...nextWarm, ...nextWork] }
}

/** One rep range and target RIR for all non-warm-up sets. */
export function applyTargets(
  e: RoutineExercise,
  changes: { repMin?: number | null; repMax?: number | null; rir?: number | null },
): RoutineExercise {
  return { ...e, sets: e.sets.map((s) => (s.type === 'warmup' ? s : { ...s, ...changes })) }
}

const TYPE_CYCLE: SetType[] = ['working', 'drop', 'failure']

/** Tapping a working set's type cycles werkset → dropset → tot falen. */
export function cycleSetType(e: RoutineExercise, index: number): RoutineExercise {
  return {
    ...e,
    sets: e.sets.map((s, i) => {
      if (i !== index || s.type === 'warmup') return s
      return { ...s, type: TYPE_CYCLE[(TYPE_CYCLE.indexOf(s.type) + 1) % TYPE_CYCLE.length]! }
    }),
  }
}

export function moveExercise(routine: Routine, index: number, delta: -1 | 1): Routine {
  const target = index + delta
  if (target < 0 || target >= routine.exercises.length) return routine
  const exercises = [...routine.exercises]
  ;[exercises[index], exercises[target]] = [exercises[target]!, exercises[index]!]
  return { ...routine, exercises }
}

/**
 * Links an exercise with the next one in a superset, or unlinks it. A group of one is
 * dissolved, so there are never "supersets" of a single exercise.
 */
export function toggleSupersetWithNext(
  routine: Routine,
  index: number,
  newGroupId: () => string,
): Routine {
  const current = routine.exercises[index]
  const next = routine.exercises[index + 1]
  if (!current || !next) return routine
  const linked = current.supersetGroup !== null && current.supersetGroup === next.supersetGroup
  const exercises = routine.exercises.map((e) => ({ ...e }))
  if (linked) {
    exercises[index + 1]!.supersetGroup = null
  } else {
    const group = current.supersetGroup ?? next.supersetGroup ?? newGroupId()
    exercises[index]!.supersetGroup = group
    exercises[index + 1]!.supersetGroup = group
  }
  // Dissolve groups with a single member.
  const counts = new Map<string, number>()
  for (const e of exercises)
    if (e.supersetGroup) counts.set(e.supersetGroup, (counts.get(e.supersetGroup) ?? 0) + 1)
  for (const e of exercises)
    if (e.supersetGroup && counts.get(e.supersetGroup) === 1) e.supersetGroup = null
  return { ...routine, exercises }
}

export function duplicateExercise(routine: Routine, index: number, newId: () => string): Routine {
  const source = routine.exercises[index]
  if (!source) return routine
  const copy = {
    ...source,
    id: newId(),
    supersetGroup: null,
    sets: source.sets.map((s) => ({ ...s })),
  }
  const exercises = [...routine.exercises]
  exercises.splice(index + 1, 0, copy)
  return { ...routine, exercises }
}

/** Number of non-warm-up sets of a routine. */
export function totalWorkingSets(routine: Routine): number {
  return routine.exercises.reduce((n, e) => n + workingSets(e).length, 0)
}

/**
 * "Routine bijwerken met wat je vandaag deed?" (SPEC §4.4): substitutes replace the original
 * exercise, exercises added today are appended, skipped ones stay in the routine (skipping
 * once is no reason to drop them). Returns null when nothing changed.
 */
export function routineFromWorkout(
  routine: Routine,
  workout: {
    exercises: Array<{
      id: string
      exerciseId: string
      status: string
      substitutedBy: string | null
      routineExerciseId: string | null
      restSec: number
      sets: Array<{
        type: SetType
        target: { repMin: number | null; repMax: number | null; rir: number | null } | null
      }>
    }>
  },
  newId: () => string,
): Routine | null {
  let changed = false
  const exercises: RoutineExercise[] = routine.exercises.map((re) => {
    const original = workout.exercises.find((e) => e.routineExerciseId === re.id)
    if (original?.status === 'substituted' && original.substitutedBy) {
      const replacement = workout.exercises.find((e) => e.id === original.substitutedBy)
      if (replacement) {
        changed = true
        return { ...re, exerciseId: replacement.exerciseId }
      }
    }
    return re
  })
  const replacementIds = new Set(workout.exercises.map((e) => e.substitutedBy).filter(Boolean))
  for (const e of workout.exercises) {
    if (e.routineExerciseId || replacementIds.has(e.id) || e.status === 'skipped') continue
    changed = true
    exercises.push({
      id: newId(),
      exerciseId: e.exerciseId,
      restSec: e.restSec,
      progression: 'double',
      incrementKg: null,
      note: '',
      supersetGroup: null,
      sets: e.sets.map((s) => ({
        type: s.type,
        repMin: s.target?.repMin ?? null,
        repMax: s.target?.repMax ?? null,
        rir: s.target?.rir ?? null,
        weightKg: null,
      })),
    })
  }
  return changed ? { ...routine, exercises } : null
}
