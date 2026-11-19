import { MUSCLE_IDS, MUSCLE_REGION, type MuscleId } from '../muscles/taxonomy'
import { daysBetween } from '../time'
import { e1rmSeries } from '../training/series'
import type { Exercise, Performance } from '../training/types'
import { fractionalSets, volumeZone, type MuscleVolume } from '../volume/fractionalSets'
import { lastDays } from '../volume/weekly'
import { THRESHOLDS } from './thresholds'

/**
 * The "scientific coach" (SPEC §5.3). Each rule is a pure function; the UI turns the id and
 * data into text and links "Waarom?" to the right article. Rules of thumb are marked as such.
 */
export type Severity = 'info' | 'tip' | 'waarschuwing'

export type Insight =
  | { id: 'R1_low'; severity: Severity; muscles: Array<{ muscle: MuscleId; sets: number }> }
  | { id: 'R1_high'; severity: Severity; muscles: Array<{ muscle: MuscleId; sets: number }> }
  | { id: 'R2'; severity: Severity; muscle: MuscleId; sets: number; day: string }
  | { id: 'R3'; severity: Severity; averageRir: number; sets: number }
  | { id: 'R4'; severity: Severity; medianSec: number }
  | { id: 'R5'; severity: Severity; muscle: MuscleId; suggestion: string }
  | {
      id: 'R6'
      severity: Severity
      pair: 'push_pull' | 'quads_hams' | 'front_rear'
      ratio: number
      strong: string
    }
  | { id: 'R7'; severity: Severity; exerciseId: string; sessions: number }
  | { id: 'R8'; severity: Severity; declining: number }
  | { id: 'R9'; severity: Severity; muscle: MuscleId; sets: number }

export interface AnalysisInput {
  perfs: Performance[]
  byId: (id: string) => Exercise | undefined
  today: string
  cutting: boolean
}

