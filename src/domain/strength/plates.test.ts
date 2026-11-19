import { describe, expect, it } from 'vitest'
import { platesPerSide, STANDARD_PLATES } from './plates'

describe('platesPerSide', () => {
  it('loads the heaviest plates first', () => {
    expect(platesPerSide(100, 20, STANDARD_PLATES)).toEqual({
      perSide: [25, 15],
      achievedKg: 100,
      exact: true,
    })
    expect(platesPerSide(82.5, 20, STANDARD_PLATES).perSide).toEqual([25, 5, 1.25])
  })

  it('returns an empty bar for the bar weight or less', () => {
    expect(platesPerSide(20, 20, STANDARD_PLATES)).toEqual({
      perSide: [],
      achievedKg: 20,
      exact: true,
    })
    expect(platesPerSide(15, 20, STANDARD_PLATES).exact).toBe(false)
  })

  it('reports when the exact weight cannot be made', () => {
    const r = platesPerSide(101, 20, STANDARD_PLATES)
    expect(r.exact).toBe(false)
    expect(r.achievedKg).toBe(100)
  })

  it('respects how many plates of each kind exist', () => {
    const few = [
      { kg: 20, perSide: 1 },
      { kg: 10, perSide: 2 },
    ]
    expect(platesPerSide(120, 20, few)).toEqual({
      perSide: [20, 10, 10],
      achievedKg: 100,
      exact: false,
    })
  })
})
