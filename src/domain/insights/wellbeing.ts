import { estimateOneRepMax } from '../strength/e1rm'
import { localDay } from '../time'
import type { Performance } from '../training/types'

export interface CheckIn {
  /** "YYYY-MM-DD" */
  day: string
  /** 1 (bad) – 5 (great) */
  energy: number
  sleep: number
}

/**
 * Performance of one session relative to your own best before it: the mean, over exercises
 * you had done before, of (best e1RM today / best e1RM ever before). 1.02 = 2 % above your best.
 */
export function sessionPerformance(
  perfs: Performance[],
): Map<string, { day: string; ratio: number }> {
  const best = new Map<string, number>()
  const sessions = new Map<string, { day: string; byExercise: Map<string, number> }>()
  for (const p of perfs) {
    const e = estimateOneRepMax(p.set.weightKg ?? 0, p.set.reps ?? 0)
    if (e === null) continue
    const s = sessions.get(p.workoutId) ?? { day: p.day, byExercise: new Map<string, number>() }
    s.byExercise.set(p.exerciseId, Math.max(s.byExercise.get(p.exerciseId) ?? 0, e))
    sessions.set(p.workoutId, s)
  }
  const result = new Map<string, { day: string; ratio: number }>()
  for (const [workoutId, s] of sessions) {
    const ratios: number[] = []
    for (const [exerciseId, e] of s.byExercise) {
      const before = best.get(exerciseId)
      if (before) ratios.push(e / before)
      best.set(exerciseId, Math.max(before ?? 0, e))
    }
    if (ratios.length)
      result.set(workoutId, {
        day: s.day,
        ratio: ratios.reduce((a, b) => a + b, 0) / ratios.length,
      })
  }
  return result
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i]! - mx) * (ys[i]! - my)
    dx += (xs[i]! - mx) ** 2
    dy += (ys[i]! - my) ** 2
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0
}

export interface WellbeingInsight {
  factor: 'sleep' | 'energy'
  paired: number
  goodDays: number
  poorDays: number
  /** Mean performance on good (4–5) days minus poor (1–2) days, in % of your best. */
  differencePct: number
  correlation: number
}

/** Minimum data before a pattern is shown at all (Stan: only with enough data). */
export const MIN_PAIRED = 10
export const MIN_PER_GROUP = 3

/**
 * Links between your morning check-in and how strong you were that day (Stan's idea #6).
 * Only returns patterns with enough data; the UI always adds that a link is not a cause.
 */
export function wellbeingInsights(checkIns: CheckIn[], perfs: Performance[]): WellbeingInsight[] {
  const byDay = new Map(checkIns.map((c) => [c.day, c]))
  const pairs = [...sessionPerformance(perfs).values()]
    .map((s) => ({ ratio: s.ratio, checkIn: byDay.get(s.day) }))
    .filter((p): p is { ratio: number; checkIn: CheckIn } => p.checkIn !== undefined)
  const insights: WellbeingInsight[] = []
  for (const factor of ['sleep', 'energy'] as const) {
    // A half-filled check-in (only energy, say) counts only for the factor that was answered.
    const answered = pairs.filter((p) => p.checkIn[factor] >= 1 && p.checkIn[factor] <= 5)
    if (answered.length < MIN_PAIRED) continue
    const good = answered.filter((p) => p.checkIn[factor] >= 4)
    const poor = answered.filter((p) => p.checkIn[factor] <= 2)
    if (good.length < MIN_PER_GROUP || poor.length < MIN_PER_GROUP) continue
    const mean = (xs: typeof pairs) => xs.reduce((a, p) => a + p.ratio, 0) / xs.length
    insights.push({
      factor,
      paired: answered.length,
      goodDays: good.length,
      poorDays: poor.length,
      differencePct: (mean(good) - mean(poor)) * 100,
      correlation: pearson(
        answered.map((p) => p.checkIn[factor]),
        answered.map((p) => p.ratio),
      ),
    })
  }
  return insights
}

/** Training days that have a (complete) check-in: progress towards the first insight. */
export function pairedDays(checkIns: CheckIn[], perfs: Performance[]): number {
  const days = new Set(checkIns.filter((c) => c.energy >= 1 && c.sleep >= 1).map((c) => c.day))
  return [...sessionPerformance(perfs).values()].filter((s) => days.has(s.day)).length
}

/** Day of a check-in for "now", in Belgian time. */
export const todayKey = (now = new Date()) => localDay(now)
