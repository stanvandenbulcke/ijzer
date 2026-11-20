import type { WeekSummary } from '../../../domain/nutrition/week'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { cx } from '../../../ui/cx'

const w = t.nutrition.week
const DAYS = t.today.weekdays

/** Last 7 days: kcal per day as bars, averages over logged days only, protein goal days. */
export function WeekOverview({
  week,
  kcalTarget,
}: {
  week: WeekSummary
  kcalTarget: number | null
}) {
  const max = Math.max(kcalTarget ?? 0, ...week.days.map((d) => d.totals.kcal), 1)
  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{w.title}</h2>
      <div className="mt-3 flex h-24 items-end gap-1.5" aria-hidden>
        {week.days.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cx(
                'w-full rounded-t-sm',
                !d.logged ? 'bg-line' : d.complete ? 'bg-plate-yellow' : 'bg-line-strong',
              )}
              style={{ height: `${d.logged ? Math.max(4, (d.totals.kcal / max) * 80) : 2}px` }}
            />
            <span className="text-xs text-muted">
              {DAYS[(new Date(`${d.day}T12:00:00Z`).getUTCDay() + 6) % 7]}
            </span>
          </div>
        ))}
      </div>
      {week.average ? (
        <div className="mt-3 flex flex-col gap-0.5 text-sm">
          <p className="font-semibold">{w.average(formatNumber(week.average.kcal, 0))}</p>
          <p className="text-muted">{w.protein(week.proteinGoalDays, week.loggedDays)}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{w.none}</p>
      )}
      <p className="mt-1 text-xs text-muted">{w.note}</p>
    </section>
  )
}
