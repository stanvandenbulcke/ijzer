import { now } from '../../../data/rows'
import type { TrainingData } from '../../../data/useTrainingData'
import type { Profile } from '../../../domain/profile/types'
import { incrementFor } from '../../../domain/profile/defaults'
import { planExercise, type ExercisePlan } from '../../../domain/training/exercisePlan'
import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from '../../../domain/training/types'
import * as ops from '../../../domain/training/workoutOps'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import type { PrMoment } from '../../../ui/celebration/PrCelebration'
import { playRecord, playSetDone, primeAudio } from './sounds'
import type { ValueEdit } from './ValueSheet'

const w = t.training.workout
const WARMUP_REST_SEC = 60

type Field = 'weight' | 'reps' | 'seconds' | 'meters'

interface Context {
  data: TrainingData
  profile: Profile
  plans: Map<string, ExercisePlan>
  apply: (change: (w: Workout) => Workout) => Workout | null
  setEdit: (edit: ValueEdit | null) => void
  setPrMoment: (moment: PrMoment) => void
}

/** Is everything needed to tick this set already typed in (not just proposed)? */
export function isFilled(set: WorkoutSet, type: Exercise['type']): boolean {
  if (set.completed) return false
  if (type === 'time') return set.seconds !== null && set.seconds > 0
  if (type === 'distance') return set.meters !== null && set.meters > 0
  if (type === 'weight_reps') return set.weightKg !== null && set.reps !== null
  return set.reps !== null
}

/**
 * Editing and ticking sets on the workout screen. When ✓ needs a value first, the keypad opens
 * and its "Klaar" ticks the set: what you typed is never left unchecked by surprise.
 */
