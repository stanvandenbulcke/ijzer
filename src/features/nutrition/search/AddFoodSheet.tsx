import { ArrowLeft, Plus, ScanBarcode, Star, Zap } from 'lucide-react'
import { useCallback, useState } from 'react'
import { lookupBarcode } from '../../../data/foodLookup'
import { saveFood, useFoods } from '../../../data/nutritionRepo'
import { newId } from '../../../data/rows'
import { normalize } from '../../../domain/exercises/search'
import type { Food } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'
import { FoodForm } from '../foods/FoodForm'
import { BarcodeScanner } from '../scan/BarcodeScanner'

const s = t.nutrition.search
const sc = t.nutrition.scan

/** What the sheet shows: the list, the camera, or the product form (new / from a barcode). */
type View =
  | { kind: 'list' }
  | { kind: 'scan'; busy: boolean }
  | {
      kind: 'create'
      initial: Food | null
      name: string
      barcode?: string
      notice: string | null
    }

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

const emptyFood = (barcode: string): Food => ({
  id: newId(),
  name: '',
  brand: null,
  barcode,
  per100: { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: null },
  liquid: false,
  gramsPerPiece: null,
  servingGrams: null,
  favorite: false,
  lastAmount: null,
})

/**
 * Find what you ate (SPEC §4.5): your own products and recently used ones first, a barcode
 * scan (own products, then Open Food Facts), or make it once / quick-add kcal and macros.
 * Scanned values always land in an editable form first: nothing is saved unchecked.
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
  const [view, setView] = useState<View>({ kind: 'list' })
  const close = (o: boolean) => {
    if (!o) {
      setQuery('')
      setView({ kind: 'list' })
    }
    onOpenChange(o)
  }

  const onCode = useCallback(
    async (code: string) => {
      setView({ kind: 'scan', busy: true })
      const result = await lookupBarcode(code)
      if (result.kind === 'own') return onPick(result.food)
      if (result.kind === 'found') {
        const f = result.food
        const missing = f.missing
          .map((k) => (k === 'kcal' ? t.nutrition.kcal : t.nutrition.macros[k]))
          .join(', ')
        return setView({
          kind: 'create',
          name: f.name,
          initial: {
            ...emptyFood(code),
            name: f.name,
            brand: f.brand,
            per100: f.per100,
            liquid: f.liquid,
            servingGrams: f.servingGrams,
          },
          notice: f.missing.length ? `${sc.found} ${sc.missing(missing)}` : sc.found,
        })
      }
      const notice = {
        'not-found': sc.notFound,
        'signed-out': sc.signedOut,
        offline: sc.offline,
        limit: sc.limit,
        error: sc.error,
        unavailable: sc.unavailable,
      }[result.kind]
      // Not found: an empty form (never zeros pretending to be values) with the barcode filled in.
      setView({ kind: 'create', name: '', initial: null, barcode: code, notice })
    },
    [onPick],
  )

  const q = normalize(query)
  const matches = (foods ?? []).filter(
    (f) => !q || normalize(`${f.name} ${f.brand ?? ''}`).includes(q),
  )
  const byId = new Map((foods ?? []).map((f) => [f.id, f]))
  const recent = q
    ? []
    : recentIds.map((id) => byId.get(id)).filter((f): f is NonNullable<typeof f> => Boolean(f))
  const back = (
    <Button
      variant="ghost"
      icon={ArrowLeft}
      className="self-start px-0"
      onClick={() => setView({ kind: 'list' })}
    >
      {s.title}
    </Button>
  )

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      title={
        view.kind === 'create' ? t.nutrition.food.newTitle : view.kind === 'scan' ? sc.title : title
      }
    >
      {view.kind === 'scan' ? (
        <div className="flex flex-col gap-3">
          {back}
          {view.busy ? (
            <p role="status" className="py-8 text-center">
              {sc.searching}
            </p>
          ) : (
            <BarcodeScanner onCode={(code) => void onCode(code)} />
          )}
        </div>
      ) : view.kind === 'create' ? (
        <div className="flex flex-col gap-3">
          {back}
          {view.notice && (
            <p role="status" className="rounded-md border border-accent-edge p-3 text-sm">
              {view.notice}
            </p>
          )}
          <FoodForm
            initial={view.initial}
            initialName={view.name}
            initialBarcode={view.barcode}
            submitLabel={t.nutrition.food.saveAndLog}
            onSaved={async (food) => {
              await saveFood(food)
              setView({ kind: 'list' })
              onPick(food)
            }}
          />
          {view.initial?.barcode && view.notice?.startsWith(sc.found) && (
            <p className="text-xs text-muted">{sc.source}</p>
          )}
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
          <Button icon={ScanBarcode} block onClick={() => setView({ kind: 'scan', busy: false })}>
            {sc.open}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon={Zap} onClick={onQuickAdd}>
              {s.quickAdd}
            </Button>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() =>
                setView({ kind: 'create', initial: null, name: query.trim(), notice: null })
              }
            >
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
                  <Button
                    variant="secondary"
                    icon={Plus}
                    onClick={() =>
                      setView({ kind: 'create', initial: null, name: query.trim(), notice: null })
                    }
                  >
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
