import { useExerciseLibrary } from '../../../data/catalog'
import type { Exercise } from '../../../domain/training/types'
import { LoadingState } from '../../../ui/LoadingState'
import { Sheet } from '../../../ui/Sheet'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseList } from './ExerciseList'
import { useExerciseSearch } from './useExerciseSearch'

/** Pick one exercise in a bottom sheet (routine builder, empty workout, substitute). */
export function ExercisePickerSheet({
  open,
  onOpenChange,
  title,
  onPick,
  candidates,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onPick: (exercise: Exercise) => void
  /** Limit the choice, e.g. to alternatives; default: the whole library. */
  candidates?: Exercise[]
}) {
  const library = useExerciseLibrary()
  const search = useExerciseSearch(candidates ?? library?.exercises)
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      {!library && !candidates ? (
        <LoadingState />
      ) : (
        <div className="flex min-h-[70dvh] flex-col gap-3">
          <ExerciseFilters
            query={search.query}
            onQuery={search.setQuery}
            filter={search.filter}
            onFilter={search.setFilter}
          />
          <ExerciseList
            key={`${search.query}|${search.filter.muscle}|${search.filter.equipment}`}
            exercises={search.results}
            onSelect={(e) => {
              onPick(e)
              onOpenChange(false)
            }}
          />
        </div>
      )}
    </Sheet>
  )
}
