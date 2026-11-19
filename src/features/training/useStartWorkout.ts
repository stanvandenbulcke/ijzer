import { useNavigate } from 'react-router'
import { startWorkout } from '../../data/workoutActions'
import type { Routine } from '../../domain/training/types'
import { t } from '../../i18n'

/** Start (or continue) a workout and open the workout screen. */
export function useStartWorkout() {
  const navigate = useNavigate()
  return async (routine: Routine | null) => {
    await startWorkout(routine, t.training.startEmpty)
    navigate('/training')
  }
}
