import { useState } from 'react'
import { gramsFor, scale } from '../../../domain/nutrition/macros'
import type { Food, FoodUnit, MealId } from '../../../domain/nutrition/types'
import { MEALS } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { NumberPad, type QuickValue } from '../../../ui/number-pad/NumberPad'
import { Sheet } from '../../../ui/Sheet'

const p = t.nutrition.portion

export interface PortionTarget {
  food: Pick<Food, 'name' | 'per100' | 'liquid' | 'gramsPerPiece' | 'servingGrams' | 'lastAmount'>
  meal: MealId
  amount?: number
  unit?: FoodUnit
  editing: boolean
}

function unitsFor(food: PortionTarget['food']): FoodUnit[] {
  return [
    food.liquid ? 'ml' : 'g',
    ...(food.gramsPerPiece ? (['piece'] as const) : []),
    ...(food.servingGrams ? (['serving'] as const) : []),
  ]
}

/**
 * How much did you eat (SPEC §4.5): big number, our keypad, unit chips, shortcuts (last time,
 * 1 portion, 50–200 g) and live kcal/macros. The same sheet edits a logged item.
 */
export function PortionSheet({
  target,
  onClose,
  onSave,
}: {
  target: PortionTarget | null
  onClose: () => void
  onSave: (amount: number, unit: FoodUnit, meal: MealId) => void
}) {
  return (
    <Sheet
      open={target !== null}
      onOpenChange={(o) => !o && onClose()}
      title={target?.food.name ?? ''}
    >
      {target && <Portion key={target.food.name} target={target} onSave={onSave} />}
    </Sheet>
  )
}

function Portion({
  target,
  onSave,
}: {
  target: PortionTarget
  onSave: (amount: number, unit: FoodUnit, meal: MealId) => void
}) {
  const { food } = target
  const units = unitsFor(food)
  const remembered =
    food.lastAmount && units.includes(food.lastAmount.unit) ? food.lastAmount : null
  const [unit, setUnit] = useState<FoodUnit>(target.unit ?? remembered?.unit ?? units[0]!)
  const [amount, setAmount] = useState<number | null>(
    target.amount ?? remembered?.amount ?? (unit === 'piece' || unit === 'serving' ? 1 : 100),
  )
  const [meal, setMeal] = useState<MealId>(target.meal)
  const grams = amount === null ? null : gramsFor(amount, unit, food)
  const live = grams === null ? null : scale(food.per100, grams)
  const whole = unit === 'piece' || unit === 'serving'
  const quick: QuickValue[] = whole
    ? [1, 2, 3].map((v) => ({ label: `${v} ${p.unitShort[unit]}`, value: v }))
    : [
        ...(remembered && remembered.unit === unit
          ? [{ label: p.last, value: remembered.amount }]
          : []),
        ...(unit === 'ml' ? [100, 200, 250, 330, 500] : [50, 100, 150, 200]).map((v) => ({
          label: `${v} ${p.unitShort[unit]}`,
          value: v,
        })),
      ]

  return (
    <div className="flex flex-col gap-3">
      {units.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={p.amount}>
          {units.map((u) => (
            <Chip
              key={u}
              selected={unit === u}
              onClick={() => {
                setUnit(u)
                setAmount(u === 'piece' || u === 'serving' ? 1 : 100)
              }}
            >
              {p.units[u]}
            </Chip>
          ))}
        </div>
      )}
      <p className="text-center text-sm text-muted" aria-live="polite">
        {live
          ? p.live(
              formatNumber(live.kcal, 0),
              formatNumber(live.protein, 1),
              formatNumber(live.carbs, 1),
              formatNumber(live.fat, 1),
            )
          : '–'}
      </p>
      <NumberPad
        key={unit}
        label={p.amount}
        value={amount}
        onChange={setAmount}
        unit={p.unitShort[unit]}
        step={whole ? 1 : 10}
        maxDecimals={whole ? 1 : 0}
        quickValues={quick}
        onDone={() => amount !== null && amount > 0 && onSave(amount, unit, meal)}
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label={p.meal}>
        {MEALS.map((m) => (
          <Chip key={m} selected={meal === m} onClick={() => setMeal(m)}>
            {t.nutrition.meals[m]}
          </Chip>
        ))}
      </div>
    </div>
  )
}
