import { describe, expect, it } from 'vitest'
import { exercise, set, workout } from '../training/fixtures'
import { performances } from '../training/performances'
import type { Exercise } from '../training/types'
import { analyse, freshness } from './rules'

function ex(id: string, muscles: Exercise['muscles'], extra: Partial<Exercise> = {}): Exercise {
  return {
    id,
    name: id,
    equipment: 'barbell',
    type: 'weight_reps',
    unilateral: false,
    muscles,
    lengthened: false,
    mechanic: 'compound',
    quality: 'curated',
    aliases: [],
    instructions: [],
    hasImages: true,
    custom: false,
    ...extra,
  }
}
const catalog: Record<string, Exercise> = {
  bench: ex('bench', [
    { muscle: 'chest', weight: 1 },
    { muscle: 'front_delts', weight: 0.5 },
    { muscle: 'triceps', weight: 0.5 },
  ]),
  ohp: ex('ohp', [{ muscle: 'front_delts', weight: 1 }]),
  pushdown: ex('pushdown', [{ muscle: 'triceps', weight: 1 }], { mechanic: 'isolation' }),
  row: ex('row', [{ muscle: 'upper_back', weight: 1 }]),
}
const byId = (id: string) => catalog[id]
const sets = (n: number, extra = {}) => Array.from({ length: n }, () => set(80, 8, extra))
const ids = (list: ReturnType<typeof analyse>) => list.map((i) => i.id)

describe('analyse', () => {
  it('returns nothing without recent training', () => {
    expect(analyse({ perfs: [], byId, today: '2026-11-19', cutting: false })).toEqual([])
  })

  it('R1/R2/R6/R9: one huge chest session, no pulling', () => {
    const perfs = performances([
      workout('2026-11-17T17:00:00Z', [exercise('bench', sets(14)), exercise('ohp', sets(4))]),
    ])
    const insights = analyse({ perfs, byId, today: '2026-11-19', cutting: false })
    expect(ids(insights)).toContain('R9') // 14 chest sets in a single session this week
    expect(ids(insights)).toContain('R6') // push ≫ pull
    const r6 = insights.find((i) => i.id === 'R6')
    expect(r6).toMatchObject({ pair: 'push_pull', strong: 'push' })
  })

  it('R1 low: muscles trained this month but hardly this week', () => {
    const perfs = performances([
      workout('2026-11-01T17:00:00Z', [exercise('row', sets(6))]),
      workout('2026-11-18T17:00:00Z', [exercise('row', sets(2)), exercise('bench', sets(12))]),
    ])
    const low = analyse({ perfs, byId, today: '2026-11-19', cutting: false }).find(
      (i) => i.id === 'R1_low',
    )
    expect(low).toMatchObject({ muscles: [{ muscle: 'upper_back', sets: 2 }] })
  })

  it('R3: sets logged far from failure', () => {
    const perfs = performances([
      workout('2026-11-18T17:00:00Z', [exercise('bench', sets(6, { rir: 5 }))]),
    ])
    expect(ids(analyse({ perfs, byId, today: '2026-11-19', cutting: false }))).toContain('R3')
  })

  it('R4: very short rests between compound sets', () => {
    const quick = Array.from({ length: 8 }, (_, i) =>
      set(80, 8, {
        completedAt: new Date(Date.parse('2026-11-18T17:00:00Z') + i * 40_000).toISOString(),
      }),
    )
    const perfs = performances([workout('2026-11-18T17:00:00Z', [exercise('bench', quick)])])
    expect(
      analyse({ perfs, byId, today: '2026-11-19', cutting: false }).find((i) => i.id === 'R4'),
    ).toMatchObject({ medianSec: 40 })
  })

  it('R5: triceps trained but never overhead', () => {
    const perfs = performances([workout('2026-11-18T17:00:00Z', [exercise('pushdown', sets(4))])])
    expect(
      analyse({ perfs, byId, today: '2026-11-19', cutting: false }).find((i) => i.id === 'R5'),
    ).toMatchObject({ muscle: 'triceps' })
  })

  it('R7: no new best e1RM over four sessions in three weeks; info only in a cut', () => {
    const days = ['2026-10-26', '2026-11-02', '2026-11-09', '2026-11-18']
    const perfs = performances(
      days.map((d) => workout(`${d}T17:00:00Z`, [exercise('bench', [set(80, 8)])])),
    )
    const r7 = analyse({ perfs, byId, today: '2026-11-19', cutting: false }).find(
      (i) => i.id === 'R7',
    )
    expect(r7).toMatchObject({ exerciseId: 'bench', severity: 'tip' })
    expect(
      analyse({ perfs, byId, today: '2026-11-19', cutting: true }).find((i) => i.id === 'R7')
        ?.severity,
    ).toBe('info')
  })
})

describe('freshness', () => {
  it('estimates recovery from hours since training and the number of sets', () => {
    const perfs = performances([
      workout('2026-11-19T08:00:00Z', [
        exercise('bench', sets(8, { completedAt: '2026-11-19T08:00:00Z' })),
      ]),
    ])
    const f = freshness(perfs, byId, '2026-11-19T12:00:00Z')
    expect(f.chest).toBe('just_trained')
    expect(freshness(perfs, byId, '2026-11-22T12:00:00Z').chest).toBe('fresh')
    expect(f.quads).toBeUndefined()
  })
})
