import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { completedSetCount, performances, previousSession, workoutVolumeKg } from './performances'
import type { ExerciseType } from './types'

const bench = 'bench'

describe('performances', () => {
  it('only counts completed, non-warm-up sets of finished workouts, oldest first', () => {
    const w2 = workout('2026-11-12T17:00:00Z', [exercise(bench, [set(80, 8)])])
    const w1 = workout('2026-11-10T17:00:00Z', [
      exercise(bench, [
        set(40, 10, { type: 'warmup' }),
        set(80, 7),
        set(80, null, { completed: false }),
        set(80, 6, { completed: false }),
      ]),
    ])
    const active = workout('2026-11-14T17:00:00Z', [exercise(bench, [set(85, 5)])], {
      finishedAt: null,
    })
    const result = performances([w2, active, w1])
    expect(result.map((p) => [p.day, p.set.weightKg, p.set.reps])).toEqual([
      ['2026-11-10', 80, 7],
      ['2026-11-12', 80, 8],
    ])
  })

  it('never counts skipped or substituted exercises, but does count the substitute', () => {
    const w = workout('2026-11-10T17:00:00Z', [
      exercise(bench, [set(80, 8)], { status: 'skipped', skipReason: 'busy' }),
      exercise('ohp', [set(50, 8)], { status: 'substituted', substitutedBy: 'x' }),
      exercise('db-press', [set(30, 10)]),
    ])
    expect(performances([w]).map((p) => p.exerciseId)).toEqual(['db-press'])
  })

  it('can include warm-ups for "last time" values', () => {
    const w = workout('2026-11-10T17:00:00Z', [exercise(bench, [set(40, 10, { type: 'warmup' })])])
    expect(performances([w])).toHaveLength(0)
    expect(performances([w], { includeWarmups: true })).toHaveLength(1)
  })

  it('requires the measurement of the exercise type', () => {
    const w = workout('2026-11-10T17:00:00Z', [
      exercise('plank', [set(null, null, { seconds: 60 }), set(null, null, { seconds: 0 })]),
    ])
    expect(performances([w], { typeOf: () => 'time' })).toHaveLength(1)
  })

  it('returns nothing for no data', () => {
    expect(performances([])).toEqual([])
  })
})

describe('previousSession', () => {
  const old = workout('2026-11-01T17:00:00Z', [exercise(bench, [set(77.5, 8), set(77.5, 7)])])
  const skipped = workout('2026-11-05T17:00:00Z', [
    exercise(bench, [set(80, 8)], { status: 'skipped' }),
  ])
  const unchecked = workout('2026-11-07T17:00:00Z', [
    exercise(bench, [set(80, 8, { completed: false })]),
  ])

  it('skips sessions where the exercise was skipped or had no completed set', () => {
    const prev = previousSession([old, skipped, unchecked], bench)
    expect(prev?.workout.id).toBe(old.id)
    expect(prev?.sets.map((s) => s.reps)).toEqual([8, 7])
  })

  it('only looks before the given moment and returns null when never done', () => {
    expect(previousSession([old], bench, '2026-10-01T00:00:00Z')).toBeNull()
    expect(previousSession([old], 'squat')).toBeNull()
  })
})

describe('workout totals', () => {
  it('sums tonnage and sets without warm-ups, skips or unchecked sets', () => {
    const w = workout('2026-11-10T17:00:00Z', [
      exercise(bench, [
        set(40, 10, { type: 'warmup' }),
        set(80, 8),
        set(80, 8, { completed: false }),
      ]),
      exercise('curl', [set(15, 10)], { status: 'skipped' }),
      exercise('pullup', [set(0, 10)]),
    ])
    const typeOf = (id: string): ExerciseType =>
      id === 'pullup' ? 'bodyweight_reps' : 'weight_reps'
    expect(workoutVolumeKg(w, typeOf)).toBe(640)
    expect(completedSetCount(w)).toBe(2)
  })
})
