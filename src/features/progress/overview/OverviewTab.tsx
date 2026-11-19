import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { MUSCLE_IDS } from '../../../domain/muscles/taxonomy'
import { summarizeWorkout } from '../../../domain/training/summary'
import { workoutVolumeKg } from '../../../domain/training/performances'
import { addDays, localDay, weekStart } from '../../../domain/time'
import { fractionalSets, volumeZone } from '../../../domain/volume/fractionalSets'
import { lastDays } from '../../../domain/volume/weekly'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { Badge } from '../../../ui/Badge'
import { cx } from '../../../ui/cx'
import { heatFills } from '../../../ui/muscle-map/heat'
import { MuscleMap3D } from '../../../ui/muscle-map/MuscleMap3D'
import { BarRow, Section } from '../Section'
import { ZONE_BG } from '../zones'
import { CareerCard } from './CareerCard'
import { RecordWall } from './RecordWall'

const p = t.progress
const WEEKS = 12

export function OverviewTab({
  data,
  today,
  goalPerWeek,
}: {
  data: TrainingData
  today: string
  goalPerWeek: number
}) {
  const navigate = useNavigate()
  const trainedDays = new Set(data.workouts.map((w) => localDay(w.startedAt)))
  const firstMonday = addDays(weekStart(today), -7 * (WEEKS - 1))
  const weeks = Array.from({ length: WEEKS }, (_, i) => addDays(firstMonday, i * 7))

  const week = fractionalSets(lastDays(data.perfs, today, 7), data.library.byId)
  const ranked = MUSCLE_IDS.filter((m) => week[m]).sort((a, b) => week[b]! - week[a]!)

  const typeOf = (id: string) => data.library.byId(id)?.type
  const tonnage = weeks.slice(-8).map((w) => ({
    week: w,
    kg: data.workouts
      .filter((x) => weekStart(localDay(x.startedAt)) === w)
      .reduce((s, x) => s + workoutVolumeKg(x, typeOf), 0),
  }))
  const maxTon = Math.max(...tonnage.map((x) => x.kg))
  const prs = data.workouts
    .slice(0, 10)
    .flatMap((w) =>
      summarizeWorkout(w, data.workouts, data.library.byId).prs.map((pr) => ({
        ...pr,
        day: localDay(w.startedAt),
      })),
    )
    .slice(0, 6)

  return (
    <>
      <CareerCard data={data} />
      <Section title={p.calendar}>
        <div
          role="img"
          aria-label={p.calendarLabel(
            data.workouts.filter((w) => localDay(w.startedAt) >= firstMonday).length,
          )}
          className="grid w-fit grid-flow-col grid-rows-7 gap-[3px] [grid-auto-columns:18px]"
        >
          {weeks.flatMap((monday) =>
            Array.from({ length: 7 }, (_, d) => {
              const day = addDays(monday, d)
              return (
                <span
                  key={day}
                  className={cx(
                    'size-[18px] rounded-[3px]',
                    day > today
                      ? 'bg-transparent'
                      : trainedDays.has(day)
                        ? 'bg-plate-green'
                        : 'bg-surface-2',
                  )}
                />
              )
            }),
          )}
        </div>
        <div
          className="mt-3 grid w-fit grid-flow-col items-end gap-[3px] [grid-auto-columns:18px]"
          aria-hidden
        >
          {weeks.map((w) => {
            const n = [...trainedDays].filter((d) => weekStart(d) === w).length
            return (
              <span
                key={w}
                className={cx(
                  'flex-1 rounded-t-sm',
                  n >= goalPerWeek ? 'bg-plate-green' : 'bg-line-strong',
                )}
                style={{ height: `${Math.max(2, n * 6)}px` }}
              />
            )
          })}
        </div>
        <p className="mt-1 text-xs text-muted">{p.perWeek}</p>
      </Section>

      <Section title={p.heatTitle} note={p.muscleWeekNote}>
        <MuscleMap3D
          fills={heatFills(week)}
          label={
            ranked.map((m) => `${t.muscles[m]} ${formatNumber(week[m]!, 1)}`).join(', ') ||
            p.empty.title
          }
        />
        <p className="mt-1 text-center text-xs text-muted">{t.muscleMap.dragHint}</p>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex flex-1 flex-col">
            {ranked.slice(0, 10).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => navigate(`/progressie/spier/${m}`)}
                className="press flex min-h-11 items-center gap-2 text-left text-sm"
              >
                <span
                  aria-hidden
                  className={cx('size-3 shrink-0 rounded-sm', ZONE_BG[volumeZone(week[m]!)])}
                />
                <span className="flex-1 truncate">{t.muscles[m]}</span>
                <span className="font-display text-lg font-bold">{formatNumber(week[m]!, 1)}</span>
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {(['low', 'moderate', 'target', 'high', 'veryHigh'] as const).map((z) => (
            <li key={z} className="flex items-center gap-1">
              <span aria-hidden className={cx('size-2.5 rounded-sm', ZONE_BG[z])} />
              {t.volumeZones[z]} {t.volumeZoneRanges[z]}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={p.recordWall} note={p.recordWallNote}>
        <RecordWall data={data} />
      </Section>

      <Section title={p.weeklyVolume}>
        {tonnage.map((x) => (
          <BarRow
            key={x.week}
            label={formatDayShort(x.week)}
            value={x.kg}
            max={maxTon}
            text={formatNumber(x.kg / 1000, 1) + ' t'}
          />
        ))}
      </Section>

      {prs.length > 0 && (
        <Section title={p.recentPrs}>
          <ul className="flex flex-col gap-2">
            {prs.map((pr, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/progressie/oefening/${encodeURIComponent(pr.exerciseId)}`)
                  }
                  className="press flex min-h-11 w-full items-center gap-2 text-left"
                >
                  <Badge tone="pr">PR</Badge>
                  <span className="min-w-0 flex-1 truncate">
                    {data.library.byId(pr.exerciseId)?.name}
                  </span>
                  <span className="font-display text-lg font-bold">
                    {formatNumber(pr.weightKg ?? 0, 2)} × {pr.reps}
                  </span>
                  <span className="text-xs text-muted">{formatDayShort(pr.day)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
