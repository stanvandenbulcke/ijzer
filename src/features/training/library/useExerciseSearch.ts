import { useDeferredValue, useMemo, useState } from 'react'
import { searchExercises, type ExerciseFilter } from '../../../domain/exercises/search'
import type { Exercise } from '../../../domain/training/types'

/** Search state + results, deferred so typing stays smooth with 700+ exercises. */
export function useExerciseSearch(exercises: Exercise[] | undefined) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ExerciseFilter>({})
  const deferredQuery = useDeferredValue(query)
  const results = useMemo(
    () => (exercises ? searchExercises(exercises, deferredQuery, filter) : []),
    [exercises, deferredQuery, filter],
  )
  return { query, setQuery, filter, setFilter, results }
}
