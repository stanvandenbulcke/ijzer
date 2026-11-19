import { describe, expect, it } from 'vitest'
import { set } from './fixtures'
import { describeSet, proposeSet } from './proposals'

const previous = [set(40, 10, { type: 'warmup' }), set(80, 10), set(80, 9), set(80, 8)]

describe('proposeSet', () => {
  it('repeats the same set of last time when there is no suggestion', () => {
    expect(
      proposeSet({
        set: set(null, null, { completed: false }),
        indexOfType: 1,
        previousSets: previous,
        suggestion: null,
        earlierToday: undefined,
      }),
    ).toEqual({ weightKg: 80, reps: 9 })
  })

  it('uses the suggested weight and drops back to the bottom of the range after a weight increase', () => {
    const suggestion = {
      weightKg: 82.5,
      repMin: 8,
      repMax: 12,
      reason: 'increase_weight' as const,
      previous: null,
    }
    expect(
      proposeSet({
        set: set(null, null),
        indexOfType: 0,
        previousSets: previous,
        suggestion,
        earlierToday: undefined,
      }),
    ).toEqual({ weightKg: 82.5, reps: 8 })
  })

  it('adds one rep on the weakest set only for "add a rep"', () => {
    const suggestion = {
      weightKg: 80,
      repMin: 8,
      repMax: 12,
      reason: 'add_rep' as const,
      previous: null,
    }
    const at = (i: number) =>
      proposeSet({
        set: set(null, null),
        indexOfType: i,
        previousSets: previous,
        suggestion,
        earlierToday: undefined,
      }).reps
    expect([at(0), at(1), at(2)]).toEqual([10, 9, 9])
  })

  it('keeps what you typed and falls back to today or the target', () => {
    expect(
      proposeSet({
        set: set(85, null),
        indexOfType: 0,
        previousSets: [],
        suggestion: null,
        earlierToday: set(80, 7),
      }),
    ).toEqual({ weightKg: 85, reps: 7 })
    expect(
      proposeSet({
        set: set(null, null, { target: { repMin: 8, repMax: 12, rir: 2 } }),
        indexOfType: 0,
        previousSets: [],
        suggestion: null,
        earlierToday: undefined,
      }),
    ).toEqual({ weightKg: null, reps: 8 })
  })

  it('proposes warm-ups from the previous warm-ups', () => {
    expect(
      proposeSet({
        set: set(null, null, { type: 'warmup' }),
        indexOfType: 0,
        previousSets: previous,
        suggestion: null,
        earlierToday: undefined,
      }),
    ).toEqual({ weightKg: 40, reps: 10 })
  })
})

describe('describeSet', () => {
  it('formats weight × reps with optional RIR', () => {
    const f = (n: number) => String(n).replace('.', ',')
    expect(describeSet({ weightKg: 82.5, reps: 8, rir: 2 }, f)).toBe('82,5 × 8 @2')
    expect(describeSet({ weightKg: 80, reps: 8, rir: null }, f)).toBe('80 × 8')
  })
})
