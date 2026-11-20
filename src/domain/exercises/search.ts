import type { MuscleId } from '../muscles/taxonomy'
import type { Equipment, Exercise } from '../training/types'
import { DUTCH_MUSCLE_WORDS, DUTCH_WORDS } from './dutchTerms'

/** Lowercase, without accents and punctuation: "Push-Ups" → "push ups". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** True when a and b differ by at most one insertion, deletion, substitution or swap. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length === b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) {
      // Two swapped letters ("sqaut") count as one typo.
      i += 2
      j += 2
    } else if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

interface Indexed {
  exercise: Exercise
  name: string
  words: string[]
  aliases: string[]
}

const cache = new WeakMap<Exercise[], Indexed[]>()

function index(exercises: Exercise[]): Indexed[] {
  let indexed = cache.get(exercises)
  if (!indexed) {
    indexed = exercises.map((exercise) => {
      const name = normalize(exercise.name)
      const aliases = exercise.aliases.map(normalize)
      return {
        exercise,
        name,
        aliases,
        words: [...name.split(' '), ...aliases.flatMap((a) => a.split(' '))],
      }
    })
    cache.set(exercises, indexed)
  }
  return indexed
}

function score(item: Indexed, query: string, tokens: string[]): number {
  if (item.aliases.includes(query)) return 100
  if (item.name === query) return 95
  if (item.name.startsWith(query)) return 80
  if (item.aliases.some((a) => a.startsWith(query))) return 75
  const prefix = tokens.every((t) => item.words.some((w) => w.startsWith(t)))
  if (prefix) return 60
  const contains = tokens.every(
    (t) => item.name.includes(t) || item.aliases.some((a) => a.includes(t)),
  )
  if (contains) return 40
  const fuzzy = tokens.every(
    (t) =>
      item.words.some((w) => w.startsWith(t)) ||
      (t.length >= 4 && item.words.some((w) => withinOneEdit(t, w))),
  )
  return fuzzy ? 20 : 0
}

/** Muscles meant by a Dutch word or its start ("bil" → glutes), from 3 letters on. */
export function dutchMuscles(token: string): MuscleId[] {
  if (token.length < 3) return []
  const hits = new Set<MuscleId>()
  for (const [word, muscles] of Object.entries(DUTCH_MUSCLE_WORDS))
    if (word.startsWith(token)) for (const m of muscles) hits.add(m)
  return [...hits]
}

/** "bulgaarse split squat" → "bulgarian split squat". Unknown words stay as they are. */
export function translateDutch(query: string): string {
  return query
    .split(' ')
    .map((word) => DUTCH_WORDS[word] ?? word)
    .join(' ')
}

/** Score for a query that names a muscle in Dutch: direct hits first, then helpers. */
function muscleScore(exercise: Exercise, tokens: string[]): number {
  const wanted = tokens.map(dutchMuscles)
  if (wanted.some((m) => m.length === 0)) return 0
  const best = Math.min(
    ...wanted.map((muscles) =>
      Math.max(
        0,
        ...exercise.muscles.filter((m) => muscles.includes(m.muscle)).map((m) => m.weight),
      ),
    ),
  )
  return best >= 1 ? 50 : best >= 0.5 ? 30 : 0
}

export interface ExerciseFilter {
  /** Only exercises that train this muscle directly. */
  muscle?: MuscleId
  equipment?: Equipment[]
}

export function matchesFilter(exercise: Exercise, filter: ExerciseFilter): boolean {
  if (filter.muscle && !exercise.muscles.some((m) => m.muscle === filter.muscle && m.weight === 1))
    return false
  if (filter.equipment?.length && !filter.equipment.includes(exercise.equipment)) return false
  return true
}

/**
 * Search by name or gym abbreviation ("rdl", "ohp", "bss"), tolerant of one typo per word.
 * Dutch works too: muscle words ("billen", "buik") find exercises for that muscle and common
 * words are translated ("bulgaarse" → "bulgarian"). Without a query the list keeps its order
 * (curated first). Hand-checked exercises win ties.
 */
export function searchExercises(
  exercises: Exercise[],
  query: string,
  filter: ExerciseFilter = {},
): Exercise[] {
  const q = normalize(query)
  const candidates = index(exercises).filter((i) => matchesFilter(i.exercise, filter))
  if (!q) return candidates.map((i) => i.exercise)

  const tokens = q.split(' ')
  const translated = translateDutch(q)
  const translatedTokens = translated.split(' ')
  return candidates
    .map((item) => ({
      item,
      score:
        Math.max(
          score(item, q, tokens),
          translated === q ? 0 : score(item, translated, translatedTokens),
          muscleScore(item.exercise, tokens),
        ) + (item.exercise.quality !== 'auto' ? 5 : 0),
    }))
    .filter((r) => r.score > 5)
    .sort((a, b) => b.score - a.score || a.item.name.length - b.item.name.length)
    .map((r) => r.item.exercise)
}

/**
 * Alternatives for "Vervangen" and "Machine bezet": same primary muscle, available
 * equipment, best overlap of all trained muscles first.
 */
export function alternatives(
  exercises: Exercise[],
  original: Exercise,
  available?: Equipment[],
  limit = 12,
): Exercise[] {
  const primary = original.muscles.filter((m) => m.weight === 1).map((m) => m.muscle)
  if (primary.length === 0) return []
  const overlap = (e: Exercise) =>
    e.muscles.reduce((sum, m) => {
      const o = original.muscles.find((x) => x.muscle === m.muscle)
      return sum + (o ? Math.min(o.weight, m.weight) : 0)
    }, 0)
  return exercises
    .filter(
      (e) =>
        e.id !== original.id &&
        e.muscles.some((m) => m.weight === 1 && primary.includes(m.muscle)) &&
        (!available || available.includes(e.equipment)),
    )
    .map((e) => ({ e, s: overlap(e) + (e.quality !== 'auto' ? 0.25 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.e)
}
