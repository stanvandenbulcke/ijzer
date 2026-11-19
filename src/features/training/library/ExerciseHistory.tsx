import { computeRecords } from '../../../domain/training/records'
import { e1rmSeries, sessions } from '../../../domain/training/series'
import type { Exercise, Performance } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { LineChart } from '../../../ui/charts/LineChart'

const l = t.training.lib

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col border-l border-line pl-3">
      <span className="text-xs font-semibold tracking-widest text-muted uppercase">{label}</span>
      <span className="font-display text-2xl font-bold">{value}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  )
}

/** "Jouw geschiedenis" on the exercise page: best set, e1RM chart, last time. */
export function ExerciseHistory({ exercise, perfs }: { exercise: Exercise; perfs: Performance[] }) {
  if (perfs.length === 0) return <p className="text-muted">{l.noHistory}</p>
  const records = computeRecords(perfs, exercise.type)
  const all = sessions(perfs)
  const last = all.at(-1)!
  const series = e1rmSeries(perfs)
  const kg = (n: number) => `${formatNumber(n, 2)}`

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {records.heaviest && (
          <Stat
            label={l.bestSet}
            value={`${kg(records.heaviest.weightKg)} × ${records.heaviest.reps}`}
            sub={formatDayShort(records.heaviest.day)}
          />
        )}
        {records.bestE1rm && (
          <Stat
            label={l.bestE1rm}
            value={`${formatNumber(records.bestE1rm.value, 1)}`}
            sub={formatDayShort(records.bestE1rm.day)}
          />
        )}
        <Stat
          label={l.lastTime}
          value={`${kg(last.bestSet.weightKg ?? 0)} × ${last.bestSet.reps ?? 0}`}
          sub={formatDayShort(last.day)}
        />
      </div>
      {series.length >= 2 && (
        <LineChart
          label={`${l.bestE1rm}: ${series.map((p) => formatNumber(p.value, 1)).join(', ')}`}
          unit={t.common.kg}
          series={[{ points: series, color: 'var(--plate-blue)' }]}
        />
      )}
    </div>
  )
}
