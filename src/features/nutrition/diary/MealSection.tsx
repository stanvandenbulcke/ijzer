import { Copy, Plus, Trash2 } from 'lucide-react'
import type { FoodLogRow } from '../../../data/db'
import { dayTotals } from '../../../domain/nutrition/macros'
import type { MealId } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Button, IconButton } from '../../../ui/Button'

const n = t.nutrition

function amountText(item: FoodLogRow): string {
  if (item.amount === null || !item.unit) return ''
  return `${formatNumber(item.amount, 1)} ${n.portion.unitShort[item.unit]}`
}

/** One meal: its items with kcal, add button, and "copy from yesterday" when empty. */
export function MealSection({
  meal,
  items,
  yesterdayCount,
  onAdd,
  onEdit,
  onRemove,
  onCopyYesterday,
}: {
  meal: MealId
  items: FoodLogRow[]
  yesterdayCount: number
  onAdd: () => void
  onEdit: (item: FoodLogRow) => void
  onRemove: (item: FoodLogRow) => void
  onCopyYesterday: () => void
}) {
  const total = dayTotals(items)
  const name = n.meals[meal]
  return (
    <section className="rounded-md border border-line bg-surface">
      <header className="flex items-center gap-2 px-4 pt-3 pb-1">
        <h2 className="flex-1 font-display text-2xl font-bold uppercase">{name}</h2>
        {items.length > 0 && (
          <span className="font-display text-xl font-bold">
            {formatNumber(total.kcal, 0)} <span className="text-sm text-muted">{n.kcal}</span>
          </span>
        )}
        <IconButton icon={Plus} label={n.addTo(name)} onClick={onAdd} filled />
      </header>
      {items.length === 0 ? (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          <p className="flex-1 text-sm text-muted">{n.emptyMeal}</p>
          {yesterdayCount > 0 && (
            <Button variant="ghost" icon={Copy} onClick={onCopyYesterday}>
              {n.copyYesterday}
            </Button>
          )}
        </div>
      ) : (
        <ul className="pb-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center border-t border-line pl-4">
              <button
                type="button"
                onClick={() => onEdit(item)}
                disabled={item.per100 === null}
                className="press flex min-h-14 min-w-0 flex-1 items-center gap-2 py-2 text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{item.name}</span>
                  <span className="truncate text-sm text-muted">
                    {[
                      amountText(item),
                      `E ${formatNumber(item.nutrients.protein, 0)} · K ${formatNumber(item.nutrients.carbs, 0)} · V ${formatNumber(item.nutrients.fat, 0)}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="font-display text-xl font-bold">
                  {formatNumber(item.nutrients.kcal, 0)}
                </span>
              </button>
              <IconButton
                icon={Trash2}
                label={`${n.remove}: ${item.name}`}
                onClick={() => onRemove(item)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
