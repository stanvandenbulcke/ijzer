import { describe, expect, it } from 'vitest'
import {
  clampRate,
  DEFAULT_EQUIPMENT,
  DEFAULT_PROFILE,
  defaultRestSec,
  incrementFor,
} from './defaults'

describe('incrementFor', () => {
  it('uses two of the lightest plates for a barbell', () => {
    expect(incrementFor('barbell', DEFAULT_EQUIPMENT)).toBe(2.5)
    const noSmall = {
      ...DEFAULT_EQUIPMENT,
      plates: [
        { kg: 20, perSide: 4 },
        { kg: 2.5, perSide: 2 },
      ],
    }
    expect(incrementFor('barbell', noSmall)).toBe(5)
  })

  it('uses the configured steps for dumbbells, machines and cables', () => {
    expect(incrementFor('dumbbell', DEFAULT_EQUIPMENT)).toBe(2)
    expect(incrementFor('machine', DEFAULT_EQUIPMENT)).toBe(5)
    expect(incrementFor('cable', DEFAULT_EQUIPMENT)).toBe(2.5)
    expect(incrementFor('bodyweight', DEFAULT_EQUIPMENT)).toBe(2.5)
  })
})

describe('clampRate', () => {
  it('never allows losing more than 1 % per week or gaining more than 0.5 %', () => {
    expect(clampRate(-2)).toBe(-1)
    expect(clampRate(-0.5)).toBe(-0.5)
    expect(clampRate(1)).toBe(0.5)
  })
})

describe('defaultRestSec', () => {
  it('rests longer after compounds', () => {
    expect(defaultRestSec('compound', DEFAULT_PROFILE)).toBe(150)
    expect(defaultRestSec('isolation', DEFAULT_PROFILE)).toBe(90)
    expect(defaultRestSec(null, DEFAULT_PROFILE)).toBe(150)
  })
})
