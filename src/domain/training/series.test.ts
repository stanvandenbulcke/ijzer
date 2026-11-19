import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { performances } from './performances'
import { e1rmSeries, recentBestE1rms, sessions } from './series'

const perfs = performances([
  workout('2026-11-01T17:00:00Z', [exercise('bench', [set(80, 8), set(80, 6)])]),
  workout('2026-11-03T17:00:00Z', [exercise('bench', [set(40, 20)])]),
  workout('2026-11-05T17:00:00Z', [exercise('bench', [set(82.5, 8)])]),
  workout('2026-11-07T17:00:00Z', [exercise('bench', [set(80, 8)], { status: 'skipped' })]),
])

describe('sessions', () => {
  it('groups per workout with best set and volume', () => {
    const s = sessions(perfs)
    expect(s.map((x) => [x.day, x.bestSet.weightKg, x.volume])).toEqual([
      ['2026-11-01', 80, 1120],
      ['2026-11-03', 40, 800],
      ['2026-11-05', 82.5, 660],
    ])
  })
})

describe('e1rmSeries', () => {
  it('has one point per session and a gap for sessions above 12 reps or skipped', () => {
    expect(e1rmSeries(perfs)).toEqual([
      { day: '2026-11-01', value: 101.3 },
      { day: '2026-11-05', value: 104.5 },
    ])
    expect(recentBestE1rms(perfs, 1)).toEqual([104.5])
    expect(e1rmSeries([])).toEqual([])
  })
})

describe('e1rmSeries on one day', () => {
  it('merges two sessions on the same day into the best point', () => {
    const sameDay = performances([
      workout('2026-11-19T08:00:00Z', [exercise('bench', [set(80, 5)])]),
      workout('2026-11-19T18:00:00Z', [exercise('bench', [set(80, 8)])]),
    ])
    expect(e1rmSeries(sameDay)).toEqual([{ day: '2026-11-19', value: 101.3 }])
  })
})
