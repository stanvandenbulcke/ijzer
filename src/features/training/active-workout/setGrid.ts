import type { ExerciseType } from '../../../domain/training/types'

/** Column layout shared by the header row and the set rows. */
export const SET_GRID = 'grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem_3.5rem] items-center gap-2'
export const SINGLE_GRID = 'grid grid-cols-[2.5rem_1fr_8.5rem_3.5rem] items-center gap-2'

export function isSingleValue(type: ExerciseType) {
  return type === 'time' || type === 'distance'
}
