import { describe, expect, it } from 'vitest'
import { warmupSets } from './warmup'

describe('warmupSets', () => {
  it('builds the compound ramp, rounded down to the plate step', () => {
    expect(warmupSets(100, { barKg: 20 })).toEqual([
      { weightKg: 20, reps: 10 },
      { weightKg: 40, reps: 8 },
      { weightKg: 60, reps: 5 },
      { weightKg: 75, reps: 3 },
      { weightKg: 85, reps: 1 },
    ])
  })

  it('drops steps that would be lighter than or equal to the bar', () => {
    expect(warmupSets(40, { barKg: 20 }).map((s) => s.weightKg)).toEqual([20, 22.5, 30, 32.5])
  })

  it('is short for isolation and empty for no weight', () => {
    expect(warmupSets(20, { compound: false, stepKg: 2 })).toEqual([
      { weightKg: 10, reps: 10 },
      { weightKg: 14, reps: 5 },
    ])
    expect(warmupSets(0)).toEqual([])
  })
})
