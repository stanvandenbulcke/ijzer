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
import type { Exercise, WorkoutExercise } from '../../../domain/training/types'
import * as ops from '../../../domain/training/workoutOps'
import { t } from '../../../i18n'
import { formatDuration, formatNumber } from '../../../i18n/format'
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
import { playRecord, playSetDone, primeAudio } from './sounds'
import { RestTimer } from './RestTimer'
import { useWakeLock } from './useWakeLock'
import { useWorkoutState } from './useWorkoutState'
import { ValueSheet, type ValueEdit } from './ValueSheet'

const w = t.training.workout
const WARMUP_REST_SEC = 60

/** /training — the screen the whole app revolves around (SPEC §4.4). */
export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const stored = useActiveWorkout()
  const data = useTrainingData()
  const profile = useProfile()
  const { workout, apply, flush } = useWorkoutState(stored)
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

  const exerciseOf = (item: WorkoutExercise): Exercise | undefined =>
    data.library.byId(item.exerciseId)
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
  const incrementOf = (item: WorkoutExercise) =>
    item.incrementKg ?? incrementFor(exerciseOf(item)?.equipment ?? 'other', profile.equipment)

  const openEdit = (
    item: WorkoutExercise,
    index: number,
    field: 'weight' | 'reps' | 'seconds' | 'meters',
  ) => {
    const set = item.sets[index]!
    const plan = plans.get(item.id)!
    const proposal = plan.proposals[index]!
    const lastTime = plan.previousBySet[index]
    const before = [...item.sets.slice(0, index)].reverse().find((s) => s.completed)
    const ex = exerciseOf(item)
    const name = ex?.name ?? item.exerciseId
    const save = (changes: Partial<typeof set>) =>
      apply((wk) => ops.updateSet(wk, item.id, set.id, changes))

    if (field === 'weight') {
      const quick = [
        before?.weightKg != null && {
          label: w.sameAsLastSet,
          value: before.weightKg,
        },
        lastTime?.weightKg != null && { label: w.lastTime, value: lastTime.weightKg },
      ].filter(Boolean) as ValueEdit['quickValues']
      const bar =
        ex?.equipment === 'barbell'
          ? profile.equipment.barKg
          : ex?.equipment === 'ez_bar'
            ? 10
            : null
      setEdit({
        title: name,
        label: w.columns.kg,
        value: set.weightKg ?? proposal.weightKg,
        unit: t.common.kg,
        step: incrementOf(item),
        maxDecimals: 2,
        quickValues: quick,
        plates: bar ? { barKg: bar, inventory: profile.equipment.plates } : undefined,
        onDone: (value) => {
          save({ weightKg: value })
          // Straight on to the reps of the same set: one sheet less per set.
          if (set.reps === null) openEdit(item, index, 'reps')
        },
      })
    } else if (field === 'reps') {
      const quick = [
        before?.reps != null && { label: w.sameAsLastSet, value: before.reps },
        lastTime?.reps != null && { label: w.lastTime, value: lastTime.reps },
      ].filter(Boolean) as ValueEdit['quickValues']
      setEdit({
        title: name,
        label: w.columns.reps,
        value: set.reps ?? proposal.reps,
        unit: t.common.reps,
        step: 1,
        maxDecimals: 0,
        quickValues: quick,
        rir: set.rir,
        onDone: (value, rir) => save({ reps: value, rir: rir ?? null }),
      })
    } else {
      const seconds = field === 'seconds'
      setEdit({
        title: name,
        label: seconds ? w.columns.sec : w.columns.m,
        value: (seconds ? set.seconds : set.meters) ?? null,
        unit: seconds ? 's' : 'm',
        step: seconds ? 5 : 10,
        maxDecimals: 0,
        quickValues: [],
        onDone: (value) => save(seconds ? { seconds: value } : { meters: value }),
      })
    }
  }

  const toggle = (item: WorkoutExercise, index: number) => {
    const set = item.sets[index]!
    if (set.completed) {
      apply((wk) => ops.uncompleteSet(wk, item.id, set.id))
      return
    }
    const type = exerciseOf(item)?.type ?? 'weight_reps'
    const proposal = plans.get(item.id)!.proposals[index]!
    if (type === 'time' && !set.seconds) return openEdit(item, index, 'seconds')
    if (type === 'distance' && !set.meters) return openEdit(item, index, 'meters')
    const weightKg = set.weightKg ?? proposal.weightKg ?? (type === 'weight_reps' ? null : 0)
    const reps = set.reps ?? proposal.reps
    if (type !== 'time' && type !== 'distance') {
      if (weightKg === null) return openEdit(item, index, 'weight')
      if (reps === null) return openEdit(item, index, 'reps')
    }
    primeAudio()
    if (profile.settings.sounds) playSetDone()
    const rest = set.type === 'warmup' ? WARMUP_REST_SEC : item.restSec
    const next = apply((wk) =>
      ops.completeSet(wk, item.id, set.id, { weightKg, reps }, now(), rest),
    )
    // Live PR detection (SPEC §4.4).
    const updated = next?.exercises.find((e) => e.id === item.id)
    if (next && updated) {
      const ex = exerciseOf(item)
      const plan = planExercise({
        workout: next,
        exercise: updated,
        type: ex?.type ?? 'weight_reps',
        finishedWorkouts: data.workouts,
        history: data.perfsOf(item.exerciseId),
        incrementKg: incrementOf(item),
        cutting: profile.goal === 'cut',
      })
      const kinds = plan.prKinds[index] ?? []
      if (kinds.length > 0) {
        if (profile.settings.sounds) playRecord()
        const done = updated.sets[index]!
        setPrMoment({
          id: done.id,
          exercise: ex?.name ?? item.exerciseId,
          kind: w.prKinds[kinds[0]!],
          value:
            ex?.type === 'time'
              ? `${done.seconds ?? 0} s`
              : `${formatNumber(done.weightKg ?? 0, 2)} kg × ${done.reps ?? 0}`,
        })
      }
      // Last set of this exercise done: bring the next open exercise into view.
      if (updated.sets.every((s) => s.completed)) {
        const nextId = ops.currentExerciseId(next)
        if (nextId) {
          window.setTimeout(
            () =>
              document
                .getElementById(`exercise-${nextId}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
            250,
          )
        }
      }
    }
  }

  const menuItem = workout.exercises.find((e) => e.id === menuFor)
  const substituteItem = workout.exercises.find((e) => e.id === substituteFor)
  const openCount = workout.exercises.filter(
    (e) =>
      (e.status === 'pending' || e.status === 'in_progress') && !e.sets.some((s) => s.completed),
  ).length

  const finish = async () => {
    apply((wk) => ops.finishWorkout(wk, now()))
    await flush()
    navigate(`/training/klaar/${workout.id}`, { replace: true })
  }
  const discard = async () => {
    await flush()
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
        openCount={openCount}
        onFinish={() => void finish()}
        onDiscard={() => void discard()}
      />
    </div>
  )
}
