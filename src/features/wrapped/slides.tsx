import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { Exercise } from '../../domain/training/types'
import type { Wrapped } from '../../domain/training/wrapped'
import { compareTonnage } from '../../domain/training/totals'
import { t } from '../../i18n'
import { formatDayShort, formatMinutes, formatNumber } from '../../i18n/format'
import { CountUp } from '../../ui/motion/CountUp'
import { MuscleMap3D } from '../../ui/muscle-map/MuscleMap3D'
import { heatFills } from '../../ui/muscle-map/heat'

const w = t.wrapped

/** Big number that counts up, with a label under it. */
function Big({ value, decimals = 0, label }: { value: number; decimals?: number; label: string }) {
  return (
    <div>
      <p className="font-display text-[7rem] leading-none font-black">
        <CountUp value={value} decimals={decimals} />
      </p>
      <p className="font-display text-3xl font-bold text-accent-text uppercase">{label}</p>
    </div>
  )
}

function Rise({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay }}
    >
      {children}
    </motion.div>
  )
}

export interface SlideContext {
  data: Wrapped
  title: string
  name: (id: string) => string
  byId: (id: string) => Exercise | undefined
}

export function IntroSlide({ title }: SlideContext) {
  return (
    <div className="flex flex-col gap-2">
      <Rise>
        <p className="font-display text-7xl leading-[0.9] font-black uppercase">{title}</p>
      </Rise>
      <Rise delay={0.15}>
        <p className="font-display text-4xl font-bold text-accent-text uppercase">{w.intro}</p>
      </Rise>
      <Rise delay={0.4}>
        <p className="mt-8 text-muted">{w.tapHint}</p>
      </Rise>
    </div>
  )
}

export function WorkoutsSlide({ data }: SlideContext) {
  return (
    <div className="flex flex-col gap-6">
      <Big value={data.workouts} label={w.workouts(data.workouts)} />
      <Rise delay={0.3}>
        <p className="text-2xl font-semibold">{w.activeDays(data.activeDays)}</p>
        {data.minutes >= 1 && (
          <p className="text-xl text-muted">{w.minutes(formatMinutes(data.minutes))}</p>
        )}
      </Rise>
    </div>
  )
}

export function TonnageSlide({ data }: SlideContext) {
  const comparison = compareTonnage(data.tonnageKg)
  return (
    <div className="flex flex-col gap-6">
      <Big value={data.tonnageKg / 1000} decimals={1} label={w.tonnage} />
      <Rise delay={0.3}>
        {comparison && (
          <p className="text-2xl font-semibold">
            {t.progress.comparison[comparison.id](formatNumber(comparison.times, 1))}
          </p>
        )}
        <p className="mt-2 text-xl text-muted">
          {w.setsReps(formatNumber(data.sets, 0), formatNumber(data.reps, 0))}
        </p>
      </Rise>
    </div>
  )
}

export function RecordsSlide({ data, name }: SlideContext) {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-display text-5xl leading-none font-black uppercase">{w.prsTitle}</p>
      {data.topPrs.length === 0 && <p className="text-xl text-muted">{w.prsNone}</p>}
      <ol className="flex flex-col gap-4">
        {data.topPrs.map((pr, i) => (
          <motion.li
            key={pr.exerciseId}
            className="flex items-baseline gap-4 border-t border-line pt-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.15 }}
          >
            <span className="font-display text-5xl font-black text-accent-text">{i + 1}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-lg font-semibold">{name(pr.exerciseId)}</span>
              <span className="font-display text-3xl font-bold">
                {formatNumber(pr.weightKg, 2)} kg × {pr.reps}
              </span>
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}

export function FavoritesSlide({ data, name }: SlideContext) {
  return (
    <div className="flex flex-col gap-6">
      {data.favoriteExercise && (
        <Rise>
          <p className="text-sm font-semibold tracking-widest text-muted uppercase">
            {w.favoriteTitle}
          </p>
          <p className="font-display text-5xl leading-none font-black uppercase">
            {name(data.favoriteExercise.exerciseId)}
          </p>
          <p className="text-xl text-accent-text">
            {w.favoriteSets(formatNumber(data.favoriteExercise.sets, 0))}
          </p>
        </Rise>
      )}
      {data.topMuscle && (
        <Rise delay={0.25}>
          <p className="text-sm font-semibold tracking-widest text-muted uppercase">
            {w.muscleTitle}
          </p>
          <p className="font-display text-4xl font-black uppercase">
            {t.muscles[data.topMuscle.muscle]}
          </p>
          <p className="text-muted">{w.muscleSets(formatNumber(data.topMuscle.sets, 1))}</p>
        </Rise>
      )}
      <MuscleMap3D
        fills={heatFills(data.muscles)}
        label={data.topMuscle ? t.muscles[data.topMuscle.muscle] : w.muscleTitle}
      />
    </div>
  )
}

export function BestWeekSlide({ data }: SlideContext) {
  if (!data.bestWeek) return null
  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-5xl leading-none font-black uppercase">{w.bestWeekTitle}</p>
      <Big value={data.bestWeek.workouts} label={w.bestWeek(data.bestWeek.workouts)} />
      <Rise delay={0.3}>
        <p className="text-xl text-muted">{w.bestWeekOf(formatDayShort(data.bestWeek.week))}</p>
      </Rise>
    </div>
  )
}
