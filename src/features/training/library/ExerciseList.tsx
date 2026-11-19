import { Check } from 'lucide-react'
import { useState } from 'react'
import type { Exercise } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { ExerciseThumb } from '../../../ui/ExerciseThumb'
import { ListRow } from '../../../ui/ListRow'
import { primaryMuscles } from './exerciseText'

const PAGE = 50

/** Long lists render 50 at a time to stay fast on a phone. */
export function ExerciseList({
  exercises,
  onSelect,
  selectedIds,
}: {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  selectedIds?: string[]
}) {
  const [shown, setShown] = useState(PAGE)
  return (
    <div className="border-t border-line">
      {exercises.slice(0, shown).map((exercise) => {
        const picked = selectedIds?.includes(exercise.id)
        return (
          <ListRow
            key={exercise.id}
            title={exercise.name}
            subtitle={`${primaryMuscles(exercise)} · ${t.training.equipment[exercise.equipment]}`}
            leading={<ExerciseThumb exercise={exercise} />}
            trailing={
              picked ? (
                <Check aria-label={t.training.lib.picked} className="text-green-text" />
              ) : exercise.custom ? (
                <span className="text-xs font-semibold tracking-widest text-accent-text uppercase">
                  {t.training.lib.custom}
                </span>
              ) : undefined
            }
            onClick={() => onSelect(exercise)}
          />
        )
      })}
      {exercises.length > shown && (
        <Button variant="ghost" block onClick={() => setShown((n) => n + PAGE)} className="mt-2">
          {t.training.lib.count(exercises.length - shown)} +
        </Button>
      )}
    </div>
  )
}
