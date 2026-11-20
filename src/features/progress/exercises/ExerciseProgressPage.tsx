import { useState } from 'react'
import { useParams } from 'react-router'
import { useTrainingData } from '../../../data/useTrainingData'
import { describeSet } from '../../../domain/training/proposals'
import { computeRecords, REP_TABLE_MAX } from '../../../domain/training/records'
import { e1rmSeries, sessions } from '../../../domain/training/series'
import { addDays, localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { LineChart } from '../../../ui/charts/LineChart'
import { Chip } from '../../../ui/Chip'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { Section } from '../Section'

const p = t.progress
const PERIODS = { '4w': 28, '3m': 91, '1y': 365, all: Infinity } as const
type Period = keyof typeof PERIODS

/** /progressie/oefening/:id — e1RM over time, rep records and every session (SPEC §4.8). */
export function ExerciseProgressPage() {
  const { id = '' } = useParams()
  const data = useTrainingData()
  const [period, setPeriod] = useState<Period>('3m')
  if (!data) return <LoadingState />
  const exercise = data.library.byId(id)
  const today = localDay(new Date())
  const from = PERIODS[period] === Infinity ? '0000-00-00' : addDays(today, -PERIODS[period])
  const perfs = data.perfsOf(id)
  const inPeriod = perfs.filter((x) => x.day >= from)
  const series = e1rmSeries(inPeriod)
  const records = computeRecords(perfs, exercise?.type ?? 'weight_reps')
  const kg = (n: number) => formatNumber(n, 2)

  // Every workout with this exercise, including skipped ones (grey row, never a performance).
  const rows = data.workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === id))
    .map((w) => {
      const items = w.exercises.filter((e) => e.exerciseId === id)
      const done = items.flatMap((e) =>
        e.status === 'skipped' || e.status === 'substituted'
          ? []
          : e.sets.filter((s) => s.completed && s.type !== 'warmup'),
      )
      const notes = items.map((e) => e.note).filter(Boolean)
      const pain = items.flatMap((e) => e.sets.map((s) => s.pain)).filter(Boolean)
      return { id: w.id, day: localDay(w.startedAt), done, notes, pain }
    })

  return (
    <Page>
      <PageHeader title={exercise?.name ?? id} back="/progressie/oefeningen" />
      <div
        role="group"
        aria-label={p.periodLabel}
        className="flex gap-2 overflow-x-auto [scrollbar-width:none]"
      >
        {(Object.keys(PERIODS) as Period[]).map((k) => (
          <Chip key={k} selected={period === k} onClick={() => setPeriod(k)} className="shrink-0">
            {p.periods[k]}
          </Chip>
        ))}
      </div>

      <Section title={p.e1rmChart} note={p.e1rmEstimate}>
        {series.length >= 2 ? (
          <LineChart
            label={`${p.e1rmChart}: ${series.map((x) => formatNumber(x.value, 1)).join(', ')}`}
            unit={t.common.kg}
            series={[{ points: series, color: 'var(--plate-blue)' }]}
          />
        ) : (
          <p className="text-muted">
            {sessions(inPeriod).length === 0 ? t.training.lib.noHistory : p.chartNeedsTwo}
          </p>
        )}
      </Section>

      {records.repTable.length > 0 && (
        <Section title={p.repTable}>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-widest text-muted uppercase">
                <th className="pb-1 font-semibold">{p.repCol}</th>
                <th className="pb-1 font-semibold">{p.weightCol}</th>
                <th className="pb-1" />
              </tr>
            </thead>
            <tbody>
              {records.repTable.map((r) => (
                <tr key={r.reps} className="border-t border-line">
                  <td className="py-1.5 font-display text-xl font-bold">
                    {r.reps > REP_TABLE_MAX ? `${REP_TABLE_MAX}+` : r.reps}
                  </td>
                  <td className="py-1.5 font-display text-xl font-bold">
                    {kg(r.weightKg)} {t.common.kg}
                  </td>
                  <td className="py-1.5 text-right text-sm text-muted">{formatDayShort(r.day)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title={p.sessionsList}>
        <ul className="flex flex-col">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`border-t border-line py-2 ${r.done.length ? '' : 'text-muted'}`}
            >
              <div className="flex items-baseline gap-3">
                <span className="w-16 shrink-0 text-sm text-muted">{formatDayShort(r.day)}</span>
                <span className="flex-1 font-display text-lg font-bold">
                  {r.done.length
                    ? r.done.map((s) => describeSet(s, kg)).join(' · ')
                    : p.skippedSession}
                </span>
              </div>
              {(r.notes.length > 0 || r.pain.length > 0) && (
                <p className="selectable mt-0.5 ml-19 text-sm text-muted">
                  {[...r.notes, ...r.pain.map((x) => t.training.workout.painFlag(x!))].join(' · ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  )
}
