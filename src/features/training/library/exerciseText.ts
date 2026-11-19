import type { Exercise } from '../../../domain/training/types'
import { t } from '../../../i18n'

/** Primary muscles as text: "Borst · Triceps". */
export function primaryMuscles(exercise: Exercise): string {
  return exercise.muscles
    .filter((m) => m.weight === 1)
    .map((m) => t.muscles[m.muscle])
    .join(' · ')
}
