import { addDays } from '../time'
import { dayTotals } from './macros'
import type { FoodLog, Nutrients } from './types'

export interface WeekSummary {
  days: Array<{ day: string; totals: Nutrients; logged: boolean; complete: boolean }>
  /** Averages over days with at least one entry (empty days are not zeros). */
  average: Nutrients | null
  loggedDays: number
  proteinGoalDays: number
}

/** The 7 days ending on `today`, honest about empty days (they count nowhere). */
export function weekSummary(
  logs: FoodLog[],
  completeDays: Set<string>,
  today: string,
  proteinTarget: number,
): WeekSummary {
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6)
    const items = logs.filter((l) => l.day === day)
    return {
      day,
      totals: dayTotals(items),
      logged: items.length > 0,
      complete: completeDays.has(day),
    }
  })
  const logged = days.filter((d) => d.logged)
  const mean = (pick: (n: Nutrients) => number) =>
    Math.round((logged.reduce((s, d) => s + pick(d.totals), 0) / logged.length) * 10) / 10
  return {
    days,
    average: logged.length
      ? {
          kcal: Math.round(mean((n) => n.kcal)),
          protein: mean((n) => n.protein),
          carbs: mean((n) => n.carbs),
          fat: mean((n) => n.fat),
          fiber: null,
        }
      : null,
    loggedDays: logged.length,
    proteinGoalDays: logged.filter((d) => d.totals.protein >= proteinTarget).length,
  }
}
