import { describe, expect, it } from 'vitest'
import { performances } from './performances'
import type { Routine } from './types'
import {
  addExercise,
  addSet,
  adjustRest,
  completeSet,
  currentExerciseId,
  emptyWorkout,
  finishWorkout,
  moveToEnd,
  restRemaining,
  skipExercise,
  startFromRoutine,
  substituteExercise,
  uncompleteSet,
  unskipExercise,
} from './workoutOps'

let n = 0
const newId = () => `id${++n}`
const T0 = '2026-11-19T17:00:00.000Z'

const routine: Routine = {
  id: 'push',
  name: 'Push A',
  color: 'yellow',
  folder: null,
  exercises: [
    {
      id: 're1',
      exerciseId: 'bench',
      restSec: 150,
      progression: 'double',
      incrementKg: null,
      note: 'stoel 4',
      supersetGroup: null,
      sets: [
        { type: 'warmup', repMin: 10, repMax: 10, rir: null, weightKg: 40 },
        { type: 'working', repMin: 8, repMax: 12, rir: 2, weightKg: null },
        { type: 'working', repMin: 8, repMax: 12, rir: 2, weightKg: null },
      ],
    },
    {
      id: 're2',
      exerciseId: 'fly',
      restSec: 90,
      progression: 'double',
      incrementKg: null,
      note: '',
      supersetGroup: null,
      sets: [{ type: 'working', repMin: 12, repMax: 15, rir: 1, weightKg: null }],
    },
  ],
}

const start = () => startFromRoutine(routine, T0, newId)

describe('starting', () => {
  it('copies the routine plan into pending exercises with targets', () => {
    const w = start()
    expect(w.routineId).toBe('push')
    expect(w.exercises.map((e) => [e.exerciseId, e.status, e.sets.length])).toEqual([
      ['bench', 'pending', 3],
      ['fly', 'pending', 1],
    ])
    expect(w.exercises[0]!.sets[0]).toMatchObject({
      type: 'warmup',
      weightKg: 40,
      completed: false,
    })
    expect(w.exercises[0]!.sets[1]!.target).toEqual({ repMin: 8, repMax: 12, rir: 2 })
    expect(w.exercises[0]!.note).toBe('stoel 4')
  })

  it('can start empty and add exercises', () => {
    const w = addExercise(
      emptyWorkout('w', T0, 'Vrije training'),
      { id: 'curl' },
      { newId, restSec: 90 },
    )
    expect(w.exercises[0]).toMatchObject({ exerciseId: 'curl', restSec: 90 })
    expect(w.exercises[0]!.sets).toHaveLength(3)
  })
})

describe('logging sets', () => {
  it('completes a set, marks the exercise in progress and starts the rest timer', () => {
    const w0 = start()
    const ex = w0.exercises[0]!
    const w = completeSet(w0, ex.id, ex.sets[1]!.id, { weightKg: 80, reps: 10 }, T0)
    expect(w.exercises[0]!.status).toBe('in_progress')
    expect(w.exercises[0]!.sets[1]).toMatchObject({
      weightKg: 80,
      reps: 10,
      completed: true,
      completedAt: T0,
    })
    expect(w.rest).toEqual({ startedAt: T0, durationSec: 150 })
  })

  it('computes rest from timestamps and allows ±15 s', () => {
    const w0 = start()
    const ex = w0.exercises[0]!
    const w = completeSet(w0, ex.id, ex.sets[1]!.id, { weightKg: 80, reps: 10 }, T0)
    const t = Date.parse(T0)
    expect(restRemaining(w, t + 60_000)).toBe(90)
    expect(restRemaining(w, t + 999_000)).toBe(0)
    expect(restRemaining(adjustRest(w, 15), t + 60_000)).toBe(105)
    expect(restRemaining(adjustRest(w, -999), t)).toBe(0)
  })

  it('can untick a set and add a set with the same target', () => {
    const w0 = start()
    const ex = w0.exercises[0]!
    const done = completeSet(w0, ex.id, ex.sets[1]!.id, { weightKg: 80, reps: 10 }, T0)
    expect(uncompleteSet(done, ex.id, ex.sets[1]!.id).exercises[0]!.sets[1]!.completed).toBe(false)
    const more = addSet(w0, ex.id, newId)
    expect(more.exercises[0]!.sets).toHaveLength(4)
    expect(more.exercises[0]!.sets[3]!.target).toEqual({ repMin: 8, repMax: 12, rir: 2 })
  })
})

describe('skip, later, substitute', () => {
  it('skips with a reason and can undo', () => {
    const w0 = start()
    const id = w0.exercises[1]!.id
    const skipped = skipExercise(w0, id, 'busy')
    expect(skipped.exercises[1]).toMatchObject({ status: 'skipped', skipReason: 'busy' })
    expect(unskipExercise(skipped, id).exercises[1]!.status).toBe('pending')
  })

  it('moves an exercise to the end of the queue', () => {
    const w0 = start()
    const w = moveToEnd(w0, w0.exercises[0]!.id)
    expect(w.exercises.map((e) => e.exerciseId)).toEqual(['fly', 'bench'])
    expect(currentExerciseId(w)).toBe(w.exercises[0]!.id)
  })

  it('substitutes: the original links to the replacement, which takes its place and plan', () => {
    const w0 = start()
    const w = substituteExercise(w0, w0.exercises[0]!.id, 'db-bench', newId)
    expect(w.exercises.map((e) => [e.exerciseId, e.status])).toEqual([
      ['bench', 'substituted'],
      ['db-bench', 'pending'],
      ['fly', 'pending'],
    ])
    expect(w.exercises[0]!.substitutedBy).toBe(w.exercises[1]!.id)
    expect(w.exercises[1]!.sets.map((s) => s.type)).toEqual(['warmup', 'working', 'working'])
    expect(currentExerciseId(w)).toBe(w.exercises[1]!.id)
  })
})

describe('finishing', () => {
  it('marks done exercises completed and the rest skipped, and nothing becomes a zero', () => {
    const w0 = start()
    const ex = w0.exercises[0]!
    const w1 = completeSet(w0, ex.id, ex.sets[1]!.id, { weightKg: 80, reps: 10 }, T0)
    const done = finishWorkout(w1, '2026-11-19T18:00:00.000Z')
    expect(done.finishedAt).toBe('2026-11-19T18:00:00.000Z')
    expect(done.rest).toBeNull()
    expect(done.exercises.map((e) => e.status)).toEqual(['completed', 'skipped'])
    // Only the one ticked set exists as a performance: no zeros for the rest.
    expect(performances([done]).map((p) => [p.exerciseId, p.set.weightKg, p.set.reps])).toEqual([
      ['bench', 80, 10],
    ])
  })

  it('keeps substituted exercises substituted', () => {
    const w0 = start()
    const sub = substituteExercise(w0, w0.exercises[0]!.id, 'db-bench', newId)
    expect(finishWorkout(sub, T0).exercises[0]!.status).toBe('substituted')
  })
})
