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
 * Exercise icon: start and end photo alternate like a tiny looping clip, in the app's
 * monochrome house style. Own exercises without photos show initials with the colour of the
 * main muscle region. Never an empty grey box.
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
      <span
        aria-hidden
        className={cx(box, 'relative shrink-0 overflow-hidden rounded-sm bg-plate-white')}
      >
        <img
          src={exerciseImage(exercise.id, 0)}
          alt=""
          loading="lazy"
          decoding="async"
          className="duotone absolute inset-0 size-full object-cover"
        />
        <img
          src={exerciseImage(exercise.id, 1)}
          alt=""
          loading="lazy"
          decoding="async"
          className="duotone thumb-flip absolute inset-0 size-full object-cover"
        />
        <span className="duotone-tint absolute inset-0" />
        {main && (
          <span className={cx('absolute inset-x-0 bottom-0 h-1', regionBar[MUSCLE_REGION[main]])} />
        )}
      </span>
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
        <span className={cx('absolute inset-x-0 bottom-0 h-1', regionBar[MUSCLE_REGION[main]])} />
      )}
      {initials(exercise.name)}
    </span>
  )
}
