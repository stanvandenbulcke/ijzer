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
import { CountUp } from '../../ui/motion/CountUp'
import { ProgressRing } from '../../ui/ProgressRing'

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

/** "3/4 trainingen" as a ring that fills up, with a dot per weekday. Rest days never count against you. */
export function WeekCard({ status, today }: { status: WeekStatus; today: string }) {
  const monday = weekStart(today)
  return (
    <Card title={d.week}>
      <div className="flex items-center gap-4">
        <ProgressRing
          value={status.count}
          max={status.goal}
          size={104}
          thickness={9}
          tone={status.count >= status.goal ? 'green' : 'yellow'}
          animateIn
          label={d.weekCount(status.count, status.goal)}
        >
          <span className="flex flex-col leading-none">
            <span className="font-display text-4xl font-black">
              <CountUp value={status.count} />
              <span className="text-2xl text-muted">/{status.goal}</span>
            </span>
            <span className="mt-0.5 text-xs text-muted">{d.weekGoal}</span>
          </span>
        </ProgressRing>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-semibold">{d.weekLeft(status.goal - status.count)}</p>
          <div className="grid grid-cols-7 gap-1" aria-hidden>
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
                    className={cx(
                      'text-xs',
                      day === today ? 'font-semibold text-text' : 'text-muted',
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-muted">
            {status.streakWeeks > 0 ? d.streak(status.streakWeeks) : d.streakNone}
          </p>
        </div>
      </div>
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
          {last?.day === today ? t.training.workout.weighInAgain : d.logWeight}
        </Button>
      }
    >
      {last ? (
        <>
          <p className="font-display text-4xl font-black">
            <CountUp value={last.trend} decimals={1} />{' '}
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
