import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useExerciseLibrary } from '../../../data/catalog'
import { deleteCustomExercise, saveCustomExercise } from '../../../data/customExercisesRepo'
import { newId } from '../../../data/rows'
import type { MuscleId } from '../../../domain/muscles/taxonomy'
import type {
  Equipment,
  Exercise,
  ExerciseType,
  MuscleWeight,
} from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Chip, MuscleChip } from '../../../ui/Chip'
import { LoadingState } from '../../../ui/LoadingState'
import { involvementFills } from '../../../ui/muscle-map/fills'
import { MuscleMap } from '../../../ui/muscle-map/MuscleMap'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { TextField } from '../../../ui/TextField'
import { useToast } from '../../../ui/toast/toastContext'

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

function blank(): Exercise {
  return {
    id: newId(),
    name: '',
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

/** /train/oefeningen/nieuw — your own ("niche") exercise; ?bewerk=<id> edits one. */
export function CustomExercisePage() {
  const [params] = useSearchParams()
  const editId = params.get('bewerk')
  const library = useExerciseLibrary()
  if (editId && library === undefined) return <LoadingState />
  const existing = editId ? library?.byId(editId) : undefined
  const initial = existing?.custom ? existing : null
  return <CustomExerciseForm key={initial?.id ?? 'new'} initial={initial} />
}

function CustomExerciseForm({ initial }: { initial: Exercise | null }) {
  const navigate = useNavigate()
  const toast = useToast()
  const editId = initial?.id ?? null
  const [draft, setDraft] = useState<Exercise>(() => initial ?? blank())
  const [errors, setErrors] = useState<{ name?: string; muscles?: string }>({})

  const update = (changes: Partial<Exercise>) => setDraft((d) => ({ ...d, ...changes }))

  const save = async () => {
    const next = {
      name: draft.name.trim() ? undefined : f.nameRequired,
      muscles: draft.muscles.some((m) => m.weight === 1) ? undefined : f.muscleRequired,
    }
    setErrors(next)
    if (next.name || next.muscles) return
    await saveCustomExercise({ ...draft, name: draft.name.trim() })
    toast({ message: f.saved })
    navigate(`/train/oefeningen/${encodeURIComponent(draft.id)}`, { replace: true })
  }

  const remove = async () => {
    await deleteCustomExercise(draft.id)
    toast({ message: f.deleted })
    navigate('/train/oefeningen', { replace: true })
  }

  return (
    <Page>
      <PageHeader title={f.title} back />
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
            {draft.muscles.map((m) => (
              <button
                key={m.muscle}
                type="button"
                onClick={() => update({ muscles: cycle(draft.muscles, m.muscle) })}
              >
                <MuscleChip muscle={m.muscle} secondary={m.weight !== 1} />
              </button>
            ))}
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
        {editId && (
          <Button variant="danger" icon={Trash2} block onClick={() => void remove()}>
            {f.delete}
          </Button>
        )}
      </div>
    </Page>
  )
}
