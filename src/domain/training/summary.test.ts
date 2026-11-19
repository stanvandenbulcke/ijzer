import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from './fixtures'
import { summarizeWorkout } from './summary'
import type { Exercise } from './types'

const bench: Exercise = {
  id: 'bench',
  name: 'Bench',
  equipment: 'barbell',
  type: 'weight_reps',
  unilateral: false,
  muscles: [
    { muscle: 'chest', weight: 1 },
    { muscle: 'triceps', weight: 0.5 },
  ],
  lengthened: false,
  mechanic: 'compound',
  quality: 'curated',
  aliases: [],
  instructions: [],
  hasImages: true,
  custom: false,
}
const byId = (id: string) => (id === 'bench' ? bench : undefined)

describe('summarizeWorkout', () => {
  const last = workout('2026-11-12T17:00:00Z', [exercise('bench', [set(80, 8), set(80, 8)])], {
    routineId: 'push',
    finishedAt: '2026-11-12T18:00:00Z',
  })
  const today = workout(
    '2026-11-19T17:00:00Z',
    [
      exercise('bench', [set(85, 8), set(85, 8), set(40, 10, { type: 'warmup' })]),
      exercise('fly', [set(10, 10, { completed: false })], { status: 'skipped' }),
    ],
    { routineId: 'push', finishedAt: '2026-11-19T17:45:00Z' },
  )

  it('sums duration, sets and volume, lists PRs once and skipped exercises', () => {
    const s = summarizeWorkout(today, [today, last], byId)
    expect(s.minutes).toBe(45)
    expect(s.sets).toBe(2)
    expect(s.volumeKg).toBe(1360)
    expect(s.prs).toEqual([{ exerciseId: 'bench', kind: 'weight', weightKg: 85, reps: 8 }])
    expect(s.skipped).toEqual(['fly'])
    expect(s.muscles).toEqual({ chest: 2, triceps: 1 })
    expect(s.volumeChange).toBeCloseTo(1360 / 1280 - 1, 5)
  })

  it('has no comparison or PRs the first time', () => {
    const s = summarizeWorkout(last, [last], byId)
    expect(s.prs).toEqual([])
    expect(s.volumeChange).toBeNull()
  })
})
