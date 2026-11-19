import { Search } from 'lucide-react'
import type { ExerciseFilter } from '../../../domain/exercises/search'
import { MUSCLE_IDS } from '../../../domain/muscles/taxonomy'
import type { Equipment } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Chip } from '../../../ui/Chip'

const l = t.training.lib
const EQUIPMENT: Equipment[] = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'ez_bar',
  'band',
]

export interface FiltersProps {
  query: string
  onQuery: (q: string) => void
  filter: ExerciseFilter
  onFilter: (f: ExerciseFilter) => void
}

/** Search field + scrollable muscle and equipment chips. */
export function ExerciseFilters({ query, onQuery, filter, onFilter }: FiltersProps) {
  const equipment = filter.equipment?.[0]
  return (
    <div className="flex flex-col gap-2">
      <label className="relative block">
        <span className="sr-only">{l.searchLabel}</span>
        <Search
          aria-hidden
          size={20}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={l.search}
          autoCorrect="off"
          autoCapitalize="none"
          enterKeyHint="search"
          className="min-h-12 w-full rounded-md border border-line-strong bg-surface pr-3 pl-10 text-text outline-none placeholder:text-muted focus:border-focus"
        />
      </label>
      <div
        role="group"
        aria-label={l.filterMuscle}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        <Chip
          selected={!filter.muscle}
          onClick={() => onFilter({ ...filter, muscle: undefined })}
          className="shrink-0"
        >
          {l.allMuscles}
        </Chip>
        {MUSCLE_IDS.map((m) => (
          <Chip
            key={m}
            selected={filter.muscle === m}
            onClick={() => onFilter({ ...filter, muscle: m })}
            className="shrink-0"
          >
            {t.muscles[m]}
          </Chip>
        ))}
      </div>
      <div
        role="group"
        aria-label={l.filterEquipment}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        <Chip
          selected={!equipment}
          onClick={() => onFilter({ ...filter, equipment: undefined })}
          className="shrink-0"
        >
          {l.allEquipment}
        </Chip>
        {EQUIPMENT.map((e) => (
          <Chip
            key={e}
            selected={equipment === e}
            onClick={() => onFilter({ ...filter, equipment: [e] })}
            className="shrink-0"
          >
            {t.training.equipment[e]}
          </Chip>
        ))}
      </div>
    </div>
  )
}
