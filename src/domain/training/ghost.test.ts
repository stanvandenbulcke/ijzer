import { describe, expect, it } from 'vitest'
import { set } from './fixtures'
import { ghostForExercise, ghostForSession } from './ghost'

const last = [set(40, 10, { type: 'warmup' }), set(80, 8), set(80, 8), set(80, 6)]

describe('ghostForExercise', () => {
  it('compares the same number of working sets as done today', () => {
    expect(ghostForExercise([set(82.5, 8)], last)).toEqual({
      now: 660,
      then: 640,
      delta: 20,
      sets: 1,
    })
    expect(ghostForExercise([set(82.5, 8), set(82.5, 6)], last)).toEqual({
      now: 1155,
      then: 1280,
      delta: -125,
      sets: 2,
    })
  })

  it('ignores warm-ups and unticked sets, and races on reps without load', () => {
    expect(ghostForExercise([set(82.5, 8, { completed: false })], last)).toBeNull()
    expect(ghostForExercise([set(0, 12)], [set(0, 10), set(0, 9)])).toEqual({
      now: 12,
      then: 10,
      delta: 2,
      sets: 1,
    })
  })

  it('has no ghost the first time or when today has more sets than last time', () => {
    expect(ghostForExercise([set(80, 8)], [])).toBeNull()
    const extra = ghostForExercise([set(80, 8), set(80, 8), set(80, 8), set(80, 8)], last)!
    expect(extra.then).toBe(1760)
  })
})

describe('ghostForSession', () => {
  it('sums the exercises that have a ghost', () => {
    expect(
      ghostForSession([
        { now: 660, then: 640, delta: 20, sets: 1 },
        null,
        { now: 100, then: 150, delta: -50, sets: 1 },
      ]),
    ).toEqual({
      now: 760,
      then: 790,
      delta: -30,
      sets: 2,
    })
    expect(ghostForSession([null])).toBeNull()
  })
})
