import { useLiveQuery } from 'dexie-react-hooks'
import { scale, gramsFor } from '../domain/nutrition/macros'
import type { Food, FoodLog, FoodUnit, MealId, Nutrients } from '../domain/nutrition/types'
import { db, type FoodLogRow, type FoodRow } from './db'
import { enqueue, newId, notDeleted, now, stamp } from './rows'

/** Own products ("Mijn producten"), favourites first, then by name. */
export async function listFoods(): Promise<FoodRow[]> {
  return (await db.foods.toArray())
    .filter(notDeleted)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name))
}
export const useFoods = () => useLiveQuery(listFoods)

export async function saveFood(food: Food): Promise<void> {
  await db.transaction('rw', db.foods, db.outbox, async () => {
    const existing = await db.foods.get(food.id)
    await db.foods.put(stamp({ ...existing, ...food, deletedAt: null }))
    await enqueue('foods', food.id)
  })
}

export async function setFoodDeleted(id: string, deleted: boolean): Promise<void> {
  await db.transaction('rw', db.foods, db.outbox, async () => {
    await db.foods.update(id, { deletedAt: deleted ? now() : null, updatedAt: now() })
    await enqueue('foods', id)
  })
}

/** Logged items of one day, in the order they were added. */
export function useDayLogs(day: string): FoodLogRow[] | undefined {
  return useLiveQuery(
    async () =>
      (await db.foodLogs.where('day').equals(day).toArray())
        .filter(notDeleted)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [day],
  )
}

/** Logs of the last `days` days up to `today` (week overview, recent foods). */
export function useRecentLogs(from: string): FoodLogRow[] | undefined {
  return useLiveQuery(
    async () => (await db.foodLogs.where('day').aboveOrEqual(from).toArray()).filter(notDeleted),
    [from],
  )
}

export function newLogFromFood(
  food: Food,
  day: string,
  meal: MealId,
  amount: number,
  unit: FoodUnit,
): FoodLog | null {
  const grams = gramsFor(amount, unit, food)
  if (grams === null) return null
  return {
    id: newId(),
    day,
    meal,
    foodId: food.id,
    name: food.brand ? `${food.name} (${food.brand})` : food.name,
    per100: food.per100,
    amount,
    unit,
    gramsPerPiece: food.gramsPerPiece,
    servingGrams: food.servingGrams,
    nutrients: scale(food.per100, grams),
  }
}

/** Adds or replaces a log item and remembers the amount on the product. */
export async function saveLog(log: FoodLog): Promise<void> {
  await db.transaction('rw', db.foodLogs, db.foods, db.outbox, async () => {
    const existing = await db.foodLogs.get(log.id)
    await db.foodLogs.put(stamp({ ...existing, ...log, deletedAt: null }))
    await enqueue('foodLogs', log.id)
    if (log.foodId && log.amount !== null && log.unit) {
      const food = await db.foods.get(log.foodId)
      if (food) {
        await db.foods.put(stamp({ ...food, lastAmount: { amount: log.amount, unit: log.unit } }))
        await enqueue('foods', food.id)
      }
    }
  })
}

export function quickLog(day: string, meal: MealId, name: string, nutrients: Nutrients): FoodLog {
  return {
    id: newId(),
    day,
    meal,
    foodId: null,
    name,
    per100: null,
    amount: null,
    unit: null,
    gramsPerPiece: null,
    servingGrams: null,
    nutrients,
  }
}

export async function setLogDeleted(id: string, deleted: boolean): Promise<void> {
  await db.transaction('rw', db.foodLogs, db.outbox, async () => {
    await db.foodLogs.update(id, { deletedAt: deleted ? now() : null, updatedAt: now() })
    await enqueue('foodLogs', id)
  })
}

/** Copies items (e.g. yesterday's lunch) to another day and meal as new entries. */
export async function copyLogs(items: FoodLog[], day: string, meal?: MealId): Promise<number> {
  for (const item of items) await saveLog({ ...item, id: newId(), day, meal: meal ?? item.meal })
  return items.length
}

/** Days marked "volledig gelogd". */
export function useCompleteDays(): Set<string> | undefined {
  return useLiveQuery(
    async () =>
      new Set(
        (await db.nutritionDays.toArray())
          .filter((d) => notDeleted(d) && d.complete)
          .map((d) => d.day),
      ),
  )
}

export async function setDayComplete(day: string, complete: boolean): Promise<void> {
  await db.transaction('rw', db.nutritionDays, db.outbox, async () => {
    const existing = await db.nutritionDays.where('day').equals(day).first()
    const row = stamp({ ...existing, id: existing?.id ?? newId(), day, complete, deletedAt: null })
    await db.nutritionDays.put(row)
    await enqueue('nutritionDays', row.id)
  })
}
