import { useCallback, useEffect, useRef, useState } from 'react'
import { saveWorkout } from '../../../data/workoutsRepo'
import type { Workout } from '../../../domain/training/types'

const RETRY_MS = 400

async function saveWithRetry(workout: Workout): Promise<void> {
  try {
    await saveWorkout(workout)
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, RETRY_MS))
    await saveWorkout(workout)
  }
}

/**
 * The running workout as local state, saved to IndexedDB after EVERY change. Saves run one
 * after the other, and quick taps build on the latest state instead of a stale one. A failed
 * save is retried once and then reported (`saveFailed`), never silently swallowed.
 */
export function useWorkoutState(initial: Workout | null | undefined) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const latest = useRef<Workout | null>(null)
  const failed = useRef(false)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    if (initial && latest.current?.id !== initial.id) {
      latest.current = initial
      setWorkout(initial)
    }
  }, [initial])

  const report = useCallback((ok: boolean) => {
    failed.current = !ok
    setSaveFailed(!ok)
  }, [])

  const apply = useCallback(
    (change: (w: Workout) => Workout): Workout | null => {
      if (!latest.current) return null
      const next = change(latest.current)
      latest.current = next
      setWorkout(next)
      queue.current = queue.current.then(() =>
        saveWithRetry(next).then(
          () => report(true),
          () => report(false),
        ),
      )
      return next
    },
    [report],
  )

  /**
   * Resolves when every change is on disk; saves the latest state again if an earlier save
   * failed. Rejects if it still cannot be saved, so callers never move on as if it were safe.
   */
  const flush = useCallback(async () => {
    await queue.current
    if (failed.current && latest.current) {
      await saveWithRetry(latest.current)
      report(true)
    }
  }, [report])

  return { workout, apply, flush, saveFailed }
}
