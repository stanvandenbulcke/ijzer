import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from '../training/fixtures'
import { performances } from '../training/performances'
import {
  MIN_PAIRED,
  pairedDays,
  sessionPerformance,
  wellbeingInsights,
  type CheckIn,
} from './wellbeing'

const day = (i: number) => `2026-10-${String(i + 1).padStart(2, '0')}`

/** 14 sessions; on good-sleep days you lift 100 kg, on poor days 90 kg (after a 95 kg start). */
function data(goodSleepStronger = true) {
  const workouts = [workout(`${day(0)}T17:00:00Z`, [exercise('bench', [set(95, 5)])])]
  const checkIns: CheckIn[] = []
  for (let i = 1; i <= 14; i++) {
    const good = i % 2 === 0
    const kg = goodSleepStronger ? (good ? 100 : 90) : 95
    workouts.push(workout(`${day(i)}T17:00:00Z`, [exercise('bench', [set(kg, 5)])]))
    checkIns.push({ day: day(i), sleep: good ? 5 : 1, energy: 3 })
  }
  return { perfs: performances(workouts), checkIns }
}

describe('sessionPerformance', () => {
  it('compares each session with your best before it', () => {
    const perfs = performances([
      workout('2026-10-01T17:00:00Z', [exercise('bench', [set(100, 5)])]),
      workout('2026-10-03T17:00:00Z', [exercise('bench', [set(90, 5)])]),
    ])
    const sessions = [...sessionPerformance(perfs).values()]
    expect(sessions).toHaveLength(1) // the first session has nothing to compare with
    expect(sessions[0]!.ratio).toBeCloseTo(0.9, 5)
  })
})

describe('wellbeingInsights', () => {
  it('finds that good-sleep days were stronger, with a positive correlation', () => {
    const { perfs, checkIns } = data()
    const [sleep] = wellbeingInsights(checkIns, perfs)
    expect(sleep).toMatchObject({ factor: 'sleep', paired: 14, goodDays: 7, poorDays: 7 })
    expect(sleep!.differencePct).toBeGreaterThan(5)
    expect(sleep!.correlation).toBeGreaterThan(0.5)
  })

  it('shows nothing without enough data, and nothing for a factor without spread', () => {
    const { perfs, checkIns } = data()
    expect(wellbeingInsights(checkIns.slice(0, MIN_PAIRED - 1), perfs)).toEqual([])
    expect(wellbeingInsights(checkIns, perfs).some((i) => i.factor === 'energy')).toBe(false)
  })
})

describe('half-filled check-ins', () => {
  it('ignores a factor that was not answered (0) instead of counting it as a bad night', () => {
    const { checkIns, perfs } = data()
    const energyOnly = checkIns.map((c) => ({ ...c, sleep: 0 }))
    expect(wellbeingInsights(energyOnly, perfs).map((i) => i.factor)).not.toContain('sleep')
    expect(pairedDays(energyOnly, perfs)).toBe(0)
    expect(pairedDays(checkIns, perfs)).toBeGreaterThan(0)
  })
})
