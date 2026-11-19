import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { performances } from './performances'
import { compareTonnage, lifetimeTotals, recordWall } from './totals'

const workouts = [
  workout(
    '2026-11-01T17:00:00Z',
    [
      exercise('bench', [set(80, 8), set(80, 8)]),
      exercise('curl', [set(15, 12)], { status: 'skipped' }),
    ],
    {
      finishedAt: '2026-11-01T18:00:00Z',
    },
  ),
  workout(
    '2026-11-05T17:00:00Z',
    [exercise('squat', [set(100, 5), set(40, 10, { type: 'warmup' })])],
    {
      finishedAt: '2026-11-05T17:45:00Z',
    },
  ),
]
const perfs = performances(workouts)

describe('lifetimeTotals', () => {
  it('adds up workouts, sets, reps, tonnage and time — without skips or warm-ups', () => {
    expect(lifetimeTotals(workouts, perfs, () => 'weight_reps')).toEqual({
      workouts: 2,
      sets: 3,
      reps: 21,
      tonnageKg: 1780,
      minutes: 105,
    })
  })
})

describe('compareTonnage', () => {
  it('picks the largest thing that fits at least once', () => {
    expect(compareTonnage(1780)).toEqual({ id: 'car', times: 1.4 })
    expect(compareTonnage(13_000)).toEqual({ id: 'bus', times: 1.1 })
    expect(compareTonnage(100)).toBeNull()
  })
})

describe('recordWall', () => {
  it('ranks exercises by best e1RM', () => {
    expect(recordWall(perfs).map((r) => [r.exerciseId, Math.round(r.e1rm)])).toEqual([
      ['squat', 117],
      ['bench', 101],
    ])
  })
})
