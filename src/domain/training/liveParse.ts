import { LIVE_VERSION, type LiveExercise, type LiveSet, type LiveSnapshot } from './liveSnapshot'

const MAX_EXERCISES = 40
const MAX_SETS = 60
const MAX_TEXT = 80

const text = (v: unknown): string | null => (typeof v === 'string' ? v.slice(0, MAX_TEXT) : null)
const amount = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 10_000 ? v : null
const date = (v: unknown): string | null =>
  typeof v === 'string' && v.length <= 40 && Number.isFinite(Date.parse(v)) ? v : null
const record = (v: unknown): Record<string, unknown> | null =>
  typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null

function parseSet(v: unknown): LiveSet | null {
  const r = record(v)
  if (!r) return null
  return {
    kg: amount(r.kg),
    reps: amount(r.reps),
    seconds: amount(r.seconds),
    meters: amount(r.meters),
    warmup: r.warmup === true,
  }
}

function parseExercise(v: unknown): LiveExercise | null {
  const r = record(v)
  const name = r && text(r.name)
  if (!r || !name || !['doing', 'skipped', 'replaced'].includes(r.state as string)) return null
  const sets = Array.isArray(r.sets) ? r.sets.slice(0, MAX_SETS).map(parseSet) : []
  return {
    name,
    state: r.state as LiveExercise['state'],
    sets: sets.filter((s): s is LiveSet => s !== null),
  }
}

/**
 * A message from a buddy is untrusted input (another app version, or a modified client): only a
 * well-formed snapshot of the current version is accepted, everything else counts as "not
 * training". Never throws.
 */
export function parseLiveSnapshot(payload: unknown): LiveSnapshot | null {
  const r = record(payload)
  if (!r || r.v !== LIVE_VERSION) return null
  const s = record(r.snapshot)
  if (!s) return null
  const workoutName = text(s.workoutName)
  const startedAt = date(s.startedAt)
  if (workoutName === null || startedAt === null) return null
  const exercises = Array.isArray(s.exercises)
    ? s.exercises.slice(0, MAX_EXERCISES).map(parseExercise)
    : []
  return {
    workoutName,
    startedAt,
    lastSetAt: s.lastSetAt === null ? null : date(s.lastSetAt),
    exercises: exercises.filter((e): e is LiveExercise => e !== null),
  }
}
