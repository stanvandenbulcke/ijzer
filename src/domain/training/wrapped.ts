import { estimateOneRepMax } from '../strength/e1rm'
import { localDay, weekStart } from '../time'
import { fractionalSets, type MuscleVolume } from '../volume/fractionalSets'
import type { MuscleId } from '../muscles/taxonomy'
import { performances, workoutVolumeKg } from './performances'
import { summarizeWorkout } from './summary'
import type { Exercise, Workout } from './types'

export interface Wrapped {
  from: string
  to: string
  workouts: number
  minutes: number
  tonnageKg: number
  sets: number
  reps: number
  activeDays: number
  bestWeek: { week: string; workouts: number } | null
  topPrs: Array<{ exerciseId: string; weightKg: number; reps: number }>
  favoriteExercise: { exerciseId: string; sets: number } | null
  topMuscle: { muscle: MuscleId; sets: number } | null
  muscles: MuscleVolume
}

/** First and last day of a period: "2026-11" (month) or "2026" (year). */
export function periodRange(period: string): { from: string; to: string } {
  if (/^\d{4}$/.test(period)) return { from: `${period}-01-01`, to: `${period}-12-31` }
  const [y, m] = period.split('-').map(Number) as [number, number]
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { from: `${period}-01`, to: `${period}-${String(last).padStart(2, '0')}` }
}

/** Your month or year in numbers, for the story-style recap (Stan's idea #2). */
export function computeWrapped(
  allFinished: Workout[],
  byId: (id: string) => Exercise | undefined,
  period: string,
): Wrapped {
  const { from, to } = periodRange(period)
  const typeOf = (id: string) => byId(id)?.type
  const inPeriod = allFinished.filter((w) => {
    const day = localDay(w.startedAt)
    return w.finishedAt && day >= from && day <= to
  })
  const perfs = performances(inPeriod, { typeOf })

  const weeks = new Map<string, number>()
  const days = new Set<string>()
  for (const w of inPeriod) {
    const day = localDay(w.startedAt)
    days.add(day)
    weeks.set(weekStart(day), (weeks.get(weekStart(day)) ?? 0) + 1)
  }
  const bestWeek = [...weeks.entries()].sort((a, b) => b[1] - a[1])[0]

  const perExercise = new Map<string, number>()
  for (const p of perfs) perExercise.set(p.exerciseId, (perExercise.get(p.exerciseId) ?? 0) + 1)
  const favorite = [...perExercise.entries()].sort((a, b) => b[1] - a[1])[0]

  const muscles = fractionalSets(perfs, byId)
  const top = (Object.entries(muscles) as Array<[MuscleId, number]>).sort((a, b) => b[1] - a[1])[0]

  const prs = new Map<
    string,
    { exerciseId: string; weightKg: number; reps: number; e1rm: number }
  >()
  for (const w of inPeriod) {
    for (const pr of summarizeWorkout(w, allFinished, byId).prs) {
      const e1rm = estimateOneRepMax(pr.weightKg ?? 0, pr.reps ?? 0) ?? 0
      const cur = prs.get(pr.exerciseId)
      if (!cur || e1rm > cur.e1rm)
        prs.set(pr.exerciseId, {
          exerciseId: pr.exerciseId,
          weightKg: pr.weightKg ?? 0,
          reps: pr.reps ?? 0,
          e1rm,
        })
    }
  }

  return {
    from,
    to,
    workouts: inPeriod.length,
    minutes: inPeriod.reduce(
      (m, w) => m + (Date.parse(w.finishedAt!) - Date.parse(w.startedAt)) / 60_000,
      0,
    ),
    tonnageKg: inPeriod.reduce((t, w) => t + workoutVolumeKg(w, typeOf), 0),
    sets: perfs.length,
    reps: perfs.reduce((n, p) => n + (p.set.reps ?? 0), 0),
    activeDays: days.size,
    bestWeek: bestWeek ? { week: bestWeek[0], workouts: bestWeek[1] } : null,
    topPrs: [...prs.values()]
      .sort((a, b) => b.e1rm - a.e1rm)
      .slice(0, 3)
      .map((r) => ({ exerciseId: r.exerciseId, weightKg: r.weightKg, reps: r.reps })),
    favoriteExercise: favorite ? { exerciseId: favorite[0], sets: favorite[1] } : null,
    topMuscle: top ? { muscle: top[0], sets: top[1] } : null,
    muscles,
  }
}
