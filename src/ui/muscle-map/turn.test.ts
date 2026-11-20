import { describe, expect, it } from 'vitest'
import { normaliseAngle, preferredSide, showsBack } from './turn'

describe('3D body turn', () => {
  it('shows the front at 0° and the back at 180°, in both directions', () => {
    expect(showsBack(0)).toBe(false)
    expect(showsBack(180)).toBe(true)
    expect(showsBack(-180)).toBe(true)
    expect(showsBack(360)).toBe(false)
    expect(showsBack(80)).toBe(false)
    expect(showsBack(100)).toBe(true)
    expect(showsBack(-100)).toBe(true)
  })

  it('normalises angles', () => {
    expect(normaliseAngle(-90)).toBe(270)
    expect(normaliseAngle(540)).toBe(180)
  })
})

describe('preferredSide', () => {
  const front = new Set(['chest', 'quads', 'abs'])
  const back = new Set(['glutes', 'hamstrings', 'lats'])
  it('opens on the back for a glute day', () => {
    expect(preferredSide(['glutes', 'hamstrings', 'quads'], front, back)).toBe('back')
  })
  it('stays on the front for a tie or nothing trained', () => {
    expect(preferredSide(['glutes', 'quads'], front, back)).toBe('front')
    expect(preferredSide([], front, back)).toBe('front')
  })
})
