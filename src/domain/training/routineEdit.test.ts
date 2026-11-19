import { describe, expect, it } from 'vitest'
import {
  applyTargets,
  blankRoutine,
  cycleSetType,
  duplicateExercise,
  moveExercise,
  newRoutineExercise,
  setCounts,
  toggleSupersetWithNext,
  totalWorkingSets,
} from './routineEdit'

let n = 0
const id = () => `x${++n}`

const routine = {
  ...blankRoutine('r'),
  exercises: [
    newRoutineExercise('a', 'bench', { compound: true, restSec: 150 }),
    newRoutineExercise('b', 'fly', { compound: false, restSec: 90 }),
    newRoutineExercise('c', 'pushdown', { compound: false, restSec: 90 }),
  ],
}

describe('new exercises', () => {
  it('gives compounds a warm-up and a lower rep range', () => {
    const [bench, fly] = routine.exercises
    expect(bench!.sets.map((s) => s.type)).toEqual(['warmup', 'working', 'working', 'working'])
    expect(bench!.sets[1]).toMatchObject({ repMin: 6, repMax: 10, rir: 2 })
    expect(fly!.sets.map((s) => s.type)).toEqual(['working', 'working', 'working'])
    expect(totalWorkingSets(routine)).toBe(9)
  })
})

describe('set counts and targets', () => {
  it('changes warm-up and working counts, keeping at least one working set', () => {
    const e = routine.exercises[0]!
    expect(setCounts(e, 2, 4).sets.map((s) => s.type)).toEqual([
      'warmup',
      'warmup',
      'working',
      'working',
      'working',
      'working',
    ])
    expect(setCounts(e, 0, 0).sets.map((s) => s.type)).toEqual(['working'])
  })

  it('applies one rep range to all non-warm-up sets', () => {
    const e = applyTargets(routine.exercises[0]!, { repMin: 5, repMax: 5, rir: 1 })
    expect(e.sets[0]).toMatchObject({ type: 'warmup', repMin: 8 })
    expect(e.sets.slice(1).every((s) => s.repMin === 5 && s.repMax === 5 && s.rir === 1)).toBe(true)
  })

  it('cycles a working set through drop set and failure, never touching warm-ups', () => {
    let e = routine.exercises[0]!
    e = cycleSetType(e, 3)
    expect(e.sets[3]!.type).toBe('drop')
    e = cycleSetType(cycleSetType(e, 3), 3)
    expect(e.sets[3]!.type).toBe('working')
    expect(cycleSetType(e, 0).sets[0]!.type).toBe('warmup')
  })
})

describe('order, supersets and duplicates', () => {
  it('moves within bounds', () => {
    expect(moveExercise(routine, 0, 1).exercises.map((e) => e.id)).toEqual(['b', 'a', 'c'])
    expect(moveExercise(routine, 0, -1)).toBe(routine)
  })

  it('links and unlinks supersets, dissolving groups of one', () => {
    const linked = toggleSupersetWithNext(routine, 1, id)
    const [, b, c] = linked.exercises
    expect(b!.supersetGroup).not.toBeNull()
    expect(b!.supersetGroup).toBe(c!.supersetGroup)
    const unlinked = toggleSupersetWithNext(linked, 1, id)
    expect(unlinked.exercises.every((e) => e.supersetGroup === null)).toBe(true)
  })

  it('duplicates an exercise right after itself with a new id', () => {
    const d = duplicateExercise(routine, 0, id)
    expect(d.exercises.map((e) => e.exerciseId)).toEqual(['bench', 'bench', 'fly', 'pushdown'])
    expect(d.exercises[1]!.id).not.toBe('a')
  })
})

describe('routineFromWorkout', () => {
  it('swaps substitutes in, appends added exercises and keeps skipped ones', async () => {
    const { routineFromWorkout } = await import('./routineEdit')
    const { startFromRoutine, substituteExercise, addExercise, skipExercise } =
      await import('./workoutOps')
    let w = startFromRoutine(routine, '2026-11-19T17:00:00Z', id)
    w = substituteExercise(w, w.exercises[0]!.id, 'db-bench', id)
    w = skipExercise(w, w.exercises.find((e) => e.exerciseId === 'fly')!.id, 'busy')
    w = addExercise(w, { id: 'lateral' }, { newId: id, restSec: 90 })
    const updated = routineFromWorkout(routine, w, id)!
    expect(updated.exercises.map((e) => e.exerciseId)).toEqual([
      'db-bench',
      'fly',
      'pushdown',
      'lateral',
    ])
    expect(updated.exercises[0]!.sets).toEqual(routine.exercises[0]!.sets)
  })

  it('returns null when the workout followed the routine', async () => {
    const { routineFromWorkout } = await import('./routineEdit')
    const { startFromRoutine } = await import('./workoutOps')
    expect(
      routineFromWorkout(routine, startFromRoutine(routine, '2026-11-19T17:00:00Z', id), id),
    ).toBeNull()
  })
})
