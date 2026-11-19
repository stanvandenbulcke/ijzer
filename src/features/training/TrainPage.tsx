import type { ReactNode } from 'react'
import { BookOpen, History, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useRoutines } from '../../data/routinesRepo'
import { useActiveWorkout, useFinishedWorkouts } from '../../data/workoutsRepo'
import { localDay } from '../../domain/time'
import { t } from '../../i18n'
import { formatDayShort } from '../../i18n/format'
import { Button, IconButton } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { ListRow } from '../../ui/ListRow'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { RoutineCard } from './routines/RoutineCard'
import { useStartWorkout } from './useStartWorkout'

const tr = t.training

function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <div className="mt-8 mb-3 flex items-center justify-between border-b border-line pb-1.5">
      <h2 className="font-display text-2xl font-bold uppercase">{children}</h2>
      {action}
    </div>
  )
}

/** /train — your routines, a free workout, the library and history. */
export function TrainPage() {
  const navigate = useNavigate()
  const start = useStartWorkout()
  const routines = useRoutines()
  const workouts = useFinishedWorkouts()
  const active = useActiveWorkout()

  const lastDone = useMemo(() => {
    const map = new Map<string, string>()
    for (const w of workouts ?? [])
      if (w.routineId && !map.has(w.routineId))
        map.set(w.routineId, formatDayShort(localDay(w.startedAt)))
    return map
  }, [workouts])

  if (!routines) return <LoadingState />

  return (
    <Page>
      <PageHeader title={tr.title} />

      {active ? (
        <div className="rounded-md border border-focus bg-surface p-4">
          <p className="font-display text-2xl font-bold uppercase">{tr.workoutRunningTitle}</p>
          <p className="mt-1 text-muted">{tr.workoutRunningBody}</p>
          <Button className="mt-3" block onClick={() => navigate('/training')}>
            {tr.continueWorkout}
          </Button>
        </div>
      ) : (
        <ListRow
          title={tr.startEmpty}
          subtitle={tr.startEmptyHint}
          onClick={() => void start(null)}
        />
      )}

      <SectionTitle
        action={
          <IconButton
            icon={Plus}
            label={tr.newRoutine}
            filled
            onClick={() => navigate('/train/routine/nieuw')}
          />
        }
      >
        {tr.routines}
      </SectionTitle>

      {routines.length === 0 ? (
        <EmptyState
          title={tr.noRoutines.title}
          body={tr.noRoutines.body}
          action={
            <Button icon={Plus} onClick={() => navigate('/train/routine/nieuw')}>
              {tr.newRoutine}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((r) => (
            <RoutineCard
              key={r.id}
              routine={r}
              lastDone={lastDone.get(r.id) ?? null}
              onOpen={() => navigate(`/train/routine/${r.id}`)}
              onStart={() => void start(r)}
              startLabel={active ? tr.continueWorkout : tr.startRoutine}
            />
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-line">
        <ListRow
          title={tr.library}
          subtitle={tr.libraryHint}
          leading={<BookOpen aria-hidden />}
          onClick={() => navigate('/train/oefeningen')}
        />
        <ListRow
          title={tr.history}
          subtitle={tr.historyHint}
          leading={<History aria-hidden />}
          onClick={() => navigate('/train/geschiedenis')}
        />
      </div>
    </Page>
  )
}
