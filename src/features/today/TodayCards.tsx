import { Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TrendPoint } from '../../domain/energy/trend'
import { weeklyRate } from '../../domain/energy/trend'
import type { WeekStatus } from '../../domain/training/streak'
import { addDays, weekStart } from '../../domain/time'
import { t } from '../../i18n'
import { formatNumber } from '../../i18n/format'
import { Button } from '../../ui/Button'
import { cx } from '../../ui/cx'

const d = t.today

export function Card({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** "3/4 trainingen" with a dot per weekday. Rest days are never shown as a failure. */
export function WeekCard({ status, today }: { status: WeekStatus; today: string }) {
  const monday = weekStart(today)
  return (
    <Card title={d.week}>
      <p className="font-display text-4xl font-black">{d.weekCount(status.count, status.goal)}</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5" aria-hidden>
        {d.weekdays.map((label, i) => {
          const day = addDays(monday, i)
          const trained = status.trainedDays.includes(day)
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className={cx(
                  'h-2 w-full rounded-full',
                  trained ? 'bg-plate-green' : day === today ? 'bg-line-strong' : 'bg-line',
                )}
              />
              <span
                className={cx('text-xs', day === today ? 'font-semibold text-text' : 'text-muted')}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-muted">
        {status.streakWeeks > 0 ? d.streak(status.streakWeeks) : d.streakNone}
      </p>
    </Card>
  )
}

export function WeightCard({
  points,
  today,
  onLog,
}: {
  points: TrendPoint[]
  today: string
  onLog: () => void
}) {
  const last = points.at(-1)
  const rate = weeklyRate(points)
  const sign = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatNumber(Math.abs(n), 2)}`
  return (
    <Card
      title={d.weight}
      action={
        <Button
          variant={last?.day === today ? 'ghost' : 'secondary'}
          icon={Scale}
          onClick={onLog}
          className="min-h-11 px-3 text-lg"
        >
          {last?.day === today ? d.weightToday : d.logWeight}
        </Button>
      }
    >
      {last ? (
        <>
          <p className="font-display text-4xl font-black">
            {formatNumber(last.trend, 1)}{' '}
            <span className="font-sans text-base font-semibold text-muted">{t.common.kg}</span>
          </p>
          <p className="text-sm text-muted">
            {rate ? d.trend(sign(rate.kgPerWeek), sign(rate.pctPerWeek)) : d.trendTooShort}
          </p>
        </>
      ) : (
        <p className="text-muted">{t.progress.body.empty}</p>
      )}
    </Card>
  )
}
