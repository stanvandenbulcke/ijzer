import { Plus, Star } from 'lucide-react'
import { useState } from 'react'
import type { FoodRow } from '../../../data/db'
import { saveFood, setFoodDeleted, useFoods } from '../../../data/nutritionRepo'
import { normalize } from '../../../domain/exercises/search'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { EmptyState } from '../../../ui/EmptyState'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { Sheet } from '../../../ui/Sheet'
import { useToast } from '../../../ui/toast/toastContext'
import { FoodForm } from './FoodForm'

const f = t.nutrition.foods

/** /voeding/producten — your own products: search, edit, favourite, delete with undo. */
export function FoodsPage() {
  const foods = useFoods()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<FoodRow | 'new' | null>(null)
  if (!foods) return <LoadingState />
  const q = normalize(query)
  const shown = foods.filter((x) => !q || normalize(`${x.name} ${x.brand ?? ''}`).includes(q))

  return (
    <Page>
      <PageHeader title={f.title} back="/voeding" />
      <div className="flex flex-col gap-3">
        <Button icon={Plus} block onClick={() => setEditing('new')}>
          {f.add}
        </Button>
        {foods.length > 0 && (
          <input
            type="search"
            aria-label={t.nutrition.search.field}
            placeholder={t.nutrition.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-12 rounded-sm border border-line-strong bg-surface px-3 outline-none placeholder:text-muted focus:border-focus"
          />
        )}
        {foods.length === 0 && <EmptyState title={f.title} body={f.empty} />}
        <ul>
          {shown.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => setEditing(food)}
                className="press flex min-h-14 w-full items-center gap-3 border-t border-line py-2 text-left"
              >
                {food.favorite && <Star aria-hidden size={16} className="text-accent-text" />}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{food.name}</span>
                  <span className="truncate text-sm text-muted">
                    {[food.brand, f.per100(formatNumber(food.per100.kcal, 0), food.liquid)]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Sheet
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === 'new' ? t.nutrition.food.newTitle : t.nutrition.food.editTitle}
      >
        {editing !== null && (
          <div className="flex flex-col gap-3">
            <FoodForm
              initial={editing === 'new' ? null : editing}
              submitLabel={t.nutrition.food.save}
              onSaved={async (food) => {
                await saveFood(food)
                setEditing(null)
              }}
            />
            {editing !== 'new' && (
              <Button
                variant="danger"
                block
                onClick={async () => {
                  const id = editing.id
                  await setFoodDeleted(id, true)
                  setEditing(null)
                  toast({
                    message: t.nutrition.food.deleted,
                    action: {
                      label: t.nutrition.undo,
                      onAction: () => void setFoodDeleted(id, false),
                    },
                  })
                }}
              >
                {t.nutrition.remove}
              </Button>
            )}
          </div>
        )}
      </Sheet>
    </Page>
  )
}
