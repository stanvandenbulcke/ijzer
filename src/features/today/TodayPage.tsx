import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { logBodyWeight, useBodyWeights } from '../../data/bodyRepo'
import { useProfile } from '../../data/profileRepo'
import { useRoutines } from '../../data/routinesRepo'
import { useTrainingData } from '../../data/useTrainingData'
import { startWorkout } from '../../data/workoutActions'
import { useActiveWorkout } from '../../data/workoutsRepo'
import { useSession } from '../../data/auth'
import { accountsEnabled } from '../../data/supabase/config'
import { analyse } from '../../domain/analysis/rules'
import { weightTrend } from '../../domain/energy/trend'
import { totalWorkingSets } from '../../domain/training/routineEdit'
import { weekStatus } from '../../domain/training/streak'
import { summarizeWorkout } from '../../domain/training/summary'
import { localDay } from '../../domain/time'
import { t } from '../../i18n'
import { formatDayLong, formatDayShort, formatNumber } from '../../i18n/format'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { ValueEntrySheet } from '../../ui/ValueEntrySheet'
import { CoachCard } from './CoachCard'
import { Card, WeekCard, WeightCard } from './TodayCards'

const d = t.today

/** /vandaag — what matters today, everything tappable (SPEC §4.9). */
export function TodayPage() {
  const navigate = useNavigate()
  const profile = useProfile()
  const routines = useRoutines()
  const data = useTrainingData()
  const active = useActiveWorkout()
  const weights = useBodyWeights()
  const session = useSession()
  const [weighing, setWeighing] = useState(false)
  const today = localDay(new Date())

  const next = useMemo(() => {
    if (!routines?.length) return null
    const lastRoutineId = data?.workouts.find((w) => w.routineId)?.routineId
    const index = routines.findIndex((r) => r.id === lastRoutineId)
    return routines[(index + 1) % routines.length]!
  }, [routines, data])

  const lastPr = useMemo(() => {
    if (!data) return null
    for (const w of data.workouts.slice(0, 8)) {
      const pr = summarizeWorkout(w, data.workouts, data.library.byId).prs[0]
      if (pr) return { ...pr, day: localDay(w.startedAt) }
    }
    return null
  }, [data])

  const insight = useMemo(
    () =>
      data && profile
        ? (analyse({
            perfs: data.perfs,
            byId: data.library.byId,
            today,
            cutting: profile.goal === 'cut',
          })[0] ?? null)
        : null,
    [data, profile, today],
  )

  if (!profile || !routines || data === undefined || !weights) return <LoadingState />
  const status = weekStatus(
    data?.workouts.map((w) => w.startedAt) ?? [],
    today,
    profile.trainingDaysPerWeek,
  )
  const points = weightTrend(weights.map((w) => ({ day: w.day, kg: w.kg })))
  const start = async () => {
    await startWorkout(next, t.training.startEmpty)
    navigate('/training')
  }

  return (
    <Page>
      <PageHeader eyebrow={formatDayLong(today)} title={d.greeting(profile.name)} />
      <div className="flex flex-col gap-3">
        {accountsEnabled && session === null && (
          <section className="rounded-md border border-focus bg-surface p-4">
            <p className="font-display text-2xl leading-tight font-bold uppercase">
              {t.auth.banner.title}
            </p>
            <p className="mt-1 text-sm text-muted">{t.auth.banner.body}</p>
            <Button className="mt-3" onClick={() => navigate('/registreren')}>
              {t.auth.banner.action}
            </Button>
          </section>
        )}
        {active ? (
          <Card title={t.training.workoutRunningTitle}>
            <p className="font-display text-3xl font-black uppercase">{active.name}</p>
            <Button block className="mt-3" onClick={() => navigate('/training')}>
              {t.training.continueWorkout}
            </Button>
          </Card>
        ) : next ? (
          <Card title={d.nextTitle}>
            <p className="font-display text-4xl leading-none font-black uppercase">{next.name}</p>
            <p className="mt-1 text-sm text-muted">
              {d.nextHint} · {t.training.exercisesCount(next.exercises.length)} ·{' '}
              {t.training.setsCount(totalWorkingSets(next))}
            </p>
            <Button size="lg" block className="mt-3" onClick={() => void start()}>
              {t.common.start}
            </Button>
          </Card>
        ) : (
          <Card title={d.nextTitle}>
            <p className="font-display text-3xl font-black uppercase">{d.noRoutine}</p>
            <p className="text-sm text-muted">{d.noRoutineBody}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button icon={Plus} onClick={() => navigate('/train/routine/nieuw')}>
                {d.makeRoutine}
              </Button>
              <Button variant="secondary" onClick={() => void start()}>
                {t.training.startEmpty}
              </Button>
            </div>
          </Card>
        )}

        <WeekCard status={status} today={today} />

        <Card title={d.lastPr}>
          {lastPr ? (
            <button
              type="button"
              className="press flex w-full items-center gap-2 text-left"
              onClick={() =>
                navigate(`/progressie/oefening/${encodeURIComponent(lastPr.exerciseId)}`)
              }
            >
              <Badge tone="pr">PR</Badge>
              <span className="min-w-0 flex-1 truncate">
                {data?.library.byId(lastPr.exerciseId)?.name}
              </span>
              <span className="font-display text-xl font-bold">
                {formatNumber(lastPr.weightKg ?? 0, 2)} × {lastPr.reps}
              </span>
              <span className="text-sm text-muted">{formatDayShort(lastPr.day)}</span>
            </button>
          ) : (
            <p className="text-sm text-muted">{d.noPr}</p>
          )}
        </Card>

        <CoachCard
          insight={insight}
          name={(id) => data?.library.byId(id)?.name ?? id}
          cutting={profile.goal === 'cut'}
          dayOfYear={Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000)}
        />

        <WeightCard points={points} today={today} onLog={() => setWeighing(true)} />

        <Card title={d.nutrition}>
          <p className="text-sm text-muted">{d.nutritionSoon}</p>
        </Card>
      </div>
      <ValueEntrySheet
        open={weighing}
        onOpenChange={setWeighing}
        title={t.progress.body.sheetTitle}
        label={d.weight}
        initial={points.at(-1)?.kg ?? profile.weightKg}
        unit={t.common.kg}
        step={0.1}
        onSave={(kg) => void logBodyWeight(today, kg)}
      />
    </Page>
  )
}
