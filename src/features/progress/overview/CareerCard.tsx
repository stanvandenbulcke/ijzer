import type { TrainingData } from '../../../data/useTrainingData'
import { compareTonnage, lifetimeTotals } from '../../../domain/training/totals'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { CountUp } from '../../../ui/motion/CountUp'

const p = t.progress

/** "Jouw totaal": everything you ever lifted, with a comparison to make it tangible. */
export function CareerCard({ data }: { data: TrainingData }) {
  const totals = lifetimeTotals(data.workouts, data.perfs, (id) => data.library.byId(id)?.type)
  const comparison = compareTonnage(totals.tonnageKg)
  const time =
    totals.minutes < 60
      ? ([Math.round(totals.minutes), p.careerStats.minutes, 0] as const)
      : ([totals.minutes / 60, p.careerStats.hours, 1] as const)
  const stats = [
    [totals.workouts, p.careerStats.workouts(totals.workouts), 0],
    [totals.sets, p.careerStats.sets(totals.sets), 0],
    [totals.reps, p.careerStats.reps(totals.reps), 0],
    time,
  ] as const
  return (
    <section className="relative mt-5 overflow-hidden rounded-lg border border-line bg-surface p-4">
      <div aria-hidden className="knurling pointer-events-none absolute inset-0" />
      <p className="relative text-xs font-semibold tracking-widest text-muted uppercase">
        {p.career}
      </p>
      <p className="relative mt-1 flex items-baseline gap-2 font-display leading-none font-black">
        <span className="text-7xl text-accent-text">
          <CountUp value={totals.tonnageKg / 1000} decimals={1} duration={1.2} />
        </span>
        <span className="text-2xl uppercase">{p.tonnage}</span>
      </p>
      {comparison && (
        <p className="relative mt-2 font-semibold">
          {p.comparison[comparison.id](formatNumber(comparison.times, 1))}
        </p>
      )}
      <dl className="relative mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3">
        {stats.map(([value, label, decimals]) => (
          <div key={label} className="flex flex-col">
            <dd className="font-display text-2xl font-black">
              <CountUp value={value} decimals={decimals} />
            </dd>
            <dt className="text-xs text-muted">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
