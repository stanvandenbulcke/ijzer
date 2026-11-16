import { describe, expect, it } from 'vitest'
import { estimateOneRepMax } from './e1rm'

describe('estimateOneRepMax', () => {
  it('returns the weight itself for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100)
  })

  it('applies Epley for 2–12 reps', () => {
    expect(estimateOneRepMax(80, 8)).toBeCloseTo(101.33, 2)
    expect(estimateOneRepMax(60, 12)).toBeCloseTo(84, 5)
    expect(estimateOneRepMax(100, 2)).toBeCloseTo(106.67, 2)
  })

  it('gives no estimate above 12 reps', () => {
    expect(estimateOneRepMax(40, 13)).toBeNull()
    expect(estimateOneRepMax(40, 30)).toBeNull()
  })

  it('never returns zero for missing or invalid data', () => {
    expect(estimateOneRepMax(0, 5)).toBeNull()
    expect(estimateOneRepMax(-20, 5)).toBeNull()
    expect(estimateOneRepMax(80, 0)).toBeNull()
    expect(estimateOneRepMax(80, 2.5)).toBeNull()
    expect(estimateOneRepMax(Number.NaN, 5)).toBeNull()
    expect(estimateOneRepMax(Number.POSITIVE_INFINITY, 5)).toBeNull()
  })
})
