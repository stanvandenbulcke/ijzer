import {
  Clock,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  SkipForward,
  TriangleExclamationPoint,
} from 'lucide-react'
import { useState } from 'react'
import type { ExercisePlan } from '../../../domain/training/exercisePlan'
import { ghostForExercise } from '../../../domain/training/ghost'
import { describeSet } from '../../../domain/training/proposals'
import type { Exercise, WorkoutExercise, WorkoutSet } from '../../../domain/training/types'
import type { Suggestion } from '../../../domain/strength/progression'
import { t } from '../../../i18n'
import { formatDayLong, formatNumber } from '../../../i18n/format'
import { Button, IconButton } from '../../../ui/Button'
import { MuscleChip } from '../../../ui/Chip'
import { cx } from '../../../ui/cx'
import { ExerciseThumb } from '../../../ui/ExerciseThumb'
import { GhostBar } from './GhostBar'
import { isSingleValue, SET_GRID, SINGLE_GRID } from './setGrid'
import { SetRow } from './SetRow'

const w = t.training.workout
const kg = (n: number) => formatNumber(n, 2)

function previousText(set: WorkoutSet | null, type: Exercise['type']): string | null {
  if (!set) return null
  if (type === 'time') return `${set.seconds ?? 0} s`
  if (type === 'distance') return `${set.meters ?? 0} m`
  return describeSet(set, kg)
}

function targetText(s: Suggestion): string | null {
  const reps =
    s.repMin !== null && s.repMax !== null
      ? s.repMin === s.repMax
        ? `${s.repMin}`
        : `${s.repMin}–${s.repMax}`
      : null
  if (s.weightKg !== null && reps) return `${kg(s.weightKg)} kg × ${reps}`
  return reps ? `${reps} reps` : null
}

function whyText(s: Suggestion): string {
  if (s.reason === 'first_time' || !s.previous) return w.reasons.first_time
  const p = s.previous
  const rir = p.rir.some((r) => r !== null) ? ` @${p.rir.map((r) => r ?? '–').join('/')}` : ''
  return w.reasons[s.reason](`${kg(p.weightKg)} kg × ${p.reps.join('/')}${rir}`)
}

export interface CardActions {
  edit: (setIndex: number, field: 'weight' | 'reps' | 'seconds' | 'meters') => void
  toggle: (setIndex: number) => void
  addSet: () => void
  openMenu: () => void
  unskip: () => void
  skip: () => void
  later: () => void
  substitute: () => void
}

