import type { MuscleId } from '../muscles/taxonomy'
import { addDays, daysBetween, weekStart } from '../time'
import type { Exercise, Performance } from '../training/types'
import { fractionalSets, type MuscleVolume } from './fractionalSets'

/** Performances in the last `days` days up to and including `today`. */
export function lastDays(perfs: Performance[], today: string, days: number): Performance[] {
  return perfs.filter((p) => {
    const age = daysBetween(p.day, today)
    return age >= 0 && age < days
  })
}

/** Fractional sets per muscle per calendar week (Monday), oldest first, `weeks` weeks back. */
export function weeklyVolume(
  perfs: Performance[],
  byId: (id: string) => Exercise | undefined,
  today: string,
  weeks: number,
): Array<{ week: string; volume: MuscleVolume }> {
  const current = weekStart(today)
  return Array.from({ length: weeks }, (_, i) => {
    const week = addDays(current, -7 * (weeks - 1 - i))
    const inWeek = perfs.filter((p) => weekStart(p.day) === week)
    return { week, volume: fractionalSets(inWeek, byId) }
  })
}

/** Per exercise, how many fractional sets it gave a muscle in a period ("welke oefeningen bijdragen"). */
export function contributors(
  perfs: Performance[],
  byId: (id: string) => Exercise | undefined,
  muscle: MuscleId,
): Array<{ exerciseId: string; sets: number }> {
  const totals = new Map<string, number>()
  for (const p of perfs) {
    const weight = byId(p.exerciseId)?.muscles.find((m) => m.muscle === muscle)?.weight
    if (weight && p.set.type !== 'warmup')
      totals.set(p.exerciseId, (totals.get(p.exerciseId) ?? 0) + weight)
  }
  return [...totals.entries()]
    .map(([exerciseId, sets]) => ({ exerciseId, sets }))
    .sort((a, b) => b.sets - a.sets)
}