export function setActions(ctx: Context) {
  const { data, profile, plans, apply, setEdit, setPrMoment } = ctx
  const exerciseOf = (item: WorkoutExercise) => data.library.byId(item.exerciseId)
  const incrementOf = (item: WorkoutExercise) =>
    item.incrementKg ?? incrementFor(exerciseOf(item)?.equipment ?? 'other', profile.equipment)

  /** Ticks a set with the given values: sound, rest timer, live PR detection, scroll on. */
  const complete = (
    item: WorkoutExercise,
    setId: string,
    values: Partial<Pick<WorkoutSet, 'weightKg' | 'reps'>>,
    options: { quiet?: boolean } = {},
  ) => {
    const set = item.sets.find((s) => s.id === setId)
    if (!set) return
    if (!options.quiet) {
      primeAudio()
      if (profile.settings.sounds) playSetDone()
    }
    const rest = options.quiet ? 0 : set.type === 'warmup' ? WARMUP_REST_SEC : item.restSec
    const next = apply((wk) => ops.completeSet(wk, item.id, setId, values, now(), rest))
    const updated = next?.exercises.find((e) => e.id === item.id)
    if (!next || !updated || options.quiet) return
    const ex = exerciseOf(item)
    const index = updated.sets.findIndex((s) => s.id === setId)
    const plan = planExercise({
      workout: next,
      exercise: updated,
      type: ex?.type ?? 'weight_reps',
      finishedWorkouts: data.workouts,
      history: data.perfsOf(item.exerciseId),
      incrementKg: incrementOf(item),
      cutting: profile.goal === 'cut',
    })
    const kinds = plan.prKinds[index] ?? []
    if (kinds.length > 0) {
      if (profile.settings.sounds) playRecord()
      const done = updated.sets[index]!
      setPrMoment({
        id: done.id,
        exercise: ex?.name ?? item.exerciseId,
        kind: w.prKinds[kinds[0]!],
        value:
          ex?.type === 'time'
            ? `${done.seconds ?? 0} s`
            : `${formatNumber(done.weightKg ?? 0, 2)} kg × ${done.reps ?? 0}`,
      })
    }
    // Last set of this exercise done: bring the next open exercise into view.
    if (updated.sets.every((s) => s.completed)) {
      const nextId = ops.currentExerciseId(next)
      if (nextId)
        window.setTimeout(
          () =>
            document
              .getElementById(`exercise-${nextId}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          250,
        )
    }
  }

  const openEdit = (
    item: WorkoutExercise,
    index: number,
    field: Field,
    andTick: { weightKg?: number | null } | null = null,
  ) => {
    const set = item.sets[index]!
    const plan = plans.get(item.id)!
    const proposal = plan.proposals[index]!
    const lastTime = plan.previousBySet[index]
    const before = [...item.sets.slice(0, index)].reverse().find((s) => s.completed)
    const ex = exerciseOf(item)
    const name = ex?.name ?? item.exerciseId
    const save = (changes: Partial<WorkoutSet>) =>
      apply((wk) => ops.updateSet(wk, item.id, set.id, changes))

    if (field === 'weight') {
      const quick = [
        before?.weightKg != null && { label: w.sameAsLastSet, value: before.weightKg },
        lastTime?.weightKg != null && { label: w.lastTime, value: lastTime.weightKg },
      ].filter(Boolean) as ValueEdit['quickValues']
      const bar =
        ex?.equipment === 'barbell'
          ? profile.equipment.barKg
          : ex?.equipment === 'ez_bar'
            ? 10
            : null
      setEdit({
        title: name,
        label: ex?.equipment === 'dumbbell' ? w.perDumbbell : w.columns.kg,
        value: set.weightKg ?? proposal.weightKg,
        unit: t.common.kg,
        step: incrementOf(item),
        maxDecimals: 2,
        quickValues: quick,
        plates: bar ? { barKg: bar, inventory: profile.equipment.plates } : undefined,
        onDone: (value) => {
          save({ weightKg: value })
          // Straight on to the reps of the same set: one sheet less per set.
          if (set.reps === null)
            openEdit(item, index, 'reps', andTick && value !== null ? { weightKg: value } : null)
          else if (andTick && value !== null)
            complete(item, set.id, { weightKg: value, reps: set.reps })
        },
      })
    } else if (field === 'reps') {
      const quick = [
        before?.reps != null && { label: w.sameAsLastSet, value: before.reps },
        lastTime?.reps != null && { label: w.lastTime, value: lastTime.reps },
      ].filter(Boolean) as ValueEdit['quickValues']
      setEdit({
        title: name,
        label: w.columns.reps,
        value: set.reps ?? proposal.reps,
        unit: t.common.reps,
        step: 1,
        maxDecimals: 0,
        quickValues: quick,
        rir: set.rir,
        onDone: (value, rir) => {
          save({ reps: value, rir: rir ?? null })
          if (andTick && value !== null) {
            const weightKg =
              andTick.weightKg ??
              set.weightKg ??
              proposal.weightKg ??
              (ex?.type === 'weight_reps' ? null : 0)
            if (weightKg !== null) complete(item, set.id, { weightKg, reps: value })
          }
        },
      })
    } else {
      const seconds = field === 'seconds'
      setEdit({
        title: name,
        label: seconds ? w.columns.sec : w.columns.m,
        value: (seconds ? set.seconds : set.meters) ?? null,
        unit: seconds ? 's' : 'm',
        step: seconds ? 5 : 10,
        maxDecimals: 0,
        quickValues: [],
        onDone: (value) => {
          save(seconds ? { seconds: value } : { meters: value })
          if (andTick && value !== null && value > 0)
            complete(item, set.id, { weightKg: set.weightKg ?? 0, reps: set.reps })
        },
      })
    }
  }

  const toggle = (item: WorkoutExercise, index: number) => {
    const set = item.sets[index]!
    if (set.completed) {
      apply((wk) => ops.uncompleteSet(wk, item.id, set.id))
      return
    }
    const type = exerciseOf(item)?.type ?? 'weight_reps'
    const proposal = plans.get(item.id)!.proposals[index]!
    if (type === 'time' && !set.seconds) return openEdit(item, index, 'seconds', {})
    if (type === 'distance' && !set.meters) return openEdit(item, index, 'meters', {})
    const weightKg = set.weightKg ?? proposal.weightKg ?? (type === 'weight_reps' ? null : 0)
    const reps = set.reps ?? proposal.reps
    if (type !== 'time' && type !== 'distance') {
      if (weightKg === null) return openEdit(item, index, 'weight', {})
      if (reps === null) return openEdit(item, index, 'reps', { weightKg })
    }
    complete(item, set.id, { weightKg, reps })
  }

  /** Ticks every set whose values were typed in but not ticked (from the finish sheet). */
  const tickFilled = (workout: Workout) => {
    for (const item of workout.exercises) {
      const type = exerciseOf(item)?.type ?? 'weight_reps'
      for (const set of item.sets)
        if (isFilled(set, type))
          complete(item, set.id, { weightKg: set.weightKg ?? 0, reps: set.reps }, { quiet: true })
    }
  }

  return { openEdit, toggle, tickFilled, exerciseOf, incrementOf }
}
