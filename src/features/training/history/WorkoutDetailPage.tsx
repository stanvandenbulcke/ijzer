import { Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useExerciseLibrary } from '../../../data/catalog'
import { deleteWorkout, restoreWorkout, useWorkout } from '../../../data/workoutsRepo'
import { describeSet } from '../../../domain/training/proposals'
import { localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatDayLong, formatMinutes, formatNumber } from '../../../i18n/format'
import { Badge } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { useToast } from '../../../ui/toast/toastContext'

const h = t.training.historyPage

/** /train/geschiedenis/:id — one finished workout with all its sets. */
export function WorkoutDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const workout = useWorkout(id)
  const library = useExerciseLibrary()
  if (workout === undefined || library === undefined) return <LoadingState />
  if (!workout) return <LoadingState label={t.notFound.title} />

  const name = (exerciseId: string) => library?.byId(exerciseId)?.name ?? exerciseId
  const kg = (n: number) => formatNumber(n, 2)
  const minutes = workout.finishedAt
    ? (Date.parse(workout.finishedAt) - Date.parse(workout.startedAt)) / 60_000
    : 0

  const remove = async () => {
    await deleteWorkout(workout.id)
    toast({
      message: h.deleted,
      action: {
        label: t.common.undo,
        onAction: () => void restoreWorkout(workout.id),
      },
    })
    navigate('/train/geschiedenis', { replace: true })
  }

  return (
    <Page>
      <PageHeader
        title={workout.name}
        eyebrow={`${formatDayLong(localDay(workout.startedAt))} · ${formatMinutes(minutes)}`}
        back="/train/geschiedenis"
      />
      {workout.note && <p className="selectable mb-4 text-muted italic">{workout.note}</p>}
      <div className="flex flex-col gap-4">
        {workout.exercises.map((e) => (
          <section key={e.id} className="border-t border-line pt-3">
            <h2 className="font-semibold">{name(e.exerciseId)}</h2>
            {e.status === 'skipped' || e.status === 'substituted' ? (
              <p className="mt-1 text-sm text-muted">
                {e.status === 'skipped' ? h.skippedRow : h.substitutedRow}
              </p>
            ) : (
              <ol className="mt-1 flex flex-col gap-0.5">
                {e.sets
                  .filter((s) => s.completed)
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      {s.type !== 'working' && (
                        <Badge tone="muted">{t.training.setTypeShort[s.type]}</Badge>
                      )}
                      <span className="font-display text-xl font-bold">
                        {s.seconds
                          ? `${s.seconds} s`
                          : s.meters
                            ? `${s.meters} m`
                            : describeSet(s, kg)}
                      </span>
                      {s.pain && (
                        <span className="text-sm text-red-text">
                          {t.training.workout.painFlag(s.pain)}
                        </span>
                      )}
                    </li>
                  ))}
              </ol>
            )}
          </section>
        ))}
      </div>
      <Button variant="danger" icon={Trash2} block className="mt-8" onClick={() => void remove()}>
        {h.delete}
      </Button>
    </Page>
  )
}
