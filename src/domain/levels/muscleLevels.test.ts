import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from '../training/fixtures'
import { performances } from '../training/performances'
import type { Exercise } from '../training/types'
import { levelFromPoints, levelTier, muscleLevels, pointsForLevel } from './muscleLevels'

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

describe('level curve', () => {
  it('needs 10 × (level − 1)² points', () => {
    expect([1, 2, 5, 10].map(pointsForLevel)).toEqual([0, 10, 160, 810])
    expect(levelFromPoints(0)).toBe(1)
    expect(levelFromPoints(9.9)).toBe(1)
    expect(levelFromPoints(10)).toBe(2)
    expect(levelFromPoints(820)).toBe(10)
    expect(levelFromPoints(1e9)).toBe(20)
  })

  it('names tiers after plates', () => {
    expect([1, 3, 6, 10, 15].map(levelTier)).toEqual([
      'plate5',
      'plate10',
      'plate15',
      'plate20',
      'plate25',
    ])
  })
})

describe('muscleLevels', () => {
  it('adds fractional sets and a bonus for each session with a new best e1RM', () => {
    const perfs = performances([
      workout('2026-11-01T17:00:00Z', [exercise('bench', [set(80, 8), set(80, 8)])]),
      workout('2026-11-08T17:00:00Z', [exercise('bench', [set(85, 8), set(85, 7)])]), // PR session
      workout('2026-11-15T17:00:00Z', [exercise('bench', [set(80, 8)], { status: 'skipped' })]),
    ])
    const levels = Object.fromEntries(muscleLevels(perfs, byId).map((l) => [l.muscle, l]))
    expect(levels.chest).toMatchObject({ sets: 4, prSessions: 1, points: 14, level: 2 })
    expect(levels.triceps).toMatchObject({ sets: 2, prSessions: 0, points: 2, level: 1 })
    expect(levels.chest!.progress).toBeCloseTo((14 - 10) / (40 - 10), 5)
    expect(levels.quads).toMatchObject({ points: 0, level: 1, progress: 0 })
  })
})
