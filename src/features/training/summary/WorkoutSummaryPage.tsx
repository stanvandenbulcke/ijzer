import { Check, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { APP_NAME } from '../../../app/config'
import { useRoutine, saveRoutine } from '../../../data/routinesRepo'
import { newId } from '../../../data/rows'
import { useTrainingData } from '../../../data/useTrainingData'
import { saveWorkout, useWorkout } from '../../../data/workoutsRepo'
import { routineFromWorkout } from '../../../domain/training/routineEdit'
import { summarizeWorkout } from '../../../domain/training/summary'
import { localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatDayLong, formatMinutes, formatNumber } from '../../../i18n/format'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { LoadingState } from '../../../ui/LoadingState'
import { heatFills } from '../../../ui/muscle-map/heat'
import { MuscleMap3D } from '../../../ui/muscle-map/MuscleMap3D'
import { CountUp } from '../../../ui/motion/CountUp'
import { Stagger } from '../../../ui/motion/Stagger'
import { Page } from '../../../ui/PageHeader'
import { useToast } from '../../../ui/toast/toastContext'
import { renderShareCard, shareImage } from './shareCard'

const s = t.training.summary
const w = t.training.workout

function Stat({
  label,
  value,
  suffix,
  decimals = 0,
}: {
  label: string
  value: number
  suffix?: string
  decimals?: number
}) {
  return (
    <div className="flex flex-col border-t border-line pt-2">
      <span className="text-xs font-semibold tracking-widest text-muted uppercase">{label}</span>
      <span className="font-display text-4xl font-black">
        <CountUp value={value} decimals={decimals} />
        {suffix && <span className="ml-1 text-2xl text-muted">{suffix}</span>}
      </span>
    </div>
  )
}

/** /training/klaar/:id — after the workout (SPEC §4.4 "Na afloop"). */
export function WorkoutSummaryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const workout = useWorkout(id)
  const data = useTrainingData()
  const routine = useRoutine(workout?.routineId ?? undefined)
  const [note, setNote] = useState<string | null>(null)
  const [routineHandled, setRoutineHandled] = useState(false)

  const summary = useMemo(
    () => (workout && data ? summarizeWorkout(workout, data.workouts, data.library.byId) : null),
    [workout, data],
  )
  if (!workout || !data || !summary) return <LoadingState />

  const name = (exerciseId: string) => data.library.byId(exerciseId)?.name ?? exerciseId
  const updatedRoutine =
    routine && !routineHandled ? routineFromWorkout(routine, workout, newId) : null
  // Text versions for the share image, numbers for the animated stats.
  const stats = [
    { label: s.duration, value: formatMinutes(summary.minutes) },
    { label: s.sets, value: String(summary.sets) },
    { label: s.volume, value: `${formatNumber(summary.volumeKg, 0)} kg` },
    { label: s.prs, value: String(summary.prs.length) },
  ]
  const numbers = [
    { label: s.duration, value: Math.round(summary.minutes), suffix: 'min' },
    { label: s.sets, value: summary.sets },
    { label: s.volume, value: summary.volumeKg, suffix: 'kg' },
    { label: s.prs, value: summary.prs.length },
  ]

  const share = async () => {
    const pr = summary.prs[0]
    const blob = await renderShareCard({
      appName: APP_NAME,
      title: workout.name,
      date: formatDayLong(localDay(workout.startedAt)),
      stats: stats.slice(0, 3),
      prLine: pr
        ? `${name(pr.exerciseId)} ${formatNumber(pr.weightKg ?? 0, 2)} × ${pr.reps ?? 0}`
        : null,
    })
    if (blob) await shareImage(blob, 'ijzer-training.png', s.shareTitle(workout.name))
  }

  return (
    <Page tabBar={false}>
      <header className="pt-[max(1.5rem,env(safe-area-inset-top))]">
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">
          {formatDayLong(localDay(workout.startedAt))}
        </p>
        <h1 className="font-display text-6xl leading-none font-black uppercase">{s.title}</h1>
        <p className="mt-1 font-display text-2xl font-bold text-accent-text uppercase">
          {workout.name}
        </p>
      </header>

      <Stagger className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
        {numbers.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </Stagger>

      {summary.prs.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
          {summary.prs.map((pr, i) => (
            <li key={i} className="flex items-center gap-2">
              <Badge tone="pr">PR</Badge>
              <span className="flex-1">{name(pr.exerciseId)}</span>
              <span className="font-display text-xl font-bold">
                {formatNumber(pr.weightKg ?? 0, 2)} × {pr.reps}
              </span>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h2 className="mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
          {s.musclesHit}
        </h2>
        <MuscleMap3D
          fills={heatFills(summary.muscles)}
          label={Object.keys(summary.muscles)
            .map((m) => t.muscles[m as keyof typeof t.muscles])
            .join(', ')}
        />
        <p className="mt-3 text-sm text-muted">
          {summary.volumeChange === null
            ? s.vsLastNone
            : `${s.vsLast}: ${s.vsLastVolume(`${summary.volumeChange >= 0 ? '+' : ''}${formatNumber(summary.volumeChange * 100, 0)} %`)}`}
        </p>
      </section>

      {summary.skipped.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-display text-xl font-bold uppercase">{s.skippedTitle}</h2>
          <p className="text-muted">{summary.skipped.map(name).join(', ')}</p>
        </section>
      )}

      <section className="mt-8 flex flex-col gap-3">
        <span className="text-sm font-semibold text-muted">{s.feeling}</span>
        <div className="flex gap-1.5">
          {s.feelings.map((label, i) => {
            const value = (i + 1) as 1 | 2 | 3 | 4 | 5
            return (
              <Chip
                key={label}
                selected={workout.feeling === value}
                className="flex-1 justify-center px-1 text-sm"
                onClick={() => void saveWorkout({ ...workout, feeling: value })}
              >
                {label}
              </Chip>
            )
          })}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-muted">{s.note}</span>
          <textarea
            value={note ?? workout.note}
            placeholder={s.notePlaceholder}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== null && void saveWorkout({ ...workout, note })}
            rows={3}
            className="rounded-md border border-line-strong bg-surface p-3 outline-none placeholder:text-muted focus:border-focus"
          />
        </label>
      </section>

      {updatedRoutine && (
        <div className="mt-6 rounded-md border border-line bg-surface p-4">
          <p className="font-semibold">{s.updateRoutine}</p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={async () => {
                await saveRoutine(updatedRoutine)
                setRoutineHandled(true)
                toast({ message: s.routineUpdated })
              }}
            >
              {s.updateRoutineYes}
            </Button>
            <Button variant="ghost" onClick={() => setRoutineHandled(true)}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="secondary" icon={Share2} block onClick={() => void share()}>
          {s.share}
        </Button>
        <Button
          size="lg"
          icon={Check}
          block
          onClick={async () => {
            if (note !== null && note !== workout.note) await saveWorkout({ ...workout, note })
            navigate('/vandaag', { replace: true })
          }}
        >
          {s.done}
        </Button>
      </div>
      <p className="mt-4 text-center text-sm text-muted">{w.saving}</p>
    </Page>
  )
}
