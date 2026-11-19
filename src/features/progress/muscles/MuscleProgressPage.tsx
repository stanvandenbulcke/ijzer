import { useParams } from 'react-router'
import { useTrainingData } from '../../../data/useTrainingData'
import { isMuscleId } from '../../../domain/muscles/taxonomy'
import { localDay } from '../../../domain/time'
import { contributors, lastDays, weeklyVolume } from '../../../domain/volume/weekly'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { BarRow, Section } from '../Section'

const m = t.progress.muscleDetail

/** /progressie/spier/:muscle — weekly sets with the target band, contributors, frequency. */
export function MuscleProgressPage() {
  const { muscle = '' } = useParams()
  const data = useTrainingData()
  if (!data || !isMuscleId(muscle)) return <LoadingState />
  const today = localDay(new Date())
  const weeks = weeklyVolume(data.perfs, data.library.byId, today, 12)
  const values = weeks.map((w) => w.volume[muscle] ?? 0)
  const max = Math.max(22, ...values)
  const recent = lastDays(data.perfs, today, 28)
  const contrib = contributors(recent, data.library.byId, muscle)
  const sessionsWith = new Set(
    recent
      .filter((p) => data.library.byId(p.exerciseId)?.muscles.some((x) => x.muscle === muscle))
      .map((p) => p.workoutId),
  )
  const rirs = recent.filter(
    (p) =>
      p.set.rir !== null &&
      data.library.byId(p.exerciseId)?.muscles.some((x) => x.muscle === muscle && x.weight === 1),
  )

  return (
    <Page>
      <PageHeader title={t.muscles[muscle]} back="/progressie/spiergroepen" />
      <Section title={m.weekly} note={m.target}>
        <div
          className="relative h-40"
          role="img"
          aria-label={`${m.weekly}: ${values.map((v) => formatNumber(v, 1)).join(', ')}`}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 border-y border-dashed border-plate-green bg-plate-green/10"
            style={{ bottom: `${(10 / max) * 100}%`, height: `${(10 / max) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-end gap-1">
            {weeks.map((w, i) => (
              <span
                key={w.week}
                className="flex-1 rounded-t-sm bg-plate-blue"
                style={{ height: `${(values[i]! / max) * 100}%` }}
                title={formatDayShort(w.week)}
              />
            ))}
          </div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>{formatDayShort(weeks[0]!.week)}</span>
          <span>{formatDayShort(weeks.at(-1)!.week)}</span>
        </div>
      </Section>
      <Section title={m.contributors}>
        {contrib.map((c) => (
          <BarRow
            key={c.exerciseId}
            label={data.library.byId(c.exerciseId)?.name ?? c.exerciseId}
            value={c.sets}
            max={contrib[0]!.sets}
            text={formatNumber(c.sets, 1)}
          />
        ))}
        <p className="mt-3 text-sm text-muted">
          {m.frequency(Math.round((sessionsWith.size / 4) * 10) / 10)}
        </p>
        {rirs.length > 0 && (
          <p className="text-sm text-muted">
            {m.avgRir(formatNumber(rirs.reduce((s, p) => s + p.set.rir!, 0) / rirs.length, 1))}
          </p>
        )}
      </Section>
    </Page>
  )
}
