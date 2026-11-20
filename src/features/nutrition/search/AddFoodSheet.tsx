import { ArrowLeft, Plus, Star, Zap } from 'lucide-react'
import { useState } from 'react'
import { saveFood, useFoods } from '../../../data/nutritionRepo'
import { normalize } from '../../../domain/exercises/search'
import type { Food } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'
import { FoodForm } from '../foods/FoodForm'

const s = t.nutrition.search

function FoodRowButton({ food, onPick }: { food: Food; onPick: (f: Food) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(food)}
      className="press flex min-h-14 w-full items-center gap-3 border-t border-line py-2 text-left"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 truncate font-semibold">
          {food.favorite && <Star aria-hidden size={14} className="shrink-0 text-accent-text" />}
          {food.name}
        </span>
        <span className="truncate text-sm text-muted">
          {[food.brand, t.nutrition.foods.per100(formatNumber(food.per100.kcal, 0), food.liquid)]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      <Plus aria-hidden className="shrink-0 text-accent-text" />
    </button>
  )
}

/**
 * Find what you ate (SPEC §4.5): your own products and recently used ones first. Not found?
 * Make it once (values from the label) or quick-add only kcal and macros.
 */
export function AddFoodSheet({
  open,
  onOpenChange,
  title,
  recentIds,
  onPick,
  onQuickAdd,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  recentIds: string[]
  onPick: (food: Food) => void
  onQuickAdd: () => void
}) {
  const foods = useFoods()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState<string | null>(null)
  const close = (o: boolean) => {
    if (!o) {
      setQuery('')
      setCreating(null)
    }
    onOpenChange(o)
  }
  const q = normalize(query)
  const matches = (foods ?? []).filter(
    (f) => !q || normalize(`${f.name} ${f.brand ?? ''}`).includes(q),
  )
  const byId = new Map((foods ?? []).map((f) => [f.id, f]))
  const recent = q
    ? []
    : recentIds.map((id) => byId.get(id)).filter((f): f is NonNullable<typeof f> => Boolean(f))

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={creating !== null ? t.nutrition.food.newTitle : title}
    >
      {creating !== null ? (
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            className="self-start px-0"
            onClick={() => setCreating(null)}
          >
            {s.title}
          </Button>
          <FoodForm
            initial={null}
            initialName={creating}
            submitLabel={t.nutrition.food.saveAndLog}
            onSaved={async (food) => {
              await saveFood(food)
              setCreating(null)
              onPick(food)
            }}
          />
        </div>
      ) : (
        <div className="flex min-h-[60dvh] flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-muted">{s.field}</span>
            <input
              type="search"
              value={query}
              placeholder={s.placeholder}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-12 rounded-sm border border-line-strong bg-surface px-3 outline-none placeholder:text-muted focus:border-focus"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={Zap} onClick={onQuickAdd}>
              {s.quickAdd}
            </Button>
            <Button variant="secondary" icon={Plus} onClick={() => setCreating(query.trim())}>
              {s.newFood}
            </Button>
          </div>
          {recent.length > 0 && (
            <section>
              <h3 className="mb-1 text-xs font-semibold tracking-widest text-muted uppercase">
                {s.recent}
              </h3>
              {recent.map((f) => (
                <FoodRowButton key={`r-${f.id}`} food={f} onPick={onPick} />
              ))}
            </section>
          )}
          <section>
            <h3 className="mb-1 text-xs font-semibold tracking-widest text-muted uppercase">
              {s.mine}
            </h3>
            {matches.map((f) => (
              <FoodRowButton key={f.id} food={f} onPick={onPick} />
            ))}
            {matches.length === 0 && (
              <div className="flex flex-col gap-2 py-3">
                <p className="text-muted">{s.none}</p>
                {query.trim() && (
                  <Button variant="secondary" icon={Plus} onClick={() => setCreating(query.trim())}>
                    {s.newNamed(query.trim())}
                  </Button>
                )}
              </div>
            )}
          </section>
          <p className="text-sm text-muted">{s.scanSoon}</p>
        </div>
      )}
    </Sheet>
  )
}
