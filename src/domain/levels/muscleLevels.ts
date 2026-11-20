import { estimateOneRepMax } from '../strength/e1rm'
import { MUSCLE_IDS, type MuscleId } from '../muscles/taxonomy'
import type { Exercise, Performance } from '../training/types'

/** Points for one set: 1 for a direct muscle, 0.5 for an indirect one (fractional sets). */
export const POINTS_PER_SET = 1
/** Bonus points per session in which a direct exercise got a new best e1RM. */
export const PR_BONUS = 10
export const MAX_LEVEL = 20

/** Points needed to reach a level: 10 × (level − 1)². Level 2 at 10, 5 at 160, 10 at 810. */
export function pointsForLevel(level: number): number {
  return 10 * (level - 1) ** 2
}

export function levelFromPoints(points: number): number {
  return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, points) / 10)) + 1)
}

export interface MuscleLevel {
  muscle: MuscleId
  level: number
  points: number
  /** 0–1 progress towards the next level. */
  progress: number
  sets: number
  prSessions: number
}

/**
 * Muscle levels (Stan's idea #3): volume over time plus strength progress. Every completed
 * working set adds its fractional sets; every session where an exercise that trains the muscle
 * directly beat its best e1RM adds a bonus. Honest rules as everywhere (performances only).
 */
export function muscleLevels(
  perfs: Performance[],
  byId: (id: string) => Exercise | undefined,
): MuscleLevel[] {
  const sets = new Map<MuscleId, number>()
  const prs = new Map<MuscleId, number>()
  const best = new Map<string, number>()
  const sessionBest = new Map<string, { exerciseId: string; e1rm: number }>()

  for (const p of perfs) {
    const exercise = byId(p.exerciseId)
    if (!exercise) continue
    for (const { muscle, weight } of exercise.muscles)
      sets.set(muscle, (sets.get(muscle) ?? 0) + weight * POINTS_PER_SET)
    const e = estimateOneRepMax(p.set.weightKg ?? 0, p.set.reps ?? 0)
    if (e === null) continue
    const key = `${p.workoutId}|${p.exerciseId}`
    const cur = sessionBest.get(key)
    if (!cur || e > cur.e1rm) sessionBest.set(key, { exerciseId: p.exerciseId, e1rm: e })
  }
  // Sessions in order (perfs are oldest first, Map keeps insertion order).
  for (const { exerciseId, e1rm } of sessionBest.values()) {
    const previous = best.get(exerciseId)
    if (previous !== undefined && e1rm > previous) {
      for (const { muscle, weight } of byId(exerciseId)?.muscles ?? []) {
        if (weight === 1) prs.set(muscle, (prs.get(muscle) ?? 0) + 1)
      }
    }
    best.set(exerciseId, Math.max(previous ?? 0, e1rm))
  }

  return MUSCLE_IDS.map((muscle) => {
    const s = sets.get(muscle) ?? 0
    const pr = prs.get(muscle) ?? 0
    const points = s + pr * PR_BONUS
    const level = levelFromPoints(points)
    const from = pointsForLevel(level)
    const to = pointsForLevel(level + 1)
    return {
      muscle,
      level,
      points,
      progress: level >= MAX_LEVEL ? 1 : (points - from) / (to - from),
      sets: s,
      prSessions: pr,
    }
  })
}

export type LevelTier = 'plate5' | 'plate10' | 'plate15' | 'plate20' | 'plate25'

/** Tiers named after bumper plates: 1 = 5 kg, 2–4 = 10 kg, 5–8 = 15 kg, 9–12 = 20 kg, 13+ = 25 kg. */
export function levelTier(level: number): LevelTier {
  if (level <= 1) return 'plate5'
  if (level <= 4) return 'plate10'
  if (level <= 8) return 'plate15'
  if (level <= 12) return 'plate20'
  return 'plate25'
}
