import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { saveCustomExercise } from '../../../data/customExercisesRepo'
import { newId } from '../../../data/rows'
import { MUSCLE_IDS, type MuscleId } from '../../../domain/muscles/taxonomy'
import type {
  Equipment,
  Exercise,
  ExerciseType,
  MuscleWeight,
} from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { involvementFills } from '../../../ui/muscle-map/fills'
import { MuscleMap } from '../../../ui/muscle-map/MuscleMap'
import { TextField } from '../../../ui/TextField'

const f = t.training.customForm
const TYPES: ExerciseType[] = ['weight_reps', 'bodyweight_reps', 'assisted', 'time', 'distance']
const EQUIPMENT: Equipment[] = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'ez_bar',
  'band',
  'other',
]

function blank(name = ''): Exercise {
  return {
    id: newId(),
    name,
    equipment: 'cable',
    type: 'weight_reps',
    unilateral: false,
    muscles: [],
    lengthened: false,
    mechanic: 'isolation',
    quality: 'custom',
    aliases: [],
    instructions: [],
    hasImages: false,
    custom: true,
  }
}

/** Cycles a muscle: none → direct (1) → indirect (0.5) → none. */
function cycle(muscles: Exercise['muscles'], muscle: MuscleId): Exercise['muscles'] {
  const current = muscles.find((m) => m.muscle === muscle)
  if (!current) return [...muscles, { muscle, weight: 1 }]
  if (current.weight === 1)
    return muscles.map((m) => (m.muscle === muscle ? { muscle, weight: 0.5 as MuscleWeight } : m))
  return muscles.filter((m) => m.muscle !== muscle)
}

/**
 * Form for your own ("niche") exercise. Used on its own page and inside "Oefening toevoegen",
 * so a routine or workout in progress is never left behind.
 */
export function CustomExerciseForm({
  initial,
  initialName = '',
  onSaved,
  onDelete,
}: {
  initial: Exercise | null
  initialName?: string
  onSaved: (exercise: Exercise) => void
  onDelete?: () => void
}) {
  const [draft, setDraft] = useState<Exercise>(() => initial ?? blank(initialName))
  const [errors, setErrors] = useState<{ name?: string; muscles?: string }>({})

  const update = (changes: Partial<Exercise>) => setDraft((d) => ({ ...d, ...changes }))

  const save = async () => {
    const next = {
      name: draft.name.trim() ? undefined : f.nameRequired,
      muscles: draft.muscles.some((m) => m.weight === 1) ? undefined : f.muscleRequired,
    }
    setErrors(next)
    if (next.name || next.muscles) return
    const saved = { ...draft, name: draft.name.trim() }
    await saveCustomExercise(saved)
    onSaved(saved)
  }

  return (
    <div className="flex flex-col gap-6">
      <TextField
        label={f.name}
        placeholder={f.namePlaceholder}
        value={draft.name}
        error={errors.name}
        onChange={(e) => update({ name: e.target.value })}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted">{f.type}</span>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <Chip key={type} selected={draft.type === type} onClick={() => update({ type })}>
              {t.training.types[type]}
            </Chip>
          ))}
        </div>
        <Chip
          selected={draft.unilateral}
          onClick={() => update({ unilateral: !draft.unilateral })}
          className="self-start"
        >
          {f.unilateral}
        </Chip>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted">{f.equipment}</span>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((equipment) => (
            <Chip
              key={equipment}
              selected={draft.equipment === equipment}
              onClick={() => update({ equipment })}
            >
              {t.training.equipment[equipment]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-muted">{f.muscles}</span>
        <p className="text-sm text-muted">{f.musclesHint}</p>
        <div className="flex justify-center">
          <MuscleMap
            size="lg"
            fills={involvementFills(draft.muscles)}
            label={f.muscles}
            onToggle={(m) => update({ muscles: cycle(draft.muscles, m) })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_IDS.map((muscle) => {
            const weight = draft.muscles.find((m) => m.muscle === muscle)?.weight
            return (
              <Chip
                key={muscle}
                selected={weight !== undefined}
                onClick={() => update({ muscles: cycle(draft.muscles, muscle) })}
                className={weight === 0.5 ? 'border-dashed' : undefined}
              >
                {t.muscles[muscle]}
                {weight !== undefined && (
                  <span className="text-xs font-normal text-muted">
                    {weight === 1 ? t.training.lib.primary : t.training.lib.secondary}
                  </span>
                )}
              </Chip>
            )
          })}
        </div>
        {errors.muscles && <p className="text-sm text-red-text">{errors.muscles}</p>}
      </div>
      <TextField
        label={f.note}
        value={draft.instructions[0] ?? ''}
        onChange={(e) => update({ instructions: e.target.value ? [e.target.value] : [] })}
      />
      <Button size="lg" block onClick={() => void save()}>
        {f.save}
      </Button>
      {onDelete && (
        <Button variant="danger" icon={Trash2} block onClick={onDelete}>
          {f.delete}
        </Button>
      )}
    </div>
  )
}
