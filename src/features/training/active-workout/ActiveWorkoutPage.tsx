import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useProfile } from '../../../data/profileRepo'
import { newId, now } from '../../../data/rows'
import { useTrainingData } from '../../../data/useTrainingData'
import { deleteWorkout, useActiveWorkout } from '../../../data/workoutsRepo'
import { alternatives } from '../../../domain/exercises/search'
import { defaultRestSec, incrementFor } from '../../../domain/profile/defaults'
import { warmupSets } from '../../../domain/strength/warmup'
import { planExercise } from '../../../domain/training/exercisePlan'
import { ghostForExercise, ghostForSession } from '../../../domain/training/ghost'
import * as ops from '../../../domain/training/workoutOps'
import { t } from '../../../i18n'
import { formatDuration } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { EmptyState } from '../../../ui/EmptyState'
import { LoadingState } from '../../../ui/LoadingState'
import { PrCelebration, type PrMoment } from '../../../ui/celebration/PrCelebration'
import { useToast } from '../../../ui/toast/toastContext'
import { useNow } from '../../../ui/useNow'
import { ExercisePickerSheet } from '../library/ExercisePickerSheet'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseMenuSheet, type View as MenuView } from './ExerciseMenuSheet'
import { FinishSheet } from './FinishSheet'
import { GhostBar } from './GhostBar'
import { RestTimer } from './RestTimer'
import { SaveFailedBanner } from './SaveFailedBanner'
import { isFilled, setActions } from './setActions'
import { useWakeLock } from './useWakeLock'
import { useWorkoutState } from './useWorkoutState'
import { ValueSheet, type ValueEdit } from './ValueSheet'

const w = t.training.workout