/** Exercises with the lengthened flag to suggest per muscle (R5, SPEC Bijlage A6). */
export const LENGTHENED_SUGGESTION: Partial<Record<MuscleId, string>> = {
  triceps: 'Cable_Rope_Overhead_Triceps_Extension',
  hamstrings: 'Seated_Leg_Curl',
  calves: 'Standing_Calf_Raises',
  biceps: 'Incline_Dumbbell_Curl',
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

function regionSum(volume: MuscleVolume, region: string): number {
  return MUSCLE_IDS.filter((m) => MUSCLE_REGION[m] === region).reduce(
    (s, m) => s + (volume[m] ?? 0),
    0,
  )
}

export function analyse({ perfs, byId, today, cutting }: AnalysisInput): Insight[] {
  const insights: Insight[] = []
  const week = lastDays(perfs, today, 7)
  const fourWeeks = lastDays(perfs, today, 28)
  if (fourWeeks.length === 0) return insights

  // R1 — weekly volume per muscle, for muscles trained in the last 4 weeks.
  const weekVolume = fractionalSets(week, byId)
  const monthVolume = fractionalSets(fourWeeks, byId)
  const trained = MUSCLE_IDS.filter((m) => (monthVolume[m] ?? 0) >= 2)
  const low = trained.filter((m) => ['none', 'low'].includes(volumeZone(weekVolume[m] ?? 0)))
  const high = MUSCLE_IDS.filter((m) => volumeZone(weekVolume[m] ?? 0) === 'veryHigh')
  if (low.length)
    insights.push({
      id: 'R1_low',
      severity: 'tip',
      muscles: low.map((m) => ({ muscle: m, sets: weekVolume[m] ?? 0 })),
    })
  if (high.length)
    insights.push({
      id: 'R1_high',
      severity: 'waarschuwing',
      muscles: high.map((m) => ({ muscle: m, sets: weekVolume[m]! })),
    })

  // R2 / R9 — too many sets for one muscle in one session.
  const sessions = new Map<string, Performance[]>()
  for (const p of week) sessions.set(p.workoutId, [...(sessions.get(p.workoutId) ?? []), p])
  const sessionsPerMuscle = new Map<MuscleId, number>()
  let worst: { muscle: MuscleId; sets: number; day: string } | null = null
  for (const list of sessions.values()) {
    const v = fractionalSets(list, byId)
    for (const m of MUSCLE_IDS) {
      if ((v[m] ?? 0) > 0) sessionsPerMuscle.set(m, (sessionsPerMuscle.get(m) ?? 0) + 1)
      if ((v[m] ?? 0) > THRESHOLDS.perSession && (!worst || v[m]! > worst.sets))
        worst = { muscle: m, sets: v[m]!, day: list[0]!.day }
    }
  }
  if (worst) {
    if (sessionsPerMuscle.get(worst.muscle) === 1 && worst.sets > 12)
      insights.push({ id: 'R9', severity: 'tip', muscle: worst.muscle, sets: worst.sets })
    else insights.push({ id: 'R2', severity: 'tip', ...worst })
  }

  // R3 — effort: average logged RIR of working sets in the last two weeks.
  const withRir = lastDays(perfs, today, 14).filter(
    (p) => p.set.rir !== null && p.set.type !== 'warmup',
  )
  if (withRir.length >= 6) {
    const avg = withRir.reduce((s, p) => s + p.set.rir!, 0) / withRir.length
    if (avg > THRESHOLDS.averageRir)
      insights.push({ id: 'R3', severity: 'tip', averageRir: avg, sets: withRir.length })
  }

  // R4 — rest between sets of compounds, from the tick timestamps.
  const gaps: number[] = []
  for (const list of sessions.values()) {
    const byExercise = new Map<string, number[]>()
    for (const p of list) {
      if (byId(p.exerciseId)?.mechanic !== 'compound' || !p.set.completedAt) continue
      byExercise.set(p.exerciseId, [
        ...(byExercise.get(p.exerciseId) ?? []),
        Date.parse(p.set.completedAt),
      ])
    }
    for (const times of byExercise.values()) {
      times.sort((a, b) => a - b)
      for (let i = 1; i < times.length; i++) {
        const gap = (times[i]! - times[i - 1]!) / 1000
        if (gap > 0 && gap < 600) gaps.push(gap)
      }
    }
  }
  if (gaps.length >= 6 && median(gaps) < THRESHOLDS.minRestSec)
    insights.push({ id: 'R4', severity: 'tip', medianSec: median(gaps) })

  // R5 — trained weekly but never at long muscle length.
  for (const muscle of Object.keys(LENGTHENED_SUGGESTION) as MuscleId[]) {
    const direct = lastDays(perfs, today, 14).filter((p) =>
      byId(p.exerciseId)?.muscles.some((m) => m.muscle === muscle && m.weight === 1),
    )
    if (direct.length >= 3 && !direct.some((p) => byId(p.exerciseId)?.lengthened)) {
      insights.push({
        id: 'R5',
        severity: 'info',
        muscle,
        suggestion: LENGTHENED_SUGGESTION[muscle]!,
      })
    }
  }

  // R6 — balance over 4 weeks (rule of thumb: more than 2:1).
  const pairs: Array<[Extract<Insight, { id: 'R6' }>['pair'], number, number, string, string]> = [
    ['push_pull', regionSum(monthVolume, 'push'), regionSum(monthVolume, 'pull'), 'push', 'pull'],
    ['quads_hams', monthVolume.quads ?? 0, monthVolume.hamstrings ?? 0, 'quads', 'hamstrings'],
    [
      'front_rear',
      monthVolume.front_delts ?? 0,
      monthVolume.rear_delts ?? 0,
      'front_delts',
      'rear_delts',
    ],
  ]
  for (const [pair, a, b, nameA, nameB] of pairs) {
    if (a + b < 8) continue
    const ratio = Math.max(a, b) / Math.max(0.5, Math.min(a, b))
    if (ratio > THRESHOLDS.balanceRatio)
      insights.push({ id: 'R6', severity: 'tip', pair, ratio, strong: a > b ? nameA : nameB })
  }

  // R7 / R8 — stagnation and possible fatigue per exercise.
  const exerciseIds = [...new Set(fourWeeks.map((p) => p.exerciseId))]
  let declining = 0
  for (const id of exerciseIds) {
    const series = e1rmSeries(perfs.filter((p) => p.exerciseId === id))
    const lastFour = series.slice(-4)
    if (
      lastFour.length === 4 &&
      daysBetween(lastFour[0]!.day, lastFour[3]!.day) >= THRESHOLDS.stagnation.minDays &&
      Math.max(...lastFour.slice(1).map((p) => p.value)) <= lastFour[0]!.value
    ) {
      insights.push({ id: 'R7', severity: cutting ? 'info' : 'tip', exerciseId: id, sessions: 4 })
    }
    const [prev, last] = series.slice(-2)
    if (prev && last && daysBetween(prev.day, today) <= 14 && last.value < prev.value) declining++
  }
  const anyHigh = MUSCLE_IDS.some((m) =>
    ['high', 'veryHigh'].includes(volumeZone(weekVolume[m] ?? 0)),
  )
  if (declining >= 3 && anyHigh) insights.push({ id: 'R8', severity: 'waarschuwing', declining })

  const order: Record<Severity, number> = { waarschuwing: 0, tip: 1, info: 2 }
  return insights.sort((a, b) => order[a.severity] - order[b.severity])
}

export type Freshness = 'fresh' | 'recovering' | 'just_trained'

/**
 * R10 "frisheid" — explicitly an estimate, not a measurement: hours since a muscle was last
 * trained, weighed by how many sets it got. More sets need more time.
 */
export function freshness(
  perfs: Performance[],
  byId: (id: string) => Exercise | undefined,
  nowIso: string,
): Partial<Record<MuscleId, Freshness>> {
  const result: Partial<Record<MuscleId, Freshness>> = {}
  const recent = perfs.filter(
    (p) => (Date.parse(nowIso) - Date.parse(p.set.completedAt ?? p.finishedAt)) / 3_600_000 < 96,
  )
  for (const muscle of MUSCLE_IDS) {
    const hits = recent.filter((p) => byId(p.exerciseId)?.muscles.some((m) => m.muscle === muscle))
    if (!hits.length) continue
    const last = Math.max(...hits.map((p) => Date.parse(p.set.completedAt ?? p.finishedAt)))
    const hours = (Date.parse(nowIso) - last) / 3_600_000
    const sets = fractionalSets(hits, byId)[muscle] ?? 0
    const needed = 24 + sets * 4 // rule of thumb
    result[muscle] = hours < needed * 0.5 ? 'just_trained' : hours < needed ? 'recovering' : 'fresh'
  }
  return result
}
