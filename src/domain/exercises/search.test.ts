import { describe, expect, it } from 'vitest'
import type { Exercise } from '../training/types'
import { alternatives, normalize, searchExercises } from './search'

function ex(id: string, name: string, extra: Partial<Exercise> = {}): Exercise {
  return {
    id,
    name,
    equipment: 'barbell',
    type: 'weight_reps',
    unilateral: false,
    muscles: [{ muscle: 'chest', weight: 1 }],
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

const list = [
  ex('bench', 'Barbell Bench Press - Medium Grip', { aliases: ['bench', 'bp'] }),
  ex('rdl', 'Romanian Deadlift', {
    aliases: ['rdl'],
    muscles: [{ muscle: 'hamstrings', weight: 1 }],
  }),
  ex('ohp', 'Standing Military Press', {
    aliases: ['ohp'],
    muscles: [{ muscle: 'front_delts', weight: 1 }],
  }),
  ex('bss', 'Split Squat with Dumbbells', {
    aliases: ['bss', 'bulgarian'],
    equipment: 'dumbbell',
    muscles: [{ muscle: 'quads', weight: 1 }],
  }),
  ex('squat', 'Barbell Squat', { aliases: ['squat'], muscles: [{ muscle: 'quads', weight: 1 }] }),
  ex('db-bench', 'Dumbbell Bench Press', { equipment: 'dumbbell', quality: 'auto' }),
  ex('pushup', 'Pushups', { equipment: 'bodyweight', aliases: ['push-up', 'opdrukken'] }),
]

const ids = (r: Exercise[]) => r.map((e) => e.id)

describe('normalize', () => {
  it('strips accents, case and punctuation', () => {
    expect(normalize('  Push-Ups (Wide)  ')).toBe('push ups wide')
    expect(normalize('Rückenstrecker')).toBe('ruckenstrecker')
  })
})

describe('searchExercises', () => {
  it('finds gym abbreviations first', () => {
    expect(ids(searchExercises(list, 'rdl'))[0]).toBe('rdl')
    expect(ids(searchExercises(list, 'OHP'))[0]).toBe('ohp')
    expect(ids(searchExercises(list, 'bss'))[0]).toBe('bss')
  })

  it('matches word prefixes in any order and Dutch aliases', () => {
    expect(ids(searchExercises(list, 'press bench'))).toEqual(['bench', 'db-bench'])
    expect(ids(searchExercises(list, 'opdruk'))).toEqual(['pushup'])
  })

  it('tolerates one typo in longer words', () => {
    expect(ids(searchExercises(list, 'sqaut'))).toContain('squat')
    expect(ids(searchExercises(list, 'bech'))).toContain('bench')
  })

  it('returns the full list without a query and filters by muscle and equipment', () => {
    expect(searchExercises(list, '')).toHaveLength(list.length)
    expect(ids(searchExercises(list, '', { muscle: 'quads' }))).toEqual(['bss', 'squat'])
    expect(ids(searchExercises(list, 'squat', { equipment: ['dumbbell'] }))).toEqual(['bss'])
  })

  it('returns nothing for nonsense', () => {
    expect(searchExercises(list, 'xyzzy')).toEqual([])
  })
})

describe('alternatives', () => {
  it('offers exercises for the same primary muscle with available equipment', () => {
    const bench = list[0]!
    expect(ids(alternatives(list, bench))).toEqual(['pushup', 'db-bench'])
    expect(ids(alternatives(list, bench, ['dumbbell']))).toEqual(['db-bench'])
  })
})
