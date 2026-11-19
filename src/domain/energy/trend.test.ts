import { describe, expect, it } from 'vitest'
import { weeklyRate, weightTrend } from './trend'

describe('weightTrend', () => {
  it('starts at the first weigh-in and moves 10 % per day towards new values', () => {
    const t = weightTrend([
      { day: '2026-11-01', kg: 80 },
      { day: '2026-11-02', kg: 81 },
    ])
    expect(t[0]!.trend).toBe(80)
    expect(t[1]!.trend).toBeCloseTo(80.1, 5)
  })

  it('moves further after a gap: 1 − 0.9^Δ', () => {
    const t = weightTrend([
      { day: '2026-11-01', kg: 80 },
      { day: '2026-11-04', kg: 81 },
    ])
    expect(t[1]!.trend).toBeCloseTo(80 + (1 - 0.9 ** 3), 5)
  })

  it('sorts input and handles empty data', () => {
    expect(weightTrend([])).toEqual([])
    const t = weightTrend([
      { day: '2026-11-02', kg: 79 },
      { day: '2026-11-01', kg: 80 },
    ])
    expect(t.map((p) => p.day)).toEqual(['2026-11-01', '2026-11-02'])
  })
})

describe('weeklyRate', () => {
  it('compares the trend with at least a week earlier', () => {
    const days = Array.from({ length: 15 }, (_, i) => ({
      day: `2026-11-${String(i + 1).padStart(2, '0')}`,
      kg: 80 - i * 0.1,
    }))
    const rate = weeklyRate(weightTrend(days))!
    expect(rate.kgPerWeek).toBeLessThan(0)
    expect(rate.pctPerWeek).toBeLessThan(0)
  })

  it('needs at least a week of data', () => {
    expect(weeklyRate(weightTrend([{ day: '2026-11-01', kg: 80 }]))).toBeNull()
  })
})
