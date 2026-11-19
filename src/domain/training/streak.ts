import { addDays, localDay, weekStart } from '../time'

export interface WeekStatus {
  /** Days (Mon…Sun of this week) with at least one finished workout. */
  trainedDays: string[]
  count: number
  goal: number
  /** Weeks in a row before this one that reached the goal. Rest days never break it. */
  streakWeeks: number
}

/**
 * Weekly streak (SPEC §4.9): "3/4 trainingen deze week". Counted per week, so rest days are
 * never punished; the current week only adds to the streak once the goal is reached.
 */
export function weekStatus(workoutStarts: string[], today: string, goal: number): WeekStatus {
  const thisWeek = weekStart(today)
  const days = new Set(workoutStarts.map((iso) => localDay(iso)))
  const perWeek = new Map<string, number>()
  for (const day of days) {
    const w = weekStart(day)
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1)
  }
  const trainedDays = [...days].filter((d) => weekStart(d) === thisWeek).sort()
  let streak = 0
  for (let w = addDays(thisWeek, -7); (perWeek.get(w) ?? 0) >= goal; w = addDays(w, -7)) streak++
  if (trainedDays.length >= goal) streak++
  return { trainedDays, count: trainedDays.length, goal, streakWeeks: streak }
}
