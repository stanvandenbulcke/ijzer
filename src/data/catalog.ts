import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { isMuscleId } from '../domain/muscles/taxonomy'
import type { Exercise, MuscleWeight } from '../domain/training/types'
import { listCustomExercises } from './customExercisesRepo'

/** Shape of public/data/exercises.json, written by scripts/import-exercises.mjs. */
interface CatalogFile {
  source: string
  exercises: Array<
    Omit<Exercise, 'muscles' | 'hasImages' | 'custom'> & { muscles: Array<[string, number]> }
  >
}

let catalogPromise: Promise<Exercise[]> | null = null

/** The global exercise library (free-exercise-db). Loaded once, cached by the service worker. */
export function loadCatalog(): Promise<Exercise[]> {
  catalogPromise ??= fetch('/data/exercises.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Exercise catalog: HTTP ${res.status}`)
      return res.json() as Promise<CatalogFile>
    })
    .then((file) =>
      file.exercises.map((e) => ({
        ...e,
        muscles: e.muscles
          .filter(([m]) => isMuscleId(m))
          .map(([muscle, weight]) => ({
            muscle: muscle as Exercise['muscles'][number]['muscle'],
            weight: (weight === 1 ? 1 : 0.5) as MuscleWeight,
          })),
        hasImages: true,
        custom: false,
      })),
    )
    .catch((error: unknown) => {
      catalogPromise = null // allow a retry
      throw error
    })
  return catalogPromise
}

export interface ExerciseLibrary {
  /** Own exercises first, then the catalog. */
  exercises: Exercise[]
  byId: (id: string) => Exercise | undefined
}

/** Catalog + own exercises, live. `undefined` while loading, `null` when loading failed. */
export function useExerciseLibrary(): ExerciseLibrary | null | undefined {
  const [catalog, setCatalog] = useState<Exercise[] | null | undefined>(undefined)
  const custom = useLiveQuery(listCustomExercises)

  useEffect(() => {
    let alive = true
    loadCatalog().then(
      (list) => alive && setCatalog(list),
      () => alive && setCatalog(null),
    )
    return () => {
      alive = false
    }
  }, [])

  return useMemo(() => {
    if (catalog === null) return null
    if (catalog === undefined || custom === undefined) return undefined
    const exercises = [...custom, ...catalog]
    const map = new Map(exercises.map((e) => [e.id, e]))
    return { exercises, byId: (id: string) => map.get(id) }
  }, [catalog, custom])
}
