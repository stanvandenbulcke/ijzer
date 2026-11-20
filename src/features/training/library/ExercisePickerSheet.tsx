import { ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { useExerciseLibrary } from '../../../data/catalog'
import type { Exercise } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { LoadingState } from '../../../ui/LoadingState'
import { Sheet } from '../../../ui/Sheet'
import { CustomExerciseForm } from './CustomExerciseForm'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseList } from './ExerciseList'
import { useExerciseSearch } from './useExerciseSearch'

const l = t.training.lib

/**
 * Pick one exercise in a bottom sheet (routine builder, workout, substitute). Your own exercise
 * can be made right here, so the routine or workout you are in is never left.
 */
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
  const [creating, setCreating] = useState<string | null>(null)
  const pick = (exercise: Exercise) => {
    onPick(exercise)
    setCreating(null)
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setCreating(null)
        onOpenChange(o)
      }}
      title={creating !== null ? l.createCustom : title}
    >
      {creating !== null ? (
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            className="self-start px-0"
            onClick={() => setCreating(null)}
          >
            {l.backToList}
          </Button>
          <CustomExerciseForm initial={null} initialName={creating} onSaved={pick} />
        </div>
      ) : !library && !candidates ? (
        <LoadingState />
      ) : (
        <div className="flex min-h-[70dvh] flex-col gap-3">
          <Button
            variant="secondary"
            icon={Plus}
            block
            onClick={() => setCreating(search.query.trim())}
          >
            {l.createCustom}
          </Button>
          <ExerciseFilters
            query={search.query}
            onQuery={search.setQuery}
            filter={search.filter}
            onFilter={search.setFilter}
          />
          {search.results.length === 0 && search.query.trim() ? (
            <div className="flex flex-col gap-3 py-6 text-center">
              <p className="text-muted">{l.noResults.body}</p>
              <Button
                variant="secondary"
                icon={Plus}
                block
                onClick={() => setCreating(search.query.trim())}
              >
                {l.createNamed(search.query.trim())}
              </Button>
            </div>
          ) : (
            <ExerciseList
              key={`${search.query}|${search.filter.muscle}|${search.filter.equipment}`}
              exercises={search.results}
              onSelect={pick}
            />
          )}
        </div>
      )}
    </Sheet>
  )
}
