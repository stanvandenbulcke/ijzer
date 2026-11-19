import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { performances } from './performances'
import { computeRecords, detectPRs } from './records'

const history = performances([
  workout('2026-11-01T17:00:00Z', [exercise('bench', [set(80, 8), set(80, 6)])]),
  workout('2026-11-05T17:00:00Z', [exercise('bench', [set(85, 5), set(70, 12), set(60, 15)])]),
])

describe('computeRecords', () => {
  const r = computeRecords(history, 'weight_reps')

  it('finds the heaviest set and the best estimated 1RM', () => {
    expect(r.heaviest).toEqual({ weightKg: 85, reps: 5, day: '2026-11-05' })
    expect(r.bestE1rm?.value).toBeCloseTo(80 * (1 + 8 / 30), 5)
  })

  it('builds the rep-PR table with a 12+ bucket', () => {
    expect(r.repTable.map((x) => [x.reps, x.weightKg])).toEqual([
      [5, 85],
      [6, 80],
      [8, 80],
      [12, 70],
      [13, 60],
    ])
  })

  it('tracks set and session volume', () => {
    expect(r.bestSetVolume?.value).toBe(900) // 60 × 15
    expect(r.bestSessionVolume).toEqual({ value: 425 + 840 + 900, day: '2026-11-05' })
  })

  it('handles time-based exercises and empty data', () => {
    const plank = performances(
      [workout('2026-11-01T17:00:00Z', [exercise('plank', [set(null, null, { seconds: 75 })])])],
      { typeOf: () => 'time' },
    )
    expect(computeRecords(plank, 'time').longest?.seconds).toBe(75)
    expect(computeRecords([], 'weight_reps').heaviest).toBeNull()
  })
})

describe('detectPRs', () => {
  it('shows nothing on the very first session', () => {
    expect(detectPRs([], set(100, 5), 'weight_reps')).toEqual([])
  })

  it('detects a weight PR', () => {
    expect(detectPRs(history, set(87.5, 3), 'weight_reps')).toEqual(['weight'])
  })

  it('detects a reps PR at the same weight', () => {
    expect(detectPRs(history, set(80, 9), 'weight_reps')).toContain('reps')
  })

  it('detects an e1RM PR (here together with a reps PR at 75 kg or more)', () => {
    expect(detectPRs(history, set(75, 11), 'weight_reps')).toEqual(['reps', 'e1rm'])
  })

  it('ignores warm-ups, unchecked and weaker sets', () => {
    expect(detectPRs(history, set(90, 5, { type: 'warmup' }), 'weight_reps')).toEqual([])
    expect(detectPRs(history, set(90, 5, { completed: false }), 'weight_reps')).toEqual([])
    expect(detectPRs(history, set(80, 5), 'weight_reps')).toEqual([])
  })

  it('treats less assistance as progress for assisted exercises', () => {
    const assisted = performances([workout('2026-11-01T17:00:00Z', [exercise('ap', [set(30, 8)])])])
    expect(detectPRs(assisted, set(25, 6), 'assisted')).toEqual(['weight'])
    expect(detectPRs(assisted, set(30, 10), 'assisted')).toEqual(['reps'])
  })

  it('detects a longer hold for time exercises', () => {
    const plank = performances(
      [workout('2026-11-01T17:00:00Z', [exercise('plank', [set(null, null, { seconds: 60 })])])],
      { typeOf: () => 'time' },
    )
    expect(detectPRs(plank, set(null, null, { seconds: 70 }), 'time')).toEqual(['duration'])
  })
})
