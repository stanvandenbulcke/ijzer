import { estimateOneRepMax } from '../strength/e1rm'
import type { ExerciseType, Performance, WorkoutSet } from './types'

export type PRKind = 'weight' | 'e1rm' | 'reps' | 'volume' | 'duration' | 'distance'

/** Highest rep count with its own row in the rep-PR table; above that is "12+". */
export const REP_TABLE_MAX = 12

export interface RepRecord {
  /** 1–12; 13 stands for "12+". */
  reps: number
  weightKg: number
  day: string
}

export interface ExerciseRecords {
  heaviest: { weightKg: number; reps: number; day: string } | null
  bestE1rm: { value: number; day: string } | null
  bestSetVolume: { value: number; day: string } | null
  bestSessionVolume: { value: number; day: string } | null
  repTable: RepRecord[]
  longest: { seconds: number; day: string } | null
  farthest: { meters: number; day: string } | null
}

const setVolume = (s: WorkoutSet) => (s.weightKg ?? 0) * (s.reps ?? 0)

/**
 * All records of one exercise from its performances (warm-ups are already excluded by
 * `performances`). Weight-based records only apply to weighted exercises.
 */
export function computeRecords(perfs: Performance[], type: ExerciseType): ExerciseRecords {
  const records: ExerciseRecords = {
    heaviest: null,
    bestE1rm: null,
    bestSetVolume: null,
    bestSessionVolume: null,
    repTable: [],
    longest: null,
    farthest: null,
  }
  const repBest = new Map<number, RepRecord>()
  const sessionVolume = new Map<string, { value: number; day: string }>()

  for (const { set, day, workoutId } of perfs) {
    if (type === 'time') {
      if (!records.longest || set.seconds! > records.longest.seconds)
        records.longest = { seconds: set.seconds!, day }
      continue
    }
    if (type === 'distance') {
      if (!records.farthest || set.meters! > records.farthest.meters)
        records.farthest = { meters: set.meters!, day }
      continue
    }
    const weight = set.weightKg ?? 0
    const reps = set.reps ?? 0
    if (type === 'weight_reps' || type === 'bodyweight_reps') {
      if (!records.heaviest || weight > records.heaviest.weightKg)
        records.heaviest = { weightKg: weight, reps, day }
      const bucket = Math.min(reps, REP_TABLE_MAX + 1)
      const current = repBest.get(bucket)
      if (!current || weight > current.weightKg)
        repBest.set(bucket, { reps: bucket, weightKg: weight, day })
    }
    if (type === 'weight_reps') {
      const e1rm = estimateOneRepMax(weight, reps)
      if (e1rm !== null && (!records.bestE1rm || e1rm > records.bestE1rm.value))
        records.bestE1rm = { value: e1rm, day }
      const volume = setVolume(set)
      if (!records.bestSetVolume || volume > records.bestSetVolume.value)
        records.bestSetVolume = { value: volume, day }
      const session = sessionVolume.get(workoutId) ?? { value: 0, day }
      session.value += volume
      sessionVolume.set(workoutId, session)
    }
  }

  for (const session of sessionVolume.values()) {
    if (!records.bestSessionVolume || session.value > records.bestSessionVolume.value)
      records.bestSessionVolume = session
  }
  records.repTable = [...repBest.values()].sort((a, b) => a.reps - b.reps)
  return records
}

/**
 * Which records a new set breaks, compared with earlier performances of the same exercise.
 * The very first session never shows PRs: there is nothing to beat yet.
 */
export function detectPRs(history: Performance[], set: WorkoutSet, type: ExerciseType): PRKind[] {
  if (!set.completed || set.type === 'warmup' || history.length === 0) return []
  const prev = history.map((p) => p.set)
  const kinds: PRKind[] = []

  if (type === 'time') {
    if ((set.seconds ?? 0) > Math.max(...prev.map((s) => s.seconds ?? 0))) kinds.push('duration')
    return kinds
  }
  if (type === 'distance') {
    if ((set.meters ?? 0) > Math.max(...prev.map((s) => s.meters ?? 0))) kinds.push('distance')
    return kinds
  }

  const weight = set.weightKg ?? 0
  const reps = set.reps ?? 0
  if (reps <= 0) return []

  if (type === 'assisted') {
    // Less assistance is better. A reps PR: more reps with the same or less help.
    const sameOrLess = prev.filter((s) => (s.weightKg ?? 0) >= weight)
    if (weight < Math.min(...prev.map((s) => s.weightKg ?? 0))) kinds.push('weight')
    else if (sameOrLess.length && reps > Math.max(...sameOrLess.map((s) => s.reps ?? 0)))
      kinds.push('reps')
    return kinds
  }

  if (weight > Math.max(...prev.map((s) => s.weightKg ?? 0))) kinds.push('weight')

  const atLeastAsHeavy = prev.filter((s) => (s.weightKg ?? 0) >= weight)
  if (atLeastAsHeavy.length > 0 && reps > Math.max(...atLeastAsHeavy.map((s) => s.reps ?? 0)))
    kinds.push('reps')

  if (type === 'weight_reps') {
    const e1rm = estimateOneRepMax(weight, reps)
    const best = Math.max(
      0,
      ...prev.map((s) => estimateOneRepMax(s.weightKg ?? 0, s.reps ?? 0) ?? 0),
    )
    if (e1rm !== null && best > 0 && e1rm > best && !kinds.includes('weight')) kinds.push('e1rm')
    if (setVolume(set) > Math.max(...prev.map(setVolume)) && kinds.length === 0)
      kinds.push('volume')
  }
  return kinds
}
