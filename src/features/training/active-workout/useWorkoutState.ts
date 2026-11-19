import { useCallback, useEffect, useRef, useState } from 'react'
import { saveWorkout } from '../../../data/workoutsRepo'
import type { Workout } from '../../../domain/training/types'

/**
 * The running workout as local state, saved to IndexedDB after EVERY change. Saves run one
 * after the other, and quick taps build on the latest state instead of a stale one.
 */
export function useWorkoutState(initial: Workout | null | undefined) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const latest = useRef<Workout | null>(null)
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    if (initial && latest.current?.id !== initial.id) {
      latest.current = initial
      setWorkout(initial)
    }
  }, [initial])

  const apply = useCallback((change: (w: Workout) => Workout): Workout | null => {
    if (!latest.current) return null
    const next = change(latest.current)
    latest.current = next
    setWorkout(next)
    queue.current = queue.current.then(() => saveWorkout(next)).catch(() => undefined)
    return next
  }, [])

  /** Resolves when every pending change is on disk. */
  const flush = useCallback(() => queue.current, [])

  return { workout, apply, flush }
}