/** /training — the screen the whole app revolves around (SPEC §4.4). */
export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const stored = useActiveWorkout()
  const data = useTrainingData()
  const profile = useProfile()
  const { workout, apply, flush, saveFailed } = useWorkoutState(stored)
  const nowMs = useNow(1000)
  const [edit, setEdit] = useState<ValueEdit | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [menuView, setMenuView] = useState<MenuView>('main')
  const [substituteFor, setSubstituteFor] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [prMoment, setPrMoment] = useState<PrMoment | null>(null)

  useWakeLock(profile?.settings.wakeLock ?? false)

  const plans = useMemo(() => {
    if (!workout || !data || !profile) return new Map()
    return new Map(
      workout.exercises.map((item) => {
        const ex = data.library.byId(item.exerciseId)
        return [
          item.id,
          planExercise({
            workout,
            exercise: item,
            type: ex?.type ?? 'weight_reps',
            finishedWorkouts: data.workouts,
            history: data.perfsOf(item.exerciseId),
            incrementKg:
              item.incrementKg ?? incrementFor(ex?.equipment ?? 'other', profile.equipment),
            cutting: profile.goal === 'cut',
          }),
        ]
      }),
    )
  }, [workout, data, profile])

  if (stored === null && !workout) return <Navigate to="/train" replace />
  if (!workout || !data || !profile) return <LoadingState />

  const { openEdit, toggle, tickFilled, exerciseOf, incrementOf } = setActions({
    data,
    profile,
    plans,
    apply,
    setEdit,
    setPrMoment,
  })
  // Race against yourself: the whole session versus last time, weighted exercises only.
  const sessionGhost = ghostForSession(
    workout.exercises
      .filter(
        (e) =>
          e.status !== 'skipped' &&
          e.status !== 'substituted' &&
          exerciseOf(e)?.type === 'weight_reps',
      )
      .map((e) => ghostForExercise(e.sets, plans.get(e.id)?.previousSets ?? [])),
  )

  const menuItem = workout.exercises.find((e) => e.id === menuFor)
  const substituteItem = workout.exercises.find((e) => e.id === substituteFor)
  const openNames = workout.exercises
    .filter(
      (e) =>
        (e.status === 'pending' || e.status === 'in_progress') && !e.sets.some((s) => s.completed),
    )
    .map((e) => exerciseOf(e)?.name ?? e.exerciseId)
  const filledCount = workout.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => isFilled(s, exerciseOf(e)?.type ?? 'weight_reps')).length,
    0,
  )

  const finish = async () => {
    apply((wk) => ops.finishWorkout(wk, now()))
    try {
      await flush()
      navigate(`/training/klaar/${workout.id}`, { replace: true })
    } catch {
      setFinishing(false)
    }
  }
  const discard = async () => {
    await flush().catch(() => undefined)
    await deleteWorkout(workout.id)
    toast({ message: w.discarded })
    navigate('/train', { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-20 bg-bg">
        <header className="relative overflow-hidden border-b border-line px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div className="knurling pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto flex max-w-md items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-widest text-muted uppercase">
                {w.elapsed} {formatDuration((nowMs - Date.parse(workout.startedAt)) / 1000)}
              </p>
              <h1 className="truncate font-display text-3xl leading-tight font-black uppercase">
                {workout.name}
              </h1>
            </div>
            <Button variant="secondary" onClick={() => setFinishing(true)}>
              {w.finish}
            </Button>
          </div>
          {sessionGhost && (
            <div className="relative mx-auto mt-2 max-w-md">
              <GhostBar ghost={sessionGhost} unit={t.common.kg} />
            </div>
          )}
        </header>
      </div>

      {saveFailed && <SaveFailedBanner onRetry={() => void flush().catch(() => undefined)} />}
      <main
        className="mx-auto flex max-w-md flex-col gap-3 px-4 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)' }}
      >
        {workout.exercises.length === 0 && (
          <EmptyState
            title={w.empty.title}
            body={w.empty.body}
            action={
              <Button icon={Plus} onClick={() => setAdding(true)}>
                {w.addExercise}
              </Button>
            }
          />
        )}
        {workout.exercises.map((item) => (
          <ExerciseCard
            key={item.id}
            item={item}
            exercise={exerciseOf(item)}
            plan={plans.get(item.id)!}
            showHint={data.workouts.length < 3}
            substituteName={
              item.substitutedBy
                ? (exerciseOf(workout.exercises.find((e) => e.id === item.substitutedBy)!)?.name ??
                  null)
                : null
            }
            actions={{
              edit: (i, field) => openEdit(item, i, field),
              toggle: (i) => toggle(item, i),
              addSet: () => apply((wk) => ops.addSet(wk, item.id, newId)),
              openMenu: () => {
                setMenuView('main')
                setMenuFor(item.id)
              },
              skip: () => {
                setMenuView('skip')
                setMenuFor(item.id)
              },
              later: () => {
                apply((wk) => ops.moveToEnd(wk, item.id))
                toast({ message: w.movedLater })
              },
              substitute: () => setSubstituteFor(item.id),
              unskip: () => apply((wk) => ops.unskipExercise(wk, item.id)),
            }}
          />
        ))}
        {workout.exercises.length > 0 && (
          <>
            <Button variant="secondary" icon={Plus} block onClick={() => setAdding(true)}>
              {w.addExercise}
            </Button>
            <Button size="lg" block onClick={() => setFinishing(true)}>
              {w.finish}
            </Button>
          </>
        )}
      </main>

      {/* Rest timer docked at the bottom, in thumb reach (design review). */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md pb-[env(safe-area-inset-bottom)]">
        <RestTimer
          workout={workout}
          sound={profile.settings.sounds}
          onAdjust={(d) => apply((wk) => ops.adjustRest(wk, d))}
          onClear={() => apply(ops.clearRest)}
        />
      </div>
      <ValueSheet edit={edit} onClose={() => setEdit(null)} />
      {menuItem && (
        <ExerciseMenuSheet
          key={`${menuItem.id}|${menuView}`}
          initialView={menuView}
          open
          onOpenChange={(o) => !o && setMenuFor(null)}
          title={exerciseOf(menuItem)?.name ?? ''}
          actions={{
            explain: () => navigate(`/train/oefeningen/${menuItem.exerciseId}`),
            later: () => {
              apply((wk) => ops.moveToEnd(wk, menuItem.id))
              toast({ message: w.movedLater })
            },
            substitute: () => setSubstituteFor(menuItem.id),
            skip: (reason) => apply((wk) => ops.skipExercise(wk, menuItem.id, reason)),
            addWarmups: (() => {
              const ex = exerciseOf(menuItem)
              const firstWork = menuItem.sets.findIndex((s) => s.type !== 'warmup')
              const work =
                firstWork >= 0 ? plans.get(menuItem.id)!.proposals[firstWork]!.weightKg : null
              if (!ex || !work || ex.type !== 'weight_reps') return null
              const sets = warmupSets(work, {
                barKg: ex.equipment === 'barbell' ? profile.equipment.barKg : 0,
                stepKg: incrementOf(menuItem),
                compound: ex.mechanic === 'compound',
              })
              return sets.length
                ? () => apply((wk) => ops.insertWarmups(wk, menuItem.id, sets, newId))
                : null
            })(),
            remove: menuItem.sets.some((s) => s.completed)
              ? null
              : () => apply((wk) => ops.removeExercise(wk, menuItem.id)),
            note: menuItem.note,
            setNote: (note) =>
              apply((wk) => ({
                ...wk,
                exercises: wk.exercises.map((e) => (e.id === menuItem.id ? { ...e, note } : e)),
              })),
            pain: [...menuItem.sets].reverse().find((s) => s.pain)?.pain ?? '',
            setPain: (where) => {
              const target =
                [...menuItem.sets].reverse().find((s) => s.completed) ?? menuItem.sets[0]
              if (target)
                apply((wk) => ops.updateSet(wk, menuItem.id, target.id, { pain: where || null }))
            },
          }}
        />
      )}
      <ExercisePickerSheet
        open={adding}
        onOpenChange={setAdding}
        title={w.addExercise}
        onPick={(ex) =>
          apply((wk) =>
            ops.addExercise(wk, ex, { newId, restSec: defaultRestSec(ex.mechanic, profile) }),
          )
        }
      />
      {substituteItem && (
        <ExercisePickerSheet
          open
          onOpenChange={(o) => !o && setSubstituteFor(null)}
          title={w.substituteTitle}
          candidates={(() => {
            const ex = exerciseOf(substituteItem)
            return ex ? alternatives(data.library.exercises, ex, undefined, 30) : undefined
          })()}
          onPick={(ex) =>
            apply((wk) => ops.substituteExercise(wk, substituteItem.id, ex.id, newId))
          }
        />
      )}
      <PrCelebration moment={prMoment} onDone={() => setPrMoment(null)} />
      <FinishSheet
        open={finishing}
        onOpenChange={setFinishing}
        openNames={openNames}
        filledCount={filledCount}
        onTickFilled={() => tickFilled(workout)}
        onFinish={() => void finish()}
        onDiscard={() => void discard()}
      />
    </div>
  )
}
