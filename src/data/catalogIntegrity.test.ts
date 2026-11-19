import { describe, expect, it } from 'vitest'
import catalog from '../../public/data/exercises.json'
import { isMuscleId } from '../domain/muscles/taxonomy'
import { LENGTHENED_SUGGESTION } from '../domain/analysis/rules'

/** Guards the generated catalog against drift: every id the app refers to must exist. */
describe('exercise catalog', () => {
  it('contains the lengthened suggestions of rule R5, and they are flagged as lengthened', () => {
    for (const id of Object.values(LENGTHENED_SUGGESTION)) {
      expect(catalog.exercises.find((e) => e.id === id)?.lengthened, id).toBe(true)
    }
  })

  it('only uses known muscles, with at least one direct muscle per exercise', () => {
    for (const e of catalog.exercises) {
      expect(
        e.muscles.every(([m]) => isMuscleId(m as string)),
        e.id,
      ).toBe(true)
      expect(
        e.muscles.some(([, w]) => w === 1),
        e.id,
      ).toBe(true)
    }
  })

  it('has ids that are safe in URLs and file names', () => {
    for (const e of catalog.exercises) expect(e.id).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})
