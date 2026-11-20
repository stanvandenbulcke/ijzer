import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { FoodLogRow } from '../../data/db'
import {
  copyLogs,
  newLogFromFood,
  quickLog,
  saveLog,
  setDayComplete,
  setLogDeleted,
  useCompleteDays,
  useDayLogs,
  useFoods,
  useRecentLogs,
} from '../../data/nutritionRepo'
import { dayTotals, gramsFor, scale } from '../../domain/nutrition/macros'
import { MEALS, type Food, type FoodUnit, type MealId } from '../../domain/nutrition/types'
import { weekSummary } from '../../domain/nutrition/week'
import { addDays, localDay } from '../../domain/time'
import { t } from '../../i18n'
import { formatDayLong } from '../../i18n/format'
import { IconButton } from '../../ui/Button'
import { Chip } from '../../ui/Chip'
import { ListRow } from '../../ui/ListRow'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { useToast } from '../../ui/toast/toastContext'
import { MealSection } from './diary/MealSection'
import { PortionSheet, type PortionTarget } from './diary/PortionSheet'
import { QuickAddSheet } from './diary/QuickAddSheet'
import { WeekOverview } from './diary/WeekOverview'
import { AddFoodSheet } from './search/AddFoodSheet'
import { TargetsCard } from './targets/TargetsCard'
import { TargetsSheet } from './targets/TargetsSheet'
import { useTargets } from '../../data/useTargets'

const n = t.nutrition

/** /voeding — the food diary (SPEC §4.5): targets, meals, quick add, week overview. */
export function NutritionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const today = localDay(new Date())
  const day = params.get('dag') ?? today
  const logs = useDayLogs(day)
  const recent = useRecentLogs(addDays(day, -14))
  const foods = useFoods()
  const completeDays = useCompleteDays()
  const targets = useTargets(today)
  const [addingTo, setAddingTo] = useState<MealId | null>(null)
  const [editingTargets, setEditingTargets] = useState(false)
  const [quickFor, setQuickFor] = useState<MealId | null>(null)
  const [portion, setPortion] = useState<
    (PortionTarget & { log?: FoodLogRow; foodRef?: Food }) | null
  >(null)

  const recentIds = useMemo(() => {
    const seen = new Set<string>()
    for (const l of [...(recent ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      if (l.foodId) seen.add(l.foodId)
    return [...seen].slice(0, 8)
  }, [recent])

  if (!logs || !recent || !foods || !completeDays || targets === undefined) return <LoadingState />
  const yesterday = recent.filter((l) => l.day === addDays(day, -1))
  const totals = dayTotals(logs)
  const week = weekSummary(recent, completeDays, today, targets?.protein ?? Infinity)
  const goDay = (delta: number) => {
    const next = addDays(day, delta)
    setParams(next === today ? {} : { dag: next }, { replace: true })
  }

  const remove = async (item: FoodLogRow) => {
    await setLogDeleted(item.id, true)
    toast({
      message: n.removed(item.name),
      action: { label: n.undo, onAction: () => void setLogDeleted(item.id, false) },
    })
  }

  const savePortion = async (amount: number, unit: FoodUnit, meal: MealId) => {
    if (!portion) return
    if (portion.log && portion.log.per100) {
      const grams = gramsFor(amount, unit, portion.log)
      if (grams !== null)
        await saveLog({
          ...portion.log,
          meal,
          amount,
          unit,
          nutrients: scale(portion.log.per100, grams),
        })
    } else if (portion.foodRef) {
      const log = newLogFromFood(portion.foodRef, day, meal, amount, unit)
      if (log) await saveLog(log)
    }
    setPortion(null)
  }

  return (
    <Page>
      <PageHeader
        eyebrow={day === today ? n.today : day === addDays(today, -1) ? n.yesterday : undefined}
        title={n.title}
      />
      <div className="mb-3 flex items-center gap-2">
        <IconButton icon={ChevronLeft} label={n.previousDay} onClick={() => goDay(-1)} />
        <p className="flex-1 text-center font-semibold">{formatDayLong(day)}</p>
        <IconButton
          icon={ChevronRight}
          label={n.nextDay}
          disabled={day >= today}
          onClick={() => goDay(1)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <TargetsCard totals={totals} targets={targets} onEdit={() => setEditingTargets(true)} />
        {MEALS.map((meal) => (
          <MealSection
            key={meal}
            meal={meal}
            items={logs.filter((l) => l.meal === meal)}
            yesterdayCount={yesterday.filter((l) => l.meal === meal).length}
            onAdd={() => setAddingTo(meal)}
            onEdit={(item) =>
              item.per100 &&
              setPortion({
                food: {
                  name: item.name,
                  per100: item.per100,
                  liquid: item.unit === 'ml',
                  gramsPerPiece: item.gramsPerPiece,
                  servingGrams: item.servingGrams,
                  lastAmount: null,
                },
                meal: item.meal,
                amount: item.amount ?? undefined,
                unit: item.unit ?? undefined,
                editing: true,
                log: item,
              })
            }
            onRemove={(item) => void remove(item)}
            onCopyYesterday={async () => {
              const count = await copyLogs(
                yesterday.filter((l) => l.meal === meal),
                day,
              )
              toast({ message: count ? n.copied(count) : n.nothingYesterday })
            }}
          />
        ))}
        <div className="flex flex-col gap-1.5 rounded-md border border-line bg-surface p-4">
          <Chip
            selected={completeDays.has(day)}
            onClick={() => void setDayComplete(day, !completeDays.has(day))}
            className="self-start"
          >
            {n.complete}
          </Chip>
          <p className="text-sm text-muted">{n.completeHint}</p>
        </div>
        <WeekOverview week={week} kcalTarget={targets?.kcal ?? null} />
        <div className="border-t border-line">
          <ListRow
            title={n.foods.open}
            subtitle={n.foods.openHint}
            leading={<Package aria-hidden />}
            onClick={() => navigate('/voeding/producten')}
          />
        </div>
      </div>

      <AddFoodSheet
        open={addingTo !== null}
        onOpenChange={(o) => !o && setAddingTo(null)}
        title={addingTo ? n.addTo(n.meals[addingTo]) : ''}
        recentIds={recentIds}
        onQuickAdd={() => {
          setQuickFor(addingTo)
          setAddingTo(null)
        }}
        onPick={(food) => {
          setPortion({ food, meal: addingTo ?? 'snacks', editing: false, foodRef: food })
          setAddingTo(null)
        }}
      />
      <QuickAddSheet
        open={quickFor !== null}
        onOpenChange={(o) => !o && setQuickFor(null)}
        onSave={async (name, nutrients) => {
          await saveLog(quickLog(day, quickFor ?? 'snacks', name, nutrients))
          setQuickFor(null)
        }}
      />
      <TargetsSheet open={editingTargets} onOpenChange={setEditingTargets} today={today} />
      <PortionSheet
        target={portion}
        onClose={() => setPortion(null)}
        onSave={(amount, unit, meal) => void savePortion(amount, unit, meal)}
      />
    </Page>
  )
}
