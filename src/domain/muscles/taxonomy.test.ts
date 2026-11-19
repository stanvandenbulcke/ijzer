import { describe, expect, it } from 'vitest'
import { isMuscleId, MUSCLE_IDS, MUSCLE_REGION } from './taxonomy'

describe('muscle taxonomy', () => {
  it('has the 20 muscles from the spec, without duplicates', () => {
    expect(MUSCLE_IDS).toHaveLength(20)
    expect(new Set(MUSCLE_IDS).size).toBe(20)
  })

  it('gives every muscle a region', () => {
    for (const id of MUSCLE_IDS) expect(MUSCLE_REGION[id]).toBeDefined()
  })

  it('splits the shoulder into three heads across push and pull', () => {
    expect(MUSCLE_REGION.front_delts).toBe('push')
    expect(MUSCLE_REGION.side_delts).toBe('push')
    expect(MUSCLE_REGION.rear_delts).toBe('pull')
  })

  it('recognises valid ids only', () => {
    expect(isMuscleId('quads')).toBe(true)
    expect(isMuscleId('shoulders')).toBe(false)
    expect(isMuscleId('')).toBe(false)
  })
})
