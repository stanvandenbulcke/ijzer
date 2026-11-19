import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from '../training/fixtures'
import { performances } from '../training/performances'
import type { Exercise } from '../training/types'
import { fractionalSets, plannedVolume, volumeZone } from './fractionalSets'

const catalog: Record<string, Exercise> = {
  bench: {
    id: 'bench',
    name: 'Bench',
    equipment: 'barbell',
    type: 'weight_reps',
    unilateral: false,
    muscles: [
      { muscle: 'chest', weight: 1 },
      { muscle: 'front_delts', weight: 0.5 },
      { muscle: 'triceps', weight: 0.5 },
    ],
    lengthened: false,
    mechanic: 'compound',
    quality: 'curated',
    aliases: [],
    instructions: [],
    hasImages: true,
    custom: false,
  },
}
const byId = (id: string) => catalog[id]

describe('fractionalSets', () => {
  it('counts direct muscles 1 and indirect 0.5 per completed working set', () => {
    const perfs = performances([
      workout('2026-11-10T17:00:00Z', [
        exercise('bench', [set(40, 10, { type: 'warmup' }), set(80, 8), set(80, 8), set(80, 8)]),
      ]),
    ])
    expect(fractionalSets(perfs, byId)).toEqual({ chest: 3, front_delts: 1.5, triceps: 1.5 })
  })

  it('counts sets with RIR above the cutoff as 0, skips unknown exercises', () => {
    const perfs = performances([
      workout('2026-11-10T17:00:00Z', [
        exercise('bench', [set(60, 8, { rir: 6 }), set(80, 8, { rir: 5 })]),
        exercise('unknown', [set(10, 10)]),
      ]),
    ])
    expect(fractionalSets(perfs, byId)).toEqual({ chest: 1, front_delts: 0.5, triceps: 0.5 })
  })

  it('is empty without data and adds up planned sets for a routine preview', () => {
    expect(fractionalSets([], byId)).toEqual({})
    expect(plannedVolume([{ exerciseId: 'bench', workingSets: 4 }], byId)).toEqual({
      chest: 4,
      front_delts: 2,
      triceps: 2,
    })
  })
})

describe('volumeZone', () => {
  it.each([
    [0, 'none'],
    [5.5, 'low'],
    [6, 'moderate'],
    [9.5, 'moderate'],
    [10, 'target'],
    [20, 'target'],
    [20.5, 'target'],
    [21, 'high'],
    [25.5, 'high'],
    [26, 'veryHigh'],
  ] as const)('%s sets → %s', (sets, zone) => {
    expect(volumeZone(sets)).toBe(zone)
  })
})