/** One exercise during the workout: header, today's target, sets, add set. */
export function ExerciseCard({
  item,
  exercise,
  plan,
  substituteName,
  showHint,
  actions,
}: {
  item: WorkoutExercise
  exercise: Exercise | undefined
  plan: ExercisePlan
  substituteName: string | null
  /** Explain the dimmed proposals (first workouts only). */
  showHint: boolean
  actions: CardActions
}) {
  const [why, setWhy] = useState(false)
  const name = exercise?.name ?? item.exerciseId
  const type = exercise?.type ?? 'weight_reps'
  const single = isSingleValue(type)
  const pain = [...item.sets].reverse().find((s) => s.pain)?.pain
  const ghost = ghostForExercise(item.sets, plan.previousSets)
  const ghostUnit = [...item.sets, ...plan.previousSets].every((s) => !s.weightKg)
    ? t.common.reps
    : t.common.kg

  if (item.status === 'skipped' || item.status === 'substituted') {
    return (
      <article className="flex items-center gap-3 rounded-md border border-dashed border-line px-3 py-2.5 text-muted">
        {exercise && <ExerciseThumb exercise={exercise} size="sm" />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold line-through">{name}</p>
          <p className="text-sm">
            {item.status === 'skipped'
              ? [w.skipped, item.skipReason && w.skipReasons[item.skipReason]]
                  .filter(Boolean)
                  .join(' · ')
              : w.substitutedBy(substituteName ?? '')}
          </p>
        </div>
        {item.status === 'skipped' && (
          <Button variant="ghost" onClick={actions.unskip}>
            {w.unskip}
          </Button>
        )}
      </article>
    )
  }

  const target = plan.suggestion ? targetText(plan.suggestion) : null
  let working = 0

  return (
    <article
      id={`exercise-${item.id}`}
      className={cx(
        'scroll-mt-24 rounded-md border bg-surface p-3',
        item.status === 'in_progress' ? 'border-line-strong' : 'border-line',
      )}
    >
      <header className="flex items-start gap-3">
        {exercise && <ExerciseThumb exercise={exercise} />}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl leading-tight font-bold uppercase">{name}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            {exercise?.muscles
              .filter((m) => m.weight === 1)
              .map((m) => (
                <MuscleChip key={m.muscle} muscle={m.muscle} />
              ))}
          </div>
        </div>
        <IconButton
          icon={MoreHorizontal}
          label={`${t.common.more}: ${name}`}
          onClick={actions.openMenu}
          className="-mr-2"
        />
      </header>

      {/* Always visible: what you need when a machine is taken or something hurts. */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(
          [
            [SkipForward, w.skip, actions.skip],
            [Clock, w.later, actions.later],
            [Repeat2, w.substitute, actions.substitute],
          ] as const
        ).map(([Icon, label, onClick]) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="press flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-line-strong text-sm font-semibold"
          >
            <Icon aria-hidden size={16} />
            {label}
          </button>
        ))}
      </div>

      {target && (
        <div className="mt-3 rounded-sm border-l-4 border-focus bg-surface-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <p className="flex-1 font-semibold">{w.target(target)}</p>
            <button
              type="button"
              onClick={() => setWhy((v) => !v)}
              aria-expanded={why}
              className="press flex min-h-11 items-center gap-1 text-sm font-semibold text-accent-text"
            >
              <HelpCircle aria-hidden size={16} />
              {t.common.why}
            </button>
          </div>
          {why && plan.suggestion && (
            <p className="mt-1 text-sm text-muted">{whyText(plan.suggestion)}</p>
          )}
        </div>
      )}
      {item.note && <p className="mt-2 text-sm text-muted italic">{item.note}</p>}
      {pain && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-text">
          <TriangleExclamationPoint aria-hidden size={16} />
          {w.painFlag(pain)}
        </p>
      )}

      <p className="mt-3 text-sm text-muted">
        {plan.previousDay ? w.lastTimeOn(formatDayLong(plan.previousDay)) : w.firstTime}
      </p>
      {ghost && !single && (
        <div className="mt-1">
          <GhostBar ghost={ghost} unit={ghostUnit} compact />
        </div>
      )}
      {showHint && plan.previousDay && item.sets.some((s) => !s.completed) && (
        <p className="mt-1 text-sm text-muted">{w.hint}</p>
      )}
      <div className="mt-2">
        <div
          className={cx(
            single ? SINGLE_GRID : SET_GRID,
            'pb-1 text-xs font-semibold tracking-widest text-muted uppercase',
          )}
        >
          <span className="text-center">{w.columns.set}</span>
          <span>{w.columns.previous}</span>
          {single ? (
            <span className="text-center">{type === 'time' ? w.columns.sec : w.columns.m}</span>
          ) : (
            <>
              <span className="text-center">
                {type === 'bodyweight_reps'
                  ? w.columns.extra
                  : type === 'assisted'
                    ? w.columns.assist
                    : w.columns.kg}
              </span>
              <span className="text-center">{w.columns.reps}</span>
            </>
          )}
          <span />
        </div>
        {item.sets.map((set, i) => {
          if (set.type !== 'warmup') working++
          return (
            <SetRow
              key={set.id}
              set={set}
              label={set.type === 'warmup' ? String(i + 1) : String(working)}
              type={type}
              previous={previousText(plan.previousBySet[i] ?? null, type)}
              proposal={plan.proposals[i]!}
              prKinds={plan.prKinds[i] ?? []}
              onEdit={(field) => actions.edit(i, field)}
              onToggle={() => actions.toggle(i)}
            />
          )
        })}
      </div>
      <Button variant="ghost" icon={Plus} block className="mt-1" onClick={actions.addSet}>
        {w.addSet}
      </Button>
    </article>
  )
}
