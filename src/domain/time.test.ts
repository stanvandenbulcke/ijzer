import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, localDay, weekStart } from './time'

describe('localDay', () => {
  it('uses Belgian time around midnight (winter, UTC+1)', () => {
    expect(localDay('2026-11-16T22:59:00Z')).toBe('2026-11-16')
    expect(localDay('2026-11-16T23:01:00Z')).toBe('2026-11-17')
  })

  it('uses Belgian time around midnight (summer, UTC+2)', () => {
    expect(localDay('2026-07-01T21:59:00Z')).toBe('2026-07-01')
    expect(localDay('2026-07-01T22:01:00Z')).toBe('2026-07-02')
  })
})

describe('day arithmetic', () => {
  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('counts days between, also across DST changes', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
    expect(daysBetween('2026-11-20', '2026-11-16')).toBe(-4)
  })

  it('finds the Monday of the week', () => {
    expect(weekStart('2026-11-19')).toBe('2026-11-16') // Thursday
    expect(weekStart('2026-11-16')).toBe('2026-11-16') // Monday
    expect(weekStart('2026-11-22')).toBe('2026-11-16') // Sunday
  })
})
