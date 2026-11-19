import { exerciseImage, initials } from '../domain/exercises/media'
import { MUSCLE_REGION } from '../domain/muscles/taxonomy'
import type { Exercise } from '../domain/training/types'
import { cx } from './cx'

const regionBar = {
  push: 'bg-region-push',
  pull: 'bg-region-pull',
  legs: 'bg-region-legs',
  core: 'bg-region-core',
  neck: 'bg-region-neck',
} as const

/**
 * Small square picture of an exercise: its start photo, or for own exercises without a
 * photo the initials with the colour of the main muscle region. Never an empty grey box.
 */
export function ExerciseThumb({
  exercise,
  size = 'md',
}: {
  exercise: Exercise
  size?: 'sm' | 'md'
}) {
  const box = size === 'sm' ? 'size-10' : 'size-12'
  const main = exercise.muscles.find((m) => m.weight === 1)?.muscle
  if (exercise.hasImages) {
    return (
      <img
        src={exerciseImage(exercise.id, 0)}
        alt=""
        loading="lazy"
        decoding="async"
        className={cx(box, 'shrink-0 rounded-sm bg-plate-white object-cover')}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cx(
        box,
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface-2 font-display text-lg font-bold',
      )}
    >
      {main && (
        <span className={cx('absolute inset-y-0 left-0 w-1', regionBar[MUSCLE_REGION[main]])} />
      )}
      {initials(exercise.name)}
    </span>
  )
}
