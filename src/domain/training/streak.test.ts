import { describe, expect, it } from 'vitest'
import { weekStatus } from './streak'

describe('weekStatus', () => {
  const starts = [
    '2026-11-02T17:00:00Z',
    '2026-11-04T17:00:00Z',
    '2026-11-06T17:00:00Z', // week of 2 Nov: 3
    '2026-11-09T17:00:00Z',
    '2026-11-11T17:00:00Z',
    '2026-11-13T17:00:00Z', // week of 9 Nov: 3
    '2026-11-17T17:00:00Z',
    '2026-11-17T19:00:00Z', // two workouts on one day count as one day
  ]

  it('counts training days this week and full weeks before', () => {
    const s = weekStatus(starts, '2026-11-19', 3)
    expect(s.trainedDays).toEqual(['2026-11-17'])
    expect(s.count).toBe(1)
    expect(s.streakWeeks).toBe(2)
  })

  it('adds the current week once the goal is reached, never punishes rest days', () => {
    expect(
      weekStatus([...starts, '2026-11-18T17:00:00Z', '2026-11-20T17:00:00Z'], '2026-11-22', 3)
        .streakWeeks,
    ).toBe(3)
    expect(weekStatus([], '2026-11-19', 3)).toEqual({
      trainedDays: [],
      count: 0,
      goal: 3,
      streakWeeks: 0,
    })
  })
})
